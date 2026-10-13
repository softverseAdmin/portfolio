import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {loadGeometryAsset,loadProductionCharacter} from './helpers/portfolio-assets.mjs';
import {createWorld} from '../public/portfolio-game/world.js';
import {applyEnvironmentAsset} from '../public/portfolio-game/model-assets.js';
import {createSandboxPhysics} from '../public/portfolio-game/physics.js';
import {createRiggedCharacter,animateRiggedCharacter} from '../public/portfolio-game/characters.js';
import {createStoryStage,presentationCamera} from '../public/portfolio-game/presentation.js';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

const assets=Promise.all([
  loadGeometryAsset(new URL('../public/portfolio-game/assets/runtime/estate.glb',import.meta.url)),
  loadProductionCharacter('host'),loadProductionCharacter('visitor')
]);
async function fixture(){
  const [estate,hostAsset,visitorAsset]=await assets,world=createWorld();applyEnvironmentAsset(world,estate.scene);
  const physics=createSandboxPhysics(world),host=createRiggedCharacter(hostAsset,{host:true}),player=createRiggedCharacter(visitorAsset);
  host.position.set(-4,.13,4);player.position.set(-4,.13,6.8);animateRiggedCharacter(host,10);animateRiggedCharacter(player,10);
  return {world,physics,host,player};
}
function visible(hit){for(let node=hit.object;node;node=node.parent)if(!node.visible)return false;return true;}
function sampleStage(stage,time){
  const progress=Math.min(1,time/1.2);
  stage.actors.forEach((actor,i)=>{const pose=stage.pose(i,progress);pose.talking=i===0&&progress===1;animateRiggedCharacter(actor,time,0,false,true,pose);});
}
const bones=actor=>actor.userData.rig.idle.map(({bone})=>[...bone.position.toArray(),...bone.quaternion.toArray()]);

test('the complete projector screen and both uploaded faces are visible through the production estate',async()=>{
  const f=await fixture(),stage=createStoryStage(f);assert.ok(stage);
  for(let frame=0;frame<=120;frame++)sampleStage(stage,frame/60);
  f.world.projector.root.visible=true;f.world.roof.forEach(mesh=>mesh.visible=false);f.world.root.updateMatrixWorld(true);
  for(const doorAngle of [-Math.PI/2,-Math.PI/4,0]){
  f.world.doors.find(door=>door.id==='living').group.rotation.y=doorAngle;f.physics.syncColliders();f.world.root.updateMatrixWorld(true);
  for(const aspect of [4/3,16/9,844/390,2.4]){
    const view=presentationCamera(aspect,f.world.cameraBlockers??f.world.blockers),camera=new THREE.PerspectiveCamera(view.fov,aspect,.1,220);
    camera.position.copy(view.position);camera.lookAt(view.target);camera.updateMatrixWorld(true);
    for(const x of [-2.8,-1.4,0,1.4,2.8])for(const y of [-1.5,-.75,0,.75,1.5]){
      const point=f.world.projector.screen.localToWorld(new THREE.Vector3(x,y,0));
      const projected=point.clone().project(camera);assert.ok(Math.abs(projected.x)<1&&Math.abs(projected.y)<1,`aspect ${aspect} crops screen point ${x},${y}`);
      const ray=new THREE.Raycaster(view.position,point.clone().sub(view.position).normalize()),hit=ray.intersectObject(f.world.root,true).find(visible);
      assert.ok(hit?.object===f.world.projector.screen,`aspect ${aspect}: ${hit?.object.name||'furniture'} covers screen point ${x},${y}`);
    }
    for(const actor of stage.actors){
      for(const name of ['Head','Hips','RightFoot','LeftFoot']){
        const point=actor.userData.rig.bones[name].getWorldPosition(new THREE.Vector3()).project(camera);
        assert.ok(Math.abs(point.x)<1&&Math.abs(point.y)<1,`aspect ${aspect} crops the seated ${name}`);
      }
      const face=actor.userData.rig.bones.Head.getWorldPosition(new THREE.Vector3()),projected=face.clone().project(camera);
      assert.ok(Math.abs(projected.x)<1&&Math.abs(projected.y)<1,`aspect ${aspect} crops an uploaded face`);
      const ray=new THREE.Raycaster(view.position,face.clone().sub(view.position).normalize()),hit=ray.intersectObject(f.world.root,true).find(visible);
      assert.ok(!hit||hit.distance>view.position.distanceTo(face),`${hit?.object.name||'furniture'} hides an uploaded face`);
    }
  }
  }
  stage.restore();
});

