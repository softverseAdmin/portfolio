import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {loadProductionVehicle} from './helpers/portfolio-assets.mjs';
import {createImportedVehicle} from '../public/portfolio-game/imported-vehicle.js';
import {rollVehicleWheels,alignVehicleWheels,wheelLowestPoint} from '../public/portfolio-game/vehicle-motion.js';
import {createWorld} from '../public/portfolio-game/world.js';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

let source;
async function vehicle(){source??=loadProductionVehicle({raw:true});return createImportedVehicle(await source);}
function actualLowest(wheel){let min=Infinity;for(const mesh of wheel.meshes){mesh.updateWorldMatrix(true,false);const p=mesh.geometry.attributes.position,index=mesh.geometry.index,e=mesh.matrixWorld.elements;for(let i=0;i<index.count;i++){const id=index.getX(i);min=Math.min(min,e[1]*p.getX(id)+e[5]*p.getY(id)+e[9]*p.getZ(id)+e[13]);}}return min;}

test('whole original tyre surfaces rotate at the axle while the arches remain on the chassis, preserving every source triangle and UV',async()=>{
  const v=await vehicle(),raw=await source,records=new Map(),point=new THREE.Vector3();raw.scene.updateMatrixWorld(true);v.car.updateMatrixWorld(true);
  raw.scene.traverse(mesh=>{if(!mesh.isMesh||mesh.material.name!=='Original_Textured_Paint')return;const geometry=mesh.geometry;records.set(geometry.attributes.position,{geometry,matrix:mesh.matrixWorld.clone(),seen:new Uint8Array(geometry.index.count/3)});for(let i=0;i<geometry.index.count;i++)assert.ok(geometry.index.getX(i)===i,'the supplied source no longer has its original triangle order');});
  v.car.traverse(mesh=>{
    if(!mesh.isMesh||mesh.material.name!=='Original_Textured_Paint'||!mesh.geometry.attributes.position)return;
    const record=records.get(mesh.geometry.attributes.position);assert.ok(record,'a replacement vertex buffer was introduced');
    for(const [name,attribute] of Object.entries(record.geometry.attributes))assert.ok(mesh.geometry.attributes[name]===attribute,`original ${name} bytes were changed`);
    assert.ok(mesh.material===raw.scene.getObjectByName(mesh.name.replace(' Tyre surface','')).material,'an original texture material was replaced');
    const index=mesh.geometry.index;
    for(let i=0;i<index.count;i+=3){const a=index.getX(i),triangle=a/3;assert.equal(index.getX(i+1),a+1);assert.equal(index.getX(i+2),a+2);assert.equal(record.seen[triangle],0,'a source triangle is drawn twice');record.seen[triangle]=1;}
    // Changing the parent preserves the source appearance before steering/roll.
    if(index.count){const original=point.fromBufferAttribute(mesh.geometry.attributes.position,index.getX(0)).clone().applyMatrix4(record.matrix),rendered=point.clone().applyMatrix4(mesh.matrixWorld);assert.ok(original.distanceTo(rendered)<1e-7,'the source rest surface was moved');}
  });
  for(const {seen} of records.values())assert.ok(seen.every(n=>n===1),'a source triangle was dropped');
  const arches=v.carWheels.map(w=>v.car.getObjectByName(w.group.name.replace('_Steer',''))),before=arches.map(m=>m.matrixWorld.clone());
  rollVehicleWheels(v,{x:0,z:0,heading:0},{x:0,z:1,heading:0},.36);v.car.updateMatrixWorld(true);
  arches.forEach((m,i)=>assert.deepEqual(m.matrixWorld.elements,before[i].elements,'a fixed arch turns with a tyre'));
  for(const w of v.carWheels){assert.ok(w.meshes.length>=2,'a tyre still contains only its old clipped wheel cell');assert.ok(Math.abs(w.localPosition.z-(w.front?1.475:-1.265))<1e-6,'a tyre uses the old bounding-box pivot');}
});

