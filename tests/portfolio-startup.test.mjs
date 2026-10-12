import test from 'node:test';
import assert from 'node:assert/strict';
import {loadVisitAssets,prepareVisitAssets} from '../public/portfolio-game/loading.js';
import {launchStartup} from '../public/portfolio-game/startup.js';

function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
const flush=()=>new Promise(setImmediate);

test('mobile loading waits for each large model before starting the next',async()=>{
  const character=deferred(),car=deferred(),house=deferred(),started=[];
  const tasks=loadVisitAssets({sequential:true,character:()=>{started.push('characters');return character.promise;},vehicle:()=>{started.push('car');return car.promise;},environment:()=>{started.push('house');return house.promise;}});
  const visit=prepareVisitAssets(tasks,()=>{},{readyIndexes:[0,2]});
  await flush();assert.deepEqual(started,['characters']);
  character.resolve('actors');await flush();assert.deepEqual(started,['characters','car']);
  car.resolve('vehicle');const ready=await visit.promise;assert.equal(ready[1].status,'pending');await flush();assert.deepEqual(started,['characters','car','house']);
  house.resolve('estate');const complete=await visit.complete;assert.equal(complete[1].value,'estate');
});

test('a failed character asset still allows the original car and house to load',async()=>{
  const started=[],error=new Error('character download failed');
  const tasks=loadVisitAssets({sequential:true,character:()=>{throw error;},vehicle:()=>{started.push('car');return 'vehicle';},environment:()=>{started.push('house');return 'estate';}});
  const visit=prepareVisitAssets(tasks);const result=await visit.complete;
  assert.equal(result[0].reason,error);assert.equal(result[2].value,'vehicle');assert.equal(result[1].value,'estate');assert.deepEqual(started,['car','house']);
});

test('desktop assets can continue loading in parallel',async()=>{
  const started=[],pending=deferred();const start=name=>()=>{started.push(name);return pending.promise;};
  const tasks=loadVisitAssets({character:start('characters'),vehicle:start('car'),environment:start('house')});
  await flush();assert.deepEqual(started,['characters','car','house']);pending.resolve();await Promise.all(tasks);
});

function documentFixture(){
  const ids=new Map(),element=()=>({hidden:true,disabled:false,style:{},classList:{add(){},remove(){},toggle(){}},focus(){}});
  return {body:element(),getElementById(id){if(!ids.has(id))ids.set(id,element());return ids.get(id);},querySelectorAll:()=>[],addEventListener(){}};
}

test('choosing a simpler visit before the game module loads is passed to boot',async()=>{
  const doc=documentFixture(),loading=deferred();let options;
  const startup=launchStartup({doc,loadGame:()=>loading.promise});startup.requestBasic();
  loading.resolve({boot:async value=>options=value});await startup.promise;assert.equal(options.useBasic,true);
});

test('startup failure presents recovery actions and stops the game only once',async t=>{
  const original=console.warn;console.warn=()=>{};t.after(()=>console.warn=original);
  const doc=documentFixture();let paused=0,retried=0;
  const startup=launchStartup({doc,loadGame:async()=>({boot:async()=>{throw new Error('context lost');},pauseAfterError:()=>paused++}),reload:()=>retried++});
  await startup.promise;assert.equal(paused,1);assert.equal(doc.getElementById('loading').hidden,false);assert.equal(doc.getElementById('loading-retry').hidden,false);
  assert.match(doc.getElementById('loading-status').textContent,/Retry/);startup.fail(new Error('a repeated frame error'));assert.equal(paused,1);
  doc.getElementById('loading-retry').onclick();assert.equal(retried,1);
});
