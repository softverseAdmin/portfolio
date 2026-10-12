import test from 'node:test';
import assert from 'node:assert/strict';
import {deviceProfile,landscapeSize,landscapeDelta,applyRenderSize,installLandscape,requestLandscape} from '../public/portfolio-game/mobile.js';
import {textureSize,resizeTextureImage,budgetImageLoader,withTextureBudget,prepareGraphics} from '../public/portfolio-game/texture-budget.js';
import {touchControlLabels} from '../public/portfolio-game/controls.js';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

test('phones keep a landscape surface in both device orientations without enlarging the drawing buffer',()=>{
  const phone=deviceProfile({navigator:{userAgent:'iPhone'},devicePixelRatio:3,matchMedia:()=>({matches:true})});
  assert.equal(phone.mobile,true);assert.equal(phone.pixelRatio,1);assert.equal(phone.antialias,false);
  assert.equal(phone.maxTextureSize,2048);assert.equal(phone.shadowSize,1024);
  const portrait=landscapeSize(393,852,true),landscape=landscapeSize(852,393,true);
  assert.deepEqual(portrait,{width:852,height:393,rotated:true});
  assert.equal(portrait.width*portrait.height,landscape.width*landscape.height);
  assert.equal(deviceProfile({navigator:{userAgent:'desktop'},devicePixelRatio:2}).maxTextureSize,0);
});

test('rotation updates layout once and maps physical swipes back to the game axes',()=>{
  const flags={},events={},root={style:{}},env={innerWidth:393,innerHeight:852,navigator:{userAgent:'iPhone'},addEventListener:(event,fn)=>events[event]=fn};
  const doc={getElementById:()=>root,body:{classList:{toggle:(name,on)=>flags[name]=on}},addEventListener(){}};
  let updates=0;installLandscape({doc,env,onChange:()=>updates++});
  assert.equal(root.style.width,'852px');assert.equal(root.style.height,'393px');
  assert.equal(root.style.transform,'translateX(393px) rotate(90deg)');
  assert.equal(flags['portrait-landscape'],true);events.resize();assert.equal(updates,1);
  assert.deepEqual(landscapeDelta(0,30,true),{x:30,y:0});
  assert.deepEqual(landscapeDelta(30,0,true),{x:0,y:-30});
  env.innerWidth=852;env.innerHeight=393;events.resize();assert.equal(flags['portrait-landscape'],false);assert.equal(root.style.transform,'none');
});

test('a rejected fullscreen or orientation request cannot prevent a visit',async()=>{
  let requested=0,locked=0;
  const doc={getElementById:()=>null,documentElement:{requestFullscreen(){requested++;throw new Error('Unavailable');}}};
  const env={screen:{orientation:{lock:async value=>{locked++;assert.equal(value,'landscape');throw new Error('Unsupported');}}}};
  await assert.doesNotReject(requestLandscape({doc,env}));assert.equal(requested,1);assert.equal(locked,1);
});

test('repeated quality and viewport updates do not allocate another drawing buffer at the same size',()=>{
  let width=300,height=150,ratio=1,allocations=0;
  const renderer={getSize:target=>target.set(width,height),getPixelRatio:()=>ratio,domElement:{style:{}},setDrawingBufferSize(w,h,r){width=w;height=h;ratio=r;allocations++;}};
  assert.equal(applyRenderSize(renderer,852,393,1),true);
  for(let i=0;i<20;i++)assert.equal(applyRenderSize(renderer,852,393,1),false);
  assert.equal(allocations,1);assert.equal(renderer.domElement.style.width,'100%');
  assert.equal(applyRenderSize(renderer,852,393,1.6),true);assert.equal(allocations,2);
});

test('texture budgeting preserves aspect ratio, closes the oversized bitmap and leaves smaller images unchanged',async()=>{
  let closed=0;const original={width:4096,height:2048,close:()=>closed++};let options;
  const result=await resizeTextureImage(original,2048,{bitmap:async(image,value)=>{assert.equal(image,original);options=value;return {width:value.resizeWidth,height:value.resizeHeight};}});
  assert.deepEqual(result,{width:2048,height:1024});assert.equal(closed,1);assert.equal(options.premultiplyAlpha,'none');
  const small={width:512,height:256};assert.equal(await resizeTextureImage(small,2048),small);
  assert.deepEqual(textureSize(4096,4096,0),{width:4096,height:4096});
});

test('a browser without bitmap resizing uses a bounded canvas with the original image',async()=>{
  const calls=[],original={width:4096,height:4096},canvas={getContext:()=>({drawImage:(...args)=>calls.push(args)})};
  assert.equal(await resizeTextureImage(original,2048,{bitmap:null,canvas:()=>canvas}),canvas);
  assert.equal(canvas.width,2048);assert.deepEqual(calls,[[original,0,0,2048,2048]]);
});

