import * as THREE from './vendor/three.module.js';

// Sweep the whole camera arm against expanded boxes, including thin walls.
// A second sweep after smoothing prevents the old position crossing a corner.
export function cameraFraction(target,desired,blockers,{radius=.14,driving=false}={}){
  let nearest=1;
  for(const box of blockers){
    if(box.active===false||box.carOnly||box.navOnly||box.host||(driving&&box.vehicle))continue;
    let start=target,end=desired,minX=box.minX,maxX=box.maxX,minZ=box.minZ,maxZ=box.maxZ;
    if(box.obb){
      const b=box.obb,c=Math.cos(b.yaw),s=Math.sin(b.yaw);
      const local=p=>({x:(p.x-b.x)*c-(p.z-b.z)*s,y:p.y,z:(p.x-b.x)*s+(p.z-b.z)*c});
      start=local(target);end=local(desired);minX=-b.halfX;maxX=b.halfX;minZ=-b.halfZ;maxZ=b.halfZ;
    }
    const limits=[[minX-radius,maxX+radius],[box.minY-radius,box.maxY+radius],[minZ-radius,maxZ+radius]];
    let enter=0,leave=1,hit=true;
    for(let i=0;i<3;i++){
      const axis=['x','y','z'][i],a=start[axis],d=end[axis]-a,[lo,hi]=limits[i];
      if(Math.abs(d)<1e-9){if(a<lo||a>hi){hit=false;break;}}
      else{let first=(lo-a)/d,last=(hi-a)/d;if(first>last)[first,last]=[last,first];enter=Math.max(enter,first);leave=Math.min(leave,last);if(enter>leave){hit=false;break;}}
    }
    if(hit&&leave>=0&&enter<=1)nearest=Math.min(nearest,Math.max(0,enter-.002));
  }
  return nearest;
}

export function resolveCamera(position,target,desired,blockers,dt,options={}){
  const safe=target.clone().lerp(desired,cameraFraction(target,desired,blockers,options));
  const next=position.clone().lerp(safe,1-Math.exp(-(options.smoothing??12)*dt));
  return target.clone().lerp(next,cameraFraction(target,next,blockers,options));
}

// A turn must not smooth the camera through the visitor's face. Keep the arm
// in the rear third of the view, then sweep again against the room geometry.
export function resolveVisitorCamera(position,target,desired,heading,blockers,dt,options={}){
  const next=resolveCamera(position,target,desired,blockers,dt,options),arm=next.clone().sub(target);
  const rear=heading+Math.PI,angle=Math.atan2(arm.x,arm.z);
  const offset=Math.atan2(Math.sin(angle-rear),Math.cos(angle-rear)),limit=Math.PI/6;
  if(Math.abs(offset)<=limit)return next;
  const distance=Math.hypot(arm.x,arm.z),safeAngle=rear+THREE.MathUtils.clamp(offset,-limit,limit);
  next.set(target.x+Math.sin(safeAngle)*distance,next.y,target.z+Math.cos(safeAngle)*distance);
  return target.clone().lerp(next,cameraFraction(target,next,blockers,options));
}

export function characterCameraTarget(character,{sitting=false,crouching=false}={}){
  const chest=character.userData.rig?.bones.Spine2;
  if(chest){character.updateMatrixWorld(true);return chest.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.08,0));}
  return character.position.clone().add(new THREE.Vector3(0,sitting?.82:crouching?.9:1.3,0));
}
