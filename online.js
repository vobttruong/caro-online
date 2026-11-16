import {fresh,play} from './engine.js';
const prefix='caroclub-v2-';
export class OnlineRoom {
 constructor(PeerClass=globalThis.Peer){this.PeerClass=PeerClass;this.peer=null;this.conn=null;this.side=null;this.code='';this.state=fresh();this.count=1;this.votes=[];this.pending=new Map();this.sequence=0;this.failure='';}
 close(){this.peer?.destroy();this.peer=null;this.conn=null;for(const p of this.pending.values())p.reject(new Error('Đã rời phòng.'));this.pending.clear();this.failure='';}
 snapshot(){return {...this.state,board:[...this.state.board],line:[...this.state.line],count:this.count,votes:[...this.votes],side:this.side};}
 send(data){if(this.conn?.open)this.conn.send(data);}
 broadcast(){this.send({type:'state',state:this.snapshot()});}
 async open(id){
  if(!this.PeerClass)throw new Error('Không tải được thư viện online. Hãy tải lại trang.');
  this.peer=new this.PeerClass(id,{debug:0});const peer=this.peer;
  return new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>{peer.destroy();reject(new Error('Kết nối quá lâu. Kiểm tra mạng và thử lại.'));},15000);
   peer.on('open',()=>{clearTimeout(timeout);resolve();});
   peer.on('error',e=>{clearTimeout(timeout);const error=new Error(e.type==='peer-unavailable'?'Không tìm thấy phòng. Chủ phòng cần giữ trang đang mở.':e.type==='unavailable-id'?'Mã phòng bị trùng. Hãy tạo lại phòng.':'Không kết nối được online. Hãy thử mạng khác.');this.failure=error.message;reject(error);for(const p of this.pending.values())p.reject(error);this.pending.clear();});
   peer.on('disconnected',()=>{if(!peer.destroyed)peer.reconnect();});
  });
 }
 async create(){this.close();this.state=fresh();this.count=1;this.votes=[];this.side='X';this.code=Array.from(crypto.getRandomValues(new Uint8Array(6)),v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();await this.open(prefix+this.code);
  this.peer.on('connection',conn=>{
   if(this.conn){conn.on('open',()=>{conn.send({type:'error',error:'Phòng đã đủ hai người.'});setTimeout(()=>conn.close(),500);});return;}
   this.conn=conn;this.bind(conn,true);conn.on('open',()=>{this.count=2;this.failure='';this.broadcast();});
  });return {code:this.code,side:this.side};
 }
 bind(conn,host){
  conn.on('close',()=>{if(this.conn!==conn)return;this.count=1;this.failure='Đối thủ đã mất kết nối. Tạo hoặc vào lại phòng để chơi tiếp.';for(const p of this.pending.values())p.reject(new Error(this.failure));this.pending.clear();});
  conn.on('error',()=>{this.failure='Kết nối bị gián đoạn. Vui lòng tạo lại phòng.';});
  conn.on('data',data=>{
   if(!data||typeof data!=='object')return;
   if(host){
    if(!Number.isInteger(data.id)||!['move','reset'].includes(data.type))return;
    try{this.apply(data.type,data.index,'O');this.send({type:'reply',id:data.id,state:this.snapshot()});this.broadcast();}
    catch(e){this.send({type:'reply',id:data.id,error:e.message});}
   }else if(data.type==='state'||data.type==='reply'){
    if(data.state&&Array.isArray(data.state.board)&&data.state.board.length===225&&data.state.board.every(v=>['','X','O'].includes(v))&&['X','O'].includes(data.state.turn)&&Array.isArray(data.state.line)){
     this.state={board:data.state.board,turn:data.state.turn,winner:data.state.winner,line:data.state.line,last:data.state.last};this.count=data.state.count;this.votes=data.state.votes||[];this.failure='';
    }
    if(data.type==='reply'){const request=this.pending.get(data.id);if(request){this.pending.delete(data.id);data.error?request.reject(new Error(data.error)):request.resolve(this.snapshot());}}
   }else if(data.type==='error'){this.failure=String(data.error);}
  });
 }
 async join(code){
  if(!/^[A-F0-9]{12}$/i.test(code))throw new Error('Nhập đủ mã phòng gồm 12 ký tự.');
  this.close();this.code=code.toUpperCase();this.side='O';this.state=fresh();this.count=1;this.votes=[];await this.open(undefined);const conn=this.peer.connect(prefix+this.code,{reliable:true,serialization:'json'});this.conn=conn;this.bind(conn,false);
  await new Promise((resolve,reject)=>{const started=Date.now();const timer=setInterval(()=>{if(this.failure){clearInterval(timer);reject(new Error(this.failure));}else if(this.count===2){clearInterval(timer);resolve();}else if(Date.now()-started>20000){clearInterval(timer);reject(new Error('Chưa kết nối được. Chủ phòng cần giữ trang mở; hãy thử mạng khác.'));}},100);});return {code:this.code,side:this.side};
 }
 apply(action,index,side){
  if(this.count!==2||!this.conn?.open)throw new Error('Đang chờ đối thủ kết nối.');
  if(action==='move'){if(this.state.turn!==side||!play(this.state,index))throw new Error('Nước đi không hợp lệ.');}
  else if(action==='reset'){if(!this.votes.includes(side))this.votes.push(side);if(this.votes.length===2){this.state=fresh();this.votes=[];}}
 }
 async request(action,data={}){
  if(action==='create')return this.create();if(action==='join')return this.join(data.code);
  if(this.failure)throw new Error(this.failure);
  if(action==='state')return this.snapshot();
  if(this.side==='X'){this.apply(action,data.index,'X');this.broadcast();return this.snapshot();}
  if(!this.conn?.open)throw new Error('Chưa kết nối được với chủ phòng.');
  const id=++this.sequence;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Đối thủ chưa phản hồi. Kiểm tra kết nối.'));},8000);this.pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});this.send({type:action,id,index:data.index});});
 }
}
