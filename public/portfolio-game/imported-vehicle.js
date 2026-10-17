import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder_v1.module.js';
import {loadPackedModel} from './asset-transfer.js';
import {WEB_ASSETS} from './asset-catalog.js';
import {withTextureBudget} from './texture-budget.js';
import {prepareOriginalWheels} from './wheel-geometry.js';

const point=(root,node)=>root.worldToLocal(node.getWorldPosition(new THREE.Vector3()));
const required=(root,name)=>{const node=root.getObjectByName(name);if(!node)throw Error('Uploaded car part missing: '+name);return node;};

// Keep the mechanical parts separate while loading one compact web asset.
export async function loadImportedVehicle(onProgress=()=>{},{signal,requestTimeoutMs=30000,maxTextureSize=0}={}){
  const loader=withTextureBudget(new GLTFLoader(new THREE.LoadingManager()),maxTextureSize).setMeshoptDecoder(MeshoptDecoder);
  const gltf=await loadPackedModel(loader,WEB_ASSETS.car,onProgress,{signal,timeoutMs:requestTimeoutMs});
  return {scene:gltf.scene,config:WEB_ASSETS.car.config};
}

export class ImportedCarControls{
  constructor(car,config,doors,wheels,steering,lamps){
    this.car=car;this.config=config;this.doors=doors;this.wheels=wheels;this.steering=steering;this.lamps=lamps;
    this.speed=0;this.steer=0;this.headlights=false;this.braking=false;this.turnSignal='off';this.clock=0;this.targets=new Map();this.base=new Map();this.beams=[];
    for(const name of [config.hood.name,config.tailgate.name,...config.seats.map(seat=>seat.back)])this.base.set(name,required(car,name).rotation.clone());
    for(const lamp of lamps)if(lamp.kind==='headlight'){
      const beam=new THREE.SpotLight(0xffefd5,0,30,Math.PI/7,.45,1.6);beam.name=lamp.id+' beam';beam.position.fromArray(lamp.source.position);
      const target=new THREE.Object3D();target.position.copy(beam.position).add(new THREE.Vector3(0,-.35,10));car.add(beam,target);beam.target=target;this.beams.push({beam,lamp});
    }
  }
  setDoor(name,open){const door=this.doors.find(item=>item.group.name===name);if(!door)throw Error('Unknown uploaded car door: '+name);door.open=Boolean(open);}
  setAllDoors(open){for(const door of this.doors)door.open=Boolean(open);}
  setPanel(panel,open){this.targets.set(panel.name,{axis:panel.axis,angle:open?panel.angle:0});}
  setHood(open){this.setPanel(this.config.hood,open);}
  setTailgate(open){this.setPanel(this.config.tailgate,open);}
  setSeatRecline(name,radians){const seat=this.config.seats.find(item=>item.name===name);if(!seat)throw Error('Unknown uploaded car seat: '+name);this.targets.set(seat.back,{axis:'x',angle:-THREE.MathUtils.clamp(radians,0,.4)});}
  setHeadlights(on){this.headlights=Boolean(on);}
  setBrake(on){this.braking=Boolean(on);}
  setTurnSignal(mode){if(!['off','left','right','hazard'].includes(mode))throw Error('Invalid turn signal');this.turnSignal=mode;}
  setSteering(radians){this.steer=THREE.MathUtils.clamp(radians,-.55,.55);}
  setSpeed(speed){this.speed=THREE.MathUtils.clamp(speed,-8,30);}
  setWindow(){throw Error('The uploaded opaque glazing is preserved; lowering these windows is unavailable.');}
  update(dt,{driveManaged=false}={}){
    if(!Number.isFinite(dt)||dt<0)throw Error('Delta must be finite and nonnegative');dt=Math.min(dt,.1);this.clock+=dt;
    const blend=1-Math.exp(-8*dt);
    for(const [name,target] of this.targets){const node=required(this.car,name);node.rotation[target.axis]=THREE.MathUtils.lerp(node.rotation[target.axis],this.base.get(name)[target.axis]+target.angle,blend);}
    // The game's collision-aware door loop owns the four door hinge rotations.
    if(!driveManaged){for(const wheel of this.wheels){wheel.steer.rotation.y=wheel.front?this.steer:0;wheel.spin.rotation.x+=this.speed/wheel.radius*dt;}this.steering.rotation.z=-this.steer*2.7;}
    const blink=Math.floor(this.clock*2.4)%2===0;
    for(const lamp of this.lamps){
      const selected=this.turnSignal==='hazard'||this.turnSignal===lamp.source.side.toLowerCase();let intensity=0;
      if(lamp.kind==='headlight')intensity=this.headlights?3:0;
      else if(lamp.kind==='brake')intensity=this.braking?4:selected&&blink?4:this.headlights?.35:0;
      else if(lamp.kind==='indicator')intensity=selected&&blink?4:0;
      lamp.material.emissiveIntensity=lamp.mesh.visible?intensity:0;
    }
    for(const {beam,lamp} of this.beams)beam.intensity=this.headlights&&lamp.mesh.visible?35:0;
  }
  reset(){this.targets.clear();for(const [name,rotation] of this.base)required(this.car,name).rotation.copy(rotation);this.setAllDoors(false);this.speed=this.steer=0;this.headlights=this.braking=false;this.turnSignal='off';this.update(0,{driveManaged:true});}
}

