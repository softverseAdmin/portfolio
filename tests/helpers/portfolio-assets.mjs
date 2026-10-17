import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from '../../public/portfolio-game/vendor/three.module.js';
import {GLTFLoader} from '../../public/portfolio-game/vendor/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from '../../public/portfolio-game/vendor/meshopt_decoder_v1.module.js';
import {WEB_ASSETS} from '../../public/portfolio-game/asset-catalog.js';
import {createImportedVehicle} from '../../public/portfolio-game/imported-vehicle.js';

// Keep the production geometry, skeleton and material sidedness for Node checks.
// Texture images are unnecessary for raycasts and bone-contact measurements.
export async function loadGeometryAsset(url){
  globalThis.self??=globalThis;
  if(String(url).endsWith('/assets/runtime/estate.glb'))url=new URL(WEB_ASSETS.house.url,new URL('../../public/portfolio-game/',import.meta.url));
  const bytes=readFileSync(url),length=bytes.readUInt32LE(12),data=JSON.parse(bytes.subarray(20,20+length));
  data.materials=data.materials.map(material=>({name:material.name,doubleSided:material.doubleSided,pbrMetallicRoughness:{baseColorFactor:material.pbrMetallicRoughness?.baseColorFactor,metallicFactor:0,roughnessFactor:1}}));
  delete data.textures;delete data.images;delete data.samplers;
  data.extensionsUsed=data.extensionsUsed?.filter(extension=>['KHR_mesh_quantization','EXT_meshopt_compression'].includes(extension));
  data.extensionsRequired=data.extensionsRequired?.filter(extension=>['KHR_mesh_quantization','EXT_meshopt_compression'].includes(extension));
  const json=Buffer.from(JSON.stringify(data)),jsonLength=Math.ceil(json.length/4)*4,binary=bytes.subarray(28+length),glb=Buffer.alloc(28+jsonLength+binary.length);
  glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(jsonLength,12);glb.writeUInt32LE(0x4e4f534a,16);
  glb.fill(0x20,20,20+jsonLength);json.copy(glb,20);glb.writeUInt32LE(binary.length,20+jsonLength);glb.writeUInt32LE(0x004e4942,24+jsonLength);binary.copy(glb,28+jsonLength);
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'');
}

export async function loadProductionCharacter(role,extra=[]){
  const folder=new URL('../../public/portfolio-game/assets/imported/characters/'+role+'/',import.meta.url);
  const {scene:model}=await loadGeometryAsset(new URL(WEB_ASSETS.characters[role].url,new URL('../../public/portfolio-game/',import.meta.url)));
  const metadata=JSON.parse(readFileSync(new URL('metadata.json',folder))),catalog=JSON.parse(readFileSync(new URL('animation-catalog.json',folder)));
  const clips=new Map([...new Set(['idle','walk','greet','sit','sit-idle','talk','stand',...extra])].map(id=>{
    const url=new URL(WEB_ASSETS.characters[role].motions[id].url,new URL('../../public/portfolio-game/',import.meta.url));
    return [id,THREE.AnimationClip.parse(JSON.parse(gunzipSync(readFileSync(url))))];
  }));
  return {model,clip:clips.get('greet'),scale:metadata.scale,offset:new THREE.Vector3(...metadata.offset),motions:{catalog,clips},preserveMaterials:true,source:'uploaded',height:metadata.height};
}

export async function loadProductionVehicle({raw=false}={}){
  const gltf=await loadGeometryAsset(new URL(WEB_ASSETS.car.url,new URL('../../public/portfolio-game/',import.meta.url)));
  const source={scene:gltf.scene,config:WEB_ASSETS.car.config};return raw?source:createImportedVehicle(source);
}
