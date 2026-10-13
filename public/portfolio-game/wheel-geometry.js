import * as THREE from './vendor/three.module.js';

const prepared=new WeakMap();
function indexedGeometry(source,indices){
  const geometry=new THREE.BufferGeometry();
  for(const [name,attribute] of Object.entries(source.attributes))geometry.setAttribute(name,attribute);
  geometry.setIndex(new THREE.BufferAttribute(indices,1));
  const position=source.attributes.position,box=new THREE.Box3(),point=new THREE.Vector3();
  for(const i of indices)box.expandByPoint(point.fromBufferAttribute(position,i));
  geometry.boundingBox=box;geometry.boundingSphere=box.getBoundingSphere(new THREE.Sphere());
  return geometry;
}

// The supplied fused exterior was split into rectangular wheel regions: these
// contain an arch and only part of each tyre. Select the complete original tyre
// triangles around the measured axle instead. Every source triangle, vertex,
// normal and UV survives; only its moving parent and index list change.
export function prepareOriginalWheels(car,config){
  if(config.sourceTriangles!==1500000||config.exportTriangles!==1827964||!config.originalExteriorPreserved)return;
  if(config.wheels.every(definition=>car.getObjectByName(definition.spin)?.userData.tyreRadius))return;
  car.updateMatrixWorld(true);
  const inverse=car.matrixWorld.clone().invert(),wheels=config.wheels.map(definition=>{
    const group=car.getObjectByName(definition.steer),spin=car.getObjectByName(definition.spin),old=car.worldToLocal(group.getWorldPosition(new THREE.Vector3()));
    return {group,spin,center:new THREE.Vector3(old.x,.415,definition.front?1.475:-1.265),radius:.425,meshes:[]};
  }),sources=[];
  car.traverse(mesh=>{if(mesh.isMesh&&mesh.material.name==='Original_Textured_Paint')sources.push({mesh,matrix:inverse.clone().multiply(mesh.matrixWorld)});});
  for(const {mesh,matrix} of sources){
    const source=mesh.geometry;let partition=prepared.get(source);
    if(!partition){
      const p=source.attributes.position,index=source.index,count=(index?.count??p.count)/3,labels=new Uint8Array(count),counts=new Uint32Array(5),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
      for(let triangle=0;triangle<count;triangle++){
        const start=triangle*3;
        a.fromBufferAttribute(p,index?.getX(start)??start);b.fromBufferAttribute(p,index?.getX(start+1)??start+1);c.fromBufferAttribute(p,index?.getX(start+2)??start+2);a.add(b).add(c).multiplyScalar(1/3).applyMatrix4(matrix);
        let label=0;
        if(Math.abs(a.x)>.66)for(let i=0;i<wheels.length;i++){
          const wheel=wheels[i],dy=a.y-wheel.center.y,dz=a.z-wheel.center.z;
          if(Math.sign(a.x)===Math.sign(wheel.center.x)&&dy*dy+dz*dz<wheel.radius*wheel.radius){label=i+1;break;}
        }
        labels[triangle]=label;counts[label]+=3;
      }
      if(!counts.slice(1).some(n=>n)){partition={geometries:[source]};}
      else{
        const indices=Array.from(counts,n=>new Uint32Array(n)),next=new Uint32Array(5);
        for(let triangle=0;triangle<count;triangle++){const label=labels[triangle],start=triangle*3;for(let j=0;j<3;j++)indices[label][next[label]++]=index?.getX(start+j)??start+j;}
        partition={geometries:indices.map(indices=>indices.length?indexedGeometry(source,indices):null)};
      }
      prepared.set(source,partition);
    }
    mesh.geometry=partition.geometries[0]??new THREE.BufferGeometry();
    if(!partition.geometries[0])mesh.visible=false;
    // Keep the fixed remainder of an old wheel cell attached to the chassis.
    if(/Wheel_/.test(mesh.name)){car.attach(mesh);mesh.matrix.copy(matrix);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);}
    for(let i=0;i<wheels.length;i++)if(partition.geometries[i+1]){
      const moving=new THREE.Mesh(partition.geometries[i+1],mesh.material);moving.name=mesh.name+' Tyre surface';moving.castShadow=mesh.castShadow;moving.receiveShadow=mesh.receiveShadow;
      moving.matrix.copy(new THREE.Matrix4().makeTranslation(-wheels[i].center.x,-wheels[i].center.y,-wheels[i].center.z).multiply(matrix));moving.matrix.decompose(moving.position,moving.quaternion,moving.scale);wheels[i].meshes.push(moving);
    }
  }
  for(const wheel of wheels){
    wheel.group.position.copy(wheel.center);wheel.group.rotation.set(0,0,0);wheel.spin.position.set(0,0,0);wheel.spin.rotation.set(0,0,0);wheel.spin.add(...wheel.meshes);wheel.spin.userData.tyreRadius=wheel.radius;
  }
  car.updateMatrixWorld(true);
}
