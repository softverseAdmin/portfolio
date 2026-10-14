import test from 'node:test';
import assert from 'node:assert/strict';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

const saved={version:1,welcomed:true,checkpoint:0,settings:{}};
const advance=(api,frames=60)=>{for(let i=0;i<frames;i++)api.advanceFrame(1/60);};
const release=(f,code)=>{for(const fn of f.window.events.keyup)fn({code});};

test('the desktop Run button toggles sprint speed and returns to walking',async t=>{
  const f=await controllerFixture(t,saved),{api,world,host}=f;
  api.beginVisit();api.hideDialogue();world.blockers.length=0;api.state.hostReturnRoute=[];host.position.set(-50,.02,-50);
  const button=f.doc.getElementById('desktop-run');assert.ok(button,'PC visitors need a visible Run control');
  api.placeVisitor({x:0,y:.02,z:0});f.keydown('KeyW');advance(api);
  const walk=api.visitorPosition();release(f,'KeyW');advance(api,15);
  api.placeVisitor({x:0,y:.02,z:0});button.onclick();assert.equal(button.getAttribute('aria-pressed'),'true');
  f.keydown('KeyW');advance(api);const run=api.visitorPosition();
  assert.ok(Math.hypot(run.x,run.z)>Math.hypot(walk.x,walk.z)*1.8);assert.equal(api.state.running,true);
  button.onclick();advance(api);assert.equal(api.state.running,false);assert.equal(button.getAttribute('aria-pressed'),'false');
});

test('Shift still runs, and opening controls clears the desktop run toggle',async t=>{
  const f=await controllerFixture(t,saved),{api}=f;api.beginVisit();api.hideDialogue();f.world.blockers.length=0;api.state.hostReturnRoute=[];f.host.position.set(-50,.02,-50);
  api.placeVisitor({x:0,y:.02,z:0});f.keydown('ShiftLeft');f.keydown('KeyW');advance(api);assert.equal(api.state.running,true);
  release(f,'ShiftLeft');advance(api);assert.equal(api.state.running,false);
  const button=f.doc.getElementById('desktop-run');assert.ok(button);button.onclick();advance(api);assert.equal(api.state.running,true);
  f.keydown('Escape');assert.equal(api.state.runToggle,false);assert.equal(api.state.running,false);
});
