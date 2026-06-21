/* THE MAST EYE — the all-seeing eye, rendered on canvas (HOMEPAGE HERO ONLY).
   White almond glow = the sclera; a turning crystalline KALEIDOSCOPE = the iris.
   The iris EVOLVES by day-of-week; Sunday is the FULL-BLOOM kaleidoscope (no black,
   rotating). For his mother, who loved kaleidoscopes.

   GENERATED — do not hand-edit. Each renderer is lifted VERBATIM from
   assets/widgets/series/<n>-<name>.html. Regenerate with: python tools/gen-mast-eye.py
   Honors prefers-reduced-motion. Transparent canvas; the blue glow is CSS.
   Preview ANY renderer:  ?eye=<slug>  (kaleido | summit | ice-seed | first-facets |
   crystal-bloom | teal-nebula | shattered-glass | sapphire-jewel)
   Preview a rotation day: ?day=0..6   (0=Sun .. 6=Sat) */
(function(){
  "use strict";

  /* ---- ice-seed ---- */
function eye_ice_seed(canvas, opts){
  var ctx=canvas.getContext('2d'); if(!ctx) return;
  var DPR=Math.min(window.devicePixelRatio||1,2);
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function fit(){var r=canvas.getBoundingClientRect();var w=Math.max(1,Math.round((r.width||320)*DPR)),h=Math.max(1,Math.round((r.height||218)*DPR));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
  fit(); window.addEventListener('resize',fit);

  var N=opts.N||6, seg=Math.PI*2/N;
  // Ice-seed palette: pale ice-blue, frost white, faint cyan — cold + desaturated on near-black navy.
  var COLS=opts.COLS||[
    [188,214,255], // pale ice blue
    [214,232,255], // frost blue-white
    [236,245,255], // near white
    [150,196,255], // colder blue
    [176,228,255], // faint cyan
    [122,170,248], // deep ice
    [248,252,255]  // bright white glint
  ];
  function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';}
  function mb(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var rnd=mb(opts.seed||20260615);

  // --- ICE SEED: build a sparse set of crystal "needles" arranged along the wedge radius.
  // Each needle is a hexagonal-armed snow element: a spine, paired dendrite branches, and
  // a tiny hex facet near its tip. Sparse on purpose — the quiet seed, lots of dark navy.
  var needles=[];
  var COUNT=7;
  for(var i=0;i<COUNT;i++){
    var rr=0.16+ (i/(COUNT-1))*0.78;            // climb the radius, evenly spaced + jitter
    rr += (rnd()-0.5)*0.06;
    needles.push({
      r: rr,
      a: (rnd()-0.5)*seg*0.36,                  // slight angular lean within the wedge
      len: 0.10+rnd()*0.20,                      // spine length (fraction of R)
      branch: 0.32+rnd()*0.42,                   // branch length as fraction of spine
      branches: 2+((rnd()*3)|0),                 // dendrite pairs along the spine
      hex: 0.018+rnd()*0.040,                    // hex facet size at tip
      col: COLS[(rnd()*(COLS.length-1))|0],
      tip: COLS[6],
      drift: 0.4+rnd()*0.9,
      phase: rnd()*6.283,
      bright: 0.5+rnd()*0.5
    });
  }
  // a handful of free-floating frost glints (sparse sparkle in the dark space)
  var glints=[];
  for(var g=0;g<5;g++){
    glints.push({ r:0.22+rnd()*0.74, a:(rnd()-0.5)*seg*0.7, size:0.010+rnd()*0.022, phase:rnd()*6.283, spd:0.5+rnd()*1.1 });
  }

  function almond(cx,cy,aw,peak){ctx.beginPath();ctx.moveTo(cx-aw,cy);ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);ctx.closePath();}

  // Draw one hexagon centered at (x,y) with circumradius s, rotation rot.
  function hex(x,y,s,rot){
    ctx.beginPath();
    for(var k=0;k<6;k++){var aa=rot+k*1.0471975512;var px=x+Math.cos(aa)*s,py=y+Math.sin(aa)*s;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
    ctx.closePath();
  }

  function drawWedge(ts,R){
    // breathing is very slow + small — the seed is still.
    for(var i=0;i<needles.length;i++){
      var s=needles[i];
      var breath = 1 + 0.05*Math.sin(ts*0.00035*s.drift + s.phase);
      var rr=(s.r + 0.015*Math.sin(ts*0.0003*s.drift+s.phase))*R;
      var ang=s.a;
      var bx=Math.cos(ang)*rr, by=Math.sin(ang)*rr;           // base of the needle
      var dirx=Math.cos(ang), diry=Math.sin(ang);             // outward direction (radial)
      var nx=-diry, ny=dirx;                                  // perpendicular (for branches)
      var L=s.len*R*breath;
      var tx=bx+dirx*L, ty=by+diry*L;                         // tip of the spine

      var shimmer = 0.55 + 0.45*Math.sin(ts*0.0004 + s.phase*1.6);
      var al = (0.30 + 0.34*shimmer) * s.bright;

      // soft halo behind the needle (faint, gives the frost glow without filling the dark)
      ctx.strokeStyle = rgba(s.col, Math.max(0.05, al*0.20));
      ctx.lineWidth = Math.max(1.6, R*0.020);
      ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(tx,ty); ctx.stroke();

      // the crystalline spine — crisp, bright
      ctx.strokeStyle = rgba(s.col, Math.max(0.16, al*0.85));
      ctx.lineWidth = Math.max(1, R*0.0075);
      ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(tx,ty); ctx.stroke();

      // dendrite branches — paired, swept toward the tip at the snow-crystal 60° lean
      var nb=s.branches;
      for(var b=1;b<=nb;b++){
        var f=b/(nb+1);                       // position along spine
        var px=bx+dirx*L*f, py=by+diry*L*f;
        var blen=s.branch*L*(1-f*0.45);       // branches shorten toward the tip
        // sweep: each branch leans outward ~ +30° (cos/sin blend of radial + perp)
        var sw=0.5;                            // forward lean factor
        var ex1=px + (nx*0.866 + dirx*sw)*blen,  ey1=py + (ny*0.866 + diry*sw)*blen;
        var ex2=px + (-nx*0.866 + dirx*sw)*blen, ey2=py + (-ny*0.866 + diry*sw)*blen;
        ctx.strokeStyle = rgba(s.col, Math.max(0.10, al*0.62));
        ctx.lineWidth = Math.max(0.8, R*0.0048);
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(ex1,ey1); ctx.moveTo(px,py); ctx.lineTo(ex2,ey2); ctx.stroke();
        // tiny secondary frost ticks on the longer branches
        if(blen>R*0.05){
          var mx1=px+(nx*0.866+dirx*sw)*blen*0.6, my1=py+(ny*0.866+diry*sw)*blen*0.6;
          var mx2=px+(-nx*0.866+dirx*sw)*blen*0.6, my2=py+(-ny*0.866+diry*sw)*blen*0.6;
          var tick=blen*0.32;
          ctx.lineWidth=Math.max(0.6,R*0.0030);
          ctx.beginPath();
          ctx.moveTo(mx1,my1); ctx.lineTo(mx1+nx*tick+dirx*sw*tick, my1+ny*tick+diry*sw*tick);
          ctx.moveTo(mx2,my2); ctx.lineTo(mx2-nx*tick+dirx*sw*tick, my2-ny*tick+diry*sw*tick);
          ctx.stroke();
        }
      }

      // hex facet at the tip — translucent ice plate with a bright edge (refraction/edge light)
      var hs=s.hex*R*breath;
      var hrot = s.phase + ts*0.00012*s.drift;
      // translucent fill
      hex(tx,ty,hs,hrot);
      ctx.fillStyle = rgba(s.col, Math.max(0.06, al*0.28));
      ctx.fill();
      // crisp edge light
      hex(tx,ty,hs,hrot);
      ctx.strokeStyle = rgba([232,244,255], Math.max(0.12, al*0.75));
      ctx.lineWidth = Math.max(0.8, R*0.0045);
      ctx.stroke();
      // inner bright nucleus dot at the tip
      ctx.beginPath(); ctx.arc(tx,ty,Math.max(0.8,R*0.006),0,6.283);
      ctx.fillStyle = rgba(s.tip, Math.max(0.25, al*0.95)); ctx.fill();
    }

    // sparse free-floating frost glints — six-point micro-stars in the dark space
    for(var gi=0;gi<glints.length;gi++){
      var gl=glints[gi];
      var gr=gl.r*R, ga=gl.a;
      var gx=Math.cos(ga)*gr, gy=Math.sin(ga)*gr;
      var tw=0.5+0.5*Math.sin(ts*0.0009*gl.spd+gl.phase);
      var gs=gl.size*R*(0.7+0.5*tw);
      var gal=Math.max(0.06,0.55*tw);
      ctx.strokeStyle=rgba([240,248,255],gal);
      ctx.lineWidth=Math.max(0.6,R*0.0030);
      ctx.beginPath();
      for(var p=0;p<3;p++){var aa=gl.phase+p*1.0471975512;ctx.moveTo(gx-Math.cos(aa)*gs,gy-Math.sin(aa)*gs);ctx.lineTo(gx+Math.cos(aa)*gs,gy+Math.sin(aa)*gs);}
      ctx.stroke();
    }
  }

  function paint(ts){
    var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2, aw=w*0.46, peak=h*0.40, R=Math.min(h*0.38,aw*0.66);
    ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,w,h);

    // --- almond eye frame (sclera glow) — KEPT IDENTICAL to the proven base ---
    ctx.save(); almond(cx,cy,aw,peak); ctx.clip();
    ctx.fillStyle='#0a0c12';ctx.fillRect(0,0,w,h);
    var g=ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
    g.addColorStop(0,'rgba(170,195,255,0)');g.addColorStop(0.5,'rgba(200,220,255,0.12)');g.addColorStop(1,'rgba(236,243,255,0.46)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h); ctx.restore();

    // --- iris (the elevated ice-seed kaleidoscope) ---
    ctx.save(); ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.clip();
    // FILLED iris floor — saturated cold-blue radial bed; no black between panes
    var bed=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
    bed.addColorStop(0,'rgba(70,140,200,1)');     // bright icy blue center
    bed.addColorStop(0.55,'rgba(38,90,160,1)');   // mid steel blue
    bed.addColorStop(1,'rgba(12,40,90,1)');       // deep navy edge
    ctx.fillStyle=bed;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    // faint radial navy depth so the center reads as cold + recessed
    var ng=ctx.createRadialGradient(cx,cy,R*0.10,cx,cy,R);
    ng.addColorStop(0,'rgba(20,34,70,0.55)');
    ng.addColorStop(0.6,'rgba(10,18,44,0.35)');
    ng.addColorStop(1,'rgba(5,7,16,0)');
    ctx.fillStyle=ng;ctx.fillRect(cx-R,cy-R,R*2,R*2);

    ctx.globalCompositeOperation='lighter'; var grot=ts*0.00003;  // very slow turn — the still seed
    for(var i=0;i<N;i++){ctx.save();ctx.translate(cx,cy);ctx.rotate(grot+i*seg);if(i%2===1)ctx.scale(1,-1);
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*1.02,0,seg);ctx.closePath();ctx.clip();
      drawWedge(ts,R);ctx.restore();}
    ctx.restore(); ctx.globalCompositeOperation='source-over';

    // --- pupil (KEPT identical to base, ice-blue ring) ---
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.fillStyle='#070910';ctx.fill();
    // a faint frosted inner ring inside the pupil edge (ice touch, subtle)
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(150,196,255,.42)';ctx.lineWidth=DPR;ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,R*0.265,0,6.283);ctx.strokeStyle='rgba(210,232,255,.16)';ctx.lineWidth=Math.max(1,DPR*0.7);ctx.stroke();

    // catch-light glint (KEPT identical placement to base)
    ctx.beginPath();ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);ctx.fillStyle='#eaf1ff';ctx.fill();

    // --- eyelid rim glow (KEPT IDENTICAL to base) ---
    ctx.save(); almond(cx,cy,aw,peak); ctx.shadowColor='rgba(200,222,255,0.9)';ctx.shadowBlur=R*0.22;
    ctx.strokeStyle='rgba(236,243,255,0.55)';ctx.lineWidth=Math.max(1.2,R*0.022);ctx.stroke(); ctx.restore();
  }

  function frame(ts){fit();paint(ts);if(!reduce)requestAnimationFrame(frame);}
  fit();paint(0);if(!reduce){requestAnimationFrame(frame);document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(frame);});}
}

  /* ---- first-facets ---- */
