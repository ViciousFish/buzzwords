import { resolve } from "path";
import { readFileSync, appendFileSync, writeFileSync } from "fs";

const wordsPath = resolve(__dirname, "words.json");
type Name = string;
type Enabled = 1 | 0;
interface Words {
  [word: string]: Enabled;
}

function sort(words: Words): Words {
  const sorted = Object.keys(words)
    .sort()
    .reduce((accumulator, key) => {
      accumulator[key] = words[key];
      return accumulator;
    }, {} as Words);
  return sorted;
}

function load(path: string): Words {
  const buf = readFileSync(path);
  return JSON.parse(buf.toString()) as Words;
}

function write(path: string, words: Words): void {
  const newWords = JSON.stringify(words);
  writeFileSync(path, newWords);
}

function read(path: string, name: string): Name {
  const words = load(path);
  if (words[name] == undefined) {
    throw "word does not exist";
  }
  if (!words[name]) {
    throw "word is disabled";
  }
  return name;
}

function insert(path: string, name: Name): void {
  const words = load(path);
  if (words[name]) {
    throw "word already enabled";
  }
  words[name] = 1;
  const sorted = sort(words);
  write(path, sorted);
}

function disable(path: string, name: Name): void {
  const words = load(path);
  if (words[name] == undefined) {
    throw "word does not exist";
  }
  words[name] = 0;
  const sorted = sort(words);
  write(path, sorted);
}

function remove(path: string, name: Name): void {
  const words = load(path);
  const result = delete words[name];
  if (!result) {
    throw "word does not exist";
  }
  write(path, words);
}

type Command = string;
const Read = "read" as Command;
const Insert = "insert" as Command;
const Disable = "disable" as Command;
const Remove = "remove" as Command;

const logPath = resolve(__dirname, "words.oplog");
interface Op {
  date: Date;
  command: Command;
  name: Name;
}

// logOp takes an operation and appends it to the oplog
function logOp(path: string, op: Op): void {
  const line = JSON.stringify(op) + "\n";
  appendFileSync(path, line);
}

function main(args: string[]) {
  const command: Command = args[2];
  switch (command) {
    case Read: {
      const name = args[3] as Name;
      console.log(read(wordsPath, name));
      break;
    }
    case Insert: {
      const name = args[3] as Name;
      insert(wordsPath, name);
      logOp(logPath, { date: new Date(), command, name });
      break;
    }
    case Disable: {
      const name = args[3] as Name;
      disable(wordsPath, name);
      logOp(logPath, { date: new Date(), command, name });
      break;
    }
    case Remove: {
      const name = args[3] as Name;
      remove(wordsPath, name);
      logOp(logPath, { date: new Date(), command, name });
      break;
    }
  }
}

main(process.argv);
