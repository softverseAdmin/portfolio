import * as THREE from './vendor/three.module.js';
import {clone} from './vendor/addons/utils/SkeletonUtils.js';
import {CCDIKSolver} from './vendor/addons/animation/CCDIKSolver.js';
import {floorAt} from './core.js';
import {dressCharacter} from './skins.js';
import {bindReviewedAppearance} from './model-assets.js';
import {animateMotion,animateSeatedTalk,restoreSamplePose,rememberSamplePose} from './motions.js';

const axisX=new THREE.Vector3(1,0,0),rotation=new THREE.Quaternion();
const smooth=(a,b,t)=>THREE.MathUtils.smoothstep(t,a,b);

export async function loadCharacterAsset(options={}){
  const {loadImportedCharacters}=await import('./imported-characters.js');
  return loadImportedCharacters(options);
}

export function prepareCharacterAsset(model){
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model),height=bounds.max.y-bounds.min.y;
  const clip=model.animations.filter(c=>c.duration>0&&c.tracks.length).sort((a,b)=>b.duration-a.duration)[0];
  if(!clip||!model.getObjectByName('mixamorigRightHand'))throw new Error('The character needs a rig and a greeting clip.');
  const scale=1.95/height,center=bounds.getCenter(new THREE.Vector3());
  return {model,clip,scale,offset:new THREE.Vector3(-center.x*scale,-bounds.min.y*scale,-center.z*scale)};
}

export function createRiggedCharacter(asset,{host=false}={}){
  if(asset.roles)asset=asset.roles[host?'host':'visitor'];
  const character=new THREE.Group(),model=clone(asset.model),bones={},allBones=[];
  const appearance=asset.appearances?.[host?'host':'visitor'];
  if(appearance)asset={...asset,scale:appearance.nativeScale,offset:new THREE.Vector3(...appearance.nativeOffset)};
  model.scale.setScalar(asset.scale);model.position.copy(asset.offset);character.add(model);
  let skin;
  model.traverse(object=>{
    if(object.isBone){allBones.push(object);bones[object.name.replace(/^mixamorig[:_]?/,'')]??=object;}
    if(!object.isMesh)return;
    skin??=object;
    object.castShadow=object.receiveShadow=true;
    if(!asset.preserveMaterials)object.material=new THREE.MeshStandardMaterial({name:object.name,color:object.name.includes('Joints')?(host?'#192e38':'#494d40'):(host?'#29465b':'#c6a16b'),roughness:.62,metalness:.18});
  });
  if(appearance)bindReviewedAppearance(model,skin,appearance,{host});
  else if(!asset.preserveMaterials)dressCharacter(model,bones,skin,{host,texture:asset.textures?.[host?'host':'visitor']});
  if(asset.preserveMaterials)model.userData.appearance={source:'uploaded-model',height:asset.height,role:host?'host':'visitor'};
  const footRest={};
  for(const side of ['Right','Left'])footRest[side]=model.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(bones[side+'Foot'].getWorldQuaternion(new THREE.Quaternion()));
  character.userData.host=host;
  const mixer=new THREE.AnimationMixer(model),action=mixer.clipAction(asset.clip);
  action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();
  action.time=0;mixer.update(0);character.updateMatrixWorld(true);
  const idle=allBones.map(bone=>({bone,position:bone.position.clone(),quaternion:bone.quaternion.clone()}));
  const chains={},legChains={},skeleton=skin.skeleton;skeleton.boneInverses=skeleton.boneInverses.map(matrix=>matrix.clone());
  for(const side of ['Right','Left']){
    const target=new THREE.Bone();target.name=`${side}HandTarget`;model.add(target);
    const targetIndex=skeleton.bones.length;skeleton.bones.push(target);skeleton.boneInverses.push(new THREE.Matrix4());
    chains[side]={target:targetIndex,effector:skeleton.bones.indexOf(bones[`${side}Hand`]),links:[{index:skeleton.bones.indexOf(bones[`${side}ForeArm`])},{index:skeleton.bones.indexOf(bones[`${side}Arm`])}],iteration:32,maxAngle:.4};
    const footTarget=new THREE.Bone();footTarget.name=`${side}FootTarget`;model.add(footTarget);
    const footTargetIndex=skeleton.bones.length;skeleton.bones.push(footTarget);skeleton.boneInverses.push(new THREE.Matrix4());
    legChains[side]={target:footTargetIndex,effector:skeleton.bones.indexOf(bones[`${side}Foot`]),links:[{index:skeleton.bones.indexOf(bones[`${side}Leg`])},{index:skeleton.bones.indexOf(bones[`${side}UpLeg`])}],iteration:32,maxAngle:.28};
  }
  skeleton.init();
  const solver=new CCDIKSolver(skin,[...Object.values(chains),...Object.values(legChains)]);
  const standingAnkleHeight=(bones.RightFoot.getWorldPosition(new THREE.Vector3()).y+bones.LeftFoot.getWorldPosition(new THREE.Vector3()).y)/2;
  character.userData.rig={model,bones,idle,mixer,action,asset,chains,legChains,footRest,standingAnkleHeight,solver,skin,motion:{actions:new Map(),id:null,clock:0,blend:1,wasMoving:false}};
  character.userData.animate=(...args)=>animateRiggedCharacter(character,...args);
  return character;
}

