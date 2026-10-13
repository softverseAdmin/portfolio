import * as THREE from './vendor/three.module.js';
import {loadImportedVehicle,createImportedVehicle} from './imported-vehicle.js';
import {createWorld,createCharacter,animateCharacter} from './world.js';
import {CHAPTERS,CROUCH_HEIGHT,HOST_RADIUS,VISITOR_RADIUS,clamp,angleLerp,moveWithCollisions,floorAt,roomAt,horizontalDistance,memoryDeck,isBlocked,chooseInteraction,basketballLaunch,scoredBasket,stepVehicle,passedCheckpoint,overlapsBlocker,supportHeight,ceilingHeight} from './core.js';
import {createSandboxPhysics} from './physics.js';
import {loadCharacterAsset,createRiggedCharacter,greetingLayout,animateHandshake,animateFallbackHandshake,handPosition} from './characters.js';
import {loadMotion,actionDuration,endGreeting,warmMotionLibrary} from './motions.js';
import {loadEnvironmentAsset,applyEnvironmentAsset,setAssetQuality} from './model-assets.js';
import {RoomEnvironment} from './vendor/addons/environments/RoomEnvironment.js';
import {prepareVisitAssets,createAssetProgress,loadVisitAssets} from './loading.js';
import {resolveCamera,resolveVisitorCamera,characterCameraTarget} from './camera.js';
import {chairPose,chairExit,chairContact,driverPose} from './poses.js';
import {actionPosition,carCameraBlend} from './transitions.js';
import {ROAD_START,HOUSE_PARKING,ROAD_SAMPLES,journeyDirections} from './journey.js';
import {setPianoKeyPressed} from './furnishings.js';
import {deviceProfile,landscapeSize,landscapeDelta,applyRenderSize,requestLandscape} from './mobile.js';
import {prepareGraphics} from './texture-budget.js';
import {paintTouchControls} from './controls.js';
import {createArrival,arrivalSpawn,VISIT_OBJECTIVES,actorBlocker,greetingApproach,walkArrivalRoute,carExitSpot} from './arrival.js';
import {PORTFOLIO as copy,STORY_PREVIEWS,CONVERSATIONS,TECH_TOPICS,INVITATION,portfolioSummary} from './portfolio.js';
import {readVisit,writeVisit,freshVisit,createInvitation,tourRouteFrom,guideShouldWait,surfaceAt} from './story.js';
import {INTRO_SLIDES,createPresentationStory,createStoryStage,createStudyStage,presentationCamera,studyCamera,subtitleCues,subtitleAt} from './presentation.js';
import {STUDY_SLIDES,desktopPage} from './desktop.js';
import {rollVehicleWheels,alignVehicleWheels} from './vehicle-motion.js';

const $=id=>document.getElementById(id);
const actorHeight=actor=>actor?.userData.rig?.asset.height??actor?.userData.rig?.model?.userData.appearance?.height??1.76;
const canvas=$('world');
const state={phase:'welcome',loading:true,houseLoading:false,skipDriveRequested:false,sound:false,night:false,quality:'balanced',guide:false,chapter:-1,guideRoute:[],guideWaiting:false,dialogueAction:null,visited:new Set(),jumpVelocity:0,grounded:true,sitting:false,driving:false,carSpeed:0,waveUntil:0,near:null,modal:false,touchRun:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
Object.assign(state,{held:null,transition:null,presentation:null,punch:null,combo:0,lastPunch:-10,crouching:false,aiming:false,charging:false,chargeStart:0,lookUntil:0,vehicle:{x:18,z:18,heading:0,vx:0,vz:0},moveVX:0,moveVZ:0,carSide:1,baskets:0,throws:0,bagHits:0,knockedPins:new Set(),race:null,actions:new Set(),shake:0});
let savedVisit;try{savedVisit=readVisit(localStorage);}catch{savedVisit=readVisit(null);}
Object.assign(state,{sound:savedVisit.settings.sound,volume:savedVisit.settings.volume,night:savedVisit.settings.night,quality:savedVisit.settings.quality,reducedMotion:savedVisit.settings.reducedMotion??state.reducedMotion,reducedMotionChoice:savedVisit.settings.reducedMotion,visited:new Set(savedVisit.visited),actions:new Set(savedVisit.actions),completed:savedVisit.completed,guideCheckpoint:savedVisit.checkpoint,guidePausedByDistance:false,hostReturnRoute:[],invitation:null});
const keys=new Set();
let renderer,scene,camera,world,player,host,sun,ambient,physics,trajectory,previousTime=performance.now(),elapsed=0,yaw=0,pitch=0,cameraDistance=5.3,toastTimer,cinematicTime=0,drag=null,audioContext=null,memoryToken=0;
let frameRequest=null,stopped=false,resizeTimer,movementYaw=null;
let playerPos={x:0,y:.02,z:18.8},joystick={x:0,y:0},joystickPointer=null;
const lookTarget=new THREE.Vector3(),cameraTarget=new THREE.Vector3(),cameraDesired=new THREE.Vector3();
let lastRoom='',mapTick=0,mouseCaptured=false,intentionalMouseRelease=false,arrivalLayout;
let gestureToken=0,actionPointer=null,runPointer=null;
let visit,greetingRoute=[],greetingBlocked=0,lastVisitStage='';
let modalReturnFocus=null,footstepTravel=0,guideBlockedTime=0,invitationRingAt=-10;

function toast(text,duration=3300){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,duration);}
function clearInput(){
  keys.clear();joystickPointer=null;joystick={x:0,y:0};$('joystick-knob').style.transform='translate(0,0)';drag=null;actionPointer=null;runPointer=null;
  state.touchRun=state.touchBrake=state.charging=state.aiming=state.running=false;state.moveVX=state.moveVZ=0;
  movementYaw=null;
}
function saveProgress(){
  const value={version:1,visited:[...state.visited],actions:[...state.actions],welcomed:visit?.progress.stage==='welcomed'||(state.phase==='welcome'&&savedVisit.welcomed),completed:state.completed,checkpoint:state.guideCheckpoint,settings:{sound:state.sound,volume:state.volume,night:state.night,quality:state.quality,reducedMotion:state.reducedMotionChoice}};
  savedVisit=value;try{return writeVisit(localStorage,value);}catch{return false;}
}
function updateProgress(){ $('chapter-count').textContent=`${state.visited.size} / ${CHAPTERS.length}`;$('action-count').textContent=String(state.actions.size); }
function discover(id){const chapter=['softlearn','healthcare','ai'].includes(id)?'projects':id;if(!CHAPTERS.some(c=>c.id===chapter))return;if(!state.visited.has(chapter)){state.visited.add(chapter);saveProgress();updateProgress();if(state.visited.size===CHAPTERS.length)toast('All the stories discovered. Thanks for getting to know me!',5000);}}

function openModal(title,eyebrow,body){
  if(state.presentation)finishPresentation();
  if(!state.modal)modalReturnFocus=document.activeElement;
  releaseMouse();state.charging=false;state.aiming=false;
  state.moveVX=state.moveVZ=0;
  $('reticle').hidden=true;if(trajectory)trajectory.visible=false;
  memoryToken++;gestureToken++;state.modal=true;clearInput();
  $('modal-title').textContent=title;$('modal-eyebrow').textContent=eyebrow;$('modal-content').innerHTML=body;$('modal').hidden=false;$('modal-close').focus();
}
function closeModal(){memoryToken++;gestureToken++;state.modal=false;clearInput();$('modal').hidden=true;const target=state.phase!=='welcome'?canvas:modalReturnFocus?.isConnected&&!modalReturnFocus.closest('[hidden]')?modalReturnFocus:canvas;target.focus();}
function visitReady(){return !!(renderer&&world&&physics&&player&&host)&&!(savedVisit.welcomed&&state.houseLoading);}
function updateReadyControls(){
  const ready=visitReady();$('enter').disabled=!ready;
  $('welcome-basic-house').hidden=!state.houseLoading;
  if(state.houseLoading&&savedVisit.welcomed)$('enter-label').textContent='Finishing house detail…';
  else if(ready)$('enter-label').textContent=savedVisit.welcomed?'Continue your visit':'Begin your visit';
  const entry=$('quick-enter');if(entry){entry.disabled=!ready;entry.textContent=ready?(state.phase==='welcome'?'Explore the house →':'Return to your visit →'):state.loading||state.houseLoading?'House loading…':'3D view unavailable';}
  for(const id of ['repair-setting','reset-setting','camera-setting'])if($(id))$(id).disabled=!ready;
}
function contentModal(id){
  const c=copy[id];if(!c)return;discover(id);
  const inVisit=visit?.progress.stage==='welcomed'&&state.phase==='playing';
  const ending=id==='contact'&&inVisit;
  const buttons=ending?`<div class="modal-links">${state.completed?'':'<button id="finish-visit" class="gold-button">Finish the visit →</button>'}<button id="keep-exploring">Keep exploring</button><button id="tour-again">Tour from the living room</button><button id="replay-visit">Replay from the invitation</button></div>`:'';
  openModal(c.title,state.completed&&ending?'09 / VISIT COMPLETE':c.eyebrow,c.body+buttons+'<button id="portfolio-back" class="text-button portfolio-back">← Back to portfolio</button>');
  $('portfolio-back').onclick=portfolioModal;
  document.querySelectorAll('.project-read').forEach(btn=>btn.onclick=()=>contentModal(btn.dataset.id));
  $('finish-visit')?.addEventListener('click',finishVisit);$('keep-exploring')?.addEventListener('click',closeModal);
  $('tour-again')?.addEventListener('click',()=>{closeModal();startTour({restart:true});});
  $('replay-visit')?.addEventListener('click',replayVisit);
}

function finishVisit(){
  if(visit?.progress.stage!=='welcomed')return;
  hideDialogue();state.guide=false;state.guideRoute=[];state.guideWaiting=false;state.guidePausedByDistance=false;state.completed=true;state.guideCheckpoint=CHAPTERS.length;discover('contact');saveProgress();updateGuideUI();updateVisitUI(true);contentModal('contact');
}

function replayVisit(){
  if(!world||!player)return;
  releaseMouse();hideDialogue();closeModal();repairScene();endGreeting(player);endGreeting(host);
  savedVisit=freshVisit(savedVisit);state.visited.clear();state.actions.clear();state.completed=false;state.guideCheckpoint=0;state.guide=false;state.guideRoute=[];state.guideWaiting=false;state.guidePausedByDistance=false;state.chapter=-1;state.invitation=null;state.near=null;state.grounded=true;state.jumpVelocity=0;state.crouching=false;state.race=null;world.raceGate.visible=false;footstepTravel=0;guideBlockedTime=0;
  for(const door of world.doors){door.open=false;door.group.rotation.y=0;door.group.userData.open=false;door.blocker.active=true;}
  physics.syncColliders();visit=createArrival(world,host);lastVisitStage='';state.hostReturnRoute=[];host.userData.nameSprite.visible=false;document.body.classList.remove('cinematic');$('skip-greeting').hidden=true;$('game-badge').hidden=true;state.phase='welcome';saveProgress();beginVisit();
}

function portfolioModal(){
  openModal('Rabin Adhikari','THE PORTFOLIO · A QUICK READ',portfolioSummary());
  document.querySelectorAll('.project-read').forEach(btn=>btn.onclick=()=>contentModal(btn.dataset.id));
  updateReadyControls();
  $('quick-enter').onclick=()=>{if(!visitReady()){toast(state.loading||state.houseLoading?'The house is still loading. You can browse the portfolio now.':'The 3D view needs WebGL 2. Your portfolio is still available.');return;}if(state.phase==='welcome')beginVisit();else closeModal();};
}

function controlsModal(){
  openModal('Make yourself at home.','CONTROLS & SETTINGS',`<div class="content-grid"><div class="content-block"><h3>On a computer</h3><p>Click the scene: capture mouse-look<br>WASD / arrows: move · Shift: run<br>Space: jump · C: crouch<br>E: use / pick up · F: enter / exit car<br>Click / J: punch, kick, or throw<br>Right mouse: aim · Q: drop<br>G: wave · Enter: next dialogue<br>M: map · Escape: pause<br>Scroll: camera distance</p></div><div class="content-block"><h3>Driving & touch</h3><p>W/S: accelerate / reverse<br>A/D: steer · Space: handbrake<br>H: horn · R: start a timed lap<br>On touch: joystick to move; drag the scene to look. Hold ACT to charge a throw; tap AIM to aim. E to use; DROP to put an object down.</p></div></div><div class="setting-row"><span>Lighting</span><button id="lighting-setting">${state.night?'Evening':'Daylight'} →</button></div><div class="setting-row"><span>Graphics</span><button id="quality-setting">${state.quality==='balanced'?'Balanced':'Low power'} →</button></div><div class="setting-row"><span>Camera</span><button id="camera-setting">Reset view</button></div><div class="setting-row"><span>Broken or displaced objects</span><button id="repair-setting">Repair & reset scene</button></div><div class="setting-row"><span>Lost your way?</span><button id="reset-setting">Return to the entrance</button></div><p class="small-note">Explore freely. Glass and small objects react to impacts; repair the scene here at any time. Narration uses your browser’s voice.</p>`);
  $('lighting-setting').onclick=()=>{state.night=!state.night;updateLighting();saveProgress();$('lighting-setting').textContent=state.night?'Evening →':'Daylight →';};
  $('quality-setting').onclick=()=>{state.quality=state.quality==='balanced'?'low':'balanced';setQuality();saveProgress();$('quality-setting').textContent=state.quality==='balanced'?'Balanced →':'Low power →';};
  $('camera-setting').onclick=()=>{yaw=player.rotation.y-Math.PI;pitch=0;cameraDistance=5.3;toast('Camera reset behind the visitor.');};
  $('repair-setting').onclick=()=>{repairScene();closeModal();};
  $('reset-setting').onclick=()=>{if(!renderer)return;closeModal();if(state.phase==='welcome')beginVisit();else resetPosition();};
  const settings=document.createElement('div');settings.className='story-settings';
  settings.innerHTML=`<div class="setting-row volume-setting"><label for="volume-setting">Volume <output id="volume-value" for="volume-setting">${Math.round(state.volume*100)}%</output></label><input id="volume-setting" type="range" min="0" max="100" step="1" value="${Math.round(state.volume*100)}"></div><div class="setting-row"><span>Reduce camera motion</span><button id="motion-setting" aria-pressed="${state.reducedMotion}">${state.reducedMotion?'On':'Off'} →</button></div>${state.phase!=='welcome'?'<div class="setting-row"><span>Start the story again</span><button id="replay-setting">Replay from the invitation</button></div>':''}<p class="small-note">${saveProgress()?'Your story progress and settings are saved in this browser.':'Progress stays available during this visit; browser storage is unavailable.'} Replay starts a fresh story and keeps your settings. Garden activities are optional.</p>`;
  $('modal-content').append(settings);
  if(world?.vehicle.controls){const parts=document.createElement('button');parts.className='text-button';parts.textContent='Car doors, seats & lights →';parts.onclick=vehiclePartsModal;$('modal-content').append(parts);}
  $('volume-setting').oninput=e=>{state.volume=Number(e.target.value)/100;state.sound=state.volume>0;$('volume-value').textContent=e.target.value+'%';updateSoundUI();saveProgress();if(!state.sound&&'speechSynthesis' in window)window.speechSynthesis.cancel();};
  $('volume-setting').onchange=()=>tone(440,.1);
  $('motion-setting').onclick=()=>{state.reducedMotion=!state.reducedMotion;state.reducedMotionChoice=state.reducedMotion;state.shake=0;document.body.classList.toggle('reduced-motion',state.reducedMotion);$('motion-setting').textContent=(state.reducedMotion?'On':'Off')+' →';$('motion-setting').setAttribute('aria-pressed',String(state.reducedMotion));saveProgress();};
  $('replay-setting')?.addEventListener('click',replayVisit);
  const gestureButton=document.createElement('button');gestureButton.textContent='Try character gestures';gestureButton.className='gold-button';
  gestureButton.onclick=gesturesModal;$('modal-content').append(gestureButton);
  const menu=document.createElement('div');menu.className='modal-links';
  menu.innerHTML='<button id="menu-portfolio">Read the portfolio</button><button id="menu-tour">'+(state.guide?'Pause the tour':'Follow Rabin’s tour')+'</button><button id="menu-fullscreen">Fullscreen</button><a href="/">Back to the blog →</a>';
  $('modal-content').append(menu);$('menu-portfolio').onclick=portfolioModal;
  $('menu-tour').disabled=visit?.progress.stage!=='welcomed';$('menu-tour').onclick=()=>{closeModal();if(state.guide)pauseTour(true);else startTour();};
  $('menu-fullscreen').onclick=()=>{void requestLandscape();};
  if(deviceProfile().mobile){const note=document.createElement('p');note.className='small-note';note.textContent='Phone graphics use less memory. Your original models and texture files are preserved. Turn your phone sideways for the most comfortable controls.';$('modal-content').append(note);}
  updateReadyControls();
}

