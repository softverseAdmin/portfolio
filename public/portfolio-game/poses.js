import * as THREE from './vendor/three.module.js';
import {floorAt,isBlocked} from './core.js';

function hipOffset(character,id){
  const rig=character.userData.rig,track=rig?.asset.motions?.clips.get(id)?.tracks.find(t=>t.name===rig.bones.Hips.name+'.position');
  if(!track)return new THREE.Vector3(0,id==='drive'?.62:.45,0);
  const index=id==='sit'?track.values.length-3:0;
  return new THREE.Vector3().fromArray(track.values,index).multiplyScalar(rig.asset.scale).add(rig.asset.offset).applyQuaternion(character.quaternion);
}
export function rootForHip(character,hip,id){return hip.clone().sub(hipOffset(character,id));}

export function chairPose(character,seat){
  seat.mesh.updateMatrixWorld(true);
  const local=new THREE.Vector3(...seat.local);local.z=Math.max(local.z,(seat.mesh.userData.bounds?.depth??1)*.5-.36);
  const surface=seat.mesh.localToWorld(local);
  const height=character.userData.rig?.model.userData.appearance?.height??1.75;
  const hip=surface.clone().add(new THREE.Vector3(0,.16*height/1.75,0));
  const heading=seat.mesh.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),seat.heading));
  const ankle=character.userData.rig?.standingAnkleHeight??.083;
  const feet=[-.16,.16].map(x=>{const p=new THREE.Vector3(x,0,.46).applyQuaternion(heading).add(surface);p.y=floorAt(p.x,p.z,seat.mesh.position.y)+ankle;return p;});
  return {surface,hip,feet,root:rootForHip(character,hip,'sit')};
}

export function chairContact(character,seat,blockers){
  const feet=chairPose(character,seat).feet,center=feet[0].clone().add(feet[1]).multiplyScalar(.5);
  const facing=new THREE.Vector3(0,0,1).applyQuaternion(seat.mesh.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),seat.heading)));
  const others=blockers.filter(b=>{for(let node=b.mesh;node;node=node.parent)if(node===seat.mesh)return false;return true;});
  for(const offset of [0,.06,.12,.18]){const p=center.clone().addScaledVector(facing,-offset);p.y=floorAt(p.x,p.z,seat.mesh.position.y);if(!isBlocked(p.x,p.z,p.y,others))return p;}
  return null;
}

export function driverPose(character,vehicle){
  vehicle.car.updateMatrixWorld(true);const matrix=vehicle.car.matrixWorld;
  const height=character.userData.rig?.model.userData.appearance?.height??1.75;
  const hip=vehicle.seatHipLocal.clone();hip.y-=Math.min(.06,Math.max(0,height-1.75)*.7);hip.applyMatrix4(matrix);
  return {hip,root:rootForHip(character,hip,'drive'),steeringTargets:vehicle.steeringTargets.map(p=>p.clone().applyMatrix4(matrix)),pedalTargets:vehicle.pedalTargets.map(p=>p.clone().applyMatrix4(matrix))};
}

export function chairExit(character,seat,blockers,previous=null){
  seat.mesh.updateMatrixWorld(true);
  for(const local of [seat.approach,[0,0,1.4],[.7,0,1.1],[-.7,0,1.1],[1.15,0,.8],[-1.15,0,.8],[1.2,0,.25],[-1.2,0,.25]]){
    const p=seat.mesh.localToWorld(new THREE.Vector3(...local));p.y=floorAt(p.x,p.z,seat.mesh.position.y);
    if(!isBlocked(p.x,p.z,p.y,blockers))return p;
  }
  if(previous&&!isBlocked(previous.x,previous.z,previous.y,blockers))return new THREE.Vector3(previous.x,previous.y,previous.z);
  return null;
}
