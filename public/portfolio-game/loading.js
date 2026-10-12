// Keep completed assets when a visitor chooses to stop waiting for detail.
// Late downloads are handled, but never replace an already playable scene.
export function prepareVisitAssets(tasks,onProgress=()=>{},{readyIndexes=tasks.map((_,i)=>i),cancel=()=>{}}={}){
  const results=tasks.map(()=>({status:'pending'}));let finished=false,ready=false,resolve,resolveComplete;
  const promise=new Promise(done=>resolve=done);
  const complete=new Promise(done=>resolveComplete=done);
  function update(){
    onProgress(results.map(result=>result.status));
    if(!ready&&readyIndexes.every(i=>results[i].status!=='pending')){ready=true;resolve([...results]);}
    if(results.every(result=>result.status!=='pending')){finished=true;resolveComplete([...results]);}
  }
  tasks.forEach((task,index)=>Promise.resolve(task).then(value=>{
    if(finished)return;results[index]={status:'fulfilled',value};update();
  },reason=>{
    if(finished)return;results[index]={status:'rejected',reason};update();
  }));
  update();
  return {promise,complete,useBasic(){
    if(finished)return false;
    for(let i=0;i<results.length;i++)if(results[i].status==='pending'){
      const reason=new Error('Simpler models requested.');reason.code='simple-models';results[i]={status:'rejected',reason};
      cancel(i);
    }
    update();return true;
  }};
}

// Percentages describe actual loader bytes; transfer completion leaves room for parsing.
export function createAssetProgress(sizes,onUpdate=()=>{}){
  const entries=new Map(Object.entries(sizes).map(([id,total])=>[id,{loaded:0,total}]));let previous=0;
  function update(id,event){
    const entry=entries.get(id);if(!entry)return;
    if(event.total>0)entry.total=event.total;
    entry.loaded=Math.max(entry.loaded,Math.min(event.loaded,entry.total));
    const values=[...entries.values()],fraction=values.reduce((n,e)=>n+e.loaded,0)/values.reduce((n,e)=>n+e.total,0);
    previous=Math.max(previous,Math.min(.98,fraction*.98));onUpdate(previous);
  }
  return {update,finish(){previous=1;onUpdate(1);}};
}