function vehiclePartsModal(){
  const vehicle=world?.vehicle,controls=vehicle?.controls;if(!controls)return;
  const doorLabels={'Door_Right_Front':'Driver’s door','Door_Left_Front':'Front passenger door','Door_Right_Rear':'Right rear door','Door_Left_Rear':'Left rear door'};
  const doors=vehicle.carDoors.map(d=>'<button class="vehicle-part" data-part="'+d.group.name+'">'+(d.open?'Close ':'Open ')+doorLabels[d.group.name]+'</button>').join('');
  const panelOpen=name=>!!controls.targets.get(name)?.angle;
  const seats=vehicle.seats.map(s=>'<button class="vehicle-seat" data-seat="'+s.name+'">'+(panelOpen(s.back.name)?'Upright ':'Recline ')+s.name.replaceAll('_',' ')+' seat</button>').join('');
  openModal('Your Land Cruiser','CAR CONTROLS','<p>Use F at the right front door to drive. Open doors, lift the bonnet or tailgate, recline seats and switch the lights below.</p><div class="modal-links">'+doors+'<button id="vehicle-hood">'+(panelOpen('Hood')?'Close bonnet':'Open bonnet')+'</button><button id="vehicle-tailgate">'+(panelOpen('Tailgate')?'Close tailgate':'Open tailgate')+'</button><button id="vehicle-lights">Headlights '+(controls.headlights?'off':'on')+'</button><button id="vehicle-hazards">Hazards '+(controls.turnSignal==='hazard'?'off':'on')+'</button>'+seats+'</div>');
  const finish=notice=>{closeModal();toast(notice,2400);};
  document.querySelectorAll('.vehicle-part').forEach(button=>button.onclick=()=>{
    const d=vehicle.carDoors.find(d=>d.group.name===button.dataset.part),open=!d.open;
    if(!physics.canMoveDoor(d,open?d.angle:0,[playerPos,host.position])){toast('Step clear of the door before opening or closing it.');return;}
    controls.setDoor(d.group.name,open);finish((open?'Opening ':'Closing ')+doorLabels[d.group.name].toLowerCase()+'.');
  });
  $('vehicle-hood').onclick=()=>{const open=!panelOpen('Hood');controls.setHood(open);finish(open?'Opening the bonnet.':'Closing the bonnet.');};
  $('vehicle-tailgate').onclick=()=>{const open=!panelOpen('Tailgate');controls.setTailgate(open);finish(open?'Opening the tailgate.':'Closing the tailgate.');};
  $('vehicle-lights').onclick=()=>{state.carHeadlights=!controls.headlights;updateVehicleLights();finish(state.carHeadlights?'Headlights on.':'Headlights off.');};
  $('vehicle-hazards').onclick=()=>{controls.setTurnSignal(controls.turnSignal==='hazard'?'off':'hazard');finish(controls.turnSignal==='hazard'?'Hazards on.':'Hazards off.');};
  document.querySelectorAll('.vehicle-seat').forEach(button=>button.onclick=()=>{const seat=vehicle.seats.find(s=>s.name===button.dataset.seat),recline=!panelOpen(seat.back.name);controls.setSeatRecline(seat.name,recline?.22:0);finish(recline?'Seat back reclining.':'Seat back upright.');});
}

function gesturesModal(){
  const library=player?.userData.rig?.asset.motions;
  if(state.phase!=='playing'){toast('Enter the house first, then try the gestures.');return;}
  if(visit.progress.stage!=='welcomed'){toast('Meet Rabin at the entrance first, then try the gestures.');return;}
  if(!library){toast('Animations are still unavailable. Refresh to try loading them again.');return;}
  if(state.driving||state.sitting||state.transition){toast('Stand up or park and get out before trying a gesture.');return;}
  if(!state.grounded){toast('Land before trying a gesture.');return;}
  stopGesture({notice:null});
  openModal('Try a gesture','YOUR CHARACTERS','<p>Choose a character and one of the supplied motions. Your tour pauses during the preview and continues afterward.</p><div class="gesture-fields"><label>Character<select id="gesture-actor"><option value="visitor">Visitor</option><option value="host">Rabin · your host</option></select></label><label>Gesture<select id="gesture-clip"></select></label></div><button id="gesture-play" class="gold-button">Play gesture →</button><p id="gesture-status" class="small-note" role="status">Use Stop preview, E or Escape to finish a preview.</p>');
  const actorSelect=$('gesture-actor'),clipSelect=$('gesture-clip');
  const actorLibrary=()=>((actorSelect.value==='host'?host:player)?.userData.rig?.asset.motions)??library;
  function refreshMotions(){
    const selected=clipSelect.value,catalog=actorLibrary().catalog,clips=catalog.clips,categories=[...new Set(clips.map(c=>c.category))];
    clipSelect.innerHTML=categories.map(category=>'<optgroup label="'+category+'">'+clips.filter(c=>c.category===category).map(c=>'<option value="'+c.id+'">'+c.label+(c.sourceRole&&c.sourceRole!==catalog.role?' · adapted':'')+'</option>').join('')+'</optgroup>').join('');
    clipSelect.value=clips.some(c=>c.id===selected)?selected:clips[0]?.id;
  }
  actorSelect.onchange=refreshMotions;refreshMotions();
  const token=gestureToken;
  $('gesture-play').onclick=async()=>{
    const library=actorLibrary(),id=clipSelect.value,actor=actorSelect.value,entry=library.catalog.clips.find(c=>c.id===id),button=$('gesture-play'),status=$('gesture-status');
    if(!entry||button.disabled)return;
    button.disabled=clipSelect.disabled=actorSelect.disabled=true;status.textContent='Preparing '+entry.label.toLowerCase()+'…';
    try{
      await loadMotion(library,id);
      if(token!==gestureToken||!button.isConnected||!state.modal)return;
      const conversation=state.dialogueData;
      closeModal();hideDialogue();if(state.held)dropObject();
      state.crouching=false;state.punch=null;state.waveUntil=0;
      state.gesture={id,actor,time:0,duration:Math.min(entry.duration,8),loop:entry.loop,label:entry.label,conversation};
      updateVisitUI(true);updateActivityHUD();updateInteraction();
    }catch(error){
      if(token===gestureToken&&button.isConnected)status.textContent='This gesture could not load. Choose another one or try again.';
    }finally{if(token===gestureToken&&button.isConnected)button.disabled=clipSelect.disabled=actorSelect.disabled=false;}
  };
}
function stopGesture({resume=true,notice='Back to exploring.'}={}){
  const gesture=state.gesture;if(!gesture)return;
  state.gesture=null;endGreeting(gesture.actor==='host'?host:player);clearInput();
  if(resume&&gesture.conversation&&state.phase==='playing')dialogue(...gesture.conversation);
  updateVisitUI(true);updateActivityHUD();updateInteraction();if(notice)toast(notice);
}
function pauseTour(notice=false){
  stopGesture({resume:false,notice:null});state.guide=false;state.guideRoute=[];state.guideWaiting=false;state.guidePausedByDistance=false;clearInput();hideDialogue();updateGuideUI();updateVisitUI(true);
  if(notice)toast('Tour paused. Your progress is saved; continue whenever you’re ready.');
}

function mapModal(){
  openModal('There’s a story in every room.','THE HOUSE MAP',`<p>You’re in ${roomAt(playerPos.x,playerPos.z,playerPos.y).name.toLowerCase()}. The front door faces south; the terrace is at the back.</p><div class="map-layout"><div class="map-room">The study<span>Experience & career</span></div><div class="map-hall">ENTRANCE HALL</div><div class="map-room">The project studio<span>Selected work · bedroom upstairs</span></div><div class="map-room">The living room<span>Your host’s story · piano · fireplace</span></div><div class="map-room">The technology room<span>Skills · arcade · stairs</span></div></div><p>Outside: basketball to the west; a driveable car, training bag, loose crates, and bowling to the east. Start a timed lap with R in the car. The contact desk is on the rear terrace.</p><div class="modal-links"><button id="map-guide">Follow Rabin’s tour →</button><button id="map-reset">Return to the entrance</button></div>`);
  $('map-guide').onclick=()=>{closeModal();if(state.phase==='welcome')beginVisit();else startTour();};
  $('map-reset').onclick=()=>{closeModal();if(renderer)resetPosition();};
}

