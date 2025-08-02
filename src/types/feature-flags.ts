export type FeatureFlagName = 
  | 'royal-assistant';

export type FeatureFlagConfig = {
  [K in FeatureFlagName]: string[];
};

export interface FeatureFlagState {
  [key: string]: boolean;
}