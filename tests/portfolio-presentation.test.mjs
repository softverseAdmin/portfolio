import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {FBXLoader} from '../public/portfolio-game/vendor/addons/loaders/FBXLoader.js';
import {prepareCharacterAsset,createRiggedCharacter,animateRiggedCharacter} from '../public/portfolio-game/characters.js';
import {CHAPTERS,floorAt} from '../public/portfolio-game/core.js';
import {INTRO_SLIDES,createIntroStory,createStoryStage,presentationCamera} from '../public/portfolio-game/presentation.js';
import {createWorld,createCharacter} from '../public/portfolio-game/world.js';
import {createSandboxPhysics} from '../public/portfolio-game/physics.js';
import {animateSeatedTalk} from '../public/portfolio-game/motions.js';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

test('the presentation keeps every sentence from the existing introduction',()=>{
  assert.equal(INTRO_SLIDES.slice(0,3).map(slide=>slide.caption).join(' '),CHAPTERS[0].text);
});

test('Pause stops seating, subtitles and autoplay; Next still selects a slide while paused',()=>{
  const slides=[],ends=[],story=createIntroStory({onSlide:(_,index)=>slides.push(index),onEnd:reason=>ends.push(reason)});
  story.tick(.4);story.togglePause();story.tick(20);assert.ok(Math.abs(story.seatingProgress-1/3)<1e-10);assert.deepEqual(slides,[]);
  story.togglePause();story.tick(.8);assert.deepEqual(slides,[0]);story.togglePause();const time=story.time;
  story.tick(100);assert.equal(story.time,time);assert.equal(story.index,0);
  story.next();assert.equal(story.index,1);assert.equal(story.paused,true);story.tick(100);assert.equal(story.index,1);
  story.togglePause();for(let i=0;i<3000;i++)story.tick(1/60);
  assert.equal(story.phase,'ended');assert.deepEqual(ends,['completed']);story.next();story.exit();assert.deepEqual(ends,['completed']);
});

test('audible narration finishes its sentence and cannot advance during Pause',()=>{
  let story;story=createIntroStory({onSlide:()=>story.setNarrating(true)});story.tick(1.2);
  story.tick(20);assert.equal(story.index,0);story.togglePause();story.finishNarration();story.tick(20);assert.equal(story.index,0);
  story.togglePause();story.tick(.01);assert.equal(story.index,1);
});

test('a stalled browser voice falls back to the next slide instead of trapping the visit',()=>{
  let story;story=createIntroStory({onSlide:()=>story.setNarrating(true)});story.tick(1.2);story.tick(45);assert.equal(story.index,1);
  story.exit();assert.equal(story.phase,'ended');story.tick(100);assert.equal(story.index,1);
});

function stageFixture(){
  const world=createWorld(),physics=createSandboxPhysics(world),host=createCharacter({host:true}),player=createCharacter();
  host.position.set(-4,.13,4);player.position.set(-4,.13,6);host.rotation.y=.4;player.rotation.y=2;
  return {world,physics,host,player};
}

test('both existing armchairs and actors return to their previous positions and physics state',()=>{
  const f=stageFixture(),chairs=f.world.seats.filter(seat=>['seat--10.3','seat--3.6'].includes(seat.id));
  const original=chairs.map(seat=>({position:seat.mesh.position.clone(),quaternion:seat.mesh.quaternion.clone()})),actors=[f.host,f.player].map(actor=>({position:actor.position.clone(),quaternion:actor.quaternion.clone()}));
  const toy=f.physics.toys.find(toy=>toy.id===chairs[0].toy.id);toy.body.velocity.set(.3,0,.2);
  const stage=createStoryStage(f);assert.ok(stage);assert.equal(toy.occupied,true);
  for(let i=0;i<=60;i++){stage.pose(0,i/60);stage.pose(1,i/60);}
  assert.ok(f.host.position.distanceTo(f.player.position)>4);assert.notDeepEqual(f.host.position,actors[0].position);
  assert.ok(chairs[0].mesh.position.distanceTo(original[0].position)>.5);
  stage.restore();stage.restore();
  chairs.forEach((seat,i)=>{assert.deepEqual(seat.mesh.position,original[i].position);assert.deepEqual(seat.mesh.quaternion.toArray(),original[i].quaternion.toArray());});
  [f.host,f.player].forEach((actor,i)=>{assert.deepEqual(actor.position,actors[i].position);assert.deepEqual(actor.quaternion.toArray(),actors[i].quaternion.toArray());});
  assert.equal(toy.occupied,false);assert.equal(toy.body.velocity.x,.3);assert.equal(toy.body.velocity.z,.2);
});

