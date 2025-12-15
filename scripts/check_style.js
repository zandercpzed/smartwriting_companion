const fs = require('fs');

function findPassiveVoice(text) {
  const issues = [];
  const ptPattern = /\b(foi|foram|é|são|era|eram|será|serão|sido|sendo)\s+(\w+(ado|ido|to))\b/gi;
  const enPattern = /\b(was|were|is|are|been|being)\s+(\w+(ed|en|own|ung))\b/gi;
  let match;
  while ((match = ptPattern.exec(text)) !== null) {
    issues.push(match[0]);
  }
  while ((match = enPattern.exec(text)) !== null) {
    issues.push(match[0]);
  }
  return issues;
}

function findAdverbs(text) {
  const issues = [];
  const pattern = /\b\w+(mente|ly)\b/gi;
  const exclusions = new Set(['only','early','daily','friendly','likely','ugly','holy','family','silly','lovely','simplesmente','realmente']);
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (exclusions.has(match[0].toLowerCase())) continue;
    issues.push(match[0]);
  }
  return issues;
}

function findFilterWords(text) {
  const filterWords = ['viu','sentiu','percebeu','olhou','notou','ouviu','saw','felt','noticed','looked','realized','heard'];
  const pattern = new RegExp(`\\b(${filterWords.join('|')})\\b`, 'gi');
  const issues = [];
  let match;
  while ((match = pattern.exec(text)) !== null) issues.push(match[0]);
  return issues;
}

function findLongSentences(text, threshold = 40) {
  const issues = [];
  const sentencesMatches = text.matchAll(/[^.?!]+[.?!]+(\s|$)/g);
  for (const match of sentencesMatches) {
    const sentence = match[0];
    const wordCount = (sentence.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
    if (wordCount > threshold) issues.push({ sentence: sentence.trim(), wordCount });
  }
  return issues;
}

const file = process.argv[2];
if (!file) { console.error('Usage: node check_style.js <file>'); process.exit(2);} 
const text = fs.readFileSync(file, 'utf8');
const passive = findPassiveVoice(text);
const adverbs = findAdverbs(text);
const filters = findFilterWords(text);
const longSentences = findLongSentences(text);

console.log({ passiveCount: passive.length, adverbCount: adverbs.length, filterCount: filters.length, longSentences: longSentences.length });
