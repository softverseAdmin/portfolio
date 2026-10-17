import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {updateCollider} from './physics.js';
import {loadPackedModel} from './asset-transfer.js';
import {withTextureBudget} from './texture-budget.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder_v1.module.js';
import {WEB_ASSETS} from './asset-catalog.js';

const runtimeURL=file=>new URL('./assets/runtime/'+file,import.meta.url).href;
export async function loadReviewedAppearance(role,onProgress){
  const gltf=await new GLTFLoader().loadAsync(runtimeURL(role+'.glb'),onProgress);
  return prepareReviewedAppearance(gltf.scene);
}

// Keep the original FBX skeleton and all uploaded clips. The review meshes
// were built around its bind pose, in metres; bring them back to that exact
// native coordinate system before binding them to the game's independent rigs.
export function prepareReviewedAppearance(scene){
  scene.updateMatrixWorld(true);
  let metadata;
  scene.traverse(o=>{if(o.userData.native_scale)metadata=o.userData;});
  if(!metadata||!Number.isFinite(metadata.native_scale)||metadata.native_scale<=0||metadata.native_offset?.length!==3)throw new Error('The model has no native rig transform.');
  const toNative=new THREE.Matrix4().compose(new THREE.Vector3(...metadata.native_offset),new THREE.Quaternion(),new THREE.Vector3().setScalar(metadata.native_scale)).invert();
  const parts=[];
  scene.traverse(o=>{
    if(!o.isSkinnedMesh)return;
    const geometry=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(toNative,o.matrixWorld));
    parts.push({name:o.name,geometry,material:o.material,joints:o.skeleton.bones.map(b=>b.name)});
  });
  if(parts.length<10)throw new Error('The reviewed character is incomplete.');
  return {parts,nativeScale:metadata.native_scale,nativeOffset:[...metadata.native_offset],height:metadata.character_height};
}

export function bindReviewedAppearance(model,skin,appearance,{host=false}={}){
  const skeleton=skin.skeleton,byName=new Map(skeleton.bones.map((b,i)=>[b.name,i]));
  const prepared=appearance.parts.map(part=>{
    const geometry=part.geometry.clone(),original=geometry.getAttribute('skinIndex'),indices=new Uint16Array(original.count*4);
    for(let i=0;i<original.count;i++)for(let j=0;j<4;j++){
      const name=part.joints[original.getComponent(i,j)],target=byName.get(name);
      if(target===undefined)throw new Error('Missing animation joint: '+name);
      indices[i*4+j]=target;
    }
    geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
    const material=Array.isArray(part.material)?part.material.map(m=>m.clone()):part.material.clone();
    const mesh=new THREE.SkinnedMesh(geometry,material);
    mesh.name=part.name.includes('facial_skin')||part.name.startsWith('Anatomical_Head')?'Face':part.name.includes('hair')?'Hair':part.name;
    mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;
    mesh.bind(skeleton,skin.bindMatrix.clone());
    return mesh;
  });
  model.traverse(o=>{if(o.isMesh)o.visible=false;});
  for(const mesh of prepared)model.add(mesh);
  model.userData.appearance={style:host?'host':'visitor',source:'reviewed-model',height:appearance.height};
}

export async function loadEnvironmentAsset(onProgress,{signal,maxTextureSize=0}={}){return (await loadPackedModel(withTextureBudget(new GLTFLoader(new THREE.LoadingManager()),maxTextureSize).setMeshoptDecoder(MeshoptDecoder),WEB_ASSETS.house,onProgress,{signal})).scene;}