test('a blocked lounge cannot leave chairs staged or actors trapped',()=>{
  const f=stageFixture(),positions=f.world.seats.map(seat=>seat.mesh.position.clone()),host=f.host.position.clone(),player=f.player.position.clone();
  f.world.blockers.push({minX:-12,maxX:-2,minZ:1,maxZ:8,minY:0,maxY:3});
  assert.equal(createStoryStage(f),null);
  f.world.seats.forEach((seat,i)=>assert.deepEqual(seat.mesh.position,positions[i]));assert.deepEqual(f.host.position,host);assert.deepEqual(f.player.position,player);
  assert.ok(f.physics.toys.filter(toy=>toy.kind==='furniture').every(toy=>!toy.occupied));
});

test('the screen and both faces stay within the presentation camera on desktop and landscape phones',()=>{
  const f=stageFixture(),stage=createStoryStage(f);stage.pose(0,1);stage.pose(1,1);f.world.root.updateMatrixWorld(true);
  for(const aspect of [4/3,16/9,844/390,2.4]){
    const view=presentationCamera(aspect),camera=new THREE.PerspectiveCamera(view.fov,aspect,.1,160);camera.position.copy(view.position);camera.lookAt(view.target);camera.updateMatrixWorld(true);
    const corners=[[-2.9,-1.63125],[2.9,-1.63125],[-2.9,1.63125],[2.9,1.63125]].map(([x,y])=>f.world.projector.screen.localToWorld(new THREE.Vector3(x,y,0)));
    const faces=[f.host,f.player].map(actor=>actor.position.clone().add(new THREE.Vector3(0,1.73,0)));
    for(const point of [...corners,...faces]){const projected=point.project(camera);assert.ok(Math.abs(projected.x)<1&&Math.abs(projected.y)<1&&projected.z>-1&&projected.z<1,`aspect ${aspect} crops the screen or a face`);}
  }
  stage.restore();
});

test('the projector title is visible in front of the original wall art and room furniture',()=>{
  const f=stageFixture(),stage=createStoryStage(f);stage.pose(0,1);stage.pose(1,1);f.world.projector.root.visible=true;f.world.roof.forEach(mesh=>mesh.visible=false);f.world.root.updateMatrixWorld(true);
  const view=presentationCamera(16/9),point=f.world.projector.screen.localToWorld(new THREE.Vector3(0,.65,0)),ray=new THREE.Raycaster(view.position,point.clone().sub(view.position).normalize());
  const visible=ray.intersectObject(f.world.root,true).filter(hit=>{for(let node=hit.object;node;node=node.parent)if(!node.visible)return false;return true;});
  assert.ok(visible[0]?.object===f.world.projector.screen);assert.equal(f.world.projector.screen.material.toneMapped,false);stage.restore();
});

test('seated talking reuses the talk clip without applying its standing hips or legs',()=>{
  const hips=new THREE.Bone(),arm=new THREE.Bone(),leg=new THREE.Bone();hips.name='mixamorigHips';arm.name='mixamorigRightArm';leg.name='mixamorigRightUpLeg';
  const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),.8).toArray(),track=name=>new THREE.QuaternionKeyframeTrack(name+'.quaternion',[0,1],[...q,...q]);
  const clip=new THREE.AnimationClip('original talk',1,[track(hips.name),track(arm.name),track(leg.name)]),character=new THREE.Group();
  character.userData.rig={asset:{motions:{clips:new Map([['talk',clip]])}},motion:{},idle:[hips,arm,leg].map(bone=>({bone}))};
  assert.equal(animateSeatedTalk(character,.5),true);assert.ok(arm.quaternion.angleTo(new THREE.Quaternion())>.5);assert.deepEqual(hips.quaternion.toArray(),[0,0,0,1]);assert.deepEqual(leg.quaternion.toArray(),[0,0,0,1]);
});

