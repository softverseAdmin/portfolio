import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {createWorld} from '../public/portfolio-game/world.js';
import {applyEnvironmentAsset} from '../public/portfolio-game/model-assets.js';
import {createRiggedCharacter,animateRiggedCharacter} from '../public/portfolio-game/characters.js';
import {loadGeometryAsset,loadProductionCharacter} from './helpers/portfolio-assets.mjs';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

const assets=Promise.all([loadGeometryAsset(new URL('../public/portfolio-game/assets/runtime/estate.glb',import.meta.url)),loadProductionCharacter('host'),loadProductionCharacter('visitor')]);
const flat=v=>{v.y=0;return v.normalize();};
const face=actor=>flat(new THREE.Vector3(0,0,1).applyQuaternion(actor.userData.rig.bones.Head.getWorldQuaternion(new THREE.Quaternion())));
async function production(){
  const [estate,hostAsset,visitorAsset]=await assets,world=createWorld();applyEnvironmentAsset(world,estate.scene);
  return {world,host:createRiggedCharacter(hostAsset,{host:true}),player:createRiggedCharacter(visitorAsset)};
}

for(const fps of [30,60,120])for(const ending of ['complete','exit'])test(`both uploaded actors walk forwards after living and study ${ending} at ${fps} FPS`,async t=>{
  const f=await controllerFixture(t,{version:1,welcomed:true,settings:{}},await production()),{api,player,host}=f,dt=1/fps;
  api.beginVisit();api.hideDialogue();api.state.hostReturnRoute=[];
  for(const [id,position,hostPosition] of [['about',{x:-4,y:.13,z:6.8},{x:-5,y:.13,z:6.2}],['experience',{x:-6,y:.13,z:-2},{x:-5,y:.13,z:-2.9}]]){
    api.hideDialogue();api.state.guide=false;api.state.guideRoute=[];api.placeVisitor(position);host.position.set(hostPosition.x,hostPosition.y,hostPosition.z);
    player.rotation.set(0,Math.PI,0);host.rotation.set(0,Math.PI,0);
    api.look(api.cameraHeading()/.004,0);api.followCamera(1);
    api.previewStory(id);assert.ok(api.state.presentation,`${id} must use its seated story`);api.updatePresentation(1.3);
    if(ending==='exit')f.doc.getElementById('story-exit').onclick();
    else for(let slide=0;slide<10&&api.state.presentation;slide++)f.doc.getElementById('story-next').onclick();
    assert.equal(api.state.presentation,null);
    f.keydown('KeyW');let moved=0;
    for(let i=0;i<fps/3;i++){
      const before=player.position.clone();api.advanceFrame(dt);const delta=player.position.clone().sub(before);
      if(delta.length()>.002){moved++;assert.ok(face(player).dot(flat(delta))>.94,`${id}: visitor faces backwards after ${ending}; root rotation ${player.rotation.toArray()}`);assert.equal(player.userData.rig.motion.gaitDirection,1);}
    }
    for(const fn of f.window.events.keyup)fn({code:'KeyW',target:f.doc.body});
    assert.ok(moved>fps/5,'the visitor must actually walk');
    api.state.guide=true;api.state.chapter=1;api.state.guideWaiting=false;api.state.guideRoute=[[hostPosition.x,hostPosition.z-3]];let hostMoved=0;
    for(let i=0;i<fps/3;i++){
      const before=host.position.clone(),speed=api.moveHost(dt);animateRiggedCharacter(host,20+i*dt,speed);const delta=host.position.clone().sub(before);
      if(delta.length()>.002){hostMoved++;assert.ok(face(host).dot(flat(delta))>0,`${id}: host faces backwards after ${ending}; root rotation ${host.rotation.toArray()}`);assert.equal(host.userData.rig.motion.gaitDirection,1);}
    }
    assert.ok(hostMoved>fps/5,'the host must actually lead the next route');
  }
});
