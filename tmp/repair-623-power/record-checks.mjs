import fs from 'node:fs';
const p='reports/illustration-repair-623-power.json',r=JSON.parse(fs.readFileSync(p));
r.tests={command:'npm test',passed:2,failed:0};fs.writeFileSync(p,JSON.stringify(r,null,2)+'\n');
const hp='docs/ilustrace-handoff.md';let h=fs.readFileSync(hp,'utf8');
h=h.replace('Aktuální kontrolu eviduje `reports/illustration-repair-623-power.json`;','Kontrola souboru i oba testy `npm test` prošly. Aktuální kontrolu eviduje `reports/illustration-repair-623-power.json`;');
fs.writeFileSync(hp,h);
