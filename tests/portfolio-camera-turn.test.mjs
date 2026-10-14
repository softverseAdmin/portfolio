import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {resolveVisitorCamera} from '../public/portfolio-game/camera.js';

const angle=(position,target)=>Math.atan2(position.x-target.x,position.z-target.z);
for(const fps of [30,60,120])test(`the walking camera turns on an arc without a fixed rear-angle snap at ${fps} FPS`,()=>{
  const target=new THREE.Vector3(0,1.3,0);let position=new THREE.Vector3(0,2.2,5);
  for(const heading of [0,2.4,-3.1,3.1,-1.4]){
    const desired=new THREE.Vector3(-Math.sin(heading)*5,2.2,-Math.cos(heading)*5);
    for(let frame=0;frame<fps*.5;frame++){
      const before=angle(position,target),next=resolveVisitorCamera(position,target,desired,heading,[],1/fps);
      const turn=Math.abs(Math.atan2(Math.sin(angle(next,target)-before),Math.cos(angle(next,target)-before)));
      assert.ok(turn<(fps===30?1.2:.65),`the camera snaps ${turn.toFixed(3)} radians after a turn`);
      assert.ok(Math.hypot(next.x-target.x,next.z-target.z)>4.9,'the orbit cuts through the visitor during a half-turn');
      position=next;
    }
    const arm=position.clone().sub(target);arm.y=0;
    assert.ok(arm.normalize().dot(new THREE.Vector3(Math.sin(heading),0,Math.cos(heading)))<-.98,'the camera does not settle behind the new walking direction');
  }
});
