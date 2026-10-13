/* ---------- 音声ファイルの場所 ---------- */
// BGM 0: Sakura Drift / 1: 星屑ランナー / 2: Beyond the clouds
window.TRACK_SRC=['assets/audio/bgm1-sakura-drift.mp3','assets/audio/bgm2-hoshikuzu-runner.mp3','assets/audio/bgm3-beyond-the-clouds.mp3'];
// 役満演出の効果音
window.YM_SE=['assets/audio/yakuman-se1.mp3','assets/audio/yakuman-se2.mp3','assets/audio/yakuman-se3.mp3'];

(() => {
'use strict';
const $ = id => document.getElementById(id);
const app = $('app'), cv = $('gl');

/* ---------- 牌データ ---------- */
const NUMK = ['一','二','三','四','五','六','七','八','九'];
const HONK = ['東','南','西','北','白','發','中'];
const TW = 1.0, TH = 0.75, TL = 1.35;          // 牌の幅・厚み・長さ
const PLAT = { w: 6.4, d: 4.4 };

/* ---------- 牌の絵 ---------- */
const FW = 256, FH = 344;
const SERIF = '"Noto Serif JP","Hiragino Mincho ProN","Yu Mincho",serif';
const C = { r:'#d6283a', g:'#1f8a4c', b:'#2a5db0', k:'#2b2f5a' };
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
const LAY = {
  1:[[.5,.5]],2:[[.5,.24],[.5,.76]],3:[[.22,.18],[.5,.5],[.78,.82]],
  4:[[.27,.27],[.73,.27],[.27,.73],[.73,.73]],5:[[.25,.22],[.75,.22],[.5,.5],[.25,.78],[.75,.78]],
  6:[[.28,.18],[.72,.18],[.28,.5],[.72,.5],[.28,.82],[.72,.82]],
  7:[[.2,.12],[.5,.25],[.8,.38],[.3,.63],[.7,.63],[.3,.88],[.7,.88]],
  8:[[.28,.12],[.72,.12],[.28,.37],[.72,.37],[.28,.63],[.72,.63],[.28,.88],[.72,.88]],
  9:[[.2,.18],[.5,.18],[.8,.18],[.2,.5],[.5,.5],[.8,.5],[.2,.82],[.5,.82],[.8,.82]]
};
const SLAY = Object.assign({}, LAY, {
  3:[[.5,.24],[.3,.76],[.7,.76]],
  7:[[.5,.14],[.2,.48],[.5,.48],[.8,.48],[.2,.84],[.5,.84],[.8,.84]]
});
const px = u => 30 + u*(FW-60), py = v => 30 + v*(FH-60);
const PCOL = {
  2:[C.g,C.b],3:[C.b,C.r,C.g],4:[C.b,C.g,C.g,C.b],5:[C.b,C.g,C.r,C.g,C.b],
  6:[C.g,C.g,C.r,C.r,C.r,C.r],7:[C.g,C.g,C.g,C.r,C.r,C.r,C.r],8:Array(8).fill(C.b),
  9:[C.b,C.b,C.b,C.r,C.r,C.r,C.g,C.g,C.g]
};
function pin(g,x,y,r,col,B){
  g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  g.fillStyle='#fffdf6';g.beginPath();g.arc(x,y,r*(B?.56:.64),0,7);g.fill();
  g.fillStyle=col;g.beginPath();g.arc(x,y,r*(B?.34:.36),0,7);g.fill();
}
function stick(g,x,y,h,w,col){
  g.fillStyle=col;rr(g,x-w/2,y-h/2,w,h,w/2);g.fill();
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=3;
  g.beginPath();g.moveTo(x-w/2+3,y);g.lineTo(x+w/2-3,y);g.stroke();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;
  g.beginPath();g.moveTo(x,y-h/2+7);g.lineTo(x,y+h/2-7);g.stroke();
}
function ft(g,t,x,y,B){if(B){g.save();g.strokeStyle=g.fillStyle;g.lineWidth=B;g.lineJoin='round';g.strokeText(t,x,y);g.restore();}g.fillText(t,x,y);}
function drawFace(k,bold){
  const B=bold?7:0;
  const c=document.createElement('canvas');c.width=FW;c.height=FH;const g=c.getContext('2d');
  g.fillStyle='#efe6cf';g.fillRect(0,0,FW,FH);
  const grd=g.createLinearGradient(0,0,0,FH);grd.addColorStop(0,'#fffdf7');grd.addColorStop(1,'#f6efdc');
  g.fillStyle=grd;rr(g,8,8,FW-16,FH-16,28);g.fill();
  g.textAlign='center';g.textBaseline='middle';
  if(k<9){
    g.fillStyle=C.k;g.font=`900 104px ${SERIF}`;ft(g,NUMK[k],FW/2,FH*.29,B*1.3);
    g.fillStyle=C.r;g.font=`900 118px ${SERIF}`;ft(g,'萬',FW/2,FH*.7,B*.85);
  }else if(k<18){
    const n=k-8;
    if(n===1){
      const x=FW/2,y=FH/2;
      g.fillStyle=C.b;g.beginPath();g.arc(x,y,92,0,7);g.fill();
      g.fillStyle='#fffdf6';g.beginPath();g.arc(x,y,80,0,7);g.fill();
      for(let i=0;i<16;i++){const a=i/16*Math.PI*2;g.fillStyle=i%2?C.g:C.b;g.beginPath();g.arc(x+Math.cos(a)*66,y+Math.sin(a)*66,8,0,7);g.fill();}
      g.fillStyle=C.r;g.beginPath();g.arc(x,y,48,0,7);g.fill();
      g.fillStyle='#fffdf6';g.beginPath();g.arc(x,y,30,0,7);g.fill();
      g.fillStyle=C.g;g.beginPath();g.arc(x,y,16,0,7);g.fill();
    }else{
      const r=(n<=5?36:n===6?31:26)*(B?1.14:1);
      LAY[n].forEach((p,i)=>pin(g,px(p[0]),py(p[1]),r,PCOL[n][i],B));
    }
  }else if(k<27){
    const n=k-17;
    if(n===1){
      const x=FW/2;
      g.fillStyle=C.g;g.beginPath();g.ellipse(x,FH*.6,58,74,0,0,7);g.fill();
      g.fillStyle='#7cc9ae';g.beginPath();g.ellipse(x+8,FH*.62,30,46,.3,0,7);g.fill();
      g.strokeStyle=C.g;g.lineWidth=9;g.lineCap='round';
      for(const dx of[-22,0,22]){g.beginPath();g.moveTo(x+dx*.4,FH*.8);g.lineTo(x+dx,FH*.92);g.stroke();}
      g.fillStyle=C.r;g.beginPath();g.arc(x,FH*.3,36,0,7);g.fill();
      g.fillStyle='#fffdf6';g.beginPath();g.arc(x+12,FH*.28,9,0,7);g.fill();
      g.fillStyle=C.k;g.beginPath();g.arc(x+14,FH*.28,4.5,0,7);g.fill();
      g.fillStyle='#f5a524';g.beginPath();g.moveTo(x+32,FH*.3);g.lineTo(x+56,FH*.33);g.lineTo(x+32,FH*.36);g.fill();
    }else{
      const h=n<=3?100:n<=5?92:n===6?76:n===7?70:n===8?56:74, w=n>=8?20:24;
      SLAY[n].forEach((p,i)=>{
        const red=(n===5&&i===2)||(n===7&&i===0)||(n===9&&i%3===1);
        stick(g,px(p[0]),py(p[1]),h,w+(B?6:0),red?C.r:C.g);
      });
    }
  }else{
    if(k===31){
      g.strokeStyle='#6fb3dc';g.lineWidth=10;rr(g,FW*.2,FH*.17,FW*.6,FH*.66,20);g.stroke();
    }else{
      g.fillStyle=k===32?C.g:k===33?C.r:C.k;g.font=`900 150px ${SERIF}`;ft(g,HONK[k-27],FW/2,FH/2+6,B*.85);
    }
  }
  return c;
}

/* ---------- three.js ---------- */
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,1,0.1,200);
let skyKey='';
function makeSky(w,h){
  if(rainbow)return;const key=w+'x'+h;if(key===skyKey||!w||!h)return;skyKey=key;
  const W=Math.max(64,Math.round(w/2)),H=Math.max(64,Math.round(h/2));
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const grd=g.createLinearGradient(0,0,0,H);
  grd.addColorStop(0,'#141238');grd.addColorStop(.28,'#34296f');grd.addColorStop(.52,'#8a4b96');
  grd.addColorStop(.72,'#e57c9c');grd.addColorStop(.88,'#ffb08a');grd.addColorStop(1,'#ffd49c');
  g.fillStyle=grd;g.fillRect(0,0,W,H);
  const sx=W*.18,sy=H*.64,r=g.createRadialGradient(sx,sy,0,sx,sy,Math.max(W,H)*.8);
  r.addColorStop(0,'rgba(255,238,195,.6)');r.addColorStop(.2,'rgba(255,180,150,.2)');r.addColorStop(1,'rgba(255,150,160,0)');
  g.fillStyle=r;g.fillRect(0,0,W,H);
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<W*H/700;i++){const y=Math.pow(rnd(),1.7)*H*.5,x=rnd()*W,a=(1-y/(H*.5))*.95*rnd();
    g.fillStyle=`rgba(255,246,225,${a.toFixed(2)})`;g.beginPath();g.arc(x,y,rnd()<.07?1.2:.6,0,7);g.fill();}
  const old=scene.background;scene.background=new THREE.CanvasTexture(c);if(old&&old.dispose)old.dispose();
}
scene.fog=new THREE.Fog(0xd97a9a,38,115);
const hemi=new THREE.HemisphereLight(0xffe2ee,0x3a2d6e,0.85);scene.add(hemi);
const amb=new THREE.AmbientLight(0xffffff,0.12);scene.add(amb);
const sun=new THREE.DirectionalLight(0xfff0dc,0.85);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:60});
sun.shadow.bias=-0.0006;
scene.add(sun);scene.add(sun.target);
const rim=new THREE.DirectionalLight(0xff8fbd,.6);rim.position.set(-10,5,-12);scene.add(rim);
/* 映り込み用の環境（牌のツヤ・金・漆に使う） */
const envTex=(()=>{
  const es=new THREE.Scene();
  const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d');
  const grd=g.createLinearGradient(0,0,0,256);
  grd.addColorStop(0,'#2a2466');grd.addColorStop(.3,'#6a3f8c');grd.addColorStop(.47,'#e79aa8');
  grd.addColorStop(.52,'#ffd1b0');grd.addColorStop(.6,'#c66f97');grd.addColorStop(1,'#2e2458');
  g.fillStyle=grd;g.fillRect(0,0,16,256);
  es.add(new THREE.Mesh(new THREE.SphereGeometry(10,32,16),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.BackSide})));
  const panel=(w,h,col,x,y,z)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m);};
  panel(5,5,0xfff4e4,1.5,8.5,2);panel(4,2.2,0xffa6c8,-6,3,-6);
  try{const pm=new THREE.PMREMGenerator(renderer);const t=pm.fromScene(es,0.02).texture;pm.dispose();return t;}catch(e){return null;}
})();
const useEnv=(m,k)=>{if(envTex){m.envMap=envTex;m.envMapIntensity=k;m.needsUpdate=true;}return m;};

const std=(color,o={})=>new THREE.MeshStandardMaterial(Object.assign({color,roughness:.9,metalness:0},o));
/* 台座：漆塗りの雀卓＋金の縁＋浮遊する柱 */
const feltTop=(()=>{
  const c=document.createElement('canvas');c.width=512;c.height=352;const g=c.getContext('2d');
  g.fillStyle='#1c5a46';g.fillRect(0,0,512,352);
  const rg=g.createRadialGradient(256,176,10,256,176,300);rg.addColorStop(0,'rgba(90,180,140,.45)');rg.addColorStop(1,'rgba(10,40,30,.35)');
  g.fillStyle=rg;g.fillRect(0,0,512,352);
  g.strokeStyle='rgba(255,214,140,.13)';g.lineWidth=1.5;
  for(let n=-4;n<=4;n++){const x=256+n*80;g.beginPath();g.moveTo(x,0);g.lineTo(x,352);g.stroke();}
  for(let n=-3;n<=3;n++){const y=176+n*80;g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}
  g.strokeStyle='rgba(255,214,140,.3)';g.lineWidth=3;g.beginPath();g.arc(256,176,62,0,7);g.stroke();
  g.lineWidth=2;g.beginPath();for(let k=0;k<8;k++){const a=k/8*Math.PI*2,r2=k%2?26:52;g.lineTo(256+Math.cos(a)*r2,176+Math.sin(a)*r2);}g.closePath();g.stroke();
  g.strokeStyle='#e8b95a';g.lineWidth=7;g.strokeRect(4,4,504,344);
  g.strokeStyle='rgba(255,214,140,.5)';g.lineWidth=2;g.strokeRect(18,18,476,316);
  const tx=new THREE.CanvasTexture(c);tx.anisotropy=8;
  return std(0xffffff,{map:tx,roughness:.95});
})();
const lacquer=std(0x221b44,{roughness:.28,metalness:.25});
const goldM=new THREE.MeshStandardMaterial({color:0xffcf73,metalness:.85,roughness:.28,emissive:0x4a2d00});useEnv(lacquer,.5);useEnv(goldM,.8);
const felt=new THREE.Mesh(new THREE.BoxGeometry(PLAT.w,0.2,PLAT.d),[lacquer,lacquer,feltTop,lacquer,lacquer,lacquer]);
felt.position.y=-0.1;felt.receiveShadow=true;scene.add(felt);
const frame=new THREE.Mesh(new THREE.BoxGeometry(PLAT.w,0.8,PLAT.d),lacquer);frame.position.y=-0.6;scene.add(frame);
for(const [y,h] of [[-0.24,.07],[-0.96,.1]]){const b=new THREE.Mesh(new THREE.BoxGeometry(PLAT.w+.04,h,PLAT.d+.04),goldM);b.position.y=y;scene.add(b);}
const column=new THREE.Mesh(new THREE.CylinderGeometry(2.1,.6,4.8,8),std(0x2c2456,{flatShading:true,roughness:.45,metalness:.25}));
column.scale.z=.7;column.position.y=-3.4;scene.add(column);
const rings=[[-2.0,2.6,0xffd27a,.5],[-3.5,1.9,0xff8fb8,-.8],[-4.9,1.25,0xffd27a,1.1]].map(([y,r,c,v])=>{
  const m=new THREE.Mesh(new THREE.TorusGeometry(r,.045,8,80),new THREE.MeshBasicMaterial({color:c}));
  m.rotation.x=Math.PI/2;m.scale.y=.72;m.position.y=y;m.userData.v=v;m.userData.c=c;scene.add(m);return m;});
