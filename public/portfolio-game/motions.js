import * as THREE from './vendor/three.module.js';
import {receiveAsset} from './asset-transfer.js';

const essential=['idle','walk','start-walk','jump','talk','talk-alt','sit','stand','sit-idle','carry-walk','carry-idle','box-walk','box-idle','enter-car','drive','exit-car'];
export async function loadMotionLibrary({initial=essential,catalogURL=new URL('./assets/characters/animation-catalog.json',import.meta.url),baseURL,signal}={}){
  const url=new URL(catalogURL,import.meta.url),catalog=await receiveAsset(url,null,()=>{},signal);
  const library={catalog,baseURL:new URL(baseURL??'.',url).href,signal,clips:new Map(),pending:new Map(),failures:[]};
  await Promise.allSettled(initial.filter(id=>catalog.clips.some(c=>c.id===id)).map(id=>loadMotion(library,id)));
  return library;
}
export function warmMotionLibrary(library){return library?Promise.allSettled(essential.filter(id=>library.catalog.clips.some(c=>c.id===id)).map(id=>loadMotion(library,id))):Promise.resolve([]);}
export async function loadMotion(library,id){
  if(library.clips.has(id))return library.clips.get(id);
  if(library.pending.has(id))return library.pending.get(id);
  const entry=library.catalog.clips.find(c=>c.id===id);
  if(!entry)throw new Error('This motion is unavailable: '+id);
  const promise=(async()=>{
    const data=await receiveAsset(new URL(entry.src,library.baseURL??new URL('./assets/characters/',import.meta.url)),null,()=>{},library.signal);
    const clip=THREE.AnimationClip.parse(data);
    library.clips.set(id,clip);return clip;
  })();
  library.pending.set(id,promise);
  try{return await promise;}catch(error){library.failures.push({id,error:error.message});throw error;}
  finally{library.pending.delete(id);}
}
export function actionDuration(character,id,fallback=1){
  return character?.userData.rig?.asset.motions?.clips.get(id)?.duration??fallback;
}
function available(rig,id,fallback='idle'){
  return rig.asset.motions?.clips.has(id)?id:rig.asset.motions?.clips.has(fallback)?fallback:null;
}
function prepareSprint(rig){
  const clips=rig.asset.motions?.clips;if(!clips||clips.has('run')||!clips.has('walk'))return;
  // A runtime gait derived from the supplied walk; the 46-entry source catalog stays intact.
  const clip=clips.get('walk').clone();clip.name='Adapted sprint with planted foot contacts';
  const duration=clip.duration;clip.duration=.58;for(const track of clip.tracks)for(let i=0;i<track.times.length;i++)track.times[i]*=.58/duration;
  for(const track of clip.tracks){
    if(!track.name.endsWith('.quaternion'))continue;
    const name=track.name.replace('mixamorig','').replace('.quaternion',''),rest=rig.idle.find(p=>p.bone===rig.bones[name])?.quaternion;
    const factor=/UpLeg|Leg$/.test(name)?1.38:/Arm$/.test(name)?1.3:1;
    if(!rest||factor===1)continue;
    for(let i=0;i<track.values.length;i+=4){const q=new THREE.Quaternion().fromArray(track.values,i),delta=rest.clone().invert().multiply(q);if(delta.w<0)delta.set(-delta.x,-delta.y,-delta.z,-delta.w);const angle=2*Math.acos(THREE.MathUtils.clamp(delta.w,-1,1)),axis=new THREE.Vector3(delta.x,delta.y,delta.z);if(axis.lengthSq()>1e-8)rest.clone().multiply(new THREE.Quaternion().setFromAxisAngle(axis.normalize(),angle*factor)).normalize().toArray(track.values,i);}
  }
  clips.set('run',clip);
}
function snapshot(rig){
  return rig.idle.map(({bone})=>({position:bone.position.clone(),quaternion:bone.quaternion.clone()}));
}
export function restoreSamplePose(rig){
  if(!rig.motion.basePose)return;
  rig.idle.forEach(({bone},i)=>{
    bone.position.copy(rig.motion.basePose[i].position);bone.quaternion.copy(rig.motion.basePose[i].quaternion);
  });
}
export function rememberSamplePose(rig){rig.motion.basePose=snapshot(rig);}
export function sampleMotion(character,id,time,blend=1){
  const rig=character.userData.rig,clip=rig.asset.motions?.clips.get(id);
  if(!clip)return false;
  const state=rig.motion;
  // Constant animation tracks do not overwrite external bone edits. Restore the
  // previous sampled pose before applying this frame's clip and procedural IK.
  restoreSamplePose(rig);
  let action=state.actions.get(id);
  if(!action){action=rig.mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();state.actions.set(id,action);}
  for(const other of state.actions.values()){other.enabled=false;other.setEffectiveWeight(0);}
  rig.action.enabled=false;
  action.enabled=true;action.paused=false;action.setEffectiveWeight(1);
  action.time=THREE.MathUtils.clamp(time,0,clip.duration);rig.mixer.update(0);
  rememberSamplePose(rig);
  if(blend<1&&state.from){
    rig.idle.forEach(({bone},i)=>{
      bone.position.lerpVectors(state.from[i].position,bone.position,blend);
      bone.quaternion.slerpQuaternions(state.from[i].quaternion,bone.quaternion,blend);
    });
  }
  state.id=id;state.sampleTime=action.time;
  state.blendedPose=snapshot(rig);
  return true;
}
export function animateMotion(character,time,speed,sitting,pose={}){
  const rig=character.userData.rig;
  if(!rig.asset.motions?.clips.size)return false;
  const state=rig.motion,dt=Math.max(0,Math.min(time-(state.lastTime??time),.05));
  if(pose.running)prepareSprint(rig);
  state.lastTime=time;
  let id='idle',sample=0,explicit=false;
  if(pose.preview){
    id=pose.preview.id;sample=pose.preview.time;explicit=true;
  }else if(pose.throwProgress!==undefined&&rig.asset.motions.clips.has('throw')){
    id='throw';sample=actionDuration(character,id)*pose.throwProgress;explicit=true;
  }else if(pose.punch&&rig.asset.motions.clips.has('punch')){
    id='punch';sample=actionDuration(character,id)*pose.punch.progress;explicit=true;
  }else if(pose.action&&(['sit','stand','enter-car','exit-car'].includes(pose.action.type)||rig.asset.motions.clips.has(pose.action.type))){
    id=pose.action.type;
    const p=THREE.MathUtils.clamp(pose.action.progress,0,1);
    sample=actionDuration(character,id)*(id==='stand'?Math.min(1,p/.7):id==='sit'?Math.max(0,(p-.32)/.68):p);explicit=true;
    if(id==='sit'&&p<.32&&speed>.12){id='walk';sample=actionDuration(character,'walk')*p/.32*.7;}
    if(id==='stand'&&pose.action.progress>.7&&speed>.12){id='walk';sample=actionDuration(character,'walk')*(pose.action.progress-.7)/.3*.45;}
  }else if(pose.driving){id='drive';}
  else if(pose.jumpProgress!==undefined||pose.airborne){
    id='jump';sample=actionDuration(character,id)*THREE.MathUtils.clamp(pose.jumpProgress??.5,0,1);explicit=true;
  }else if(sitting){id='sit-idle';}
  else if(pose.crouching){id='idle';}
  else if(pose.talking){id=available(rig,character.userData.host?'talk':'talk-alt','talk');}
  else if(pose.waving&&rig.asset.motions.clips.has('wave')){id='wave';}
  else if(pose.carry){id=speed>.12?(pose.twoHands?'box-walk':'carry-walk'):(pose.twoHands?'box-idle':'carry-idle');}
  else if(speed>.12){
    if(!state.wasMoving)state.movingSince=time;
    if(time-state.movingSince<.25){id='start-walk';sample=(time-state.movingSince)*1.8;explicit=true;}
    else id=pose.running?'run':'walk';
  }
  state.wasMoving=speed>.12&&!pose.action&&!pose.driving&&!sitting&&!pose.crouching;
  id=available(rig,id);
  if(!id)return false;
  if(state.id!==id){
    state.from=state.blendedPose??state.basePose??snapshot(rig);state.blend=0;state.clock=0;
  }
  state.blend=Math.min(1,state.blend+dt/.18);
  const duration=actionDuration(character,id);
  if(!explicit){
    const height=rig.model.userData.appearance?.height??1.95,scale=height/1.95;
    const recordedSpeed=rig.asset.motions.catalog.clips.find(c=>c.id===id)?.gaitSpeed;
    const rate=recordedSpeed>0?THREE.MathUtils.clamp(speed/recordedSpeed,.35,2.7):/walk/.test(id)?Math.max(.35,Math.min(2.7,speed/(1.8*scale))):id==='run'?Math.max(.5,Math.min(1.6,speed/(4.6*height/1.75))):1;
    state.clock+=dt*rate;sample=state.clock%duration;
  }
  sampleMotion(character,id,sample,state.blend);
  // Match the last vehicle pose to the seated loop rather than carrying an FBX root offset into driving.
  if(pose.action&&['enter-car','exit-car'].includes(id)){
    const hip=rig.bones.Hips;
    const driving=rig.asset.motions.clips.get('drive')?.tracks.find(t=>t.name===rig.bones.Hips.name+'.position');
    if(driving){
      const target=driving.values[1],p=pose.action.progress;
      const amount=id==='enter-car'?THREE.MathUtils.smoothstep(p,.68,1):1-THREE.MathUtils.smoothstep(p,0,.22);
      hip.position.y=THREE.MathUtils.lerp(hip.position.y,target,amount);
    }
  }
  return true;
}
export function endGreeting(character){
  const rig=character.userData.rig;if(!rig)return;
  rig.action.enabled=false;
  rig.motion.id=null;rig.motion.lastTime=null;rig.motion.wasMoving=false;
}

