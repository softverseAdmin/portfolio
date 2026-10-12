import * as THREE from './vendor/three.module.js';

const geometryCache=new Map();
const up=new THREE.Vector3(0,1,0);

// Rounded panels share geometry, while the wheels and glass stay independent.
function roundedBox(width,height,depth,radius=.035){
  radius=Math.min(radius,width/2,height/2,depth/2);
  const key=[width,height,depth,radius].join(',');
  if(geometryCache.has(key))return geometryCache.get(key);
  if(Math.min(width,height,depth)<.026){
    const geometry=new THREE.BoxGeometry(width,height,depth);geometryCache.set(key,geometry);return geometry;
  }
  const half=[width/2,height/2,depth/2],positions=[],normals=[],uvs=[],indices=[];
  const steps=h=>Array.from(new Set([-h,-h+radius*.5,-h+radius,0,h-radius,h-radius*.5,h])).sort((a,b)=>a-b);
  for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
    const u=(axis+1)%3,v=(axis+2)%3,us=steps(half[u]),vs=steps(half[v]),start=positions.length/3;
    for(const b of vs)for(const a of us){
      const p=[0,0,0];p[axis]=half[axis]*sign;p[u]=a;p[v]=b;
      const c=p.map((value,i)=>THREE.MathUtils.clamp(value,-half[i]+radius,half[i]-radius));
      const n=new THREE.Vector3(p[0]-c[0],p[1]-c[1],p[2]-c[2]).normalize();
      positions.push(c[0]+n.x*radius,c[1]+n.y*radius,c[2]+n.z*radius);normals.push(n.x,n.y,n.z);
      uvs.push(a/(half[u]*2)+.5,b/(half[v]*2)+.5);
    }
    for(let j=0;j<vs.length-1;j++)for(let i=0;i<us.length-1;i++){
      const a=start+j*us.length+i,b=a+1,c=a+us.length,d=c+1;
      if(sign>0)indices.push(a,b,c,b,d,c);else indices.push(a,c,b,b,c,d);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
  geometry.computeBoundingBox();geometry.computeBoundingSphere();geometryCache.set(key,geometry);return geometry;
}

function profile(points){
  const shape=new THREE.Shape();shape.moveTo(...points[0]);for(const point of points.slice(1))shape.lineTo(...point);shape.closePath();return shape;
}

function sideGeometry(shape,thickness=.045){
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:14,steps:1});
  geometry.translate(0,0,-thickness/2);geometry.rotateY(-Math.PI/2);return geometry;
}

function beamCollider(a,b,radius){
  a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const delta=b.clone().sub(a);
  return {halfExtents:[radius,delta.length()/2,radius],offset:a.clone().add(b).multiplyScalar(.5).toArray(),quaternion:new THREE.Quaternion().setFromUnitVectors(up,delta.normalize()).toArray()};
}

function badgeTexture(text,background='#101417',color='#dfe2dc'){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const context=canvas.getContext('2d');if(!context)return null;
  context.fillStyle=background;context.fillRect(0,0,512,128);context.fillStyle=color;
  context.textAlign='center';context.textBaseline='middle';context.font='500 70px Arial';context.fillText(text,256,68,478);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

function combineStaticParts(parent,preserve){
  const batches=new Map();
  for(const mesh of parent.children){
    if(!mesh.isMesh||mesh.isInstancedMesh||preserve.has(mesh))continue;
    if(!batches.has(mesh.material))batches.set(mesh.material,[]);batches.get(mesh.material).push(mesh);
  }
  for(const [material,parts] of batches){
    if(parts.length<2)continue;
    const positions=[],normals=[],uvs=[],indices=[],vertex=new THREE.Vector3(),normal=new THREE.Vector3();let offset=0;
    for(const mesh of parts){
      mesh.updateMatrix();const geometry=mesh.geometry,p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv,normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrix);
      for(let i=0;i<p.count;i++){
        vertex.fromBufferAttribute(p,i).applyMatrix4(mesh.matrix);normal.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);
        positions.push(...vertex.toArray());normals.push(...normal.toArray());uvs.push(uv?.getX(i)??0,uv?.getY(i)??0);
      }
      const index=geometry.index;for(let i=0;i<(index?.count??p.count);i++)indices.push(offset+(index?.getX(i)??i));offset+=p.count;
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
    geometry.computeBoundingBox();geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,material);mesh.name=parent.name+' assembled surfaces';mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.parts=parts.map(p=>p.name);
    for(const part of parts)parent.remove(part);parent.add(mesh);
  }
}

