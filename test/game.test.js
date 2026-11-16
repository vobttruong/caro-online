import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,play,chooseMove} from '../public/engine.js';
import {server} from '../server.js';
test('wins in four directions and rejects occupied/outside cells',()=>{
 for(const step of [1,15,16,14]){const s=fresh(),start=step===14?14:0;for(let n=0;n<4;n++)s.board[start+n*step]='X';assert.equal(play(s,start+4*step),true);assert.equal(s.winner,'X');assert.equal(play(s,100),false);}
 const s=fresh();assert.equal(play(s,225),false);assert.equal(play(s,-1),false);play(s,0);assert.equal(play(s,0),false);
});
test('rows do not wrap and AI wins or blocks immediate threats',()=>{
 const s=fresh();for(const i of [12,13,14,15])s.board[i]='X';play(s,16);assert.equal(s.winner,null);
 for(const p of ['X','O']){const s=fresh();s.turn='O';for(const i of [105,106,107,108])s.board[i]=p;assert.equal(chooseMove(s),109);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));after(()=>new Promise(resolve=>server.close(resolve)));
const api=async(action,data={})=>{const r=await fetch(`http://127.0.0.1:${server.address().port}/api/${action}`,{method:'POST',body:JSON.stringify(data)});return {status:r.status,data:await r.json()};};
test('two online clients: authorization, turns, full room, reset agreement',async()=>{
 const x=(await api('create')).data;
 assert.equal((await api('move',{...x,index:0})).status,409);
 const o=(await api('join',{code:x.code})).data;
 assert.equal((await api('join',{code:x.code})).status,409);
 assert.equal((await api('state',{code:x.code,token:'wrong'})).status,403);
 assert.equal((await api('move',{...o,index:0})).status,409);
 assert.equal((await api('move',{...x,index:0})).data.board[0],'X');
 assert.equal((await api('move',{...o,index:0})).status,409);
 assert.equal((await api('move',{...o,index:1})).data.board[1],'O');
 assert.equal((await api('reset',x)).data.board[0],'X');
 assert.equal((await api('reset',o)).data.board[0],'');
 assert.equal((await api('state',x)).data.turn,'X');
});