function rotateBone(bone,angle){if(!bone)return;bone.quaternion.premultiply(rotation.setFromAxisAngle(axisX,angle));}
function restoreIdle(character){
  for(const {bone,position,quaternion} of character.userData.rig.idle){bone.position.copy(position);bone.quaternion.copy(quaternion);}
}
function moveHand(character,side,target,blend=1){
  const rig=character.userData.rig,chain=rig.chains[side],bone=rig.skin.skeleton.bones[chain.target];
  character.updateMatrixWorld(true);bone.position.copy(rig.model.worldToLocal(target.clone()));bone.updateMatrixWorld(true);
  rig.solver.updateOne(chain,blend);
}
function localHandTarget(character,side,x,y,z,blend=1){moveHand(character,side,character.localToWorld(new THREE.Vector3(x,y,z)),blend);}

function moveFoot(character,side,target,orientation=null){
  const rig=character.userData.rig,chain=rig.legChains[side],bone=rig.skin.skeleton.bones[chain.target];
  character.updateMatrixWorld(true);bone.position.copy(rig.model.worldToLocal(target.clone()));bone.updateMatrixWorld(true);
  rig.solver.updateOne(chain,1);
  const foot=rig.bones[side+'Foot'];
  const worldRotation=orientation??rig.model.getWorldQuaternion(new THREE.Quaternion()).multiply(rig.footRest[side]);
  foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(worldRotation));
}

function bendLimb(character,side,target,orientation,arm=false){
  const b=character.userData.rig.bones,upper=b[side+(arm?'Arm':'UpLeg')],knee=b[side+(arm?'ForeArm':'Leg')],foot=b[side+(arm?'Hand':'Foot')];
  character.updateMatrixWorld(true);
  const a=upper.getWorldPosition(new THREE.Vector3()),oldKnee=knee.getWorldPosition(new THREE.Vector3()),oldFoot=foot.getWorldPosition(new THREE.Vector3());
  const first=a.distanceTo(oldKnee),second=oldKnee.distanceTo(oldFoot),direction=target.clone().sub(a);
  const distance=THREE.MathUtils.clamp(direction.length(),.001,first+second-.001);direction.normalize();
  const forward=new THREE.Vector3(0,arm?-.6:0,arm?-1:1).applyQuaternion(character.getWorldQuaternion(new THREE.Quaternion()));
  const bend=forward.addScaledVector(direction,-forward.dot(direction)).normalize();
  const along=(first*first-second*second+distance*distance)/(2*distance);
  const nextKnee=a.clone().addScaledVector(direction,along).addScaledVector(bend,Math.sqrt(Math.max(0,first*first-along*along)));
  const upperDelta=new THREE.Quaternion().setFromUnitVectors(oldKnee.sub(a).normalize(),nextKnee.clone().sub(a).normalize());
  const upperWorld=upperDelta.multiply(upper.getWorldQuaternion(new THREE.Quaternion()));
  upper.quaternion.copy(upper.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(upperWorld));
  upper.updateMatrixWorld(true);
  const kneePosition=knee.getWorldPosition(new THREE.Vector3()),footPosition=foot.getWorldPosition(new THREE.Vector3());
  const kneeDelta=new THREE.Quaternion().setFromUnitVectors(footPosition.sub(kneePosition).normalize(),target.clone().sub(kneePosition).normalize());
  const kneeWorld=kneeDelta.multiply(knee.getWorldQuaternion(new THREE.Quaternion()));
  knee.quaternion.copy(knee.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(kneeWorld));knee.updateMatrixWorld(true);
  foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(orientation));
}

