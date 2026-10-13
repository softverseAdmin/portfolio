import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {loadProductionCharacter} from './helpers/portfolio-assets.mjs';
import {createRiggedCharacter,animateRiggedCharacter} from '../public/portfolio-game/characters.js';
import {sampleMotion} from '../public/portfolio-game/motions.js';
import {controllerFixture} from './helpers/portfolio-controller.mjs';
import {floorAt} from '../public/portfolio-game/core.js';

const assets=new Map();
async function actor(role){if(!assets.has(role))assets.set(role,loadProductionCharacter(role,['start-walk','run','carry-walk','box-walk']));return createRiggedCharacter(await assets.get(role),{host:role==='host'});}
const foot=(a,side)=>a.userData.rig.bones[side+'Foot'].getWorldPosition(new THREE.Vector3());

for(const role of ['host','visitor'])for(const fps of [30,60,120])test(`${role} starts walking immediately and keeps the planted native feet still at ${fps} FPS`,async()=>{
  const a=await actor(role);a.position.set(-19,.02,-10);animateRiggedCharacter(a,0);let previous=[foot(a,'Right'),foot(a,'Left')],contacts=[false,false],held=0,early=0;
  for(let frame=1;frame<=fps*3;frame++){
    const time=frame/fps;a.position.z=-10+2.2*time;animateRiggedCharacter(a,time,2.2);assert.equal(a.userData.rig.motion.id,'walk');
    if(time<.25)early=Math.max(early,a.userData.rig.motion.sampleTime);
    for(const [i,side] of ['Right','Left'].entries()){
      const p=foot(a,side),contact=a.userData.rig.gait.feet[i].planted;
      if(contact&&contacts[i]){held++;assert.ok(p.distanceTo(previous[i])<.025,`a planted ${side} foot slides ${p.distanceTo(previous[i]).toFixed(3)}m`);}
      assert.ok(p.y>=floorAt(p.x,p.z)-.002,'a native foot passes through the floor');previous[i]=p;contacts[i]=contact;
    }
  }
  assert.ok(early>.12,'the start animation remains in its stationary lead-in');assert.ok(held>fps/2,'the test did not exercise sustained foot contacts');
});

test('native running and both carrying loops retain foot contacts and recorded pace, then stop cleanly',async()=>{
  for(const role of ['host','visitor'])for(const mode of ['run','carry-walk','box-walk']){
    const a=await actor(role),speed=mode==='run'?4.6:2.2,pose=mode==='run'?{running:true}:{carry:true,twoHands:mode==='box-walk'};a.position.set(-19,.02,-10);animateRiggedCharacter(a,0);
    let held=0,previous=[foot(a,'Right'),foot(a,'Left')],was=[false,false];
    for(let frame=1;frame<=90;frame++){
      const t=frame/60;a.position.z=-10+speed*t;animateRiggedCharacter(a,t,speed,false,false,pose);assert.equal(a.userData.rig.motion.id,mode);
      a.userData.rig.gait.feet.forEach((f,i)=>{const p=foot(a,['Right','Left'][i]);if(f.planted&&was[i]){held++;assert.ok(p.distanceTo(previous[i])<.03,`${role} ${mode} frame ${frame} foot ${i} slides ${p.distanceTo(previous[i])}, target error ${p.distanceTo(f.target)}`);}previous[i]=p;was[i]=f.planted;});
    }
    assert.ok(held>12,`${role} ${mode} has no planted steps`);animateRiggedCharacter(a,2,0);assert.equal(a.userData.rig.motion.id,'idle');assert.equal(a.userData.rig.gait,null);
  }
});

test('the supplied loop steps backwards while the visitor is still turning, and teleports or jump poses release old contacts',async()=>{
  const a=await actor('visitor');a.position.set(-19,.02,-10);animateRiggedCharacter(a,0);a.position.z-=.035;animateRiggedCharacter(a,1/60,2.1);assert.equal(a.userData.rig.motion.gaitDirection,-1);assert.ok(a.userData.rig.motion.sampleTime>.8,'negative playback is clamped to frame zero');
  a.position.set(18,.02,10);animateRiggedCharacter(a,2/60,2.1);a.userData.rig.gait.feet.forEach(f=>assert.ok(f.target.distanceTo(a.position)<2,'a teleported character keeps a previous-room foot target'));
  animateRiggedCharacter(a,3/60,2.1,false,false,{airborne:true});assert.equal(a.userData.rig.gait,null);
  sampleMotion(a,'start-walk',.5);assert.equal(a.userData.rig.motion.id,'start-walk','the original start clip is no longer available');
});

test('the production controller blends moving native feet immediately, releases contacts at walls, and retains the camera behind the visitor',async t=>{
  const player=await actor('visitor'),host=await actor('host'),f=await controllerFixture(t,{version:1,welcomed:true,settings:{}},{player,host});f.api.beginVisit();f.api.hideDialogue();f.api.resetPosition();f.api.placeVisitor({x:-19,y:.02,z:-10});f.host.position.set(-23,.02,-12);
  f.keydown('KeyW');for(let frame=0;frame<10;frame++)f.api.advanceFrame(1/60);assert.equal(player.userData.rig.motion.id,'walk');assert.ok(player.userData.rig.gait);
  const from=f.api.visitorPosition();f.world.blockers.push({minX:-23,maxX:-14,minY:0,maxY:3,minZ:from.z-.5,maxZ:from.z-.35});
  for(let frame=0;frame<60;frame++)f.api.advanceFrame(1/60);assert.equal(player.userData.rig.motion.id,'idle');assert.equal(player.userData.rig.gait,null);
  const arm=f.api.cameraPosition().sub(player.position),forward=new THREE.Vector3(0,0,1).applyQuaternion(player.quaternion);arm.y=0;assert.ok(arm.normalize().dot(forward)<-.65);
});
