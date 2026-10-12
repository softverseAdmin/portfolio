import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {loadMotionLibrary} from './motions.js';
import {receiveAsset,loadModelAsset} from './asset-transfer.js';
import {withTextureBudget} from './texture-budget.js';

export async function loadImportedCharacters({onProgress=()=>{},initialMotions,signal,maxTextureSize=0,sequential=false}={}){
  const roles={};
  const loadRole=async role=>{
    const baseURL=new URL('./assets/imported/characters/'+role+'/',import.meta.url);
    const metadata=await receiveAsset(new URL('metadata.json',baseURL),null,()=>{},signal);
    const [gltf,motions]=await Promise.all([
      loadModelAsset(withTextureBudget(new GLTFLoader(new THREE.LoadingManager()),maxTextureSize),new URL('model.glb',baseURL).href,event=>onProgress(role,event),{signal}),
      loadMotionLibrary({catalogURL:new URL('animation-catalog.json',baseURL),baseURL,signal,initial:[...new Set(['idle','walk','run','greet',...(initialMotions??['start-walk','stop-walk','jump','talk','talk-alt','sit','stand','sit-idle','drive','enter-car','exit-car','carry-walk','carry-idle','box-walk','box-idle'])])]}),
    ]);
    const model=gltf.scene,clip=motions.clips.get('greet');
    if(!clip||!model.getObjectByName('mixamorigRightHand'))throw new Error('The uploaded '+role+' model needs its native rig and handshake.');
    model.userData.appearance={height:metadata.height,source:'uploaded',preserveDesign:true};
    model.traverse(object=>{if(object.isMesh){object.castShadow=object.receiveShadow=true;for(const material of Array.isArray(object.material)?object.material:[object.material])if(material.map)material.map.anisotropy=4;}});
    roles[role]={model,clip,scale:metadata.scale,offset:new THREE.Vector3(...metadata.offset),motions,preserveMaterials:true,source:'uploaded',height:metadata.height,metadata};
  };
  if(sequential){for(const role of ['host','visitor'])await loadRole(role);}
  else await Promise.all(['host','visitor'].map(loadRole));
  return {roles,source:'uploaded'};
}
