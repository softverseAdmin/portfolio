import {approachHeight} from './terrain.js';
export const CROUCH_HEIGHT=1.14;
// Both actors must use the same clearance when either one approaches the other.
export const VISITOR_RADIUS=.32,HOST_RADIUS=.28;
export const HOUSE = { minX: -12, maxX: 12, minZ: -10, maxZ: 9 };
export const BOUNDS = { minX: -26, maxX: 26, minZ: -25, maxZ: 88 };
export {CHAPTERS} from './portfolio.js';

export function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
export function horizontalDistance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
export function angleLerp(a,b,t){return a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;}

export function roomAt(x,z,y=0){
  if(z>32)return {name:'The road to Rabin’s house',hint:'Follow the winding road toward the house. Park in the driveway.'};
  if(y>2.8 && x>2 && z<2 && x<12 && z>-10)return {name:'The upstairs retreat',hint:'A quieter space for future plans.'};
  if(z<-10 && Math.abs(x)<11)return {name:'The rear terrace',hint:'Take a breath. Find out what comes next.'};
  if(x<-12 && z<0)return {name:'The basketball court',hint:'Pick up the ball with E. Aim toward the hoop and throw.'};
  if(x>12)return {name:'The garden & garage',hint:'Take the wheel, try bowling, or practice on the training bag.'};
  if(z>9 || Math.abs(x)>12)return {name:'The front garden',hint:'Your host is waiting at the door.'};
  if(Math.abs(x)<2)return {name:'The entrance hall',hint:'Choose a room, or follow Rabin’s tour.'};
  if(x<-2 && z>0)return {name:'The living room',hint:'Meet Rabin. Sit down, play the piano, make yourself at home.'};
  if(x<-2)return {name:'The study',hint:'The books and timeline tell a career story.'};
  if(z<0)return {name:'The project studio',hint:'Walk up to a screen to explore a project.'};
  return {name:'The technology room',hint:'Explore the skills wall. Try the arcade.'};
}

export function floorAt(x,z,y=0){
  // The stair strip connects the ground floor to the rear mezzanine.
  if(x>9 && x<11.3 && z>=1.5 && z<=8.1)return .13+clamp((8.1-z)/6.6,0,1)*3.4;
  if(x>=2.3 && x<=12 && z>=-10 && z<=1.7 && y>=2.85)return 3.53;
  if(Math.abs(x)<=12 && z>=-10 && z<=9)return .13;
  if(Math.abs(x)<3.95 && z>9 && z<=12.5)return .13;
  if(Math.abs(x)<3.3 && z>12.5 && z<15.8)return Math.max(.02,.13-(z-12.5)*.033);
  return approachHeight(x,z);
}

export function overlapsBlocker(x,z,radius,b){
  if(b.obb){
    const {x:cx,z:cz,halfX,halfZ,yaw}=b.obb,c=Math.cos(yaw),s=Math.sin(yaw),dx=x-cx,dz=z-cz;
    const lx=dx*c-dz*s,lz=dx*s+dz*c;
    return Math.hypot(Math.max(0,Math.abs(lx)-halfX),Math.max(0,Math.abs(lz)-halfZ))<radius;
  }
  return x+radius>b.minX&&x-radius<b.maxX&&z+radius>b.minZ&&z-radius<b.maxZ;
}

export function isBlocked(x,z,y,blockers,radius=.32,height=1.76){
  return blockers.some(b=>b.active!==false && !b.carOnly && y+height>b.minY && y+.08<b.maxY && overlapsBlocker(x,z,radius,b));
}

export function supportHeight(position,blockers,radius=.29){
  let result=floorAt(position.x,position.z,position.y);
  for(const b of blockers)if(b.active!==false&&!b.carOnly&&!b.host&&b.maxY<=position.y+.18&&b.maxY>result&&overlapsBlocker(position.x,position.z,radius,b))result=b.maxY;
  return result;
}

export function ceilingHeight(position,blockers,height=1.76,radius=.29){
  let result=Infinity;
  for(const b of blockers)if(b.active!==false&&!b.carOnly&&b.minY>=position.y+height-.04&&overlapsBlocker(position.x,position.z,radius,b))result=Math.min(result,b.minY);
  return result;
}

