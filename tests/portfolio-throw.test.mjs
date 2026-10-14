import test from 'node:test';
import assert from 'node:assert/strict';
import {controllerFixture} from './helpers/portfolio-controller.mjs';
import {loadProductionCharacter} from './helpers/portfolio-assets.mjs';
import {createRiggedCharacter} from '../public/portfolio-game/characters.js';
import {floorAt} from '../public/portfolio-game/core.js';

test('an aimed basketball shot uses the uploaded throw animation release position',async t=>{
  const player=createRiggedCharacter(await loadProductionCharacter('visitor',['throw','carry-idle']));
  const f=await controllerFixture(t,{version:1,welcomed:true,checkpoint:0,settings:{}},{player}),{api}=f;
  api.beginVisit();api.hideDialogue();api.state.hostReturnRoute=[];
  api.placeVisitor({x:-19,y:floorAt(-19,-8.55),z:-8.55});
  api.look(api.cameraHeading()/.004,0);
  for(let i=0;i<5;i++)api.advanceFrame(1/30);
  assert.equal(api.state.near?.id,'basketball');f.keydown('KeyE');
  for(let i=0;i<30;i++)api.advanceFrame(1/30);
  assert.equal(api.state.held?.id,'basketball');api.state.aiming=true;
  f.keydown('KeyJ');for(let i=0;i<15;i++)api.advanceFrame(1/30);
  for(const release of f.window.events.keyup)release({code:'KeyJ'});
  assert.equal(api.state.punch?.type,'throw');
  for(let i=0;i<180;i++)api.advanceFrame(1/30);
  assert.equal(api.state.held,null);assert.equal(api.state.throws,1);
  assert.equal(api.state.baskets,1,'aim assist must target the rim from where the ball is actually released');
});
