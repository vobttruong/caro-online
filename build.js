import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const name of ['index.html','app.js','engine.js','online.js','style.css'])await copyFile(name,'dist/'+name);
await cp('vendor','dist/vendor',{recursive:true});
console.log('GitHub Pages files ready in dist/');