function eye_first_facets(canvas, opts){
  var ctx=canvas.getContext('2d'); if(!ctx) return;
  var DPR=Math.min(window.devicePixelRatio||1,2);
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function fit(){var r=canvas.getBoundingClientRect();var w=Math.max(1,Math.round((r.width||320)*DPR)),h=Math.max(1,Math.round((r.height||218)*DPR));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
  fit(); window.addEventListener('resize',fit);
  var N=opts.N||8, seg=Math.PI*2/N;
  var COLS=opts.COLS||[[14,68,255],[34,108,255],[77,130,255],[120,170,255],[31,182,255],[160,200,255],[210,232,255]];
  function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';}
  function lerp(a,b,t){return a+(b-a)*t;}
  function mix(c1,c2,t){return [lerp(c1[0],c2[0],t)|0,lerp(c1[1],c2[1],t)|0,lerp(c1[2],c2[2],t)|0];}
  function mb(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var rnd=mb(opts.seed||20260616);

  // Tuesday "First Facets": build a set of crisp, well-separated angular facets
  // (triangles + kites) placed within one wedge. Each carries its own glassy
  // edge-light and inner crystalline structure. Far cleaner / more structural
  // than the Monday seed of soft blobs.
  var WHITE=[226,240,255], EDGE=[200,224,255], HILITE=[244,250,255];
  var facets=[];
  var NF=11;
  for(var i=0;i<NF;i++){
    var kind = i%3; // 0=triangle, 1=kite, 2=slim sliver
    var rr = 0.16 + (i/NF)*0.80 + (rnd()-0.5)*0.06;     // climb outward, well distributed
    var aa = (rnd()*0.86) * seg;                          // angle within wedge
    var sz = (kind===2 ? 0.10 : 0.15) + rnd()*0.16;       // facet scale (R-relative)
    var aspect = 0.55 + rnd()*0.9;                         // elongation
    var orient = rnd()*6.283;
    var c1 = COLS[(rnd()*COLS.length)|0];
    var c2 = mix(c1, WHITE, 0.35+rnd()*0.45);             // glassy gradient pair
    facets.push({kind:kind, r:rr, a:aa, sz:sz, aspect:aspect, orient:orient,
                 c1:c1, c2:c2, drift:0.4+rnd()*1.1, phase:rnd()*6.283,
                 spin:(rnd()<0.5?-1:1)*(0.06+rnd()*0.16)});
  }

  function almond(cx,cy,aw,peak){ctx.beginPath();ctx.moveTo(cx-aw,cy);ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);ctx.closePath();}

  // Build the polygon point list for a facet, in its own local space.
  function facetPoints(f){
    var s=f.sz, w=s, ht=s*f.aspect;
    if(f.kind===0){ // triangle
      return [[0,-ht],[ w, ht*0.72],[ -w, ht*0.72]];
    } else if(f.kind===1){ // kite (diamond, longer on one axis)
      return [[0,-ht],[ w*0.62, 0],[0, ht*0.92],[ -w*0.62, 0]];
    } else { // slim sliver shard
      return [[0,-ht*1.15],[ w*0.32, 0],[0, ht*0.55],[ -w*0.32, 0]];
    }
  }

  function drawFacet(ts, R, f){
    var rr=(f.r + 0.022*Math.sin(ts*0.0004*f.drift + f.phase))*R;
    var x=Math.cos(f.a)*rr, y=Math.sin(f.a)*rr;
    var rot=f.orient + ts*0.00022*f.spin;
    var breathe=0.92 + 0.12*Math.sin(ts*0.0006 + f.phase*1.3);
    var pts=facetPoints(f);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rot);
    ctx.scale(R*breathe, R*breathe);

    // path
    ctx.beginPath();
    ctx.moveTo(pts[0][0],pts[0][1]);
    for(var k=1;k<pts.length;k++) ctx.lineTo(pts[k][0],pts[k][1]);
    ctx.closePath();

    // bounds for gradient
    var minY=pts[0][1],maxY=pts[0][1],minX=pts[0][0],maxX=pts[0][0];
    for(var k2=1;k2<pts.length;k2++){var px=pts[k2][0],py=pts[k2][1];if(py<minY)minY=py;if(py>maxY)maxY=py;if(px<minX)minX=px;if(px>maxX)maxX=px;}

    // translucent glassy body — linear gradient across the facet (refraction feel)
    var gx0=minX, gy0=minY, gx1=maxX, gy1=maxY;
    var lg=ctx.createLinearGradient(gx0,gy0,gx1,gy1);
    var bodyA=0.30 + 0.22*Math.sin(ts*0.0005 + f.phase*1.7);
    bodyA=Math.max(0.14,bodyA);
    lg.addColorStop(0, rgba(f.c2, bodyA*1.05));
    lg.addColorStop(0.5, rgba(f.c1, bodyA*0.78));
    lg.addColorStop(1, rgba(f.c2, bodyA*0.40));
    ctx.fillStyle=lg;
    ctx.fill();

    // crisp bright glassy rim
    var rimA=Math.max(0.18, 0.5 + 0.36*Math.sin(ts*0.0005 + f.phase*1.7));
    ctx.lineWidth=Math.max(1.1, R*0.0075);
    ctx.lineJoin='miter';
    ctx.strokeStyle=rgba(EDGE, rimA);
    ctx.stroke();

    // inner crystalline strut — a line from apex toward base (the "cut")
    ctx.beginPath();
    ctx.moveTo(pts[0][0],pts[0][1]);
    var midI=(pts.length/2)|0;
    ctx.lineTo(pts[midI][0]*0.5, pts[midI][1]*0.5);
    ctx.lineWidth=Math.max(0.8, R*0.004);
    ctx.strokeStyle=rgba(HILITE, rimA*0.55);
    ctx.stroke();

    // sharp apex glint
    var glintA=Math.max(0, 0.55*Math.sin(ts*0.0009 + f.phase*2.1));
    if(glintA>0.02){
      ctx.beginPath();
      ctx.arc(pts[0][0],pts[0][1], R*0.012*breathe + R*0.006, 0, 6.283);
      ctx.fillStyle=rgba(HILITE, glintA);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWedge(ts,R){
    for(var i=0;i<facets.length;i++){ drawFacet(ts,R,facets[i]); }
  }

  function paint(ts){
    var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2, aw=w*0.46, peak=h*0.40, R=Math.min(h*0.38,aw*0.66);
    ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,w,h);
    ctx.save(); almond(cx,cy,aw,peak); ctx.clip();
    ctx.fillStyle='#0a0c12';ctx.fillRect(0,0,w,h);
    var g=ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
    g.addColorStop(0,'rgba(170,195,255,0)');g.addColorStop(0.5,'rgba(200,220,255,0.12)');g.addColorStop(1,'rgba(236,243,255,0.46)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h); ctx.restore();
    ctx.save(); ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.clip();
    ctx.fillStyle='#08080a';ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.globalCompositeOperation='lighter'; var grot=ts*0.00004;
    for(var i=0;i<N;i++){ctx.save();ctx.translate(cx,cy);ctx.rotate(grot+i*seg);if(i%2===1)ctx.scale(1,-1);
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*1.02,0,seg);ctx.closePath();ctx.clip();
      drawWedge(ts,R);ctx.restore();}
    ctx.restore(); ctx.globalCompositeOperation='source-over';
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.fillStyle='#08080a';ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(14,68,255,.45)';ctx.lineWidth=DPR;ctx.stroke();
    ctx.beginPath();ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);ctx.fillStyle='#eaf1ff';ctx.fill();
    ctx.save(); almond(cx,cy,aw,peak); ctx.shadowColor='rgba(200,222,255,0.9)';ctx.shadowBlur=R*0.22;
    ctx.strokeStyle='rgba(236,243,255,0.55)';ctx.lineWidth=Math.max(1.2,R*0.022);ctx.stroke(); ctx.restore();
  }
  function frame(ts){fit();paint(ts);if(!reduce)requestAnimationFrame(frame);}
  fit();paint(0);if(!reduce){requestAnimationFrame(frame);document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(frame);});}
}

  /* ---- crystal-bloom ---- */
function eye_crystal_bloom(canvas, opts){
  var ctx=canvas.getContext('2d'); if(!ctx) return;
  var DPR=Math.min(window.devicePixelRatio||1,2);
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function fit(){var r=canvas.getBoundingClientRect();var w=Math.max(1,Math.round((r.width||320)*DPR)),h=Math.max(1,Math.round((r.height||218)*DPR));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
  fit(); window.addEventListener('resize',fit);
  var N=opts.N||10, seg=Math.PI*2/N;
  var COLS=opts.COLS||[[10,52,220],[24,92,255],[40,128,255],[64,158,255],[28,176,255],[120,196,255],[176,216,255],[222,240,255]];
  function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';}
  function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
  function mb(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var rnd=mb(opts.seed||20260617);

  // Build a dense voronoi-like seed field within one wedge: rings of cells blooming outward.
  // Each cell = a crystalline facet (seed point + local facet polygon), bright white seam between.
  var cells=[];
  var rings=6;
  for(var ri=0;ri<rings;ri++){
    var rBase=0.14+ (ri/rings)*0.84;          // radial position grows outward
    var perRing=3+ri*2;                          // denser further out -> bloom
    for(var ci=0;ci<perRing;ci++){
      var aSpread=seg*0.92;
      var a=(ci+0.5)/perRing*aSpread + (rnd()-0.5)*aSpread*0.18;
      var r=rBase + (rnd()-0.5)*0.08;
      var t=ri/(rings-1);
      // mid electric-blue core, brighter cells toward the rim
      var base=lerp(COLS[1],COLS[4], (rnd()*0.6+t*0.4));
      base=lerp(base, COLS[6], t*0.35*rnd());
      cells.push({
        r:Math.max(0.08,Math.min(0.99,r)), a:a,
        size:(0.10+ (1-t)*0.05 + rnd()*0.06), // inner facets a touch larger
        col:base,
        seedW:0.85+rnd()*0.5,                  // white seam intensity
        drift:0.25+rnd()*0.8,
        phase:rnd()*6.283,
        rot:rnd()*6.283,
        facets:4+((rnd()*3)|0)                  // crystalline polygon sides
      });
    }
  }

  function almond(cx,cy,aw,peak){ctx.beginPath();ctx.moveTo(cx-aw,cy);ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);ctx.closePath();}

  // Draw one polygonal crystalline facet with refractive edge-light + a bright seam stroke.
  function facet(x,y,sz,sides,rot,col,seamW,al){
    var pts=[];
    for(var k=0;k<sides;k++){
      var aa=rot + k*(Math.PI*2/sides);
      // irregular radius -> voronoi-ish cell shape, deterministic per vertex
      var jit=0.62+0.46*Math.abs(Math.sin(aa*1.7+rot*2.3));
      pts.push([x+Math.cos(aa)*sz*jit, y+Math.sin(aa)*sz*jit]);
    }
    // base translucent fill
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
    for(var k=1;k<sides;k++)ctx.lineTo(pts[k][0],pts[k][1]);
    ctx.closePath();
    ctx.fillStyle=rgba(col,Math.max(0.10,al*0.5));ctx.fill();

    // inner refraction core (brighter, smaller, offset) -> depth + glint
    ctx.beginPath();
    for(var k=0;k<sides;k++){
      var aa=rot + k*(Math.PI*2/sides);
      var jit=0.30+0.22*Math.abs(Math.sin(aa*1.7+rot*2.3));
      var px=x+Math.cos(aa)*sz*jit, py=y+Math.sin(aa)*sz*jit;
      if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.fillStyle=rgba(lerp(col,[235,246,255],0.6),Math.max(0.08,al*0.42));ctx.fill();

    // bright white SEAM between cells (the crystalline edges)
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
    for(var k=1;k<sides;k++)ctx.lineTo(pts[k][0],pts[k][1]);
    ctx.closePath();
    ctx.strokeStyle=rgba([238,247,255],Math.max(0.16,al*0.7*seamW));
    ctx.lineWidth=Math.max(1, sz*0.10);ctx.stroke();

    // sharp catch-glint on the leading vertex
    var gx=pts[0][0], gy=pts[0][1];
    ctx.beginPath();ctx.arc(gx,gy,sz*0.10,0,6.283);
    ctx.fillStyle=rgba([255,255,255],Math.max(0.10,al*0.6));ctx.fill();
  }

  function drawWedge(ts,R){
    for(var i=0;i<cells.length;i++){var s=cells[i];
      var breath=0.045*Math.sin(ts*0.00045*s.drift+s.phase);
      var rr=(s.r+breath)*R, ang=s.a + 0.02*Math.sin(ts*0.0003+s.phase);
      var x=Math.cos(ang)*rr, y=Math.sin(ang)*rr;
      var sz=s.size*R*(0.92+0.18*Math.sin(ts*0.00055+s.phase*1.3));
      var al=0.5+0.4*Math.sin(ts*0.0004+s.phase*1.6);
      var rot=s.rot+ts*0.00016*s.drift;
      facet(x,y,sz,s.facets,rot,s.col,s.seedW,al);
    }
    // faint outward bloom veins from center to add cohesion
    ctx.globalAlpha=0.5;
    for(var v=0;v<5;v++){
      var va=seg*(v+0.5)/5;
      ctx.beginPath();ctx.moveTo(0,0);
      ctx.lineTo(Math.cos(va)*R*1.0,Math.sin(va)*R*1.0);
      ctx.strokeStyle=rgba([150,196,255],0.10+0.06*Math.sin(ts*0.0004+v));
      ctx.lineWidth=Math.max(1,R*0.004);ctx.stroke();
    }
    ctx.globalAlpha=1;
  }

  function paint(ts){
    var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2, aw=w*0.46, peak=h*0.40, R=Math.min(h*0.38,aw*0.66);
    ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,w,h);
    ctx.save(); almond(cx,cy,aw,peak); ctx.clip();
    ctx.fillStyle='#0a0c12';ctx.fillRect(0,0,w,h);
    var g=ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
    g.addColorStop(0,'rgba(170,195,255,0)');g.addColorStop(0.5,'rgba(200,220,255,0.12)');g.addColorStop(1,'rgba(236,243,255,0.46)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h); ctx.restore();
    ctx.save(); ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.clip();
    // FILLED iris floor — saturated bloom-violet radial bed; no black between panes
    var bed=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
    bed.addColorStop(0,'rgba(200,80,160,1)');     // bright magenta center
    bed.addColorStop(0.55,'rgba(120,42,120,1)');  // mid plum
    bed.addColorStop(1,'rgba(58,18,82,1)');       // deep aubergine edge
    ctx.fillStyle=bed;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    // deep blue glow base under the bloom
    var gb=ctx.createRadialGradient(cx,cy,R*0.10,cx,cy,R);
    gb.addColorStop(0,'rgba(18,60,180,0.30)');gb.addColorStop(0.6,'rgba(10,30,90,0.18)');gb.addColorStop(1,'rgba(6,10,30,0)');
    ctx.fillStyle=gb;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.globalCompositeOperation='lighter'; var grot=ts*0.00004;
    for(var i=0;i<N;i++){ctx.save();ctx.translate(cx,cy);ctx.rotate(grot+i*seg);if(i%2===1)ctx.scale(1,-1);
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*1.02,0,seg);ctx.closePath();ctx.clip();
      drawWedge(ts,R);ctx.restore();}
    ctx.restore(); ctx.globalCompositeOperation='source-over';
    // pupil
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.fillStyle='#08080a';ctx.fill();
    var pr=ctx.createRadialGradient(cx,cy,R*0.30*0.5,cx,cy,R*0.30);
    pr.addColorStop(0,'rgba(0,0,0,0)');pr.addColorStop(1,'rgba(20,70,200,0.30)');
    ctx.fillStyle=pr;ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(40,120,255,.55)';ctx.lineWidth=DPR;ctx.stroke();
    // catch-light glint
    ctx.beginPath();ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);ctx.fillStyle='#eaf1ff';ctx.fill();
    // eyelid rim glow
    ctx.save(); almond(cx,cy,aw,peak); ctx.shadowColor='rgba(200,222,255,0.9)';ctx.shadowBlur=R*0.22;
    ctx.strokeStyle='rgba(236,243,255,0.55)';ctx.lineWidth=Math.max(1.2,R*0.022);ctx.stroke(); ctx.restore();
  }
  function frame(ts){fit();paint(ts);if(!reduce)requestAnimationFrame(frame);}
  fit();paint(0);if(!reduce){requestAnimationFrame(frame);document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(frame);});}
}

  /* ---- teal-nebula ---- */
