import * as THREE from './vendor/three.module.js';
import {CHAPTERS,PORTFOLIO,STORY_PREVIEWS,CONVERSATIONS} from './portfolio.js';

const sentences=CHAPTERS[1].text.match(/[^.!?]+[.!?]+/g).map(line=>line.trim());
export const STUDY_SLIDES=[
  {title:'Projects & Experience',subtitle:'Rabin Adhikari',caption:sentences.slice(0,2).join(' '),page:'projects'},
  {title:'From building to leading',subtitle:'Experience & healthcare',caption:sentences[2],page:'experience'},
  {title:'Across the stack',subtitle:'Applications · Cloud · Data',caption:sentences[3],page:'skills'}
];
export const DESKTOP_PROJECTS=['healthcare','ai','softlearn'];
const names={healthcare:'Healthcare',ai:'AI Applications',softlearn:'SoftLearn'},green='#173b32',gold='#d9bd80',cream='#f4f1e6',ink='#193c32';
const plain=html=>html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim();
const blocks=id=>[...PORTFOLIO[id].body.matchAll(/<(p|h3)[^>]*>([\s\S]*?)<\/\1>/g)].map(match=>({heading:match[1]==='h3',text:plain(match[2])}));
export function desktopPage(id){
  const section=PORTFOLIO[id];if(section)return {id,title:id==='projects'?'Projects & Experience':section.title,caption:STORY_PREVIEWS[id]??STORY_PREVIEWS.experience,detail:!['projects','experience','skills'].includes(id),blocks:blocks(id)};
  const question=CONVERSATIONS.experience.find((_,i)=>id==='question-'+i);
  return question?{id,title:question.question,caption:question.answer,detail:true,blocks:[{heading:false,text:question.answer}]}:null;
}
function textLines(c,text,x,y,width,{size=26,line=34,color=ink,weight=400}={}){
  c.fillStyle=color;c.font=`${weight} ${size}px Arial, sans-serif`;c.textAlign='left';let row='';
  for(const word of text.split(/\s+/)){
    const next=row?row+' '+word:word;
    if(row&&c.measureText(next).width>width){c.fillText(row,x,y);y+=line;row=word;}else row=next;
  }
  if(row){c.fillText(row,x,y);y+=line;}return y;
}
function lineCount(c,text,width,size){
  c.font=`400 ${size}px Arial, sans-serif`;let rows=1,row='';for(const word of text.split(/\s+/)){const next=row?row+' '+word:word;if(row&&c.measureText(next).width>width){rows++;row=word;}else row=next;}return rows;
}
function navIcon(c,id,x,y){
  c.save();c.translate(x,y);c.strokeStyle=cream;c.lineWidth=2;c.beginPath();
  if(id==='projects'){c.moveTo(-12,-7);c.lineTo(-12,-13);c.lineTo(-2,-13);c.lineTo(2,-7);c.lineTo(13,-7);c.lineTo(13,12);c.lineTo(-12,12);c.closePath();}
  else if(id==='experience'){c.arc(0,-8,5,0,Math.PI*2);c.moveTo(-11,13);c.quadraticCurveTo(-11,1,0,1);c.quadraticCurveTo(11,1,11,13);c.closePath();}
  else if(id==='skills'){for(const [i,h] of [12,20,28].entries())c.rect(-12+i*9,14-h,6,h);}
  else{c.arc(0,0,13,0,Math.PI*2);c.moveTo(0,-4);c.lineTo(0,8);c.moveTo(1,-8);c.arc(0,-8,1,0,Math.PI*2);}
  c.stroke();c.restore();
}
function card(c,x,y,w,h){c.fillStyle='#fbf9f0';c.strokeStyle='#dfdccd';c.lineWidth=2;c.beginPath();c.roundRect(x,y,w,h,12);c.fill();c.stroke();}
function icon(c,id,x,y){
  c.save();c.translate(x,y);c.strokeStyle=green;c.lineWidth=3;c.beginPath();
  if(id==='healthcare'){c.moveTo(-15,-15);c.lineTo(-15,0);c.quadraticCurveTo(0,24,15,0);c.lineTo(15,-15);c.moveTo(0,14);c.lineTo(0,27);c.quadraticCurveTo(29,36,29,12);c.moveTo(34,8);c.arc(29,8,5,0,Math.PI*2);}
  else if(id==='ai'){c.moveTo(-22,-10);c.lineTo(-9,-24);c.lineTo(10,-20);c.lineTo(24,-2);c.lineTo(19,21);c.lineTo(-9,24);c.closePath();for(const [a,b] of [[-8,-10],[9,0],[-5,13]]){c.moveTo(a+4,b);c.arc(a,b,4,0,Math.PI*2);}}
  else{c.moveTo(-23,-17);c.quadraticCurveTo(-7,-24,0,-12);c.quadraticCurveTo(9,-24,23,-17);c.lineTo(23,22);c.quadraticCurveTo(8,15,0,23);c.quadraticCurveTo(-9,15,-23,22);c.closePath();c.moveTo(0,-12);c.lineTo(0,23);}
  c.stroke();c.restore();
}
function workflow(c,id,x,y,w){
  card(c,x,y,w,190);c.fillStyle=green;c.font='600 24px Arial, sans-serif';c.textAlign='left';c.fillText(id==='healthcare'?'Team delivery':id==='ai'?'Data workflow':'Learning platform',x+18,y+32);
  const labels=id==='healthcare'?['Requirements','Review','Delivery']:id==='ai'?['Collect','Process','Score']:['Student','Teacher','Company'];
  labels.forEach((label,i)=>{const yy=y+64+i*38;c.fillStyle=i===1?'#e9e4d2':'#d9e7de';c.beginPath();c.roundRect(x+18,yy,w-36,30,6);c.fill();c.fillStyle=ink;c.font='400 20px Arial, sans-serif';c.fillText(label,x+30,yy+22);});
}

