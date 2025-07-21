import { hash } from "crypto";

export const SPACE_SIZE = Math.abs(1 << 31) - 1;
export const HASH_ALGORITHM = "sha-1";

export function getHashRingIndex(
  string: string,
  hashAlgorithm = HASH_ALGORITHM,
  spaceSize = SPACE_SIZE
) {
  const hashed = hash(hashAlgorithm, string);
  const hashedIndex = parseInt(hashed, 16) % spaceSize;
  return hashedIndex;
}