const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.55),new THREE.MeshStandardMaterial({color:0xffb3d1,emissive:0xff4f9a,emissiveIntensity:.7,roughness:.2,metalness:.1,flatShading:true}));
crystal.scale.y=1.7;crystal.position.y=-6.8;scene.add(crystal);
const cLight=new THREE.PointLight(0xff6fae,1.4,9);cLight.position.y=-6.2;scene.add(cLight);

/* 雲海 */
const sea=new THREE.Group();scene.add(sea);
{
  const n=150,im=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),std(0xe9a9c5,{emissive:0x55306a,roughness:1}),n);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),pp=new THREE.Vector3(),sc=new THREE.Vector3();
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,r=7+Math.sqrt(Math.random())*75;
    pp.set(Math.cos(a)*r,-14-Math.random()*3,Math.sin(a)*r*.9-12);
    const k=3+Math.random()*6;sc.set(k,k*(.3+Math.random()*.25),k*(.8+Math.random()*.4));
    m4.compose(pp,q,sc);im.setMatrixAt(i,m4);
  }
  sea.add(im);
}
function makeIsland(s,leaf){
  const g=new THREE.Group();
  const e=new THREE.Mesh(new THREE.ConeGeometry(1.6*s,3*s,7),std(0x5e4680,{flatShading:true}));e.rotation.x=Math.PI;e.position.y=-1.6*s;g.add(e);
  const gr=new THREE.Mesh(new THREE.CylinderGeometry(1.7*s,1.6*s,.35*s,7),std(0x86c9a4,{flatShading:true}));g.add(gr);
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.12*s,.16*s,1*s,6),std(0x6b4a5a));tr.position.y=.6*s;g.add(tr);
  const lf=new THREE.Mesh(new THREE.IcosahedronGeometry(.75*s,0),std(leaf,{flatShading:true,emissive:0x301830}));lf.position.y=1.4*s;g.add(lf);
  return g;
}
const islands=[[-13,-4,-12,1.1,0xffb7cf],[14,-2,-17,1.3,0xffd6a0],[-8,-8,-26,1.6,0xc9a7ff],[10,-9,-6,0.8,0xffb7cf]].map(a=>{
  const i=makeIsland(a[3],a[4]);i.position.set(a[0],a[1],a[2]);i.userData.base=a[1];i.userData.ph=Math.random()*6;scene.add(i);return i;});
const cloudMat=std(0xefb3cd,{emissive:0x44244f,roughness:1});
const clouds=[];
for(let i=0;i<8;i++){
  const g=new THREE.Group();
  for(let j=0;j<5;j++){const s=new THREE.Mesh(new THREE.SphereGeometry(1+Math.random()*.9,10,8),cloudMat);s.position.set(j*1.3-2.6,Math.random()*.6,Math.random()*.8);g.add(s);}
  g.position.set(Math.random()*70-35,-10+Math.random()*7,-6-Math.random()*40);
  g.scale.setScalar(.8+Math.random()*.8);g.userData.v=.3+Math.random()*.5;
  scene.add(g);clouds.push(g);
}
// 落下ガイド
const beam=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,40,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false}));
beam.visible=false;scene.add(beam);
// 着地点マーカー
const markGeo=new THREE.PlaneGeometry(1,1);markGeo.rotateX(-Math.PI/2);
const mark=new THREE.Mesh(markGeo,new THREE.MeshBasicMaterial({color:0xff5f8f,transparent:true,opacity:.4,depthWrite:false}));
mark.add(new THREE.LineSegments(new THREE.EdgesGeometry(markGeo),new THREE.LineBasicMaterial({color:0xff3d7a})));
mark.visible=false;mark.renderOrder=2;scene.add(mark);
const ray=new THREE.Raycaster(),DOWN=new THREE.Vector3(0,-1,0),rayFrom=new THREE.Vector3();

/* 牌マテリアル */
const tileGeo=(()=>{
  // 角を丸めた牌（面ごとの絵柄の割り当てはそのまま）
  const R=0.09,K=4,N=2*K+1,hs=[TW/2,TH/2,TL/2];
  const geo=new THREE.BoxGeometry(TW,TH,TL,N,N,N);
  const pos=geo.attributes.position,nor=geo.attributes.normal,uv=geo.attributes.uv;
  const remap=(t,h)=>{const i=Math.round(t*N);const p=i<=K?i/K*R:(i>=K+1?2*h-(N-i)/K*R:R+(i-K)*(2*h-2*R));return p/(2*h);};
  const per=(N+1)*(N+1),UV=[[2,1],[2,1],[0,2],[0,2],[0,1],[0,1]];
  const p=[0,0,0],q=[0,0,0];
  for(let i=0;i<pos.count;i++){
    const f=Math.floor(i/per),[ua,va]=UV[f];
    uv.setXY(i,remap(uv.getX(i),hs[ua]),remap(uv.getY(i),hs[va]));
    p[0]=pos.getX(i);p[1]=pos.getY(i);p[2]=pos.getZ(i);
    for(let a=0;a<3;a++){const h=hs[a];p[a]=remap((p[a]+h)/(2*h),h)*2*h-h;const lim=h-R;q[a]=Math.max(-lim,Math.min(lim,p[a]));}
    const dx=p[0]-q[0],dy=p[1]-q[1],dz=p[2]-q[2],L=Math.hypot(dx,dy,dz);
    if(L>1e-6){pos.setXYZ(i,q[0]+dx/L*R,q[1]+dy/L*R,q[2]+dz/L*R);nor.setXYZ(i,dx/L,dy/L,dz/L);}
  }
  pos.needsUpdate=nor.needsUpdate=uv.needsUpdate=true;geo.computeBoundingSphere();geo.computeBoundingBox();
  return geo;
})();
let faceMats=[],faceURLs=[];
const sideMat=(()=>{
  const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');
  g.fillStyle='#fbf5e6';g.fillRect(0,0,64,64);g.fillStyle='#7cc9ae';g.fillRect(0,38,64,26);
  g.fillStyle='#e9dfc6';g.fillRect(0,36,64,2);
  return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.45});
})();
const backMat=new THREE.MeshStandardMaterial({color:0x7cc9ae,roughness:.45});
function buildFaces(){
  const aniso=renderer.capabilities.getMaxAnisotropy();
  for(let k=0;k<34;k++){
    const c3=drawFace(k,true);const tx=new THREE.CanvasTexture(c3);tx.anisotropy=aniso;const c=drawFace(k);
    faceMats.push(new THREE.MeshStandardMaterial({map:tx,roughness:.4}));
    const s=document.createElement('canvas');s.width=96;s.height=129;s.getContext('2d').drawImage(c,0,0,96,129);
    faceURLs.push(s.toDataURL());
  }
}
function makeMesh(k){const m=new THREE.Mesh(tileGeo,[sideMat,sideMat,faceMats[k],backMat,sideMat,sideMat]);m.castShadow=true;m.receiveShadow=true;return m;}

/* ---------- 物理 ---------- */
const world=new CANNON.World();
world.gravity.set(0,-18,0);
world.broadphase=new CANNON.NaiveBroadphase();
world.solver.iterations=20;world.allowSleep=true;
const matTile=new CANNON.Material('tile'),matGround=new CANNON.Material('ground');
world.addContactMaterial(new CANNON.ContactMaterial(matTile,matTile,{friction:.55,restitution:.02}));
world.addContactMaterial(new CANNON.ContactMaterial(matTile,matGround,{friction:.7,restitution:.02}));
const ground=new CANNON.Body({mass:0,material:matGround});
ground.addShape(new CANNON.Box(new CANNON.Vec3(PLAT.w/2,.5,PLAT.d/2)));ground.position.set(0,-.5,0);world.addBody(ground);