// The desktop uses the existing monitor and one reusable, unlit canvas texture.
export function createStudyDesktop(monitor){
  const screen=monitor.userData.parts.screen,canvas=typeof document==='undefined'?null:document.createElement('canvas');
  // The furniture bevels use tiled UVs; the desktop needs the full front face.
  const geometry=screen.geometry.clone(),positions=geometry.attributes.position,uvs=new Float32Array(positions.count*2);geometry.computeBoundingBox();
  const bounds=geometry.boundingBox,size=bounds.getSize(new THREE.Vector3());
  for(let i=0;i<positions.count;i++){uvs[i*2]=(positions.getX(i)-bounds.min.x)/size.x;uvs[i*2+1]=(positions.getY(i)-bounds.min.y)/size.y;}
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  if(canvas){canvas.width=1536;canvas.height=864;}
  const c=canvas?.getContext?.('2d')??null,texture=c?new THREE.CanvasTexture(canvas):null;
  if(texture){texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.anisotropy=4;}
  const material=new THREE.MeshBasicMaterial({map:texture,color:texture?0xffffff:cream,toneMapped:false});
  let page=desktopPage('projects'),hits=[],active=false,current=null;
  function begin(){
    const saved={position:monitor.position.clone(),quaternion:monitor.quaternion.clone(),scale:monitor.scale.clone(),visible:monitor.visible,material:screen.material,geometry:screen.geometry};let restored=false;
    monitor.quaternion.identity();monitor.visible=true;monitor.updateMatrixWorld(true);
    const size=new THREE.Box3().setFromObject(screen).getSize(new THREE.Vector3());monitor.scale.x*=3.8/size.x;monitor.scale.y*=(3.8*9/16)/size.y;monitor.updateMatrixWorld(true);
    screen.geometry.computeBoundingBox();const bottom=screen.localToWorld(new THREE.Vector3(0,screen.geometry.boundingBox.min.y,0));monitor.position.y+=1.32-bottom.y;
    screen.material=material;screen.geometry=geometry;monitor.updateMatrixWorld(true);active=true;current=null;
    return ()=>{if(restored)return;restored=true;monitor.position.copy(saved.position);monitor.quaternion.copy(saved.quaternion);monitor.scale.copy(saved.scale);monitor.visible=saved.visible;screen.material=saved.material;screen.geometry=saved.geometry;monitor.updateMatrixWorld(true);active=false;};
  }
  function button(id,label,x,y,w,h=52){
    hits.push({id,x,y,w,h});if(!c)return;c.fillStyle=green;c.beginPath();c.roundRect(x,y,w,h,14);c.fill();c.fillStyle=cream;c.font='400 24px Arial, sans-serif';c.textAlign='left';c.fillText(label,x+18,y+h/2+8);c.fillText('→',x+w-37,y+h/2+8);
  }
  function draw(id){
    const next=desktopPage(id);if(!next)return false;page=next;if(current===id)return true;current=id;hits=[];
    if(c){
      c.clearRect(0,0,1536,864);c.fillStyle=cream;c.fillRect(0,0,1536,864);c.fillStyle='#192522';c.fillRect(0,0,1536,40);
      ['#ef6c67','#edc65b','#77bf76'].forEach((color,i)=>{c.fillStyle=color;c.beginPath();c.arc(22+i*22,20,6,0,Math.PI*2);c.fill();});
      c.fillStyle=green;c.fillRect(0,40,226,824);c.fillStyle=gold;c.font='500 27px Arial, sans-serif';c.textAlign='left';c.fillText('Rabin Adhikari',22,100);
    }
    const activeTab=page.id==='about'?'about':page.id.startsWith('question-')?'experience':page.detail?'projects':page.id;
    for(const [i,[tab,label]] of [['projects','Projects'],['experience','Experience'],['skills','Skills'],['about','About']].entries()){
      const y=151+i*88;hits.push({id:tab,x:10,y:y-40,w:206,h:68});if(c){if(activeTab===tab){c.fillStyle='#315146';c.fillRect(0,y-40,226,68);}navIcon(c,tab,34,y-8);c.fillStyle=cream;c.font='400 26px Arial, sans-serif';c.textAlign='left';c.fillText(label,65,y+3);}
    }
    if(c){
      c.strokeStyle=gold+'66';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(1180+i*25,40);c.bezierCurveTo(1280,100+i*22,1330,145+i*17,1536,170+i*18);c.stroke();}
      c.fillStyle=ink;c.textAlign='left';let size=58;do{c.font=`400 ${size}px Georgia, serif`;if(c.measureText(page.title).width<1200)break;size-=2;}while(size>36);c.fillText(page.title,268,133);c.font='400 27px Arial, sans-serif';c.fillStyle='#647369';c.fillText('Rabin Adhikari',270,175);
    }
    if(id==='projects'){
      for(const [i,key] of DESKTOP_PROJECTS.entries()){
        const x=260+i*419;if(c){card(c,x,218,401,584);c.fillStyle='#f0e5c6';c.beginPath();c.roundRect(x+20,240,65,65,12);c.fill();icon(c,key,x+52,271);c.fillStyle=ink;c.font='600 31px Arial, sans-serif';c.textAlign='left';c.fillText(names[key],x+103,282);
          const title={healthcare:'Medical research data',ai:'Web crawling & AI scoring',softlearn:'Student · Teacher · Company'}[key];textLines(c,title,x+20,348,355,{size:26,line:32,weight:500});
          const summary={healthcare:'Application development, reviews, customer communication and coordinating delivery.',ai:'Collect web content, process usable data and integrate AI into the scoring workflow.',softlearn:'A personal learning platform built with Django, React, Vite and PostgreSQL.'}[key];textLines(c,summary,x+20,416,355,{size:24,line:31});workflow(c,key,x+20,535,361);
        }
        button(key,'View project',x+20,746,235);
      }
    }else if(id==='experience'){
      const entries=blocks(id);let yy=218;for(let i=0;i<entries.length;i+=2){const height=66+(c?lineCount(c,entries[i+1].text,1180,23):2)*28;if(c){card(c,262,yy,1238,height);textLines(c,entries[i].text,284,yy+32,1180,{size:28,line:34,weight:600});textLines(c,entries[i+1].text,284,yy+67,1180,{size:23,line:28});}yy+=height+10;}
      button('question-0','PERSOL role',278,796,245);button('question-1','Healthcare role',542,796,280);
    }else if(id==='skills'){
      const entries=blocks(id);for(let i=0;i<8;i+=2){const x=262+(i/2%2)*629,y=232+Math.floor(i/4)*221;if(c){card(c,x,y,605,204);textLines(c,entries[i].text,x+23,y+41,560,{size:32,line:39,weight:600});textLines(c,entries[i+1].text,x+23,y+97,560,{size:28,line:37});}}
      if(c)textLines(c,entries[9].text,280,735,1160,{size:26,line:34});
    }else{
      if(c){let y=236;for(const entry of page.blocks){y=textLines(c,entry.text,280,y,1180,{size:entry.heading?29:27,line:entry.heading?37:34,weight:entry.heading?600:400});y+=entry.heading?4:20;if(y>738)break;}}
      button('projects','Back to projects',280,781,295);
    }
    if(texture)texture.needsUpdate=true;return true;
  }
  function hit(uv){const x=uv.x*1536,y=(1-uv.y)*864;return hits.find(box=>x>=box.x&&x<=box.x+box.w&&y>=box.y&&y<=box.y+box.h)?.id??null;}
  return {root:monitor,screen,texture,begin,showSlide:slide=>draw(slide.page),showPage:draw,hit,get page(){return page;},get active(){return active;},get hotspots(){return hits;}};
}