function eye_teal_nebula(canvas, opts){
    var ctx=canvas.getContext('2d'); if(!ctx) return;
    var DPR=Math.min(window.devicePixelRatio||1,2);
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    function fit(){
      var r=canvas.getBoundingClientRect();
      var w=Math.max(1,Math.round((r.width||canvas.width||320)*DPR)),
          h=Math.max(1,Math.round((r.height||canvas.height||218)*DPR));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    }
    var cssW=canvas.width, cssH=canvas.height;
    canvas.style.width=cssW+'px'; canvas.style.height=cssH+'px';
    canvas.width=Math.round(cssW*DPR); canvas.height=Math.round(cssH*DPR);
    window.addEventListener('resize',function(){
      canvas.style.width=cssW+'px'; canvas.style.height=cssH+'px';
      canvas.width=Math.round(cssW*DPR); canvas.height=Math.round(cssH*DPR);
    });

    var N=opts.N||12, seg=Math.PI*2/N;
    // Teal-forward palette: deep navy -> electric blue -> cyan -> aqua -> teal-white -> ice
    var COLS=opts.COLS||[[10,40,120],[14,86,200],[20,150,200],[28,200,220],[90,225,225],[150,240,235],[224,248,255]];
    function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';}
    function mb(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
    var rnd=mb(opts.seed||20260618);

    // Soft drifting nebula puffs (the dreamy teal field) + sharp crystalline sparkle-shards.
    var clouds=[], sparks=[];
    for(var i=0;i<10;i++){
      clouds.push({
        r:0.16+rnd()*0.80, a:rnd()*seg,
        size:0.18+rnd()*0.34, col:COLS[2+((rnd()*4)|0)],
        drift:0.25+rnd()*0.8, phase:rnd()*6.283
      });
    }
    for(var j=0;j<11;j++){
      sparks.push({
        r:0.22+rnd()*0.72, a:rnd()*seg,
        size:0.018+rnd()*0.034, phase:rnd()*6.283, tw:0.6+rnd()*1.1
      });
    }

    function almond(cx,cy,aw,peak){ctx.beginPath();ctx.moveTo(cx-aw,cy);ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);ctx.closePath();}

    // ---- ELEVATED IRIS: flowing teal nebula + sharp white crystalline sparkle-shards ----
    function drawWedge(ts,R){
      // 1) dreamy teal cloud field: soft radial puffs, slow drift
      for(var i=0;i<clouds.length;i++){var c=clouds[i];
        var rr=(c.r+0.05*Math.sin(ts*0.0003*c.drift+c.phase))*R,
            ang=c.a+0.05*Math.sin(ts*0.00022+c.phase);
        var x=Math.cos(ang)*rr, y=Math.sin(ang)*rr;
        var sz=c.size*R*(0.9+0.18*Math.sin(ts*0.00045+c.phase*1.3));
        var al=0.22+0.16*Math.sin(ts*0.0004+c.phase*1.6);
        var g=ctx.createRadialGradient(x,y,0,x,y,sz);
        g.addColorStop(0,rgba(c.col,Math.max(0.10,al)));
        g.addColorStop(0.55,rgba(c.col,Math.max(0.05,al*0.5)));
        g.addColorStop(1,rgba(c.col,0));
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,sz,0,6.283);ctx.fill();
      }
      // 2) faint crystalline lattice rings: crisp polygon ridges give the cut-glass structure
      for(var s=0;s<6;s++){
        var fr=(0.18+s*0.135)*R, frot=ts*0.00012*(s%2?1:-1)+s*0.6;
        ctx.beginPath();
        for(var p=0;p<=5;p++){var pa=frot+p*(seg/5);ctx.lineTo(Math.cos(pa)*fr,Math.sin(pa)*fr);}
        ctx.strokeStyle=rgba(COLS[5],0.10+0.05*Math.sin(ts*0.0006+s));
        ctx.lineWidth=Math.max(0.6,R*0.004);ctx.stroke();
      }
      // 3) sharp white crystalline sparkle-shards: 4-point glints with halo + hot core
      for(var k=0;k<sparks.length;k++){var sp=sparks[k];
        var sr=(sp.r+0.03*Math.sin(ts*0.00035*sp.tw+sp.phase))*R, sa=sp.a;
        var sx=Math.cos(sa)*sr, sy=Math.sin(sa)*sr;
        var tw=0.5+0.5*Math.sin(ts*0.0013*sp.tw+sp.phase*6.283);
        var ssz=sp.size*R*(0.5+0.7*tw);
        ctx.save();ctx.translate(sx,sy);ctx.rotate(sp.phase+ts*0.00008);
        var gg=ctx.createRadialGradient(0,0,0,0,0,ssz*2.4);
        gg.addColorStop(0,rgba([235,248,255],Math.min(0.95,0.4+0.55*tw)));
        gg.addColorStop(0.4,rgba([150,235,255],0.22*tw));
        gg.addColorStop(1,rgba([150,235,255],0));
        ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,ssz*2.4,0,6.283);ctx.fill();
        ctx.fillStyle=rgba([240,250,255],Math.min(1,0.55+0.45*tw));
        for(var ax=0;ax<2;ax++){ctx.rotate(ax*1.5708);
          ctx.beginPath();ctx.moveTo(0,-ssz*3.0);ctx.lineTo(ssz*0.42,0);ctx.lineTo(0,ssz*3.0);ctx.lineTo(-ssz*0.42,0);ctx.closePath();ctx.fill();}
        ctx.beginPath();ctx.arc(0,0,ssz*0.6,0,6.283);ctx.fillStyle=rgba([255,255,255],Math.min(1,0.6+0.4*tw));ctx.fill();
        ctx.restore();
      }
    }

    function paint(ts){
      var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2, aw=w*0.46, peak=h*0.40, R=Math.min(h*0.38,aw*0.66);
      ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,w,h);
      // --- ALMOND + SCLERA (frame, identical to base) ---
      ctx.save(); almond(cx,cy,aw,peak); ctx.clip();
      ctx.fillStyle='#0a0c12';ctx.fillRect(0,0,w,h);
      var g=ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
      g.addColorStop(0,'rgba(170,195,255,0)');g.addColorStop(0.5,'rgba(200,220,255,0.12)');g.addColorStop(1,'rgba(236,243,255,0.46)');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h); ctx.restore();
      // --- IRIS DISC ---
      ctx.save(); ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.clip();
      ctx.fillStyle='#06080c';ctx.fillRect(cx-R,cy-R,R*2,R*2);
      // glowing teal core wash beneath the folds
      var coreG=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.9);
      coreG.addColorStop(0,'rgba(40,170,200,0.30)');coreG.addColorStop(0.5,'rgba(16,90,170,0.16)');coreG.addColorStop(1,'rgba(10,30,80,0)');
      ctx.fillStyle=coreG;ctx.fillRect(cx-R,cy-R,R*2,R*2);
      ctx.globalCompositeOperation='lighter'; var grot=ts*0.000045;
      for(var i=0;i<N;i++){ctx.save();ctx.translate(cx,cy);ctx.rotate(grot+i*seg);if(i%2===1)ctx.scale(1,-1);
        ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*1.02,0,seg);ctx.closePath();ctx.clip();
        drawWedge(ts,R);ctx.restore();}
      ctx.restore(); ctx.globalCompositeOperation='source-over';
      // --- PUPIL + PUPIL STROKE (frame; stroke tinted teal to match palette) ---
      ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.fillStyle='#06070a';ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(28,200,220,.5)';ctx.lineWidth=DPR;ctx.stroke();
      // --- CATCH-LIGHT GLINT (frame, identical) ---
      ctx.beginPath();ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);ctx.fillStyle='#eaf1ff';ctx.fill();
      // --- EYELID RIM GLOW (frame, identical) ---
      ctx.save(); almond(cx,cy,aw,peak); ctx.shadowColor='rgba(200,222,255,0.9)';ctx.shadowBlur=R*0.22;
      ctx.strokeStyle='rgba(236,243,255,0.55)';ctx.lineWidth=Math.max(1.2,R*0.022);ctx.stroke(); ctx.restore();
    }

    function frame(ts){paint(ts);if(!reduce)requestAnimationFrame(frame);}
    paint(0); // immediate first frame
    if(!reduce){
      requestAnimationFrame(frame);
      document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(frame);});
    }
  }

  /* ---- shattered-glass ---- */
