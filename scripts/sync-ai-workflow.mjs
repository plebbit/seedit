#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedFiles } from './ai-workflow-files.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = generatedFiles(root);
let changed = 0;
for (const [relative, content] of files) {
  const target = path.join(root, relative);
  if (fs.existsSync(target) && fs.readFileSync(target).equals(Buffer.from(content))) continue;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  changed += 1;
}
console.log(`AI workflow: generated ${files.size} compatibility files; ${changed} changed. Run ai-workflow:check to detect obsolete outputs.`);