// Use only the original talk clip's upper body over the supplied seated loop.
export function animateSeatedTalk(character,time,weight=.8){
  const rig=character.userData.rig,clip=rig?.asset.motions?.clips.get('talk');if(!clip)return false;
  let cached=rig.motion.seatedTalk;
  if(cached?.clip!==clip){
    const tracks=clip.tracks.filter(track=>/((Left|Right)(Arm|ForeArm|Hand[^.]*)|Spine[12]?|Neck|Head)\.quaternion$/.test(track.name)).map(track=>({bone:rig.idle.find(entry=>entry.bone.name===track.name.slice(0,-11))?.bone,sample:track.createInterpolant(),rotation:new THREE.Quaternion(),reference:new THREE.Quaternion().fromArray(track.values),additive:/Spine|Neck|Head/.test(track.name)})).filter(track=>track.bone);
    cached=rig.motion.seatedTalk={clip,tracks};
  }
  for(const track of cached.tracks){
    track.rotation.fromArray(track.sample.evaluate(time%clip.duration));
    if(track.additive){
      // Keep the original seated spine; add the talk clip's small nods rather
      // than its standing rest rotation, which can lower the head into the lap.
      const delta=track.reference.clone().invert().multiply(track.rotation),angle=new THREE.Quaternion().angleTo(delta),limit=/Spine/.test(track.bone.name)?.09:.16;
      if(angle>limit)delta.slerp(new THREE.Quaternion(),1-limit/angle);
      track.rotation.copy(track.bone.quaternion).multiply(delta);
    }
    track.bone.quaternion.slerp(track.rotation,weight);
  }
  return cached.tracks.length>0;
}
