/**
 * Animation Helpers
 * 
 * This module provides helper functions for the Facial Animation Controller.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

export const facialExpressions = {
    neutral: { name: 'neutral', intensity: 0.5 },
    happy: { name: 'happy', intensity: 0.8 },
    excited: { name: 'excited', intensity: 0.9 },
    concerned: { name: 'concerned', intensity: 0.7 },
    understanding: { name: 'understanding', intensity: 0.6 },
    encouraging: { name: 'encouraging', intensity: 0.7 },
    surprised: { name: 'surprised', intensity: 0.9 },
    thinking: { name: 'thinking', intensity: 0.6 }
};

export const lipSyncMappings = {
    'A': { viseme: 'A', intensity: 0.8 },
    'B': { viseme: 'B', intensity: 0.9 },
    'C': { viseme: 'C', intensity: 0.7 },
    'D': { viseme: 'D', intensity: 0.8 },
    'E': { viseme: 'E', intensity: 0.7 },
    'F': { viseme: 'F', intensity: 0.9 },
    'G': { viseme: 'G', intensity: 0.8 },
    'H': { viseme: 'H', intensity: 0.6 },
    'I': { viseme: 'I', intensity: 0.7 },
    'J': { viseme: 'J', intensity: 0.8 },
    'K': { viseme: 'K', intensity: 0.9 },
    'L': { viseme: 'L', intensity: 0.7 },
    'M': { viseme: 'M', intensity: 0.9 },
    'N': { viseme: 'N', intensity: 0.8 },
    'O': { viseme: 'O', intensity: 0.7 },
    'P': { viseme: 'P', intensity: 0.9 },
    'Q': { viseme: 'Q', intensity: 0.8 },
    'R': { viseme: 'R', intensity: 0.7 },
    'S': { viseme: 'S', intensity: 0.9 },
    'T': { viseme: 'T', intensity: 0.8 },
    'U': { viseme: 'U', intensity: 0.7 },
    'V': { viseme: 'V', intensity: 0.9 },
    'W': { viseme: 'W', intensity: 0.8 },
    'X': { viseme: 'X', intensity: 0.7 },
    'Y': { viseme: 'Y', intensity: 0.9 },
    'Z': { viseme: 'Z', intensity: 0.8 }
};

export const gestureLibrary = {
    wave: { name: 'wave', defaultDuration: 2000 },
    point: { name: 'point', defaultDuration: 1500 },
    nod: { name: 'nod', defaultDuration: 1000 },
    shake: { name: 'shake', defaultDuration: 1000 },
    shrug: { name: 'shrug', defaultDuration: 1500 },
    thumbs_up: { name: 'thumbs_up', defaultDuration: 1500 },
    open_hands: { name: 'open_hands', defaultDuration: 2000 },
    thinking_pose: { name: 'thinking_pose', defaultDuration: 3000 }
};