function speak(text,onEnd=null,onError=null){if(!state.sound||state.volume===0||!('speechSynthesis' in window))return null;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.96;utterance.volume=state.volume;utterance.onend=onEnd;utterance.onerror=onError;window.speechSynthesis.speak(utterance);return utterance;}
function tone(frequency,duration=.4,volume=.06){
  if(!state.sound||state.volume===0)return;
  try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(Math.max(.0001,volume*state.volume),audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch{}
}

function dialogue(text,label='RABIN · YOUR HOST',action=null,nextLabel='Next room →',choices=[],detailId=null){
  state.dialogueData=[text,label,action,nextLabel,choices,detailId];
  document.body.classList.add('dialogue-open');
  $('dialogue-label').textContent=label;$('dialogue-text').textContent=text;$('dialogue-next').textContent=nextLabel;$('dialogue-next').hidden=!action;state.dialogueAction=action;$('dialogue').hidden=false;speak(text);
  $('dialogue-read').hidden=!detailId;$('dialogue-read').onclick=detailId?()=>contentModal(detailId):null;
  $('dialogue-choices').replaceChildren();
  for(const choice of choices){const button=document.createElement('button');button.className='question-button';button.textContent=choice.question;button.onclick=()=>{if(choice.action){choice.action();return;}dialogue(choice.answer,'RABIN · '+choice.question.toUpperCase(),action,nextLabel,choices,choice.content??null);$('dialogue-choices').children[choices.indexOf(choice)]?.focus();};$('dialogue-choices').append(button);}
}
function hideDialogue(){ if(state.presentation)finishPresentation();$('dialogue').hidden=true;document.body.classList.remove('dialogue-open');state.dialogueAction=null;state.dialogueData=null;if('speechSynthesis' in window)window.speechSynthesis.cancel(); }

function narratePresentation(session){
  if(session.story.phase!=='presenting'||session.story.paused||session.narrationStarted)return;
  session.narrationStarted=true;const token=session.narrationToken;
  session.story.setNarrating(state.sound&&state.volume>0&&'speechSynthesis' in window);
  try{session.utterance=speak(session.caption,()=>{if(state.presentation===session&&session.narrationToken===token)session.story.finishNarration();},()=>{if(state.presentation===session&&session.narrationToken===token)session.story.setNarrating(false);});}
  catch{session.utterance=null;}
  if(session.utterance)session.utterance.onboundary=event=>{if(state.presentation===session&&session.narrationToken===token&&!session.story.paused&&Number.isFinite(event.charIndex)){session.speechChar=event.charIndex;session.speechAt=session.story.time;}};
  if(!session.utterance)session.story.setNarrating(false);
}
function setPresentationCaption(session,text){
  session.caption=text;session.cues=subtitleCues(text);session.captionStarted=session.story.time;session.speechChar=null;
  $('story-caption').textContent=subtitleAt(session.cues);
}
function showPresentationSlide(session,slide,index){
  if('speechSynthesis' in window)window.speechSynthesis.cancel();session.narrationStarted=false;session.utterance=null;session.narrationToken++;setPresentationCaption(session,slide.caption);
  session.display.showSlide(slide);$('story-title').textContent=slide.title;$('story-details').textContent=slide.subtitle+' '+slide.caption;
  $('story-count').textContent=`${index+1} / ${session.story.count}`;$('story-count').setAttribute('aria-label',`Slide ${index+1} of ${session.story.count}`);$('story-next').disabled=false;$('desktop-browse').disabled=false;
  if(session.initialPage){const page=session.initialPage;session.initialPage=null;selectDesktopPage(page);return;}
  narratePresentation(session);
}
function startPresentation(onComplete=null,id='about',initialPage=null){
  if(state.presentation)return true;
  const study=id==='experience',display=study?world?.study?.desktop:world?.projector,slides=study?STUDY_SLIDES:INTRO_SLIDES;
  if(!display||state.phase!=='playing'||state.driving||state.transition)return false;
  stopGesture({resume:false,notice:null});hideDialogue();if(state.held)dropObject();
  const previous={position:{...playerPos},sitting:state.sitting,seatTarget:state.seatTarget,seatToy:state.seatToy,crouching:state.crouching,grounded:state.grounded,jumpVelocity:state.jumpVelocity,brand:$('brand-room').textContent,hud:$('hud').hidden,display:display.root.visible,hostName:host.userData.nameSprite.visible,canvasLabel:canvas.getAttribute('aria-label'),cameraPosition:camera.position.clone(),cameraQuaternion:camera.quaternion.clone(),fov:camera.fov,lookTarget:lookTarget.clone(),roof:world.roof.map(mesh=>[mesh,mesh.visible])};
  const stage=(study?createStudyStage:createStoryStage)({world,physics,host,player});
  if(!stage){toast('Clear the space around the chairs, or use Repair & reset before the seated story.');return false;}
  clearInput();releaseMouse();discover(id);
  const session={stage,previous,onComplete,display,study,initialPage,narrationStarted:false,narrationToken:0,caption:slides[0].caption,utterance:null};
  session.story=createPresentationStory({slides,seatingDuration:state.reducedMotion?0:1.2,onSlide:(slide,index)=>showPresentationSlide(session,slide,index),onEnd:reason=>{if(state.presentation!==session)return;if(reason==='completed')finishPresentation(true);else{finishPresentation();pauseTour();}}});
  state.presentation=session;state.sitting=true;state.seatTarget=null;state.seatToy=null;state.crouching=false;state.grounded=true;state.jumpVelocity=0;state.near=null;
  $('hud').hidden=true;$('dialogue').hidden=true;$('presentation').hidden=false;$('story-next').disabled=true;$('story-title').textContent=slides[0].title;$('story-details').textContent=slides[0].subtitle;$('story-caption').textContent='Make yourself comfortable.';$('story-count').textContent=`1 / ${slides.length}`;$('story-count').setAttribute('aria-label',`Slide 1 of ${slides.length}`);
  $('brand-room').textContent=study?'Study · Project showcase':'Living room · Story mode';host.userData.nameSprite.visible=false;display.root.visible=true;display.showSlide(slides[0]);
  $('desktop-browse').hidden=!study;$('desktop-browse').disabled=true;$('desktop-browse').setAttribute('aria-expanded','false');$('desktop-menu').hidden=true;
  canvas.setAttribute('aria-label',study?'A seated study presentation. Use Browse desktop to select a project or section.':'A seated living-room presentation.');
  document.body.classList.add('story-mode');document.body.classList.toggle('study-mode',study);updatePresentationPause(session);updatePresentation(0);$('story-pause').focus();return true;
}
function closeDesktopMenu({resume=true}={}){
  const session=state.presentation;if(!session?.study)return false;
  const returnFocus=document.activeElement?.closest('#desktop-menu');
  const shouldResume=!$('desktop-menu').hidden&&session.menuResume;$('desktop-menu').hidden=true;$('desktop-browse').setAttribute('aria-expanded','false');session.menuResume=false;
  if(returnFocus)$('desktop-browse').focus();
  if(resume&&shouldResume&&session.story.paused)togglePresentationPause();return shouldResume;
}
function toggleDesktopMenu(){
  const session=state.presentation;if(!session?.study||session.story.phase!=='presenting')return;
  if(!$('desktop-menu').hidden){closeDesktopMenu();$('desktop-browse').focus();return;}
  session.menuResume=!session.story.paused;if(session.menuResume)togglePresentationPause();$('desktop-menu').hidden=false;$('desktop-browse').setAttribute('aria-expanded','true');$('desktop-menu').querySelectorAll('button')[0]?.focus();
}
function selectDesktopPage(id){
  const session=state.presentation,page=desktopPage(id);if(!session?.study||session.story.phase!=='presenting'||!page)return false;
  const resume=closeDesktopMenu({resume:false}),index=STUDY_SLIDES.findIndex(slide=>slide.page===id);
  if(index>=0)session.story.goTo(index);
  else{
    if('speechSynthesis' in window)window.speechSynthesis.cancel();session.story.holdReading();session.story.setNarrating(false);session.display.showPage(id);setPresentationCaption(session,page.caption);session.narrationStarted=false;session.utterance=null;session.narrationToken++;
    $('story-title').textContent=page.title;$('story-details').textContent=page.blocks.map(block=>block.text).join(' ');if(copy[id])discover(id);narratePresentation(session);
  }
  if(resume&&session.story.paused)togglePresentationPause();updatePresentation(0);return true;
}
function nextPresentationSlide(){closeDesktopMenu();state.presentation?.story.next();}
function desktopPointer(e){
  const session=state.presentation;if(!session?.study||session.story.phase!=='presenting'||e.button!==undefined&&e.button!==0)return;
  const size=landscapeSize(innerWidth,innerHeight,deviceProfile().mobile),rect=canvas.getBoundingClientRect();
  const delta=landscapeDelta(e.clientX-rect.left-rect.width/2,e.clientY-rect.top-rect.height/2,size.rotated),pointer=new THREE.Vector2(2*delta.x/size.width,-2*delta.y/size.height),ray=new THREE.Raycaster();
  camera.updateMatrixWorld(true);session.display.root.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(session.display.screen,false)[0],id=hit?.uv?session.display.hit(hit.uv):null;
  if(id){e.preventDefault();selectDesktopPage(id);}else closeDesktopMenu();
}
function updatePresentationPause(session){
  const paused=session.story.paused;$('story-pause').setAttribute('aria-pressed',String(paused));$('story-pause').setAttribute('aria-label',paused?'Resume the story':'Pause the story');$('story-pause-label').textContent=paused?'Resume':'Pause';$('story-pause-icon').textContent=paused?'▶':'Ⅱ';
}
function togglePresentationPause(){
  const session=state.presentation;if(!session)return;const paused=session.story.togglePause();clearInput();updatePresentationPause(session);
  if('speechSynthesis' in window){if(paused)window.speechSynthesis.pause();else window.speechSynthesis.resume();}if(!paused)narratePresentation(session);
}
function finishPresentation(advance=false){
  const session=state.presentation;if(!session)return;state.presentation=null;
  if('speechSynthesis' in window){window.speechSynthesis.cancel();window.speechSynthesis.resume();}
  session.stage.restore();const saved=session.previous;playerPos={...saved.position};state.sitting=saved.sitting;state.seatTarget=saved.seatTarget;state.seatToy=saved.seatToy;state.crouching=saved.crouching;state.grounded=saved.grounded;state.jumpVelocity=saved.jumpVelocity;
  host.userData.nameSprite.visible=saved.hostName;session.display.root.visible=saved.display;canvas.setAttribute('aria-label',saved.canvasLabel);for(const [mesh,visible] of saved.roof)mesh.visible=visible;
  camera.position.copy(saved.cameraPosition);camera.quaternion.copy(saved.cameraQuaternion);camera.fov=saved.fov;camera.updateProjectionMatrix();lookTarget.copy(saved.lookTarget);endGreeting(host);endGreeting(player);clearInput();
  $('presentation').hidden=true;$('hud').hidden=saved.hud;$('brand-room').textContent=saved.brand;document.body.classList.remove('story-mode','study-mode');$('desktop-browse').hidden=true;$('desktop-menu').hidden=true;$('desktop-browse').setAttribute('aria-expanded','false');if(!stopped)canvas.focus();updateVisitUI(true);
  if(advance)session.onComplete?.();
}
function updatePresentation(dt){
  const session=state.presentation;if(!session)return;session.story.tick(dt);if(state.presentation!==session)return;
  const p=session.story.seatingProgress,hostPose=session.stage.pose(0,p),visitorPose=session.stage.pose(1,p);hostPose.talking=session.story.phase==='presenting';
  playerPos={x:player.position.x,y:player.position.y,z:player.position.z};
  animateCharacter(host,session.story.time,0,false,true,hostPose);animateCharacter(player,session.story.time,0,false,true,visitorPose);
  if(session.story.phase==='presenting')$('story-caption').textContent=subtitleAt(session.cues,session.story.time-session.captionStarted,session.story.time-session.speechAt<2.5?session.speechChar:null);
  const view=session.study?studyCamera(camera.aspect,world.cameraBlockers??world.blockers,session.display.page.detail):presentationCamera(camera.aspect,world.cameraBlockers??world.blockers);camera.position.copy(view.position);camera.fov=view.fov;camera.updateProjectionMatrix();lookTarget.copy(view.target);camera.lookAt(lookTarget);world.roof.forEach(mesh=>mesh.visible=false);
}
function chapterChoices(chapter){return [...(CONVERSATIONS[chapter.id]??[]),...(chapter.id==='fun'?[{question:'Take a garden break',action:()=>{pauseTour();toast('Enjoy the garden. Continue the guided story from YOUR VISIT when you’re ready.',5500);}}]:[])];}
function showChapter(chapter){
  discover(chapter.id);state.guideCheckpoint=Math.max(state.guideCheckpoint,state.chapter+1);saveProgress();
  if(['about','experience'].includes(chapter.id)&&startPresentation(nextChapter,chapter.id)){updateVisitUI(true);return;}
  dialogue(chapter.text,`RABIN · ${chapter.title.toUpperCase()}`,chapter.id==='contact'?finishVisit:nextChapter,chapter.id==='contact'?'Finish the visit →':chapter.id==='fun'?'Skip games · continue →':'Next room →',chapterChoices(chapter));
  updateVisitUI(true);
}
function hostConversation(){
  if(state.guide&&!state.guideRoute.length){showChapter(CHAPTERS[state.chapter]);return;}
  const room=roomAt(host.position.x,host.position.z,host.position.y).name;
  const context=room==='The study'?'experience':room==='The project studio'?'projects':room==='The technology room'?'skills':room==='The upstairs retreat'?'future':room==='The rear terrace'?'contact':'about';
  if(room==='The living room'&&startPresentation())return;
  if(room==='The study'&&startPresentation(null,'experience'))return;
  dialogue(STORY_PREVIEWS[context],'RABIN · YOUR HOST',startTour,state.guideCheckpoint>0&&!state.completed?'Continue the guided story →':'Take the guided tour →',CONVERSATIONS[context]);
}
function startTour({restart=false}={}){
  if(!world || state.phase!=='playing')return;
  if(visit.progress.stage!=='welcomed'){toast(VISIT_OBJECTIVES[visit.progress.stage].hint,4500);return;}
  stopGesture({resume:false,notice:null});
  if(state.driving){toast('Park the car before starting the tour.');return;}
  if(state.transition)return;
  if(state.sitting){standUp(()=>startTour({restart}));return;}if(state.held)dropObject();state.guide=true;state.hostReturnRoute=[];state.chapter=(restart||state.completed?0:Math.min(state.guideCheckpoint,CHAPTERS.length-1))-1;state.guidePausedByDistance=false;guideBlockedTime=0;hideDialogue();openDoor();nextChapter();
}
function nextChapter(){
  hideDialogue();state.chapter++;
  if(state.chapter>=CHAPTERS.length){finishVisit();return;}
  const chapter=CHAPTERS[state.chapter];state.guideRoute=tourRouteFrom(host.position,chapter);state.guideWaiting=false;state.guidePausedByDistance=false;guideBlockedTime=0;updateGuideUI();updateVisitUI(true);toast(`Follow Rabin to ${chapter.room.toLowerCase()}.`,4200);
}
function updateGuideUI(){ const ready=visit?.progress.stage==='welcomed';$('tour').disabled=!ready;$('tour').textContent=ready?(state.guide?'Pause guided tour':state.guideCheckpoint>0&&!state.completed?'Continue guided story ↗':'Let Rabin guide you ↗'):'Meet Rabin first';$('mode-label').textContent=state.gesture?'GESTURE PREVIEW':ready?(state.guide?(state.guidePausedByDistance?'GUIDED TOUR · RABIN IS WAITING':'GUIDED TOUR · FOLLOW RABIN'):'FREE EXPLORATION'):state.phase==='invitation'?'THE INVITATION · RABIN’S HOUSE':'ARRIVAL · WELCOME TO RABIN’S HOUSE'; }
function updateVisitUI(force=false){
  const stage=visit.progress.stage,invitation=state.invitation?.progress.stage,key=[stage,invitation,state.guide,state.chapter,state.guideWaiting,state.guidePausedByDistance,state.completed,state.gesture?.id].join('|');if(!force&&key===lastVisitStage)return;lastVisitStage=key;
  let task=VISIT_OBJECTIVES[stage];
  if(invitation&&invitation!=='done')task={step:invitation==='driving'||invitation==='parked'?'01 / THE ROAD TO RABIN’S HOUSE':'00 / THE INVITATION',title:invitation==='exiting'?'Step out of the SUV':INVITATION[invitation].title,hint:invitation==='exiting'?'Leave room for the car door.':invitation==='driving'?'Follow the gold route. W/S drive · A/D steer · Space brake.':invitation==='parked'?'Press E to get out. The bell is beside the glass entrance.':'Answer the invitation to begin the drive.'};
  else if(state.gesture)task={step:'GESTURE PREVIEW',title:state.gesture.label,hint:state.guide?'Stop the preview to continue your tour.':'Use Stop preview or E to explore again.'};
  else if(stage==='welcomed'&&state.guide){const chapter=CHAPTERS[state.chapter];task={step:chapter.step,title:state.guidePausedByDistance?'Rabin is waiting for you':state.guideRoute.length?`Follow Rabin to ${chapter.room.toLowerCase()}`:chapter.title,hint:state.guidePausedByDistance?'Catch up to your host. He’ll continue when you’re nearby.':state.guideRoute.length?'Walk with your host. The map shows the route.':'Ask a question, then continue. You can pause the tour and explore.'};}
  else if(stage==='welcomed'&&state.completed)task={step:'09 / VISIT COMPLETE',title:'Make yourself at home',hint:'Keep exploring, connect at the terrace desk, or replay from settings.'};
  else if(stage==='welcomed'&&state.guideCheckpoint>0)task={step:'YOUR VISIT · PROGRESS SAVED',title:'Explore at your own pace',hint:'Continue the guided story when you’re ready. Garden games are optional.'};
  $('visit-step').textContent=task.step;$('visit-objective').textContent=task.title;$('visit-hint').textContent=task.hint;updateGuideUI();
  if(stage==='invited'&&state.phase==='playing')toast('Rabin is at the entrance. Walk up and press E to say hello.',5000);
}
function openDoor(){world.doorBlocker.active=false;world.door.userData.open=true;world.doors.find(d=>d.id==='front').open=true;}
function entrancePosition(){
  const blockers=[...world.blockers,actorBlocker(host.position,.29)];
  for(const [x,z] of [[1.96,11.8],[-1.96,11.8],[0,13.2],[3.8,13.2],[-3.8,13.2]]){const y=floorAt(x,z,0);if(!isBlocked(x,z,y,blockers))return {x,y,z};}
  return arrivalSpawn(world);
}

function resetPosition(){
  if(!world)return;
  if(state.presentation)finishPresentation();
  if(state.houseLoading){skipInvitation();return;}
  clearInput();cancelRace();
  if(state.phase==='invitation'||state.journey)skipInvitation();
  if(state.phase==='greeting')finishArrival();
  if(state.phase==='approach')cancelGreetingApproach();
  if(state.held)dropObject();physics.occupy(state.seatToy,false);state.seatToy=null;state.seatTarget=null;state.transition=null;state.driving=false;state.sitting=false;state.vehicle.vx=state.vehicle.vz=0;state.carSpeed=0;state.jumpVelocity=0;state.grounded=true;for(const door of world.carDoors)door.open=false;playerPos=entrancePosition();player.position.set(playerPos.x,playerPos.y,playerPos.z);player.rotation.y=Math.PI;yaw=0;pitch=0;movementYaw=null;if(visit.progress.stage==='welcomed')openDoor();hideDialogue();$('game-badge').hidden=true;toast('Back at the entrance.');
  state.gesture=null;state.jumpStarted=null;
  if(state.invitation?.progress.stage==='exiting')state.invitation.finish();updateVehicleLights();updateVisitUI(true);
}

function beginVisit(){
  if(state.phase!=='welcome')return;
  if(!visitReady()){toast(state.loading||state.houseLoading?'The house is still loading. You can browse the portfolio or use simpler models.':'The 3D view is unavailable. Your portfolio is still available.');return;}
  if(deviceProfile().mobile)void requestLandscape();
  closeModal();$('welcome').hidden=true;$('arrival').hidden=true;state.phase='playing';document.body.classList.add('playing');$('hud').hidden=false;
  playerPos=savedVisit.welcomed?{x:1.96,y:.13,z:11.8}:arrivalSpawn(world);player.position.set(playerPos.x,playerPos.y,playerPos.z);player.rotation.y=Math.atan2(-playerPos.x,10.55-playerPos.z);player.visible=true;host.visible=true;keys.clear();joystick={x:0,y:0};
  yaw=player.rotation.y-Math.PI;pitch=0;camera.position.set(playerPos.x+Math.sin(yaw)*5.3,playerPos.y+2.35,playerPos.z+Math.cos(yaw)*5.3);lookTarget.set(playerPos.x,playerPos.y+1.3,playerPos.z);camera.lookAt(lookTarget);
  if(savedVisit.welcomed){visit.resume();state.hostReturnRoute=tourRouteFrom(host.position,CHAPTERS[0]);host.userData.nameSprite.visible=true;physics.syncColliders();updateVisitUI(true);toast('Welcome back. Your stories and settings are restored. Continue the tour or explore.',6000);}
  else beginInvitation();
  updateProgress();updateVehicleLights();paintTouchControls(document,state);canvas.focus();
}

function parkVisitor(){
  state.driving=true;state.carSide=1;state.carSpeed=0;state.vehicle={x:world.car.position.x,z:world.car.position.z,heading:world.car.rotation.y,vx:0,vz:0,bounds:{halfWidth:(world.vehicle.bounds.width??world.vehicle.bounds.bodyWidth)/2+.035,halfLength:world.vehicle.bounds.length/2,height:world.vehicle.bounds.height}};
  const seat=seatPosition();playerPos={x:seat.x,y:seat.y,z:seat.z};player.position.copy(seat);player.rotation.y=world.car.rotation.y;
  const pose=driverPose(player,world.vehicle);animateCharacter(player,elapsed,0,false,true,{driving:true,seatHipTarget:pose.hip,steeringTargets:pose.steeringTargets,pedalTargets:pose.pedalTargets});
}
function placeCar(point){world.car.position.set(point.x,point.y,point.z);world.car.rotation.set(0,point.heading,0);for(const door of world.carDoors){door.open=false;door.group.rotation.y=0;}physics.relocateCar();}
function beginInvitation(){
  state.skipDriveRequested=false;
  state.phase='invitation';state.invitation=createInvitation();state.journey=null;placeCar(ROAD_START);parkVisitor();clearInput();releaseMouse();invitationRingAt=elapsed;showInvitation();tone(620,.15);updateVehicleLights();
  $('room-name').textContent='Inside the Land Cruiser';$('room-hint').textContent='A quiet road. An invitation to meet Rabin.';lastRoom='';
}
function showInvitation(){
  document.body.classList.add('in-invitation');
  const chapter=state.invitation.progress.stage==='ringing'?{title:'An invitation to Rabin’s house',text:INVITATION.call.text+'\n\n'+INVITATION.destination.text,action:'Answer & drive →'}:INVITATION[state.invitation.progress.stage];$('invitation-title').textContent=chapter.title;$('invitation-text').textContent=chapter.text;$('invitation-next').textContent=chapter.action;$('invitation').hidden=false;updateVisitUI(true);
}
function advanceInvitation(){
  if(state.modal||state.phase!=='invitation')return;
  const stage=state.invitation.progress.stage;
  if(stage==='ringing'){state.invitation.answer();state.invitation.navigate();}
  else if(stage==='call')state.invitation.navigate();
  if(state.invitation.progress.stage==='destination'){
    if(!state.invitation.drive())return;
    if('speechSynthesis' in window)window.speechSynthesis.cancel();
    document.body.classList.remove('in-invitation');$('invitation').hidden=true;state.phase='playing';state.journey={arrived:false};clearInput();yaw=world.car.rotation.y+Math.PI;pitch=.08;recordAction('drive');updateNavigation();updateVisitUI(true);canvas.focus();toast('Follow the road to Rabin’s house. W/S drive · A/D steer · Space brake.',6000);
  }
}
function skipInvitation(){
  if(!state.invitation||state.invitation.progress.stage==='done')return;
  if(state.houseLoading){state.skipDriveRequested=true;if(state.phase==='invitation')advanceInvitation();if(state.journey)updateNavigation();toast('Preparing the house. You’ll be placed at the entrance as soon as it is ready.',5000);return;}
  state.skipDriveRequested=false;state.invitation.skip();state.journey=null;$('journey').hidden=true;placeCar(HOUSE_PARKING);state.phase='playing';state.driving=false;state.transition=null;state.vehicle.vx=state.vehicle.vz=0;state.carSpeed=0;state.grounded=true;state.jumpVelocity=0;
  for(const door of world.carDoors)door.open=false;
  playerPos=arrivalSpawn(world);player.position.set(playerPos.x,playerPos.y,playerPos.z);player.rotation.y=Math.atan2(-playerPos.x,10.55-playerPos.z);yaw=player.rotation.y-Math.PI;pitch=0;
  document.body.classList.remove('in-invitation');$('invitation').hidden=true;clearInput();if('speechSynthesis' in window)window.speechSynthesis.cancel();updateVehicleLights();updateVisitUI(true);canvas.focus();toast('Walk to the entrance and ring the doorbell with E.',5500);
}
function requestGreeting(){
  if(visit.progress.stage!=='invited'||state.phase!=='playing'||state.transition)return;
  if(!state.grounded||state.crouching){toast('Stand on the porch to greet Rabin.');return;}
  if(horizontalDistance(playerPos,host.position)>2.7){toast('Walk closer to Rabin to say hello.');return;}
  host.rotation.y=0;arrivalLayout=greetingLayout(host,player);
  const route=greetingApproach(world,host,playerPos,arrivalLayout.visitor);
  if(!route){toast('Move onto the open porch so there’s room to greet Rabin.');return;}
  if(state.held)dropObject();hideDialogue();releaseMouse();clearInput();state.punch=null;
  greetingRoute=route;greetingBlocked=0;$('interact').hidden=true;$('skip-greeting').hidden=false;
  if(state.reducedMotion){finishArrival();return;}
  state.phase='approach';
}
function cancelGreetingApproach(){
  state.phase='playing';greetingRoute=[];$('skip-greeting').hidden=true;clearInput();
}
function updateGreetingApproach(dt){
  const target=greetingRoute[0];if(!target){beginGreeting();return;}
  const result=walkArrivalRoute(playerPos,target,dt,[...world.blockers,actorBlocker(host.position,.29)]);
  playerPos=result.position;player.position.set(playerPos.x,playerPos.y,playerPos.z);
  if(result.speed>.01){player.rotation.y=angleLerp(player.rotation.y,Math.atan2(target.x-playerPos.x,target.z-playerPos.z),1-Math.exp(-10*dt));greetingBlocked=0;}else greetingBlocked+=dt;
  animateCharacter(player,elapsed,result.speed);animateCharacter(host,elapsed,0,false,false,{talking:false});
  if(result.done)greetingRoute.shift();
  if(greetingBlocked>1.2){cancelGreetingApproach();toast('Something is blocking the greeting. Move closer on the open porch and press E again.');}
}
function beginGreeting(){
  if(!visit.greet()){cancelGreetingApproach();return;}
  state.phase='greeting';cinematicTime=0;keys.clear();state.moveVX=state.moveVZ=0;
  document.body.classList.add('cinematic');player.rotation.y=Math.PI;host.rotation.y=0;host.userData.nameSprite.visible=false;updateVisitUI();
}
function finishArrival(){
  visit.finish();greetingRoute=[];$('skip-greeting').hidden=true;clearInput();
  state.phase='playing';document.body.classList.remove('cinematic');document.body.classList.add('playing');$('hud').hidden=false;openDoor();yaw=0;pitch=0;
  endGreeting(player);endGreeting(host);
  host.userData.nameSprite.visible=true;camera.fov=48;camera.updateProjectionMatrix();camera.position.set(playerPos.x,playerPos.y+2.35,playerPos.z+4);lookTarget.set(playerPos.x,playerPos.y+1.3,playerPos.z);camera.lookAt(lookTarget);
  state.hostReturnRoute=tourRouteFrom(host.position,CHAPTERS[0]);
  dialogue('Hi, I’m Rabin. Welcome to my house! Let me give you a tour, or make yourself at home and explore. Every room has a story.','RABIN · WELCOME',startTour,'Take the guided tour →');
  saveProgress();updateProgress();updateVisitUI();canvas.focus();
  toast('Choose the guided tour, or keep exploring at your own pace.',5500);
}

function memoryGame(){
  const deck=memoryDeck();let selected=[],matched=new Set(),moves=0,locked=false;const started=performance.now();
  openModal('A little memory break.','THE ARCADE · MATCH SIX PAIRS',`<div class="memory-status"><span id="memory-moves">0 moves</span><span id="memory-pairs">0 / 6 pairs</span></div><div class="memory-grid">${deck.map((s,i)=>`<button class="memory-tile" data-index="${i}" aria-label="Reveal card ${i+1}">?</button>`).join('')}</div><p id="memory-message">Find the matching symbols. Take your time.</p><button id="memory-restart" class="gold-button">New game ↻</button>`);
  const token=memoryToken;const tiles=[...document.querySelectorAll('.memory-tile')];
  tiles.forEach((tile,index)=>tile.onclick=()=>{
    if(locked || selected.includes(index) || matched.has(index))return;
    selected.push(index);tile.textContent=deck[index];tile.classList.add('revealed');tile.setAttribute('aria-label',`${deck[index]}, revealed`);tone(330+index*25,.12);
    if(selected.length===2){moves++;$('memory-moves').textContent=`${moves} moves`;const [a,b]=selected;
      if(deck[a]===deck[b]){matched.add(a);matched.add(b);tiles[a].classList.add('matched');tiles[b].classList.add('matched');tiles[a].disabled=tiles[b].disabled=true;selected=[];$('memory-pairs').textContent=`${matched.size/2} / 6 pairs`;tone(660,.2);
        if(matched.size===12)$('memory-message').textContent=`All matched! ${moves} moves in ${Math.round((performance.now()-started)/1000)} seconds. Nice work.`;
      }else{locked=true;setTimeout(()=>{if(token!==memoryToken)return;for(const i of [a,b]){tiles[i].textContent='?';tiles[i].classList.remove('revealed');tiles[i].setAttribute('aria-label',`Reveal card ${i+1}`);}selected=[];locked=false;},750);}
    }
  });
  $('memory-restart').onclick=memoryGame;
}

function pianoGame(){
  openModal('A few notes between stories.','THE LIVING ROOM · PIANO',`<p>Tap a key to play. You can also use A S D F G H J while this panel is open.</p><div id="piano-keys" style="display:flex;gap:5px;margin:24px 0;height:130px">${['C','D','E','F','G','A','B'].map((n,i)=>`<button class="piano-key" data-note="${i}" style="flex:1;background:${i%2?'#e3d6b7':'#fff9e9'};border:1px solid #d4c3a0;border-radius:0 0 5px 5px;color:#314937">${n}<br><small>${'ASDFGHJ'[i]}</small></button>`).join('')}</div><p class="small-note">Sound turns on when you play a note.</p>`);
  document.querySelectorAll('.piano-key').forEach(b=>b.onclick=()=>playPiano(+b.dataset.note));
}
function playPiano(index){
  state.sound=true;updateSoundUI();saveProgress();tone([261.63,293.66,329.63,349.23,392,440,493.88][index],.7,.12);
  const note=[39,41,43,44,46,48,50][index];setPianoKeyPressed(world.piano,note,1);
  const key=document.querySelector(`.piano-key[data-note="${index}"]`);if(key)key.style.transform='translateY(5px)';
  setTimeout(()=>{setPianoKeyPressed(world.piano,note,0);if(key)key.style.transform='';},180);
}

function repairScene(){
  if(!world)return;
  if(state.presentation)finishPresentation();
  if(state.houseLoading&&state.journey){skipInvitation();return;}
  if(state.journey)skipInvitation();
  clearInput();cancelRace();
  const relocate=state.driving||state.sitting||!!state.transition;
  state.held=null;state.transition=null;state.sitting=false;state.seatToy=null;state.seatTarget=null;state.driving=false;state.gesture=null;state.punch=null;state.aiming=state.charging=false;
  physics.repairAll();world.vehicle.controls?.reset();state.carHeadlights=null;state.braking=false;state.knockedPins.clear();state.moveVX=state.moveVZ=0;state.vehicle.vx=state.vehicle.vz=0;state.carSpeed=0;
  world.car.position.set(18,.02,18);world.car.rotation.set(0,Math.PI,0);for(const door of world.carDoors){door.open=false;door.group.rotation.y=0;}
  physics.relocateCar();
  if(relocate||isBlocked(playerPos.x,playerPos.z,playerPos.y,world.blockers)){
    if(state.phase==='approach')cancelGreetingApproach();else if(state.phase==='greeting')finishArrival();
    playerPos=entrancePosition();player.position.set(playerPos.x,playerPos.y,playerPos.z);state.grounded=true;state.jumpVelocity=0;
  }
  updateLighting();toast('Glass, lamps, cups, planters, furniture, and sports objects restored.',3500);
  if(state.phase==='invitation'){placeCar(ROAD_START);parkVisitor();}else if(state.invitation?.progress.stage==='exiting')state.invitation.finish();updateVehicleLights();updateVisitUI(true);
}

function impactSound(material){
  if(!state.sound||state.volume===0)return;
  try{
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const length=material==='glass'?.27:material==='ceramic'?.18:.11,buffer=audioContext.createBuffer(1,Math.ceil(audioContext.sampleRate*length),audioContext.sampleRate),samples=buffer.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/samples.length*6);
    const source=audioContext.createBufferSource(),filter=audioContext.createBiquadFilter(),gain=audioContext.createGain();source.buffer=buffer;filter.type=material==='wood'?'lowpass':'highpass';filter.frequency.value=material==='wood'?440:material==='ceramic'?1200:2700;gain.gain.value=.13*state.volume;source.connect(filter);filter.connect(gain);gain.connect(audioContext.destination);source.start();
  }catch{}
}

