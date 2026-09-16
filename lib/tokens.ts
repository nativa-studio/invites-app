import { randomBytes } from "node:crypto";

// Unambiguous lowercase alphabet (no 0/o, 1/l/i) so links survive being read
// out loud or retyped from a text message.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const TOKEN_LENGTH = 10;

export function generateToken(): string {
  const bytes = randomBytes(TOKEN_LENGTH);
  let out = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function isValidToken(value: string): boolean {
  return /^[a-z0-9]{8,32}$/.test(value);
}
