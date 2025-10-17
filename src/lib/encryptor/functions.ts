import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { env } from "@/env";

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_TEXT = 'hex';
const KEY_LENGTH_BYTES = 32; // AES-256
const IV_LENGTH_BYTES = 12; // 96-bit IV for GCM
const TAG_LENGTH_BYTES = 16; // 128-bit auth tag (default)

if (!env.ENCRYPTION_MASTER_KEY) {
    throw new Error('ENCRYPTION ERROR: ENCRYPTION_MASTER_KEY environment variable is missing');
}

const masterKey = Buffer.from(env.ENCRYPTION_MASTER_KEY, ENCRYPTION_TEXT);
if (masterKey.length !== KEY_LENGTH_BYTES) {
    throw new Error('ENCRYPTION ERROR: Invalid master key length. Must be 32 bytes');
}

export const Encryptor = {
    encrypt(text: string): string {
        if (typeof text !== 'string' || text.length === 0) {
            throw new Error('Invalid input: text must be a non-empty string');
        }
        const iv = randomBytes(IV_LENGTH_BYTES); // 96-bit IV for GCM
        const cipher = createCipheriv(ALGORITHM, masterKey, iv);
        let encrypted = cipher.update(text, 'utf8', ENCRYPTION_TEXT);
        encrypted += cipher.final(ENCRYPTION_TEXT);
        const authTag = cipher.getAuthTag().toString(ENCRYPTION_TEXT);
        return `${iv.toString(ENCRYPTION_TEXT)}:${authTag}:${encrypted}`;
    },

    decrypt(encryptedText: string): string {
        if (typeof encryptedText !== 'string' || encryptedText.length === 0) {
            throw new Error('Invalid input: encryptedText must be a non-empty string');
        }

        let ivEnd = -1;
        let authtagStart = -1;
        let authtagEnd = -1;
        let ciphertextStart = -1;
        let found = 0;
        let i = 0;
        for (let s of encryptedText) {
            if (found === 2) {
                break;
            }
            if (s === ":") {
                if (found === 0) {
                    ivEnd = i;
                } else {
                    authtagEnd = i;
                }
                if (encryptedText[i+1] !== undefined) {
                    if (found === 0) {
                        authtagStart = i+1;
                    } else {
                        ciphertextStart = i+1;
                    }
                }
                found += 1;
            }
            i += 1;
        }

        if (ivEnd === -1 || authtagStart === -1 || ciphertextStart === -1) {
            throw new Error("Invalid encrypted data format");
        }


        if (ivEnd !== IV_LENGTH_BYTES * 2
            || authtagEnd - authtagStart  !== TAG_LENGTH_BYTES * 2
        ) {
            throw new Error("Invalid encrypted data lengths");
        }

        const ivHex = encryptedText.slice(0, ivEnd);
        const authTagHex = encryptedText.slice(authtagStart, authtagEnd);
        const cipherTextHex = encryptedText.slice(ciphertextStart);

        const iv = Buffer.from(ivHex, ENCRYPTION_TEXT);
        const authTag = Buffer.from(authTagHex, ENCRYPTION_TEXT);
        const decipher = createDecipheriv(ALGORITHM, masterKey, iv);
        decipher.setAuthTag(authTag);

        try {
            let decrypted = decipher.update(cipherTextHex, ENCRYPTION_TEXT, 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            throw new Error('Decryption failed: Invalid or tampered data');
        }
    }
};

export default Encryptor;
