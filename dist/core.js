/* Geometry shared by the editor and vector export. */
(function(root){
  const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
  function snap(p,enabled=true,step=10){return enabled?{x:Math.round(p.x/step)*step,y:Math.round(p.y/step)*step}:{...p}}
  function endpoint(a,b,straight=true,grid=true){b=snap(b,grid);if(!straight)return b;const angle=Math.round(Math.atan2(b.y-a.y,b.x-a.x)/(Math.PI/4))*Math.PI/4;const d=distance(a,b);return snap({x:a.x+Math.cos(angle)*d,y:a.y+Math.sin(angle)*d},grid)}
  function simplify(points,tolerance=6){if(points.length<3)return points;let a=points[0],b=points.at(-1),den=distance(a,b),max=0,index=0;for(let i=1;i<points.length-1;i++){const p=points[i],d=den?Math.abs((b.y-a.y)*p.x-(b.x-a.x)*p.y+b.x*a.y-b.y*a.x)/den:distance(a,p);if(d>max){max=d;index=i}}return max>tolerance?[...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)]:[a,b]}
  function bounds(s){if(s.points){const xs=s.points.map(p=>p.x),ys=s.points.map(p=>p.y);return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)}}if(s.x2!==undefined)return{x:Math.min(s.x,s.x2),y:Math.min(s.y,s.y2),w:Math.abs(s.x2-s.x),h:Math.abs(s.y2-s.y)};return{x:s.x,y:s.y,w:s.w||100,h:s.h||40}}
  function union(objects){if(!objects.length)return{x:0,y:0,w:1000,h:750};const bs=objects.map(bounds);let x=Math.min(...bs.map(b=>b.x)),y=Math.min(...bs.map(b=>b.y));return{x,y,w:Math.max(...bs.map(b=>b.x+b.w))-x,h:Math.max(...bs.map(b=>b.y+b.h))-y}}
  function move(s,dx,dy){const n={...s,x:(s.x||0)+dx,y:(s.y||0)+dy};if(s.x2!==undefined){n.x2=s.x2+dx;n.y2=s.y2+dy}if(s.points)n.points=s.points.map(p=>({x:p.x+dx,y:p.y+dy}));return n}
  function resize(s,from,to){const sx=from.w?to.w/from.w:1,sy=from.h?to.h/from.h:1;const point=p=>({x:to.x+(p.x-from.x)*sx,y:to.y+(p.y-from.y)*sy});const n={...s,...point(s)};if(s.x2!==undefined){let end=point({x:s.x2,y:s.y2});n.x2=end.x;n.y2=end.y}else{n.w=(s.w||0)*sx;n.h=(s.h||0)*sy}if(s.points)n.points=s.points.map(point);return n}
  function contains(a,b){return b.x>=a.x&&b.y>=a.y&&b.x+b.w<=a.x+a.w&&b.y+b.h<=a.y+a.h}
  function clean(objects,settings){const grid=settings.snap,straight=settings.straight;return objects.flatMap(s=>{if(s.type==='sketch'){let pts=simplify(s.points,settings.tolerance||7);if(pts.length<2)return[];let start=snap(pts[0],grid);return pts.slice(1).map(p=>{const end=endpoint(start,p,straight,grid),line={...s,type:'wall',x:start.x,y:start.y,x2:end.x,y2:end.y};delete line.points;start=end;return line})}if(['wall','line'].includes(s.type)){const end=endpoint({x:s.x,y:s.y},{x:s.x2,y:s.y2},straight,grid);return{...s,x2:end.x,y2:end.y}}return s})}
  const normalizeAngle=angle=>((angle%360)+360)%360;
  function segmentAngle(a,b){return normalizeAngle(Math.atan2(a.y-b.y,b.x-a.x)*180/Math.PI)}
  function fromPolar(a,length,angle){const radians=angle*Math.PI/180;return{x:a.x+Math.cos(radians)*length,y:a.y-Math.sin(radians)*length}}
  function nearestAnchor(point,anchors,tolerance=10){let best=null,range=tolerance;for(const anchor of anchors){const d=distance(point,anchor);if(d<=range){best=anchor;range=d}}return best}
  // Constraints preserve exact lengths and angles; grid rounding never distorts them.
  function preciseEndpoint(a,b,config={},anchors=[],tolerance=10){
    const step=Number(config.gridStep)||10;
    const hasLength=config.exactLength!==''&&config.exactLength!=null&&Number.isFinite(+config.exactLength)&&+config.exactLength>0;
    const hasAngle=config.exactAngle!==''&&config.exactAngle!=null&&Number.isFinite(+config.exactAngle);
    let target=snap(b,!!config.snap,step),angle=segmentAngle(a,target),length=distance(a,target),kind=config.snap?'grid':null;
    const angleStep=config.shift?90:(config.straight?Number(config.angleStep||45):0);
    if(hasAngle)angle=normalizeAngle(+config.exactAngle);else if(angleStep)angle=normalizeAngle(Math.round(angle/angleStep)*angleStep);
    if(hasLength)length=+config.exactLength;
    if(angleStep&&!hasLength&&!hasAngle){const radians=angle*Math.PI/180;length=Math.max(0,(target.x-a.x)*Math.cos(radians)-(target.y-a.y)*Math.sin(radians));if(config.snap&&Math.abs(angle/45-Math.round(angle/45))<1e-8){const dominant=Math.max(Math.abs(Math.cos(radians)),Math.abs(Math.sin(radians)));length=Math.round(length*dominant/step)*step/dominant;}kind='angle'}
    let result=fromPolar(a,length,angle);
    if(!hasLength&&!hasAngle&&config.endpointSnap){
      const anchor=nearestAnchor(b,anchors,tolerance);
      if(anchor){const anchorAngle=segmentAngle(a,anchor),diff=Math.abs(((anchorAngle-angle+540)%360)-180);
        if(!angleStep||diff<.75){result={x:anchor.x,y:anchor.y};angle=anchorAngle;length=distance(a,result);kind='endpoint'}
      }
    }
    if(hasLength||hasAngle)kind='exact';
    return{...result,angle,length,snapKind:kind};
  }
  function anchors(objects){return objects.flatMap(s=>{if(s.x2!==undefined)return[{x:s.x,y:s.y},{x:s.x2,y:s.y2}];if(['rect','room','window'].includes(s.type))return[{x:s.x,y:s.y},{x:s.x+s.w,y:s.y},{x:s.x,y:s.y+s.h},{x:s.x+s.w,y:s.y+s.h}];return[]})}
  function wallOffsets(s,thickness){const length=distance(s,{x:s.x2,y:s.y2});if(length<1e-9)return[];const nx=-(s.y2-s.y)/length*thickness/2,ny=(s.x2-s.x)/length*thickness/2;return[1,-1].map(sign=>({x:s.x+nx*sign,y:s.y+ny*sign,x2:s.x2+nx*sign,y2:s.y2+ny*sign}))}
  function joinedWallFaces(wall,neighbors,thickness,epsilon=.001){
    const faces=wallOffsets(wall,thickness);
    if(!faces.length)return faces;
    for(const end of ['start','end']){
      const at=end==='start'?{x:wall.x,y:wall.y}:{x:wall.x2,y:wall.y2};
      const links=[];
      for(const other of neighbors){if(other.id===wall.id)continue;
        if(distance(at,other)<=epsilon)links.push({other,end:'start'});
        else if(distance(at,{x:other.x2,y:other.y2})<=epsilon)links.push({other,end:'end'});
      }
      if(links.length!==1)continue;
      const link=links[0],otherFaces=wallOffsets(link.other,thickness);if(!otherFaces.length)continue;
      const reverse=end===link.end;
      faces.forEach((face,index)=>{
        const other=otherFaces[reverse?1-index:index];
        const dx=face.x2-face.x,dy=face.y2-face.y,ex=other.x2-other.x,ey=other.y2-other.y,den=dx*ey-dy*ex;
        if(Math.abs(den)<1e-8)return;
        const t=((other.x-face.x)*ey-(other.y-face.y)*ex)/den;
        const point={x:face.x+t*dx,y:face.y+t*dy};
        if(distance(at,point)>thickness*4)return;
        if(end==='start'){face.x=point.x;face.y=point.y}else{face.x2=point.x;face.y2=point.y}
      });
    }
    return faces;
  }
  function wallThicknessPixels(inches,scale){const real=Number(scale.real)>0?Number(scale.real):1,pixels=Number(scale.pixels)>0?Number(scale.pixels):100;return Number(inches||6)*(scale.units==='ft'?1/12:.0254)*pixels/real}
  function lineweightForScale(inchesPerFoot=.5){return Math.min(3,Math.max(.75,Math.round(2*Math.sqrt(Number(inchesPerFoot)/.5)*4)/4))}
  const api={distance,snap,endpoint,simplify,bounds,union,move,resize,contains,clean,normalizeAngle,segmentAngle,fromPolar,nearestAnchor,preciseEndpoint,anchors,wallOffsets,joinedWallFaces,wallThicknessPixels,lineweightForScale};root.TraceGeometry=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
