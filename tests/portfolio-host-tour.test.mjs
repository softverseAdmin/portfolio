import test from 'node:test';
import assert from 'node:assert/strict';
import {controllerFixture} from './helpers/portfolio-controller.mjs';
import {loadProductionCharacter,loadGeometryAsset} from './helpers/portfolio-assets.mjs';
import {createRiggedCharacter} from '../public/portfolio-game/characters.js';
import {createWorld} from '../public/portfolio-game/world.js';
import {applyEnvironmentAsset} from '../public/portfolio-game/model-assets.js';

const saved={version:1,welcomed:true,checkpoint:0,settings:{}};
const hostAsset=await loadProductionCharacter('host',['walk']);

test('Rabin opens the living-room door when returning during free exploration',async t=>{
  const world=createWorld();applyEnvironmentAsset(world,(await loadGeometryAsset(new URL('../public/portfolio-game/assets/runtime/estate.glb',import.meta.url))).scene);
  const host=createRiggedCharacter(hostAsset,{host:true}),f=await controllerFixture(t,saved,{world,host}),{api}=f;
  api.beginVisit();api.hideDialogue();
  const door=world.doors.find(door=>door.id==='living');door.open=false;door.group.rotation.y=0;f.physics.syncColliders();
  for(let i=0;i<900&&api.state.hostReturnRoute.length;i++){api.moveHost(1/60);api.updateDoors(1/60);}
  assert.equal(api.state.hostReturnRoute.length,0,'the host must return through a closed room door without getting stuck');
  assert.ok(host.position.distanceTo({x:-4,y:.13,z:4})<.06);
});

for(const returning of [false,true])for(const fps of [30,60,120]){
  test(`Rabin faces his actual travel along a blocked diagonal ${returning?'return':'tour'} at ${fps} FPS`,async t=>{
    const host=createRiggedCharacter(hostAsset,{host:true}),f=await controllerFixture(t,saved,{host}),{api,world}=f;
    api.beginVisit();api.hideDialogue();world.blockers.length=0;
    world.blockers.push({minX:.6,maxX:1,minZ:-2,maxZ:2,minY:0,maxY:3});
    const route=[[3,3]];
    Object.assign(api.state,{guide:!returning,chapter:4,guideRoute:returning?[]:route,hostReturnRoute:returning?route:[],guideWaiting:false});
    host.position.set(0,.13,0);host.rotation.y=0;api.placeVisitor({x:-2,y:.13,z:0});
    const dt=1/fps;let sliding=0;
    for(let i=0;i<fps;i++){
      const previous=host.position.clone(),speed=api.moveHost(dt),delta=host.position.clone().sub(previous);
      if(i>fps*.5&&speed>.1&&Math.abs(delta.x)<1e-6){
        const heading=Math.atan2(delta.x,delta.z),error=Math.abs(Math.atan2(Math.sin(host.rotation.y-heading),Math.cos(host.rotation.y-heading)));
        assert.ok(error<.12,`walking faces ${error.toFixed(3)} radians away from its travel`);sliding++;
      }
    }
    assert.ok(sliding>fps*.25,'the character must really move along the wall');
  });
}

for(const fps of [30,60,120]){
  test(`a slow visitor does not repeatedly restart a waiting host at ${fps} FPS`,async t=>{
    const f=await controllerFixture(t,saved),{api,host,world}=f;api.beginVisit();api.hideDialogue();world.blockers.length=0;
    Object.assign(api.state,{guide:true,chapter:4,guideRoute:[[0,-20]],hostReturnRoute:[],guideWaiting:false});host.position.set(0,.13,0);api.placeVisitor({x:0,y:.13,z:7.05});
    assert.equal(api.moveHost(1/fps),0);assert.equal(api.state.guidePausedByDistance,true);
    const stopped=host.position.clone();
    for(let i=0;i<fps;i++){
      api.placeVisitor({x:0,y:.13,z:6.95+(i%2)*.1});assert.equal(api.moveHost(1/fps),0);assert.deepEqual(host.position,stopped);
    }
    api.placeVisitor({x:0,y:.13,z:5});assert.ok(api.moveHost(1/fps)>0);assert.equal(api.state.guidePausedByDistance,false);
  });
}
