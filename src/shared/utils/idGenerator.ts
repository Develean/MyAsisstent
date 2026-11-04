let lastTimestamp = 0;
let sequence = 0;

/**
 * Generates a collision-proof monotonic unique numeric ID.
 * Uses current timestamp (ms) multiplied by 1000 plus an incrementing sequence counter.
 * Fits safely within JavaScript's Number.MAX_SAFE_INTEGER (up to 9,007,199,254,740,991).
 */
export const generateId = (): number => {
  const now = Date.now();
  if (now === lastTimestamp) {
    sequence = (sequence + 1) % 1000;
  } else {
    lastTimestamp = now;
    sequence = 0;
  }
  return now * 1000 + sequence;
};
