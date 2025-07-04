# Implementation Guide: Conversational AI Engine

## Introduction

This guide provides practical instructions for developers implementing the EyewearML conversational AI engine. It covers setup, integration, testing, deployment, and ongoing maintenance. By following these guidelines, development teams can efficiently implement a conversational AI system that delivers a natural, contextual shopping experience for eyewear customers.

## Prerequisites

Before beginning implementation, ensure you have:

- Access to the EyewearML platform codebase and API documentation
- Development environment with Python 3.9+ and Node.js 16+
- Docker and Docker Compose for containerized development
- Access to cloud resources (GCP preferred as per our infrastructure)
- Familiarity with machine learning concepts and natural language processing
- Knowledge of our product catalog data structure

## Implementation Roadmap

We recommend implementing the conversational AI engine in the following phases:

### Phase 1: Core Infrastructure (Weeks 1-2)

- Set up development environment and CI/CD pipeline
- Deploy containerized development services
- Implement base conversation manager and API endpoints
- Establish database schemas for conversation storage
- Create logging and monitoring infrastructure

### Phase 2: Foundational Components (Weeks 3-4)

- Implement intent recognition system
- Set up contextual memory storage
- Develop basic preference extraction pipeline
- Create simple template-based response generation
- Establish integration with product catalog

### Phase 3: Advanced Capabilities (Weeks 5-8)

- Enhance intent recognition with domain-specific training
- Implement sophisticated memory management
- Develop advanced preference extraction with implicit recognition
- Integrate LLM-based response generation
- Establish context window management

### Phase 4: Integration & Polish (Weeks 9-12)

- Integrate with frontend chat interface
- Connect with virtual try-on avatar system
- Implement A/B testing framework
- Optimize response time and performance
- Add monitoring dashboards and analytics

## Development Setup

