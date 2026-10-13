import {PORTFOLIO,portfolioSummary} from './portfolio.js';
import {installLandscape} from './mobile.js';

// Keep entry and portfolio controls usable before the 3D modules arrive.
export function launchStartup({doc=document,loadGame=()=>import('./game.js?v=22'),reload=()=>{const url=new URL(location.href);url.searchParams.delete('simple');location.assign(url);},reloadSimple=()=>{const url=new URL(location.href);url.searchParams.set('simple','1');location.assign(url);},simple=false}={}){
  installLandscape({doc});
  const $=id=>doc.getElementById(id);let game,basic=simple,portfolioOpen=false,failed=false;
  const close=()=>{portfolioOpen=false;$('modal').hidden=true;};
  function portfolio(id){
    if(game&&!failed){game.portfolioModal();return;}
    portfolioOpen=true;const entry=PORTFOLIO[id];
    $('modal-title').textContent=entry?.title??'Rabin Adhikari';$('modal-eyebrow').textContent=entry?.eyebrow??'YOUR HOST · ENGINEER · PROJECT LEAD';
    $('modal-content').innerHTML=entry?entry.body+'<button id="startup-back" class="text-button">← Back to portfolio</button>':portfolioSummary();
    $('modal').hidden=false;$('modal-close').onclick=close;$('modal-close').focus();
    doc.querySelectorAll('.project-read').forEach(button=>button.onclick=()=>portfolio(button.dataset.id));
    if($('startup-back'))$('startup-back').onclick=()=>portfolio();
    if($('quick-enter')){$('quick-enter').textContent='Load a simpler visit →';$('quick-enter').onclick=()=>{close();requestBasic();};}
  }
  function requestBasic(){
    basic=true;$('loading-status').textContent='Preparing a simpler visit…';
    if(failed)reloadSimple();
  }
  function fail(error){
    if(failed)return;
    failed=true;console.warn('Game startup failed:',error);
    game?.pauseAfterError?.();
    $('loading').hidden=false;$('loading').classList.remove('is-ready');$('loading').classList.add('needs-help');$('fatal').hidden=true;
    $('loading-status').textContent='The game could not start. Retry, load a simpler visit, or read the portfolio.';
    $('loading-retry').hidden=false;$('loading-retry').onclick=reload;
    $('basic-visit').hidden=false;$('basic-visit').onclick=requestBasic;
    for(const id of ['quick-view','portfolio','loading-portfolio','fallback-portfolio'])$(id).onclick=()=>portfolio();
  }
  $('basic-visit').hidden=false;$('basic-visit').onclick=requestBasic;
  $('loading-retry').onclick=reload;$('fatal-retry').onclick=reload;$('reload-original').onclick=reload;
  for(const id of ['quick-view','portfolio','loading-portfolio','fallback-portfolio'])$(id).onclick=()=>portfolio();
  doc.addEventListener('keydown',event=>{if((!game||failed)&&event.code==='Escape')close();});
  const timer=setTimeout(()=>{$('loading-retry').hidden=false;$('loading').classList.add('needs-help');$('loading-status').textContent='Loading is taking longer. You can retry, choose a simpler visit, or read the portfolio.';},25000);
  const promise=(async()=>{
    try{
      game=await loadGame();
      const preparing=game.boot({useBasic:basic});if(portfolioOpen)game.portfolioModal();await preparing;clearTimeout(timer);
    }catch(error){clearTimeout(timer);fail(error);}
  })();
  return {promise,fail,portfolio,requestBasic};
}

if(typeof document!=='undefined'){
  const startup=launchStartup({simple:new URL(location.href).searchParams.get('simple')==='1'});
  window.addEventListener('unhandledrejection',event=>{event.preventDefault();startup.fail(event.reason);});
  window.addEventListener('error',event=>{if(event.error){event.preventDefault();startup.fail(event.error);}});
  document.getElementById('world').addEventListener('webglcontextlost',event=>{event.preventDefault();startup.fail(new Error('The browser released the graphics context.'));});
}
