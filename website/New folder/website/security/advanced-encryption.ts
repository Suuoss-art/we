/**
 * Advanced Encryption System for KOPMA UNNES Website
 * AES-256-GCM encryption with key rotation and secure key management
 */

import * as crypto from 'crypto';

interface EncryptionConfig {
  algorithm: 'AES-256-GCM';
  keySize: 256;
  ivSize: 128;
  tagSize: 128;
  keyDerivation: 'PBKDF2' | 'Argon2';
  iterations: number;
}

interface EncryptionKey {
  id: string;
  key: Buffer;
  created: Date;
  expires: Date;
  active: boolean;
  version: number;
}

interface EncryptedData {
  data: string;
  keyId: string;
  timestamp: Date;
}

interface KeyRotationConfig {
  interval: number; // hours
  maxKeys: number;
  overlapPeriod: number; // hours
  autoRotation: boolean;
}

class AdvancedEncryption {
  private config: EncryptionConfig;
  private keys: Map<string, EncryptionKey> = new Map();
  private currentKeyId: string | null = null;
  private keyRotationInterval: NodeJS.Timeout | null = null;
  private rotationConfig: KeyRotationConfig;

  constructor(config: EncryptionConfig, rotationConfig: KeyRotationConfig) {
    this.config = config;
    this.rotationConfig = rotationConfig;
    this.initializeKeys();
  }

  private initializeKeys(): void {
    // Generate initial key
    const initialKey = this.generateKey();
    this.keys.set(initialKey.id, initialKey);
    this.currentKeyId = initialKey.id;
  }

  // Generate new encryption key
  private generateKey(): EncryptionKey {
    const key = crypto.randomBytes(this.config.keySize / 8);
    const id = crypto.randomUUID();
    const now = new Date();
    
    return {
      id,
      key,
      created: now,
      expires: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
      active: true,
      version: 1
    };
  }

  // Start key rotation
  async startKeyRotation(): Promise<void> {
    if (this.rotationConfig.autoRotation) {
      this.keyRotationInterval = setInterval(async () => {
        await this.rotateKeys();
      }, this.rotationConfig.interval * 60 * 60 * 1000); // Convert hours to milliseconds
    }
  }