test('texture decoding stays sequential and a failed image does not strand later requests',async()=>{
  const pending=[],completed=[],failed=[];
  const loader={isImageBitmapLoader:true,load:(url,onLoad,onProgress,onError)=>pending.push({url,onLoad,onError})};
  const wrapped=budgetImageLoader(loader,2048,async image=>image);
  wrapped.load('first',value=>completed.push(value),null,error=>failed.push(error));
  wrapped.load('second',value=>completed.push(value),null,error=>failed.push(error));
  await new Promise(setImmediate);assert.equal(pending.length,1);
  pending[0].onError(new Error('first failed'));await new Promise(setImmediate);assert.equal(pending.length,2);
  await pending[1].onLoad('second');await new Promise(setImmediate);
  assert.equal(failed.length,1);assert.deepEqual(completed,['second']);assert.equal(budgetImageLoader(loader,0),loader);
});

test('the texture fallback keeps the same material texture object and its UV settings',async()=>{
  const texture={image:{width:4096,height:4096},offset:{x:.2,y:.3},flipY:false};
  const loader={load:(url,onLoad)=>onLoad(texture)};
  const wrapped=budgetImageLoader(loader,2048,async()=>({width:2048,height:2048}));
  const result=await new Promise((resolve,reject)=>wrapped.load('original.png',resolve,null,reject));
  assert.equal(result,texture);assert.deepEqual(result.offset,{x:.2,y:.3});assert.equal(result.flipY,false);assert.equal(result.image.width,2048);
});

test('a failed texture makes model loading fail instead of silently showing a white material',async()=>{
  const error=new Error('texture unavailable'),parser={textureLoader:{isImageBitmapLoader:true,load:(url,onLoad,onProgress,onError)=>onError(error)}};let plugin;
  const loader={register:factory=>plugin=factory(parser)};withTextureBudget(loader,2048);
  await assert.rejects(new Promise((resolve,reject)=>parser.textureLoader.load('missing.png',resolve,null,reject)),error);
  assert.throws(()=>plugin.afterRoot(),error);
});

test('the first character textures and graphics frame are prepared before Visit becomes available',async()=>{
  const texture={isTexture:true},mesh={isMesh:true,frustumCulled:true},actor={visible:false,traverse:fn=>fn(mesh)},calls=[];
  const scene={traverse:fn=>{fn({material:{map:texture}});fn({material:[{map:texture}]});}};
  const renderer={compileAsync:async()=>{assert.equal(actor.visible,true);calls.push('compile');},initTexture:()=>calls.push('texture'),render:()=>{assert.equal(mesh.frustumCulled,false);calls.push('render');}};
  await prepareGraphics(renderer,scene,{},[actor],{yieldFrame:async()=>calls.push('yield')});
  assert.deepEqual(calls,['compile','texture','yield','render','yield']);assert.equal(actor.visible,false);assert.equal(mesh.frustumCulled,true);
});

test('graphics preparation restores visibility when rendering fails',async()=>{
  const actor={visible:false};await assert.rejects(prepareGraphics({compileAsync:async()=>{throw new Error('context lost');}},{},{},[actor]),/context lost/);
  assert.equal(actor.visible,false);
});

test('touch actions describe picking up, talking, throwing and driving',()=>{
  assert.equal(touchControlLabels({near:{action:'pickup'}})['touch-use'].label,'Pick up');
  assert.equal(touchControlLabels({near:{action:'host'}})['touch-use'].label,'Talk');
  assert.equal(touchControlLabels({held:{}})['touch-action'].label,'Throw');
  assert.equal(touchControlLabels({driving:true})['touch-run'].label,'Brake');
  assert.equal(touchControlLabels({driving:true})['touch-action'].label,'Horn');
  assert.equal(touchControlLabels({near:{action:'door',label:'Close the front door'}})['touch-use'].label,'Close');
});

test('the rotated joystick moves sideways and forward in the visible game directions',async t=>{
  const f=await controllerFixture(t,{version:1,welcomed:true,settings:{}}),{api,doc}=f;
  api.beginVisit();api.resetPosition();api.placeVisitor({x:-19,y:.02,z:-10});
  globalThis.innerWidth=393;globalThis.innerHeight=852;globalThis.matchMedia=()=>({matches:true});
  const stick=doc.getElementById('joystick'),point=(x,y,type)=>{for(const fn of stick.events[type]??[])fn({pointerId:7,clientX:x,clientY:y,preventDefault(){}});};
  point(52.5,86.5,'pointerdown');const from=api.visitorPosition();api.movePlayer(1/60);assert.ok(api.visitorPosition().x>from.x);assert.equal(api.visitorPosition().z,from.z);point(52.5,86.5,'pointerup');
  api.resetPosition();api.placeVisitor(from);point(86.5,52.5,'pointerdown');api.movePlayer(1/60);assert.ok(api.visitorPosition().z<from.z);assert.equal(api.visitorPosition().x,from.x);point(86.5,52.5,'pointerup');
});

test('Visit starts normally when mobile fullscreen is unavailable and fatal errors pause safely',async t=>{
  const f=await controllerFixture(t,{version:1,welcomed:true,settings:{}});
  globalThis.matchMedia=()=>({matches:true});
  assert.doesNotThrow(()=>f.api.beginVisit());assert.equal(f.api.state.phase,'playing');
  assert.doesNotThrow(()=>f.api.pauseAfterError());assert.equal(f.api.state.modal,true);
});
