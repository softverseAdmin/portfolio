import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {WEB_ASSETS} from '../public/portfolio-game/asset-catalog.js';

const base=new URL('../public/portfolio-game/',import.meta.url);
test('web models and first-drive motions stay within the startup download budget',()=>{
  const characters=Object.values(WEB_ASSETS.characters),critical=WEB_ASSETS.car.bytes+characters.reduce((n,r)=>n+r.bytes+r.core.bytes,0);
  assert.ok(critical<8_000_000,`first-drive assets grew to ${critical} bytes`);
  assert.ok(critical+WEB_ASSETS.house.bytes<13_000_000,'the whole house exceeds its web budget');
  assert.ok(WEB_ASSETS.car.bytes<4_500_000);assert.ok(WEB_ASSETS.house.bytes<6_000_000);
});

test('optimized assets use verified content hashes and core bundles contain playable first-visit motions',()=>{
  const files=[WEB_ASSETS.car,WEB_ASSETS.house];
  for(const role of Object.values(WEB_ASSETS.characters))files.push(role,role.core,role.tour,...Object.values(role.motions));
  for(const file of files){
    const bytes=readFileSync(new URL(file.url,base));assert.equal(bytes.length,file.bytes);
    assert.ok(file.uri.includes('.'+createHash('sha256').update(bytes).digest('hex').slice(0,12)+'.'),'an immutable URL does not match its bytes');
    if(file.decodedBytes)assert.equal(gunzipSync(bytes).length,file.decodedBytes);
  }
  for(const role of Object.values(WEB_ASSETS.characters)){
    const core=JSON.parse(gunzipSync(readFileSync(new URL(role.core.url,base))));
    for(const id of ['idle','walk','greet','drive','enter-car','exit-car'])assert.ok(core[id]?.tracks.length,`first visit is missing ${id}`);
  }
});