function recordAction(action){state.actions.add(action);if(['carry','throw','strike'].includes(action)&&visit?.progress.stage==='welcomed'&&(Math.abs(playerPos.x)>12||playerPos.z<-10))discover('fun');saveProgress();updateProgress();}
function beginAction(type,to,heading,duration,onMid,onEnd){
  if(state.transition||state.presentation)return;
  hideDialogue();state.moveVX=state.moveVZ=0;
  state.running=false;state.crouching=false;
  const action={type,time:0,duration,from:{...playerPos},to:to??{...playerPos},heading:heading??player.rotation.y,onMid,onEnd,midDone:false};
  if((type==='sit'||type==='stand')&&state.seatTarget){
    const contact=chairContact(player,state.seatTarget,world.blockers);if(contact)action.contact={x:contact.x,y:contact.y,z:contact.z};
  }
  if(type==='enter-car'||type==='exit-car'){
    const point=(x,y,z)=>{const p=carLocal(x,y,z);return {x:p.x,y:p.y,z:p.z};};
    const entry=world.vehicle.entryLocal??new THREE.Vector3(1.65,0,-.15),stepAnchor=world.vehicle.stepLocal??new THREE.Vector3(.92,.23,-.35);
    const outside=point(state.carSide*Math.abs(entry.x),entry.y,entry.z);outside.y=floorAt(outside.x,outside.z);
    const step=point(state.carSide*Math.abs(stepAnchor.x),stepAnchor.y,stepAnchor.z);
    action.path=type==='enter-car'?[{at:0,point:action.from},{at:.24,point:outside},{at:.5,point:step},{at:.84,point:action.to},{at:1,point:action.to}]:[{at:0,point:action.from},{at:.16,point:action.from},{at:.48,point:step},{at:.74,point:outside},{at:1,point:action.to}];
  }
  state.transition=action;
}
function updateAction(dt){
  const a=state.transition,previous={...playerPos};a.time+=dt;const t=clamp(a.time/a.duration,0,1);
  playerPos=actionPosition(a,t);
  player.rotation.y=angleLerp(player.rotation.y,a.heading,1-Math.exp(-12*dt));
  if(a.type==='enter-car'||a.type==='exit-car'){
    const door=world.carDoors.find(d=>d.side===state.carSide&&d.front!==false);
    door.open=a.type==='enter-car'?t>.1&&t<.92:t<.9;
  }
  if(t>.45&&!a.midDone){a.midDone=true;a.onMid?.();}
  if(t===1){state.transition=null;a.onEnd?.();}
  return dt>0?Math.hypot(playerPos.x-previous.x,playerPos.z-previous.z)/dt:0;
}
function carLocal(x,y,z){return new THREE.Vector3(x,y,z).applyMatrix4(world.car.matrixWorld);}
function seatPosition(){return driverPose(player,world.vehicle).root;}
function mountCar(){
  if(state.transition||state.sitting||!state.grounded)return;if(state.held)dropObject();
  world.car.updateMatrixWorld(true);const local=world.car.worldToLocal(new THREE.Vector3(playerPos.x,playerPos.y,playerPos.z));if(local.x<.75||local.x>2.7||Math.abs(local.z-(world.vehicle.entryLocal?.z??-.2))>1.3){toast('Walk to the front driver’s door on the right side of the SUV.');return;}state.carSide=1;
  const door=world.carDoors.find(d=>d.side===state.carSide&&d.front!==false);door.open=true;
  const seat=seatPosition();door.open=false;beginAction('enter-car',seat,world.car.rotation.y,Math.min(actionDuration(player,'enter-car',1.05),3.4),null,()=>{
    state.driving=true;state.carSpeed=0;state.vehicle={x:world.car.position.x,z:world.car.position.z,heading:world.car.rotation.y,vx:0,vz:0,bounds:{halfWidth:(world.vehicle.bounds.width??world.vehicle.bounds.bodyWidth)/2+.035,halfLength:world.vehicle.bounds.length/2,height:world.vehicle.bounds.height}};door.open=false;state.crouching=false;recordAction('drive');yaw=world.car.rotation.y+Math.PI;toast('W/S: drive · A/D: steer · Space: handbrake · H: horn · R: timed lap',5500);
  });
}
function dismount(){
  if(!state.driving||state.transition)return;
  if(state.journey)updateNavigation();
  if(state.journey&&!state.journey.arrived){toast('Follow the road to the driveway, or choose Skip drive.');return;}
  if(state.houseLoading){toast('House detail is finishing. You can use the simpler house to enter now.',4500);return;}
  if(Math.hypot(state.vehicle.vx,state.vehicle.vz)>=.5){toast('Hold the brake until the car stops before getting out.');return;}
  const exit=carExitSpot(world,state.carSide);
  if(!exit){if(state.invitation?.progress.stage==='exiting'){skipInvitation();return;}toast('Move the SUV to an open space before getting out.');return;}
  const spot=exit.position;state.carSide=exit.side;const door=world.carDoors.find(d=>d.side===state.carSide&&d.front!==false);door.open=true;
  if(state.invitation?.progress.stage==='parked')state.invitation.exit();
  clearInput();cancelRace();
  state.vehicle.vx=state.vehicle.vz=0;state.carSpeed=0;state.driving=false;
  beginAction('exit-car',spot,world.car.rotation.y,Math.min(actionDuration(player,'exit-car',1),3.5),null,()=>{door.open=false;state.jumpVelocity=0;state.grounded=true;if(state.invitation?.finish()){state.journey=null;$('journey').hidden=true;updateVisitUI(true);toast('You’ve arrived. Ring the bell on the right of the glass entrance.',6000);}else toast('Back on foot.');updateVehicleLights();});
}
function standUp(onEnd=null){
  if(state.transition||!state.sitting)return;
  const blockers=[...world.blockers,actorBlocker(host.position,.29)],to=state.seatTarget?chairExit(player,state.seatTarget,blockers,state.seatReturn):state.seatReturn;
  if(!to||state.seatTarget&&!chairContact(player,state.seatTarget,blockers)){toast('Move the object in front of the chair before standing up.');return;}
  beginAction('stand',to,player.rotation.y,Math.min(actionDuration(player,'stand',.5),3),null,()=>{state.sitting=false;physics.occupy(state.seatToy,false);state.seatToy=null;state.seatTarget=null;onEnd?.();});
}
function pickUp(toy){
  if(state.held||!toy.holdable||state.transition||!state.grounded)return;
  if(!chooseInteraction(playerPos,player.rotation.y,[{x:toy.body.position.x,y:toy.body.position.y,z:toy.body.position.z,radius:1.75,blocker:toy.blocker}],world.blockers)){toast('Step closer to reach that object.');return;}
  const heading=Math.atan2(toy.mesh.position.x-playerPos.x,toy.mesh.position.z-playerPos.z);
  beginAction('pickup',null,heading,Math.min(actionDuration(player,'pickup',.6),1.4),()=>{if(toy.broken||horizontalDistance(playerPos,toy.body.position)>1.85)return;physics.hold(toy);state.held=toy;recordAction('carry');tone(260,.08);},()=>toast(`Carrying the ${toy.label}. Aim with right mouse; hold click / J to throw. Q to drop.`,5000));
}
function dropObject(){
  if(!state.held)return;
  const toy=state.held;state.held=null;state.aiming=state.charging=false;
  physics.release(toy,{x:Math.sin(player.rotation.y)*.7,y:0,z:Math.cos(player.rotation.y)*.7});toast(`Dropped the ${toy.label}.`);
}
function throwObject(power=.4){
  if(!state.held||state.transition||state.punch?.type==='throw')return;
  const toy=state.held;player.rotation.y=yaw+Math.PI;
  const velocity=throwVelocity(toy,power);
  state.charging=state.aiming=false;
  const captured=player.userData.rig?.asset.motions?.clips.has('throw');
  state.punch={time:0,duration:captured?Math.min(actionDuration(player,'throw'),1.8):.42,side:1,type:'throw',hit:true,toy,velocity,releaseAt:captured?.5:0};
  if(!captured)releaseThrow(state.punch);
}
function releaseThrow(action){
  if(state.held!==action.toy)return;const toy=action.toy;action.toy=null;
  physics.release(toy,action.velocity);state.held=null;recordAction('throw');if(toy.id==='basketball')state.throws++;
  tone(300,.09);toast('Thrown. You can pick it up wherever it lands.',2200);
}
function throwVelocity(toy,power){
  const from=toy.mesh.position;
  const elevation=state.aiming?clamp(-(.2+pitch*.85),-.65,.9):clamp(.32-pitch*.7,.04,.85),speed=(8+clamp(power,0,1)*10)/Math.sqrt(Math.max(1,toy.originalMass/.65));
  let velocity={x:-Math.sin(yaw)*speed*Math.cos(elevation),y:Math.sin(elevation)*speed,z:-Math.cos(yaw)*speed*Math.cos(elevation)};
  if(toy.id==='bowling-ball'&&state.aiming)velocity.y=-1.5;
  const dx=world.hoop.x-from.x,dz=world.hoop.z-from.z,d=Math.hypot(dx,dz),facing=(-Math.sin(yaw)*dx-Math.cos(yaw)*dz)/d;
  if(toy.id==='basketball'&&state.aiming&&d>2&&d<13&&facing>.96)velocity=basketballLaunch(from,world.hoop,power);
  return velocity;
}
function actionPress(){
  if(state.phase!=='playing'||state.modal||state.transition||state.gesture||state.presentation)return;
  if(state.punch?.type==='throw')return;
  if(state.driving){horn();return;}
  if(state.held){state.charging=true;state.chargeStart=elapsed;return;}
  if(state.sitting){standUp();return;}
  if(state.punch)return;
  state.combo=elapsed-state.lastPunch<1.2?(state.combo+1)%3:0;state.lastPunch=elapsed;player.rotation.y=yaw+Math.PI;
  state.punch={time:0,duration:state.combo===2?.55:Math.min(actionDuration(player,'punch',.4),1.8),side:state.combo%2,type:state.combo===2?'kick':'punch',hit:false};
}
function actionRelease(){if(state.charging)throwObject(clamp((elapsed-state.chargeStart)/1.1,.12,1));}
function horn(){tone(220,.26,.10);tone(277,.26,.06);toast('Beep beep.',1200);}
function updatePunch(dt){
  if(!state.punch)return;const a=state.punch;a.time+=dt;const t=a.time/a.duration;
  if(a.type==='throw'&&a.toy&&t>=a.releaseAt)releaseThrow(a);
  if(!a.hit&&t>.43){
    a.hit=true;const kick=a.type==='kick',dir={x:Math.sin(player.rotation.y),y:clamp(-pitch*.85,-.9,.8),z:Math.cos(player.rotation.y)};
    const from={...playerPos,y:playerPos.y-(state.crouching?(kick?.15:.45):0)};
    const target=physics.strike(from,dir,kick?9:6,kick);
    if(target){state.shake=.1;tone(110,.1,.055);if(target.kind==='bag'){state.bagHits++;recordAction('strike');toast(`${a.type==='kick'?'Kick':'Punch'} · ${state.bagHits} bag hits`,1400);}else toast(`${a.type==='kick'?'Kicked':'Hit'} the ${target.label}.`,1400);}

  }
  if(t>1)state.punch=null;
}
function beginRace(){
  if(!state.driving||state.phase!=='playing'||state.modal||state.transition)return;
  if(state.journey){toast('Reach the house before starting a garden lap.');return;}
  let best=null;try{best=Number(localStorage.getItem('rabin-house-lap'))||null;}catch{}
  state.race={checkpoint:0,time:0,best,finished:false};world.raceGate.visible=true;updateRaceGate();toast('Follow the green gates around the house. The clock is running!',4500);
}
function cancelRace(){state.race=null;if(world)world.raceGate.visible=false;}
function updateRaceGate(){const r=state.race,p=world.checkpoints[r.checkpoint];world.raceGate.position.set(p.x,.02,p.z);world.raceGate.rotation.y=Math.atan2(world.car.position.x-p.x,world.car.position.z-p.z);}

