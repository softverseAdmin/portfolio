import test from 'node:test';
import assert from 'node:assert/strict';
import {controllerFixture} from './helpers/portfolio-controller.mjs';
import {floorAt, horizontalDistance, isBlocked, CHAPTERS} from '../public/portfolio-game/core.js';
import {actorBlocker} from '../public/portfolio-game/arrival.js';

const saved = {version:1, welcomed:true, checkpoint:0, settings:{}};

for(const guiding of [false,true]) for(const fps of [30,60,120]) {
test(`blocking Rabin on the basketball court during ${guiding?'the tour':'his return'} at ${fps} FPS lets the visitor walk away`, async t => {
  const f = await controllerFixture(t, saved), {api, host, world} = f, dt=1/fps;
  api.beginVisit();
  api.hideDialogue();
  api.resetPosition();
  api.state.guide = guiding;
  api.state.chapter = CHAPTERS.findIndex(c=>c.id==='fun');
  const route = [[-19, -14]];
  api.state.hostReturnRoute = guiding?[]:route;
  api.state.guideRoute = guiding?route:[];
  api.state.guideWaiting = false;
  host.position.set(-19, floorAt(-19, -9), -9);
  api.placeVisitor({x:-19, y:floorAt(-19, -10), z:-10});
  for(let i=0;i<fps*3;i++) api.moveHost(dt);
  const stopped = host.position.clone(), visitor = api.visitorPosition();
  assert.equal(isBlocked(visitor.x, visitor.z, visitor.y, [...world.blockers, actorBlocker(stopped, .28)], .32), false,
    'the host must stop outside the visitor movement collider');
  for(let i=0;i<fps;i++) {
    assert.equal(api.moveHost(dt), 0, 'a blocked host must remain idle');
    assert.deepEqual(host.position, stopped, 'a blocked host must not jitter');
  }
  f.keydown('KeyW');
  api.movePlayer(dt);
  assert.ok(api.visitorPosition().z < visitor.z, 'ordinary walking away must move immediately');
  for(let i=0;i<fps;i++) {api.movePlayer(dt);api.moveHost(dt);}
  assert.ok(api.visitorPosition().z < visitor.z-1, 'walking must not repeatedly stick');
  api.placeVisitor({x:-21, y:floorAt(-21, -10), z:-10});
  for(let i=0;i<fps*6 && route.length;i++) api.moveHost(dt);
  assert.equal(route.length, 0);
  assert.ok(horizontalDistance(host.position, {x:-19,z:-14}) < .09);
  assert.ok(horizontalDistance(host.position, stopped) > 3);
});
}

test('blocking Rabin on the porch leaves the visitor free to step away and complete the arrival', async t => {
  const f = await controllerFixture(t), {api,host,world}=f;
  api.beginVisit();
  api.skipInvitation();
  api.resetPosition();
  api.placeVisitor({x:0,y:.13,z:10});
  api.getVisit().ring();
  for(let i=0;i<360;i++) {api.moveHost(1/60);api.updateDoors(1/60);}
  assert.equal(api.getVisit().progress.stage,'approaching');
  const p=api.visitorPosition();
  assert.equal(isBlocked(p.x,p.z,p.y,[...world.blockers,actorBlocker(host.position,.28)],.32),false);
  f.keydown('KeyS');
  api.movePlayer(1/60);
  assert.ok(api.visitorPosition().z>p.z,'the visitor can back away from the approaching host');
  api.placeVisitor({x:1.96,y:.13,z:11.8});
  for(let i=0;i<240;i++) {api.moveHost(1/60);api.updateDoors(1/60);}
  assert.equal(api.getVisit().progress.stage,'invited');
});

test('a visitor can step sideways when blocking a diagonal garden waypoint', async t => {
  const f=await controllerFixture(t,saved), {api,host,world}=f;
  api.beginVisit();api.resetPosition();api.hideDialogue();
  const chapter=CHAPTERS.findIndex(c=>c.id==='fun'), target=CHAPTERS[chapter].point;
  host.position.set(0,.02,-12);
  api.placeVisitor({x:-1.4,y:.02,z:-12.4});
  Object.assign(api.state,{guide:true,chapter,guideRoute:[[...target]],hostReturnRoute:[],guideWaiting:false});
  for(let i=0;i<180;i++) api.moveHost(1/60);
  const p=api.visitorPosition();
  assert.equal(isBlocked(p.x,p.z,p.y,[...world.blockers,actorBlocker(host.position,.28)],.32),false);
  f.keydown('KeyD');api.movePlayer(1/60);
  assert.ok(api.visitorPosition().x>p.x,'sideways walking must remain available');
  api.placeVisitor({x:1,y:.02,z:-13});
  for(let i=0;i<240 && api.state.guideRoute.length;i++) api.moveHost(1/60);
  assert.equal(api.state.guideRoute.length,0);
  assert.ok(horizontalDistance(host.position,{x:target[0],z:target[1]})<.09);
});
