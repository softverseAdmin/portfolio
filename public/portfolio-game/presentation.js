import * as THREE from './vendor/three.module.js';
import {CHAPTERS} from './portfolio.js';
import {chairPose,chairContact} from './poses.js';
import {floorAt} from './core.js';
import {actionPosition} from './transitions.js';
import {cameraFraction} from './camera.js';

const introduction=CHAPTERS[0].text.match(/[^.!?]+[.!?]+/g).map(line=>line.trim());
export const INTRO_SLIDES=[
  {eyebrow:'MEET YOUR HOST',title:'Rabin Adhikari',subtitle:'Software Engineer & Project Lead',caption:introduction[0],visual:'intro'},
  {eyebrow:'JAPAN & NEPAL',title:'From Nepal to Tokyo',subtitle:'Around ten years in Japan',caption:introduction[1],visual:'journey'},
  {eyebrow:'PEOPLE & PRODUCTS',title:'Build. Solve. Share.',subtitle:'Useful products, clear communication',caption:introduction[2],visual:'work'},
  {eyebrow:'WELCOME TO MY WORLD',title:'A story in every room',subtitle:'Experience · Projects · Technology',caption:'Make yourself at home. Let’s explore my experience, projects, and the technology behind them.',visual:'rooms'}
];

export function subtitleCues(text){
  const words=[...text.matchAll(/\S+/g)],cues=[];let start=0;
  const append=end=>cues.push({text:text.slice(words[start].index,words[end].index+words[end][0].length),start:words[start].index,words:end-start+1});
  for(let i=0;i<words.length;i++){
    if(i>start&&(i-start>=14||words[i].index+words[i][0].length-words[start].index>94)){append(i-1);start=i;}
    if(i===words.length-1||/[.!?]$/.test(words[i][0])){append(i);start=i+1;}
  }
  return cues;
}
export function subtitleAt(cues,seconds=0,charIndex=null){
  if(!cues.length)return '';
  if(charIndex!==null){for(let i=cues.length-1;i>=0;i--)if(cues[i].start<=charIndex)return cues[i].text;return cues[0].text;}
  let at=0;
  for(const cue of cues){at+=cue.words/2.1;if(seconds<at)return cue.text;}
  return cues.at(-1).text;
}

// Silent visits advance at a comfortable reading pace; narration can finish its sentence.
export function createIntroStory(options={}){return createPresentationStory({...options,slides:INTRO_SLIDES});}

export function createPresentationStory({slides=INTRO_SLIDES,seatingDuration=1.2,onSlide=()=>{},onEnd=()=>{}}={}){
  let index=0,time=0,slideTime=0,phase='seating',paused=false,narrating=false,narrationEnded=false,holding=false;
  function show(){holding=false;slideTime=0;narrating=false;narrationEnded=false;onSlide(slides[index],index);}
  function finish(reason){if(phase==='ended')return false;phase='ended';onEnd(reason);return true;}
  function next(){
    if(phase!=='presenting')return false;
    if(index===slides.length-1)return finish('completed');
    index++;show();return true;
  }
  return {
    get index(){return index;},get count(){return slides.length;},get slide(){return slides[index];},get phase(){return phase;},
    get time(){return time;},get paused(){return paused;},
    get seatingProgress(){return seatingDuration===0?1:Math.min(1,time/seatingDuration);},
    tick(dt){
      if(paused||phase==='ended'||!Number.isFinite(dt)||dt<0)return;
      time+=dt;
      if(phase==='seating'){if(time>=seatingDuration){phase='presenting';show();}return;}
      slideTime+=dt;if(holding)return;
      const readingTime=Math.max(7,this.slide.caption.split(/\s+/).length/2.1+1.5);
      if(narrationEnded||(!narrating&&slideTime>=readingTime)||slideTime>=45)next();
    },
    next,exit:()=>finish('exit'),
    goTo(value){if(phase!=='presenting'||!Number.isInteger(value)||value<0||value>=slides.length)return false;index=value;show();return true;},
    holdReading(value=true){holding=!!value;},
    togglePause(){if(phase!=='ended')paused=!paused;return paused;},
    setNarrating(value){narrating=!!value;narrationEnded=false;},
    finishNarration(){narrationEnded=true;}
  };
}

