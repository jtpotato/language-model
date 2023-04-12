import * as fs from 'fs';

type MarkovChain = Map<string, Map<string, number>>;

function generateMarkovChain(filePath: string): MarkovChain {
  const chain: MarkovChain = new Map();
  const data = fs.readFileSync(filePath, 'utf-8');
  const words = data.split(/\s+/);

  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];

    if (!chain.has(currentWord)) {
      chain.set(currentWord, new Map());
    }

    const nextWordCount = chain.get(currentWord)?.get(nextWord) ?? 0;
    chain.get(currentWord)?.set(nextWord, nextWordCount + 1);
  }

  for (const [word, nextWords] of chain) {
    let totalOccurrences = 0;
    for (const occurrences of nextWords.values()) {
      totalOccurrences += occurrences;
    }

    for (const [nextWord, occurrences] of nextWords) {
      const probability = occurrences / totalOccurrences;
      nextWords.set(nextWord, probability);
    }
  }

  return chain;
}

function writeMarkovChainToFile(chain: MarkovChain, outputFilePath: string) {
  const chainObject: { [key: string]: any } = {};

  for (const [word, nextWords] of chain) {
    const nextWordsObject: { [key: string]: number } = {};
    for (const [nextWord, probability] of nextWords) {
      nextWordsObject[nextWord] = probability;
    }
    chainObject[word] = nextWordsObject;
  }

  const data = JSON.stringify(chainObject, null, 2);
  fs.writeFileSync(outputFilePath, data);
}

// const chain = generateMarkovChain('./training.txt');
// console.log(chain)
// writeMarkovChainToFile(chain, './dict.json');

function generateSentenceFromMarkovChain(filePath: string, maxLength: number) {
  const chainData = fs.readFileSync(filePath, 'utf-8');
  const chain: { [key: string]: { [key: string]: number } } = JSON.parse(chainData);

  // Ask the user for a starting word
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Enter a starting word: ', (startWord: string) => {
    readline.close();

    // Initialize the sentence with the starting word
    let sentence = startWord;
    let currentWord = startWord;

    // Keep generating words until we reach a dead end (no more next words) or reach the max length
    let i = 0;
    while (chain[currentWord] && i < maxLength) {
      const nextWords = chain[currentWord];
      const words = Object.keys(nextWords);
      const probabilities = Object.values(nextWords);
      const nextIndex = sampleIndex(probabilities);
      const nextWord = words[nextIndex];
      sentence += ` ${nextWord}`;
      currentWord = nextWord;
      i++;
    }

    console.log(sentence);
  });
}

// Helper function to sample an index based on an array of probabilities
function sampleIndex(probabilities: number[]) {
  const random = Math.random();
  let cumulativeProbability = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    if (random < cumulativeProbability) {
      return i;
    }
  }
  return probabilities.length - 1;
}

generateSentenceFromMarkovChain("./dict.json", 100)