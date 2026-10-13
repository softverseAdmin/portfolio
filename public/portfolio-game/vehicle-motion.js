import * as THREE from './vendor/three.module.js';

const turn=(from,to)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
const wheelPoint=(pose,wheel)=>{
  const p=wheel.localPosition,c=Math.cos(pose.heading),s=Math.sin(pose.heading);
  return {x:pose.x+p.x*c+p.z*s,z:pose.z-p.x*s+p.z*c};
};

// Use each axle's actual travel, including the different arcs in a turn.
// A reflected collision velocity must not spin a tyre on a stationary car.
export function rollVehicleWheels(vehicle,from,to,steering){
  const middle=from.heading+turn(from.heading,to.heading)/2;
  for(const wheel of vehicle.carWheels){
    const steer=wheel.front?steering:0,a=wheelPoint(from,wheel),b=wheelPoint(to,wheel),angle=middle+steer;
    const distance=(b.x-a.x)*Math.sin(angle)+(b.z-a.z)*Math.cos(angle);
    (wheel.steer??wheel.group).rotation.y=steer;
    (wheel.spin??wheel.group).rotation.x+=distance/wheel.radius;
  }
}

function contactSamples(wheel){
  if(wheel.contactSamples)return wheel.contactSamples;
  const spin=wheel.spin??wheel.group;spin.updateWorldMatrix(true,true);
  // Keep support points across the tread and both shoulders of the supplied mesh.
  // This runs once; suspension never scans the high-resolution tyre per frame.
  const slopes=[-.3,-.15,0,.15,.3],metrics=new Float64Array(128*5),points=new Float32Array(128*15),used=new Uint8Array(128*5),v=new THREE.Vector3();metrics.fill(-Infinity);
  const retain=(slot)=>{used[slot]=1;const at=slot*3;points[at]=v.x;points[at+1]=v.y;points[at+2]=v.z;};
  for(const tire of wheel.meshes??[wheel.tire]){
   const relative=spin.matrixWorld.clone().invert().multiply(tire.matrixWorld),p=tire.geometry.attributes.position,index=tire.geometry.index;
   for(let i=0;i<(index?.count??p.count);i++){
    v.fromBufferAttribute(p,index?.getX(i)??i).applyMatrix4(relative);
    const bin=Math.min(127,Math.floor((Math.atan2(v.y,v.z)+Math.PI)/(2*Math.PI)*128)),angle=(bin+.5)/128*2*Math.PI-Math.PI,radius=v.y*Math.sin(angle)+v.z*Math.cos(angle);
    for(let j=0;j<slopes.length;j++){const at=bin*5+j,score=radius+v.x*slopes[j];if(score>metrics[at]){metrics[at]=score;retain(at);}}
   }
  }
  const result=new Float32Array(used.reduce((a,b)=>a+b,0)*3);let next=0;
  for(let i=0;i<used.length;i++)if(used[i])for(let j=0;j<3;j++)result[next++]=points[i*3+j];
  return wheel.contactSamples=result;
}

export function wheelLowestPoint(wheel){
  const samples=contactSamples(wheel),spin=wheel.spin??wheel.group;spin.updateWorldMatrix(true,false);
  const e=spin.matrixWorld.elements;let lowest=Infinity;
  for(let i=0;i<samples.length;i+=3)lowest=Math.min(lowest,e[1]*samples[i]+e[5]*samples[i+1]+e[9]*samples[i+2]+e[13]);
  return lowest;
}

export function alignVehicleWheels(vehicle,groundAt){
  vehicle.car.updateMatrixWorld(true);
  for(const wheel of vehicle.carWheels){
    const group=wheel.group;wheel.pivotRestY??=group.position.y;group.position.y=wheel.pivotRestY;group.updateWorldMatrix(true,true);
    const center=group.getWorldPosition(new THREE.Vector3()),offset=(groundAt(center.x,center.z)-wheelLowestPoint(wheel))/Math.max(.5,group.parent.matrixWorld.elements[5]);
    // Body pitch/roll already accounts for the hill. Correct only the remaining
    // contact error, rather than adding the entire slope to each wheel twice.
    group.position.y+=THREE.MathUtils.clamp(offset,-.14,.14);group.updateWorldMatrix(true,true);
  }
}
