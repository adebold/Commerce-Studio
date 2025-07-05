import { api } from './api';

export interface FaceShapeAnalysisResult {
  face_shape: string;
  confidence: number;
  measurements: {
    face_width: number;
    face_height: number;
    forehead_width: number;
    cheekbone_width: number;
    jawline_width: number;
  };
  recommendations: string[];
}

export interface FrameCompatibility {
  frame_id: string;
  compatibility_score: number;
  reasons: string[];
}

export const faceShapeService = {
  // Analyze face shape from uploaded image
  analyzeFaceShape: async (imageFile: File): Promise<FaceShapeAnalysisResult> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/api/v1/face-shape/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get frame compatibility for a specific face shape
  getFrameCompatibility: async (faceShape: string): Promise<FrameCompatibility[]> => {
    const response = await api.get(`/api/v1/frames/compatibility/${faceShape}`);
    return response.data.compatibility;
  },

  // Get all supported face shapes
  getSupportedFaceShapes: async (): Promise<string[]> => {
    const response = await api.get('/api/v1/face-shape/supported');
    return response.data.face_shapes;
  },

  // Get face shape analysis tips
  getFaceShapeTips: async (faceShape: string): Promise<{ tips: string[]; dos: string[]; donts: string[] }> => {
    const response = await api.get(`/api/v1/face-shape/tips/${faceShape}`);
    return response.data;
  }
};