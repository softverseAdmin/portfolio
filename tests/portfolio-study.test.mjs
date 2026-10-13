import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/portfolio-game/vendor/three.module.js';
import {CHAPTERS,STORY_PREVIEWS} from '../public/portfolio-game/portfolio.js';
import {STUDY_SLIDES,DESKTOP_PROJECTS,desktopPage} from '../public/portfolio-game/desktop.js';
import {createPresentationStory,createStudyStage,studyCamera} from '../public/portfolio-game/presentation.js';
import {createWorld} from '../public/portfolio-game/world.js';
import {applyEnvironmentAsset} from '../public/portfolio-game/model-assets.js';
import {createSandboxPhysics} from '../public/portfolio-game/physics.js';
import {createRiggedCharacter,animateRiggedCharacter} from '../public/portfolio-game/characters.js';
import {loadGeometryAsset,loadProductionCharacter} from './helpers/portfolio-assets.mjs';
import {controllerFixture} from './helpers/portfolio-controller.mjs';

test('the three study captions preserve the original career chapter and project descriptions',()=>{
  assert.equal(STUDY_SLIDES.length,3);assert.equal(STUDY_SLIDES.map(slide=>slide.caption).join(' '),CHAPTERS[1].text);
  DESKTOP_PROJECTS.forEach(id=>assert.equal(desktopPage(id).caption,STORY_PREVIEWS[id]));assert.equal(desktopPage('missing'),null);
});

test('project reading holds autoplay, section selection works while paused, and the last study slide completes once',()=>{
  let ended=0;const story=createPresentationStory({slides:STUDY_SLIDES,onEnd:()=>ended++});story.tick(1.2);assert.equal(story.count,3);
  story.holdReading();story.finishNarration();story.tick(100);assert.equal(story.index,0);story.togglePause();assert.equal(story.goTo(1),true);
  story.tick(100);assert.equal(story.index,1);assert.equal(story.paused,true);assert.equal(story.goTo(20),false);story.next();assert.equal(story.index,2);story.next();story.exit();assert.equal(ended,1);
});

let assets;
async function production(){
  assets??=Promise.all([loadGeometryAsset(new URL('../public/portfolio-game/assets/runtime/estate.glb',import.meta.url)),loadProductionCharacter('host'),loadProductionCharacter('visitor')]);
  const [estate,hostAsset,visitorAsset]=await assets,world=createWorld();applyEnvironmentAsset(world,estate.scene);
  const physics=createSandboxPhysics(world),host=createRiggedCharacter(hostAsset,{host:true}),player=createRiggedCharacter(visitorAsset);
  host.position.set(-6.8,.13,-4.5);player.position.set(-6,.13,-3.5);animateRiggedCharacter(host,10);animateRiggedCharacter(player,10);return {world,physics,host,player};
}
function seated(stage){for(let frame=0;frame<=120;frame++)stage.actors.forEach((actor,i)=>{const time=frame/60,pose=stage.pose(i,Math.min(1,time/1.2));pose.talking=i===0&&time>=1.2;animateRiggedCharacter(actor,time,0,false,true,pose);});}
const pose=actor=>actor.userData.rig.idle.map(({bone})=>[...bone.position.toArray(),...bone.quaternion.toArray()]);
function visible(hit){for(let node=hit.object;node;node=node.parent)if(!node.visible)return false;return true;}
function screenPoint(screen,u,v){screen.geometry.computeBoundingBox();const b=screen.geometry.boundingBox;return screen.localToWorld(new THREE.Vector3(THREE.MathUtils.lerp(b.min.x,b.max.x,u),THREE.MathUtils.lerp(b.min.y,b.max.y,v),b.max.z+.001));}

