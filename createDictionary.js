const fs = require("fs");

function saveWordDictToFile(wordDict, filename) {
  const json = JSON.stringify(wordDict, null, 2);

  fs.writeFile(filename, json, "utf8", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Saved word dictionary to file: ${filename}`);
    }
  });
}

function normaliseDictionary(dict) {
  // Normalize counts to probabilities
  for (const key in dict) {
    const subDict = dict[key];
    const totalCount = Object.values(subDict).reduce((a, b) => a + b);
    for (const nextKey in subDict) {
      subDict[nextKey] /= totalCount;
    }
  }

  return dict;
}

function createWordDictionary(text) {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const wordDict = {};
  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i].trim();
    const nextWord = words[i + 1].trim();
    if (currentWord && nextWord) {
      if (!wordDict[currentWord]) {
        wordDict[currentWord] = {};
      }
      if (!wordDict[currentWord][nextWord]) {
        wordDict[currentWord][nextWord] = 1;
      } else {
        wordDict[currentWord][nextWord]++;
      }
    }
  }
  return normaliseDictionary(wordDict);
}

function createBeginningsDictionary(text) {
    const regex = /\b[A-Z][a-z]*\b/g;
    const matches = text.match(regex);
    const wordCount = matches.reduce((count, word) => {
      count[word] = (count[word] || 0) + 1;
      return count;
    }, {});
    const totalCount = Object.values(wordCount).reduce((total, count) => total + count, 0);
    const capitalWordsWithFrequency = Object.entries(wordCount).map(([word, count]) => {
      const frequency = (count / totalCount) * 100;
      return { word: frequency };
    });
    return capitalWordsWithFrequency;
  }
  

function loadTextFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (err) {
    console.error(err);
    return "";
  }
}

// Example usage:
const filePath = "./training.txt";
const sentence = loadTextFromFile(filePath);
const wordDict = createWordDictionary(sentence);
const beginningsDict = createBeginningsDictionary(sentence);
const filename = "./wordDict.json";

saveWordDictToFile(wordDict, filename);
saveWordDictToFile(beginningsDict, "./beginningsDict.json");