function eye_shattered_glass(canvas, opts){
    var ctx;
    try{ ctx = canvas.getContext('2d'); }catch(e){ ctx = null; }
    if(!ctx) return; // guard against context failure — leave the dark frame

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var reduce = false;
    try{ reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches; }catch(e){}

    function fit(){
      var r = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round((r.width  || canvas.width  || 440) * DPR));
      var h = Math.max(1, Math.round((r.height || canvas.height || 300) * DPR));
      if(canvas.width !== w || canvas.height !== h){ canvas.width = w; canvas.height = h; }
    }
    fit();
    window.addEventListener('resize', fit);

    var N   = opts.N || 12, seg = Math.PI*2 / N;
    // Friday palette: deep electric blue -> mid -> teal/cyan -> ice white. High contrast.
    var COLS = opts.COLS || [
      [10,40,150],[14,68,255],[34,108,255],[64,140,255],
      [31,182,255],[120,196,255],[190,224,255],[236,246,255]
    ];

    function rgba(c,a){ return 'rgba('+c[0]+','+c[1]+','+c[2]+','+(a<0?0:a>1?1:a).toFixed(3)+')'; }
    function lerpC(a,b,t){ return [ a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t ]; }

    // mulberry32 — deterministic PRNG, seeded once at init.
    function mb(s){ return function(){ s|=0; s=s+0x6D2B79F5|0; var t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
    var rnd = mb(opts.seed || 20260619);

    // ---- BOLD FACETS: fewer, larger glass PLANES (the Shattered-Glass elevation) ----
    // Each shard is a chunky polygon (3-5 sides) tiling a wedge — a fractured pane.
    var shards = [];
    var COUNT = 9; // fewer + larger than the base's 16
    for(var i=0;i<COUNT;i++){
      var sides = 3 + ((rnd()*3)|0); // 3..5 sided panes
      var verts = [];
      var baseR = 0.05 + rnd()*0.16;
      for(var v=0; v<sides; v++){
        var va = (v/sides)*Math.PI*2 + rnd()*0.9;
        var vr = baseR * (0.55 + rnd()*0.95); // irregular, jagged glass
        verts.push([Math.cos(va)*vr, Math.sin(va)*vr]);
      }
      shards.push({
        r:     0.16 + rnd()*0.80,        // radial placement in the wedge
        a:     rnd()*seg,                // angular placement
        scale: 1.0 + rnd()*1.35,         // big planes
        col:   COLS[(rnd()*COLS.length)|0],
        col2:  COLS[(rnd()*COLS.length)|0],
        drift: 0.25 + rnd()*0.85,
        phase: rnd()*6.283,
        spin:  (rnd()<0.5?-1:1) * (0.10 + rnd()*0.22),
        verts: verts,
        // a per-shard light direction for flat-plane specular shading
        ldx:   Math.cos(rnd()*6.283),
        ldy:   Math.sin(rnd()*6.283),
        bright: rnd()                    // some panes read as bright glass
      });
    }

    function almond(cx,cy,aw,peak){
      ctx.beginPath();
      ctx.moveTo(cx-aw,cy);
      ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);
      ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);
      ctx.closePath();
    }

    // Draw one mirror wedge of the iris — the part that is distinct for this day.
    function drawWedge(ts,R){
      for(var i=0;i<shards.length;i++){
        var s = shards[i];
        // slow radial breathing + a gentle continuous turn within the wedge
        var rr  = (s.r + 0.035*Math.sin(ts*0.0004*s.drift + s.phase)) * R;
        var ang = s.a + 0.05*Math.sin(ts*0.00022*s.drift + s.phase*1.3);
        var cxp = Math.cos(ang)*rr, cyp = Math.sin(ang)*rr;
        var sz  = s.scale * 0.9 * R * (0.92 + 0.12*Math.sin(ts*0.0005 + s.phase));
        var rot = s.phase + ts*0.00016*s.spin;
        var cosR = Math.cos(rot), sinR = Math.sin(rot);

        // build the rotated/positioned pane polygon
        var pts = [], vx, vy, k;
        for(k=0;k<s.verts.length;k++){
          var vx0 = s.verts[k][0]*sz, vy0 = s.verts[k][1]*sz;
          vx = cxp + vx0*cosR - vy0*sinR;
          vy = cyp + vx0*sinR + vy0*cosR;
          pts.push([vx,vy]);
        }

        // flat-plane luminance: how the pane "faces" its light direction
        var nlen = Math.sqrt(cxp*cxp + cyp*cyp) + 1e-5;
        var facing = 0.5 + 0.5*((cxp/nlen)*s.ldx + (cyp/nlen)*s.ldy);
        var lum = 0.45 + 0.7*facing; // 0.45..1.15

        // base translucent fill — a gradient across the pane for depth
        var tone = (rr/R)*0.45 + 0.25 + 0.3*facing;
        tone = tone<0?0:tone>1?1:tone;
        var baseCol = lerpC(s.col, s.col2, tone);
        var al = 0.40 + 0.34*Math.sin(ts*0.0005 + s.phase*1.7);
        al = al<0.18?0.18:al;

        // glassy pane gradient (lit corner -> shadow corner)
        var gx0 = cxp + s.ldx*sz*0.6, gy0 = cyp + s.ldy*sz*0.6;
        var gx1 = cxp - s.ldx*sz*0.6, gy1 = cyp - s.ldy*sz*0.6;
        var grd = ctx.createLinearGradient(gx0,gy0,gx1,gy1);
        var liteC = lerpC(baseCol, [236,246,255], 0.45*lum);
        var darkC = lerpC(baseCol, [6,10,28], 0.55);
        grd.addColorStop(0,  rgba(liteC, Math.min(0.95, al*lum*1.15)));
        grd.addColorStop(0.5,rgba(baseCol, al*0.9));
        grd.addColorStop(1,  rgba(darkC, al*0.7));

        // ---- fill the pane ----
        ctx.beginPath();
        ctx.moveTo(pts[0][0],pts[0][1]);
        for(k=1;k<pts.length;k++) ctx.lineTo(pts[k][0],pts[k][1]);
        ctx.closePath();
        ctx.fillStyle = grd;
        ctx.fill();

        // ---- REFRACTION COLOR-SPLIT edge: a faint warm/blue offset rim ----
        ctx.save();
        ctx.lineJoin = 'round';
        // outer chromatic fringe — cyan
        ctx.strokeStyle = rgba([31,182,255], Math.min(0.5, al*0.6));
        ctx.lineWidth = Math.max(1, R*0.012);
        ctx.beginPath();
        ctx.moveTo(pts[0][0]+1.2,pts[0][1]);
        for(k=1;k<pts.length;k++) ctx.lineTo(pts[k][0]+1.2,pts[k][1]);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // ---- bright SPECULAR EDGE: crisp ice-white rim (the crystalline catch) ----
        ctx.beginPath();
        ctx.moveTo(pts[0][0],pts[0][1]);
        for(k=1;k<pts.length;k++) ctx.lineTo(pts[k][0],pts[k][1]);
        ctx.closePath();
        ctx.strokeStyle = rgba([236,246,255], Math.min(0.85, 0.30 + al*0.55*lum));
        ctx.lineWidth = Math.max(1, R*0.0075);
        ctx.stroke();

        // ---- specular HOTSPOT glint on the lit corner of bright panes ----
        if(s.bright > 0.5){
          var hx = cxp + s.ldx*sz*0.5, hy = cyp + s.ldy*sz*0.5;
          var hsz = sz*0.22*(0.7+0.5*Math.sin(ts*0.0009 + s.phase));
          var hg = ctx.createRadialGradient(hx,hy,0,hx,hy,Math.max(1,hsz));
          hg.addColorStop(0, rgba([255,255,255], Math.min(0.9, 0.5*lum)));
          hg.addColorStop(0.4, rgba([200,228,255], 0.30*lum));
          hg.addColorStop(1, 'rgba(200,228,255,0)');
          ctx.beginPath();
          ctx.arc(hx,hy,Math.max(1,hsz),0,6.283);
          ctx.fillStyle = hg;
          ctx.fill();
        }
      }
    }

    function paint(ts){
      var w = canvas.width, h = canvas.height, cx = w/2, cy = h/2;
      var aw = w*0.46, peak = h*0.40, R = Math.min(h*0.38, aw*0.66);

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0,0,w,h);

      // ---- ALMOND + SCLERA (identical frame) ----
      ctx.save();
      almond(cx,cy,aw,peak); ctx.clip();
      ctx.fillStyle = '#0a0c12'; ctx.fillRect(0,0,w,h);
      var g = ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
      g.addColorStop(0,'rgba(170,195,255,0)');
      g.addColorStop(0.5,'rgba(200,220,255,0.12)');
      g.addColorStop(1,'rgba(236,243,255,0.46)');
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
      ctx.restore();

      // ---- IRIS: clipped circle, additive faceted-glass kaleidoscope ----
      ctx.save();
      ctx.beginPath(); ctx.arc(cx,cy,R,0,6.283); ctx.clip();
      ctx.fillStyle = '#08080a'; ctx.fillRect(cx-R,cy-R,R*2,R*2); // near-black between panes
      // faint cold base wash so the dark reads as deep glass, not flat black
      var ig = ctx.createRadialGradient(cx,cy,0,cx,cy,R);
      ig.addColorStop(0,'rgba(20,42,96,0.55)');
      ig.addColorStop(0.6,'rgba(10,20,52,0.35)');
      ig.addColorStop(1,'rgba(4,8,22,0)');
      ctx.fillStyle = ig; ctx.fillRect(cx-R,cy-R,R*2,R*2);

      ctx.globalCompositeOperation = 'lighter';
      var grot = ts*0.00004; // very slow whole-iris turn
      for(var i=0;i<N;i++){
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(grot + i*seg);
        if(i%2===1) ctx.scale(1,-1); // mirror alternating wedges -> kaleidoscope fold
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,R*1.02,0,seg); ctx.closePath(); ctx.clip();
        drawWedge(ts,R);
        ctx.restore();
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      // central bright kaleidoscope core (shattered light converging)
      var coreG = ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.40);
      coreG.addColorStop(0,'rgba(236,246,255,0.55)');
      coreG.addColorStop(0.5,'rgba(120,180,255,0.18)');
      coreG.addColorStop(1,'rgba(120,180,255,0)');
      ctx.beginPath(); ctx.arc(cx,cy,R*0.40,0,6.283); ctx.fillStyle = coreG; ctx.fill();

      // ---- PUPIL (identical frame) ----
      ctx.beginPath(); ctx.arc(cx,cy,R*0.30,0,6.283); ctx.fillStyle = '#08080a'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,R*0.30,0,6.283);
      ctx.strokeStyle = 'rgba(14,68,255,.45)'; ctx.lineWidth = DPR; ctx.stroke();

      // ---- CATCH-LIGHT GLINT (identical frame) ----
      ctx.beginPath(); ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);
      ctx.fillStyle = '#eaf1ff'; ctx.fill();

      // ---- EYELID RIM GLOW (identical frame) ----
      ctx.save();
      almond(cx,cy,aw,peak);
      ctx.shadowColor = 'rgba(200,222,255,0.9)'; ctx.shadowBlur = R*0.22;
      ctx.strokeStyle = 'rgba(236,243,255,0.55)'; ctx.lineWidth = Math.max(1.2,R*0.022);
      ctx.stroke();
      ctx.restore();
    }

    function frame(ts){ fit(); paint(ts); if(!reduce) requestAnimationFrame(frame); }

    // immediate first paint so it is never blank on a hidden/throttled tab
    fit(); paint(0);
    if(!reduce){
      requestAnimationFrame(frame);
      document.addEventListener('visibilitychange', function(){ if(!document.hidden) requestAnimationFrame(frame); });
    }
  }

  /* ---- sapphire-jewel ---- */
