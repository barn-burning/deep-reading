import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const works=JSON.parse(fs.readFileSync(path.join(root,"data/works.json"),"utf8"));
const textbooks=JSON.parse(fs.readFileSync(path.join(root,"data/textbooks.json"),"utf8"));
const raw=fs.readFileSync(path.join(root,"data/textbook_works.csv"),"utf8").trim().split(/\r?\n/);
const headers=raw[0].split(",");
const rows=raw.slice(1).map(line=>{
  const cols=line.split(",");
  return Object.fromEntries(headers.map((h,i)=>[h,cols[i]]));
});

const errors=[];
const workIds=new Set(works.map(w=>w.id));
const textbookIds=new Set(textbooks.map(t=>t.id));

const titleAuthor=new Map();
for(const w of works){
  const key=`${w.title}|${w.author??""}`;
  if(titleAuthor.has(key)) errors.push(`duplicate work identity: ${key}`);
  titleAuthor.set(key,w.id);
}

const mapKeys=new Set();
for(const row of rows){
  if(!workIds.has(row.work_id)) errors.push(`missing work: ${row.work_id}`);
  if(!textbookIds.has(row.textbook_id)) errors.push(`missing textbook: ${row.textbook_id}`);

  const key=[row.textbook_id,row.work_id,row.unit_no,row.subunit_no].join("|");
  if(mapKeys.has(key)) errors.push(`duplicate mapping: ${key}`);
  mapKeys.add(key);

  const tb=textbooks.find(t=>t.id===row.textbook_id);
  const unit=tb?.units?.find(u=>String(u.unitNo)===String(row.unit_no));
  const sub=unit?.subunits?.find(s=>String(s.subunitNo)===String(row.subunit_no));
  if(!unit) errors.push(`missing unit for mapping: ${key}`);
  else if(!sub) errors.push(`missing subunit for mapping: ${key}`);

  if(!["main","supplementary","unknown"].includes(row.placement)){
    errors.push(`invalid placement: ${row.placement} (${key})`);
  }
}

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${textbooks.length} textbooks, ${works.length} works, ${rows.length} mappings`);