test('the study uses the original monitor and chairs, keeps uploaded hips and feet planted, and restores their exact state',async()=>{
  const f=await production(),monitor=f.world.study.monitor,screen=f.world.study.desktop.screen,originalMaterial=screen.material,originalGeometry=screen.geometry,original={position:monitor.position.clone(),scale:monitor.scale.clone(),quaternion:monitor.quaternion.clone()};
  f.physics.syncColliders();const bounds=f.world.blockers.map(box=>['minX','maxX','minY','maxY','minZ','maxZ'].map(key=>box[key]));
  const chairs=['study-seat','seat--3.6'].map(id=>f.world.seats.find(seat=>seat.id===id)),saved=chairs.map(seat=>({position:seat.mesh.position.clone(),quaternion:seat.mesh.quaternion.clone()})),actors=[f.host,f.player].map(actor=>({position:actor.position.clone(),bones:pose(actor)}));
  const stage=createStudyStage(f);assert.ok(stage);assert.equal(f.world.study.desktop.active,true);assert.equal(screen.material.toneMapped,false);assert.notDeepEqual(monitor.scale,original.scale);seated(stage);
  stage.actors.forEach((actor,i)=>{const target=stage.pose(i,1),bones=actor.userData.rig.bones;assert.ok(bones.Hips.getWorldPosition(new THREE.Vector3()).distanceTo(target.seatHipTarget)<.001);['Right','Left'].forEach((side,j)=>assert.ok(bones[side+'Foot'].getWorldPosition(new THREE.Vector3()).distanceTo(target.seatFootTargets[j])<.025));});
  stage.restore();stage.restore();assert.deepEqual(monitor.position,original.position);assert.deepEqual(monitor.scale,original.scale);assert.deepEqual(monitor.quaternion.toArray(),original.quaternion.toArray());assert.ok(screen.material===originalMaterial);assert.ok(screen.geometry===originalGeometry);assert.equal(f.world.study.desktop.active,false);
  f.world.blockers.forEach((box,i)=>['minX','maxX','minY','maxY','minZ','maxZ'].forEach((key,j)=>assert.ok(Math.abs(box[key]-bounds[i][j])<1e-6||box[key]===bounds[i][j],`the study leaves a changed ${key} collision bound`)));
  chairs.forEach((seat,i)=>{assert.deepEqual(seat.mesh.position,saved[i].position);assert.deepEqual(seat.mesh.quaternion.toArray(),saved[i].quaternion.toArray());});[f.host,f.player].forEach((actor,i)=>{assert.deepEqual(actor.position,actors[i].position);assert.deepEqual(pose(actor),actors[i].bones);});
});

test('the desktop is clear in the loaded estate, its project buttons work on the original screen, and both characters remain in frame',async()=>{
  const f=await production(),stage=createStudyStage(f);assert.ok(stage);seated(stage);const display=f.world.study.desktop,screen=display.screen;display.showSlide(STUDY_SLIDES[0]);
  f.world.roof.forEach(mesh=>mesh.visible=false);f.world.root.updateMatrixWorld(true);
  for(const angle of [-Math.PI/2,-Math.PI/4,0]){
    f.world.doors.find(door=>door.id==='study').group.rotation.y=angle;f.physics.syncColliders();f.world.root.updateMatrixWorld(true);
    for(const aspect of [4/3,16/9,844/390,2.4]){
      const view=studyCamera(aspect,f.world.blockers),camera=new THREE.PerspectiveCamera(view.fov,aspect,.1,220);camera.position.copy(view.position);camera.lookAt(view.target);camera.updateMatrixWorld(true);
      for(const u of [.03,.33,.66,.97])for(const v of [.03,.33,.66,.97]){
        const point=screenPoint(screen,u,v),ndc=point.clone().project(camera);assert.ok(Math.abs(ndc.x)<1&&Math.abs(ndc.y)<1,`aspect ${aspect} crops the study screen`);
        const hit=new THREE.Raycaster(view.position,point.clone().sub(view.position).normalize()).intersectObject(f.world.root,true).find(visible);assert.ok(hit?.object===screen,`${hit?.object.name||'furniture'} covers the study screen`);
      }
      for(const actor of stage.actors)for(const name of ['Head','Hips']){const ndc=actor.userData.rig.bones[name].getWorldPosition(new THREE.Vector3()).project(camera);assert.ok(Math.abs(ndc.x)<1&&Math.abs(ndc.y)<1,`aspect ${aspect} crops the seated ${name}`);}
      for(const target of display.hotspots.filter(hit=>DESKTOP_PROJECTS.includes(hit.id))){
        const point=screenPoint(screen,(target.x+target.w/2)/1536,1-(target.y+target.h/2)/864),ray=new THREE.Raycaster(view.position,point.clone().sub(view.position).normalize());
        const hit=ray.intersectObjects([f.world.root,f.host,f.player],true).find(visible);assert.ok(hit?.object===screen,`a character or prop covers ${target.id}'s project button`);assert.equal(display.hit(hit.uv),target.id);
      }
    }
  }
  for(const id of [...DESKTOP_PROJECTS,'about','question-0','question-1']){
    display.showPage(id);const view=studyCamera(844/390,f.world.blockers,true),point=screenPoint(screen,.5,.5),hit=new THREE.Raycaster(view.position,point.clone().sub(view.position).normalize()).intersectObjects([f.world.root,f.host,f.player],true).find(visible);assert.ok(hit?.object===screen,`the close view of ${id} is blocked`);
  }
  stage.restore();
});