/* ---------- 音 ---------- */
let actx=null,muted=false,lastClack=0,adPlaying=false;
function ac(){if(!actx){try{actx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(actx&&actx.state==='suspended'&&!adPlaying)actx.resume();return actx;}
// 全画面の広告が流れている間は、ゲームの音楽と効果音を止める（js/ads.js が知らせる）
window.addEventListener('adstart',()=>{adPlaying=true;if(actx&&actx.state==='running')actx.suspend().catch(()=>{});});
window.addEventListener('adend',()=>{adPlaying=false;if(actx&&actx.state==='suspended')actx.resume().catch(()=>{});});
function clack(v){
  const a=actx;if(!a||muted)return;const t=a.currentTime;if(t-lastClack<.035)return;lastClack=t;
  const o=a.createOscillator(),g=a.createGain();o.type='triangle';
  o.frequency.setValueAtTime(1500+Math.random()*500,t);o.frequency.exponentialRampToValueAtTime(700,t+.06);
  g.gain.setValueAtTime(.16*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.1);
  const len=Math.floor(a.sampleRate*.03),buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
  const s=a.createBufferSource();s.buffer=buf;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=2200;
  const g2=a.createGain();g2.gain.value=.22*v;s.connect(f);f.connect(g2);g2.connect(a.destination);s.start(t);
}
function chime(notes,dur=.13,type='sine',vol=.14){
  const a=actx;if(!a||muted)return;let t=a.currentTime;
  notes.forEach((n,i)=>{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=n;
    const s=t+i*dur;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(vol,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+dur*2.2);
    o.connect(g);g.connect(a.destination);o.start(s);o.stop(s+dur*2.4);});
}


/* ---------- BGM（ユーザー提供の3曲） ---------- */
// 0: Sakura Drift（タイトル・0〜11,999点） 1: 星屑ランナー（12,000〜35,999点） 2: Beyond the clouds（36,000点〜）
let musicOn=true,mus=null,curTrack=-1,wantTrack=0,duckOn=false;
const MUSIC_VOL=.7;
function initBGM(){
  const a=ac();if(!a)return;
  if(!mus){
    mus=(window.TRACK_SRC||[]).map(src=>{
      const el=new Audio();el.src=src;el.loop=true;el.preload='auto';el.setAttribute('playsinline','');
      const g=a.createGain();g.gain.value=0;
      try{const node=a.createMediaElementSource(el);node.connect(g);g.connect(a.destination);}catch(e){}
      return{el,g};
    });
  }
  setTrack(wantTrack);
}
function trackVol(){return(musicOn&&!muted)?MUSIC_VOL*(duckOn?.3:1):0;}
function setTrack(i){
  wantTrack=i;if(!mus||!mus[i])return;
  const t=actx.currentTime;
  if(i!==curTrack){
    if(curTrack>=0){
      const old=mus[curTrack];old.g.gain.cancelScheduledValues(t);old.g.gain.setTargetAtTime(0,t,.5);
      setTimeout(()=>{if(mus[curTrack]!==old)old.el.pause();},2600);
    }
    const n=mus[i];n.el.currentTime=0;const pr=n.el.play();if(pr&&pr.catch)pr.catch(()=>{});
    curTrack=i;
  }else if(mus[i].el.paused&&trackVol()>0){const pr=mus[i].el.play();if(pr&&pr.catch)pr.catch(()=>{});}
  applyMusicVol(duckOn);
}
// どこかをタップしたとき、鳴っているはずの曲が止まっていたら再生し直す（スマホの自動再生制限対策）
document.addEventListener('pointerdown',()=>{
  if(!mus||curTrack<0||!musicOn||muted)return;const el=mus[curTrack].el;
  if(el.paused){ac();const p=el.play();if(p&&p.catch)p.catch(()=>{});}
},{passive:true,capture:true});
function applyMusicVol(duck){
  duckOn=!!duck;if(!mus||curTrack<0)return;
  const t=actx.currentTime,g=mus[curTrack].g.gain;
  g.cancelScheduledValues(t);g.setTargetAtTime(trackVol(),t,duckOn?.1:.5);
}
let stage=0;
const tierOf=sc=>sc>=36000?2:sc>=12000?1:0;
function tierNow(sc){if(endless&&sc>=36000)return[2,0,1][Math.floor((sc-36000)/12000)%3];return tierOf(sc);}

/* ---------- 虹の空（36,000点〜） ---------- */
let rainbow=false;

/* ---------- 役判定 ---------- */
const isHonor=k=>k>=27,isTerm=k=>k<27&&(k%9===0||k%9===8),isTY=k=>isHonor(k)||isTerm(k);
const suitOf=k=>k<27?Math.floor(k/9):3,isDragon=k=>k>=31;
const CANDS=[];for(let t=0;t<34;t++)CANDS.push({p:true,t});for(let s=0;s<3;s++)for(let n=0;n<7;n++)CANDS.push({p:false,t:s*9+n});
function ptsOf(h){if(h>=13)return 32000;if(h>=11)return 24000;if(h>=8)return 16000;if(h>=6)return 12000;if(h>=5)return 8000;return[0,1000,2000,3900,7700][h];}
const KOKUSHI=[0,8,9,17,18,26,27,28,29,30,31,32,33];
const GREEN=new Set([19,20,21,23,25,32]);
function scoreHand(dec){
  const Y=[];let ym=0;const add=(n,h)=>Y.push({n,h});const addY=n=>{Y.push({n,h:0});ym++;};
  if(dec.kokushi){
    const l=KOKUSHI.concat([dec.pair]).sort((a,b)=>a-b);
    return{yaku:[{n:'国士無双',h:0}],han:13,yakuman:1,points:32000,tiles:l,groups:[l]};
  }
  const groups=dec.chiitoi?dec.pairs.map(k=>[k,k]):[[dec.pair,dec.pair],...dec.melds.map(m=>m.p?[m.t,m.t,m.t]:[m.t,m.t+1,m.t+2])];
  const list=groups.flat();
  const suits=new Set(list.filter(k=>k<27).map(suitOf)),hasHonor=list.some(isHonor),allHonor=list.every(isHonor);
  const pungs=dec.chiitoi?[]:dec.melds.filter(m=>m.p),chows=dec.chiitoi?[]:dec.melds.filter(m=>!m.p);
  const dragP=pungs.filter(m=>isDragon(m.t)).length;
  if(allHonor)addY('字一色');
  if(dragP===3)addY('大三元');
  if(pungs.length===4)addY('四暗刻');
  const windP=pungs.filter(m=>m.t>=27&&m.t<=30).length;
  if(windP===4)addY('大四喜');
  else if(windP===3&&!dec.chiitoi&&dec.pair>=27&&dec.pair<=30)addY('小四喜');
  if(list.every(k=>GREEN.has(k)))addY('緑一色');
  if(list.every(isTerm))addY('清老頭');
  if(suits.size===1&&!hasHonor&&!dec.chiitoi){
    const s0=suitOf(list[0]),nc=Array(9).fill(0);list.forEach(k=>nc[k-s0*9]++);
    const base=[3,1,1,1,1,1,1,1,3];
    if(nc.every((v,i)=>v>=base[i]))addY('九蓮宝燈');
  }
  if(ym)return{yaku:Y,han:13*ym,yakuman:ym,points:32000*ym,tiles:list,groups};
  add('門前清自摸和',1);
  if(list.every(k=>k<27&&k%9>=1&&k%9<=7))add('断么九',1);
  if(suits.size===1){if(hasHonor)add('混一色',3);else add('清一色',6);}
  if(dec.chiitoi){add('七対子',2);if(list.every(isTY))add('混老頭',2);}
  else{
    for(const m of pungs){if(m.t===31)add('役牌 白',1);if(m.t===32)add('役牌 發',1);if(m.t===33)add('役牌 中',1);if(m.t===27)add('役牌 東',1);}
    if(dragP===2&&isDragon(dec.pair))add('小三元',2);
    if(pungs.length===3)add('三暗刻',2);
    const cc={};chows.forEach(m=>cc[m.t]=(cc[m.t]||0)+1);
    let dup=0;for(const t in cc)dup+=Math.floor(cc[t]/2);
    if(dup>=2)add('二盃口',3);else if(dup===1)add('一盃口',1);
    for(let n=0;n<7;n++)if(cc[n]&&cc[9+n]&&cc[18+n]){add('三色同順',2);break;}
    for(let s=0;s<3;s++)if(cc[s*9]&&cc[s*9+3]&&cc[s*9+6]){add('一気通貫',2);break;}
    if(chows.length&&groups.every(g=>g.some(isTY)))add(hasHonor?'混全帯么九':'純全帯么九',hasHonor?2:3);
    if(!chows.length&&list.every(isTY))add('混老頭',2);
    if(chows.length===4&&!isDragon(dec.pair)&&dec.pair!==27&&ryanmen(chows,dec.win,list))add('平和',1);
  }
  const han=Y.reduce((a,y)=>a+y.h,0);
  if(han>=13)return{yaku:Y,han,yakuman:1,kazoe:true,points:32000,tiles:list,groups};
  return{yaku:Y,han,yakuman:0,points:ptsOf(han),tiles:list,groups};
}
// 平和は両面待ちで和了ったときだけ。和了牌（最後に積んだ牌）が順子の端に入り、ペンチャン（12に3・89に7）でないこと
function ryanmen(chows,w,list){
  if(w==null||!list.includes(w))return true;   // 和了牌がわからない・手に使っていないときは制限しない
  return chows.some(m=>(w===m.t&&m.t%9!==6)||(w===m.t+2&&m.t%9!==0));
}
// win：和了牌の種類（平和の待ちの判定に使う）
function findBest(cnt,win){
  const c=cnt.slice();let best=null,evals=0;const melds=[];let pairK=0;
  const consider=dec=>{const r=scoreHand(dec);if(!best||r.points>best.points||(r.points===best.points&&r.han>best.han))best=r;};
  function rec(start){
    if(evals>60000)return;
    if(melds.length===4){evals++;consider({pair:pairK,melds:melds.slice(),win});return;}
    for(let i=start;i<CANDS.length;i++){
      const m=CANDS[i],t=m.t;
      if(m.p){if(c[t]>=3){c[t]-=3;melds.push(m);rec(i+1);melds.pop();c[t]+=3;}}
      else if(c[t]&&c[t+1]&&c[t+2]){c[t]--;c[t+1]--;c[t+2]--;melds.push(m);rec(i);melds.pop();c[t]++;c[t+1]++;c[t+2]++;}
    }
  }
  for(pairK=0;pairK<34;pairK++)if(c[pairK]>=2){c[pairK]-=2;rec(0);c[pairK]+=2;}
  if(KOKUSHI.every(k=>cnt[k]>=1))for(const k of KOKUSHI)if(cnt[k]>=2)consider({kokushi:true,pair:k});
  const pairs=[];for(let k=0;k<34;k++)if(cnt[k]>=2)pairs.push(k);
  if(pairs.length>=7){
    const sel=[];let n=0;
    (function comb(i){if(n>3000)return;if(sel.length===7){n++;consider({chiitoi:true,pairs:sel.slice()});return;}
      if(pairs.length-i<7-sel.length)return;sel.push(pairs[i]);comb(i+1);sel.pop();comb(i+1);})(0);
  }
  return best;
}

/* ---------- ゲーム状態 ---------- */
let state='title',score=0,lives=3,wall=[],choices=[],tiles=[],held=null,best=null;
let wins=0,bestHand=null,maxHeight=0,graceUntil=0,fallT=0,calmT=0,settledTop=0,camY=0,drag=null;
const parts=[];

// 和了牌＝台の上でいちばん最後に積んだ牌
let dropSeq=0;
function winKind(){let w=null,s=0;for(const t of tiles)if(!t.removing&&t.body.position.y>-0.6&&(t.seq||0)>s){s=t.seq;w=t.kind;}return w;}
function boardCounts(){const c=Array(34).fill(0);for(const t of tiles)if(!t.removing&&t.body.position.y>-0.6)c[t.kind]++;return c;}
function towerTop(){
  let m=0;
  for(const t of tiles){if(t.removing||t.body.position.y<-0.6)continue;t.body.computeAABB();if(t.body.aabb.upperBound.y>m)m=t.body.aabb.upperBound.y;}
  return m;
}
function removeTile(t){world.removeBody(t.body);scene.remove(t.mesh);const i=tiles.indexOf(t);if(i>=0)tiles.splice(i,1);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

let toastTimer=0;
const TOAST_LIFE={info:1750,gold:2050,fall:1950,rainbow:2200,star:2200};
// index.html の先頭にあるアイコン（絵文字の代わり）
const ic=n=>`<svg class="ic"><use href="#i-${n}"/></svg>`;
const HEART_SVG='<svg viewBox="0 0 54 48"><path d="M27 46C12 35 2 26 2 14 2 6.5 8 1.5 15 1.5c5 0 9.5 3 12 7.5C29.5 4.5 34 1.5 39 1.5c7 0 13 5 13 12.5 0 12-10 21-25 32z" fill="#ff4f7e"/><path d="M13 8c-4 1-6 4.5-6 8" stroke="#ffd0dc" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>';
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
let toastType='',toastEndAt=0;
function toast(msg,type='info',sub=''){
  const e=$('toast');clearTimeout(toastTimer);toastType=type;toastEndAt=performance.now()+(TOAST_LIFE[type]||1750);
  let h='';
  if(type==='fall')h+=`<div class="hb"><div class="l">${HEART_SVG}</div><div class="r">${HEART_SVG}</div></div>`;
  h+=`<span class="tx">${esc(msg)}</span>`;
  if(sub)h+=`<span class="sub">${esc(sub)}</span>`;
  const P={gold:['#ffd65a','#fff3c0','#ff9f5a','#ff7aa2'],rainbow:['#ff6b8b','#ffb35c','#ffe66b','#7be39a','#6bc8ff','#b18cff'],star:['#ffffff','#cfdcff','#ffe9a8']}[type];
  if(P){const n=type==='gold'?18:16;for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2+Math.random()*.4,d=70+Math.random()*80,dx=Math.cos(a)*d*1.5,dy=Math.sin(a)*d*.9+30;
    const sp=type!=='gold'&&i%2===0;
    h+=`<i class="pt${sp?' sp':''}" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--r:${(Math.random()*540-270).toFixed(0)}deg;background:${P[i%P.length]};color:${P[i%P.length]}">${sp?'✦':''}</i>`;}}
  e.innerHTML=`<div class="tm ${type}">${h}</div>`;
  toastTimer=setTimeout(()=>{e.innerHTML='';},TOAST_LIFE[type]||1750);
}
function updateHud(){
  const se=$('score');if(se.textContent!==score.toLocaleString()){se.textContent=score.toLocaleString();se.classList.remove('bump');void se.offsetWidth;if(score>0)se.classList.add('bump');}$('wall').textContent=endless?'∞':wall.length;
  const lv=Math.max(0,Math.min(5,lives));$('hearts').innerHTML=ic('heart').repeat(lv)+ic('heart-empty').repeat(Math.max(0,3-lv));
}
const timg=(k,cls='')=>`<img class="t ${cls}" src="${faceURLs[k]}" alt="${kindName(k)}">`;
function kindName(k){if(k<9)return NUMK[k]+'萬';if(k<18)return NUMK[k-9]+'筒';if(k<27)return NUMK[k-18]+'索';return HONK[k-27];}

// 待ち（あと1枚で和了れる牌）。台の上の牌で調べる。同じ並びなら前の結果を使う
let waitKey='',waitVal=[];
function waitsOf(c,n){
  if(n<13||n>17)return[];
  const key=c.join(',');if(key===waitKey)return waitVal;
  const w=[];
  for(let k=0;k<34;k++){if(c[k]>=4)continue;c[k]++;const ok=findBest(c,k);c[k]--;if(ok)w.push(k);}
  waitKey=key;waitVal=w;return w;
}
// 下の枠の手牌：和了れるときは面子ごと、ふだんは萬子・筒子・索子・字牌ごとに分けて並べる
function renderHand(){
  const c=boardCounts(),n=c.reduce((a,b)=>a+b,0),lb=$('handlabel');
  const run=ks=>ks.map(k=>timg(k)).join('');
  let h='';
  if(best){
    const rest=c.slice();best.tiles.forEach(k=>rest[k]--);
    h=best.groups.map(g=>`<span class="hg">${g.map(k=>timg(k,'used')).join('')}</span>`).join('');
    const r=[];for(let k=0;k<34;k++)for(let i=0;i<rest[k];i++)r.push(k);
    if(r.length)h+=`<span class="hg rest">${run(r)}</span>`;
    lb.className='win';lb.innerHTML=`<span class="tag">和了れる！</span>${best.yaku.map(y=>y.n).join('・')}`;
  }else{
    for(const [a,b] of [[0,9],[9,18],[18,27],[27,34]]){
      const g=[];for(let k=a;k<b;k++)for(let i=0;i<c[k];i++)g.push(k);
      if(g.length)h+=`<span class="hg">${run(g)}</span>`;
    }
    const w=waitsOf(c,n);
    if(w.length){
      lb.className='tenpai';lb.innerHTML=`<span class="tag">あと1枚！</span><span class="wt">${w.slice(0,6).map(k=>timg(k,'ghost')).join('')}${w.length>6?'…':''}</span>${w.length>3?'のどれか':''}がくれば和了`;
    }else{lb.className='';lb.innerHTML=`<span class="tag">台の上</span><b>${n}</b>枚${n<14?'<small>14枚から和了のチャンス</small>':''}`;}
  }
  $('hand').innerHTML=h;$('hand').classList.toggle('many',n>=12);
}
// 選べる牌それぞれについて「積めば和了れるか（すでに和了れるなら点数が上がるか）」を調べる
let pickWinKey='',pickWinVal=[];
function pickWins(){
  const c=boardCounts(),n=c.reduce((a,b)=>a+b,0);
  const key=choices.join(',')+'|'+c.join('')+'|'+(best?best.points:0);
  if(key===pickWinKey)return pickWinVal;
  pickWinKey=key;
  pickWinVal=choices.map(k=>{
    if(n+1<14)return null;
    c[k]++;const r=findBest(c,k);c[k]--;
    if(!r)return null;
    if(best&&r.points<=best.points)return null;
    return r;
  });
  return pickWinVal;
}
function renderCtrl(){
  const el=$('ctrl');let h='';
  if(state==='choose'){
    if(best)h+=`<div class="row"><button class="btn tsumo" id="bTsumo">ツモ！で ${best.points.toLocaleString()}点ゲット</button></div>`;
    if(choices.length){
      const pwin=pickWins();
      h+=`<div class="choose"><div class="q">どっちを<br>積む？</div>`+
        choices.map((k,i)=>{const w=pwin[i];
          return w?`<button class="pick hot" data-i="${i}"><span class="pw">${best?'点数アップ':'和了れる！'}</span>${timg(k)}${kindName(k)}<span class="pts">${w.points.toLocaleString()}点</span></button>`
                  :`<button class="pick" data-i="${i}">${timg(k)}${kindName(k)}</button>`;}).join('')+`</div>`;
    }else h+=`<div class="row"><button class="btn" id="bEnd">完走する</button></div>`;
  }else if(state==='aim'){
    h=`<div class="hint">ドラッグで動かして、指をはなすと落ちるよ</div>
      <div class="row"><button class="btn" id="bRot">⟲ まわす</button><button class="btn" id="bStand">${held&&isStanding(held)?'↓ 寝かせる':'↑ 立てる'}</button></div>`;
  }else if(state==='falling'){
    h=`<div class="hint settle"><span class="dots"><i></i><i></i><i></i></span>牌が止まるまで ちょっと待ってね</div>`;
  }
  el.innerHTML=h;
  el.querySelectorAll('.pick').forEach(b=>b.onclick=()=>pick(+b.dataset.i));
  const on=(id,f)=>{const b=$(id);if(b)b.onclick=f;};
  on('bTsumo',tsumo);on('bEnd',finishRun);
  on('bRot',()=>{if(held){turnHeld(held);chime([660],.05);}});
  on('bStand',()=>{if(held){toggleStand(held);chime([740],.05);renderCtrl();}});
  on('bDrop',drop);
  renderCoach();
}

/* ---------- はじめての人への案内（それぞれ1回だけ。下の枠の上に吹き出しで出す） ---------- */
const COACH_KEY='tenraku-coach';
const COACH={
  pick:'まずは2枚のうち、好きな牌をタップしてえらんでね',
  aim:'指でドラッグして落とす場所を決めよう。ピンクの四角が着地点。指をはなすと落ちるよ',
  stack:'この調子で積み上げよう。台の上の牌で役ができると和了れるよ',
  tenpai:'あと1枚！ 上に出ている牌を積めば和了れるよ',
  tsumo:'役ができた！「ツモ！」を押すと点数ゲット。使った牌は消えるよ',
};
let coachSeen=null,coachNow=null;
function coachLoad(){if(!coachSeen){try{coachSeen=JSON.parse(localStorage.getItem(COACH_KEY)||'{}');}catch(e){coachSeen={};}}return coachSeen;}
function coachStep(){
  if(debug)return null;
  if(state==='aim')return'aim';
  if(state!=='choose')return null;
  if(best)return'tsumo';
  if(waitVal.length&&waitKey===boardCounts().join(','))return'tenpai';
  if(choices.length)return dropSeq?'stack':'pick';
  return null;
}
function renderCoach(){
  const el=$('coach'),seen=coachLoad(),st=coachStep();
  if(st&&st===coachNow)return;
  if(!st||seen[st]){coachNow=null;el.hidden=true;return;}
  coachNow=st;seen[st]=1;try{localStorage.setItem(COACH_KEY,JSON.stringify(seen));}catch(e){}
  el.textContent=COACH[st];el.hidden=false;
  el.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'});
}
$('coach').onclick=()=>{$('coach').hidden=true;};   // タップで閉じる

let customSky=-1,customTrack=-1;
function renderCustom(){
  document.querySelectorAll('#skyTabs button').forEach(b=>b.classList.toggle('on',+b.dataset.v===customSky));
  document.querySelectorAll('#trackTabs button').forEach(b=>b.classList.toggle('on',+b.dataset.v===customTrack));
}
document.querySelectorAll('#skyTabs button').forEach(b=>b.onclick=()=>{
  customSky=+b.dataset.v;setSky(customSky>=0?customSky:tierNow(score));renderCustom();chime([740],.05);});
document.querySelectorAll('#trackTabs button').forEach(b=>b.onclick=()=>{
  customTrack=+b.dataset.v;ac();initBGM();if(!musicOn){musicOn=true;$('music').classList.remove('off');}
  setTrack(customTrack>=0?customTrack:tierNow(score));renderCustom();});
function fillWall(){wall=[];for(let k=0;k<34;k++)for(let i=0;i<4;i++)wall.push(k);shuffle(wall);}
let gameId=0;
function newGame(){
  gameId++;customSky=-1;customTrack=-1;
  overWait=false;
  for(const t of tiles.slice())removeTile(t);
  if(held){scene.remove(held.mesh);held=null;}
  lap=1;fillWall();
  score=0;lives=3;wins=0;streak=0;maxStreak=0;bestHand=null;maxHeight=0;best=null;choices=[];settledTop=0;graceUntil=0;
  revived=false;reviveResume=null;
  if(debug)debugSetup();
  $('overOv').classList.remove('show');$('winOv').classList.remove('show');$('reviveOv').classList.remove('show');
  if(Ads)Ads.hideBanner();
  toChoose();
}
function toChoose(){
  state='choose';
  if(endless&&!boomAt&&!wall.length&&!choices.length){fillWall();lap++;const heal=lives<5;if(heal){lives++;chime([659,880,1175],.08,'sine',.1);}updateHud();
    toast('山を補充！',heal?'gold':'info',`${lap}周目`+(heal?'　ハート +1':''));}
  if(!choices.length&&wall.length)choices=wall.splice(0,Math.min(2,wall.length));
  if(!choices.length&&!best){
    if(boomAt){boomAt=false;const gid=gameId;updateHud();renderHand();renderCtrl();setTimeout(()=>{if(gid===gameId&&state==='choose')finishRun();},2600);return;}
    finishRun();return;}
  updateHud();renderHand();renderCtrl();
}
function pick(i){
  if(state!=='choose')return;
  const k=choices[i];choices=[];
  held={kind:k,mesh:makeMesh(k),q:new THREE.Quaternion(),x:0,z:0,cx:0,cz:0,y:null};
  scene.add(held.mesh);state='aim';chime([880],.06);renderCtrl();
}
/* 持っている牌の向き：今の向きのまま「まわす」「立てる」「寝かせる」 */
const _X=new THREE.Vector3(1,0,0),_Y=new THREE.Vector3(0,1,0),_Z=new THREE.Vector3(0,0,1);
const HALF=[TW/2,TH/2,TL/2];
function tileAxes(h){return[_X.clone().applyQuaternion(h.q),_Y.clone().applyQuaternion(h.q),_Z.clone().applyQuaternion(h.q)];}
function isStanding(h){return Math.abs(tileAxes(h)[1].y)<.5;}
function turnHeld(h){h.q.premultiply(new THREE.Quaternion().setFromAxisAngle(_Y,Math.PI/4)).normalize();}
function toggleStand(h){
  const [ax,ay,az]=tileAxes(h);
  if(Math.abs(ay.y)<.5){
    // 寝かせる：今見えている面が上を向くように、そのまま後ろへ倒す
    const n=ay.clone();n.y=0;n.normalize();
    h.q.premultiply(new THREE.Quaternion().setFromUnitVectors(n,_Y)).normalize();
  }else{
    // 立てる：画面の左右に近いほうの辺を軸にして、手前に起こす
    //  細長い向きなら縦に、横長の向きなら横に立つ
    const axis=(Math.abs(ax.x)>=Math.abs(az.x)-1e-6?ax:az).clone();axis.y=0;axis.normalize();
    let r=new THREE.Quaternion().setFromAxisAngle(axis,Math.PI/2);
    if(ay.clone().applyQuaternion(r).z<0)r=new THREE.Quaternion().setFromAxisAngle(axis,-Math.PI/2);
    h.q.premultiply(r).normalize();
  }
}
function heldHalfHeight(h){const A=tileAxes(h);return A.reduce((s,a,i)=>s+Math.abs(a.y)*HALF[i],0);}
function heldQuat(h){return h.q;}
function drop(){
  if(state!=='aim'||!held)return;
  const m=held.mesh,b=new CANNON.Body({mass:1,material:matTile});
  b.addShape(new CANNON.Box(new CANNON.Vec3(TW/2,TH/2,TL/2)));
  b.position.set(m.position.x,m.position.y,m.position.z);
  b.quaternion.set(m.quaternion.x,m.quaternion.y,m.quaternion.z,m.quaternion.w);
  b.linearDamping=.05;b.angularDamping=.15;b.allowSleep=true;b.sleepSpeedLimit=.1;b.sleepTimeLimit=.5;
  b.addEventListener('collide',e=>{const v=Math.abs(e.contact.getImpactVelocityAlongNormal());if(v>1.2)clack(Math.min(1,v/8));});
  world.addBody(b);
  tiles.push({kind:held.kind,body:b,mesh:m,removing:false,seq:++dropSeq});
  held=null;beam.visible=false;state='falling';fallT=0;calmT=0;renderCtrl();
}
function onSettled(){
  const top=towerTop();settledTop=top;
  if(top>maxHeight+0.05&&maxHeight>0.5&&top>2.5)toast('タワー新記録！','gold');
  maxHeight=Math.max(maxHeight,top);
  if(lives<=0){heartsOut(afterSettled);return;}
  afterSettled();
}
function afterSettled(){
  const had=!!best,c=boardCounts();best=c.reduce((a,b)=>a+b,0)>=14?findBest(c,winKind()):null;
  if(best&&!had){chime([988,1319],.09,'sine',.1);toast('役ができた！','gold');}
  toChoose();
}

/* ---------- 広告を見てハート回復（iPhoneアプリ版だけ・1ゲーム1回） ---------- */
const Ads=window.Ads||null;
let revived=false,reviveResume=null;
function heartsOut(resume){
  if(state==='revive')return;
  if(revived||debug||!Ads||!Ads.canRevive()){gameOver('ハートがなくなっちゃった');return;}
  const prev=state,gid=gameId;
  state='revive';drag=null;
  reviveResume=()=>{state=prev;resume();};
  // 「落ちちゃった…」の演出が終わってから聞く
  const wait=toastType==='fall'?Math.max(0,toastEndAt-400-performance.now()):0;
  setTimeout(()=>{if(state==='revive'&&gid===gameId)$('reviveOv').classList.add('show');},wait);
}
$('reviveYes').onclick=async()=>{
  const btn=$('reviveYes');if(btn.disabled)return;btn.disabled=true;
  const gid=gameId,ok=await Ads.showReward();
  btn.disabled=false;
  if(gid!==gameId||state!=='revive')return;
  $('reviveOv').classList.remove('show');
  if(!ok){reviveResume=null;gameOver('ハートがなくなっちゃった');return;}
  revived=true;lives=1;graceUntil=performance.now()+1500;updateHud();
  toast('ハートが回復！','gold','ハート +1');chime([659,880,1175],.08,'sine',.1);
  const r=reviveResume;reviveResume=null;r();
};
$('reviveNo').onclick=()=>{$('reviveOv').classList.remove('show');reviveResume=null;gameOver('ハートがなくなっちゃった');};
let shake=0,winTimers=[];
function rankName(h,ym){if(ym)return ym>1?ym+'倍役満':'役満';if(h>=11)return'三倍満';if(h>=8)return'倍満';if(h>=6)return'跳満';if(h>=5)return'満貫';return'';}
function countUp(target){
  const el=$('ptsNum');if(!el)return;const t0=performance.now();
  const f=now=>{const k=Math.min(1,(now-t0)/800);el.textContent=Math.round(target*(1-Math.pow(1-k,3))).toLocaleString();
    if(k<1&&$('winOv').classList.contains('show'))requestAnimationFrame(f);};
  requestAnimationFrame(f);
}
function tsumo(){
  if(state!=='choose'||!best)return;
  const B=best;
  state='win';score+=B.points;wins++;streak++;maxStreak=Math.max(maxStreak,streak);
  if(!bestHand||B.points>bestHand.points)bestHand=B;
  B.newYaku=addCollection(B);
  updateHud();
  applyMusicVol(true);
  if(B.yakuman)playYakuman(()=>showWin(B));else showWin(B);
}
function showWin(B){
  const step=.38,start=1.0,tEnd=start+B.yaku.length*step,rank=B.kazoe?'数え役満':rankName(B.han,B.yakuman),ym=B.yakuman?' ym':'';
  $('winBox').innerHTML=`
    <div class="tsumoTxt${ym}">ツモ</div>
    <div class="wintiles">${B.groups.map(g=>`<div class="grp">${g.map(k=>timg(k)).join('')}</div>`).join('')}</div>
    <div class="yakulist">${B.yaku.map((y,i)=>`<div class="yk" style="--d:${(start+i*step).toFixed(2)}s"><span class="yn">${y.n}${(B.newYaku||[]).includes(y.n)?'<span class="new">初</span>':''}</span><span class="yh">${y.h?y.h+'翻':'役満'}</span>${yakuDesc(y.n)?`<span class="yd">${yakuDesc(y.n)}</span>`:''}</div>`).join('')}</div>
    ${rank?`<div class="rank${ym}" style="--d:${(tEnd+.1).toFixed(2)}s">${rank}</div>`:''}
    <div class="wpts" style="--d:${(tEnd+.35).toFixed(2)}s"><span id="ptsNum">0</span><small>点</small></div>
    <button class="btn primary wbtn" id="winBtn" style="--d:${(tEnd+.9).toFixed(2)}s;font-size:17px;padding:12px 26px">牌を消してつづける</button>`;
  $('winBtn').onclick=afterWin;
  const ov=$('winOv');ov.classList.add('show');ov.scrollTop=0;
  const fl=$('flash');fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go');
  shake=.6;
  winTimers.forEach(clearTimeout);winTimers=[];
  chime([130,196,262],.06,'sawtooth',.07);
  applyMusicVol(true);
  B.yaku.forEach((y,i)=>winTimers.push(setTimeout(()=>chime([587+i*98,880+i*98],.07,'triangle',.11),(start+i*step)*1000)));
  if(B.yakuman)winTimers.push(setTimeout(()=>{if(!playSE(2))chime([523,659,784,1047,1319,1568],.1,'triangle',.15);},(tEnd+.1)*1000));
  winTimers.push(setTimeout(()=>{if(!B.yakuman)chime([523,659,784,1047],.1,'triangle',.15);countUp(B.points);},(tEnd+.35)*1000));
  for(const t of tiles)burst(t.mesh.position,5);
}
function afterWin(){
  winTimers.forEach(clearTimeout);winTimers=[];
  $('winOv').classList.remove('show');
  const tier=tierNow(score);
  if(tier!==stage){
    stage=tier;
    const autoTrack=!(endless&&customTrack>=0),autoSky=!(endless&&customSky>=0);
    if(autoTrack)setTrack(tier);
    if(autoSky){
      const fl=$('flash');fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go');
      if(tier===2){setSky(2);toast('オーロラの空へ！','rainbow');}
      else if(tier===1){setSky(1);toast('星屑ランナー！','star',`${(Math.floor(score/12000)*12000).toLocaleString()}点突破`);}
      else{setSky(0);toast('夕暮れの空へ！','gold',`${(Math.floor(score/12000)*12000).toLocaleString()}点突破`);}
    }
    if(tier===2&&!debug&&unlockMB())setTimeout(()=>toast('ミュージックボックス解放！','rainbow','タイトル画面から聴けるよ'),autoSky?1900:0);
  }
  applyMusicVol(false);
  const need=Array(34).fill(0);best.tiles.forEach(k=>need[k]++);
  const cand=tiles.filter(t=>!t.removing).sort((a,b)=>b.body.position.y-a.body.position.y);
  const now=performance.now();
  for(const t of cand)if(need[t.kind]>0){need[t.kind]--;t.removing=true;t.removeStart=now;}
  best=null;graceUntil=now+4500;state='falling';fallT=-0.6;calmT=0;renderHand();renderCtrl();
}
/* 完走：山を使い切ったら +8,000点、牌が中心から爆発四散してから結果へ */
function finishRun(){
  if(state==='over'||state==='ending')return;
  const gid=gameId;let unl=false;
  if(!debug&&!endlessUnlocked()){try{localStorage.setItem(EKEY,'1');}catch(e){}unl=true;}
  const c=boardCounts();
  const pre=(state!=='win'&&c.reduce((a,b)=>a+b,0)>=14)?findBest(c,winKind()):null;
  state='ending';choices=[];graceUntil=Infinity;
  if(held){scene.remove(held.mesh);held=null;}beam.visible=false;mark.visible=false;renderCtrl();
  score+=8000;updateHud();
  toast('完走！','gold','完走ボーナス +8,000点');chime([523,659,784,1047,1319],.09,'triangle',.14);
  setTimeout(()=>{
    if(state!=='ending'||gid!==gameId)return;
    flashGo();shake=1.1;chime([196,147,110,82],.07,'sawtooth',.12);
    const cy=Math.max(.4,settledTop*.5);
    burst(new THREE.Vector3(0,cy,0),26);
    for(const t of tiles){
      if(t.removing)continue;const b=t.body;b.wakeUp();
      let dx=b.position.x,dz=b.position.z,len=Math.hypot(dx,dz);
      if(len<.25){const a=Math.random()*Math.PI*2;dx=Math.cos(a);dz=Math.sin(a);len=1;}
      const sp=6+Math.random()*5,up=6+Math.random()*5+Math.max(0,b.position.y-cy)*1.5;
      b.velocity.set(dx/len*sp,up,dz/len*sp);
      b.angularVelocity.set((Math.random()-.5)*16,(Math.random()-.5)*16,(Math.random()-.5)*16);
      burst(t.mesh.position,5);
    }
    for(const o of tiles)o.body.wakeUp();
  },900);
  setTimeout(()=>{if(state==='ending'&&gid===gameId)gameOver('山をすべて使い切ったよ（完走ボーナス 8,000点）'+(unl?'　∞ エンドレスモードが解放されたよ！':''),pre,true);},3300);
}
let overWait=false;
function gameOver(reason,pre,done){
  if(state==='over'||overWait===true)return;
  if(!overWait&&toastType==='fall'&&performance.now()<toastEndAt-400){
    // 落ちちゃった演出が終わるまで待ってから結果を出す
    overWait=true;state='ending';if(held){scene.remove(held.mesh);held=null;}beam.visible=false;mark.visible=false;renderCtrl();
    setTimeout(()=>{if(overWait){overWait='go';gameOver(reason);}},Math.max(0,toastEndAt-400-performance.now()));
    return;
  }
  overWait=false;
  $('reviveOv').classList.remove('show');reviveResume=null;
  let lastHand=pre===undefined?null:pre;
  if(pre===undefined&&state!=='win'){const c=boardCounts();if(c.reduce((a,b)=>a+b,0)>=14)lastHand=findBest(c,winKind());}
  document.querySelector('#overOv .gtitle').textContent=done?'完走！':'おしまい';
  if(lastHand){addCollection(lastHand);score+=lastHand.points;wins++;streak++;maxStreak=Math.max(maxStreak,streak);if(!bestHand||lastHand.points>bestHand.points)bestHand=lastHand;updateHud();}
  state='over';if(held){scene.remove(held.mesh);held=null;}beam.visible=false;mark.visible=false;
  let rec=0;const BK=endless?'ponpon-pai-best-endless':'ponpon-pai-best';try{rec=+localStorage.getItem(BK)||0;if(score>rec&&!debug)localStorage.setItem(BK,String(score));}catch(e){}
  if(score>=36000&&!debug)unlockMB();
  const place=debug?999:saveRecord();
  if(!debug&&window.GameCenter)GameCenter.submit(endless,score);
  $('overReason').textContent=reason+(lastHand?`（台に残った役 ${lastHand.points.toLocaleString()}点も加えたよ）`:'');
  $('overStats').innerHTML=`スコア <b>${score.toLocaleString()}</b> 点${score>rec&&score>0?` ${ic('party')}自己ベスト！`:''}<br>
    和了した回数 <b>${wins}</b> 回<br>連続和了 最高 <b>${maxStreak}</b> 回<br>いちばん高いタワー <b>${(maxHeight*2.6).toFixed(1)}</b> cm
    ${bestHand?`<br>最高の手 <b>${bestHand.yaku.filter(y=>y.n!=='門前清自摸和').map(y=>y.n).join('・')||'ツモのみ'}</b>`:''}
    ${rec&&score<=rec?`<br>自己ベスト ${rec.toLocaleString()} 点`:''}${place<=10?`<br>${ic('trophy')}ランキング <b>${place}</b> 位！`:''}${debug?`<br>${ic('tile')}役満モード！なので記録されません`:''}`;
  $('overOv').classList.add('show');chime([392,330,262],.18,'triangle',.12);
  if(Ads)Ads.showBanner();
}

/* ---------- パーティクル ---------- */
const partGeo=new THREE.OctahedronGeometry(.09);
const partMats=[0xffd166,0xff8fab,0x9be7c4,0xffffff].map(c=>new THREE.MeshBasicMaterial({color:c}));
function burst(p,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(partGeo,partMats[(Math.random()*4)|0]);m.position.copy(p);scene.add(m);
  parts.push({m,v:new THREE.Vector3((Math.random()-.5)*5,Math.random()*5+1.5,(Math.random()-.5)*5),life:1});}}

/* ---------- 入力 ---------- */
let worldPerPx=0.02;
cv.addEventListener('pointerdown',e=>{if(state!=='aim')return;ac();drag={x:e.clientX,y:e.clientY,id:e.pointerId};try{cv.setPointerCapture(e.pointerId);}catch(_){}});
cv.addEventListener('pointermove',e=>{if(!drag||!held||e.pointerId!==drag.id)return;
  held.x=Math.max(-4.4,Math.min(4.4,held.x+(e.clientX-drag.x)*worldPerPx));
  held.z=Math.max(-3.2,Math.min(3.2,held.z+(e.clientY-drag.y)*worldPerPx*1.5));
  drag.x=e.clientX;drag.y=e.clientY;});
const endDrag=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;drop();};
cv.addEventListener('pointerup',endDrag);
cv.addEventListener('pointercancel',()=>{drag=null;});
window.addEventListener('keydown',e=>{
  if(state!=='aim'||!held)return;const s=.25;
  if(e.key==='ArrowLeft')held.x=Math.max(-4.4,held.x-s);
  else if(e.key==='ArrowRight')held.x=Math.min(4.4,held.x+s);
  else if(e.key==='ArrowUp')held.z=Math.max(-3.2,held.z-s);
  else if(e.key==='ArrowDown')held.z=Math.min(3.2,held.z+s);
  else if(e.key==='r'||e.key==='R')turnHeld(held);
  else if(e.key==='s'||e.key==='S'){toggleStand(held);renderCtrl();}
  else if(e.key===' '||e.key==='Enter'){e.preventDefault();drop();}
  else return;e.preventDefault();
});
$('mute').onclick=()=>{muted=!muted;$('mute').innerHTML=ic(muted?'mute':'sound');ac();initBGM();applyMusicVol();};
$('music').onclick=()=>{musicOn=!musicOn;$('music').classList.toggle('off',!musicOn);ac();initBGM();applyMusicVol();};
$('startOv').addEventListener('click',()=>{ac();initBGM();});
let endless=false,lap=1;
function startGame(inf){endless=inf;ac();wantTrack=0;initBGM();prepYakuman();$('startOv').classList.remove('show');newGame();}
$('startBtn').onclick=()=>startGame(false);
$('endlessBtn').onclick=()=>{if(!endlessUnlocked()){toast('完走すると遊べるようになるよ');chime([440,330],.06,'triangle',.08);return;}startGame(true);};
// ゲームオーバーのあとに次へ進むとき、設定しだいで全画面広告をはさむ（最初は出さない設定）
let nextBusy=false;
async function afterOverAd(){
  if(nextBusy)return false;if(!Ads)return true;
  nextBusy=true;try{await Ads.maybeInterstitial();}finally{nextBusy=false;}return true;}