// Stage the existing lounge chairs only for the story, then put everything back.
export function createStoryStage({world,physics,host,player}){
  const seats=['seat--10.3','seat--3.6'].map(id=>world.seats.find(seat=>seat.id===id)),center=world.projector.root.position;
  const positions=[new THREE.Vector3(center.x-2.45,.13,center.z+3.65),new THREE.Vector3(center.x+2.45,.13,center.z+4.45)];
  const door=world.doors.find(door=>door.id==='living'),savedDoor=door?{open:door.open,angle:door.group.rotation.y}:null;
  // The open door swings across the projector from an over-shoulder view.
  // Close it for the story and restore its exact state when the visitor leaves.
  if(door){door.open=false;door.group.rotation.y=0;physics.syncColliders();}
  const restoreDoor=()=>{if(door){door.open=savedDoor.open;door.group.rotation.y=savedDoor.angle;physics.syncColliders();}};
  const stage=stageCharacters({world,physics,host,player,seats,positions,headings:[Math.atan2(4.9,.8),Math.atan2(-2.45,-4.45)],focus:world.projector.screen.getWorldPosition(new THREE.Vector3())});
  if(!stage){restoreDoor();return null;}
  const restore=stage.restore;stage.restore=()=>{restore();restoreDoor();};return stage;
}

export function createStudyStage({world,physics,host,player}){
  if(!world.study)return null;
  const restoreDesktop=world.study.desktop.begin();
  const seats=['study-seat','seat--3.6'].map(id=>world.seats.find(seat=>seat.id===id));
  const positions=[new THREE.Vector3(-8.65,.13,-3.9),new THREE.Vector3(-4.6,.13,-3.1)];
  const stage=stageCharacters({world,physics,host,player,seats,positions,headings:[Math.atan2(4.05,.8),Math.atan2(-2.4,-2.94)],focus:world.study.desktop.screen.getWorldPosition(new THREE.Vector3())});
  if(!stage){restoreDesktop();physics.syncColliders();return null;}
  const restore=stage.restore;stage.restore=()=>{restore();restoreDesktop();physics.syncColliders();};return stage;
}