function crouchPose(character,amount,time,speed){
  const {bones:b}=character.userData.rig;
  character.updateMatrixWorld(true);
  const feet=[b.LeftFoot,b.RightFoot],before=feet.map(foot=>({position:foot.getWorldPosition(new THREE.Vector3()),rotation:foot.getWorldQuaternion(new THREE.Quaternion())}));
  for(const side of ['Left','Right']){
    rotateBone(b[side+'UpLeg'],-1.28*amount);
    rotateBone(b[side+'Leg'],-2.55*amount);
  }
  rotateBone(b.Spine,.52*amount);rotateBone(b.Spine1,.30*amount);rotateBone(b.Neck,-.60*amount);
  character.updateMatrixWorld(true);
  feet.forEach((foot,i)=>foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(before[i].rotation)));
  character.updateMatrixWorld(true);
  const after=feet.map(foot=>foot.getWorldPosition(new THREE.Vector3()));
  const shift=new THREE.Vector3(
    (before[0].position.x+before[1].position.x-after[0].x-after[1].x)/2,
    Math.min(...before.map(foot=>foot.position.y))-Math.min(...after.map(foot=>foot.y)),
    (before[0].position.z+before[1].position.z-after[0].z-after[1].z)/2);
  b.Hips.position.copy(b.Hips.parent.worldToLocal(b.Hips.getWorldPosition(new THREE.Vector3()).add(shift)));
  if(speed>.12){
    const forward=new THREE.Vector3(0,0,1).applyQuaternion(character.getWorldQuaternion(new THREE.Quaternion()));
    const stride=.065*Math.min(1,speed/1.65)*amount;
    for(let i=0;i<2;i++){
      const phase=time*7+i*Math.PI,target=before[i].position.clone().addScaledVector(forward,Math.sin(phase)*stride);
      target.y+=Math.max(0,Math.cos(phase))*.033*amount;
      const side=i===0?'Left':'Right',hip=b[side+'UpLeg'].getWorldPosition(new THREE.Vector3());
      const ahead=target.clone().sub(hip).dot(forward);
      if(ahead<.055)target.addScaledVector(forward,.055-ahead);
      bendLimb(character,side,target,before[i].rotation);
    }
  }
  localHandTarget(character,'Right',-.23,.47,.43);localHandTarget(character,'Left',.23,.47,.43);
}

