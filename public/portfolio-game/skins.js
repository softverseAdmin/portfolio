import * as THREE from './vendor/three.module.js';
import {tailoredGeometry} from './assets/characters/tailored-geometry.js';

const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.78,...extra});
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
const faceRects={host:[686,139,84,83],visitor:[637,156,74,75]};
const headProfile=[[156,2.6,3.9,1.8],[158,5.7,5.8,.7],[162,8,7.3,-.2],
  [166,8.8,8.4,-.9],[172,8.9,9.1,-1.5],[177,7.8,8.6,-1.9],[180,4.7,5.7,-1.9],[182,.05,.05,-1.9]];
function profile(y,values,component=1){
  for(let i=1;i<values.length;i++)if(y<=values[i][0]){
    const a=values[i-1],b=values[i],t=clamp((y-a[0])/(b[0]-a[0]),0,1);return lerp(a[component],b[component],t);
  }
  return values.at(-1)[component];
}
const gaussian=(x,y,cx,cy,sx,sy)=>Math.exp(-.5*((x-cx)/sx)**2-.5*((y-cy)/sy)**2);

// The clothing is a connected, smooth mesh in the supplied skeleton's bind pose.
// Its anatomical weights keep the shoulders, elbows, hips and knees continuous.
export function dressCharacter(model,bones,skin,{host=false,texture=null}={}){
  const style=host?'host':'visitor',parts=[],skeleton=skin.skeleton;
  const skinTone=host?'#d5a180':'#f0c4ab';
  const complexion=material(skinTone,{roughness:.73}),navy=material(host?'#14243e':'#28314b');
  const lapel=material(host?'#192d48':'#303951'),white=material('#f5f3ed',{roughness:.87});
  const trim=material(host?'#267681':'#dfc899',{roughness:.62,metalness:host?.08:.25});
  const dark=material('#111821',{roughness:.3,metalness:.03}),sole=material('#10141c',{roughness:.82});
  const hairMat=material(host?'#101315':'#27232a',{roughness:.36});
  const hairHighlight=material(host?'#262727':'#38323c',{roughness:.4});
  const indexOf=name=>skeleton.bones.indexOf(bones[name]);
  const torsoWeights=y=>{
    const chain=[['Hips',104.27],['Spine',114.46],['Spine1',124.35],['Spine2',136.5]];
    for(let i=1;i<chain.length;i++)if(y<=chain[i][1]){
      const t=clamp((y-chain[i-1][1])/(chain[i][1]-chain[i-1][1]),0,1);
      return [[chain[i-1][0],1-t],[chain[i][0],t]];
    }
    return [['Spine2',1]];
  };
  function jacketWeights(x,y){
    const a=Math.abs(x),side=x>0?'Left':'Right';
    if(a<11||y<131)return torsoWeights(y);
    if(a<22){
      const t=THREE.MathUtils.smoothstep(a,11,22)*THREE.MathUtils.smoothstep(y,131,140);
      const weights=torsoWeights(y).map(([bone,weight])=>[bone,weight*(1-t)]);
      weights.push([side+'Arm',t]);return weights;
    }
    const t=THREE.MathUtils.smoothstep(a,36.5,49.5);
    return [[side+'Arm',1-t],[side+'ForeArm',t]];
  }
  function trouserWeights(x,y){
    const side=x>0?'Left':'Right';
    if(y>101)return [['Hips',1]];
    if(y>88){const t=THREE.MathUtils.smoothstep(y,88,101);return [['Hips',t],[side+'UpLeg',1-t]];}
    const t=THREE.MathUtils.smoothstep(y,44,63);
    return [[side+'UpLeg',t],[side+'Leg',1-t]];
  }
  function weighted(geometry,mat,weights,name){
    const p=geometry.attributes.position,indices=[],values=[];
    for(let i=0;i<p.count;i++){
      const row=weights(p.getX(i),p.getY(i),p.getZ(i));
      for(let j=0;j<4;j++){indices.push(row[j]?Math.max(0,indexOf(row[j][0])):0);values.push(row[j]?.[1]??0);}
    }
    geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
    geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(values,4));
    if(!geometry.attributes.normal)geometry.computeVertexNormals();
    const mesh=new THREE.SkinnedMesh(geometry,mat);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;
    model.add(mesh);mesh.bind(skeleton,skin.bindMatrix.clone());parts.push(mesh);return mesh;
  }
  function imported(data,mat,weights,name){
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(data.position,3));
    geometry.setIndex(data.index);return weighted(geometry,mat,weights,name);
  }
  function solid(geometry,mat,bone,center,name=''){
    model.updateMatrixWorld(true);
    const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;
    const rotation=bone.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(model.getWorldQuaternion(new THREE.Quaternion()));
    mesh.quaternion.copy(rotation);mesh.position.copy(bone.worldToLocal(model.localToWorld(center.clone())));
    bone.add(mesh);parts.push(mesh);return mesh;
  }
  function bead(center,size,mat,bone,name){return solid(new THREE.SphereGeometry(1,18,12).scale(...size),mat,bone,new THREE.Vector3(...center),name);}
  function curve(points,radius,mat,weights,name){
    const spline=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return weighted(new THREE.TubeGeometry(spline,Math.max(8,points.length*4),radius,5,false),mat,weights,name);
  }
  function frontZ(x,y){
    const width=profile(y,[[94,16.5],[104,15],[115,host?15.5:14],[130,host?18.5:17],[140,host?19.5:18],[147,13],[152,6]]);
    const depth=profile(y,[[94,10.2],[115,9.4],[133,11],[146,8.5],[152,5.2]]);
    const cz=profile(y,[[94,0],[128,-1.5],[152,-2.8]]);
    return cz+depth*Math.sqrt(Math.max(.01,1-(x/width)**2));
  }
  function panel(points,mat,name,offset=.75){
    const shape=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));
    let geometry=new THREE.ShapeGeometry(shape).toNonIndexed();
    for(let pass=0;pass<3;pass++){
      const p=geometry.attributes.position,vertices=[];
      for(let i=0;i<p.count;i+=3){
        const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2);
        const ab=a.clone().add(b).multiplyScalar(.5),bc=b.clone().add(c).multiplyScalar(.5),ca=c.clone().add(a).multiplyScalar(.5);
        for(const v of [a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca])vertices.push(...v.toArray());
      }
      geometry.dispose();geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    }
    const p=geometry.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,frontZ(p.getX(i),p.getY(i))+offset);
    const lookup=new Map(),vertices=[],indices=[];
    for(let i=0;i<p.count;i++){
      const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');
      if(!lookup.has(key)){lookup.set(key,vertices.length/3);vertices.push(p.getX(i),p.getY(i),p.getZ(i));}
      indices.push(lookup.get(key));
    }
    geometry.dispose();geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);
    geometry.computeVertexNormals();return weighted(geometry,mat,(x,y)=>torsoWeights(y),name);
  }

  // Keep only the supplied detailed human hands, including their finger weights.
  model.traverse(object=>{
    if(!object.isSkinnedMesh)return;
    if(object!==skin){object.visible=false;return;}
    const original=object.geometry,p=original.attributes.position,indices=[];
    for(let i=0;i<p.count;i+=3){
      const x=(Math.abs(p.getX(i))+Math.abs(p.getX(i+1))+Math.abs(p.getX(i+2)))/3;
      if(x>=69.4)indices.push(i,i+1,i+2);
    }
    const geometry=new THREE.BufferGeometry();
    for(const [name,attribute] of Object.entries(original.attributes)){
      const array=new attribute.array.constructor(indices.length*attribute.itemSize);
      indices.forEach((index,i)=>{
        for(let j=0;j<attribute.itemSize;j++)array[i*attribute.itemSize+j]=attribute.getComponent(index,j);
      });
      geometry.setAttribute(name,new THREE.BufferAttribute(array,attribute.itemSize,attribute.normalized));
    }
    object.geometry=geometry;object.material=complexion;object.name='Detailed hands';
  });
  imported(tailoredGeometry[style].jacket,navy,jacketWeights,'Tailored jacket');
  imported(tailoredGeometry[style].trousers,navy,trouserWeights,'Tailored trousers');

  panel([[-5.2,149],[-7,142],[-6.5,129],[-4.3,112],[-4.5,100],[4.5,100],[4.3,112],[6.5,129],[7,142],[5.2,149]],white,'White shirt');
  for(const sign of [-1,1]){
    const lapelPoints=[[5.1,148],[11.4,143],[8.9,139.1],[12.1,140],[4.2,117],[2.7,124],[5.2,141]].map(([x,y])=>[x*sign,y]);
    panel(lapelPoints,lapel,'Notched lapel',1.0);
    const edge=[[5.1,148],[11.4,143],[8.9,139.1],[12.1,140],[4.2,117],[3.2,107],[6.1,97]];
    curve(edge.map(([x,y])=>[x*sign,y,frontZ(x*sign,y)+1.29]),.22,trim,(x,y)=>torsoWeights(y),'Lapel piping');
    panel([[sign*4.9,149],[sign*6.5,144],[sign*2.4,139],[sign*.8,144]],white,'Shirt collar',1.45);
    panel([[sign*8,106],[sign*14,106],[sign*14,104.9],[sign*8,104.9]],lapel,'Pocket welt',.43);
    curve([[sign*8,106.2,frontZ(sign*8,106)+.63],[sign*14,106.2,frontZ(sign*14,106)+.63]],.13,trim,(x,y)=>torsoWeights(y),'Pocket trim');
    const side=sign>0?'Left':'Right';
    const cuff=new THREE.CylinderGeometry(4.55,4.55,2.6,24,1,true).rotateZ(Math.PI/2).translate(sign*69.2,144.06,-5.55);
    weighted(cuff,white,()=>[[side+'ForeArm',1]],'Shirt cuff');
    for(let i=0;i<3;i++)bead([sign*(65+i*1.3),139.6,-2.8],[.42,.3,.4],trim,bones[side+'ForeArm'],'Sleeve button');
  }
  for(const y of [110.8,118.5,126.3,134.0,141.3])bead([0,y,frontZ(0,y)+.7],[.38,.38,.18],white,bones[y>128?'Spine2':y>117?'Spine1':'Spine'],'Shirt button');
  for(const y of [110.5,118])bead([3.5,y,frontZ(3.5,y)+.92],[.62,.62,.3],trim,bones[y>115?'Spine1':'Spine'],'Jacket button');
  curve([[0,97,-10.1],[0,115,-10.7],[0,134,-12.3],[0,146,-10.4]],.11,lapel,(x,y)=>torsoWeights(y),'Back seam');
  for(const sign of [-1,1]){
    curve([[sign*8.208,12,2.6],[sign*8.208,42,6.1],[sign*8.208,61,6.4],[sign*8.208,89,8.5]],.095,lapel,trouserWeights,'Trouser crease');
  }

  // A shaped neck and head replace the oversized textured sphere.
  const neck=new THREE.CylinderGeometry(4.6,5.6,14,28,6).translate(0,152,-2);
  weighted(neck,complexion,(x,y)=>y>155?[['Head',.55],['Neck',.45]]:[['Neck',1]],'Neck');
  const collarStand=new THREE.CylinderGeometry(5.4,6.2,3.7,28,2,true,.4,Math.PI*2-.8).translate(0,149.5,-2);
  weighted(collarStand,white,()=>[['Neck',.45],['Spine2',.55]],'Collar stand');
  const headPositions=[],headUV=[],faceIndex=[],backIndex=[];
  const rings=36,segments=64;
  for(let j=0;j<=rings;j++){
    const y=156+(182-156)*j/rings,rx=profile(y,headProfile,1)*(host?1:.94),rz=profile(y,headProfile,2),cz=profile(y,headProfile,3);
    for(let i=0;i<=segments;i++){
      const theta=i/segments*Math.PI*2,x=Math.sin(theta)*rx,c=Math.cos(theta);let z=cz+c*rz;
      if(c>0){
        const nose=2.0*gaussian(x,y,0,167,1.35,3.5)+2.6*gaussian(x,y,0,163.8,1.8,1.3);
        const sockets=-.85*(gaussian(x,y,-3.8,169.3,1.9,1.35)+gaussian(x,y,3.8,169.3,1.9,1.35));
        const cheeks=.62*(gaussian(x,y,-5,165,2.5,1.9)+gaussian(x,y,5,165,2.5,1.9));
        z+=Math.pow(c,3)*(nose+sockets+cheeks+.55*gaussian(x,y,0,160.7,3.1,.65));
      }
      headPositions.push(x,y,z);
      const rect=faceRects[style];headUV.push((rect[0]+clamp(.5+x/18,0,1)*rect[2])/1536,1-(rect[1]+clamp((175.5-y)/18.7,0,1)*rect[3])/1024);
    }
  }
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
    const a=j*(segments+1)+i,b=a+segments+1;
    const theta=(i+.5)/segments*Math.PI*2,y=156+(182-156)*(j+.5)/rings;
    const index=Math.cos(theta)>.22&&y<176&&y>156.5&&texture?faceIndex:backIndex;
    index.push(a,a+1,b,b,a+1,b+1);
  }
  const headGeo=new THREE.BufferGeometry();headGeo.setAttribute('position',new THREE.Float32BufferAttribute(headPositions,3));
  headGeo.setAttribute('uv',new THREE.Float32BufferAttribute(headUV,2));headGeo.setIndex([...faceIndex,...backIndex]);
  headGeo.addGroup(0,faceIndex.length,0);headGeo.addGroup(faceIndex.length,backIndex.length,1);
  weighted(headGeo,[material('#ffffff',{map:texture,roughness:.74}),complexion],()=>[['Head',1]],'Face');
  for(const sign of [-1,1]){
    bead([sign*8.95,166.2,-.9],[1.15,2.5,1.6],complexion,bones.Head,'Ear');
    bead([sign*9.38,166.4,-.55],[.32,1.28,.79],material(host?'#be8267':'#dc9c87'),bones.Head,'Ear fold');
  }

  const hairProfile=host?[[165,8.8,9.6],[174,9.9,10],[178,9.5,9.7],[181,7.4,8],[183,4,5],[184.2,.03,.03]]:
    [[157,9.1,9.4],[166,10.1,10.1],[174,10.1,10.3],[178,9.4,9.7],[181,7.2,7.8],[183,3.4,4.1],[183.8,.03,.03]];
  const hairAt=(theta,y)=>[Math.sin(theta)*profile(y,hairProfile,1),y,-1.7+Math.cos(theta)*profile(y,hairProfile,2)];
  function frontHair(x,y){
    const rx=profile(y,hairProfile,1),rz=profile(y,hairProfile,2);
    return [x,y,-1.7+rz*Math.sqrt(Math.max(.01,1-(x/rx)**2))+.08];
  }
  const hp=[],hi=[],hs=64,hr=22;
  for(let j=0;j<=hr;j++)for(let i=0;i<=hs;i++){
    const theta=i/hs*Math.PI*2,c=Math.cos(theta);
    const bottom=host?lerp(165.4,175.1,Math.pow(Math.max(0,c),.7)):lerp(157.9,175.2,Math.pow(Math.max(0,c),.9));
    const y=lerp(bottom,hairProfile.at(-1)[0],j/hr);
    hp.push(...hairAt(theta,y));
  }
  for(let j=0;j<hr;j++)for(let i=0;i<hs;i++){
    const a=j*(hs+1)+i,b=a+hs+1;hi.push(a,a+1,b,b,a+1,b+1);
  }
  const hairGeo=new THREE.BufferGeometry();hairGeo.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));hairGeo.setIndex(hi);
  weighted(hairGeo,hairMat,()=>[['Head',1]],'Hair');
  for(let i=0;i<15;i++){
    const x=-7.2+i*.93;
    const points=host?[frontHair(x,175.8+Math.abs(x)*.12),frontHair(x*.87,177.9),frontHair(x*.62,179.6),frontHair(x*.29,181.2)]:
      [frontHair(x,175.8+Math.max(0,x)*.13),frontHair(x*.86+1.1,177.8),frontHair(x*.6+1.1,179.8),frontHair(x*.25,181.3)];
    curve(points,.08,hairHighlight,()=>[['Head',1]],'Hair flow');
  }
  if(!host){
    for(const sign of [-1,1])for(let i=0;i<5;i++){
      const theta=sign*(1.2+i*.13),bottom=lerp(157.9,175.2,Math.pow(Math.max(0,Math.cos(theta)),.9));
      curve([hairAt(theta,177.6),hairAt(theta,171),hairAt(theta,(171+bottom)/2),hairAt(theta,bottom+.2)],.075,hairHighlight,()=>[['Head',1]],'Bob hair flow');
    }
    const shape=new THREE.Shape([[-8.7,173],[-5,175.8],[1,178.7],[6.4,176.9],[1.6,175],[-3,173.2],[-6.1,170],[-8,168.1]].map(([x,y])=>new THREE.Vector2(x,y)));
    const fringe=new THREE.ShapeGeometry(shape),p=fringe.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,frontHair(p.getX(i),p.getY(i))[2]+.16);
    fringe.computeVertexNormals();weighted(fringe,hairMat,()=>[['Head',1]],'Swept fringe');
  }

  function shoeWeights(side,z){const t=THREE.MathUtils.smoothstep(z,6,15)*.65;return [[side+'Foot',1-t],[side+'ToeBase',t]];}
  for(const sign of [-1,1]){
    const side=sign>0?'Left':'Right',cx=sign*8.208;
    const sock=new THREE.CylinderGeometry(4.35,4.15,7,22,4,true).translate(cx,11.5,-2.65);
    weighted(sock,navy,(x,y)=>{const t=THREE.MathUtils.smoothstep(y,9,15);return [[side+'Leg',t],[side+'Foot',1-t]];},'Sock');
    const shape=[[-9,1.1,6.8],[-7,4.5,8.8],[-1,5.2,9.3],[6,5.6,6.8],[13,5.0,4.9],[17,3.4,4.0],[18.4,.1,2.2]];
    const sp=[],si=[],sz=30,sc=32;
    for(let j=0;j<=sz;j++){
      const z=lerp(-9,18.4,j/sz),width=profile(z,shape,1),top=profile(z,shape,2);
      for(let i=0;i<=sc;i++){
        const angle=i/sc*Math.PI*2;sp.push(cx+width*Math.sin(angle),(top+1.8)/2+Math.cos(angle)*(top-1.8)/2,z);
      }
    }
    for(let j=0;j<sz;j++)for(let i=0;i<sc;i++){const a=j*(sc+1)+i,b=a+sc+1;si.push(a,b,a+1,b,b+1,a+1);}
    const firstCenter=sp.length/3;sp.push(cx,4.3,-9);
    const lastCenter=sp.length/3;sp.push(cx,2,18.4);
    for(let i=0;i<sc;i++){si.push(firstCenter,i,i+1);const a=sz*(sc+1)+i;si.push(lastCenter,a+1,a);}
    const upper=new THREE.BufferGeometry();upper.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));upper.setIndex(si);
    weighted(upper,dark,(x,y,z)=>shoeWeights(side,z),host?'Oxford shoe':'Loafer');
    const outline=[];
    for(let i=0;i<=28;i++){const z=lerp(-9,18.4,i/28);outline.push([cx+profile(z,shape,1)*1.04,z]);}
    for(let i=28;i>=0;i--){const z=lerp(-9,18.4,i/28);outline.push([cx-profile(z,shape,1)*1.04,z]);}
    const soleShape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));
    const soleGeo=new THREE.ExtrudeGeometry(soleShape,{depth:1.4,bevelEnabled:true,bevelSegments:1,bevelSize:.18,bevelThickness:.12,steps:1});
    soleGeo.rotateX(-Math.PI/2).translate(0,.55,0);
    weighted(soleGeo,sole,(x,y,z)=>shoeWeights(side,z),'Shoe sole');
    curve([[cx-4.8,5.3,9.5],[cx,5.7,10.5],[cx+4.8,5.3,9.5]],.14,sole,(x,y,z)=>shoeWeights(side,z),'Toe seam');
    for(let i=0;i<(host?4:1);i++){
      const z=host?i*1.35:3;
      curve([[cx-2.2,8.0-i*.32,z],[cx,8.3-i*.32,z+.2],[cx+2.2,8.0-i*.32,z]],host?.16:.36,host?sole:trim,(x,y,z)=>shoeWeights(side,z),host?'Shoe lace':'Loafer buckle');
    }
  }
  const watchSide=bones.LeftForeArm;
  bead([67.3,149.0,-5.55],[2.0,.55,2.3],material(host?'#39434e':'#c68e89',{metalness:.35}),watchSide,'Watch strap');
  bead([67.3,149.5,-5.55],[1.4,.4,1.8],dark,watchSide,'Watch');
  model.userData.appearance={style,parts,texture,continuous:true,reference:'approved character concept',outfit:'navy suit with trousers'};
  return model.userData.appearance;
}
