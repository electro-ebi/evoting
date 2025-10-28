import crypto from "crypto";

/**
 * Generate a cryptographically secure voting key
 * @returns {string} 64-character hex string
 */
export const generateVotingKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a confirmation key for vote validation
 * @returns {string} 64-character hex string
 */
export const generateConfirmationKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a verification hash for audit trail
 * @param {string} primaryKey - Primary voting key
 * @param {string} confirmationKey - Confirmation key
 * @param {string} userId - User ID
 * @param {string} electionId - Election ID
 * @param {string} candidateId - Candidate ID
 * @returns {string} SHA-512 hash
 */
export const generateVerificationHash = (primaryKey, confirmationKey, userId, electionId, candidateId) => {
  const data = `${primaryKey}:${confirmationKey}:${userId}:${electionId}:${candidateId}:${Date.now()}`;
  return crypto.createHash('sha512').update(data).digest('hex');
};

/**
 * Generate a secure nonce for additional verification
 * @returns {string} 32-character hex string
 */
export const generateNonce = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Verify the integrity of a voting key
 * @param {string} key - The key to verify
 * @returns {boolean} True if key is valid format
 */
export const verifyKeyFormat = (key) => {
  return /^[a-f0-9]{64}$/.test(key);
};

/**
 * Generate a time-based one-time password (TOTP) for additional security
 * @param {string} secret - Base secret
 * @returns {string} 6-digit TOTP
 */
export const generateTOTP = (secret) => {
  const epoch = Math.round(Date.now() / 1000.0);
  const time = Math.floor(epoch / 30);
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(Buffer.from(time.toString(16).padStart(16, '0'), 'hex'));
  const hash = hmac.digest();
  const offset = hash[hash.length - 1] & 0xf;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  return (code % 1000000).toString().padStart(6, '0');
};

/**
 * Create a secure session token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} JWT token
 */
export const createSecureSessionToken = (userId, email) => {
  const payload = {
    userId,
    email,
    type: 'voting_session',
    issuedAt: Date.now(),
    nonce: generateNonce()
  };
  
  return crypto.createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');
};

/**
 * Verify session token integrity
 * @param {string} token - Session token
 * @param {string} userId - Expected user ID
 * @param {string} email - Expected email
 * @returns {boolean} True if token is valid
 */
export const verifySessionToken = (token, userId, email) => {
  const payload = {
    userId,
    email,
    type: 'voting_session',
    issuedAt: Date.now(),
    nonce: generateNonce()
  };
  
  const expectedToken = crypto.createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return token === expectedToken;
};
