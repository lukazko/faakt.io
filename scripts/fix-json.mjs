import fs from 'node:fs';

const content = fs.readFileSync('scripts/generate-posts.mjs', 'utf-8');
const lines = content.split('\n');

// Find the JSON extraction sections and fix them
for (let i = 0; i < lines.length; i++) {
  // Anthropic: add cleaned line after the text assignment
  if (lines[i].includes("const text = data.content[0].text;") &&
      lines[i+1].includes("Extract JSON")) {
    lines.splice(i+2, 0, '		const cleaned = text.replace(/```json?\\s*\\n?/gi, \'\').replace(/```/g, \'\').trim();');
    lines[i+3] = lines[i+3].replace('text.match', 'cleaned.match');
    i += 2;
  }
  // OpenRouter: add cleaned line after the text assignment
  if (lines[i].includes("const text = data.choices[0].message.content;") &&
      lines[i+1].includes("Extract JSON")) {
    lines.splice(i+2, 0, '		const cleaned = text.replace(/```json?\\s*\\n?/gi, \'\').replace(/```/g, \'\').trim();');
    lines[i+3] = lines[i+3].replace('text.match', 'cleaned.match');
    i += 2;
  }
}

fs.writeFileSync('scripts/generate-posts.mjs', lines.join('\n'), 'utf-8');
console.log('Fixed');