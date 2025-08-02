import { AnthropicModel, ModelInfo } from '../../types/ai';

export const ANTHROPIC_MODELS: ModelInfo[] = [
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    description: 'Most capable model for complex reasoning (Slowest, highest accuracy, highest cost)',
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    description: 'Balanced performance and capability',
  },
  {
    id: 'claude-3-7-sonnet-latest',
    name: 'Claude Sonnet 3.7',
    description: 'Fast and efficient for most tasks'
  },
  {
    id: 'claude-3-5-haiku-latest',
    name: 'Claude Haiku 3.5',
    description: 'Fastest for simple tasks (Fastest, lowest accuracy, lowest cost)'
  }
];

export const DEFAULT_MODEL: AnthropicModel = 'claude-3-7-sonnet-latest';