export function moveWithCollisions(position,dx,dz,blockers,radius=.32,height=1.76){
  const result={...position};
  // Small substeps also stop sprinting and driving through thin walls.
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.12));
  for(let i=0;i<steps;i++){
    const nx=clamp(result.x+dx/steps,BOUNDS.minX+radius,BOUNDS.maxX-radius);
    if(!isBlocked(nx,result.z,result.y,blockers,radius,height))result.x=nx;
    const nz=clamp(result.z+dz/steps,BOUNDS.minZ+radius,BOUNDS.maxZ-radius);
    if(!isBlocked(result.x,nz,result.y,blockers,radius,height))result.z=nz;
  }
  return result;
}

export function memoryDeck(random=Math.random){
  const cards=['⌘','☁','◈','⚡','⌂','✦','⌘','☁','◈','⚡','⌂','✦'];
  for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return cards;
}

export function ballisticVelocity(from,to,flightTime=1,gravity=9.82){
  return {x:(to.x-from.x)/flightTime,y:(to.y-from.y)/flightTime+.5*gravity*flightTime,z:(to.z-from.z)/flightTime};
}

export function basketballLaunch(from,hoop,power=.4){
  const distance=horizontalDistance(from,hoop),rise=Math.max(0,hoop.y-from.y);
  // A steep approach clears the front rim. Compensate for the fixed-step integrator.
  const time=clamp(Math.sqrt(2*(rise+distance*2.1)/9.82)*(.97+clamp(power,0,1)*.06),1.05,2.6);
  const velocity=ballisticVelocity(from,hoop,time);velocity.y+=9.82/120;return velocity;
}

export function scoredBasket(from,to,hoop){
  if(from.y<=hoop.y||to.y>hoop.y)return false;
  const t=(from.y-hoop.y)/(from.y-to.y);
  return Math.hypot(from.x+(to.x-from.x)*t-hoop.x,from.z+(to.z-from.z)*t-hoop.z)<.105;
}

export function canSeeInteraction(actor,candidate,blockers){
  const fromY=actor.y+1.2,toY=candidate.y+.6;
  for(let step=1;step<16;step++){
    const t=step/16,x=actor.x+(candidate.x-actor.x)*t,z=actor.z+(candidate.z-actor.z)*t,y=fromY+(toY-fromY)*t;
    if(blockers.some(b=>!b.carOnly&&!(candidate.action==='car'&&b.vehicle)&&b!==candidate.blocker&&(!candidate.doorId||b.doorId!==candidate.doorId)&&b.active!==false&&overlapsBlocker(x,z,.005,b)&&y>b.minY&&y<b.maxY))return false;
  }
  return true;
}

export function chooseInteraction(actor,heading,candidates,blockers){
  let result=null,best=Infinity;
  for(const candidate of candidates){
    if(Math.abs(actor.y-candidate.y)>1.65)continue;
    const dx=candidate.x-actor.x,dz=candidate.z-actor.z,d=Math.hypot(dx,dz);
    const dot=d<.01?1:(Math.sin(heading)*dx+Math.cos(heading)*dz)/d;
    if(d>candidate.radius||(dot<-.45&&d>.75)||!canSeeInteraction(actor,candidate,blockers))continue;
    const score=d/candidate.radius+(1-dot)*.38;
    if(score<best){result=candidate;best=score;}
  }
  return result;
}