export function animateRiggedCharacter(character,time,speed=0,wave=false,sitting=false,pose={}){
  const rig=character.userData.rig,b=rig.bones;
  const vehicleBlend=pose.action?.type==='enter-car'?smooth(.68,1,pose.action.progress):pose.action?.type==='exit-car'?1-smooth(0,.22,pose.action.progress):pose.driving?1:0;
  rig.model.position.z=rig.asset.offset.z;
  const crouching=pose.crouching&&!sitting&&!pose.driving&&!pose.airborne?(typeof pose.crouching==='number'?pose.crouching:1):0;
  if(wave)pose={...pose,waving:true};
  const captured=animateMotion(character,time,speed,sitting,pose);
  if(!captured)restoreIdle(character);
  const seatBlend=pose.seatBlend??(pose.driving?1:0);
  if(pose.seatHipTarget&&seatBlend>0){character.updateMatrixWorld(true);const hip=b.Hips.getWorldPosition(new THREE.Vector3()).lerp(pose.seatHipTarget,seatBlend);b.Hips.position.copy(b.Hips.parent.worldToLocal(hip));}
  const swing=Math.sin(time*9)*Math.min(speed/3.4,1)*.55;
  if(!captured){
  b.Hips.position.y+=Math.sin(time*2)*.2;
  rotateBone(b.LeftUpLeg,sitting?-1.45:swing);rotateBone(b.RightUpLeg,sitting?-1.45:-swing);
  rotateBone(b.LeftLeg,sitting?1.4:Math.max(0,-swing)*.8);rotateBone(b.RightLeg,sitting?1.4:Math.max(0,swing)*.8);
  rotateBone(b.LeftArm,-swing*.65);rotateBone(b.RightArm,swing*.65);
  if(sitting)b.Hips.position.y-=.33/rig.asset.scale;
  if(pose.airborne){rotateBone(b.RightUpLeg,-.5);rotateBone(b.LeftUpLeg,.3);}
  }
  if(pose.kick){rotateBone(b.RightUpLeg,-1.4*Math.sin(Math.PI*pose.kick));rotateBone(b.RightLeg,-.15);}
  if(sitting&&pose.talking)animateSeatedTalk(character,time);
  if(crouching)crouchPose(character,crouching,time,speed);
  const running=!rig.asset.preserveMaterials&&pose.running&&rig.motion.id==='run'&&!pose.action&&!sitting&&!pose.airborne&&!pose.carry;
  if(running){
    rotateBone(b.Spine,.13);rotateBone(b.Spine1,.045);rotateBone(b.Neck,-.13);
    const duration=rig.asset.motions.clips.get('run').duration,cycle=rig.motion.sampleTime/duration,contact=.34;
    const height=rig.model.userData.appearance?.height??1.75,stride=Math.min(.88,speed*duration*contact),run=rig.run??={feet:[null,null]};
    const flight=(cycle% .5)>.17;
    b.Hips.position.y+=(flight?.032:-.038)*height/1.75/rig.asset.scale;
    for(const [i,side] of ['Right','Left'].entries()){
      const phase=(cycle+i*.5)%1,plant=phase<contact,old=run.feet[i];
      let target;
      if(plant){
        if(!old?.planted||phase<old.phase){target=character.localToWorld(new THREE.Vector3(i===0?-.105:.105,0,stride*.5));target.y=floorAt(target.x,target.z,character.position.y)+rig.standingAnkleHeight+.002;}
        else target=old.target.clone();
      }else{
        const t=(phase-contact)/(1-contact),ease=t*t*(3-2*t);target=character.localToWorld(new THREE.Vector3(i===0?-.105:.105,0,THREE.MathUtils.lerp(-stride*.5,stride*.5,ease)));
        target.y=floorAt(target.x,target.z,character.position.y)+rig.standingAnkleHeight+.24*height/1.75*Math.sin(Math.PI*t);
      }
      run.feet[i]={planted:plant,phase,target};character.updateMatrixWorld(true);bendLimb(character,side,target,rig.model.getWorldQuaternion(new THREE.Quaternion()).multiply(rig.footRest[side]));
    }
    const pump=Math.sin(cycle*Math.PI*2)*.27,scale=height/1.75;
    for(const [i,side] of ['Right','Left'].entries()){character.updateMatrixWorld(true);const target=character.localToWorld(new THREE.Vector3((i===0?-.27:.27)*scale,1.16*scale,(.1+(i===0?-pump:pump))*scale));bendLimb(character,side,target,b[side+'Hand'].getWorldQuaternion(new THREE.Quaternion()),true);}
  }else rig.run=null;
  if(wave&&rig.motion.id!=='wave')localHandTarget(character,'Right',-.55,1.85-crouching*.75,.06+Math.sin(time*7)*.07);
  if(pose.carry&&rig.motion.id!=='throw'){localHandTarget(character,'Right',-.24,1.26-crouching*.67,.46);if(pose.twoHands)localHandTarget(character,'Left',.24,1.26-crouching*.67,.46);}
  if(pose.reach&&rig.motion.id!=='pickup')localHandTarget(character,'Right',-.12,1.18-crouching*.7,.58,pose.reach);
  if(pose.punch&&rig.motion.id!=='punch'){const side=pose.punch.side===1?'Right':'Left',amount=Math.sin(Math.PI*pose.punch.progress);localHandTarget(character,side,side==='Right'?-.18:.18,1.4-crouching*.7,.68,amount);}
  if(vehicleBlend>0){
    rotateBone(b.Spine,.18*vehicleBlend);rotateBone(b.Spine1,.085*vehicleBlend);rotateBone(b.Neck,-.18*vehicleBlend);
    if(pose.steeringTargets){moveHand(character,'Right',pose.steeringTargets[0],vehicleBlend);moveHand(character,'Left',pose.steeringTargets[1],vehicleBlend);}
    else{localHandTarget(character,'Right',-.18,.95,.6);localHandTarget(character,'Left',.18,.95,.6);}
    if(pose.pedalTargets)for(const [i,side] of ['Right','Left'].entries()){
      character.updateMatrixWorld(true);const foot=b[side+'Foot'],target=foot.getWorldPosition(new THREE.Vector3()).lerp(pose.pedalTargets[i],vehicleBlend),orientation=foot.getWorldQuaternion(new THREE.Quaternion()).slerp(rig.model.getWorldQuaternion(new THREE.Quaternion()).multiply(rig.footRest[side]),vehicleBlend);bendLimb(character,side,target,orientation);
    }
  }
  const footBlend=pose.seatFootBlend??seatBlend;
  if(pose.seatFootTargets&&pose.seatHipTarget&&footBlend>0){
    for(const [i,side] of ['Right','Left'].entries()){character.updateMatrixWorld(true);const foot=b[side+'Foot'],target=foot.getWorldPosition(new THREE.Vector3()).lerp(pose.seatFootTargets[i],footBlend),orientation=foot.getWorldQuaternion(new THREE.Quaternion()).slerp(rig.model.getWorldQuaternion(new THREE.Quaternion()).multiply(rig.footRest[side]),footBlend);bendLimb(character,side,target,orientation);}
  }else if(sitting&&!pose.driving&&!pose.action&&pose.seatFootTargets){
    moveFoot(character,'Right',pose.seatFootTargets[0]);moveFoot(character,'Left',pose.seatFootTargets[1]);
  }
  character.updateMatrixWorld(true);
}

