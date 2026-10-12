import * as THREE from './vendor/three.module.js';
import {mergeGeometries} from './vendor/addons/utils/BufferGeometryUtils.js';
import {APPROACH_GRID,terrainSample,approachHeight} from './terrain.js';

export const ROAD_ROUTE=[[-16,78],[-16,65],[-7,53],[5,47],[9,39],[0,30],[5,22],[18,18]];
export const ROAD_START={x:-16,y:approachHeight(-16,78),z:78,heading:Math.PI};
export const HOUSE_PARKING={x:18,y:.02,z:18,heading:Math.PI};
const curve=new THREE.CatmullRomCurve3(ROAD_ROUTE.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
export const ROAD_SAMPLES=curve.getSpacedPoints(160);
for(const p of ROAD_SAMPLES)p.y=approachHeight(p.x,p.z);

export function journeyDirections(position){
  let index=0,distance=Infinity;
  for(let i=0;i<ROAD_SAMPLES.length;i++){const p=ROAD_SAMPLES[i],d=Math.hypot(position.x-p.x,position.z-p.z);if(d<distance){distance=d;index=i;}}
  let remaining=Math.hypot(position.x-ROAD_SAMPLES[index].x,position.z-ROAD_SAMPLES[index].z);
  for(let i=index;i<ROAD_SAMPLES.length-1;i++)remaining+=ROAD_SAMPLES[i].distanceTo(ROAD_SAMPLES[i+1]);
  const target=ROAD_SAMPLES[Math.min(index+8,ROAD_SAMPLES.length-1)];
  return {index,remaining,roadDistance:distance,offRoad:distance>5.5,heading:Math.atan2(target.x-position.x,target.z-position.z),parked:Math.hypot(position.x-HOUSE_PARKING.x,position.z-HOUSE_PARKING.z)<3.5};
}

export function createRoadDistrict(){
  const root=new THREE.Group();root.name='The summer approach';const blockers=[],treeSites=[];
  const material=(name,color,roughness=.87)=>{const m=new THREE.MeshStandardMaterial({name:'district-'+name,color,roughness});return m;};
  const asphalt=material('asphalt','#747a74'),verge=material('limestone','#c8c1b3'),line=material('line','#eee5cf'),wood=material('oak','#9a795b'),leaf=material('leaf','#6a8155'),stone=material('limestone','#c9c3b3'),plaster=material('plaster','#ece8df'),roof=material('slate','#57636a'),metal=material('metal','#303c3e',.42),glass=material('glass','#637a7d',.18),grass=material('lawn','#899a6b');
  function mesh(geometry,mat,x,y,z,parent=root){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,x,y,z,mat,parent=root){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);}
  function strip(width,offset,mat,name){
    const vertices=[],indices=[],uv=[],cross=[-width/2];
    for(let n=Math.ceil(-width/.6);n<=Math.floor(width/.6);n++){const x=n*.3;if(x>-width/2+.0001&&x<width/2-.0001)cross.push(x);}cross.push(width/2);
    ROAD_SAMPLES.forEach((p,i)=>{
      const tangent=ROAD_SAMPLES[Math.min(i+1,160)].clone().sub(ROAD_SAMPLES[Math.max(0,i-1)]);tangent.y=0;tangent.normalize();const side=new THREE.Vector3(tangent.z,0,-tangent.x);
      for(const lateral of cross){const x=p.x+lateral*side.x,z=p.z+lateral*side.z;vertices.push(x,approachHeight(x,z)+offset,z);uv.push(x/2,z/2);}
      if(i<160)for(let j=0;j<cross.length-1;j++){const k=i*cross.length+j,n=k+cross.length;indices.push(k,n,k+1,k+1,n,n+1);}
    });
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.name=name;m.receiveShadow=true;root.add(m);
  }
  const grid=APPROACH_GRID,positions=[],uv=[],indices=[],rows=(grid.maxZ-grid.minZ)/grid.step+1;
  for(let x=grid.minX;x<=grid.maxX;x+=grid.step)for(let z=grid.maxZ;z>=grid.minZ;z-=grid.step){positions.push(x,terrainSample(x,z),z);uv.push(x/3,z/3);}
  const cols=(grid.maxX-grid.minX)/grid.step+1;
  for(let x=0;x<cols-1;x++)for(let z=0;z<rows-1;z++){const i=x*rows+z;indices.push(i,i+rows,i+1,i+rows+1,i+1,i+rows);}
  const ground=new THREE.BufferGeometry();ground.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));ground.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ground.setIndex(indices);ground.computeVertexNormals();const lawn=new THREE.Mesh(ground,grass);lawn.name='Rolling neighbourhood terrain';lawn.receiveShadow=true;root.add(lawn);
  strip(10.6,.002,verge,'Roadside walking verge');strip(8.1,.004,stone,'Road edge');strip(7.2,.007,asphalt,'Winding asphalt road');
  ROAD_SAMPLES.forEach((p,i)=>{
    if(i%6!==0||i>150)return;
    const tangent=ROAD_SAMPLES[Math.min(i+1,160)].clone().sub(ROAD_SAMPLES[Math.max(0,i-1)]).normalize(),yaw=Math.atan2(tangent.x,tangent.z);
    const dash=box(.09,.004,1.3,p.x,p.y+.011,p.z,line);dash.rotation.set(Math.atan2(-tangent.y,Math.hypot(tangent.x,tangent.z)),yaw,0,'YXZ');
  });
  function blocker(x,z,w,d,top,base=approachHeight(x,z)){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:base,maxY:base+top});}
  const trees=new THREE.Group();trees.name='Neighbourhood trees';root.add(trees);root.userData.fallbackTrees=trees;
  const sites=[[-24,75],[-24,65],[-23,54],[-15,44],[-5,42],[19,50],[23,38],[-13,32],[22,77],[24,62],[-24,85],[0,84],[8,79],[4,69],[-1,62],[-22,36],[20,84]];
  for(let i=0;i<sites.length;i++){
    const [x,z]=sites[i];if(journeyDirections({x,z}).roadDistance<6.3)continue;
    const y=approachHeight(x,z),size=.88+(i%4)*.12;treeSites.push([x,y,z,size]);
    mesh(new THREE.CylinderGeometry(.11,.19,3.4,10),wood,x,y+1.7,z,trees);
    for(const [dx,dy,dz,r] of [[0,3.5,0,1.45],[-.7,4.05,.3,1.05],[.65,4.1,-.35,1.15],[.1,4.6,.1,.85]]){const crown=mesh(new THREE.IcosahedronGeometry(r,2),leaf,x+dx*size,y+dy*size,z+dz*size,trees);crown.scale.set(size,size*.8,size);}
    blocker(x,z,.42,.42,4.6);
  }
  root.userData.treeSites=treeSites;
  function hipRoof(w,d,h,x,y,z){
    const p=[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,-w*.25,h,0,w*.25,h,0];
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex([0,4,1,1,4,5,1,5,2,2,5,3,3,5,4,3,4,0]);g.computeVertexNormals();const cap=mesh(g,roof,x,y,z);cap.name='Neighbour slate hip roof';
    box(w+.12,.17,d+.12,x,y-.05,z,plaster);box(w+.15,.075,.08,x,y-.12,z+d/2,metal);box(w+.15,.075,.08,x,y-.12,z-d/2,metal);
    box(w*.5,.075,.10,x,y+h+.025,z,metal);
    for(let j=1;j<9;j++){const t=j/9;box(w*(1-.5*t),.012,.025,x,y+h*t,z+d/2*(1-t),metal);box(w*(1-.5*t),.012,.025,x,y+h*t,z-d/2*(1-t),metal);}
  }
  for(const [index,[x,z,w,d]] of [[15,68,8,7],[18,57,7,6],[-22,43,5,7],[-24,59,5,6],[17,41,6,6]].entries()){
    const y=approachHeight(x,z),house=new THREE.Group();house.name='Neighbour home '+(index+1);root.add(house);
    box(w+.3,.45,d+.3,x,y+.225,z,stone,house);box(w,3.1,d,x,y+2,z,plaster,house);box(w+.1,.13,d+.1,x,y+.6,z,stone,house);
    hipRoof(w+.8,d+.8,1.35,x,y+3.6,z);box(.48,1.35,.55,x+w*.26,y+4.15,z-.8,plaster,house);box(.6,.1,.65,x+w*.26,y+4.88,z-.8,stone,house);
    const front=z+d/2+.015;
    for(const dx of [-w*.28,w*.28]){
      box(1.24,1.48,.08,x+dx,y+2.15,front,glass,house);
      for(const sx of [-.66,0,.66])box(.055,1.62,.14,x+dx+sx,y+2.15,front+.02,metal,house);
      for(const sy of [-.8,0,.8])box(1.38,.055,.14,x+dx,y+2.15+sy,front+.02,metal,house);
      box(1.45,.1,.28,x+dx,y+1.34,front+.06,stone,house);
      for(const sx of [-.93,.93]){const shutter=box(.36,1.5,.12,x+dx+sx,y+2.15,front,wood,house);for(let j=0;j<7;j++)box(.34,.025,.015,x+dx+sx,y+1.53+j*.2,front+.07,metal,house);}
    }
    box(.9,2.2,.12,x,y+1.6,front+.02,wood,house);box(1.2,.14,1.35,x,y+.5,front+.5,stone,house);box(1.45,.12,.65,x,y+2.78,front+.2,metal,house);mesh(new THREE.SphereGeometry(.042,8,6),metal,x+.28,y+1.6,front+.12,house);
    for(const side of [-1,1]){
      const fx=x+side*(w/2+.5);box(.07,.09,d+1.7,fx,y+.76,z,wood,house);box(.07,.09,d+1.7,fx,y+.35,z,wood,house);
      for(let zz=z-d/2-.8;zz<z+d/2+.9;zz+=.42)box(.1,.92,.1,fx,y+.46,zz,wood,house);
      blocker(fx,z,.2,d+1.8,.95,y);
      for(let j=0;j<4;j++){const shrub=mesh(new THREE.IcosahedronGeometry(.48,2),leaf,fx-side*.65,y+.45,z-d/2+.8+j*1.35,house);shrub.scale.set(.9,.85,1.1);}
    }
    blocker(x,z,w+.3,d+.3,5,y);
  }
  for(let i=12;i<149;i+=22){
    const p=ROAD_SAMPLES[i],t=ROAD_SAMPLES[i+1].clone().sub(ROAD_SAMPLES[i-1]);t.y=0;t.normalize();const side=new THREE.Vector3(t.z,0,-t.x),sign=i%44===12?1:-1,x=p.x+side.x*5.75*sign,z=p.z+side.z*5.75*sign;
    if(blockers.some(b=>x>b.minX-.5&&x<b.maxX+.5&&z>b.minZ-.5&&z<b.maxZ+.5))continue;
    const y=approachHeight(x,z);mesh(new THREE.CylinderGeometry(.045,.075,3.25,10),metal,x,y+1.625,z);box(.34,.18,.34,x,y+3.3,z,metal);box(.25,.2,.25,x,y+3.16,z,line);blocker(x,z,.18,.18,3.5,y);
  }
  // Distant hills give the approach a horizon without entering the playable corridor.
  for(const [x,z,w,h,d] of [[-64,76,24,7,38],[64,58,22,8,36],[-39,132,31,11,32],[34,132,34,9,33]]){const hill=mesh(new THREE.SphereGeometry(1,24,16),grass,x,0,z);hill.scale.set(w,h,d);hill.name='Neighbourhood horizon';}
  // Static houses, fences and lamps share material batches instead of hundreds of draw calls.
  root.updateMatrixWorld(true);
  for(const parent of [root,trees]){
    const groups=new Map();
    parent.traverse(o=>{
      if(!o.isMesh||o===lawn||parent===root&&o.parent===trees)return;
      const key=o.material.uuid;const bucket=groups.get(key)??{material:o.material,nodes:[],geometries:[]};
      let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);
      if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
      bucket.nodes.push(o);bucket.geometries.push(g);groups.set(key,bucket);
    });
    for(const bucket of groups.values()){
      const combined=mergeGeometries(bucket.geometries);if(!combined)continue;
      for(const o of bucket.nodes)o.removeFromParent();for(const g of bucket.geometries)g.dispose();
      const batch=new THREE.Mesh(combined,bucket.material);batch.name='Neighbourhood '+bucket.material.name;batch.castShadow=batch.receiveShadow=true;parent.add(batch);
    }
  }
  return {root,blockers};
}
