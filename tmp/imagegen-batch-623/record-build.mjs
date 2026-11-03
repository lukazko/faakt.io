import fs from 'node:fs';
for(const p of ['reports/illustration-generation-623-866.json','reports/illustration-validation-623-846.json']){
 const r=JSON.parse(fs.readFileSync(p));r.build={command:'npm run build',status:'passed'};
 fs.writeFileSync(p,JSON.stringify(r,null,2)+'\n');
}
const hp='docs/ilustrace-handoff.md';let h=fs.readFileSync(hp,'utf8');
h=h.replace('Oba testy `npm test` prošly.','Oba testy `npm test` i produkční `npm run build` prošly. Build hlásí již existující upozornění na zastaralý slot a velikost vývojové galerie, ne chybu generování.');
fs.writeFileSync(hp,h);