export function applyGreetingPose(character,time){
  const rig=character.userData.rig;
  if(!rig)return;
  restoreSamplePose(rig);
  for(const action of rig.motion.actions.values()){action.enabled=false;action.setEffectiveWeight(0);}
  rig.motion.id=null;
  rig.action.enabled=true;rig.action.setEffectiveWeight(1);rig.action.paused=false;rig.action.time=THREE.MathUtils.clamp(time,0,rig.asset.clip.duration);rig.mixer.update(0);rememberSamplePose(rig);rig.motion.blendedPose=rig.motion.basePose;character.updateMatrixWorld(true);
}

function palm(character){const bones=character.userData.rig.bones;return (bones.RightHandMiddle1??bones.RightHandIndex1??bones.RightHand).getWorldPosition(new THREE.Vector3());}

export function greetingLayout(host,visitor){
  if(!host.userData.rig||!visitor.userData.rig)return {host:host.position.clone(),visitor:host.position.clone().add(new THREE.Vector3(.62,0,.9)),duration:4};
  applyGreetingPose(host,1.8);
  const hand=host.worldToLocal(palm(host));
  const visitorPosition=host.localToWorld(new THREE.Vector3(hand.x*2,0,hand.z*2));
  animateRiggedCharacter(host,0);
  return {host:host.position.clone(),visitor:visitorPosition,duration:host.userData.rig.asset.clip.duration};
}

export function animateHandshake(host,visitor,time){
  if(!host.userData.rig||!visitor.userData.rig)return false;
  applyGreetingPose(host,time);applyGreetingPose(visitor,time);
  const grip=smooth(1.05,1.38,time)*(1-smooth(2.35,2.72,time));
  if(grip>0){
    // Preserve the captured wrist pose while bringing both palms to the same grip.
    for(let pass=0;pass<3;pass++){
      const a=palm(host),b=palm(visitor),mid=a.clone().add(b).multiplyScalar(.5);
      const separation=new THREE.Vector3().subVectors(visitor.position,host.position).normalize().multiplyScalar(.012);
      for(const [character,hand,sign] of [[host,a,-1],[visitor,b,1]]){
        const target=mid.clone().addScaledVector(separation,sign),wrist=character.userData.rig.bones.RightHand.getWorldPosition(new THREE.Vector3());
        moveHand(character,'Right',wrist.addScaledVector(target.sub(hand),grip));
      }
    }
  }
  host.updateMatrixWorld(true);visitor.updateMatrixWorld(true);return true;
}

export function handPosition(character){
  character.updateMatrixWorld(true);
  if(character.userData.rig){
    const p=character.userData.rig.bones.RightHand.getWorldPosition(new THREE.Vector3());
    p.x+=Math.sin(character.rotation.y)*.23;p.z+=Math.cos(character.rotation.y)*.23;return p;
  }
  const p=character.userData.arms[1].localToWorld(new THREE.Vector3(.02,-.48,.12));
  p.x+=Math.sin(character.rotation.y)*.17;p.z+=Math.cos(character.rotation.y)*.17;return p;
}

export function animateFallbackHandshake(host,visitor,time){
  const weight=smooth(.2,.65,time)*(1-smooth(2.9,3.5,time));
  for(const character of [host,visitor]){
    character.userData.arms[1].rotation.x=(-Math.PI/2+Math.sin(time*9)*.045)*weight;character.userData.arms[1].rotation.z=0;
  }
}
