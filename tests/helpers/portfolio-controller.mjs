import {readFileSync} from 'node:fs';
import * as THREE from '../../public/portfolio-game/vendor/three.module.js';
import {createWorld,createCharacter} from '../../public/portfolio-game/world.js';
import {createSandboxPhysics} from '../../public/portfolio-game/physics.js';
import {PROGRESS_KEY} from '../../public/portfolio-game/story.js';

// A small DOM fixture tests controller callbacks; it does not render or emulate a browser.
class Element {
  constructor(doc,tag){this.doc=doc;this.tag=tag;this.children=[];this.parentElement=null;this.attributes={};this.style={};this.events={};this.hidden=false;this.disabled=false;this.dataset={};}
  get id(){return this.attributes.id??'';}
  get className(){return this.attributes.class??'';}
  set className(value){this.attributes.class=value;}
  get classList(){const self=this;return {add(...names){self.className=[...new Set([...self.className.split(/\s+/).filter(Boolean),...names])].join(' ');},remove(...names){self.className=self.className.split(/\s+/).filter(n=>!names.includes(n)).join(' ');},toggle(name,force){const on=force??!self.className.split(/\s+/).includes(name);this[on?'add':'remove'](name);return on;}};}
  get isConnected(){let node=this;while(node){if(node===this.doc.root)return true;node=node.parentElement;}return false;}
  setAttribute(name,value){this.attributes[name]=String(value);if(name==='id')this.doc.ids.set(String(value),this);if(name==='hidden')this.hidden=true;if(name==='disabled')this.disabled=true;if(name==='value')this.value=String(value);if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);}
  addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
  append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
  replaceChildren(...nodes){const remove=node=>{if(node.id&&this.doc.ids.get(node.id)===node)this.doc.ids.delete(node.id);for(const child of node.children)remove(child);node.parentElement=null;};for(const child of this.children)remove(child);this.children=[];this.append(...nodes);}
  set innerHTML(value){this.replaceChildren();parse(this.doc,value,this);}
  matches(selector){return selector.split(',').some(s=>{s=s.trim();if(s==='[hidden]')return this.hidden;if(s.startsWith('.'))return this.className.split(/\s+/).includes(s.slice(1));if(s.startsWith('#'))return this.id===s.slice(1);if(s.includes(':not(:disabled)')&&this.disabled)return false;return this.tag===s.replace(':not(:disabled)','').toLowerCase();});}
  closest(selector){let node=this;while(node){if(node.matches(selector))return node;node=node.parentElement;}return null;}
  querySelectorAll(selector){const matches=[];const walk=node=>{for(const child of node.children){if(child.matches(selector))matches.push(child);walk(child);}};walk(this);return matches;}
  focus(){this.doc.activeElement=this;}
  setPointerCapture(){}
  getContext(){return this.context??={save(){},restore(){},clearRect(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},arc(){},fillText(){},setLineDash(){},translate(){},rotate(){}};}
  getBoundingClientRect(){return {left:0,top:0,width:105,height:105};}
}
function parse(doc,html,parent){
  const stack=[parent],voids=new Set(['input','br','hr','meta','link','img']);
  for(const match of html.matchAll(/<\/?([\w-]+)([^>]*?)>/g)){
    const tag=match[1].toLowerCase();if(match[0].startsWith('</')){if(stack.at(-1).tag===tag)stack.pop();continue;}
    const node=new Element(doc,tag);for(const attr of match[2].matchAll(/([\w-]+)(?:\s*=\s*"([^"]*)")?/g))node.setAttribute(attr[1],attr[2]??'');stack.at(-1).append(node);if(!voids.has(tag)&&!match[0].endsWith('/>'))stack.push(node);
  }
}
function documentFixture(){
  const doc={ids:new Map(),events:{},pointerLockElement:null,createElement(tag){return new Element(this,tag);},getElementById(id){return this.ids.get(id)??null;},querySelectorAll(selector){return this.root.querySelectorAll(selector);},addEventListener(name,fn){(this.events[name]??=[]).push(fn);}};
  doc.root=new Element(doc,'document');parse(doc,readFileSync(new URL('../../public/portfolio-game/index.html',import.meta.url),'utf8'),doc.root);doc.body=doc.querySelectorAll('body')[0];doc.activeElement=doc.body;return doc;
}

let fixtureId=0;
export async function controllerFixture(t,saved=null,production={}){
  const keys=['document','window','matchMedia','localStorage','innerWidth','innerHeight','devicePixelRatio'];const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  delete globalThis.document;
  const world=production.world??createWorld(),physics=production.physics??createSandboxPhysics(world),host=production.host??createCharacter({host:true}),player=production.player??createCharacter();host.userData.nameSprite=new THREE.Group();
  const doc=documentFixture(),data=new Map([['rabin-house-lap','31.2']]);if(saved)data.set(PROGRESS_KEY,JSON.stringify(saved));
  const window={events:{},addEventListener(name,fn){(this.events[name]??=[]).push(fn);}};
  Object.assign(globalThis,{document:doc,window,matchMedia:()=>({matches:false}),localStorage:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)},innerWidth:1000,innerHeight:700,devicePixelRatio:1});
  t.after(()=>{for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
  const sourceURL=new URL('../../public/portfolio-game/game.js',import.meta.url);let source=readFileSync(sourceURL,'utf8');
  source=source.replace(/from\s+(['"])(\.\/[^'"]+)\1/g,(_,quote,path)=>'from '+quote+new URL(path,sourceURL).href+quote).replace(/\nboot\(\);\s*$/,'\n');
  source='const setTimeout=()=>0,clearTimeout=()=>{},requestAnimationFrame=()=>null,cancelAnimationFrame=()=>{};\n'+source;
  source+=`\n// Controller fixture ${++fixtureId}\nexport {state,beginVisit,skipInvitation,updateDoors,moveHost,movePlayer,resetPosition,hideDialogue,showChapter,previewStory,hostConversation,updatePresentation,finishPresentation,repairScene};
    export function mountFixture(f){renderer=f.renderer;scene=f.scene;camera=f.camera;world=f.world;physics=f.physics;player=f.player;host=f.host;sun=f.sun;ambient=f.ambient;trajectory=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(32*3),3)),new THREE.LineDashedMaterial());world.cameraBlockers=[...world.blockers];visit=createArrival(world,host);canvas.tabIndex=0;bindEvents();}
    export function getVisit(){return visit;}
    export function placeVisitor(p){playerPos={...p};player.position.set(p.x,p.y,p.z);}
    export function visitorPosition(){return {...playerPos};}
    export function cameraHeading(){return yaw;}
    export function cameraPosition(){return camera.position.clone();}
    export function advanceFrame(dt){frame(previousTime+dt*1000);}
    export function simulateLoading(){world=null;player=null;host=null;}
    //# sourceURL=portfolio-controller-fixture-${fixtureId}.mjs
  `;
  const api=await import('data:text/javascript,'+encodeURIComponent(source));const scene=new THREE.Scene();scene.fog=new THREE.Fog('#c1cfb8',46,100);
  api.mountFixture({world,physics,host,player,scene,camera:new THREE.PerspectiveCamera(48,1000/700,.1,160),sun:new THREE.DirectionalLight(),ambient:new THREE.HemisphereLight(),renderer:{shadowMap:{enabled:true},setPixelRatio(){},setSize(){},dispose(){},render(){}}});
  return {api,world,physics,host,player,doc,data,window,keydown(code,target=doc.getElementById('world')){const e={code,target,repeat:false,preventDefault(){}};for(const fn of window.events.keydown)fn(e);}};
}