function previewStory(id){
  if(['experience','healthcare'].includes(id)&&roomAt(playerPos.x,playerPos.z,playerPos.y).name==='The study'&&startPresentation(null,'experience',id==='healthcare'?id:null))return;
  if(id==='about'&&roomAt(playerPos.x,playerPos.z,playerPos.y).name==='The living room'&&startPresentation())return;
  const topic=id.startsWith('tech-')?TECH_TOPICS[id.slice(5)]:null;
  if(topic){discover('skills');beginAction('inspect',null,player.rotation.y,.4,null,()=>dialogue(topic.text,'RABIN · '+topic.title.toUpperCase(),()=>contentModal('skills'),'Read the engineering approach →',CONVERSATIONS.skills));return;}
  if(!copy[id])return;discover(id);const end=id==='contact'&&visit.progress.stage==='welcomed';
  beginAction('inspect',null,player.rotation.y,.4,null,()=>dialogue(STORY_PREVIEWS[id],copy[id].title.toUpperCase(),end?finishVisit:()=>contentModal(id),end?'Finish the visit →':'Read the full details →',CONVERSATIONS[id]??[]));
}

function use(){
  if(state.modal || state.phase!=='playing'||state.presentation)return;
  if(state.gesture){stopGesture();return;}
  if(state.transition)return;
  if(state.driving){dismount();return;}
  if(state.sitting){standUp();return;}
  if(!state.near)return;
  const i=state.near;
  if(i.action==='host'){
    if(visit.progress.stage==='invited'){requestGreeting();return;}
    hostConversation();
  }else if(i.action==='doorbell'){
    if(visit.progress.stage!=='arrived'){toast('Rabin is on his way. Leave the doorway clear.');return;}
    if(!state.grounded){toast('Stand on the porch to reach the bell.');return;}
    beginAction('doorbell',null,Math.atan2(i.x-playerPos.x,i.z-playerPos.z),.5,()=>{
      if(!visit.ring())return;recordAction('door');tone(660,.18);setTimeout(()=>tone(440,.3),190);updateVisitUI();toast('Ding-dong. Rabin is coming to welcome you.',4000);
    });
  }else if(i.action==='door'){
    const door=world.doors.find(d=>d.id===i.doorId);
    if(!physics.canMoveDoor(door,door.open?0:door.angle,[playerPos,host.position])){toast('Step clear of the door’s swing, or move the loose object blocking it.');return;}
    beginAction('door',null,Math.atan2(door.x-playerPos.x,door.z-playerPos.z),.65,()=>{door.open=!door.open;door.blocker.active=!door.open;door.group.userData.open=door.open;tone(180,.16);recordAction('door');},()=>toast(`${door.open?'Opened':'Closed'} the ${door.label}.`));
  }
  else if(i.action==='pickup')pickUp(i.toy);
  else if(i.action==='punch')actionPress();
  else if(i.action==='reset-toys')repairScene();
  else if(i.action==='memory')memoryGame();
  else if(i.action==='piano')pianoGame();
  else if(i.action==='car')mountCar();
  else if(i.action==='car-controls')vehiclePartsModal();
  else if(i.action==='fireplace'){world.fireGroup.visible=!world.fireGroup.visible;world.fireLight.visible=world.fireGroup.visible;tone(130,.15);toast(world.fireGroup.visible?'A little warmth.':'Fireplace switched off.');}
  else if(i.action==='sit'){
    if(state.held)dropObject();const target=i.seat;if(!target)return;const toy=target.toy?physics.toys.find(t=>t.id===target.toy.id):null;
    if(toy&&new THREE.Vector3(0,1,0).applyQuaternion(toy.mesh.quaternion).y<.88){toast('Repair the scene to set the tipped chair upright before sitting.');return;}
    if(!chairContact(player,target,world.blockers)){toast('Move the object in front of the chair before sitting.');return;}
    state.seatReturn={...playerPos};state.seatTarget=target;state.seatToy=toy;physics.occupy(toy,true);target.mesh.updateMatrixWorld(true);
    const seat=chairPose(player,target).root;
    beginAction('sit',seat,target.mesh.rotation.y+target.heading,Math.min(actionDuration(player,'sit',.85),3),null,()=>{state.sitting=true;yaw=player.rotation.y-Math.PI;pitch=.03;toast('E to stand up.');});
  }else previewStory(i.action);
}

function updateSoundUI(){const audible=state.sound&&state.volume>0;$('sound').textContent=audible?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(audible));$('sound').title=audible?`Sound ${Math.round(state.volume*100)}% · click to mute`:'Enable sound';}
function updateVehicleLights(){if(!world)return;const on=state.driving;if(world.vehicle.controls){world.vehicle.controls.setHeadlights(state.carHeadlights??on);world.vehicle.controls.setBrake(on&&!!state.braking);return;}for(const lamp of world.vehicle.lamps)if(lamp.mesh.visible)lamp.material.emissiveIntensity=on?lamp.baseIntensity:0;}
function updateLighting(){
  if(!renderer||!world)return;
  scene.background=new THREE.Color(state.night?'#233c42':'#c1cfb8');scene.fog.color.copy(scene.background);sun.intensity=state.night?.4:3.2;ambient.intensity=state.night?.85:1.6;scene.environmentIntensity=state.night?.12:.5;renderer.toneMappingExposure=state.night?1.1:1.05;
  for(const bulb of world.bulbs)if(bulb.visible)bulb.material.emissiveIntensity=state.night?2:.7;
  for(const light of world.entranceLights)light.intensity=state.night?3.5:.45;
}
function resizeRenderer(){if(!renderer||stopped)return;const profile=deviceProfile(),size=landscapeSize(innerWidth,innerHeight,profile.mobile);camera.aspect=size.width/size.height;camera.updateProjectionMatrix();applyRenderSize(renderer,size.width,size.height,state.quality==='low'?1:profile.pixelRatio);}
function setQuality(){physics?.setQuality(state.quality==='low');setAssetQuality(world,state.quality==='low');if(!renderer)return;renderer.shadowMap.enabled=state.quality!=='low';resizeRenderer();}

function releaseMouse(){if(document.pointerLockElement===canvas){intentionalMouseRelease=true;document.exitPointerLock();}}
function captureMouse(){
  if(state.modal||state.phase!=='playing'||state.presentation)return;
  if(!canvas.requestPointerLock){toast('Drag to look; J to act.');return;}
  try{const result=canvas.requestPointerLock();result?.catch(()=>toast('Mouse capture is unavailable here. Drag to look; J to act.',4500));}catch{toast('Drag to look; J to act.');}
}
function look(dx,dy){
  if(state.presentation)return;
  const turn=-dx*.004;
  if(!state.sitting&&!state.transition){yaw+=turn;if(state.driving){const rear=world.car.rotation.y+Math.PI;const offset=Math.atan2(Math.sin(yaw-rear),Math.cos(yaw-rear));yaw=rear+clamp(offset,-.5,.5);}else{player.rotation.y=yaw+Math.PI;if(movementYaw!==null)movementYaw+=turn;}}
  pitch=clamp(pitch+dy*.0035,-.7,.8);state.lookUntil=elapsed+2.2;
}
function bindEvents(){
  $('gestures').onclick=gesturesModal;
  $('enter').onclick=beginVisit;$('portfolio').onclick=portfolioModal;$('quick-view').onclick=portfolioModal;$('fallback-portfolio').onclick=portfolioModal;$('loading-portfolio').onclick=portfolioModal;$('skip-drive').onclick=skipInvitation;
  $('help').onclick=controlsModal;$('brand').onclick=e=>{e.preventDefault();controlsModal();};$('modal-close').onclick=closeModal;
  $('objective-open').onclick=mapModal;
  $('modal').onclick=e=>{if(e.target===$('modal'))closeModal();};
  $('dialogue-close').onclick=()=>pauseTour();$('dialogue-next').onclick=()=>state.dialogueAction?.();
  $('story-pause').onclick=togglePresentationPause;$('story-next').onclick=nextPresentationSlide;$('story-exit').onclick=()=>state.presentation?.story.exit();$('desktop-browse').onclick=toggleDesktopMenu;
  for(const button of $('desktop-menu').querySelectorAll('button'))button.onclick=()=>selectDesktopPage(button.dataset.desktopPage);
  $('interact').onclick=use;$('gesture-stop').onclick=()=>{if(!state.modal)stopGesture();};
  $('invitation-next').onclick=advanceInvitation;$('skip-invitation').onclick=skipInvitation;$('replay-entry').onclick=replayVisit;
  $('skip-greeting').onclick=()=>{if(['approach','greeting'].includes(state.phase))finishArrival();};
  $('tour').onclick=()=>state.guide?pauseTour(true):startTour();
  $('map-button').onclick=mapModal;$('mouse-mode').onclick=()=>mouseCaptured?releaseMouse():captureMouse();
  $('sound').onclick=()=>{state.sound=!(state.sound&&state.volume>0);if(state.sound&&state.volume===0)state.volume=.65;updateSoundUI();saveProgress();if(state.sound){tone(440,.12);if(!$('dialogue').hidden)speak($('dialogue-text').textContent);}else if('speechSynthesis' in window)window.speechSynthesis.cancel();};
  document.addEventListener('pointerlockchange',()=>{
    const wasCaptured=mouseCaptured;mouseCaptured=document.pointerLockElement===canvas;
    document.body.classList.toggle('mouse-captured',mouseCaptured);$('mouse-mode').textContent=mouseCaptured?'Mouse captured':'Capture mouse';
    if(wasCaptured&&!mouseCaptured){keys.clear();state.charging=state.aiming=false;if(!intentionalMouseRelease&&!state.modal&&state.phase==='playing')controlsModal();}
    intentionalMouseRelease=false;
  });
  document.addEventListener('mousemove',e=>{if(mouseCaptured&&!state.modal)look(e.movementX,e.movementY);});
  window.addEventListener('keydown',e=>{
    if(state.modal){
      if(e.code==='Escape'){closeModal();return;}
      if($('piano-keys')){const i=['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ'].indexOf(e.code);if(i>=0&&!e.repeat)playPiano(i);}
      if(e.code==='Tab'){const focusable=[...$('modal').querySelectorAll('button,a,input,select,textarea')].filter(el=>!el.disabled&&!el.closest('[hidden]'));const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||!focusable.includes(document.activeElement))){e.preventDefault();first?.focus();}}
      return;
    }
    if(e.code!=='Escape'&&(e.target.matches('input,select,textarea')||(['Enter','Space'].includes(e.code)&&e.target.closest('button,a'))))return;
    if(state.presentation){
      if(e.repeat)return;
      if(e.code==='Escape'){e.preventDefault();if(!$('desktop-menu').hidden)closeDesktopMenu();else state.presentation.story.exit();}
      else if(e.code==='Space'){e.preventDefault();togglePresentationPause();}
      else if(['Enter','KeyN','ArrowRight'].includes(e.code)){e.preventDefault();nextPresentationSlide();}
      else if(e.code==='Tab'){
        const focusable=[...$('presentation').querySelectorAll('button')].filter(button=>!button.disabled&&!button.closest('[hidden]')),first=focusable[0],last=focusable.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||!focusable.includes(document.activeElement))){e.preventDefault();first?.focus();}
      }else if(e.code.startsWith('Arrow'))e.preventDefault();
      return;
    }
    if(state.phase==='invitation'){
      if(['KeyE','Enter','Space'].includes(e.code)&&!e.repeat){e.preventDefault();advanceInvitation();}else if(e.code==='Escape')controlsModal();return;
    }
    if(['approach','greeting'].includes(state.phase)){
      if(e.code==='Escape'||e.code==='Space'){e.preventDefault();finishArrival();}return;
    }
    if(state.phase!=='playing')return;
    if(state.gesture){if(e.code==='Escape'||e.code==='KeyE'){e.preventDefault();stopGesture();}return;}
    if(e.code==='Space'&&!$('dialogue').hidden&&!state.driving){e.preventDefault();pauseTour();return;}
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
    keys.add(e.code);if(e.repeat)return;
    if(e.code==='KeyE')use();
    if(e.code==='KeyM')mapModal();
    if(e.code==='KeyG')state.waveUntil=elapsed+1.5;
    if(e.code==='KeyC'&&!state.driving){if(state.crouching&&isBlocked(playerPos.x,playerPos.z,playerPos.y,world.blockers,.31,actorHeight(player)))toast('Move out from underneath the object before standing.');else state.crouching=!state.crouching;}
    if(e.code==='KeyQ')dropObject();
    if(e.code==='KeyJ')actionPress();
    if(e.code==='KeyH'&&state.driving)horn();
    if(e.code==='KeyR'&&state.driving)beginRace();
    if(e.code==='KeyF'){
      if(state.driving)dismount();
      else{const option={id:'car',action:'car',blocker:world.carBlocker,x:world.car.position.x,y:world.car.position.y,z:world.car.position.z,radius:3.5};if(chooseInteraction(playerPos,yaw+Math.PI,[option],world.blockers))mountCar();else toast('Walk up to the car, then press F.');}
    }
    if(e.code==='Enter')state.dialogueAction?.();
    if(e.code==='Escape')controlsModal();
    if(e.code==='Space'&&!state.driving)jump();
  });
  window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='KeyJ')actionRelease();});
  window.addEventListener('blur',clearInput);
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{
    if(state.presentation){desktopPointer(e);return;}
    if(state.phase!=='playing'||state.modal||state.presentation)return;
    if(mouseCaptured){if(e.button===0){actionPointer=e.pointerId;actionPress();}if(e.button===2)state.aiming=!!state.held;return;}
    if(e.pointerType==='mouse'){captureMouse();}
    drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{if(mouseCaptured||state.modal||state.gesture||state.presentation||!drag||drag.id!==e.pointerId)return;const delta=landscapeDelta(e.clientX-drag.x,e.clientY-drag.y,landscapeSize(innerWidth,innerHeight,deviceProfile().mobile).rotated);look(delta.x*1.4,delta.y*1.4);drag.x=e.clientX;drag.y=e.clientY;});
  function releasePointerAction(e){if(e.pointerId===actionPointer&&e.button===0){actionPointer=null;actionRelease();}}
  window.addEventListener('pointerup',e=>{releasePointerAction(e);if(e.button===2)state.aiming=false;if(drag?.id===e.pointerId)drag=null;});
  canvas.addEventListener('pointercancel',e=>{if(drag?.id===e.pointerId)drag=null;if(actionPointer===e.pointerId){actionPointer=null;state.charging=false;}state.aiming=false;});
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(state.presentation)return;cameraDistance=clamp(cameraDistance+e.deltaY*.006,2.5,8);},{passive:false});
  $('joystick').addEventListener('pointerdown',e=>{if(state.modal||state.gesture||state.transition||state.presentation||state.phase!=='playing'||(joystickPointer!==null&&joystickPointer!==e.pointerId))return;joystickPointer=e.pointerId;$('joystick').setPointerCapture(e.pointerId);updateJoystick(e);});
  $('joystick').addEventListener('pointermove',e=>{if(!state.modal&&!state.presentation&&state.phase==='playing'&&e.pointerId===joystickPointer)updateJoystick(e);});
  function releaseJoystick(e){if(e.pointerId!==joystickPointer)return;joystickPointer=null;joystick={x:0,y:0};$('joystick-knob').style.transform='translate(0,0)';}
  $('joystick').addEventListener('pointerup',releaseJoystick);$('joystick').addEventListener('pointercancel',releaseJoystick);
  $('touch-use').onclick=use;
  const touchReady=()=>state.phase==='playing'&&!state.modal&&!state.transition&&!state.gesture&&!state.presentation;
  $('touch-jump').addEventListener('pointerdown',e=>{if(!touchReady()||state.driving)return;jump();$('touch-jump').setPointerCapture(e.pointerId);});
  $('touch-action').addEventListener('pointerdown',e=>{if(!touchReady())return;e.preventDefault();actionPointer=e.pointerId;$('touch-action').setPointerCapture(e.pointerId);actionPress();});
  $('touch-action').addEventListener('pointerup',releasePointerAction);$('touch-action').addEventListener('pointercancel',e=>{if(actionPointer===e.pointerId){actionPointer=null;state.charging=false;}});
  $('touch-aim').onclick=()=>{if(touchReady()&&!state.driving&&state.held)state.aiming=!state.aiming;};
  $('touch-drop').onclick=()=>{if(touchReady()){if(state.driving&&!state.journey)beginRace();else if(!state.driving)dropObject();}};
  $('touch-run').addEventListener('pointerdown',e=>{if(!touchReady()||(runPointer!==null&&runPointer!==e.pointerId))return;runPointer=e.pointerId;if(state.driving)state.touchBrake=true;else state.touchRun=true;$('touch-run').setPointerCapture(e.pointerId);});
  const endRun=e=>{if(runPointer!==e.pointerId)return;runPointer=null;state.touchRun=state.touchBrake=false;};$('touch-run').addEventListener('pointerup',endRun);$('touch-run').addEventListener('pointercancel',endRun);
  window.addEventListener('resize',()=>{clearInput();clearTimeout(resizeTimer);resizeTimer=setTimeout(resizeRenderer,150);});
  document.addEventListener('visibilitychange',()=>{clearInput();previousTime=performance.now();if(document.hidden&&state.presentation&&!state.presentation.story.paused)togglePresentationPause();});
}
function updateJoystick(e){const r=$('joystick').getBoundingClientRect(),delta=landscapeDelta(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2,landscapeSize(innerWidth,innerHeight,deviceProfile().mobile).rotated),dx=delta.x,dy=delta.y,scale=Math.max(1,Math.hypot(dx,dy)/34);joystick={x:dx/scale/34,y:-dy/scale/34};$('joystick-knob').style.transform=`translate(${dx/scale}px,${dy/scale}px)`;}
function jump(){if(state.crouching&&isBlocked(playerPos.x,playerPos.z,playerPos.y,world.blockers,.31,actorHeight(player))){toast('There is not enough clearance to jump here.');return;}if(state.driving||state.sitting||state.transition||state.modal||state.gesture||state.phase!=='playing'||!state.grounded)return;state.jumpStarted=elapsed;state.jumpVelocity=4.8;state.grounded=false;state.crouching=false;tone(250,.07,.025);}