test('the supplied Mixamo sit and talk clips keep hips and feet planted, then restore the previous bone pose',()=>{
  const folder=new URL('../public/portfolio-game/assets/characters/',import.meta.url),bytes=readFileSync(new URL('shaking-hands.fbx',folder));
  const asset=prepareCharacterAsset(new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')),catalog=JSON.parse(readFileSync(new URL('animation-catalog.json',folder)));
  asset.motions={catalog,clips:new Map(['idle','sit','sit-idle','talk'].map(id=>{const entry=catalog.clips.find(clip=>clip.id===id);return [id,THREE.AnimationClip.parse(JSON.parse(readFileSync(new URL(entry.src,folder))))];}))};
  const world=createWorld(),physics=createSandboxPhysics(world),host=createRiggedCharacter(asset,{host:true}),player=createRiggedCharacter(asset);
  host.position.set(-4,.13,4);player.position.set(-4,.13,6.8);animateRiggedCharacter(host,0);animateRiggedCharacter(player,0);
  const original=[host,player].map(actor=>actor.userData.rig.idle.map(({bone})=>({position:bone.position.toArray(),quaternion:bone.quaternion.toArray()}))),stage=createStoryStage({world,physics,host,player});assert.ok(stage);
  for(let frame=0;frame<=180;frame++){
    const time=frame/60,p=Math.min(1,time/1.2);
    for(const [i,actor] of [host,player].entries()){
      const pose=stage.pose(i,p);if(i===0&&p===1)pose.talking=true;animateRiggedCharacter(actor,time,0,false,true,pose);
      if(p===1){actor.updateMatrixWorld(true);const bones=actor.userData.rig.bones;assert.ok(bones.Hips.getWorldPosition(new THREE.Vector3()).distanceTo(pose.seatHipTarget)<.001);for(const [j,side] of ['Right','Left'].entries())assert.ok(bones[side+'Foot'].getWorldPosition(new THREE.Vector3()).distanceTo(pose.seatFootTargets[j])<.025);}
    }
  }
  assert.equal(host.userData.rig.motion.id,'sit-idle');assert.ok(host.userData.rig.motion.seatedTalk.tracks.length>20,'the supplied hand and upper-body tracks are reused');
  stage.restore();[host,player].forEach((actor,i)=>actor.userData.rig.idle.forEach(({bone},index)=>{assert.deepEqual(bone.position.toArray(),original[i][index].position);assert.deepEqual(bone.quaternion.toArray(),original[i][index].quaternion);}));
});

const saved={version:1,welcomed:true,checkpoint:0,settings:{}};
async function livingFixture(t){
  const f=await controllerFixture(t,saved);f.api.beginVisit();f.api.hideDialogue();f.api.placeVisitor({x:-4,y:.13,z:6.8});f.host.position.set(-4,.13,4);f.api.state.hostReturnRoute=[];
  f.doc.getElementById('brand-room').textContent='The living room';return f;
}
const button=(f,id)=>f.doc.getElementById(id);

test('the first guided chapter seats both characters, locks movement, and Exit restores exploration',async t=>{
  const f=await livingFixture(t),before=f.api.visitorPosition(),host=f.host.position.clone(),camera=f.api.cameraPosition();f.api.state.guide=true;f.api.state.chapter=0;f.api.state.guideWaiting=true;f.api.advanceFrame(1/60);
  assert.ok(f.api.state.presentation);assert.equal(button(f,'presentation').hidden,false);assert.equal(button(f,'hud').hidden,true);assert.equal(f.world.projector.root.visible,true);
  for(let i=0;i<90;i++)f.api.advanceFrame(1/60);const sitting=f.api.visitorPosition();f.keydown('KeyW');assert.equal(f.api.movePlayer(1),0);assert.equal(f.api.moveHost(1),0);assert.deepEqual(f.api.visitorPosition(),sitting);
  f.keydown('KeyJ');assert.equal(f.api.state.punch,null);button(f,'story-exit').onclick();
  assert.equal(f.api.state.presentation,null);assert.equal(f.api.state.sitting,false);assert.equal(f.api.state.guide,false);assert.equal(button(f,'presentation').hidden,true);assert.equal(button(f,'hud').hidden,false);assert.equal(f.world.projector.root.visible,false);
  assert.deepEqual(f.api.visitorPosition(),before);assert.deepEqual(f.host.position,host);assert.deepEqual(f.api.cameraPosition(),camera);assert.equal(button(f,'brand-room').textContent,'The living room');
  f.keydown('KeyW');f.api.movePlayer(.1);assert.notDeepEqual(f.api.visitorPosition(),before,'walking resumes immediately after Exit');
});

test('Pause holds captions, seated poses and the slide number; Next and Escape remain usable',async t=>{
  const f=await livingFixture(t);f.api.previewStory('about');f.api.updatePresentation(1.2);
  const time=f.api.state.presentation.story.time,position=f.player.position.clone(),caption=button(f,'story-caption').textContent;
  button(f,'story-pause').onclick();f.api.updatePresentation(20);assert.equal(f.api.state.presentation.story.time,time);assert.deepEqual(f.player.position,position);assert.equal(button(f,'story-caption').textContent,caption);assert.equal(button(f,'story-pause-label').textContent,'Resume');
  button(f,'story-next').onclick();assert.equal(button(f,'story-count').textContent,'2 / 4');assert.equal(f.api.state.presentation.story.paused,true);
  f.keydown('Escape');assert.equal(f.api.state.presentation,null);assert.equal(button(f,'hud').hidden,false);
});

test('the last guided slide returns to movement and leads to the study',async t=>{
  const f=await livingFixture(t);f.api.state.guide=true;f.api.state.chapter=0;f.api.showChapter(CHAPTERS[0]);f.api.updatePresentation(1.2);
  for(let i=0;i<4;i++)button(f,'story-next').onclick();
  assert.equal(f.api.state.presentation,null);assert.equal(f.api.state.chapter,1);assert.equal(f.api.state.guide,true);assert.ok(f.api.state.guideRoute.length);assert.equal(button(f,'hud').hidden,false);assert.equal(button(f,'dialogue').hidden,true);
});

test('a completed silent story returns movement without a button click',async t=>{
  const f=await livingFixture(t);f.api.previewStory('about');
  for(let i=0;i<4000&&f.api.state.presentation;i++)f.api.updatePresentation(1/60);
  assert.equal(f.api.state.presentation,null);assert.equal(button(f,'hud').hidden,false);assert.equal(f.api.state.guide,false);
});

test('narration Pause/Resume works and a late speech callback cannot restart an exited story',async t=>{
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'SpeechSynthesisUtterance');globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  t.after(()=>{if(descriptor)Object.defineProperty(globalThis,'SpeechSynthesisUtterance',descriptor);else delete globalThis.SpeechSynthesisUtterance;});
  const f=await livingFixture(t),spoken=[];let pauses=0,resumes=0;
  f.window.speechSynthesis={cancel(){},speak:utterance=>spoken.push(utterance),pause:()=>pauses++,resume:()=>resumes++};f.api.state.sound=true;f.api.state.volume=.65;
  f.api.previewStory('about');f.api.updatePresentation(1.2);assert.equal(spoken.length,1);button(f,'story-pause').onclick();assert.equal(pauses,1);spoken[0].onend();f.api.updatePresentation(10);assert.equal(button(f,'story-count').textContent,'1 / 4');
  button(f,'story-pause').onclick();assert.equal(resumes,1);f.api.updatePresentation(.01);assert.equal(spoken.length,2);assert.equal(button(f,'story-count').textContent,'2 / 4');
  button(f,'story-exit').onclick();spoken[1].onend();f.api.updatePresentation(20);assert.equal(f.api.state.presentation,null);assert.equal(button(f,'hud').hidden,false);
});

test('reset and fatal recovery release both chairs and story input locks',async t=>{
  const f=await livingFixture(t);f.api.previewStory('about');f.api.updatePresentation(1.2);f.api.resetPosition();assert.equal(f.api.state.presentation,null);assert.equal(f.api.state.sitting,false);assert.ok(f.api.visitorPosition().z>9);
  assert.ok(f.physics.toys.filter(toy=>toy.kind==='furniture').every(toy=>!toy.occupied));
  f.api.placeVisitor({x:-4,y:.13,z:6});f.api.previewStory('about');assert.ok(f.api.state.presentation);f.api.pauseAfterError();assert.equal(f.api.state.presentation,null);assert.equal(button(f,'presentation').hidden,true);assert.ok(f.physics.toys.filter(toy=>toy.kind==='furniture').every(toy=>!toy.occupied));
});

test('other rooms retain their existing dialogue behavior',async t=>{
  const f=await livingFixture(t);f.host.position.set(7,.13,4.5);f.api.placeVisitor({x:6,y:floorAt(6,4.5),z:4.5});f.api.hostConversation();
  assert.equal(f.api.state.presentation,null);assert.equal(button(f,'dialogue').hidden,false);assert.equal(button(f,'presentation').hidden,true);
});