function eye_sapphire_jewel(canvas, opts){
  var ctx=canvas.getContext('2d'); if(!ctx) return;
  var DPR=Math.min(window.devicePixelRatio||1,2);
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function fit(){var r=canvas.getBoundingClientRect();var w=Math.max(1,Math.round((r.width||320)*DPR)),h=Math.max(1,Math.round((r.height||218)*DPR));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
  fit(); window.addEventListener('resize',fit);

  var N=opts.N||12, seg=Math.PI*2/N;
  /* Saturated sapphire gemstone ramp — abyssal blue -> royal -> electric -> cold white edge */
  var COLS=opts.COLS||[
    [6,22,92],     /* abyss sapphire */
    [10,40,150],   /* deep royal */
    [18,68,210],   /* sapphire */
    [34,108,255],  /* electric blue */
    [70,140,255],  /* bright */
    [120,180,255], /* sky facet */
    [30,160,235],  /* teal-blue glint */
    [180,214,255], /* pale ice */
    [224,238,255]  /* cold white edge */
  ];
  function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';}
  function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
  function mb(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

  var rnd=mb(opts.seed||20260620);

  /* ---- LAYER A: deep facets (broad, translucent, slow, the gemstone body) ---- */
  var facets=[];
  for(var i=0;i<13;i++){
    facets.push({
      r:0.16+rnd()*0.80,
      a:rnd()*seg,
      size:0.12+rnd()*0.22,
      col:COLS[1+((rnd()*5)|0)],          /* deep/royal/sapphire/electric band */
      edge:COLS[7+((rnd()*2)|0)],         /* ice / cold-white edge light */
      drift:0.25+rnd()*0.7,
      phase:rnd()*6.283,
      sides:(rnd()<0.5?4:5),              /* cut-stone polygons */
      orient:rnd()*6.283
    });
  }
  /* ---- LAYER B: the cut crown — finer, brighter shards stacked on top ---- */
  var crown=[];
  for(var j=0;j<11;j++){
    crown.push({
      r:0.22+rnd()*0.66,
      a:rnd()*seg,
      size:0.05+rnd()*0.12,
      col:COLS[3+((rnd()*5)|0)],          /* electric -> ice */
      drift:0.45+rnd()*1.1,
      phase:rnd()*6.283,
      orient:rnd()*6.283
    });
  }

  function almond(cx,cy,aw,peak){ctx.beginPath();ctx.moveTo(cx-aw,cy);ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);ctx.closePath();}

  function polyPath(x,y,sz,sides,rot){
    ctx.beginPath();
    for(var k=0;k<sides;k++){
      var aa=rot+k*(Math.PI*2/sides);
      var px=x+Math.cos(aa)*sz, py=y+Math.sin(aa)*sz;
      if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();
  }

  function drawWedge(ts,R){
    var i,s,rr,ang,x,y,sz,al,rot;

    /* LAYER A — deep translucent gemstone body. Faceted polygons with a refracted
       inner highlight (a second smaller poly offset toward the light) + cold edge stroke. */
    for(i=0;i<facets.length;i++){
      s=facets[i];
      rr=(s.r+0.05*Math.sin(ts*0.00035*s.drift+s.phase))*R;
      ang=s.a;
      x=Math.cos(ang)*rr; y=Math.sin(ang)*rr;
      sz=s.size*R*(0.92+0.14*Math.sin(ts*0.00045+s.phase));
      al=0.34+0.28*Math.sin(ts*0.0004+s.phase*1.6);
      rot=s.orient+ts*0.00012*s.drift;

      /* depth shade: tint deepens with radius so the stone feels recessed at center */
      var depth=Math.min(1,rr/R);
      var body=lerp(s.col,[6,22,92],0.35*(1-depth));

      polyPath(x,y,sz,s.sides,rot);
      ctx.fillStyle=rgba(body,Math.max(0.12,al*0.55));
      ctx.fill();

      /* inner refraction plane — brighter, offset toward upper-left light source */
      var lx=x-sz*0.22, ly=y-sz*0.26;
      polyPath(lx,ly,sz*0.56,s.sides,rot+0.5);
      ctx.fillStyle=rgba(lerp(s.col,[120,180,255],0.5),Math.max(0.08,al*0.42));
      ctx.fill();

      /* cold refracted edge */
      polyPath(x,y,sz,s.sides,rot);
      ctx.strokeStyle=rgba(s.edge,Math.max(0.10,al*0.55));
      ctx.lineWidth=Math.max(1,R*0.009);
      ctx.stroke();
    }

    /* LAYER B — the cut crown: brighter, sharper triangular shards riding on top,
       each with a crisp specular tip. Faster drift so the surface scintillates. */
    for(i=0;i<crown.length;i++){
      s=crown[i];
      rr=(s.r+0.06*Math.sin(ts*0.0006*s.drift+s.phase))*R;
      ang=s.a;
      x=Math.cos(ang)*rr; y=Math.sin(ang)*rr;
      sz=s.size*R*(0.88+0.30*Math.sin(ts*0.0007+s.phase));
      al=0.42+0.42*Math.sin(ts*0.00055+s.phase*1.9);
      rot=s.orient+ts*0.00026*s.drift;

      polyPath(x,y,sz,3,rot);
      ctx.fillStyle=rgba(s.col,Math.max(0.14,al*0.6));
      ctx.fill();
      ctx.strokeStyle=rgba([224,238,255],Math.max(0.08,al*0.5));
      ctx.lineWidth=Math.max(1,R*0.006);
      ctx.stroke();

      /* specular sparkle tip — tiny bright dot where light catches the facet apex */
      var spk=al;
      if(spk>0.62){
        var tipx=x+Math.cos(rot)*sz, tipy=y+Math.sin(rot)*sz;
        ctx.beginPath();
        ctx.arc(tipx,tipy,Math.max(0.8,R*0.012*(spk-0.55)*3),0,6.283);
        ctx.fillStyle=rgba([235,245,255],Math.min(0.85,(spk-0.55)*1.6));
        ctx.fill();
      }
    }
  }

  function paint(ts){
    var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2, aw=w*0.46, peak=h*0.40, R=Math.min(h*0.38,aw*0.66);
    ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,w,h);

    /* ---- almond eye + white sclera glow (FRAME, identical to base) ---- */
    ctx.save(); almond(cx,cy,aw,peak); ctx.clip();
    ctx.fillStyle='#0a0c12';ctx.fillRect(0,0,w,h);
    var g=ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
    g.addColorStop(0,'rgba(170,195,255,0)');g.addColorStop(0.5,'rgba(200,220,255,0.12)');g.addColorStop(1,'rgba(236,243,255,0.46)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h); ctx.restore();

    /* ---- iris disc ---- */
    ctx.save(); ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.clip();
    /* FILLED iris floor — saturated sapphire radial bed; no black between panes */
    var bed=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
    bed.addColorStop(0,'rgba(28,84,200,1)');      /* bright sapphire center */
    bed.addColorStop(0.55,'rgba(18,52,160,1)');   /* mid royal blue */
    bed.addColorStop(1,'rgba(10,28,110,1)');      /* deep navy edge */
    ctx.fillStyle=bed;ctx.fillRect(cx-R,cy-R,R*2,R*2);

    /* electric-blue inner glow under the kaleidoscope — the bright heart of the jewel */
    var core=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.95);
    core.addColorStop(0,'rgba(60,140,255,0.55)');
    core.addColorStop(0.35,'rgba(28,90,235,0.30)');
    core.addColorStop(0.7,'rgba(12,44,150,0.14)');
    core.addColorStop(1,'rgba(6,20,80,0)');
    ctx.fillStyle=core;ctx.fillRect(cx-R,cy-R,R*2,R*2);

    ctx.globalCompositeOperation='lighter'; var grot=ts*0.00004;
    for(var i=0;i<N;i++){
      ctx.save();ctx.translate(cx,cy);ctx.rotate(grot+i*seg);if(i%2===1)ctx.scale(1,-1);
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*1.02,0,seg);ctx.closePath();ctx.clip();
      drawWedge(ts,R);ctx.restore();
    }

    /* faceted limbal ring — darken the outer edge of the iris for gemstone containment */
    ctx.globalCompositeOperation='source-over';
    var limb=ctx.createRadialGradient(cx,cy,R*0.78,cx,cy,R);
    limb.addColorStop(0,'rgba(4,10,40,0)');
    limb.addColorStop(1,'rgba(2,6,28,0.72)');
    ctx.fillStyle=limb;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.fill();
    ctx.restore();

    ctx.globalCompositeOperation='source-over';

    /* ---- pupil (FRAME, identical to base) ---- */
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.fillStyle='#08080a';ctx.fill();
    /* a faint electric ring glowing up from beneath the pupil edge — the heart shows through */
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(34,108,255,.55)';ctx.lineWidth=DPR*1.4;ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(14,68,255,.45)';ctx.lineWidth=DPR;ctx.stroke();

    /* ---- catch-light glint (FRAME, identical to base) ---- */
    ctx.beginPath();ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);ctx.fillStyle='#eaf1ff';ctx.fill();

    /* ---- soft white eyelid rim glow (FRAME, identical to base) ---- */
    ctx.save(); almond(cx,cy,aw,peak); ctx.shadowColor='rgba(200,222,255,0.9)';ctx.shadowBlur=R*0.22;
    ctx.strokeStyle='rgba(236,243,255,0.55)';ctx.lineWidth=Math.max(1.2,R*0.022);ctx.stroke(); ctx.restore();
  }

  function frame(ts){fit();paint(ts);if(!reduce)requestAnimationFrame(frame);}
  fit();paint(0);if(!reduce){requestAnimationFrame(frame);document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(frame);});}
}

  /* ---- summit ---- */
function eye_summit(canvas, opts){
  var ctx = canvas.getContext('2d'); if(!ctx) return;
  var DPR = Math.min(window.devicePixelRatio||1, 2);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function fit(){
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round((r.width||320)*DPR));
    var h = Math.max(1, Math.round((r.height||218)*DPR));
    if(canvas.width!==w || canvas.height!==h){ canvas.width=w; canvas.height=h; }
  }
  fit(); window.addEventListener('resize', fit);

  var N = opts.N || 12, seg = Math.PI*2 / N;
  var COLS = opts.COLS || [
    [10,52,255],
    [30,104,255],
    [64,150,255],
    [110,196,255],
    [0,200,235],
    [70,224,224],
    [180,232,255],
    [232,246,255]
  ];
  function rgba(c,a){ return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')'; }

  function mb(s){ return function(){ s|=0; s=s+0x6D2B79F5|0; var t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  var rnd = mb(opts.seed||20260621);

  var shardsA = [];
  for(var i=0;i<26;i++){
    shardsA.push({
      r: 0.16 + rnd()*0.86,
      a: rnd()*seg,
      size: 0.05 + rnd()*0.155,
      col: COLS[(rnd()*COLS.length)|0],
      hot: COLS[6 + ((rnd()*2)|0)],
      drift: 0.30 + rnd()*1.05,
      phase: rnd()*6.283,
      sides: 3 + ((rnd()*3)|0),
      spin: (rnd()<0.5?-1:1)*(0.6+rnd()*0.9)
    });
  }
  var shardsB = [];
  for(var j=0;j<18;j++){
    shardsB.push({
      r: 0.22 + rnd()*0.80,
      a: rnd()*seg,
      size: 0.035 + rnd()*0.10,
      col: COLS[3 + ((rnd()*5)|0)],
      drift: 0.45 + rnd()*1.15,
      phase: rnd()*6.283,
      spin: (rnd()<0.5?-1:1)*(0.9+rnd()*1.3)
    });
  }
  var RAYS = 16, rays = [];
  for(var k=0;k<RAYS;k++){
    rays.push({ a: (k/RAYS)*Math.PI*2, len: 0.55+rnd()*0.42, w: 0.5+rnd()*0.6, ph: rnd()*6.283 });
  }

  function almond(cx,cy,aw,peak){
    ctx.beginPath();
    ctx.moveTo(cx-aw,cy);
    ctx.quadraticCurveTo(cx, cy-peak*2, cx+aw, cy);
    ctx.quadraticCurveTo(cx, cy+peak*2, cx-aw, cy);
    ctx.closePath();
  }

  function poly(x,y,sz,sides,rot){
    ctx.beginPath();
    for(var k=0;k<sides;k++){
      var aa = rot + k*(Math.PI*2/sides);
      var px = x + Math.cos(aa)*sz, py = y + Math.sin(aa)*sz;
      if(k===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.closePath();
  }

  function drawWedge(ts, R){
    var t = ts;

    for(var i=0;i<shardsA.length;i++){
      var s = shardsA[i];
      var breathe = 0.045*Math.sin(t*0.00045*s.drift + s.phase);
      var rr = (s.r + breathe)*R, ang = s.a;
      var x = Math.cos(ang)*rr, y = Math.sin(ang)*rr;
      var sz = s.size*R*(0.85 + 0.26*Math.sin(t*0.0006 + s.phase));
      var al = 0.42 + 0.42*Math.sin(t*0.00052 + s.phase*1.7);
      var rot = s.phase + t*0.00020*s.drift*s.spin;

      poly(x,y,sz,s.sides,rot);
      ctx.fillStyle = rgba(s.col, Math.max(0.12, al*0.60));
      ctx.fill();
      ctx.strokeStyle = rgba(s.hot, Math.max(0.10, al*0.62));
      ctx.lineWidth = Math.max(1, R*0.0075);
      ctx.stroke();
      poly(x,y,sz*0.50,s.sides,-rot*0.7);
      ctx.fillStyle = rgba(s.hot, Math.max(0.06, al*0.30));
      ctx.fill();
    }

    for(var b=0;b<shardsB.length;b++){
      var q = shardsB[b];
      var rr2 = (q.r + 0.05*Math.sin(t*0.0005*q.drift + q.phase))*R;
      var x2 = Math.cos(q.a)*rr2, y2 = Math.sin(q.a)*rr2;
      var sz2 = q.size*R*(0.9 + 0.3*Math.sin(t*0.0008 + q.phase*1.3));
      var al2 = 0.30 + 0.45*Math.abs(Math.sin(t*0.0007 + q.phase));
      var rot2 = q.phase - t*0.00034*q.drift*q.spin;
      ctx.save();
      ctx.translate(x2,y2);
      ctx.rotate(rot2);
      ctx.beginPath();
      ctx.moveTo(0,-sz2*1.7);
      ctx.lineTo(sz2*0.55,0);
      ctx.lineTo(0,sz2*1.7);
      ctx.lineTo(-sz2*0.55,0);
      ctx.closePath();
      ctx.fillStyle = rgba(q.col, Math.max(0.10, al2*0.55));
      ctx.fill();
      ctx.strokeStyle = rgba([235,247,255], Math.max(0.08, al2*0.5));
      ctx.lineWidth = Math.max(1, R*0.0055);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawStarburst(ts, cx, cy, R){
    var t = ts;
    var inner = R*0.305, peakR = R*0.62;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.globalCompositeOperation = 'lighter';
    var spin = t*0.00012;
    for(var k=0;k<rays.length;k++){
      var ry = rays[k];
      var pulse = 0.45 + 0.55*Math.pow(Math.abs(Math.sin(t*0.0009 + ry.ph)), 2.0);
      var a = ry.a + spin*(k%2? 1 : 0.7);
      var L = inner + (peakR-inner)*ry.len*(0.7+0.3*pulse);
      var ca = Math.cos(a), sa = Math.sin(a);
      var bw = (R*0.012)*ry.w*(0.6+pulse);
      var nx = -sa, ny = ca;
      ctx.beginPath();
      ctx.moveTo(ca*inner + nx*bw, sa*inner + ny*bw);
      ctx.lineTo(ca*L, sa*L);
      ctx.lineTo(ca*inner - nx*bw, sa*inner - ny*bw);
      ctx.closePath();
      ctx.fillStyle = rgba([238,247,255], 0.32*pulse + 0.06);
      ctx.fill();
    }
    var rg = ctx.createRadialGradient(0,0, inner*0.92, 0,0, inner*1.5);
    rg.addColorStop(0, 'rgba(120,200,255,0.0)');
    rg.addColorStop(0.55, 'rgba(190,228,255,0.34)');
    rg.addColorStop(1, 'rgba(120,190,255,0.0)');
    ctx.beginPath(); ctx.arc(0,0, inner*1.5, 0, 6.283); ctx.fillStyle = rg; ctx.fill();
    ctx.restore();
  }

  function paint(ts){
    var w = canvas.width, h = canvas.height, cx = w/2, cy = h/2;
    var aw = w*0.46, peak = h*0.40, R = Math.min(h*0.38, aw*0.66);

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0,0,w,h);

    ctx.save();
    almond(cx,cy,aw,peak); ctx.clip();
    ctx.fillStyle = '#0a0c12'; ctx.fillRect(0,0,w,h);
    var g = ctx.createRadialGradient(cx,cy, R*0.55, cx,cy, aw*1.02);
    g.addColorStop(0,  'rgba(170,195,255,0)');
    g.addColorStop(0.5,'rgba(200,220,255,0.12)');
    g.addColorStop(1,  'rgba(236,243,255,0.46)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy, R, 0, 6.283); ctx.clip();
    // FILLED iris floor — saturated summit-teal radial bed; no black between panes
    var bed = ctx.createRadialGradient(cx,cy,0,cx,cy,R);
    bed.addColorStop(0,'rgba(30,160,180,1)');     // bright teal center (Summit elevation)
    bed.addColorStop(0.55,'rgba(18,90,140,1)');   // mid deep teal-blue
    bed.addColorStop(1,'rgba(10,40,90,1)');       // deep navy edge
    ctx.fillStyle = bed; ctx.fillRect(cx-R, cy-R, R*2, R*2);

    var ir = ctx.createRadialGradient(cx,cy, R*0.28, cx,cy, R);
    ir.addColorStop(0, 'rgba(8,20,60,0.0)');
    ir.addColorStop(1, 'rgba(4,10,40,0.55)');
    ctx.fillStyle = ir; ctx.fillRect(cx-R, cy-R, R*2, R*2);

    ctx.globalCompositeOperation = 'lighter';
    var grot = ts*0.00004;
    for(var i=0;i<N;i++){
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(grot + i*seg);
      if(i%2===1) ctx.scale(1,-1);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0, R*1.02, 0, seg); ctx.closePath(); ctx.clip();
      drawWedge(ts, R);
      ctx.restore();
    }
    drawStarburst(ts, cx, cy, R);
    ctx.restore();

    ctx.globalCompositeOperation = 'source-over';

    ctx.beginPath(); ctx.arc(cx,cy, R*0.30, 0, 6.283); ctx.fillStyle = '#08080a'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy, R*0.30, 0, 6.283);
    ctx.strokeStyle = 'rgba(14,68,255,.45)'; ctx.lineWidth = DPR; ctx.stroke();

    ctx.beginPath(); ctx.arc(cx - R*0.10, cy - R*0.13, R*0.05, 0, 6.283);
    ctx.fillStyle = '#eaf1ff'; ctx.fill();

    ctx.save();
    almond(cx,cy,aw,peak);
    ctx.shadowColor = 'rgba(200,222,255,0.9)'; ctx.shadowBlur = R*0.22;
    ctx.strokeStyle = 'rgba(236,243,255,0.55)';
    ctx.lineWidth = Math.max(1.2, R*0.022);
    ctx.stroke();
    ctx.restore();
  }

  function frame(ts){ fit(); paint(ts); if(!reduce) requestAnimationFrame(frame); }

  fit(); paint(0);
  if(!reduce){
    requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) requestAnimationFrame(frame); });
  }
}

  /* ---- sapphire-fill ---- */