test('a blocked or held study chair restores the monitor and leaves exploration intact',async()=>{
  const f=await production(),monitor=f.world.study.monitor,original=monitor.scale.clone(),material=f.world.study.desktop.screen.material;
  f.physics.toys.find(toy=>toy.id==='study-chair').held=true;assert.equal(createStudyStage(f),null);assert.deepEqual(monitor.scale,original);assert.ok(f.world.study.desktop.screen.material===material);assert.equal(f.world.study.desktop.active,false);
});

async function studyController(t){const f=await controllerFixture(t,{version:1,welcomed:true,checkpoint:0,settings:{}},await production());f.api.beginVisit();f.api.hideDialogue();f.api.placeVisitor({x:-6,y:.13,z:-3.5});f.host.position.set(-6.8,.13,-4.5);f.api.state.hostReturnRoute=[];return f;}
const button=(f,id)=>f.doc.getElementById(id);

test('the guided study chapter uses three slides and continues to the project studio after the last one',async t=>{
  const f=await studyController(t);f.api.state.guide=true;f.api.state.chapter=1;f.api.state.guideWaiting=true;f.api.advanceFrame(1/60);assert.ok(f.api.state.presentation?.study);assert.equal(button(f,'dialogue').hidden,true);
  for(let frame=0;frame<90;frame++)f.api.advanceFrame(1/60);assert.equal(button(f,'story-count').textContent,'1 / 3');assert.equal(button(f,'desktop-browse').hidden,false);
  button(f,'story-pause').onclick();const time=f.api.state.presentation.story.time,bones=[f.host,f.player].map(pose);for(let frame=0;frame<60;frame++)f.api.advanceFrame(1/60);assert.equal(f.api.state.presentation.story.time,time);[f.host,f.player].forEach((actor,i)=>assert.deepEqual(pose(actor),bones[i]));
  button(f,'story-next').onclick();button(f,'story-next').onclick();assert.equal(button(f,'story-count').textContent,'3 / 3');button(f,'story-next').onclick();assert.equal(f.api.state.presentation,null);assert.equal(f.api.state.chapter,2);assert.equal(f.api.state.guide,true);assert.equal(button(f,'hud').hidden,false);assert.equal(f.world.study.desktop.active,false);
});

test('desktop sections, project details and existing questions work without autoplay interrupting reading, then Exit returns walking',async t=>{
  const f=await studyController(t),original=f.api.visitorPosition();f.api.previewStory('experience');for(let frame=0;frame<90;frame++)f.api.advanceFrame(1/60);
  button(f,'desktop-browse').onclick();assert.equal(button(f,'desktop-menu').hidden,false);assert.equal(f.api.state.presentation.story.paused,true);
  const pick=id=>button(f,'desktop-menu').querySelectorAll('button').find(b=>b.dataset.desktopPage===id).onclick();pick('healthcare');assert.equal(f.world.study.desktop.page.id,'healthcare');assert.equal(button(f,'desktop-menu').hidden,true);assert.equal(f.api.state.presentation.story.paused,false);
  for(let frame=0;frame<4000;frame++)f.api.updatePresentation(1/60);assert.ok(f.api.state.presentation);assert.equal(f.api.state.presentation.story.index,0);assert.equal(button(f,'story-caption').textContent,STORY_PREVIEWS.healthcare);
  f.api.selectDesktopPage('question-0');assert.match(button(f,'story-caption').textContent,/customer communication/);f.api.selectDesktopPage('skills');assert.equal(button(f,'story-count').textContent,'3 / 3');
  button(f,'story-pause').onclick();f.api.selectDesktopPage('about');assert.equal(f.api.state.presentation.story.paused,true);button(f,'story-exit').onclick();assert.equal(f.api.state.presentation,null);assert.deepEqual(f.api.visitorPosition(),original);assert.equal(button(f,'hud').hidden,false);assert.equal(button(f,'desktop-browse').hidden,true);
  f.keydown('KeyW');for(let frame=0;frame<20;frame++)f.api.advanceFrame(1/60);assert.notDeepEqual(f.api.visitorPosition(),original);assert.equal(f.api.state.sitting,false);
});

