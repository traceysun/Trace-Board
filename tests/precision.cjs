const assert=require('node:assert/strict');const G=require('../dist/core.js');
const near=(a,b,t=1e-8)=>assert(Math.abs(a-b)<t,`${a} != ${b}`);
// Fixed length and angle remain exact even when they disagree with the grid.
let p=G.preciseEndpoint({x:13,y:17},{x:381,y:124},{snap:true,straight:true,angleStep:45,gridStep:10,exactLength:123.456,exactAngle:17});near(G.distance({x:13,y:17},p),123.456);near(G.segmentAngle({x:13,y:17},p),17);assert.equal(p.snapKind,'exact');
// Orthographic and 15-degree modes constrain the actual geometry, not just its label.
p=G.preciseEndpoint({x:0,y:0},{x:137,y:17},{snap:true,straight:true,angleStep:45,gridStep:10});near(p.y,0);near(p.x,140);
p=G.preciseEndpoint({x:0,y:0},{x:97,y:-29},{straight:true,angleStep:15});near(G.segmentAngle({x:0,y:0},p),15);
p=G.preciseEndpoint({x:0,y:0},{x:25,y:-100},{straight:false,shift:true});near(p.x,0);near(G.segmentAngle({x:0,y:0},p),90);
// Endpoint magnets win over grid when unconstrained; exact inputs win over magnets.
p=G.preciseEndpoint({x:0,y:0},{x:99,y:3},{snap:true,endpointSnap:true},[{x:101,y:4}],10);assert.equal(p.x,101);assert.equal(p.y,4);assert.equal(p.snapKind,'endpoint');
p=G.preciseEndpoint({x:0,y:0},{x:99,y:3},{snap:true,endpointSnap:true,exactLength:50,exactAngle:0},[{x:101,y:4}],10);near(p.x,50);near(p.y,0);
// Parallel wall faces stay separated by the selected physical width at every angle.
for(const end of [{x2:100,y2:0},{x2:0,y2:100},{x2:100,y2:100}]){const wall={x:0,y:0,...end};const [a,b]=G.wallOffsets(wall,12);near(G.distance(a,b),12);near(G.distance(a,{x:a.x2,y:a.y2}),G.distance(wall,{x:wall.x2,y:wall.y2}));}
assert.equal(G.wallOffsets({x:0,y:0,x2:0,y2:0},12).length,0);
near(G.wallThicknessPixels(6,{units:'m',pixels:100,real:1}),15.24);near(G.wallThicknessPixels(6,{units:'ft',pixels:100,real:1}),50);
assert.equal(G.lineweightForScale(.5),2);assert(G.lineweightForScale(.125)<2);assert(G.lineweightForScale(1)<=3);
console.log('Precision checks passed: exact constraints, angle locks, endpoint magnets, parallel wall faces, scale conversion, thin weights.');
// Connected wall faces meet at a proper miter, including reversed segment direction.
const first={id:'a',x:0,y:0,x2:100,y2:0},second={id:'b',x:100,y:0,x2:100,y2:100};
const firstFaces=G.joinedWallFaces(first,[second],10),secondFaces=G.joinedWallFaces(second,[first],10);
for(let i=0;i<2;i++){near(firstFaces[i].x2,secondFaces[i].x);near(firstFaces[i].y2,secondFaces[i].y)}
const reversed={...second,x:100,y:100,x2:100,y2:0};
const reversedFaces=G.joinedWallFaces(reversed,[first],10);
for(let i=0;i<2;i++){near(firstFaces[i].x2,reversedFaces[1-i].x2);near(firstFaces[i].y2,reversedFaces[1-i].y2)}
const collinear=G.joinedWallFaces(first,[{id:'c',x:100,y:0,x2:200,y2:0}],10);assert(collinear.every(f=>Object.values(f).every(Number.isFinite)));
console.log('Connected wall checks passed: mitered corners, reversed paths, collinear stability.');
