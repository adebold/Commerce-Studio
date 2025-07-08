/**
 * @fileoverview Encryption service for end-to-end encryption of avatar conversations and user data.
 * @module security/encryption-service
 */

const crypto = require('crypto');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Load security policies
const securityPolicies = yaml.load(fs.readFileSync(path.resolve(__dirname, '../config/security/security-policies.yaml'), 'utf8'));
const encryptionConfig = securityPolicies.encryption;

// In a production environment, the key should be fetched from a secure Key Management Service (KMS)
// For this example, we'll use a key derived from a secret in the config.
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_SECRET || 'default-secret-for-dev')).digest('base64').substr(0, 32);
const IV_LENGTH = 16;

/**
 * Provides methods for encrypting and decrypting data.
 */
class EncryptionService {
  /**
   * Encrypts a piece of text.
   * @param {string} text - The text to encrypt.
   * @returns {string} The encrypted text, formatted as 'iv:encryptedData'.
   */
  encrypt(text) {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(encryptionConfig.algorithm, Buffer.from(ENCRYPTION_KEY), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Could not encrypt data.');
    }
  }

  /**
   * Decrypts a piece of text.
   * @param {string} text - The encrypted text, formatted as 'iv:encryptedData'.
   * @returns {string} The decrypted text.
   */
  decrypt(text) {
    try {
      const textParts = text.split(':');
      if (textParts.length !== 2) {
        throw new Error('Invalid encrypted text format.');
      }
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(encryptionConfig.algorithm, Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      console.error('Decryption failed:', error);
      // Avoid leaking details about the error (e.g., incorrect key, bad padding)
      throw new Error('Could not decrypt data.');
    }
  }

  /**
   * Hashes a password using a secure, salted hashing algorithm.
   * @param {string} data - The data to hash.
   * @returns {string} The hashed data.
   */
  hash(data) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Compares a plaintext password with a stored hash.
   * @param {string} data - The plaintext data to compare.
   * @param {string} storedHash - The stored hash to compare against.
   * @returns {boolean} True if the password matches the hash, false otherwise.
   */
  compare(data, storedHash) {
    try {
      const [salt, hash] = storedHash.split(':');
      const hashToCompare = crypto.pbkdf2Sync(data, salt, 1000, 64, 'sha512').toString('hex');
      return hash === hashToCompare;
    } catch (error) {
      console.error('Hash comparison failed:', error);
      return false;
    }
  }
}

module.exports = new EncryptionService();