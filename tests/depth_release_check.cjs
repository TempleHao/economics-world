#!/usr/bin/env node
/* V1.5 release gate: node tests/depth_release_check.cjs [--depth] */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),strict=process.argv.includes('--depth');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assert=(ok,message)=>{if(!ok)throw Error(message)};
const site=read('site.js'),home=read('index.html');
assert(site.includes("const STORAGE='ew-state-v02'"),'Legacy progress key changed');
assert((site.match(/id:'W06L02'/g)||[]).length===1,'W06L02 must be registered once');
assert((home.match(/data-lesson-id="W06L02"/g)||[]).length===1,'W06L02 homepage entry missing or duplicated');
assert(read('lessons/w06-l01-costs-profit.html').includes('href="./w06-l02-short-long-run-scale.html"'),'World 06 next link broken');
const ids=[['L02','w01-l02-marginal-thinking.html'],['W03L01','w03-l01-demand.html'],['W03L02','w03-l02-supply-equilibrium.html'],['W03L03','w03-l03-elasticity.html'],['W03L04','w03-l04-price-controls-tax.html']];
if(strict){
 assert(site.includes("ew-depth-v1"),'Shared completion gate missing');
 for(const [id,name] of ids){
   const html=read('lessons/'+name);
   assert(html.includes('ew-depth-v1'),id+': independent depth evidence missing');
   assert(html.includes('Teach-back')&&html.includes('延伸阅读与观看'),id+': learning cycle incomplete');
   assert(!/不是.{0,50}而是/.test(html),id+': prohibited writing template');
 }
}
console.log('PASS V1.5 '+(strict?'depth release gate':'baseline navigation and legacy state'));