function eye_sapphire_fill(canvas, opts){
  var ctx=canvas.getContext('2d'); if(!ctx) return;
  var DPR=Math.min(window.devicePixelRatio||1,2);
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function fit(){var r=canvas.getBoundingClientRect();var w=Math.max(1,Math.round((r.width||320)*DPR)),h=Math.max(1,Math.round((r.height||218)*DPR));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
  fit(); window.addEventListener('resize',fit);

  var N=opts.N||12, seg=Math.PI*2/N;
  /* Saturated sapphire gemstone ramp — abyssal blue -> royal -> electric -> cold white edge */
  var COLS=opts.COLS||[
    [6,22,92],     /* abyss sapphire */
    [10,40,150],   /* deep royal */
    [18,68,210],   /* sapphire */
    [34,108,255],  /* electric blue */
    [70,140,255],  /* bright */
    [120,180,255], /* sky facet */
    [30,160,235],  /* teal-blue glint */
    [180,214,255], /* pale ice */
    [224,238,255]  /* cold white edge */
  ];
  function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';}
  function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
  function mb(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

  var rnd=mb(opts.seed||20260620);

  /* ---- LAYER A: deep facets (broad, translucent, slow, the gemstone body) ---- */
  var facets=[];
  for(var i=0;i<34;i++){
    facets.push({
      r:0.16+rnd()*0.80,
      a:rnd()*seg,
      size:0.08+rnd()*0.13,
      col:COLS[1+((rnd()*6)|0)],          /* royal..electric..teal-glint (richer variation) */
      edge:COLS[5+((rnd()*2)|0)],         /* sky/teal edge (soft, not stark white) */
      drift:0.25+rnd()*0.7,
      phase:rnd()*6.283,
      sides:(rnd()<0.5?4:5),              /* cut-stone polygons */
      orient:rnd()*6.283
    });
  }
  /* ---- LAYER B: the cut crown — finer, brighter shards stacked on top ---- */
  var crown=[];
  for(var j=0;j<26;j++){
    crown.push({
      r:0.22+rnd()*0.66,
      a:rnd()*seg,
      size:0.035+rnd()*0.075,
      col:COLS[3+((rnd()*5)|0)],          /* electric -> ice */
      drift:0.45+rnd()*1.1,
      phase:rnd()*6.283,
      orient:rnd()*6.283
    });
  }

  function almond(cx,cy,aw,peak){ctx.beginPath();ctx.moveTo(cx-aw,cy);ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);ctx.closePath();}

  function polyPath(x,y,sz,sides,rot){
    ctx.beginPath();
    for(var k=0;k<sides;k++){
      var aa=rot+k*(Math.PI*2/sides);
      var px=x+Math.cos(aa)*sz, py=y+Math.sin(aa)*sz;
      if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();
  }

  function drawWedge(ts,R){
    var i,s,rr,ang,x,y,sz,al,rot;

    /* LAYER A — deep translucent gemstone body. Faceted polygons with a refracted
       inner highlight (a second smaller poly offset toward the light) + cold edge stroke. */
    for(i=0;i<facets.length;i++){
      s=facets[i];
      rr=(s.r+0.05*Math.sin(ts*0.00035*s.drift+s.phase))*R;
      ang=s.a;
      x=Math.cos(ang)*rr; y=Math.sin(ang)*rr;
      sz=s.size*R*(0.92+0.14*Math.sin(ts*0.00045+s.phase));
      al=0.34+0.28*Math.sin(ts*0.0004+s.phase*1.6);
      rot=s.orient+ts*0.00012*s.drift;

      /* depth shade: tint deepens with radius so the stone feels recessed at center */
      var depth=Math.min(1,rr/R);
      var body=lerp(s.col,[6,22,92],0.35*(1-depth));

      polyPath(x,y,sz,s.sides,rot);
      ctx.fillStyle=rgba(body,Math.max(0.12,al*0.55));
      ctx.fill();

      /* inner refraction plane — brighter, offset toward upper-left light source */
      var lx=x-sz*0.22, ly=y-sz*0.26;
      polyPath(lx,ly,sz*0.56,s.sides,rot+0.5);
      ctx.fillStyle=rgba(lerp(s.col,[120,180,255],0.32),Math.max(0.06,al*0.28));
      ctx.fill();

      /* cold refracted edge */
      polyPath(x,y,sz,s.sides,rot);
      ctx.strokeStyle=rgba(s.edge,Math.max(0.06,al*0.30));
      ctx.lineWidth=Math.max(1,R*0.009);
      ctx.stroke();
    }

    /* LAYER B — the cut crown: brighter, sharper triangular shards riding on top,
       each with a crisp specular tip. Faster drift so the surface scintillates. */
    for(i=0;i<crown.length;i++){
      s=crown[i];
      rr=(s.r+0.06*Math.sin(ts*0.0006*s.drift+s.phase))*R;
      ang=s.a;
      x=Math.cos(ang)*rr; y=Math.sin(ang)*rr;
      sz=s.size*R*(0.88+0.30*Math.sin(ts*0.0007+s.phase));
      al=0.42+0.42*Math.sin(ts*0.00055+s.phase*1.9);
      rot=s.orient+ts*0.00026*s.drift;

      polyPath(x,y,sz,3,rot);
      ctx.fillStyle=rgba(s.col,Math.max(0.14,al*0.6));
      ctx.fill();
      ctx.strokeStyle=rgba([175,208,255],Math.max(0.05,al*0.30));
      ctx.lineWidth=Math.max(1,R*0.006);
      ctx.stroke();

      /* specular sparkle tip — tiny bright dot where light catches the facet apex */
      var spk=al;
      if(spk>0.62){
        var tipx=x+Math.cos(rot)*sz, tipy=y+Math.sin(rot)*sz;
        ctx.beginPath();
        ctx.arc(tipx,tipy,Math.max(0.8,R*0.012*(spk-0.55)*3),0,6.283);
        ctx.fillStyle=rgba([235,245,255],Math.min(0.85,(spk-0.55)*1.6));
        ctx.fill();
      }
    }
  }

  function paint(ts){
    var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2, aw=w*0.46, peak=h*0.40, R=Math.min(h*0.38,aw*0.66);
    ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,w,h);

    /* ---- almond eye + white sclera glow (FRAME, identical to base) ---- */
    ctx.save(); almond(cx,cy,aw,peak); ctx.clip();
    ctx.fillStyle='#0a0c12';ctx.fillRect(0,0,w,h);
    var g=ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
    g.addColorStop(0,'rgba(170,195,255,0)');g.addColorStop(0.5,'rgba(200,220,255,0.12)');g.addColorStop(1,'rgba(236,243,255,0.46)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h); ctx.restore();

    /* ---- iris disc ---- */
    ctx.save(); ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.clip();
    var bed=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
    bed.addColorStop(0,'rgba(22,70,190,1)');
    bed.addColorStop(0.55,'rgba(14,50,156,1)');
    bed.addColorStop(1,'rgba(9,32,110,1)');
    ctx.fillStyle=bed;ctx.fillRect(cx-R,cy-R,R*2,R*2); /* FILLED: saturated sapphire bed, no black */

    /* electric-blue inner glow under the kaleidoscope — the bright heart of the jewel */
    var core=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.95);
    core.addColorStop(0,'rgba(60,140,255,0.55)');
    core.addColorStop(0.35,'rgba(28,90,235,0.30)');
    core.addColorStop(0.7,'rgba(12,44,150,0.14)');
    core.addColorStop(1,'rgba(6,20,80,0)');
    ctx.fillStyle=core;ctx.fillRect(cx-R,cy-R,R*2,R*2);

    ctx.globalCompositeOperation='lighter'; var grot=ts*0.00004;
    for(var i=0;i<N;i++){
      ctx.save();ctx.translate(cx,cy);ctx.rotate(grot+i*seg);if(i%2===1)ctx.scale(1,-1);
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*1.02,0,seg);ctx.closePath();ctx.clip();
      drawWedge(ts,R);ctx.restore();
    }

    /* faceted limbal ring — darken the outer edge of the iris for gemstone containment */
    ctx.globalCompositeOperation='source-over';
    var limb=ctx.createRadialGradient(cx,cy,R*0.78,cx,cy,R);
    limb.addColorStop(0,'rgba(4,10,40,0)');
    limb.addColorStop(1,'rgba(7,28,104,0.42)');
    ctx.fillStyle=limb;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.fill();
    ctx.restore();

    ctx.globalCompositeOperation='source-over';

    /* ---- pupil (FRAME, identical to base) ---- */
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.fillStyle='#08080a';ctx.fill();
    /* a faint electric ring glowing up from beneath the pupil edge — the heart shows through */
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(34,108,255,.55)';ctx.lineWidth=DPR*1.4;ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(14,68,255,.45)';ctx.lineWidth=DPR;ctx.stroke();

    /* ---- catch-light glint (FRAME, identical to base) ---- */
    ctx.beginPath();ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);ctx.fillStyle='#eaf1ff';ctx.fill();

    /* ---- soft white eyelid rim glow (FRAME, identical to base) ---- */
    ctx.save(); almond(cx,cy,aw,peak); ctx.shadowColor='rgba(200,222,255,0.9)';ctx.shadowBlur=R*0.22;
    ctx.strokeStyle='rgba(236,243,255,0.55)';ctx.lineWidth=Math.max(1.2,R*0.022);ctx.stroke(); ctx.restore();
  }

  function frame(ts){fit();paint(ts);if(!reduce)requestAnimationFrame(frame);}
  fit();paint(0);if(!reduce){requestAnimationFrame(frame);document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(frame);});}
}

  /* ---- shattered-fill ---- */
