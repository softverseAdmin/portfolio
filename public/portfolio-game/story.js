import {CHAPTERS} from './portfolio.js';
import {journeyDirections} from './journey.js';

export const PROGRESS_KEY='rabin-house-visit-v1';
const ACTIONS=['door','drive','carry','throw','strike'];
const storyIds=new Set(CHAPTERS.map(c=>c.id));

function defaults(){return {version:1,visited:[],actions:[],welcomed:false,completed:false,checkpoint:0,settings:{sound:false,volume:.65,night:false,quality:'balanced',reducedMotion:null}};}
export function sanitizeVisit(value){
  const result=defaults();if(!value||value.version!==1)return result;
  result.visited=[...new Set(Array.isArray(value.visited)?value.visited.filter(id=>storyIds.has(id)):[])];
  result.actions=[...new Set(Array.isArray(value.actions)?value.actions.filter(id=>ACTIONS.includes(id)):[])];
  result.welcomed=value.welcomed===true;result.completed=result.welcomed&&value.completed===true;
  result.checkpoint=result.welcomed&&Number.isInteger(value.checkpoint)?Math.max(0,Math.min(CHAPTERS.length,value.checkpoint)):0;
  const s=value.settings??{};
  result.settings={sound:s.sound===true,volume:Number.isFinite(s.volume)?Math.max(0,Math.min(1,s.volume)):.65,night:s.night===true,quality:s.quality==='low'?'low':'balanced',reducedMotion:typeof s.reducedMotion==='boolean'?s.reducedMotion:null};
  return result;
}
export function readVisit(storage){try{return sanitizeVisit(JSON.parse(storage?.getItem(PROGRESS_KEY)??'null'));}catch{return defaults();}}
export function writeVisit(storage,value){try{if(!storage)return false;storage.setItem(PROGRESS_KEY,JSON.stringify(sanitizeVisit(value)));return true;}catch{return false;}}
export function freshVisit(saved){return {...defaults(),settings:{...sanitizeVisit(saved).settings}};}

export function createInvitation(){
  const progress={stage:'ringing'};
  function change(from,to){if(progress.stage!==from)return false;progress.stage=to;return true;}
  return {progress,answer:()=>change('ringing','call'),navigate:()=>change('call','destination'),drive:()=>change('destination','driving'),arrive:()=>change('driving','parked'),depart:()=>change('parked','driving'),exit:()=>change('parked','exiting'),finish:()=>change('exiting','done'),skip:()=>{if(progress.stage==='done')return false;progress.stage='done';return true;}};
}

// Return from the mezzanine along its stairs, then enter rooms through the hall.
export function tourRouteFrom(position,chapter){
  const route=[];
  if(position.y>2.8){
    route.push([10.15,position.z],[10.15,1.55],[10.15,8.35],[8.6,8.35],[8.6,4],[0,4]);
  }else if(position.x>9&&position.x<11.3&&position.y>.5){
    route.push([10.15,position.z],[10.15,8.35],[8.6,8.35],[8.6,4],[0,4]);
  }else if(Math.abs(position.x)>2.2&&position.z>=-10&&position.z<=9){
    const doorway=position.z<0?-4.5:4;route.push([position.x,doorway],[0,doorway]);
  }else if(position.z<-10)route.push([0,position.z],[0,-8]);
  route.push(...chapter.route);
  return route;
}

export function guideShouldWait(host,visitor,waiting=false){
  // Let the visitor catch up before walking again, instead of restarting at every small step.
  return Math.hypot(host.x-visitor.x,host.z-visitor.z)>(waiting?5.5:7)||Math.abs(host.y-visitor.y)>(waiting?1.6:2.1);
}

export function surfaceAt(x,z,y=0){
  if(z>28&&journeyDirections({x,z}).roadDistance<3.6)return 'stone';
  if(Math.abs(x)<12&&z>=-10&&z<=9)return 'wood';
  if((Math.abs(x)<3.3&&z>9&&z<15.8)||(Math.abs(x)<11&&z<-10&&z>-20)||(x>13&&z>11&&z<26)||(x<-13&&z<-3))return 'stone';
  return 'grass';
}