  // Stop key rotation
  async stopKeyRotation(): Promise<void> {
    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
      this.keyRotationInterval = null;
    }
  }

  // Rotate keys
  async rotateKeys(): Promise<void> {
    try {
      console.log('🔄 Rotating encryption keys...');

      // Generate new key
      const newKey = this.generateKey();
      this.keys.set(newKey.id, newKey);

      // Set new key as current
      this.currentKeyId = newKey.id;

      // Deactivate old keys
      const now = new Date();
      for (const [id, key] of this.keys) {
        if (key.expires < now) {
          key.active = false;
        }
      }

      // Remove expired keys
      this.cleanupExpiredKeys();

      console.log('✅ Key rotation completed');
    } catch (error) {
      console.error('❌ Error during key rotation:', error);
      throw error;
    }
  }

  // Cleanup expired keys
  private cleanupExpiredKeys(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [id, key] of this.keys) {
      if (key.expires < now) {
        expiredKeys.push(id);
      }
    }

    for (const id of expiredKeys) {
      this.keys.delete(id);
    }
  }

  // Encrypt data
  async encrypt(data: string, keyId?: string): Promise<EncryptedData> {
    try {
      const key = keyId ? this.keys.get(keyId) : this.getCurrentKey();
      if (!key) {
        throw new Error('Encryption key not found');
      }

      const cipher = crypto.createCipher(this.config.algorithm.toLowerCase(), key.key);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        data: encrypted,
        keyId: key.id,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Encryption error:', error);
      throw error;
    }
  }

  // Decrypt data
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      const key = this.keys.get(encryptedData.keyId);
      if (!key) {
        throw new Error('Decryption key not found');
      }

      const decipher = crypto.createDecipher(this.config.algorithm.toLowerCase(), key.key);
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('❌ Decryption error:', error);
      throw error;
    }
  }

  // Encrypt with key derivation
  async encryptWithKeyDerivation(data: string, password: string): Promise<EncryptedData> {
    try {
      const salt = crypto.randomBytes(32);
      const key = await this.deriveKey(password, salt);
      
      const cipher = crypto.createCipher(this.config.algorithm.toLowerCase(), key);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        data: encrypted,
        keyId: 'derived',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Key derivation encryption error:', error);
      throw error;
    }
  }

  // Decrypt with key derivation
  async decryptWithKeyDerivation(encryptedData: EncryptedData, password: string): Promise<string> {
    try {
      const salt = Buffer.from(encryptedData.timestamp.toString(), 'utf8').slice(0, 32);
      const key = await this.deriveKey(password, salt);
      
      const decipher = crypto.createDecipher(this.config.algorithm.toLowerCase(), key);
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('❌ Key derivation decryption error:', error);
      throw error;
    }
  }

  // Derive key from password
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    if (this.config.keyDerivation === 'PBKDF2') {
      return crypto.pbkdf2Sync(password, salt, this.config.iterations, this.config.keySize / 8, 'sha256');
    } else if (this.config.keyDerivation === 'Argon2') {
      // Implementation for Argon2 (requires argon2 package)
      throw new Error('Argon2 not implemented');
    } else {
      throw new Error('Unknown key derivation method');
    }
  }

  // Get current key
  private getCurrentKey(): EncryptionKey | null {
    if (!this.currentKeyId) {
      return null;
    }
    return this.keys.get(this.currentKeyId) || null;
  }

  // Get key by ID
  getKey(keyId: string): EncryptionKey | null {
    return this.keys.get(keyId) || null;
  }

  // Get all keys
  getAllKeys(): Map<string, EncryptionKey> {
    return new Map(this.keys);
  }

  // Get active keys
  getActiveKeys(): Map<string, EncryptionKey> {
    const activeKeys = new Map<string, EncryptionKey>();
    for (const [id, key] of this.keys) {
      if (key.active) {
        activeKeys.set(id, key);
      }
    }
    return activeKeys;
  }

  // Validate key
  validateKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) {
      return false;
    }
    
    const now = new Date();
    return key.active && key.expires > now;
  }

  // Get encryption statistics
  getStatistics(): any {
    const totalKeys = this.keys.size;
    const activeKeys = this.getActiveKeys().size;
    const expiredKeys = totalKeys - activeKeys;
    
    return {
      totalKeys,
      activeKeys,
      expiredKeys,
      currentKeyId: this.currentKeyId,
      rotationEnabled: this.rotationConfig.autoRotation,
      rotationInterval: this.rotationConfig.interval
    };
  }

  // Export key (for backup)
  exportKey(keyId: string): string | null {
    const key = this.keys.get(keyId);
    if (!key) {
      return null;
    }
    
    return JSON.stringify({
      id: key.id,
      key: key.key.toString('base64'),
      created: key.created.toISOString(),
      expires: key.expires.toISOString(),
      version: key.version
    });
  }

  // Import key (from backup)
  importKey(keyData: string): boolean {
    try {
      const keyInfo = JSON.parse(keyData);
      const key: EncryptionKey = {
        id: keyInfo.id,
        key: Buffer.from(keyInfo.key, 'base64'),
        created: new Date(keyInfo.created),
        expires: new Date(keyInfo.expires),
        active: true,
        version: keyInfo.version
      };
      
      this.keys.set(key.id, key);
      return true;
    } catch (error) {
      console.error('❌ Error importing key:', error);
      return false;
    }
  }

  // Destroy all keys
  destroyAllKeys(): void {
    this.keys.clear();
    this.currentKeyId = null;
  }
}

export default AdvancedEncryption;
