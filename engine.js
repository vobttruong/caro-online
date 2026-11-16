export const SIZE=15;
export function fresh(){return {board:Array(225).fill(''),turn:'X',winner:null,line:[],last:-1};}
export function play(s,i){
 if(!Number.isInteger(i)||i<0||i>=225||s.board[i]||s.winner) return false;
 const p=s.turn;s.board[i]=p;s.last=i;
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const line=[i];for(const sign of [-1,1]){let x=i%15+dx*sign,y=Math.floor(i/15)+dy*sign;while(x>=0&&x<15&&y>=0&&y<15&&s.board[y*15+x]===p){line.push(y*15+x);x+=dx*sign;y+=dy*sign;}}
  if(line.length>=5){s.winner=p;s.line=line;return true;}
 }
 if(s.board.every(Boolean))s.winner='draw';else s.turn=p==='X'?'O':'X';return true;
}
export function chooseMove(s,level='hard'){
 const empty=s.board.map((v,i)=>v?-1:i).filter(i=>i>=0);if(!empty.length)return -1;
 if(empty.length===225)return 112;
 const near=empty.filter(i=>s.board.some((v,j)=>v&&Math.abs(i%15-j%15)<=2&&Math.abs(Math.floor(i/15)-Math.floor(j/15))<=2));
 for(const p of [s.turn,s.turn==='X'?'O':'X'])for(const i of near){const t={...s,board:[...s.board],turn:p,line:[]};play(t,i);if(t.winner===p)return i;}
 if(level==='easy')return near[Math.floor(Math.random()*near.length)];
 function score(i,p){let score=0;for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let n=1,open=0;for(const sign of [-1,1]){let x=i%15+dx*sign,y=Math.floor(i/15)+dy*sign;while(x>=0&&x<15&&y>=0&&y<15&&s.board[y*15+x]===p){n++;x+=dx*sign;y+=dy*sign;}if(x>=0&&x<15&&y>=0&&y<15&&!s.board[y*15+x])open++;}score+=open?Math.pow(12,n)*(open===2?4:1):0;}return score;}
 return near.sort((a,b)=>{const value=i=>score(i,s.turn)*1.05+score(i,s.turn==='X'?'O':'X')-Math.hypot(i%15-7,Math.floor(i/15)-7)*0.1;return value(b)-value(a);})[0];
}
