import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const works=JSON.parse(fs.readFileSync(path.join(root,"data/works.json"),"utf8"));
const textbooks=JSON.parse(fs.readFileSync(path.join(root,"data/textbooks.json"),"utf8"));

function parseCsv(file){
  const lines=fs.readFileSync(path.join(root,file),"utf8").trim().split(/\r?\n/);
  const headers=lines[0].split(",");
  const parseLine=line=>{
    const cols=[]; let cur=""; let quoted=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){
        if(quoted && line[i+1]==='"'){cur+='"';i++;}
        else quoted=!quoted;
      } else if(ch==="," && !quoted){cols.push(cur);cur="";}
      else cur+=ch;
    }
    cols.push(cur);
    return Object.fromEntries(headers.map((h,i)=>[h,cols[i]??""]));
  };
  return lines.slice(1).map(parseLine);
}

const rows=parseCsv("data/textbook_works.csv");
const unitStandards=parseCsv("data/unit_standards.csv");
const errors=[];
const workIds=new Set(works.map(w=>w.id));
const textbookIds=new Set(textbooks.map(t=>t.id));

const titleAuthor=new Map();
for(const w of works){
  const key=`${w.title}|${w.author??""}`;
  if(titleAuthor.has(key)) errors.push(`duplicate work identity: ${key}`);
  titleAuthor.set(key,w.id);
}

const locate=(textbookId,unitNo,subunitNo)=>{
  const tb=textbooks.find(t=>t.id===textbookId);
  const unit=tb?.units?.find(u=>String(u.unitNo)===String(unitNo));
  const sub=unit?.subunits?.find(s=>String(s.subunitNo)===String(subunitNo));
  return {tb,unit,sub};
};

const mapKeys=new Set();
for(const row of rows){
  if(!workIds.has(row.work_id)) errors.push(`missing work: ${row.work_id}`);
  if(!textbookIds.has(row.textbook_id)) errors.push(`missing textbook: ${row.textbook_id}`);
  const key=[row.textbook_id,row.work_id,row.unit_no,row.subunit_no].join("|");
  if(mapKeys.has(key)) errors.push(`duplicate mapping: ${key}`);
  mapKeys.add(key);
  const {unit,sub}=locate(row.textbook_id,row.unit_no,row.subunit_no);
  if(!unit) errors.push(`missing unit for mapping: ${key}`);
  else if(!sub) errors.push(`missing subunit for mapping: ${key}`);
  if(!["main","supplementary","unknown"].includes(row.placement)) errors.push(`invalid placement: ${row.placement} (${key})`);
}

const standardKeys=new Set();
for(const row of unitStandards){
  if(!textbookIds.has(row.textbook_id)) errors.push(`missing textbook in unit_standard: ${row.textbook_id}`);
  const key=[row.textbook_id,row.unit_no,row.subunit_no,row.standard_id].join("|");
  if(standardKeys.has(key)) errors.push(`duplicate unit_standard: ${key}`);
  standardKeys.add(key);
  const {unit,sub}=locate(row.textbook_id,row.unit_no,row.subunit_no);
  if(!unit) errors.push(`missing unit for unit_standard: ${key}`);
  else if(!sub) errors.push(`missing subunit for unit_standard: ${key}`);
  if(!["publisher_explicit","inferred_unit_alignment"].includes(row.mapping_type)) errors.push(`invalid mapping_type: ${row.mapping_type} (${key})`);
}

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${textbooks.length} textbooks, ${works.length} works, ${rows.length} mappings, ${unitStandards.length} unit standards`);