function stageCharacters({world,physics,host,player,seats,positions,headings,focus}){
  if(seats.some(seat=>!seat))return null;
  const toys=seats.map(seat=>physics.toys.find(toy=>toy.id===seat.toy?.id));
  if(toys.some(toy=>toy?.broken||toy?.held))return null;
  const actors=[host,player];
  const savedSeats=seats.map((seat,i)=>({position:seat.mesh.position.clone(),quaternion:seat.mesh.quaternion.clone(),visible:seat.mesh.visible,occupied:!!toys[i]?.occupied,velocity:toys[i]?.body.velocity.clone(),angularVelocity:toys[i]?.body.angularVelocity.clone(),sleeping:toys[i]?.body.sleepState===2}));
  const savedActors=actors.map(actor=>({position:actor.position.clone(),rotation:actor.rotation.clone(),scale:actor.scale.clone(),visible:actor.visible,pose:actor.userData.rig?.idle.map(({bone})=>({position:bone.position.clone(),quaternion:bone.quaternion.clone()}))}));
  let restored=false,animated=false;
  function restore(){
    if(restored)return;restored=true;
    seats.forEach((seat,i)=>{
      const saved=savedSeats[i],toy=toys[i];seat.mesh.position.copy(saved.position);seat.mesh.quaternion.copy(saved.quaternion);seat.mesh.visible=saved.visible;seat.mesh.updateMatrixWorld(true);
      physics.occupy(toy,saved.occupied);
      if(toy){toy.body.velocity.copy(saved.velocity);toy.body.angularVelocity.copy(saved.angularVelocity);if(saved.sleeping)toy.body.sleep();}
    });
    actors.forEach((actor,i)=>{
      // Preserve the yaw used by walking. Quaternion restoration can express a
      // half-turn as X/Z flips, which reverses subsequent Y-only steering.
      const saved=savedActors[i],rig=actor.userData.rig;actor.position.copy(saved.position);actor.rotation.copy(saved.rotation);actor.scale.copy(saved.scale);actor.visible=saved.visible;
      if(saved.pose&&animated){
        rig.idle.forEach(({bone},index)=>{bone.position.copy(saved.pose[index].position);bone.quaternion.copy(saved.pose[index].quaternion);});
        rig.motion.basePose=saved.pose;rig.motion.blendedPose=saved.pose;rig.motion.from=saved.pose;rig.motion.id=null;rig.motion.lastTime=null;
      }
      actor.updateMatrixWorld(true);
    });
    physics.syncColliders();
  }
  seats.forEach((seat,i)=>{
    seat.mesh.position.copy(positions[i]);seat.mesh.position.y=floorAt(positions[i].x,positions[i].z,.13);
    const other=positions[1-i];seat.mesh.rotation.set(0,headings?.[i]??Math.atan2(other.x-positions[i].x,other.z-positions[i].z),0);seat.mesh.visible=true;seat.mesh.updateMatrixWorld(true);physics.occupy(toys[i],true);
  });
  physics.syncColliders();
  const starts=seats.map((seat,i)=>chairContact(actors[i],seat,world.blockers.filter(box=>!box.host)));
  if(starts.some(point=>!point)){restore();return null;}
  actors.forEach((actor,i)=>{actor.position.copy(starts[i]);actor.rotation.y=seats[i].mesh.rotation.y+seats[i].heading;actor.visible=true;actor.scale.y=1;});
  function pose(i,progress){
    animated=true;
    const actor=actors[i],contact=chairPose(actor,seats[i]);
    // The game's optional procedural characters have their hips at 0.79 metres.
    if(!actor.userData.rig)contact.root=contact.hip.clone().sub(new THREE.Vector3(0,.79,0));
    const position=actionPosition({type:'sit',from:starts[i],contact:starts[i],to:contact.root},progress);actor.position.set(position.x,position.y,position.z);
    return {action:progress<1?{type:'sit',progress}:undefined,seatHipTarget:contact.hip,seatFootTargets:contact.feet,seatBlend:THREE.MathUtils.smoothstep(progress,.45,1),seatFootBlend:THREE.MathUtils.smoothstep(progress,.25,.5),lookTarget:progress===1?(i===0?positions[1].clone().add(new THREE.Vector3(0,1.15,0)):focus):null};
  }
  return {restore,pose,actors,seats};
}

export function presentationCamera(aspect,blockers=[]){
  // The loaded house's inner front wall is at z=8.62; stay inside it.
  const desired=new THREE.Vector3(-3.45,1.6,8.1),target=new THREE.Vector3(-7,2.05,.65);
  const position=target.clone().lerp(desired,cameraFraction(target,desired,blockers,{radius:.2}));
  const height=Math.max(6.4,12.5/Math.max(.8,aspect));
  return {position,target,fov:THREE.MathUtils.radToDeg(2*Math.atan(height/(2*position.distanceTo(target))))};
}

export function studyCamera(aspect,blockers=[],detail=false){
  const desired=detail?new THREE.Vector3(-3.65,1.85,-1.4):new THREE.Vector3(-3.35,1.7,-.65);
  const target=new THREE.Vector3(-7,detail?2.25:1.75,-5.8);
  const position=target.clone().lerp(desired,cameraFraction(target,desired,blockers,{radius:.2}));
  const height=detail?Math.max(3.1,5.9/Math.max(.8,aspect)):Math.max(4.5,7.3/Math.max(.8,aspect));
  return {position,target,fov:THREE.MathUtils.radToDeg(2*Math.atan(height/(2*position.distanceTo(target))))};
}