const vertical=7/(8.15-.48),yAt=y=>.13+(y-.48)*vertical;
function sourcePoint(x,depth,y,origin,angle){
  const c=Math.cos(angle),s=Math.sin(angle);
  return new THREE.Vector3(origin[0]+x*c-depth*s,yAt(y),9-(origin[1]+x*s+depth*c)*19/16);
}
function addBox(world,{x,depth,y,w,d,h,origin=[0,0],angle=0}){
  const bounds=new THREE.Box3();
  for(const sx of [-1,1])for(const sz of [-1,1])for(const sy of [-1,1])bounds.expandByPoint(sourcePoint(x+sx*w/2,depth+sz*d/2,y+sy*h/2,origin,angle));
  const b={minX:bounds.min.x,maxX:bounds.max.x,minY:bounds.min.y,maxY:bounds.max.y,minZ:bounds.min.z,maxZ:bounds.max.z,reviewedEnvironment:true};
  world.blockers.push(b);return b;
}
function addPane(world,group,id,shape,origin,angle){
  const geometry=new THREE.ShapeGeometry(shape),positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    const p=sourcePoint(positions.getX(i),-.08,positions.getY(i),origin,angle);positions.setXYZ(i,p.x,p.y,p.z);
  }
  geometry.computeVertexNormals();geometry.computeBoundingBox();
  const center=geometry.boundingBox.getCenter(new THREE.Vector3()),half=geometry.boundingBox.getSize(new THREE.Vector3()).multiplyScalar(.5).toArray();
  geometry.translate(-center.x,-center.y,-center.z);
  const mesh=new THREE.Mesh(geometry,world.visuals.materials.glass);mesh.name=id;mesh.position.copy(center);group.add(mesh);
  const pane=world.registerFragile(id,mesh,half,{label:'house window',reviewedEnvironment:true});
  return pane;
}
function rectShape(x0,x1,y0,y1){
  return new THREE.Shape([new THREE.Vector2(x0,y0),new THREE.Vector2(x1,y0),new THREE.Vector2(x1,y1),new THREE.Vector2(x0,y1)]);
}
function addPanel(world,glass,{id,cx,origin=[0,0],angle=0,central=false,doorway=false}){
  const width=central?4:3,upperWidth=central?5.4:3,span=8,base=4.65,spring=6.35,rise=central?1.3:1.5;
  const box=(x,y,w,h,depth=.16,d=.32)=>addBox(world,{x,depth,y,w,d,h,origin,angle});
  for(const side of [-1,1]){
    const w=(span-width)/2;box(cx+side*(width/2+w/2),(.45+4.3)/2,w,3.85);
  }
  if(!doorway)box(cx,.5,width,.1);
  box(cx,(3.55+4.65)/2,width,4.65-3.55);
  for(const side of [-1,1]){
    const w=(span-upperWidth)/2;box(cx+side*(upperWidth/2+w/2),(base+8.15)/2,w,8.15-base);
  }
  // Small boxes follow the arch, retaining the opening after its glass breaks.
  for(let i=0;i<24;i++){
    const a=-upperWidth/2+i*upperWidth/24,b=a+upperWidth/24;
    const nearest=Math.abs(a)<Math.abs(b)?a:b;
    const archTop=spring+rise*Math.sqrt(Math.max(0,1-(nearest/(upperWidth/2))**2));
    box(cx+(a+b)/2,(archTop+8.15)/2,b-a,8.15-archTop);
  }
  if(!doorway){
    for(const x of [-width/2,0,width/2])box(cx+x,(.55+3.55)/2,.065,3.065,-.11,.115);
    for(const y of [.55,3.55])box(cx,y,width+.06,.065,-.11,.115);
    box(cx,.505,width+.25,.09,-.15,.36);
    for(const side of [-1,1]){
      const a=side<0?cx-width/2+.04:cx+.035,b=side<0?cx-.035:cx+width/2-.04;
      addPane(world,glass,'model-window-'+id+'-lower-'+(side<0?'left':'right'),rectShape(a,b,.59,3.51),origin,angle);
    }
  }
  for(const x of [-upperWidth/2,upperWidth/2])box(cx+x,(base+spring)/2,.07,spring-base+.08,-.11,.115);
  for(const y of [base,spring])box(cx,y,upperWidth,.065,-.11,.115);
  for(const ratio of [-.46,0,.46]){
    const top=spring+rise*Math.sqrt(1-ratio**2);box(cx+upperWidth/2*ratio,(base+top)/2,.038,top-base,-.105,.1);
  }
  box(cx,base-.045,upperWidth+.25,.09,-.15,.36);
  // Narrow arch-frame segments bound thrown props as well as the actors.
  for(let i=0;i<24;i++){
    const a=i*Math.PI/24,b=(i+1)*Math.PI/24;
    const x0=cx+upperWidth/2*Math.cos(a),x1=cx+upperWidth/2*Math.cos(b),y0=spring+rise*Math.sin(a),y1=spring+rise*Math.sin(b);
    box((x0+x1)/2,(y0+y1)/2,Math.abs(x1-x0)+.045,Math.abs(y1-y0)+.045,-.11,.082);
  }
  const upper=new THREE.Shape();upper.moveTo(cx-upperWidth/2,base);upper.lineTo(cx+upperWidth/2,base);upper.lineTo(cx+upperWidth/2,spring);
  for(let i=1;i<=40;i++){const angle=i*Math.PI/40;upper.lineTo(cx+upperWidth/2*Math.cos(angle),spring+rise*Math.sin(angle));}
  upper.closePath();addPane(world,glass,'model-window-'+id+'-upper',upper,origin,angle);
}

