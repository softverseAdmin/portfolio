const fs=require('fs'),path=require('path'),crypto=require('crypto'),{gunzipSync,gzipSync}=require('zlib');
const {createRequire}=require('module');
const tools=createRequire(path.join(process.env.PORTFOLIO_ASSET_TOOLCHAIN??__dirname,'package.json'));
const {NodeIO,Logger,PropertyType}=tools('@gltf-transform/core');
const {ALL_EXTENSIONS}=tools('@gltf-transform/extensions');
const {mergeDocuments,transformMesh,prune,dedup,weld,simplify,meshopt,textureCompress,unpartition}=tools('@gltf-transform/functions');
const {MeshoptDecoder,MeshoptEncoder,MeshoptSimplifier}=tools('meshoptimizer');
const sharp=tools('sharp');
const root=path.resolve(__dirname,'../..'),game=root+'/public/portfolio-game',out=game+'/assets/optimized';fs.mkdirSync(out,{recursive:true});
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const report={generated:new Date().toISOString(),files:{},sourceCar:'Tencent_Car_Mechanical_Rig.glb',notes:['Original source files remain unchanged.','Web assets use bounded mesh simplification and resized textures. Rig nodes and cabin controls remain separate.']};
function save(name,data){const ext=path.extname(name),base=name.slice(0,-ext.length),uri=base+'.'+sha(data).slice(0,12)+ext;fs.writeFileSync(out+'/'+uri,data);report.files[name]={uri,bytes:data.length,sha256:sha(data)};return {url:'./assets/optimized/'+uri,uri,bytes:data.length};}
function triangles(doc){return doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((n,p)=>n+(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3,0),0);}
async function optimize(doc,name,{ratio=1,textureSize=2048}={}){
 let before;doc.setLogger(new Logger(Logger.Verbosity.WARN));
 await doc.transform(prune({keepLeaves:true,keepAttributes:true,keepExtras:true}),dedup({propertyTypes:[PropertyType.ACCESSOR,PropertyType.TEXTURE]}),weld());
 before=triangles(doc);if(ratio<1)await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio,error:.001,lockBorder:true}));
 await doc.transform(textureCompress({encoder:sharp,targetFormat:'webp',resize:[textureSize,textureSize],quality:90,effort:70}),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12,quantizeTexcoord:14}),prune({keepLeaves:true,keepAttributes:true,keepExtras:true}));
 await doc.transform(unpartition());const bytes=Buffer.from(await io.writeBinary(doc)),entry=save(name+'.glb',bytes);report[name]={trianglesBefore:before,trianglesAfter:triangles(doc),textureSize,bytes:bytes.length};console.log(name,report[name]);return entry;
}
async function car(){
 const folder=game+'/assets/imported/car',json=JSON.parse(fs.readFileSync(folder+'/car.gltf')),resources={};
 for(const b of json.buffers)if(b.uri)resources[b.uri]=b.uri.endsWith('.png')?fs.readFileSync(folder+'/'+b.uri):gunzipSync(fs.readFileSync(folder+'/'+b.uri+'.gz'));
 const doc=await io.readJSON({json,resources}),source=await io.read(path.resolve(process.argv[2]??'Tencent_Car_Mechanical_Rig.glb'));
 const THREE=await import('../../public/portfolio-game/vendor/three.module.js');
 const existing=new Map(doc.getRoot().listNodes().map(n=>[n.getName(),n])),mapping=mergeDocuments(doc,source),sourceScenes=source.getRoot().listScenes();
 const byName={body:['Body_Exterior'],wheel_FL:['Wheel_Right_Front','Wheel_Right_Front_Steer'],wheel_FR:['Wheel_Left_Front','Wheel_Left_Front_Steer'],wheel_RL:['Wheel_Right_Rear','Wheel_Right_Rear_Steer'],wheel_RR:['Wheel_Left_Rear','Wheel_Left_Rear_Steer'],door_FL:['Door_Right_Front_Exterior','Door_Right_Front'],door_FR:['Door_Left_Front_Exterior','Door_Left_Front'],door_RL:['Door_Right_Rear_Exterior','Door_Right_Rear'],door_RR:['Door_Left_Rear_Exterior','Door_Left_Rear'],hood:['Hood_Exterior','Hood'],tailgate:['Tailgate_Exterior','Tailgate']};
 let body;
 for(const node of source.getRoot().listNodes()){
  const mesh=node.getMesh();if(!mesh)continue;const names=byName[mesh.getName()];if(!names)throw Error('Unrecognized source mesh '+mesh.getName());
  const matrix=new THREE.Matrix4().makeRotationY(Math.PI).multiply(new THREE.Matrix4().fromArray(node.getWorldMatrix()));
  const pivot=new THREE.Vector3().setFromMatrixPosition(matrix);
  if(names[1]){existing.get(names[1]).setTranslation(pivot.toArray()).setRotation([0,0,0,1]).setScale([1,1,1]);matrix.premultiply(new THREE.Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));}
  const copied=mapping.get(mesh);transformMesh(copied,matrix.toArray());copied.setName(names[0]);existing.get(names[0]).setMesh(copied);if(names[0]==='Body_Exterior')body=copied;
 }
 const primitive=body.listPrimitives()[0],positions=primitive.getAttribute('POSITION'),indices=primitive.getIndices().getArray(),buckets=Array.from({length:7},()=>[]),v=[0,0,0];
 for(let i=0;i<indices.length;i+=3){let x=0,y=0,z=0;for(let j=0;j<3;j++){positions.getElement(indices[i+j],v);x+=v[0]/3;y+=v[1]/3;z+=v[2]/3;}let label=0;const start=x<0?1:4;if(Math.abs(x)>.5&&z>2.15&&y>.94&&y<1.3)label=start;else if(Math.abs(x)>.5&&z< -2.25&&y>.92&&y<1.43)label=start+1;else if(Math.abs(x)>.82&&z>2.1&&y>.85&&y<=.94)label=start+2;buckets[label].push(indices[i],indices[i+1],indices[i+2]);}
 const buffer=doc.getRoot().listBuffers()[0],paint=primitive.getMaterial();paint.setName('Tencent_Original_Paint');
 const lamps=['Headlight_Left','Brake_Left','Indicator_Front_Left','Headlight_Right','Brake_Right','Indicator_Front_Right'];
 for(let i=0;i<7;i++){
  const index=doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(buckets[i])).setBuffer(buffer);
  if(i===0){primitive.setIndices(index);continue;}
  const p=doc.createPrimitive().setIndices(index).setMaterial(paint.clone().setName(lamps[i-1]+'_Material'));
  for(const semantic of primitive.listSemantics())p.setAttribute(semantic,primitive.getAttribute(semantic));
  existing.get(lamps[i-1]).setMesh(doc.createMesh(lamps[i-1]).addPrimitive(p));
 }
 for(const scene of sourceScenes)mapping.get(scene).dispose();
 for(const node of source.getRoot().listNodes())mapping.get(node).dispose();
 // The source's baked demonstration clips must not drive game-controlled hinges.
 for(const animation of doc.getRoot().listAnimations())animation.dispose();
 const config=JSON.parse(fs.readFileSync(folder+'/config.json'));config.sourceTriangles=1499942;config.exportTriangles=triangles(doc);config.rig='tencent-web';config.originalExteriorPreserved=false;config.limitations=['Web-optimized copy of the supplied exterior; simplified existing cabin retained.','Original opaque glazing remains fixed.'];for(const wheel of config.wheels)wheel.radius=.4452604999484633;
 const model=await optimize(doc,'car',{ratio:.15});config.exportTriangles=report.car.trianglesAfter;
 return {...model,config};
}
async function main(){
 await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready,MeshoptSimplifier.ready]);
 const assets={car:await car(),characters:{}};
 for(const role of ['host','visitor']){
  const folder=game+'/assets/imported/characters/'+role,metadata=JSON.parse(fs.readFileSync(folder+'/metadata.json')),catalog=JSON.parse(fs.readFileSync(folder+'/animation-catalog.json'));
  const model=await optimize(await io.read(folder+'/model.glb'),role),core={},tour={},motions={};
  const coreIds=new Set(['idle','walk','run','greet','drive','enter-car','exit-car']);const tourIds=new Set(['start-walk','jump','talk','talk-alt','sit','stand','sit-idle','carry-walk','carry-idle','box-walk','box-idle','pickup','throw','punch','wave']);
  const THREE=await import('../../public/portfolio-game/vendor/three.module.js');
  for(const entry of catalog.clips){const clip=THREE.AnimationClip.toJSON(THREE.AnimationClip.parse(JSON.parse(fs.readFileSync(folder+'/'+entry.src))).optimize());for(const track of clip.tracks)for(const key of ['times','values'])track[key]=track[key].map(value=>Math.round(value*1e6)/1e6);if(coreIds.has(entry.id))core[entry.id]=clip;else if(tourIds.has(entry.id))tour[entry.id]=clip;const json=Buffer.from(JSON.stringify(clip)),packed=gzipSync(json,{level:9});motions[entry.id]={...save(role+'-'+entry.id+'.json.gz',packed),decodedBytes:json.length,deliveryUri:'motion.gz'};}
  function bundle(name,clips){const json=Buffer.from(JSON.stringify(clips)),packed=gzipSync(json,{level:9});return {...save(role+'-'+name+'.json.gz',packed),decodedBytes:json.length,deliveryUri:'motions.gz'};}
  assets.characters[role]={...model,metadata,catalog,motions,core:bundle('core',core),tour:bundle('tour',tour)};
 }
 assets.house=await optimize(await io.read(game+'/assets/runtime/estate.glb'),'estate');
 fs.writeFileSync(game+'/asset-catalog.js','// Generated by tools/portfolio-assets/prepare-web-assets.cjs. Source assets remain unchanged.\nexport const WEB_ASSETS='+JSON.stringify(assets)+';\n');
 report.startupBytes=assets.car.bytes+assets.house.bytes+Object.values(assets.characters).reduce((n,r)=>n+r.bytes+r.core.bytes,0);fs.mkdirSync(root+'/reports',{recursive:true});fs.writeFileSync(root+'/reports/web-assets.json',JSON.stringify(report,null,2)+'\n');console.log('STARTUP_MODEL_AND_CORE_BYTES',report.startupBytes);
}
main().catch(e=>{console.error(e);process.exit(1)});