$('againBtn').onclick=async()=>{if(!await afterOverAd())return;ac();prepYakuman();stage=0;newGame();setSky(0);setTrack(0);initBGM();};
$('titleBtn').onclick=async()=>{if(!await afterOverAd())return;toTitle();};
function showRec(){try{const r=+localStorage.getItem('ponpon-pai-best')||0,e=+localStorage.getItem('ponpon-pai-best-endless')||0;
  $('startRec').textContent=[r?`自己ベスト ${r.toLocaleString()}点`:'',e?`エンドレス ${e.toLocaleString()}点`:''].filter(Boolean).join('　');}catch(e){}}
function demoStack(){
  [[4,-.8,0,.3],[21,.7,.1,-.4],[33,0,-.1,1.1]].forEach(([k,x,z,yaw],i)=>{
    const m=makeMesh(k);m.position.set(x,TH/2+(i===2?TH:0),z);m.rotation.y=yaw;scene.add(m);
    const b=new CANNON.Body({mass:1,material:matTile});b.addShape(new CANNON.Box(new CANNON.Vec3(TW/2,TH/2,TL/2)));
    b.position.set(m.position.x,m.position.y,m.position.z);b.quaternion.set(m.quaternion.x,m.quaternion.y,m.quaternion.z,m.quaternion.w);
    b.allowSleep=true;world.addBody(b);tiles.push({kind:k,body:b,mesh:m,removing:false});
  });
  settledTop=towerTop();
}
function fitTitle(){
  const o=$('startOv');if(!o||!o.classList.contains('show'))return;
  let u=80;o.style.setProperty('--u',u+'px');
  for(let i=0;i<5;i++){const over=o.scrollHeight-o.clientHeight;if(over<=0)break;u=Math.max(40,u-over/3.9-1);o.style.setProperty('--u',u.toFixed(1)+'px');if(u<=40)break;}
}
window.addEventListener('resize',()=>requestAnimationFrame(fitTitle));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>fitTitle());
function toTitle(){
  for(const t of tiles.slice())removeTile(t);
  if(held){scene.remove(held.mesh);held=null;}
  state='title';best=null;choices=[];score=0;lives=3;wall=[];
  $('overOv').classList.remove('show');$('winOv').classList.remove('show');$('reviveOv').classList.remove('show');reviveResume=null;
  if(Ads)Ads.showBanner();
  $('ctrl').innerHTML='';$('hand').innerHTML='';$('handlabel').textContent='';$('coach').hidden=true;coachNow=null;
  updateHud();demoStack();refreshTitle();stage=0;setSky(0);setTrack(0);
  const st=document.querySelector('.stack');st.replaceWith(st.cloneNode(true));
  $('startOv').classList.add('show');$('startOv').scrollTop=0;fitTitle();
}


