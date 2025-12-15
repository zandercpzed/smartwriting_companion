import fs from 'fs';
import path from 'path';
import { ReadabilityAnalyzer } from '../src/analyzers/ReadabilityAnalyzer';

const file = process.argv[2];
if (!file) { console.error('Usage: node check_readability.js <file>'); process.exit(2);} 

const text = fs.readFileSync(file, 'utf8');
const words = (text.match(/[\p{L}\p{N}'’–-]+/gu) || []).length;
const sentences = (text.split(/[.!?]+/).filter(s => s.trim().length > 0).length) || 1;

const analyzer = new ReadabilityAnalyzer();
const metrics = analyzer.analyze(text, words, sentences);
console.log({ words, sentences, metrics });
