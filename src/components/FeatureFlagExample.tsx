import { useFeatureFlag, useFeatureFlags } from '@/lib/FeatureFlagContext';

export function FeatureFlagExample() {
  // Check a single feature
  const hasAIAssistant = useFeatureFlag('royal-assistant');
  
  // Use the full context
  const { isEnabled, features } = useFeatureFlags();
  
  return (
    <div>
      {/* Simple feature check */}
      {hasAIAssistant && (
        <div>AI Assistant is enabled!</div>
      )}
      
      {/* Alternative approach */}
      {isEnabled('royal-assistant') && (
        <div>Advanced templates are available!</div>
      )}
      
      {/* Show all feature states (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div>
          <h3>Feature Flags:</h3>
          <pre>{JSON.stringify(features, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}