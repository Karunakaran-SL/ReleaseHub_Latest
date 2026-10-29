import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure the key is exactly 32 bytes (256 bits).
// In production, you should set the ENCRYPTION_KEY environment variable.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

/**
 * Encrypts a plain text string using AES-256-CBC.
 * @param text The string to encrypt.
 * @returns The encrypted string, tightly formatted as iv:encryptedData
 */
export function encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts an encrypted string back to plain text.
 * @param text The encrypted string formatted as iv:encryptedData
 * @returns The decrypted string, or the original string if decryption fails.
 */
export function decrypt(text: string): string {
    if (!text || typeof text !== 'string') return text;
    try {
        const textParts = text.split(':');
        const ivHex = textParts.shift();
        const encryptedHex = textParts.join(':');

        if (!ivHex || !encryptedHex) return text;

        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption failed:', error);
        return text; // Return the raw text if decryption fails (e.g. legacy data)
    }
}
