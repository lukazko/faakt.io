import fs from 'node:fs';
const p='reports/illustration-repair-600-623.json';const r=JSON.parse(fs.readFileSync(p));
r.tests={command:'npm test',passed:2,failed:0};fs.writeFileSync(p,JSON.stringify(r,null,2)+'\n');
const hp='docs/ilustrace-handoff.md';let h=fs.readFileSync(hp,'utf8');
h=h.replace('Významovou a technickou kontrolu eviduje `reports/illustration-repair-600-623.json`.','Významovou a technickou kontrolu eviduje `reports/illustration-repair-600-623.json`; kontrola souborů i oba testy `npm test` prošly.');
h=h.replace('Články, metadata a všechny starší obrázky zůstaly beze změny.','Články a metadata zůstaly beze změny; výše uvedené cílené náhrady jsou jediné následné změny obrázků.');
fs.writeFileSync(hp,h);