async function boot({useBasic=false}={}){
  const profile=deviceProfile(),size=landscapeSize(innerWidth,innerHeight,profile.mobile);
  bindEvents();canvas.tabIndex=0;updateSoundUI();updateProgress();document.body.classList.toggle('reduced-motion',state.reducedMotion);
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:profile.antialias,powerPreference:profile.mobile?'default':'high-performance'});}catch(error){state.loading=false;document.body.classList.remove('preparing');updateReadyControls();$('welcome').hidden=true;$('arrival').hidden=true;$('loading').hidden=true;$('fatal').hidden=false;return;}
  scene=new THREE.Scene();scene.background=new THREE.Color('#c1cfb8');scene.fog=new THREE.Fog('#c1cfb8',60,135);
  camera=new THREE.PerspectiveCamera(48,size.width/size.height,.1,220);
  applyRenderSize(renderer,size.width,size.height,state.quality==='low'?1:profile.pixelRatio);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  sun=new THREE.DirectionalLight('#fff0cf',3.2);sun.position.set(-10,26,17);sun.castShadow=true;sun.shadow.mapSize.set(profile.shadowSize,profile.shadowSize);sun.shadow.camera.left=-40;sun.shadow.camera.right=40;sun.shadow.camera.top=40;sun.shadow.camera.bottom=-40;sun.shadow.camera.far=100;sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;scene.add(sun,sun.target);
  ambient=new THREE.HemisphereLight('#f1f1e3','#697c50',2.8);scene.add(ambient);
  try{const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(room,.04).texture;pmrem.dispose();room.dispose();}catch(error){console.warn('Reflection lighting is unavailable:',error);}
  // Present a graphics frame before waiting for the full-resolution assets.
  renderer.render(scene,camera);
  $('enter-label').textContent='Preparing the house and characters…';
  const progress=createAssetProgress({host:7479832,visitor:8415980,car:116561849},fraction=>{
    $('load-count').textContent=String(Math.round(fraction*100)).padStart(2,'0');$('load-progress').style.transform=`scaleX(${fraction})`;
  });
  const downloads=Array.from({length:3},()=>new AbortController());
  const simpleAsset=()=>{const error=new Error('Simpler models requested.');error.code='simple-models';return Promise.reject(error);};
  const startCharacters=()=>useBasic?simpleAsset():loadCharacterAsset({onProgress:progress.update,signal:downloads[0].signal,maxTextureSize:profile.maxTextureSize,sequential:profile.mobile,initialMotions:['idle','walk','start-walk','drive','exit-car','enter-car','sit','stand','sit-idle','talk','jump','pickup','throw','punch','wave']});
  const startCar=()=>useBasic?simpleAsset():loadImportedVehicle(e=>{progress.update('car',e);if(e.total>0)$('load-car').textContent=e.phase==='prepare'?'Preparing':`${Math.round(e.loaded/e.total*100)}%`;},{signal:downloads[2].signal,maxTextureSize:profile.maxTextureSize,concurrency:profile.mobile?1:2});
  const startHouse=()=>useBasic?simpleAsset():loadEnvironmentAsset(e=>{if(e.total>0)$('load-house').textContent=`${Math.round(e.loaded/e.total*100)}%`;},{signal:downloads[1].signal,maxTextureSize:profile.maxTextureSize});
  const assets=prepareVisitAssets(loadVisitAssets({sequential:profile.mobile,character:startCharacters,vehicle:startCar,environment:startHouse}),statuses=>{
    const [characterStatus,houseStatus,carStatus]=statuses;
    if(houseStatus!=='pending')$('load-house').textContent=houseStatus==='fulfilled'?'Ready':'Simpler house';
    $('load-characters').textContent=characterStatus==='fulfilled'?'Ready':characterStatus==='rejected'?'Simpler models':'Loading';
    if(carStatus!=='pending')$('load-car').textContent=carStatus==='fulfilled'?'Ready':'Simpler car';
    $('loading-status').textContent=characterStatus==='pending'?'Preparing the uploaded character models and motions.':carStatus==='pending'?'Preparing your original Land Cruiser.':houseStatus==='pending'?'Drive ready. House detail continues while you travel.':'Ready to explore.';
  },{readyIndexes:[0,2],cancel:index=>downloads[index].abort()});
  $('basic-visit').hidden=false;$('basic-visit').onclick=()=>assets.useBasic();$('basic-house').onclick=()=>assets.useBasic();$('welcome-basic-house').onclick=()=>assets.useBasic();
  const [characterResult,environmentResult,vehicleResult]=await assets.promise;$('basic-visit').hidden=true;
  state.houseLoading=environmentResult.status==='pending';
  try{if(characterResult.status!=='fulfilled')throw characterResult.reason;const asset=characterResult.value;player=createRiggedCharacter(asset);host=createRiggedCharacter(asset,{host:true});}catch(error){if(error?.code!=='simple-models')console.warn('Character model could not load:',error);player=createCharacter();host=createCharacter({host:true});}
  if(vehicleResult.status==='rejected'&&vehicleResult.reason?.code!=='simple-models')console.warn('Uploaded car could not load:',vehicleResult.reason);
  world=createWorld({vehicle:vehicleResult.status==='fulfilled'?createImportedVehicle(vehicleResult.value):null});
  $('reload-original').hidden=characterResult.status==='fulfilled'&&vehicleResult.status==='fulfilled';
  if(environmentResult.status==='fulfilled'){try{applyEnvironmentAsset(world,environmentResult.value);}catch(error){console.warn('House detail could not be prepared:',error);}}
  else if(environmentResult.status==='rejected'&&environmentResult.reason?.code!=='simple-models')console.warn('House detail could not load:',environmentResult.reason);
  scene.add(world.root);player.position.set(0,.02,18.8);player.rotation.y=Math.PI;player.visible=false;scene.add(player);
  physics=createSandboxPhysics(world);
  world.cameraBlockers=[...world.blockers,...world.physicsFloors.map(f=>({minX:f.x-f.w/2,maxX:f.x+f.w/2,minY:f.y-f.h/2,maxY:f.y+f.h/2,minZ:f.z-f.d/2,maxZ:f.z+f.d/2}))];
  const pathGeometry=new THREE.BufferGeometry();pathGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(32*3),3));
  trajectory=new THREE.Line(pathGeometry,new THREE.LineDashedMaterial({color:'#f5d090',dashSize:.16,gapSize:.14,transparent:true,opacity:.85}));trajectory.frustumCulled=false;trajectory.visible=false;scene.add(trajectory);
  host.position.set(0,.13,7.4);scene.add(host);
  const nameCanvas=document.createElement('canvas');nameCanvas.width=256;nameCanvas.height=96;const ctx=nameCanvas.getContext('2d');ctx.fillStyle='#173b31';ctx.beginPath();ctx.roundRect(4,4,248,88,20);ctx.fill();ctx.fillStyle='#efd4a3';ctx.font='500 25px Arial';ctx.textAlign='center';ctx.fillText('RABIN',128,42);ctx.font='14px Arial';ctx.fillStyle='#dbe3d2';ctx.fillText('YOUR HOST',128,68);
  const nameTexture=new THREE.CanvasTexture(nameCanvas);nameTexture.colorSpace=THREE.SRGBColorSpace;const nameSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:nameTexture,depthTest:true,depthWrite:false}));nameSprite.scale.set(1.3,.48,1);nameSprite.position.y=2.5;host.add(nameSprite);
  host.userData.nameSprite=nameSprite;
  visit=createArrival(world,host);
  host.userData.nameSprite.visible=false;
  const hostRing=new THREE.Mesh(new THREE.RingGeometry(.47,.51,32),new THREE.MeshBasicMaterial({color:'#69bb9a',transparent:true,opacity:.8,side:THREE.DoubleSide}));hostRing.rotation.x=-Math.PI/2;hostRing.position.y=.02;host.add(hostRing);
  $('loading-status').textContent='Preparing the first graphics frame…';setQuality();updateLighting();
  camera.position.set(32,20,37);camera.lookAt(-4.6,1.6,1.8);
  await prepareGraphics(renderer,scene,camera,[player,host]);if(stopped)return;progress.finish();
  state.loading=false;document.body.classList.remove('preparing');setQuality();updateLighting();updateVehicleLights();$('loading').classList.add('is-ready');setTimeout(()=>$('loading').hidden=true,state.reducedMotion?0:700);$('loading-status').textContent=state.houseLoading?'Drive ready. House detail continues while you travel.':world.visuals.applied&&player.userData.rig?'Ready to explore.':'Ready with simpler models. You can still tour and explore.';updateReadyControls();$('replay-entry').hidden=!savedVisit.welcomed;
  warmMotionLibrary(player.userData.rig?.asset.motions);warmMotionLibrary(host.userData.rig?.asset.motions);
  assets.complete.then(([,result])=>finishHouseLoading(result));
  frameRequest=requestAnimationFrame(frame);
}

function finishHouseLoading(result){
  if(!state.houseLoading)return;
  try{
    if(result.status==='fulfilled'){
      applyEnvironmentAsset(world,result.value);physics=createSandboxPhysics(world);physics.relocateCar();
      world.cameraBlockers=[...world.blockers,...world.physicsFloors.map(f=>({minX:f.x-f.w/2,maxX:f.x+f.w/2,minY:f.y-f.h/2,maxY:f.y+f.h/2,minZ:f.z-f.d/2,maxZ:f.z+f.d/2}))];
      visit=createArrival(world,host);setQuality();updateLighting();
    }
  }catch(error){console.warn('House detail could not be prepared:',error);}
  state.houseLoading=false;updateReadyControls();$('basic-house').hidden=true;
  if(state.skipDriveRequested)skipInvitation();else if(state.journey)updateNavigation();
}

function movePlayer(dt){
  if(state.presentation)return 0;
  if(state.gesture)return 0;
  if(state.transition)return updateAction(dt);
  let forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+joystick.y;
  let side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joystick.x;
  forward=clamp(forward,-1,1);side=clamp(side,-1,1);const len=Math.hypot(forward,side);
  if(state.driving){
    if(state.skipDriveRequested){forward=side=0;state.touchBrake=true;}
    const from={x:state.vehicle.x,z:state.vehicle.z,heading:state.vehicle.heading};
    state.vehicle=stepVehicle(state.vehicle,{forward,steer:side,brake:keys.has('Space')||state.touchBrake},dt,world.blockers);
    const v=state.vehicle;state.carSpeed=v.vx*Math.sin(v.heading)+v.vz*Math.cos(v.heading);
    rollVehicleWheels(world.vehicle,from,v,-side*.36);
    updateVehicleRide(v,dt);
    world.car.updateMatrixWorld(true);physics.syncColliders(dt);
    const seat=seatPosition();playerPos={x:seat.x,y:seat.y,z:seat.z};player.rotation.y=v.heading;
    if(v.impact>3){physics.vehicleImpact(v.impact);state.shake=Math.min(v.impact*.035,.3);tone(90,.16,.08);}
    world.vehicle.steering.rotation.z=-side*.42;state.braking=keys.has('Space')||state.touchBrake||forward*state.carSpeed<-.1;world.vehicle.controls?.setSteering(-side*.36);world.vehicle.controls?.setSpeed(state.carSpeed);
    if(elapsed>state.lookUntil&&Math.abs(state.carSpeed)>.8)yaw=angleLerp(yaw,v.heading+Math.PI,1-Math.exp(-3*dt));
    if(state.race&&!state.race.finished&&passedCheckpoint(from,v,world.checkpoints[state.race.checkpoint])){
      state.race.checkpoint++;tone(660,.1);
      if(state.race.checkpoint===world.checkpoints.length){
        state.race.finished=true;world.raceGate.visible=false;
        const r=state.race;if(!r.best||r.time<r.best){r.best=r.time;try{localStorage.setItem('rabin-house-lap',String(r.time));}catch{}}
        toast(`Lap complete · ${r.time.toFixed(1)}s · best ${r.best.toFixed(1)}s. R to try again.`,5500);
      }else{updateRaceGate();toast(`Gate ${state.race.checkpoint} / ${world.checkpoints.length}`,1200);}
    }
    return 0;
  }
  if(len>1){forward/=len;side/=len;}
  if(state.sitting){if(state.seatTarget){const seat=chairPose(player,state.seatTarget).root;playerPos={x:seat.x,y:seat.y,z:seat.z};}if(len>.1)standUp();return 0;}
  const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight')||state.touchRun;
  state.running=sprint&&len>.1&&!state.crouching&&!state.aiming;
  const speed=state.crouching?1.25:state.aiming?1.6:sprint?4.6:2.2;
  const acceleration=1-Math.exp(-(len>.05?10:15)*dt);
  // Keep one input basis until the stick/keys are released. Following the new
  // facing direction every frame would make a held sideways input spiral.
  if(len>.05)movementYaw??=yaw;else movementYaw=null;
  const inputYaw=state.aiming||state.charging?yaw:movementYaw??yaw;
  state.moveVX+=((-Math.sin(inputYaw)*forward+Math.cos(inputYaw)*side)*speed-state.moveVX)*acceleration;
  state.moveVZ+=((-Math.cos(inputYaw)*forward-Math.sin(inputYaw)*side)*speed-state.moveVZ)*acceleration;
  const dx=state.moveVX*dt,dz=state.moveVZ*dt,previous={...playerPos};
  physics.nudgeFurniture(playerPos,{x:state.moveVX,z:state.moveVZ},dt);
  const hostBlocker={...world.hostBlocker,...actorBlocker(host.position,HOST_RADIUS),maxY:host.position.y+actorHeight(host)};
  playerPos=moveWithCollisions(playerPos,dx,dz,[...world.blockers,hostBlocker],VISITOR_RADIUS,state.crouching?CROUCH_HEIGHT:actorHeight(player));
  if(Math.abs(playerPos.x-previous.x)<Math.abs(dx)*.3)state.moveVX=0;
  if(Math.abs(playerPos.z-previous.z)<Math.abs(dz)*.3)state.moveVZ=0;
  const support=supportHeight(playerPos,world.blockers);
  if(state.grounded&&support-playerPos.y<=.4 && support-playerPos.y>=-.45)playerPos.y=support;
  else if(state.grounded)state.grounded=false;
  if(!state.grounded){const height=state.crouching?CROUCH_HEIGHT:actorHeight(player),ceiling=ceilingHeight(playerPos,world.cameraBlockers,height);state.jumpVelocity-=9.82*dt;playerPos.y+=state.jumpVelocity*dt;if(state.jumpVelocity>0&&playerPos.y+height>ceiling){playerPos.y=ceiling-height;state.jumpVelocity=0;}if(playerPos.y<=support){playerPos.y=support;state.jumpVelocity=0;state.grounded=true;}}
  if(playerPos.x>2.3&&playerPos.x<12&&playerPos.z<1.7&&playerPos.z>-10&&previous.y<2.6&&playerPos.y>(3.38-(state.crouching?CROUCH_HEIGHT:actorHeight(player)))&&state.jumpVelocity>0){playerPos.y=3.38-(state.crouching?CROUCH_HEIGHT:actorHeight(player));state.jumpVelocity=0;}
  const travelled=Math.hypot(playerPos.x-previous.x,playerPos.z-previous.z);
  if(state.grounded&&travelled>.002){footstepTravel+=travelled;if(footstepTravel>(sprint?.85:.65)){footstepTravel=0;footstepSound(surfaceAt(playerPos.x,playerPos.z,playerPos.y));}}else if(!state.grounded)footstepTravel=0;
  if(state.aiming||state.charging||state.punch)player.rotation.y=angleLerp(player.rotation.y,yaw+Math.PI,1-Math.exp(-18*dt));
  else if(travelled>.001)player.rotation.y=angleLerp(player.rotation.y,Math.atan2(dx,dz),1-Math.exp(-14*dt));
  yaw=player.rotation.y-Math.PI;
  return travelled/dt;
}

