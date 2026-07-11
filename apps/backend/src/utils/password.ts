import argon2 from 'argon2';

/**
 * Hash a plain text password using the Argon2id hashing algorithm.
 *
 * @param password The plain text password to hash.
 * @returns A promise that resolves to the hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
  // Argon2 is the industry standard for modern password hashing
  return argon2.hash(password, {
    type: argon2.argon2id, // recommended type for general purpose hashing
    memoryCost: 65536,    // 64MB
    timeCost: 3,          // 3 iterations
    parallelism: 4,       // 4 threads
  });
}

/**
 * Verify a plain text password against a stored Argon2 hash.
 *
 * @param hash The stored Argon2 hash.
 * @param password The plain text password to check.
 * @returns A promise that resolves to true if the password matches, false otherwise.
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    // If verification errors (e.g. malformed hash), fail safely by returning false
    return false;
  }
}
