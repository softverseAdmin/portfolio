import * as THREE from './vendor/three.module.js';

const green='#173b32',cream='#f1eedc',gold='#d9be81';
function spacedText(context,text,x,y,spacing=7){
  const width=[...text].reduce((sum,char)=>sum+context.measureText(char).width+spacing,0)-spacing;
  let cursor=x-width/2;for(const char of text){context.fillText(char,cursor,y);cursor+=context.measureText(char).width+spacing;}
}
function mountain(c,x,y){c.beginPath();c.moveTo(x-42,y+25);c.lineTo(x-7,y-22);c.lineTo(x+5,y-6);c.lineTo(x+20,y-29);c.lineTo(x+50,y+25);c.closePath();c.stroke();c.beginPath();c.moveTo(x-7,y-22);c.lineTo(x-18,y+4);c.lineTo(x-3,y-5);c.lineTo(x+9,y+12);c.moveTo(x+20,y-29);c.lineTo(x+11,y-8);c.lineTo(x+25,y+1);c.stroke();}
function torii(c,x,y){c.beginPath();c.moveTo(x-44,y-26);c.quadraticCurveTo(x,y-13,x+44,y-26);c.moveTo(x-36,y-14);c.lineTo(x+36,y-14);c.moveTo(x-24,y-22);c.lineTo(x-28,y+32);c.moveTo(x+24,y-22);c.lineTo(x+28,y+32);c.moveTo(x-32,y+2);c.lineTo(x+32,y+2);c.stroke();}
function icon(c,id,x,y){
  c.save();c.translate(x,y);c.beginPath();
  if(id==='Build'){c.rect(-35,-24,70,44);c.moveTo(-45,30);c.lineTo(45,30);c.moveTo(-12,-8);c.lineTo(-21,0);c.lineTo(-12,8);c.moveTo(12,-8);c.lineTo(21,0);c.lineTo(12,8);c.moveTo(5,-12);c.lineTo(-5,12);}
  else if(id==='Solve'){c.arc(0,-7,24,Math.PI*.8,Math.PI*2.2);c.lineTo(12,26);c.lineTo(-12,26);c.closePath();c.moveTo(-12,35);c.lineTo(12,35);for(let i=0;i<7;i++){const a=i*Math.PI/4;c.moveTo(Math.cos(a)*34,Math.sin(a)*34-7);c.lineTo(Math.cos(a)*44,Math.sin(a)*44-7);}}
  else{for(const [px,py] of [[-25,1],[0,-13],[25,1]]){c.moveTo(px+10,py-11);c.arc(px,py-11,10,0,Math.PI*2);c.moveTo(px-15,py+28);c.lineTo(px-15,py+12);c.quadraticCurveTo(px,py-3,px+15,py+12);c.lineTo(px+15,py+28);}}
  c.stroke();c.restore();
}
function journey(c,y){
  c.strokeStyle=gold;c.lineWidth=4;mountain(c,380,y);torii(c,1160,y);
  c.fillStyle=cream;c.font='400 42px Arial, sans-serif';c.textAlign='left';c.fillText('Nepal',452,y+12);c.fillText('Japan',980,y+12);
  c.beginPath();c.moveTo(665,y);c.lineTo(878,y);c.lineTo(861,y-12);c.moveTo(878,y);c.lineTo(861,y+12);c.stroke();
}
function pillars(c,y){
  c.strokeStyle=gold;c.lineWidth=4;c.textAlign='center';
  ['Build','Solve','Share'].forEach((name,i)=>{const x=430+i*338;icon(c,name,x,y);c.fillStyle=cream;c.font='400 34px Arial, sans-serif';c.fillText(name,x,y+88);if(i<2){c.strokeStyle=gold+'66';c.beginPath();c.moveTo(x+169,y-42);c.lineTo(x+169,y+90);c.stroke();c.strokeStyle=gold;}});
}

// One reusable unlit texture keeps slide text clear without extra scene lighting.
export function createProjector(){
  const root=new THREE.Group();root.name='living-room-projector';root.position.set(-7,3,.22);root.visible=false;
  const canvas=typeof document==='undefined'?null:document.createElement('canvas');
  if(canvas){canvas.width=1536;canvas.height=864;}
  const context=canvas?.getContext?.('2d')??null,texture=context?new THREE.CanvasTexture(canvas):null;
  if(texture){texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.anisotropy=4;}
  const screenMaterial=new THREE.MeshBasicMaterial({map:texture,color:texture?0xffffff:green,toneMapped:false});
  const dark=new THREE.MeshStandardMaterial({color:'#1f2724',roughness:.7}),housing=new THREE.MeshStandardMaterial({color:'#c8c7b9',roughness:.65});
  const box=(w,h,d,x,y,z,material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);root.add(mesh);return mesh;};
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(5.8,3.2625),screenMaterial);screen.position.z=.055;screen.name='story-projector-screen';root.add(screen);
  box(6.04,.09,.12,0,1.7,0,dark);box(6.04,.09,.12,0,-1.7,0,dark);for(const x of [-2.98,2.98])box(.1,3.45,.12,x,0,0,dark);
  box(.68,.22,.4,0,1.32,3.2,housing);box(.12,.12,.06,-.2,1.32,2.97,dark);box(.09,.16,.09,0,1.51,3.2,housing);
  let current=null;
  function showSlide(slide){
    if(current===slide)return;current=slide;if(!context)return;
    const c=context;c.clearRect(0,0,1536,864);c.fillStyle=green;c.fillRect(0,0,1536,864);
    c.strokeStyle=gold+'55';c.lineWidth=2;for(const [x,y] of [[-50,-90],[1600,940]])for(const r of [150,190,230,270]){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
    c.fillStyle=gold;c.font='500 28px Arial, sans-serif';c.textAlign='left';spacedText(c,slide.eyebrow,768,141);
    c.fillStyle=cream;c.textAlign='center';let size=112;do{c.font=`400 ${size}px Georgia, serif`;if(c.measureText(slide.title).width<=1380)break;size-=4;}while(size>60);c.fillText(slide.title,768,278);
    c.font='400 40px Arial, sans-serif';c.fillText(slide.subtitle,768,354);
    if(slide.visual==='intro'){journey(c,473);pillars(c,636);}
    else if(slide.visual==='journey'){journey(c,530);c.font='400 34px Arial, sans-serif';c.fillStyle=gold;c.textAlign='center';c.fillText('Life in Japan · Connections across teams',768,718);}
    else if(slide.visual==='work')pillars(c,562);
    else{
      c.textAlign='center';['Experience','Projects','Technology'].forEach((name,i)=>{const x=422+i*344;c.strokeStyle=gold+'88';c.lineWidth=2;c.strokeRect(x-146,493,292,178);c.fillStyle=gold;c.font='400 28px Arial, sans-serif';c.fillText(`0${i+1}`,x,549);c.fillStyle=cream;c.font='400 34px Arial, sans-serif';c.fillText(name,x,620);});
    }
    texture.needsUpdate=true;
  }
  return {root,screen,texture,showSlide};
}
