const fs = require('fs');

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-záéíóúâêîôûãõàèìòùäëïöüy']/g, '');
  if (word.length <= 3) return 1;
  const matches = word.match(/[aeiouyáéíóúâêîôûãõàèìòùäëïöü]+/g);
  return matches ? matches.length : 1;
}

function countTotalSyllables(text) {
  const words = text.match(/[\p{L}\p{N}'’–-]+/gu) || [];
  return words.reduce((s, w) => s + countSyllables(w), 0);
}

function countPolysyllables(text) {
  const words = text.match(/[\p{L}\p{N}'’–-]+/gu) || [];
  return words.filter(w => countSyllables(w) >= 3).length;
}

function countComplexWords(text) {
  return countPolysyllables(text);
}

function analyze(text) {
  const words = (text.match(/[\p{L}\p{N}'’–-]+/gu) || []).length;
  const sentences = (text.split(/[.!?]+/).filter(s => s.trim().length > 0).length) || 1;
  const syllables = countTotalSyllables(text);
  const complexWords = countComplexWords(text);
  const characters = text.replace(/\s/g, '').length;
  const polysyllables = countPolysyllables(text);

  const wordsPerSentence = words / sentences;
  const syllablesPerWord = syllables / words;
  const lettersPer100Words = (characters / words) * 100;
  const sentencesPer100Words = (sentences / words) * 100;

  const fleschKincaid = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
  const fleschReadingEase = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  const gunningFog = 0.4 * (wordsPerSentence + (100 * (complexWords / words)));
  const smog = 1.0430 * Math.sqrt(polysyllables * (30 / sentences)) + 3.1291;
  const colemanLiau = (0.0588 * lettersPer100Words) - (0.296 * sentencesPer100Words) - 15.8;
  const automatedReadability = (4.71 * (characters / words)) + (0.5 * wordsPerSentence) - 21.43;
  const difficultPercent = (complexWords / words) * 100;
  let daleChall = (0.1579 * difficultPercent) + (0.0496 * wordsPerSentence);
  if (difficultPercent > 5) daleChall += 3.6365;

  return {
    words,
    sentences,
    fleschKincaid: Number(fleschKincaid.toFixed(1)),
    fleschReadingEase: Number(fleschReadingEase.toFixed(1)),
    gunningFog: Number(gunningFog.toFixed(1)),
    smog: Number(smog.toFixed(1)),
    colemanLiau: Number(colemanLiau.toFixed(1)),
    automatedReadability: Number(automatedReadability.toFixed(1)),
    daleChall: Number(daleChall.toFixed(1))
  };
}

const file = process.argv[2];
if (!file) { console.error('Usage: node check_readability_cjs.js <file>'); process.exit(2);} 
const text = fs.readFileSync(file, 'utf8');
const res = analyze(text);
console.log(JSON.stringify(res, null, 2));