function tileGeometry(mesh,period){
  const geometry=mesh.geometry.clone(),p=geometry.attributes.position,n=geometry.attributes.normal,uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){
    const axis=n?Math.abs(n.getX(i))>Math.abs(n.getY(i))&&Math.abs(n.getX(i))>Math.abs(n.getZ(i))?'x':Math.abs(n.getY(i))>Math.abs(n.getZ(i))?'y':'z':'y';
    uv[i*2]=(axis==='x'?p.getZ(i):p.getX(i))/period;
    uv[i*2+1]=(axis==='y'?p.getZ(i):p.getY(i))/period;
  }
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));mesh.geometry=geometry;
}
function applyMaterials(world,palette){
  const m=world.visuals.materials;
  const replacements=new Map([[m.white,['White_Plaster',1.5]],[m.trim,['White_Plaster',1.5]],[m.stone,['Limestone',1.7]],[m.oak,['Oak',1.6]],[m.wood,['Oak',1.6]],[m.grass,['Lawn',3]],[m.black,['Black_Aluminium',1]],[m.gold,['Brushed_Brass',1]]]);
  world.root.traverse(o=>{
    if(!o.isMesh||Array.isArray(o.material))return;
    const district={'district-plaster':['White_Plaster',1.5],'district-limestone':['Limestone',1.7],'district-oak':['Oak',1.6],'district-lawn':['Lawn',3],'district-metal':['Black_Aluminium',1],'district-slate':['Slate',1.1],'district-leaf':['Leaves',1]};
    const entry=replacements.get(o.material)??district[o.material.name]??(['oak','oak-edge'].includes(o.material.name)?['Oak',1.6]:o.material.name==='soil'?['Soil',1]:null);
    if(!entry||!palette.has(entry[0]))return;
    o.material=palette.get(entry[0]);if(o.material.map&&!o.isInstancedMesh)tileGeometry(o,entry[1]);
  });
  m.glass.color.set('#c4d2db');m.glass.opacity=.19;m.glass.side=THREE.DoubleSide;
}

function addRoofHull(world,mesh){
  mesh.updateMatrixWorld(true);
  const p=mesh.geometry.attributes.position,index=mesh.geometry.index,points=[],lookup=new Map(),mapped=[];
  for(let i=0;i<p.count;i++){
    const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld),key=v.toArray().map(n=>n.toFixed(5)).join(',');
    if(!lookup.has(key)){lookup.set(key,points.length);points.push(v);}mapped[i]=lookup.get(key);
  }
  const box=new THREE.Box3().setFromPoints(points),center=box.getCenter(new THREE.Vector3()),faces=[];
  for(let i=0;i<index.count;i+=3)faces.push([mapped[index.getX(i)],mapped[index.getX(i+1)],mapped[index.getX(i+2)]]);
  const bottom=points.map((v,i)=>[v,i]).filter(([v])=>Math.abs(v.y-box.min.y)<.0001).sort(([a],[b])=>Math.atan2(a.z-center.z,a.x-center.x)-Math.atan2(b.z-center.z,b.x-center.x)).map(([,i])=>i);
  faces.push(bottom);
  for(const face of faces){
    const a=points[face[0]],normal=points[face[1]].clone().sub(a).cross(points[face[2]].clone().sub(a));
    const midpoint=face.reduce((sum,i)=>sum.add(points[i]),new THREE.Vector3()).multiplyScalar(1/face.length);
    if(normal.dot(midpoint.sub(center))<0)face.reverse();
  }
  world.blockers.push({minX:box.min.x,maxX:box.max.x,minY:box.min.y,maxY:box.max.y,minZ:box.min.z,maxZ:box.max.z,
    convexVertices:points.map(v=>v.clone().sub(center).toArray()),convexFaces:faces,reviewedEnvironment:true});
}