export function createImportedVehicle(source,configuration=source.config){
  const car=new THREE.Group();car.name='Uploaded original functional Land Cruiser';const model=(source.scene??source).clone(true);car.add(model);car.updateMatrixWorld(true);prepareOriginalWheels(car,configuration);
  const config=configuration,carDoors=config.doors.map(definition=>{
    const group=required(car,definition.name),front=definition.name.endsWith('Front'),side=definition.name.includes('Right')?1:-1,inner=required(car,definition.name+'_InnerPanel');
    const box=new THREE.Box3().setFromObject(inner).applyMatrix4(group.matrixWorld.clone().invert()),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    return {group,side,front,angle:definition.angle,open:false,panel:required(car,definition.name+'_Exterior'),collision:{shapes:[{halfExtents:[Math.max(.06,size.x/2),.62,size.z/2],offset:[center.x,0,center.z]}]}};
  });
  const carWheels=config.wheels.map(definition=>{
    const steer=required(car,definition.steer),spin=required(car,definition.spin),meshes=spin.children.filter(node=>node.isMesh),mesh=meshes[0],box=new THREE.Box3().setFromObject(spin),width=box.getSize(new THREE.Vector3()).x,position=point(car,steer),radius=spin.userData.tyreRadius??definition.radius;
    return {group:steer,steer,spin,tire:mesh,meshes,front:definition.front,side:position.x>0?1:-1,radius,width,suspensionRestY:position.y,localPosition:position,collision:{type:'cylinder',radius,height:width,axis:'X'}};
  });
  const lamps=config.lights.flatMap(definition=>{
    const group=required(car,definition.name),entries=[];
    group.traverse(mesh=>{if(!mesh.isMesh)return;mesh.material=mesh.material.clone();const kind=definition.kind==='Headlight'?'headlight':definition.kind==='Brake'?'brake':'indicator';
      mesh.material.emissive.setRGB(...(kind==='headlight'?[1,.93,.76]:kind==='brake'?[1,.015,.005]:[1,.3,.005]));mesh.material.emissiveIntensity=0;
      mesh.geometry.computeBoundingBox();const size=mesh.geometry.boundingBox.getSize(new THREE.Vector3());
      entries.push({id:definition.name,mesh,parent:mesh.parent,material:mesh.material,kind,materialKind:'lamp',vehicle:true,source:definition,dimensions:size.toArray(),halfExtents:size.multiplyScalar(.5).toArray(),center:mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).toArray(),threshold:6,breakMode:'disable',baseIntensity:kind==='headlight'?3:kind==='brake'?.35:0,collide:false});
    });return entries;
  });
  model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
  const measured=new THREE.Box3().setFromObject(car),size=measured.getSize(new THREE.Vector3()),body=new THREE.Box3().setFromObject(required(car,'Body_Exterior'));
  const cushion=required(car,'Seat_Driver_Cushion'),seatBox=new THREE.Box3().setFromObject(cushion),seatSurfaceLocal=seatBox.getCenter(new THREE.Vector3());seatSurfaceLocal.y=seatBox.max.y;
  const seatHipLocal=seatSurfaceLocal.clone().add(new THREE.Vector3(0,.10,0)),seatLocal=seatHipLocal.clone().add(new THREE.Vector3(0,-.615,0));
  const steering=required(car,'Steering_Wheel'),wheelCenter=point(car,steering),steeringTargets=[-.153,.153].map(x=>wheelCenter.clone().add(new THREE.Vector3(x,0,0)));
  const floor=new THREE.Box3().setFromObject(required(car,'Cabin_Floor')),pedalTargets=[-.073,.082].map(x=>new THREE.Vector3(seatSurfaceLocal.x+x,floor.max.y+.083,.89));
  const chassisShapes=[
    {halfExtents:[.95,.10,2.28],offset:[0,.41,0]},
    {halfExtents:[.75,.04,1.325],offset:[-.0008988633,.5227432149,-.2856834169]},
    {halfExtents:[.77,.10,.65],offset:[0,1.26,1.65]},
    {halfExtents:[.78,.11,.155],offset:[-.0008988633,1.2537337268,.8193022406]},
    {halfExtents:[.73,.04,.40],offset:[-.0008988633,.6587414497,-1.7944138339]},
    {halfExtents:[.79,.035,1.28],offset:[0,1.865,-.49]},
    {halfExtents:[.89,.48,.06],offset:[0,1.25,-2.37]},
    {halfExtents:[.13,.13,.375],offset:[-.0008988633,.8074895189,.1605607910]},
    ...[-1,1].flatMap(side=>[
      {halfExtents:[.055,.06,1.42],offset:[side*.86,.565,-.35]},
      {halfExtents:[.045,.40,.07],offset:[side*.83,1.27,1.02]},
      {halfExtents:[.045,.43,.06],offset:[side*.84,1.3,-.012]},
      {halfExtents:[.045,.43,.07],offset:[side*.84,1.3,-1.15]},
      {halfExtents:[.045,.43,.10],offset:[side*.84,1.3,-2.27]},
      ...[.2455596877,-.8806756940].flatMap(z=>[
        {halfExtents:[.245,.065,.235],offset:[side*.424995,.8244892983,z]},
        {halfExtents:[.245,.29,.06],offset:[side*.424995,1.1294892983,z-.23]}
      ])
    ]),
    {halfExtents:[.195,.065,.235],offset:[-.0008988633,.8244892983,-.8806756940]},
    {halfExtents:[.195,.29,.06],offset:[-.0008988633,1.1294892983,-1.1106756940]}
  ];
  const front=carWheels.find(wheel=>wheel.front),rear=carWheels.find(wheel=>!wheel.front),right=carWheels.find(wheel=>wheel.side>0),left=carWheels.find(wheel=>wheel.side<0);
  const bounds={min:measured.min.clone(),max:measured.max.clone(),center:measured.getCenter(new THREE.Vector3()),halfExtents:size.clone().multiplyScalar(.5),width:size.x,length:size.z,height:size.y,bodyWidth:body.max.x-body.min.x,bodyLength:body.max.z-body.min.z,wheelRadius:config.wheels[0].radius,wheelbase:front.localPosition.z-rear.localPosition.z,track:right.localPosition.x-left.localPosition.x,cabin:{width:1.5,floorY:floor.max.y,roofY:1.836,frontZ:floor.max.z,rearZ:floor.min.z},chassisShapes,bodyShapes:chassisShapes};
  const entryLocal=point(car,required(car,'Entry_Driver')),stepLocal=new THREE.Vector3(.89,.23,seatSurfaceLocal.z),cameraTargetLocal=new THREE.Vector3(0,1.28,seatSurfaceLocal.z);
  const controls=new ImportedCarControls(car,config,carDoors,carWheels,steering,lamps),glass=[],mirrors=[];
  const seats=config.seats.map(seat=>({name:seat.name,group:required(car,seat.seat),anchor:required(car,seat.anchor),entry:required(car,seat.entry),back:required(car,seat.back),front:seat.front}));
  const panels=[config.hood,config.tailgate].map(part=>({name:part.name,group:required(car,part.name),axis:part.axis,angle:part.angle}));
  const vehicle={car,carDoors,carWheels,steering,glass,mirrors,lamps,bounds,seatLocal,seatSurfaceLocal,seatHipLocal,steeringTargets,pedalTargets,entryLocal,stepLocal,cameraTargetLocal,seats,panels,controls,imported:true,updateParts:dt=>controls.update(dt,{driveManaged:true})};
  car.userData.vehicle={bounds,seatLocal,seatSurfaceLocal,seatHipLocal,steeringTargets,pedalTargets,source:'user-uploaded-original',opaqueGlazingPreserved:true};return vehicle;
}
