export const APPROACH_GRID={minX:-56,maxX:56,minZ:28,maxZ:128,step:2};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function terrainSample(x,z){
  const t=clamp((z-28)/54,0,1),rise=t*t*(3-2*t);
  return .02+2.3*rise+.16*rise*Math.sin(x*.08)*Math.sin((z-28)*.045);
}
// The same two triangles feed the visible terrain, actor floor and physics heightfield.
export function approachHeight(x,z){
  if(z<=28)return .02;
  const g=APPROACH_GRID,fx=clamp((x-g.minX)/g.step,0,(g.maxX-g.minX)/g.step-.000001),fz=clamp((g.maxZ-z)/g.step,0,(g.maxZ-g.minZ)/g.step-.000001);
  const ix=Math.floor(fx),iz=Math.floor(fz),a=fx-ix,b=fz-iz,x0=g.minX+ix*g.step,z0=g.maxZ-iz*g.step;
  const h00=terrainSample(x0,z0),h10=terrainSample(x0+g.step,z0),h01=terrainSample(x0,z0-g.step),h11=terrainSample(x0+g.step,z0-g.step);
  return a+b<=1?h00+(h10-h00)*a+(h01-h00)*b:h11+(h01-h11)*(1-a)+(h10-h11)*(1-b);
}
