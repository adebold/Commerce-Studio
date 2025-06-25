export interface RecommendationSettingsType {
  algorithm: 'style' | 'collaborative' | 'hybrid';
  minConfidence: number;
  maxResults: number;
  includePricing: boolean;
  includeStyle: boolean;
  includeBrand: boolean;
  styleWeight: number;
  priceWeight: number;
  brandWeight: number;
}

export interface SettingChangeHandler {
  (key: keyof RecommendationSettingsType, value: RecommendationSettingsType[keyof RecommendationSettingsType]): void;
}

export const DEFAULT_SETTINGS: RecommendationSettingsType = {
  algorithm: 'hybrid',
  minConfidence: 0.7,
  maxResults: 10,
  includePricing: true,
  includeStyle: true,
  includeBrand: true,
  styleWeight: 0.6,
  priceWeight: 0.2,
  brandWeight: 0.2,
};