/* ---------- カメラ ---------- */
let phCur=180;
function layout(){
  const w=app.clientWidth,h=app.clientHeight;renderer.setSize(w,h,false);makeSky(w,h);
  const ph=Math.min(h*.5,phCur);
  camera.aspect=w/(h+ph);camera.setViewOffset(w,h+ph,0,ph,w,h);camera.updateProjectionMatrix();
  return{w,h,ph};
}
function camDist(L){
  const vt=Math.tan(camera.fov*Math.PI/360);
  const hHalf=Math.atan(vt*camera.aspect);
  let d=Math.max(13,5.2/Math.tan(hHalf));
  const frac=(L.h-L.ph-60)/(L.h+L.ph);
  if(frac>0.1)d=Math.max(d,8/(frac*2*vt));
  return Math.min(d,40);
}
window.addEventListener('resize',layout);

/* ---------- ループ ---------- */
let last=performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(state!=='title')world.step(1/60,dt,4);

  for(const t of tiles.slice()){
    t.mesh.position.copy(t.body.position);t.mesh.quaternion.copy(t.body.quaternion);
    if(t.removing){
      const k=Math.max(0,1-(now-t.removeStart)/600);t.mesh.scale.setScalar(Math.max(.001,k));
      if(k===0){burst(t.mesh.position,6);removeTile(t);for(const o of tiles)o.body.wakeUp();}
    }else if(t.body.position.y<-7){
      removeTile(t);
      if(now>graceUntil&&state!=='over'&&lives>0){   // ハートが0のあとに落ちた牌では「落ちちゃった」を重ねない
        lives--;streak=0;updateHud();toast('落ちちゃった…','fall','ハート −1');chime([523,392],.12,'triangle',.12);
        if(lives<=0&&(state==='choose'||state==='aim'))heartsOut(()=>{renderHand();renderCtrl();});
        else if(lives<=0&&state!=='falling'&&state!=='win'&&state!=='revive')gameOver('ハートがなくなっちゃった');
      }
      if(state==='choose'||state==='aim'){best=null;renderHand();if(state==='choose')renderCtrl();}
    }
  }

  if(held){
    const half=heldHalfHeight(held),ty=settledTop+2.3+half;
    held.y=held.y==null?ty:held.y+(ty-held.y)*Math.min(1,dt*6);
    const f=Math.min(1,dt*14);held.cx+=(held.x-held.cx)*f;held.cz+=(held.z-held.cz)*f;
    held.mesh.position.set(held.cx,held.y+Math.sin(now/380)*.05,held.cz);
    held.mesh.quaternion.slerp(heldQuat(held),Math.min(1,dt*12));
    beam.visible=true;
    rayFrom.set(held.cx,held.y,held.cz);ray.set(rayFrom,DOWN);
    const hits=ray.intersectObjects([felt,...tiles.filter(t=>!t.removing).map(t=>t.mesh)],false);
    if(hits.length){
      const hy=hits[0].point.y;
      mark.visible=true;mark.position.set(held.cx,hy+.02,held.cz);
      {const A=tileAxes(held),idx=[0,1,2].sort((i,j)=>Math.abs(A[i].y)-Math.abs(A[j].y)),a0=A[idx[0]],a1=idx[1];
        mark.rotation.y=Math.atan2(-a0.z,a0.x);mark.scale.set(HALF[idx[0]]*2,1,HALF[a1]*2);}
      beam.scale.y=Math.max(.01,(held.y-hy)/40);beam.position.set(held.cx,(held.y+hy)/2,held.cz);
      beam.material.color.set(0xffffff);
    }else{
      mark.visible=false;beam.scale.y=1;beam.position.set(held.cx,held.y-20,held.cz);
      beam.material.color.set(0xff6b8b);
    }
  }else mark.visible=false;

  if(state==='falling'){
    fallT+=dt;let moving=false;
    for(const t of tiles){const b=t.body;if(b.sleepState===CANNON.Body.SLEEPING)continue;
      if(b.velocity.length()>.18||b.angularVelocity.length()>.35){moving=true;break;}}
    if(fallT>.7&&!moving)calmT+=dt;else calmT=0;
    if(calmT>.45||fallT>7)onSettled();
  }

  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.v.y-=9*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=dt*6;p.m.rotation.y+=dt*4;
    p.life-=dt*1.1;p.m.scale.setScalar(Math.max(.01,p.life));if(p.life<=0){scene.remove(p.m);parts.splice(i,1);}}
  for(const c of clouds){c.position.x+=c.userData.v*dt;if(c.position.x>40)c.position.x=-40;}
  cloudStep(dt);lightStep(dt);
  for(const is of islands)is.position.y=is.userData.base+Math.sin(now/1600+is.userData.ph)*.3;
  for(const r of rings)r.rotation.z+=r.userData.v*dt;
  crystal.rotation.y+=dt*.8;crystal.position.y=-6.8+Math.sin(now/900)*.25;
  sea.rotation.y+=dt*.006;
  if(rainbow){const h=(now/7000)%1;scene.fog.color.setHSL(h,.4,.7);
    crystal.material.emissive.setHSL((h+.2)%1,1,.55);rings.forEach((r,i)=>r.material.color.setHSL((h+i*.33)%1,.95,.65));}shake=Math.max(0,shake-dt*1.2);

  const sh=$('bottom').offsetHeight;phCur+=(sh-phCur)*Math.min(1,dt*6);
  const L=layout();
  const vt=Math.tan(camera.fov*Math.PI/360);
  camY+=(settledTop-camY)*Math.min(1,dt*1.8);
  const F=camFrame(L),d=F.d,ly=F.ly;
  worldPerPx=2*d*vt/(L.h+L.ph);
  camera.position.set(Math.sin(now/6000)*.5+(Math.random()-.5)*shake,ly+d*.62+(Math.random()-.5)*shake,d);
  camera.lookAt(0,ly,0);
  sun.position.set(.6,camY+20,.8);sun.target.position.set(0,camY,0);

  renderer.render(scene,camera);
}

