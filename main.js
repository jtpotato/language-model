function generateSentence(startStr, wordDict, beginningsDict, maxLength) {
  const words = startStr.trim().split(/\s+/);
  let sentence = words.slice();
  for (let i = 0; i < maxLength - words.length; i++) {
    const currentWord = sentence.slice(-1)[0];
    const nextWord = getNextWord(currentWord, wordDict, beginningsDict);

    if (!nextWord) {
      break;
    }

    sentence.push(nextWord);
  }

  return sentence.join(" ");
}

function getStartingWord(beginnings) {
  const totalWeight = Object.values(beginnings).reduce((sum, weight) => sum + weight, 0);
  let rand = Math.random() * totalWeight;

  for (const word in beginnings) {
    const weight = beginnings[word];
    if (rand < weight) {
      return word;
    }
    rand -= weight;
  }

  // If we somehow didn't find a word, just return a random key
  return Object.keys(beginnings)[Math.floor(Math.random() * Object.keys(beginnings).length)];
}

function weightedRandomChoice(weights) {
  let sum;
  const totalWeight = Object.values(weights).reduce((weight) => sum + weight, 0);
  let cumulativeWeight = 0;
  const rand = Math.random();
  for (const word in weights) {
    cumulativeWeight += weights[word] / totalWeight;
    if (rand < cumulativeWeight) {
      return word;
    }
  }
}

function getNextWord(currentWord, dict, beginningsDict, randomness = 0.8) {
  let subDict = dict[currentWord.replace(/[^a-zA-Z0-9']/g, "")];
  if (!subDict || Object.keys(subDict).length === 0) {
    // If we can't find the next word, get a new starting word
    currentWord = getStartingWord(beginningsDict);
  }

  let nextWord = weightedRandomChoice(subDict);

  // If we still can't find the next word, get a new starting word
  if (!nextWord) {
    currentWord = getStartingWord(beginningsDict);
    subDict = dict[currentWord.replace(/[^a-zA-Z0-9']/g, "")];

    for (const word in subDict) {
      const weight = subDict[word];
      const adjustedWeight = weight + weight * (1 - randomness);
      const rand = Math.random() * adjustedWeight;

      if (rand < weight) {
        nextWord = word;
        break;
      }
    }
  }

  return nextWord;
}




const fs = require('fs');

function loadWordDictFromJson(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const wordDict = JSON.parse(data);
    return wordDict;
  } catch (err) {
    console.error(`Error loading JSON file: ${err}`);
    return null;
  }
}


const wordDict = loadWordDictFromJson('./wordDict.json');
const beginningsDict = loadWordDictFromJson('./beginningsDict.json');
const generatedSentence = generateSentence("original", wordDict, beginningsDict, 10000);
console.log(generatedSentence);
// Output: "This is only a test sentence."
