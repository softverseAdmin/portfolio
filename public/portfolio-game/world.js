import * as THREE from './vendor/three.module.js';
import {createFurniture,createSmallProp} from './furnishings.js';
import {createVehicle} from './vehicle.js';
import {updateCollider} from './physics.js';
import {createRoadDistrict} from './journey.js';
import {createProjector} from './projector.js';
import {createStudyDesktop} from './desktop.js';

const geometries=new Map();
const boxes=(w,h,d)=>{const key=[w,h,d].join(',');if(!geometries.has(key))geometries.set(key,new THREE.BoxGeometry(w,h,d));return geometries.get(key);};
const sphereGeo=new THREE.SphereGeometry(1,12,8);
const cylinderGeo=new THREE.CylinderGeometry(1,1,1,12);
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});

function canvasTexture(draw,w=512,h=512){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const context=canvas.getContext('2d');draw(context,w,h);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

function woodTexture(){
  const texture=canvasTexture((c,w,h)=>{
    c.fillStyle='#b88656';c.fillRect(0,0,w,h);
    for(let p=0;p<8;p++){
      c.fillStyle=['#b88b61','#ba9064','#c09467','#ae8157'][p%4];c.fillRect(p*64,0,63,h);
      for(let j=0;j<38;j++){c.strokeStyle=`rgba(76,45,24,${.03+(j%4)*.014})`;c.beginPath();let x=p*64+(j*17)%61;c.moveTo(x,0);for(let y=0;y<h;y+=12)c.lineTo(x+Math.sin(y*.035+j)*1.3,y);c.stroke();}
      c.strokeStyle='#936d4790';c.beginPath();c.moveTo(p*64,0);c.lineTo(p*64,h);c.stroke();
      c.beginPath();c.moveTo(p*64,(p%3)*160);c.lineTo(p*64+64,(p%3)*160);c.stroke();
    }
  });
  if(texture){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,3);texture.anisotropy=4;}
  return texture;
}

function marbleTexture(){
  return canvasTexture((c,w,h)=>{
    c.fillStyle='#2d3433';c.fillRect(0,0,w,h);
    for(let i=0;i<16;i++){c.strokeStyle=i%3?'#9b9d9460':'#eadbc087';c.lineWidth=i%4?1:3;c.beginPath();c.moveTo((i*47)%w,0);for(let y=0;y<=h;y+=16)c.lineTo((i*47)%w+Math.sin(y*.011+i)*72+Math.sin(y*.05)*12,y);c.stroke();}
  });
}

function signMaterial(lines,bg='#1f3b32',fg='#f1dfbd'){
  const texture=canvasTexture((c,w,h)=>{
    c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle=fg+'77';c.lineWidth=2;c.strokeRect(14,14,w-28,h-28);
    c.textAlign='center';c.textBaseline='middle';
    lines.forEach((s,i)=>{c.fillStyle=fg;c.font=`${i===0?'500':'400'} ${i===0?36:18}px Arial`;c.fillText(s,w/2,h/2+(i-(lines.length-1)/2)*48,w-50);});
  },512,256);
  return new THREE.MeshBasicMaterial({map:texture,color:texture?0xffffff:fg});
}

export function createCharacter({host=false}={}){
  const group=new THREE.Group();const skin=mat(host?'#ba8664':'#cdab86');
  const shirt=mat(host?'#263a3f':'#e5d2aa'),pants=mat(host?'#29383d':'#425947'),shoes=mat('#24322d');
  const mesh=(geo,material,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;group.add(m);return m;};
  mesh(new THREE.CapsuleGeometry(.25,.35,4,10),shirt,0,1.12,0,1,1,.72);
  mesh(sphereGeo,skin,0,1.73,.01,.215,.258,.205);
  const hair=mesh(sphereGeo,mat('#222926'),0,1.86,-.028,.219,.156,.203);
  mesh(cylinderGeo,skin,0,1.48,0,.08,.15,.08);
  for(const x of [-.076,.076])mesh(sphereGeo,mat('#1d302b'),x,1.75,.198,.017,.022,.012);
  mesh(sphereGeo,skin,0,1.71,.205,.032,.045,.038);
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.31,1.36,0);group.add(arm);
    const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.082,.31,3,8),shirt);sleeve.position.y=-.19;arm.add(sleeve);sleeve.castShadow=true;
    const hand=new THREE.Mesh(sphereGeo,skin);hand.position.set(0,-.45,0);hand.scale.set(.082,.105,.075);arm.add(hand);arms.push(arm);
    const leg=new THREE.Group();leg.position.set(side*.12,.79,0);group.add(leg);
    const lower=new THREE.Mesh(new THREE.CapsuleGeometry(.104,.43,3,8),pants);lower.position.y=-.28;leg.add(lower);lower.castShadow=true;
    const foot=new THREE.Mesh(boxes(.2,.13,.33),shoes);foot.position.set(0,-.69,.055);leg.add(foot);foot.castShadow=true;legs.push(leg);
  }
  if(host){
    mesh(boxes(.04,.34,.018),mat('#d9bc86'),0,1.23,.195);
    mesh(boxes(.06,.035,.019),mat('#ecd8b4'),.13,1.29,.18);
  }else mesh(boxes(.29,.4,.1),mat('#293e32'),0,1.12,-.22);
  group.userData={arms,legs,hair};return group;
}

export function animateCharacter(character,time,speed=0,wave=false,sitting=false,pose={}){
  if(character.userData.animate){character.userData.animate(time,speed,wave,sitting,pose);return;}
  const {arms,legs}=character.userData;const swing=Math.sin(time*9)*Math.min(speed/3.4,1)*.6;
  legs[0].rotation.x=sitting?-1.5:swing;legs[1].rotation.x=sitting?-1.5:-swing;
  arms[0].rotation.x=-swing*.7;arms[1].rotation.x=swing*.7;
  arms[1].rotation.z=wave?-.9:0;arms[1].rotation.x=wave?-1.2+Math.sin(time*7)*.2:swing*.7;
  arms[0].rotation.z=0;
  if(pose.carry){arms[1].rotation.x=-1.2;arms[1].rotation.z=-.18;if(pose.twoHands)arms[0].rotation.x=-1.15;}
  if(pose.reach){arms[1].rotation.x=-Math.PI*.58*pose.reach;arms[1].rotation.z=-.2*pose.reach;}
  if(pose.punch){const index=pose.punch.side??1,amount=Math.sin(Math.PI*pose.punch.progress);arms[index].rotation.x=-2.05*amount;arms[index].rotation.z=(index===1?-.25:.25)*amount;}
  if(pose.kick){legs[1].rotation.x=-1.55*Math.sin(Math.PI*pose.kick);}
  if(pose.driving){arms[0].rotation.x=arms[1].rotation.x=-1.3;arms[0].rotation.z=.2;arms[1].rotation.z=-.2;}
  if(pose.airborne){legs[0].rotation.x=-.4;legs[1].rotation.x=.35;}
}