/* ---------- 起動 ---------- */
async function boot(){
  try{
    if(document.fonts&&document.fonts.load)await Promise.race([
      Promise.all([document.fonts.load('900 60px "Noto Serif JP"','一二三四五六七八九萬東南西北發中'),document.fonts.load('700 16px "Zen Maru Gothic"'),document.fonts.load('32px "Yuji Syuku"','断么九役牌'),document.fonts.load('40px "Dela Gothic One"','ツモ満貫')]),
      new Promise(r=>setTimeout(r,2500))]);
  }catch(e){}
  buildFaces();
  demoStack();camY=settledTop;
  const sb=$('startBtn');sb.disabled=false;sb.textContent='あそぶ';$('endlessBtn').disabled=false;refreshTitle();fitTitle();setTimeout(fitTitle,300);
  if(Ads)Ads.showBanner();
  requestAnimationFrame(loop);
}

/* ---------- 空の切り替え（0:夕暮れ 1:星屑の夜 2:虹） ---------- */
let skyMode=0,streak=0,maxStreak=0;
const seaMat=sea.children[0].material;
/* 雲の量：夕暮れ 全部 → 星屑 半分 → 虹 ほぼなし（ふわっと縮んで消える） */
const seaIM=sea.children[0],seaBase=[];
{const m=new THREE.Matrix4();for(let i=0;i<seaIM.count;i++){seaIM.getMatrixAt(i,m);const p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();m.decompose(p,q,sc);seaBase.push({p,q,sc});}}
const seaS=seaBase.map(()=>1),seaT=seaBase.map(()=>1);
clouds.forEach(c=>{c.userData.s0=c.scale.x;c.userData.s=1;c.userData.t=1;});
const CLOUD_AMT=[1,.55,.3];
function setCloudAmount(f){
  seaT.forEach((_,i)=>seaT[i]=i<seaT.length*f?1:0);
  clouds.forEach((c,i)=>c.userData.t=i<Math.max(1,Math.round(clouds.length*f))?1:0);
}
const _m4=new THREE.Matrix4(),_sc=new THREE.Vector3();
function cloudStep(dt){
  const k=Math.min(1,dt*1.6);let dirty=false;
  for(let i=0;i<seaS.length;i++){
    if(Math.abs(seaS[i]-seaT[i])<.002){if(seaS[i]===seaT[i])continue;seaS[i]=seaT[i];}else seaS[i]+=(seaT[i]-seaS[i])*k;
    const b=seaBase[i],s=Math.max(.0001,seaS[i]);_sc.copy(b.sc).multiplyScalar(s);_m4.compose(b.p,b.q,_sc);seaIM.setMatrixAt(i,_m4);dirty=true;
  }
  if(dirty)seaIM.instanceMatrix.needsUpdate=true;
  for(const c of clouds){const u=c.userData,tt=cloudBlocks(c)?0:u.t;
    if(Math.abs(u.s-tt)<.002)u.s=tt;else u.s+=(tt-u.s)*k;
    c.visible=u.s>.01;c.scale.setScalar(u.s0*Math.max(.0001,u.s));}
}
/* 空ごとの光と雲の色（夕暮れ → 夜 → オーロラの夜）。切り替えはゆっくり */
const SKY_LOOK=[
  {hs:0xffe2ee,hg:0x3a2d6e,hi:.85,a:0xffffff,ai:.12,s:0xfff0dc,si:.85,r:0xff8fbd,ri:.6,cc:0xefb3cd,ce:0x44244f},
  {hs:0xffe2ee,hg:0x3a2d6e,hi:.85,a:0xffffff,ai:.12,s:0xfff0dc,si:.85,r:0xff8fbd,ri:.6,cc:0xefb3cd,ce:0x44244f},
  {hs:0xb8efe6,hg:0x2a1f5e,hi:.74,a:0xa0a8ff,ai:.12,s:0xe2e8ff,si:.66,r:0xa77dff,ri:.75,cc:0xa598dc,ce:0x241c58}];
const _lc=new THREE.Color();
function lightStep(dt){
  const L=SKY_LOOK[skyMode]||SKY_LOOK[0],k=Math.min(1,dt*1.2);
  const mix=(col,hex)=>col.lerp(_lc.set(hex),k);
  mix(hemi.color,L.hs);mix(hemi.groundColor,L.hg);hemi.intensity+=(L.hi-hemi.intensity)*k;
  mix(amb.color,L.a);amb.intensity+=(L.ai-amb.intensity)*k;
  mix(sun.color,L.s);sun.intensity+=(L.si-sun.intensity)*k;
  mix(rim.color,L.r);rim.intensity+=(L.ri-rim.intensity)*k;
  mix(cloudMat.color,L.cc);mix(cloudMat.emissive,L.ce);
}
// 夜の空では、台の真後ろや浮き島に重なる雲はそっと消す（通り過ぎたらまた出てくる）
function cloudBlocks(c){
  if(skyMode!==2)return false;
  const p=c.position;
  if(Math.abs(p.x)<10&&p.z>-26)return true;
  for(const is of islands)if(Math.hypot(p.x-is.position.x,p.z-is.position.z)<8&&Math.abs(p.y-is.position.y)<7)return true;
  return false;
}
function setSky(m){
  if(m===skyMode)return;skyMode=m;rainbow=(m===2);setCloudAmount(CLOUD_AMT[m]||1);
  $('nightfx').classList.toggle('on',m===1);$('skyfx').classList.toggle('on',m===2);
  if(m===0){
    skyKey='';makeSky(app.clientWidth,app.clientHeight);
    scene.fog.color.set(0xd97a9a);seaMat.color.set(0xe9a9c5);seaMat.emissive.set(0x55306a);
    crystal.material.emissive.set(0xff4f9a);rings.forEach(r=>r.material.color.set(r.userData.c));
  }else scene.background=null;
  if(m===1){
    makeNightStars();
    scene.fog.color.set(0x1d2356);seaMat.color.set(0x9aa6e6);seaMat.emissive.set(0x141a48);
    crystal.material.emissive.set(0x6f8cff);
    rings.forEach((r,i)=>r.material.color.set(i===1?0x9fd0ff:0xffe08a));
  }
  if(m===2){seaMat.color.set(0xb4a8e6);seaMat.emissive.set(0x2a2060);aurora.start();}
}
function setRainbow(on){setSky(on?2:0);}
/* ---------- オーロラ（虹の空） ---------- */
const aurora=(()=>{
  const cv=$('aurora'),g=cv.getContext('2d');let run=false,lastT=0;
  const RIB=[
    {c:[70,255,170],y:.60,a:.07,f:.9,sp:.22,h:.46,ph:0,al:.75},
    {c:[120,200,255],y:.50,a:.06,f:1.3,sp:-.18,h:.36,ph:2.1,al:.55},
    {c:[220,110,255],y:.42,a:.05,f:1.7,sp:.26,h:.28,ph:4.3,al:.5}];
  // 1本分の光のすじ（上は透明→色→下のふちがいちばん明るい）
  RIB.forEach(r=>{const st=document.createElement('canvas');st.width=1;st.height=128;const q=st.getContext('2d');
    const gr=q.createLinearGradient(0,0,0,128),[R,G,B]=r.c;
    gr.addColorStop(0,`rgba(${R},${G},${B},0)`);gr.addColorStop(.55,`rgba(${R},${G},${B},.35)`);
    gr.addColorStop(.9,`rgba(${R+(255-R)*.45|0},${G+(255-G)*.45|0},${B+(255-B)*.45|0},1)`);gr.addColorStop(1,`rgba(${R},${G},${B},0)`);
    q.fillStyle=gr;q.fillRect(0,0,1,128);r.st=st;});
  function frame(now){
    if(skyMode!==2||document.hidden){run=false;return;}
    requestAnimationFrame(frame);
    if(now-lastT<33)return;lastT=now;
    const W=Math.max(1,cv.clientWidth|0),H=Math.max(1,cv.clientHeight|0);
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
    g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';const t=now/1000,TAU=Math.PI*2;
    for(const r of RIB){
      for(let x=-3;x<W+3;x+=1.5){
        const nx=x/W;
        const y0=H*(r.y+r.a*Math.sin(nx*TAU*r.f+t*r.sp+r.ph)+.018*Math.sin(nx*9+t*.8+r.ph));
        const h=H*r.h*(.72+.28*Math.sin(nx*5.5+t*.45+r.ph*1.7));
        const edge=Math.max(0,Math.sin(Math.PI*Math.min(1,Math.max(0,nx))));
        const ray=.45+.55*Math.pow(.5+.5*Math.sin(nx*70-t*1.1+r.ph)*Math.sin(nx*23+t*.5),2);
        const al=r.al*Math.pow(edge,.6)*ray*(.7+.3*Math.sin(nx*4+t*.7+r.ph));
        if(al<=.01)continue;
        g.globalAlpha=Math.min(1,al*1.45);g.drawImage(r.st,0,0,1,128,x,y0-h,1.8,h);
      }
    }
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
  }
  return{start(){if(!run){run=true;lastT=0;requestAnimationFrame(frame);}}};
})();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&skyMode===2)aurora.start();});
let starsMade=false;
function makeNightStars(){
  if(starsMade)return;starsMade=true;
  const W=900,H=1600,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  // 天の川
  g.save();g.translate(W/2,H*.35);g.rotate(-.5);
  const mw=g.createLinearGradient(0,-160,0,160);mw.addColorStop(0,'rgba(160,170,255,0)');mw.addColorStop(.5,'rgba(190,190,255,.16)');mw.addColorStop(1,'rgba(160,170,255,0)');
  g.fillStyle=mw;g.fillRect(-W*1.2,-160,W*2.4,320);g.restore();
  for(let i=0;i<900;i++){
    const x=Math.random()*W,y=Math.pow(Math.random(),1.3)*H*.85,r=Math.random()<.06?1.6:Math.random()*.9+.3;
    g.fillStyle=`rgba(${230+Math.random()*25|0},${230+Math.random()*25|0},255,${(.35+Math.random()*.65).toFixed(2)})`;
    g.beginPath();g.arc(x,y,r,0,7);g.fill();
  }
  document.querySelector('#nightfx .stars').style.backgroundImage=`url(${c.toDataURL()})`;
}
function spawnMeteor(big){
  const fx=$(skyMode===2?'skyfx':'nightfx'),m=document.createElement('div');m.className='meteor'+(big?' big':'');
  m.style.left=(35+Math.random()*75)+'%';m.style.top=(Math.random()*40)+'%';
  m.innerHTML='<i></i>';fx.appendChild(m);m.addEventListener('animationend',()=>m.remove());
}
setInterval(()=>{if(skyMode<1||document.hidden)return;if(Math.random()<.6)spawnMeteor(Math.random()<.2);},1300);

