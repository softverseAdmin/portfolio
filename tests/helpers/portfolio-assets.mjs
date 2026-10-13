import {readFileSync} from 'node:fs';
import * as THREE from '../../public/portfolio-game/vendor/three.module.js';
import {GLTFLoader} from '../../public/portfolio-game/vendor/addons/loaders/GLTFLoader.js';

// Keep the production geometry, skeleton and material sidedness for Node checks.
// Texture images are unnecessary for raycasts and bone-contact measurements.
export async function loadGeometryAsset(url){
  globalThis.self??=globalThis;
  const bytes=readFileSync(url),length=bytes.readUInt32LE(12),data=JSON.parse(bytes.subarray(20,20+length));
  data.materials=data.materials.map(material=>({name:material.name,doubleSided:material.doubleSided,pbrMetallicRoughness:{baseColorFactor:material.pbrMetallicRoughness?.baseColorFactor,metallicFactor:0,roughnessFactor:1}}));
  delete data.textures;delete data.images;delete data.samplers;
  data.extensionsUsed=data.extensionsUsed?.filter(extension=>extension==='KHR_mesh_quantization');
  data.extensionsRequired=data.extensionsRequired?.filter(extension=>extension==='KHR_mesh_quantization');
  const json=Buffer.from(JSON.stringify(data)),jsonLength=Math.ceil(json.length/4)*4,binary=bytes.subarray(28+length),glb=Buffer.alloc(28+jsonLength+binary.length);
  glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(jsonLength,12);glb.writeUInt32LE(0x4e4f534a,16);
  glb.fill(0x20,20,20+jsonLength);json.copy(glb,20);glb.writeUInt32LE(binary.length,20+jsonLength);glb.writeUInt32LE(0x004e4942,24+jsonLength);binary.copy(glb,28+jsonLength);
  return new GLTFLoader().parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'');
}

export async function loadProductionCharacter(role){
  const folder=new URL('../../public/portfolio-game/assets/imported/characters/'+role+'/',import.meta.url);
  const {scene:model}=await loadGeometryAsset(new URL('model.glb',folder));
  const metadata=JSON.parse(readFileSync(new URL('metadata.json',folder))),catalog=JSON.parse(readFileSync(new URL('animation-catalog.json',folder)));
  const clips=new Map(['idle','walk','greet','sit','sit-idle','talk','stand'].map(id=>{const entry=catalog.clips.find(clip=>clip.id===id);return [id,THREE.AnimationClip.parse(JSON.parse(readFileSync(new URL(entry.src,folder))))];}));
  return {model,clip:clips.get('greet'),scale:metadata.scale,offset:new THREE.Vector3(...metadata.offset),motions:{catalog,clips},preserveMaterials:true,source:'uploaded',height:metadata.height};
}