function footstepSound(surface){
  if(!state.sound||state.volume===0)return;
  try{
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const duration=.1,buffer=audioContext.createBuffer(1,Math.ceil(audioContext.sampleRate*duration),audioContext.sampleRate),samples=buffer.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/samples.length*8);
    const source=audioContext.createBufferSource(),filter=audioContext.createBiquadFilter(),gain=audioContext.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=surface==='grass'?450:surface==='wood'?1100:1900;gain.gain.value=(surface==='grass'?.05:.085)*state.volume*(state.crouching?.5:1);source.connect(filter);filter.connect(gain);gain.connect(audioContext.destination);source.start();
  }catch{}
}

function updateVehicleRide(vehicle,dt){
  const c=Math.cos(vehicle.heading),s=Math.sin(vehicle.heading),heights=world.carWheels.map(w=>{
    const p=w.localPosition,x=vehicle.x+p.x*c+p.z*s,z=vehicle.z-p.x*s+p.z*c;return floorAt(x,z,0);
  });
  const average=heights.reduce((a,b)=>a+b,0)/heights.length,front=heights.filter((_,i)=>world.carWheels[i].front),rear=heights.filter((_,i)=>!world.carWheels[i].front),right=heights.filter((_,i)=>world.carWheels[i].side>0),left=heights.filter((_,i)=>world.carWheels[i].side<0),mean=a=>a.reduce((n,v)=>n+v,0)/a.length;
  const blend=1-Math.exp(-12*dt);world.car.position.x=vehicle.x;world.car.position.z=vehicle.z;world.car.position.y+=(average-world.car.position.y)*blend;
  const pitch=-Math.atan2(mean(front)-mean(rear),world.vehicle.bounds.wheelbase),roll=Math.atan2(mean(right)-mean(left),world.vehicle.bounds.track);
  world.car.rotation.set(THREE.MathUtils.lerp(world.car.rotation.x,pitch,blend),vehicle.heading,THREE.MathUtils.lerp(world.car.rotation.z,roll,blend),'YXZ');
  alignVehicleWheels(world.vehicle,(x,z)=>floorAt(x,z,world.car.position.y));
}

function moveHost(dt){
  if(state.presentation)return 0;
  if(visit.progress.stage!=='welcomed'){const speed=visit.update(dt,playerPos);host.userData.nameSprite.visible=visit.progress.stage==='invited';updateVisitUI();return speed;}
  if(state.gesture)return 0;
  if(!state.guide&&state.hostReturnRoute.length){
    if(!$('dialogue').hidden)return 0;
    const [x,z]=state.hostReturnRoute[0],result=walkArrivalRoute(host.position,{x,z},dt,[...world.blockers,actorBlocker(playerPos,VISITOR_RADIUS)],2.15,HOST_RADIUS);
    host.position.set(result.position.x,result.position.y,result.position.z);if(result.speed>.01)host.rotation.y=angleLerp(host.rotation.y,Math.atan2(x-host.position.x,z-host.position.z),1-Math.exp(-10*dt));if(result.done)state.hostReturnRoute.shift();return result.speed;
  }
  let speed=0;
  if(state.guide&&state.guideRoute.length){
    const waiting=guideShouldWait(host.position,playerPos);
    if(waiting!==state.guidePausedByDistance){state.guidePausedByDistance=waiting;updateGuideUI();updateVisitUI(true);if(waiting)toast('Rabin is waiting. Catch up to continue the tour.',4000);}
    if(waiting||!$('dialogue').hidden)return 0;
    const [x,z]=state.guideRoute[0],dx=x-host.position.x,dz=z-host.position.z,dist=Math.hypot(dx,dz),step=Math.min(dist,2.15*dt);
    for(const door of world.doors)if(!door.open&&Math.hypot(door.x-host.position.x,door.z-host.position.z)<2.1){door.open=true;door.blocker.active=false;}
    if(dist<.09)state.guideRoute.shift();else{
      const next=moveWithCollisions(host.position,dx/dist*step,dz/dist*step,[...world.blockers,actorBlocker(playerPos,VISITOR_RADIUS)],HOST_RADIUS);next.y=floorAt(next.x,next.z,host.position.y);
      speed=Math.hypot(next.x-host.position.x,next.z-host.position.z)/dt;host.position.set(next.x,next.y,next.z);host.rotation.y=angleLerp(host.rotation.y,Math.atan2(dx,dz),1-Math.exp(-10*dt));
      if(speed<.03){guideBlockedTime+=dt;if(guideBlockedTime>2.5&&guideBlockedTime-dt<=2.5)toast('Leave Rabin’s path clear. Repair & reset can restore displaced furniture.',5000);}else guideBlockedTime=0;
    }
    if(!state.guideRoute.length){state.guideWaiting=true;state.guidePausedByDistance=false;updateVisitUI(true);}
  }
  if(state.guide&&state.guideWaiting&&horizontalDistance(playerPos,host.position)<3.6&&Math.abs(playerPos.y-host.position.y)<1&&$('dialogue').hidden){
    state.guideWaiting=false;showChapter(CHAPTERS[state.chapter]);
    if(state.presentation)return 0;
  }
  if(speed<.1&&horizontalDistance(playerPos,host.position)<7)host.rotation.y=angleLerp(host.rotation.y,Math.atan2(playerPos.x-host.position.x,playerPos.z-host.position.z),dt*4);
  return speed;
}

function updateInteraction(){
  state.near=null;
  if(state.presentation){$('interact').hidden=true;return;}
  if(state.transition){$('interact').hidden=true;return;}
  if(state.gesture){$('interact').hidden=false;$('interact-label').textContent='Stop '+state.gesture.label+' preview';return;}
  if(state.driving){$('interact').hidden=state.houseLoading||!!state.journey&&!state.journey.arrived;$('interact-label').textContent=Math.hypot(state.vehicle.vx,state.vehicle.vz)>=.5?'Brake before getting out':'Get out of the car';return;}
  if(state.sitting){$('interact').hidden=false;$('interact-label').textContent='Stand up';return;}
  const stage=visit.progress.stage;
  const options=world.interactions.filter(i=>!(i.action==='door'&&i.doorId==='front'&&stage!=='welcomed')&&!(i.action==='doorbell'&&['invited','greeting','welcomed'].includes(stage))).map(i=>({...i}));
  if(['invited','welcomed'].includes(stage))options.push({id:'host',action:'host',label:stage==='invited'?'Greet Rabin':'Talk to Rabin',x:host.position.x,y:host.position.y,z:host.position.z,radius:2.6});
  for(const i of options)if(i.action==='doorbell'&&stage!=='arrived')i.label='Rabin is coming · leave the doorway clear';
  for(const i of options)if(i.seat){const p=i.seat.mesh.localToWorld(new THREE.Vector3(...i.seat.approach));i.x=p.x;i.y=i.seat.mesh.position.y;i.z=p.z;}
  const car=options.find(i=>i.id==='car');car.x=world.car.position.x;car.y=world.car.position.y;car.z=world.car.position.z;
  for(const i of options)if(i.vehicleLocal){const p=world.car.localToWorld(new THREE.Vector3(...i.vehicleLocal));i.x=p.x;i.y=p.y;i.z=p.z;}
  for(const i of options){if(i.action==='door'){const door=world.doors.find(d=>d.id===i.doorId);i.label=`${door.open?'Close':'Open'} the ${door.label}`;}}
  if(!state.held)for(const toy of physics.toys){if(!toy.holdable||toy.held||toy.broken||toy.body.velocity.length()>3)continue;const p=toy.mesh.position;options.push({id:toy.id,action:'pickup',label:`Pick up the ${toy.label}`,x:p.x,y:Math.max(.02,p.y-(toy.radius??.45)),z:p.z,radius:1.7,toy});}
  state.near=chooseInteraction(playerPos,yaw+Math.PI,options,world.blockers);
  $('interact').hidden=!state.near||state.modal;if(state.near)$('interact-label').textContent=state.near.label;
  $('touch-use').hidden=!state.near;paintTouchControls(document,state);
}

function updateSandbox(dt){
  const basketball=physics.toys.find(t=>t.id==='basketball'),beforeBall={...basketball.mesh.position};
  physics.step(dt,{...playerPos,driving:state.driving,crouching:state.crouching,height:actorHeight(player)},{x:world.car.position.x,y:world.car.position.y,z:world.car.position.z,heading:world.car.rotation.y,quaternion:world.car.getWorldQuaternion(new THREE.Quaternion())},{...host.position,height:actorHeight(host)});
  for(const event of physics.drainEvents()){if(event.type==='break'){impactSound(event.material);toast(`${event.label} broke. Repair & reset is available in settings.`,2300);}else if(event.type==='crack'){impactSound('glass');toast('The glass cracked and stays mounted.',1800);}else if(event.type==='water')tone(180,.16,.035);else if(event.type==='impact')tone(event.material==='ball'?130:80,.075,.025);}
  updatePunch(dt);
  if(state.held){
    const hand=handPosition(player);
    physics.carry(state.held,hand,player.quaternion,{x:playerPos.x,y:playerPos.y+1.12,z:playerPos.z});
  }
  const ball=physics.toys.find(t=>t.id==='basketball'),p=ball.mesh.position;
  if(ball.flight&&ball.body.velocity.y<0&&scoredBasket(beforeBall,p,world.hoop)){
    ball.flight=false;state.baskets++;tone(780,.28);toast(`Basket! ${state.baskets} scored from ${state.throws} throws.`,3500);world.rim.material.emissive.set('#e8b763');world.rim.material.emissiveIntensity=1.5;state.rimFlash=elapsed+.5;
  }
  if(elapsed>(state.rimFlash??0))world.rim.material.emissiveIntensity=0;
  for(const toy of physics.toys){
    if(toy.kind==='pin'&&!toy.held&&!state.knockedPins.has(toy.id)){
      const upright=new THREE.Vector3(0,1,0).applyQuaternion(toy.mesh.quaternion).y;
      if(upright<.5){state.knockedPins.add(toy.id);tone(400,.08);if(state.knockedPins.size===6)toast('All six pins down! Use the reset marker to play again.',4000);}
    }
  }
  if(state.race&&!state.race.finished)state.race.time+=dt;
  updateActivityHUD();updateTrajectory();
}
function updateActivityHUD(){
  const badge=$('game-badge');let text='';
  if(state.gesture){const g=state.gesture;text=`<span class="tiny-label">${g.actor==='host'?'RABIN':'VISITOR'} · GESTURE PREVIEW</span><strong>${g.label}</strong><span class="activity-detail">${Math.max(0,g.duration-g.time).toFixed(1)}s remaining${state.guide?' · tour paused':''}</span>`;}
  else if(state.driving){
    const r=state.race;const lap=state.journey?'<span class="activity-detail">W/S drive · A/D steer<br>SPACE brake · H horn</span>':r?`<span class="activity-detail">${r.finished?'Lap complete':`Gate ${r.checkpoint+1} / 8`} · ${r.time.toFixed(1)}s${r.best?` · Best ${r.best.toFixed(1)}s`:''}</span>`:'<span class="activity-detail">SPACE handbrake · H horn · R timed lap</span>';
    text=`<span class="tiny-label">${state.journey?'THE ARRIVAL':'GARDEN DRIVE'}</span><strong>${Math.round(Math.hypot(state.vehicle.vx,state.vehicle.vz)*3.6)} <small>km/h</small></strong>${lap}`;
  }else if(state.held){
    const power=state.charging?clamp((elapsed-state.chargeStart)/1.1,0,1):0;
    text=`<span class="tiny-label">CARRYING · ${state.held.label.toUpperCase()}</span><span class="activity-detail">${state.aiming?'Aiming · ':''}Hold click / J, release to throw<br>Right mouse / AIM: aim · Q: drop</span>${state.charging?`<div class="throw-meter"><i style="width:${power*100}%"></i></div><small>${Math.round(power*100)}% power</small>`:''}`;
  }else if(playerPos.x<-13&&playerPos.z<0){text=`<span class="tiny-label">COURTYARD BASKETBALL</span><strong>${state.baskets} <small>baskets / ${state.throws} throws</small></strong><span class="activity-detail">E: pick up ball · aim toward the hoop</span>`;}
  else if(playerPos.x>13&&playerPos.z<-5){text=`<span class="tiny-label">GARDEN BOWLING</span><strong>${state.knockedPins.size} / 6 <small>pins down</small></strong><span class="activity-detail">Pick up the blue ball · aim · throw<br>Reset marker is beside the lane</span>`;}
  else if(playerPos.x>13&&playerPos.z<5){text=`<span class="tiny-label">TRAINING CORNER</span><strong>${state.bagHits} <small>bag hits</small></strong><span class="activity-detail">Click / J · punch, punch, kick</span>`;}
  badge.hidden=!text;if(text)badge.innerHTML=text;
  $('gesture-stop').hidden=!state.gesture;
  const driving=state.driving,blocked=!!state.gesture||!!state.transition;
  $('touch-use').setAttribute('aria-label',state.gesture?'Stop the gesture preview':driving?'Exit the stopped car':state.sitting?'Stand up':state.near?.label??'Interact with the nearest object');
  $('touch-use').hidden=driving?(state.houseLoading||Math.hypot(state.vehicle.vx,state.vehicle.vz)>=.5||!!state.journey&&!state.journey.arrived):!state.gesture&&!state.sitting&&!state.near;
  $('touch-use').disabled=!!state.transition;
  for(const id of ['touch-run','touch-jump','touch-drop','touch-aim','touch-action'])$(id).disabled=blocked;
  $('touch-jump').hidden=driving||state.sitting;
  $('touch-run').hidden=state.sitting;
  $('touch-aim').hidden=driving||!state.held;
  $('touch-drop').hidden=driving?!!state.journey:!state.held;
  $('touch-action').hidden=state.sitting;
  $('reticle').hidden=!state.aiming&&!mouseCaptured;
  $('reticle').classList.toggle('aiming',state.aiming);
  $('touch-run').setAttribute('aria-label',driving?'Hold to brake':'Hold to run');$('touch-action').setAttribute('aria-label',driving?'Sound the car horn':state.held?'Hold and release to throw':'Punch or kick');
  $('touch-aim').setAttribute('aria-pressed',String(state.aiming));
  paintTouchControls(document,state);
  const mode=state.gesture?'gesture':driving?'driving':state.sitting?'seated':state.held?'carrying':'walking';
  const hints=$('controls-hint');if(hints.dataset.mode!==mode){hints.dataset.mode=mode;const lines=mode==='driving'?[['W / S','drive'],['A / D','steer'],['SPACE','brake'],['E / F','exit'],['H','horn']]:mode==='seated'?[['E','stand up'],['MOUSE','look']]:mode==='gesture'?[['E','stop preview']]:mode==='carrying'?[['WASD','move'],['RIGHT CLICK','aim'],['J / CLICK','hold & throw'],['Q','drop']]:[['WASD','move'],['MOUSE','look'],['SHIFT','run'],['E','use'],['SPACE','jump'],['F','car']];hints.innerHTML=lines.map(([key,label])=>'<span><kbd>'+key+'</kbd> '+label+'</span>').join('')+'<span><kbd>ESC</kbd> pause</span>';}
}
function updateNavigation(){
  const active=!!state.journey;$('journey').hidden=!active;document.body.classList.toggle('arriving',active);if(!active)return;
  const nav=journeyDirections(world.car.position),speed=Math.hypot(state.vehicle.vx,state.vehicle.vz);
  if(state.invitation.progress.stage!=='exiting'){
    const stopped=nav.parked&&speed<.5;
    if(stopped!==state.journey.arrived){state.journey.arrived=stopped;if(stopped){state.invitation.arrive();toast(state.houseLoading?'You’re at the house. The finishing detail is still loading.':'You’re at Rabin’s house. Press E to step out.',5000);}else state.invitation.depart();updateVisitUI(true);}
  }
  const arrived=state.journey.arrived;$('journey-distance').textContent=state.skipDriveRequested?'Preparing the house…':arrived?'You’ve arrived':`${Math.round(nav.remaining)} m to Rabin’s house`;
  const turn=Math.atan2(Math.sin(nav.heading-world.car.rotation.y),Math.cos(nav.heading-world.car.rotation.y));
  $('journey-turn').style.transform=`rotate(${turn}rad)`;$('journey-turn').hidden=arrived;
  $('journey-tip').textContent=state.houseLoading&&(arrived||state.skipDriveRequested)?'House detail is loading. Use the simpler house to enter now.':arrived?'E · Get out, then ring the doorbell':nav.parked?'Hold the brake to park':nav.offRoad?'Return to the marked road':Math.abs(turn)>.4?`Follow the bend ${turn>0?'right':'left'}`:'Follow the road · Space to brake';
  $('skip-drive').hidden=arrived||state.skipDriveRequested;
  $('basic-house').hidden=!(state.houseLoading&&(arrived||state.skipDriveRequested));
}
function updateTrajectory(){
  trajectory.visible=!!state.held&&state.aiming;
  if(!trajectory.visible)return;
  const power=state.charging?clamp((elapsed-state.chargeStart)/1.1,.12,1):.4,v=throwVelocity(state.held,power),from=state.held.mesh.position,positions=trajectory.geometry.attributes.position;
  let count=32;
  for(let i=0;i<32;i++){
    const t=i*.085,x=from.x+v.x*t,y=from.y+v.y*t-4.91*t*t,z=from.z+v.z*t;
    positions.setXYZ(i,x,Math.max(.08,y),z);
    if(i>0){const previous=new THREE.Vector3().fromBufferAttribute(positions,i-1),hit=physics.trace(previous,{x,y,z},1|8|2);if(hit){positions.setXYZ(i,hit.point.x,hit.point.y,hit.point.z);count=i+1;break;}}
    if(y<.08){count=i+1;break;}
  }
  trajectory.geometry.setDrawRange(0,count);positions.needsUpdate=true;trajectory.computeLineDistances();
}
function updateDoors(dt){
  const lerp=1-Math.exp(-9*dt);
  const actors=[playerPos,host.position];
  for(const door of [...world.doors,...world.carDoors]){
    const angle=THREE.MathUtils.lerp(door.group.rotation.y,door.open?door.angle:0,lerp);
    const protectedActors=world.carDoors.includes(door)&&(state.driving||state.transition?.type.includes('car'))?[host.position]:actors;
    if(physics.canMoveDoor(door,angle,protectedActors))door.group.rotation.y=angle;
  }
  physics.syncColliders(dt);
}

