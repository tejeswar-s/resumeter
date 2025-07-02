const sw = require('stopword');

function cleanText(text) {
  // Lowercase
  let cleaned = text.toLowerCase();
  // Remove punctuation
  cleaned = cleaned.replace(/[.,/#!$%^&*;:{}=\-_`~()\[\]"]/g, '');
  // Remove extra spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  // Remove stopwords
  const words = cleaned.split(' ');
  const filtered = sw.removeStopwords(words);
  return filtered.join(' ');
}

module.exports = { cleanText }; 