import * as THREE from './vendor/three.module.js';
import {BOUNDS,angleLerp,floorAt,horizontalDistance,isBlocked,moveWithCollisions} from './core.js';

export const ARRIVAL_HOST={x:0,y:.13,z:5.1};
export const WELCOME_HOST={x:0,y:.13,z:10.55};
export const VISIT_OBJECTIVES={
  arrived:{step:'01 / THE ARRIVAL',title:'Ring the doorbell',hint:'Walk to the glass entrance. Press E at the bell on the right.'},
  answering:{step:'01 / THE ARRIVAL',title:'Rabin is coming',hint:'The bell has rung. Wait on the porch.'},
  opening:{step:'01 / THE ARRIVAL',title:'The door is opening',hint:'Leave the doorway clear so Rabin can welcome you.'},
  approaching:{step:'02 / FIRST MEETING',title:'Meet your host',hint:'Leave room for Rabin to step onto the porch.'},
  invited:{step:'02 / FIRST MEETING',title:'Say hello to Rabin',hint:'Walk up to your host and press E to greet him.'},
  greeting:{step:'02 / FIRST MEETING',title:'Welcome to the house',hint:'Share a greeting, then choose a tour or explore freely.'},
  welcomed:{step:'03 / MAKE YOURSELF AT HOME',title:'Choose your own visit',hint:'Follow Rabin to the living room or explore at your own pace.'}
};

export function arrivalSpawn(world){
  world.car.updateMatrixWorld(true);
  for(const local of [[2.4,0,-3.2],[1.85,0,-.15],[2.4,0,-.15],[0,0,-3.2]]){
    const p=new THREE.Vector3(...local).applyMatrix4(world.car.matrixWorld);
    p.y=floorAt(p.x,p.z,0);
    if(!isBlocked(p.x,p.z,p.y,world.blockers))return {x:p.x,y:p.y,z:p.z};
  }
  return {x:14,y:.02,z:21};
}

export function carExitSpot(world,side=1){
  world.car.updateMatrixWorld(true);
  for(const [x,z,exitSide] of [[side*2.65,-.15,side],[-side*2.65,-.15,-side],[0,-3.2,side]]){
    const p=new THREE.Vector3(x,0,z).applyMatrix4(world.car.matrixWorld);p.y=floorAt(p.x,p.z,0);
    if(p.x>BOUNDS.minX+.5&&p.x<BOUNDS.maxX-.5&&p.z>BOUNDS.minZ+.5&&p.z<BOUNDS.maxZ-.5&&!isBlocked(p.x,p.z,p.y,world.blockers))return {position:{x:p.x,y:p.y,z:p.z},side:exitSide};
  }
  return null;
}

export function actorBlocker(actor,radius=.32){
  return {minX:actor.x-radius,maxX:actor.x+radius,minZ:actor.z-radius,maxZ:actor.z+radius,minY:actor.y,maxY:actor.y+1.76};
}

export function walkArrivalRoute(position,target,dt,blockers,speed=2.15,radius=.32){
  const distance=horizontalDistance(position,target);
  if(distance<.06||dt<=0)return {position:{...position},speed:0,done:distance<.06};
  const step=Math.min(distance,speed*dt),next=moveWithCollisions(position,(target.x-position.x)/distance*step,(target.z-position.z)/distance*step,blockers,radius);
  next.y=floorAt(next.x,next.z,position.y);
  return {position:next,speed:horizontalDistance(position,next)/dt,done:horizontalDistance(next,target)<.06};
}

export function greetingApproach(world,host,from,target){
  const blockers=[...world.blockers,actorBlocker(host.position,.29)];
  const side=target.x>=host.position.x?1:-1;
  const paths=[
    [target],
    [{x:host.position.x+side*1.25,z:from.z},{x:host.position.x+side*1.25,z:target.z},target],
    [{x:host.position.x-side*1.25,z:from.z},{x:host.position.x-side*1.25,z:target.z},target]
  ];
  for(const path of paths){
    let previous={...from},clear=true;
    for(const point of path){
      const steps=Math.max(1,Math.ceil(horizontalDistance(previous,point)/.06));
      for(let i=1;i<=steps;i++){
        const x=previous.x+(point.x-previous.x)*i/steps,z=previous.z+(point.z-previous.z)*i/steps,y=floorAt(x,z,previous.y);
        if(isBlocked(x,z,y,blockers)){clear=false;break;}
      }
      if(!clear)break;
      previous={x:point.x,y:floorAt(point.x,point.z,previous.y),z:point.z};
    }
    if(clear)return path.map(p=>({x:p.x,y:floorAt(p.x,p.z,from.y),z:p.z}));
  }
  return null;
}

export function createArrival(world,host){
  const front=world.doors.find(d=>d.id==='front');
  const progress={stage:'arrived',time:0};
  host.position.set(ARRIVAL_HOST.x,ARRIVAL_HOST.y,ARRIVAL_HOST.z);host.rotation.y=0;
  function setStage(stage){progress.stage=stage;progress.time=0;}
  function ring(){
    if(progress.stage!=='arrived')return false;
    setStage('answering');return true;
  }
  function update(dt,visitor){
    progress.time+=dt;
    const stage=progress.stage;
    if(stage==='answering'&&progress.time>=.8){
      front.open=true;front.blocker.active=false;front.group.userData.open=true;setStage('opening');
    }else if(stage==='opening'&&Math.abs(front.group.rotation.y-front.angle)<.08)setStage('approaching');
    let speed=0;
    if(progress.stage==='approaching'){
      const result=walkArrivalRoute(host.position,WELCOME_HOST,dt,[...world.blockers,actorBlocker(visitor)],2.15,.25);
      host.position.set(result.position.x,result.position.y,result.position.z);speed=result.speed;
      host.rotation.y=angleLerp(host.rotation.y,0,1-Math.exp(-10*dt));
      if(result.done)setStage('invited');
    }
    if(progress.stage==='invited')host.rotation.y=angleLerp(host.rotation.y,Math.atan2(visitor.x-host.position.x,visitor.z-host.position.z),1-Math.exp(-4*dt));
    if(world.doorbell){
      const waiting=['answering','opening','approaching'].includes(progress.stage);
      world.doorbell.button.position.z=progress.stage==='answering'?.041:.048;
      world.doorbell.light.material.emissiveIntensity=waiting?1.3:.55;
      world.doorbell.marker.visible=progress.stage==='arrived';
    }
    return speed;
  }
  function greet(){if(progress.stage!=='invited')return false;setStage('greeting');return true;}
  function finish(){if(!['invited','greeting'].includes(progress.stage))return false;setStage('welcomed');return true;}
  function resume(){
    if(progress.stage!=='arrived')return false;
    setStage('welcomed');host.position.set(WELCOME_HOST.x,WELCOME_HOST.y,WELCOME_HOST.z);front.open=true;front.group.rotation.y=front.angle;front.group.userData.open=true;front.blocker.active=false;
    if(world.doorbell)world.doorbell.marker.visible=false;return true;
  }
  return {progress,ring,update,greet,finish,resume};
}
