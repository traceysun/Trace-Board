const assert=require('node:assert/strict');const G=require('../dist/core.js');
// A freehand corner becomes a connected wall path, even after snapping.
const sketch={id:'s',type:'sketch',points:[{x:1,y:1},{x:30,y:2},{x:70,y:1},{x:101,y:2},{x:100,y:30},{x:99,y:70},{x:100,y:101}],color:'#222',width:6};
const walls=G.clean([sketch],{snap:true,straight:true,tolerance:7});assert.equal(walls.length,2);assert.equal(walls[0].x2,walls[1].x);assert.equal(walls[0].y2,walls[1].y);assert.equal(walls[0].y,walls[0].y2);assert.equal(walls[1].x,walls[1].x2);assert(!walls[0].points);
// Resizing a mixed selection preserves its relative geometry.
const rect={type:'rect',x:10,y:20,w:50,h:40},line={type:'line',x:60,y:60,x2:110,y2:120};const b=G.union([rect,line]);const dest={x:0,y:0,w:200,h:200};const r=G.resize(rect,b,dest),l=G.resize(line,b,dest);assert.deepEqual(G.union([r,l]),dest);assert.equal(l.x,r.x+r.w);assert.equal(l.y,r.y+r.h);
// A zero-length selection can still be moved and resized safely.
const flat={type:'line',x:10,y:0,x2:100,y2:0};assert(Number.isFinite(G.resize(flat,G.bounds(flat),{x:0,y:0,w:180,h:10}).y2));
assert.equal(G.contains({x:0,y:0,w:100,h:100},{x:90,y:90,w:20,h:20}),false);assert.deepEqual(G.move({type:'sketch',x:0,y:0,points:[{x:1,y:2}]},4,5).points,[{x:5,y:7}]);console.log('Geometry checks passed: connected cleanup, mixed selection resize, zero-height line, marquee containment.');