export function createWorld({vehicle:uploadedVehicle=null}={}){
  const root=new THREE.Group(),blockers=[],interactions=[],markers=[],roof=[],doors=[],toys=[],breakables=[],seats=[];
  const physicsFloors=[{x:0,y:.02,z:-.5,w:24,h:.22,d:19},{x:0,y:.065,z:10.9,w:7.9,h:.13,d:4},{x:7.15,y:3.455,z:-4.15,w:9.7,h:.15,d:11.7}];
  const colors={white:'#ebece3',trim:'#f6f4e9',black:'#283732',oak:'#bb8d5e',green:'#577a54',teal:'#26614e',gold:'#c5a36b',stone:'#afa999'};
  const m={white:mat(colors.white),trim:mat(colors.trim),black:mat(colors.black,{roughness:.4}),oak:mat(colors.oak),gold:mat(colors.gold,{metalness:.65,roughness:.32}),stone:mat(colors.stone),wood:mat('#ffffff',{map:woodTexture()}),grass:mat('#889c69'),darkgrass:mat('#587950'),glass:mat('#b7d6c2',{transparent:true,opacity:.23,roughness:.1,metalness:.15,depthWrite:false}),fabric:mat('#d8d5c3'),rug:mat('#c4bdac'),marble:mat('#ffffff',{map:marbleTexture()}),water:mat('#5c9390',{metalness:.3,roughness:.18})};
  const visuals={materials:m};
  function box(w,h,d,x,y,z,material=m.white,parent=root,collide=false){
    const o=new THREE.Mesh(boxes(w,h,d),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);
    if(collide)blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:y-h/2,maxY:y+h/2});
    return o;
  }
  function sphere(r,x,y,z,material=m.green,parent=root,scale=[1,1,1]){const o=new THREE.Mesh(sphereGeo,material);o.position.set(x,y,z);o.scale.set(r*scale[0],r*scale[1],r*scale[2]);o.castShadow=true;parent.add(o);return o;}
  function cyl(r,h,x,y,z,material=m.oak,parent=root){const o=new THREE.Mesh(cylinderGeo,material);o.scale.set(r,h,r);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function plane(w,h,x,y,z,material,rotation=0,parent=root){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);p.position.set(x,y,z);p.rotation.y=rotation;parent.add(p);return p;}
  function sign(lines,x,y,z,w=2,h=1,rotation=0,bg){return plane(w,h,x,y,z,signMaterial(lines,bg),rotation);}
  function block(x,z,w,d,minY=.1,maxY=2){const b={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY};blockers.push(b);return b;}
  function collider(mesh,halfExtents,center=[0,0,0],extra={}){const b={mesh,halfExtents,center,...extra};blockers.push(b);updateCollider(b);return b;}
  function rigidBox(w,h,d,x,y,z,material=m.white,parent=root,extra={}){const mesh=box(w,h,d,x,y,z,material,parent);const b=collider(mesh,[w/2,h/2,d/2],[0,0,0],extra);return {mesh,b};}
  function fragile(id,mesh,halfExtents,extra={}){const d={id,label:'glass pane',mesh,halfExtents,material:'glass',threshold:4,breakMode:'shatter',...extra};d.halfExtents=d.halfExtents.map(n=>Math.max(.006,n));if(d.collide!==false&&!d.toy)d.blocker=collider(mesh,d.halfExtents,d.center??[0,0,0],{fragile:true,moving:!!d.moving,vehicle:!!d.vehicle,doorId:d.doorId});breakables.push(d);return d;}
  // Prefab metadata is expressed in final metres; a unit-scale wrapper keeps it
  // independent of the model's internal normalization scale.
  function model(kind,x,y,z,options={},small=false){const prefab=(small?createSmallProp:createFurniture)(kind,options),group=new THREE.Group();group.add(prefab);group.userData=prefab.userData;group.name=prefab.name;group.position.set(x,y,z);group.rotation.y=options.rotation??0;root.add(group);group.updateMatrixWorld(true);return group;}
  function furnish(kind,x,z,y=.13,options={}){const group=model(kind,x,y,z,options);for(const part of group.userData.collisionBoxes)collider(group,part.halfExtents,part.center);return group;}
  function loose(kind,id,label,x,y,z,options={}){const mesh=model(kind,x,y,z,options,true),dims=mesh.userData.bounds,center=[0,dims.height/2,0],half=[dims.width/2,dims.height/2,dims.depth/2],toy={id,label,kind:options.kind??kind,mesh,mass:options.mass??mesh.userData.mass??.3,bodyCenter:center,halfExtents:half,holdable:options.holdable??true,buoyancy:options.buoyancy};toys.push(toy);return toy;}
  function movableChair(id,kind,x,z,y=.13,options={}){const mesh=model(kind,x,y,z,{...options,cushions:false}),d=mesh.userData.bounds,center=[0,d.height/2,0],b=collider(mesh,[d.width/2,d.height/2,d.depth/2],center,{dynamic:true,navOnly:true}),toy={id,label:'chair',kind:'furniture',mesh,bodyCenter:center,halfExtents:[d.width/2,d.height/2,d.depth/2],shapes:mesh.userData.collisionBoxes.map(p=>({halfExtents:p.halfExtents,center:p.center.map((v,i)=>v-center[i])})),mass:mesh.userData.mass??10,holdable:false,blocker:b};toys.push(toy);return {mesh,toy};}
  function seat(id,label,mesh,approach=[0,0,1.3],toy=null){const target={id,mesh,toy,local:mesh.userData.seatLocal??[0,.54,.1],heading:mesh.userData.heading??0,approach};seats.push(target);const p=mesh.localToWorld(new THREE.Vector3(...approach));const i=interact(id,label,p.x,p.z,'sit',{y:mesh.position.y,radius:1.75});i.seat=target;return target;}
  function interact(id,label,x,z,action,{y=.13,radius=2.2}={}){
    const i={id,label,x,y,z,action,radius};interactions.push(i);
    const group=new THREE.Group();group.position.set(x,y+.06,z);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.24,.3,32),new THREE.MeshBasicMaterial({color:'#dbb679',transparent:true,opacity:.7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;group.add(ring);root.add(group);markers.push(group);return i;
  }
  function plant(x,z,scale=1,y=.13){
    return furnish('planter',x,z,y,{width:.55*scale,height:1.5*scale,depth:.55*scale});
  }
  function lamp(x,z,y=.13,table=false){
    const kind=table?'table-lamp':'lamp',mesh=model(kind,x,y,z),d=mesh.userData.bounds,center=[0,d.height/2,0];
    const toy={id:`lamp-${x}-${z}-${y}`,kind:'lamp',label:table?'table lamp':'floor lamp',mesh,bodyCenter:center,halfExtents:[d.width/2,d.height/2,d.depth/2],mass:table?1.5:4,holdable:table};toys.push(toy);
    toy.blocker=collider(mesh,toy.halfExtents,center,{dynamic:true,navOnly:true});
    const bulb=mesh.userData.parts.bulb,light=new THREE.PointLight('#ffe4b1',.9,3.5,2);light.position.fromArray(mesh.userData.lightSocket);mesh.add(light);
    fragile(`${toy.id}-bulb`,bulb,[.03,.045,.03],{label:'lamp bulb',material:'bulb',threshold:2.5,toy,whole:false,collide:false,light});
    return mesh;
  }
  let paneCount=0;
  function windowFront(x,z,width=2.6,y=1.9,height=2.8){
    for(const sy of [-1,1])rigidBox(width+.17,.13,.25,x,y+sy*height/2,z,m.trim);
    for(const dx of [-width/2,0,width/2])rigidBox(.06,height,.13,x+dx,y,z,m.black);
    rigidBox(width,.055,.13,x,y,z,m.black);
    for(const sx of [-1,1])for(const sy of [-1,1]){const w=width/2-.055,h=height/2-.055,mesh=box(w,h,.018,x+sx*width/4,y+sy*height/4,z,m.glass);fragile(`window-${paneCount++}`,mesh,[w/2,h/2,.009]);}
  }
  function archWindow(x,z,rotation=0){
    const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;root.add(group);
    const curve=new THREE.Shape();curve.moveTo(-1.15,2.85);curve.absarc(0,2.85,1.15,Math.PI,0,true);curve.lineTo(-1.15,2.85);curve.closePath();
    const mesh=new THREE.Mesh(new THREE.ShapeGeometry(curve),m.glass.clone());mesh.material.side=THREE.DoubleSide;group.add(mesh);fragile(`arched-window-${paneCount++}`,mesh,[1.15,.575,.009],{center:[0,3.425,0]});
    for(const sx of [-1,1]){const pane=box(1.1,2.02,.018,sx*.575,1.79,0,m.glass,group);fragile(`arched-window-${paneCount++}`,pane,[.55,1.01,.009]);}
    for(const xx of [-1.19,1.19])rigidBox(.08,2.8,.12,xx,1.98,0,m.trim,group);
    const arch=new THREE.Mesh(new THREE.TorusGeometry(1.19,.06,8,36,Math.PI),m.trim);arch.position.y=2.85;group.add(arch);
    rigidBox(.07,3.1,.1,0,2.31,0,m.black,group);rigidBox(2.3,.07,.1,0,2.81,0,m.black,group);rigidBox(2.4,.12,.19,0,.74,0,m.trim,group);
  }

  // A modest explorable estate, with a porch and a rear courtyard.
  visuals.ground=box(110,.15,200,0,-.055,34,m.grass);
  const roadDistrict=createRoadDistrict();root.add(roadDistrict.root);blockers.push(...roadDistrict.blockers);visuals.road=roadDistrict.root;
  sign(['RABIN’S HOUSE','FOLLOW THE ROAD →'], -21,1.7,73,3,1.15);
  sign(['RABIN’S HOUSE','DRIVEWAY ↗'], -4,1.5,30,2.5,1);
  sign(['WELCOME','PARK HERE'],18,1.5,15.3,2,1);
  box(6.3,.04,17,0,.009,21,m.stone);
  for(let z=14;z<30;z+=2)box(6.25,.005,.016,0,.0315,z,mat('#959887'));
  box(7.9,.13,4,0,.065,10.9,m.stone);
  for(let j=0;j<5;j++)box(6.7,.025+j*.02,.62,0,-.02+(j*.02)/2,15.3-j*.62,m.stone);
  box(24,.22,19,0,.02,-.5,m.wood);
  box(21,.13,10,0,-.04,-15.3,m.stone);
  for(let x=-10;x<11;x+=1.8)box(.018,.007,10,x,.035,-15.3,mat('#989b89'));
  box(1.5,.03,21,-16,-.03,1,m.stone);box(10,.03,1.5,-19,-.02,13,m.stone);
  for(const x of [-25,25]){box(.12,1.1,53,x,.49,3,m.black,root,true);for(let z=-22;z<30;z+=2)box(.13,1.28,.13,x,.55,z,m.black);}
  box(50,1.1,.1,0,.5,-24,m.black,root,true);
  const plantingStart=new Set(root.children),retainedPlants=[];visuals.treeColliders=[];
  const foliage=new THREE.InstancedMesh(sphereGeo,m.darkgrass,192);let leafIndex=0;const matrix=new THREE.Matrix4();
  for(const [x,z,s] of [[-23.5,22,1.2],[18,26,1.2],[-23.5,3,1],[-23.5,-19,1],[23.3,-18,1.25],[23.3,-7,1],[23.3,8,1],[-18,28,.85]]){
    cyl(.15*s,3.2*s,x,1.6*s,z,mat('#76614b'));visuals.treeColliders.push(block(x,z,.3*s,.3*s,.02,3.2*s));
    for(let i=0;i<24;i++){
      const a=i*2.4,r=.5+(i%5)*.23,yy=3.6*s+Math.sin(i*1.7)*.8*s;
      matrix.compose(new THREE.Vector3(x+Math.cos(a)*r*s,yy,z+Math.sin(a)*r*s),new THREE.Quaternion(),new THREE.Vector3(.9*s,.85*s,.9*s));foliage.setMatrixAt(leafIndex++,matrix);
    }
  }
  foliage.castShadow=true;root.add(foliage);
  for(const x of [-9,-5,5,9])retainedPlants.push(plant(x,13.5,1.4),plant(x,-19.5,1.1));
  for(let x=-23;x<=23;x+=4){if(Math.abs(x)<5)continue;sphere(.62,x,.35,14.8,m.darkgrass,root,[1.35,.8,1.1]);}
  const flowerMats=[mat('#d9be86'),mat('#ede4c7'),mat('#b38570')];
  for(let j=0;j<28;j++){const x=15+(j%7)*.7,z=-1+Math.floor(j/7)*.8;cyl(.016,.35,x,.17,z,m.darkgrass);sphere(.10,x,.4,z,flowerMats[j%3]);}
  visuals.legacyPlantNodes=root.children.filter(o=>!plantingStart.has(o)&&!retainedPlants.includes(o));

  // Each wall opening has its own sill, frame and breakable glass collider.
  const shellStart=new Set(root.children),shellColliderStart=blockers.length,shellGlassStart=breakables.length;
  const sideShape=new THREE.Shape();sideShape.moveTo(-9.5,0);sideShape.lineTo(9.5,0);sideShape.lineTo(9.5,7);sideShape.lineTo(-9.5,7);sideShape.closePath();
  for(const u of [-5.5,4.5]){const hole=new THREE.Path();hole.moveTo(u-1.15,.62);hole.lineTo(u+1.15,.62);hole.lineTo(u+1.15,2.72);hole.absarc(u,2.72,1.15,0,Math.PI,false);hole.lineTo(u-1.15,.62);sideShape.holes.push(hole);}
  const sideGeometry=new THREE.ExtrudeGeometry(sideShape,{depth:.3,bevelEnabled:false});
  for(const x of [-12.15,11.85]){
    const wall=new THREE.Mesh(sideGeometry,m.white);wall.position.set(x,.13,-.5);wall.rotation.y=Math.PI/2;wall.castShadow=true;wall.receiveShadow=true;root.add(wall);
    for(const [a,b] of [[-10,-6.15],[-3.85,3.85],[6.15,9]])block(x+.15,(a+b)/2,.3,b-a,.1,7.13);
    for(const z of [-5,5]){block(x+.15,z,.3,2.3,.1,.75);for(let i=0;i<10;i++){const u=-1.15+(i+.5)*.23,top=2.85+Math.sqrt(Math.max(0,1.15**2-u*u));block(x+.15,z+u,.3,.23,top,7.13);}}
  }
  for(const [a,b] of [[-12,-1.65],[1.65,12]]){
    const x=(a+b)/2,edge=(b-a-4.8)/2;
    for(const side of [-1,1])rigidBox(edge,7,.26,x+side*(2.4+edge/2),3.6,9,m.white);
    rigidBox(4.8,.35,.26,x,.275,9,m.white);rigidBox(4.8,.8,.26,x,3.85,9,m.white);
    rigidBox(4.8,.85,.26,x,6.675,9,m.white);
    for(const side of [-1,1])rigidBox(.6,2,.26,x+side*2.1,5.25,9,m.white);
    windowFront(x,9,4.8,1.95,3);windowFront(x,9,3.6,5.25,2);
  }
  rigidBox(3.3,.775,.26,0,4.3875,9,m.white);rigidBox(3.3,.675,.26,0,6.7625,9,m.white);
  for(const x of [-1.45,1.45])rigidBox(.4,1.65,.26,x,5.6,9,m.white);
  box(3.52,.16,.5,0,3.91,9.12,m.trim);
  for(const x of [-1.71,1.71])box(.14,3.8,.45,x,2.03,9.12,m.black);
  windowFront(0,9.2,2.5,5.6,1.65);
  for(const [a,b] of [[-12,-1.5],[1.5,12]]){
    const x=(a+b)/2,edge=(b-a-5)/2;
    for(const side of [-1,1])rigidBox(edge,7,.25,x+side*(2.5+edge/2),3.6,-10,m.white);
    rigidBox(5,.4,.25,x,.3,-10,m.white);rigidBox(5,3.6,.25,x,5.3,-10,m.white);windowFront(x,-10,5,2,3);
  }
  box(3,3.7,.26,0,5.2,-10,m.white,root,true);
  for(const x of [-12,12]){
    for(const z of [5,-5]){
      const side=x<0?-Math.PI/2:Math.PI/2;archWindow(x,z,side);
    }
  }
  visuals.legacyShellNodes=root.children.filter(o=>!shellStart.has(o));
  visuals.legacyShellColliders=blockers.slice(shellColliderStart);
  visuals.legacyShellGlass=breakables.slice(shellGlassStart);
  // A white portico, black sconces, and the hinged glass entrance.
  const porticoStart=new Set(root.children);
  for(const x of [-3.3,3.3]){box(.45,4.9,.5,x,2.4,12,m.trim);box(.68,.16,.72,x,.09,12,m.stone);box(.68,.16,.7,x,4.8,12,m.trim);}
  box(7.8,.24,4,0,4.94,10.8,m.trim);box(8.1,.11,4.2,0,5.1,10.8,m.stone);
  for(const x of [-2.15,2.15])box(.12,1.6,.22,x,2.1,9.34,m.black);
  for(const x of [-3.23,3.23]){box(.04,.85,3.3,x,.88,11,m.black);for(let z=9.6;z<12.5;z+=.55)box(.04,.8,.04,x,.55,z,m.black);}
  visuals.legacyPorticoNodes=root.children.filter(o=>!porticoStart.has(o));
  visuals.entranceSign=sign(['RABIN ADHIKARI','MAKE YOURSELF AT HOME'],0,3.24,9.3,2.5,.7);
  const door=new THREE.Group();door.position.set(-1.6,.13,9.06);root.add(door);const frontParts=[];
  for(const [yy,hh] of [[.7,1.33],[2.4,1.93]]){const mesh=box(3.12,hh,.065,1.6,yy,0,m.glass,door),d=fragile(`front-door-pane-${yy}`,mesh,[1.56,hh/2,.0325],{moving:true,doorId:'front',label:'entrance glass'});frontParts.push(d.blocker);}
  for(const x of [0,3.2])frontParts.push(rigidBox(.07,3.4,.11,x,1.7,0,m.black,door,{moving:true,doorId:'front'}).b);
  for(const y of [0,1.4,3.4])frontParts.push(rigidBox(3.2,.07,.1,1.6,y,0,m.black,door,{moving:true,doorId:'front'}).b);
  frontParts.push(rigidBox(.05,1.2,.06,2.95,1.65,.12,m.black,door,{moving:true,doorId:'front'}).b);
  const doorBlocker={minX:-1.6,maxX:1.6,minZ:8.92,maxZ:9.2,minY:.13,maxY:3.53,active:true};
  const frontInteraction=interact('door','Open the front door',0,9,'door',{radius:2.5});frontInteraction.doorId='front';frontInteraction.blocker=doorBlocker;
  doors.push({id:'front',group:door,blocker:doorBlocker,colliders:frontParts,open:false,angle:Math.PI/2,label:'front door',x:0,z:9});
  const bellGroup=new THREE.Group();bellGroup.name='Entrance doorbell';bellGroup.position.set(1.96,1.22,9.36);root.add(bellGroup);
  box(.15,.27,.065,0,0,0,m.black,bellGroup);
  const bellButton=new THREE.Mesh(new THREE.CylinderGeometry(.036,.036,.014,20),m.gold.clone());bellButton.rotation.x=Math.PI/2;bellButton.position.set(0,-.025,.048);bellGroup.add(bellButton);
  const bellLight=new THREE.Mesh(new THREE.TorusGeometry(.046,.008,8,24),mat('#83d7b5',{emissive:'#83d7b5',emissiveIntensity:.55,roughness:.35}));bellLight.position.set(0,-.025,.045);bellGroup.add(bellLight);
  const entranceLights=[],entranceFixtureStart=new Set(root.children);
  for(const x of [-2.25,2.25]){box(.11,.34,.09,x,2.6,9.25,mat('#243b36'));box(.07,.21,.025,x,2.6,9.31,mat('#ffda9b',{emissive:'#ffc06f',emissiveIntensity:.6}));const light=new THREE.PointLight('#ffd59b',.45,6,2);light.position.set(x,2.5,9.5);root.add(light);entranceLights.push(light);}
  visuals.entranceFixtureNodes=root.children.filter(o=>!entranceFixtureStart.has(o));
  const bellInteraction=interact('doorbell','Ring the doorbell',1.96,9.55,'doorbell',{radius:1.85});
  const doorbell={group:bellGroup,button:bellButton,light:bellLight,interaction:bellInteraction,marker:markers.at(-1)};

  // Partition walls with generous openings onto the central hall.
  for(const x of [-2.1,2.1]){
    for(const [a,b] of [[-10,-6],[-3,2.4],[5.6,9]])box(.18,x>0?3.25:3.6,b-a,x,x>0?1.755:1.93,(a+b)/2,m.white,root,true);
    for(const z of [-4.5,4])box(.2,.4,3,x,3.53,z,m.white);
    for(const z of [-6,-3,2.4,5.6])box(.25,3.45,.08,x,1.83,z,m.trim);
  }
  // Right-side partitions end beneath the mezzanine slab, leaving its floor clear.
  for(const x of [-7,7])box(9.6,x>0?3.25:3.6,.15,x,x>0?1.755:1.93,0,m.white,root,true);
  for(const [id,x,z,label] of [['living',-2.1,4,'living room door'],['study',-2.1,-4.5,'study door'],['studio',2.1,-4.5,'studio door'],['play',2.1,4,'technology room door']]){
    const group=new THREE.Group();group.position.set(x,.13,z-1.44);root.add(group);
    const parts=[];
    for(const [yy,hh,zz,dd] of [[.565,1.13,1.44,2.88],[2.95,.2,1.44,2.88],[1.98,1.7,.245,.49],[1.98,1.7,2.635,.49]])parts.push(rigidBox(.08,hh,dd,0,yy,zz,m.oak,group,{moving:true,doorId:id}).b);
    const pane=box(.1,1.7,1.9,0,1.98,1.44,m.glass,group),d=fragile(`${id}-door-glass`,pane,[.05,.85,.95],{moving:true,doorId:id,label:'door glass'});parts.push(d.blocker);
    parts.push(rigidBox(.16,.06,.3,x<0?-.11:.11,1.18,2.55,m.gold,group,{moving:true,doorId:id}).b);
    const angle=x<0?-Math.PI/2:Math.PI/2;group.rotation.y=angle;
    const blocker={minX:x-.065,maxX:x+.065,minZ:z-1.44,maxZ:z+1.44,minY:.13,maxY:3.3,active:false};
    doors.push({id,group,blocker,colliders:parts,open:true,angle,label,x,z});
    const i=interact(`door-${id}`,`Close the ${label}`,x,z,'door',{radius:1.65});i.doorId=id;i.blocker=blocker;
  }
  for(const [name,x,z,rotation] of [['LIVING',-2.23,5.55,-Math.PI/2],['STUDY',-2.23,-3.03,-Math.PI/2],['PROJECTS',2.23,-3.03,Math.PI/2],['PLAY & BUILD',2.23,5.55,Math.PI/2]])sign([name],x,2.4,z,1.25,.5,rotation);
  box(2.5,.02,10,0,.145,0,mat('#bdb5a2'));
  for(const z of [7,2,-3,-8]){box(.1,.015,.1,0,.165,z,m.gold);cyl(.11,.045,0,6.9,z,m.gold);}
  plant(1,7.6,1.2);sign(['WELCOME IN','A STORY IN EVERY ROOM'],0,2.4,-9.85,2,.9);

  // Rounded, coherent furnishings with independent everyday objects.
  box(6.5,.026,5.5,-7,.145,4.45,m.rug);
  const sofa=furnish('sofa',-7,7.35,.13,{width:3.7,height:.88,depth:1.35,rotation:Math.PI,cushions:false});seat('sofa','Sit on the sofa',sofa);
  for(const [x,z,rot] of [[-10.3,5.3,Math.PI/2],[-3.6,5.3,-Math.PI/2]]){const chair=movableChair(`lounge-chair-${x}`,'armchair',x,z,.13,{rotation:rot,height:.88});seat(`seat-${x}`,'Sit in the armchair',chair.mesh,[0,0,1.2],chair.toy);}
  const coffee=furnish('coffee-table',-7,4.5,.13,{width:2.4,height:.5,depth:1.32});
  const cup=loose('cup','lounge-cup','ceramic cup',-7.55,.644,4.35,{mass:.18});fragile('lounge-cup-break',cup.mesh,cup.halfExtents,{material:'ceramic',threshold:1.4,toy:cup,collide:false,label:'ceramic cup',spill:'drink'});
  loose('book','lounge-book','book',-6.65,.644,4.45,{rotation:.2,mass:.45});
  for(const x of [-8.15,-5.9])loose('cushion',`sofa-cushion-${x}`,'loose cushion',x,.85,7.75,{kind:'cloth',mass:.35,rotation:Math.PI});
  rigidBox(.32,4.9,3.5,-11.72,2.55,4.3,m.marble);
  box(.07,1.35,1.85,-11.51,.98,4.3,m.black);
  const fireGroup=new THREE.Group();root.add(fireGroup);const fireMat=mat('#e8a847',{emissive:'#fda540',emissiveIntensity:1.5});
  for(let i=0;i<5;i++)sphere(.13,-11.44,.66+i%2*.14,3.68+i*.3,fireMat,fireGroup,[.65,2.4,1]);
  const fireLight=new THREE.PointLight('#ffad55',6,6,2);fireLight.position.set(-10.7,.9,4.3);root.add(fireLight);
  lamp(-4.2,7.6);plant(-10.8,8.1,1.3);plant(-10.7,1,1);
  const art=canvasTexture((c,w,h)=>{c.fillStyle='#dbd4bd';c.fillRect(0,0,w,h);c.fillStyle='#909f81';c.beginPath();c.moveTo(0,h);c.lineTo(0,h*.7);c.lineTo(w*.3,h*.3);c.lineTo(w*.6,h*.8);c.lineTo(w,h*.5);c.lineTo(w,h);c.fill();c.fillStyle='#4c6d62';c.beginPath();c.moveTo(0,h);c.lineTo(w*.48,h*.44);c.lineTo(w,h);c.closePath();c.fill();c.fillStyle='#ecd0a0';c.beginPath();c.arc(w*.75,h*.24,35,0,Math.PI*2);c.fill();},512,256);
  plane(2.9,1.4,-7,2.7,.12,new THREE.MeshBasicMaterial({map:art,color:art?0xffffff:'#94a488'}));
  for(const yy of [1.96,3.44])box(3.04,.08,.06,-7,yy,.1,m.oak);for(const x of [-8.52,-5.48])box(.08,1.56,.06,x,2.7,.1,m.oak);
  const projector=createProjector();root.add(projector.root);
  const piano=furnish('piano',-4.6,1,.13);interact('about','Read Rabin’s story',-7,2.1,'about');interact('fireplace','Toggle the fireplace',-10.55,3,'fireplace');interact('piano','Play the piano',-4.6,2.3,'piano');

  const bookshelf=furnish('bookcase',-7,-9.35,.13,{width:7.5,height:2.8,depth:.72});
  const desk=furnish('desk',-7,-5.9,.13,{width:4.7,height:.83,depth:1.55});
  const monitor=furnish('monitor',-7,-6.04,.972,{width:1.4,height:.94,depth:.3,screenMaterial:signMaterial(['RABIN ADHIKARI','ENGINEER / PROJECT LEAD'])});
  const study={desk,monitor,desktop:createStudyDesktop(monitor)};
  const studyChair=movableChair('study-chair','chair',-8.35,-4.3,.13,{rotation:Math.PI,height:1.05});seat('study-seat','Sit at the desk',studyChair.mesh,[1.2,0,.25],studyChair.toy);
  loose('keyboard','study-keyboard','keyboard',-7,.978,-5.4,{kind:'electronics',mass:.65});loose('mouse','study-mouse','mouse',-6.43,.978,-5.38,{kind:'electronics',mass:.09});
  loose('pens','study-pens','pens',-8.08,.978,-5.35,{mass:.025});loose('books','study-books','books',-8.4,.978,-5.9,{mass:.9});
  const deskCup=loose('cup','study-cup','ceramic cup',-5.8,.978,-5.53,{mass:.18});fragile('study-cup-break',deskCup.mesh,deskCup.halfExtents,{material:'ceramic',threshold:1.4,toy:deskCup,collide:false,label:'ceramic cup',spill:'drink'});
  const frame=loose('frame','study-frame','picture frame',-5.43,.978,-6.16,{mass:.4,screenMaterial:signMaterial(['JAPAN + NEPAL'])});const frameGlass=frame.mesh.userData.parts.glass;frameGlass.geometry.computeBoundingBox();fragile('study-frame-glass',frameGlass,frameGlass.geometry.boundingBox.getSize(new THREE.Vector3()).multiplyScalar(.5).toArray(),{material:'glass',threshold:2,toy:frame,whole:false,collide:false,label:'picture-frame glass'});
  sign(['EXPERIENCE','BUILDING → LEADING'],-10.1,2.3,-.11,2.8,1.3,Math.PI);lamp(-3.2,-8.7);plant(-10.8,-1.1,1.1);
  interact('experience','Explore the career timeline',-9,-7.7,'experience');interact('desk','Read the healthcare project',-6,-4.7,'healthcare');

  for(const [idx,x] of [[0,3.8],[1,6.7],[2,9.6]]){
    furnish('desk',x,-7.8,.13,{width:2.25,height:.88,depth:1.1});
    const titles=[['SOFTLEARN','LEARNING PLATFORM'],['HEALTHCARE','DATA MANAGEMENT'],['AI + DATA','CRAWLING & SCORING']];
    furnish('monitor',x,-8.04,1.027,{width:1.92,height:1.19,depth:.32,screenMaterial:signMaterial(titles[idx],['#265b49','#314a5a','#655a3b'][idx])});
    loose('keyboard',`studio-keyboard-${idx}`,'keyboard',x,1.028,-7.48,{kind:'electronics',mass:.65});loose('mouse',`studio-mouse-${idx}`,'mouse',x+.73,1.028,-7.5,{kind:'electronics',mass:.09});
    interact(['softlearn','healthcare','ai'][idx],['Explore SoftLearn','Explore healthcare data management','Explore AI crawling & scoring'][idx],x,-6.0,['softlearn','healthcare','ai'][idx]);
  }
  box(7,.02,3,6.6,.15,-4.9,mat('#d0c8b7'));sign(['SELECTED WORK','PRACTICAL PRODUCTS. CLEAR PURPOSE.'],7,2.3,-.11,5,1.3,Math.PI);plant(3,-9,1);plant(11,-1.1,1.2);
  sign(['HOW I BUILD','PYTHON · TYPESCRIPT · REACT','AWS · GCP · DATABASES'],6.8,2.3,.12,5,2);
  furnish('desk',6,7.3,.13,{width:4.5,height:.81,depth:1.3});
  for(let j=0;j<4;j++){const x=4.35+j*1.1;box(.76,.53,.64,x,1.24,7.4,mat(['#496d61','#56758b','#b69d6f','#555e58'][j]));sign([['API','CLOUD','DATA','AI'][j]],x,1.25,7.731,.62,.3,Math.PI);}
  for(const [j,topic] of ['api','cloud','data','ai'].entries())interact('tech-'+topic,'Ask Rabin about '+topic.toUpperCase(),4.35+j*1.1,6.1,'tech-'+topic,{radius:1.8});
  const arcade=furnish('arcade',3.8,2.2,.13,{screenMaterial:signMaterial(['MEMORY','MATCH & PLAY'])});interact('arcade','Play memory match',3.8,3.65,'memory');lamp(7.8,2);plant(11.4,8.1,1.3);

  // A real walkable staircase to the bedroom mezzanine.
  const stairCarStop=block(10.15,4.8,2.3,6.6,.13,3.53);stairCarStop.navOnly=true;stairCarStop.carOnly=true;
  for(let j=0;j<18;j++){const height=(j+1)/18*3.4,z=8.1-(j+.5)*6.6/18;box(2.3,.13,.4,10.15,.13+height,z,m.oak);physicsFloors.push({x:10.15,y:.13+height,z,w:2.3,h:.13,d:.4});}
  for(const x of [9,11.3]){
    for(let j=0;j<10;j++)box(.035,.85,.035,x,.63+(j/9)*3.4,8.1-j*6.6/9,m.black);
    const rail=box(.055,.055,7.47,x,2.25,4.8,m.black);rail.rotation.x=-Math.atan2(3.4,6.6);
  }
  box(9.7,.15,11.7,7.15,3.455,-4.15,m.wood);
  for(const x of [2.35,11.85]){
    box(.06,.06,11.7,x,4.48,-4.15,m.black);
    for(let z=-9.8;z<1.7;z+=.65)box(.035,.95,.035,x,4.0,z,m.black);
  }
  box(6.65,.06,.06,5.67,4.49,1.7,m.black);for(let x=2.4;x<8.9;x+=.55)box(.035,.95,.035,x,4.03,1.7,m.black);
  block(2.35,-4.1,.12,11.6,3.53,4.5);block(5.65,1.7,6.7,.12,3.53,4.5);
  const bed=furnish('bed',7.2,-6.8,3.53,{width:3.5,height:1.4,depth:4.3,cushions:false});
  for(const x of [6.3,8.1])loose('cushion',`bed-pillow-${x}`,'pillow',x,4.34,-8.3,{width:1.15,height:.2,depth:.65,kind:'cloth',rotation:Math.PI/2,mass:.3});
  for(const x of [4.6,9.8]){furnish('nightstand',x,-8.3,3.53,{width:.65,height:.72,depth:.65});lamp(x,-8.3,4.263,true);}
  sign(['ROOM TO GROW','JAPAN ↔ NEPAL'],7,5.5,-9.82,3,1.1);
  interact('future','Read about future plans',6.7,-3.6,'future',{y:3.53});plant(3.2,-8.2,1,3.53);
  const roofStart=new Set(root.children);
  const roofMat=mat('#d9dbd0',{transparent:true});const cap=box(24.6,.25,19.6,0,7.21,-.5,roofMat);roof.push(cap);
  for(const x of [-12.2,12.2])box(.25,.18,19.3,x,7.2,-.5,m.trim);
  visuals.legacyRoofNodes=root.children.filter(o=>!roofStart.has(o));

  // Rear terrace: contact desk, quiet pool, and warm string lights.
  furnish('desk',0,-18,.02,{width:3,height:.88,depth:1.4});
  const contactFrame=loose('frame','contact-sign','contact sign',0,.916,-18,{width:1.25,height:.6,depth:.22,mass:1.4,screenMaterial:signMaterial(['LET’S CONNECT','RABIN ADHIKARI'])});
  interact('contact','Connect with Rabin',0,-16.6,'contact');
  interact('garden-games','Explore the optional garden games',-3.5,-13,'fun');
  const poolStart=new Set(root.children),poolColliderStart=blockers.length;
  const pool={minX:-9.25,maxX:-4.75,minZ:-18.25,maxZ:-12.75,surface:.13,bottom:-.6};
  box(4.5,.07,5.5,-7,-.64,-15.5,mat('#6b8d87'));box(4.5,.01,5.5,-7,.13,-15.5,m.water);
  for(const [x,z,w,d] of [[-9.5,-15.5,.5,6],[-4.5,-15.5,.5,6],[-7,-18.5,4.5,.5],[-7,-12.5,4.5,.5]])rigidBox(w,.85,d,x,-.28,z,m.trim);
  const poolBoundary=block(-7,-15.5,5,6,-.65,.22);poolBoundary.navOnly=true;
  visuals.legacyPoolNodes=root.children.filter(o=>!poolStart.has(o));visuals.legacyPoolColliders=blockers.slice(poolColliderStart);
  for(const x of [-10,10])cyl(.045,3.2,x,1.6,-19,m.black);box(20,.016,.016,0,3.2,-19,m.black);
  const bulbs=[];
  for(let x=-9;x<=9;x+=1.5){const bulb=sphere(.09,x,3.05,-19,mat('#f7deaa',{emissive:'#ffcb69',emissiveIntensity:.7}));bulbs.push(bulb);fragile(`string-bulb-${x}`,bulb,[1,1,1],{material:'bulb',threshold:.7,label:'string-light bulb',onBreak:()=>bulb.material.emissiveIntensity=0,onRepair:()=>bulb.material.emissiveIntensity=.7});}
  for(const x of [4,8]){const chair=movableChair(`terrace-chair-${x}`,'terrace-chair',x,-15,.02,{height:.86});seat(`terrace-sit-${x}`,'Relax on the terrace',chair.mesh,[0,0,1.3],chair.toy);}
  const pot=loose('planter','terrace-pot','small ceramic planter',1.05,.916,-18.1,{mass:.8});fragile('terrace-pot-break',pot.mesh,pot.halfExtents,{material:'ceramic',threshold:3,toy:pot,collide:false,label:'ceramic planter',spill:'soil'});


  // Basketball: a physical ball flies toward a proper rim.
  box(9,.04,13,-19,.0,-10,mat('#8e9f89'));
  for(const x of [-23.4,-14.6])box(.055,.013,12.5,x,.04,-10,m.trim);
  for(const z of [-16.3,-3.7])box(8.8,.013,.055,-19,.04,z,m.trim);
  const circle=new THREE.Mesh(new THREE.RingGeometry(1.5,1.54,48),new THREE.MeshBasicMaterial({color:'#e4e1cc',side:THREE.DoubleSide}));circle.rotation.x=-Math.PI/2;circle.position.set(-19,.04,-7);root.add(circle);
  cyl(.08,3.8,-19,1.9,-17.6,m.black);block(-19,-17.6,.16,.16,0,3.8);box(2.2,1.4,.12,-19,3.2,-17.3,m.trim);block(-19,-17.3,2.2,.12,2.5,3.9);
  box(.85,.05,.03,-19,3.26,-17.2,m.black);for(const x of [-19.425,-18.575])box(.035,.59,.03,x,2.99,-17.2,m.black);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.23,.018,12,40),mat('#bc7952'));rim.rotation.x=Math.PI/2;rim.position.set(-19,2.98,-16.82);root.add(rim);
  for(let j=0;j<12;j++){const a=j*Math.PI/6;const net=box(.012,.49,.012,-19+Math.cos(a)*.19,2.72,-16.82+Math.sin(a)*.19,m.trim);net.rotation.z=Math.sin(a)*.15;}
  const ball=sphere(.12,-19,.17,-9.5,mat('#c48a48'));for(const rot of [0,Math.PI/2]){const band=new THREE.Mesh(new THREE.TorusGeometry(1.006,.025,4,28),m.black);band.rotation.y=rot;ball.add(band);}
  toys.push({id:'basketball',kind:'ball',label:'basketball',mesh:ball,radius:.12,mass:.62,holdable:true});
  sign(['TAKE A BREAK','PICK UP THE BALL · AIM · SHOOT'],-19,1.1,-3.8,3.8,.9,Math.PI);

  const vehicle=uploadedVehicle??createVehicle(),{car,carDoors,carWheels}=vehicle;car.position.set(18,.02,18);car.rotation.y=Math.PI;root.add(car);
  const carBlocker=collider(car,[vehicle.bounds.bodyWidth/2,vehicle.bounds.height/2,vehicle.bounds.length/2],[0,vehicle.bounds.height/2,0],{navOnly:true,vehicle:true});
  for(const d of vehicle.glass)fragile(d.id,d.mesh,d.halfExtents,{...d,center:d.center??[0,0,0],material:'glass',moving:true,label:d.type==='laminated'?'windscreen':'car window'});
  for(const d of vehicle.mirrors??[])fragile(d.id,d.mesh,d.halfExtents,{...d,center:d.center??[0,0,0],material:'glass',moving:true,label:'side mirror'});
  for(const d of vehicle.lamps)fragile(d.id,d.mesh,d.halfExtents,{...d,center:d.center??[0,0,0],material:'lamp',moving:true,label:'lamp cover',onBreak:()=>d.mesh.material.emissiveIntensity=0,onRepair:()=>d.mesh.material.emissiveIntensity=d.baseIntensity});
  for(const d of carDoors){d.colliders=(d.collision.shapes??[{halfExtents:d.collision.halfExtents,offset:d.collision.offset}]).map(s=>collider(d.group,s.halfExtents,s.offset,{moving:true,vehicle:true,quaternion:s.quaternion}));}
  sign(['GARDEN GARAGE','GET IN · DRIVE · RACE A LAP'],18,2.1,22,4,1,Math.PI);interact('car','Drive the garden SUV',18,18,'car',{radius:3.4});
  if(vehicle.imported)interact('car-controls','Car doors & lights',18,20.65,'car-controls',{radius:1.75,vehicleLocal:[0,0,-2.65]});

  // Loose objects can be picked up, kicked, stacked, and thrown.
  const football=sphere(.11,16,.16,9,mat('#e6debc'));
  for(let i=0;i<6;i++){const patch=sphere(.3,0,0,0,m.black,football);patch.position.set(Math.sin(i*2.4),Math.cos(i*1.6),Math.cos(i*2.4)).normalize().multiplyScalar(.92);}
  toys.push({id:'football',kind:'ball',label:'football',mesh:football,radius:.11,mass:.45,holdable:true});
  const bowlingBall=sphere(.11,19,.16,-8,mat('#437082',{metalness:.3,roughness:.3}));toys.push({id:'bowling-ball',kind:'ball',label:'bowling ball',mesh:bowlingBall,radius:.11,mass:2.8,holdable:true});
  for(let row=0;row<3;row++)for(let col=0;col<=row;col++){
    const pin=new THREE.Group();pin.position.set(19+(col-row/2)*.31,.21,-13-row*.36);root.add(pin);
    const profile=[new THREE.Vector2(.055,-.19),new THREE.Vector2(.072,-.16),new THREE.Vector2(.075,-.1),new THREE.Vector2(.052,.035),new THREE.Vector2(.025,.09),new THREE.Vector2(.024,.13),new THREE.Vector2(.043,.16),new THREE.Vector2(.043,.19),new THREE.Vector2(.018,.205)];
    const body=new THREE.Mesh(new THREE.LatheGeometry(profile,20),m.trim);body.castShadow=true;pin.add(body);cyl(.026,.026,0,.1,0,mat('#a85941'),pin);
    toys.push({id:`pin-${row}-${col}`,kind:'pin',label:'bowling pin',mesh:pin,halfExtents:[.075,.20,.075],mass:.6,holdable:true,shapes:[{halfExtents:[.068,.1,.068],center:[0,-.1,0]},{halfExtents:[.028,.075,.028],center:[0,.075,0]}]});
  }
  sign(['GARDEN BOWLING','PICK UP THE BLUE BALL · THROW'],19,1.3,-5.8,4,.9,Math.PI);
  for(let j=0;j<3;j++){const crate=loose('crate',`crate-${j}`,'wooden crate',15.8+j*.78,.024,13.8,{kind:'crate',mass:2});fragile(`crate-break-${j}`,crate.mesh,crate.halfExtents,{material:'wood',threshold:38,toy:crate,collide:false,label:'wooden crate'});}
  // A hanging training bag reacts to impulses through a physics constraint.
  for(const x of [15,17])box(.12,3.35,.12,x,1.66,-1,m.black,root,true);
  box(2.25,.14,.14,16,3.3,-1,m.black);
  const bag=new THREE.Group();bag.position.set(16,2.2,-1);root.add(bag);cyl(.33,1.35,0,0,0,mat('#9d7655'),bag);cyl(.35,.09,0,-.48,0,m.black,bag);cyl(.35,.09,0,.48,0,m.black,bag);
  const rope=box(.02,.43,.02,16,3.02,-1,m.black);
  toys.push({id:'training-bag',kind:'bag',label:'training bag',mesh:bag,halfExtents:[.33,.675,.33],mass:6,holdable:false});
  interact('bag','Punch the training bag',16,-1,'punch',{radius:2.1});
  sign(['STRETCH YOUR LEGS','CLICK / J TO PUNCH · PUSH & PLAY'],16,1.1,3,4,.9,Math.PI);
  interact('reset-toys','Repair & reset all objects',21,-7,'reset-toys',{radius:2});

  const checkpoints=[[20.5,3],[21,-21],[0,-22],[-21.5,-21],[-21.5,-1],[-18,20],[0,24],[18,18]].map(([x,z])=>({x,z}));
  const raceGate=new THREE.Group();root.add(raceGate);
  const gateRing=new THREE.Mesh(new THREE.TorusGeometry(2,.055,6,48),new THREE.MeshBasicMaterial({color:'#9cdaa0',transparent:true,opacity:.8}));gateRing.position.y=2;raceGate.add(gateRing);
  raceGate.visible=false;

  root.updateMatrixWorld(true);for(const b of blockers)if(b.mesh)updateCollider(b);
  const hostBlocker={minX:-.3,maxX:.3,minZ:7.1,maxZ:7.7,minY:.13,maxY:1.9,navOnly:true,host:true};
  return {root,blockers,interactions,markers,door,doorBlocker,doors,doorbell,entranceLights,fireGroup,fireLight,bulbs,roof,car,carDoors,carWheels,vehicle,carBlocker,hostBlocker,ball,rim,hoop:{x:-19,y:2.98,z:-16.82},toys,breakables,seats,piano,projector,study,arcade,pool,physicsFloors,checkpoints,raceGate,rope,visuals,registerFragile:fragile};
}