### Local Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/eyewearml/platform.git
   cd platform
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install && cd ..
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your configuration
   ```

4. Start the development services:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Development Containers

We provide development containers for consistent environments:

```yaml
# In .devcontainer/devcontainer.json
{
  "name": "EyewearML Conversational AI",
  "dockerComposeFile": "../docker-compose.dev.yml",
  "service": "conversational_ai",
  "workspaceFolder": "/workspace",
  "extensions": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

## Core Components Implementation

### 1. Conversation Manager

The conversation manager orchestrates the flow of the conversational AI system:

```python
# conversation_manager.py
from typing import Dict, List, Optional
import uuid
import datetime
import redis
import json

from .intent_recognition import IntentRecognizer
from .context_manager import ContextManager
from .preference_extraction import PreferenceExtractor
from .response_generator import ResponseGenerator

class ConversationManager:
    def __init__(self, config: Dict):
        self.redis_client = redis.Redis(
            host=config["redis_host"],
            port=config["redis_port"],
            password=config["redis_password"]
        )
        self.intent_recognizer = IntentRecognizer(config["intent_model_path"])
        self.context_manager = ContextManager(config["context_config"])
        self.preference_extractor = PreferenceExtractor(config["preference_config"])
        self.response_generator = ResponseGenerator(config["response_config"])
        self.session_ttl = config.get("session_ttl", 3600 * 24)  # 24 hours default
    
    def create_session(self, customer_id: Optional[str] = None) -> str:
        """Create a new conversation session."""
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "customer_id": customer_id,
            "start_time": datetime.datetime.utcnow().isoformat(),
            "messages": [],
            "active_context": {},
            "preferences": {},
            "last_activity": datetime.datetime.utcnow().isoformat()
        }
        self.redis_client.setex(
            f"session:{session_id}", 
            self.session_ttl,
            json.dumps(session_data)
        )
        return session_id
    
    def process_message(self, session_id: str, message: str) -> Dict:
        """Process an incoming user message and generate a response."""
        # Get session data
        session_data = self._get_session(session_id)
        if not session_data:
            raise ValueError(f"Session {session_id} not found")
        
        # Update session with new message
        session_data["messages"].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        
        # Recognize intent
        intent_data = self.intent_recognizer.recognize(
            message, 
            session_data["messages"]
        )
        
        # Update context
        context = self.context_manager.update_context(
            session_data, 
            message, 
            intent_data
        )
        
        # Extract preferences
        preferences = self.preference_extractor.extract(
            message, 
            intent_data, 
            context
        )
        
        # Update session preferences
        for pref in preferences:
            if pref["confidence"] > 0.7:  # Only store high-confidence preferences
                key = f"{pref['category']}:{pref['attribute']}"
                session_data["preferences"][key] = pref
        
        # Generate response
        response = self.response_generator.generate(
            intent_data,
            context,
            session_data["preferences"]
        )
        
        # Add response to session
        session_data["messages"].append({
            "role": "system",
            "content": response["text"],
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        
        # Update last activity
        session_data["last_activity"] = datetime.datetime.utcnow().isoformat()
        
        # Save updated session
        self._save_session(session_id, session_data)
        
        return {
            "text": response["text"],
            "intent": intent_data,
            "actions": response.get("actions", []),
            "suggestions": response.get("suggestions", [])
        }
    
    def _get_session(self, session_id: str) -> Dict:
        """Retrieve session data from Redis."""
        data = self.redis_client.get(f"session:{session_id}")
        if not data:
            return None
        return json.loads(data)
    
    def _save_session(self, session_id: str, session_data: Dict) -> None:
        """Save session data to Redis with TTL refresh."""
        self.redis_client.setex(
            f"session:{session_id}",
            self.session_ttl,
            json.dumps(session_data)
        )
```

### 2. Intent Recognition Implementation

A basic implementation of the intent recognition system:

```python
# intent_recognition.py
from typing import Dict, List, Any
import json
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

class IntentRecognizer:
    def __init__(self, model_path: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
        
        # Load intent categories and entities
        with open(f"{model_path}/intent_config.json", "r") as f:
            config = json.load(f)
            self.intent_categories = config["intent_categories"]
            self.entity_types = config["entity_types"]
        
        # Entity recognition components would be initialized here
        
    def recognize(self, message: str, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Recognize intents and entities in a user message."""
        # Prepare inputs
        recent_history = self._prepare_conversation_context(conversation_history)
        inputs = self.tokenizer(
            message,
            recent_history,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        )
        
        # Get intent predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            intent_scores = torch.nn.functional.softmax(outputs.logits, dim=1)
            intent_id = torch.argmax(intent_scores, dim=1).item()
            confidence = intent_scores[0, intent_id].item()
        
        # Map to intent category
        primary_intent = self.intent_categories[intent_id]
        
        # Extract entities (simplified implementation)
        entities = self._extract_entities(message)
        
        # Identify sub-intents based on entities and rules
        sub_intents = self._identify_sub_intents(primary_intent, entities)
        
        return {
            "primary_intent": primary_intent,
            "confidence": confidence,
            "sub_intents": sub_intents,
            "entities": entities,
            "original_message": message
        }
    
    def _prepare_conversation_context(self, history: List[Dict]) -> str:
        """Prepare recent conversation history as context."""
        # Take the last 5 exchanges (10 messages)
        recent_messages = history[-10:] if len(history) > 10 else history
        
        # Format as a single string
        context = ""
        for msg in recent_messages:
            prefix = "Customer: " if msg["role"] == "user" else "System: "
            context += f"{prefix}{msg['content']}\n"
        
        return context
    
    def _extract_entities(self, message: str) -> List[Dict]:
        """Extract entities from the message.
        
        A real implementation would use NER models or pattern matching.
        This is a simplified placeholder that looks for key terms.
        """
        entities = []
        
        # Simple keyword matching (would be replaced with proper NER)
        eyewear_terms = {
            "frame_shape": ["round", "square", "oval", "cat-eye", "rectangular"],
            "frame_color": ["black", "gold", "silver", "tortoiseshell", "blue"],
            "frame_material": ["metal", "plastic", "acetate", "titanium"],
            "brand": ["ray-ban", "warby parker", "oakley", "gucci", "tom ford"]
        }
        
        message_lower = message.lower()
        
        for entity_type, keywords in eyewear_terms.items():
            for keyword in keywords:
                if keyword in message_lower:
                    entities.append({
                        "type": entity_type,
                        "value": keyword,
                        "confidence": 0.9,  # Simplified confidence
                        "char_start": message_lower.find(keyword),
                        "char_end": message_lower.find(keyword) + len(keyword)
                    })
        
        return entities
    
    def _identify_sub_intents(self, primary_intent: str, entities: List[Dict]) -> List[str]:
        """Identify sub-intents based on the primary intent and entities."""
        sub_intents = []
        
        # Simple rule-based sub-intent identification
        if primary_intent == "style_preference":
            entity_types = [e["type"] for e in entities]
            if "frame_shape" in entity_types:
                sub_intents.append("shape_preference")
            if "frame_color" in entity_types:
                sub_intents.append("color_preference")
            if "frame_material" in entity_types:
                sub_intents.append("material_preference")
            if "brand" in entity_types:
                sub_intents.append("brand_preference")
        
        return sub_intents
```

### 3. Contextual Memory Implementation

A simplified implementation of the context management system:

```python
# context_manager.py
from typing import Dict, List, Any
import datetime
import json
import pinecone
from sentence_transformers import SentenceTransformer

class ContextManager:
    def __init__(self, config: Dict):
        # Initialize vector database
        pinecone.init(
            api_key=config["pinecone_api_key"],
            environment=config["pinecone_environment"]
        )
        self.index = pinecone.Index(config["pinecone_index"])
        
        # Initialize sentence transformer model
        self.encoder = SentenceTransformer(config["encoder_model"])
        
        # Context window size
        self.context_window_size = config.get("context_window_size", 10)
    
    def update_context(self, 
                      session_data: Dict, 
                      current_message: str, 
                      intent_data: Dict) -> Dict:
        """Update conversation context with the current message."""
        # Get current session context
        context = session_data.get("active_context", {})
        
        # Update basic context tracking
        context["last_message"] = current_message
        context["last_intent"] = intent_data["primary_intent"]
        context["message_count"] = len(session_data["messages"])
        
        # Track referenced entities
        self._update_referenced_entities(context, intent_data["entities"])
        
        # Update conversation flow state
        context["flow_state"] = self._determine_flow_state(
            context.get("flow_state"), 
            intent_data
        )
        
        # Store embeddings for semantic search (if needed later)
        if len(session_data["messages"]) % 5 == 0:  # Store every 5 messages
            self._store_conversation_embeddings(session_data)
        
        # Perform reference resolution
        context["resolved_references"] = self._resolve_references(
            current_message, 
            context, 
            session_data["messages"]
        )
        
        # Update active topics
        context["active_topics"] = self._update_active_topics(
            context.get("active_topics", []),
            intent_data
        )
        
        return context
    
    def _update_referenced_entities(self, context: Dict, entities: List[Dict]) -> None:
        """Track entities that are referenced in the conversation."""
        # Initialize entity tracking if not present
        if "referenced_entities" not in context:
            context["referenced_entities"] = {}
        
        # Add or update entities
        for entity in entities:
            entity_key = f"{entity['type']}:{entity['value']}"
            context["referenced_entities"][entity_key] = {
                "type": entity["type"],
                "value": entity["value"],
                "last_mentioned": datetime.datetime.utcnow().isoformat(),
                "mention_count": context["referenced_entities"].get(entity_key, {}).get("mention_count", 0) + 1
            }
    
    def _determine_flow_state(self, current_state: str, intent_data: Dict) -> str:
        """Determine the current conversation flow state based on intent."""
        # Simple state transition rules (would be more sophisticated in production)
        if intent_data["primary_intent"] == "style_preference":
            return "collecting_style_preferences"
        elif intent_data["primary_intent"] == "fit_requirement":
            return "collecting_fit_requirements"
        elif intent_data["primary_intent"] == "budget_concern":
            return "discussing_budget"
        elif intent_data["primary_intent"] == "product_information":
            return "providing_product_details"
        
        # Default: maintain current state
        return current_state or "general_conversation"
    
    def _store_conversation_embeddings(self, session_data: Dict) -> None:
        """Store conversation embeddings for semantic search."""
        recent_messages = session_data["messages"][-self.context_window_size:]
        
        # Create embeddings for each message
        for i, message in enumerate(recent_messages):
            # Skip if we've already embedded this message
            if i < len(recent_messages) - 5:  # Only process the newest 5 messages
                continue
                
            # Generate embedding
            text = message["content"]
            embedding = self.encoder.encode(text).tolist()
            
            # Store in vector database
            self.index.upsert(
                vectors=[
                    {
                        "id": f"{session_data['session_id']}:{message['timestamp']}",
                        "values": embedding,
                        "metadata": {
                            "session_id": session_data["session_id"],
                            "timestamp": message["timestamp"],
                            "role": message["role"],
                            "content": text[:1000]  # Truncate for metadata
                        }
                    }
                ]
            )
    
    def _resolve_references(self, 
                           message: str, 
                           context: Dict, 
                           conversation: List[Dict]) -> Dict:
        """Resolve references like 'it', 'they', 'those', etc."""
        # A simplified reference resolution implementation
        resolved = {}
        
        # Pronouns to resolve
        pronouns = ["it", "they", "them", "those", "these", "that", "this"]
        message_lower = message.lower()
        
        # Check if message contains pronouns
        if any(pronoun in message_lower.split() for pronoun in pronouns):
            # Get most recently referenced entities
            recent_entities = list(context.get("referenced_entities", {}).values())
            recent_entities.sort(key=lambda e: e["last_mentioned"], reverse=True)
            
            if recent_entities:
                # Simple resolution: map to most recently mentioned entity
                resolved["likely_referent"] = recent_entities[0]
        
        return resolved
    
    def _update_active_topics(self, current_topics: List[str], intent_data: Dict) -> List[str]:
        """Update the list of active conversation topics."""
        # Map intents to topics
        intent_topic_map = {
            "style_preference": "style",
            "fit_requirement": "fit",
            "budget_concern": "budget",
            "prescription_need": "prescription",
            "product_information": "product_details"
        }
        
        # Get topic from current intent
        current_intent = intent_data["primary_intent"]
        if current_intent in intent_topic_map:
            new_topic = intent_topic_map[current_intent]
            
            # Add to start of list if not already present
            if new_topic in current_topics:
                current_topics.remove(new_topic)
            current_topics.insert(0, new_topic)
        
        # Keep only the 3 most recent topics
        return current_topics[:3]
```

### 4. API Integration

Creating RESTful endpoints for the conversational AI:

```python
# api.py
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Optional
import json
import asyncio
import logging

from .conversation_manager import ConversationManager
from .config import get_settings

app = FastAPI(title="EyewearML Conversational AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
settings = get_settings()
conversation_manager = ConversationManager(settings.conversation_config)

# Websocket connections
active_connections = {}

@app.post("/api/conversation/session")
async def create_session(customer_id: Optional[str] = None):
    """Create a new conversation session."""
    try:
        session_id = conversation_manager.create_session(customer_id)
        return {"session_id": session_id}
    except Exception as e:
        logging.error(f"Error creating session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/conversation/{session_id}/message")
async def send_message(session_id: str, message: Dict):
    """Send a message to the conversation AI via REST API."""
    try:
        if not message.get("text"):
            raise HTTPException(status_code=400, detail="Message text is required")
        
        response = conversation_manager.process_message(
            session_id, 
            message["text"]
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logging.error(f"Error processing message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/conversation/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time conversation."""
    await websocket.accept()
    active_connections[session_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            response = conversation_manager.process_message(
                session_id, 
                message_data["text"]
            )
            
            await websocket.send_json(response)
    except WebSocketDisconnect:
        if session_id in active_connections:
            del active_connections[session_id]
    except Exception as e:
        logging.error(f"WebSocket error: {str(e)}")
        await websocket.send_json({"error": str(e)})
        if session_id in active_connections:
            del active_connections[session_id]
```

## Frontend Integration

### Chat Interface Component

A React component for integrating the conversation AI:

```jsx
// ConversationalAI.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ConversationalAI = ({ customerId, onProductRecommend }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Create a conversation session
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await axios.post('/api/conversation/session', {
          customer_id: customerId
        });
        setSessionId(response.data.session_id);
        
        // Add welcome message
        setMessages([{
          role: 'system',
          content: 'Hi there! I can help you find the perfect eyewear. What kind of style are you looking for?'
        }]);
      } catch (error) {
        console.error('Error creating conversation session:', error);
      }
    };
    
    createSession();
  }, [customerId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Send message to API
      const response = await axios.post(`/api/conversation/${sessionId}/message`, {
        text: userMessage.content
      });
      
      // Add AI response to chat
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'system',
        content: response.data.text
      }]);
      
      // Handle any actions returned
      if (response.data.actions) {
        handleActions(response.data.actions);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
  };
  
  const handleActions = (actions) => {
    // Process any actions returned by the AI
    actions.forEach(action => {
      switch (action.type) {
        case 'recommend_product':
          onProductRecommend(action.product_id);
          break;
        case 'show_frame':
          // Handle showing frame in UI
          break;
        case 'compare_frames':
          // Handle frame comparison
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    });
  };
  
  return (
    <div className="conversational-ai">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            {msg.content}
          </div>
        ))}
        {isTyping && (
          <div className="message ai-message typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about styles, fits, or specific frames..."
          disabled={!sessionId}
        />
        <button onClick={sendMessage} disabled={!sessionId}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ConversationalAI;
```

### Virtual Avatar Integration

For 3D avatar integration with the conversational AI:

```jsx
// VirtualAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FaceMeshFitter } from '../utils/face-mesh-fitter';

const VirtualAssistant = ({ customerId, onProductRecommend }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const canvasRef = useRef(null);
  const avatarRef = useRef(null);
  const sceneRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Initialize 3D scene
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45, 
      canvasRef.current.clientWidth / canvasRef.current.clientHeight, 
      0.1, 
      1000
    );
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true,
      alpha: true
    });
    
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    camera.position.z = 1.5;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
    
    // Load avatar model
    const loader = new GLTFLoader();
    loader.load('/assets/models/assistant-avatar.glb', (gltf) => {
      const avatar = gltf.scene;
      scene.add(avatar);
      avatarRef.current = avatar;
      
      // Initialize animation mixer
      const mixer = new THREE.AnimationMixer(avatar);
      const animations = gltf.animations;
      
      // Store animations
      const animationActions = {};
      animations.forEach(clip => {
        animationActions[clip.name] = mixer.clipAction(clip);
      });
      
      avatarRef.current.animations = animationActions;
      avatarRef.current.mixer = mixer;
      
      // Play idle animation
      if (animationActions['Idle']) {
        animationActions['Idle'].play();
      }
    });
    
    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (avatarRef.current && avatarRef.current.mixer) {
        avatarRef.current.mixer.update(clock.getDelta());
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    sceneRef.current = scene;
    
    // Cleanup
    return () => {
      renderer.dispose();
      scene.clear();
    };
  }, []);
  
  // Create conversation session
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await axios.post('/api/conversation/session', {
          customer_id: customerId
        });
        setSessionId(response.data.session_id);
        
        // Add welcome message
        const welcomeMessage = 'Hi there! I can help you find the perfect eyewear. What kind of style are you looking for?';
        setMessages([{
          role: 'system',
          content: welcomeMessage
        }]);
        
        // Animate avatar speaking
        speakMessage(welcomeMessage);
      } catch (error) {
        console.error('Error creating conversation session:', error);
      }
    };
    
    createSession();
  }, [customerId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const speakMessage = async (text) => {
    setIsSpeaking(true);
    
    // Play speaking animation
    if (avatarRef.current && avatarRef.current.animations) {
      const { animations } = avatarRef.current;