test('the original tyres roll by signed distance, steer separately, and remain still without travel',async()=>{
  const v=await vehicle(),from={x:0,z:0,heading:0},to={x:0,z:2,heading:0};rollVehicleWheels(v,from,to,0);
  v.carWheels.forEach(w=>assert.ok(Math.abs(w.spin.rotation.x-2/w.radius)<1e-8));rollVehicleWheels(v,to,from,0);v.carWheels.forEach(w=>assert.ok(Math.abs(w.spin.rotation.x)<1e-8));
  rollVehicleWheels(v,from,from,.36);v.carWheels.forEach(w=>{assert.equal(w.steer.rotation.y,w.front?.36:0);assert.ok(Math.abs(w.spin.rotation.x)<1e-8,'stationary steering spins a tyre');});
});

test('inside and outside original tyres travel different arcs during a turn',async()=>{
  const v=await vehicle();rollVehicleWheels(v,{x:0,z:0,heading:0},{x:0,z:1,heading:-.2},-.36);
  const left=v.carWheels.find(w=>!w.front&&w.side<0),right=v.carWheels.find(w=>!w.front&&w.side>0);assert.ok(right.spin.rotation.x>left.spin.rotation.x,'the outside rear tyre does not cover the longer turn');
});

test('unchanged original tyre vertices stay on level and sloped ground throughout rolling and steering',async()=>{
  const v=await vehicle(),geometries=v.carWheels.map(w=>w.tire.geometry),before=geometries.map(g=>g.attributes.position.array.slice());
  for(const [pitch,roll] of [[0,0],[-.09,.06]])for(const angle of [0,.4,Math.PI/2,Math.PI]){
    v.car.position.set(0,.02,0);v.car.rotation.set(pitch,0,roll,'YXZ');v.carWheels.forEach(w=>{w.spin.rotation.x=angle;w.steer.rotation.y=w.front?-.36:0;});
    const ground=(x,z)=>.02-Math.tan(pitch)*z+Math.tan(roll)*x;alignVehicleWheels(v,ground);
    for(const w of v.carWheels){const center=w.group.getWorldPosition(new THREE.Vector3()),lowest=actualLowest(w);assert.ok(Math.abs(lowest-ground(center.x,center.z))<.008,`${w.group.name} floats or sinks at ${angle}`);assert.ok(Math.abs(wheelLowestPoint(w)-lowest)<.008,`${w.group.name} sample error ${wheelLowestPoint(w)-lowest}, pitch ${pitch}, roll ${roll}, spin ${angle}`);assert.ok(w.contactSamples.length<=128*15);}
  }
  v.carWheels.forEach((w,i)=>{assert.ok(w.tire.geometry===geometries[i]);assert.deepEqual(w.tire.geometry.attributes.position.array,before[i]);});
});

test('the production controller does not spin parked tyres when blocked, then rolls them on a real reverse movement',async t=>{
  const native=await vehicle(),world=createWorld({vehicle:native}),f=await controllerFixture(t,{version:1,welcomed:true,settings:{}},{world});f.api.beginVisit();f.api.hideDialogue();f.api.state.driving=true;world.car.position.set(18,.02,18);world.car.rotation.y=0;
  f.api.state.vehicle={x:18,z:18,heading:0,vx:0,vz:0,bounds:{halfWidth:1,halfLength:2.45,height:2}};
  world.blockers.push({minX:15,maxX:21,minZ:20.44,maxZ:21,minY:0,maxY:3});f.keydown('KeyW');const spin=world.carWheels.map(w=>w.spin.rotation.x);
  for(let frame=0;frame<120;frame++)f.api.movePlayer(1/60);assert.equal(f.api.state.vehicle.z,18);world.carWheels.forEach((w,i)=>assert.ok(Math.abs(w.spin.rotation.x-spin[i])<1e-6,'collision rebound spins a parked tyre'));
  for(const fn of f.window.events.keyup)fn({code:'KeyW',target:f.doc.body});f.keydown('KeyS');for(let frame=0;frame<30;frame++)f.api.movePlayer(1/60);assert.ok(f.api.state.vehicle.z<18-.3);world.carWheels.forEach((w,i)=>assert.ok(w.spin.rotation.x<spin[i]));
});
