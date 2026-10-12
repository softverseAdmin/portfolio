const clamp=n=>Math.max(0,Math.min(1,n));
export function phase(t,start,end){const n=clamp((t-start)/(end-start));return n*n*(3-2*n);}
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});

export function actionPosition(action,t){
  if(t<=0)return {...action.from};if(t>=1)return {...action.to};
  if(action.path){
    const path=action.path;let i=1;while(i<path.length-1&&t>path[i].at)i++;
    return mix(path[i-1].point,path[i].point,phase(t,path[i-1].at,path[i].at));
  }
  const {from,to,type}=action;
  if(action.contact&&(type==='sit'||type==='stand')){
    const contact=action.contact;
    if(type==='sit')return t<.32?mix(from,contact,phase(t,0,.32)):mix(contact,to,phase(t,.32,.9));
    return t<.7?mix(from,contact,phase(t,0,.68)):mix(contact,to,phase(t,.7,1));
  }
  if(type==='sit')return {x:from.x+(to.x-from.x)*phase(t,0,.32),z:from.z+(to.z-from.z)*phase(t,0,.32),y:from.y+(to.y-from.y)*phase(t,.28,.9)};
  if(type==='stand')return {x:from.x+(to.x-from.x)*phase(t,.7,1),z:from.z+(to.z-from.z)*phase(t,.7,1),y:from.y+(to.y-from.y)*phase(t,0,.72)};
  return mix(from,to,phase(t,0,1));
}
export function carCameraBlend(type,t){return type==='enter-car'?phase(t,.28,.92):type==='exit-car'?1-phase(t,.08,.7):0;}
