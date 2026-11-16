import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,play,chooseMove} from '../engine.js';
test('wins on all axes; rejects illegal moves and prevents row wrapping',()=>{
 for(const step of [1,15,16,14]){const s=fresh(),start=step===14?14:0;for(let n=0;n<4;n++)s.board[start+n*step]='X';assert.equal(play(s,start+4*step),true);assert.equal(s.winner,'X');assert.equal(play(s,100),false);}
 const s=fresh();assert.equal(play(s,225),false);assert.equal(play(s,-1),false);play(s,0);assert.equal(play(s,0),false);
 const wrap=fresh();for(const i of [12,13,14,15])wrap.board[i]='X';play(wrap,16);assert.equal(wrap.winner,null);
});
test('AI wins immediately or blocks the opponent',()=>{for(const p of ['X','O']){const s=fresh();s.turn='O';for(const i of [105,106,107,108])s.board[i]=p;assert.equal(chooseMove(s),109);}});
