import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld} from '../public/portfolio-game/world.js';
import {createSandboxPhysics} from '../public/portfolio-game/physics.js';
import {floorAt} from '../public/portfolio-game/core.js';
import {controllerFixture} from './helpers/portfolio-controller.mjs';
import {loadProductionCharacter} from './helpers/portfolio-assets.mjs';
import {createRiggedCharacter} from '../public/portfolio-game/characters.js';

for(const kick of [false,true])test(`a grounded visitor can ${kick?'kick':'punch'} the hanging training bag`,()=>{
  const world=createWorld(),physics=createSandboxPhysics(world);
  const target=physics.strike({x:16,y:floorAt(16,.1),z:.1},{x:0,y:0,z:-1},kick?9:6,kick);
  assert.equal(target?.id,'training-bag','the default hit action must reach the bag from the ground');
  assert.ok(target.body.velocity.z<0,'the hit must push the physical bag');
});

test('the uploaded punch animation can complete a punch, punch, kick combo',async t=>{
  const player=createRiggedCharacter(await loadProductionCharacter('visitor',['punch']));
  const f=await controllerFixture(t,{version:1,welcomed:true,checkpoint:0,settings:{}},{player}),{api}=f;
  api.beginVisit();api.hideDialogue();api.state.hostReturnRoute=[];
  api.placeVisitor({x:16,y:floorAt(16,.1),z:.1});
  for(let punch=0;punch<2;punch++){
    f.keydown('KeyJ');assert.equal(api.state.punch.type,'punch');
    assert.ok(api.state.punch.duration>1.2,'exercise the original motion that exceeds the combo timeout');
    for(let i=0;i<65;i++)api.advanceFrame(1/30);
    assert.equal(api.state.punch,null,'let the real animation finish before the next hit');
  }
  f.keydown('KeyJ');assert.equal(api.state.punch.type,'kick');
});
