export function textureSize(width,height,limit){
  const scale=limit>0?Math.min(1,limit/Math.max(width,height)):1;
  return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}

export async function resizeTextureImage(image,limit,{bitmap=globalThis.createImageBitmap,canvas=()=>document.createElement('canvas')}={}){
  const width=image.naturalWidth??image.width,height=image.naturalHeight??image.height,size=textureSize(width,height,limit);
  if(size.width===width&&size.height===height)return image;
  let result;
  if(bitmap){
    try{result=await bitmap(image,{resizeWidth:size.width,resizeHeight:size.height,resizeQuality:'high',premultiplyAlpha:'none',colorSpaceConversion:'none'});}catch{}
  }
  if(!result){
    result=canvas();result.width=size.width;result.height=size.height;
    const context=result.getContext('2d');if(!context)throw new Error('The texture could not be prepared.');
    context.drawImage(image,0,0,size.width,size.height);
  }
  image.close?.();return result;
}

// Decode one image at a time and resize before GLTFLoader creates its texture.
// The original files, UVs, materials and mesh buffers are not modified.
export function budgetImageLoader(loader,limit,resize=resizeTextureImage,onFailure=()=>{}){
  if(!limit)return loader;
  const wrapped=Object.create(loader);let queue=Promise.resolve();
  wrapped.load=(url,onLoad,onProgress,onError)=>{
    const task=queue.then(()=>new Promise((resolve,reject)=>{
      loader.load(url,async value=>{
        try{
          if(loader.isImageBitmapLoader)value=await resize(value,limit);
          else value.image=await resize(value.image,limit);
          onLoad(value);resolve();
        }catch(error){reject(error);}
      },onProgress,reject);
    }));
    queue=task.catch(error=>{onFailure(error);onError?.(error);});
  };
  return wrapped;
}

export function withTextureBudget(loader,maxTextureSize=0){
  if(maxTextureSize)loader.register(parser=>{
    let failure;
    parser.textureLoader=budgetImageLoader(parser.textureLoader,maxTextureSize,resizeTextureImage,error=>failure=error);
    return {name:'RABIN_mobile_textures',afterRoot(){if(failure)throw failure;}};
  });
  return loader;
}

export async function prepareGraphics(renderer,scene,camera,actors,{yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve))}={}){
  const visible=actors.map(actor=>actor.visible),frustum=new Map();
  try{
    actors.forEach(actor=>{actor.visible=true;actor.traverse?.(node=>{if(node.isMesh){frustum.set(node,node.frustumCulled);node.frustumCulled=false;}});});
    if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile?.(scene,camera);
    const textures=new Set();
    scene.traverse(object=>{
      for(const material of Array.isArray(object.material)?object.material:[object.material]){
        if(!material)continue;
        for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
      }
    });
    for(const texture of textures){renderer.initTexture?.(texture);await yieldFrame();}
    renderer.render(scene,camera);await yieldFrame();
  }finally{actors.forEach((actor,index)=>actor.visible=visible[index]);for(const [node,culled] of frustum)node.frustumCulled=culled;}
}