export function createVehicle(){
  const car=new THREE.Group();car.name='J250 garden SUV';
  const carDoors=[],carWheels=[],glass=[],lamps=[],mirrors=[];
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.6,...extra});
  const m={
    paint:new THREE.MeshPhysicalMaterial({color:'#d4c9b6',metalness:.42,roughness:.31,clearcoat:.65,clearcoatRoughness:.23}),
    paintEdge:material('#b8ad9a',{metalness:.4,roughness:.36}),
    cladding:material('#24292d',{roughness:.66}),rubber:material('#101416',{roughness:.87}),
    rim:material('#414a50',{metalness:.85,roughness:.3}),silver:material('#a1a6a2',{metalness:.85,roughness:.32}),
    darkMetal:material('#2b3236',{metalness:.7,roughness:.44}),
    leather:material('#25292b',{roughness:.77}),seatEdge:material('#414745',{roughness:.72}),
    dash:material('#202527',{roughness:.69}),liner:material('#5f6260',{roughness:.93}),
    glass:material('#546c70',{transparent:true,opacity:.48,metalness:.12,roughness:.12,depthWrite:false,side:THREE.DoubleSide}),
    mirror:material('#c4d2d3',{metalness:.97,roughness:.07}),
    seam:material('#665f53',{roughness:.74}),plate:material('#e8e9e4',{roughness:.44}),
    screen:material('#273d47',{emissive:'#255877',emissiveIntensity:.28,roughness:.25})
  };
  const add=(geometry,mat,parent,name,x=0,y=0,z=0)=>{
    const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=!mat.transparent;mesh.receiveShadow=!mat.transparent;parent.add(mesh);return mesh;
  };
  const box=(name,w,h,d,x,y,z,mat=m.paint,parent=car,r=.035)=>add(roundedBox(w,h,d,r),mat,parent,name,x,y,z);
  const cylinder=(name,radius,length,x,y,z,mat=m.darkMetal,parent=car,segments=16)=>add(new THREE.CylinderGeometry(radius,radius,length,segments),mat,parent,name,x,y,z);
  function bar(name,a,b,radius,mat=m.rubber,parent=car){
    a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const delta=b.clone().sub(a);
    const mesh=add(new THREE.CylinderGeometry(radius,radius,delta.length(),10),mat,parent,name);
    mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(up,delta.normalize());return mesh;
  }
  function pane(name,geometry,parent,type='tempered',normal=[0,0,1],threshold=8){
    geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new THREE.Vector3());
    geometry.translate(-center.x,-center.y,-center.z);geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const mesh=add(geometry,m.glass.clone(),parent,name,...center.toArray());mesh.castShadow=false;mesh.receiveShadow=false;mesh.renderOrder=2;
    const size=geometry.boundingBox.getSize(new THREE.Vector3());
    const entry={id:name,mesh,parent,type,kind:'glass',vehicle:true,dimensions:size.toArray(),halfExtents:size.clone().multiplyScalar(.5).toArray(),center:[0,0,0],normal,normalSpace:'mesh',threshold,breakMode:type==='laminated'?'crack':'shatter',originalMaterial:mesh.material};
    mesh.userData.breakable={id:name,type,kind:'glass',vehicle:true,threshold,breakMode:entry.breakMode};glass.push(entry);return mesh;
  }
  function lamp(name,w,h,d,x,y,z,color,kind,parent=car){
    const mat=material(color,{emissive:color,emissiveIntensity:kind==='headlight'?.7:.45,roughness:.22});
    const mesh=box(name,w,h,d,x,y,z,mat,parent,.008);
    lamps.push({id:name,mesh,parent,material:mat,kind,materialKind:'lamp',vehicle:true,dimensions:[w,h,d],halfExtents:[w/2,h/2,d/2],center:[0,0,0],threshold:6,breakMode:'disable',baseIntensity:mat.emissiveIntensity});return mesh;
  }
  function badge(name,text,w,h,x,y,z,rotation=0,bg='#101417',fg='#dfe2dc'){
    const texture=badgeTexture(text,bg,fg),mat=new THREE.MeshBasicMaterial({color:texture?0xffffff:fg,map:texture});
    const mesh=add(new THREE.PlaneGeometry(w,h),mat,car,name,x,y,z);mesh.rotation.y=rotation;return mesh;
  }

  // A hollow passenger cabin leaves room for the seated, animated driver.
  box('Chassis',1.78,.18,4.36,0,.40,-.04,m.cladding,car,.05);
  box('Interior floor',1.69,.055,2.90,0,.515,-.56,m.dash,car,.018);
  box('Front underbody',1.70,.23,1.51,0,.59,1.47,m.cladding,car,.055);
  box('Rear underbody',1.74,.25,.79,0,.56,-1.91,m.cladding,car,.055);
  box('Hood',1.88,.15,1.66,0,1.105,1.40,m.paint,car,.065);
  for(const x of [-.64,.64])box('Hood pressed line',.019,.012,1.25,x,1.187,1.39,m.paintEdge,car,.005);
  box('Hood front lip',1.89,.055,.09,0,1.174,2.21,m.paint,car,.021);
  box('Roof',1.79,.115,2.80,0,1.795,-.88,m.paint,car,.053);
  box('Cabin headliner',1.65,.035,2.57,0,1.727,-.86,m.liner,car,.014);
  box('Rear tailgate',1.85,.63,.13,0,.88,-2.225,m.paint,car,.036);
  box('Rear upper tailgate frame',1.79,.105,.14,0,1.756,-2.235,m.paint,car,.039);
  box('Rear spoiler',1.89,.075,.26,0,1.817,-2.252,m.paint,car,.033);
  box('Spoiler underside',1.66,.035,.15,0,1.777,-2.320,m.cladding,car,.015);
  lamp('High rear brake light',.30,.028,.012,0,1.789,-2.398,'#b92323','brake');

  for(const side of [-1,1]){
    const front=new THREE.Shape();front.moveTo(.67,.49);front.lineTo(.865,.43);front.absarc(1.405,.43,.54,Math.PI,0,true);
    front.lineTo(2.29,.43);front.lineTo(2.29,1.0);front.quadraticCurveTo(2.29,1.13,2.11,1.13);front.lineTo(.67,1.13);front.closePath();
    add(sideGeometry(front,.12),m.paint,car,'Front fender '+side,side*.915);
    const rear=new THREE.Shape();rear.moveTo(-2.29,.43);rear.lineTo(-1.935,.43);rear.absarc(-1.395,.43,.54,Math.PI,0,true);
    rear.lineTo(-.665,.43);rear.lineTo(-.665,1.13);rear.lineTo(-2.23,1.13);rear.quadraticCurveTo(-2.29,1.1,-2.29,.98);rear.closePath();
    add(sideGeometry(rear,.12),m.paint,car,'Rear door and fender '+side,side*.915);
    box('Rear cabin side '+side,.10,.64,.14,side*.876,1.448,-2.177,m.paint,car,.028);
    box('Lower body sill '+side,.12,.13,1.72,side*.934,.474,.005,m.cladding,car,.035);
    box('Running board '+side,.19,.072,1.74,side*.994,.361,.005,m.cladding,car,.026);
    for(const offset of [-.052,0,.052])box('Running-board grip '+side,.009,.005,1.52,side*.994+offset,.401,.005,m.darkMetal,car,.002);
    for(const z of [1.405,-1.395]){
      const arch=new THREE.Shape(),outer=.592,inner=.537;
      for(let i=0;i<=16;i++){const a=i*Math.PI/16,p=[z+Math.cos(a)*outer,.43+Math.sin(a)*outer];if(i===0)arch.moveTo(...p);else arch.lineTo(...p);}
      for(let i=16;i>=0;i--){const a=i*Math.PI/16;arch.lineTo(z+Math.cos(a)*inner,.43+Math.sin(a)*inner);}arch.closePath();
      add(sideGeometry(arch,.096),m.cladding,car,'Wheel-arch trim '+side+' '+z,side*.980);
    }
    // Fixed rear door and quarter-light frames; their panes remain breakable.
    for(const z of [-.668,-1.40])box('Cabin pillar '+side,.086,.64,.088,side*.874,1.453,z,m.cladding,car,.019);
    box('Rear window belt '+side,.09,.045,1.54,side*.876,1.129,-1.442,m.cladding,car,.016);
    box('Rear window roof border '+side,.09,.045,1.54,side*.876,1.755,-1.442,m.paint,car,.016);
    const rearWindow=sideGeometry(profile([[-1.344,1.17],[-.724,1.17],[-.724,1.718],[-1.344,1.718]]),.014);
    const rearPane=pane('vehicle-rear-side-window-'+side,rearWindow,car,'tempered',[side,0,0]);rearPane.position.x+=side*.879;
    const quarterWindow=sideGeometry(profile([[-2.118,1.177],[-1.468,1.177],[-1.468,1.716],[-2.055,1.716],[-2.118,1.618]]),.014);
    const quarterPane=pane('vehicle-quarter-window-'+side,quarterWindow,car,'tempered',[side,0,0]);quarterPane.position.x+=side*.879;
    for(const z of [-.669,-1.424])box('Rear door seam '+side,.012,.54,.011,side*.978,.835,z,m.seam,car,.003);
    box('Rear door handle '+side,.05,.038,.167,side*.996,1.072,-1.278,m.cladding,car,.013);
    box('Rear handle recess '+side,.007,.057,.22,side*.981,1.066,-1.282,m.paintEdge,car,.014);
    if(side===1){
      const fuel=box('Fuel-door outline',.010,.185,.234,side*.980,1.055,-1.801,m.paintEdge,car,.026);
      box('Fuel door',.013,.169,.214,side*.987,1.055,-1.801,m.paint,car,.023);fuel.userData.decorative=true;
    }

    // The front doors hinge at the A-pillar and carry their own glass and mirror.
    const hinge=new THREE.Group();hinge.name=(side===1?'Driver':'Passenger')+' door hinge';hinge.position.set(side*.916,.5,.672);car.add(hinge);
    const panel=add(sideGeometry(profile([[-1.299,.004],[-.015,.004],[-.015,.56],[-.085,.64],[-1.299,.64]]),.078),m.paint,hinge,'Front door panel '+side);
    const aperture=[[-1.271,.666],[-.098,.666],[-.303,1.23],[-1.271,1.23]];
    const framePoints=aperture.map(([z,y])=>[0,y,z]);
    for(let i=0;i<4;i++)bar('Front window frame '+side,framePoints[i],framePoints[(i+1)%4],.032,m.cladding,hinge);
    bar('A-pillar paint '+side,[side*.011,.652,-.060],[side*.011,1.258,-.291],.042,m.paint,hinge);
    bar('Top door rail '+side,[side*.011,1.255,-.298],[side*.011,1.255,-1.302],.032,m.paint,hinge);
    box('Door belt trim '+side,.10,.045,1.29,0,.648,-.664,m.cladding,hinge,.016);
    box('Door lower trim '+side,.10,.115,1.28,0,.050,-.655,m.cladding,hinge,.025);
    box('Door seam rear '+side,.012,.536,.010,side*.044,.315,-1.291,m.seam,hinge,.002);
    const frontPane=pane('vehicle-front-side-window-'+side,sideGeometry(profile(aperture),.014),hinge,'tempered',[side,0,0]);
    frontPane.position.x+=side*.003;
    box('Front handle recess '+side,.009,.057,.218,side*.043,.568,-1.064,m.paintEdge,hinge,.014);
    box('Front door handle '+side,.057,.038,.168,side*.066,.574,-1.056,m.cladding,hinge,.013);
    box('Interior door panel '+side,.056,.45,1.13,-side*.053,.327,-.659,m.dash,hinge,.025);
    box('Interior armrest '+side,.101,.065,.46,-side*.083,.384,-.823,m.leather,hinge,.025);
    box('Interior door pull '+side,.04,.026,.18,-side*.104,.45,-.881,m.silver,hinge,.007);
    box('Mirror pedestal '+side,.115,.075,.17,side*.058,.68,-.16,m.cladding,hinge,.024);
    const mirror=box('Mirror housing '+side,.228,.222,.278,side*.159,.803,-.15,m.cladding,hinge,.043);
    const mirrorSurface=box('Mirror glass '+side,.172,.166,.014,side*.165,.803,-.296,m.mirror.clone(),hinge,.025);
    mirrors.push({id:'vehicle-mirror-'+side,mesh:mirrorSurface,parent:hinge,frame:mirror,kind:'mirror',materialKind:'mirror',vehicle:true,dimensions:[.172,.166,.014],halfExtents:[.086,.083,.007],center:[0,0,0],normal:[0,0,-1],normalSpace:'mesh',threshold:5,breakMode:'crack',originalMaterial:mirrorSurface.material});
    lamp('Mirror indicator '+side,.176,.018,.012,side*.160,.738,-.004,'#d89835','indicator',hinge);
    mirror.userData.decorative=true;
    const lowerPanel={halfExtents:[.071,.321,.650],offset:[0,.322,-.650]};
    const frameShapes=framePoints.map((point,i)=>beamCollider(point,framePoints[(i+1)%4],.033));
    frameShapes.push(beamCollider([side*.011,.652,-.060],[side*.011,1.258,-.291],.042));
    const door={group:hinge,panel,side,open:false,angle:-side*1.18,collision:{...lowerPanel,shapes:[lowerPanel,...frameShapes]},front:true};
    hinge.userData.vehicleDoor={side,angle:door.angle,front:true};carDoors.push(door);

    // Black seats have continuous cushions, bolsters, stitching and headrests.
    const sx=side*.458;
    box('Front seat cushion '+side,.505,.13,.57,sx,.773,-.473,m.leather,car,.057);
    box('Seat center cushion '+side,.355,.02,.44,sx,.849,-.441,m.seatEdge,car,.009);
    const back=box('Front seat back '+side,.504,.61,.144,sx,1.107,-.771,m.leather,car,.058);back.rotation.x=-.095;
    box('Seat back insert '+side,.346,.430,.022,sx,1.117,-.682,m.seatEdge,car,.01);
    for(const dx of [-.202,.202])box('Seat side bolster '+side,.073,.118,.458,sx+dx,.827,-.45,m.leather,car,.033);
    for(const dx of [-.071,.071])bar('Headrest post '+side,[sx+dx,1.373,-.811],[sx+dx,1.463,-.82],.010,m.silver);
    box('Front headrest '+side,.277,.216,.156,sx,1.529,-.821,m.leather,car,.049);
    box('Front floor mat '+side,.56,.016,.65,sx,.554,.044,m.rubber,car,.007);
  }

  const windshield=pane('vehicle-windshield',new THREE.BoxGeometry(1.67,.686,.015),car,'laminated',[0,0,1],14);
  windshield.position.set(0,1.468,.556);windshield.rotation.x=-.491;
  const rearGlass=pane('vehicle-rear-window',new THREE.BoxGeometry(1.633,.565,.015),car,'tempered',[0,0,-1],10);
  rearGlass.position.set(0,1.451,-2.262);rearGlass.rotation.x=.025;
  for(const side of [-1,1]){
    bar('Windshield seal '+side,[side*.844,1.160,.713],[side*.794,1.775,.389],.023,m.rubber);
    bar('A-pillar '+side,[side*.895,1.105,.675],[side*.839,1.771,.378],.043,m.paint);
    box('Roof side rail '+side,.069,.069,2.12,side*.865,1.776,-.844,m.paint,car,.028);
    for(const z of [-1.890,.13])box('Roof-rack foot '+side,.127,.083,.23,side*.651,1.878,z,m.cladding,car,.023);
    bar('Raised roof rack '+side,[side*.652,1.913,-1.982],[side*.652,1.953,-1.752],.030,m.cladding);
    bar('Roof rail '+side,[side*.652,1.953,-1.752],[side*.652,1.953,.10],.030,m.cladding);
    bar('Raised roof rack '+side,[side*.652,1.953,.10],[side*.652,1.913,.255],.030,m.cladding);
    box('Roof crossbar',1.27,.041,.11,0,1.950,side===1?-.35:-1.56,m.darkMetal,car,.015);
    bar('Windshield wiper '+side,[side*.119,1.186,.736],[side*.596,1.211,.724],.010,m.rubber);
    bar('Wiper arm '+side,[side*.518,1.154,.755],[side*.177,1.187,.741],.008,m.darkMetal);
  }
  box('Windshield lower seal',1.64,.034,.047,0,1.167,.728,m.cladding,car,.010);
  box('Rear window lower seal',1.68,.039,.028,0,1.161,-2.280,m.cladding,car,.010);
  bar('Rear wiper',[.12,1.203,-2.29],[-.349,1.237,-2.291],.010,m.rubber);
  box('Shark-fin antenna',.049,.095,.151,0,1.913,-1.945,m.paint,car,.021);

  // The front and rear bumpers have layered cladding, grilles and light units.
  box('Front fascia',1.88,.315,.135,0,.970,2.228,m.paint,car,.027);
  box('Grille surround',1.179,.321,.088,0,1.005,2.327,m.cladding,car,.028);
  box('Grille inset',1.053,.264,.018,0,1.003,2.381,m.rubber,car,.007);
  for(let i=-5;i<=5;i++)box('Grille upright',.017,.231,.022,i*.089,1.003,2.399,m.darkMetal,car,.003);
  for(const y of [.933,1.013,1.091])box('Grille crossbar',1.063,.016,.025,0,y,2.404,m.darkMetal,car,.004);
  badge('Grille TOYOTA badge','TOYOTA',.619,.10,0,1.011,2.423);
  box('Front bumper',1.974,.208,.248,0,.474,2.285,m.cladding,car,.055);
  box('Front center intake',1.012,.232,.085,0,.689,2.371,m.rubber,car,.019);
  for(let i=-4;i<=4;i++)box('Lower grille vertical',.016,.201,.018,i*.11,.688,2.422,m.darkMetal,car,.003);
  for(const y of [.622,.701,.775])box('Lower grille horizontal',.993,.012,.022,0,y,2.423,m.darkMetal,car,.003);
  box('Front silver skid plate',1.023,.094,.127,0,.370,2.360,m.silver,car,.026);
  box('Front plate holder',.555,.22,.032,0,.824,2.390,m.cladding,car,.011);
  box('Front number plate',.496,.163,.017,0,.829,2.414,m.plate,car,.005);
  badge('Front plate text','LAND CRUISER',.454,.052,0,.828,2.428,0,'#e8e9e4','#24292d');
  for(const side of [-1,1]){
    box('Front lamp housing '+side,.467,.185,.104,side*.719,1.04,2.307,m.cladding,car,.026);
    for(let i=0;i<4;i++){
      const x=side*(.570+i*.081);lamp('Square LED '+side+' '+i,.063,.074,.017,x,1.046,2.366,'#e5f1ef','headlight');
      box('LED lower trim '+side,.062,.007,.021,x,1.002,2.369,m.silver,car,.002);
    }
    lamp('Front amber marker '+side,.039,.153,.021,side*.938,1.039,2.366,'#efab36','indicator');
    box('Front bumper wing '+side,.333,.244,.212,side*.772,.713,2.315,m.paint,car,.040);
    box('Fog lamp recess '+side,.116,.074,.023,side*.786,.697,2.430,m.cladding,car,.013);
    lamp('Fog lamp '+side,.044,.034,.016,side*.786,.697,2.446,'#dce9dc','fog');
  }
  box('Rear bumper',1.986,.233,.224,0,.460,-2.279,m.cladding,car,.049);
  box('Rear silver skid plate',1.135,.112,.102,0,.364,-2.327,m.silver,car,.026);
  box('Rear tow cover',.329,.123,.049,0,.395,-2.414,m.cladding,car,.012);
  box('Rear handle trim',1.359,.089,.034,0,1.139,-2.304,m.darkMetal,car,.014);
  badge('Rear TOYOTA badge','TOYOTA',.448,.057,0,1.146,-2.327,Math.PI);
  box('Rear plate recess',.618,.306,.024,0,.92,-2.302,m.paintEdge,car,.022);
  box('Rear number plate',.494,.187,.022,0,.93,-2.323,m.plate,car,.005);
  badge('Rear plate text','LAND CRUISER',.449,.048,0,.93,-2.338,Math.PI,'#e8e9e4','#24292d');
  for(const side of [-1,1]){
    box('Rear light housing '+side,.199,.409,.071,side*.847,.997,-2.327,m.cladding,car,.021);
    for(const y of [.896,1.084]){
      lamp('Rear LED top '+side+' '+y,.158,.022,.018,side*.847,y+.067,-2.371,'#cd2924','tail');
      lamp('Rear LED bottom '+side+' '+y,.158,.022,.018,side*.847,y-.067,-2.371,'#cd2924','tail');
      for(const dx of [-.069,.069])lamp('Rear LED side '+side+' '+y+' '+dx,.02,.131,.018,side*.847+dx,y,-2.371,'#cd2924','tail');
    }
    lamp('Rear amber indicator '+side,.146,.024,.018,side*.847,.994,-2.373,'#b77b29','indicator');
    lamp('Rear reverse light '+side,.145,.016,.018,side*.847,.976,-2.373,'#d5ded4','reverse');
    lamp('Rear reflector '+side,.185,.035,.016,side*.789,.431,-2.401,'#901e1c','reflector');
  }
  const exhaust=cylinder('Exhaust tip',.030,.22,-.718,.335,-2.099,m.silver);exhaust.rotation.x=Math.PI/2;

  // A visible dashboard, pedals, console, rear bench and proper steering wheel.
  box('Dashboard',1.633,.215,.416,0,1.078,.337,m.dash,car,.052);
  box('Dashboard upper pad',1.641,.05,.392,0,1.211,.362,m.leather,car,.020);
  box('Dash horizontal trim',1.473,.03,.022,0,1.105,.116,m.silver,car,.007);
  for(const x of [-.621,.621]){
    box('Outer air vent',.203,.076,.037,x,1.169,.115,m.cladding,car,.013);
    for(let i=-1;i<=1;i++)box('Air-vent slat',.179,.005,.021,x,1.169+i*.017,.088,m.darkMetal,car,.002);
  }
  box('Infotainment surround',.326,.19,.069,-.05,1.175,.1,m.cladding,car,.019);
  box('Infotainment display',.286,.143,.011,-.05,1.18,.060,m.screen,car,.005);
  box('Instrument cluster',.307,.15,.105,.458,1.155,.089,m.dash,car,.020);
  box('Instrument face',.253,.089,.009,.458,1.163,.031,m.screen,car,.005);
  box('Center console',.243,.279,.673,0,.699,-.397,m.dash,car,.035);
  box('Center armrest',.251,.08,.286,0,.87,-.631,m.leather,car,.030);
  const gear=cylinder('Gear selector stem',.020,.09,0,.914,-.202,m.darkMetal);box('Gear selector',.054,.052,.085,0,.957,-.208,m.leather,car,.020);
  for(const z of [-.337,-.448]){const ring=add(new THREE.TorusGeometry(.036,.007,6,14),m.darkMetal,car,'Cup holder',0,.846,z);ring.rotation.x=Math.PI/2;}
  for(const x of [.386,.540]){const pedal=box('Driver pedal',.082,.036,.133,x,.655,.304,m.rubber,car,.009);pedal.rotation.x=.34;}
  box('Rear bench cushion',1.361,.145,.573,0,.647,-1.408,m.leather,car,.055);
  box('Rear bench back',1.373,.569,.145,0,.973,-1.778,m.leather,car,.053);
  for(const x of [-.458,0,.458]){
    box('Rear seat insert',.357,.422,.019,x,.964,-1.697,m.seatEdge,car,.009);
    box('Rear headrest',.250,.191,.149,x,1.327,-1.812,m.leather,car,.039);
  }
  const wheelCenter=new THREE.Vector3(.458,1.13,-.09),wheelAngle=-Math.PI/4;
  const steering=new THREE.Group();steering.name='Steering wheel';steering.position.copy(wheelCenter);steering.rotation.x=wheelAngle;car.add(steering);
  add(new THREE.TorusGeometry(.185,.023,8,30),m.leather,steering,'Steering-wheel rim');
  for(const a of [Math.PI/2,Math.PI*7/6,Math.PI*11/6])bar('Steering spoke',[0,0,0],[Math.cos(a)*.158,Math.sin(a)*.158,0],.017,m.darkMetal,steering);
  box('Steering hub',.104,.073,.044,0,0,.006,m.leather,steering,.018);
  const column=bar('Steering column',[.458,1.07,.18],wheelCenter.toArray(),.027,m.darkMetal);
  column.userData.decorative=true;
  const seatLocal=new THREE.Vector3(.458,.344,-.5),seatSurfaceLocal=new THREE.Vector3(.458,.859,-.5),seatHipLocal=seatSurfaceLocal.clone().add(new THREE.Vector3(0,.10,0));
  const steeringTargets=[new THREE.Vector3(-.157,0,0),new THREE.Vector3(.157,0,0)].map(v=>v.applyEuler(new THREE.Euler(wheelAngle,0,0)).add(wheelCenter));
  const pedalTargets=[new THREE.Vector3(.386,.730,.244),new THREE.Vector3(.540,.730,.244)];

  const tireProfile=[[-.120,.281],[-.141,.320],[-.126,.361],[-.085,.395],[.085,.395],[.126,.361],[.141,.320],[.120,.281]].map(([y,r])=>new THREE.Vector2(r,y));
  const tireGeometry=new THREE.LatheGeometry(tireProfile,36),spokeGeometry=roundedBox(.023,.195,.019,.006),treadGeometry=roundedBox(.079,.010,.036,.003);
  for(const side of [-1,1])for(const z of [-1.395,1.405]){
    const wheel=new THREE.Group();wheel.name='Road wheel '+side+' '+z;wheel.position.set(side*.902,.402,z);wheel.rotation.order='YXZ';car.add(wheel);
    const tire=add(tireGeometry,m.rubber,wheel,'All-terrain tire');tire.rotation.z=Math.PI/2;
    for(const x of [-.129,.129]){const sidewall=add(new THREE.TorusGeometry(.334,.003,5,36),m.cladding,wheel,'Tire sidewall ring',x,0,0);sidewall.rotation.y=Math.PI/2;}
    const tread=new THREE.InstancedMesh(treadGeometry,m.cladding,96);tread.name='Tire tread';tread.castShadow=true;wheel.add(tread);
    const transform=new THREE.Object3D();for(let i=0;i<96;i++){
      const lane=i%2,a=(Math.floor(i/2)+(lane?.5:0))*Math.PI/24;
      transform.position.set(lane?.049:-.049,Math.cos(a)*.397,Math.sin(a)*.397);transform.rotation.set(a,0,0);transform.updateMatrix();tread.setMatrixAt(i,transform.matrix);
    }tread.computeBoundingBox();tread.computeBoundingSphere();
    const barrel=cylinder('Wheel barrel',.278,.245,0,0,0,m.rim,wheel,32);barrel.rotation.z=Math.PI/2;
    const disc=cylinder('Brake disc',.233,.016,side*.115,0,0,m.silver,wheel,28);disc.rotation.z=Math.PI/2;
    box('Brake caliper',.024,.130,.068,side*.125,.133,.119,m.darkMetal,wheel,.010);
    const spokes=new THREE.InstancedMesh(spokeGeometry,m.rim,24);spokes.name='Dark split-spoke alloy';spokes.castShadow=true;wheel.add(spokes);
    for(let i=0;i<24;i++){
      const a=(Math.floor(i/2)*Math.PI/6)+(i%2?.048:-.048);
      transform.position.set(side*.145,Math.cos(a)*.170,Math.sin(a)*.170);transform.rotation.set(a,0,0);transform.updateMatrix();spokes.setMatrixAt(i,transform.matrix);
    }spokes.computeBoundingBox();spokes.computeBoundingSphere();
    const lip=add(new THREE.TorusGeometry(.269,.009,6,36),m.rim,wheel,'Rim lip',side*.151,0,0);lip.rotation.y=Math.PI/2;
    const hub=cylinder('Wheel hub',.069,.292,0,0,0,m.rim,wheel,20);hub.rotation.z=Math.PI/2;
    for(let i=0;i<6;i++){const a=i*Math.PI/3,lug=cylinder('Wheel lug',.010,.009,side*.154,Math.cos(a)*.046,Math.sin(a)*.046,m.silver,wheel,8);lug.rotation.z=Math.PI/2;}
    carWheels.push({group:wheel,tire,hub,front:z>0,side,radius:.402,width:.282,collision:{type:'cylinder',radius:.402,height:.282,axis:'X'},suspensionRestY:.402,localPosition:wheel.position.clone()});
  }

  const preserve=new Set([...glass.map(item=>item.mesh),...lamps.map(item=>item.mesh),...mirrors.flatMap(item=>[item.mesh,item.frame]),...carDoors.map(item=>item.panel),...carWheels.flatMap(item=>[item.tire,item.hub])]);
  for(const group of [car,...carDoors.map(item=>item.group),...carWheels.map(item=>item.group),steering])combineStaticParts(group,preserve);
  car.updateMatrixWorld(true);const measured=new THREE.Box3().setFromObject(car),size=measured.getSize(new THREE.Vector3());
  const bounds={
    min:measured.min.clone(),max:measured.max.clone(),center:measured.getCenter(new THREE.Vector3()),halfExtents:size.clone().multiplyScalar(.5),
    width:size.x,length:size.z,height:size.y,bodyWidth:1.986,bodyLength:4.78,cabin:{width:1.65,floorY:.542,roofY:1.709,frontZ:.40,rearZ:-2.16},
    wheelRadius:.402,wheelbase:2.80,track:1.804,
    chassisShapes:[
      {halfExtents:[.890,.090,2.180],offset:[0,.400,-.040]},
      {halfExtents:[.845,.0275,1.450],offset:[0,.515,-.560]},
      {halfExtents:[.850,.115,.755],offset:[0,.590,1.470]},
      {halfExtents:[.870,.125,.395],offset:[0,.560,-1.910]},
      {halfExtents:[.940,.075,.830],offset:[0,1.105,1.400]},
      {halfExtents:[.940,.1575,.0675],offset:[0,.970,2.228]},
      {halfExtents:[.987,.104,.124],offset:[0,.474,2.285]},
      {halfExtents:[.993,.1165,.112],offset:[0,.460,-2.279]},
      {halfExtents:[.895,.0575,1.400],offset:[0,1.795,-.880]},
      {halfExtents:[.925,.315,.065],offset:[0,.880,-2.225]},
      {halfExtents:[.895,.0525,.070],offset:[0,1.756,-2.235]},
      {halfExtents:[.840,.020,.016],offset:[0,1.161,-2.280]},
      {halfExtents:[.820,.017,.0235],offset:[0,1.167,.728]},
      {halfExtents:[.6805,.0725,.2865],offset:[0,.647,-1.408]},
      {halfExtents:[.6865,.2845,.0725],offset:[0,.973,-1.778]},
      ...[-1,1].flatMap(side=>[
        {halfExtents:[.043,.320,.044],offset:[side*.874,1.453,-.668]},
        {halfExtents:[.043,.320,.044],offset:[side*.874,1.453,-1.400]},
        {halfExtents:[.050,.320,.070],offset:[side*.876,1.448,-2.177]},
        {halfExtents:[.045,.0225,.770],offset:[side*.876,1.129,-1.442]},
        {halfExtents:[.060,.065,.860],offset:[side*.934,.474,.005]},
        {halfExtents:[.095,.036,.870],offset:[side*.994,.361,.005]},
        {halfExtents:[.060,.080,.645],offset:[side*.915,1.050,1.405]},
        {halfExtents:[.060,.290,.150],offset:[side*.915,.760,2.120]},
        {halfExtents:[.060,.350,.080],offset:[side*.915,.780,.745]},
        {halfExtents:[.060,.080,.785],offset:[side*.915,1.050,-1.445]},
        {halfExtents:[.060,.290,.140],offset:[side*.915,.760,-2.095]},
        {halfExtents:[.2525,.065,.285],offset:[side*.458,.773,-.473]},
        {halfExtents:[.252,.305,.072],offset:[side*.458,1.107,-.771],quaternion:new THREE.Quaternion().setFromEuler(new THREE.Euler(-.095,0,0)).toArray()},
        beamCollider([side*.895,1.105,.675],[side*.839,1.771,.378],.043),
        beamCollider([side*.652,1.953,-1.752],[side*.652,1.953,.10],.030)
      ])
    ]
  };
  car.userData.vehicle={bounds,seatLocal,seatSurfaceLocal,seatHipLocal,steeringTargets,pedalTargets,glassIds:glass.map(item=>item.id),lampIds:lamps.map(item=>item.id),mirrorIds:mirrors.map(item=>item.id)};
  return {car,carDoors,carWheels,steering,glass,lamps,mirrors,bounds,seatLocal,seatSurfaceLocal,seatHipLocal,steeringTargets,pedalTargets};
}
