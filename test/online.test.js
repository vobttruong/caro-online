import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {OnlineRoom} from '../online.js';
const peers=new Map();let next=0;
class Connection extends EventEmitter{
 constructor(){super();this.open=false;}
 send(data){const copy=structuredClone(data);queueMicrotask(()=>this.other.emit('data',copy));}
 close(){this.open=false;this.other.open=false;this.emit('close');this.other.emit('close');}
}
class FakePeer extends EventEmitter{
 constructor(id){super();this.id=id||'guest-'+(++next);peers.set(this.id,this);queueMicrotask(()=>this.emit('open',this.id));}
 connect(id){const a=new Connection(),b=new Connection();a.other=b;b.other=a;queueMicrotask(()=>{const host=peers.get(id);if(!host)return this.emit('error',{type:'peer-unavailable'});host.emit('connection',b);a.open=b.open=true;a.emit('open');b.emit('open');});return a;}
 destroy(){this.destroyed=true;peers.delete(this.id);}
}
test('P2P host validates turns, syncs players, requires mutual reset and rejects third player',async()=>{
 const host=new OnlineRoom(FakePeer),guest=new OnlineRoom(FakePeer),extra=new OnlineRoom(FakePeer);
 const room=await host.request('create');assert.match(room.code,/^[A-F0-9]{12}$/);
 await assert.rejects(host.request('move',{index:0}));
 await guest.request('join',{code:room.code});
 await assert.rejects(guest.request('move',{index:0}));
 await host.request('move',{index:0});await new Promise(r=>setTimeout(r,0));
 assert.equal((await guest.request('state')).board[0],'X');
 await assert.rejects(guest.request('move',{index:0}));
 await guest.request('move',{index:1});assert.equal(host.snapshot().board[1],'O');
 await host.request('reset');assert.equal(host.snapshot().board[0],'X');
 await guest.request('reset');assert.equal(host.snapshot().board[0],'');assert.equal(guest.snapshot().turn,'X');
 await assert.rejects(extra.request('join',{code:room.code}),/đủ hai người/);
 guest.conn.close();await assert.rejects(host.request('move',{index:0}),/mất kết nối/);
 host.close();guest.close();extra.close();
});
