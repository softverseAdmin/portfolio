export function deviceProfile(env=globalThis){
  const nav=env.navigator??{},coarse=env.matchMedia?.('(pointer: coarse)').matches??false;
  const mobile=coarse||/Android|iPhone|iPad|iPod/.test(nav.userAgent??'')||(nav.maxTouchPoints>1&&nav.platform==='MacIntel');
  return {mobile,pixelRatio:mobile?1:Math.min(env.devicePixelRatio??1,1.6),antialias:!mobile,shadowSize:mobile?1024:2048,maxTextureSize:mobile?2048:0};
}

export function landscapeSize(width,height,mobile=false){
  const rotated=mobile&&height>width;
  return {width:rotated?height:width,height:rotated?width:height,rotated};
}

// The visible game turns clockwise in portrait; input must turn back with it.
export function landscapeDelta(x,y,rotated=false){return rotated?{x:y,y:x===0?0:-x}:{x,y};}

export function installLandscape({doc=document,env=globalThis,onChange=()=>{}}={}){
  const root=doc.getElementById('game-viewport'),profile=deviceProfile(env);
  if(!root)return {update:()=>{},size:()=>landscapeSize(env.innerWidth,env.innerHeight,profile.mobile)};
  let previous='';
  function update(){
    const size=landscapeSize(env.innerWidth,env.innerHeight,profile.mobile),key=[size.width,size.height,size.rotated].join('|');
    if(key===previous)return;previous=key;
    doc.body.classList.toggle('mobile-landscape',profile.mobile);
    doc.body.classList.toggle('portrait-landscape',size.rotated);
    root.style.width=size.width+'px';root.style.height=size.height+'px';
    root.style.transform=size.rotated?`translateX(${env.innerWidth}px) rotate(90deg)`:'none';
    onChange(size);
  }
  update();env.addEventListener?.('resize',update);doc.addEventListener?.('fullscreenchange',update);
  return {update,size:()=>landscapeSize(env.innerWidth,env.innerHeight,profile.mobile)};
}

// Fullscreen and orientation are optional. A browser rejection must never block Visit.
export async function requestLandscape({doc=document,env=globalThis}={}){
  const root=doc.getElementById('game-viewport');
  const target=doc.documentElement??root;
  try{if(!doc.fullscreenElement&&target?.requestFullscreen)await target.requestFullscreen();}catch{}
  try{await env.screen?.orientation?.lock?.('landscape');}catch{}
}
