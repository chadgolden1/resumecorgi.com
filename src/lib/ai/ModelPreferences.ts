import { AnthropicModel } from '../../types/ai';
import { DEFAULT_MODEL } from './models';

const MODEL_PREFERENCE_KEY = 'ai-model-preference';

export class ModelPreferences {
  static getPreferredModel(): AnthropicModel {
    try {
      const stored = localStorage.getItem(MODEL_PREFERENCE_KEY);
      if (stored && this.isValidModel(stored)) {
        return stored as AnthropicModel;
      }
    } catch (error) {
      console.error('Error reading model preference:', error);
    }
    return DEFAULT_MODEL;
  }

  static setPreferredModel(model: AnthropicModel): void {
    try {
      localStorage.setItem(MODEL_PREFERENCE_KEY, model);
    } catch (error) {
      console.error('Error saving model preference:', error);
    }
  }

  private static isValidModel(model: string): boolean {
    const validModels: AnthropicModel[] = [
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-7-sonnet-latest',
      'claude-3-5-haiku-20241022',
      'claude-3-5-haiku-latest'
    ];
    return validModels.includes(model as AnthropicModel);
  }
}