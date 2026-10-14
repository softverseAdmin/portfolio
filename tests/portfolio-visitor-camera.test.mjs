import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {CHAPTERS,floorAt} from '../public/portfolio-game/core.js';
import {resolveVisitorCamera,cameraFraction} from '../public/portfolio-game/camera.js';
import {subtitleCues,subtitleAt,createStoryStage,createStudyStage,presentationCamera,studyCamera} from '../public/portfolio-game/presentation.js';
import {createWorld} from '../public/portfolio-game/world.js';
import {applyEnvironmentAsset} from '../public/portfolio-game/model-assets.js';
import {createSandboxPhysics} from '../public/portfolio-game/physics.js';
import {createRiggedCharacter,animateRiggedCharacter} from '../public/portfolio-game/characters.js';
import {loadGeometryAsset,loadProductionCharacter} from './helpers/portfolio-assets.mjs';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

const behind=(camera,actor)=>{const arm=camera.clone().sub(actor.position);arm.y=0;return arm.normalize().dot(new THREE.Vector3(0,0,1).applyQuaternion(actor.quaternion));};
let assets;
async function production(){
  assets??=Promise.all([loadGeometryAsset(new URL('../public/portfolio-game/assets/runtime/estate.glb',import.meta.url)),loadProductionCharacter('host'),loadProductionCharacter('visitor')]);
  const [estate,hostAsset,visitorAsset]=await assets,world=createWorld();applyEnvironmentAsset(world,estate.scene);
  const physics=createSandboxPhysics(world),host=createRiggedCharacter(hostAsset,{host:true}),player=createRiggedCharacter(visitorAsset);host.position.set(-23,.02,-12);player.position.set(-19,.02,-10);animateRiggedCharacter(host,0);animateRiggedCharacter(player,0);return {world,physics,host,player};
}

test('the camera follows turns, wraps at pi, and stays outside thin walls',()=>{
  const target=new THREE.Vector3(0,1.3,0),wall={minX:-3,maxX:3,minY:0,maxY:4,minZ:2.8,maxZ:2.84};let position=new THREE.Vector3(0,2.2,-5);
  for(const heading of [0,.8,1.6,2.4,Math.PI,-3.1,-2.2,-1,0]){
    const desired=new THREE.Vector3(-Math.sin(heading)*5,2.2,-Math.cos(heading)*5);
    for(let frame=0;frame<30;frame++){
      position=resolveVisitorCamera(position,target,desired,heading,[wall],1/60);
      assert.ok(cameraFraction(target,position,[wall])>.99,'the camera crosses a thin wall during its orbit');
    }
    const arm=position.clone().sub(target);arm.y=0;assert.ok(arm.length()>.5);assert.ok(arm.normalize().dot(new THREE.Vector3(Math.sin(heading),0,Math.cos(heading)))<-.85,'the camera does not settle behind the turn');
  }
});

for(const fps of [30,60,120])test(`the camera follows walking, reversing and sideways movement at ${fps} FPS without spiralling`,async t=>{
  const f=await controllerFixture(t,{version:1,welcomed:true,checkpoint:0,settings:{}},await production());f.api.beginVisit();f.api.hideDialogue();f.api.resetPosition();f.api.placeVisitor({x:-19,y:floorAt(-19,-10),z:-10});f.host.position.set(-23,.02,-12);
  const release=code=>{for(const fn of f.window.events.keyup)fn({code,target:f.doc.body});for(let frame=0;frame<fps/2;frame++)f.api.advanceFrame(1/fps);};
  for(const code of ['KeyW','KeyD','KeyS','KeyA']){
    const start=f.api.visitorPosition();f.keydown(code);let direction;
    for(let frame=0;frame<fps*.6;frame++){
      f.api.advanceFrame(1/fps);if(frame>=fps*.3)assert.ok(behind(f.api.cameraPosition(),f.player)<-.65,`${code}: the camera does not settle behind the visitor at frame ${frame}`);
      const point=f.api.visitorPosition(),delta=new THREE.Vector3(point.x-start.x,0,point.z-start.z);if(delta.length()>.05){direction??=delta.clone().normalize();assert.ok(delta.normalize().dot(direction)>.999,'holding a direction curves around the moving camera');}
    }
    assert.ok(direction,'movement failed');release(code);
  }
  f.api.look(310,0);for(let frame=0;frame<fps*.4;frame++)f.api.advanceFrame(1/fps);assert.ok(behind(f.api.cameraPosition(),f.player)<-.65,'dragging the scene does not turn the camera with the visitor');
  f.api.state.aiming=true;f.api.look(-210,0);for(let frame=0;frame<fps*.4;frame++)f.api.advanceFrame(1/fps);assert.ok(behind(f.api.cameraPosition(),f.player)<-.65,'aiming does not settle into the shoulder view');
});

