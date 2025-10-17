import { env } from "@/env";

const ALGORITHM_NAME = "AES-GCM";
const ENCRYPTION_TEXT = "hex";
const KEY_LENGTH_BYTES = 32; // AES-256
const IV_LENGTH_BYTES = 12; // 96-bit IV for GCM
const TAG_LENGTH_BYTES = 16; // 128-bit auth tag (default)

const IV_ARRAY = new Uint8Array(IV_LENGTH_BYTES);

const masterKeyRaw = Buffer.from(env.ENCRYPTION_MASTER_KEY, ENCRYPTION_TEXT);
if (masterKeyRaw.length !== KEY_LENGTH_BYTES) {
  throw new Error("ENCRYPTION ERROR: Invalid master key length. Must be 32 bytes");
}

// Import the raw key once (reusable across calls)
let cryptoKey: CryptoKey;
(async () => {
  try {
    cryptoKey = await crypto.subtle.importKey(
      "raw",
      masterKeyRaw,
      { name: ALGORITHM_NAME, length: 256 },
      false, // Not extractable for security
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    throw new Error("ENCRYPTION ERROR: Failed to import master key");
  }
})();

/**
 * hex must be EVEN
 * @returns the bites fills
 */
function hexToUint8Array(
  hex: string,
  arr: Uint8Array,
  start: number = 0
): number {
  if (arr.length * 2 < hex.length) {
    throw new Error("ENCRYPTION ERROR: arr is shorter than hex");
  }
  let c = 0;
  for (let i = 0; i < hex.length; i += 2) {
    arr[(i / 2) + start] = Number.parseInt(hex.slice(i, i+2), 16);
    c += 1;
  }
  return c;
}

export const Encryptor = {
  /**
     * Encrypts plaintext using AES-256-GCM.
     * Returns hex-encoded string: iv:authTag:ciphertext
     */
  async encrypt(text: string): Promise<string> {
    if (typeof text !== "string" || text.length === 0) {
      throw new Error("Invalid input: text must be a non-empty string");
    }

    if (!cryptoKey) {
      throw new Error("ENCRYPTION ERROR: Master key not ready");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(IV_ARRAY);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM_NAME,
        iv: iv,
        tagLength: TAG_LENGTH_BYTES * 8, // 128 bits
      },
      cryptoKey,
      data
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);

    let res = "";
    for (let v of iv) {
      res += v.toString(16).padStart(2, "0");
    }
    res += ":";

    const authStart = encryptedArray.length - TAG_LENGTH_BYTES;
    for (let i = authStart; i < encryptedArray.length; i += 1) {
      res += encryptedArray[i]?.toString(16).padStart(2, "0");
    }
    res += ":";
    for (let i = 0; i < authStart; i += 1) {
      res += encryptedArray[i]?.toString(16).padStart(2, "0");
    }

    //ivHex:authTagHex:ciphertextHex
    return res;
  },

  /**
     * Decrypts hex-encoded string using AES-256-GCM.
     * Expects format: iv:authTag:ciphertext
     */
  async decrypt(encryptedText: string): Promise<string> {
    if (typeof encryptedText !== "string" || encryptedText.length === 0) {
      throw new Error("Invalid input: encryptedText must be a non-empty string");
    }

    if (!cryptoKey) {
      throw new Error("ENCRYPTION ERROR: Master key not ready");
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

    hexToUint8Array(ivHex, IV_ARRAY, 0);

    //Because 2 characters represent 1 bites
    const fullData = new Uint8Array((encryptedText.length - authtagStart - 1) / 2);
    let fcCipher = hexToUint8Array(cipherTextHex, fullData, 0);
    let fcAuth = hexToUint8Array(authTagHex, fullData, fcCipher);

    //unrechable
    if (fcCipher + fcAuth !== fullData.length) {
      throw Error ("DECRYPT ERROR");
    }
    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: ALGORITHM_NAME,
          iv: IV_ARRAY,
          tagLength: TAG_LENGTH_BYTES * 8, // 128 bits
        },
        cryptoKey,
        fullData
      );

      const decoder = new TextDecoder();
      let res = decoder.decode(decryptedBuffer);
      IV_ARRAY.fill(0);

      return res;
    } catch (error) {
      throw new Error("Decryption failed: Invalid or tampered data");
    }
  },

  generateUUID(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    if (bytes[6] !== undefined && bytes[8] !== undefined) {
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx
    }
    let hex = "";
    for (let byte of bytes) {
      hex += byte.toString(16).padStart(2, "0");
    }
    //Format as UUID: 8-4-4-12
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  },
};


export default Encryptor;
