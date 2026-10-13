import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {loadProductionCharacter} from './helpers/portfolio-assets.mjs';
import {createRiggedCharacter} from '../public/portfolio-game/characters.js';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

const assets=new Map();
async function actor(role){if(!assets.has(role))assets.set(role,loadProductionCharacter(role,['run']));return createRiggedCharacter(await assets.get(role),{host:role==='host'});}
const horizontal=v=>{v.y=0;return v.normalize();};

for(const fps of [30,60,120])for(const rotated of [false,true])test(`forward input after a half-turn moves the native visitor forward at ${fps} FPS (${rotated?'rotated phone':'landscape'})`,async t=>{
  const player=await actor('visitor'),host=await actor('host'),f=await controllerFixture(t,{version:1,welcomed:true,settings:{}},{player,host});
  f.api.beginVisit();f.api.hideDialogue();f.api.resetPosition();f.api.placeVisitor({x:-19,y:.02,z:-8});host.position.set(-23,.02,-12);
  globalThis.innerWidth=rotated?393:852;globalThis.innerHeight=rotated?852:393;globalThis.matchMedia=()=>({matches:true});
  const stick=f.doc.getElementById('joystick'),point=type=>{for(const fn of stick.events[type]??[])fn({pointerId:7,clientX:rotated?86.5:52.5,clientY:rotated?52.5:18.5,preventDefault(){}});};
  point('pointerdown');for(let frame=0;frame<fps/2;frame++)f.api.advanceFrame(1/fps);
  f.api.look(Math.PI/.004,0);
  const requested=horizontal(new THREE.Vector3(0,0,1).applyQuaternion(player.quaternion));
  for(let frame=0;frame<fps/3;frame++){
    const before=player.position.clone();f.api.advanceFrame(1/fps);
    const travel=horizontal(player.position.clone().sub(before));
    assert.ok(travel.dot(requested)>.98,`forward input moves along the previous direction at frame ${frame}: ${travel.dot(requested)}`);
    const face=horizontal(new THREE.Vector3(0,0,1).applyQuaternion(player.userData.rig.bones.Head.getWorldQuaternion(new THREE.Quaternion())));
    assert.ok(face.dot(travel)>.94,`the visible visitor faces away from forward travel at frame ${frame}`);
    const rear=horizontal(f.api.cameraPosition().sub(player.userData.rig.bones.Spine2.getWorldPosition(new THREE.Vector3())));
    assert.ok(rear.dot(face)<-.65,'the camera exposes the face rather than the visitor back');
    assert.equal(player.userData.rig.motion.gaitDirection,1,'forward input reverses the supplied walking animation');
  }
  point('pointerup');
});

for(const fps of [30,60,120])test(`reversing the held joystick turns before the native visitor steps at ${fps} FPS`,async t=>{
  const player=await actor('visitor'),host=await actor('host'),f=await controllerFixture(t,{version:1,welcomed:true,settings:{}},{player,host});
  f.api.beginVisit();f.api.hideDialogue();f.api.resetPosition();f.api.placeVisitor({x:-19,y:.02,z:-8});host.position.set(-23,.02,-12);
  globalThis.innerWidth=393;globalThis.innerHeight=852;globalThis.matchMedia=()=>({matches:true});
  const stick=f.doc.getElementById('joystick'),point=(forward,type)=>{for(const fn of stick.events[type]??[])fn({pointerId:7,clientX:52.5+(forward?34:-34),clientY:52.5,preventDefault(){}});};
  point(true,'pointerdown');for(let frame=0;frame<fps/2;frame++)f.api.advanceFrame(1/fps);
  const initial=horizontal(new THREE.Vector3(0,0,1).applyQuaternion(player.quaternion));
  for(const forward of [false,true]){
    point(forward,'pointermove');const requested=initial.clone().multiplyScalar(forward?1:-1);
    for(let frame=0;frame<fps/4;frame++){
      const before=player.position.clone();f.api.advanceFrame(1/fps);const travel=horizontal(player.position.clone().sub(before));
      assert.ok(travel.dot(requested)>.98,'the held joystick carries the previous velocity into the new direction');
      const face=horizontal(new THREE.Vector3(0,0,1).applyQuaternion(player.userData.rig.bones.Head.getWorldQuaternion(new THREE.Quaternion())));
      assert.ok(face.dot(travel)>.94,'a half-turn samples backward walking before turning the visitor');
      assert.equal(player.userData.rig.motion.gaitDirection,1);
    }
  }
  point(true,'pointerup');
});

test('a new release versions every local game module, including transitive and dynamic imports',()=>{
  const base=new URL('../public/portfolio-game/',import.meta.url),html=readFileSync(new URL('index.html',base),'utf8');
  const map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
  const startup=html.match(/src="\.\/startup\.js(\?v=\d+)"/)[1];
  assert.equal(map['./startup.js'],'./startup.js'+startup);
  for(const [key,value] of Object.entries(map)){
    assert.equal(value,key+startup,'the release mixes module versions');
    const source=readFileSync(new URL(key,base),'utf8');
    for(const match of source.matchAll(/(?:from\s+|import\s*\(\s*)['"](\.\/[^'"]+\.js)(?:\?v=\d+)?['"]/g)){
      if(!/^\.\/[^/]+\.js$/.test(match[1]))continue;
      assert.ok(map[match[1]],'an unversioned game dependency can be cached from a previous release: '+match[1]);
    }
  }
});