test('the study desk opens its healthcare details, and reset or recovery releases the borrowed chair and monitor',async t=>{
  const f=await studyController(t);f.api.previewStory('healthcare');for(let frame=0;frame<90;frame++)f.api.advanceFrame(1/60);assert.equal(f.world.study.desktop.page.id,'healthcare');f.api.resetPosition();assert.equal(f.api.state.presentation,null);assert.equal(f.world.study.desktop.active,false);
  f.api.placeVisitor({x:-6,y:.13,z:-3.5});f.api.previewStory('experience');f.api.pauseAfterError();assert.equal(f.api.state.presentation,null);assert.equal(f.world.study.desktop.active,false);assert.ok(f.physics.toys.filter(toy=>toy.kind==='furniture').every(toy=>!toy.occupied));
});

test('mouse clicks and portrait-phone taps select the visible project buttons without capturing movement input',async t=>{
  const f=await studyController(t);f.api.previewStory('experience');for(let frame=0;frame<90;frame++)f.api.advanceFrame(1/60);
  const screen=f.world.study.desktop.screen,canvas=button(f,'world');let prevented=0;
  for(const [rotated,id] of [[false,'healthcare'],[true,'ai']]){
    f.api.selectDesktopPage('projects');globalThis.innerWidth=rotated?390:1000;globalThis.innerHeight=rotated?844:700;globalThis.matchMedia=query=>({matches:rotated&&query==='(pointer: coarse)'});
    const width=rotated?844:1000,height=rotated?390:700;f.camera.aspect=width/height;f.camera.updateProjectionMatrix();f.api.updatePresentation(0);f.camera.updateMatrixWorld(true);
    canvas.getBoundingClientRect=()=>({left:0,top:0,width:globalThis.innerWidth,height:globalThis.innerHeight});
    const target=f.world.study.desktop.hotspots.find(box=>box.id===id),ndc=screenPoint(screen,(target.x+target.w/2)/1536,1-(target.y+target.h/2)/864).project(f.camera);
    const dx=ndc.x*width/2,dy=-ndc.y*height/2,e={button:0,pointerType:rotated?'touch':'mouse',clientX:globalThis.innerWidth/2+(rotated?-dy:dx),clientY:globalThis.innerHeight/2+(rotated?dx:dy),preventDefault(){prevented++;}};
    for(const fn of canvas.events.pointerdown)fn(e);assert.equal(f.world.study.desktop.page.id,id);assert.equal(f.api.state.presentation.story.index,0);assert.equal(f.api.state.transition,null);
  }
  assert.equal(prevented,2);button(f,'story-exit').onclick();
});

test('late narration from an earlier desktop page cannot advance the selected section',async t=>{
  const f=await studyController(t),spoken=[];globalThis.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
  t.after(()=>delete globalThis.SpeechSynthesisUtterance);f.window.speechSynthesis={cancel(){},pause(){},resume(){},speak(utterance){spoken.push(utterance);}};f.api.state.sound=true;
  f.api.previewStory('experience');for(let frame=0;frame<90;frame++)f.api.advanceFrame(1/60);const old=spoken[0];f.api.selectDesktopPage('healthcare');f.api.selectDesktopPage('experience');const index=f.api.state.presentation.story.index;
  old.onend();f.api.updatePresentation(.01);assert.equal(f.api.state.presentation.story.index,index);assert.equal(f.world.study.desktop.page.id,'experience');button(f,'story-exit').onclick();spoken.at(-1).onend();assert.equal(f.api.state.presentation,null);
});
