#!/bin/bash
# Script to export Dialogflow CX agent configuration for version control

# Default values
DEFAULT_PROJECT_ID="eyewearml-conversational-ai"
DEFAULT_LOCATION="us-central1"
DEFAULT_AGENT_NAME="EyewearML Virtual Style Assistant"
DEFAULT_OUTPUT_DIR="./exports"
DEFAULT_ENV="development"

# Parse command line arguments
PROJECT_ID=${1:-$DEFAULT_PROJECT_ID}
LOCATION=${2:-$DEFAULT_LOCATION}
AGENT_NAME=${3:-$DEFAULT_AGENT_NAME}
OUTPUT_DIR=${4:-$DEFAULT_OUTPUT_DIR}
ENVIRONMENT=${5:-$DEFAULT_ENV}

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "Exporting Dialogflow CX agent configuration..."
echo "Project ID: $PROJECT_ID"
echo "Location: $LOCATION"
echo "Agent Name: $AGENT_NAME"
echo "Output Directory: $OUTPUT_DIR"
echo "Environment: $ENVIRONMENT"

# Get the date for versioning
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="$OUTPUT_DIR/agent_export_${ENVIRONMENT}_${TIMESTAMP}.json"

# Create sub-directory for this export
EXPORT_DIR="$OUTPUT_DIR/${ENVIRONMENT}_${TIMESTAMP}"
mkdir -p "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR/flows"
mkdir -p "$EXPORT_DIR/intents"
mkdir -p "$EXPORT_DIR/entity_types"
mkdir -p "$EXPORT_DIR/webhooks"

# Step 1: List agents to find the agent ID
echo "Finding agent ID for '$AGENT_NAME'..."
AGENT_LIST=$(gcloud alpha dialogflow cx agents list \
  --project="$PROJECT_ID" \
  --location="$LOCATION" \
  --format="json")

# Extract agent ID
AGENT_ID=$(echo "$AGENT_LIST" | jq -r ".[] | select(.displayName == \"$AGENT_NAME\") | .name" | cut -d'/' -f6)

if [ -z "$AGENT_ID" ]; then
  echo "Error: Could not find agent with name '$AGENT_NAME'"
  exit 1
fi

echo "Found agent ID: $AGENT_ID"

# Step 2: Export the agent configuration
echo "Exporting agent configuration..."
gcloud alpha dialogflow cx agents export \
  --project="$PROJECT_ID" \
  --location="$LOCATION" \
  --agent="$AGENT_ID" \
  --destination="$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "Error: Failed to export agent configuration"
  exit 1
fi

echo "Agent configuration exported to: $OUTPUT_FILE"

# Step 3: Extract individual components for better version control
echo "Extracting individual components for better version control..."

# Extract flows
echo "Extracting flows..."
FLOWS=$(gcloud alpha dialogflow cx flows list \
  --project="$PROJECT_ID" \
  --location="$LOCATION" \
  --agent="$AGENT_ID" \
  --format="json")

echo "$FLOWS" | jq -c '.[]' | while read -r FLOW; do
  FLOW_ID=$(echo "$FLOW" | jq -r '.name' | cut -d'/' -f8)
  FLOW_NAME=$(echo "$FLOW" | jq -r '.displayName' | tr ' ' '_')
  
  echo "Exporting flow: $FLOW_NAME (ID: $FLOW_ID)"
  
  gcloud alpha dialogflow cx flows get \
    --project="$PROJECT_ID" \
    --location="$LOCATION" \
    --agent="$AGENT_ID" \
    --flow="$FLOW_ID" \
    --format="json" > "$EXPORT_DIR/flows/${FLOW_NAME}.json"
done

# Extract intents
echo "Extracting intents..."
INTENTS=$(gcloud alpha dialogflow cx intents list \
  --project="$PROJECT_ID" \
  --location="$LOCATION" \
  --agent="$AGENT_ID" \
  --format="json")

echo "$INTENTS" | jq -c '.[]' | while read -r INTENT; do
  INTENT_ID=$(echo "$INTENT" | jq -r '.name' | cut -d'/' -f8)
  INTENT_NAME=$(echo "$INTENT" | jq -r '.displayName' | tr ' ' '_')
  
  echo "Exporting intent: $INTENT_NAME (ID: $INTENT_ID)"
  
  gcloud alpha dialogflow cx intents get \
    --project="$PROJECT_ID" \
    --location="$LOCATION" \
    --agent="$AGENT_ID" \
    --intent="$INTENT_ID" \
    --format="json" > "$EXPORT_DIR/intents/${INTENT_NAME}.json"
done

# Extract entity types
echo "Extracting entity types..."
ENTITY_TYPES=$(gcloud alpha dialogflow cx entity-types list \
  --project="$PROJECT_ID" \
  --location="$LOCATION" \
  --agent="$AGENT_ID" \
  --format="json")

echo "$ENTITY_TYPES" | jq -c '.[]' | while read -r ENTITY_TYPE; do
  ENTITY_TYPE_ID=$(echo "$ENTITY_TYPE" | jq -r '.name' | cut -d'/' -f8)
  ENTITY_TYPE_NAME=$(echo "$ENTITY_TYPE" | jq -r '.displayName' | tr ' ' '_')
  
  echo "Exporting entity type: $ENTITY_TYPE_NAME (ID: $ENTITY_TYPE_ID)"
  
  gcloud alpha dialogflow cx entity-types get \
    --project="$PROJECT_ID" \
    --location="$LOCATION" \
    --agent="$AGENT_ID" \
    --entity-type="$ENTITY_TYPE_ID" \
    --format="json" > "$EXPORT_DIR/entity_types/${ENTITY_TYPE_NAME}.json"
done

# Extract webhooks
echo "Extracting webhooks..."
WEBHOOKS=$(gcloud alpha dialogflow cx webhooks list \
  --project="$PROJECT_ID" \
  --location="$LOCATION" \
  --agent="$AGENT_ID" \
  --format="json")

echo "$WEBHOOKS" | jq -c '.[]' | while read -r WEBHOOK; do
  WEBHOOK_ID=$(echo "$WEBHOOK" | jq -r '.name' | cut -d'/' -f8)
  WEBHOOK_NAME=$(echo "$WEBHOOK" | jq -r '.displayName' | tr ' ' '_')
  
  echo "Exporting webhook: $WEBHOOK_NAME (ID: $WEBHOOK_ID)"
  
  gcloud alpha dialogflow cx webhooks get \
    --project="$PROJECT_ID" \
    --location="$LOCATION" \
    --agent="$AGENT_ID" \
    --webhook="$WEBHOOK_ID" \
    --format="json" > "$EXPORT_DIR/webhooks/${WEBHOOK_NAME}.json"
done

echo "Export complete! Files stored in $EXPORT_DIR"
echo "Full agent export: $OUTPUT_FILE"

# Step 4: Sync to Git repository
echo "Would you like to commit these changes to Git? (y/n)"
read -r GIT_COMMIT

if [ "$GIT_COMMIT" = "y" ]; then
  git add "$EXPORT_DIR"
  git commit -m "Export Dialogflow CX agent configuration - $ENVIRONMENT - $(date +"%Y-%m-%d")"
  echo "Changes committed to Git"
fi

echo "Done!"