/* ---------- ランキング ---------- */
const RKEY='tenraku-rank';
function loadRanks(m){try{return JSON.parse(localStorage.getItem(RKEY+((m===undefined?endless:m)?'-endless':''))||'[]');}catch(e){return[];}}
let lastRecId=null;
function saveRecord(){
  const r={s:score,h:+(maxHeight*2.6).toFixed(1),k:maxStreak,d:Date.now()};lastRecId=r.d;
  const list=loadRanks();list.push(r);list.sort((a,b)=>b.s-a.s||b.h-a.h);
  try{localStorage.setItem(RKEY+(endless?'-endless':''),JSON.stringify(list.slice(0,30)));}catch(e){}
  return list.findIndex(x=>x.d===r.d)+1;
}
let rankSort='s';
function renderRanks(){
  const list=loadRanks(rankMode).slice().sort((a,b)=>(b[rankSort]-a[rankSort])||(b.s-a.s)).slice(0,10);
  const md=[ic('medal1'),ic('medal2'),ic('medal3')];
  if(!list.length){$('rankList').innerHTML='<p class="hint" style="margin:24px 0">まだ記録がないよ。遊んでみよう！</p>';return;}
  const f=d=>{const x=new Date(d);return`${x.getMonth()+1}/${x.getDate()}`;};
  $('rankList').innerHTML=`<div class="tw"><table class="rtable"><thead><tr><th></th><th>点数</th><th>高さ</th><th>連続</th><th>日付</th></tr></thead><tbody>${
    list.map((r,i)=>`<tr class="${r.d===lastRecId?'me':''}"><td>${md[i]||i+1}</td>
      <td class="${rankSort==='s'?'hl':''}">${r.s.toLocaleString()}</td>
      <td class="${rankSort==='h'?'hl':''}">${r.h.toFixed(1)}cm</td>
      <td class="${rankSort==='k'?'hl':''}">${r.k}回</td><td>${f(r.d)}</td></tr>`).join('')}</tbody></table></div>`;
}
let rankMode=0;
document.querySelectorAll('#rankOv .tabs:not(.mtabs) button').forEach(b=>b.onclick=()=>{
  rankSort=b.dataset.k;document.querySelectorAll('#rankOv .tabs:not(.mtabs) button').forEach(x=>x.classList.toggle('on',x===b));renderRanks();});
document.querySelectorAll('#rankOv .mtabs button').forEach(b=>b.onclick=()=>{
  rankMode=+b.dataset.m;document.querySelectorAll('#rankOv .mtabs button').forEach(x=>x.classList.toggle('on',x===b));renderRanks();});
$('rankBtn').onclick=()=>{rankMode=endless?1:0;document.querySelectorAll('#rankOv .mtabs button').forEach(x=>x.classList.toggle('on',+x.dataset.m===rankMode));renderRanks();$('rankOv').classList.add('show');$('rankOv').scrollTop=0;};
$('rankClose').onclick=()=>$('rankOv').classList.remove('show');
// 世界ランキング（iPhoneアプリ版だけ。js/gamecenter.js）
if(window.GameCenter){
  $('gcBtn').hidden=false;$('rankNote').textContent='この一覧はこの端末の記録です';
  $('gcBtn').onclick=async()=>{if(!await GameCenter.show(rankMode===1))toast('Game Center にサインインすると見られるよ','info','設定アプリ → Game Center');};
}

/* ---------- ミュージックボックス ---------- */
const MBKEY='tenraku-musicbox';
// [曲名, 流れる場面, Apple Music の曲ID]（アルバム「転落牌 - Single」）
const TRACK_INFO=[['Sakura Drift','タイトル・0〜11,999点','6816609888'],['星屑ランナー','12,000〜35,999点','6816609889'],['Beyond the clouds','36,000点〜','6816609890']];
const AM_ALBUM='https://music.apple.com/jp/album/6816609887';
const ALLKEY='tenraku-all';
const EKEY='tenraku-endless';
function endlessUnlocked(){try{return localStorage.getItem(EKEY)==='1'||allUnlocked();}catch(e){return false;}}
function allUnlocked(){try{return localStorage.getItem(ALLKEY)==='1';}catch(e){return false;}}
function mbUnlocked(){try{return localStorage.getItem(MBKEY)==='1'||allUnlocked();}catch(e){return false;}}
function unlockMB(){if(mbUnlocked())return false;try{localStorage.setItem(MBKEY,'1');}catch(e){}return true;}
function refreshTitle(){showRec();{const eb=$('endlessBtn'),u=endlessUnlocked();eb.classList.toggle('locked',!u);eb.innerHTML=u?'∞ エンドレス<small>山がなくなっても続く</small>':ic('lock')+'エンドレス<small>完走すると解放</small>';}const b=$('mbBtn'),u=mbUnlocked();b.classList.toggle('locked',!u);b.innerHTML=(u?ic('music'):ic('lock'))+'ミュージックボックス';}
function stopMusic(){
  if(!mus||curTrack<0)return;const old=mus[curTrack],t=actx.currentTime;
  old.g.gain.cancelScheduledValues(t);old.g.gain.setTargetAtTime(0,t,.3);setTimeout(()=>{if(mus[curTrack]!==old)old.el.pause();},1500);
  curTrack=-1;
}
function renderMB(){
  $('mbList').innerHTML=TRACK_INFO.map(([t,s,am],i)=>{const on=curTrack===i;
    return`<div class="mb"><button class="pl" data-i="${i}" aria-label="${t}を${on?'停止':'再生'}">${on?'■':'▶'}</button>
      <div class="mbt"><div class="nm">${t}${on?'<span class="eq"><span></span><span></span><span></span></span>':''}</div><div class="sb">${s}</div></div>
      <a class="am" href="${AM_ALBUM}?i=${am}" target="_blank" rel="noopener" aria-label="${t}をApple Musicで聴く">♪ Apple Music</a></div>`;}).join('');
  $('mbList').querySelectorAll('.pl').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;ac();initBGM();
    if(curTrack===i)stopMusic();
    else{if(!musicOn){musicOn=true;$('music').classList.remove('off');}setTrack(i);}
    renderMB();});
}
$('mbBtn').onclick=()=>{
  if(!mbUnlocked()){toast('36,000点をこえると解放されるよ');return;}
  ac();initBGM();renderMB();$('mbOv').classList.add('show');$('mbOv').scrollTop=0;};
$('mbClose').onclick=()=>{$('mbOv').classList.remove('show');if(curTrack!==0)setTrack(0);};

/* ---------- カメラ：タワー全体が見えるように引く ---------- */
function camFrame(L){
  const vt=Math.tan(camera.fov*Math.PI/360),hHalf=Math.atan(vt*camera.aspect);
  let d=Math.max(13,5.2/Math.tan(hHalf));
  const frac=Math.max(.12,(L.h-L.ph-70)/(L.h+L.ph));
  const span=camY+5.5;
  d=Math.min(48,Math.max(d,span*.9/(frac*2*vt)));
  const vis=frac*2*d*vt*.9;
  const ly=Math.max((camY+2.4)/2,camY+3.4-vis/2);
  return{d,ly};
}

$('howBtn').onclick=()=>{$('howOv').classList.add('show');$('howOv').scrollTop=0;};
$('howClose').onclick=()=>$('howOv').classList.remove('show');