function followCamera(dt){
  const indoor=Math.abs(playerPos.x)<12.1&&playerPos.z>=-10&&playerPos.z<=9.5;
  const action=state.transition,progress=action?clamp(action.time/action.duration,0,1):0;
  const vehicleBlend=action?.type.includes('car')?carCameraBlend(action.type,progress):state.driving?1:0;
  const footDistance=state.aiming?2.6:indoor?Math.min(cameraDistance,4.6):cameraDistance;
  const dist=THREE.MathUtils.lerp(footDistance,clamp(cameraDistance+1.9,4.8,9.2),vehicleBlend);
  const shoulder=state.aiming?.5:0,tilt=.2+pitch*.85;
  cameraTarget.copy(characterCameraTarget(player,{sitting:state.sitting,crouching:state.crouching})).lerp(carLocal(...(world.vehicle.cameraTargetLocal??new THREE.Vector3(0,1.15,-.4)).toArray()),vehicleBlend);
  if(action?.type==='enter-car')yaw=angleLerp(yaw,world.car.rotation.y+Math.PI,1-Math.exp(-4*dt*vehicleBlend));
  if(vehicleBlend){const rear=world.car.rotation.y+Math.PI,offset=Math.atan2(Math.sin(yaw-rear),Math.cos(yaw-rear));yaw=rear+clamp(offset,-.5,.5);}else yaw=player.rotation.y-Math.PI;
  if(action?.type==='sit')pitch+=(.03-pitch)*(1-Math.exp(-4*dt));
  cameraDesired.set(cameraTarget.x+Math.sin(yaw)*dist*Math.cos(tilt)+Math.cos(yaw)*shoulder,cameraTarget.y+dist*Math.sin(tilt),cameraTarget.z+Math.cos(yaw)*dist*Math.cos(tilt)-Math.sin(yaw)*shoulder);
  cameraDesired.y=Math.max(cameraDesired.y,floorAt(cameraDesired.x,cameraDesired.z)+.28);
  if(state.aiming){cameraTarget.x+=Math.cos(yaw)*shoulder;cameraTarget.z-=Math.sin(yaw)*shoulder;}
  const options={driving:state.driving||!!state.transition?.type.includes('car')};
  const resolve=(from,to)=>vehicleBlend?resolveCamera(from,cameraTarget,to,world.cameraBlockers,dt,options):resolveVisitorCamera(from,cameraTarget,to,player.rotation.y,world.cameraBlockers,dt,options);
  camera.position.copy(resolve(camera.position,cameraDesired));lookTarget.lerp(cameraTarget,1-Math.exp(-14*dt));
  if(state.shake>.002&&!state.reducedMotion){cameraDesired.copy(camera.position);cameraDesired.x+=Math.sin(elapsed*75)*state.shake;cameraDesired.y+=Math.cos(elapsed*88)*state.shake*.5;camera.position.copy(resolve(camera.position,cameraDesired));}state.shake*=Math.exp(-12*dt);camera.lookAt(lookTarget);
  const fov=state.aiming?44:THREE.MathUtils.lerp(48,52+(state.reducedMotion?0:Math.min(Math.abs(state.carSpeed),12)*.45),vehicleBlend);camera.fov+=(fov-camera.fov)*(1-Math.exp(-7*dt));camera.updateProjectionMatrix();
  // The solid roof becomes a cutaway while the visitor is indoors.
  world.roof.forEach(r=>r.visible=!indoor);
}

function drawMinimap(){
  const c=$('minimap').getContext('2d'),w=320,h=320,wide=!!state.journey||state.phase==='invitation'||playerPos.z>31;const mx=x=>wide?(x+55)/110*w:(x+27)/54*w,mz=z=>wide?(z+25)/110*h:(z+25)/57*h;
  c.clearRect(0,0,w,h);c.fillStyle='#4b655080';c.fillRect(0,0,w,h);
  if(wide){c.strokeStyle='#697664';c.lineWidth=18;c.lineJoin='round';c.beginPath();ROAD_SAMPLES.forEach((p,i)=>i?c.lineTo(mx(p.x),mz(p.z)):c.moveTo(mx(p.x),mz(p.z)));c.stroke();c.strokeStyle='#ebc17f';c.lineWidth=2;c.stroke();c.fillStyle='#f7d19b';c.beginPath();c.arc(mx(18),mz(18),5,0,Math.PI*2);c.fill();}
  c.fillStyle='#c7c7ab';c.fillRect(mx(-12),mz(-10),mx(12)-mx(-12),mz(9)-mz(-10));c.fillStyle='#d4d0b4';c.fillRect(mx(-1.8),mz(-10),mx(1.8)-mx(-1.8),mz(9)-mz(-10));
  c.strokeStyle='#244337';c.lineWidth=3;c.strokeRect(mx(-12),mz(-10),mx(12)-mx(-12),mz(9)-mz(-10));
  for(const x of [-2,2]){for(const [a,b] of [[-10,-6],[-3,2.4],[5.6,9]]){c.beginPath();c.moveTo(mx(x),mz(a));c.lineTo(mx(x),mz(b));c.stroke();}}
  for(const [a,b] of [[-12,-2],[2,12]]){c.beginPath();c.moveTo(mx(a),mz(0));c.lineTo(mx(b),mz(0));c.stroke();}
  c.fillStyle='#e4d9b1';c.fillRect(mx(-10),mz(-20),mx(10)-mx(-10),mz(-10)-mz(-20));c.fillStyle='#889b7a';c.fillRect(mx(-24),mz(-17),mx(-14)-mx(-24),mz(-3)-mz(-17));
  c.fillStyle='#86b7bc';c.fillRect(mx(world.pool.minX),mz(world.pool.minZ),mx(world.pool.maxX)-mx(world.pool.minX),mz(world.pool.maxZ)-mz(world.pool.minZ));
  c.font='12px Arial';c.fillStyle='#254232';c.textAlign='center';for(const [s,x,z] of [['STUDY',-7,-5],['WORK',7,-5],['LIVING',-7,4],['PLAY',7,4],['TERRACE',0,-16]])c.fillText(s,mx(x),mz(z));
  if(state.guide&&state.guideRoute.length){c.strokeStyle='#83d7b5';c.setLineDash([4,5]);c.beginPath();c.moveTo(mx(host.position.x),mz(host.position.z));for(const [x,z] of state.guideRoute)c.lineTo(mx(x),mz(z));c.stroke();c.setLineDash([]);}
  c.fillStyle='#90aabd';c.fillRect(mx(world.car.position.x)-4,mz(world.car.position.z)-6,8,12);
  if(state.race&&!state.race.finished){const p=world.checkpoints[state.race.checkpoint];c.strokeStyle='#9cdaa0';c.lineWidth=2;c.beginPath();c.arc(mx(p.x),mz(p.z),10,0,Math.PI*2);c.stroke();}
  c.fillStyle='#6fe5bd';c.beginPath();c.arc(mx(host.position.x),mz(host.position.z),5,0,Math.PI*2);c.fill();
  c.save();c.translate(mx(playerPos.x),mz(playerPos.z));c.rotate(-player.rotation.y);c.fillStyle='#ffe3a8';c.beginPath();c.moveTo(0,8);c.lineTo(-6,-5);c.lineTo(6,-5);c.closePath();c.fill();c.restore();
}

function frame(time){
  if(stopped)return;frameRequest=requestAnimationFrame(frame);const dt=Math.max(.001,Math.min((time-previousTime)/1000,.035));previousTime=time;elapsed+=dt;
  const shadowCenter=state.journey||state.phase==='invitation'?world.car.position:new THREE.Vector3();sun.target.position.set(shadowCenter.x,0,shadowCenter.z);sun.position.set(shadowCenter.x-10,26,shadowCenter.z+17);
  if(state.phase==='welcome'){
    const drift=state.reducedMotion?0:Math.sin(elapsed*.08)*1.5;camera.position.set(32+drift,20,37);camera.lookAt(-4.6,1.6,1.8);world.roof.forEach(r=>r.visible=true);animateCharacter(host,elapsed,0,true);
  }else if(state.phase==='invitation'&&!state.modal){
    parkVisitor();animateCharacter(host,elapsed,0);camera.position.copy(carLocal(4.6,2.35,4.8));camera.lookAt(world.car.position.x,world.car.position.y+1.1,world.car.position.z);world.roof.forEach(r=>r.visible=true);drawMinimap();
    if(state.invitation.progress.stage==='ringing'&&elapsed-invitationRingAt>2.5){invitationRingAt=elapsed;tone(620,.15);}
    physics.step(dt,null,null,host.position);
  }else if(state.phase==='approach'&&!state.modal){
    updateGreetingApproach(dt);updateSandbox(dt);followCamera(dt);drawMinimap();
  }else if(state.phase==='greeting'&&!state.modal){
    cinematicTime+=dt;
    if(!animateHandshake(host,player,cinematicTime)){animateCharacter(host,elapsed);animateCharacter(player,elapsed);animateFallbackHandshake(host,player,cinematicTime);}
    followCamera(dt);
    if(cinematicTime>=arrivalLayout.duration)finishArrival();
  }else if(state.presentation&&!state.modal){
    updatePresentation(dt);
  }else if(state.phase==='playing'&&!state.modal){
    const speed=movePlayer(dt),hostSpeed=moveHost(dt);
    if(state.presentation)updatePresentation(0);else{
    player.position.set(playerPos.x,playerPos.y,playerPos.z);
    const action=state.transition,a=state.punch,progress=a?clamp(a.time/a.duration,0,1):0;
    player.scale.y=1;
    const pose={crouching:state.crouching,running:state.running,carry:!!state.held,twoHands:state.held?.kind==='crate',driving:state.driving,airborne:!state.grounded&&!state.transition&&!state.driving};
    if(action)pose.action={type:action.type,progress:clamp(action.time/action.duration,0,1)};
    if(state.jumpStarted!==null&&state.jumpStarted!==undefined&&elapsed-state.jumpStarted<1)pose.jumpProgress=clamp((elapsed-state.jumpStarted),0,1);
    if(state.driving||action?.type.includes('car')){const driver=driverPose(player,world.vehicle);pose.seatHipTarget=driver.hip;pose.seatBlend=action?.type==='enter-car'?THREE.MathUtils.smoothstep(pose.action.progress,.68,1):action?.type==='exit-car'?1-THREE.MathUtils.smoothstep(pose.action.progress,0,.22):1;pose.steeringTargets=driver.steeringTargets;pose.pedalTargets=driver.pedalTargets;}
    if(state.seatTarget&&(state.sitting||action?.type==='sit')){const seated=chairPose(player,state.seatTarget);pose.seatHipTarget=seated.hip;pose.seatFootTargets=seated.feet;pose.seatBlend=action?.type==='sit'?THREE.MathUtils.smoothstep(pose.action.progress,.45,1):action?.type==='stand'?1-THREE.MathUtils.smoothstep(pose.action.progress,0,.65):1;pose.seatFootBlend=action?.type==='sit'?THREE.MathUtils.smoothstep(pose.action.progress,.25,.5):action?.type==='stand'?1-THREE.MathUtils.smoothstep(pose.action.progress,.65,.88):1;}
    const hostPose={talking:!$('dialogue').hidden&&hostSpeed<.1};
    if(state.gesture){
      const gesture=state.gesture;gesture.time+=dt;
      if(gesture.time>=gesture.duration)stopGesture({notice:state.guide?'Gesture finished. Your tour continues.':'Gesture finished. Make yourself at home.'});
      else (gesture.actor==='host'?hostPose:pose).preview={id:gesture.id,time:gesture.time};
    }
    if(action&&['door','doorbell','pickup','inspect'].includes(action.type))pose.reach=Math.sin(Math.PI*action.time/action.duration);
    if(a){if(a.type==='kick')pose.kick=progress;else if(a.type==='throw')pose.throwProgress=progress;else pose.punch={side:a.side,progress};}
    animateCharacter(player,elapsed,speed,!pose.preview&&elapsed<state.waveUntil,state.sitting||state.driving,pose);animateCharacter(host,elapsed,hostSpeed,false,false,hostPose);
    updateSandbox(dt);followCamera(dt);updateNavigation();updateInteraction();
    const room=roomAt(playerPos.x,playerPos.z,playerPos.y);if(room.name!==lastRoom){lastRoom=room.name;$('room-name').textContent=room.name;$('brand-room').textContent=room.name;$('room-hint').textContent=room.hint;}
    if((mapTick+=dt)>.1){mapTick=0;drawMinimap();}
    }
  }
  if(state.phase==='welcome')physics.step(dt,null,null);
  if(state.phase==='greeting'&&!state.modal)physics.step(dt,playerPos,null,host.position);
  if(!state.modal&&!state.presentation)updateDoors(dt);
  updateVehicleLights();world.vehicle.updateParts?.(state.modal||state.presentation?0:dt);
  const sceneTime=state.presentation?.story.time??elapsed;if(!state.reducedMotion)world.fireGroup.children.forEach((f,i)=>f.scale.y=.28+Math.sin(sceneTime*8+i)*.05);
  renderer.render(scene,camera);
}

function pauseAfterError(){stopped=true;if(state.presentation)finishPresentation();if(frameRequest!==null)cancelAnimationFrame(frameRequest);clearTimeout(resizeTimer);state.modal=true;clearInput();renderer?.dispose?.();}
export {boot,portfolioModal,pauseAfterError};
