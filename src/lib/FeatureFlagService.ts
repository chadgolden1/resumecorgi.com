import { FeatureFlagName, FeatureFlagConfig } from '@/types/feature-flags';

const FEATURE_FLAGS: FeatureFlagConfig = {
  'royal-assistant': ['plus.resumecorgi.com'],
};

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private hostname: string;
  private cache: Map<FeatureFlagName, boolean> = new Map();

  private constructor() {
    this.hostname = window.location.hostname;
  }

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  isEnabled(feature: FeatureFlagName): boolean {
    // Check cache first
    if (this.cache.has(feature)) {
      return this.cache.get(feature)!;
    }

    // Check localStorage override (for development)
    const localStorageKey = `feature:${feature}`;
    const localOverride = localStorage.getItem(localStorageKey);
    if (localOverride !== null) {
      const enabled = localOverride === 'true';
      this.cache.set(feature, enabled);
      return enabled;
    }

    // Check domain-based configuration
    const enabledDomains = FEATURE_FLAGS[feature] || [];
    const enabled = this.matchesAnyDomain(enabledDomains);
    this.cache.set(feature, enabled);
    return enabled;
  }

  private matchesAnyDomain(domains: string[]): boolean {
    return domains.some(domain => this.matchesDomain(domain));
  }

  private matchesDomain(pattern: string): boolean {
    // Handle wildcard subdomains
    if (pattern.startsWith('*.')) {
      const baseDomain = pattern.slice(2);
      return this.hostname === baseDomain || this.hostname.endsWith(`.${baseDomain}`);
    }
    
    // Exact match
    return this.hostname === pattern;
  }

  // Helper method for development
  enableFeature(feature: FeatureFlagName): void {
    localStorage.setItem(`feature:${feature}`, 'true');
    this.cache.delete(feature);
  }

  disableFeature(feature: FeatureFlagName): void {
    localStorage.removeItem(`feature:${feature}`);
    this.cache.delete(feature);
  }

  // Get all feature states
  getAllFeatures(): Record<FeatureFlagName, boolean> {
    const features = Object.keys(FEATURE_FLAGS) as FeatureFlagName[];
    return features.reduce((acc, feature) => {
      acc[feature] = this.isEnabled(feature);
      return acc;
    }, {} as Record<FeatureFlagName, boolean>);
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cache.clear();
  }
}