/* ---------- 役満演出（龍＋役満ロゴ＋SE） ---------- */
const ymSE=[null,null,null];let ymSELoading=false;
function prepYakuman(){
  document.querySelectorAll('#ymfx img').forEach(im=>{if(im.decode)im.decode().catch(()=>{});});
  if(actx&&!ymSELoading&&window.YM_SE){ymSELoading=true;
    window.YM_SE.forEach((url,i)=>{fetch(url).then(r=>r.arrayBuffer()).then(ab=>actx.decodeAudioData(ab,buf=>{ymSE[i]=buf;},()=>{})).catch(()=>{});});}
  const em=$('ymEmbers');
  if(!em.childElementCount){let h='';for(let i=0;i<44;i++){const sz=3+Math.random()*6;
    h+=`<span style="left:${(Math.random()*100).toFixed(1)}%;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px;--dx:${((Math.random()-.5)*160).toFixed(0)}px;animation-duration:${(2.4+Math.random()*2.6).toFixed(2)}s;animation-delay:${(-Math.random()*5).toFixed(2)}s"></span>`;}
    em.innerHTML=h;}
}
function playSE(i,vol=1){
  if(muted||!actx||!ymSE[i])return null;
  const s=actx.createBufferSource(),g=actx.createGain();s.buffer=ymSE[i];g.gain.value=vol;s.connect(g);g.connect(actx.destination);s.start();return{s,g};
}
function flashGo(){const fl=$('flash');fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go');}
function playYakuman(done){
  prepYakuman();
  const fx=$('ymfx'),timers=[],sounds=[];let finished=false;
  fx.classList.remove('show','p2','out');void fx.offsetWidth;fx.classList.add('show');
  const finish=skip=>{
    if(finished)return;finished=true;timers.forEach(clearTimeout);
    if(skip)sounds.forEach(x=>{if(x){const t=actx.currentTime;x.g.gain.setTargetAtTime(0,t,.08);}});
    fx.classList.add('out');setTimeout(()=>{fx.classList.remove('show','p2','out');done();},450);
  };
  sounds.push(playSE(0));flashGo();shake=.4;
  timers.push(setTimeout(()=>{fx.classList.add('p2');sounds.push(playSE(1));flashGo();shake=1;},2000));
  timers.push(setTimeout(()=>finish(false),6600));
  fx.onclick=()=>finish(true);
}

/* ---------- 役コレクション ---------- */
// 役の説明（和了画面と役コレクションで使う）。ex は作り方の例（牌の番号：0〜8 萬子、9〜17 筒子、18〜26 索子、27東 28南 29西 30北 31白 32發 33中）
const YAKU_INFO={
  '門前清自摸和':{d:'自分で積んだ牌で和了ると付く。このゲームではいつも付くよ',ex:[0,1,2,12,13,14,24,25,26,19,20,21,13,13]},
  '断么九':{d:'1・9・字牌を使わず、2〜8の牌だけで作る',ex:[1,2,3,4,5,6,11,12,13,23,24,25,10,10]},
  '平和':{d:'4組とも順子（連番）で、雀頭は役牌以外。最後の1枚が両面待ちで入ったときだけ',ex:[0,1,2,3,4,5,15,16,17,20,21,22,26,26]},
  '一盃口':{d:'同じ順子を2組そろえる（例：二三四萬を2つ）',ex:[1,1,2,2,3,3,13,14,15,24,25,26,27,27]},
  '役牌 白':{d:'白を3枚そろえる',ex:[31,31,31,0,1,2,12,13,14,24,25,26,4,4]},
  '役牌 發':{d:'發を3枚そろえる',ex:[32,32,32,0,1,2,12,13,14,24,25,26,4,4]},
  '役牌 中':{d:'中を3枚そろえる',ex:[33,33,33,0,1,2,12,13,14,24,25,26,4,4]},
  '役牌 東':{d:'東を3枚そろえる',ex:[27,27,27,0,1,2,12,13,14,24,25,26,4,4]},
  '三色同順':{d:'萬子・筒子・索子で、同じ数の順子をそろえる（例：三四五を3色）',ex:[2,3,4,11,12,13,20,21,22,6,7,8,19,19]},
  '一気通貫':{d:'同じ色で一二三・四五六・七八九をそろえる',ex:[9,10,11,12,13,14,15,16,17,19,20,21,4,4]},
  '三暗刻':{d:'同じ牌3枚の組を3つ作る',ex:[1,1,1,13,13,13,25,25,25,20,21,22,0,0]},
  '小三元':{d:'白・發・中のうち2つを3枚ずつ、残り1つを雀頭にする',ex:[31,31,31,32,32,32,33,33,0,1,2,21,22,23]},
  '七対子':{d:'同じ牌2枚の組を7つ作る（特別な形）',ex:[0,0,2,2,13,13,15,15,26,26,27,27,31,31]},
  '混老頭':{d:'1・9・字牌だけで作る',ex:[0,0,8,8,9,9,17,17,18,18,27,27,31,31]},
  '混全帯么九':{d:'どの組にも1か9か字牌が入るように作る（字牌あり）',ex:[0,1,2,15,16,17,18,19,20,26,26,26,27,27]},
  '混一色':{d:'1つの色と字牌だけで作る',ex:[0,1,2,3,4,5,6,7,8,27,27,27,31,31]},
  '純全帯么九':{d:'どの組にも1か9が入るように作る（字牌なし）',ex:[0,1,2,6,7,8,9,10,11,26,26,26,9,9]},
  '二盃口':{d:'一盃口を2つ作る',ex:[1,1,2,2,3,3,13,13,14,14,15,15,26,26]},
  '清一色':{d:'1つの色だけで作る（字牌も使わない）',ex:[0,1,2,2,3,4,4,5,6,6,7,8,1,1]},
  '大三元':{d:'白・發・中をすべて3枚ずつそろえる',ex:[31,31,31,32,32,32,33,33,33,0,1,2,4,4]},
  '四暗刻':{d:'同じ牌3枚の組を4つ作る',ex:[1,1,1,13,13,13,25,25,25,27,27,27,4,4]},
  '字一色':{d:'字牌だけで作る',ex:[27,27,27,28,28,28,29,29,29,31,31,31,33,33]},
  '国士無双':{d:'1・9・字牌の13種類を1枚ずつ＋どれか1枚',ex:[0,8,9,17,18,26,27,28,29,30,31,32,33,33]},
  '緑一色':{d:'二三四六八索と發だけで作る（緑の牌だけ）',ex:[19,20,21,19,20,21,23,23,23,25,25,25,32,32]},
  '清老頭':{d:'1と9の牌だけで作る',ex:[0,0,0,8,8,8,9,9,9,17,17,17,26,26]},
  '小四喜':{d:'東南西北のうち3つを3枚ずつ、残り1つを雀頭にする',ex:[27,27,27,28,28,28,29,29,29,30,30,0,1,2]},
  '大四喜':{d:'東南西北をすべて3枚ずつそろえる',ex:[27,27,27,28,28,28,29,29,29,30,30,30,4,4]},
  '九蓮宝燈':{d:'1つの色で 一一一二三四五六七八九九九 ＋どれか1枚',ex:[0,0,0,1,2,3,4,5,6,7,8,8,8,4]},
  '数え役満':{d:'役の翻数を合わせて13翻以上になると役満あつかい',ex:null},
};
const yakuDesc=n=>(YAKU_INFO[n]||{}).d||'';
const YAKU_LIST=[['門前清自摸和',1],['断么九',1],['平和',1],['一盃口',1],['役牌 白',1],['役牌 發',1],['役牌 中',1],['役牌 東',1],
  ['三色同順',2],['一気通貫',2],['三暗刻',2],['小三元',2],['七対子',2],['混老頭',2],['混全帯么九',2],
  ['混一色',3],['純全帯么九',3],['二盃口',3],['清一色',6],['大三元',0],['四暗刻',0],['字一色',0],['国士無双',0],['緑一色',0],['清老頭',0],['小四喜',0],['大四喜',0],['九蓮宝燈',0],['数え役満',0]];
const CKEY='tenraku-yaku';
function loadCol(){try{return JSON.parse(localStorage.getItem(CKEY)||'{}');}catch(e){return{};}}
function addCollection(B){
  if(debug||!B)return[];
  const c=loadCol(),nw=[];
  B.yaku.map(y=>y.n).concat(B.kazoe?['数え役満']:[]).forEach(n=>{if(!c[n])nw.push(n);c[n]=(c[n]||0)+1;});
  try{localStorage.setItem(CKEY,JSON.stringify(c));}catch(e){}
  return nw;
}
function renderCol(){
  const c=loadCol();let got=0,total=0;
  $('colList').innerHTML=YAKU_LIST.map(([n,h])=>{
    const k=c[n]||0;total+=k;if(k)got++;
    const hs=h?h+'翻':'役満';
    const open=k||allUnlocked();
    return`<button class="ci${h?'':' ym'}${open?'':' lock'}" data-n="${n}"><div class="n">${n}</div><div class="m"><span>${hs}</span><span>${open?`<b>${k}</b> 回`:'まだ'}</span></div></button>`;
  }).join('');
  $('colProg').textContent=`${got} / ${YAKU_LIST.length} 種類　のべ ${total} 回`;
  $('colList').querySelectorAll('.ci').forEach(b=>b.onclick=()=>showYakuInfo(b.dataset.n));
}
// 牌の例を面子ごとに分ける（組み立てがわかるように）
function exGroups(ex){const c=Array(34).fill(0);ex.forEach(k=>c[k]++);const B=findBest(c,null);return B?B.groups:[ex];}
// 役をタップしたとき：上の枠に作り方と牌の例を出す
function showYakuInfo(n){
  const I=YAKU_INFO[n],box=$('colInfo');if(!I)return;
  const h=(YAKU_LIST.find(y=>y[0]===n)||[])[1];
  box.innerHTML=`<div class="cin"><b>${n}</b><span>${h?h+'翻':'役満'}</span></div><p>${I.d}</p>`+
    (I.ex?`<div class="cex">${exGroups(I.ex).map(g=>`<span>${g.map(k=>timg(k)).join('')}</span>`).join('')}</div>`:'');
  box.classList.add('on');
  document.querySelectorAll('#colList .ci').forEach(b=>b.classList.toggle('sel',b.dataset.n===n));
  box.scrollIntoView({block:'nearest',behavior:'smooth'});
}
$('colBtn').onclick=()=>{renderCol();$('colOv').classList.add('show');$('colOv').scrollTop=0;};
$('colClose').onclick=()=>$('colOv').classList.remove('show');

/* ---------- 役満モード！（転→落→牌 を5回） ---------- */
// App Store に出す版（本物の広告の版）では使えない：審査の「隠し機能」に当たらないように
const STORE_BUILD=!!(window.ADS_CONFIG&&window.ADS_CONFIG.production);
let debug=false,dbgSeq=0,revSeq=0,dbl=false,dblSeq=0,boom=false,boomSeq=0,boomAt=false;
function badgeText(){return boom?ic('boom')+'爆発テストモード':dbl?ic('tile')+'ダブル役満モード！':ic('tile')+'役満モード！';}
const REV_ORDER=['c','b','a'];
const DBG_ORDER=['a','b','c'];
$('startOv').addEventListener('click',e=>{
  if(STORE_BUILD)return;
  const t=e.target.closest('.ht');if(!t)return;
  const k=t.classList.contains('a')?'a':t.classList.contains('b')?'b':'c';
  t.animate([{filter:'brightness(1.3)'},{filter:'none'}],{duration:250});
  if(k===DBG_ORDER[dbgSeq%3])dbgSeq++;else dbgSeq=(k==='a')?1:0;
  if(k===REV_ORDER[revSeq%3])revSeq++;else revSeq=(k==='c')?1:0;
  if(revSeq>=15){
    revSeq=0;dbgSeq=0;const on=!allUnlocked();
    try{if(on)localStorage.setItem(ALLKEY,'1');else localStorage.removeItem(ALLKEY);}catch(e){}
    refreshTitle();toast(on?'エンドレス・ミュージックボックス・役コレクションを全解放！':'全解放 OFF');
    chime(on?[523,784,1047,1568]:[1047,523],.08,'square',.06);return;
  }
  if(debug&&dbgSeq<15){
    if(k==='b'){dblSeq++;
      if(dblSeq>=3){dblSeq=0;dbgSeq=0;dbl=!dbl;$('dbgBadge').innerHTML=badgeText();
        toast(dbl?'ダブル役満モード！ ON':'ダブル役満モード！ OFF');chime(dbl?[660,880,1320,1760]:[1320,880],.08,'square',.06);return;}
    }else dblSeq=0;
    if(k==='c'){boomSeq++;
      if(boomSeq>=3){boomSeq=0;dbgSeq=0;boom=!boom;$('dbgBadge').innerHTML=badgeText();
        toast(boom?'爆発テストモード ON':'爆発テストモード OFF');chime(boom?[330,220,165,110]:[440,660],.08,'sawtooth',.06);return;}
    }else boomSeq=0;
  }
  if(dbgSeq>=15){
    dbgSeq=0;dblSeq=0;debug=!debug;$('dbgBadge').hidden=!debug;if(!debug){dbl=false;boom=false;}$('dbgBadge').innerHTML=badgeText();
    toast(debug?'役満モード！ ON':'役満モード！ OFF');chime(debug?[660,880,1320]:[880,660],.08,'square',.06);
  }
});
function addTileAt(k,x,y,z){
  const m=makeMesh(k);m.position.set(x,y,z);scene.add(m);
  const b=new CANNON.Body({mass:1,material:matTile});b.addShape(new CANNON.Box(new CANNON.Vec3(TW/2,TH/2,TL/2)));
  b.position.set(x,y,z);b.linearDamping=.05;b.angularDamping=.15;b.allowSleep=true;b.sleepSpeedLimit=.1;b.sleepTimeLimit=.5;
  b.addEventListener('collide',e=>{const v=Math.abs(e.contact.getImpactVelocityAlongNormal());if(v>1.2)clack(Math.min(1,v/8));});
  world.addBody(b);tiles.push({kind:k,body:b,mesh:m,removing:false});
}
function boomSetup(){
  // 5×3の格子で3段、上2段は真ん中3列、さらに中央に4段の柱 → 67枚
  const spots=[];for(const z of[-1.45,0,1.45])for(const x of[-2.4,-1.2,0,1.2,2.4])spots.push([x,z]);
  let top=0;
  for(let l=0;l<5;l++)for(const [x,z] of spots){if(l>=3&&Math.abs(x)>1.3)continue;const y=TH/2+.01+l*(TH+.004);addTileAt(wall.pop(),x,y,z);top=Math.max(top,y+TH/2);}
  for(let l=5;l<9;l++){const y=TH/2+.01+l*(TH+.004);addTileAt(wall.pop(),0,y,0);top=Math.max(top,y+TH/2);}
  wall=[];choices=[];settledTop=top;graceUntil=Infinity;boomAt=true;
  setTimeout(()=>toast('爆発テスト！ まもなく完走'),300);
}
function debugSetup(){
  if(boom){boomSetup();return;}
  // 通常：白白白 發發發 中中 一二三萬 五五筒 → 中を落とせば大三元
  // ダブル：白白白 發發發 中中 二二二萬 五五筒 → 中を落とせば大三元＋四暗刻
  const kinds=dbl?[31,31,31,32,32,32,33,33,1,1,1,13,13]:[31,31,31,32,32,32,33,33,0,1,2,13,13];
  const spots=[];for(const z of[-1.45,0,1.45])for(const x of[-2.4,-1.2,0,1.2,2.4])if(!(x===0&&z===0))spots.push([x,z]);
  kinds.forEach((k,i)=>{
    const [x,z]=spots[i];const m=makeMesh(k);m.position.set(x,TH/2+.01,z);scene.add(m);
    const b=new CANNON.Body({mass:1,material:matTile});b.addShape(new CANNON.Box(new CANNON.Vec3(TW/2,TH/2,TL/2)));
    b.position.set(x,TH/2+.01,z);b.linearDamping=.05;b.angularDamping=.15;b.allowSleep=true;b.sleepSpeedLimit=.1;b.sleepTimeLimit=.5;
    b.addEventListener('collide',e=>{const v=Math.abs(e.contact.getImpactVelocityAlongNormal());if(v>1.2)clack(Math.min(1,v/8));});
    world.addBody(b);tiles.push({kind:k,body:b,mesh:m,removing:false});
  });
  const used=kinds.concat([33,33]);
  for(const k of used){const i=wall.indexOf(k);if(i>=0)wall.splice(i,1);}
  choices=[33,33];settledTop=TH;
  setTimeout(()=>toast(dbl?'ダブル役満！ 中を落とすと大三元・四暗刻':'役満モード！ 中を落とすと大三元'),400);
}

$('quitBtn').onclick=()=>{
  if(!['choose','aim','falling'].includes(state))return;
  drag=null;
  $('quitTitle').textContent=endless?'ひと休み':'ゲームをやめる？';$('customBox').hidden=!endless;renderCustom();
  $('quitYes').textContent=endless?'ゲームをやめる':'やめる';
  $('quitNote').textContent=debug?'役満モード！なので記録は残りません':'ここまでの点数はランキングに記録されるよ';
  $('quitOv').classList.add('show');
};
$('quitNo').onclick=()=>$('quitOv').classList.remove('show');
$('quitYes').onclick=()=>{$('quitOv').classList.remove('show');gameOver('途中でやめたよ');};
boot();
})();
