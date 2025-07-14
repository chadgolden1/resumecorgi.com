/**
 * SecureStorage - Client-side encrypted storage for API keys
 * Uses Web Crypto API for encryption
 */

const STORAGE_KEY = 'resume_corgi_ai_config';
const SALT = 'resume-corgi-2024'; // Fixed salt for consistent key derivation

export class SecureStorage {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  /**
   * Derives a crypto key from a passphrase
   */
  private static async deriveKey(passphrase: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.encoder.encode(SALT),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts data using AES-GCM
   */
  private static async encrypt(data: string, passphrase: string): Promise<string> {
    const key = await this.deriveKey(passphrase);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      this.encoder.encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypts data using AES-GCM
   */
  private static async decrypt(encryptedData: string, passphrase: string): Promise<string> {
    const key = await this.deriveKey(passphrase);
    
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return this.decoder.decode(decrypted);
  }

  /**
   * Stores API key securely
   */
  static async storeAPIKey(apiKey: string, provider: 'anthropic' | 'openai' = 'anthropic'): Promise<void> {
    try {
      // Use a combination of provider and a fixed string as passphrase
      const passphrase = `${provider}-${SALT}`;
      const config = { apiKey, provider };
      const encrypted = await this.encrypt(JSON.stringify(config), passphrase);
      
      localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to store API key securely');
    }
  }

  /**
   * Retrieves API key
   */
  static async getAPIKey(provider: 'anthropic' | 'openai' = 'anthropic'): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) return null;

      const passphrase = `${provider}-${SALT}`;
      const decrypted = await this.decrypt(encrypted, passphrase);
      const config = JSON.parse(decrypted);
      
      return config.provider === provider ? config.apiKey : null;
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }

  /**
   * Checks if API key exists
   */
  static hasAPIKey(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * Clears stored API key
   */
  static clearAPIKey(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Validates API key format (basic check)
   */
  static validateAPIKey(apiKey: string, provider: 'anthropic' | 'openai' = 'anthropic'): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    if (provider === 'anthropic') {
      // Anthropic keys start with 'sk-ant-'
      return apiKey.startsWith('sk-ant-') && apiKey.length > 10;
    } else if (provider === 'openai') {
      // OpenAI keys start with 'sk-'
      return apiKey.startsWith('sk-') && apiKey.length > 10;
    }
    
    return false;
  }
}