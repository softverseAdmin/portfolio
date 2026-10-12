import {Gunzip} from './vendor/addons/libs/fflate.module.js';

export function loadModelAsset(loader,url,onProgress=()=>{},{signal,timeoutMs=30000}={}){
  return new Promise((resolve,reject)=>{
    let timer,done=false;
    const clean=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);};
    const fail=error=>{if(done)return;done=true;clean();loader.manager.abort();reject(error);};
    const cancel=()=>fail(signal.reason??new Error('Model loading was cancelled.'));
    const touch=()=>{clearTimeout(timer);timer=setTimeout(()=>fail(new Error('The model download stopped responding.')),timeoutMs);};
    if(signal?.aborted){cancel();return;}
    signal?.addEventListener('abort',cancel,{once:true});touch();
    loader.load(url,value=>{if(done)return;done=true;clean();resolve(value);},event=>{if(done)return;touch();try{onProgress(event);}catch(error){fail(error);}},error=>{if(done)return;done=true;clean();reject(error);});
  });
}

// Reset the deadline as data arrives so a slow but active download can finish.
export async function receiveAsset(url,file,onProgress,signal,timeoutMs=30000){
  const request=new AbortController();let timer,reader,response,complete=false;
  const cancel=()=>request.abort(signal?.reason);
  if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true});
  const touch=()=>{clearTimeout(timer);timer=setTimeout(()=>request.abort(new Error('The asset download stopped responding.')),timeoutMs);};
  const check=()=>{if(request.signal.aborted)throw request.signal.reason;};
  const wait=task=>new Promise((resolve,reject)=>{
    const stop=()=>reject(request.signal.reason);
    request.signal.addEventListener('abort',stop,{once:true});
    if(request.signal.aborted)stop();
    Promise.resolve(task).then(value=>{request.signal.removeEventListener('abort',stop);resolve(value);},error=>{request.signal.removeEventListener('abort',stop);reject(error);});
  });
  try{
    touch();check();
    const fetching=fetch(url,{signal:request.signal,cache:'no-cache'}).then(value=>{
      response=value;
      if(request.signal.aborted){response.body?.cancel().catch(()=>{});throw request.signal.reason;}
      return response;
    });
    await wait(fetching);check();
    if(!response.ok)throw new Error('Asset request failed: '+response.status);
    // JSON metadata has no fixed size and is small enough to read directly.
    if(!file){const value=await wait(response.json());check();complete=true;return value;}
    reader=response.body?.getReader();
    const output=new Uint8Array(file.decodedBytes??file.bytes),gzip=!!file.deliveryUri?.endsWith('.gz');
    let loaded=0,written=0,compressed,inflate,started=false,prefix=[],prefixSize=0;
    const write=data=>{if(written+data.length>output.length)throw new Error('Asset exceeded its declared size: '+file.uri);output.set(data,written);written+=data.length;};
    function push(data,final=false){
      if(!started){
        prefix.push(data);prefixSize+=data.length;
        if(!final&&prefixSize<3)return;
        const first=new Uint8Array(prefixSize);let offset=0;for(const piece of prefix){first.set(piece,offset);offset+=piece.length;}
        compressed=gzip&&first[0]===0x1f&&first[1]===0x8b;started=true;prefix=[];
        if(compressed)inflate=new Gunzip(write);
        data=first;
      }
      if(compressed)inflate.push(data,final);else write(data);
    }
    function report(){const expected=gzip&&started&&!compressed?output.length:file.bytes;onProgress(Math.min(file.bytes,loaded/expected*file.bytes));}
    if(reader){
      while(true){check();const {done,value}=await wait(reader.read());check();if(done)break;touch();loaded+=value.length;push(value);report();}
      push(new Uint8Array(),true);
    }else{
      const data=new Uint8Array(await wait(response.arrayBuffer()));check();loaded=data.length;push(data,true);report();
    }
    const expected=gzip&&!compressed?output.length:file.bytes;
    if(loaded!==expected||written!==output.length)throw new Error('Asset size differs from its manifest: '+file.uri);
    onProgress(file.bytes);complete=true;return output;
  }finally{
    clearTimeout(timer);signal?.removeEventListener('abort',cancel);
    if(!complete){request.abort();await (reader?reader.cancel():response?.body?.cancel())?.catch(()=>{});}
    reader?.releaseLock();
  }
}
