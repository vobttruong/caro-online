import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {fresh,play} from './public/engine.js';
const rooms=new Map(),limits=new Map();
const token=()=>randomBytes(24).toString('hex');
export const server=http.createServer(async(req,res)=>{
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')){
  if(req.method!=='POST')return json(405,{error:'Yêu cầu không hợp lệ.'});
  const ip=req.socket.remoteAddress;const now=Date.now();let rate=limits.get(ip);if(!rate||now-rate.start>60000){rate={start:now,n:0};limits.set(ip,rate);}if(++rate.n>400)return json(429,{error:'Quá nhiều yêu cầu. Vui lòng chờ.'});
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2048)return json(413,{error:'Dữ liệu quá lớn.'});}let b;try{b=JSON.parse(raw||'{}');}catch{return json(400,{error:'Dữ liệu không hợp lệ.'});}
  if(url.pathname==='/api/create'){
   if(rooms.size>=5000)return json(503,{error:'Máy chủ đang đầy.'});
   let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));const key=token();rooms.set(code,{...fresh(),players:[key],votes:[],updated:now});return json(200,{code,token:key,side:'X'});
  }
  const code=String(b.code||'').toUpperCase(),r=rooms.get(code);if(!r)return json(404,{error:'Phòng không tồn tại hoặc đã hết hạn.'});
  if(url.pathname==='/api/join'){
   if(r.players.length>=2)return json(409,{error:'Phòng đã đủ hai người.'});const key=token();r.players.push(key);r.updated=now;return json(200,{code,token:key,side:'O'});
  }
  const seat=r.players.indexOf(b.token);if(seat<0)return json(403,{error:'Bạn không thuộc phòng này.'});
  if(url.pathname==='/api/move'){
   if(r.players.length<2)return json(409,{error:'Đang chờ đối thủ.'});
   if(r.turn!==['X','O'][seat]||!play(r,b.index))return json(409,{error:'Nước đi không hợp lệ.'});
  }else if(url.pathname==='/api/reset'){
   if(r.players.length<2)return json(409,{error:'Đang chờ đối thủ.'});
   if(!r.votes.includes(seat))r.votes.push(seat);if(r.votes.length===2)Object.assign(r,fresh(),{votes:[]});
  }else if(url.pathname!=='/api/state')return json(404,{error:'Không tìm thấy.'});
  r.updated=now;return json(200,{board:r.board,turn:r.turn,winner:r.winner,line:r.line,last:r.last,count:r.players.length,votes:r.votes,side:['X','O'][seat]});
 }
 const files={'/':'index.html','/style.css':'style.css','/app.js':'app.js','/engine.js':'engine.js'};const name=files[url.pathname];if(!name){res.writeHead(404);return res.end('Not found');}
 const data=await readFile(new URL('./public/'+name,import.meta.url));res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});res.end(data);
 }catch{if(!res.headersSent)json(500,{error:'Có lỗi máy chủ. Hãy thử lại.'});else res.end();}
});
const cleanup=setInterval(()=>{const now=Date.now();for(const [k,r] of rooms)if(now-r.updated>7200000)rooms.delete(k);for(const [k,r]of limits)if(now-r.start>60000)limits.delete(k);},60000);cleanup.unref();
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Caro: http://localhost:'+(process.env.PORT||3000)));
