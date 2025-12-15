const fs = require('fs');

function stripMarkdown(text) {
  const clean = text
    .replace(/^#+\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1');
  return clean;
}

function countWords(text) {
  const clean = stripMarkdown(text);
  if (!clean.trim()) return 0;
  return (clean.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
}

function countSentences(text) {
  const clean = stripMarkdown(text);
  if (!clean.trim()) return 0;
  const sentences = clean.split(/[.?!]+(\s|$)/).filter(s => s.trim().length > 0);
  return sentences.length;
}

function readingTime(words) { return Math.ceil(words / 200); }

const file = process.argv[2];
if (!file) { console.error('Usage: node check_stats_cjs.js <file>'); process.exit(2);} 
const text = fs.readFileSync(file, 'utf8');
const words = countWords(text);
const sentences = countSentences(text);
const reading = readingTime(words);
console.log({ words, sentences, reading });