function eye_shattered_fill(canvas, opts){
    var ctx;
    try{ ctx = canvas.getContext('2d'); }catch(e){ ctx = null; }
    if(!ctx) return; // guard against context failure — leave the dark frame

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var reduce = false;
    try{ reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches; }catch(e){}

    function fit(){
      var r = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round((r.width  || canvas.width  || 440) * DPR));
      var h = Math.max(1, Math.round((r.height || canvas.height || 300) * DPR));
      if(canvas.width !== w || canvas.height !== h){ canvas.width = w; canvas.height = h; }
    }
    fit();
    window.addEventListener('resize', fit);

    var N   = opts.N || 12, seg = Math.PI*2 / N;
    // Friday palette: deep electric blue -> mid -> teal/cyan -> ice white. High contrast.
    var COLS = opts.COLS || [
      [10,40,150],[14,68,255],[34,108,255],[64,140,255],
      [31,182,255],[120,196,255],[190,224,255],[236,246,255]
    ];

    function rgba(c,a){ return 'rgba('+c[0]+','+c[1]+','+c[2]+','+(a<0?0:a>1?1:a).toFixed(3)+')'; }
    function lerpC(a,b,t){ return [ a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t ]; }

    // mulberry32 — deterministic PRNG, seeded once at init.
    function mb(s){ return function(){ s|=0; s=s+0x6D2B79F5|0; var t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
    var rnd = mb(opts.seed || 20260619);

    // ---- BOLD FACETS: fewer, larger glass PLANES (the Shattered-Glass elevation) ----
    // Each shard is a chunky polygon (3-5 sides) tiling a wedge — a fractured pane.
    var shards = [];
    var COUNT = 14; // fewer + larger than the base's 16
    for(var i=0;i<COUNT;i++){
      var sides = 3 + ((rnd()*3)|0); // 3..5 sided panes
      var verts = [];
      var baseR = 0.05 + rnd()*0.16;
      for(var v=0; v<sides; v++){
        var va = (v/sides)*Math.PI*2 + rnd()*0.9;
        var vr = baseR * (0.55 + rnd()*0.95); // irregular, jagged glass
        verts.push([Math.cos(va)*vr, Math.sin(va)*vr]);
      }
      shards.push({
        r:     0.16 + rnd()*0.80,        // radial placement in the wedge
        a:     rnd()*seg,                // angular placement
        scale: 1.0 + rnd()*1.35,         // big planes
        col:   COLS[(rnd()*COLS.length)|0],
        col2:  COLS[(rnd()*COLS.length)|0],
        drift: 0.25 + rnd()*0.85,
        phase: rnd()*6.283,
        spin:  (rnd()<0.5?-1:1) * (0.10 + rnd()*0.22),
        verts: verts,
        // a per-shard light direction for flat-plane specular shading
        ldx:   Math.cos(rnd()*6.283),
        ldy:   Math.sin(rnd()*6.283),
        bright: rnd()                    // some panes read as bright glass
      });
    }

    function almond(cx,cy,aw,peak){
      ctx.beginPath();
      ctx.moveTo(cx-aw,cy);
      ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);
      ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);
      ctx.closePath();
    }

    // Draw one mirror wedge of the iris — the part that is distinct for this day.
    function drawWedge(ts,R){
      for(var i=0;i<shards.length;i++){
        var s = shards[i];
        // slow radial breathing + a gentle continuous turn within the wedge
        var rr  = (s.r + 0.035*Math.sin(ts*0.0004*s.drift + s.phase)) * R;
        var ang = s.a + 0.05*Math.sin(ts*0.00022*s.drift + s.phase*1.3);
        var cxp = Math.cos(ang)*rr, cyp = Math.sin(ang)*rr;
        var sz  = s.scale * 0.9 * R * (0.92 + 0.12*Math.sin(ts*0.0005 + s.phase));
        var rot = s.phase + ts*0.00016*s.spin;
        var cosR = Math.cos(rot), sinR = Math.sin(rot);

        // build the rotated/positioned pane polygon
        var pts = [], vx, vy, k;
        for(k=0;k<s.verts.length;k++){
          var vx0 = s.verts[k][0]*sz, vy0 = s.verts[k][1]*sz;
          vx = cxp + vx0*cosR - vy0*sinR;
          vy = cyp + vx0*sinR + vy0*cosR;
          pts.push([vx,vy]);
        }

        // flat-plane luminance: how the pane "faces" its light direction
        var nlen = Math.sqrt(cxp*cxp + cyp*cyp) + 1e-5;
        var facing = 0.5 + 0.5*((cxp/nlen)*s.ldx + (cyp/nlen)*s.ldy);
        var lum = 0.45 + 0.7*facing; // 0.45..1.15

        // base translucent fill — a gradient across the pane for depth
        var tone = (rr/R)*0.45 + 0.25 + 0.3*facing;
        tone = tone<0?0:tone>1?1:tone;
        var baseCol = lerpC(s.col, s.col2, tone);
        var al = 0.40 + 0.34*Math.sin(ts*0.0005 + s.phase*1.7);
        al = al<0.18?0.18:al;

        // glassy pane gradient (lit corner -> shadow corner)
        var gx0 = cxp + s.ldx*sz*0.6, gy0 = cyp + s.ldy*sz*0.6;
        var gx1 = cxp - s.ldx*sz*0.6, gy1 = cyp - s.ldy*sz*0.6;
        var grd = ctx.createLinearGradient(gx0,gy0,gx1,gy1);
        var liteC = lerpC(baseCol, [236,246,255], 0.45*lum);
        var darkC = lerpC(baseCol, [6,10,28], 0.55);
        grd.addColorStop(0,  rgba(liteC, Math.min(0.95, al*lum*1.15)));
        grd.addColorStop(0.5,rgba(baseCol, al*0.9));
        grd.addColorStop(1,  rgba(darkC, al*0.7));

        // ---- fill the pane ----
        ctx.beginPath();
        ctx.moveTo(pts[0][0],pts[0][1]);
        for(k=1;k<pts.length;k++) ctx.lineTo(pts[k][0],pts[k][1]);
        ctx.closePath();
        ctx.fillStyle = grd;
        ctx.fill();

        // ---- REFRACTION COLOR-SPLIT edge: a faint warm/blue offset rim ----
        ctx.save();
        ctx.lineJoin = 'round';
        // outer chromatic fringe — cyan
        ctx.strokeStyle = rgba([31,182,255], Math.min(0.5, al*0.6));
        ctx.lineWidth = Math.max(1, R*0.012);
        ctx.beginPath();
        ctx.moveTo(pts[0][0]+1.2,pts[0][1]);
        for(k=1;k<pts.length;k++) ctx.lineTo(pts[k][0]+1.2,pts[k][1]);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // ---- bright SPECULAR EDGE: crisp ice-white rim (the crystalline catch) ----
        ctx.beginPath();
        ctx.moveTo(pts[0][0],pts[0][1]);
        for(k=1;k<pts.length;k++) ctx.lineTo(pts[k][0],pts[k][1]);
        ctx.closePath();
        ctx.strokeStyle = rgba([236,246,255], Math.min(0.85, 0.30 + al*0.55*lum));
        ctx.lineWidth = Math.max(1, R*0.0075);
        ctx.stroke();

        // ---- specular HOTSPOT glint on the lit corner of bright panes ----
        if(s.bright > 0.5){
          var hx = cxp + s.ldx*sz*0.5, hy = cyp + s.ldy*sz*0.5;
          var hsz = sz*0.22*(0.7+0.5*Math.sin(ts*0.0009 + s.phase));
          var hg = ctx.createRadialGradient(hx,hy,0,hx,hy,Math.max(1,hsz));
          hg.addColorStop(0, rgba([255,255,255], Math.min(0.9, 0.5*lum)));
          hg.addColorStop(0.4, rgba([200,228,255], 0.30*lum));
          hg.addColorStop(1, 'rgba(200,228,255,0)');
          ctx.beginPath();
          ctx.arc(hx,hy,Math.max(1,hsz),0,6.283);
          ctx.fillStyle = hg;
          ctx.fill();
        }
      }
    }

    function paint(ts){
      var w = canvas.width, h = canvas.height, cx = w/2, cy = h/2;
      var aw = w*0.46, peak = h*0.40, R = Math.min(h*0.38, aw*0.66);

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0,0,w,h);

      // ---- ALMOND + SCLERA (identical frame) ----
      ctx.save();
      almond(cx,cy,aw,peak); ctx.clip();
      ctx.fillStyle = '#0a0c12'; ctx.fillRect(0,0,w,h);
      var g = ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
      g.addColorStop(0,'rgba(170,195,255,0)');
      g.addColorStop(0.5,'rgba(200,220,255,0.12)');
      g.addColorStop(1,'rgba(236,243,255,0.46)');
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
      ctx.restore();

      // ---- IRIS: clipped circle, additive faceted-glass kaleidoscope ----
      ctx.save();
      ctx.beginPath(); ctx.arc(cx,cy,R,0,6.283); ctx.clip();
      var bed = ctx.createRadialGradient(cx,cy,0,cx,cy,R);
      bed.addColorStop(0,'rgba(24,72,190,1)');
      bed.addColorStop(0.55,'rgba(16,52,150,1)');
      bed.addColorStop(1,'rgba(10,30,104,1)');
      ctx.fillStyle = bed; ctx.fillRect(cx-R,cy-R,R*2,R*2); // FILLED: saturated base, no black between panes
      // faint cold base wash so the dark reads as deep glass, not flat black
      var ig = ctx.createRadialGradient(cx,cy,0,cx,cy,R);
      ig.addColorStop(0,'rgba(20,42,96,0.55)');
      ig.addColorStop(0.6,'rgba(10,20,52,0.35)');
      ig.addColorStop(1,'rgba(4,8,22,0)');
      ctx.fillStyle = ig; ctx.fillRect(cx-R,cy-R,R*2,R*2);

      ctx.globalCompositeOperation = 'lighter';
      var grot = ts*0.00004; // very slow whole-iris turn
      for(var i=0;i<N;i++){
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(grot + i*seg);
        if(i%2===1) ctx.scale(1,-1); // mirror alternating wedges -> kaleidoscope fold
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,R*1.02,0,seg); ctx.closePath(); ctx.clip();
        drawWedge(ts,R);
        ctx.restore();
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      // central bright kaleidoscope core (shattered light converging)
      var coreG = ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.40);
      coreG.addColorStop(0,'rgba(236,246,255,0.55)');
      coreG.addColorStop(0.5,'rgba(120,180,255,0.18)');
      coreG.addColorStop(1,'rgba(120,180,255,0)');
      ctx.beginPath(); ctx.arc(cx,cy,R*0.40,0,6.283); ctx.fillStyle = coreG; ctx.fill();

      // ---- PUPIL (identical frame) ----
      ctx.beginPath(); ctx.arc(cx,cy,R*0.30,0,6.283); ctx.fillStyle = '#08080a'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,R*0.30,0,6.283);
      ctx.strokeStyle = 'rgba(14,68,255,.45)'; ctx.lineWidth = DPR; ctx.stroke();

      // ---- CATCH-LIGHT GLINT (identical frame) ----
      ctx.beginPath(); ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);
      ctx.fillStyle = '#eaf1ff'; ctx.fill();

      // ---- EYELID RIM GLOW (identical frame) ----
      ctx.save();
      almond(cx,cy,aw,peak);
      ctx.shadowColor = 'rgba(200,222,255,0.9)'; ctx.shadowBlur = R*0.22;
      ctx.strokeStyle = 'rgba(236,243,255,0.55)'; ctx.lineWidth = Math.max(1.2,R*0.022);
      ctx.stroke();
      ctx.restore();
    }

    function frame(ts){ fit(); paint(ts); if(!reduce) requestAnimationFrame(frame); }

    // immediate first paint so it is never blank on a hidden/throttled tab
    fit(); paint(0);
    if(!reduce){
      requestAnimationFrame(frame);
      document.addEventListener('visibilitychange', function(){ if(!document.hidden) requestAnimationFrame(frame); });
    }
  }

  /* ---- teal-fill ---- */
