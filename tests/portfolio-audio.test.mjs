import test from 'node:test';
import assert from 'node:assert/strict';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

const saved={version:1,welcomed:true,settings:{sound:true,volume:.65}};
class UnavailableAudioContext {
  constructor(){this.sampleRate=1000;this.currentTime=0;this.destination={};}
  resume(){return Promise.reject(new Error('The audio device is unavailable'));}
  createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)};}
  node(){return {connect(){},start(){},stop(){},frequency:{},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}}};}
  createBufferSource(){return this.node();}
  createOscillator(){return this.node();}
  createBiquadFilter(){return this.node();}
  createGain(){return this.node();}
}
const advance=(api,frames)=>{for(let i=0;i<frames;i++)api.advanceFrame(1/60);};
const settle=()=>new Promise(setImmediate);

test('a rejected footstep audio resume does not interrupt walking',async t=>{
  const f=await controllerFixture(t,saved),{api}=f;f.window.AudioContext=UnavailableAudioContext;
  api.beginVisit();api.hideDialogue();api.state.hostReturnRoute=[];f.world.blockers.length=0;f.host.position.set(-50,.02,-50);
  api.placeVisitor({x:-19,y:.02,z:-8});api.look(api.cameraHeading()/.004,0);
  f.keydown('KeyW');advance(api,120);await settle();
  assert.ok(api.visitorPosition().z<-11.5,'walking continues through several footstep sounds');
  assert.equal(api.state.modal,false);assert.equal(api.state.phase,'playing');
});

test('rejected horn and impact audio resumes stay optional',async t=>{
  const f=await controllerFixture(t,saved),{api}=f;f.window.AudioContext=UnavailableAudioContext;
  api.beginVisit();api.hideDialogue();api.state.hostReturnRoute=[];
  api.state.driving=true;f.keydown('KeyH');api.state.driving=false;
  const ball=f.physics.toys.find(toy=>toy.id==='bowling-ball');ball.body.position.y=3;ball.body.velocity.setZero();ball.body.wakeUp();
  advance(api,180);await settle();
  assert.ok(ball.body.position.y<1,'the real physical object lands while audio is unavailable');
  assert.equal(api.state.modal,false);assert.equal(api.state.phase,'playing');
});
