const crypto = require('crypto');

const DEFAULT_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

const generateId = (length = 16, alphabet = DEFAULT_ALPHABET) => {
  const bytes = crypto.randomBytes(length);
  const chars = [];
  for (let i = 0; i < length; i += 1) {
    chars.push(alphabet[bytes[i] % alphabet.length]);
  }
  return chars.join('');
};

module.exports = { generateId };