test('the uploaded sit and talk motions stay planted and remain still while Pause holds the story clock',async()=>{
  const f=await fixture(),original=stageActors(f).map(bones),stage=createStoryStage(f);assert.ok(stage);
  for(let frame=0;frame<=240;frame++){
    const time=frame/60;sampleStage(stage,time);
    if(time>=1.2)stage.actors.forEach((actor,i)=>{
      const pose=stage.pose(i,1),rig=actor.userData.rig;
      assert.ok(rig.bones.Hips.getWorldPosition(new THREE.Vector3()).distanceTo(pose.seatHipTarget)<.001);
      ['Right','Left'].forEach((side,j)=>assert.ok(rig.bones[side+'Foot'].getWorldPosition(new THREE.Vector3()).distanceTo(pose.seatFootTargets[j])<.025));
    });
    if(frame===30||frame===120){
      const held=stage.actors.map(bones);
      for(let repeat=0;repeat<90;repeat++)sampleStage(stage,time);
      stage.actors.forEach((actor,i)=>assert.deepEqual(bones(actor),held[i],`Pause changes ${i?'visitor':'host'} bones at ${time}s`));
    }
  }
  stage.restore();stage.actors.forEach((actor,i)=>assert.deepEqual(bones(actor),original[i]));
  stage.actors.forEach(actor=>{animateRiggedCharacter(actor,11);actor.updateMatrixWorld(true);assert.ok(actor.userData.rig.bones.Head.getWorldPosition(new THREE.Vector3()).y>1.5,'the actor remains stuck in the seated pose after Exit');});
});
function stageActors(f){return [f.host,f.player];}

test('the production controller presents the loaded estate and returns the uploaded visitor to walking after Exit',async t=>{
  const production=await fixture(),f=await controllerFixture(t,{version:1,welcomed:true,checkpoint:0,settings:{}},production);
  f.api.beginVisit();f.api.hideDialogue();f.api.placeVisitor({x:-4,y:.13,z:6.8});f.host.position.set(-4,.13,4);f.api.state.hostReturnRoute=[];
  const original=f.api.visitorPosition();f.api.state.guide=true;f.api.state.chapter=0;f.api.state.guideWaiting=true;
  for(let frame=0;frame<100;frame++)f.api.advanceFrame(1/60);
  assert.ok(f.api.state.presentation);assert.equal(f.player.userData.rig.motion.id,'sit-idle');assert.equal(f.host.userData.rig.motion.id,'sit-idle');
  f.world.root.updateMatrixWorld(true);const view=f.api.cameraPosition(),center=f.world.projector.screen.getWorldPosition(new THREE.Vector3());
  const hit=new THREE.Raycaster(view,center.clone().sub(view).normalize()).intersectObject(f.world.root,true).find(visible);
  assert.ok(hit?.object===f.world.projector.screen,`${hit?.object.name||'furniture'} still covers the controller's actual story view`);
  const doc=f.doc.getElementById.bind(f.doc);doc('story-pause').onclick();const paused=stageActors(f).map(bones);
  for(let frame=0;frame<60;frame++)f.api.advanceFrame(1/60);stageActors(f).forEach((actor,i)=>assert.deepEqual(bones(actor),paused[i]));
  doc('story-next').onclick();assert.equal(doc('story-count').textContent,'2 / 4');assert.equal(f.api.state.presentation.story.paused,true);
  doc('story-exit').onclick();assert.equal(f.api.state.presentation,null);assert.equal(doc('hud').hidden,false);assert.equal(f.world.projector.root.visible,false);assert.deepEqual(f.api.visitorPosition(),original);
  f.keydown('KeyW');for(let frame=0;frame<20;frame++)f.api.advanceFrame(1/60);
  assert.notDeepEqual(f.api.visitorPosition(),original);assert.equal(f.api.state.sitting,false);assert.equal(f.player.userData.rig.motion.id,'walk');
  assert.ok(f.player.userData.rig.bones.Head.getWorldPosition(new THREE.Vector3()).y>1.5,'the uploaded visitor stays hunched after the story');
});
