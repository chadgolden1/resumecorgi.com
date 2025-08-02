import React, { createContext, useContext, useMemo } from 'react';
import { FeatureFlagName } from '@/types/feature-flags';
import { FeatureFlagService } from './FeatureFlagService';

interface FeatureFlagContextType {
  isEnabled: (feature: FeatureFlagName) => boolean;
  enableFeature: (feature: FeatureFlagName) => void;
  disableFeature: (feature: FeatureFlagName) => void;
  features: Record<FeatureFlagName, boolean>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const service = useMemo(() => FeatureFlagService.getInstance(), []);
  
  const contextValue = useMemo<FeatureFlagContextType>(() => ({
    isEnabled: (feature: FeatureFlagName) => service.isEnabled(feature),
    enableFeature: (feature: FeatureFlagName) => service.enableFeature(feature),
    disableFeature: (feature: FeatureFlagName) => service.disableFeature(feature),
    features: service.getAllFeatures()
  }), [service]);

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  
  return context;
}

export function useFeatureFlag(feature: FeatureFlagName): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(feature);
}