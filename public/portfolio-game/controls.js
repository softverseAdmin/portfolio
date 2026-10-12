const paths={
  run:'M15 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4M13 9l-4 4 4 3-3 6M13 9l4 3 4-1M13 9l2 8 5 4M9 13l-5-1',
  jump:'M12 20V4M5 11l7-7 7 7',
  hand:'M7 12V7a1.5 1.5 0 0 1 3 0v4-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v5-3a1.5 1.5 0 0 1 3 0v7c0 5-3 7-7 7-2 0-4-1-5-3l-4-5a1.5 1.5 0 0 1 2-2l2 2',
  throw:'M11 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4M11 10l-4 4-4 1M11 10l5-3 2-4M11 10l2 6 6 5M13 16l-6 6M17 6c3 0 5 2 6 5',
  hit:'M5 16l4-8h8l4 4-3 7H8zM9 8V5M13 8V4M17 8V5M9 14h7',
  drop:'M4 5h8l4 5h4M10 5l2 7h6M12 17l3 3 3-3M15 14v6',
  aim:'M12 2v4M12 18v4M2 12h4M18 12h4M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12M12 11v2',
  talk:'M4 4h16v12H9l-5 5zM8 8h8M8 12h5',
  door:'M5 21V3l13-1v20M9 21h13M14 12h1',
  brake:'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M9 8v8M15 8v8',
  horn:'M3 10h5l9-5v14l-9-5H3zM20 8l2 2v4l-2 2',
  stop:'M6 6h12v12H6z',
  flag:'M6 22V3h13l-3 4 3 4H6',
};

export function touchControlLabels(state){
  const near=state.near,action=near?.action;
  let use={label:'Use',icon:'hand'};
  if(action==='pickup')use={label:'Pick up',icon:'hand'};
  else if(action==='host')use={label:'Talk',icon:'talk'};
  else if(action==='door')use={label:near.label?.startsWith('Close')?'Close':'Open',icon:'door'};
  else if(action==='car')use={label:'Drive',icon:'door'};
  if(state.gesture)use={label:'Stop',icon:'stop'};
  else if(state.driving)use={label:'Exit',icon:'door'};
  else if(state.sitting)use={label:'Stand',icon:'jump'};
  return {
    'touch-use':use,
    'touch-run':{label:state.driving?'Brake':'Run',icon:state.driving?'brake':'run'},
    'touch-jump':{label:'Jump',icon:'jump'},
    'touch-drop':{label:state.driving?'Lap':'Drop',icon:state.driving?'flag':'drop'},
    'touch-aim':{label:'Aim',icon:'aim'},
    'touch-action':{label:state.driving?'Horn':state.held?'Throw':'Hit',icon:state.driving?'horn':state.held?'throw':'hit'},
  };
}

export function paintTouchControls(doc,state){
  for(const [id,{label,icon}] of Object.entries(touchControlLabels(state))){
    const button=doc.getElementById(id),key=label+'|'+icon;
    if(button.dataset.control===key)continue;button.dataset.control=key;
    button.innerHTML=`<svg class="control-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[icon]}"/></svg><span class="control-label">${label}</span>`;
  }
  const hint=doc.getElementById('touch-hint');
  if(hint){const text=state.driving?'Steer with the joystick · Hold Brake to stop':state.held?'Drag to look · Hold Throw, then release · Drop to put down':'Drag to look · Talk, pick up and open nearby';if(hint.textContent!==text)hint.textContent=text;}
}