test('both original seated stories and the desktop detail view show the visitor from behind with attentive native head poses',async()=>{
  const f=await production();
  for(const [stageFor,cameraFor] of [[createStoryStage,presentationCamera],[createStudyStage,studyCamera]]){
    const stage=stageFor(f);assert.ok(stage);
    for(let frame=0;frame<360;frame++){
      const time=frame/60;stage.actors.forEach((actor,i)=>{const pose=stage.pose(i,Math.min(1,time/1.2));pose.talking=i===0&&time>=1.2;animateRiggedCharacter(actor,time,0,false,true,pose);
        if(time>=1.2){const head=actor.userData.rig.bones.Head,forward=new THREE.Vector3(0,0,1).applyQuaternion(head.getWorldQuaternion(new THREE.Quaternion())),towards=pose.lookTarget.clone().sub(head.getWorldPosition(new THREE.Vector3())).normalize();assert.ok(forward.dot(towards)>.94,'the native head looks into the lap rather than at the screen or visitor');}
      });
    }
    for(const aspect of [4/3,16/9,844/390,2.4])assert.ok(behind(cameraFor(aspect,f.world.blockers).position,f.player)<-.8,'the story camera exposes the visitor face');
    if(stageFor===createStudyStage)assert.ok(behind(studyCamera(844/390,f.world.blockers,true).position,f.player)<-.8,'reading a project switches to a front view');
    stage.restore();
  }
});

test('the court and paved paths have a clear depth gap over the lawn before and after loading the original estate',async()=>{
  const estate=(await assets)[0];
  for(const loaded of [false,true]){
    const world=createWorld();if(loaded)applyEnvironmentAsset(world,estate.scene);world.root.updateMatrixWorld(true);
    for(const [x,z] of [[-19,-10],[-20,-6],[0,20]]){
      const hits=new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0)).intersectObject(world.root,true).filter(h=>{for(let n=h.object;n;n=n.parent)if(!n.visible)return false;return h.point.y<.2;});
      const lawn=hits.find(h=>h.object.material.name==='Lawn'||h.object===world.visuals.ground),surface=hits[0];assert.ok(lawn);assert.ok(surface.point.y-lawn.point.y>.015,'a lawn surface intersects the court or paving');
    }
  }
});

test('compact subtitles keep every original word and follow timing or speech boundaries',()=>{
  for(const chapter of CHAPTERS){const cues=subtitleCues(chapter.text);assert.equal(cues.map(c=>c.text).join(' '),chapter.text);for(const cue of cues){assert.ok(cue.words<=14);assert.ok(cue.text.length<=94);assert.equal(subtitleAt(cues,0,cue.start),cue.text);}assert.equal(subtitleAt(cues,9999),cues.at(-1).text);}
  assert.equal(subtitleAt([]),'');
});

test('Pause holds the compact subtitle, Next resets it, and stale speech boundaries cannot change a new slide',async t=>{
  const f=await controllerFixture(t,{version:1,welcomed:true,checkpoint:0,settings:{}},await production()),takes=[];
  const original=globalThis.SpeechSynthesisUtterance;globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};t.after(()=>{if(original)globalThis.SpeechSynthesisUtterance=original;else delete globalThis.SpeechSynthesisUtterance;});
  f.window.speechSynthesis={cancel(){},pause(){},resume(){},speak(utterance){takes.push(utterance);}};f.api.beginVisit();f.api.hideDialogue();f.api.placeVisitor({x:-4,y:.13,z:6.8});f.api.state.sound=true;f.api.state.volume=1;f.api.previewStory('about');f.api.updatePresentation(1.2);
  const session=f.api.state.presentation,first=takes.at(-1),last=session.cues.at(-1);first.onboundary({charIndex:last.start});f.api.updatePresentation(0);assert.equal(f.doc.getElementById('story-caption').textContent,last.text);
  f.doc.getElementById('story-pause').onclick();const held=f.doc.getElementById('story-caption').textContent;f.api.updatePresentation(20);assert.equal(f.doc.getElementById('story-caption').textContent,held);
  f.doc.getElementById('story-next').onclick();first.onboundary({charIndex:last.start});f.api.updatePresentation(0);assert.equal(f.doc.getElementById('story-caption').textContent,session.cues[0].text);f.doc.getElementById('story-exit').onclick();first.onboundary({charIndex:last.start});assert.equal(f.api.state.presentation,null);
});