export function applyEnvironmentAsset(world,source){
  if(world.visuals.applied)return false;
  const scene=source.clone(true),palette=new Map(),roof=[],detail=[],prototypes={};
  let shell,poolWater;
  scene.traverse(o=>{
    if(!o.isMesh)return;
    const kind=o.userData.runtime_kind;
    if(o.name==='House_White_Plasters')shell=o;
    if(o.name==='Pool_Water_Surface')poolWater=o;
    if(kind==='palette'){palette.set(o.material.name,o.material);o.visible=false;}
    else if(kind==='tree-prototype'){prototypes[o.name.endsWith('Bark')?'bark':'leaves']=o;o.visible=false;}
    else{
      o.castShadow=o.receiveShadow=true;
      if(kind==='roof')roof.push(o);
      if(kind==='garden'&&/Flowers|Ferns|Lavender/.test(o.name))detail.push(o);
    }
    for(const material of Array.isArray(o.material)?o.material:[o.material])for(const texture of [material.map,material.normalMap,material.roughnessMap])if(texture)texture.anisotropy=4;
  });
  const slate=roof.find(o=>o.name==='Roof_Main_Slate');if(slate)palette.set('Slate',slate.material);
  if(prototypes.leaves)palette.set('Leaves',prototypes.leaves.material);
  if(!shell||!poolWater||roof.length<4||!palette.has('White_Plaster')||!prototypes.bark||!prototypes.leaves)throw new Error('The house model is incomplete.');
  const v=world.visuals;
  for(const o of [...v.legacyShellNodes,...v.legacyPorticoNodes,...v.legacyRoofNodes,...v.legacyPlantNodes,...v.legacyPoolNodes])o.removeFromParent();
  const removedColliders=new Set([...v.legacyShellColliders,...v.legacyPoolColliders]),removedGlass=new Set(v.legacyShellGlass);
  for(let i=world.blockers.length-1;i>=0;i--)if(removedColliders.has(world.blockers[i]))world.blockers.splice(i,1);
  for(let i=world.breakables.length-1;i>=0;i--)if(removedGlass.has(world.breakables[i]))world.breakables.splice(i,1);
  applyMaterials(world,palette);
  world.root.add(scene);world.roof.splice(0,world.roof.length,...roof);
  // The reviewed pool sits west of the house, in front of the basketball area.
  // Retain the existing buoyancy/controller and move its bounds with the model.
  Object.assign(world.pool,{minX:-23.9,maxX:-16,minZ:9-8.04*.82,maxZ:9+2.01*.82,surface:.038,bottom:-1.17});
  poolWater.castShadow=false;
  v.poolWater={mesh:poolWater,high:poolWater.material,low:v.materials.water};
  v.materials.water.roughness=.12;v.materials.water.transparent=true;v.materials.water.opacity=.85;v.materials.water.depthWrite=false;
  const poolBox=(x,depth,y,w,d,h)=>{
    const z=9-depth*.82;
    world.blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d*.82/2,maxZ:z+d*.82/2,minY:y+.02-h/2,maxY:y+.02+h/2,reviewedEnvironment:true});
  };
  for(const [x,depth,w,d] of [[-24.2,3,.55,10.75],[-15.7,3,.55,10.75],[-19.95,-2.4,9.05,.55],[-19.95,8.4,9.05,.55]])poolBox(x,depth,.11,w,d,.17);
  for(const [x,depth,w,d] of [[-24,3,.18,10.35],[-15.9,3,.18,10.35],[-19.95,-2.13,8.2,.18],[-19.95,8.13,8.2,.18]])poolBox(x,depth,-.63,w,d,1.27);
  world.blockers.push({minX:-24.475,maxX:-15.425,minZ:9-8.675*.82,maxZ:9+2.675*.82,minY:-1.3,maxY:.24,navOnly:true,reviewedEnvironment:true});
  // Cut the visible terrain too: no lawn plane remains across the basin.
  v.ground.removeFromParent();
  const pool=world.pool;
  for(const [x0,x1,z0,z1] of [[-55,pool.minX,-66,134],[pool.maxX,55,-66,134],[pool.minX,pool.maxX,-66,pool.minZ],[pool.minX,pool.maxX,pool.maxZ,134]]){
    const ground=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,.15,z1-z0),palette.get('Lawn'));ground.name='Lawn below the paved surfaces';ground.position.set((x0+x1)/2,-.08,(z0+z1)/2);ground.receiveShadow=true;tileGeometry(ground,3);world.root.add(ground);
  }
  // The west-side lap follows the clear strip between the pool and house.
  for(const i of [3,4,5])world.checkpoints[i].x=-13.8;
  for(const node of roof)if(node.name==='Roof_Main_Slate'||node.name==='Roof_Central_Bay_Slate')addRoofHull(world,node);
  const glass=new THREE.Group();glass.name='Interactive house glazing';world.root.add(glass);
  for(const cx of [-8,8])addPanel(world,glass,{id:'front-'+cx,cx});
  addPanel(world,glass,{id:'front-center',cx:0,origin:[0,-.4],central:true,doorway:true});
  for(const cx of [-8,0,8])addPanel(world,glass,{id:'rear-'+cx,cx,origin:[0,16],angle:Math.PI,doorway:cx===0});
  for(const [x,angle] of [[12,Math.PI/2],[-12,-Math.PI/2]])for(const cx of [-4,4])addPanel(world,glass,{id:'side-'+x+'-'+cx,cx,origin:[x,8],angle});
  // Align the animated entrance with the projecting central bay.
  const shift=.4*19/16,front=world.doors.find(d=>d.id==='front');
  front.group.position.z+=shift;front.group.scale.y=(yAt(3.55)-.13)/3.4;
  front.z+=shift;front.blocker.minZ+=shift;front.blocker.maxZ+=shift;front.blocker.maxY=yAt(3.55);
  const doorUse=world.interactions.find(i=>i.id==='door');doorUse.z+=shift;
  world.doorbell.group.position.z+=shift;world.doorbell.interaction.z+=shift;world.doorbell.marker.position.z+=shift;
  for(const node of v.entranceFixtureNodes)node.position.z+=shift;
  for(const x of [-1.8,1.8]){
    const fill=new THREE.Mesh(new THREE.BoxGeometry(.4,yAt(3.55)-.13,.38),palette.get('White_Plaster'));
    fill.position.set(x,(yAt(3.55)+.13)/2,9.285);fill.castShadow=fill.receiveShadow=true;scene.add(fill);
    world.blockers.push({minX:x-.2,maxX:x+.2,minY:.13,maxY:yAt(3.55),minZ:9.095,maxZ:9.475,reviewedEnvironment:true});
  }
  // Portico columns, balcony slab and curved lintel use simple matching colliders.
  for(const x of [-3.55,3.55]){
    addBox(world,{x,depth:-2.65,y:2.29,w:.5,d:.57,h:3.62});
    addBox(world,{x,depth:-2.65,y:.58,w:.68,d:.73,h:.18});
  }
  addBox(world,{x:0,depth:-1.34,y:4.19,w:7.9,d:3.35,h:.21});
  for(let i=0;i<20;i++){
    const a=-3.3+i*6.6/20,b=a+6.6/20,near=Math.abs(a)<Math.abs(b)?a:b;
    const bottom=3.2+.72*Math.sqrt(Math.max(0,1-(near/3.3)**2));
    addBox(world,{x:(a+b)/2,depth:-2.87,y:(bottom+4.13)/2,w:b-a,d:.4,h:4.13-bottom});
  }
  const treeSites=[[-23.5,22,1.2],[18,26,1.2],[-23.5,.4,1],[-23.5,-19,1],[23.3,-18,1.25],[23.3,-7,1],[23.3,8,1],[-18,28,.85]];
  const movedTree=v.treeColliders[2];movedTree.minZ-=2.6;movedTree.maxZ-=2.6;
  for(const [kind,prototype] of Object.entries(prototypes)){
    const trees=new THREE.InstancedMesh(prototype.geometry,prototype.material,treeSites.length);trees.name='Reviewed garden tree '+kind;
    for(let i=0;i<treeSites.length;i++){
      const [x,z,s]=treeSites[i],matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,.02,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),i*1.7),new THREE.Vector3().setScalar(.45*s));trees.setMatrixAt(i,matrix);
    }
    trees.castShadow=trees.receiveShadow=true;trees.computeBoundingSphere();scene.add(trees);
  }
  const district=v.road;
  if(district?.userData.treeSites?.length){
    district.userData.fallbackTrees.visible=false;
    const sites=district.userData.treeSites;
    for(const [kind,prototype] of Object.entries(prototypes)){
      const trees=new THREE.InstancedMesh(prototype.geometry,prototype.material,sites.length);trees.name='Neighbourhood reviewed tree '+kind;
      for(let i=0;i<sites.length;i++){const [x,y,z,s]=sites[i];trees.setMatrixAt(i,new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),i*1.7),new THREE.Vector3().setScalar(.45*s)));}
      trees.castShadow=trees.receiveShadow=true;trees.computeBoundingSphere();district.add(trees);
    }
  }
  for(const x of [-11.7,11.7])world.blockers.push({minX:x-.13,maxX:x+.13,minZ:10.674,maxZ:10.934,minY:.02,maxY:2.9,reviewedEnvironment:true});
  world.root.updateMatrixWorld(true);for(const b of world.blockers)if(b.mesh)updateCollider(b);
  v.applied=true;v.detailNodes=detail;v.assetRoot=scene;
  return true;
}

export function setAssetQuality(world,low){
  for(const node of world?.visuals?.detailNodes??[])node.visible=!low;
  const water=world?.visuals?.poolWater;if(water)water.mesh.material=low?water.low:water.high;
}
