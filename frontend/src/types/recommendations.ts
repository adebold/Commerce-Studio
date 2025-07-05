export interface Frame {
  id: string;
  name: string;
  brand: string;
  style: string;
  material: string;
  color: string;
  price: number;
  image_url: string;
}

export interface RecommendationScore {
  frame_id: string;
  score: number;
  reasoning: string;
}

export interface RecommendationResponse {
  recommendations: Frame[];
  scores: RecommendationScore[];
  confidence_score: number;
  processing_time_ms: number;
}