function eye_teal_fill(canvas, opts){
    var ctx=canvas.getContext('2d'); if(!ctx) return;
    var DPR=Math.min(window.devicePixelRatio||1,2);
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    function fit(){
      var r=canvas.getBoundingClientRect();
      var w=Math.max(1,Math.round((r.width||canvas.width||320)*DPR)),
          h=Math.max(1,Math.round((r.height||canvas.height||218)*DPR));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    }
    var cssW=canvas.width, cssH=canvas.height;
    canvas.style.width=cssW+'px'; canvas.style.height=cssH+'px';
    canvas.width=Math.round(cssW*DPR); canvas.height=Math.round(cssH*DPR);
    window.addEventListener('resize',function(){
      canvas.style.width=cssW+'px'; canvas.style.height=cssH+'px';
      canvas.width=Math.round(cssW*DPR); canvas.height=Math.round(cssH*DPR);
    });

    var N=opts.N||12, seg=Math.PI*2/N;
    // Teal-forward palette: deep navy -> electric blue -> cyan -> aqua -> teal-white -> ice
    var COLS=opts.COLS||[[10,40,120],[14,86,200],[20,150,200],[28,200,220],[90,225,225],[150,240,235],[224,248,255]];
    function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';}
    function mb(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
    var rnd=mb(opts.seed||20260618);

    // Soft drifting nebula puffs (the dreamy teal field) + sharp crystalline sparkle-shards.
    var clouds=[], sparks=[];
    for(var i=0;i<14;i++){
      clouds.push({
        r:0.16+rnd()*0.80, a:rnd()*seg,
        size:0.18+rnd()*0.34, col:COLS[2+((rnd()*4)|0)],
        drift:0.25+rnd()*0.8, phase:rnd()*6.283
      });
    }
    for(var j=0;j<16;j++){
      sparks.push({
        r:0.22+rnd()*0.72, a:rnd()*seg,
        size:0.018+rnd()*0.034, phase:rnd()*6.283, tw:0.6+rnd()*1.1
      });
    }

    function almond(cx,cy,aw,peak){ctx.beginPath();ctx.moveTo(cx-aw,cy);ctx.quadraticCurveTo(cx,cy-peak*2,cx+aw,cy);ctx.quadraticCurveTo(cx,cy+peak*2,cx-aw,cy);ctx.closePath();}

    // ---- ELEVATED IRIS: flowing teal nebula + sharp white crystalline sparkle-shards ----
    function drawWedge(ts,R){
      // 1) dreamy teal cloud field: soft radial puffs, slow drift
      for(var i=0;i<clouds.length;i++){var c=clouds[i];
        var rr=(c.r+0.05*Math.sin(ts*0.0003*c.drift+c.phase))*R,
            ang=c.a+0.05*Math.sin(ts*0.00022+c.phase);
        var x=Math.cos(ang)*rr, y=Math.sin(ang)*rr;
        var sz=c.size*R*(0.9+0.18*Math.sin(ts*0.00045+c.phase*1.3));
        var al=0.22+0.16*Math.sin(ts*0.0004+c.phase*1.6);
        var g=ctx.createRadialGradient(x,y,0,x,y,sz);
        g.addColorStop(0,rgba(c.col,Math.max(0.10,al)));
        g.addColorStop(0.55,rgba(c.col,Math.max(0.05,al*0.5)));
        g.addColorStop(1,rgba(c.col,0));
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,sz,0,6.283);ctx.fill();
      }
      // 2) faint crystalline lattice rings: crisp polygon ridges give the cut-glass structure
      for(var s=0;s<6;s++){
        var fr=(0.18+s*0.135)*R, frot=ts*0.00012*(s%2?1:-1)+s*0.6;
        ctx.beginPath();
        for(var p=0;p<=5;p++){var pa=frot+p*(seg/5);ctx.lineTo(Math.cos(pa)*fr,Math.sin(pa)*fr);}
        ctx.strokeStyle=rgba(COLS[5],0.10+0.05*Math.sin(ts*0.0006+s));
        ctx.lineWidth=Math.max(0.6,R*0.004);ctx.stroke();
      }
      // 3) sharp white crystalline sparkle-shards: 4-point glints with halo + hot core
      for(var k=0;k<sparks.length;k++){var sp=sparks[k];
        var sr=(sp.r+0.03*Math.sin(ts*0.00035*sp.tw+sp.phase))*R, sa=sp.a;
        var sx=Math.cos(sa)*sr, sy=Math.sin(sa)*sr;
        var tw=0.5+0.5*Math.sin(ts*0.0013*sp.tw+sp.phase*6.283);
        var ssz=sp.size*R*(0.5+0.7*tw);
        ctx.save();ctx.translate(sx,sy);ctx.rotate(sp.phase+ts*0.00008);
        var gg=ctx.createRadialGradient(0,0,0,0,0,ssz*2.4);
        gg.addColorStop(0,rgba([235,248,255],Math.min(0.95,0.4+0.55*tw)));
        gg.addColorStop(0.4,rgba([150,235,255],0.22*tw));
        gg.addColorStop(1,rgba([150,235,255],0));
        ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,ssz*2.4,0,6.283);ctx.fill();
        ctx.fillStyle=rgba([240,250,255],Math.min(1,0.55+0.45*tw));
        for(var ax=0;ax<2;ax++){ctx.rotate(ax*1.5708);
          ctx.beginPath();ctx.moveTo(0,-ssz*3.0);ctx.lineTo(ssz*0.42,0);ctx.lineTo(0,ssz*3.0);ctx.lineTo(-ssz*0.42,0);ctx.closePath();ctx.fill();}
        ctx.beginPath();ctx.arc(0,0,ssz*0.6,0,6.283);ctx.fillStyle=rgba([255,255,255],Math.min(1,0.6+0.4*tw));ctx.fill();
        ctx.restore();
      }
    }

    function paint(ts){
      var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2, aw=w*0.46, peak=h*0.40, R=Math.min(h*0.38,aw*0.66);
      ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,w,h);
      // --- ALMOND + SCLERA (frame, identical to base) ---
      ctx.save(); almond(cx,cy,aw,peak); ctx.clip();
      ctx.fillStyle='#0a0c12';ctx.fillRect(0,0,w,h);
      var g=ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,aw*1.02);
      g.addColorStop(0,'rgba(170,195,255,0)');g.addColorStop(0.5,'rgba(200,220,255,0.12)');g.addColorStop(1,'rgba(236,243,255,0.46)');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h); ctx.restore();
      // --- IRIS DISC ---
      ctx.save(); ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.clip();
      var bed=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
      bed.addColorStop(0,'rgba(20,128,178,1)');
      bed.addColorStop(0.55,'rgba(14,84,156,1)');
      bed.addColorStop(1,'rgba(9,42,112,1)');
      ctx.fillStyle=bed;ctx.fillRect(cx-R,cy-R,R*2,R*2); /* FILLED: saturated teal base, no black */
      // glowing teal core wash beneath the folds
      var coreG=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.9);
      coreG.addColorStop(0,'rgba(40,170,200,0.30)');coreG.addColorStop(0.5,'rgba(16,90,170,0.16)');coreG.addColorStop(1,'rgba(10,30,80,0)');
      ctx.fillStyle=coreG;ctx.fillRect(cx-R,cy-R,R*2,R*2);
      ctx.globalCompositeOperation='lighter'; var grot=ts*0.000045;
      for(var i=0;i<N;i++){ctx.save();ctx.translate(cx,cy);ctx.rotate(grot+i*seg);if(i%2===1)ctx.scale(1,-1);
        ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*1.02,0,seg);ctx.closePath();ctx.clip();
        drawWedge(ts,R);ctx.restore();}
      ctx.restore(); ctx.globalCompositeOperation='source-over';
      // --- PUPIL + PUPIL STROKE (frame; stroke tinted teal to match palette) ---
      ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.fillStyle='#06070a';ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,R*0.30,0,6.283);ctx.strokeStyle='rgba(28,200,220,.5)';ctx.lineWidth=DPR;ctx.stroke();
      // --- CATCH-LIGHT GLINT (frame, identical) ---
      ctx.beginPath();ctx.arc(cx-R*0.10,cy-R*0.13,R*0.05,0,6.283);ctx.fillStyle='#eaf1ff';ctx.fill();
      // --- EYELID RIM GLOW (frame, identical) ---
      ctx.save(); almond(cx,cy,aw,peak); ctx.shadowColor='rgba(200,222,255,0.9)';ctx.shadowBlur=R*0.22;
      ctx.strokeStyle='rgba(236,243,255,0.55)';ctx.lineWidth=Math.max(1.2,R*0.022);ctx.stroke(); ctx.restore();
    }

    function frame(ts){paint(ts);if(!reduce)requestAnimationFrame(frame);}
    paint(0); // immediate first frame
    if(!reduce){
      requestAnimationFrame(frame);
      document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(frame);});
    }
  }

  /* every available renderer, keyed by slug */
  var REND = {
    'ice-seed': { mount:eye_ice_seed, opts:{N:6, seed:20260615} },
    'first-facets': { mount:eye_first_facets, opts:{
    N:8,
    seed:20260616,
    COLS:[[14,68,255],[34,108,255],[60,150,235],[120,170,255],[31,182,255],[150,214,255],[214,236,255]]
  } },
    'crystal-bloom': { mount:eye_crystal_bloom, opts:{N:10, seed:20260617,
  COLS:[[10,52,220],[24,92,255],[40,128,255],[64,158,255],[28,176,255],[120,196,255],[176,216,255],[222,240,255]]} },
    'teal-nebula': { mount:eye_teal_nebula, opts:{N:12,seed:20260618} },
    'shattered-glass': { mount:eye_shattered_glass, opts:{
    N: 12,
    seed: 20260619,
    COLS: [
      [10,40,150],[14,68,255],[34,108,255],[64,140,255],
      [31,182,255],[120,196,255],[190,224,255],[236,246,255]
    ]
  } },
    'sapphire-jewel': { mount:eye_sapphire_jewel, opts:{N:12, seed:20260620, COLS:null} },
    'summit': { mount:eye_summit, opts:{ N:12, seed:20260621 } },
    'sapphire-fill': { mount:eye_sapphire_fill, opts:{N:12, seed:20260620, COLS:null} },
    'shattered-fill': { mount:eye_shattered_fill, opts:{
    N: 12,
    seed: 20260619,
    COLS: [
      [10,40,150],[14,68,255],[34,108,255],[64,140,255],
      [31,182,255],[120,196,255],[190,224,255],[236,246,255]
    ]
  } },
    'teal-fill': { mount:eye_teal_fill, opts:{N:12,seed:20260618} },
  };

  /* the 7-day rotation, indexed by Date.getDay(): 0=Sun .. 6=Sat
     Thu/Fri now route to the FILL variants (kaleidoscope-true, no black wedges).
     Sat stays on sapphire-jewel until its bed-fill pass lands. */
  var ROTATION = ['summit', 'ice-seed', 'first-facets', 'crystal-bloom', 'teal-fill', 'shattered-fill', 'sapphire-jewel'];

  function mountSlug(canvas, slug){
    var d = REND[slug];
    if(!canvas || !d) return null;
    canvas.setAttribute('data-eye', slug);
    d.mount(canvas, d.opts);
    return slug;
  }
  function mountIndex(canvas, i){ return mountSlug(canvas, ROTATION[((i%7)+7)%7]); }
  // Effective day-of-week, rolled at 04:00 to match the Daily (daily-v2.js ROLLOVER_HOUR=4) and the
  // Sunday dedication. Keeps the eye, the line, and the Daily flipping together — not the eye at
  // midnight and the rest four hours later.
  // ONE-NIGHT OVERRIDE — her day opens at 20:45 tonight (Sat 06-20). Inside the window 06-20 20:45 → 06-21
  // 04:00 CDT the eye reads Sunday (return 0) so it turns with the line, the Daily and the jewel; outside
  // that window (incl. every mocked test clock) it's the usual 4h offset. Self-reverts after 04:00 Sunday.
  function effDay(){ var n=Date.now(); if(n>=Date.parse("2026-06-20T20:45:00-05:00") && n<Date.parse("2026-06-21T04:00:00-05:00")) return 0; return new Date(n - 4*36e5).getDay(); }
  function autoMount(canvas){
    try{
      var p = new URLSearchParams(location.search);
      var eq = p.get('eye');
      if(eq && REND[eq]) return mountSlug(canvas, eq);
      var dq = p.get('day');
      var idx = (dq!==null && /^[0-6]$/.test(dq)) ? +dq : effDay();
      return mountIndex(canvas, idx);
    }catch(e){ return mountIndex(canvas, effDay()); }
  }

  if(typeof window!=='undefined'){
    window.MastEye = { REND:REND, ROTATION:ROTATION, mountSlug:mountSlug, mountIndex:mountIndex };
  }
  var cv = document.querySelector('canvas.mast-eye-canvas');
  if(cv){ autoMount(cv); }
})();