export function stepVehicle(vehicle,input,dt,blockers){
  const next={...vehicle},oldHeading=vehicle.heading;const forward=clamp(input.forward,-1,1),steer=clamp(input.steer,-1,1);
  const previousSpeed=next.vx*Math.sin(oldHeading)+next.vz*Math.cos(oldHeading);let speed=previousSpeed;
  speed=clamp(speed+forward*10*dt,-5.5,12.5);
  if(Math.abs(forward)<.05)speed*=Math.exp(-.65*dt);
  if(input.brake)speed*=Math.exp(-3.5*dt);
  const heading=next.heading-steer*1.8*clamp(Math.abs(speed)/3,0,1)*dt*(speed<0?-1:1);
  if(!vehicleBlocked(next.x,next.z,heading,blockers,next.bounds))next.heading=heading;
  const targetDirection=next.heading+(speed<0?Math.PI:0),traction=1-Math.exp(-(input.brake?1.8:10)*dt);
  const direction=Math.hypot(next.vx,next.vz)<.03||previousSpeed*speed<=0?targetDirection:angleLerp(Math.atan2(next.vx,next.vz),targetDirection,traction);
  next.vx=Math.sin(direction)*Math.abs(speed);next.vz=Math.cos(direction)*Math.abs(speed);
  const moved={x:next.x,z:next.z};
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(next.vx*dt),Math.abs(next.vz*dt))/.12));
  for(let i=0;i<steps;i++){
    const x=moved.x+next.vx*dt/steps,z=moved.z+next.vz*dt/steps;
    if(!vehicleBlocked(x,moved.z,next.heading,blockers,next.bounds))moved.x=x;
    if(!vehicleBlocked(moved.x,z,next.heading,blockers,next.bounds))moved.z=z;
  }
  next.impact=0;
  if(Math.abs(moved.x-next.x-next.vx*dt)>.01){next.impact=Math.max(next.impact,Math.abs(next.vx));next.vx*=-.12;}
  if(Math.abs(moved.z-next.z-next.vz*dt)>.01){next.impact=Math.max(next.impact,Math.abs(next.vz));next.vz*=-.12;}
  if(next.impact>0)next.impactPoint={x:next.x+next.vx*dt,z:next.z+next.vz*dt};
  next.x=moved.x;next.z=moved.z;return next;
}

export function vehicleBlocked(x,z,heading,blockers,bounds){
  const rx=Math.cos(heading),rz=-Math.sin(heading),fx=Math.sin(heading),fz=Math.cos(heading),width=bounds?.halfWidth??1.04,length=bounds?.halfLength??2.43;
  const extentX=Math.abs(rx)*width+Math.abs(fx)*length,extentZ=Math.abs(rz)*width+Math.abs(fz)*length;
  if(x-extentX<BOUNDS.minX||x+extentX>BOUNDS.maxX||z-extentZ<BOUNDS.minZ||z+extentZ>BOUNDS.maxZ)return true;
  const ground=floorAt(x,z);
  return blockers.some(b=>{
    if(b.active===false||b.dynamic||b.vehicle||b.minY>ground+(bounds?.height??1.91)||b.maxY<ground+.13)return false;
    const bx=b.obb?.halfX??(b.maxX-b.minX)/2,bz=b.obb?.halfZ??(b.maxZ-b.minZ)/2,dx=x-(b.obb?.x??(b.maxX+b.minX)/2),dz=z-(b.obb?.z??(b.maxZ+b.minZ)/2),a=b.obb?.yaw??0,brx=Math.cos(a),brz=-Math.sin(a),bfx=Math.sin(a),bfz=Math.cos(a);
    return Math.abs(dx*rx+dz*rz)<width+bx*Math.abs(rx*brx+rz*brz)+bz*Math.abs(rx*bfx+rz*bfz)&&Math.abs(dx*fx+dz*fz)<length+bx*Math.abs(fx*brx+fz*brz)+bz*Math.abs(fx*bfx+fz*bfz)&&Math.abs(dx*brx+dz*brz)<bx+width*Math.abs(rx*brx+rz*brz)+length*Math.abs(fx*brx+fz*brz)&&Math.abs(dx*bfx+dz*bfz)<bz+width*Math.abs(rx*bfx+rz*bfz)+length*Math.abs(fx*bfx+fz*bfz);
  });
}

export function passedCheckpoint(from,to,checkpoint,radius=2.7){
  const dx=to.x-from.x,dz=to.z-from.z,len=dx*dx+dz*dz;
  const t=len===0?0:clamp(((checkpoint.x-from.x)*dx+(checkpoint.z-from.z)*dz)/len,0,1);
  return Math.hypot(from.x+dx*t-checkpoint.x,from.z+dz*t-checkpoint.z)<radius;
}
