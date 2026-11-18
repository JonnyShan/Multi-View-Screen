(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();const Zc="/golf/",ul="hio.customBrand.v1";function ci(s,t){return`${Zc}brand/${s}/${t}`}function dl(s){return new Promise(t=>{const e=new Image;e.crossOrigin="anonymous",e.onload=()=>t(e),e.onerror=()=>t(null),e.src=s})}async function Qh(){try{return await(await fetch(`${Zc}brand/index.json`)).json()}catch{return{default:"gamify",brands:["gamify"]}}}async function fl(s){const t=await fetch(ci(s,"brand.json"));if(!t.ok)throw new Error(`brand ${s} not found`);return await t.json()}const Gi="gamify",tu=["golferKit","loaderVideo","loaderPoster","flagVideo","holeVideo","mark"],Ia=s=>!!s&&typeof s=="object"&&!Array.isArray(s);function Kc(s,t){const e={...s};for(const[n,i]of Object.entries(t))e[n]=Ia(i)&&Ia(s[n])?Kc(s[n],i):i;return e}function eu(s,t){const e=s.colors.primary.toLowerCase(),n=t.colors?.primary,i=s.name,r=t.name,a=c=>typeof c=="string"?n&&c.toLowerCase()===e?n:r?c.split(i).join(r).split(i.toUpperCase()).join(r.toUpperCase()):c:Array.isArray(c)?c.map(a):Ia(c)?Object.fromEntries(Object.entries(c).map(([h,u])=>[h,a(u)])):c,o=a(s);for(const c of tu)delete o[c];o.tagline="",s.leaderboard&&(o.leaderboard={url:s.leaderboard.url,game:`${t.id.replace(/[^a-z0-9]/gi,"_").toLowerCase()}_golf`}),t.logo||(o.logo=`../${Gi}/${s.logo}`);const l=Kc(o,t);return l.id=t.id,l}async function kr(s){const t=await fl(Gi).catch(()=>null),e=await fl(s).catch(()=>null);return s===Gi||!t?e:e?eu(t,e):null}class nu{constructor(){this.presets=[],this.listeners=[],this.customLogo=null}async init(){const t=await Qh(),e=await Promise.all(t.brands.map(l=>kr(l)));this.presets=e.filter(l=>!!l);const n=new URL(location.href),i="livewire",r=n.searchParams.get("brand"),a=r&&/^[a-z0-9][a-z0-9-]{0,39}$/.test(r)?r:i;let o=this.presets.find(l=>l.id===a)??await kr(a);return o||(console.warn(`brand "${a}" not found, showing ${Gi}`),o=this.presets.find(l=>l.id===Gi)??await kr(Gi)??this.presets[0]),n.searchParams.get("brand"),await this.set(o,!1),this.brand}onChange(t){this.listeners.push(t)}async set(t,e=!0){const n=this.customLogo??ci(t.id,t.logo),i=await dl(n),r=t.mark&&!this.customLogo?await dl(ci(t.id,t.mark)):null;this.brand={...structuredClone(t),logoImg:i,markImg:r,logoTintable:!this.customLogo,version:(this.brand?.version??0)+1},iu(this.brand),e&&this.persist();for(const a of this.listeners)a(this.brand)}async selectPreset(t){const e=this.presets.find(n=>n.id===t);if(e){this.customLogo=null,await this.set(e);try{localStorage.removeItem(ul)}catch{}}}async patch(t,e){const n=this.toData(),i=t.split(".");let r=n;for(let a=0;a<i.length-1;a++)r=r[i[a]];r[i[i.length-1]]=e,(t.startsWith("kit.")||t==="colors.primary")&&delete n.golferKit,await this.set(n)}async setCustomLogo(t){this.customLogo=t;const e=this.toData();t&&(delete e.golferKit,delete e.loaderVideo,delete e.loaderPoster,delete e.flagVideo,delete e.holeVideo),await this.set(e)}toData(){const{logoImg:t,markImg:e,logoTintable:n,version:i,...r}=this.brand;return structuredClone(r)}exportJson(){return JSON.stringify(this.toData(),null,2)}persist(){try{localStorage.setItem(ul,JSON.stringify({...this.toData(),customLogo:this.customLogo??void 0}))}catch{}}}function iu(s){const t=document.documentElement.style;t.setProperty("--brand",s.colors.primary),t.setProperty("--brand-dark",s.colors.dark),t.setProperty("--brand-light",s.colors.light),t.setProperty("--on-brand",s.colors.onPrimary),t.setProperty("--brand-font",`"${s.font}", "Barlow Condensed", "Arial Narrow", sans-serif`),document.title=`${s.gameTitle} | ${s.courseName}`}function oi(s,t,e,n,i,r,a){const o=t.logoImg;if(!o){s.save(),s.fillStyle=a??t.colors.light,s.font=`italic 800 ${Math.floor(r*.7)}px ${getComputedStyle(document.documentElement).getPropertyValue("--brand-font")}`,s.textAlign="center",s.textBaseline="middle",s.fillText(t.name.toUpperCase(),e+i/2,n+r/2,i),s.restore();return}const l=o.naturalWidth||o.width||300,c=o.naturalHeight||o.height||100,h=Math.min(i/l,r/c),u=l*h,f=c*h,d=e+(i-u)/2,g=n+(r-f)/2;if(a&&t.logoTintable){const v=document.createElement("canvas");v.width=Math.max(1,Math.ceil(u)),v.height=Math.max(1,Math.ceil(f));const m=v.getContext("2d");m.drawImage(o,0,0,v.width,v.height),m.globalCompositeOperation="source-in",m.fillStyle=a,m.fillRect(0,0,v.width,v.height),s.drawImage(v,d,g,u,f)}else s.drawImage(o,d,g,u,f)}function su(s,t,e,n,i,r,a){const o=t.markImg;if(!o)return oi(s,t,e,n,i,r,a);const l=o.naturalWidth||o.width||256,c=o.naturalHeight||o.height||256,h=Math.min(i/l,r/c);s.drawImage(o,e+(i-l*h)/2,n+(r-c*h)/2,l*h,c*h)}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Co="170",ru=0,pl=1,au=2,jc=1,Jc=2,bn=3,Dn=0,Le=1,be=2,Cn=0,li=1,Rs=2,ml=3,gl=4,ou=5,ri=100,lu=101,cu=102,hu=103,uu=104,du=200,fu=201,pu=202,mu=203,Ua=204,Na=205,gu=206,vu=207,xu=208,_u=209,Mu=210,yu=211,Su=212,wu=213,bu=214,Fa=0,Oa=1,za=2,Xi=3,Ba=4,ka=5,Ha=6,Ga=7,Ro=0,Tu=1,Eu=2,$n=0,Qc=1,th=2,eh=3,nh=4,Au=5,ih=6,Po=7,sh=300,$i=301,qi=302,Va=303,Wa=304,Nr=306,ln=1e3,Tn=1001,Xa=1002,$e=1003,Cu=1004,Hs=1005,Be=1006,Hr=1007,En=1008,In=1009,rh=1010,ah=1011,Ps=1012,Lo=1013,hi=1014,pn=1015,Rn=1016,Do=1017,Io=1018,Yi=1020,oh=35902,lh=1021,ch=1022,on=1023,hh=1024,uh=1025,Vi=1026,Zi=1027,Uo=1028,No=1029,dh=1030,Fo=1031,Oo=1033,Sr=33776,wr=33777,br=33778,Tr=33779,$a=35840,qa=35841,Ya=35842,Za=35843,Ka=36196,ja=37492,Ja=37496,Qa=37808,to=37809,eo=37810,no=37811,io=37812,so=37813,ro=37814,ao=37815,oo=37816,lo=37817,co=37818,ho=37819,uo=37820,fo=37821,Er=36492,po=36494,mo=36495,fh=36283,go=36284,vo=36285,xo=36286,Ru=3200,ph=3201,zo=0,Pu=1,Wn="",se="srgb",Qi="srgb-linear",Fr="linear",ee="srgb",vi=7680,vl=519,Lu=512,Du=513,Iu=514,mh=515,Uu=516,Nu=517,Fu=518,Ou=519,_o=35044,xl="300 es",An=2e3,Rr=2001;class ts{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,t);t.target=null}}}const Re=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let _l=1234567;const Ss=Math.PI/180,Ls=180/Math.PI;function mn(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Re[s&255]+Re[s>>8&255]+Re[s>>16&255]+Re[s>>24&255]+"-"+Re[t&255]+Re[t>>8&255]+"-"+Re[t>>16&15|64]+Re[t>>24&255]+"-"+Re[e&63|128]+Re[e>>8&255]+"-"+Re[e>>16&255]+Re[e>>24&255]+Re[n&255]+Re[n>>8&255]+Re[n>>16&255]+Re[n>>24&255]).toLowerCase()}function we(s,t,e){return Math.max(t,Math.min(e,s))}function Bo(s,t){return(s%t+t)%t}function zu(s,t,e,n,i){return n+(s-t)*(i-n)/(e-t)}function Bu(s,t,e){return s!==t?(e-s)/(t-s):0}function ws(s,t,e){return(1-e)*s+e*t}function ku(s,t,e,n){return ws(s,t,1-Math.exp(-e*n))}function Hu(s,t=1){return t-Math.abs(Bo(s,t*2)-t)}function Gu(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function Vu(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function Wu(s,t){return s+Math.floor(Math.random()*(t-s+1))}function Xu(s,t){return s+Math.random()*(t-s)}function $u(s){return s*(.5-Math.random())}function qu(s){s!==void 0&&(_l=s);let t=_l+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Yu(s){return s*Ss}function Zu(s){return s*Ls}function Ku(s){return(s&s-1)===0&&s!==0}function ju(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Ju(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Qu(s,t,e,n,i){const r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),h=a((t+n)/2),u=r((t-n)/2),f=a((t-n)/2),d=r((n-t)/2),g=a((n-t)/2);switch(i){case"XYX":s.set(o*h,l*u,l*f,o*c);break;case"YZY":s.set(l*f,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*f,o*h,o*c);break;case"XZX":s.set(o*h,l*g,l*d,o*c);break;case"YXY":s.set(l*d,o*h,l*g,o*c);break;case"ZYZ":s.set(l*g,l*d,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function an(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function ne(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Ml={DEG2RAD:Ss,RAD2DEG:Ls,generateUUID:mn,clamp:we,euclideanModulo:Bo,mapLinear:zu,inverseLerp:Bu,lerp:ws,damp:ku,pingpong:Hu,smoothstep:Gu,smootherstep:Vu,randInt:Wu,randFloat:Xu,randFloatSpread:$u,seededRandom:qu,degToRad:Yu,radToDeg:Zu,isPowerOfTwo:Ku,ceilPowerOfTwo:ju,floorPowerOfTwo:Ju,setQuaternionFromProperEuler:Qu,normalize:ne,denormalize:an};class it{constructor(t=0,e=0){it.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(we(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*i+t.x,this.y=r*i+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class kt{constructor(t,e,n,i,r,a,o,l,c){kt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c)}set(t,e,n,i,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=i,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],g=n[8],v=i[0],m=i[3],p=i[6],_=i[1],M=i[4],x=i[7],R=i[2],T=i[5],E=i[8];return r[0]=a*v+o*_+l*R,r[3]=a*m+o*M+l*T,r[6]=a*p+o*x+l*E,r[1]=c*v+h*_+u*R,r[4]=c*m+h*M+u*T,r[7]=c*p+h*x+u*E,r[2]=f*v+d*_+g*R,r[5]=f*m+d*M+g*T,r[8]=f*p+d*x+g*E,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,f=o*l-h*r,d=c*r-a*l,g=e*u+n*f+i*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return t[0]=u*v,t[1]=(i*c-h*n)*v,t[2]=(o*n-i*a)*v,t[3]=f*v,t[4]=(h*e-i*l)*v,t[5]=(i*r-o*e)*v,t[6]=d*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-i*c,i*l,-i*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Gr.makeScale(t,e)),this}rotate(t){return this.premultiply(Gr.makeRotation(-t)),this}translate(t,e){return this.premultiply(Gr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Gr=new kt;function gh(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function Ds(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function td(){const s=Ds("canvas");return s.style.display="block",s}const yl={};function _s(s){s in yl||(yl[s]=!0,console.warn(s))}function ed(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function nd(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function id(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const $t={enabled:!0,workingColorSpace:Qi,spaces:{},convert:function(s,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===ee&&(s.r=Pn(s.r),s.g=Pn(s.g),s.b=Pn(s.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(s.applyMatrix3(this.spaces[t].toXYZ),s.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===ee&&(s.r=Wi(s.r),s.g=Wi(s.g),s.b=Wi(s.b))),s},fromWorkingColorSpace:function(s,t){return this.convert(s,this.workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Wn?Fr:this.spaces[s].transfer},getLuminanceCoefficients:function(s,t=this.workingColorSpace){return s.fromArray(this.spaces[t].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,t,e){return s.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function Pn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Wi(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const Sl=[.64,.33,.3,.6,.15,.06],wl=[.2126,.7152,.0722],bl=[.3127,.329],Tl=new kt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),El=new kt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);$t.define({[Qi]:{primaries:Sl,whitePoint:bl,transfer:Fr,toXYZ:Tl,fromXYZ:El,luminanceCoefficients:wl,workingColorSpaceConfig:{unpackColorSpace:se},outputColorSpaceConfig:{drawingBufferColorSpace:se}},[se]:{primaries:Sl,whitePoint:bl,transfer:ee,toXYZ:Tl,fromXYZ:El,luminanceCoefficients:wl,outputColorSpaceConfig:{drawingBufferColorSpace:se}}});let xi;class sd{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{xi===void 0&&(xi=Ds("canvas")),xi.width=t.width,xi.height=t.height;const n=xi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=xi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Ds("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=Pn(r[a]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Pn(e[n]/255)*255):e[n]=Pn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let rd=0;class vh{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:rd++}),this.uuid=mn(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(Vr(i[a].image)):r.push(Vr(i[a]))}else r=Vr(i);n.url=r}return e||(t.images[this.uuid]=n),n}}function Vr(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?sd.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let ad=0;class Ae extends ts{constructor(t=Ae.DEFAULT_IMAGE,e=Ae.DEFAULT_MAPPING,n=Tn,i=Tn,r=Be,a=En,o=on,l=In,c=Ae.DEFAULT_ANISOTROPY,h=Wn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ad++}),this.uuid=mn(),this.name="",this.source=new vh(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new it(0,0),this.repeat=new it(1,1),this.center=new it(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new kt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==sh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ln:t.x=t.x-Math.floor(t.x);break;case Tn:t.x=t.x<0?0:1;break;case Xa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ln:t.y=t.y-Math.floor(t.y);break;case Tn:t.y=t.y<0?0:1;break;case Xa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ae.DEFAULT_IMAGE=null;Ae.DEFAULT_MAPPING=sh;Ae.DEFAULT_ANISOTROPY=1;class le{constructor(t=0,e=0,n=0,i=1){le.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*i+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r;const l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const M=(c+1)/2,x=(d+1)/2,R=(p+1)/2,T=(h+f)/4,E=(u+v)/4,P=(g+m)/4;return M>x&&M>R?M<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(M),i=T/n,r=E/n):x>R?x<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(x),n=T/i,r=P/i):R<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(R),n=E/r,i=P/r),this.set(n,i,r,e),this}let _=Math.sqrt((m-g)*(m-g)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(_)<.001&&(_=1),this.x=(m-g)/_,this.y=(u-v)/_,this.z=(f-h)/_,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class od extends ts{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new le(0,0,t,e),this.scissorTest=!1,this.viewport=new le(0,0,t,e);const i={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Be,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ae(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new vh(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Je extends od{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class xh extends Ae{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=$e,this.minFilter=$e,this.wrapR=Tn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class ld extends Ae{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=$e,this.minFilter=$e,this.wrapR=Tn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Un{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const f=r[a+0],d=r[a+1],g=r[a+2],v=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=d,t[e+2]=g,t[e+3]=v;return}if(u!==v||l!==f||c!==d||h!==g){let m=1-o;const p=l*f+c*d+h*g+u*v,_=p>=0?1:-1,M=1-p*p;if(M>Number.EPSILON){const R=Math.sqrt(M),T=Math.atan2(R,p*_);m=Math.sin(m*T)/R,o=Math.sin(o*T)/R}const x=o*_;if(l=l*m+f*x,c=c*m+d*x,h=h*m+g*x,u=u*m+v*x,m===1-o){const R=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=R,c*=R,h*=R,u*=R}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],f=r[a+1],d=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*d-c*f,t[e+1]=l*g+h*f+c*u-o*d,t[e+2]=c*g+h*d+o*f-l*u,t[e+3]=h*g-o*u-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),f=l(n/2),d=l(i/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"YXZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"ZXY":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"ZYX":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"YZX":this._x=f*h*u+c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u-f*d*g;break;case"XZY":this._x=f*h*u-c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+o+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-i)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(i+a)/d,this._z=(r+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(r-c)/d,this._x=(i+a)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(a-i)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(we(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+i*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-e;return this._w=d*a+e*this._w,this._x=d*n+e*this._x,this._y=d*i+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=i*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class A{constructor(t=0,e=0,n=0){A.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Al.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Al.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*i-o*n),h=2*(o*e-r*i),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=i+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Wr.copy(this).projectOnVector(t),this.sub(Wr)}reflect(t){return this.sub(Wr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(we(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Wr=new A,Al=new Un;class pi{constructor(t=new A(1/0,1/0,1/0),e=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(nn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(nn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=nn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,nn):nn.fromBufferAttribute(r,a),nn.applyMatrix4(t.matrixWorld),this.expandByPoint(nn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Gs.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Gs.copy(n.boundingBox)),Gs.applyMatrix4(t.matrixWorld),this.union(Gs)}const i=t.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,nn),nn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(as),Vs.subVectors(this.max,as),_i.subVectors(t.a,as),Mi.subVectors(t.b,as),yi.subVectors(t.c,as),On.subVectors(Mi,_i),zn.subVectors(yi,Mi),Kn.subVectors(_i,yi);let e=[0,-On.z,On.y,0,-zn.z,zn.y,0,-Kn.z,Kn.y,On.z,0,-On.x,zn.z,0,-zn.x,Kn.z,0,-Kn.x,-On.y,On.x,0,-zn.y,zn.x,0,-Kn.y,Kn.x,0];return!Xr(e,_i,Mi,yi,Vs)||(e=[1,0,0,0,1,0,0,0,1],!Xr(e,_i,Mi,yi,Vs))?!1:(Ws.crossVectors(On,zn),e=[Ws.x,Ws.y,Ws.z],Xr(e,_i,Mi,yi,Vs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,nn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(nn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(_n[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),_n[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),_n[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),_n[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),_n[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),_n[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),_n[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),_n[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(_n),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const _n=[new A,new A,new A,new A,new A,new A,new A,new A],nn=new A,Gs=new pi,_i=new A,Mi=new A,yi=new A,On=new A,zn=new A,Kn=new A,as=new A,Vs=new A,Ws=new A,jn=new A;function Xr(s,t,e,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){jn.fromArray(s,r);const o=i.x*Math.abs(jn.x)+i.y*Math.abs(jn.y)+i.z*Math.abs(jn.z),l=t.dot(jn),c=e.dot(jn),h=n.dot(jn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const cd=new pi,os=new A,$r=new A;class es{constructor(t=new A,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):cd.setFromPoints(t).getCenter(n);let i=0;for(let r=0,a=t.length;r<a;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;os.subVectors(t,this.center);const e=os.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(os,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):($r.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(os.copy(t.center).add($r)),this.expandByPoint(os.copy(t.center).sub($r))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Mn=new A,qr=new A,Xs=new A,Bn=new A,Yr=new A,$s=new A,Zr=new A;class ko{constructor(t=new A,e=new A(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Mn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Mn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Mn.copy(this.origin).addScaledVector(this.direction,e),Mn.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){qr.copy(t).add(e).multiplyScalar(.5),Xs.copy(e).sub(t).normalize(),Bn.copy(this.origin).sub(qr);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Xs),o=Bn.dot(this.direction),l=-Bn.dot(Xs),c=Bn.lengthSq(),h=Math.abs(1-a*a);let u,f,d,g;if(h>0)if(u=a*l-o,f=a*o-l,g=r*h,u>=0)if(f>=-g)if(f<=g){const v=1/h;u*=v,f*=v,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(qr).addScaledVector(Xs,f),d}intersectSphere(t,e){Mn.subVectors(t.center,this.origin);const n=Mn.dot(this.direction),i=Mn.dot(Mn)-n*n,r=t.radius*t.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,i=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,i=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Mn)!==null}intersectTriangle(t,e,n,i,r){Yr.subVectors(e,t),$s.subVectors(n,t),Zr.crossVectors(Yr,$s);let a=this.direction.dot(Zr),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Bn.subVectors(this.origin,t);const l=o*this.direction.dot($s.crossVectors(Bn,$s));if(l<0)return null;const c=o*this.direction.dot(Yr.cross(Bn));if(c<0||l+c>a)return null;const h=-o*Bn.dot(Zr);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Vt{constructor(t,e,n,i,r,a,o,l,c,h,u,f,d,g,v,m){Vt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c,h,u,f,d,g,v,m)}set(t,e,n,i,r,a,o,l,c,h,u,f,d,g,v,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=i,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Vt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/Si.setFromMatrixColumn(t,0).length(),r=1/Si.setFromMatrixColumn(t,1).length(),a=1/Si.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const f=a*h,d=a*u,g=o*h,v=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+g*c,e[5]=f-v*c,e[9]=-o*l,e[2]=v-f*c,e[6]=g+d*c,e[10]=a*l}else if(t.order==="YXZ"){const f=l*h,d=l*u,g=c*h,v=c*u;e[0]=f+v*o,e[4]=g*o-d,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=d*o-g,e[6]=v+f*o,e[10]=a*l}else if(t.order==="ZXY"){const f=l*h,d=l*u,g=c*h,v=c*u;e[0]=f-v*o,e[4]=-a*u,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*h,e[9]=v-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const f=a*h,d=a*u,g=o*h,v=o*u;e[0]=l*h,e[4]=g*c-d,e[8]=f*c+v,e[1]=l*u,e[5]=v*c+f,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const f=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=v-f*u,e[8]=g*u+d,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*u+g,e[10]=f-v*u}else if(t.order==="XZY"){const f=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+v,e[5]=a*h,e[9]=d*u-g,e[2]=g*u-d,e[6]=o*h,e[10]=v*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(hd,t,ud)}lookAt(t,e,n){const i=this.elements;return He.subVectors(t,e),He.lengthSq()===0&&(He.z=1),He.normalize(),kn.crossVectors(n,He),kn.lengthSq()===0&&(Math.abs(n.z)===1?He.x+=1e-4:He.z+=1e-4,He.normalize(),kn.crossVectors(n,He)),kn.normalize(),qs.crossVectors(He,kn),i[0]=kn.x,i[4]=qs.x,i[8]=He.x,i[1]=kn.y,i[5]=qs.y,i[9]=He.y,i[2]=kn.z,i[6]=qs.z,i[10]=He.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],g=n[2],v=n[6],m=n[10],p=n[14],_=n[3],M=n[7],x=n[11],R=n[15],T=i[0],E=i[4],P=i[8],y=i[12],S=i[1],L=i[5],D=i[9],U=i[13],k=i[2],B=i[6],G=i[10],Y=i[14],z=i[3],V=i[7],Q=i[11],st=i[15];return r[0]=a*T+o*S+l*k+c*z,r[4]=a*E+o*L+l*B+c*V,r[8]=a*P+o*D+l*G+c*Q,r[12]=a*y+o*U+l*Y+c*st,r[1]=h*T+u*S+f*k+d*z,r[5]=h*E+u*L+f*B+d*V,r[9]=h*P+u*D+f*G+d*Q,r[13]=h*y+u*U+f*Y+d*st,r[2]=g*T+v*S+m*k+p*z,r[6]=g*E+v*L+m*B+p*V,r[10]=g*P+v*D+m*G+p*Q,r[14]=g*y+v*U+m*Y+p*st,r[3]=_*T+M*S+x*k+R*z,r[7]=_*E+M*L+x*B+R*V,r[11]=_*P+M*D+x*G+R*Q,r[15]=_*y+M*U+x*Y+R*st,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],d=t[14],g=t[3],v=t[7],m=t[11],p=t[15];return g*(+r*l*u-i*c*u-r*o*f+n*c*f+i*o*d-n*l*d)+v*(+e*l*d-e*c*f+r*a*f-i*a*d+i*c*h-r*l*h)+m*(+e*c*u-e*o*d-r*a*u+n*a*d+r*o*h-n*c*h)+p*(-i*o*h-e*l*u+e*o*f+i*a*u-n*a*f+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],d=t[11],g=t[12],v=t[13],m=t[14],p=t[15],_=u*m*c-v*f*c+v*l*d-o*m*d-u*l*p+o*f*p,M=g*f*c-h*m*c-g*l*d+a*m*d+h*l*p-a*f*p,x=h*v*c-g*u*c+g*o*d-a*v*d-h*o*p+a*u*p,R=g*u*l-h*v*l-g*o*f+a*v*f+h*o*m-a*u*m,T=e*_+n*M+i*x+r*R;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const E=1/T;return t[0]=_*E,t[1]=(v*f*r-u*m*r-v*i*d+n*m*d+u*i*p-n*f*p)*E,t[2]=(o*m*r-v*l*r+v*i*c-n*m*c-o*i*p+n*l*p)*E,t[3]=(u*l*r-o*f*r-u*i*c+n*f*c+o*i*d-n*l*d)*E,t[4]=M*E,t[5]=(h*m*r-g*f*r+g*i*d-e*m*d-h*i*p+e*f*p)*E,t[6]=(g*l*r-a*m*r-g*i*c+e*m*c+a*i*p-e*l*p)*E,t[7]=(a*f*r-h*l*r+h*i*c-e*f*c-a*i*d+e*l*d)*E,t[8]=x*E,t[9]=(g*u*r-h*v*r-g*n*d+e*v*d+h*n*p-e*u*p)*E,t[10]=(a*v*r-g*o*r+g*n*c-e*v*c-a*n*p+e*o*p)*E,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*d-e*o*d)*E,t[12]=R*E,t[13]=(h*v*i-g*u*i+g*n*f-e*v*f-h*n*m+e*u*m)*E,t[14]=(g*o*i-a*v*i-g*n*l+e*v*l+a*n*m-e*o*m)*E,t[15]=(a*u*i-h*o*i+h*n*l-e*u*l-a*n*f+e*o*f)*E,this}scale(t){const e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,a){return this.set(1,n,r,0,t,1,a,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,f=r*c,d=r*h,g=r*u,v=a*h,m=a*u,p=o*u,_=l*c,M=l*h,x=l*u,R=n.x,T=n.y,E=n.z;return i[0]=(1-(v+p))*R,i[1]=(d+x)*R,i[2]=(g-M)*R,i[3]=0,i[4]=(d-x)*T,i[5]=(1-(f+p))*T,i[6]=(m+_)*T,i[7]=0,i[8]=(g+M)*E,i[9]=(m-_)*E,i[10]=(1-(f+v))*E,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let r=Si.set(i[0],i[1],i[2]).length();const a=Si.set(i[4],i[5],i[6]).length(),o=Si.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),t.x=i[12],t.y=i[13],t.z=i[14],sn.copy(this);const c=1/r,h=1/a,u=1/o;return sn.elements[0]*=c,sn.elements[1]*=c,sn.elements[2]*=c,sn.elements[4]*=h,sn.elements[5]*=h,sn.elements[6]*=h,sn.elements[8]*=u,sn.elements[9]*=u,sn.elements[10]*=u,e.setFromRotationMatrix(sn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,i,r,a,o=An){const l=this.elements,c=2*r/(e-t),h=2*r/(n-i),u=(e+t)/(e-t),f=(n+i)/(n-i);let d,g;if(o===An)d=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===Rr)d=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,r,a,o=An){const l=this.elements,c=1/(e-t),h=1/(n-i),u=1/(a-r),f=(e+t)*c,d=(n+i)*h;let g,v;if(o===An)g=(a+r)*u,v=-2*u;else if(o===Rr)g=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Si=new A,sn=new Vt,hd=new A(0,0,0),ud=new A(1,1,1),kn=new A,qs=new A,He=new A,Cl=new Vt,Rl=new Un;class cn{constructor(t=0,e=0,n=0,i=cn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],f=i[6],d=i[10];switch(e){case"XYZ":this._y=Math.asin(we(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-we(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(we(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-we(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(we(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-we(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Cl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Cl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Rl.setFromEuler(this),this.setFromQuaternion(Rl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}cn.DEFAULT_ORDER="XYZ";class Ho{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let dd=0;const Pl=new A,wi=new Un,yn=new Vt,Ys=new A,ls=new A,fd=new A,pd=new Un,Ll=new A(1,0,0),Dl=new A(0,1,0),Il=new A(0,0,1),Ul={type:"added"},md={type:"removed"},bi={type:"childadded",child:null},Kr={type:"childremoved",child:null};class _e extends ts{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dd++}),this.uuid=mn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_e.DEFAULT_UP.clone();const t=new A,e=new cn,n=new Un,i=new A(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Vt},normalMatrix:{value:new kt}}),this.matrix=new Vt,this.matrixWorld=new Vt,this.matrixAutoUpdate=_e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ho,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return wi.setFromAxisAngle(t,e),this.quaternion.multiply(wi),this}rotateOnWorldAxis(t,e){return wi.setFromAxisAngle(t,e),this.quaternion.premultiply(wi),this}rotateX(t){return this.rotateOnAxis(Ll,t)}rotateY(t){return this.rotateOnAxis(Dl,t)}rotateZ(t){return this.rotateOnAxis(Il,t)}translateOnAxis(t,e){return Pl.copy(t).applyQuaternion(this.quaternion),this.position.add(Pl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Ll,t)}translateY(t){return this.translateOnAxis(Dl,t)}translateZ(t){return this.translateOnAxis(Il,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(yn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ys.copy(t):Ys.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),ls.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yn.lookAt(ls,Ys,this.up):yn.lookAt(Ys,ls,this.up),this.quaternion.setFromRotationMatrix(yn),i&&(yn.extractRotation(i.matrixWorld),wi.setFromRotationMatrix(yn),this.quaternion.premultiply(wi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Ul),bi.child=t,this.dispatchEvent(bi),bi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(md),Kr.child=t,this.dispatchEvent(Kr),Kr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),yn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),yn.multiply(t.parent.matrixWorld)),t.applyMatrix4(yn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Ul),bi.child=t,this.dispatchEvent(bi),bi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ls,t,fd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ls,pd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));i.material=o}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),d=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}_e.DEFAULT_UP=new A(0,1,0);_e.DEFAULT_MATRIX_AUTO_UPDATE=!0;_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const rn=new A,Sn=new A,jr=new A,wn=new A,Ti=new A,Ei=new A,Nl=new A,Jr=new A,Qr=new A,ta=new A,ea=new le,na=new le,ia=new le;class je{constructor(t=new A,e=new A,n=new A){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),rn.subVectors(t,e),i.cross(rn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){rn.subVectors(i,e),Sn.subVectors(n,e),jr.subVectors(t,e);const a=rn.dot(rn),o=rn.dot(Sn),l=rn.dot(jr),c=Sn.dot(Sn),h=Sn.dot(jr),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,d=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-d-g,g,d)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,wn)===null?!1:wn.x>=0&&wn.y>=0&&wn.x+wn.y<=1}static getInterpolation(t,e,n,i,r,a,o,l){return this.getBarycoord(t,e,n,i,wn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,wn.x),l.addScaledVector(a,wn.y),l.addScaledVector(o,wn.z),l)}static getInterpolatedAttribute(t,e,n,i,r,a){return ea.setScalar(0),na.setScalar(0),ia.setScalar(0),ea.fromBufferAttribute(t,e),na.fromBufferAttribute(t,n),ia.fromBufferAttribute(t,i),a.setScalar(0),a.addScaledVector(ea,r.x),a.addScaledVector(na,r.y),a.addScaledVector(ia,r.z),a}static isFrontFacing(t,e,n,i){return rn.subVectors(n,e),Sn.subVectors(t,e),rn.cross(Sn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return rn.subVectors(this.c,this.b),Sn.subVectors(this.a,this.b),rn.cross(Sn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return je.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return je.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return je.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return je.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return je.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,r=this.c;let a,o;Ti.subVectors(i,n),Ei.subVectors(r,n),Jr.subVectors(t,n);const l=Ti.dot(Jr),c=Ei.dot(Jr);if(l<=0&&c<=0)return e.copy(n);Qr.subVectors(t,i);const h=Ti.dot(Qr),u=Ei.dot(Qr);if(h>=0&&u<=h)return e.copy(i);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(Ti,a);ta.subVectors(t,r);const d=Ti.dot(ta),g=Ei.dot(ta);if(g>=0&&d<=g)return e.copy(r);const v=d*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(Ei,o);const m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return Nl.subVectors(r,i),o=(u-h)/(u-h+(d-g)),e.copy(i).addScaledVector(Nl,o);const p=1/(m+v+f);return a=v*p,o=f*p,e.copy(n).addScaledVector(Ti,a).addScaledVector(Ei,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const _h={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Hn={h:0,s:0,l:0},Zs={h:0,s:0,l:0};function sa(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class dt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=se){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,$t.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=$t.workingColorSpace){return this.r=t,this.g=e,this.b=n,$t.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=$t.workingColorSpace){if(t=Bo(t,1),e=we(e,0,1),n=we(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=sa(a,r,t+1/3),this.g=sa(a,r,t),this.b=sa(a,r,t-1/3)}return $t.toWorkingColorSpace(this,i),this}setStyle(t,e=se){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=se){const n=_h[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Pn(t.r),this.g=Pn(t.g),this.b=Pn(t.b),this}copyLinearToSRGB(t){return this.r=Wi(t.r),this.g=Wi(t.g),this.b=Wi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=se){return $t.fromWorkingColorSpace(Pe.copy(this),t),Math.round(we(Pe.r*255,0,255))*65536+Math.round(we(Pe.g*255,0,255))*256+Math.round(we(Pe.b*255,0,255))}getHexString(t=se){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=$t.workingColorSpace){$t.fromWorkingColorSpace(Pe.copy(this),e);const n=Pe.r,i=Pe.g,r=Pe.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=$t.workingColorSpace){return $t.fromWorkingColorSpace(Pe.copy(this),e),t.r=Pe.r,t.g=Pe.g,t.b=Pe.b,t}getStyle(t=se){$t.fromWorkingColorSpace(Pe.copy(this),t);const e=Pe.r,n=Pe.g,i=Pe.b;return t!==se?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(Hn),this.setHSL(Hn.h+t,Hn.s+e,Hn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Hn),t.getHSL(Zs);const n=ws(Hn.h,Zs.h,e),i=ws(Hn.s,Zs.s,e),r=ws(Hn.l,Zs.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Pe=new dt;dt.NAMES=_h;let gd=0;class Yn extends ts{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=mn(),this.name="",this.blending=li,this.side=Dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ua,this.blendDst=Na,this.blendEquation=ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new dt(0,0,0),this.blendAlpha=0,this.depthFunc=Xi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=vl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=vi,this.stencilZFail=vi,this.stencilZPass=vi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==li&&(n.blending=this.blending),this.side!==Dn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ua&&(n.blendSrc=this.blendSrc),this.blendDst!==Na&&(n.blendDst=this.blendDst),this.blendEquation!==ri&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Xi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==vl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==vi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==vi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==vi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=i(t.textures),a=i(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class qe extends Yn{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.combine=Ro,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ve=new A,Ks=new it;class ge{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=_o,this.updateRanges=[],this.gpuType=pn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Ks.fromBufferAttribute(this,e),Ks.applyMatrix3(t),this.setXY(e,Ks.x,Ks.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyMatrix3(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyMatrix4(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyNormalMatrix(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.transformDirection(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=an(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ne(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=an(e,this.array)),e}setX(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=an(e,this.array)),e}setY(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=an(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=an(e,this.array)),e}setW(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array),r=ne(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==_o&&(t.usage=this.usage),t}}class Mh extends ge{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class yh extends ge{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Yt extends ge{constructor(t,e,n){super(new Float32Array(t),e,n)}}let vd=0;const Ke=new Vt,ra=new _e,Ai=new A,Ge=new pi,cs=new pi,Se=new A;class ue extends ts{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:vd++}),this.uuid=mn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(gh(t)?yh:Mh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new kt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Ke.makeRotationFromQuaternion(t),this.applyMatrix4(Ke),this}rotateX(t){return Ke.makeRotationX(t),this.applyMatrix4(Ke),this}rotateY(t){return Ke.makeRotationY(t),this.applyMatrix4(Ke),this}rotateZ(t){return Ke.makeRotationZ(t),this.applyMatrix4(Ke),this}translate(t,e,n){return Ke.makeTranslation(t,e,n),this.applyMatrix4(Ke),this}scale(t,e,n){return Ke.makeScale(t,e,n),this.applyMatrix4(Ke),this}lookAt(t){return ra.lookAt(t),ra.updateMatrix(),this.applyMatrix4(ra.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ai).negate(),this.translate(Ai.x,Ai.y,Ai.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let i=0,r=t.length;i<r;i++){const a=t[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Yt(n,3))}else{for(let n=0,i=e.count;n<i;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const r=e[n];Ge.setFromBufferAttribute(r),this.morphTargetsRelative?(Se.addVectors(this.boundingBox.min,Ge.min),this.boundingBox.expandByPoint(Se),Se.addVectors(this.boundingBox.max,Ge.max),this.boundingBox.expandByPoint(Se)):(this.boundingBox.expandByPoint(Ge.min),this.boundingBox.expandByPoint(Ge.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new es);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(t){const n=this.boundingSphere.center;if(Ge.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];cs.setFromBufferAttribute(o),this.morphTargetsRelative?(Se.addVectors(Ge.min,cs.min),Ge.expandByPoint(Se),Se.addVectors(Ge.max,cs.max),Ge.expandByPoint(Se)):(Ge.expandByPoint(cs.min),Ge.expandByPoint(cs.max))}Ge.getCenter(n);let i=0;for(let r=0,a=t.count;r<a;r++)Se.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(Se));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Se.fromBufferAttribute(o,c),l&&(Ai.fromBufferAttribute(t,c),Se.add(Ai)),i=Math.max(i,n.distanceToSquared(Se))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ge(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let P=0;P<n.count;P++)o[P]=new A,l[P]=new A;const c=new A,h=new A,u=new A,f=new it,d=new it,g=new it,v=new A,m=new A;function p(P,y,S){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,y),u.fromBufferAttribute(n,S),f.fromBufferAttribute(r,P),d.fromBufferAttribute(r,y),g.fromBufferAttribute(r,S),h.sub(c),u.sub(c),d.sub(f),g.sub(f);const L=1/(d.x*g.y-g.x*d.y);isFinite(L)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(L),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(L),o[P].add(v),o[y].add(v),o[S].add(v),l[P].add(m),l[y].add(m),l[S].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let P=0,y=_.length;P<y;++P){const S=_[P],L=S.start,D=S.count;for(let U=L,k=L+D;U<k;U+=3)p(t.getX(U+0),t.getX(U+1),t.getX(U+2))}const M=new A,x=new A,R=new A,T=new A;function E(P){R.fromBufferAttribute(i,P),T.copy(R);const y=o[P];M.copy(y),M.sub(R.multiplyScalar(R.dot(y))).normalize(),x.crossVectors(T,y);const L=x.dot(l[P])<0?-1:1;a.setXYZW(P,M.x,M.y,M.z,L)}for(let P=0,y=_.length;P<y;++P){const S=_[P],L=S.start,D=S.count;for(let U=L,k=L+D;U<k;U+=3)E(t.getX(U+0)),E(t.getX(U+1)),E(t.getX(U+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ge(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const i=new A,r=new A,a=new A,o=new A,l=new A,c=new A,h=new A,u=new A;if(t)for(let f=0,d=t.count;f<d;f+=3){const g=t.getX(f+0),v=t.getX(f+1),m=t.getX(f+2);i.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=e.count;f<d;f+=3)i.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Se.fromBufferAttribute(t,e),Se.normalize(),t.setXYZ(e,Se.x,Se.y,Se.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let d=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*h;for(let p=0;p<h;p++)f[g++]=c[d++]}return new ge(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new ue,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],d=t(f,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const d=c[u];h.push(d.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Fl=new Vt,Jn=new ko,js=new es,Ol=new A,Js=new A,Qs=new A,tr=new A,aa=new A,er=new A,zl=new A,nr=new A;class It extends _e{constructor(t=new ue,e=new qe){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const o=this.morphTargetInfluences;if(r&&o){er.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(aa.fromBufferAttribute(u,t),a?er.addScaledVector(aa,h):er.addScaledVector(aa.sub(e),h))}e.add(er)}return e}raycast(t,e){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),js.copy(n.boundingSphere),js.applyMatrix4(r),Jn.copy(t.ray).recast(t.near),!(js.containsPoint(Jn.origin)===!1&&(Jn.intersectSphere(js,Ol)===null||Jn.origin.distanceToSquared(Ol)>(t.far-t.near)**2))&&(Fl.copy(r).invert(),Jn.copy(t.ray).applyMatrix4(Fl),!(n.boundingBox!==null&&Jn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Jn)))}_computeIntersections(t,e,n){let i;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const m=f[g],p=a[m.materialIndex],_=Math.max(m.start,d.start),M=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let x=_,R=M;x<R;x+=3){const T=o.getX(x),E=o.getX(x+1),P=o.getX(x+2);i=ir(this,p,t,n,c,h,u,T,E,P),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const g=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){const _=o.getX(m),M=o.getX(m+1),x=o.getX(m+2);i=ir(this,a,t,n,c,h,u,_,M,x),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const m=f[g],p=a[m.materialIndex],_=Math.max(m.start,d.start),M=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let x=_,R=M;x<R;x+=3){const T=x,E=x+1,P=x+2;i=ir(this,p,t,n,c,h,u,T,E,P),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const g=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){const _=m,M=m+1,x=m+2;i=ir(this,a,t,n,c,h,u,_,M,x),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}}}function xd(s,t,e,n,i,r,a,o){let l;if(t.side===Le?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,t.side===Dn,o),l===null)return null;nr.copy(o),nr.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(nr);return c<e.near||c>e.far?null:{distance:c,point:nr.clone(),object:s}}function ir(s,t,e,n,i,r,a,o,l,c){s.getVertexPosition(o,Js),s.getVertexPosition(l,Qs),s.getVertexPosition(c,tr);const h=xd(s,t,e,n,Js,Qs,tr,zl);if(h){const u=new A;je.getBarycoord(zl,Js,Qs,tr,u),i&&(h.uv=je.getInterpolatedAttribute(i,o,l,c,u,new it)),r&&(h.uv1=je.getInterpolatedAttribute(r,o,l,c,u,new it)),a&&(h.normal=je.getInterpolatedAttribute(a,o,l,c,u,new A),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new A,materialIndex:0};je.getNormal(Js,Qs,tr,f.normal),h.face=f,h.barycoord=u}return h}class Te extends ue{constructor(t=1,e=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,d=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,i,a,2),g("x","z","y",1,-1,t,n,-e,i,a,3),g("x","y","z",1,-1,t,e,n,i,r,4),g("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new Yt(c,3)),this.setAttribute("normal",new Yt(h,3)),this.setAttribute("uv",new Yt(u,2));function g(v,m,p,_,M,x,R,T,E,P,y){const S=x/E,L=R/P,D=x/2,U=R/2,k=T/2,B=E+1,G=P+1;let Y=0,z=0;const V=new A;for(let Q=0;Q<G;Q++){const st=Q*L-U;for(let rt=0;rt<B;rt++){const Lt=rt*S-D;V[v]=Lt*_,V[m]=st*M,V[p]=k,c.push(V.x,V.y,V.z),V[v]=0,V[m]=0,V[p]=T>0?1:-1,h.push(V.x,V.y,V.z),u.push(rt/E),u.push(1-Q/P),Y+=1}}for(let Q=0;Q<P;Q++)for(let st=0;st<E;st++){const rt=f+st+B*Q,Lt=f+st+B*(Q+1),$=f+(st+1)+B*(Q+1),tt=f+(st+1)+B*Q;l.push(rt,Lt,tt),l.push(Lt,$,tt),z+=6}o.addGroup(d,z,y),d+=z,f+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Te(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Ki(s){const t={};for(const e in s){t[e]={};for(const n in s[e]){const i=s[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function Ne(s){const t={};for(let e=0;e<s.length;e++){const n=Ki(s[e]);for(const i in n)t[i]=n[i]}return t}function _d(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Sh(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:$t.workingColorSpace}const hn={clone:Ki,merge:Ne};var Md=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,yd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class me extends Yn{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Md,this.fragmentShader=yd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ki(t.uniforms),this.uniformsGroups=_d(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?e.uniforms[i]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[i]={type:"m4",value:a.toArray()}:e.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class wh extends _e{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Vt,this.projectionMatrix=new Vt,this.projectionMatrixInverse=new Vt,this.coordinateSystem=An}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Gn=new A,Bl=new it,kl=new it;class Xe extends wh{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Ls*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Ss*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ls*2*Math.atan(Math.tan(Ss*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Gn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Gn.x,Gn.y).multiplyScalar(-t/Gn.z),Gn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Gn.x,Gn.y).multiplyScalar(-t/Gn.z)}getViewSize(t,e){return this.getViewBounds(t,Bl,kl),e.subVectors(kl,Bl)}setViewOffset(t,e,n,i,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Ss*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,e-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ci=-90,Ri=1;class Sd extends _e{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Xe(Ci,Ri,t,e);i.layers=this.layers,this.add(i);const r=new Xe(Ci,Ri,t,e);r.layers=this.layers,this.add(r);const a=new Xe(Ci,Ri,t,e);a.layers=this.layers,this.add(a);const o=new Xe(Ci,Ri,t,e);o.layers=this.layers,this.add(o);const l=new Xe(Ci,Ri,t,e);l.layers=this.layers,this.add(l);const c=new Xe(Ci,Ri,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===An)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Rr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,r),t.setRenderTarget(n,1,i),t.render(e,a),t.setRenderTarget(n,2,i),t.render(e,o),t.setRenderTarget(n,3,i),t.render(e,l),t.setRenderTarget(n,4,i),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(u,f,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class bh extends Ae{constructor(t,e,n,i,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:$i,super(t,e,n,i,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class wd extends Je{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new bh(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Be}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Te(5,5,5),r=new me({name:"CubemapFromEquirect",uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Le,blending:Cn});r.uniforms.tEquirect.value=e;const a=new It(i,r),o=e.minFilter;return e.minFilter===En&&(e.minFilter=Be),new Sd(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,i){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,i);t.setRenderTarget(r)}}const oa=new A,bd=new A,Td=new kt;class Vn{constructor(t=new A(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=oa.subVectors(n,e).cross(bd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(oa),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Td.getNormalMatrix(t),i=this.coplanarPoint(oa).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Qn=new es,sr=new A;class Go{constructor(t=new Vn,e=new Vn,n=new Vn,i=new Vn,r=new Vn,a=new Vn){this.planes=[t,e,n,i,r,a]}set(t,e,n,i,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=An){const n=this.planes,i=t.elements,r=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],u=i[6],f=i[7],d=i[8],g=i[9],v=i[10],m=i[11],p=i[12],_=i[13],M=i[14],x=i[15];if(n[0].setComponents(l-r,f-c,m-d,x-p).normalize(),n[1].setComponents(l+r,f+c,m+d,x+p).normalize(),n[2].setComponents(l+a,f+h,m+g,x+_).normalize(),n[3].setComponents(l-a,f-h,m-g,x-_).normalize(),n[4].setComponents(l-o,f-u,m-v,x-M).normalize(),e===An)n[5].setComponents(l+o,f+u,m+v,x+M).normalize();else if(e===Rr)n[5].setComponents(o,u,v,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Qn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Qn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Qn)}intersectsSprite(t){return Qn.center.set(0,0,0),Qn.radius=.7071067811865476,Qn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Qn)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if(sr.x=i.normal.x>0?t.max.x:t.min.x,sr.y=i.normal.y>0?t.max.y:t.min.y,sr.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(sr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Th(){let s=null,t=!1,e=null,n=null;function i(r,a){e(r,a),n=s.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Ed(s){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=s.createBuffer();s.bindBuffer(l,f),s.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=s.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=s.SHORT;else if(c instanceof Uint32Array)d=s.UNSIGNED_INT;else if(c instanceof Int32Array)d=s.INT;else if(c instanceof Int8Array)d=s.BYTE;else if(c instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<u.length;d++){const g=u[f],v=u[d];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,u[f]=v)}u.length=f+1;for(let d=0,g=u.length;d<g;d++){const v=u[d];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}class Qe extends ue{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=t/o,f=e/l,d=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const _=p*f-a;for(let M=0;M<c;M++){const x=M*u-r;g.push(x,-_,0),v.push(0,0,1),m.push(M/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let _=0;_<o;_++){const M=_+c*p,x=_+c*(p+1),R=_+1+c*(p+1),T=_+1+c*p;d.push(M,x,T),d.push(x,R,T)}this.setIndex(d),this.setAttribute("position",new Yt(g,3)),this.setAttribute("normal",new Yt(v,3)),this.setAttribute("uv",new Yt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Qe(t.width,t.height,t.widthSegments,t.heightSegments)}}var Ad=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Cd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Rd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Pd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ld=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Dd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Id=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ud=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Nd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Fd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Od=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,zd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Bd=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,kd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Hd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Gd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Vd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Wd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Xd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$d=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,qd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Yd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Zd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Kd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,jd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Jd=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Qd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,tf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ef=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,nf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,sf="gl_FragColor = linearToOutputTexel( gl_FragColor );",rf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,af=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,of=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,lf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,cf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,hf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,uf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,df=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ff=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,pf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,mf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,gf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,vf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,xf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,_f=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Mf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,yf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Sf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,wf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,bf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Tf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Ef=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Af=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Cf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Rf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Pf=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Lf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Df=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,If=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Uf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Nf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ff=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Of=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,kf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Gf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Vf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Wf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,$f=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,qf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Zf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Kf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,jf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Jf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Qf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,tp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ep=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,np=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,ip=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,sp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,rp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ap=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,op=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,lp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,cp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,hp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,up=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,dp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,fp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,pp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,mp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,gp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,vp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,xp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,_p=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Mp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,yp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Sp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,wp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,bp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Tp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Ep=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Ap=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Cp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Pp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Dp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ip=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Up=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Np=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Fp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Op=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,zp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,kp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Hp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Gp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Wp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,$p=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Yp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Zp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Jp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,em=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,nm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,im=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,rm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,am=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Gt={alphahash_fragment:Ad,alphahash_pars_fragment:Cd,alphamap_fragment:Rd,alphamap_pars_fragment:Pd,alphatest_fragment:Ld,alphatest_pars_fragment:Dd,aomap_fragment:Id,aomap_pars_fragment:Ud,batching_pars_vertex:Nd,batching_vertex:Fd,begin_vertex:Od,beginnormal_vertex:zd,bsdfs:Bd,iridescence_fragment:kd,bumpmap_pars_fragment:Hd,clipping_planes_fragment:Gd,clipping_planes_pars_fragment:Vd,clipping_planes_pars_vertex:Wd,clipping_planes_vertex:Xd,color_fragment:$d,color_pars_fragment:qd,color_pars_vertex:Yd,color_vertex:Zd,common:Kd,cube_uv_reflection_fragment:jd,defaultnormal_vertex:Jd,displacementmap_pars_vertex:Qd,displacementmap_vertex:tf,emissivemap_fragment:ef,emissivemap_pars_fragment:nf,colorspace_fragment:sf,colorspace_pars_fragment:rf,envmap_fragment:af,envmap_common_pars_fragment:of,envmap_pars_fragment:lf,envmap_pars_vertex:cf,envmap_physical_pars_fragment:Mf,envmap_vertex:hf,fog_vertex:uf,fog_pars_vertex:df,fog_fragment:ff,fog_pars_fragment:pf,gradientmap_pars_fragment:mf,lightmap_pars_fragment:gf,lights_lambert_fragment:vf,lights_lambert_pars_fragment:xf,lights_pars_begin:_f,lights_toon_fragment:yf,lights_toon_pars_fragment:Sf,lights_phong_fragment:wf,lights_phong_pars_fragment:bf,lights_physical_fragment:Tf,lights_physical_pars_fragment:Ef,lights_fragment_begin:Af,lights_fragment_maps:Cf,lights_fragment_end:Rf,logdepthbuf_fragment:Pf,logdepthbuf_pars_fragment:Lf,logdepthbuf_pars_vertex:Df,logdepthbuf_vertex:If,map_fragment:Uf,map_pars_fragment:Nf,map_particle_fragment:Ff,map_particle_pars_fragment:Of,metalnessmap_fragment:zf,metalnessmap_pars_fragment:Bf,morphinstance_vertex:kf,morphcolor_vertex:Hf,morphnormal_vertex:Gf,morphtarget_pars_vertex:Vf,morphtarget_vertex:Wf,normal_fragment_begin:Xf,normal_fragment_maps:$f,normal_pars_fragment:qf,normal_pars_vertex:Yf,normal_vertex:Zf,normalmap_pars_fragment:Kf,clearcoat_normal_fragment_begin:jf,clearcoat_normal_fragment_maps:Jf,clearcoat_pars_fragment:Qf,iridescence_pars_fragment:tp,opaque_fragment:ep,packing:np,premultiplied_alpha_fragment:ip,project_vertex:sp,dithering_fragment:rp,dithering_pars_fragment:ap,roughnessmap_fragment:op,roughnessmap_pars_fragment:lp,shadowmap_pars_fragment:cp,shadowmap_pars_vertex:hp,shadowmap_vertex:up,shadowmask_pars_fragment:dp,skinbase_vertex:fp,skinning_pars_vertex:pp,skinning_vertex:mp,skinnormal_vertex:gp,specularmap_fragment:vp,specularmap_pars_fragment:xp,tonemapping_fragment:_p,tonemapping_pars_fragment:Mp,transmission_fragment:yp,transmission_pars_fragment:Sp,uv_pars_fragment:wp,uv_pars_vertex:bp,uv_vertex:Tp,worldpos_vertex:Ep,background_vert:Ap,background_frag:Cp,backgroundCube_vert:Rp,backgroundCube_frag:Pp,cube_vert:Lp,cube_frag:Dp,depth_vert:Ip,depth_frag:Up,distanceRGBA_vert:Np,distanceRGBA_frag:Fp,equirect_vert:Op,equirect_frag:zp,linedashed_vert:Bp,linedashed_frag:kp,meshbasic_vert:Hp,meshbasic_frag:Gp,meshlambert_vert:Vp,meshlambert_frag:Wp,meshmatcap_vert:Xp,meshmatcap_frag:$p,meshnormal_vert:qp,meshnormal_frag:Yp,meshphong_vert:Zp,meshphong_frag:Kp,meshphysical_vert:jp,meshphysical_frag:Jp,meshtoon_vert:Qp,meshtoon_frag:tm,points_vert:em,points_frag:nm,shadow_vert:im,shadow_frag:sm,sprite_vert:rm,sprite_frag:am},ct={common:{diffuse:{value:new dt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new kt}},envmap:{envMap:{value:null},envMapRotation:{value:new kt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new kt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new kt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new kt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new kt},normalScale:{value:new it(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new kt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new kt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new kt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new kt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new dt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new dt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0},uvTransform:{value:new kt}},sprite:{diffuse:{value:new dt(16777215)},opacity:{value:1},center:{value:new it(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}}},dn={basic:{uniforms:Ne([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.fog]),vertexShader:Gt.meshbasic_vert,fragmentShader:Gt.meshbasic_frag},lambert:{uniforms:Ne([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new dt(0)}}]),vertexShader:Gt.meshlambert_vert,fragmentShader:Gt.meshlambert_frag},phong:{uniforms:Ne([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new dt(0)},specular:{value:new dt(1118481)},shininess:{value:30}}]),vertexShader:Gt.meshphong_vert,fragmentShader:Gt.meshphong_frag},standard:{uniforms:Ne([ct.common,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.roughnessmap,ct.metalnessmap,ct.fog,ct.lights,{emissive:{value:new dt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag},toon:{uniforms:Ne([ct.common,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.gradientmap,ct.fog,ct.lights,{emissive:{value:new dt(0)}}]),vertexShader:Gt.meshtoon_vert,fragmentShader:Gt.meshtoon_frag},matcap:{uniforms:Ne([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,{matcap:{value:null}}]),vertexShader:Gt.meshmatcap_vert,fragmentShader:Gt.meshmatcap_frag},points:{uniforms:Ne([ct.points,ct.fog]),vertexShader:Gt.points_vert,fragmentShader:Gt.points_frag},dashed:{uniforms:Ne([ct.common,ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Gt.linedashed_vert,fragmentShader:Gt.linedashed_frag},depth:{uniforms:Ne([ct.common,ct.displacementmap]),vertexShader:Gt.depth_vert,fragmentShader:Gt.depth_frag},normal:{uniforms:Ne([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,{opacity:{value:1}}]),vertexShader:Gt.meshnormal_vert,fragmentShader:Gt.meshnormal_frag},sprite:{uniforms:Ne([ct.sprite,ct.fog]),vertexShader:Gt.sprite_vert,fragmentShader:Gt.sprite_frag},background:{uniforms:{uvTransform:{value:new kt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Gt.background_vert,fragmentShader:Gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new kt}},vertexShader:Gt.backgroundCube_vert,fragmentShader:Gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Gt.cube_vert,fragmentShader:Gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Gt.equirect_vert,fragmentShader:Gt.equirect_frag},distanceRGBA:{uniforms:Ne([ct.common,ct.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Gt.distanceRGBA_vert,fragmentShader:Gt.distanceRGBA_frag},shadow:{uniforms:Ne([ct.lights,ct.fog,{color:{value:new dt(0)},opacity:{value:1}}]),vertexShader:Gt.shadow_vert,fragmentShader:Gt.shadow_frag}};dn.physical={uniforms:Ne([dn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new kt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new kt},clearcoatNormalScale:{value:new it(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new kt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new kt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new kt},sheen:{value:0},sheenColor:{value:new dt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new kt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new kt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new kt},transmissionSamplerSize:{value:new it},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new kt},attenuationDistance:{value:0},attenuationColor:{value:new dt(0)},specularColor:{value:new dt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new kt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new kt},anisotropyVector:{value:new it},anisotropyMap:{value:null},anisotropyMapTransform:{value:new kt}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag};const rr={r:0,b:0,g:0},ti=new cn,om=new Vt;function lm(s,t,e,n,i,r,a){const o=new dt(0);let l=r===!0?0:1,c,h,u=null,f=0,d=null;function g(_){let M=_.isScene===!0?_.background:null;return M&&M.isTexture&&(M=(_.backgroundBlurriness>0?e:t).get(M)),M}function v(_){let M=!1;const x=g(_);x===null?p(o,l):x&&x.isColor&&(p(x,1),M=!0);const R=s.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,a):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(_,M){const x=g(M);x&&(x.isCubeTexture||x.mapping===Nr)?(h===void 0&&(h=new It(new Te(1,1,1),new me({name:"BackgroundCubeMaterial",uniforms:Ki(dn.backgroundCube.uniforms),vertexShader:dn.backgroundCube.vertexShader,fragmentShader:dn.backgroundCube.fragmentShader,side:Le,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,T,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),ti.copy(M.backgroundRotation),ti.x*=-1,ti.y*=-1,ti.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(ti.y*=-1,ti.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(om.makeRotationFromEuler(ti)),h.material.toneMapped=$t.getTransfer(x.colorSpace)!==ee,(u!==x||f!==x.version||d!==s.toneMapping)&&(h.material.needsUpdate=!0,u=x,f=x.version,d=s.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new It(new Qe(2,2),new me({name:"BackgroundMaterial",uniforms:Ki(dn.background.uniforms),vertexShader:dn.background.vertexShader,fragmentShader:dn.background.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=$t.getTransfer(x.colorSpace)!==ee,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||f!==x.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,u=x,f=x.version,d=s.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function p(_,M){_.getRGB(rr,Sh(s)),n.buffers.color.setClear(rr.r,rr.g,rr.b,M,a)}return{getClearColor:function(){return o},setClearColor:function(_,M=1){o.set(_),l=M,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,p(o,l)},render:v,addToRenderList:m}}function cm(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=f(null);let r=i,a=!1;function o(S,L,D,U,k){let B=!1;const G=u(U,D,L);r!==G&&(r=G,c(r.object)),B=d(S,U,D,k),B&&g(S,U,D,k),k!==null&&t.update(k,s.ELEMENT_ARRAY_BUFFER),(B||a)&&(a=!1,x(S,L,D,U),k!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return s.createVertexArray()}function c(S){return s.bindVertexArray(S)}function h(S){return s.deleteVertexArray(S)}function u(S,L,D){const U=D.wireframe===!0;let k=n[S.id];k===void 0&&(k={},n[S.id]=k);let B=k[L.id];B===void 0&&(B={},k[L.id]=B);let G=B[U];return G===void 0&&(G=f(l()),B[U]=G),G}function f(S){const L=[],D=[],U=[];for(let k=0;k<e;k++)L[k]=0,D[k]=0,U[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:D,attributeDivisors:U,object:S,attributes:{},index:null}}function d(S,L,D,U){const k=r.attributes,B=L.attributes;let G=0;const Y=D.getAttributes();for(const z in Y)if(Y[z].location>=0){const Q=k[z];let st=B[z];if(st===void 0&&(z==="instanceMatrix"&&S.instanceMatrix&&(st=S.instanceMatrix),z==="instanceColor"&&S.instanceColor&&(st=S.instanceColor)),Q===void 0||Q.attribute!==st||st&&Q.data!==st.data)return!0;G++}return r.attributesNum!==G||r.index!==U}function g(S,L,D,U){const k={},B=L.attributes;let G=0;const Y=D.getAttributes();for(const z in Y)if(Y[z].location>=0){let Q=B[z];Q===void 0&&(z==="instanceMatrix"&&S.instanceMatrix&&(Q=S.instanceMatrix),z==="instanceColor"&&S.instanceColor&&(Q=S.instanceColor));const st={};st.attribute=Q,Q&&Q.data&&(st.data=Q.data),k[z]=st,G++}r.attributes=k,r.attributesNum=G,r.index=U}function v(){const S=r.newAttributes;for(let L=0,D=S.length;L<D;L++)S[L]=0}function m(S){p(S,0)}function p(S,L){const D=r.newAttributes,U=r.enabledAttributes,k=r.attributeDivisors;D[S]=1,U[S]===0&&(s.enableVertexAttribArray(S),U[S]=1),k[S]!==L&&(s.vertexAttribDivisor(S,L),k[S]=L)}function _(){const S=r.newAttributes,L=r.enabledAttributes;for(let D=0,U=L.length;D<U;D++)L[D]!==S[D]&&(s.disableVertexAttribArray(D),L[D]=0)}function M(S,L,D,U,k,B,G){G===!0?s.vertexAttribIPointer(S,L,D,k,B):s.vertexAttribPointer(S,L,D,U,k,B)}function x(S,L,D,U){v();const k=U.attributes,B=D.getAttributes(),G=L.defaultAttributeValues;for(const Y in B){const z=B[Y];if(z.location>=0){let V=k[Y];if(V===void 0&&(Y==="instanceMatrix"&&S.instanceMatrix&&(V=S.instanceMatrix),Y==="instanceColor"&&S.instanceColor&&(V=S.instanceColor)),V!==void 0){const Q=V.normalized,st=V.itemSize,rt=t.get(V);if(rt===void 0)continue;const Lt=rt.buffer,$=rt.type,tt=rt.bytesPerElement,lt=$===s.INT||$===s.UNSIGNED_INT||V.gpuType===Lo;if(V.isInterleavedBufferAttribute){const et=V.data,St=et.stride,_t=V.offset;if(et.isInstancedInterleavedBuffer){for(let wt=0;wt<z.locationSize;wt++)p(z.location+wt,et.meshPerAttribute);S.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let wt=0;wt<z.locationSize;wt++)m(z.location+wt);s.bindBuffer(s.ARRAY_BUFFER,Lt);for(let wt=0;wt<z.locationSize;wt++)M(z.location+wt,st/z.locationSize,$,Q,St*tt,(_t+st/z.locationSize*wt)*tt,lt)}else{if(V.isInstancedBufferAttribute){for(let et=0;et<z.locationSize;et++)p(z.location+et,V.meshPerAttribute);S.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=V.meshPerAttribute*V.count)}else for(let et=0;et<z.locationSize;et++)m(z.location+et);s.bindBuffer(s.ARRAY_BUFFER,Lt);for(let et=0;et<z.locationSize;et++)M(z.location+et,st/z.locationSize,$,Q,st*tt,st/z.locationSize*et*tt,lt)}}else if(G!==void 0){const Q=G[Y];if(Q!==void 0)switch(Q.length){case 2:s.vertexAttrib2fv(z.location,Q);break;case 3:s.vertexAttrib3fv(z.location,Q);break;case 4:s.vertexAttrib4fv(z.location,Q);break;default:s.vertexAttrib1fv(z.location,Q)}}}}_()}function R(){P();for(const S in n){const L=n[S];for(const D in L){const U=L[D];for(const k in U)h(U[k].object),delete U[k];delete L[D]}delete n[S]}}function T(S){if(n[S.id]===void 0)return;const L=n[S.id];for(const D in L){const U=L[D];for(const k in U)h(U[k].object),delete U[k];delete L[D]}delete n[S.id]}function E(S){for(const L in n){const D=n[L];if(D[S.id]===void 0)continue;const U=D[S.id];for(const k in U)h(U[k].object),delete U[k];delete D[S.id]}}function P(){y(),a=!0,r!==i&&(r=i,c(r.object))}function y(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:P,resetDefaultState:y,dispose:R,releaseStatesOfGeometry:T,releaseStatesOfProgram:E,initAttributes:v,enableAttribute:m,disableUnusedAttributes:_}}function hm(s,t,e){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];e.update(d,n,1)}function l(c,h,u,f){if(u===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v]*f[v];e.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function um(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const E=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(E){return!(E!==on&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(E){const P=E===Rn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==In&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==pn&&!P)}function l(E){if(E==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),_=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),M=s.getParameter(s.MAX_VARYING_VECTORS),x=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,T=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:_,maxVaryings:M,maxFragmentUniforms:x,vertexTextures:R,maxSamples:T}}function dm(s){const t=this;let e=null,n=0,i=!1,r=!1;const a=new Vn,o=new kt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||i;return i=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,d){const g=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,p=s.get(u);if(!i||g===null||g.length===0||r&&!m)r?h(null):c();else{const _=r?0:n,M=_*4;let x=p.clippingState||null;l.value=x,x=h(g,f,M,d);for(let R=0;R!==M;++R)x[R]=e[R];p.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,d,g){const v=u!==null?u.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=d+v*4,_=f.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<p)&&(m=new Float32Array(p));for(let M=0,x=d;M!==v;++M,x+=4)a.copy(u[M]).applyMatrix4(_,o),a.normal.toArray(m,x),m[x+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}function fm(s){let t=new WeakMap;function e(a,o){return o===Va?a.mapping=$i:o===Wa&&(a.mapping=qi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Va||o===Wa)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new wd(l.height);return c.fromEquirectangularTexture(s,a),t.set(a,c),a.addEventListener("dispose",i),e(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class Vo extends wh{constructor(t=-1,e=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=i+e,l=i-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Bi=4,Hl=[.125,.215,.35,.446,.526,.582],ai=20,la=new Vo,Gl=new dt;let ca=null,ha=0,ua=0,da=!1;const ii=(1+Math.sqrt(5))/2,Pi=1/ii,Vl=[new A(-ii,Pi,0),new A(ii,Pi,0),new A(-Pi,0,ii),new A(Pi,0,ii),new A(0,ii,-Pi),new A(0,ii,Pi),new A(-1,1,-1),new A(1,1,-1),new A(-1,1,1),new A(1,1,1)];class Mo{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){ca=this._renderer.getRenderTarget(),ha=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,i,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=$l(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ca,ha,ua),this._renderer.xr.enabled=da,t.scissorTest=!1,ar(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===$i||t.mapping===qi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ca=this._renderer.getRenderTarget(),ha=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Be,minFilter:Be,generateMipmaps:!1,type:Rn,format:on,colorSpace:Qi,depthBuffer:!1},i=Wl(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Wl(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=pm(r)),this._blurMaterial=mm(r,t,e)}return i}_compileMaterial(t){const e=new It(this._lodPlanes[0],t);this._renderer.compile(e,la)}_sceneToCubeUV(t,e,n,i){const o=new Xe(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(Gl),h.toneMapping=$n,h.autoClear=!1;const d=new qe({name:"PMREM.Background",side:Le,depthWrite:!1,depthTest:!1}),g=new It(new Te,d);let v=!1;const m=t.background;m?m.isColor&&(d.color.copy(m),t.background=null,v=!0):(d.color.copy(Gl),v=!0);for(let p=0;p<6;p++){const _=p%3;_===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):_===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));const M=this._cubeSize;ar(i,_*M,p>2?M:0,M,M),h.setRenderTarget(i),v&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===$i||t.mapping===qi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=$l()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xl());const r=i?this._cubemapMaterial:this._equirectMaterial,a=new It(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;ar(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,la)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Vl[(i-r-1)%Vl.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,i,"latitudinal",r),this._halfBlur(a,t,n,n,i,"longitudinal",r)}_halfBlur(t,e,n,i,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new It(this._lodPlanes[i],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*ai-1),v=r/g,m=isFinite(r)?1+Math.floor(h*v):ai;m>ai&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ai}`);const p=[];let _=0;for(let E=0;E<ai;++E){const P=E/v,y=Math.exp(-P*P/2);p.push(y),E===0?_+=y:E<m&&(_+=2*y)}for(let E=0;E<p.length;E++)p[E]=p[E]/_;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:M}=this;f.dTheta.value=g,f.mipInt.value=M-n;const x=this._sizeLods[i],R=3*x*(i>M-Bi?i-M+Bi:0),T=4*(this._cubeSize-x);ar(e,R,T,3*x,2*x),l.setRenderTarget(e),l.render(u,la)}}function pm(s){const t=[],e=[],n=[];let i=s;const r=s-Bi+1+Hl.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);e.push(o);let l=1/o;a>s-Bi?l=Hl[a-s+Bi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,v=3,m=2,p=1,_=new Float32Array(v*g*d),M=new Float32Array(m*g*d),x=new Float32Array(p*g*d);for(let T=0;T<d;T++){const E=T%3*2/3-1,P=T>2?0:-1,y=[E,P,0,E+2/3,P,0,E+2/3,P+1,0,E,P,0,E+2/3,P+1,0,E,P+1,0];_.set(y,v*g*T),M.set(f,m*g*T);const S=[T,T,T,T,T,T];x.set(S,p*g*T)}const R=new ue;R.setAttribute("position",new ge(_,v)),R.setAttribute("uv",new ge(M,m)),R.setAttribute("faceIndex",new ge(x,p)),t.push(R),i>Bi&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Wl(s,t,e){const n=new Je(s,t,e);return n.texture.mapping=Nr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ar(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function mm(s,t,e){const n=new Float32Array(ai),i=new A(0,1,0);return new me({name:"SphericalGaussianBlur",defines:{n:ai,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Wo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function Xl(){return new me({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Wo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function $l(){return new me({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Wo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function Wo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function gm(s){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Va||l===Wa,h=l===$i||l===qi;if(c||h){let u=t.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new Mo(s)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&i(d)?(e===null&&(e=new Mo(s)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function vm(s){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&_s("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function xm(s,t,e,n){const i={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const g in f.attributes)t.remove(f.attributes[g]);for(const g in f.morphAttributes){const v=f.morphAttributes[g];for(let m=0,p=v.length;m<p;m++)t.remove(v[m])}f.removeEventListener("dispose",a),delete i[f.id];const d=r.get(f);d&&(t.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,e.memory.geometries++),f}function l(u){const f=u.attributes;for(const g in f)t.update(f[g],s.ARRAY_BUFFER);const d=u.morphAttributes;for(const g in d){const v=d[g];for(let m=0,p=v.length;m<p;m++)t.update(v[m],s.ARRAY_BUFFER)}}function c(u){const f=[],d=u.index,g=u.attributes.position;let v=0;if(d!==null){const _=d.array;v=d.version;for(let M=0,x=_.length;M<x;M+=3){const R=_[M+0],T=_[M+1],E=_[M+2];f.push(R,T,T,E,E,R)}}else if(g!==void 0){const _=g.array;v=g.version;for(let M=0,x=_.length/3-1;M<x;M+=3){const R=M+0,T=M+1,E=M+2;f.push(R,T,T,E,E,R)}}else return;const m=new(gh(f)?yh:Mh)(f,1);m.version=v;const p=r.get(u);p&&t.remove(p),r.set(u,m)}function h(u){const f=r.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function _m(s,t,e){let n;function i(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){s.drawElements(n,d,r,f*a),e.update(d,n,1)}function c(f,d,g){g!==0&&(s.drawElementsInstanced(n,d,r,f*a,g),e.update(d,n,g))}function h(f,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];e.update(m,n,1)}function u(f,d,g,v){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/a,d[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,v,0,g);let p=0;for(let _=0;_<g;_++)p+=d[_]*v[_];e.update(p,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Mm(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function ym(s,t,e){const n=new WeakMap,i=new le;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let S=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",S)};var d=S;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],_=o.morphAttributes.normal||[],M=o.morphAttributes.color||[];let x=0;g===!0&&(x=1),v===!0&&(x=2),m===!0&&(x=3);let R=o.attributes.position.count*x,T=1;R>t.maxTextureSize&&(T=Math.ceil(R/t.maxTextureSize),R=t.maxTextureSize);const E=new Float32Array(R*T*4*u),P=new xh(E,R,T,u);P.type=pn,P.needsUpdate=!0;const y=x*4;for(let L=0;L<u;L++){const D=p[L],U=_[L],k=M[L],B=R*T*4*L;for(let G=0;G<D.count;G++){const Y=G*y;g===!0&&(i.fromBufferAttribute(D,G),E[B+Y+0]=i.x,E[B+Y+1]=i.y,E[B+Y+2]=i.z,E[B+Y+3]=0),v===!0&&(i.fromBufferAttribute(U,G),E[B+Y+4]=i.x,E[B+Y+5]=i.y,E[B+Y+6]=i.z,E[B+Y+7]=0),m===!0&&(i.fromBufferAttribute(k,G),E[B+Y+8]=i.x,E[B+Y+9]=i.y,E[B+Y+10]=i.z,E[B+Y+11]=k.itemSize===4?i.w:1)}}f={count:u,texture:P,size:new it(R,T)},n.set(o,f),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",v),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}return{update:r}}function Sm(s,t,e,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(i.get(u)!==c&&(t.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;i.get(f)!==c&&(f.update(),i.set(f,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class Eh extends Ae{constructor(t,e,n,i,r,a,o,l,c,h=Vi){if(h!==Vi&&h!==Zi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Vi&&(n=hi),n===void 0&&h===Zi&&(n=Yi),super(null,i,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:$e,this.minFilter=l!==void 0?l:$e,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Ah=new Ae,ql=new Eh(1,1),Ch=new xh,Rh=new ld,Ph=new bh,Yl=[],Zl=[],Kl=new Float32Array(16),jl=new Float32Array(9),Jl=new Float32Array(4);function ns(s,t,e){const n=s[0];if(n<=0||n>0)return s;const i=t*e;let r=Yl[i];if(r===void 0&&(r=new Float32Array(i),Yl[i]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function Me(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function ye(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function Or(s,t){let e=Zl[t];e===void 0&&(e=new Int32Array(t),Zl[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function wm(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function bm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Me(e,t))return;s.uniform2fv(this.addr,t),ye(e,t)}}function Tm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Me(e,t))return;s.uniform3fv(this.addr,t),ye(e,t)}}function Em(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Me(e,t))return;s.uniform4fv(this.addr,t),ye(e,t)}}function Am(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Me(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),ye(e,t)}else{if(Me(e,n))return;Jl.set(n),s.uniformMatrix2fv(this.addr,!1,Jl),ye(e,n)}}function Cm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Me(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),ye(e,t)}else{if(Me(e,n))return;jl.set(n),s.uniformMatrix3fv(this.addr,!1,jl),ye(e,n)}}function Rm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Me(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),ye(e,t)}else{if(Me(e,n))return;Kl.set(n),s.uniformMatrix4fv(this.addr,!1,Kl),ye(e,n)}}function Pm(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function Lm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Me(e,t))return;s.uniform2iv(this.addr,t),ye(e,t)}}function Dm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Me(e,t))return;s.uniform3iv(this.addr,t),ye(e,t)}}function Im(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Me(e,t))return;s.uniform4iv(this.addr,t),ye(e,t)}}function Um(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function Nm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Me(e,t))return;s.uniform2uiv(this.addr,t),ye(e,t)}}function Fm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Me(e,t))return;s.uniform3uiv(this.addr,t),ye(e,t)}}function Om(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Me(e,t))return;s.uniform4uiv(this.addr,t),ye(e,t)}}function zm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(ql.compareFunction=mh,r=ql):r=Ah,e.setTexture2D(t||r,i)}function Bm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Rh,i)}function km(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Ph,i)}function Hm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Ch,i)}function Gm(s){switch(s){case 5126:return wm;case 35664:return bm;case 35665:return Tm;case 35666:return Em;case 35674:return Am;case 35675:return Cm;case 35676:return Rm;case 5124:case 35670:return Pm;case 35667:case 35671:return Lm;case 35668:case 35672:return Dm;case 35669:case 35673:return Im;case 5125:return Um;case 36294:return Nm;case 36295:return Fm;case 36296:return Om;case 35678:case 36198:case 36298:case 36306:case 35682:return zm;case 35679:case 36299:case 36307:return Bm;case 35680:case 36300:case 36308:case 36293:return km;case 36289:case 36303:case 36311:case 36292:return Hm}}function Vm(s,t){s.uniform1fv(this.addr,t)}function Wm(s,t){const e=ns(t,this.size,2);s.uniform2fv(this.addr,e)}function Xm(s,t){const e=ns(t,this.size,3);s.uniform3fv(this.addr,e)}function $m(s,t){const e=ns(t,this.size,4);s.uniform4fv(this.addr,e)}function qm(s,t){const e=ns(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function Ym(s,t){const e=ns(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function Zm(s,t){const e=ns(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function Km(s,t){s.uniform1iv(this.addr,t)}function jm(s,t){s.uniform2iv(this.addr,t)}function Jm(s,t){s.uniform3iv(this.addr,t)}function Qm(s,t){s.uniform4iv(this.addr,t)}function t0(s,t){s.uniform1uiv(this.addr,t)}function e0(s,t){s.uniform2uiv(this.addr,t)}function n0(s,t){s.uniform3uiv(this.addr,t)}function i0(s,t){s.uniform4uiv(this.addr,t)}function s0(s,t,e){const n=this.cache,i=t.length,r=Or(e,i);Me(n,r)||(s.uniform1iv(this.addr,r),ye(n,r));for(let a=0;a!==i;++a)e.setTexture2D(t[a]||Ah,r[a])}function r0(s,t,e){const n=this.cache,i=t.length,r=Or(e,i);Me(n,r)||(s.uniform1iv(this.addr,r),ye(n,r));for(let a=0;a!==i;++a)e.setTexture3D(t[a]||Rh,r[a])}function a0(s,t,e){const n=this.cache,i=t.length,r=Or(e,i);Me(n,r)||(s.uniform1iv(this.addr,r),ye(n,r));for(let a=0;a!==i;++a)e.setTextureCube(t[a]||Ph,r[a])}function o0(s,t,e){const n=this.cache,i=t.length,r=Or(e,i);Me(n,r)||(s.uniform1iv(this.addr,r),ye(n,r));for(let a=0;a!==i;++a)e.setTexture2DArray(t[a]||Ch,r[a])}function l0(s){switch(s){case 5126:return Vm;case 35664:return Wm;case 35665:return Xm;case 35666:return $m;case 35674:return qm;case 35675:return Ym;case 35676:return Zm;case 5124:case 35670:return Km;case 35667:case 35671:return jm;case 35668:case 35672:return Jm;case 35669:case 35673:return Qm;case 5125:return t0;case 36294:return e0;case 36295:return n0;case 36296:return i0;case 35678:case 36198:case 36298:case 36306:case 35682:return s0;case 35679:case 36299:case 36307:return r0;case 35680:case 36300:case 36308:case 36293:return a0;case 36289:case 36303:case 36311:case 36292:return o0}}class c0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Gm(e.type)}}class h0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=l0(e.type)}}class u0{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(t,e[o.id],n)}}}const fa=/(\w+)(\])?(\[|\.)?/g;function Ql(s,t){s.seq.push(t),s.map[t.id]=t}function d0(s,t,e){const n=s.name,i=n.length;for(fa.lastIndex=0;;){const r=fa.exec(n),a=fa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){Ql(e,c===void 0?new c0(o,s,t):new h0(o,s,t));break}else{let u=e.map[o];u===void 0&&(u=new u0(o),Ql(e,u)),e=u}}}class Ar{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=t.getActiveUniform(e,i),a=t.getUniformLocation(e,r.name);d0(r,a,this)}}setValue(t,e,n,i){const r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,r=t.length;i!==r;++i){const a=t[i];a.id in e&&n.push(a)}return n}}function tc(s,t,e){const n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}const f0=37297;let p0=0;function m0(s,t){const e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const ec=new kt;function g0(s){$t._getMatrix(ec,$t.workingColorSpace,s);const t=`mat3( ${ec.elements.map(e=>e.toFixed(4))} )`;switch($t.getTransfer(s)){case Fr:return[t,"LinearTransferOETF"];case ee:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function nc(s,t,e){const n=s.getShaderParameter(t,s.COMPILE_STATUS),i=s.getShaderInfoLog(t).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+i+`

`+m0(s.getShaderSource(t),a)}else return i}function v0(s,t){const e=g0(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function x0(s,t){let e;switch(t){case Qc:e="Linear";break;case th:e="Reinhard";break;case eh:e="Cineon";break;case nh:e="ACESFilmic";break;case ih:e="AgX";break;case Po:e="Neutral";break;case Au:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const or=new A;function _0(){$t.getLuminanceCoefficients(or);const s=or.x.toFixed(4),t=or.y.toFixed(4),e=or.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function M0(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ms).join(`
`)}function y0(s){const t=[];for(const e in s){const n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function S0(s,t){const e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(t,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function Ms(s){return s!==""}function ic(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function sc(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const w0=/^[ \t]*#include +<([\w\d./]+)>/gm;function yo(s){return s.replace(w0,T0)}const b0=new Map;function T0(s,t){let e=Gt[t];if(e===void 0){const n=b0.get(t);if(n!==void 0)e=Gt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return yo(e)}const E0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function rc(s){return s.replace(E0,A0)}function A0(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function ac(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function C0(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===jc?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===Jc?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===bn&&(t="SHADOWMAP_TYPE_VSM"),t}function R0(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case $i:case qi:t="ENVMAP_TYPE_CUBE";break;case Nr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function P0(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case qi:t="ENVMAP_MODE_REFRACTION";break}return t}function L0(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Ro:t="ENVMAP_BLENDING_MULTIPLY";break;case Tu:t="ENVMAP_BLENDING_MIX";break;case Eu:t="ENVMAP_BLENDING_ADD";break}return t}function D0(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function I0(s,t,e,n){const i=s.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=C0(e),c=R0(e),h=P0(e),u=L0(e),f=D0(e),d=M0(e),g=y0(r),v=i.createProgram();let m,p,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ms).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ms).join(`
`),p.length>0&&(p+=`
`)):(m=[ac(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ms).join(`
`),p=[ac(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==$n?"#define TONE_MAPPING":"",e.toneMapping!==$n?Gt.tonemapping_pars_fragment:"",e.toneMapping!==$n?x0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Gt.colorspace_pars_fragment,v0("linearToOutputTexel",e.outputColorSpace),_0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ms).join(`
`)),a=yo(a),a=ic(a,e),a=sc(a,e),o=yo(o),o=ic(o,e),o=sc(o,e),a=rc(a),o=rc(o),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===xl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===xl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const M=_+m+a,x=_+p+o,R=tc(i,i.VERTEX_SHADER,M),T=tc(i,i.FRAGMENT_SHADER,x);i.attachShader(v,R),i.attachShader(v,T),e.index0AttributeName!==void 0?i.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function E(L){if(s.debug.checkShaderErrors){const D=i.getProgramInfoLog(v).trim(),U=i.getShaderInfoLog(R).trim(),k=i.getShaderInfoLog(T).trim();let B=!0,G=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(B=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,R,T);else{const Y=nc(i,R,"vertex"),z=nc(i,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+D+`
`+Y+`
`+z)}else D!==""?console.warn("THREE.WebGLProgram: Program Info Log:",D):(U===""||k==="")&&(G=!1);G&&(L.diagnostics={runnable:B,programLog:D,vertexShader:{log:U,prefix:m},fragmentShader:{log:k,prefix:p}})}i.deleteShader(R),i.deleteShader(T),P=new Ar(i,v),y=S0(i,v)}let P;this.getUniforms=function(){return P===void 0&&E(this),P};let y;this.getAttributes=function(){return y===void 0&&E(this),y};let S=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=i.getProgramParameter(v,f0)),S},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=p0++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=R,this.fragmentShader=T,this}let U0=0;class N0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new F0(t),e.set(t,n)),n}}class F0{constructor(t){this.id=U0++,this.code=t,this.usedTimes=0}}function O0(s,t,e,n,i,r,a){const o=new Ho,l=new N0,c=new Set,h=[],u=i.logarithmicDepthBuffer,f=i.vertexTextures;let d=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(y){return c.add(y),y===0?"uv":`uv${y}`}function m(y,S,L,D,U){const k=D.fog,B=U.geometry,G=y.isMeshStandardMaterial?D.environment:null,Y=(y.isMeshStandardMaterial?e:t).get(y.envMap||G),z=Y&&Y.mapping===Nr?Y.image.height:null,V=g[y.type];y.precision!==null&&(d=i.getMaxPrecision(y.precision),d!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));const Q=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,st=Q!==void 0?Q.length:0;let rt=0;B.morphAttributes.position!==void 0&&(rt=1),B.morphAttributes.normal!==void 0&&(rt=2),B.morphAttributes.color!==void 0&&(rt=3);let Lt,$,tt,lt;if(V){const te=dn[V];Lt=te.vertexShader,$=te.fragmentShader}else Lt=y.vertexShader,$=y.fragmentShader,l.update(y),tt=l.getVertexShaderID(y),lt=l.getFragmentShaderID(y);const et=s.getRenderTarget(),St=s.state.buffers.depth.getReversed(),_t=U.isInstancedMesh===!0,wt=U.isBatchedMesh===!0,Ut=!!y.map,Pt=!!y.matcap,jt=!!Y,N=!!y.aoMap,de=!!y.lightMap,Nt=!!y.bumpMap,ft=!!y.normalMap,xt=!!y.displacementMap,Xt=!!y.emissiveMap,bt=!!y.metalnessMap,C=!!y.roughnessMap,w=y.anisotropy>0,H=y.clearcoat>0,Z=y.dispersion>0,J=y.iridescence>0,K=y.sheen>0,ut=y.transmission>0,ot=w&&!!y.anisotropyMap,gt=H&&!!y.clearcoatMap,Ht=H&&!!y.clearcoatNormalMap,nt=H&&!!y.clearcoatRoughnessMap,Mt=J&&!!y.iridescenceMap,Rt=J&&!!y.iridescenceThicknessMap,Dt=K&&!!y.sheenColorMap,yt=K&&!!y.sheenRoughnessMap,Wt=!!y.specularMap,Ot=!!y.specularColorMap,ie=!!y.specularIntensityMap,I=ut&&!!y.transmissionMap,ht=ut&&!!y.thicknessMap,q=!!y.gradientMap,j=!!y.alphaMap,vt=y.alphaTest>0,pt=!!y.alphaHash,zt=!!y.extensions;let he=$n;y.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(he=s.toneMapping);const Ce={shaderID:V,shaderType:y.type,shaderName:y.name,vertexShader:Lt,fragmentShader:$,defines:y.defines,customVertexShaderID:tt,customFragmentShaderID:lt,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:wt,batchingColor:wt&&U._colorsTexture!==null,instancing:_t,instancingColor:_t&&U.instanceColor!==null,instancingMorph:_t&&U.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:et===null?s.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:Qi,alphaToCoverage:!!y.alphaToCoverage,map:Ut,matcap:Pt,envMap:jt,envMapMode:jt&&Y.mapping,envMapCubeUVHeight:z,aoMap:N,lightMap:de,bumpMap:Nt,normalMap:ft,displacementMap:f&&xt,emissiveMap:Xt,normalMapObjectSpace:ft&&y.normalMapType===Pu,normalMapTangentSpace:ft&&y.normalMapType===zo,metalnessMap:bt,roughnessMap:C,anisotropy:w,anisotropyMap:ot,clearcoat:H,clearcoatMap:gt,clearcoatNormalMap:Ht,clearcoatRoughnessMap:nt,dispersion:Z,iridescence:J,iridescenceMap:Mt,iridescenceThicknessMap:Rt,sheen:K,sheenColorMap:Dt,sheenRoughnessMap:yt,specularMap:Wt,specularColorMap:Ot,specularIntensityMap:ie,transmission:ut,transmissionMap:I,thicknessMap:ht,gradientMap:q,opaque:y.transparent===!1&&y.blending===li&&y.alphaToCoverage===!1,alphaMap:j,alphaTest:vt,alphaHash:pt,combine:y.combine,mapUv:Ut&&v(y.map.channel),aoMapUv:N&&v(y.aoMap.channel),lightMapUv:de&&v(y.lightMap.channel),bumpMapUv:Nt&&v(y.bumpMap.channel),normalMapUv:ft&&v(y.normalMap.channel),displacementMapUv:xt&&v(y.displacementMap.channel),emissiveMapUv:Xt&&v(y.emissiveMap.channel),metalnessMapUv:bt&&v(y.metalnessMap.channel),roughnessMapUv:C&&v(y.roughnessMap.channel),anisotropyMapUv:ot&&v(y.anisotropyMap.channel),clearcoatMapUv:gt&&v(y.clearcoatMap.channel),clearcoatNormalMapUv:Ht&&v(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:nt&&v(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Mt&&v(y.iridescenceMap.channel),iridescenceThicknessMapUv:Rt&&v(y.iridescenceThicknessMap.channel),sheenColorMapUv:Dt&&v(y.sheenColorMap.channel),sheenRoughnessMapUv:yt&&v(y.sheenRoughnessMap.channel),specularMapUv:Wt&&v(y.specularMap.channel),specularColorMapUv:Ot&&v(y.specularColorMap.channel),specularIntensityMapUv:ie&&v(y.specularIntensityMap.channel),transmissionMapUv:I&&v(y.transmissionMap.channel),thicknessMapUv:ht&&v(y.thicknessMap.channel),alphaMapUv:j&&v(y.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(ft||w),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!B.attributes.uv&&(Ut||j),fog:!!k,useFog:y.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:St,skinning:U.isSkinnedMesh===!0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:st,morphTextureStride:rt,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:s.shadowMap.enabled&&L.length>0,shadowMapType:s.shadowMap.type,toneMapping:he,decodeVideoTexture:Ut&&y.map.isVideoTexture===!0&&$t.getTransfer(y.map.colorSpace)===ee,decodeVideoTextureEmissive:Xt&&y.emissiveMap.isVideoTexture===!0&&$t.getTransfer(y.emissiveMap.colorSpace)===ee,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===be,flipSided:y.side===Le,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:zt&&y.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(zt&&y.extensions.multiDraw===!0||wt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Ce.vertexUv1s=c.has(1),Ce.vertexUv2s=c.has(2),Ce.vertexUv3s=c.has(3),c.clear(),Ce}function p(y){const S=[];if(y.shaderID?S.push(y.shaderID):(S.push(y.customVertexShaderID),S.push(y.customFragmentShaderID)),y.defines!==void 0)for(const L in y.defines)S.push(L),S.push(y.defines[L]);return y.isRawShaderMaterial===!1&&(_(S,y),M(S,y),S.push(s.outputColorSpace)),S.push(y.customProgramCacheKey),S.join()}function _(y,S){y.push(S.precision),y.push(S.outputColorSpace),y.push(S.envMapMode),y.push(S.envMapCubeUVHeight),y.push(S.mapUv),y.push(S.alphaMapUv),y.push(S.lightMapUv),y.push(S.aoMapUv),y.push(S.bumpMapUv),y.push(S.normalMapUv),y.push(S.displacementMapUv),y.push(S.emissiveMapUv),y.push(S.metalnessMapUv),y.push(S.roughnessMapUv),y.push(S.anisotropyMapUv),y.push(S.clearcoatMapUv),y.push(S.clearcoatNormalMapUv),y.push(S.clearcoatRoughnessMapUv),y.push(S.iridescenceMapUv),y.push(S.iridescenceThicknessMapUv),y.push(S.sheenColorMapUv),y.push(S.sheenRoughnessMapUv),y.push(S.specularMapUv),y.push(S.specularColorMapUv),y.push(S.specularIntensityMapUv),y.push(S.transmissionMapUv),y.push(S.thicknessMapUv),y.push(S.combine),y.push(S.fogExp2),y.push(S.sizeAttenuation),y.push(S.morphTargetsCount),y.push(S.morphAttributeCount),y.push(S.numDirLights),y.push(S.numPointLights),y.push(S.numSpotLights),y.push(S.numSpotLightMaps),y.push(S.numHemiLights),y.push(S.numRectAreaLights),y.push(S.numDirLightShadows),y.push(S.numPointLightShadows),y.push(S.numSpotLightShadows),y.push(S.numSpotLightShadowsWithMaps),y.push(S.numLightProbes),y.push(S.shadowMapType),y.push(S.toneMapping),y.push(S.numClippingPlanes),y.push(S.numClipIntersection),y.push(S.depthPacking)}function M(y,S){o.disableAll(),S.supportsVertexTextures&&o.enable(0),S.instancing&&o.enable(1),S.instancingColor&&o.enable(2),S.instancingMorph&&o.enable(3),S.matcap&&o.enable(4),S.envMap&&o.enable(5),S.normalMapObjectSpace&&o.enable(6),S.normalMapTangentSpace&&o.enable(7),S.clearcoat&&o.enable(8),S.iridescence&&o.enable(9),S.alphaTest&&o.enable(10),S.vertexColors&&o.enable(11),S.vertexAlphas&&o.enable(12),S.vertexUv1s&&o.enable(13),S.vertexUv2s&&o.enable(14),S.vertexUv3s&&o.enable(15),S.vertexTangents&&o.enable(16),S.anisotropy&&o.enable(17),S.alphaHash&&o.enable(18),S.batching&&o.enable(19),S.dispersion&&o.enable(20),S.batchingColor&&o.enable(21),y.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reverseDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),y.push(o.mask)}function x(y){const S=g[y.type];let L;if(S){const D=dn[S];L=hn.clone(D.uniforms)}else L=y.uniforms;return L}function R(y,S){let L;for(let D=0,U=h.length;D<U;D++){const k=h[D];if(k.cacheKey===S){L=k,++L.usedTimes;break}}return L===void 0&&(L=new I0(s,S,y,r),h.push(L)),L}function T(y){if(--y.usedTimes===0){const S=h.indexOf(y);h[S]=h[h.length-1],h.pop(),y.destroy()}}function E(y){l.remove(y)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:x,acquireProgram:R,releaseProgram:T,releaseShaderCache:E,programs:h,dispose:P}}function z0(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function B0(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function oc(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function lc(){const s=[];let t=0;const e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function a(u,f,d,g,v,m){let p=s[t];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:v,group:m},s[t]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=v,p.group=m),t++,p}function o(u,f,d,g,v,m){const p=a(u,f,d,g,v,m);d.transmission>0?n.push(p):d.transparent===!0?i.push(p):e.push(p)}function l(u,f,d,g,v,m){const p=a(u,f,d,g,v,m);d.transmission>0?n.unshift(p):d.transparent===!0?i.unshift(p):e.unshift(p)}function c(u,f){e.length>1&&e.sort(u||B0),n.length>1&&n.sort(f||oc),i.length>1&&i.sort(f||oc)}function h(){for(let u=t,f=s.length;u<f;u++){const d=s[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:o,unshift:l,finish:h,sort:c}}function k0(){let s=new WeakMap;function t(n,i){const r=s.get(n);let a;return r===void 0?(a=new lc,s.set(n,[a])):i>=r.length?(a=new lc,r.push(a)):a=r[i],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function H0(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new A,color:new dt};break;case"SpotLight":e={position:new A,direction:new A,color:new dt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new A,color:new dt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new A,skyColor:new dt,groundColor:new dt};break;case"RectAreaLight":e={color:new dt,position:new A,halfWidth:new A,halfHeight:new A};break}return s[t.id]=e,e}}}function G0(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let V0=0;function W0(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function X0(s){const t=new H0,e=G0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new A);const i=new A,r=new Vt,a=new Vt;function o(c){let h=0,u=0,f=0;for(let y=0;y<9;y++)n.probe[y].set(0,0,0);let d=0,g=0,v=0,m=0,p=0,_=0,M=0,x=0,R=0,T=0,E=0;c.sort(W0);for(let y=0,S=c.length;y<S;y++){const L=c[y],D=L.color,U=L.intensity,k=L.distance,B=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)h+=D.r*U,u+=D.g*U,f+=D.b*U;else if(L.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(L.sh.coefficients[G],U);E++}else if(L.isDirectionalLight){const G=t.get(L);if(G.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const Y=L.shadow,z=e.get(L);z.shadowIntensity=Y.intensity,z.shadowBias=Y.bias,z.shadowNormalBias=Y.normalBias,z.shadowRadius=Y.radius,z.shadowMapSize=Y.mapSize,n.directionalShadow[d]=z,n.directionalShadowMap[d]=B,n.directionalShadowMatrix[d]=L.shadow.matrix,_++}n.directional[d]=G,d++}else if(L.isSpotLight){const G=t.get(L);G.position.setFromMatrixPosition(L.matrixWorld),G.color.copy(D).multiplyScalar(U),G.distance=k,G.coneCos=Math.cos(L.angle),G.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),G.decay=L.decay,n.spot[v]=G;const Y=L.shadow;if(L.map&&(n.spotLightMap[R]=L.map,R++,Y.updateMatrices(L),L.castShadow&&T++),n.spotLightMatrix[v]=Y.matrix,L.castShadow){const z=e.get(L);z.shadowIntensity=Y.intensity,z.shadowBias=Y.bias,z.shadowNormalBias=Y.normalBias,z.shadowRadius=Y.radius,z.shadowMapSize=Y.mapSize,n.spotShadow[v]=z,n.spotShadowMap[v]=B,x++}v++}else if(L.isRectAreaLight){const G=t.get(L);G.color.copy(D).multiplyScalar(U),G.halfWidth.set(L.width*.5,0,0),G.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=G,m++}else if(L.isPointLight){const G=t.get(L);if(G.color.copy(L.color).multiplyScalar(L.intensity),G.distance=L.distance,G.decay=L.decay,L.castShadow){const Y=L.shadow,z=e.get(L);z.shadowIntensity=Y.intensity,z.shadowBias=Y.bias,z.shadowNormalBias=Y.normalBias,z.shadowRadius=Y.radius,z.shadowMapSize=Y.mapSize,z.shadowCameraNear=Y.camera.near,z.shadowCameraFar=Y.camera.far,n.pointShadow[g]=z,n.pointShadowMap[g]=B,n.pointShadowMatrix[g]=L.shadow.matrix,M++}n.point[g]=G,g++}else if(L.isHemisphereLight){const G=t.get(L);G.skyColor.copy(L.color).multiplyScalar(U),G.groundColor.copy(L.groundColor).multiplyScalar(U),n.hemi[p]=G,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ct.LTC_FLOAT_1,n.rectAreaLTC2=ct.LTC_FLOAT_2):(n.rectAreaLTC1=ct.LTC_HALF_1,n.rectAreaLTC2=ct.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const P=n.hash;(P.directionalLength!==d||P.pointLength!==g||P.spotLength!==v||P.rectAreaLength!==m||P.hemiLength!==p||P.numDirectionalShadows!==_||P.numPointShadows!==M||P.numSpotShadows!==x||P.numSpotMaps!==R||P.numLightProbes!==E)&&(n.directional.length=d,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=x+R-T,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=E,P.directionalLength=d,P.pointLength=g,P.spotLength=v,P.rectAreaLength=m,P.hemiLength=p,P.numDirectionalShadows=_,P.numPointShadows=M,P.numSpotShadows=x,P.numSpotMaps=R,P.numLightProbes=E,n.version=V0++)}function l(c,h){let u=0,f=0,d=0,g=0,v=0;const m=h.matrixWorldInverse;for(let p=0,_=c.length;p<_;p++){const M=c[p];if(M.isDirectionalLight){const x=n.directional[u];x.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(m),u++}else if(M.isSpotLight){const x=n.spot[d];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(m),d++}else if(M.isRectAreaLight){const x=n.rectArea[g];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),a.identity(),r.copy(M.matrixWorld),r.premultiply(m),a.extractRotation(r),x.halfWidth.set(M.width*.5,0,0),x.halfHeight.set(0,M.height*.5,0),x.halfWidth.applyMatrix4(a),x.halfHeight.applyMatrix4(a),g++}else if(M.isPointLight){const x=n.point[f];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),f++}else if(M.isHemisphereLight){const x=n.hemi[v];x.direction.setFromMatrixPosition(M.matrixWorld),x.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function cc(s){const t=new X0(s),e=[],n=[];function i(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function $0(s){let t=new WeakMap;function e(i,r=0){const a=t.get(i);let o;return a===void 0?(o=new cc(s),t.set(i,[o])):r>=a.length?(o=new cc(s),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class Lh extends Yn{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Ru,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class q0 extends Yn{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const Y0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Z0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function K0(s,t,e){let n=new Go;const i=new it,r=new it,a=new le,o=new Lh({depthPacking:ph}),l=new q0,c={},h=e.maxTextureSize,u={[Dn]:Le,[Le]:Dn,[be]:be},f=new me({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new it},radius:{value:4}},vertexShader:Y0,fragmentShader:Z0}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const g=new ue;g.setAttribute("position",new ge(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new It(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=jc;let p=this.type;this.render=function(T,E,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const y=s.getRenderTarget(),S=s.getActiveCubeFace(),L=s.getActiveMipmapLevel(),D=s.state;D.setBlending(Cn),D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);const U=p!==bn&&this.type===bn,k=p===bn&&this.type!==bn;for(let B=0,G=T.length;B<G;B++){const Y=T[B],z=Y.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);const V=z.getFrameExtents();if(i.multiply(V),r.copy(z.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/V.x),i.x=r.x*V.x,z.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/V.y),i.y=r.y*V.y,z.mapSize.y=r.y)),z.map===null||U===!0||k===!0){const st=this.type!==bn?{minFilter:$e,magFilter:$e}:{};z.map!==null&&z.map.dispose(),z.map=new Je(i.x,i.y,st),z.map.texture.name=Y.name+".shadowMap",z.camera.updateProjectionMatrix()}s.setRenderTarget(z.map),s.clear();const Q=z.getViewportCount();for(let st=0;st<Q;st++){const rt=z.getViewport(st);a.set(r.x*rt.x,r.y*rt.y,r.x*rt.z,r.y*rt.w),D.viewport(a),z.updateMatrices(Y,st),n=z.getFrustum(),x(E,P,z.camera,Y,this.type)}z.isPointLightShadow!==!0&&this.type===bn&&_(z,P),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(y,S,L)};function _(T,E){const P=t.update(v);f.defines.VSM_SAMPLES!==T.blurSamples&&(f.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Je(i.x,i.y)),f.uniforms.shadow_pass.value=T.map.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,s.setRenderTarget(T.mapPass),s.clear(),s.renderBufferDirect(E,null,P,f,v,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,s.setRenderTarget(T.map),s.clear(),s.renderBufferDirect(E,null,P,d,v,null)}function M(T,E,P,y){let S=null;const L=P.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)S=L;else if(S=P.isPointLight===!0?l:o,s.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0){const D=S.uuid,U=E.uuid;let k=c[D];k===void 0&&(k={},c[D]=k);let B=k[U];B===void 0&&(B=S.clone(),k[U]=B,E.addEventListener("dispose",R)),S=B}if(S.visible=E.visible,S.wireframe=E.wireframe,y===bn?S.side=E.shadowSide!==null?E.shadowSide:E.side:S.side=E.shadowSide!==null?E.shadowSide:u[E.side],S.alphaMap=E.alphaMap,S.alphaTest=E.alphaTest,S.map=E.map,S.clipShadows=E.clipShadows,S.clippingPlanes=E.clippingPlanes,S.clipIntersection=E.clipIntersection,S.displacementMap=E.displacementMap,S.displacementScale=E.displacementScale,S.displacementBias=E.displacementBias,S.wireframeLinewidth=E.wireframeLinewidth,S.linewidth=E.linewidth,P.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const D=s.properties.get(S);D.light=P}return S}function x(T,E,P,y,S){if(T.visible===!1)return;if(T.layers.test(E.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&S===bn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,T.matrixWorld);const U=t.update(T),k=T.material;if(Array.isArray(k)){const B=U.groups;for(let G=0,Y=B.length;G<Y;G++){const z=B[G],V=k[z.materialIndex];if(V&&V.visible){const Q=M(T,V,y,S);T.onBeforeShadow(s,T,E,P,U,Q,z),s.renderBufferDirect(P,null,U,Q,T,z),T.onAfterShadow(s,T,E,P,U,Q,z)}}}else if(k.visible){const B=M(T,k,y,S);T.onBeforeShadow(s,T,E,P,U,B,null),s.renderBufferDirect(P,null,U,B,T,null),T.onAfterShadow(s,T,E,P,U,B,null)}}const D=T.children;for(let U=0,k=D.length;U<k;U++)x(D[U],E,P,y,S)}function R(T){T.target.removeEventListener("dispose",R);for(const P in c){const y=c[P],S=T.target.uuid;S in y&&(y[S].dispose(),delete y[S])}}}const j0={[Fa]:Oa,[za]:Ha,[Ba]:Ga,[Xi]:ka,[Oa]:Fa,[Ha]:za,[Ga]:Ba,[ka]:Xi};function J0(s,t){function e(){let I=!1;const ht=new le;let q=null;const j=new le(0,0,0,0);return{setMask:function(vt){q!==vt&&!I&&(s.colorMask(vt,vt,vt,vt),q=vt)},setLocked:function(vt){I=vt},setClear:function(vt,pt,zt,he,Ce){Ce===!0&&(vt*=he,pt*=he,zt*=he),ht.set(vt,pt,zt,he),j.equals(ht)===!1&&(s.clearColor(vt,pt,zt,he),j.copy(ht))},reset:function(){I=!1,q=null,j.set(-1,0,0,0)}}}function n(){let I=!1,ht=!1,q=null,j=null,vt=null;return{setReversed:function(pt){if(ht!==pt){const zt=t.get("EXT_clip_control");ht?zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.ZERO_TO_ONE_EXT):zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.NEGATIVE_ONE_TO_ONE_EXT);const he=vt;vt=null,this.setClear(he)}ht=pt},getReversed:function(){return ht},setTest:function(pt){pt?et(s.DEPTH_TEST):St(s.DEPTH_TEST)},setMask:function(pt){q!==pt&&!I&&(s.depthMask(pt),q=pt)},setFunc:function(pt){if(ht&&(pt=j0[pt]),j!==pt){switch(pt){case Fa:s.depthFunc(s.NEVER);break;case Oa:s.depthFunc(s.ALWAYS);break;case za:s.depthFunc(s.LESS);break;case Xi:s.depthFunc(s.LEQUAL);break;case Ba:s.depthFunc(s.EQUAL);break;case ka:s.depthFunc(s.GEQUAL);break;case Ha:s.depthFunc(s.GREATER);break;case Ga:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}j=pt}},setLocked:function(pt){I=pt},setClear:function(pt){vt!==pt&&(ht&&(pt=1-pt),s.clearDepth(pt),vt=pt)},reset:function(){I=!1,q=null,j=null,vt=null,ht=!1}}}function i(){let I=!1,ht=null,q=null,j=null,vt=null,pt=null,zt=null,he=null,Ce=null;return{setTest:function(te){I||(te?et(s.STENCIL_TEST):St(s.STENCIL_TEST))},setMask:function(te){ht!==te&&!I&&(s.stencilMask(te),ht=te)},setFunc:function(te,tn,vn){(q!==te||j!==tn||vt!==vn)&&(s.stencilFunc(te,tn,vn),q=te,j=tn,vt=vn)},setOp:function(te,tn,vn){(pt!==te||zt!==tn||he!==vn)&&(s.stencilOp(te,tn,vn),pt=te,zt=tn,he=vn)},setLocked:function(te){I=te},setClear:function(te){Ce!==te&&(s.clearStencil(te),Ce=te)},reset:function(){I=!1,ht=null,q=null,j=null,vt=null,pt=null,zt=null,he=null,Ce=null}}}const r=new e,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,d=[],g=null,v=!1,m=null,p=null,_=null,M=null,x=null,R=null,T=null,E=new dt(0,0,0),P=0,y=!1,S=null,L=null,D=null,U=null,k=null;const B=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,Y=0;const z=s.getParameter(s.VERSION);z.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(z)[1]),G=Y>=1):z.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),G=Y>=2);let V=null,Q={};const st=s.getParameter(s.SCISSOR_BOX),rt=s.getParameter(s.VIEWPORT),Lt=new le().fromArray(st),$=new le().fromArray(rt);function tt(I,ht,q,j){const vt=new Uint8Array(4),pt=s.createTexture();s.bindTexture(I,pt),s.texParameteri(I,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(I,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let zt=0;zt<q;zt++)I===s.TEXTURE_3D||I===s.TEXTURE_2D_ARRAY?s.texImage3D(ht,0,s.RGBA,1,1,j,0,s.RGBA,s.UNSIGNED_BYTE,vt):s.texImage2D(ht+zt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,vt);return pt}const lt={};lt[s.TEXTURE_2D]=tt(s.TEXTURE_2D,s.TEXTURE_2D,1),lt[s.TEXTURE_CUBE_MAP]=tt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),lt[s.TEXTURE_2D_ARRAY]=tt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),lt[s.TEXTURE_3D]=tt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),et(s.DEPTH_TEST),a.setFunc(Xi),Nt(!1),ft(pl),et(s.CULL_FACE),N(Cn);function et(I){h[I]!==!0&&(s.enable(I),h[I]=!0)}function St(I){h[I]!==!1&&(s.disable(I),h[I]=!1)}function _t(I,ht){return u[I]!==ht?(s.bindFramebuffer(I,ht),u[I]=ht,I===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=ht),I===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=ht),!0):!1}function wt(I,ht){let q=d,j=!1;if(I){q=f.get(ht),q===void 0&&(q=[],f.set(ht,q));const vt=I.textures;if(q.length!==vt.length||q[0]!==s.COLOR_ATTACHMENT0){for(let pt=0,zt=vt.length;pt<zt;pt++)q[pt]=s.COLOR_ATTACHMENT0+pt;q.length=vt.length,j=!0}}else q[0]!==s.BACK&&(q[0]=s.BACK,j=!0);j&&s.drawBuffers(q)}function Ut(I){return g!==I?(s.useProgram(I),g=I,!0):!1}const Pt={[ri]:s.FUNC_ADD,[lu]:s.FUNC_SUBTRACT,[cu]:s.FUNC_REVERSE_SUBTRACT};Pt[hu]=s.MIN,Pt[uu]=s.MAX;const jt={[du]:s.ZERO,[fu]:s.ONE,[pu]:s.SRC_COLOR,[Ua]:s.SRC_ALPHA,[Mu]:s.SRC_ALPHA_SATURATE,[xu]:s.DST_COLOR,[gu]:s.DST_ALPHA,[mu]:s.ONE_MINUS_SRC_COLOR,[Na]:s.ONE_MINUS_SRC_ALPHA,[_u]:s.ONE_MINUS_DST_COLOR,[vu]:s.ONE_MINUS_DST_ALPHA,[yu]:s.CONSTANT_COLOR,[Su]:s.ONE_MINUS_CONSTANT_COLOR,[wu]:s.CONSTANT_ALPHA,[bu]:s.ONE_MINUS_CONSTANT_ALPHA};function N(I,ht,q,j,vt,pt,zt,he,Ce,te){if(I===Cn){v===!0&&(St(s.BLEND),v=!1);return}if(v===!1&&(et(s.BLEND),v=!0),I!==ou){if(I!==m||te!==y){if((p!==ri||x!==ri)&&(s.blendEquation(s.FUNC_ADD),p=ri,x=ri),te)switch(I){case li:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Rs:s.blendFunc(s.ONE,s.ONE);break;case ml:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case gl:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case li:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Rs:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case ml:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case gl:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}_=null,M=null,R=null,T=null,E.set(0,0,0),P=0,m=I,y=te}return}vt=vt||ht,pt=pt||q,zt=zt||j,(ht!==p||vt!==x)&&(s.blendEquationSeparate(Pt[ht],Pt[vt]),p=ht,x=vt),(q!==_||j!==M||pt!==R||zt!==T)&&(s.blendFuncSeparate(jt[q],jt[j],jt[pt],jt[zt]),_=q,M=j,R=pt,T=zt),(he.equals(E)===!1||Ce!==P)&&(s.blendColor(he.r,he.g,he.b,Ce),E.copy(he),P=Ce),m=I,y=!1}function de(I,ht){I.side===be?St(s.CULL_FACE):et(s.CULL_FACE);let q=I.side===Le;ht&&(q=!q),Nt(q),I.blending===li&&I.transparent===!1?N(Cn):N(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);const j=I.stencilWrite;o.setTest(j),j&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Xt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?et(s.SAMPLE_ALPHA_TO_COVERAGE):St(s.SAMPLE_ALPHA_TO_COVERAGE)}function Nt(I){S!==I&&(I?s.frontFace(s.CW):s.frontFace(s.CCW),S=I)}function ft(I){I!==ru?(et(s.CULL_FACE),I!==L&&(I===pl?s.cullFace(s.BACK):I===au?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):St(s.CULL_FACE),L=I}function xt(I){I!==D&&(G&&s.lineWidth(I),D=I)}function Xt(I,ht,q){I?(et(s.POLYGON_OFFSET_FILL),(U!==ht||k!==q)&&(s.polygonOffset(ht,q),U=ht,k=q)):St(s.POLYGON_OFFSET_FILL)}function bt(I){I?et(s.SCISSOR_TEST):St(s.SCISSOR_TEST)}function C(I){I===void 0&&(I=s.TEXTURE0+B-1),V!==I&&(s.activeTexture(I),V=I)}function w(I,ht,q){q===void 0&&(V===null?q=s.TEXTURE0+B-1:q=V);let j=Q[q];j===void 0&&(j={type:void 0,texture:void 0},Q[q]=j),(j.type!==I||j.texture!==ht)&&(V!==q&&(s.activeTexture(q),V=q),s.bindTexture(I,ht||lt[I]),j.type=I,j.texture=ht)}function H(){const I=Q[V];I!==void 0&&I.type!==void 0&&(s.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Z(){try{s.compressedTexImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{s.compressedTexImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{s.texSubImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ut(){try{s.texSubImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ot(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function gt(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ht(){try{s.texStorage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function nt(){try{s.texStorage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Mt(){try{s.texImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Rt(){try{s.texImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Dt(I){Lt.equals(I)===!1&&(s.scissor(I.x,I.y,I.z,I.w),Lt.copy(I))}function yt(I){$.equals(I)===!1&&(s.viewport(I.x,I.y,I.z,I.w),$.copy(I))}function Wt(I,ht){let q=c.get(ht);q===void 0&&(q=new WeakMap,c.set(ht,q));let j=q.get(I);j===void 0&&(j=s.getUniformBlockIndex(ht,I.name),q.set(I,j))}function Ot(I,ht){const j=c.get(ht).get(I);l.get(ht)!==j&&(s.uniformBlockBinding(ht,j,I.__bindingPointIndex),l.set(ht,j))}function ie(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},V=null,Q={},u={},f=new WeakMap,d=[],g=null,v=!1,m=null,p=null,_=null,M=null,x=null,R=null,T=null,E=new dt(0,0,0),P=0,y=!1,S=null,L=null,D=null,U=null,k=null,Lt.set(0,0,s.canvas.width,s.canvas.height),$.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:et,disable:St,bindFramebuffer:_t,drawBuffers:wt,useProgram:Ut,setBlending:N,setMaterial:de,setFlipSided:Nt,setCullFace:ft,setLineWidth:xt,setPolygonOffset:Xt,setScissorTest:bt,activeTexture:C,bindTexture:w,unbindTexture:H,compressedTexImage2D:Z,compressedTexImage3D:J,texImage2D:Mt,texImage3D:Rt,updateUBOMapping:Wt,uniformBlockBinding:Ot,texStorage2D:Ht,texStorage3D:nt,texSubImage2D:K,texSubImage3D:ut,compressedTexSubImage2D:ot,compressedTexSubImage3D:gt,scissor:Dt,viewport:yt,reset:ie}}function hc(s,t,e,n){const i=Q0(n);switch(e){case lh:return s*t;case hh:return s*t;case uh:return s*t*2;case Uo:return s*t/i.components*i.byteLength;case No:return s*t/i.components*i.byteLength;case dh:return s*t*2/i.components*i.byteLength;case Fo:return s*t*2/i.components*i.byteLength;case ch:return s*t*3/i.components*i.byteLength;case on:return s*t*4/i.components*i.byteLength;case Oo:return s*t*4/i.components*i.byteLength;case Sr:case wr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case br:case Tr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case qa:case Za:return Math.max(s,16)*Math.max(t,8)/4;case $a:case Ya:return Math.max(s,8)*Math.max(t,8)/2;case Ka:case ja:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Ja:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Qa:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case to:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case eo:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case no:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case io:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case so:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case ro:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case ao:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case oo:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case lo:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case co:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case ho:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case uo:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case fo:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case Er:case po:case mo:return Math.ceil(s/4)*Math.ceil(t/4)*16;case fh:case go:return Math.ceil(s/4)*Math.ceil(t/4)*8;case vo:case xo:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Q0(s){switch(s){case In:case rh:return{byteLength:1,components:1};case Ps:case ah:case Rn:return{byteLength:2,components:1};case Do:case Io:return{byteLength:2,components:4};case hi:case Lo:case pn:return{byteLength:4,components:1};case oh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function tg(s,t,e,n,i,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new it,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(C,w){return d?new OffscreenCanvas(C,w):Ds("canvas")}function v(C,w,H){let Z=1;const J=bt(C);if((J.width>H||J.height>H)&&(Z=H/Math.max(J.width,J.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const K=Math.floor(Z*J.width),ut=Math.floor(Z*J.height);u===void 0&&(u=g(K,ut));const ot=w?g(K,ut):u;return ot.width=K,ot.height=ut,ot.getContext("2d").drawImage(C,0,0,K,ut),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+K+"x"+ut+")."),ot}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function m(C){return C.generateMipmaps}function p(C){s.generateMipmap(C)}function _(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function M(C,w,H,Z,J=!1){if(C!==null){if(s[C]!==void 0)return s[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let K=w;if(w===s.RED&&(H===s.FLOAT&&(K=s.R32F),H===s.HALF_FLOAT&&(K=s.R16F),H===s.UNSIGNED_BYTE&&(K=s.R8)),w===s.RED_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.R8UI),H===s.UNSIGNED_SHORT&&(K=s.R16UI),H===s.UNSIGNED_INT&&(K=s.R32UI),H===s.BYTE&&(K=s.R8I),H===s.SHORT&&(K=s.R16I),H===s.INT&&(K=s.R32I)),w===s.RG&&(H===s.FLOAT&&(K=s.RG32F),H===s.HALF_FLOAT&&(K=s.RG16F),H===s.UNSIGNED_BYTE&&(K=s.RG8)),w===s.RG_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RG8UI),H===s.UNSIGNED_SHORT&&(K=s.RG16UI),H===s.UNSIGNED_INT&&(K=s.RG32UI),H===s.BYTE&&(K=s.RG8I),H===s.SHORT&&(K=s.RG16I),H===s.INT&&(K=s.RG32I)),w===s.RGB_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RGB8UI),H===s.UNSIGNED_SHORT&&(K=s.RGB16UI),H===s.UNSIGNED_INT&&(K=s.RGB32UI),H===s.BYTE&&(K=s.RGB8I),H===s.SHORT&&(K=s.RGB16I),H===s.INT&&(K=s.RGB32I)),w===s.RGBA_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RGBA8UI),H===s.UNSIGNED_SHORT&&(K=s.RGBA16UI),H===s.UNSIGNED_INT&&(K=s.RGBA32UI),H===s.BYTE&&(K=s.RGBA8I),H===s.SHORT&&(K=s.RGBA16I),H===s.INT&&(K=s.RGBA32I)),w===s.RGB&&H===s.UNSIGNED_INT_5_9_9_9_REV&&(K=s.RGB9_E5),w===s.RGBA){const ut=J?Fr:$t.getTransfer(Z);H===s.FLOAT&&(K=s.RGBA32F),H===s.HALF_FLOAT&&(K=s.RGBA16F),H===s.UNSIGNED_BYTE&&(K=ut===ee?s.SRGB8_ALPHA8:s.RGBA8),H===s.UNSIGNED_SHORT_4_4_4_4&&(K=s.RGBA4),H===s.UNSIGNED_SHORT_5_5_5_1&&(K=s.RGB5_A1)}return(K===s.R16F||K===s.R32F||K===s.RG16F||K===s.RG32F||K===s.RGBA16F||K===s.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function x(C,w){let H;return C?w===null||w===hi||w===Yi?H=s.DEPTH24_STENCIL8:w===pn?H=s.DEPTH32F_STENCIL8:w===Ps&&(H=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===hi||w===Yi?H=s.DEPTH_COMPONENT24:w===pn?H=s.DEPTH_COMPONENT32F:w===Ps&&(H=s.DEPTH_COMPONENT16),H}function R(C,w){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==$e&&C.minFilter!==Be?Math.log2(Math.max(w.width,w.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?w.mipmaps.length:1}function T(C){const w=C.target;w.removeEventListener("dispose",T),P(w),w.isVideoTexture&&h.delete(w)}function E(C){const w=C.target;w.removeEventListener("dispose",E),S(w)}function P(C){const w=n.get(C);if(w.__webglInit===void 0)return;const H=C.source,Z=f.get(H);if(Z){const J=Z[w.__cacheKey];J.usedTimes--,J.usedTimes===0&&y(C),Object.keys(Z).length===0&&f.delete(H)}n.remove(C)}function y(C){const w=n.get(C);s.deleteTexture(w.__webglTexture);const H=C.source,Z=f.get(H);delete Z[w.__cacheKey],a.memory.textures--}function S(C){const w=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(w.__webglFramebuffer[Z]))for(let J=0;J<w.__webglFramebuffer[Z].length;J++)s.deleteFramebuffer(w.__webglFramebuffer[Z][J]);else s.deleteFramebuffer(w.__webglFramebuffer[Z]);w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer[Z])}else{if(Array.isArray(w.__webglFramebuffer))for(let Z=0;Z<w.__webglFramebuffer.length;Z++)s.deleteFramebuffer(w.__webglFramebuffer[Z]);else s.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&s.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let Z=0;Z<w.__webglColorRenderbuffer.length;Z++)w.__webglColorRenderbuffer[Z]&&s.deleteRenderbuffer(w.__webglColorRenderbuffer[Z]);w.__webglDepthRenderbuffer&&s.deleteRenderbuffer(w.__webglDepthRenderbuffer)}const H=C.textures;for(let Z=0,J=H.length;Z<J;Z++){const K=n.get(H[Z]);K.__webglTexture&&(s.deleteTexture(K.__webglTexture),a.memory.textures--),n.remove(H[Z])}n.remove(C)}let L=0;function D(){L=0}function U(){const C=L;return C>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+i.maxTextures),L+=1,C}function k(C){const w=[];return w.push(C.wrapS),w.push(C.wrapT),w.push(C.wrapR||0),w.push(C.magFilter),w.push(C.minFilter),w.push(C.anisotropy),w.push(C.internalFormat),w.push(C.format),w.push(C.type),w.push(C.generateMipmaps),w.push(C.premultiplyAlpha),w.push(C.flipY),w.push(C.unpackAlignment),w.push(C.colorSpace),w.join()}function B(C,w){const H=n.get(C);if(C.isVideoTexture&&xt(C),C.isRenderTargetTexture===!1&&C.version>0&&H.__version!==C.version){const Z=C.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{$(H,C,w);return}}e.bindTexture(s.TEXTURE_2D,H.__webglTexture,s.TEXTURE0+w)}function G(C,w){const H=n.get(C);if(C.version>0&&H.__version!==C.version){$(H,C,w);return}e.bindTexture(s.TEXTURE_2D_ARRAY,H.__webglTexture,s.TEXTURE0+w)}function Y(C,w){const H=n.get(C);if(C.version>0&&H.__version!==C.version){$(H,C,w);return}e.bindTexture(s.TEXTURE_3D,H.__webglTexture,s.TEXTURE0+w)}function z(C,w){const H=n.get(C);if(C.version>0&&H.__version!==C.version){tt(H,C,w);return}e.bindTexture(s.TEXTURE_CUBE_MAP,H.__webglTexture,s.TEXTURE0+w)}const V={[ln]:s.REPEAT,[Tn]:s.CLAMP_TO_EDGE,[Xa]:s.MIRRORED_REPEAT},Q={[$e]:s.NEAREST,[Cu]:s.NEAREST_MIPMAP_NEAREST,[Hs]:s.NEAREST_MIPMAP_LINEAR,[Be]:s.LINEAR,[Hr]:s.LINEAR_MIPMAP_NEAREST,[En]:s.LINEAR_MIPMAP_LINEAR},st={[Lu]:s.NEVER,[Ou]:s.ALWAYS,[Du]:s.LESS,[mh]:s.LEQUAL,[Iu]:s.EQUAL,[Fu]:s.GEQUAL,[Uu]:s.GREATER,[Nu]:s.NOTEQUAL};function rt(C,w){if(w.type===pn&&t.has("OES_texture_float_linear")===!1&&(w.magFilter===Be||w.magFilter===Hr||w.magFilter===Hs||w.magFilter===En||w.minFilter===Be||w.minFilter===Hr||w.minFilter===Hs||w.minFilter===En)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,V[w.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,V[w.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,V[w.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,Q[w.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,Q[w.minFilter]),w.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,st[w.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===$e||w.minFilter!==Hs&&w.minFilter!==En||w.type===pn&&t.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||n.get(w).__currentAnisotropy){const H=t.get("EXT_texture_filter_anisotropic");s.texParameterf(C,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,i.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy}}}function Lt(C,w){let H=!1;C.__webglInit===void 0&&(C.__webglInit=!0,w.addEventListener("dispose",T));const Z=w.source;let J=f.get(Z);J===void 0&&(J={},f.set(Z,J));const K=k(w);if(K!==C.__cacheKey){J[K]===void 0&&(J[K]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,H=!0),J[K].usedTimes++;const ut=J[C.__cacheKey];ut!==void 0&&(J[C.__cacheKey].usedTimes--,ut.usedTimes===0&&y(w)),C.__cacheKey=K,C.__webglTexture=J[K].texture}return H}function $(C,w,H){let Z=s.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(Z=s.TEXTURE_2D_ARRAY),w.isData3DTexture&&(Z=s.TEXTURE_3D);const J=Lt(C,w),K=w.source;e.bindTexture(Z,C.__webglTexture,s.TEXTURE0+H);const ut=n.get(K);if(K.version!==ut.__version||J===!0){e.activeTexture(s.TEXTURE0+H);const ot=$t.getPrimaries($t.workingColorSpace),gt=w.colorSpace===Wn?null:$t.getPrimaries(w.colorSpace),Ht=w.colorSpace===Wn||ot===gt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ht);let nt=v(w.image,!1,i.maxTextureSize);nt=Xt(w,nt);const Mt=r.convert(w.format,w.colorSpace),Rt=r.convert(w.type);let Dt=M(w.internalFormat,Mt,Rt,w.colorSpace,w.isVideoTexture);rt(Z,w);let yt;const Wt=w.mipmaps,Ot=w.isVideoTexture!==!0,ie=ut.__version===void 0||J===!0,I=K.dataReady,ht=R(w,nt);if(w.isDepthTexture)Dt=x(w.format===Zi,w.type),ie&&(Ot?e.texStorage2D(s.TEXTURE_2D,1,Dt,nt.width,nt.height):e.texImage2D(s.TEXTURE_2D,0,Dt,nt.width,nt.height,0,Mt,Rt,null));else if(w.isDataTexture)if(Wt.length>0){Ot&&ie&&e.texStorage2D(s.TEXTURE_2D,ht,Dt,Wt[0].width,Wt[0].height);for(let q=0,j=Wt.length;q<j;q++)yt=Wt[q],Ot?I&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,yt.width,yt.height,Mt,Rt,yt.data):e.texImage2D(s.TEXTURE_2D,q,Dt,yt.width,yt.height,0,Mt,Rt,yt.data);w.generateMipmaps=!1}else Ot?(ie&&e.texStorage2D(s.TEXTURE_2D,ht,Dt,nt.width,nt.height),I&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,nt.width,nt.height,Mt,Rt,nt.data)):e.texImage2D(s.TEXTURE_2D,0,Dt,nt.width,nt.height,0,Mt,Rt,nt.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){Ot&&ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ht,Dt,Wt[0].width,Wt[0].height,nt.depth);for(let q=0,j=Wt.length;q<j;q++)if(yt=Wt[q],w.format!==on)if(Mt!==null)if(Ot){if(I)if(w.layerUpdates.size>0){const vt=hc(yt.width,yt.height,w.format,w.type);for(const pt of w.layerUpdates){const zt=yt.data.subarray(pt*vt/yt.data.BYTES_PER_ELEMENT,(pt+1)*vt/yt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,pt,yt.width,yt.height,1,Mt,zt)}w.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,0,yt.width,yt.height,nt.depth,Mt,yt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,q,Dt,yt.width,yt.height,nt.depth,0,yt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ot?I&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,0,yt.width,yt.height,nt.depth,Mt,Rt,yt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,q,Dt,yt.width,yt.height,nt.depth,0,Mt,Rt,yt.data)}else{Ot&&ie&&e.texStorage2D(s.TEXTURE_2D,ht,Dt,Wt[0].width,Wt[0].height);for(let q=0,j=Wt.length;q<j;q++)yt=Wt[q],w.format!==on?Mt!==null?Ot?I&&e.compressedTexSubImage2D(s.TEXTURE_2D,q,0,0,yt.width,yt.height,Mt,yt.data):e.compressedTexImage2D(s.TEXTURE_2D,q,Dt,yt.width,yt.height,0,yt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ot?I&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,yt.width,yt.height,Mt,Rt,yt.data):e.texImage2D(s.TEXTURE_2D,q,Dt,yt.width,yt.height,0,Mt,Rt,yt.data)}else if(w.isDataArrayTexture)if(Ot){if(ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ht,Dt,nt.width,nt.height,nt.depth),I)if(w.layerUpdates.size>0){const q=hc(nt.width,nt.height,w.format,w.type);for(const j of w.layerUpdates){const vt=nt.data.subarray(j*q/nt.data.BYTES_PER_ELEMENT,(j+1)*q/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,j,nt.width,nt.height,1,Mt,Rt,vt)}w.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,Mt,Rt,nt.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Dt,nt.width,nt.height,nt.depth,0,Mt,Rt,nt.data);else if(w.isData3DTexture)Ot?(ie&&e.texStorage3D(s.TEXTURE_3D,ht,Dt,nt.width,nt.height,nt.depth),I&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,Mt,Rt,nt.data)):e.texImage3D(s.TEXTURE_3D,0,Dt,nt.width,nt.height,nt.depth,0,Mt,Rt,nt.data);else if(w.isFramebufferTexture){if(ie)if(Ot)e.texStorage2D(s.TEXTURE_2D,ht,Dt,nt.width,nt.height);else{let q=nt.width,j=nt.height;for(let vt=0;vt<ht;vt++)e.texImage2D(s.TEXTURE_2D,vt,Dt,q,j,0,Mt,Rt,null),q>>=1,j>>=1}}else if(Wt.length>0){if(Ot&&ie){const q=bt(Wt[0]);e.texStorage2D(s.TEXTURE_2D,ht,Dt,q.width,q.height)}for(let q=0,j=Wt.length;q<j;q++)yt=Wt[q],Ot?I&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,Mt,Rt,yt):e.texImage2D(s.TEXTURE_2D,q,Dt,Mt,Rt,yt);w.generateMipmaps=!1}else if(Ot){if(ie){const q=bt(nt);e.texStorage2D(s.TEXTURE_2D,ht,Dt,q.width,q.height)}I&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,Mt,Rt,nt)}else e.texImage2D(s.TEXTURE_2D,0,Dt,Mt,Rt,nt);m(w)&&p(Z),ut.__version=K.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function tt(C,w,H){if(w.image.length!==6)return;const Z=Lt(C,w),J=w.source;e.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+H);const K=n.get(J);if(J.version!==K.__version||Z===!0){e.activeTexture(s.TEXTURE0+H);const ut=$t.getPrimaries($t.workingColorSpace),ot=w.colorSpace===Wn?null:$t.getPrimaries(w.colorSpace),gt=w.colorSpace===Wn||ut===ot?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,gt);const Ht=w.isCompressedTexture||w.image[0].isCompressedTexture,nt=w.image[0]&&w.image[0].isDataTexture,Mt=[];for(let j=0;j<6;j++)!Ht&&!nt?Mt[j]=v(w.image[j],!0,i.maxCubemapSize):Mt[j]=nt?w.image[j].image:w.image[j],Mt[j]=Xt(w,Mt[j]);const Rt=Mt[0],Dt=r.convert(w.format,w.colorSpace),yt=r.convert(w.type),Wt=M(w.internalFormat,Dt,yt,w.colorSpace),Ot=w.isVideoTexture!==!0,ie=K.__version===void 0||Z===!0,I=J.dataReady;let ht=R(w,Rt);rt(s.TEXTURE_CUBE_MAP,w);let q;if(Ht){Ot&&ie&&e.texStorage2D(s.TEXTURE_CUBE_MAP,ht,Wt,Rt.width,Rt.height);for(let j=0;j<6;j++){q=Mt[j].mipmaps;for(let vt=0;vt<q.length;vt++){const pt=q[vt];w.format!==on?Dt!==null?Ot?I&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,vt,0,0,pt.width,pt.height,Dt,pt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,vt,Wt,pt.width,pt.height,0,pt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ot?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,vt,0,0,pt.width,pt.height,Dt,yt,pt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,vt,Wt,pt.width,pt.height,0,Dt,yt,pt.data)}}}else{if(q=w.mipmaps,Ot&&ie){q.length>0&&ht++;const j=bt(Mt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,ht,Wt,j.width,j.height)}for(let j=0;j<6;j++)if(nt){Ot?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Mt[j].width,Mt[j].height,Dt,yt,Mt[j].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Wt,Mt[j].width,Mt[j].height,0,Dt,yt,Mt[j].data);for(let vt=0;vt<q.length;vt++){const zt=q[vt].image[j].image;Ot?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,vt+1,0,0,zt.width,zt.height,Dt,yt,zt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,vt+1,Wt,zt.width,zt.height,0,Dt,yt,zt.data)}}else{Ot?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Dt,yt,Mt[j]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Wt,Dt,yt,Mt[j]);for(let vt=0;vt<q.length;vt++){const pt=q[vt];Ot?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,vt+1,0,0,Dt,yt,pt.image[j]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,vt+1,Wt,Dt,yt,pt.image[j])}}}m(w)&&p(s.TEXTURE_CUBE_MAP),K.__version=J.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function lt(C,w,H,Z,J,K){const ut=r.convert(H.format,H.colorSpace),ot=r.convert(H.type),gt=M(H.internalFormat,ut,ot,H.colorSpace),Ht=n.get(w),nt=n.get(H);if(nt.__renderTarget=w,!Ht.__hasExternalTextures){const Mt=Math.max(1,w.width>>K),Rt=Math.max(1,w.height>>K);J===s.TEXTURE_3D||J===s.TEXTURE_2D_ARRAY?e.texImage3D(J,K,gt,Mt,Rt,w.depth,0,ut,ot,null):e.texImage2D(J,K,gt,Mt,Rt,0,ut,ot,null)}e.bindFramebuffer(s.FRAMEBUFFER,C),ft(w)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Z,J,nt.__webglTexture,0,Nt(w)):(J===s.TEXTURE_2D||J>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Z,J,nt.__webglTexture,K),e.bindFramebuffer(s.FRAMEBUFFER,null)}function et(C,w,H){if(s.bindRenderbuffer(s.RENDERBUFFER,C),w.depthBuffer){const Z=w.depthTexture,J=Z&&Z.isDepthTexture?Z.type:null,K=x(w.stencilBuffer,J),ut=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ot=Nt(w);ft(w)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ot,K,w.width,w.height):H?s.renderbufferStorageMultisample(s.RENDERBUFFER,ot,K,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,K,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ut,s.RENDERBUFFER,C)}else{const Z=w.textures;for(let J=0;J<Z.length;J++){const K=Z[J],ut=r.convert(K.format,K.colorSpace),ot=r.convert(K.type),gt=M(K.internalFormat,ut,ot,K.colorSpace),Ht=Nt(w);H&&ft(w)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ht,gt,w.width,w.height):ft(w)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ht,gt,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,gt,w.width,w.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function St(C,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,C),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=n.get(w.depthTexture);Z.__renderTarget=w,(!Z.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),B(w.depthTexture,0);const J=Z.__webglTexture,K=Nt(w);if(w.depthTexture.format===Vi)ft(w)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,J,0,K):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,J,0);else if(w.depthTexture.format===Zi)ft(w)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,J,0,K):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function _t(C){const w=n.get(C),H=C.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==C.depthTexture){const Z=C.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),Z){const J=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,Z.removeEventListener("dispose",J)};Z.addEventListener("dispose",J),w.__depthDisposeCallback=J}w.__boundDepthTexture=Z}if(C.depthTexture&&!w.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");St(w.__webglFramebuffer,C)}else if(H){w.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[Z]),w.__webglDepthbuffer[Z]===void 0)w.__webglDepthbuffer[Z]=s.createRenderbuffer(),et(w.__webglDepthbuffer[Z],C,!1);else{const J=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,K=w.__webglDepthbuffer[Z];s.bindRenderbuffer(s.RENDERBUFFER,K),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,K)}}else if(e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=s.createRenderbuffer(),et(w.__webglDepthbuffer,C,!1);else{const Z=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,J=w.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,J),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,J)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function wt(C,w,H){const Z=n.get(C);w!==void 0&&lt(Z.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),H!==void 0&&_t(C)}function Ut(C){const w=C.texture,H=n.get(C),Z=n.get(w);C.addEventListener("dispose",E);const J=C.textures,K=C.isWebGLCubeRenderTarget===!0,ut=J.length>1;if(ut||(Z.__webglTexture===void 0&&(Z.__webglTexture=s.createTexture()),Z.__version=w.version,a.memory.textures++),K){H.__webglFramebuffer=[];for(let ot=0;ot<6;ot++)if(w.mipmaps&&w.mipmaps.length>0){H.__webglFramebuffer[ot]=[];for(let gt=0;gt<w.mipmaps.length;gt++)H.__webglFramebuffer[ot][gt]=s.createFramebuffer()}else H.__webglFramebuffer[ot]=s.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){H.__webglFramebuffer=[];for(let ot=0;ot<w.mipmaps.length;ot++)H.__webglFramebuffer[ot]=s.createFramebuffer()}else H.__webglFramebuffer=s.createFramebuffer();if(ut)for(let ot=0,gt=J.length;ot<gt;ot++){const Ht=n.get(J[ot]);Ht.__webglTexture===void 0&&(Ht.__webglTexture=s.createTexture(),a.memory.textures++)}if(C.samples>0&&ft(C)===!1){H.__webglMultisampledFramebuffer=s.createFramebuffer(),H.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let ot=0;ot<J.length;ot++){const gt=J[ot];H.__webglColorRenderbuffer[ot]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,H.__webglColorRenderbuffer[ot]);const Ht=r.convert(gt.format,gt.colorSpace),nt=r.convert(gt.type),Mt=M(gt.internalFormat,Ht,nt,gt.colorSpace,C.isXRRenderTarget===!0),Rt=Nt(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,Rt,Mt,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ot,s.RENDERBUFFER,H.__webglColorRenderbuffer[ot])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(H.__webglDepthRenderbuffer=s.createRenderbuffer(),et(H.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(K){e.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture),rt(s.TEXTURE_CUBE_MAP,w);for(let ot=0;ot<6;ot++)if(w.mipmaps&&w.mipmaps.length>0)for(let gt=0;gt<w.mipmaps.length;gt++)lt(H.__webglFramebuffer[ot][gt],C,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,gt);else lt(H.__webglFramebuffer[ot],C,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0);m(w)&&p(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ut){for(let ot=0,gt=J.length;ot<gt;ot++){const Ht=J[ot],nt=n.get(Ht);e.bindTexture(s.TEXTURE_2D,nt.__webglTexture),rt(s.TEXTURE_2D,Ht),lt(H.__webglFramebuffer,C,Ht,s.COLOR_ATTACHMENT0+ot,s.TEXTURE_2D,0),m(Ht)&&p(s.TEXTURE_2D)}e.unbindTexture()}else{let ot=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ot=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(ot,Z.__webglTexture),rt(ot,w),w.mipmaps&&w.mipmaps.length>0)for(let gt=0;gt<w.mipmaps.length;gt++)lt(H.__webglFramebuffer[gt],C,w,s.COLOR_ATTACHMENT0,ot,gt);else lt(H.__webglFramebuffer,C,w,s.COLOR_ATTACHMENT0,ot,0);m(w)&&p(ot),e.unbindTexture()}C.depthBuffer&&_t(C)}function Pt(C){const w=C.textures;for(let H=0,Z=w.length;H<Z;H++){const J=w[H];if(m(J)){const K=_(C),ut=n.get(J).__webglTexture;e.bindTexture(K,ut),p(K),e.unbindTexture()}}}const jt=[],N=[];function de(C){if(C.samples>0){if(ft(C)===!1){const w=C.textures,H=C.width,Z=C.height;let J=s.COLOR_BUFFER_BIT;const K=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ut=n.get(C),ot=w.length>1;if(ot)for(let gt=0;gt<w.length;gt++)e.bindFramebuffer(s.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+gt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,ut.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+gt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,ut.__webglMultisampledFramebuffer),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ut.__webglFramebuffer);for(let gt=0;gt<w.length;gt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=s.STENCIL_BUFFER_BIT)),ot){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ut.__webglColorRenderbuffer[gt]);const Ht=n.get(w[gt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Ht,0)}s.blitFramebuffer(0,0,H,Z,0,0,H,Z,J,s.NEAREST),l===!0&&(jt.length=0,N.length=0,jt.push(s.COLOR_ATTACHMENT0+gt),C.depthBuffer&&C.resolveDepthBuffer===!1&&(jt.push(K),N.push(K),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,N)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,jt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ot)for(let gt=0;gt<w.length;gt++){e.bindFramebuffer(s.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+gt,s.RENDERBUFFER,ut.__webglColorRenderbuffer[gt]);const Ht=n.get(w[gt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,ut.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+gt,s.TEXTURE_2D,Ht,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ut.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const w=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[w])}}}function Nt(C){return Math.min(i.maxSamples,C.samples)}function ft(C){const w=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function xt(C){const w=a.render.frame;h.get(C)!==w&&(h.set(C,w),C.update())}function Xt(C,w){const H=C.colorSpace,Z=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||H!==Qi&&H!==Wn&&($t.getTransfer(H)===ee?(Z!==on||J!==In)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),w}function bt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=D,this.setTexture2D=B,this.setTexture2DArray=G,this.setTexture3D=Y,this.setTextureCube=z,this.rebindTextures=wt,this.setupRenderTarget=Ut,this.updateRenderTargetMipmap=Pt,this.updateMultisampleRenderTarget=de,this.setupDepthRenderbuffer=_t,this.setupFrameBufferTexture=lt,this.useMultisampledRTT=ft}function eg(s,t){function e(n,i=Wn){let r;const a=$t.getTransfer(i);if(n===In)return s.UNSIGNED_BYTE;if(n===Do)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Io)return s.UNSIGNED_SHORT_5_5_5_1;if(n===oh)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===rh)return s.BYTE;if(n===ah)return s.SHORT;if(n===Ps)return s.UNSIGNED_SHORT;if(n===Lo)return s.INT;if(n===hi)return s.UNSIGNED_INT;if(n===pn)return s.FLOAT;if(n===Rn)return s.HALF_FLOAT;if(n===lh)return s.ALPHA;if(n===ch)return s.RGB;if(n===on)return s.RGBA;if(n===hh)return s.LUMINANCE;if(n===uh)return s.LUMINANCE_ALPHA;if(n===Vi)return s.DEPTH_COMPONENT;if(n===Zi)return s.DEPTH_STENCIL;if(n===Uo)return s.RED;if(n===No)return s.RED_INTEGER;if(n===dh)return s.RG;if(n===Fo)return s.RG_INTEGER;if(n===Oo)return s.RGBA_INTEGER;if(n===Sr||n===wr||n===br||n===Tr)if(a===ee)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Sr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===wr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Tr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Sr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===wr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===br)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Tr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===$a||n===qa||n===Ya||n===Za)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===$a)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===qa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ya)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Za)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ka||n===ja||n===Ja)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ka||n===ja)return a===ee?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ja)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Qa||n===to||n===eo||n===no||n===io||n===so||n===ro||n===ao||n===oo||n===lo||n===co||n===ho||n===uo||n===fo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Qa)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===to)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===eo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===no)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===io)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===so)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ro)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ao)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===oo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===lo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===co)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ho)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===uo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===fo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Er||n===po||n===mo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Er)return a===ee?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===po)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===mo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===fh||n===go||n===vo||n===xo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Er)return r.COMPRESSED_RED_RGTC1_EXT;if(n===go)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===vo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===xo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Yi?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}class ng extends Xe{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class xe extends _e{constructor(){super(),this.isGroup=!0,this.type="Group"}}const ig={type:"move"};class pa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new xe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new xe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new xe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const v of t.hand.values()){const m=e.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ig)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new xe;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const sg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,rg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class ag{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const i=new Ae,r=t.properties.get(i);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new me({vertexShader:sg,fragmentShader:rg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new It(new Qe(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class og extends ts{constructor(t,e){super();const n=this;let i=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,g=null;const v=new ag,m=e.getContextAttributes();let p=null,_=null;const M=[],x=[],R=new it;let T=null;const E=new Xe;E.viewport=new le;const P=new Xe;P.viewport=new le;const y=[E,P],S=new ng;let L=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let tt=M[$];return tt===void 0&&(tt=new pa,M[$]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function($){let tt=M[$];return tt===void 0&&(tt=new pa,M[$]=tt),tt.getGripSpace()},this.getHand=function($){let tt=M[$];return tt===void 0&&(tt=new pa,M[$]=tt),tt.getHandSpace()};function U($){const tt=x.indexOf($.inputSource);if(tt===-1)return;const lt=M[tt];lt!==void 0&&(lt.update($.inputSource,$.frame,c||a),lt.dispatchEvent({type:$.type,data:$.inputSource}))}function k(){i.removeEventListener("select",U),i.removeEventListener("selectstart",U),i.removeEventListener("selectend",U),i.removeEventListener("squeeze",U),i.removeEventListener("squeezestart",U),i.removeEventListener("squeezeend",U),i.removeEventListener("end",k),i.removeEventListener("inputsourceschange",B);for(let $=0;$<M.length;$++){const tt=x[$];tt!==null&&(x[$]=null,M[$].disconnect(tt))}L=null,D=null,v.reset(),t.setRenderTarget(p),d=null,f=null,u=null,i=null,_=null,Lt.stop(),n.isPresenting=!1,t.setPixelRatio(T),t.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){o=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function($){if(i=$,i!==null){if(p=t.getRenderTarget(),i.addEventListener("select",U),i.addEventListener("selectstart",U),i.addEventListener("selectend",U),i.addEventListener("squeeze",U),i.addEventListener("squeezestart",U),i.addEventListener("squeezeend",U),i.addEventListener("end",k),i.addEventListener("inputsourceschange",B),m.xrCompatible!==!0&&await e.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(R),i.renderState.layers===void 0){const tt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,e,tt),i.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),_=new Je(d.framebufferWidth,d.framebufferHeight,{format:on,type:In,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let tt=null,lt=null,et=null;m.depth&&(et=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,tt=m.stencil?Zi:Vi,lt=m.stencil?Yi:hi);const St={colorFormat:e.RGBA8,depthFormat:et,scaleFactor:r};u=new XRWebGLBinding(i,e),f=u.createProjectionLayer(St),i.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),_=new Je(f.textureWidth,f.textureHeight,{format:on,type:In,depthTexture:new Eh(f.textureWidth,f.textureHeight,lt,void 0,void 0,void 0,void 0,void 0,void 0,tt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),Lt.setContext(i),Lt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function B($){for(let tt=0;tt<$.removed.length;tt++){const lt=$.removed[tt],et=x.indexOf(lt);et>=0&&(x[et]=null,M[et].disconnect(lt))}for(let tt=0;tt<$.added.length;tt++){const lt=$.added[tt];let et=x.indexOf(lt);if(et===-1){for(let _t=0;_t<M.length;_t++)if(_t>=x.length){x.push(lt),et=_t;break}else if(x[_t]===null){x[_t]=lt,et=_t;break}if(et===-1)break}const St=M[et];St&&St.connect(lt)}}const G=new A,Y=new A;function z($,tt,lt){G.setFromMatrixPosition(tt.matrixWorld),Y.setFromMatrixPosition(lt.matrixWorld);const et=G.distanceTo(Y),St=tt.projectionMatrix.elements,_t=lt.projectionMatrix.elements,wt=St[14]/(St[10]-1),Ut=St[14]/(St[10]+1),Pt=(St[9]+1)/St[5],jt=(St[9]-1)/St[5],N=(St[8]-1)/St[0],de=(_t[8]+1)/_t[0],Nt=wt*N,ft=wt*de,xt=et/(-N+de),Xt=xt*-N;if(tt.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(Xt),$.translateZ(xt),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),St[10]===-1)$.projectionMatrix.copy(tt.projectionMatrix),$.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{const bt=wt+xt,C=Ut+xt,w=Nt-Xt,H=ft+(et-Xt),Z=Pt*Ut/C*bt,J=jt*Ut/C*bt;$.projectionMatrix.makePerspective(w,H,Z,J,bt,C),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function V($,tt){tt===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(tt.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(i===null)return;let tt=$.near,lt=$.far;v.texture!==null&&(v.depthNear>0&&(tt=v.depthNear),v.depthFar>0&&(lt=v.depthFar)),S.near=P.near=E.near=tt,S.far=P.far=E.far=lt,(L!==S.near||D!==S.far)&&(i.updateRenderState({depthNear:S.near,depthFar:S.far}),L=S.near,D=S.far),E.layers.mask=$.layers.mask|2,P.layers.mask=$.layers.mask|4,S.layers.mask=E.layers.mask|P.layers.mask;const et=$.parent,St=S.cameras;V(S,et);for(let _t=0;_t<St.length;_t++)V(St[_t],et);St.length===2?z(S,E,P):S.projectionMatrix.copy(E.projectionMatrix),Q($,S,et)};function Q($,tt,lt){lt===null?$.matrix.copy(tt.matrixWorld):($.matrix.copy(lt.matrixWorld),$.matrix.invert(),$.matrix.multiply(tt.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(tt.projectionMatrix),$.projectionMatrixInverse.copy(tt.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=Ls*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function($){l=$,f!==null&&(f.fixedFoveation=$),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=$)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(S)};let st=null;function rt($,tt){if(h=tt.getViewerPose(c||a),g=tt,h!==null){const lt=h.views;d!==null&&(t.setRenderTargetFramebuffer(_,d.framebuffer),t.setRenderTarget(_));let et=!1;lt.length!==S.cameras.length&&(S.cameras.length=0,et=!0);for(let _t=0;_t<lt.length;_t++){const wt=lt[_t];let Ut=null;if(d!==null)Ut=d.getViewport(wt);else{const jt=u.getViewSubImage(f,wt);Ut=jt.viewport,_t===0&&(t.setRenderTargetTextures(_,jt.colorTexture,f.ignoreDepthValues?void 0:jt.depthStencilTexture),t.setRenderTarget(_))}let Pt=y[_t];Pt===void 0&&(Pt=new Xe,Pt.layers.enable(_t),Pt.viewport=new le,y[_t]=Pt),Pt.matrix.fromArray(wt.transform.matrix),Pt.matrix.decompose(Pt.position,Pt.quaternion,Pt.scale),Pt.projectionMatrix.fromArray(wt.projectionMatrix),Pt.projectionMatrixInverse.copy(Pt.projectionMatrix).invert(),Pt.viewport.set(Ut.x,Ut.y,Ut.width,Ut.height),_t===0&&(S.matrix.copy(Pt.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),et===!0&&S.cameras.push(Pt)}const St=i.enabledFeatures;if(St&&St.includes("depth-sensing")){const _t=u.getDepthInformation(lt[0]);_t&&_t.isValid&&_t.texture&&v.init(t,_t,i.renderState)}}for(let lt=0;lt<M.length;lt++){const et=x[lt],St=M[lt];et!==null&&St!==void 0&&St.update(et,tt,c||a)}st&&st($,tt),tt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:tt}),g=null}const Lt=new Th;Lt.setAnimationLoop(rt),this.setAnimationLoop=function($){st=$},this.dispose=function(){}}}const ei=new cn,lg=new Vt;function cg(s,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Sh(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,_,M,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,x)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,_,M):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Le&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Le&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const _=t.get(p),M=_.envMap,x=_.envMapRotation;M&&(m.envMap.value=M,ei.copy(x),ei.x*=-1,ei.y*=-1,ei.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(ei.y*=-1,ei.z*=-1),m.envMapRotation.value.setFromMatrix4(lg.makeRotationFromEuler(ei)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,_,M){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*_,m.scale.value=M*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,_){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Le&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const _=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function hg(s,t,e,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,M){const x=M.program;n.uniformBlockBinding(_,x)}function c(_,M){let x=i[_.id];x===void 0&&(g(_),x=h(_),i[_.id]=x,_.addEventListener("dispose",m));const R=M.program;n.updateUBOMapping(_,R);const T=t.render.frame;r[_.id]!==T&&(f(_),r[_.id]=T)}function h(_){const M=u();_.__bindingPointIndex=M;const x=s.createBuffer(),R=_.__size,T=_.usage;return s.bindBuffer(s.UNIFORM_BUFFER,x),s.bufferData(s.UNIFORM_BUFFER,R,T),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,M,x),x}function u(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){const M=i[_.id],x=_.uniforms,R=_.__cache;s.bindBuffer(s.UNIFORM_BUFFER,M);for(let T=0,E=x.length;T<E;T++){const P=Array.isArray(x[T])?x[T]:[x[T]];for(let y=0,S=P.length;y<S;y++){const L=P[y];if(d(L,T,y,R)===!0){const D=L.__offset,U=Array.isArray(L.value)?L.value:[L.value];let k=0;for(let B=0;B<U.length;B++){const G=U[B],Y=v(G);typeof G=="number"||typeof G=="boolean"?(L.__data[0]=G,s.bufferSubData(s.UNIFORM_BUFFER,D+k,L.__data)):G.isMatrix3?(L.__data[0]=G.elements[0],L.__data[1]=G.elements[1],L.__data[2]=G.elements[2],L.__data[3]=0,L.__data[4]=G.elements[3],L.__data[5]=G.elements[4],L.__data[6]=G.elements[5],L.__data[7]=0,L.__data[8]=G.elements[6],L.__data[9]=G.elements[7],L.__data[10]=G.elements[8],L.__data[11]=0):(G.toArray(L.__data,k),k+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,D,L.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(_,M,x,R){const T=_.value,E=M+"_"+x;if(R[E]===void 0)return typeof T=="number"||typeof T=="boolean"?R[E]=T:R[E]=T.clone(),!0;{const P=R[E];if(typeof T=="number"||typeof T=="boolean"){if(P!==T)return R[E]=T,!0}else if(P.equals(T)===!1)return P.copy(T),!0}return!1}function g(_){const M=_.uniforms;let x=0;const R=16;for(let E=0,P=M.length;E<P;E++){const y=Array.isArray(M[E])?M[E]:[M[E]];for(let S=0,L=y.length;S<L;S++){const D=y[S],U=Array.isArray(D.value)?D.value:[D.value];for(let k=0,B=U.length;k<B;k++){const G=U[k],Y=v(G),z=x%R,V=z%Y.boundary,Q=z+V;x+=V,Q!==0&&R-Q<Y.storage&&(x+=R-Q),D.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=x,x+=Y.storage}}}const T=x%R;return T>0&&(x+=R-T),_.__size=x,_.__cache={},this}function v(_){const M={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(M.boundary=4,M.storage=4):_.isVector2?(M.boundary=8,M.storage=8):_.isVector3||_.isColor?(M.boundary=16,M.storage=12):_.isVector4?(M.boundary=16,M.storage=16):_.isMatrix3?(M.boundary=48,M.storage=48):_.isMatrix4?(M.boundary=64,M.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),M}function m(_){const M=_.target;M.removeEventListener("dispose",m);const x=a.indexOf(M.__bindingPointIndex);a.splice(x,1),s.deleteBuffer(i[M.id]),delete i[M.id],delete r[M.id]}function p(){for(const _ in i)s.deleteBuffer(i[_]);a=[],i={},r={}}return{bind:l,update:c,dispose:p}}class ug{constructor(t={}){const{canvas:e=td(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const g=new Uint32Array(4),v=new Int32Array(4);let m=null,p=null;const _=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=se,this.toneMapping=$n,this.toneMappingExposure=1;const x=this;let R=!1,T=0,E=0,P=null,y=-1,S=null;const L=new le,D=new le;let U=null;const k=new dt(0);let B=0,G=e.width,Y=e.height,z=1,V=null,Q=null;const st=new le(0,0,G,Y),rt=new le(0,0,G,Y);let Lt=!1;const $=new Go;let tt=!1,lt=!1;const et=new Vt,St=new Vt,_t=new A,wt=new le,Ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Pt=!1;function jt(){return P===null?z:1}let N=n;function de(b,F){return e.getContext(b,F)}try{const b={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Co}`),e.addEventListener("webglcontextlost",j,!1),e.addEventListener("webglcontextrestored",vt,!1),e.addEventListener("webglcontextcreationerror",pt,!1),N===null){const F="webgl2";if(N=de(F,b),N===null)throw de(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Nt,ft,xt,Xt,bt,C,w,H,Z,J,K,ut,ot,gt,Ht,nt,Mt,Rt,Dt,yt,Wt,Ot,ie,I;function ht(){Nt=new vm(N),Nt.init(),Ot=new eg(N,Nt),ft=new um(N,Nt,t,Ot),xt=new J0(N,Nt),ft.reverseDepthBuffer&&f&&xt.buffers.depth.setReversed(!0),Xt=new Mm(N),bt=new z0,C=new tg(N,Nt,xt,bt,ft,Ot,Xt),w=new fm(x),H=new gm(x),Z=new Ed(N),ie=new cm(N,Z),J=new xm(N,Z,Xt,ie),K=new Sm(N,J,Z,Xt),Dt=new ym(N,ft,C),nt=new dm(bt),ut=new O0(x,w,H,Nt,ft,ie,nt),ot=new cg(x,bt),gt=new k0,Ht=new $0(Nt),Rt=new lm(x,w,H,xt,K,d,l),Mt=new K0(x,K,ft),I=new hg(N,Xt,ft,xt),yt=new hm(N,Nt,Xt),Wt=new _m(N,Nt,Xt),Xt.programs=ut.programs,x.capabilities=ft,x.extensions=Nt,x.properties=bt,x.renderLists=gt,x.shadowMap=Mt,x.state=xt,x.info=Xt}ht();const q=new og(x,N);this.xr=q,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const b=Nt.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Nt.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(b){b!==void 0&&(z=b,this.setSize(G,Y,!1))},this.getSize=function(b){return b.set(G,Y)},this.setSize=function(b,F,W=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=b,Y=F,e.width=Math.floor(b*z),e.height=Math.floor(F*z),W===!0&&(e.style.width=b+"px",e.style.height=F+"px"),this.setViewport(0,0,b,F)},this.getDrawingBufferSize=function(b){return b.set(G*z,Y*z).floor()},this.setDrawingBufferSize=function(b,F,W){G=b,Y=F,z=W,e.width=Math.floor(b*W),e.height=Math.floor(F*W),this.setViewport(0,0,b,F)},this.getCurrentViewport=function(b){return b.copy(L)},this.getViewport=function(b){return b.copy(st)},this.setViewport=function(b,F,W,X){b.isVector4?st.set(b.x,b.y,b.z,b.w):st.set(b,F,W,X),xt.viewport(L.copy(st).multiplyScalar(z).round())},this.getScissor=function(b){return b.copy(rt)},this.setScissor=function(b,F,W,X){b.isVector4?rt.set(b.x,b.y,b.z,b.w):rt.set(b,F,W,X),xt.scissor(D.copy(rt).multiplyScalar(z).round())},this.getScissorTest=function(){return Lt},this.setScissorTest=function(b){xt.setScissorTest(Lt=b)},this.setOpaqueSort=function(b){V=b},this.setTransparentSort=function(b){Q=b},this.getClearColor=function(b){return b.copy(Rt.getClearColor())},this.setClearColor=function(){Rt.setClearColor.apply(Rt,arguments)},this.getClearAlpha=function(){return Rt.getClearAlpha()},this.setClearAlpha=function(){Rt.setClearAlpha.apply(Rt,arguments)},this.clear=function(b=!0,F=!0,W=!0){let X=0;if(b){let O=!1;if(P!==null){const at=P.texture.format;O=at===Oo||at===Fo||at===No}if(O){const at=P.texture.type,mt=at===In||at===hi||at===Ps||at===Yi||at===Do||at===Io,Tt=Rt.getClearColor(),Et=Rt.getClearAlpha(),Ft=Tt.r,Bt=Tt.g,At=Tt.b;mt?(g[0]=Ft,g[1]=Bt,g[2]=At,g[3]=Et,N.clearBufferuiv(N.COLOR,0,g)):(v[0]=Ft,v[1]=Bt,v[2]=At,v[3]=Et,N.clearBufferiv(N.COLOR,0,v))}else X|=N.COLOR_BUFFER_BIT}F&&(X|=N.DEPTH_BUFFER_BIT),W&&(X|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",j,!1),e.removeEventListener("webglcontextrestored",vt,!1),e.removeEventListener("webglcontextcreationerror",pt,!1),gt.dispose(),Ht.dispose(),bt.dispose(),w.dispose(),H.dispose(),K.dispose(),ie.dispose(),I.dispose(),ut.dispose(),q.dispose(),q.removeEventListener("sessionstart",il),q.removeEventListener("sessionend",sl),Zn.stop()};function j(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function vt(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;const b=Xt.autoReset,F=Mt.enabled,W=Mt.autoUpdate,X=Mt.needsUpdate,O=Mt.type;ht(),Xt.autoReset=b,Mt.enabled=F,Mt.autoUpdate=W,Mt.needsUpdate=X,Mt.type=O}function pt(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function zt(b){const F=b.target;F.removeEventListener("dispose",zt),he(F)}function he(b){Ce(b),bt.remove(b)}function Ce(b){const F=bt.get(b).programs;F!==void 0&&(F.forEach(function(W){ut.releaseProgram(W)}),b.isShaderMaterial&&ut.releaseShaderCache(b))}this.renderBufferDirect=function(b,F,W,X,O,at){F===null&&(F=Ut);const mt=O.isMesh&&O.matrixWorld.determinant()<0,Tt=Kh(b,F,W,X,O);xt.setMaterial(X,mt);let Et=W.index,Ft=1;if(X.wireframe===!0){if(Et=J.getWireframeAttribute(W),Et===void 0)return;Ft=2}const Bt=W.drawRange,At=W.attributes.position;let Zt=Bt.start*Ft,re=(Bt.start+Bt.count)*Ft;at!==null&&(Zt=Math.max(Zt,at.start*Ft),re=Math.min(re,(at.start+at.count)*Ft)),Et!==null?(Zt=Math.max(Zt,0),re=Math.min(re,Et.count)):At!=null&&(Zt=Math.max(Zt,0),re=Math.min(re,At.count));const ae=re-Zt;if(ae<0||ae===1/0)return;ie.setup(O,X,Tt,W,Et);let Fe,Jt=yt;if(Et!==null&&(Fe=Z.get(Et),Jt=Wt,Jt.setIndex(Fe)),O.isMesh)X.wireframe===!0?(xt.setLineWidth(X.wireframeLinewidth*jt()),Jt.setMode(N.LINES)):Jt.setMode(N.TRIANGLES);else if(O.isLine){let Ct=X.linewidth;Ct===void 0&&(Ct=1),xt.setLineWidth(Ct*jt()),O.isLineSegments?Jt.setMode(N.LINES):O.isLineLoop?Jt.setMode(N.LINE_LOOP):Jt.setMode(N.LINE_STRIP)}else O.isPoints?Jt.setMode(N.POINTS):O.isSprite&&Jt.setMode(N.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)Jt.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(Nt.get("WEBGL_multi_draw"))Jt.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Ct=O._multiDrawStarts,xn=O._multiDrawCounts,Qt=O._multiDrawCount,en=Et?Z.get(Et).bytesPerElement:1,gi=bt.get(X).currentProgram.getUniforms();for(let ke=0;ke<Qt;ke++)gi.setValue(N,"_gl_DrawID",ke),Jt.render(Ct[ke]/en,xn[ke])}else if(O.isInstancedMesh)Jt.renderInstances(Zt,ae,O.count);else if(W.isInstancedBufferGeometry){const Ct=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,xn=Math.min(W.instanceCount,Ct);Jt.renderInstances(Zt,ae,xn)}else Jt.render(Zt,ae)};function te(b,F,W){b.transparent===!0&&b.side===be&&b.forceSinglePass===!1?(b.side=Le,b.needsUpdate=!0,ks(b,F,W),b.side=Dn,b.needsUpdate=!0,ks(b,F,W),b.side=be):ks(b,F,W)}this.compile=function(b,F,W=null){W===null&&(W=b),p=Ht.get(W),p.init(F),M.push(p),W.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),b!==W&&b.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),p.setupLights();const X=new Set;return b.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const at=O.material;if(at)if(Array.isArray(at))for(let mt=0;mt<at.length;mt++){const Tt=at[mt];te(Tt,W,O),X.add(Tt)}else te(at,W,O),X.add(at)}),M.pop(),p=null,X},this.compileAsync=function(b,F,W=null){const X=this.compile(b,F,W);return new Promise(O=>{function at(){if(X.forEach(function(mt){bt.get(mt).currentProgram.isReady()&&X.delete(mt)}),X.size===0){O(b);return}setTimeout(at,10)}Nt.get("KHR_parallel_shader_compile")!==null?at():setTimeout(at,10)})};let tn=null;function vn(b){tn&&tn(b)}function il(){Zn.stop()}function sl(){Zn.start()}const Zn=new Th;Zn.setAnimationLoop(vn),typeof self<"u"&&Zn.setContext(self),this.setAnimationLoop=function(b){tn=b,q.setAnimationLoop(b),b===null?Zn.stop():Zn.start()},q.addEventListener("sessionstart",il),q.addEventListener("sessionend",sl),this.render=function(b,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(F),F=q.getCamera()),b.isScene===!0&&b.onBeforeRender(x,b,F,P),p=Ht.get(b,M.length),p.init(F),M.push(p),St.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),$.setFromProjectionMatrix(St),lt=this.localClippingEnabled,tt=nt.init(this.clippingPlanes,lt),m=gt.get(b,_.length),m.init(),_.push(m),q.enabled===!0&&q.isPresenting===!0){const at=x.xr.getDepthSensingMesh();at!==null&&Br(at,F,-1/0,x.sortObjects)}Br(b,F,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(V,Q),Pt=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,Pt&&Rt.addToRenderList(m,b),this.info.render.frame++,tt===!0&&nt.beginShadows();const W=p.state.shadowsArray;Mt.render(W,b,F),tt===!0&&nt.endShadows(),this.info.autoReset===!0&&this.info.reset();const X=m.opaque,O=m.transmissive;if(p.setupLights(),F.isArrayCamera){const at=F.cameras;if(O.length>0)for(let mt=0,Tt=at.length;mt<Tt;mt++){const Et=at[mt];al(X,O,b,Et)}Pt&&Rt.render(b);for(let mt=0,Tt=at.length;mt<Tt;mt++){const Et=at[mt];rl(m,b,Et,Et.viewport)}}else O.length>0&&al(X,O,b,F),Pt&&Rt.render(b),rl(m,b,F);P!==null&&(C.updateMultisampleRenderTarget(P),C.updateRenderTargetMipmap(P)),b.isScene===!0&&b.onAfterRender(x,b,F),ie.resetDefaultState(),y=-1,S=null,M.pop(),M.length>0?(p=M[M.length-1],tt===!0&&nt.setGlobalState(x.clippingPlanes,p.state.camera)):p=null,_.pop(),_.length>0?m=_[_.length-1]:m=null};function Br(b,F,W,X){if(b.visible===!1)return;if(b.layers.test(F.layers)){if(b.isGroup)W=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(F);else if(b.isLight)p.pushLight(b),b.castShadow&&p.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||$.intersectsSprite(b)){X&&wt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(St);const mt=K.update(b),Tt=b.material;Tt.visible&&m.push(b,mt,Tt,W,wt.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||$.intersectsObject(b))){const mt=K.update(b),Tt=b.material;if(X&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),wt.copy(b.boundingSphere.center)):(mt.boundingSphere===null&&mt.computeBoundingSphere(),wt.copy(mt.boundingSphere.center)),wt.applyMatrix4(b.matrixWorld).applyMatrix4(St)),Array.isArray(Tt)){const Et=mt.groups;for(let Ft=0,Bt=Et.length;Ft<Bt;Ft++){const At=Et[Ft],Zt=Tt[At.materialIndex];Zt&&Zt.visible&&m.push(b,mt,Zt,W,wt.z,At)}}else Tt.visible&&m.push(b,mt,Tt,W,wt.z,null)}}const at=b.children;for(let mt=0,Tt=at.length;mt<Tt;mt++)Br(at[mt],F,W,X)}function rl(b,F,W,X){const O=b.opaque,at=b.transmissive,mt=b.transparent;p.setupLightsView(W),tt===!0&&nt.setGlobalState(x.clippingPlanes,W),X&&xt.viewport(L.copy(X)),O.length>0&&Bs(O,F,W),at.length>0&&Bs(at,F,W),mt.length>0&&Bs(mt,F,W),xt.buffers.depth.setTest(!0),xt.buffers.depth.setMask(!0),xt.buffers.color.setMask(!0),xt.setPolygonOffset(!1)}function al(b,F,W,X){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[X.id]===void 0&&(p.state.transmissionRenderTarget[X.id]=new Je(1,1,{generateMipmaps:!0,type:Nt.has("EXT_color_buffer_half_float")||Nt.has("EXT_color_buffer_float")?Rn:In,minFilter:En,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$t.workingColorSpace}));const at=p.state.transmissionRenderTarget[X.id],mt=X.viewport||L;at.setSize(mt.z,mt.w);const Tt=x.getRenderTarget();x.setRenderTarget(at),x.getClearColor(k),B=x.getClearAlpha(),B<1&&x.setClearColor(16777215,.5),x.clear(),Pt&&Rt.render(W);const Et=x.toneMapping;x.toneMapping=$n;const Ft=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),p.setupLightsView(X),tt===!0&&nt.setGlobalState(x.clippingPlanes,X),Bs(b,W,X),C.updateMultisampleRenderTarget(at),C.updateRenderTargetMipmap(at),Nt.has("WEBGL_multisampled_render_to_texture")===!1){let Bt=!1;for(let At=0,Zt=F.length;At<Zt;At++){const re=F[At],ae=re.object,Fe=re.geometry,Jt=re.material,Ct=re.group;if(Jt.side===be&&ae.layers.test(X.layers)){const xn=Jt.side;Jt.side=Le,Jt.needsUpdate=!0,ol(ae,W,X,Fe,Jt,Ct),Jt.side=xn,Jt.needsUpdate=!0,Bt=!0}}Bt===!0&&(C.updateMultisampleRenderTarget(at),C.updateRenderTargetMipmap(at))}x.setRenderTarget(Tt),x.setClearColor(k,B),Ft!==void 0&&(X.viewport=Ft),x.toneMapping=Et}function Bs(b,F,W){const X=F.isScene===!0?F.overrideMaterial:null;for(let O=0,at=b.length;O<at;O++){const mt=b[O],Tt=mt.object,Et=mt.geometry,Ft=X===null?mt.material:X,Bt=mt.group;Tt.layers.test(W.layers)&&ol(Tt,F,W,Et,Ft,Bt)}}function ol(b,F,W,X,O,at){b.onBeforeRender(x,F,W,X,O,at),b.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),O.onBeforeRender(x,F,W,X,b,at),O.transparent===!0&&O.side===be&&O.forceSinglePass===!1?(O.side=Le,O.needsUpdate=!0,x.renderBufferDirect(W,F,X,O,b,at),O.side=Dn,O.needsUpdate=!0,x.renderBufferDirect(W,F,X,O,b,at),O.side=be):x.renderBufferDirect(W,F,X,O,b,at),b.onAfterRender(x,F,W,X,O,at)}function ks(b,F,W){F.isScene!==!0&&(F=Ut);const X=bt.get(b),O=p.state.lights,at=p.state.shadowsArray,mt=O.state.version,Tt=ut.getParameters(b,O.state,at,F,W),Et=ut.getProgramCacheKey(Tt);let Ft=X.programs;X.environment=b.isMeshStandardMaterial?F.environment:null,X.fog=F.fog,X.envMap=(b.isMeshStandardMaterial?H:w).get(b.envMap||X.environment),X.envMapRotation=X.environment!==null&&b.envMap===null?F.environmentRotation:b.envMapRotation,Ft===void 0&&(b.addEventListener("dispose",zt),Ft=new Map,X.programs=Ft);let Bt=Ft.get(Et);if(Bt!==void 0){if(X.currentProgram===Bt&&X.lightsStateVersion===mt)return cl(b,Tt),Bt}else Tt.uniforms=ut.getUniforms(b),b.onBeforeCompile(Tt,x),Bt=ut.acquireProgram(Tt,Et),Ft.set(Et,Bt),X.uniforms=Tt.uniforms;const At=X.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(At.clippingPlanes=nt.uniform),cl(b,Tt),X.needsLights=Jh(b),X.lightsStateVersion=mt,X.needsLights&&(At.ambientLightColor.value=O.state.ambient,At.lightProbe.value=O.state.probe,At.directionalLights.value=O.state.directional,At.directionalLightShadows.value=O.state.directionalShadow,At.spotLights.value=O.state.spot,At.spotLightShadows.value=O.state.spotShadow,At.rectAreaLights.value=O.state.rectArea,At.ltc_1.value=O.state.rectAreaLTC1,At.ltc_2.value=O.state.rectAreaLTC2,At.pointLights.value=O.state.point,At.pointLightShadows.value=O.state.pointShadow,At.hemisphereLights.value=O.state.hemi,At.directionalShadowMap.value=O.state.directionalShadowMap,At.directionalShadowMatrix.value=O.state.directionalShadowMatrix,At.spotShadowMap.value=O.state.spotShadowMap,At.spotLightMatrix.value=O.state.spotLightMatrix,At.spotLightMap.value=O.state.spotLightMap,At.pointShadowMap.value=O.state.pointShadowMap,At.pointShadowMatrix.value=O.state.pointShadowMatrix),X.currentProgram=Bt,X.uniformsList=null,Bt}function ll(b){if(b.uniformsList===null){const F=b.currentProgram.getUniforms();b.uniformsList=Ar.seqWithValue(F.seq,b.uniforms)}return b.uniformsList}function cl(b,F){const W=bt.get(b);W.outputColorSpace=F.outputColorSpace,W.batching=F.batching,W.batchingColor=F.batchingColor,W.instancing=F.instancing,W.instancingColor=F.instancingColor,W.instancingMorph=F.instancingMorph,W.skinning=F.skinning,W.morphTargets=F.morphTargets,W.morphNormals=F.morphNormals,W.morphColors=F.morphColors,W.morphTargetsCount=F.morphTargetsCount,W.numClippingPlanes=F.numClippingPlanes,W.numIntersection=F.numClipIntersection,W.vertexAlphas=F.vertexAlphas,W.vertexTangents=F.vertexTangents,W.toneMapping=F.toneMapping}function Kh(b,F,W,X,O){F.isScene!==!0&&(F=Ut),C.resetTextureUnits();const at=F.fog,mt=X.isMeshStandardMaterial?F.environment:null,Tt=P===null?x.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:Qi,Et=(X.isMeshStandardMaterial?H:w).get(X.envMap||mt),Ft=X.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Bt=!!W.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),At=!!W.morphAttributes.position,Zt=!!W.morphAttributes.normal,re=!!W.morphAttributes.color;let ae=$n;X.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(ae=x.toneMapping);const Fe=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Jt=Fe!==void 0?Fe.length:0,Ct=bt.get(X),xn=p.state.lights;if(tt===!0&&(lt===!0||b!==S)){const Ze=b===S&&X.id===y;nt.setState(X,b,Ze)}let Qt=!1;X.version===Ct.__version?(Ct.needsLights&&Ct.lightsStateVersion!==xn.state.version||Ct.outputColorSpace!==Tt||O.isBatchedMesh&&Ct.batching===!1||!O.isBatchedMesh&&Ct.batching===!0||O.isBatchedMesh&&Ct.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Ct.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Ct.instancing===!1||!O.isInstancedMesh&&Ct.instancing===!0||O.isSkinnedMesh&&Ct.skinning===!1||!O.isSkinnedMesh&&Ct.skinning===!0||O.isInstancedMesh&&Ct.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Ct.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Ct.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Ct.instancingMorph===!1&&O.morphTexture!==null||Ct.envMap!==Et||X.fog===!0&&Ct.fog!==at||Ct.numClippingPlanes!==void 0&&(Ct.numClippingPlanes!==nt.numPlanes||Ct.numIntersection!==nt.numIntersection)||Ct.vertexAlphas!==Ft||Ct.vertexTangents!==Bt||Ct.morphTargets!==At||Ct.morphNormals!==Zt||Ct.morphColors!==re||Ct.toneMapping!==ae||Ct.morphTargetsCount!==Jt)&&(Qt=!0):(Qt=!0,Ct.__version=X.version);let en=Ct.currentProgram;Qt===!0&&(en=ks(X,F,O));let gi=!1,ke=!1,ss=!1;const oe=en.getUniforms(),un=Ct.uniforms;if(xt.useProgram(en.program)&&(gi=!0,ke=!0,ss=!0),X.id!==y&&(y=X.id,ke=!0),gi||S!==b){xt.buffers.depth.getReversed()?(et.copy(b.projectionMatrix),nd(et),id(et),oe.setValue(N,"projectionMatrix",et)):oe.setValue(N,"projectionMatrix",b.projectionMatrix),oe.setValue(N,"viewMatrix",b.matrixWorldInverse);const Nn=oe.map.cameraPosition;Nn!==void 0&&Nn.setValue(N,_t.setFromMatrixPosition(b.matrixWorld)),ft.logarithmicDepthBuffer&&oe.setValue(N,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&oe.setValue(N,"isOrthographic",b.isOrthographicCamera===!0),S!==b&&(S=b,ke=!0,ss=!0)}if(O.isSkinnedMesh){oe.setOptional(N,O,"bindMatrix"),oe.setOptional(N,O,"bindMatrixInverse");const Ze=O.skeleton;Ze&&(Ze.boneTexture===null&&Ze.computeBoneTexture(),oe.setValue(N,"boneTexture",Ze.boneTexture,C))}O.isBatchedMesh&&(oe.setOptional(N,O,"batchingTexture"),oe.setValue(N,"batchingTexture",O._matricesTexture,C),oe.setOptional(N,O,"batchingIdTexture"),oe.setValue(N,"batchingIdTexture",O._indirectTexture,C),oe.setOptional(N,O,"batchingColorTexture"),O._colorsTexture!==null&&oe.setValue(N,"batchingColorTexture",O._colorsTexture,C));const rs=W.morphAttributes;if((rs.position!==void 0||rs.normal!==void 0||rs.color!==void 0)&&Dt.update(O,W,en),(ke||Ct.receiveShadow!==O.receiveShadow)&&(Ct.receiveShadow=O.receiveShadow,oe.setValue(N,"receiveShadow",O.receiveShadow)),X.isMeshGouraudMaterial&&X.envMap!==null&&(un.envMap.value=Et,un.flipEnvMap.value=Et.isCubeTexture&&Et.isRenderTargetTexture===!1?-1:1),X.isMeshStandardMaterial&&X.envMap===null&&F.environment!==null&&(un.envMapIntensity.value=F.environmentIntensity),ke&&(oe.setValue(N,"toneMappingExposure",x.toneMappingExposure),Ct.needsLights&&jh(un,ss),at&&X.fog===!0&&ot.refreshFogUniforms(un,at),ot.refreshMaterialUniforms(un,X,z,Y,p.state.transmissionRenderTarget[b.id]),Ar.upload(N,ll(Ct),un,C)),X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(Ar.upload(N,ll(Ct),un,C),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&oe.setValue(N,"center",O.center),oe.setValue(N,"modelViewMatrix",O.modelViewMatrix),oe.setValue(N,"normalMatrix",O.normalMatrix),oe.setValue(N,"modelMatrix",O.matrixWorld),X.isShaderMaterial||X.isRawShaderMaterial){const Ze=X.uniformsGroups;for(let Nn=0,Fn=Ze.length;Nn<Fn;Nn++){const hl=Ze[Nn];I.update(hl,en),I.bind(hl,en)}}return en}function jh(b,F){b.ambientLightColor.needsUpdate=F,b.lightProbe.needsUpdate=F,b.directionalLights.needsUpdate=F,b.directionalLightShadows.needsUpdate=F,b.pointLights.needsUpdate=F,b.pointLightShadows.needsUpdate=F,b.spotLights.needsUpdate=F,b.spotLightShadows.needsUpdate=F,b.rectAreaLights.needsUpdate=F,b.hemisphereLights.needsUpdate=F}function Jh(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(b,F,W){bt.get(b.texture).__webglTexture=F,bt.get(b.depthTexture).__webglTexture=W;const X=bt.get(b);X.__hasExternalTextures=!0,X.__autoAllocateDepthBuffer=W===void 0,X.__autoAllocateDepthBuffer||Nt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),X.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,F){const W=bt.get(b);W.__webglFramebuffer=F,W.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(b,F=0,W=0){P=b,T=F,E=W;let X=!0,O=null,at=!1,mt=!1;if(b){const Et=bt.get(b);if(Et.__useDefaultFramebuffer!==void 0)xt.bindFramebuffer(N.FRAMEBUFFER,null),X=!1;else if(Et.__webglFramebuffer===void 0)C.setupRenderTarget(b);else if(Et.__hasExternalTextures)C.rebindTextures(b,bt.get(b.texture).__webglTexture,bt.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const At=b.depthTexture;if(Et.__boundDepthTexture!==At){if(At!==null&&bt.has(At)&&(b.width!==At.image.width||b.height!==At.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(b)}}const Ft=b.texture;(Ft.isData3DTexture||Ft.isDataArrayTexture||Ft.isCompressedArrayTexture)&&(mt=!0);const Bt=bt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Bt[F])?O=Bt[F][W]:O=Bt[F],at=!0):b.samples>0&&C.useMultisampledRTT(b)===!1?O=bt.get(b).__webglMultisampledFramebuffer:Array.isArray(Bt)?O=Bt[W]:O=Bt,L.copy(b.viewport),D.copy(b.scissor),U=b.scissorTest}else L.copy(st).multiplyScalar(z).floor(),D.copy(rt).multiplyScalar(z).floor(),U=Lt;if(xt.bindFramebuffer(N.FRAMEBUFFER,O)&&X&&xt.drawBuffers(b,O),xt.viewport(L),xt.scissor(D),xt.setScissorTest(U),at){const Et=bt.get(b.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+F,Et.__webglTexture,W)}else if(mt){const Et=bt.get(b.texture),Ft=F||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,Et.__webglTexture,W||0,Ft)}y=-1},this.readRenderTargetPixels=function(b,F,W,X,O,at,mt){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Tt=bt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&mt!==void 0&&(Tt=Tt[mt]),Tt){xt.bindFramebuffer(N.FRAMEBUFFER,Tt);try{const Et=b.texture,Ft=Et.format,Bt=Et.type;if(!ft.textureFormatReadable(Ft)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ft.textureTypeReadable(Bt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=b.width-X&&W>=0&&W<=b.height-O&&N.readPixels(F,W,X,O,Ot.convert(Ft),Ot.convert(Bt),at)}finally{const Et=P!==null?bt.get(P).__webglFramebuffer:null;xt.bindFramebuffer(N.FRAMEBUFFER,Et)}}},this.readRenderTargetPixelsAsync=async function(b,F,W,X,O,at,mt){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Tt=bt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&mt!==void 0&&(Tt=Tt[mt]),Tt){const Et=b.texture,Ft=Et.format,Bt=Et.type;if(!ft.textureFormatReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ft.textureTypeReadable(Bt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(F>=0&&F<=b.width-X&&W>=0&&W<=b.height-O){xt.bindFramebuffer(N.FRAMEBUFFER,Tt);const At=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,At),N.bufferData(N.PIXEL_PACK_BUFFER,at.byteLength,N.STREAM_READ),N.readPixels(F,W,X,O,Ot.convert(Ft),Ot.convert(Bt),0);const Zt=P!==null?bt.get(P).__webglFramebuffer:null;xt.bindFramebuffer(N.FRAMEBUFFER,Zt);const re=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await ed(N,re,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,At),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,at),N.deleteBuffer(At),N.deleteSync(re),at}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,F=null,W=0){b.isTexture!==!0&&(_s("WebGLRenderer: copyFramebufferToTexture function signature has changed."),F=arguments[0]||null,b=arguments[1]);const X=Math.pow(2,-W),O=Math.floor(b.image.width*X),at=Math.floor(b.image.height*X),mt=F!==null?F.x:0,Tt=F!==null?F.y:0;C.setTexture2D(b,0),N.copyTexSubImage2D(N.TEXTURE_2D,W,0,0,mt,Tt,O,at),xt.unbindTexture()},this.copyTextureToTexture=function(b,F,W=null,X=null,O=0){b.isTexture!==!0&&(_s("WebGLRenderer: copyTextureToTexture function signature has changed."),X=arguments[0]||null,b=arguments[1],F=arguments[2],O=arguments[3]||0,W=null);let at,mt,Tt,Et,Ft,Bt,At,Zt,re;const ae=b.isCompressedTexture?b.mipmaps[O]:b.image;W!==null?(at=W.max.x-W.min.x,mt=W.max.y-W.min.y,Tt=W.isBox3?W.max.z-W.min.z:1,Et=W.min.x,Ft=W.min.y,Bt=W.isBox3?W.min.z:0):(at=ae.width,mt=ae.height,Tt=ae.depth||1,Et=0,Ft=0,Bt=0),X!==null?(At=X.x,Zt=X.y,re=X.z):(At=0,Zt=0,re=0);const Fe=Ot.convert(F.format),Jt=Ot.convert(F.type);let Ct;F.isData3DTexture?(C.setTexture3D(F,0),Ct=N.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(C.setTexture2DArray(F,0),Ct=N.TEXTURE_2D_ARRAY):(C.setTexture2D(F,0),Ct=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,F.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,F.unpackAlignment);const xn=N.getParameter(N.UNPACK_ROW_LENGTH),Qt=N.getParameter(N.UNPACK_IMAGE_HEIGHT),en=N.getParameter(N.UNPACK_SKIP_PIXELS),gi=N.getParameter(N.UNPACK_SKIP_ROWS),ke=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,ae.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ae.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Et),N.pixelStorei(N.UNPACK_SKIP_ROWS,Ft),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Bt);const ss=b.isDataArrayTexture||b.isData3DTexture,oe=F.isDataArrayTexture||F.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){const un=bt.get(b),rs=bt.get(F),Ze=bt.get(un.__renderTarget),Nn=bt.get(rs.__renderTarget);xt.bindFramebuffer(N.READ_FRAMEBUFFER,Ze.__webglFramebuffer),xt.bindFramebuffer(N.DRAW_FRAMEBUFFER,Nn.__webglFramebuffer);for(let Fn=0;Fn<Tt;Fn++)ss&&N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,bt.get(b).__webglTexture,O,Bt+Fn),b.isDepthTexture?(oe&&N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,bt.get(F).__webglTexture,O,re+Fn),N.blitFramebuffer(Et,Ft,at,mt,At,Zt,at,mt,N.DEPTH_BUFFER_BIT,N.NEAREST)):oe?N.copyTexSubImage3D(Ct,O,At,Zt,re+Fn,Et,Ft,at,mt):N.copyTexSubImage2D(Ct,O,At,Zt,re+Fn,Et,Ft,at,mt);xt.bindFramebuffer(N.READ_FRAMEBUFFER,null),xt.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else oe?b.isDataTexture||b.isData3DTexture?N.texSubImage3D(Ct,O,At,Zt,re,at,mt,Tt,Fe,Jt,ae.data):F.isCompressedArrayTexture?N.compressedTexSubImage3D(Ct,O,At,Zt,re,at,mt,Tt,Fe,ae.data):N.texSubImage3D(Ct,O,At,Zt,re,at,mt,Tt,Fe,Jt,ae):b.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,O,At,Zt,at,mt,Fe,Jt,ae.data):b.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,O,At,Zt,ae.width,ae.height,Fe,ae.data):N.texSubImage2D(N.TEXTURE_2D,O,At,Zt,at,mt,Fe,Jt,ae);N.pixelStorei(N.UNPACK_ROW_LENGTH,xn),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Qt),N.pixelStorei(N.UNPACK_SKIP_PIXELS,en),N.pixelStorei(N.UNPACK_SKIP_ROWS,gi),N.pixelStorei(N.UNPACK_SKIP_IMAGES,ke),O===0&&F.generateMipmaps&&N.generateMipmap(Ct),xt.unbindTexture()},this.copyTextureToTexture3D=function(b,F,W=null,X=null,O=0){return b.isTexture!==!0&&(_s("WebGLRenderer: copyTextureToTexture3D function signature has changed."),W=arguments[0]||null,X=arguments[1]||null,b=arguments[2],F=arguments[3],O=arguments[4]||0),_s('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,F,W,X,O)},this.initRenderTarget=function(b){bt.get(b).__webglFramebuffer===void 0&&C.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?C.setTextureCube(b,0):b.isData3DTexture?C.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?C.setTexture2DArray(b,0):C.setTexture2D(b,0),xt.unbindTexture()},this.resetState=function(){T=0,E=0,P=null,xt.reset(),ie.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return An}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=$t._getDrawingBufferColorSpace(t),e.unpackColorSpace=$t._getUnpackColorSpace()}}class Xo{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new dt(t),this.near=e,this.far=n}clone(){return new Xo(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class uc extends _e{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new cn,this.environmentIntensity=1,this.environmentRotation=new cn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class dg{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=_o,this.updateRanges=[],this.version=0,this.uuid=mn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,r=this.stride;i<r;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=mn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=mn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const De=new A;class Pr{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)De.fromBufferAttribute(this,e),De.applyMatrix4(t),this.setXYZ(e,De.x,De.y,De.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)De.fromBufferAttribute(this,e),De.applyNormalMatrix(t),this.setXYZ(e,De.x,De.y,De.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)De.fromBufferAttribute(this,e),De.transformDirection(t),this.setXYZ(e,De.x,De.y,De.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=an(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ne(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=an(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=an(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=an(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=an(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array),r=ne(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return new ge(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Pr(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class $o extends Yn{static get type(){return"SpriteMaterial"}constructor(t){super(),this.isSpriteMaterial=!0,this.color=new dt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Li;const hs=new A,Di=new A,Ii=new A,Ui=new it,us=new it,Dh=new Vt,lr=new A,ds=new A,cr=new A,dc=new it,ma=new it,fc=new it;class Ih extends _e{constructor(t=new $o){if(super(),this.isSprite=!0,this.type="Sprite",Li===void 0){Li=new ue;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new dg(e,5);Li.setIndex([0,1,2,0,2,3]),Li.setAttribute("position",new Pr(n,3,0,!1)),Li.setAttribute("uv",new Pr(n,2,3,!1))}this.geometry=Li,this.material=t,this.center=new it(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Di.setFromMatrixScale(this.matrixWorld),Dh.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Ii.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Di.multiplyScalar(-Ii.z);const n=this.material.rotation;let i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));const a=this.center;hr(lr.set(-.5,-.5,0),Ii,a,Di,i,r),hr(ds.set(.5,-.5,0),Ii,a,Di,i,r),hr(cr.set(.5,.5,0),Ii,a,Di,i,r),dc.set(0,0),ma.set(1,0),fc.set(1,1);let o=t.ray.intersectTriangle(lr,ds,cr,!1,hs);if(o===null&&(hr(ds.set(-.5,.5,0),Ii,a,Di,i,r),ma.set(0,1),o=t.ray.intersectTriangle(lr,cr,ds,!1,hs),o===null))return;const l=t.ray.origin.distanceTo(hs);l<t.near||l>t.far||e.push({distance:l,point:hs.clone(),uv:je.getInterpolation(hs,lr,ds,cr,dc,ma,fc,new it),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function hr(s,t,e,n,i,r){Ui.subVectors(s,e).addScalar(.5).multiply(n),i!==void 0?(us.x=r*Ui.x-i*Ui.y,us.y=i*Ui.x+r*Ui.y):us.copy(Ui),s.copy(t),s.x+=us.x,s.y+=us.y,s.applyMatrix4(Dh)}class fg extends Ae{constructor(t=null,e=1,n=1,i,r,a,o,l,c=$e,h=$e,u,f){super(null,a,o,l,c,h,i,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class fn extends ge{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Ni=new Vt,pc=new Vt,ur=[],mc=new pi,pg=new Vt,fs=new It,ps=new es;class qn extends It{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new fn(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,pg)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new pi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ni),mc.copy(t.boundingBox).applyMatrix4(Ni),this.boundingBox.union(mc)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new es),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ni),ps.copy(t.boundingSphere).applyMatrix4(Ni),this.boundingSphere.union(ps)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(t,e){const n=this.matrixWorld,i=this.count;if(fs.geometry=this.geometry,fs.material=this.material,fs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ps.copy(this.boundingSphere),ps.applyMatrix4(n),t.ray.intersectsSphere(ps)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Ni),pc.multiplyMatrices(n,Ni),fs.matrixWorld=pc,fs.raycast(t,ur);for(let a=0,o=ur.length;a<o;a++){const l=ur[a];l.instanceId=r,l.object=this,e.push(l)}ur.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new fn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new fg(new Float32Array(i*this.count),i,this.count,Uo,pn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Uh extends Yn{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new dt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const gc=new Vt,So=new ko,dr=new es,fr=new A;class mg extends _e{constructor(t=new ue,e=new Uh){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),dr.copy(n.boundingSphere),dr.applyMatrix4(i),dr.radius+=r,t.ray.intersectsSphere(dr)===!1)return;gc.copy(i).invert(),So.copy(t.ray).applyMatrix4(gc);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let g=f,v=d;g<v;g++){const m=c.getX(g);fr.fromBufferAttribute(u,m),vc(fr,m,l,i,t,e,this)}}else{const f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let g=f,v=d;g<v;g++)fr.fromBufferAttribute(u,g),vc(fr,g,l,i,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function vc(s,t,e,n,i,r,a){const o=So.distanceSqToPoint(s);if(o<e){const l=new A;So.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class Ye extends Ae{constructor(t,e,n,i,r,a,o,l,c){super(t,e,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class gn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,i=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let i=0;const r=n.length;let a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(r-1);const h=n[i],f=n[i+1]-h,d=(a-h)/f;return(i+d)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);const a=this.getPoint(i),o=this.getPoint(r),l=e||(a.isVector2?new it:new A);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new A,i=[],r=[],a=[],o=new A,l=new Vt;for(let d=0;d<=t;d++){const g=d/t;i[d]=this.getTangentAt(g,new A)}r[0]=new A,a[0]=new A;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),f=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(i[d-1],i[d]),o.length()>Number.EPSILON){o.normalize();const g=Math.acos(we(i[d-1].dot(i[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,g))}a[d].crossVectors(i[d],r[d])}if(e===!0){let d=Math.acos(we(r[0].dot(r[t]),-1,1));d/=t,i[0].dot(o.crossVectors(r[0],r[t]))>0&&(d=-d);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],d*g)),a[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class qo extends gn{constructor(t=0,e=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new it){const n=e,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);const o=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*h-d*u+this.aX,c=f*u+d*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class gg extends qo{constructor(t,e,n,i,r,a){super(t,e,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Yo(){let s=0,t=0,e=0,n=0;function i(r,a,o,l){s=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){i(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let f=(a-r)/c-(o-r)/(c+h)+(o-a)/h,d=(o-a)/h-(l-a)/(h+u)+(l-o)/u;f*=h,d*=h,i(a,o,f,d)},calc:function(r){const a=r*r,o=a*r;return s+t*r+e*a+n*o}}}const pr=new A,ga=new Yo,va=new Yo,xa=new Yo;class Lr extends gn{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new A){const n=e,i=this.points,r=i.length,a=(r-(this.closed?0:1))*t;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%r]:(pr.subVectors(i[0],i[1]).add(i[0]),c=pr);const u=i[o%r],f=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(pr.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=pr),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),d),v=Math.pow(u.distanceToSquared(f),d),m=Math.pow(f.distanceToSquared(h),d);v<1e-4&&(v=1),g<1e-4&&(g=v),m<1e-4&&(m=v),ga.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,g,v,m),va.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,g,v,m),xa.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,g,v,m)}else this.curveType==="catmullrom"&&(ga.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),va.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),xa.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(ga.calc(l),va.calc(l),xa.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new A().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function xc(s,t,e,n,i){const r=(n-t)*.5,a=(i-e)*.5,o=s*s,l=s*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*s+e}function vg(s,t){const e=1-s;return e*e*t}function xg(s,t){return 2*(1-s)*s*t}function _g(s,t){return s*s*t}function bs(s,t,e,n){return vg(s,t)+xg(s,e)+_g(s,n)}function Mg(s,t){const e=1-s;return e*e*e*t}function yg(s,t){const e=1-s;return 3*e*e*s*t}function Sg(s,t){return 3*(1-s)*s*s*t}function wg(s,t){return s*s*s*t}function Ts(s,t,e,n,i){return Mg(s,t)+yg(s,e)+Sg(s,n)+wg(s,i)}class Nh extends gn{constructor(t=new it,e=new it,n=new it,i=new it){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new it){const n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ts(t,i.x,r.x,a.x,o.x),Ts(t,i.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class bg extends gn{constructor(t=new A,e=new A,n=new A,i=new A){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new A){const n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ts(t,i.x,r.x,a.x,o.x),Ts(t,i.y,r.y,a.y,o.y),Ts(t,i.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Fh extends gn{constructor(t=new it,e=new it){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new it){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new it){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Tg extends gn{constructor(t=new A,e=new A){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new A){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new A){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Oh extends gn{constructor(t=new it,e=new it,n=new it){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new it){const n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(bs(t,i.x,r.x,a.x),bs(t,i.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class zh extends gn{constructor(t=new A,e=new A,n=new A){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new A){const n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(bs(t,i.x,r.x,a.x),bs(t,i.y,r.y,a.y),bs(t,i.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Bh extends gn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new it){const n=e,i=this.points,r=(i.length-1)*t,a=Math.floor(r),o=r-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(xc(o,l.x,c.x,h.x,u.x),xc(o,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new it().fromArray(i))}return this}}var wo=Object.freeze({__proto__:null,ArcCurve:gg,CatmullRomCurve3:Lr,CubicBezierCurve:Nh,CubicBezierCurve3:bg,EllipseCurve:qo,LineCurve:Fh,LineCurve3:Tg,QuadraticBezierCurve:Oh,QuadraticBezierCurve3:zh,SplineCurve:Bh});class Eg extends gn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new wo[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const a=i[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const a=r[i],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(new wo[i.type]().fromJSON(i))}return this}}class _c extends Eg{constructor(t){super(),this.type="Path",this.currentPoint=new it,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new Fh(this.currentPoint.clone(),new it(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){const r=new Oh(this.currentPoint.clone(),new it(t,e),new it(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,a){const o=new Nh(this.currentPoint.clone(),new it(t,e),new it(n,i),new it(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new Bh(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,i,r,a),this}absarc(t,e,n,i,r,a){return this.absellipse(t,e,n,n,i,r,a),this}ellipse(t,e,n,i,r,a,o,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,r,a,o,l),this}absellipse(t,e,n,i,r,a,o,l){const c=new qo(t,e,n,i,r,a,o,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class ui extends ue{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);const r=[],a=[],o=[],l=[],c=new A,h=new it;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,f=3;u<=e;u++,f+=3){const d=n+u/e*i;c.x=t*Math.cos(d),c.y=t*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[f]/t+1)/2,h.y=(a[f+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Yt(a,3)),this.setAttribute("normal",new Yt(o,3)),this.setAttribute("uv",new Yt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ui(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class Ln extends ue{constructor(t=1,e=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],f=[],d=[];let g=0;const v=[],m=n/2;let p=0;_(),a===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new Yt(u,3)),this.setAttribute("normal",new Yt(f,3)),this.setAttribute("uv",new Yt(d,2));function _(){const x=new A,R=new A;let T=0;const E=(e-t)/n;for(let P=0;P<=r;P++){const y=[],S=P/r,L=S*(e-t)+t;for(let D=0;D<=i;D++){const U=D/i,k=U*l+o,B=Math.sin(k),G=Math.cos(k);R.x=L*B,R.y=-S*n+m,R.z=L*G,u.push(R.x,R.y,R.z),x.set(B,E,G).normalize(),f.push(x.x,x.y,x.z),d.push(U,1-S),y.push(g++)}v.push(y)}for(let P=0;P<i;P++)for(let y=0;y<r;y++){const S=v[y][P],L=v[y+1][P],D=v[y+1][P+1],U=v[y][P+1];(t>0||y!==0)&&(h.push(S,L,U),T+=3),(e>0||y!==r-1)&&(h.push(L,D,U),T+=3)}c.addGroup(p,T,0),p+=T}function M(x){const R=g,T=new it,E=new A;let P=0;const y=x===!0?t:e,S=x===!0?1:-1;for(let D=1;D<=i;D++)u.push(0,m*S,0),f.push(0,S,0),d.push(.5,.5),g++;const L=g;for(let D=0;D<=i;D++){const k=D/i*l+o,B=Math.cos(k),G=Math.sin(k);E.x=y*G,E.y=m*S,E.z=y*B,u.push(E.x,E.y,E.z),f.push(0,S,0),T.x=B*.5+.5,T.y=G*.5*S+.5,d.push(T.x,T.y),g++}for(let D=0;D<i;D++){const U=R+D,k=L+D;x===!0?h.push(k,k+1,U):h.push(k+1,k,U),P+=3}c.addGroup(p,P,x===!0?1:2),p+=P}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ln(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Zo extends Ln{constructor(t=1,e=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new Zo(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Ko extends ue{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};const r=[],a=[];o(i),c(n),h(),this.setAttribute("position",new Yt(r,3)),this.setAttribute("normal",new Yt(r.slice(),3)),this.setAttribute("uv",new Yt(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(_){const M=new A,x=new A,R=new A;for(let T=0;T<e.length;T+=3)d(e[T+0],M),d(e[T+1],x),d(e[T+2],R),l(M,x,R,_)}function l(_,M,x,R){const T=R+1,E=[];for(let P=0;P<=T;P++){E[P]=[];const y=_.clone().lerp(x,P/T),S=M.clone().lerp(x,P/T),L=T-P;for(let D=0;D<=L;D++)D===0&&P===T?E[P][D]=y:E[P][D]=y.clone().lerp(S,D/L)}for(let P=0;P<T;P++)for(let y=0;y<2*(T-P)-1;y++){const S=Math.floor(y/2);y%2===0?(f(E[P][S+1]),f(E[P+1][S]),f(E[P][S])):(f(E[P][S+1]),f(E[P+1][S+1]),f(E[P+1][S]))}}function c(_){const M=new A;for(let x=0;x<r.length;x+=3)M.x=r[x+0],M.y=r[x+1],M.z=r[x+2],M.normalize().multiplyScalar(_),r[x+0]=M.x,r[x+1]=M.y,r[x+2]=M.z}function h(){const _=new A;for(let M=0;M<r.length;M+=3){_.x=r[M+0],_.y=r[M+1],_.z=r[M+2];const x=m(_)/2/Math.PI+.5,R=p(_)/Math.PI+.5;a.push(x,1-R)}g(),u()}function u(){for(let _=0;_<a.length;_+=6){const M=a[_+0],x=a[_+2],R=a[_+4],T=Math.max(M,x,R),E=Math.min(M,x,R);T>.9&&E<.1&&(M<.2&&(a[_+0]+=1),x<.2&&(a[_+2]+=1),R<.2&&(a[_+4]+=1))}}function f(_){r.push(_.x,_.y,_.z)}function d(_,M){const x=_*3;M.x=t[x+0],M.y=t[x+1],M.z=t[x+2]}function g(){const _=new A,M=new A,x=new A,R=new A,T=new it,E=new it,P=new it;for(let y=0,S=0;y<r.length;y+=9,S+=6){_.set(r[y+0],r[y+1],r[y+2]),M.set(r[y+3],r[y+4],r[y+5]),x.set(r[y+6],r[y+7],r[y+8]),T.set(a[S+0],a[S+1]),E.set(a[S+2],a[S+3]),P.set(a[S+4],a[S+5]),R.copy(_).add(M).add(x).divideScalar(3);const L=m(R);v(T,S+0,_,L),v(E,S+2,M,L),v(P,S+4,x,L)}}function v(_,M,x,R){R<0&&_.x===1&&(a[M]=_.x-1),x.x===0&&x.z===0&&(a[M]=R/2/Math.PI+.5)}function m(_){return Math.atan2(_.z,-_.x)}function p(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ko(t.vertices,t.indices,t.radius,t.details)}}class kh extends _c{constructor(t){super(t),this.uuid=mn(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(new _c().fromJSON(i))}return this}}const Ag={triangulate:function(s,t,e=2){const n=t&&t.length,i=n?t[0]*e:s.length;let r=Hh(s,0,i,e,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c,h,u,f,d;if(n&&(r=Dg(s,t,r,e)),s.length>80*e){o=c=s[0],l=h=s[1];for(let g=e;g<i;g+=e)u=s[g],f=s[g+1],u<o&&(o=u),f<l&&(l=f),u>c&&(c=u),f>h&&(h=f);d=Math.max(c-o,h-l),d=d!==0?32767/d:0}return Is(r,a,e,o,l,d,0),a}};function Hh(s,t,e,n,i){let r,a;if(i===Vg(s,t,e,n)>0)for(r=t;r<e;r+=n)a=Mc(r,s[r],s[r+1],a);else for(r=e-n;r>=t;r-=n)a=Mc(r,s[r],s[r+1],a);return a&&zr(a,a.next)&&(Ns(a),a=a.next),a}function di(s,t){if(!s)return s;t||(t=s);let e=s,n;do if(n=!1,!e.steiner&&(zr(e,e.next)||ce(e.prev,e,e.next)===0)){if(Ns(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Is(s,t,e,n,i,r,a){if(!s)return;!a&&r&&Og(s,n,i,r);let o=s,l,c;for(;s.prev!==s.next;){if(l=s.prev,c=s.next,r?Rg(s,n,i,r):Cg(s)){t.push(l.i/e|0),t.push(s.i/e|0),t.push(c.i/e|0),Ns(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=Pg(di(s),t,e),Is(s,t,e,n,i,r,2)):a===2&&Lg(s,t,e,n,i,r):Is(di(s),t,e,n,i,r,1);break}}}function Cg(s){const t=s.prev,e=s,n=s.next;if(ce(t,e,n)>=0)return!1;const i=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=i<r?i<a?i:a:r<a?r:a,u=o<l?o<c?o:c:l<c?l:c,f=i>r?i>a?i:a:r>a?r:a,d=o>l?o>c?o:c:l>c?l:c;let g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=f&&g.y>=u&&g.y<=d&&ki(i,o,r,l,a,c,g.x,g.y)&&ce(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Rg(s,t,e,n){const i=s.prev,r=s,a=s.next;if(ce(i,r,a)>=0)return!1;const o=i.x,l=r.x,c=a.x,h=i.y,u=r.y,f=a.y,d=o<l?o<c?o:c:l<c?l:c,g=h<u?h<f?h:f:u<f?u:f,v=o>l?o>c?o:c:l>c?l:c,m=h>u?h>f?h:f:u>f?u:f,p=bo(d,g,t,e,n),_=bo(v,m,t,e,n);let M=s.prevZ,x=s.nextZ;for(;M&&M.z>=p&&x&&x.z<=_;){if(M.x>=d&&M.x<=v&&M.y>=g&&M.y<=m&&M!==i&&M!==a&&ki(o,h,l,u,c,f,M.x,M.y)&&ce(M.prev,M,M.next)>=0||(M=M.prevZ,x.x>=d&&x.x<=v&&x.y>=g&&x.y<=m&&x!==i&&x!==a&&ki(o,h,l,u,c,f,x.x,x.y)&&ce(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;M&&M.z>=p;){if(M.x>=d&&M.x<=v&&M.y>=g&&M.y<=m&&M!==i&&M!==a&&ki(o,h,l,u,c,f,M.x,M.y)&&ce(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;x&&x.z<=_;){if(x.x>=d&&x.x<=v&&x.y>=g&&x.y<=m&&x!==i&&x!==a&&ki(o,h,l,u,c,f,x.x,x.y)&&ce(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Pg(s,t,e){let n=s;do{const i=n.prev,r=n.next.next;!zr(i,r)&&Gh(i,n,n.next,r)&&Us(i,r)&&Us(r,i)&&(t.push(i.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Ns(n),Ns(n.next),n=s=r),n=n.next}while(n!==s);return di(n)}function Lg(s,t,e,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&kg(a,o)){let l=Vh(a,o);a=di(a,a.next),l=di(l,l.next),Is(a,t,e,n,i,r,0),Is(l,t,e,n,i,r,0);return}o=o.next}a=a.next}while(a!==s)}function Dg(s,t,e,n){const i=[];let r,a,o,l,c;for(r=0,a=t.length;r<a;r++)o=t[r]*n,l=r<a-1?t[r+1]*n:s.length,c=Hh(s,o,l,n,!1),c===c.next&&(c.steiner=!0),i.push(Bg(c));for(i.sort(Ig),r=0;r<i.length;r++)e=Ug(i[r],e);return e}function Ig(s,t){return s.x-t.x}function Ug(s,t){const e=Ng(s,t);if(!e)return t;const n=Vh(e,s);return di(n,n.next),di(e,e.next)}function Ng(s,t){let e=t,n=-1/0,i;const r=s.x,a=s.y;do{if(a<=e.y&&a>=e.next.y&&e.next.y!==e.y){const f=e.x+(a-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=r&&f>n&&(n=f,i=e.x<e.next.x?e:e.next,f===r))return i}e=e.next}while(e!==t);if(!i)return null;const o=i,l=i.x,c=i.y;let h=1/0,u;e=i;do r>=e.x&&e.x>=l&&r!==e.x&&ki(a<c?r:n,a,l,c,a<c?n:r,a,e.x,e.y)&&(u=Math.abs(a-e.y)/(r-e.x),Us(e,s)&&(u<h||u===h&&(e.x>i.x||e.x===i.x&&Fg(i,e)))&&(i=e,h=u)),e=e.next;while(e!==o);return i}function Fg(s,t){return ce(s.prev,s,t.prev)<0&&ce(t.next,s,s.next)<0}function Og(s,t,e,n){let i=s;do i.z===0&&(i.z=bo(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,zg(i)}function zg(s){let t,e,n,i,r,a,o,l,c=1;do{for(e=s,s=null,r=null,a=0;e;){for(a++,n=e,o=0,t=0;t<c&&(o++,n=n.nextZ,!!n);t++);for(l=c;o>0||l>0&&n;)o!==0&&(l===0||!n||e.z<=n.z)?(i=e,e=e.nextZ,o--):(i=n,n=n.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;e=n}r.nextZ=null,c*=2}while(a>1);return s}function bo(s,t,e,n,i){return s=(s-e)*i|0,t=(t-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function Bg(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function ki(s,t,e,n,i,r,a,o){return(i-a)*(t-o)>=(s-a)*(r-o)&&(s-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(i-a)*(n-o)}function kg(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!Hg(s,t)&&(Us(s,t)&&Us(t,s)&&Gg(s,t)&&(ce(s.prev,s,t.prev)||ce(s,t.prev,t))||zr(s,t)&&ce(s.prev,s,s.next)>0&&ce(t.prev,t,t.next)>0)}function ce(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function zr(s,t){return s.x===t.x&&s.y===t.y}function Gh(s,t,e,n){const i=gr(ce(s,t,e)),r=gr(ce(s,t,n)),a=gr(ce(e,n,s)),o=gr(ce(e,n,t));return!!(i!==r&&a!==o||i===0&&mr(s,e,t)||r===0&&mr(s,n,t)||a===0&&mr(e,s,n)||o===0&&mr(e,t,n))}function mr(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function gr(s){return s>0?1:s<0?-1:0}function Hg(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&Gh(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function Us(s,t){return ce(s.prev,s,s.next)<0?ce(s,t,s.next)>=0&&ce(s,s.prev,t)>=0:ce(s,t,s.prev)<0||ce(s,s.next,t)<0}function Gg(s,t){let e=s,n=!1;const i=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&i<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==s);return n}function Vh(s,t){const e=new To(s.i,s.x,s.y),n=new To(t.i,t.x,t.y),i=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=i,i.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Mc(s,t,e,n){const i=new To(s,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Ns(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function To(s,t,e){this.i=s,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Vg(s,t,e,n){let i=0;for(let r=t,a=e-n;r<e;r+=n)i+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return i}class Es{static area(t){const e=t.length;let n=0;for(let i=e-1,r=0;r<e;i=r++)n+=t[i].x*t[r].y-t[r].x*t[i].y;return n*.5}static isClockWise(t){return Es.area(t)<0}static triangulateShape(t,e){const n=[],i=[],r=[];yc(t),Sc(n,t);let a=t.length;e.forEach(yc);for(let l=0;l<e.length;l++)i.push(a),a+=e[l].length,Sc(n,e[l]);const o=Ag.triangulate(n,i);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function yc(s){const t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function Sc(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}class jo extends Ko{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new jo(t.radius,t.detail)}}class fi extends ue{constructor(t=.5,e=1,n=32,i=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);const o=[],l=[],c=[],h=[];let u=t;const f=(e-t)/i,d=new A,g=new it;for(let v=0;v<=i;v++){for(let m=0;m<=n;m++){const p=r+m/n*a;d.x=u*Math.cos(p),d.y=u*Math.sin(p),l.push(d.x,d.y,d.z),c.push(0,0,1),g.x=(d.x/e+1)/2,g.y=(d.y/e+1)/2,h.push(g.x,g.y)}u+=f}for(let v=0;v<i;v++){const m=v*(n+1);for(let p=0;p<n;p++){const _=p+m,M=_,x=_+n+1,R=_+n+2,T=_+1;o.push(M,x,T),o.push(x,R,T)}}this.setIndex(o),this.setAttribute("position",new Yt(l,3)),this.setAttribute("normal",new Yt(c,3)),this.setAttribute("uv",new Yt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new fi(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Jo extends ue{constructor(t=new kh([new it(0,.5),new it(-.5,-.5),new it(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};const n=[],i=[],r=[],a=[];let o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(o,l,h),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new Yt(i,3)),this.setAttribute("normal",new Yt(r,3)),this.setAttribute("uv",new Yt(a,2));function c(h){const u=i.length/3,f=h.extractPoints(e);let d=f.shape;const g=f.holes;Es.isClockWise(d)===!1&&(d=d.reverse());for(let m=0,p=g.length;m<p;m++){const _=g[m];Es.isClockWise(_)===!0&&(g[m]=_.reverse())}const v=Es.triangulateShape(d,g);for(let m=0,p=g.length;m<p;m++){const _=g[m];d=d.concat(_)}for(let m=0,p=d.length;m<p;m++){const _=d[m];i.push(_.x,_.y,0),r.push(0,0,1),a.push(_.x,_.y)}for(let m=0,p=v.length;m<p;m++){const _=v[m],M=_[0]+u,x=_[1]+u,R=_[2]+u;n.push(M,x,R),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes;return Wg(e,t)}static fromJSON(t,e){const n=[];for(let i=0,r=t.shapes.length;i<r;i++){const a=e[t.shapes[i]];n.push(a)}return new Jo(n,t.curveSegments)}}function Wg(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,n=s.length;e<n;e++){const i=s[e];t.shapes.push(i.uuid)}else t.shapes.push(s.uuid);return t}class Os extends ue{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new A,f=new A,d=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const _=[],M=p/n;let x=0;p===0&&a===0?x=.5/e:p===n&&l===Math.PI&&(x=-.5/e);for(let R=0;R<=e;R++){const T=R/e;u.x=-t*Math.cos(i+T*r)*Math.sin(a+M*o),u.y=t*Math.cos(a+M*o),u.z=t*Math.sin(i+T*r)*Math.sin(a+M*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),m.push(T+x,1-M),_.push(c++)}h.push(_)}for(let p=0;p<n;p++)for(let _=0;_<e;_++){const M=h[p][_+1],x=h[p][_],R=h[p+1][_],T=h[p+1][_+1];(p!==0||a>0)&&d.push(M,x,T),(p!==n-1||l<Math.PI)&&d.push(x,R,T)}this.setIndex(d),this.setAttribute("position",new Yt(g,3)),this.setAttribute("normal",new Yt(v,3)),this.setAttribute("uv",new Yt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Os(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Qo extends ue{constructor(t=new zh(new A(-1,-1,0),new A(-1,1,0),new A(1,1,0)),e=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:i,closed:r};const a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new A,l=new A,c=new it;let h=new A;const u=[],f=[],d=[],g=[];v(),this.setIndex(g),this.setAttribute("position",new Yt(u,3)),this.setAttribute("normal",new Yt(f,3)),this.setAttribute("uv",new Yt(d,2));function v(){for(let M=0;M<e;M++)m(M);m(r===!1?e:0),_(),p()}function m(M){h=t.getPointAt(M/e,h);const x=a.normals[M],R=a.binormals[M];for(let T=0;T<=i;T++){const E=T/i*Math.PI*2,P=Math.sin(E),y=-Math.cos(E);l.x=y*x.x+P*R.x,l.y=y*x.y+P*R.y,l.z=y*x.z+P*R.z,l.normalize(),f.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,u.push(o.x,o.y,o.z)}}function p(){for(let M=1;M<=e;M++)for(let x=1;x<=i;x++){const R=(i+1)*(M-1)+(x-1),T=(i+1)*M+(x-1),E=(i+1)*M+x,P=(i+1)*(M-1)+x;g.push(R,T,P),g.push(T,E,P)}}function _(){for(let M=0;M<=e;M++)for(let x=0;x<=i;x++)c.x=M/e,c.y=x/i,d.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new Qo(new wo[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}}class Xg extends me{static get type(){return"RawShaderMaterial"}constructor(t){super(t),this.isRawShaderMaterial=!0}}class pe extends Yn{static get type(){return"MeshStandardMaterial"}constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new dt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=zo,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class $g extends pe{static get type(){return"MeshPhysicalMaterial"}constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new it(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return we(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new dt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new dt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new dt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class As extends Yn{static get type(){return"MeshLambertMaterial"}constructor(t){super(),this.isMeshLambertMaterial=!0,this.color=new dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=zo,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.combine=Ro,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}const wc={enabled:!1,files:{},add:function(s,t){this.enabled!==!1&&(this.files[s]=t)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class qg{constructor(t,e,n){const i=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){const d=c[u],g=c[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return g}return null}}}const Yg=new qg;class tl{constructor(t){this.manager=t!==void 0?t:Yg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){const n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}tl.DEFAULT_MATERIAL_NAME="__DEFAULT";class Zg extends tl{constructor(t){super(t)}load(t,e,n,i){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const r=this,a=wc.get(t);if(a!==void 0)return r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0),a;const o=Ds("img");function l(){h(),wc.add(t,this),e&&e(this),r.manager.itemEnd(t)}function c(u){h(),i&&i(u),r.manager.itemError(t),r.manager.itemEnd(t)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),r.manager.itemStart(t),o.src=t,o}}class ji extends tl{constructor(t){super(t)}load(t,e,n,i){const r=new Ae,a=new Zg(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){r.image=o,r.needsUpdate=!0,e!==void 0&&e(r)},n,i),r}}class Wh extends _e{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new dt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Kg extends Wh{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.groundColor=new dt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const _a=new Vt,bc=new A,Tc=new A;class jg{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new it(512,512),this.map=null,this.mapPass=null,this.matrix=new Vt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Go,this._frameExtents=new it(1,1),this._viewportCount=1,this._viewports=[new le(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;bc.setFromMatrixPosition(t.matrixWorld),e.position.copy(bc),Tc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Tc),e.updateMatrixWorld(),_a.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(_a),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(_a)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Jg extends jg{constructor(){super(new Vo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Qg extends Wh{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.target=new _e,this.shadow=new Jg}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class tv{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Ec(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=Ec();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function Ec(){return performance.now()}const Ac=new Vt;class ev{constructor(t,e,n=0,i=1/0){this.ray=new ko(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new Ho,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Ac.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ac),this}intersectObject(t,e=!0,n=[]){return Eo(t,this,n,e),n.sort(Cc),n}intersectObjects(t,e=!0,n=[]){for(let i=0,r=t.length;i<r;i++)Eo(t[i],this,n,e);return n.sort(Cc),n}}function Cc(s,t){return s.distance-t.distance}function Eo(s,t,e,n){let i=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let a=0,o=r.length;a<o;a++)Eo(r[a],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Co}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Co);class Fs extends It{constructor(){const t=Fs.SkyShader,e=new me({name:t.name,uniforms:hn.clone(t.uniforms),vertexShader:t.vertexShader,fragmentShader:t.fragmentShader,side:Le,depthWrite:!1});super(new Te(1,1,1),e),this.isSky=!0}}Fs.SkyShader={name:"SkyShader",uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new A},up:{value:new A(0,1,0)}},vertexShader:`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;
		uniform vec3 up;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( dot( vSunDirection, up ) );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`,fragmentShader:`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		uniform float mieDirectionalG;
		uniform vec3 up;

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPosition );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
			L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

			vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

			vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

			gl_FragColor = vec4( retColor, 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};function Xh(s,t=!1){const e=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,l=new ue;let c=0;for(let h=0;h<s.length;++h){const u=s[h];let f=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in u.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(u.attributes[d]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in u.morphAttributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[d]===void 0&&(a[d]=[]),a[d].push(u.morphAttributes[d])}if(t){let d;if(e)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,h),c+=d}}if(e){let h=0;const u=[];for(let f=0;f<s.length;++f){const d=s[f].index;for(let g=0;g<d.count;++g)u.push(d.getX(g)+h);h+=s[f].attributes.position.count}l.setIndex(u)}for(const h in r){const u=Rc(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in a){const u=a[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let f=0;f<u;++f){const d=[];for(let v=0;v<a[h].length;++v)d.push(a[h][v][f]);const g=Rc(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function Rc(s){let t,e,n,i=-1,r=0;for(let c=0;c<s.length;++c){const h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}const a=new t(r),o=new ge(a,e,n);let l=0;for(let c=0;c<s.length;++c){const h=s[c];if(h.isInterleavedBufferAttribute){const u=l/e;for(let f=0,d=h.count;f<d;f++)for(let g=0;g<e;g++){const v=h.getComponent(f,g);o.setComponent(f+u,g,v)}}else a.set(h.array,l);l+=h.count*e}return i!==void 0&&(o.gpuType=i),o}function zs(s){let t=s>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function Ma(...s){let t=2166136261;for(const e of s){const n=String(e);for(let i=0;i<n.length;i++)t^=n.charCodeAt(i),t=Math.imul(t,16777619)}return t>>>0}class mi{constructor(t){this.perm=new Uint8Array(512),this.gx=new Float32Array(256),this.gy=new Float32Array(256);const e=zs(t),n=new Uint8Array(256);for(let i=0;i<256;i++)n[i]=i;for(let i=255;i>0;i--){const r=Math.floor(e()*(i+1)),a=n[i];n[i]=n[r],n[r]=a}for(let i=0;i<512;i++)this.perm[i]=n[i&255];for(let i=0;i<256;i++){const r=e()*Math.PI*2;this.gx[i]=Math.cos(r),this.gy[i]=Math.sin(r)}}noise(t,e){const n=Math.floor(t),i=Math.floor(e),r=t-n,a=e-i,o=n&255,l=i&255,c=this.perm,h=(M,x,R)=>this.gx[M]*x+this.gy[M]*R,u=h(c[o+c[l]],r,a),f=h(c[o+1+c[l]],r-1,a),d=h(c[o+c[l+1]],r,a-1),g=h(c[o+1+c[l+1]],r-1,a-1),v=r*r*r*(r*(r*6-15)+10),m=a*a*a*(a*(a*6-15)+10),p=u+v*(f-u),_=d+v*(g-d);return(p+m*(_-p))*1.414}fbm(t,e,n=4){let i=0,r=.5,a=1,o=0;for(let l=0;l<n;l++)i+=r*this.noise(t*a,e*a),o+=r,r*=.5,a*=2.03;return i/o}}const Fi=(s,t,e)=>{const n=Math.min(1,Math.max(0,(e-s)/(t-s)));return n*n*(3-2*n)},Ee=(s,t,e)=>s+(t-s)*e,Xn=(s,t,e)=>Math.min(e,Math.max(t,s)),Pc={tee:"Tee",fairway:"Fairway",firstCut:"First Cut",rough:"Rough",fringe:"Fringe",green:"Green",bunker:"Bunker",water:"Water",ob:"Out of Bounds"};function ze(s,t,e){const n=Math.cos(s.rot??0),i=Math.sin(s.rot??0),r=t-s.x,a=e-s.z,o=r*n+a*i,l=-r*i+a*n;return Math.sqrt(o/s.rx*(o/s.rx)+l/s.rz*(l/s.rz))}const ya=-1.2;class nv{constructor(t){this.samples=[],this.gridRes=1.25,this.waterLevel=ya,this.trees=[],this.greenBase=0,this.treeGrid=new Map,this.def=t,this.noise=new mi(t.seed),this.buildPath(),this.length=this.samples[this.samples.length-1].s;let e=1/0,n=-1/0,i=1/0,r=-1/0;for(const f of this.samples)e=Math.min(e,f.x),n=Math.max(n,f.x),i=Math.min(i,f.z),r=Math.max(r,f.z);const a=t.green;e=Math.min(e,a.x-a.rx-10),n=Math.max(n,a.x+a.rx+10),i=Math.min(i,a.z-a.rz-10);for(const f of t.water)e=Math.min(e,f.x-f.rx),n=Math.max(n,f.x+f.rx);this.play={minX:e-55,maxX:n+55,minZ:i-45,maxZ:r+35};const o=120;this.minX=Math.floor(e-o),this.maxX=Math.ceil(n+o),this.minZ=Math.floor(i-o),this.maxZ=Math.ceil(r+80),this.greenBase=this.rawBase(a.x,a.z)+.5,this.gw=Math.ceil((this.maxX-this.minX)/this.gridRes)+1,this.gh=Math.ceil((this.maxZ-this.minZ)/this.gridRes)+1;const l=this.gw*this.gh;this.heights=new Float32Array(l),this.pD=new Float32Array(l),this.pS=new Float32Array(l),this.pW=new Float32Array(l);for(let f=0;f<this.gh;f++){const d=this.minZ+f*this.gridRes;for(let g=0;g<this.gw;g++){const v=this.minX+g*this.gridRes,m=f*this.gw+g,p=this.pathInfo(v,d);this.pD[m]=p.d,this.pS[m]=p.s,this.pW[m]=p.w,this.heights[m]=this.exactHeight(v,d,p)}}const c=this.samples[0],h=this.samples[Math.min(6,this.samples.length-1)],u=Math.hypot(h.x-c.x,h.z-c.z)||1;this.tee={x:0,z:0,y:this.height(0,0),dirX:(h.x-c.x)/u,dirZ:(h.z-c.z)/u},this.pin={x:t.pin[0],z:t.pin[1],y:this.height(t.pin[0],t.pin[1])},this.placeTrees()}buildPath(){const t=this.def.path,e=this.def.widths;let n=0,i=null;for(let a=0;a<t.length-1;a++){const o=t[Math.max(0,a-1)],l=t[a],c=t[a+1],h=t[Math.min(t.length-1,a+2)],u=Math.hypot(c[0]-l[0],c[1]-l[1]),f=Math.max(2,Math.ceil(u/2));for(let d=0;d<f;d++){if(a>0&&d===0)continue;const g=d/f,v=g*g,m=v*g,p=(R,T,E,P)=>.5*(2*T+(-R+E)*g+(2*R-5*T+4*E-P)*v+(-R+3*T-3*E+P)*m),_=p(o[0],l[0],c[0],h[0]),M=p(o[1],l[1],c[1],h[1]);i&&(n+=Math.hypot(_-i[0],M-i[1])),i=[_,M];const x=Ee(e[a],e[a+1],g);this.samples.push({x:_,z:M,s:n,w:x})}}const r=t[t.length-1];i&&(n+=Math.hypot(r[0]-i[0],r[1]-i[1])),this.samples.push({x:r[0],z:r[1],s:n,w:e[e.length-1]})}pathInfo(t,e){let n=1/0,i=0,r=0;const a=this.samples;for(let o=0;o<a.length-1;o++){const l=a[o],c=a[o+1],h=c.x-l.x,u=c.z-l.z,f=h*h+u*u||1e-6;let d=((t-l.x)*h+(e-l.z)*u)/f;d=d<0?0:d>1?1:d;const g=l.x+h*d,v=l.z+u*d,m=(t-g)*(t-g)+(e-v)*(e-v);m<n&&(n=m,i=l.s+(c.s-l.s)*d,r=l.w+(c.w-l.w)*d)}return{d:Math.sqrt(n),s:i,w:r}}fastPath(t,e){const n=(t-this.minX)/this.gridRes,i=(e-this.minZ)/this.gridRes,r=Math.floor(n),a=Math.floor(i);if(!this.pD||r<0||a<0||r>=this.gw-1||a>=this.gh-1)return this.pathInfo(t,e);const o=n-r,l=i-a,c=this.gw,h=a*c+r,u=f=>(f[h]*(1-o)+f[h+1]*o)*(1-l)+(f[h+c]*(1-o)+f[h+c+1]*o)*l;return{d:u(this.pD),s:u(this.pS),w:u(this.pW)}}edgeWobble(t,e,n=.09){return this.noise.noise(t*.11+40,e*.11-17)*n}rawBase(t,e){const n=this.noise;return n.fbm(t*.006,e*.006,3)*7+n.fbm(t*.025+9,e*.025,3)*1.4}exactHeight(t,e,n){const i=this.def,r=n??this.pathInfo(t,e),a=Math.max(r.w,26)/2,o=this.rawBase(t,e),l=Fi(a+8,a+70,r.d);let c=o*Ee(.35,1,l)+l*(6+this.noise.fbm(t*.012,e*.012,3)*9);c+=Math.sin(r.s*.012+i.seed)*1.5;const h=Math.hypot(t,e);if(h<18){const d=this.rawBase(0,0)*.35+Math.sin(i.seed)*1.5+i.teeLift;c=Ee(d,c,Fi(6,18,h))}for(const d of i.water){const g=ze(d,t,e)+this.edgeWobble(t,e,.06);if(g<1.35){const v=ya-1.6;c=Ee(v,Math.min(c,ya+1.2+(g-1)*6),Fi(.75,1.35,g))}}const u=i.green,f=ze(u,t,e)+this.edgeWobble(t,e,.05);if(f<(i.greenBlend??1.9)){const d=this.greenBase+u.slope[0]*(t-u.x)+u.slope[1]*(e-u.z);c=Ee(d,c,Fi(1,i.greenBlend??1.9,f))}for(const d of i.bunkers){const g=ze(d,t,e)+this.edgeWobble(t,e);if(g<1.25){const v=.75*(1-Fi(.2,1,g)),m=.18*(1-Math.abs(g-1.08)/.17)*(g>.91?1:0);c+=-v+Math.max(0,m)}}return c}height(t,e){const n=(t-this.minX)/this.gridRes,i=(e-this.minZ)/this.gridRes,r=Math.floor(n),a=Math.floor(i);if(r<0||a<0||r>=this.gw-1||a>=this.gh-1)return this.exactHeight(t,e);const o=n-r,l=i-a,c=this.heights,h=this.gw,u=c[a*h+r],f=c[a*h+r+1],d=c[(a+1)*h+r],g=c[(a+1)*h+r+1];return(u*(1-o)+f*o)*(1-l)+(d*(1-o)+g*o)*l}normal(t,e,n){const r=this.height(t+.35,e)-this.height(t-.35,e),a=this.height(t,e+.35)-this.height(t,e-.35),o=-r,l=2*.35,c=-a,h=Math.hypot(o,l,c);return n.x=o/h,n.y=l/h,n.z=c/h,n}inBounds(t,e){const n=this.play;return t>n.minX&&t<n.maxX&&e>n.minZ&&e<n.maxZ}surfaceAt(t,e){const n=this.def;if(!this.inBounds(t,e))return"ob";const i=ze(n.green,t,e);if(i<1.6){const o=i+this.edgeWobble(t,e,.05);if(o<1)return"green";if(o<1+2.2/Math.min(n.green.rx,n.green.rz))return"fringe"}for(const o of n.bunkers){const l=ze(o,t,e);if(l<1.1&&l+this.edgeWobble(t,e)<.92)return"bunker"}for(const o of n.water){const l=ze(o,t,e);if(l<1.2&&l+this.edgeWobble(t,e,.06)<1&&this.height(t,e)<this.waterLevel+.05)return"water"}if(this.inTeeBox(t,e))return"tee";const r=this.fastPath(t,e);if(r.w<=0||r.d>r.w/2+8)return"rough";const a=this.noise.noise(t*.05,e*.05)*2.2;return r.s>n.fairwayStart&&r.d<r.w/2+a?"fairway":r.s>n.fairwayStart-6&&r.d<r.w/2+3.2+a?"firstCut":"rough"}inTeeBox(t,e){return Math.abs(t)<4&&e<4&&e>-8}pointAt(t){const e=this.samples;if(t<=0)return{x:e[0].x,z:e[0].z};for(let i=0;i<e.length-1;i++)if(e[i+1].s>=t){const r=(t-e[i].s)/(e[i+1].s-e[i].s||1);return{x:Ee(e[i].x,e[i+1].x,r),z:Ee(e[i].z,e[i+1].z,r)}}const n=e[e.length-1];return{x:n.x,z:n.z}}placeTrees(){const t=zs(this.def.seed*7919+3),e=2200;for(let n=0;n<e;n++){const i=Ee(this.minX+10,this.maxX-10,t()),r=Ee(this.minZ+10,this.maxZ-10,t()),a=this.fastPath(i,r),l=Math.max(a.w,24)/2+12;if(a.d<l||Math.hypot(i,r)<26)continue;const c=this.def.green;if(ze(c,i,r)<2.4)continue;let h=!1;for(const T of this.def.water)ze(T,i,r)<1.25&&(h=!0);for(const T of this.def.bunkers)ze(T,i,r)<1.6&&(h=!0);if(h)continue;const u=this.noise.noise(i*.035+100,r*.035)*.5+.5,d=.12+Fi(l,l+45,a.d)*.55+u*.35-.2;if(t()>d)continue;let g=!1;const v=this.cellKey(i,r);for(const T of this.treeGrid.get(v)??[])Math.hypot(T.x-i,T.z-r)<5.5&&(g=!0);if(g)continue;const m=t()<.55?0:1,p=m===0?Ee(11,22,t()):Ee(9,16,t()),_=m===0?p*.24:p*.36,M=this.height(i,r),x={x:i,z:r,y:M,height:p,canopyR:_,canopyY:M+(m===0?p*.5:p*.62),trunkR:m===0?.35:.45,kind:m,tint:t()};this.trees.push(x);const R=this.treeGrid.get(v);R?R.push(x):this.treeGrid.set(v,[x])}}cellKey(t,e){return`${Math.floor(t/20)},${Math.floor(e/20)}`}treesNear(t,e){const n=Math.floor(t/20),i=Math.floor(e/20),r=[];for(let a=-1;a<=1;a++)for(let o=-1;o<=1;o++){const l=this.treeGrid.get(`${n+a},${i+o}`);l&&r.push(...l)}return r}distToPin(t,e){return Math.hypot(this.pin.x-t,this.pin.z-e)}static clamp01(t){return Xn(t,0,1)}}const iv=44,sv=28,Hi=new A().setFromSphericalCoords(1,Ml.degToRad(90-iv),Ml.degToRad(sv)),Ve=s=>{const t=new dt(s);return[t.r*255,t.g*255,t.b*255]},Ie={rough:Ve("#54833a"),roughDark:Ve("#44712f"),firstCut:Ve("#66994a"),fairway:Ve("#79ad4f"),fairwayAlt:Ve("#6c9f45"),fringe:Ve("#7fb556"),green:Ve("#86bf58"),greenAlt:Ve("#80b953"),tee:Ve("#78ad50"),sand:Ve("#e8d7a8"),sandDark:Ve("#cdb67e"),shore:Ve("#5b6a3c"),bed:Ve("#2d4532")};function rv(s,t=2048){const e=s.maxX-s.minX,n=s.maxZ-s.minZ,i=t/Math.max(e,n),r=Math.round(e*i),a=Math.round(n*i),o=document.createElement("canvas");o.width=r,o.height=a;const l=o.getContext("2d"),c=l.createImageData(r,a),h=c.data,u=document.createElement("canvas");u.width=r,u.height=a;const f=u.getContext("2d"),d=f.createImageData(r,a),g=d.data,v=new mi(s.def.seed+999),m=s.def,p=Math.cos(m.green.rot??0),_=Math.sin(m.green.rot??0),M=9;for(let P=0;P<a;P++){const y=s.minZ+(P+.5)/i;for(let S=0;S<r;S++){const L=s.minX+(S+.5)/i,D=s.surfaceAt(L,y),U=v.noise(L*.02,y*.02),k=v.noise(L*.9,y*.9);let B,G=1+U*.07+k*.035;switch(D){case"fairway":case"tee":{const z=s.fastPath(L,y),V=Math.floor(z.s/M)%2===0;B=D==="tee"?Ie.tee:V?Ie.fairway:Ie.fairwayAlt;const Q=z.w>0?Math.min(1,Math.max(0,(z.d-z.w/2+3)/3)):0;G*=1-Q*.08;break}case"firstCut":{B=Ie.firstCut;const z=s.fastPath(L,y),V=z.w>0?Math.min(1,Math.max(0,(z.d-z.w/2)/3.2)):0;G*=1-V*V*.16;break}case"green":{const z=L-m.green.x,V=y-m.green.z,Q=z*p+V*_,st=-z*_+V*p;B=(Math.floor(Q/3.2)+Math.floor(st/3.2))%2===0?Ie.green:Ie.greenAlt,G=1+k*.015+U*.03;break}case"fringe":{const z=ze(m.green,L,y);B=Math.floor(z*Math.min(m.green.rx,m.green.rz)/.9)%2===0?Ie.fringe:vr(Ie.fringe,Ie.firstCut,.45),G=1+k*.02+U*.03;break}case"bunker":{let z=9;for(const Q of m.bunkers)z=Math.min(z,ze(Q,L,y));const V=Math.min(1,Math.max(0,(z-.62)/.3));B=vr(Ie.sand,Ie.sandDark,V*.8),G=1+k*.06+v.noise(L*3,y*3)*.04;break}case"water":{let z=9;for(const V of m.water)z=Math.min(z,ze(V,L,y));B=vr(Ie.bed,Ie.shore,Math.min(1,Math.max(0,(z-.8)/.2)));break}default:{const z=s.fastPath(L,y),V=Math.min(1,Math.max(0,(z.d-z.w/2-20)/50));B=vr(Ie.rough,Ie.roughDark,V*.7+(U*.5+.5)*.3),G=1+U*.1+k*.06}}const Y=(P*r+S)*4;g[Y]=D==="fairway"||D==="tee"||D==="fringe"?255:D==="firstCut"?120:0,g[Y+1]=D==="green"?255:D==="fringe"?90:0,g[Y+2]=D==="bunker"?255:0,g[Y+3]=255,h[Y]=Math.min(255,B[0]*G),h[Y+1]=Math.min(255,B[1]*G),h[Y+2]=Math.min(255,B[2]*G),h[Y+3]=255}}l.putImageData(c,0,0),f.putImageData(d,0,0);{const P=s.def.seed%2?1:-1,y=s.samples,S=[];for(let L=4;L<y.length-6;L+=2){const D=y[L],U=y[Math.min(y.length-1,L+2)],k=U.x-D.x,B=U.z-D.z,G=Math.hypot(k,B)||1,Y=Math.max(D.w,24)/2+15+Math.sin(D.s*.02)*3,z=D.x+-B/G*Y*P,V=D.z+k/G*Y*P,Q=s.surfaceAt(z,V);if(Q==="water"||Q==="bunker"||Q==="green"){S.push([NaN,NaN]);continue}S.push([(z-s.minX)*i,(V-s.minZ)*i])}l.save(),l.lineCap="round",l.lineJoin="round";for(const[L,D]of[[3.2,"rgba(70,70,55,0.55)"],[2.6,"#cbc3ad"]]){l.strokeStyle=D,l.lineWidth=L*i,l.beginPath();let U=!1;for(const[k,B]of S){if(Number.isNaN(k)){U=!1;continue}U?l.lineTo(k,B):(l.moveTo(k,B),U=!0)}l.stroke()}l.restore()}const x=-Hi.x/Hi.y,R=-Hi.z/Hi.y;l.save();for(const P of s.trees){const y=P.canopyY-P.y,S=(P.x+x*y*.85-s.minX)*i,L=(P.z+R*y*.85-s.minZ)*i,D=P.canopyR*i*1.15;l.setTransform(1,0,0,1,S,L),l.rotate(Math.atan2(R,x)),l.scale(1.35,.9);const U=l.createRadialGradient(0,0,0,0,0,D);U.addColorStop(0,"rgba(10,25,5,0.42)"),U.addColorStop(.6,"rgba(10,25,5,0.28)"),U.addColorStop(1,"rgba(10,25,5,0)"),l.fillStyle=U,l.beginPath(),l.arc(0,0,D,0,Math.PI*2),l.fill(),l.setTransform(1,0,0,1,(P.x-s.minX)*i,(P.z-s.minZ)*i);const k=l.createRadialGradient(0,0,0,0,0,i*1.6);k.addColorStop(0,"rgba(5,15,0,0.5)"),k.addColorStop(1,"rgba(5,15,0,0)"),l.fillStyle=k,l.beginPath(),l.arc(0,0,i*1.6,0,Math.PI*2),l.fill()}l.restore();const T=new Ye(o);T.colorSpace=se,T.anisotropy=8,T.wrapS=T.wrapT=Tn,T.generateMipmaps=!0,T.minFilter=En;const E=new Ye(u);return E.wrapS=E.wrapT=Tn,{map:T,mask:E}}function vr(s,t,e){return[s[0]+(t[0]-s[0])*e,s[1]+(t[1]-s[1])*e,s[2]+(t[2]-s[2])*e]}function av(){const t=document.createElement("canvas");t.width=t.height=256;const e=t.getContext("2d"),n=e.createImageData(256,256),i=new mi(7);for(let a=0;a<256;a++)for(let o=0;o<256;o++){const l=o/256*Math.PI*2,c=a/256*Math.PI*2,u=128+(i.noise(Math.cos(l)*6+20,Math.sin(l)*6+Math.cos(c)*6)*.5+i.noise(Math.cos(l)*24+5,Math.sin(c)*24+Math.sin(l)*3)*.35+(Math.random()-.5)*.25)*90,f=(a*256+o)*4;n.data[f]=n.data[f+1]=n.data[f+2]=Math.max(0,Math.min(255,u)),n.data[f+3]=255}e.putImageData(n,0,0);const r=new Ye(t);return r.wrapS=r.wrapT=ln,r.anisotropy=8,r}function ov(){const t=document.createElement("canvas");t.width=t.height=256;const e=t.getContext("2d"),n=e.createImageData(256,256),i=new mi(42),r=(o,l)=>{const c=o/256*Math.PI*2,h=l/256*Math.PI*2;return i.noise(Math.cos(c)*3+Math.cos(h)*2,Math.sin(c)*3+Math.sin(h)*2)+.5*i.noise(Math.cos(c)*7+9,Math.sin(h)*7+Math.sin(c))};for(let o=0;o<256;o++)for(let l=0;l<256;l++){const c=r(l+1,o)-r(l-1,o),h=r(l,o+1)-r(l,o-1),u=new A(-c*6,-h*6,1).normalize(),f=(o*256+l)*4;n.data[f]=(u.x*.5+.5)*255,n.data[f+1]=(u.y*.5+.5)*255,n.data[f+2]=(u.z*.5+.5)*255,n.data[f+3]=255}e.putImageData(n,0,0);const a=new Ye(t);return a.wrapS=a.wrapT=ln,a}function lv(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d");e.fillStyle="rgb(128,128,255)",e.fillRect(0,0,128,128);const n=12;for(let r=0;r<128+n;r+=n)for(let a=r/n%2?n/2:0;a<128+n;a+=n){const o=e.createRadialGradient(a,r,0,a,r,n*.45);o.addColorStop(0,"rgb(128,128,235)"),o.addColorStop(.7,"rgb(150,150,245)"),o.addColorStop(1,"rgb(128,128,255)"),e.fillStyle=o,e.beginPath(),e.arc(a,r,n*.45,0,Math.PI*2),e.fill()}const i=new Ye(t);return i.wrapS=i.wrapT=ln,i.repeat.set(3,2),i}function $h(){const t=document.createElement("canvas");t.width=t.height=64;const e=t.getContext("2d"),n=e.createRadialGradient(64/2,64/2,0,64/2,64/2,64/2);return n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.4,"rgba(255,255,255,0.6)"),n.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=n,e.fillRect(0,0,64,64),new Ye(t)}function cv(){const s=document.createElement("canvas");s.width=64,s.height=256;const t=s.getContext("2d");t.fillStyle="#5a4330",t.fillRect(0,0,64,256);for(let n=0;n<60;n++){t.strokeStyle=`rgba(30,20,10,${.2+Math.random()*.4})`,t.lineWidth=1+Math.random()*2;const i=Math.random()*64;t.beginPath(),t.moveTo(i,0),t.bezierCurveTo(i+4,80,i-4,160,i+2,256),t.stroke()}const e=new Ye(s);return e.colorSpace=se,e.wrapS=e.wrapT=ln,e}const hv="/golf/";let ms=null;function el(){if(ms)return ms;const s=new ji,t=[],e=(n,i=!0)=>{let r=()=>{};t.push(new Promise(o=>r=o));const a=s.load(`${hv}tex/${n}.jpg`,()=>r(),void 0,()=>r());return a.colorSpace=se,i&&(a.wrapS=a.wrapT=ln),a.anisotropy=8,a};return ms={fairway:e("fairway"),rough:e("rough"),green:e("green"),sand:e("sand"),leaves:e("leaves"),pine:e("pine"),sky:e("sky",!1),avg:{fairway:"0.0677, 0.1804, 0.0099",rough:"0.0809, 0.1588, 0.0165",green:"0.1078, 0.3666, 0.0081",sand:"0.7953, 0.6274, 0.4374",leaves:"0.0691, 0.1425, 0.0150",pine:"0.0284, 0.0584, 0.0295"},ready:Promise.resolve()},ms.ready=Promise.all(t).then(()=>{}),ms}const uv="/golf/",Oi={file:"tex/trees.webp",cells:5,cellAspect:2/3,conifers:[0,1,2],broadleaf:[3,4],fill:[.995,.995,.995,.648,.685]};let Lc=null;function dv(s){Lc??(Lc=(()=>{const l=new ji().load(`${uv}${Oi.file}`);return l.colorSpace=se,l.anisotropy=4,l.generateMipmaps=!0,l.minFilter=En,l})());const t=new Qe(1,1);t.translate(0,.5,0);const e=s.trees,n=new Float32Array(e.length),i=new Float32Array(e.length),r=new me({uniforms:hn.merge([ct.fog,{map:{value:Lc},tint:{value:new dt(.86,.88,.84)}}]),vertexShader:`
      attribute float aSpecies;
      attribute float aShade;
      varying vec2 vUv;
      varying float vShade;
      #include <fog_pars_vertex>
      void main() {
        vec4 base = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float sx = length(instanceMatrix[0].xyz);
        float sy = length(instanceMatrix[1].xyz);
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 camUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 fwd = -vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
        float down = smoothstep(0.55, 0.95, -fwd.y);
        vec3 up = normalize(mix(vec3(0.0, 1.0, 0.0), camUp, down));
        vec3 wp = base.xyz + right * position.x * sx + up * position.y * sy;
        vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vUv = vec2((uv.x + aSpecies) / ${Oi.cells.toFixed(1)}, uv.y);
        vShade = aShade;
        #include <fog_vertex>
      }`,fragmentShader:`
      uniform sampler2D map;
      uniform vec3 tint;
      varying vec2 vUv;
      varying float vShade;
      #include <fog_pars_fragment>
      void main() {
        vec4 c = texture2D(map, vUv);
        if (c.a < 0.42) discard;
        // Darken toward the base for contact occlusion.
        float ao = mix(0.62, 1.0, smoothstep(0.0, 0.35, fract(vUv.y)));
        gl_FragColor = vec4(c.rgb * tint * vShade * ao, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,fog:!0,transparent:!1,alphaToCoverage:!0}),a=new qn(t,r,e.length),o=new Vt;return e.forEach((l,c)=>{const h=l.kind===0?Oi.conifers:Oi.broadleaf;n[c]=h[Math.floor(l.tint*997)%h.length],i[c]=.85+l.tint*.25;const u=l.height*(l.kind===0?1.1:1.25)/Oi.fill[n[c]];o.makeScale(u*Oi.cellAspect,u,1),o.setPosition(l.x,l.y-.25,l.z),a.setMatrixAt(c,o)}),t.setAttribute("aSpecies",new fn(n,1)),t.setAttribute("aShade",new fn(i,1)),a.instanceMatrix.needsUpdate=!0,a.frustumCulled=!1,a.name="treeSprites",{mesh:a,dispose(){t.dispose(),r.dispose()}}}class fv extends It{constructor(t,e={}){super(t),this.isWater=!0;const n=this,i=e.textureWidth!==void 0?e.textureWidth:512,r=e.textureHeight!==void 0?e.textureHeight:512,a=e.clipBias!==void 0?e.clipBias:0,o=e.alpha!==void 0?e.alpha:1,l=e.time!==void 0?e.time:0,c=e.waterNormals!==void 0?e.waterNormals:null,h=e.sunDirection!==void 0?e.sunDirection:new A(.70707,.70707,0),u=new dt(e.sunColor!==void 0?e.sunColor:16777215),f=new dt(e.waterColor!==void 0?e.waterColor:8355711),d=e.eye!==void 0?e.eye:new A(0,0,0),g=e.distortionScale!==void 0?e.distortionScale:20,v=e.side!==void 0?e.side:Dn,m=e.fog!==void 0?e.fog:!1,p=new Vn,_=new A,M=new A,x=new A,R=new Vt,T=new A(0,0,-1),E=new le,P=new A,y=new A,S=new le,L=new Vt,D=new Xe,U=new Je(i,r),k={name:"MirrorShader",uniforms:hn.merge([ct.fog,ct.lights,{normalSampler:{value:null},mirrorSampler:{value:null},alpha:{value:1},time:{value:0},size:{value:1},distortionScale:{value:20},textureMatrix:{value:new Vt},sunColor:{value:new dt(8355711)},sunDirection:{value:new A(.70707,.70707,0)},eye:{value:new A},waterColor:{value:new dt(5592405)}}]),vertexShader:`
				uniform mat4 textureMatrix;
				uniform float time;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}`,fragmentShader:`
				uniform sampler2D mirrorSampler;
				uniform float alpha;
				uniform float time;
				uniform float size;
				uniform float distortionScale;
				uniform sampler2D normalSampler;
				uniform vec3 sunColor;
				uniform vec3 sunDirection;
				uniform vec3 eye;
				uniform vec3 waterColor;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				vec4 getNoise( vec2 uv ) {
					vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
					vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise * 0.5 - 1.0;
				}

				void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
					vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
					float direction = max( 0.0, dot( eyeDirection, reflection ) );
					specularColor += pow( direction, shiny ) * sunColor * spec;
					diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
				}

				#include <common>
				#include <packing>
				#include <bsdfs>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <lights_pars_begin>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>

				void main() {

					#include <logdepthbuf_fragment>
					vec4 noise = getNoise( worldPosition.xz * size );
					vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

					vec3 diffuseLight = vec3(0.0);
					vec3 specularLight = vec3(0.0);

					vec3 worldToEye = eye-worldPosition.xyz;
					vec3 eyeDirection = normalize( worldToEye );
					sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

					float distance = length(worldToEye);

					vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
					vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

					float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
					float rf0 = 0.3;
					float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
					vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
					vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
					vec3 outgoingLight = albedo;
					gl_FragColor = vec4( outgoingLight, alpha );

					#include <tonemapping_fragment>
					#include <colorspace_fragment>
					#include <fog_fragment>	
				}`},B=new me({name:k.name,uniforms:hn.clone(k.uniforms),vertexShader:k.vertexShader,fragmentShader:k.fragmentShader,lights:!0,side:v,fog:m});B.uniforms.mirrorSampler.value=U.texture,B.uniforms.textureMatrix.value=L,B.uniforms.alpha.value=o,B.uniforms.time.value=l,B.uniforms.normalSampler.value=c,B.uniforms.sunColor.value=u,B.uniforms.waterColor.value=f,B.uniforms.sunDirection.value=h,B.uniforms.distortionScale.value=g,B.uniforms.eye.value=d,n.material=B,n.onBeforeRender=function(G,Y,z){if(M.setFromMatrixPosition(n.matrixWorld),x.setFromMatrixPosition(z.matrixWorld),R.extractRotation(n.matrixWorld),_.set(0,0,1),_.applyMatrix4(R),P.subVectors(M,x),P.dot(_)>0)return;P.reflect(_).negate(),P.add(M),R.extractRotation(z.matrixWorld),T.set(0,0,-1),T.applyMatrix4(R),T.add(x),y.subVectors(M,T),y.reflect(_).negate(),y.add(M),D.position.copy(P),D.up.set(0,1,0),D.up.applyMatrix4(R),D.up.reflect(_),D.lookAt(y),D.far=z.far,D.updateMatrixWorld(),D.projectionMatrix.copy(z.projectionMatrix),L.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),L.multiply(D.projectionMatrix),L.multiply(D.matrixWorldInverse),p.setFromNormalAndCoplanarPoint(_,M),p.applyMatrix4(D.matrixWorldInverse),E.set(p.normal.x,p.normal.y,p.normal.z,p.constant);const V=D.projectionMatrix;S.x=(Math.sign(E.x)+V.elements[8])/V.elements[0],S.y=(Math.sign(E.y)+V.elements[9])/V.elements[5],S.z=-1,S.w=(1+V.elements[10])/V.elements[14],E.multiplyScalar(2/E.dot(S)),V.elements[2]=E.x,V.elements[6]=E.y,V.elements[10]=E.z+1-a,V.elements[14]=E.w,d.setFromMatrixPosition(z.matrixWorld);const Q=G.getRenderTarget(),st=G.xr.enabled,rt=G.shadowMap.autoUpdate;n.visible=!1,G.xr.enabled=!1,G.shadowMap.autoUpdate=!1,G.setRenderTarget(U),G.state.buffers.depth.setMask(!0),G.autoClear===!1&&G.clear(),G.render(Y,D),n.visible=!0,G.xr.enabled=st,G.shadowMap.autoUpdate=rt,G.setRenderTarget(Q);const Lt=z.viewport;Lt!==void 0&&G.state.viewport(Lt)}}}let Sa=null,Dc=null,pv=null;function mv(s,t){const e=new xe;e.name="course";const n=V=>Math.round((V-s.minX)/s.gridRes),i=V=>Math.round((V-s.minZ)/s.gridRes),r=s.play,a=Ic(s,Math.max(0,n(r.minX)),Math.min(s.gw-1,n(r.maxX)),Math.max(0,i(r.minZ)),Math.min(s.gh-1,i(r.maxZ)),1,0),o=Ic(s,0,s.gw-1,0,s.gh-1,4,-.35),l={value:0},{map:c,mask:h}=rv(s,t.lowSpec?1536:2048);c.flipY=!0,h.flipY=!0,Sa??(Sa=av());const u=el(),f=new pe({map:c,roughness:.92,metalness:0});f.onBeforeCompile=V=>{Object.assign(V.uniforms,{detailMap:{value:Sa},maskMap:{value:h},tFair:{value:u.fairway},tRough:{value:u.rough},tGreen:{value:u.green},tSand:{value:u.sand},uTime:l}),V.vertexShader=V.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vWPos;`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
vWPos = (modelMatrix * vec4(transformed,1.0)).xyz;`),V.fragmentShader=V.fragmentShader.replace("#include <common>",`#include <common>
        uniform sampler2D detailMap, maskMap, tFair, tRough, tGreen, tSand;
        uniform float uTime;
        varying vec3 vWPos;
        vec3 detailOf(vec3 t, vec3 avg) {
          float l = dot(t, vec3(0.2126, 0.7152, 0.0722)) / dot(avg, vec3(0.2126, 0.7152, 0.0722));
          return clamp(mix(vec3(l), t / max(avg, vec3(0.02)), 0.3), 0.0, 2.2);
        }`).replace("#include <map_fragment>",`#include <map_fragment>
        vec3 m = texture2D(maskMap, vMapUv).rgb;
        vec2 w = vWPos.xz;
        float rough = clamp(1.0 - m.r - m.g - m.b, 0.0, 1.0);
        vec3 dF = detailOf(texture2D(tFair, w / 8.0).rgb * 0.6 + texture2D(tFair, w / 29.0).rgb * 0.4, vec3(${u.avg.fairway}));
        vec3 dR = detailOf(texture2D(tRough, w / 6.0).rgb * 0.6 + texture2D(tRough, w / 23.0).rgb * 0.4, vec3(${u.avg.rough}));
        vec3 dG = detailOf(texture2D(tGreen, w / 6.0).rgb, vec3(${u.avg.green}));
        vec3 dS = detailOf(texture2D(tSand, w / 4.0).rgb, vec3(${u.avg.sand}));
        vec3 detail = (dF * m.r + dG * m.g + dS * m.b + dR * rough) / max(0.001, m.r + m.g + m.b + rough);
        // Break up tiling at distance with a large-scale noise.
        float dB = texture2D(detailMap, w * 0.02).r;
        diffuseColor.rgb *= mix(vec3(1.0), detail, 0.9) * mix(0.9, 1.1, dB);
        // Drifting cloud shadows.
        float cs = texture2D(detailMap, w * 0.0035 + vec2(uTime * 0.0028, uTime * 0.0011)).r;
        diffuseColor.rgb *= mix(0.74, 1.0, smoothstep(0.38, 0.62, cs));`)};const d=new It(a,f);d.receiveShadow=!0,d.name="terrain",e.add(d);const g=new It(o,f);g.receiveShadow=!0,g.name="terrainOuter",e.add(g);const v=new fi(300,2600,64,6);v.rotateX(-Math.PI/2);const m=v.attributes.position,p=new mi(s.def.seed+5),_=(s.minX+s.maxX)/2,M=(s.minZ+s.maxZ)/2;for(let V=0;V<m.count;V++){const Q=m.getX(V),st=m.getZ(V),rt=Math.hypot(Q,st),Lt=Math.max(0,p.fbm(Q*.002,st*.002,4)+.3)*Math.min(1,(rt-300)/700)*160;m.setY(V,4+Lt)}v.translate(_,0,M),v.computeVertexNormals();const x=new It(v,new pe({color:3498026,roughness:1}));x.name="far",e.add(x),pv??(pv=cv());const R=gv(),T=vv(),E=(V,Q)=>{const st=new pe({vertexColors:!0,roughness:.85,metalness:0});return st.onBeforeCompile=rt=>{rt.uniforms.uTime={value:0},rt.uniforms.leafMap={value:V},st.userData.shader=rt,rt.vertexShader=rt.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;
varying vec3 vTP; varying vec3 vTN;`).replace("#include <begin_vertex>",`#include <begin_vertex>
          float sway = position.y * position.y * 0.0009;
          vec4 ip = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
          transformed.x += sin(uTime * 1.3 + ip.x * 0.1 + ip.z * 0.07) * sway;
          transformed.z += cos(uTime * 1.1 + ip.z * 0.1) * sway * 0.6;
          vTP = position * 0.55 + ip.xyz * 0.13;
          vTN = normal;`),rt.fragmentShader=rt.fragmentShader.replace("#include <common>",`#include <common>
uniform sampler2D leafMap;
varying vec3 vTP; varying vec3 vTN;`).replace("#include <color_fragment>",`#include <color_fragment>
          vec3 bw = pow(abs(normalize(vTN)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z);
          vec3 lt = texture2D(leafMap, vTP.yz).rgb * bw.x + texture2D(leafMap, vTP.xz).rgb * bw.y + texture2D(leafMap, vTP.xy).rgb * bw.z;
          float isLeaf = step(diffuseColor.r * 1.15, diffuseColor.g);
          vec3 avgL = vec3(${Q});
          float l = dot(lt, vec3(0.2126,0.7152,0.0722)) / dot(avgL, vec3(0.2126,0.7152,0.0722));
          diffuseColor.rgb *= mix(vec3(1.0), clamp(mix(vec3(l), lt / max(avgL, vec3(0.02)), 0.2), 0.35, 1.5), isLeaf * 0.85);`)},st},P=E(u.pine,u.avg.pine),y=E(u.leaves,u.avg.leaves),S=[P,y],L=s.trees.filter(V=>V.kind===0),D=s.trees.filter(V=>V.kind===1),U=new Vt,k=new Un,B=new dt,G=(V,Q,st,rt)=>{const Lt=new qn(V,rt,Q.length);return Q.forEach(($,tt)=>{const lt=$.height/st;k.setFromAxisAngle(new A(0,1,0),$.tint*6.28),U.compose(new A($.x,$.y-.3,$.z),k,new A(lt*(.9+$.tint*.2),lt,lt*(.9+$.tint*.2))),Lt.setMatrixAt(tt,U),B.setHSL(0+($.tint-.5)*.04,0,0);const et=.82+$.tint*.3;B.setRGB(et*(.95+$.tint*.1),et,et*(.9+(1-$.tint)*.1)),Lt.setColorAt(tt,B)}),Lt.castShadow=!1,Lt.receiveShadow=!1,Lt.instanceMatrix.needsUpdate=!0,Lt.computeBoundingSphere(),Lt};let Y=null;t.lowSpec&&new URL(location.href).searchParams.get("q")==="low"?(L.length&&e.add(G(R,L,16,P)),D.length&&e.add(G(T,D,12,y))):(Y=dv(s),e.add(Y.mesh)),Dc??(Dc=ov());const z=[];for(const V of s.def.water){const Q=Math.max(V.rx,V.rz)*1.5,st=new ui(Q,48);st.rotateX(-Math.PI/2);const rt=Dc.clone();if(rt.needsUpdate=!0,rt.wrapS=rt.wrapT=ln,t.reflect){const tt=new fv(st,{textureWidth:512,textureHeight:512,waterNormals:rt,sunDirection:Hi.clone(),sunColor:16774108,waterColor:997960,distortionScale:2.2,fog:!0});tt.position.set(V.x,s.waterLevel,V.z),tt.renderOrder=2,tt.material.uniforms.size.value=6,e.add(tt),z.push(tt);continue}rt.repeat.set(Q/6,Q/6);const Lt=new pe({color:1394778,roughness:.12,metalness:0,normalMap:rt,normalScale:new it(.45,.45),transparent:!0,opacity:.94,envMapIntensity:.55}),$=new It(st,Lt);$.position.set(V.x,s.waterLevel,V.z),$.receiveShadow=!0,$.renderOrder=2,e.add($),z.push($)}return{group:e,water:z,update(V){l.value=V;for(const Q of S){const st=Q.userData.shader;st&&(st.uniforms.uTime.value=V)}for(const Q of z){const st=Q.material;st.uniforms?.time&&(st.uniforms.time.value=V*.6);const rt=Q.material;rt.normalMap&&rt.normalMap.offset.set(V*.01,V*.006)}},dispose(){e.traverse(V=>{const Q=V;Q.geometry&&Q.geometry.dispose();const st=Q.material;if(Array.isArray(st))st.forEach(rt=>rt.dispose());else if(st){const rt=st;rt.map&&rt.map!==Sa&&rt.map.dispose(),st.dispose()}})}}}function Ic(s,t,e,n,i,r,a){const o=Math.floor((e-t)/r)+1,l=Math.floor((i-n)/r)+1,c=new Float32Array(o*l*3),h=new Float32Array(o*l*2);for(let g=0;g<l;g++)for(let v=0;v<o;v++){const m=Math.min(e,t+v*r),p=Math.min(i,n+g*r),_=g*o+v,M=s.minX+m*s.gridRes,x=s.minZ+p*s.gridRes;c[_*3]=M,c[_*3+1]=s.heights[p*s.gw+m]+a,c[_*3+2]=x,h[_*2]=(M-s.minX)/(s.maxX-s.minX),h[_*2+1]=1-(x-s.minZ)/(s.maxZ-s.minZ)}const u=new Uint32Array((o-1)*(l-1)*6);let f=0;for(let g=0;g<l-1;g++)for(let v=0;v<o-1;v++){const m=g*o+v,p=m+1,_=m+o,M=_+1;u[f++]=m,u[f++]=_,u[f++]=p,u[f++]=p,u[f++]=_,u[f++]=M}const d=new ue;return d.setAttribute("position",new ge(c,3)),d.setAttribute("uv",new ge(h,2)),d.setIndex(new ge(u,1)),d.computeVertexNormals(),d}function Dr(s,t,e=.06,n=1){const i=s.attributes.position.count,r=new Float32Array(i*3),a=new mi(n),o=s.attributes.position;for(let l=0;l<i;l++){const c=a.noise(o.getX(l)*1.3,o.getY(l)*1.3+o.getZ(l))*e,h=.85+Math.min(.25,Math.max(0,o.getY(l)*.012));r[l*3]=t.r*(1+c)*h,r[l*3+1]=t.g*(1+c)*h,r[l*3+2]=t.b*(1+c)*h}return s.setAttribute("color",new ge(r,3)),s}function qh(s,t,e){const n=new mi(e),i=s.attributes.position;for(let r=0;r<i.count;r++){const a=i.getX(r),o=i.getY(r),l=i.getZ(r),c=1+n.noise(a*.7+o*.3,l*.7-o*.2)*t;i.setXYZ(r,a*c,o+n.noise(a,l)*t*.6,l*c)}return s.computeVertexNormals(),s}function Ir(s){const t=s.index?s.toNonIndexed():s;return t.deleteAttribute("uv"),t}function gv(){const s=[],t=new Ln(.22,.38,6,7);return t.translate(0,3,0),s.push(Dr(Ir(t),new dt("#4a3526"),.1,2)),[{y:3.5,r:3.6,h:5.5},{y:6.2,r:3,h:5},{y:8.8,r:2.3,h:4.4},{y:11.2,r:1.5,h:4}].forEach((n,i)=>{const r=new Zo(n.r,n.h,8,1,!1);r.translate(0,n.y+n.h/2,0),qh(r,.12,10+i),s.push(Dr(Ir(r),new dt(i%2?"#24502a":"#1f4825"),.12,20+i))}),Xh(s)}function vv(){const s=[],t=new Ln(.28,.48,6,7);return t.translate(0,3,0),s.push(Dr(Ir(t),new dt("#4f3a28"),.1,3)),[[0,7.6,0,3.4],[1.9,6.6,.8,2.5],[-1.8,6.8,-.6,2.6],[.4,6.4,-2,2.4],[-.5,6.5,2,2.3],[.3,9.4,.2,2.3]].forEach((n,i)=>{const r=new jo(n[3],1);r.translate(n[0],n[1],n[2]),qh(r,.16,40+i),s.push(Dr(Ir(r),new dt(i%2?"#3c6e2a":"#33642a"),.16,50+i))}),Xh(s)}class xv{constructor(){this.group=new xe,this.flagShader=null,this.flag=new xe,this.course=null,this.brand=null,this.flagTex=wa(512,340),this.boardTex=wa(1024,256),this.signTex=wa(512,640),this.flagMat=new pe({map:this.flagTex,side:be,roughness:.7}),this.flagMat.onBeforeCompile=a=>{a.uniforms.uTime={value:0},this.flagShader=a,a.vertexShader=a.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;`).replace("#include <begin_vertex>",`#include <begin_vertex>
          float k = clamp(position.x / 0.75 + 0.5, 0.0, 1.0);
          transformed.z += sin(uTime * 7.0 - k * 6.0) * 0.09 * k;
          transformed.y += sin(uTime * 5.0 - k * 4.0) * 0.025 * k;`).replace("#include <beginnormal_vertex>",`#include <beginnormal_vertex>
          float kk = clamp(position.x / 0.75 + 0.5, 0.0, 1.0);
          objectNormal = normalize(vec3(-cos(uTime * 7.0 - kk * 6.0) * 0.5 * kk, 0.0, 1.0));`)},this.poleMat=new pe({color:16777215,roughness:.35,metalness:.1}),this.markerMat=new pe({color:16777215,roughness:.3,metalness:.05}),this.boardMat=new pe({map:this.boardTex,roughness:.55}),this.signMat=new pe({map:this.signTex,roughness:.5}),this.boardFrameMat=new pe({color:2236962,roughness:.6});const t=1.6,e=new It(new Ln(.012*t,.012*t,2.3*t,8),this.poleMat);e.position.y=1.15*t,e.castShadow=!0;const n=new It(new Qe(.75,.5,16,6),this.flagMat);n.scale.setScalar(t),n.position.set(.375*t,2.3*t-.25*t,0),n.castShadow=!0;const i=new It(new ui(.054,24),new qe({color:724744,polygonOffset:!0,polygonOffsetFactor:-4}));i.rotation.x=-Math.PI/2,i.position.y=.012;const r=new It(new fi(.046,.056,24),new qe({color:16053492,polygonOffset:!0,polygonOffsetFactor:-4}));r.rotation.x=-Math.PI/2,r.position.y=.013,this.flag.add(e,n,i,r),this.pinGlow=new It(new fi(.9,1.1,48),new qe({color:16777215,transparent:!0,opacity:.5,depthWrite:!1})),this.pinGlow.rotation.x=-Math.PI/2,this.pinGlow.position.y=.04,this.flag.add(this.pinGlow),this.group.add(this.flag)}placeFor(t){this.course=t;for(const x of[...this.group.children])x!==this.flag&&this.group.remove(x);this.flag.position.set(t.pin.x,t.pin.y,t.pin.z),this.flag.rotation.y=.6;const{dirX:e,dirZ:n}=t.tee,i=-n,r=e,a=t.tee.y;for(const x of[-1,1]){const R=new It(new Os(.12,20,14),this.markerMat);R.position.set(i*x*3.4+e*2.6,a+.08,r*x*3.4+n*2.6),R.scale.y=.8,R.castShadow=!0,this.group.add(R)}const o=new It(new Ln(.012,.004,.06,8),new pe({color:16777215,roughness:.4}));o.position.set(0,a+.01,0),o.name="peg",this.group.add(o);const l={100:14170670,150:16777215,200:3039192};for(const x of[100,150,200]){const R=t.length-x;if(R<t.def.fairwayStart+10)continue;const T=t.pointAt(R),E=t.pointAt(R+2),P=E.x-T.x,y=E.z-T.z,S=Math.hypot(P,y)||1,L=(t.fastPath(T.x,T.z).w||20)/2+2.5;for(const D of[-1,1]){const U=T.x+-y/S*L*D,k=T.z+P/S*L*D,B=new It(new Ln(.05,.05,.7,8),new pe({color:l[x],roughness:.5}));B.position.set(U,t.height(U,k)+.35,k),B.castShadow=!0,this.group.add(B)}}for(const x of[-1,1]){const R=this.makeBoard(5.2,.9),T=i*x*7.5-e*1.5,E=r*x*7.5-n*1.5;R.position.set(T,t.height(T,E),E),R.rotation.y=Math.atan2(e,n)+Math.PI+x*-1.05,this.group.add(R)}const c=i*-4.2+e*4.5,h=r*-4.2+n*4.5,u=new xe,f=new It(new Te(1.1,1.375,.08),[this.boardFrameMat,this.boardFrameMat,this.boardFrameMat,this.boardFrameMat,this.signMat,this.boardFrameMat]);f.position.y=1.45,f.castShadow=!0;const d=new It(new Te(.12,.9,.12),this.boardFrameMat);d.position.y=.45,u.add(f,d),u.position.set(c,t.height(c,h),h),u.rotation.y=Math.atan2(-e,-n)+Math.PI+.55,this.group.add(u);const g=t.def.green,v=g.x-t.samples[t.samples.length-8].x,m=g.z-t.samples[t.samples.length-8].z,p=Math.hypot(v,m)||1,_=v/p,M=m/p;for(const x of[-1,0,1]){const R=this.makeBoard(5.2,.9),T=Math.max(g.rx,g.rz)+16,E=g.x+_*T+-M*x*6.2,P=g.z+M*T+_*x*6.2;R.position.set(E,t.height(E,P),P),R.rotation.y=Math.atan2(-_,-M)+x*.25,this.group.add(R)}this.group.add(this.flag),this.brand&&this.applyBrand(this.brand)}makeBoard(t,e){const n=new xe,i=new It(new Te(t,e,.12),[this.boardFrameMat,this.boardFrameMat,this.boardFrameMat,this.boardFrameMat,this.boardMat,this.boardMat]);i.position.y=e/2+.25,i.castShadow=!0,i.receiveShadow=!0;for(const r of[-1,1]){const a=new It(new Te(.08,.3,.3),this.boardFrameMat);a.position.set(r*(t/2-.3),.15,0),n.add(a)}return n.add(i),n}applyBrand(t){this.brand=t;const e=t.course;{const n=this.flagTex.image,i=n.getContext("2d");i.fillStyle=e.flag,i.fillRect(0,0,n.width,n.height),oi(i,t,40,60,n.width-80,n.height-120,e.flagLogoColor),i.fillStyle="rgba(0,0,0,0.18)",i.fillRect(0,0,14,n.height),this.flagTex.needsUpdate=!0}{const n=this.boardTex.image,i=n.getContext("2d");i.fillStyle=e.board,i.fillRect(0,0,n.width,n.height),i.fillStyle=t.colors.primary,i.fillRect(0,n.height-18,n.width,18),oi(i,t,40,34,n.width*.5,n.height-88,e.boardText),i.fillStyle=e.boardText,i.font=`italic 700 54px ${gs(t)}`,i.textAlign="right",i.textBaseline="middle",i.fillText(t.tagline.toUpperCase(),n.width-40,n.height/2-8,n.width*.42),this.boardTex.needsUpdate=!0}this.drawSign(),this.poleMat.color.set(e.pole),this.markerMat.color.set(e.teeMarker),this.boardFrameMat.color.set(new dt(e.board).multiplyScalar(.6)),this.pinGlow.material.color.set(t.colors.primary)}drawSign(){const t=this.brand,e=this.course;if(!t)return;const n=this.signTex.image,i=n.getContext("2d");i.fillStyle=t.colors.dark,i.fillRect(0,0,n.width,n.height),i.fillStyle=t.colors.primary,i.fillRect(0,0,n.width,140),oi(i,t,40,24,n.width-80,92,t.colors.onPrimary),e&&(i.fillStyle=t.colors.light,i.textAlign="center",i.font=`italic 800 64px ${gs(t)}`,i.fillText("HOLE",n.width/2,230),i.fillStyle=t.colors.primary,i.font=`italic 900 220px ${gs(t)}`,i.fillText(String(e.def.id),n.width/2,430),i.fillStyle=t.colors.light,i.font=`italic 700 56px ${gs(t)}`,i.fillText(`PAR ${e.def.par}  ·  ${Math.round(e.distToPin(0,0))} M`,n.width/2,530),i.font=`italic 600 40px ${gs(t)}`,i.globalAlpha=.7,i.fillText(e.def.name.toUpperCase(),n.width/2,590),i.globalAlpha=1),this.signTex.needsUpdate=!0}setPeg(t){const e=this.group.getObjectByName("peg");e&&(e.visible=t)}previewCanvases(){return[this.flagTex.image,this.boardTex.image,this.signTex.image]}update(t,e){this.flagShader&&(this.flagShader.uniforms.uTime.value=t);const n=1+Math.sin(t*3)*.15,i=Math.min(1,Math.max(0,(e-25)/40));this.pinGlow.scale.setScalar(n*(1+e/60)),this.pinGlow.material.opacity=.55*i}}function gs(s){return`"${s.font}", "Barlow Condensed", "Arial Narrow", sans-serif`}function wa(s,t){const e=document.createElement("canvas");e.width=s,e.height=t;const n=new Ye(e);return n.colorSpace=se,n.anisotropy=8,n}class _v{constructor(t){const e=new $g({color:16777215,roughness:.35,clearcoat:1,clearcoatRoughness:.15,normalMap:lv(),normalScale:new it(.6,.6)});this.ball=new It(new Os(.0214*2.2,24,16),e),this.ball.castShadow=!0,t.add(this.ball),this.shadow=new It(new ui(.06,16),new qe({color:0,transparent:!0,opacity:.35,depthWrite:!1})),this.shadow.rotation.x=-Math.PI/2,t.add(this.shadow),this.tracerGlow=new ba(600,16777215,!0),this.tracerGlow.widthScale=3.4,this.tracerGlow.opacity=.28,t.add(this.tracerGlow.mesh),this.tracer=new ba(600,16777215,!0),this.tracer.widthScale=.8,t.add(this.tracer.mesh),this.puffs=new yv(t),this.marks=new Sv(t),this.aim=new ba(240,16777215,!1,!0),this.aim.widthScale=1.7,t.add(this.aim.mesh),this.ring=new xe;const n=new It(new fi(1,1.25,48),new qe({color:16777215,transparent:!0,opacity:.9,depthWrite:!1,side:be}));this.ringInner=new It(new ui(1,48),new qe({color:4251856,transparent:!0,opacity:.28,depthWrite:!1,side:be})),n.rotation.x=this.ringInner.rotation.x=-Math.PI/2,this.ring.add(n,this.ringInner),this.ring.renderOrder=5,t.add(this.ring),this.particles=new Mv(t)}setBrand(t){this.ball.material.color.set(t.course.ball),this.tracer.setColor(t.course.tracer),this.tracerGlow.setColor(t.course.tracer),this.ringInner.material.color.set(t.colors.primary)}setBall(t,e,n,i){this.ball.position.set(t,e+.0214*1.2,n),this.shadow.position.set(t,i+.02,n);const r=Math.max(0,e-i),a=1+r*.05;this.shadow.scale.setScalar(a),this.shadow.material.opacity=Math.max(.05,.35-r*.01)}tracerReset(){this.tracer.clear(),this.tracerGlow.clear()}tracerPush(t){this.tracer.push(t),this.tracerGlow.push(t)}tracerFade(t){this.tracer.fade(t),this.tracerGlow.fade(t)}puff(t,e,n=1){this.puffs.emit(t,e,n)}ripple(t){this.marks.ripple(t)}divot(t,e,n){this.marks.divot(t,e,n)}clearMarks(){this.marks.clear()}burst(t,e,n){this.particles.burst(t,e,n)}update(t,e,n){this.tracerGlow.update(e),this.tracer.update(e),this.aim.update(e),this.particles.update(t),this.puffs.update(t),this.marks.update(t);const i=1+Math.sin(n*4)*.06;this.ring.children[0].scale.setScalar(i)}}class ba{constructor(t,e,n,i=!1){this.pts=[],this.alpha=1,this.widthScale=1,this.opacity=1,this.max=t,this.dashed=i,this.geo=new ue,this.geo.setAttribute("position",new ge(new Float32Array(t*2*3),3)),this.geo.setAttribute("color",new ge(new Float32Array(t*2*4),4));const r=[];for(let a=0;a<t-1;a++){const o=a*2;i&&a%4>=2||r.push(o,o+1,o+2,o+1,o+3,o+2)}this.geo.setIndex(r),this.mat=new qe({color:e,vertexColors:!0,transparent:!0,depthWrite:!1,side:be,blending:n?Rs:li}),this.mesh=new It(this.geo,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=10}setColor(t){this.mat.color.set(t)}clear(){this.pts=[],this.alpha=1,this.geo.setDrawRange(0,0)}push(t){this.pts.length>=this.max&&this.pts.shift(),this.pts.push(t.clone()),this.alpha=1}setPoints(t){this.pts=t.slice(0,this.max).map(e=>e.clone()),this.alpha=1}fade(t){this.alpha=Math.max(0,this.alpha-t*.5)}update(t){const e=this.pts.length;if(e<2){this.geo.setDrawRange(0,0);return}const n=this.geo.attributes.position,i=this.geo.attributes.color,r=t.position,a=new A,o=new A,l=new A;for(let h=0;h<e;h++){const u=this.pts[h],f=this.pts[Math.min(e-1,h+1)],d=this.pts[Math.max(0,h-1)];a.subVectors(f,d).normalize(),l.subVectors(r,u);const g=l.length();l.normalize(),o.crossVectors(a,l).normalize();const v=(.025+g*.0032)*this.widthScale;o.multiplyScalar(v),n.setXYZ(h*2,u.x+o.x,u.y+o.y,u.z+o.z),n.setXYZ(h*2+1,u.x-o.x,u.y-o.y,u.z-o.z);const m=Math.pow(h/(e-1),.6)*this.alpha*this.opacity;i.setXYZW(h*2,1,1,1,m),i.setXYZW(h*2+1,1,1,1,m)}n.needsUpdate=!0,i.needsUpdate=!0;let c=e-1;if(this.dashed){c=0;for(let h=0;h<e-1;h++)h%4<2&&c++}this.geo.setDrawRange(0,c*6),this.geo.computeBoundingSphere()}}class Mv{constructor(t){this.N=400,this.head=0;const e=new ue;e.setAttribute("position",new ge(new Float32Array(this.N*3),3)),e.setAttribute("color",new ge(new Float32Array(this.N*3),3)),this.vel=new Float32Array(this.N*3),this.life=new Float32Array(this.N);const n=new Uh({size:.18,map:$h(),vertexColors:!0,transparent:!0,depthWrite:!1,sizeAttenuation:!0});this.pts=new mg(e,n),this.pts.frustumCulled=!1,t.add(this.pts)}burst(t,e,n){const i=e==="confetti"?160:e==="water"?70:36,r=this.pts.geometry.attributes.position,a=this.pts.geometry.attributes.color,o={grass:["#3f7a2a","#5a9a35","#6b4a2a"],sand:["#e8d7a8","#d8c48e","#f2e6c4"],water:["#ffffff","#cfeefb","#9fd7ef"],leaf:["#2f5a22","#46772d","#2a4a1c"],confetti:[n??"#ffffff","#ffffff",n??"#ffd200","#ffffff"]},l=o[e]??o.grass,c=new dt;for(let h=0;h<i;h++){const u=this.head;this.head=(this.head+1)%this.N,r.setXYZ(u,t.x,t.y+.05,t.z);const f=Math.random()*Math.PI*2,d=e==="water"?3+Math.random()*4:e==="confetti"?4+Math.random()*6:1+Math.random()*2.5,g=e==="confetti"?1+Math.random()*3:.4+Math.random()*1.4;this.vel[u*3]=Math.cos(f)*g,this.vel[u*3+1]=d,this.vel[u*3+2]=Math.sin(f)*g,this.life[u]=e==="confetti"?2.5:1.1,c.set(l[h%l.length]),a.setXYZ(u,c.r,c.g,c.b)}r.needsUpdate=!0,a.needsUpdate=!0}update(t){const e=this.pts.geometry.attributes.position;for(let n=0;n<this.N;n++){if(this.life[n]<=0){e.setY(n,-9999);continue}this.life[n]-=t,this.vel[n*3+1]-=9.8*t*.6,this.vel[n*3]*=.98,this.vel[n*3+2]*=.98,e.setXYZ(n,e.getX(n)+this.vel[n*3]*t,e.getY(n)+this.vel[n*3+1]*t,e.getZ(n)+this.vel[n*3+2]*t)}e.needsUpdate=!0}}class yv{constructor(t){this.pool=[],this.i=0;const e=$h();for(let n=0;n<40;n++){const i=new Ih(new $o({map:e,transparent:!0,depthWrite:!1,opacity:0}));i.visible=!1,i.renderOrder=6,t.add(i),this.pool.push({s:i,life:0,max:1,vy:0,grow:1,vx:0,vz:0})}}emit(t,e,n){const i=e==="sand"?9:12;for(let r=0;r<i;r++){const a=this.pool[this.i];this.i=(this.i+1)%this.pool.length;const o=Math.random()*Math.PI*2,l=Math.random()*.4*n;a.s.position.set(t.x+Math.cos(o)*l,t.y+.1,t.z+Math.sin(o)*l);const c=a.s.material;e==="sand"?(c.color.set(Math.random()<.5?"#e9dcb5":"#d9c793"),a.max=1.3+Math.random()*.8,a.vy=.6+Math.random()*1.4,a.grow=(1.4+Math.random()*1.2)*n,a.vx=Math.cos(o)*(.5+Math.random())*n,a.vz=Math.sin(o)*(.5+Math.random())*n,a.s.scale.setScalar(.4*n)):(c.color.set("#ffffff"),a.max=.9+Math.random()*.6,a.vy=(3+Math.random()*5)*n,a.grow=(.6+Math.random()*.8)*n,a.vx=Math.cos(o)*.6,a.vz=Math.sin(o)*.6,a.s.scale.setScalar(.3*n)),a.life=a.max,a.s.visible=!0}}update(t){for(const e of this.pool){if(e.life<=0)continue;e.life-=t;const n=e.s.material;if(e.life<=0){e.s.visible=!1,n.opacity=0;continue}const i=1-e.life/e.max;e.vy-=9.8*t*.35,e.s.position.x+=e.vx*t,e.s.position.y+=Math.max(-1,e.vy)*t,e.s.position.z+=e.vz*t,e.vx*=.96,e.vz*=.96,e.s.scale.setScalar(e.s.scale.x+e.grow*t),n.opacity=Math.min(1,i*8)*(1-i)*.75}}}class Sv{constructor(t){this.group=new xe,this.divots=[],this.rings=[],this.soil=new As({color:4863522,polygonOffset:!0,polygonOffsetFactor:-2}),this.turf=new As({color:6197048}),this.turfRoot=new As({color:5914920}),t.add(this.group)}divot(t,e,n){const i=new xe,r=Math.atan2(e,n),a=new It(new ui(.5,20),this.soil);a.scale.set(.11,.24,1),a.rotation.x=-Math.PI/2,a.position.y=.012,i.add(a);const o=new xe,l=new It(new Te(.1,.012,.18),this.turf),c=new It(new Te(.1,.012,.18),this.turfRoot);if(c.position.y=-.012,o.add(l,c),o.position.set(.05,.03,.9+Math.random()*.5),o.rotation.set(Math.PI*(.85+Math.random()*.3),Math.random()*1.2,.2),i.add(o),i.position.copy(t),i.rotation.y=r,this.group.add(i),this.divots.push(i),this.divots.length>14){const h=this.divots.shift();this.group.remove(h),h.traverse(u=>u.geometry?.dispose())}}ripple(t){for(let e=0;e<3;e++){const n=new It(new fi(.85,1,40),new qe({color:16777215,transparent:!0,opacity:0,depthWrite:!1,side:be}));n.rotation.x=-Math.PI/2,n.position.set(t.x,t.y+.03,t.z),n.renderOrder=4,this.group.add(n),this.rings.push({m:n,t:-e*.35})}}clear(){for(const t of this.divots)this.group.remove(t),t.traverse(e=>e.geometry?.dispose());this.divots=[]}update(t){this.rings=this.rings.filter(e=>{e.t+=t;const n=e.m.material;if(e.t>=2.2)return this.group.remove(e.m),e.m.geometry.dispose(),n.dispose(),!1;const i=Math.max(0,e.t)/2.2;return e.m.scale.setScalar(.3+i*4.5),n.opacity=e.t<0?0:(1-i)*.7,!0})}}class wv{constructor(t){this.pts=[],this.dir=new it(1,0),this.course=null,this.t=0,this.N=90,this.visible=!1;const e=new kh;e.moveTo(0,.22),e.lineTo(.2,-.05),e.lineTo(.12,-.05),e.lineTo(0,.1),e.lineTo(-.12,-.05),e.lineTo(-.2,-.05),e.closePath();const n=new Jo(e);n.rotateX(-Math.PI/2);const i=new qe({color:16777215,transparent:!0,opacity:.55,depthWrite:!1});this.mesh=new qn(n,i,this.N),this.mesh.frustumCulled=!1,this.mesh.visible=!1,this.mesh.renderOrder=4,t.add(this.mesh)}setCourse(t){this.course=t;const e=t.def.green;this.pts=[];const n=2.2;for(let a=-e.rx;a<=e.rx;a+=n)for(let o=-e.rz;o<=e.rz;o+=n){const l=e.x+a,c=e.z+o;t.surfaceAt(l,c)==="green"&&this.pts.length<this.N&&this.pts.push({x:l,z:c})}const[i,r]=e.slope;this.dir.set(-i,-r).normalize()}setColor(t){this.mesh.material.color.set(t)}update(t){if(this.mesh.visible=this.visible&&!!this.course,!this.mesh.visible||!this.course)return;this.t+=t;const e=this.course,n=new Vt,i=new Un().setFromAxisAngle(new A(0,1,0),Math.atan2(-this.dir.x,-this.dir.y)),r=new A(1,1,1),a=e.def.green;for(let o=0;o<this.N;o++){if(o>=this.pts.length){n.makeScale(0,0,0),this.mesh.setMatrixAt(o,n);continue}const l=this.pts[o],c=(this.t*.6+o%7*.31)%2.2-1.1,h=l.x+this.dir.x*c,u=l.z+this.dir.y*c,f=Math.hypot((h-a.x)/a.rx,(u-a.z)/a.rz)<.95,d=1-Math.abs(c)/1.1;r.setScalar(f?.5+d*.6:0),n.compose(new A(h,e.height(h,u)+.03,u),i,r),this.mesh.setMatrixAt(o,n)}this.mesh.instanceMatrix.needsUpdate=!0}}const Uc="/golf/",Nc=8,Fc=2,bv=2/3;let xr=null,Oc=null;class Tv{constructor(){this.group=new xe,this.mesh=null,this.stands=new xe,this.spots=[],this.excite=0,this.brand=null,this.uniforms={uTime:{value:0},uExcite:{value:0}},this.standMats={frame:new pe({color:9080982,roughness:.45,metalness:.6}),seat:new pe({color:2764081,roughness:.7}),fascia:new pe({roughness:.5}),roof:new pe({color:15921906,roughness:.6,side:be})};const t=document.createElement("canvas");if(t.width=1024,t.height=128,this.fasciaTex=new Ye(t),this.fasciaTex.colorSpace=se,this.fasciaTex.wrapS=ln,this.standMats.fascia.map=this.fasciaTex,this.group.add(this.stands),!xr){const e=new ji;xr=e.load(`${Uc}tex/crowd.webp`),xr.colorSpace=se,Oc=e.load(`${Uc}tex/crowd-mask.webp`)}}placeFor(t){this.spots=[],this.stands.clear();let e=t.def.seed*31+7;const n=()=>(e=e*16807%2147483647)/2147483647,i=(x,R,T)=>{const E=t.surfaceAt(x,R);T===void 0&&(E==="water"||E==="bunker"||E==="green"||E==="ob")||this.spots.push({x,z:R,y:T??t.height(x,R),person:Math.floor(n()*Nc),phase:n()*6.28,eager:.5+n()*.8,scale:.92+n()*.16})},r=t.def.green,a=t.samples[Math.max(0,t.samples.length-8)],o=r.x-a.x,l=r.z-a.z,c=Math.hypot(o,l)||1,h=o/c,u=l/c,f=Math.max(r.rx,r.rz);for(let x=0;x<2;x++)for(let R=-12;R<=12;R++){if(Math.abs(R)<4)continue;const T=R/12*1.2,E=f+18+x*1.1+n()*.5,P=Math.cos(T),y=Math.sin(T);i(r.x+(h*P-u*y)*E,r.z+(u*P+h*y)*E)}const d=f+24,g=r.x+h*d,v=r.z+u*d;this.buildStand(t,g,v,Math.atan2(-h,-u),20,n,i);const{dirX:m,dirZ:p}=t.tee,_=-p,M=m;for(let x=0;x<18;x++){const R=x%2?1:-1,T=-6+Math.floor(x/2)*1.4+n()*.4,E=10.5+n()*1.4;i(_*R*E+m*T,M*R*E+p*T)}this.buildMesh(),this.brand&&this.applyBrand(this.brand)}buildStand(t,e,n,i,r,a,o){const l=new xe,c=5,h=.95,u=.55,f=Math.min(t.height(e,n),t.height(e+Math.sin(i)*6,n+Math.cos(i)*6))-.1;for(let p=0;p<c;p++){const _=new It(new Te(r,u*(p+1),h),this.standMats.seat);_.position.set(0,u*(p+1)/2+.6,-p*h),_.castShadow=!0,_.receiveShadow=!0,l.add(_)}for(let p=-2;p<=2;p++){const _=new It(new Te(.12,.6+u*c+2.6,.12),this.standMats.frame);_.position.set(p/2*(r/2-.2),(.6+u*c+2.6)/2,-c*h+.2),l.add(_)}const d=new It(new Te(r,.05,.05),this.standMats.frame);d.position.set(0,.6+u*c+1.05,-c*h+.4),l.add(d);const g=new It(new Te(r+1,.08,c*h+1.2),this.standMats.roof);g.position.set(0,.6+u*c+2.7,-c*h/2+.2),g.rotation.x=-.08,g.castShadow=!0,l.add(g);for(const[p,_]of[[.32,.64],[.6+u*c+2.45,.5]]){const M=new It(new Qe(r,_),this.standMats.fascia);M.position.set(0,p,.5+(p>1?.65:.01)),l.add(M)}l.position.set(e,f,n),l.rotation.y=i,this.stands.add(l);const v=Math.cos(i),m=Math.sin(i);for(let p=0;p<c;p++)for(let _=0;_<Math.floor(r/.8);_++){if(a()<.12)continue;const M=-r/2+.5+_*.8+(a()-.5)*.2,x=-p*h-.15,R=e+M*v+x*m,T=n-M*m+x*v;o(R,T,f+.6+u*(p+1))}}buildMesh(){this.mesh&&(this.group.remove(this.mesh),this.mesh.geometry.dispose(),this.mesh.material.dispose());const t=this.spots.length,e=new Qe(1,1);e.translate(0,.5,0);const n=new Float32Array(t),i=new Float32Array(t),r=new Float32Array(t),a=new Float32Array(t*3),o=new Float32Array(t*3);this.spots.forEach((u,f)=>{n[f]=u.person,i[f]=u.phase,r[f]=u.eager}),e.setAttribute("aPerson",new fn(n,1)),e.setAttribute("aPhase",new fn(i,1)),e.setAttribute("aEager",new fn(r,1)),e.setAttribute("aShirt",new fn(a,3)),e.setAttribute("aCap",new fn(o,3));const l=new me({uniforms:hn.merge([ct.fog,{map:{value:xr},maskMap:{value:Oc}}]),vertexShader:`
        attribute float aPerson, aPhase, aEager;
        attribute vec3 aShirt, aCap;
        uniform float uTime, uExcite;
        varying vec2 vUv;
        varying vec3 vShirt, vCap;
        #include <fog_pars_vertex>
        void main() {
          vec4 base = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float h = length(instanceMatrix[1].xyz);
          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          float cheer = step(0.25, uExcite * aEager);
          float jump = cheer * max(0.0, sin(uTime * 8.0 * aEager + aPhase)) * 0.18 * uExcite;
          float sway = sin(uTime * 1.2 + aPhase) * 0.015;
          vec3 wp = base.xyz + right * (position.x + sway * position.y) * h * ${bv.toFixed(4)} + vec3(0.0, position.y * h + jump, 0.0);
          vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float row = cheer;
          vUv = vec2((uv.x + aPerson) / ${Nc.toFixed(1)}, (uv.y + (${(Fc-1).toFixed(1)} - row)) / ${Fc.toFixed(1)});
          vShirt = aShirt; vCap = aCap;
          #include <fog_vertex>
        }`,fragmentShader:`
        uniform sampler2D map, maskMap;
        varying vec2 vUv;
        varying vec3 vShirt, vCap;
        #include <fog_pars_fragment>
        vec3 recolour(vec3 base, vec3 c) {
          float l = dot(base, vec3(0.299, 0.587, 0.114));
          float shade = clamp(l / 0.86, 0.0, 1.2);
          return c * shade + max(0.0, shade - 0.95) * 0.3;
        }
        void main() {
          vec4 c = texture2D(map, vUv);
          if (c.a < 0.45) discard;
          vec3 m = texture2D(maskMap, vUv).rgb;
          vec3 col = mix(c.rgb, recolour(c.rgb, vShirt), m.r);
          col = mix(col, recolour(c.rgb, vCap), m.g);
          gl_FragColor = vec4(col * 0.93, 1.0);
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,fog:!0,alphaToCoverage:!0});l.uniforms.uTime=this.uniforms.uTime,l.uniforms.uExcite=this.uniforms.uExcite;const c=new qn(e,l,t),h=new Vt;this.spots.forEach((u,f)=>{h.makeScale(1.78*u.scale,1.78*u.scale,1),h.setPosition(u.x,u.y,u.z),c.setMatrixAt(f,h)}),c.frustumCulled=!1,this.mesh=c,this.group.add(c)}applyBrand(t){this.brand=t;const e=this.fasciaTex.image,n=e.getContext("2d");if(n.fillStyle=t.course.board,n.fillRect(0,0,e.width,e.height),n.fillStyle=t.colors.primary,n.fillRect(0,e.height-10,e.width,10),oi(n,t,30,16,300,e.height-36,t.course.boardText),n.fillStyle=t.course.boardText,n.font=`italic 800 56px "${t.font}", "Barlow Condensed", sans-serif`,n.textBaseline="middle",n.textAlign="right",n.fillText(t.courseName.toUpperCase(),e.width-30,e.height/2-4,620),this.fasciaTex.repeat.set(2,1),this.fasciaTex.needsUpdate=!0,this.standMats.seat.color.set(new dt(t.colors.dark).lerp(new dt("#3a3f45"),.5)),!this.mesh)return;const i=[t.colors.primary,t.kit.shirt,t.colors.light,t.colors.dark,"#ffffff","#2f4f7a","#8a2f3b","#d9cdb4","#4f7a5a","#ffffff"],r=[t.kit.cap,t.colors.primary,"#ffffff",t.colors.dark,"#1c2d4a","#ffffff"],a=this.mesh.geometry,o=a.getAttribute("aShirt"),l=a.getAttribute("aCap"),c=new dt;for(let h=0;h<this.spots.length;h++)c.set(i[(h*7+3)%i.length]),o.setXYZ(h,c.r,c.g,c.b),c.set(r[(h*5+1)%r.length]),l.setXYZ(h,c.r,c.g,c.b);o.needsUpdate=!0,l.needsUpdate=!0}cheer(t){this.excite=Math.max(this.excite,t)}update(t){this.excite=Math.max(0,this.excite-t*.3),this.uniforms.uTime.value+=t,this.uniforms.uExcite.value=this.excite}}const Ev={rough:[.09,.2],firstCut:[.08,.14],fairway:[.035,.06],tee:[.035,.055],fringe:[.04,.07]},Av={rough:"#5f9139",firstCut:"#6a9e3e",fairway:"#7cb04a",tee:"#7cb04a",fringe:"#86b950"};class Cv{constructor(t,e=20){this.course=null,this.center=new A(1e9,0,0),this.slots=[],this.uniforms={uTime:{value:0},uBall:{value:new A(1e9,0,0)},uCenter:{value:new it},uRadius:{value:20}},this.uniforms.uRadius.value=e;const n=new Qe(1,1,1,4);n.translate(0,.5,0);const i=n.attributes.position;for(let h=0;h<i.count;h++){const u=i.getY(h);i.setX(h,i.getX(h)*(1-u*.92)),i.setZ(h,u*u*.25)}const r=n.attributes.normal;for(let h=0;h<r.count;h++)r.setXYZ(h,0,1,0);const a=new As({side:be,vertexColors:!1});a.onBeforeCompile=h=>{Object.assign(h.uniforms,this.uniforms),h.vertexShader=h.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime, uRadius; uniform vec3 uBall; uniform vec2 uCenter; varying float vTip;`).replace("#include <begin_vertex>",`#include <begin_vertex>
          vec4 ip = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float h = position.y;
          vTip = h;
          float dc = length(ip.xz - uCenter);
          float fade = 1.0 - smoothstep(uRadius * 0.7, uRadius, dc);
          transformed *= fade;
          float w = sin(uTime * 1.7 + ip.x * 0.35 + ip.z * 0.21) * 0.5 + sin(uTime * 3.1 + ip.x * 0.9) * 0.2;
          transformed.x += w * 0.12 * h * h;`).replace("#include <project_vertex>",`vec4 wpos = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
          vec2 away = wpos.xz - uBall.xz;
          float bd = length(away);
          float push = (1.0 - smoothstep(0.08, 0.45, bd)) * h;
          wpos.xz += normalize(away + vec2(0.0001)) * push * 0.12;
          wpos.y -= push * 0.05;
          vec4 mvPosition = viewMatrix * wpos;
          gl_Position = projectionMatrix * mvPosition;`),h.fragmentShader=h.fragmentShader.replace("#include <common>",`#include <common>
varying float vTip;`).replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.rgb *= mix(0.92, 1.18, vTip);`)},this.mesh=new qn(n,a,t),this.mesh.frustumCulled=!1,this.mesh.receiveShadow=!0;let o=12345;const l=()=>(o=o*16807%2147483647)/2147483647;for(let h=0;h<t;h++){const u=e*Math.pow(l(),.62),f=l()*Math.PI*2;this.slots.push({dx:Math.cos(f)*u,dz:Math.sin(f)*u,r:l(),rot:l()*Math.PI*2,t:l()})}const c=new dt;for(let h=0;h<t;h++)this.mesh.setColorAt(h,c.set("#5f9138"))}setCourse(t){this.course=t,this.center.set(1e9,0,0)}setCenter(t,e){if(!this.course||Math.hypot(t-this.center.x,e-this.center.z)<3)return;this.center.set(t,0,e),this.uniforms.uCenter.value.set(t,e);const n=this.course,i=new Vt,r=new Un,a=new A(0,1,0),o=new dt,l=new A,c=new A;this.slots.forEach((h,u)=>{const f=t+h.dx,d=e+h.dz,g=n.surfaceAt(f,d),v=Ev[g];if(!v){i.makeScale(0,0,0),this.mesh.setMatrixAt(u,i);return}const m=v[0]+(v[1]-v[0])*h.r,p=g==="rough"?.016:.011;l.set(f,n.height(f,d)-.01,d),r.setFromAxisAngle(a,h.rot),c.set(p,m,p*4),i.compose(l,r,c),this.mesh.setMatrixAt(u,i),o.set(Av[g]??"#5f9138").multiplyScalar(.85+h.t*.3),this.mesh.setColorAt(u,o)}),this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}update(t,e){this.uniforms.uTime.value+=t,this.uniforms.uBall.value.copy(e)}}class Rv{constructor(t){this.uniforms={uTime:{value:0},uCam:{value:new A},uFar:{value:160}},this.max=t;const e=Pv(),n=new As({map:Dv(),alphaTest:.45,side:be});n.onBeforeCompile=i=>{Object.assign(i.uniforms,this.uniforms),i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime, uFar; uniform vec3 uCam; varying float vH;`).replace("#include <begin_vertex>",`#include <begin_vertex>
          vec4 ip = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float h = uv.y;
          vH = h;
          float dc = distance(ip.xyz, uCam);
          transformed *= 1.0 - smoothstep(uFar * 0.65, uFar, dc);
          float wv = sin(uTime * 1.4 + ip.x * 0.31 + ip.z * 0.17) * 0.6 + sin(uTime * 2.7 + ip.z * 0.8) * 0.25;
          transformed.x += wv * 0.18 * h * h;
          transformed.z += wv * 0.08 * h * h;`),i.fragmentShader=i.fragmentShader.replace("#include <common>",`#include <common>
varying float vH;`).replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.rgb *= mix(0.78, 1.18, smoothstep(0.0, 0.9, vH));`)},this.mesh=new qn(e,n,t),this.mesh.frustumCulled=!1,this.mesh.receiveShadow=!0,this.mesh.count=0}placeFor(t){const e=t.def,n=t.play;let i=(e.seed*7919+13)%2147483647||1;const r=()=>(i=i*16807%2147483647)/2147483647,a=new Vt,o=new Un,l=new A(0,1,0),c=new A,h=new A,u=new dt,f=new dt("#7aa846"),d=new dt("#a5b35c"),g=new dt("#628f38");let v=0;for(let m=0;m<this.max*14&&v<this.max;m++){const p=n.minX+r()*(n.maxX-n.minX),_=n.minZ+r()*(n.maxZ-n.minZ);if(t.surfaceAt(p,_)!=="rough")continue;const M=t.fastPath(p,_),x=M.w>0?M.d-M.w/2:99,R=ze(e.green,p,_),T=x<26,E=R<2.4;if(!T&&!E||M.s<e.fairwayStart+6&&Math.hypot(p,_)<40)continue;const P=E?.9:1-Math.max(0,x-4)/26;if(r()>P)continue;const y=.75+r()*.7;c.set(p,t.height(p,_)-.02,_),o.setFromAxisAngle(l,r()*Math.PI),h.set(y*(.9+r()*.4),y*(.85+r()*.5),y),a.compose(c,o,h),this.mesh.setMatrixAt(v,a),u.copy(f).lerp(r()<.25?d:g,r()*.6).multiplyScalar(.85+r()*.3),this.mesh.setColorAt(v,u),v++}this.mesh.count=v,this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}update(t,e){this.uniforms.uTime.value+=t,this.uniforms.uCam.value.copy(e.position)}}function Pv(){const s=[];for(let n=0;n<3;n++){const i=new Qe(.42,.34,1,2);i.translate(0,.17,0),i.rotateY(n/3*Math.PI),s.push(i)}const t=Lv(s),e=t.attributes.normal;for(let n=0;n<e.count;n++)e.setXYZ(n,0,1,0);return t}function Lv(s){const t=[],e=[],n=[],i=[];let r=0;for(const o of s){const l=o.attributes.position,c=o.attributes.normal,h=o.attributes.uv;for(let f=0;f<l.count;f++)t.push(l.getX(f),l.getY(f),l.getZ(f)),e.push(c.getX(f),c.getY(f),c.getZ(f)),n.push(h.getX(f),h.getY(f));const u=o.index;for(let f=0;f<u.count;f++)i.push(u.getX(f)+r);r+=l.count}const a=new ue;return a.setAttribute("position",new Yt(t,3)),a.setAttribute("normal",new Yt(e,3)),a.setAttribute("uv",new Yt(n,2)),a.setIndex(i),a}function Dv(){const e=document.createElement("canvas");e.width=128,e.height=128;const n=e.getContext("2d");let i=4242;const r=()=>(i=i*16807%2147483647)/2147483647;for(let o=0;o<46;o++){const l=8+r()*112,c=128*(.45+r()*.55),h=(r()-.5)*34,u=2.2+r()*2.6,f=n.createLinearGradient(0,128,0,128-c),d=.75+r()*.35;f.addColorStop(0,`rgb(${Math.round(150*d)},${Math.round(175*d)},${Math.round(120*d)})`),f.addColorStop(1,`rgb(${Math.round(235*d)},${Math.round(245*d)},${Math.round(190*d)})`),n.fillStyle=f,n.beginPath(),n.moveTo(l-u,128),n.quadraticCurveTo(l-u*.5+h*.3,128-c*.55,l+h,128-c),n.quadraticCurveTo(l+u*.5+h*.3,128-c*.55,l+u,128),n.closePath(),n.fill()}const a=new Ye(e);return a.colorSpace=se,a.anisotropy=4,a}const Iv="/golf/",Uv=[{name:"caddie",w:.645,h:.99},{name:"flowers",w:.988,h:.527},{name:"box",w:.988,h:.877},{name:"wild",w:.988,h:.662}];let _r=null;class Nv{constructor(){this.group=new xe,this.sprites=null,this.brand=null,this.rows=[],this.title="CLOSEST TO THE PIN",this.ropeMat=new pe({color:16053492,roughness:.8}),this.stakeMat=new pe({color:16777215,roughness:.5}),this.towerMat=new pe({color:2303530,roughness:.6,metalness:.3});const t=document.createElement("canvas");t.width=512,t.height=768,this.boardTex=new Ye(t),this.boardTex.colorSpace=se,this.boardTex.anisotropy=4,_r||(_r=new ji().load(`${Iv}tex/props.webp`),_r.colorSpace=se)}placeFor(t){this.group.clear();let e=t.def.seed*97+13;const n=()=>(e=e*16807%2147483647)/2147483647,i=[],r=(p,_)=>{const M=t.surfaceAt(p,_);return M==="rough"||M==="firstCut"},{dirX:a,dirZ:o}=t.tee,l=-o,c=a,h=(p,_)=>({x:l*p+a*_,z:c*p+o*_});{const p=h(4.6,-1.2);i.push({kind:0,x:p.x,z:p.z,h:1.85})}for(const[p,_]of[[-5.6,8],[5.6,8],[-5.6,-6],[5.6,-6]]){const M=h(p,_);i.push({kind:1,x:M.x,z:M.z,h:.65})}for(let p=0;p<5;p++)for(const _ of[-1,1]){const M=h(_*10.2,-4.5+p*2.2);i.push({kind:2,x:M.x,z:M.z,h:.95+n()*.25})}const u=t.def.green,f=t.samples[Math.max(0,t.samples.length-8)],d=Math.hypot(u.x-f.x,u.z-f.z)||1,g=(u.x-f.x)/d,v=(u.z-f.z)/d,m=Math.max(u.rx,u.rz);for(const p of[-1,-.55,.55,1]){const _=Math.cos(p),M=Math.sin(p),x=m+12.5,R=u.x+(g*_-v*M)*x,T=u.z+(v*_+g*M)*x;r(R,T)&&i.push({kind:1,x:R,z:T,h:.6})}for(let p=0,_=0;p<900&&_<140;p++){const M=t.play.minX+n()*(t.play.maxX-t.play.minX),x=t.play.minZ+n()*(t.play.maxZ-t.play.minZ),R=t.fastPath(M,x),T=Math.max(R.w,24)/2;R.d<T+9||R.d>T+28||!r(M,x)||ze(u,M,x)<2.2||(i.push({kind:3,x:M,z:x,h:.8+n()*.6}),_++)}this.buildSprites(t,i),this.buildRope(t,g,v,m),this.buildTower(t,g,v,m),this.brand&&this.applyBrand(this.brand)}buildSprites(t,e){const n=new Qe(1,1);n.translate(0,.5,0);const i=new Float32Array(e.length),r=new me({uniforms:hn.merge([ct.fog,{map:{value:_r}}]),vertexShader:`
        attribute float aKind;
        varying vec2 vUv;
        #include <fog_pars_vertex>
        void main() {
          vec4 base = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float s = length(instanceMatrix[1].xyz);
          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          vec3 wp = base.xyz + right * position.x * s + vec3(0.0, position.y * s, 0.0);
          vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vUv = vec2((uv.x + aKind) / 4.0, uv.y);
          #include <fog_vertex>
        }`,fragmentShader:`
        uniform sampler2D map;
        varying vec2 vUv;
        #include <fog_pars_fragment>
        void main() {
          vec4 c = texture2D(map, vUv);
          if (c.a < 0.45) discard;
          gl_FragColor = vec4(c.rgb * 0.9, 1.0);
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,fog:!0,alphaToCoverage:!0}),a=new qn(n,r,e.length),o=new Vt;e.forEach((l,c)=>{i[c]=l.kind;const h=l.h/Uv[l.kind].h;o.makeScale(h,h,h),o.setPosition(l.x,t.height(l.x,l.z)-.03,l.z),a.setMatrixAt(c,o)}),n.setAttribute("aKind",new fn(i,1)),a.frustumCulled=!1,this.sprites=a,this.group.add(a)}buildRope(t,e,n,i){const r=i+15,a=[];for(let d=-14;d<=14;d++){const g=d/14*1.35,v=Math.cos(g),m=Math.sin(g),p=t.def.green,_=p.x+(e*v-n*m)*r,M=p.z+(n*v+e*m)*r;a.push(new A(_,t.height(_,M),M))}const o=new Ln(.035,.04,1,6);o.translate(0,.5,0);const l=new qn(o,this.stakeMat,a.length),c=new Vt;a.forEach((d,g)=>{c.makeTranslation(d.x,d.y,d.z),l.setMatrixAt(g,c)}),l.castShadow=!0,this.group.add(l);const h=[];for(let d=0;d<a.length-1;d++){const g=a[d],v=a[d+1];for(let m=0;m<1;m+=.25){const p=g.clone().lerp(v,m);p.y+=.92-Math.sin(m*Math.PI)*.12,h.push(p)}}const u=a[a.length-1].clone();u.y+=.92,h.push(u);const f=new It(new Qo(new Lr(h),h.length*2,.018,4),this.ropeMat);this.group.add(f)}buildTower(t,e,n,i){const r=t.def.green,a=t.def.seed%2?1:-1;let o=r.x-n*a*(i+22)+e*4,l=r.z+e*a*(i+22)+n*4;for(let m=0;m<6&&t.surfaceAt(o,l)==="water";m++)o+=e*8,l+=n*8;const c=new xe,h=3.2,u=4.8,f=2.4,d=new It(new Te(h,u,.3),[this.towerMat,this.towerMat,this.towerMat,this.towerMat,new pe({map:this.boardTex,roughness:.45,emissive:16777215,emissiveMap:this.boardTex,emissiveIntensity:.25}),this.towerMat]);d.position.y=f+u/2,d.castShadow=!0,c.add(d);for(const m of[-1,1]){const p=new It(new Te(.22,f+.2,.22),this.towerMat);p.position.set(m*(h/2-.4),(f+.2)/2,0),p.castShadow=!0,c.add(p)}c.position.set(o,t.height(o,l),l);const g=r.x-e*60-o,v=r.z-n*60-l;c.rotation.y=Math.atan2(g,v),this.group.add(c)}applyBrand(t){this.brand=t,this.drawBoard(),this.ropeMat.color.set("#f2f2f2"),this.stakeMat.color.set(t.colors.primary),this.towerMat.color.set(new dt(t.colors.dark).lerp(new dt("#2a2d31"),.4))}setBoard(t,e){this.title=t,this.rows=e.slice(0,6),this.drawBoard()}drawBoard(){const t=this.brand;if(!t)return;const e=this.boardTex.image,n=e.getContext("2d"),i=`"${t.font}", "Barlow Condensed", sans-serif`;n.fillStyle=t.colors.dark,n.fillRect(0,0,e.width,e.height),n.fillStyle=t.colors.primary,n.fillRect(0,0,e.width,120),oi(n,t,30,20,e.width-60,80,t.colors.onPrimary),n.fillStyle=t.colors.light,n.textAlign="center",n.font=`italic 800 46px ${i}`,n.fillText("LEADERBOARD",e.width/2,178),n.font=`italic 600 28px ${i}`,n.globalAlpha=.75,n.fillText(this.title,e.width/2,216),n.globalAlpha=1,(this.rows.length?this.rows:[{name:"Be the first",value:"-"}]).forEach((a,o)=>{const l=290+o*74;n.fillStyle=o%2?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.09)",n.fillRect(24,l-46,e.width-48,64),n.textAlign="left",n.fillStyle=t.colors.primary,n.font=`italic 900 40px ${i}`,n.fillText(String(o+1),40,l),n.fillStyle=t.colors.light,n.font=`700 36px ${i}`,n.fillText(a.name.toUpperCase().slice(0,14),92,l,260),n.textAlign="right",n.fillStyle=t.colors.primary,n.font=`italic 800 38px ${i}`,n.fillText(a.value,e.width-40,l)}),this.boardTex.needsUpdate=!0}}const vs="/golf/",We={drive:{name:"golfer-drive",frames:47,cols:8,rows:6,w:1.215,h:1.823,ax:.953,ay:.006,address:0,top:20,impact:30,finish:46},face:{name:"golfer-face",frames:41,cols:8,rows:6,w:1.42,h:2.13,ax:.575,ay:.02,address:0,top:18,impact:24,finish:40},putt:{name:"golfer-putt",frames:47,cols:8,rows:6,w:1.246,h:1.869,ax:.768,ay:.02,address:0,top:12,impact:34,finish:46}},Fv=["celebrate","frustrate","read"];class Ov{constructor(){this.root=new xe,this.sheet=We.drive,this.frame=0,this.ball=new A,this.uniforms={maskMap:{value:null},cShirt:{value:new dt("#ffffff")},cCap:{value:new dt("#ffffff")},cShoes:{value:new dt("#ffffff")},shirtLogo:{value:null},capLogo:{value:null},uShirtA:{value:new A},uCapA:{value:new A},uCell:{value:new le(0,0,1,1)},uCellAspect:{value:384/576},uLogoAspect:{value:3.6},uShirtOn:{value:1},uShirtRot:{value:0},uBaked:{value:0},uCapOn:{value:1}},this.shirtCanvas=document.createElement("canvas"),this.capCanvas=document.createElement("canvas"),this.putter=!1,this.view="dtl",this.mirrored=!1,this.pose={kind:"back",p:0},this.golferPos=new A,this.baked={},this.bakedFor="",this.reactions={},this.reaction=null,this.clock=0;const t=new ji;for(const e of Object.values(We))if(e.frames){e.tex=t.load(`${vs}tex/${e.name}.webp`),e.tex.colorSpace=se,e.mask=t.load(`${vs}tex/${e.name}-mask.webp`),fetch(`${vs}tex/${e.name}.json`).then(n=>n.json()).then(n=>{e.anchors=n.anchors,this.setFrame(this.frame)}).catch(()=>{});for(const n of[e.tex,e.mask])n.repeat.set(1/e.cols,1/e.rows),n.generateMipmaps=!1,n.minFilter=Be}this.mat=new qe({map:this.sheet.tex,alphaTest:.42,side:be,toneMapped:!1}),this.mat.onBeforeCompile=e=>{Object.assign(e.uniforms,this.uniforms),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
          uniform sampler2D maskMap, shirtLogo, capLogo; uniform vec3 cShirt, cCap, cShoes;
          uniform vec3 uShirtA, uCapA; uniform vec4 uCell; uniform float uCellAspect, uLogoAspect, uShirtOn, uCapOn, uShirtRot, uBaked;
          vec4 decal(sampler2D t, vec3 a, vec2 cell, float rot) {
            if (a.z <= 0.0) return vec4(0.0);
            vec2 q = vec2(cell.x - a.x, (cell.y - a.y) / uCellAspect);
            float c = cos(rot), s = sin(rot);
            vec2 r = vec2(q.x * c + q.y * s, -q.x * s + q.y * c);
            vec2 l = vec2(r.x / a.z + 0.5, r.y / (a.z / uLogoAspect) + 0.5);
            if (l.x < 0.0 || l.x > 1.0 || l.y < 0.0 || l.y > 1.0) return vec4(0.0);
            return texture2D(t, l);
          }
          vec3 recolour(vec3 base, vec3 c) {
            float l = dot(base, vec3(0.299, 0.587, 0.114));
            float shade = clamp(l / 0.86, 0.0, 1.25);
            return c * shade + max(0.0, shade - 0.95) * 0.35;
          }`).replace("#include <map_fragment>",`#include <map_fragment>
          vec3 mk = texture2D(maskMap, vMapUv).rgb * (1.0 - uBaked);
          vec3 base = diffuseColor.rgb;
          diffuseColor.rgb = mix(base, recolour(base, cShirt), smoothstep(0.3, 0.5, mk.r));
          diffuseColor.rgb = mix(diffuseColor.rgb, recolour(base, cCap), mk.g);
          diffuseColor.rgb = mix(diffuseColor.rgb, recolour(base, cShoes), mk.b);
          vec2 cellUv = (vMapUv - uCell.xy) / uCell.zw;
          float sh = clamp(dot(base, vec3(0.299, 0.587, 0.114)) / 0.86, 0.55, 1.1);
          vec4 ls = decal(shirtLogo, uShirtA, cellUv, uShirtRot);
          diffuseColor.rgb = mix(diffuseColor.rgb, ls.rgb * sh, ls.a * step(0.8, mk.r) * uShirtOn);
          vec4 lc = decal(capLogo, uCapA, cellUv, 0.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, lc.rgb * sh, lc.a * step(0.5, mk.g) * uCapOn);
          diffuseColor.rgb *= vec3(1.0, 0.985, 0.95);`)},this.depthMat=new Lh({depthPacking:ph,map:this.sheet.tex,alphaTest:.5}),this.mesh=new It(this.geoFor(this.sheet),this.mat),this.mesh.customDepthMaterial=this.depthMat,this.mesh.castShadow=!0,this.mesh.renderOrder=3,this.root.add(this.mesh),this.setFrame(0)}loadBaked(t){const e=t.golferKit;if((e??"")===this.bakedFor||(this.bakedFor=e??"",this.baked={},this.reactions={},this.stopReaction(),this.chooseSheet(),!e))return;const n=new ji;for(const i of Fv){const r=`${vs}brand/${e}/golfer-${i}`;fetch(`${r}.json`).then(a=>a.ok?a.json():Promise.reject()).then(a=>{if(this.bakedFor!==e)return;const o={...We.face,...a,name:`${e}-${i}`,anchors:void 0,fps:a.fps??12};o.tex=n.load(`${r}.webp`),o.tex.colorSpace=se,o.mask=We.face.mask,o.tex.repeat.set(1/o.cols,1/o.rows),o.tex.generateMipmaps=!1,o.tex.minFilter=Be,this.reactions[i]=o}).catch(()=>{})}for(const i of Object.keys(We)){const r=`${vs}brand/${e}/golfer-${i}`;fetch(`${r}.json`).then(a=>a.ok?a.json():Promise.reject()).then(a=>{if(this.bakedFor!==e)return;const o={...We[i],...a,name:`${e}-${i}`,anchors:void 0};o.tex=n.load(`${r}.webp`,()=>this.chooseSheet()),o.tex.colorSpace=se,o.mask=We[i].mask,o.tex.repeat.set(1/o.cols,1/o.rows),o.tex.generateMipmaps=!1,o.tex.minFilter=Be,this.baked[i]=o}).catch(()=>{})}}geoFor(t){const e=new Qe(t.w,t.h);return e.translate(t.w/2-t.ax*t.w,t.h/2-t.ay*t.h,0),e}setBrand(t){this.loadBaked(t);const e=o=>new dt(o);this.uniforms.cShirt.value.copy(e(t.kit.shirt)),this.uniforms.cCap.value.copy(e(t.kit.cap)),this.uniforms.cShoes.value.copy(e(t.kit.shoes));const n=o=>{const l=new dt(o).getHSL({h:0,s:0,l:0}).l;return o.toLowerCase()===t.colors.primary.toLowerCase()?t.colors.onPrimary:l>.55?t.colors.dark:t.colors.primary},i=t.markImg??t.logoImg,r=i?(i.naturalWidth||300)/(i.naturalHeight||100):3;this.uniforms.uLogoAspect.value=r;const a=(o,l,c)=>{o.width=512,o.height=Math.max(32,Math.round(512/r));const h=o.getContext("2d");h.clearRect(0,0,o.width,o.height),su(h,t,0,0,o.width,o.height,l);const u=new Ye(o);u.colorSpace=se,this.uniforms[c].value?.dispose(),this.uniforms[c].value=u};a(this.shirtCanvas,n(t.kit.shirt),"shirtLogo"),a(this.capCanvas,n(t.kit.cap),"capLogo"),this.uniforms.uShirtOn.value=t.kit.shirtLogo?1:0,this.uniforms.uCapOn.value=t.kit.capLogo?1:0}placeAt(t,e,n,i){const r=-n,a=e;this.root.position.set(t.x-r*.78,i,t.z-a*.78),this.ball.set(t.x,i,t.z),this.golferPos.copy(this.root.position),this.mesh.position.set(t.x-this.root.position.x,0,t.z-this.root.position.z)}setPutter(t){this.stopReaction(),this.putter=t,this.chooseSheet()}chooseSheet(){const t=i=>!!(i.tex?.image&&i.mask?.image),e=i=>this.baked[i]&&t(this.baked[i])?this.baked[i]:We[i],n=this.putter&&t(e("putt"))?e("putt"):this.view==="face"&&t(e("face"))&&!this.putter?e("face"):e("drive");this.reaction||(this.uniforms.uBaked.value=Object.values(this.baked).includes(n)?1:0,this.useSheet(n),this.applyPose())}useSheet(t){t!==this.sheet&&(this.sheet=t,this.mat.map=t.tex,this.depthMat.map=t.tex,this.mat.needsUpdate=!0,this.depthMat.needsUpdate=!0,this.mesh.geometry.dispose(),this.mesh.geometry=this.geoFor(t)),this.uniforms.maskMap.value=this.sheet.mask}get reacting(){return!!this.reaction}hasReaction(t){return!!this.reactions[t]?.tex?.image}playReaction(t,e=1.35){const n=this.reactions[t];return n?.tex?.image?(this.reaction={sheet:n,start:this.clock,speed:e},this.mesh.scale.x=1,this.mirrored=!1,this.uniforms.uBaked.value=1,this.useSheet(n),this.setFrame(0),n.frames/n.fps/e):0}stopReaction(){this.reaction&&(this.reaction=null,this.chooseSheet())}applyPose(){const t=this.pose;t.kind==="back"?this.backFrame(t.p):this.followFrame(t.t,t.from)}setFrame(t){const e=this.sheet,n=Math.max(0,Math.min(e.frames-1,Math.round(t)));this.frame=n;const i=n%e.cols,r=Math.floor(n/e.cols),a=i/e.cols,o=1-(r+1)/e.rows;e.tex.offset.set(a,o),e.mask.offset.set(a,o),this.uniforms.maskMap.value=e.mask,this.uniforms.uCell.value.set(a,o,1/e.cols,1/e.rows);const l=e.anchors?.[n];l?(this.uniforms.uShirtA.value.set(l[0],l[1],l[2]),this.uniforms.uCapA.value.set(l[3],l[4],l[5]),this.uniforms.uShirtRot.value=l[6]??0):(this.uniforms.uShirtA.value.set(0,0,0),this.uniforms.uCapA.value.set(0,0,0))}setBackswing(t){this.stopReaction(),this.pose={kind:"back",p:t},this.backFrame(t)}backFrame(t){const e=this.sheet,n=this.putter&&e===We.drive?.25:1;this.setFrame(e.address+(e.top-e.address)*Math.max(0,Math.min(1,t))*n)}setFollow(t,e){this.stopReaction(),this.pose={kind:"follow",t,from:e},this.followFrame(t,e)}followFrame(t,e){const n=this.sheet,i=this.putter&&n===We.drive?.25:1,r=n.address+(n.top-n.address)*Math.max(0,Math.min(1,e))*i;if(t<.3){const a=t/.3,o=Math.max(r,n.top);this.setFrame(a<.08?r:o+(n.impact-o)*a)}else{const a=(t-.3)/.7,o=this.putter&&n===We.drive?n.impact+6:n.finish;this.setFrame(n.impact+(o-n.impact)*Math.min(1,a*1.15))}}idle(t){}update(t,e=this.clock){this.clock=e;const n=t.position,i=this.ball;if(this.mesh.rotation.y=Math.atan2(n.x-i.x,n.z-i.z),this.reaction){const v=this.reaction,m=(this.clock-v.start)*v.sheet.fps*v.speed;this.setFrame(Math.min(v.sheet.frames-1,m));return}const r=i.x-this.golferPos.x,a=i.z-this.golferPos.z,o=Math.hypot(r,a)||1,l=n.x-this.golferPos.x,c=n.z-this.golferPos.z,h=Math.hypot(l,c)||1,u=(l*r+c*a)/(h*o),f=(l*(a/o)+c*(-r/o))/h,d=u>.5&&!this.putter?"face":"dtl";(d!==this.view||d==="face"&&this.sheet!==We.face&&We.face.tex?.image)&&(this.view=d,this.chooseSheet());const g=d==="dtl"&&f>.35;g!==this.mirrored&&(this.mirrored=g,this.mesh.scale.x=g?-1:1)}}const Yh={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class is{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const zv=new Vo(-1,1,1,-1,0,1);class Bv extends ue{constructor(){super(),this.setAttribute("position",new Yt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Yt([0,2,0,0,2,0],2))}}const kv=new Bv;class nl{constructor(t){this._mesh=new It(kv,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,zv)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class Hv extends is{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof me?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=hn.clone(t.uniforms),this.material=new me({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new nl(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class zc extends is{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){const i=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),r.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(i.EQUAL,1,4294967295),r.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),r.buffers.stencil.setLocked(!0)}}class Gv extends is{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class Vv{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const n=t.getSize(new it);this._width=n.width,this._height=n.height,e=new Je(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Rn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Hv(Yh),this.copyPass.material.blending=Cn,this.clock=new tv}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let n=!1;for(let i=0,r=this.passes.length;i<r;i++){const a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}zc!==void 0&&(a instanceof zc?n=!0:a instanceof Gv&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new it);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,i)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Wv extends is{constructor(t,e,n=null,i=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new dt}render(t,e,n){const i=t.autoClear;t.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),t.autoClear=i}}const Xv={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new dt(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Ji extends is{constructor(t,e,n,i){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=i,this.resolution=t!==void 0?new it(t.x,t.y):new it(256,256),this.clearColor=new dt(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Je(r,a,{type:Rn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const f=new Je(r,a,{type:Rn});f.texture.name="UnrealBloomPass.h"+u,f.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(f);const d=new Je(r,a,{type:Rn});d.texture.name="UnrealBloomPass.v"+u,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}const o=Xv;this.highPassUniforms=hn.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new me({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new it(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=Yh;this.copyUniforms=hn.clone(h.uniforms),this.blendMaterial=new me({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:Rs,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new dt,this.oldClearAlpha=1,this.basic=new qe,this.fsQuad=new nl(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),i=Math.round(e/2);this.renderTargetBright.setSize(n,i);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,i),this.renderTargetsVertical[r].setSize(n,i),this.separableBlurMaterials[r].uniforms.invSize.value=new it(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(t,e,n,i,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=Ji.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Ji.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=a}getSeperableBlurMaterial(t){const e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new me({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new it(.5,.5)},direction:{value:new it(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new me({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Ji.BlurDirectionX=new it(1,0);Ji.BlurDirectionY=new it(0,1);const $v={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class qv extends is{constructor(){super();const t=$v;this.uniforms=hn.clone(t.uniforms),this.material=new Xg({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new nl(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},$t.getTransfer(this._outputColorSpace)===ee&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Qc?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===th?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===eh?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===nh?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ih?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Po&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Yv{constructor(t){this.scene=new uc,this.props=new xv,this.golfer=new Ov,this.crowd=new Tv,this.dressing=new Nv,this.visual=null,this.course=null,this.quality=3,this.sunDir=new A,this.shadowFocus=new A,this.clockT=0,this.composer=null;const e=matchMedia("(pointer: coarse)").matches,n=new URL(location.href).searchParams.get("q");this.fixedPixelRatio=n==="test",this.lowSpec=n==="low"||e&&(navigator.hardwareConcurrency??8)<=4,this.renderer=new ug({canvas:t,antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(n==="test"?.5:Math.min(window.devicePixelRatio,this.lowSpec?1.5:2)),this.renderer.outputColorSpace=se,this.renderer.toneMapping=Po,this.renderer.toneMappingExposure=.78,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Jc,this.camera=new Xe(55,1,.1,4e3),this.sky=new Fs,this.sky.scale.setScalar(3500);const i=this.sky.material.uniforms;i.turbidity.value=4.5,i.rayleigh.value=1.4,i.mieCoefficient.value=.004,i.mieDirectionalG.value=.82,this.sunDir.copy(Hi),i.sunPosition.value.copy(this.sunDir),this.scene.add(this.sky);const r=new Mo(this.renderer),a=new uc,o=new Fs;o.scale.setScalar(1e3),Object.assign(o.material.uniforms.sunPosition.value,this.sunDir),o.material.uniforms.turbidity.value=4.5,o.material.uniforms.rayleigh.value=1.4,a.add(o);const l=r.fromScene(a,.02).texture;this.scene.environment=l,this.scene.environmentIntensity=.55;const c=el().sky;c.generateMipmaps=!1,c.minFilter=Be,c.wrapS=ln,this.skyDome=new It(new Os(3e3,48,24),new me({uniforms:{map:{value:c}},vertexShader:"varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D map; varying vec3 vDir;
          void main(){
            vec3 d = normalize(vDir);
            float e = asin(clamp(d.y, -1.0, 1.0));
            float v = clamp((e + 0.025) / (1.5708 + 0.025), 0.004, 0.996);
            float u = atan(d.z, d.x) / 6.2831853 + 0.5;
            gl_FragColor = vec4(texture2D(map, vec2(u, v)).rgb, 1.0);
            #include <colorspace_fragment>
          }`,side:Le,depthWrite:!1,fog:!1,toneMapped:!1})),this.skyDome.renderOrder=-10;const h=(()=>{const d=document.createElement("canvas");d.width=d.height=256;const g=d.getContext("2d"),v=g.createRadialGradient(128,128,0,128,128,128);v.addColorStop(0,"rgba(255,250,235,1)"),v.addColorStop(.08,"rgba(255,244,214,0.9)"),v.addColorStop(.3,"rgba(255,226,170,0.25)"),v.addColorStop(1,"rgba(255,220,160,0)"),g.fillStyle=v,g.fillRect(0,0,256,256);const m=new Ye(d);return m.colorSpace=se,m})();this.sunGlow=new Ih(new $o({map:h,blending:Rs,depthWrite:!1,fog:!1,transparent:!0})),this.sunGlow.scale.setScalar(900),this.sunGlow.renderOrder=-9,this.scene.add(this.sunGlow),this.skyDome.frustumCulled=!1,this.scene.add(this.skyDome),this.sky.visible=!1,this.scene.fog=new Xo(11126750,300,1900),this.hemi=new Kg(14084351,6974028,.8),this.scene.add(this.hemi),this.sun=new Qg(16773590,3),this.sun.castShadow=!0;const u=this.lowSpec?1024:2048;this.sun.shadow.mapSize.set(u,u);const f=this.sun.shadow.camera;f.left=-45,f.right=45,f.top=45,f.bottom=-45,f.near=1,f.far=400,this.sun.shadow.bias=-4e-4,this.sun.shadow.normalBias=.04,this.scene.add(this.sun,this.sun.target),this.scene.add(this.props.group),this.scene.add(this.crowd.group),this.scene.add(this.dressing.group),this.scene.add(this.golfer.root),this.fx=new _v(this.scene),this.reader=new wv(this.scene),this.grass=new Cv(this.lowSpec?7e3:16e3,this.lowSpec?14:20),this.scene.add(this.grass.mesh),this.rough=new Rv(this.lowSpec?7e3:18e3),this.scene.add(this.rough.mesh),this.lowSpec&&(this.quality=2),this.lowSpec||(this.composer=new Vv(this.renderer),this.composer.addPass(new Wv(this.scene,this.camera)),this.composer.addPass(new Ji(new it(256,256),.22,.6,.86)),this.composer.addPass(new qv)),this.resize(),addEventListener("resize",()=>this.resize())}degrade(){if(this.quality===3&&this.composer)this.composer=null,this.quality=2;else if(this.quality>=2){const t=this.renderer.getPixelRatio();if(t>1.01){this.renderer.setPixelRatio(Math.max(1,t-.5)),this.resize();return}this.quality=1}else this.quality===1&&(this.sun.castShadow=!1,this.grass.mesh.count=Math.floor(this.grass.mesh.count/2),this.rough.mesh.count=Math.floor(this.rough.mesh.count/2),this.quality=0)}resize(){const t=innerWidth,e=innerHeight;this.renderer.setSize(t,e,!1),this.composer?.setPixelRatio(this.renderer.getPixelRatio()),this.composer?.setSize(t,e),this.renderer.domElement.style.width="100%",this.renderer.domElement.style.height="100%",this.camera.aspect=t/e,this.camera.fov=t<e?62:50,this.camera.updateProjectionMatrix()}loadCourse(t){this.visual&&(this.scene.remove(this.visual.group),this.visual.dispose()),this.course=t,this.visual=mv(t,{lowSpec:this.lowSpec,reflect:!this.lowSpec&&this.quality>=2}),this.scene.add(this.visual.group),this.props.placeFor(t),this.reader.setCourse(t),this.crowd.placeFor(t),this.grass.setCourse(t),this.rough.placeFor(t),this.fx.clearMarks(),this.quality===0&&(this.rough.mesh.count=Math.floor(this.rough.mesh.count/2)),this.dressing.placeFor(t)}applyBrand(t){this.props.applyBrand(t),this.golfer.setBrand(t),this.fx.setBrand(t),this.reader.setColor(t.colors.light),this.crowd.applyBrand(t),this.dressing.applyBrand(t)}focusShadows(t){this.shadowFocus.lerp(t,.15);const e=this.shadowFocus;this.sun.position.set(e.x+this.sunDir.x*200,e.y+this.sunDir.y*200,e.z+this.sunDir.z*200),this.sun.target.position.copy(e)}render(t){this.clockT+=t,this.visual?.update(this.clockT),this.skyDome.position.copy(this.camera.position),this.sunGlow.position.copy(this.camera.position).addScaledVector(this.sunDir,2800),this.skyDome.rotation.y=this.clockT*.002;const e=this.course?.pin,n=e?this.camera.position.distanceTo(new A(e.x,e.y,e.z)):100;this.props.update(this.clockT,n),this.fx.update(t,this.camera,this.clockT),this.reader.update(t),this.golfer.update(this.camera,this.clockT),this.crowd.update(t),this.grass.update(t,this.fx.ball.position),this.rough.update(t,this.camera),this.composer?this.composer.render(t):this.renderer.render(this.scene,this.camera)}get time(){return this.clockT}pickGround(t,e){if(!this.visual)return null;const n=new ev,i=new it(t/innerWidth*2-1,-(e/innerHeight)*2+1);n.setFromCamera(i,this.camera);const r=this.visual.group.getObjectByName("terrain");if(!r)return null;const a=n.intersectObject(r,!1)[0];return a?a.point:null}}const qt=(s,t,e)=>{const n=document.createElement(s);return t&&(n.className=t),e!==void 0&&(n.innerHTML=e),n},Ta={map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',arrow:'<svg viewBox="0 0 24 24"><path d="M12 2 19 13h-5v9h-4v-9H5z" fill="currentColor"/></svg>'};class Zv{constructor(t){this.toastTimer=0,this.miniTimer=0,this.root=t,this.hud=this.buildHud(),this.toastEl=qt("div","toast passthrough"),this.miniEl=qt("div","mini passthrough"),this.title=qt("div","overlay title-screen"),this.holeCard=qt("div","overlay holecard passthrough"),this.scoreCard=qt("div","overlay"),this.studio=qt("div","overlay studio"),this.pause=qt("div","overlay pause"),this.loading=qt("div","overlay loading show",'<div class="spinner"></div><p>LOADING COURSE</p>'),this.fadeEl=qt("div","fade"),this.board=qt("div","overlay board"),this.nameBox=qt("div","overlay namebox"),t.append(this.board,this.nameBox,this.hud.root,this.toastEl,this.miniEl,this.holeCard,this.scoreCard,this.title,this.studio,this.pause,this.fadeEl,this.loading)}buildHud(){const t=qt("div","hud"),e=qt("div","topbar"),n=qt("div","scorebox"),i=(D,U="")=>{const k=qt("div",U,`<small>${D}</small><b>-</b>`);return n.append(k),k.querySelector("b")},r=i("HOLE"),a=i("PAR"),o=i("SHOT"),l=i("TOTAL","tp"),c=qt("div","rightcol"),h=qt("div","wind",`<div class="dial">${Ta.arrow}</div><div><small>WIND</small><b>0.0</b><small>M/S</small></div>`),u=qt("div","lie","<small>LIE</small><b>100%</b><small>TEE</small>");c.append(h,u),e.append(n,c);const f=qt("div","pinpill passthrough","<small>TO PIN</small><span>0 M</span>"),d=qt("div","pinmark passthrough hide","PIN"),g=qt("button","menubtn",Ta.menu);g.setAttribute("aria-label","Menu");const v=qt("div","bottombar"),m=qt("div","club"),p=qt("button","","&#9664;");p.setAttribute("aria-label","Previous club");const _=qt("button","","&#9654;");_.setAttribute("aria-label","Next club");const M=qt("div","name","<b>DR</b><small>228 M</small>");m.append(p,M,_);const x=qt("div","rightbtns"),R=qt("button","iconbtn",Ta.map);R.setAttribute("aria-label","Toggle map view"),x.append(R),v.append(m,x);const T=qt("div","pad",'<div class="label">PULL BACK</div><div class="ring"><div class="ball"></div></div>'),E=qt("div","pull",'<div class="track"></div><div class="meter"><i></i><em></em></div><div class="pct">0%</div><div class="knob"></div>'),P=qt("div","hint","Drag to aim &middot; Pull ball down &amp; flick up"),y=qt("div","tmeter passthrough",'<div class="tlabel">TAP TO SWING</div><div class="tbar"><div class="thook"></div><div class="tfill"></div><div class="tsweet"></div><div class="tzero"></div><i class="ttick" style="left:33%"></i><i class="ttick" style="left:55.4%"></i><i class="ttick" style="left:77.7%"></i><div class="tnotch"></div><div class="tmarker"></div></div><div class="tpct">0%</div>'),L=qt("div","swipeguide passthrough",`<svg class="trail" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="" /></svg>
      <div class="sg-lane"><i class="sg-line"></i><i class="sg-streak"></i></div>
      <div class="sg-target"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="20" r="7" fill="currentColor"/></svg><span>AIM HERE</span></div>
      <div class="sg-hand"><svg viewBox="0 0 64 84" aria-hidden="true">
      <g fill="#fff" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round">
        <path d="M24 40V9a7 7 0 0 1 14 0v28"/>
        <path d="M38 36v-4a6.5 6.5 0 0 1 13 0v8"/>
        <path d="M51 38a6 6 0 0 1 12 0v14c0 16-10 28-26 28h-3c-10 0-16-5-21-13L4 52a6 6 0 0 1 9-7l11 11"/>
        <path d="M24 40v16"/>
      </g>
      <circle cx="31" cy="6" r="5" fill="none" stroke="var(--brand)" stroke-width="2.5" class="tap"/>
    </svg></div>
      <div class="sg-label">SWIPE STRAIGHT UP<small>Keep it on the line, toward the target</small></div>`);return t.append(e,f,d,g,v,P,y,T,E,L),{root:t,hole:r,par:a,shot:o,toPar:l,windArrow:h.querySelector("svg"),windSpeed:h.querySelector("b"),lieVal:u.querySelector("b"),lieName:u.querySelectorAll("small")[1],pin:f.querySelector("span"),pinMark:d,clubName:M.querySelector("b"),clubDist:M.querySelector("small"),clubPrev:p,clubNext:_,viewBtn:R,menuBtn:g,pad:T,padLabel:T.querySelector(".label"),pull:E,pullTrack:E.querySelector(".track"),pullKnob:E.querySelector(".knob"),pullMeter:E.querySelector(".meter"),pullFill:E.querySelector(".meter i"),pullPct:E.querySelector(".pct"),hint:P,tmeter:y,tLabel:y.querySelector(".tlabel"),tMarker:y.querySelector(".tmarker"),tNotch:y.querySelector(".tnotch"),tFill:y.querySelector(".tfill"),tSweet:y.querySelector(".tsweet"),tPct:y.querySelector(".tpct"),swipeGuide:L,swipeTrail:L.querySelector("polyline")}}showHud(t){this.hud.root.classList.toggle("show",t)}toast(t,e="",n=1700){this.toastEl.innerHTML=`<b>${t}</b>${e?`<small>${e}</small>`:""}`,this.toastEl.classList.add("show"),clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>this.toastEl.classList.remove("show"),n)}mini(t,e=1600){this.miniEl.textContent=t,this.miniEl.classList.add("show"),clearTimeout(this.miniTimer),this.miniTimer=window.setTimeout(()=>this.miniEl.classList.remove("show"),e)}show(t,e){t.classList.toggle("show",e)}async fade(t){this.fadeEl.classList.add("on"),await Cs(300),await t(),await Cs(60),this.fadeEl.classList.remove("on")}renderTitle(t,e,n,i,r,a,o="timing",l=()=>{},c=()=>{},h=null,u=()=>{}){const f=t.brand,d=f.gameTitle.split(" "),g=d.pop();this.title.innerHTML=`
      <div class="title-top">
        <img alt="${f.name}" src="${Kv(t)}"/>
        <h1>${d.join(" ")}${d.length?"<br/>":""}<span>${g}</span></h1>
        <p>${f.courseName}</p>
      </div>
      <div class="title-bottom">
        <div class="row">
          <button class="btn start" data-a="play">Start Now<small>Quick 3 holes${e[0]!==null?` &middot; best ${e[0]}`:""}</small></button>
          <button class="btn start" data-a="play9">Start Now<small>Full 9 holes${e[1]!==null?` &middot; best ${e[1]}`:""}</small></button>
        </div>
        <button class="btn ghost" data-a="ctp">Closest to the Pin${h!==null?` &middot; Best ${h.toFixed(2)} M`:" &middot; 3 Balls"}</button>
        <button class="btn ghost" data-a="mute">${r?"Sound Off":"Sound On"}</button>
        <div class="foot">${f.tagline.toUpperCase()}</div>
      </div>`,this.title.querySelector('[data-a="play"]').onclick=()=>n(3),this.title.querySelector('[data-a="play9"]').onclick=()=>n(9),this.title.querySelector('[data-a="mute"]').onclick=a,this.title.querySelector('[data-a="ctp"]').onclick=c}renderHoleCard(t,e,n,i,r){this.holeCard.innerHTML=`<div class="l3">
        ${r?`<video class="l3flag" src="${r}" autoplay muted loop playsinline></video>`:""}
        <div class="l3n"><small>HOLE</small><b>${t}</b></div>
        <div class="l3t"><h2></h2><div class="meta"><span>PAR ${n}</span><i></i><span>${i} M</span></div></div>
      </div><div class="tap">TAP TO SKIP</div>`,this.holeCard.querySelector("h2").textContent=e.toUpperCase();const a=this.holeCard.querySelector("video");a&&(a.muted=!0,a.play().catch(()=>a.remove()),a.onerror=()=>a.remove())}renderScorecard(t,e,n,i){const r=n.reduce((h,u)=>h+(u.strokes??0),0),a=n.reduce((h,u)=>h+(u.strokes!==null?u.par:0),0),o=r-a,l=o===0?"E":o>0?`+${o}`:`${o}`,c=(h,u)=>h===null?"":h===1?"ace":h<u?"under":h>u?"over":"";this.scoreCard.innerHTML=`<div class="card">
      <h3>${t}</h3><div class="sub">${e}</div>
      <table class="sc ${n.length>5?"nine":""}">
        <tr><th></th>${n.map((h,u)=>`<th>${u+1}</th>`).join("")}<th>TOT</th></tr>
        <tr><td class="lbl">PAR</td>${n.map(h=>`<td>${h.par}</td>`).join("")}<td>${n.reduce((h,u)=>h+u.par,0)}</td></tr>
        <tr><td class="lbl">SCORE</td>${n.map(h=>`<td><span class="b ${c(h.strokes,h.par)}">${h.strokes??"-"}</span></td>`).join("")}<td class="tot">${r||"-"}</td></tr>
        <tr><td class="lbl">TO PAR</td><td colspan="${n.length}"></td><td class="tot">${r?l:"-"}</td></tr>
      </table>
      <div style="display:flex;flex-direction:column;gap:10px">${i.map((h,u)=>`<button class="btn ${h.ghost?"ghost":""}" data-i="${u}">${h.label}</button>`).join("")}</div>
    </div>`,this.scoreCard.querySelectorAll("button[data-i]").forEach(h=>{h.onclick=()=>i[Number(h.dataset.i)].on()})}renderPause(t,e,n,i,r,a,o,l){this.pause.innerHTML=`<div class="card"><h3>PAUSED</h3>
      <button class="btn" data-a="r">Resume</button>
      <button class="btn ghost" data-a="w">Swing: ${o==="hybrid"?"Power + Swipe":o==="timing"?"Tap Timing":"Pull + Flick"}</button>
      <button class="btn ghost" data-a="s" style="display:none">Brand Studio</button>
      <button class="btn ghost" data-a="m">${r?"Sound Off":"Sound On"}</button>
      <button class="btn ghost" data-a="x">Restart Round</button>
      <button class="btn ghost" data-a="q">Main Menu</button></div>`;const c=h=>this.pause.querySelector(`[data-a="${h}"]`);c("r").onclick=t,c("s").onclick=n,c("m").onclick=a,c("x").onclick=e,c("q").onclick=i,c("w").onclick=l}fillMiniBoard(t,e,n,i,r=5){if(t.className="miniboard",t.dataset.m=n,t.dataset.t=i,t.dataset.n=String(r),t.replaceChildren(),e.status==="off"){t.hidden=!0;return}t.hidden=!1;const a=document.createElement("h4");a.textContent=i,t.append(a);const o=e.top(n,r),l=document.createElement("ol"),c=h=>n==="ctp"?h===0?"ACE":`${h.toFixed(2)} M`:String(h);if(!o.length){const h=document.createElement("li");h.className="empty",h.textContent=e.status==="loading"?"Loading scores...":e.status==="stale"?"Can't reach the leaderboard":"No scores yet. Be the first.",l.append(h)}o.forEach((h,u)=>{const f=document.createElement("li");h.id===e.uid&&(f.className="me"),f.append(Object.assign(document.createElement("b"),{textContent:String(u+1)}),Object.assign(document.createElement("span"),{textContent:h.name||"Player"}),Object.assign(document.createElement("em"),{textContent:c(h[n])})),l.append(f)}),t.append(l)}renderBoard(t,e,n,i,r){const a=[["ctp","Closest to Pin"],["r3","3 Holes"],["r9","9 Holes"]];this.board.innerHTML=`<div class="card lb">
      <h3>LEADERBOARD</h3>
      <div class="tabs">${a.map(([d,g])=>`<button data-m="${d}" class="${d===e?"on":""}">${g}</button>`).join("")}</div>
      <div class="lbstatus"></div>
      <ol class="lbrows"></ol>
      <div class="row"><button class="btn ghost" data-a="rename">Change Name</button><button class="btn" data-a="close">Close</button></div>
    </div>`;const o=this.board.querySelector(".lbstatus"),l={off:"The leaderboard isn't available here.",loading:"Loading scores...",stale:"Can't reach the leaderboard yet. Scores may be out of date.",readonly:"View only: ask the owner for Contributor access to post your scores.",ready:""};o.textContent=l[t.status]??"";const c=this.board.querySelector(".lbrows"),h=t.top(e,15);if(!h.length&&t.status!=="off"){const d=document.createElement("li");d.className="empty",d.textContent=e==="ctp"?"No scores yet. Play Closest to the Pin to set the first.":"No rounds yet. Finish a round to set the first score.",c.append(d)}h.forEach((d,g)=>{const v=document.createElement("li");d.id===t.uid&&(v.className="me");const m=document.createElement("b");m.textContent=String(g+1);const p=document.createElement("span");p.textContent=d.name||"Player";const _=document.createElement("em"),M=d[e];_.textContent=e==="ctp"?M===0?"ACE":`${M.toFixed(2)} M`:`${M}`,v.append(m,p,_),c.append(v)});const u=t.mine?.[e];if(typeof u=="number"&&!h.some(d=>d.id===t.uid)){const d=document.createElement("li");d.className="me";const{rank:g}=t.rankOf(e,u);d.append(Object.assign(document.createElement("b"),{textContent:String(g)}),Object.assign(document.createElement("span"),{textContent:t.myName||"You"}),Object.assign(document.createElement("em"),{textContent:e==="ctp"?`${u.toFixed(2)} M`:String(u)})),c.append(d)}this.board.querySelectorAll("[data-m]").forEach(d=>d.onclick=()=>n(d.dataset.m)),this.board.querySelector('[data-a="close"]').onclick=i;const f=this.board.querySelector('[data-a="rename"]');f.onclick=r,f.disabled=!t.canPost}askName(t,e=!1){return new Promise(n=>{this.nameBox.innerHTML=e?`<form class="card"><h3>YOUR INITIALS</h3><div class="sub">3 LETTERS ON THE WORLDWIDE LEADERBOARD</div>
        <div class="texts"><label>INITIALS<input id="lbname" class="initials" maxlength="3" minlength="3" pattern="[A-Za-z0-9]{3}" autocomplete="off" autocapitalize="characters" spellcheck="false" required /></label></div>
        <div class="row" style="margin-top:12px"><button type="button" class="btn ghost" data-a="skip">Skip</button><button class="btn" type="submit">Save</button></div></form>`:`<form class="card"><h3>YOUR NAME</h3><div class="sub">SHOWN ON THE SHARED LEADERBOARD</div>
        <div class="texts"><label>NAME<input id="lbname" maxlength="16" autocomplete="nickname" required /></label></div>
        <div class="row" style="margin-top:12px"><button type="button" class="btn ghost" data-a="skip">Skip</button><button class="btn" type="submit">Save</button></div></form>`;const i=this.nameBox.querySelector("input");i.value=e?t.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,3):t,e&&(i.oninput=()=>i.value=i.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,3));const r=this.nameBox.querySelector("form"),a=o=>{this.show(this.nameBox,!1),n(o)};r.onsubmit=o=>{o.preventDefault();const l=i.value.replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,16);e&&!/^[A-Z0-9]{3}$/.test(l)||a(l||null)},this.nameBox.querySelector('[data-a="skip"]').onclick=()=>a(null),this.show(this.nameBox,!0),setTimeout(()=>i.focus(),50)})}renderStudio(t,e,n){const i=t.brand,r=(c,h,u)=>`<label class="sw">${h}<input type="color" data-p="${c}" value="${jv(u)}"/></label>`,a=c=>`<button data-preset="${c.id}" class="${c.id===i.id?"on":""}"><i style="background:${c.colors.primary}"></i>${c.name}</button>`;this.studio.innerHTML=`<div class="sheet">
      <div class="head"><h3>BRAND STUDIO</h3><button data-a="close">Done</button></div>
      <h4>PRESETS</h4>
      <div class="presets">${t.presets.map(a).join("")}</div>
      <h4>LIVE PREVIEW</h4>
      <div class="previews" data-previews></div>
      <h4>GOLFER KIT</h4>
      <div class="swatches">
        ${r("kit.shirt","Shirt",i.kit.shirt)}${r("kit.sleeve","Sleeves",i.kit.sleeve)}${r("kit.pants","Pants",i.kit.pants)}
        ${r("kit.cap","Cap",i.kit.cap)}${r("kit.shoes","Shoes",i.kit.shoes)}${r("kit.glove","Glove",i.kit.glove)}
      </div>
      <div class="toggles" style="margin-top:8px">
        <label><input type="checkbox" data-t="kit.shirtLogo" ${i.kit.shirtLogo?"checked":""}/>Logo on shirt</label>
        <label><input type="checkbox" data-t="kit.capLogo" ${i.kit.capLogo?"checked":""}/>Logo on cap</label>
      </div>
      <h4>COURSE</h4>
      <div class="swatches">
        ${r("course.flag","Flag",i.course.flag)}${r("course.flagLogoColor","Flag Logo",i.course.flagLogoColor)}${r("course.pole","Pin",i.course.pole)}
        ${r("course.teeMarker","Tee Markers",i.course.teeMarker)}${r("course.board","Boards",i.course.board)}${r("course.boardText","Board Text",i.course.boardText)}
        ${r("course.tracer","Ball Tracer",i.course.tracer)}${r("course.ball","Ball",i.course.ball)}
      </div>
      <h4>INTERFACE</h4>
      <div class="swatches">
        ${r("colors.primary","Primary",i.colors.primary)}${r("colors.onPrimary","On Primary",i.colors.onPrimary)}
        ${r("colors.dark","Dark",i.colors.dark)}${r("colors.light","Light",i.colors.light)}
      </div>
      <h4>TEXT</h4>
      <div class="texts">
        <label>GAME TITLE<input data-x="gameTitle" value="${Mr(i.gameTitle)}" maxlength="24"/></label>
        <label>COURSE NAME<input data-x="courseName" value="${Mr(i.courseName)}" maxlength="32"/></label>
        <label>TAGLINE (BOARDS)<input data-x="tagline" value="${Mr(i.tagline)}" maxlength="40"/></label>
        <label>BRAND NAME<input data-x="name" value="${Mr(i.name)}" maxlength="32"/></label>
      </div>
      <h4>LOGO &amp; EXPORT</h4>
      <div class="actions">
        <label>Upload logo<input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" data-a="logo"/></label>
        <button data-a="logo-reset">Preset logo</button>
        <button data-a="export">Download brand.json</button>
        <button data-a="copy">Copy JSON</button>
      </div>
    </div>`;const o=this.studio.querySelector("[data-previews]");e.forEach(c=>o.append(c)),this.studio.querySelector('[data-a="close"]').onclick=n,this.studio.querySelectorAll("[data-preset]").forEach(c=>{c.onclick=async()=>{await t.selectPreset(c.dataset.preset),this.renderStudio(t,e,n)}}),this.studio.querySelectorAll("input[type=color]").forEach(c=>{c.oninput=()=>t.patch(c.dataset.p,c.value)}),this.studio.querySelectorAll("input[data-t]").forEach(c=>{c.onchange=()=>t.patch(c.dataset.t,c.checked)}),this.studio.querySelectorAll("input[data-x]").forEach(c=>{c.onchange=()=>t.patch(c.dataset.x,c.value||" ")});const l=this.studio.querySelector('[data-a="logo"]');l.onchange=()=>{const c=l.files?.[0];if(!c)return;const h=new FileReader;h.onload=()=>t.setCustomLogo(String(h.result)),h.readAsDataURL(c)},this.studio.querySelector('[data-a="logo-reset"]').onclick=()=>t.setCustomLogo(null),this.studio.querySelector('[data-a="export"]').onclick=()=>{const c=new Blob([t.exportJson()],{type:"application/json"}),h=document.createElement("a");h.href=URL.createObjectURL(c),h.download="brand.json",h.click(),setTimeout(()=>URL.revokeObjectURL(h.href),2e3)},this.studio.querySelector('[data-a="copy"]').onclick=async()=>{try{await navigator.clipboard.writeText(t.exportJson()),this.mini("brand.json copied")}catch{this.mini("Copy blocked: use Download")}}}}function Kv(s){const t=s.brand.logoImg;return t?t.src:ci(s.brand.id,s.brand.logo)}function jv(s){return/^#[0-9a-f]{6}$/i.test(s)?s:/^#[0-9a-f]{3}$/i.test(s)?"#"+s.slice(1).split("").map(t=>t+t).join(""):"#ffffff"}function Mr(s){return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}const Cs=s=>new Promise(t=>setTimeout(t,s));function Jv(s,t,e,n,i){const r=t.filter(o=>o!==null),a=r.length?Math.min(...r):null;s.scoreCard.innerHTML=`<div class="card">
    <h3>CLOSEST TO THE PIN</h3>
    <div class="sub">${a!==null?`BEST BALL ${a.toFixed(2)} M`:"NO BALL ON DRY LAND"}${n?"  ·  NEW RECORD":e!==null?`  ·  RECORD ${e.toFixed(2)} M`:""}</div>
    <table class="sc"><tr><th></th><th>BALL 1</th><th>BALL 2</th><th>BALL 3</th></tr>
    <tr><td class="lbl">TO PIN</td>${t.map(o=>`<td class="${o!==null&&o===a?"tot":""}">${o===null?"WET":o===0?"ACE":`${o.toFixed(2)} M`}</td>`).join("")}</tr></table>
    <div style="display:flex;flex-direction:column;gap:10px">${i.map((o,l)=>`<button class="btn ${o.ghost?"ghost":""}" data-i="${l}">${o.label}</button>`).join("")}</div>
  </div>`,s.scoreCard.querySelectorAll("button[data-i]").forEach(o=>{o.onclick=()=>i[Number(o.dataset.i)].on()})}const ys=40,Bc=392,kc=.088;function Qv(s,t=172){const e=document.createElement("div");e.className="ballload",e.style.setProperty("--ball",`${t}px`),e.style.setProperty("--frames",String(ys));const n=document.createElement("div");n.className="ballwin";const i=document.createElement("div");i.className="ballshadow",e.append(n,i);let r=!1;const a=()=>{r||(r=!0,n.querySelector("video")?.remove(),n.append(tx(s,t)))};if(!s.loaderVideo||!s.logoTintable)return a(),e;const o=document.createElement("video");o.className="ballvideo",o.muted=!0,o.loop=!0,o.autoplay=!0,o.playsInline=!0,o.setAttribute("playsinline",""),o.setAttribute("muted",""),o.preload="auto";const l=ci(s.id,s.loaderVideo);s.loaderPoster&&(o.poster=ci(s.id,s.loaderPoster));const c=document.createElement("source");return c.src=l,c.type="video/mp4",o.append(c),o.addEventListener("error",a),c.addEventListener("error",a),n.append(o),o.play().catch(()=>{s.loaderPoster||a()}),e}function tx(s,t){const e=Math.min(2,window.devicePixelRatio||1),n=Math.round(t*e),{dimples:i,sorted:r}=ex(),a=nx(s,i,r),o=document.createElement("canvas");o.width=n,o.height=n*ys;const l=o.getContext("2d"),c=.38,h=Math.cos(c),u=Math.sin(c),f=Ea([-.5,.62,.62]),d=Ea([.7,-.2,.5]),g=Ea([f[0],f[1],f[2]+1]),v=l.createImageData(n,n),m=v.data,p=n/2-1.5,_=Math.cos(kc),{w:M,h:x,idx:R,col:T}=a;for(let E=0;E<ys;E++){const P=E/ys*Math.PI*2,y=Math.cos(P),S=Math.sin(P);for(let L=0;L<n;L++)for(let D=0;D<n;D++){const U=(L*n+D)*4,k=(D+.5-n/2)/p,B=-(L+.5-n/2)/p,G=k*k+B*B;if(G>=1){m[U+3]=0;continue}const Y=Math.sqrt(1-G),z=B*h+Y*u,V=-B*u+Y*h,Q=k,st=Q*y+V*S,rt=z,Lt=-Q*S+V*y,$=Math.atan2(st,Lt),tt=Math.asin(rt>1?1:rt<-1?-1:rt);let lt=$/(Math.PI*2)+.5;lt-=Math.floor(lt);const et=.5-tt/Math.PI,St=Math.min(x-1,et*x|0)*M+(lt*M|0);let _t=k,wt=B,Ut=Y,Pt=1;const jt=R[St];if(jt>=0){const ut=i[jt],ot=ut[0]*st+ut[1]*rt+ut[2]*Lt;if(ot>_){const Ht=Math.acos(Math.min(1,ot))/kc;let nt=ut[0]-st*ot,Mt=ut[1]-rt*ot,Rt=ut[2]-Lt*ot;const Dt=Math.hypot(nt,Mt,Rt)||1;nt/=Dt,Mt/=Dt,Rt/=Dt;const yt=nt*y-Rt*S,Wt=nt*S+Rt*y,Ot=Mt,ie=yt,I=Ot*h-Wt*u,ht=Ot*u+Wt*h,q=.55*Math.sin(Ht*Math.PI*.5)*(Ht>.82?(1-Ht)/.18:1);_t+=ie*q,wt+=I*q,Ut+=ht*q;const j=Math.hypot(_t,wt,Ut);_t/=j,wt/=j,Ut/=j,Pt=.86+.14*Ht}}const N=Math.max(0,_t*f[0]+wt*f[1]+Ut*f[2]),de=Math.max(0,_t*d[0]+wt*d[1]+Ut*d[2]),Nt=Math.pow(Math.max(0,_t*g[0]+wt*g[1]+Ut*g[2]),70)*.42,ft=Math.pow(Math.max(0,_t*g[0]+wt*g[1]+Ut*g[2]),8)*.08,xt=Math.pow(1-Y,2.5),Xt=(.3+N*.78+de*.16)*Pt,bt=St*3,C=175,w=200,H=230,Z=xt*.35*(.5+.5*B),J=Math.min(1,(1-Math.sqrt(G))*p*1.2),K=1-Math.max(0,-B)*.18;for(let ut=0;ut<3;ut++){const ot=T[bt+ut]*Xt*K,gt=ut===0?C:ut===1?w:H;m[U+ut]=Math.min(255,ot*(1-Z)+gt*Z+(Nt+ft)*255)}m[U+3]=255*J}l.putImageData(v,0,E*n)}return o.className="ballstrip",o.style.width=`${t}px`,o.style.height=`${t*ys}px`,o}function ex(){const s=[],t=Math.PI*(3-Math.sqrt(5));for(let n=0;n<Bc;n++){const i=1-(n+.5)/Bc*2,r=Math.sqrt(1-i*i);s.push([Math.cos(t*n)*r,i,Math.sin(t*n)*r])}const e=s.map((n,i)=>i).sort((n,i)=>s[n][1]-s[i][1]);return{dimples:s,sorted:e}}function nx(s,t,e){const r=document.createElement("canvas");r.width=768,r.height=384;const a=r.getContext("2d");a.fillStyle="#f6f5f1",a.fillRect(0,0,768,384);const o=768*.22,l=384*.15;a.globalAlpha=.94;for(const d of[768*.5,0,768])oi(a,s,d-o/2,384/2-l/2,o,l,s.colors.dark);a.globalAlpha=1;const c=a.getImageData(0,0,768,384).data,h=new Uint8Array(768*384*3),u=new Int16Array(768*384).fill(-1),f=e.map(d=>t[d][1]);for(let d=0;d<384;d++){const g=(.5-(d+.5)/384)*Math.PI,v=Math.sin(g),m=Math.cos(g);let p=0,_=f.length;const M=v-.2,x=v+.2;for(;p<_;){const T=p+_>>1;f[T]<M?p=T+1:_=T}const R=p;for(let T=0;T<768;T++){const E=((T+.5)/768-.5)*Math.PI*2,P=Math.sin(E)*m,y=Math.cos(E)*m;let S=-2,L=-1;for(let U=R;U<f.length&&f[U]<=x;U++){const k=t[e[U]],B=k[0]*P+k[1]*v+k[2]*y;B>S&&(S=B,L=e[U])}const D=d*768+T;u[D]=L,h[D*3]=c[D*4],h[D*3+1]=c[D*4+1],h[D*3+2]=c[D*4+2]}}return{w:768,h:384,idx:u,col:h}}function Ea(s){const t=Math.hypot(s[0],s[1],s[2]);return[s[0]/t,s[1]/t,s[2]/t]}class ix{constructor(){this.ctx=null,this.master=null,this.noiseBuf=null,this.ambience=null,this.muted=!1,this.samples=new Map,this.voiceBusyUntil=0,this.lastLine="";try{this.muted=localStorage.getItem("hio.muted")==="1"}catch{}}unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=this.muted?0:.9,this.master.connect(this.ctx.destination);const e=this.ctx.sampleRate*2;this.noiseBuf=this.ctx.createBuffer(1,e,this.ctx.sampleRate);const n=this.noiseBuf.getChannelData(0);for(let i=0;i<e;i++)n[i]=Math.random()*2-1;this.startAmbience(),this.loadSamples()}loadSamples(){const t="/golf/",e=["vo-strike","vo-perfect","vo-middle","vo-green","vo-close","vo-bunker","vo-water","vo-ob","vo-birdie","vo-eagle","vo-ace","vo-par","vo-lipout","vo-trees","crowd-roar","crowd-applause","crowd-groan"];for(const n of e)fetch(`${t}audio/${n}.mp3`).then(i=>i.arrayBuffer()).then(i=>this.ctx.decodeAudioData(i)).then(i=>this.samples.set(n,i)).catch(()=>{})}playSample(t,e,n=0){const i=this.samples.get(t);if(!i||!this.ctx||!this.master)return 0;const r=this.ctx.createBufferSource();r.buffer=i;const a=this.ctx.createGain();return a.gain.value=e,r.connect(a).connect(this.master),r.start(this.ctx.currentTime+n),i.duration}say(t,e=.25){if(!this.ctx)return;const n=this.ctx.currentTime;if(n<this.voiceBusyUntil||t===this.lastLine&&n<this.voiceBusyUntil+4)return;const i=this.playSample(`vo-${t}`,1.15,e);i&&(this.voiceBusyUntil=n+e+i,this.lastLine=t)}crowd(t,e=.8){this.playSample(`crowd-${t}`,e)||(t==="groan"?this.groan():this.cheer(t==="roar"))}setMuted(t){this.muted=t;try{localStorage.setItem("hio.muted",t?"1":"0")}catch{}this.master&&this.ctx&&this.master.gain.setTargetAtTime(t?0:.9,this.ctx.currentTime,.05)}noise(t,e,n,i,r,a=1,o=0){if(!this.ctx||!this.master||!this.noiseBuf)return;const l=this.ctx.currentTime+o,c=this.ctx.createBufferSource();c.buffer=this.noiseBuf;const h=this.ctx.createBiquadFilter();h.type=e,h.Q.value=a,h.frequency.setValueAtTime(n,l),h.frequency.exponentialRampToValueAtTime(Math.max(20,i),l+t);const u=this.ctx.createGain();u.gain.setValueAtTime(1e-4,l),u.gain.exponentialRampToValueAtTime(r,l+Math.min(.03,t*.3)),u.gain.exponentialRampToValueAtTime(1e-4,l+t),c.connect(h).connect(u).connect(this.master),c.start(l,Math.random()),c.stop(l+t+.05)}tone(t,e,n,i="sine",r=0,a){if(!this.ctx||!this.master)return;const o=this.ctx.currentTime+r,l=this.ctx.createOscillator();l.type=i,l.frequency.setValueAtTime(t,o),a&&l.frequency.exponentialRampToValueAtTime(a,o+e);const c=this.ctx.createGain();c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(n,o+.005),c.gain.exponentialRampToValueAtTime(1e-4,o+e),l.connect(c).connect(this.master),l.start(o),l.stop(o+e+.05)}swing(t){this.noise(.28,"bandpass",400,2400,.25+t*.35,1.5)}strike(t,e){this.tone(e?1900:1500,.06,.5,"triangle"),this.noise(.08,"highpass",3e3,6e3,.5*(.5+t)),this.tone(180,.12,.35,"sine",0,90),e&&this.tone(2600,.25,.12,"sine",.02)}putt(){this.tone(900,.05,.35,"triangle"),this.noise(.04,"highpass",2500,4e3,.2)}land(t,e){const n=Math.min(.5,.08+e*.015);t==="bunker"?this.noise(.25,"lowpass",1800,300,n):this.noise(.12,"lowpass",900,150,n)}tree(){for(let t=0;t<4;t++)this.noise(.12,"bandpass",2500,1200,.15,2,t*.05);this.tone(320,.08,.2,"square",.02,200)}splash(){this.noise(.6,"lowpass",3e3,200,.5),this.noise(.4,"bandpass",800,400,.3,1,.08)}cup(){this.tone(1200,.05,.3,"triangle"),this.tone(900,.05,.25,"triangle",.09),this.tone(700,.08,.3,"triangle",.17),this.noise(.15,"lowpass",600,100,.3,1,.2)}cheer(t){const e=t?14:6;for(let n=0;n<e;n++)this.noise(.5+Math.random()*.6,"bandpass",1200+Math.random()*1500,700,t?.12:.07,.8,n*.06);for(let n=0;n<(t?40:18);n++)this.noise(.03,"highpass",1500,2500,.08+Math.random()*.08,1,.1+Math.random()*(t?2.2:1.3))}groan(){for(let t=0;t<6;t++)this.noise(.9,"bandpass",500+Math.random()*200,250,.06,1,t*.05)}ui(){this.tone(1400,.04,.15,"triangle")}tick(t){this.tone(500+t*900,.025,.05,"sine")}startAmbience(){if(!this.ctx||!this.master||!this.noiseBuf)return;const t=this.ctx,e=t.createBufferSource();e.buffer=this.noiseBuf,e.loop=!0;const n=t.createBiquadFilter();n.type="lowpass",n.frequency.value=380;const i=t.createGain();i.gain.value=.035,e.connect(n).connect(i).connect(this.master),e.start();let r=!0;const a=()=>{if(!r)return;const o=2600+Math.random()*1800,l=2+Math.floor(Math.random()*4);for(let c=0;c<l;c++)this.tone(o,.09,.025,"sine",c*.13,o*(1.2+Math.random()*.3));setTimeout(a,2500+Math.random()*6e3)};setTimeout(a,1500),this.ambience={stop(){r=!1,e.stop()}}}}const xs=[{id:1,name:"The Opener",par:4,seed:11,path:[[0,0],[0,-60],[3,-150],[20,-238],[42,-305],[52,-342]],widths:[0,30,36,34,30,26],fairwayStart:24,green:{x:52,z:-342,rx:15,rz:12.5,rot:.45,slope:[.011,-.014]},pin:[55,-345],bunkers:[{x:27,z:-218,rx:9,rz:6,rot:.6},{x:-14,z:-232,rx:7,rz:5,rot:-.3},{x:36,z:-334,rx:6,rz:4,rot:1.1},{x:68,z:-350,rx:5.5,rz:4.5,rot:.2}],water:[],teeLift:1.6,windSeed:101},{id:2,name:"Lakeside",par:3,seed:22,path:[[0,0],[-3,-70],[-6,-125],[-8,-156]],widths:[0,0,22,20],fairwayStart:118,green:{x:-8,z:-156,rx:14,rz:12,rot:-.25,slope:[-.012,.009]},pin:[-11,-153],bunkers:[{x:-24,z:-168,rx:6,rz:4,rot:.5},{x:9,z:-150,rx:4.5,rz:6,rot:.1}],water:[{x:-4,z:-82,rx:34,rz:28,rot:.15}],teeLift:2.2,windSeed:202},{id:3,name:"Home Stretch",par:5,seed:33,path:[[0,0],[0,-90],[-10,-190],[-40,-280],[-56,-365],[-50,-440],[-44,-480]],widths:[0,32,36,34,32,28,24],fairwayStart:26,green:{x:-44,z:-480,rx:16,rz:13,rot:.2,slope:[.008,.013]},pin:[-41,-484],bunkers:[{x:-27,z:-214,rx:8,rz:5,rot:.7},{x:-64,z:-300,rx:7,rz:5,rot:-.2},{x:-62,z:-472,rx:5,rz:6,rot:.3},{x:-27,z:-490,rx:5,rz:4,rot:-.4}],water:[{x:-52,z:-410,rx:36,rz:9,rot:.06}],teeLift:1.2,windSeed:303},{id:4,name:"Pine Valley Run",par:4,seed:44,path:[[0,0],[0,-70],[-4,-170],[-22,-260],[-40,-345],[-46,-378]],widths:[0,30,34,32,28,24],fairwayStart:24,green:{x:-46,z:-378,rx:14,rz:12,rot:-.3,slope:[-.01,.012]},pin:[-43,-382],bunkers:[{x:-28,z:-185,rx:8,rz:5,rot:.4},{x:18,z:-215,rx:7,rz:5,rot:-.5},{x:-62,z:-372,rx:5,rz:4,rot:.6}],water:[{x:-80,z:-330,rx:18,rz:26,rot:.3}],teeLift:1.4,windSeed:404},{id:5,name:"The Island",par:3,seed:55,path:[[0,0],[2,-70],[4,-136]],widths:[0,0,0],fairwayStart:999,green:{x:4,z:-136,rx:13,rz:11,rot:.2,slope:[.008,-.008]},pin:[6,-138],bunkers:[{x:3,z:-148,rx:5,rz:2.6,rot:.15}],water:[{x:4,z:-120,rx:40,rz:42,rot:.1}],teeLift:2,windSeed:505,greenBlend:1.32},{id:6,name:"Ridge Line",par:5,seed:66,path:[[0,0],[0,-90],[16,-190],[40,-280],[38,-370],[18,-450],[10,-498]],widths:[0,32,34,32,30,28,24],fairwayStart:24,green:{x:10,z:-498,rx:15,rz:13,rot:.5,slope:[.012,.006]},pin:[13,-500],bunkers:[{x:32,z:-170,rx:8,rz:5,rot:.3},{x:58,z:-300,rx:7,rz:5,rot:0},{x:26,z:-412,rx:11,rz:3.5,rot:.35},{x:-6,z:-492,rx:5,rz:4,rot:0},{x:26,z:-510,rx:5,rz:4,rot:.5}],water:[],teeLift:1.8,windSeed:606},{id:7,name:"Lakeshore",par:4,seed:77,path:[[0,0],[0,-100],[-6,-220],[-4,-330],[0,-362]],widths:[0,30,30,28,24],fairwayStart:24,green:{x:0,z:-362,rx:14,rz:12,rot:.1,slope:[.012,-.01]},pin:[3,-365],bunkers:[{x:-22,z:-240,rx:8,rz:5,rot:-.3},{x:-16,z:-357,rx:5,rz:4,rot:.4}],water:[{x:44,z:-205,rx:22,rz:120,rot:.02}],teeLift:1.2,windSeed:707},{id:8,name:"Downhill Drop",par:3,seed:88,path:[[0,0],[-6,-90],[-10,-176]],widths:[0,0,22],fairwayStart:140,green:{x:-10,z:-176,rx:15,rz:13,rot:-.4,slope:[.01,.012]},pin:[-13,-179],bunkers:[{x:-29,z:-170,rx:6,rz:5,rot:.3},{x:9,z:-183,rx:6,rz:4,rot:-.2},{x:-12,z:-157,rx:9,rz:3,rot:.1}],water:[],teeLift:5.5,windSeed:808},{id:9,name:"The Closer",par:4,seed:99,path:[[0,0],[0,-120],[12,-230],[45,-320],[70,-385],[78,-412]],widths:[0,32,32,30,28,24],fairwayStart:24,green:{x:78,z:-412,rx:15,rz:13,rot:.6,slope:[-.01,-.012]},pin:[80,-416],bunkers:[{x:61,z:-404,rx:5,rz:4,rot:.3},{x:94,z:-421,rx:6,rz:4,rot:.5},{x:-8,z:-232,rx:7,rz:5,rot:-.2}],water:[{x:58,z:-232,rx:22,rz:30,rot:.4}],teeLift:1.6,windSeed:909}],sx=9.81,rx=.0214,ax=.0031,ox=.0046,lx=6.5,cx=.004166667,hx=28,ux=.054,dx=1.45,fx=2.2,px=32,mx=.1,gx=1.03,vx=4.5,xx=24,_x=[{id:"DR",name:"Driver",carry:228,launch:12.5,spin:.6,check:0},{id:"3W",name:"3 Wood",carry:205,launch:13.5,spin:.7,check:.05},{id:"5I",name:"5 Iron",carry:172,launch:17,spin:.9,check:.15},{id:"7I",name:"7 Iron",carry:148,launch:21,spin:1.05,check:.3},{id:"9I",name:"9 Iron",carry:124,launch:26,spin:1.15,check:.45},{id:"PW",name:"Pitching Wedge",carry:104,launch:30,spin:1.25,check:.6},{id:"SW",name:"Sand Wedge",carry:78,launch:37,spin:1.3,check:.75},{id:"PT",name:"Putter",carry:0,launch:0,spin:0,check:0}],Mx={tee:{restitution:.3,retain:.6,roll:1.6,lie:[100,100],skid:.32},fairway:{restitution:.3,retain:.6,roll:1.6,lie:[96,100],skid:.32},firstCut:{restitution:.24,retain:.5,roll:2.8,lie:[88,96],skid:.45},rough:{restitution:.16,retain:.35,roll:5.5,lie:[72,88],skid:.7},fringe:{restitution:.18,retain:.45,roll:1.25,lie:[95,100],skid:.9},green:{restitution:.15,retain:.42,roll:.58,lie:[100,100],skid:.9},bunker:{restitution:.04,retain:.12,roll:14,lie:[55,70],skid:1.5},water:{restitution:0,retain:0,roll:99,lie:[0,0],skid:0},ob:{restitution:.18,retain:.45,roll:5.2,lie:[0,0],skid:.7}},yx={maxSpeed:6.5},Sx=2.5,Kt={gravity:sx,ballRadius:rx,dragK:ax,liftK:ox,spinDecaySec:lx,dt:cx,maxSimSec:hx,cupRadius:ux,cupCaptureSpeed:dx,cupLipSpeed:fx,maxPuttDistance:px,perfectWindow:mx,perfectBonus:gx,pushDeg:vx,curveDeg:xx,clubs:_x,surfaces:Mx,wind:yx,skidThreshold:Sx},Cr=Kt.gravity,ni=Kt.ballRadius,Ur=Kt.surfaces;function Ue(s){return{x:Math.sin(s),z:-Math.cos(s)}}function zi(s,t){return Math.atan2(s,-t)}function Zh(s,t,e){const n=t*Math.PI/180;let i=0,r=0,a=s*Math.cos(n),o=s*Math.sin(n),l=e,c=0;const h=Kt.dt;for(let u=0;u<2e4;u++){const f=Math.hypot(a,o),d=-.0031*f*a+Kt.liftK*l*f*-o,g=-Cr-Kt.dragK*f*o+Kt.liftK*l*f*a;if(a+=d*h,o+=g*h,i+=a*h,r+=o*h,l*=Math.exp(-h/Kt.spinDecaySec),c=Math.max(c,r),r<0&&o<0)return{carry:i,apex:c}}return{carry:i,apex:c}}function wx(s,t,e){let n=5,i=120;for(let r=0;r<40;r++){const a=(n+i)/2;Zh(a,t,e).carry<s?n=a:i=a}return(n+i)/2}const fe=Kt.clubs.map(s=>({...s,speed:s.id==="PT"?0:wx(s.carry,s.launch,s.spin)})),Hc=fe.find(s=>s.id==="PT");function bx(s){const t=Ur.green;let e=0;const n=Kt.dt;for(;s>.03;){const i=t.roll+t.skid*Math.max(0,s-Kt.skidThreshold);e+=s*n,s-=i*n}return e}const Aa=(()=>{const s=[];let t=.05;for(let e=0;e<=70;e++){const n=Kt.maxPuttDistance*e/64;for(;bx(t)<n;)t+=.005;s.push(t)}return s})();function Tx(s){const t=Xn(s,0,1.09)*64,e=Math.floor(t),n=t-e;return Aa[e]+(Aa[e+1]-Aa[e])*n}function Gc(s,t,e){const[n,i]=Ur[s].lie,r=zs(t)();let a=Ee(n,i,r);return s==="bunker"&&e&&e.id==="SW"&&(a=Ee(84,94,r)),e&&e.id==="PT"&&(a=100),Math.round(a)}function Vc(s,t,e,n={}){const i=zs(e.seed),r=Kt.dt,a=1/60,o=[],l=[],c=e.club,h=c.id==="PT",u=Xn(e.accuracy,-1.2,1.2),f=Math.abs(u)<=Kt.perfectWindow,d=u*Kt.pushDeg*Math.PI/180,g=e.yaw+(h?d*.25:d),v=Ue(g),m={x:t.x,y:t.y,z:t.z},p={x:0,y:0,z:0};let _=0,M=0,x=0,R=0,T=!1;if(h){const lt=Tx(e.power);p.x=v.x*lt,p.z=v.z*lt,T=!0}else{let lt=c.speed*Xn(e.power,0,1.08)*(f?Kt.perfectBonus:1);lt*=Ee(.55,1,(e.lie-50)/50);const et=c.launch*Math.PI/180;p.x=v.x*Math.cos(et)*lt,p.z=v.z*Math.cos(et)*lt,p.y=Math.sin(et)*lt,_=c.spin*Ee(.6,1,e.lie/100);const St=-v.z,_t=v.x,wt=St,Ut=_t,Pt=(f?0:u)*Kt.curveDeg*Math.PI/180,jt=v.z*wt-v.x*Ut;M=wt*Math.cos(Pt),x=jt*Math.sin(Pt),R=Ut*Math.cos(Pt),l.push({t:0,type:"launch",x:m.x,y:m.y,z:m.z,speed:lt})}const E={x:0,y:1,z:0};let P=0,y=0,S=0,L=t.y,D=h,U=h?0:-1,k=!1,B=!1,G=!1,Y=0;const z=new Set;let V={x:t.x,y:t.y,z:t.z},Q=0;const st=n.preview?12:Kt.maxSimSec,rt=s.pin,Lt=()=>{o.push(m.x,m.y,m.z)};for(Lt();P<st;){if(P+=r,T){const et=s.surfaceAt(m.x,m.z);if(et==="water"){B=!0,l.push({t:P,type:"water",x:m.x,y:s.waterLevel,z:m.z,speed:0,surface:et});break}if(et==="ob"){G=!0,l.push({t:P,type:"ob",x:m.x,y:m.y,z:m.z,speed:0,surface:et});break}s.normal(m.x,m.z,E);const St=Ur[et],_t=Cr*E.y*E.x,wt=Cr*E.y*E.z,Ut=Math.hypot(p.x,p.z),Pt=St.roll+St.skid*Math.max(0,Ut-Kt.skidThreshold);if(Ut>1e-4){const de=-(p.x/Ut)*Pt,Nt=-(p.z/Ut)*Pt,ft=p.x+(_t+de)*r,xt=p.z+(wt+Nt)*r;ft*p.x+xt*p.z<0&&Math.hypot(_t,wt)<Pt?(p.x=0,p.z=0):(p.x=ft,p.z=xt)}else Math.hypot(_t,wt)>Pt*1.05&&(p.x+=_t*r,p.z+=wt*r);m.x+=p.x*r,m.z+=p.z*r,m.y=s.height(m.x,m.z)+ni;const jt=Math.hypot(m.x-rt.x,m.z-rt.z),N=Math.hypot(p.x,p.z);if(jt<Kt.cupRadius){if(N<Kt.cupCaptureSpeed||jt<Kt.cupRadius*.5&&N<Kt.cupLipSpeed){k=!0,m.x=rt.x,m.z=rt.z,m.y=rt.y-.06,l.push({t:P,type:"holed",x:m.x,y:m.y,z:m.z,speed:N,surface:et});break}else if(N<Kt.cupLipSpeed*1.4&&!l.some(de=>de.type==="lipout")){const Nt=((m.x-rt.x)*p.z-(m.z-rt.z)*p.x>0?1:-1)*Ee(.5,1.1,i()),ft=Math.cos(Nt),xt=Math.sin(Nt),Xt=p.x*ft-p.z*xt,bt=p.x*xt+p.z*ft;p.x=Xt*.55,p.z=bt*.55,l.push({t:P,type:"lipout",x:m.x,y:m.y,z:m.z,speed:N,surface:et})}}if(N<.03){if(Q+=r,Q>.25){l.push({t:P,type:"stop",x:m.x,y:m.y,z:m.z,speed:0,surface:et});break}}else Q=0}else{const et=m.y-s.height(m.x,m.z),St=Xn(.45+et/35,.45,1.25),_t=p.x-e.wind.x*St,wt=p.y,Ut=p.z-e.wind.z*St,Pt=Math.hypot(_t,wt,Ut),jt=x*Ut-R*wt,N=R*_t-M*Ut,de=M*wt-x*_t;p.x+=(-.0031*Pt*_t+Kt.liftK*_*Pt*jt)*r,p.y+=(-Cr-Kt.dragK*Pt*wt+Kt.liftK*_*Pt*N)*r,p.z+=(-.0031*Pt*Ut+Kt.liftK*_*Pt*de)*r,_*=Math.exp(-r/Kt.spinDecaySec),m.x+=p.x*r,m.y+=p.y*r,m.z+=p.z*r,L=Math.max(L,m.y);for(const ft of s.treesNear(m.x,m.z)){const xt=ft.x*1e3+ft.z,Xt=m.x-ft.x,bt=m.z-ft.z,C=Math.hypot(Xt,bt);if(C>ft.canopyR+1)continue;const w=m.y-ft.canopyY,H=ft.kind===0?C<ft.canopyR*(1-Xn((w+ft.height*.45)/(ft.height*.95),0,1))+.2&&w>-ft.height*.45&&w<ft.height*.5:Math.hypot(Xt,w*1.15,bt)<ft.canopyR,Z=C<ft.trunkR+ni&&m.y<ft.canopyY&&m.y>ft.y;if((H||Z)&&!z.has(xt)){z.add(xt);const J=Z?.35:Ee(.15,.4,i()),K=(i()-.5)*2.2,ut=Math.cos(K),ot=Math.sin(K),gt=p.x*ut-p.z*ot,Ht=p.x*ot+p.z*ut;p.x=gt*J*(Z?-1:1),p.z=Ht*J*(Z?-1:1),p.y=p.y*J*.5-i()*1.5,_*=.2,l.push({t:P,type:"tree",x:m.x,y:m.y,z:m.z,speed:Math.hypot(p.x,p.y,p.z)})}}const Nt=s.height(m.x,m.z);if(m.y-ni<=Nt){const ft=s.surfaceAt(m.x,m.z);if(D||(D=!0,S=Math.hypot(m.x-t.x,m.z-t.z),U=o.length/3),ft==="ob"){G=!0,m.y=Nt+ni,l.push({t:P,type:"ob",x:m.x,y:m.y,z:m.z,speed:0,surface:ft});break}if(ft==="water"){B=!0,m.y=Math.max(Nt,s.waterLevel),l.push({t:P,type:"water",x:m.x,y:s.waterLevel,z:m.z,speed:0,surface:ft});break}if(Math.hypot(m.x-rt.x,m.z-rt.z)<Kt.cupRadius+ni*.5){k=!0,m.x=rt.x,m.z=rt.z,m.y=Nt-.06,l.push({t:P,type:"holed",x:m.x,y:m.y,z:m.z,speed:0,surface:ft});break}s.normal(m.x,m.z,E),m.y=Nt+ni;const xt=p.x*E.x+p.y*E.y+p.z*E.z;if(xt<0){const Xt=Ur[ft],bt=p.x-xt*E.x,C=p.y-xt*E.y,w=p.z-xt*E.z,H=ft==="green"||ft==="fringe"?c.check*Xn(_,0,1.3)*(Y===0?.8:.35):c.check*.2,Z=Xt.retain*(1-H),J=-xt*Xt.restitution;p.x=bt*Z+E.x*J,p.y=C*Z+E.y*J,p.z=w*Z+E.z*J,_*=.45,Y++,l.push({t:P,type:Y===1?"land":"bounce",x:m.x,y:m.y,z:m.z,speed:-xt,surface:ft}),ft==="bunker"&&Y===1&&l.push({t:P,type:"bunker",x:m.x,y:m.y,z:m.z,speed:-xt,surface:ft}),(J<.9||ft==="bunker")&&(T=!0)}}}const lt=s.surfaceAt(m.x,m.z);lt!=="water"&&lt!=="ob"&&(V={x:m.x,y:m.y,z:m.z}),P>=y&&(Lt(),y+=a)}Lt();const $={x:m.x,y:m.y,z:m.z};let tt;if(B){const lt=t.x-V.x,et=t.z-V.z,St=Math.hypot(lt,et)||1;let _t=V.x+lt/St*3,wt=V.z+et/St*3;for(let Ut=0;Ut<40&&s.surfaceAt(_t,wt)==="water";Ut++)_t+=lt/St*2,wt+=et/St*2;tt={x:_t,y:s.height(_t,wt)+ni,z:wt}}return U<0&&(U=o.length/3-1),{frames:new Float32Array(o),frameDt:a,events:l,end:$,endSurface:s.surfaceAt($.x,$.z),holed:k,water:B,ob:G,carry:S||Math.hypot($.x-t.x,$.z-t.z),total:Math.hypot($.x-t.x,$.z-t.z),apex:L-t.y,drop:tt,landFrame:U}}function Wc(s,t){if(t==="green"||t==="fringe"&&s<18)return Hc;const e=fe.filter(n=>n.id!=="PT"&&(t==="tee"||n.id!=="DR"));for(let n=e.length-1;n>=0;n--)if(e[n].carry>=s*.97)return e[n];return e[0]}function Ca(s,t){if(s.id==="PT")return Xn(t/Kt.maxPuttDistance,.02,1);let e=.05,n=1;for(let i=0;i<22;i++){const r=(e+n)/2;Zh(s.speed*r,s.launch,s.spin).carry<t?e=r:n=r}return(e+n)/2}const si=Kt,Ra="hio.name",Xc=100,yr=["ctp","r3","r9"];class Ex{constructor(){this.status="loading",this.rows=[],this.uid=null,this.db=null,this.listeners=[],this.writing=Promise.resolve(),this.remote=null,this.remoteRows={ctp:[],r3:[],r9:[]},this.lastFetch=0}get initialsOnly(){return!!this.remote}async init(t){const e=window.claude;if(!e?.use){if(t?.url&&t.game){this.remote={url:t.url.replace(/\/$/,""),game:t.game},this.uid="me",await this.refresh(!0);return}this.status="off",this.emit();return}try{const[n,i]=await Promise.all([e.use("db"),e.use("user")]);if(this.db=n,!n){this.status="off",this.emit();return}this.uid=i?await i.id():null;const r=i?await i.can("data.write"):null,a=setTimeout(()=>{this.status==="loading"&&(this.status="stale",this.emit())},1e4);n.collection("scores").limit(1e3).onSnapshot(o=>{this.rows=o.docs.filter(l=>l.exists).map(l=>({id:l.id,...Ax(l.data())})),o.metadata?.fromCache||clearTimeout(a),this.status=!this.uid||r===!1?"readonly":"ready",this.emit()},()=>{clearTimeout(a),this.status="off",this.emit()})}catch{this.status="off",this.emit()}}async refresh(t=!1){if(!this.remote||!t&&Date.now()-this.lastFetch<8e3)return;this.lastFetch=Date.now();const{url:e,game:n}=this.remote;try{const i=await Promise.all(yr.map(async a=>{const o=await fetch(`${e}/top?game=${n}_${a}&limit=50`,{cache:"no-store"});if(!o.ok)throw new Error(String(o.status));return await o.json()})),r=this.myName.toUpperCase();yr.forEach((a,o)=>{this.remoteRows[a]=i[o].filter(l=>typeof l?.n=="string"&&typeof l?.t=="number").map(l=>({id:l.n===r?"me":`n:${l.n}`,name:l.n,[a]:Pa(a,l.t-Xc)}))}),this.status="ready"}catch{this.status==="loading"&&(this.status="stale")}this.emit()}onChange(t){this.listeners.push(t)}emit(){for(const t of this.listeners)t()}get myName(){const t=this.rows.find(e=>e.id===this.uid);if(t?.name)return t.name;try{return localStorage.getItem(Ra)??""}catch{return""}}get mine(){if(this.remote){const t={id:"me",name:this.myName};for(const e of yr){const n=$c(e);n!==null&&(t[e]=n)}return yr.some(e=>typeof t[e]=="number")?t:void 0}return this.rows.find(t=>t.id===this.uid)}top(t,e=10){return this.remote?this.remoteRows[t].slice(0,e):this.rows.filter(n=>typeof n[t]=="number").sort((n,i)=>n[t]-i[t]||(n.at??"").localeCompare(i.at??"")).slice(0,e)}rankOf(t,e){const i=(this.remote?this.remoteRows[t]:this.rows).map(r=>r[t]).filter(r=>typeof r=="number");return{rank:i.filter(r=>r<e).length+1,of:Math.max(i.length,1)}}get canPost(){return this.remote?this.status!=="off":this.status==="ready"||this.status==="stale"&&!!this.uid}async submit(t,e,n){if(this.remote)return this.submitRemote(t,e,n);if(!this.db||!this.uid||!this.canPost)return"readonly";const i=this.mine,r=i?.[t],a=typeof r!="number"||e<r,o=n&&n!==i?.name;if(!a&&!o)return"not-best";try{localStorage.setItem(Ra,n)}catch{}const l={...i?Cx(i):{},name:n.slice(0,16),at:new Date().toISOString()};a&&(l[t]=Pa(t,e));const c=this.db.doc(`scores/${this.uid}`),h=this.writing.then(()=>c.set(l));this.writing=h.catch(()=>{});try{return await h,a?"posted":"not-best"}catch(u){return u?.code==="invalid_argument"?(this.status="readonly",this.emit(),"readonly"):"error"}}async submitRemote(t,e,n){const i=n.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,3);if(i.length!==3||!this.remote)return"error";const r=i!==this.myName.toUpperCase();try{localStorage.setItem(Ra,i)}catch{}const a=$c(t),o=Pa(t,e);if(a!==null&&o>=a&&!r)return"not-best";const l=a!==null&&o>=a?a:o;try{if(!(await fetch(`${this.remote.url}/lap`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({game:`${this.remote.game}_${t}`,n:i,t:Xc+l})})).ok)return"error";if(a===null||o<a)try{localStorage.setItem(`hio.lbBest.${t}`,String(o))}catch{}return await this.refresh(!0),a===null||o<a?"posted":"not-best"}catch{return"error"}}}function $c(s){try{const t=localStorage.getItem(`hio.lbBest.${s}`);return t===null?null:Number(t)}catch{return null}}function Pa(s,t){return s==="ctp"?Math.round(t*100)/100:Math.round(t)}function Ax(s){const t=e=>typeof e=="number"&&isFinite(e)&&e>=0&&e<1e3?e:void 0;return{name:typeof s?.name=="string"?s.name.slice(0,16):"",ctp:t(s?.ctp),r3:t(s?.r3),r9:t(s?.r9),at:typeof s?.at=="string"?s.at:void 0}}function Cx(s){const{id:t,...e}=s,n={};for(const[i,r]of Object.entries(e))r!==void 0&&(n[i]=r);return n}function qc(s,t){if(s===1)return"Hole in One";const e=s-t;return e<=-3?"Albatross":e===-2?"Eagle":e===-1?"Birdie":e===0?"Par":e===1?"Bogey":e===2?"Double Bogey":e===3?"Triple Bogey":`+${e}`}function La(s,t){const e=s-t;return e===0?"E":e>0?`+${e}`:`${e}`}const Rx=s=>s+5,Da=si.ballRadius;new A(0,1,0);const Yc="hio.best.v1",Oe=class Oe{constructor(t,e,n){this.sfx=new ix,this.state="loading",this.prevState="title",this.holeIndex=0,this.courses=xs.map(()=>null),this.roundLen=3,this.mode="round",this.ctp=[],this.scores=[null,null,null],this.strokes=0,this.ball={x:0,y:0,z:0},this.prevBall={x:0,y:0,z:0},this.surface="tee",this.lie=100,this.yaw=0,this.clubIdx=0,this.view="play",this.wind={x:0,z:0,speed:0,yaw:0},this.previewDirty=!0,this.previewPower=null,this.lastPreviewAt=0,this.pulling=!1,this.pullStart={x:0,y:0},this.pullPower=0,this.pullPeak=0,this.pullRange=200,this.lastTick=0,this.swingMode=(()=>{try{const i=localStorage.getItem("hio.swing.v2");return i==="swipe"||i==="timing"?i:"hybrid"}catch{return"timing"}})(),this.tm={phase:0,pos:0,dir:1,power:0,speed:1,wait:0},this.swipe=null,this.shot=null,this.shotInfo={power:0,acc:0,perfect:!1,club:fe[0]},this.swingT=0,this.swingFrom=0,this.playT=-1,this.eventIdx=0,this.landCam=null,this.closeFinish=!1,this.betweenTimer=0,this.camMode="title",this.camPos=new A(0,30,30),this.camLook=new A,this.tPos=new A,this.tLook=new A,this.introT=0,this.flightT=0,this.drag=null,this.lb=new Ex,this.boardMode="ctp",this.fpsNow=60,this.fpsEl=null,this.introPath=null,this.introLook=null,this.introDur=6,this.coachShown=(()=>{try{return localStorage.getItem("hio.coach")==="1"}catch{return!1}})(),this.readHole=-1,this.reactSnap=!1,this.reactUntil=0,this.impactCam=0,this.pendingBall=null,this.timeScale=new URL(location.href).searchParams.get("q")==="test"?3:1,this.slowMo=0,this.shake=0,this.fovPunch=0,this.perfectStreak=0,this.store=n,this.world=new Yv(t),this.ui=new Zv(e),this.world.applyBrand(n.brand),n.onChange(i=>{this.world.applyBrand(i),this.state==="title"&&this.renderTitle()}),this.bindInput(t)}get roundHoles(){return xs.slice(0,this.roundLen)}get bestKey(){return`${Yc}.${this.roundLen}`}get usesMeter(){return this.swingMode!=="swipe"}async boot(){this.lb.onChange(()=>{this.ui.board.classList.contains("show")&&this.renderBoard(),this.updateTower(),this.refreshMiniBoards()});const t=this.store.brand;this.lb.init(t.leaderboard??this.store.presets.find(c=>c.id===t.id)?.leaderboard??null),new URL(location.href).searchParams.has("fps")&&(this.fpsEl=document.createElement("div"),this.fpsEl.className="fps passthrough",this.ui.root.append(this.fpsEl)),this.ui.loading.innerHTML="",this.ui.loading.append(Qv(this.store.brand));const e=document.createElement("p");e.className="loadtext",e.textContent=this.store.brand.courseName.toUpperCase();const n=document.createElement("p");n.className="loadsub",n.textContent="LOADING",this.ui.loading.append(e,n);const i=document.createElement("div");this.ui.loading.append(i),this.ui.fillMiniBoard(i,this.lb,this.loadingBoardMode(),this.boardTitle(this.loadingBoardMode())),i.dataset.auto="1",await new Promise(c=>requestAnimationFrame(()=>setTimeout(c,60))),await this.ensureHole(0),this.loadHoleVisual(0),this.placeBallAtTee(),this.camMode="title",this.world.golfer.setBackswing(0),this.updateCamera(.016),this.camPos.copy(this.tPos),this.camLook.copy(this.tLook),this.renderTitle(),await Promise.race([el().ready,Cs(8e3)]),this.ui.show(this.ui.title,!0),this.ui.show(this.ui.loading,!1),this.state="title";let r=performance.now(),a=0,o=0;const l=c=>{const h=Math.max(0,(c-r)/1e3),u=Math.min(.05,h);if(r=c,a+=h,o++,a>2.5){const f=o/a;this.fpsNow=f,this.fpsEl&&(this.fpsEl.textContent=`${f.toFixed(0)} FPS · Q${this.world.quality} · ${this.world.renderer.getPixelRatio().toFixed(2)}x`),f<42&&!this.world.fixedPixelRatio&&document.visibilityState==="visible"&&this.world.degrade(),a=0,o=0}this.update(u),this.world.render(u),requestAnimationFrame(l)};requestAnimationFrame(l),setTimeout(()=>this.ensureHole(1).then(()=>this.ensureHole(2)),1200)}renderTitle(){const t=[3,9].map(e=>{try{const n=localStorage.getItem(`${Yc}.${e}`);return n?Number(n):null}catch{return null}});this.ui.renderTitle(this.store,t,e=>this.startRound(e),()=>this.openStudio(),this.sfx.muted,()=>{this.sfx.unlock(),this.sfx.setMuted(!this.sfx.muted),this.renderTitle()},this.swingMode,()=>{this.toggleSwingMode(),this.renderTitle()},()=>this.startCtp(),this.ctpBest(),()=>this.openBoard(this.boardMode))}async ensureHole(t){return this.courses[t]||(await Cs(0),this.courses[t]=new nv(xs[t])),this.courses[t]}loadHoleVisual(t){this.holeIndex=t,this.course=this.courses[t],this.world.loadCourse(this.course);const e=zs(this.course.def.windSeed),n=.8+e()*(si.wind.maxSpeed-.8),i=e()*Math.PI*2,r=Ue(i);this.wind={x:r.x*n,z:r.z*n,speed:n,yaw:i}}placeBallAtTee(){const t=this.course;this.ball={x:0,y:t.height(0,0)+Da+.03,z:0},this.prevBall={...this.ball},this.surface="tee",this.yaw=zi(t.tee.dirX,t.tee.dirZ),this.chooseClubAndAim(),this.placeGolfer()}ctpBest(){try{const t=localStorage.getItem(Oe.CTP_KEY);return t?Number(t):null}catch{return null}}async startCtp(){this.sfx.unlock(),this.sfx.ui(),this.mode="ctp",this.ctp=[],this.perfectStreak=0,this.ui.show(this.ui.title,!1),this.ui.show(this.ui.scoreCard,!1),this.ui.show(this.ui.pause,!1),await this.beginHole(Oe.CTP_HOLE)}handleCtp(t){const e=this.course,n=t.water||t.ob?null:t.holed?0:e.distToPin(t.end.x,t.end.z);if(this.ctp.push(n),n===null?this.ui.toast("SPLASH",`BALL ${this.ctp.length} OF 3`,1600):n===0?(this.ui.toast("HOLE IN ONE","",2400),this.sfx.crowd("roar",1),this.sfx.say("ace",.4),this.world.crowd.cheer(1),this.world.fx.burst(new A(e.pin.x,e.pin.y+.3,e.pin.z),"confetti",this.store.brand.colors.primary)):(this.ui.toast(`${n.toFixed(2)} M`,`BALL ${this.ctp.length} OF 3`,1600),n<3&&(this.sfx.crowd(n<1.5?"roar":"applause",.85),this.sfx.say("close",.2),this.world.crowd.cheer(n<1.5?1:.6))),this.state="between",this.ctp.length<3){this.betweenTimer=2,this.pendingBall={x:0,y:e.height(0,0)+Da+.03,z:0},this.strokes=0;return}this.state="holeDone",setTimeout(()=>this.showCtpCard(),2e3)}showCtpCard(){this.state="card",this.ui.showHud(!1);const t=this.ctp.filter(r=>r!==null),e=t.length?Math.min(...t):null,n=this.ctpBest(),i=e!==null&&(n===null||e<n);if(i){try{localStorage.setItem(Oe.CTP_KEY,String(e))}catch{}this.sfx.cheer(!0)}Jv(this.ui,this.ctp,n,i,[{label:"Go Again",on:()=>this.startCtp()},...this.lb.status!=="off"?[{label:"Leaderboard",ghost:!0,on:()=>this.openBoard("ctp")}]:[],{label:"Main Menu",ghost:!0,on:()=>this.toTitle()}]),this.ui.show(this.ui.scoreCard,!0),this.addMiniBoard("ctp"),e!==null&&this.postScore("ctp",e)}updateTower(){const t=this.lb.top("ctp",6);this.world.dressing.setBoard("CLOSEST TO THE PIN",t.map(e=>({name:e.name||"Player",value:e.ctp===0?"ACE":`${e.ctp.toFixed(2)}M`})))}boardTitle(t){return t==="ctp"?"LEADERBOARD · CLOSEST TO THE PIN":t==="r3"?"LEADERBOARD · QUICK 3":"LEADERBOARD · FULL 9"}loadingBoardMode(){return["r9","r3","ctp"].find(t=>this.lb.top(t,1).length)??"r9"}refreshMiniBoards(){this.ui.root.querySelectorAll(".miniboard").forEach(t=>{const e=t.dataset.auto?this.loadingBoardMode():t.dataset.m;this.ui.fillMiniBoard(t,this.lb,e,t.dataset.auto?this.boardTitle(e):t.dataset.t??"",Number(t.dataset.n)||5)})}addMiniBoard(t,e=this.boardTitle(t)){const n=this.ui.scoreCard.querySelector(".card");if(!n||this.lb.status==="off")return;const i=document.createElement("div"),r=n.querySelector(".row, div[style]")??null;r?n.insertBefore(i,r):n.append(i),this.ui.fillMiniBoard(i,this.lb,t,e),this.lb.refresh()}openBoard(t){this.boardMode=t,this.sfx.ui(),this.renderBoard(),this.ui.show(this.ui.board,!0)}renderBoard(){this.ui.renderBoard(this.lb,this.boardMode,t=>{this.boardMode=t,this.renderBoard()},()=>this.ui.show(this.ui.board,!1),async()=>{const t=await this.ui.askName(this.lb.myName,this.lb.initialsOnly);if(!t)return;const e=this.lb.mine,n=typeof e?.ctp=="number"?"ctp":typeof e?.r3=="number"?"r3":"r9",i=e?.[n];if(typeof i=="number")await this.lb.submit(n,i,t);else try{localStorage.setItem("hio.name",t)}catch{}this.renderBoard()})}async postScore(t,e){const n=this.ui.scoreCard.querySelector(".card");if(!n)return;let i=n.querySelector(".lbline");i||(i=document.createElement("div"),i.className="lbline",n.querySelector(".sub")?.after(i));const r=u=>{i&&(i.textContent=u)};if(!this.lb.canPost){this.lb.status==="readonly"?r("VIEW ONLY: SCORE NOT POSTED"):i.remove();return}let a=this.lb.myName;if((!a||this.lb.initialsOnly&&!/^[A-Za-z0-9]{3}$/.test(a))&&(a=await this.ui.askName(a,this.lb.initialsOnly)??"",!a)){r("SCORE NOT POSTED");return}r("POSTING SCORE...");const o=await this.lb.submit(t,e,a),l=this.lb.mine?.[t]??e,{rank:c,of:h}=this.lb.rankOf(t,l);r(o==="posted"?`NEW PERSONAL BEST  ·  #${c} OF ${h} ON THE LEADERBOARD`:o==="not-best"?`YOUR BEST IS #${c} OF ${h} ON THE LEADERBOARD`:o==="readonly"?"VIEW ONLY: SCORE NOT POSTED":"COULDN'T POST: CHECK YOUR CONNECTION")}async startRound(t=this.roundLen){this.mode="round",this.sfx.unlock(),this.sfx.ui(),this.roundLen=t,this.perfectStreak=0,this.scores=this.roundHoles.map(()=>null),this.ui.show(this.ui.title,!1),this.ui.show(this.ui.scoreCard,!1),this.ui.show(this.ui.pause,!1),await this.beginHole(0)}async beginHole(t){this.readHole=-1,this.state="loading",this.ui.showHud(!1),this.courses[t]||(this.ui.show(this.ui.loading,!0),await Cs(30)),await this.ensureHole(t),await this.ui.fade(()=>{this.loadHoleVisual(t),this.strokes=0,this.placeBallAtTee(),this.world.fx.tracerReset(),this.world.golfer.setBackswing(0),this.ui.show(this.ui.loading,!1),this.setupIntro()}),this.ui.renderHoleCard(this.course.def.id,this.mode==="ctp"?"Closest to the Pin":this.course.def.name,this.course.def.par,Math.round(this.course.distToPin(0,0)),this.brandClip("flagVideo")),this.ui.show(this.ui.holeCard,!0),this.state="intro"}setupIntro(){const t=this.course,e=new A(t.pin.x,t.pin.y,t.pin.z),n=t.length,i=g=>{const v=t.pointAt(Math.max(0,Math.min(n,g)));return new A(v.x,t.height(v.x,v.z),v.z)},r=i(0),a=i(30),o=new A(a.x-r.x,0,a.z-r.z).normalize(),l=new A(-o.z,0,o.x),c=[],h=[];c.push(r.clone().addScaledVector(o,-28).addScaledVector(l,6).add(new A(0,30,0))),h.push(i(120));const u=Math.max(2,Math.round(n/100));for(let g=1;g<=u;g++){const v=(n-40)*(g/(u+1)),m=i(v);c.push(m.addScaledVector(l,10).add(new A(0,28-g/u*8,0))),h.push(i(v+110))}const f=i(n-28),d=new A(e.x-f.x,0,e.z-f.z).normalize();c.push(e.clone().addScaledVector(d,-30).addScaledVector(l,4).add(new A(0,9,0))),h.push(e.clone().add(new A(0,.8,0))),c.push(e.clone().addScaledVector(d,-13).addScaledVector(l,2).add(new A(0,3,0))),h.push(e.clone().add(new A(0,1.2,0))),this.introPath=new Lr(c,!1,"centripetal"),this.introLook=new Lr(h,!1,"centripetal"),this.introDur=4.8+Math.min(3,n/160),this.introT=0,this.camMode="intro",this.camPos.copy(c[0]),this.camLook.copy(h[0])}playCelebration(t,e,n){const i=document.createElement("div");i.className="celebrate";const r=document.createElement("video");r.src=t,r.muted=!0,r.playsInline=!0,r.setAttribute("playsinline","");const a=t.replace(/\.mp4$/,".jpg");r.poster=a;const o=document.createElement("div");o.className="celebrate-t",o.textContent=e;const l=document.createElement("div");l.className="celebrate-tap",l.textContent="TAP TO CONTINUE",i.append(r,o,l),this.ui.root.append(i);let c=!1;const h=()=>{c||(c=!0,i.classList.remove("show"),setTimeout(()=>i.remove(),450),n())};r.onended=h,r.onerror=h,i.onclick=h,setTimeout(h,6500),requestAnimationFrame(()=>i.classList.add("show")),r.play().catch(()=>setTimeout(h,1800)),setTimeout(()=>o.classList.add("in"),2300)}brandClip(t){const e=this.store.brand,n=e[t];return n&&e.logoTintable?ci(e.id,n):null}endIntro(){this.state==="intro"&&(this.state="loading",this.ui.show(this.ui.holeCard,!1),this.ui.fade(()=>{this.addressCam(this.camPos,this.camLook),this.enterAim()}))}showCoach(){this.coachShown=!0;try{localStorage.setItem("hio.coach","1")}catch{}const t=document.createElement("div");t.className="overlay coach show",t.innerHTML=`<div class="card">
      <h3>HOW TO SWING</h3>
      <div class="sub">${this.swingMode==="hybrid"?"TWO PARTS: POWER, THEN SWIPE.":"THREE TAPS. TIMING IS EVERYTHING."}</div>
      <ol class="steps">
        <li><b>1</b><span><em>Tap the ball</em> to start your backswing.</span></li>
        <li><b>2</b><span><em>Tap again</em> to lock your power (part 1: distance). The meter fills and falls back.</span></li>
        ${this.swingMode==="hybrid"?"<li><b>3</b><span><em>Swipe up, dead straight</em> to strike (part 2: accuracy). Drift right slices, drift left hooks. Straight is PERFECT.</span></li>":"<li><b>3</b><span><em>Tap on the white line</em> as the marker races back. Early fades right, late hooks left. Dead on is PERFECT.</span></li>"}
      </ol>
      <div class="sub" style="margin:4px 0 14px">DRAG TO AIM &middot; TAP THE COURSE TO TARGET A SPOT</div>
      <button class="btn" data-a="ok">Let's Go</button></div>`,this.ui.root.append(t),t.querySelector('[data-a="ok"]').onclick=()=>{this.sfx.ui(),t.classList.remove("show"),setTimeout(()=>t.remove(),400)}}enterAim(){if(!this.coachShown&&this.usesMeter&&this.showCoach(),this.state="aim",this.camMode=this.view==="map"?"map":"address",this.previewPower=null,this.lie=Gc(this.surface,Ma(this.course.def.id,this.strokes,this.ball.x,this.ball.z),fe[this.clubIdx]),this.ui.showHud(!0),this.world.fx.tracerReset(),this.world.golfer.setBackswing(0),this.placeGolfer(),this.previewDirty=!0,this.updateHud(),this.surface==="green"&&this.readHole!==this.holeIndex&&this.view!=="map"&&this.course.distToPin(this.ball.x,this.ball.z)>3){this.readHole=this.holeIndex;const t=this.world.golfer.playReaction("read");t>0&&this.reactCam(t)}}reactCam(t){this.camMode="react",this.reactSnap=!0,this.reactUntil=this.world.time+t+.3}chooseClubAndAim(){const t=this.course,e=t.distToPin(this.ball.x,this.ball.z),n=Wc(e,this.surface);if(this.clubIdx=fe.indexOf(n),n.id==="PT"||n.carry>=e*.95)this.yaw=zi(t.pin.x-this.ball.x,t.pin.z-this.ball.z);else{const i=t.fastPath(this.ball.x,this.ball.z).s,r=t.pointAt(Math.min(t.length,i+n.carry*.98));this.yaw=zi(r.x-this.ball.x,r.z-this.ball.z)}}placeGolfer(){const t=fe[this.clubIdx];this.world.golfer.setPutter(t.id==="PT");const e=Ue(this.yaw),n=this.course.height(this.ball.x,this.ball.z),i=new A(this.ball.x,this.ball.y,this.ball.z),r=-e.z,a=e.x,o=this.ball.x-r*.78,l=this.ball.z-a*.78;this.world.golfer.placeAt(i,e.x,e.z,Math.min(n,this.course.height(o,l))),this.world.fx.setBall(this.ball.x,this.ball.y,this.ball.z,n),this.world.grass.setCenter(this.ball.x,this.ball.z),this.world.props.setPeg(this.surface==="tee"&&Math.hypot(this.ball.x,this.ball.z)<.05)}bindInput(t){const e=this.ui.hud;t.addEventListener("pointerdown",n=>{if(this.sfx.unlock(),this.state==="intro"){this.endIntro();return}if(this.state==="between"){this.betweenTimer=Math.min(this.betweenTimer,.05);return}if(this.state==="timing"){this.tm.phase===4?this.swipeStart(n):this.timingTap();return}this.state==="aim"&&(this.drag={id:n.pointerId,x:n.clientX,y:n.clientY,t:performance.now(),moved:0})}),addEventListener("pointermove",n=>{if(this.swipe){this.swipeMove(n);return}if(this.pulling){this.onPullMove(n.clientX,n.clientY);return}if(!this.drag||n.pointerId!==this.drag.id||this.state!=="aim")return;const i=n.clientX-this.drag.x;this.drag.moved+=Math.abs(i)+Math.abs(n.clientY-this.drag.y),this.drag.x=n.clientX,this.drag.y=n.clientY;const r=fe[this.clubIdx].id==="PT",a=this.view==="map"?.003:r?.0016:.0035;this.yaw+=i*a,this.previewDirty=!0,this.placeGolfer(),r&&this.updateHud()}),addEventListener("pointerup",n=>{if(this.swipe){this.swipeEnd(n);return}if(this.pulling){this.onPullEnd(n.clientX,n.clientY);return}if(!this.drag||n.pointerId!==this.drag.id)return;const i=this.drag.moved<8&&performance.now()-this.drag.t<350;this.drag=null,i&&this.state==="aim"&&this.tapAim(n.clientX,n.clientY)}),addEventListener("pointercancel",()=>{this.drag=null,this.pulling&&this.cancelPull()}),e.pad.addEventListener("pointerdown",n=>{if(n.preventDefault(),n.stopPropagation(),this.sfx.unlock(),this.usesMeter){if(this.state==="timing"&&this.tm.phase===4){this.swipeStart(n);return}this.timingTap();return}if(this.state!=="aim")return;this.pulling=!0,this.pullStart={x:n.clientX,y:n.clientY},this.pullPower=0,this.pullPeak=0,this.pullRange=Math.min(230,innerHeight*.3),e.pull.classList.add("show"),e.pullTrack.style.left=`${n.clientX}px`,e.pullTrack.style.top=`${n.clientY}px`,e.pullTrack.style.height=`${this.pullRange}px`,e.pullMeter.style.left=`${n.clientX}px`,e.pullMeter.style.top=`${n.clientY}px`,e.pullMeter.style.height=`${this.pullRange}px`,e.pad.style.opacity="0",this.onPullMove(n.clientX,n.clientY)}),e.clubPrev.onclick=()=>this.cycleClub(-1),e.clubNext.onclick=()=>this.cycleClub(1),e.viewBtn.onclick=()=>{this.state==="aim"&&(this.view=this.view==="map"?"play":"map",this.camMode=this.view==="map"?"map":"address",e.viewBtn.classList.toggle("on",this.view==="map"),this.sfx.ui(),this.updateHud())},e.menuBtn.onclick=()=>this.openPause(),addEventListener("keydown",n=>{if(n.key===" "&&(this.state==="aim"||this.state==="timing")&&this.usesMeter&&this.tm.phase!==4){n.preventDefault(),this.timingTap();return}this.state==="aim"&&(n.key==="ArrowLeft"&&(this.yaw-=.01,this.previewDirty=!0,this.placeGolfer()),n.key==="ArrowRight"&&(this.yaw+=.01,this.previewDirty=!0,this.placeGolfer()),n.key==="ArrowUp"&&this.cycleClub(-1),n.key==="ArrowDown"&&this.cycleClub(1),n.key==="m"&&e.viewBtn.click())})}tapAim(t,e){const n=this.world.pickGround(t,e);if(!n)return;const i=n.x-this.ball.x,r=n.z-this.ball.z,a=Math.hypot(i,r);if(!(a<1.5)){if(this.yaw=zi(i,r),fe[this.clubIdx].id!=="PT"){const o=Wc(a,this.surface==="green"?"fringe":this.surface);o.id!=="PT"&&(this.clubIdx=fe.indexOf(o))}this.sfx.ui(),this.previewDirty=!0,this.placeGolfer(),this.updateHud()}}cycleClub(t){if(this.state!=="aim")return;const e=this.surface==="tee";let n=this.clubIdx;for(let i=0;i<fe.length&&(n=(n+t+fe.length)%fe.length,fe[n].id==="DR"&&!e);i++);this.clubIdx=n,this.lie=Gc(this.surface,Ma(this.course.def.id,this.strokes,this.ball.x,this.ball.z),fe[n]),this.sfx.ui(),this.previewDirty=!0,this.placeGolfer(),this.updateHud()}onPullMove(t,e){const n=this.ui.hud,i=Math.max(0,e-this.pullStart.y),r=Math.min(1,i/this.pullRange);this.pullPower=r,this.pullPeak=Math.max(this.pullPeak,r);const a=Math.max(r,this.pullPeak);n.pullKnob.style.left=`${t}px`,n.pullKnob.style.top=`${Math.max(this.pullStart.y,e)}px`,n.pullFill.style.height=`${a*100}%`,n.pullPct.style.left=`${this.pullStart.x}px`,n.pullPct.style.top=`${this.pullStart.y+this.pullRange*a}px`,n.pullPct.textContent=`${Math.round(a*100)}%`,this.world.golfer.setBackswing(this.pullPeak>r+.05?this.pullPeak*Math.max(.6,r/Math.max(.01,this.pullPeak)):r),Math.floor(r*10)!==this.lastTick&&(this.lastTick=Math.floor(r*10),this.sfx.tick(r)),this.previewPower=a,this.previewDirty=!0,this.pullPeak>.08&&i<this.pullRange*.05&&this.fire(this.pullPeak,(t-this.pullStart.x)/(this.pullRange*.42))}onPullEnd(t,e){this.pulling&&(this.pullPeak>.08&&this.pullPower>.05?this.fire(this.pullPower,(t-this.pullStart.x)/(this.pullRange*.42)):this.cancelPull())}cancelPull(){this.pulling=!1,this.ui.hud.pull.classList.remove("show"),this.ui.hud.pad.style.opacity="",this.world.golfer.setBackswing(0),this.previewPower=null,this.previewDirty=!0}timingTap(){this.sfx.unlock();const t=fe[this.clubIdx],e=t.id==="PT";if(this.state==="aim"){this.state="timing",this.tm={phase:1,pos:0,dir:1,power:0,speed:e?.75:1,wait:0},this.ui.hud.tNotch.style.display="none",this.ui.hud.tLabel.textContent="TAP TO SET POWER",this.sfx.tick(.2),this.drag=null,this.updateHud();return}if(this.state==="timing"){if(this.tm.phase===1&&this.swingMode==="hybrid"){this.tm.power=Math.max(.03,this.tm.pos),this.tm.phase=4,this.tm.wait=0;const n=this.ui.hud;n.tNotch.style.display="block",n.tNotch.style.left=`${this.barPct(this.tm.power)}%`,n.tLabel.textContent="NOW SWIPE UP",n.swipeGuide.classList.remove("active"),n.swipeGuide.classList.add("show"),n.swipeTrail.setAttribute("points",""),this.sfx.tick(.6),navigator.vibrate?.(8),this.previewPower=this.tm.power,this.previewDirty=!0;return}if(this.tm.phase===1){this.tm.power=Math.max(.03,this.tm.pos),this.tm.phase=2,this.tm.dir=-1;const n={DR:1.18,"3W":1.1,"5I":1.05,"7I":1,"9I":.95,PW:.9,SW:.88,PT:.75};this.tm.speed=1.15*(n[t.id]??1)*(.75+.55*this.tm.power);const i=this.ui.hud;i.tNotch.style.display="block",i.tNotch.style.left=`${this.barPct(this.tm.power)}%`,i.tLabel.textContent="TAP ON THE LINE",this.sfx.tick(.6),navigator.vibrate?.(8),this.previewPower=this.tm.power,this.previewDirty=!0;return}this.tm.phase===2&&this.timingStrike(this.tm.pos)}}swipeStart(t){this.ui.hud.swipeGuide.classList.add("active"),this.swipe={id:t.pointerId,x0:t.clientX,y0:t.clientY,t0:performance.now(),pts:[[t.clientX,t.clientY]]}}swipeMove(t){const e=this.swipe;if(!e||t.pointerId!==e.id)return;e.pts.push([t.clientX,t.clientY]);const n=innerWidth,i=innerHeight;this.ui.hud.swipeTrail.setAttribute("points",e.pts.map(([a,o])=>`${a/n*100},${o/i*100}`).join(" "));const r=Math.max(0,e.y0-t.clientY);this.world.golfer.setFollow(Math.min(.29,r/160*.3),this.tm.power)}swipeEnd(t){const e=this.swipe;if(!e||t.pointerId!==e.id)return;this.swipe=null;const n=e.pts,i=e.y0-t.clientY;let r=e.x0,a=e.y0;for(const[u,f]of n)if(e.y0-f>=i*.15){r=u,a=f;break}const o=a-t.clientY,l=t.clientX-r;if(i<40||o<30){this.ui.hud.swipeTrail.setAttribute("points",""),this.ui.hud.swipeGuide.classList.remove("active"),this.world.golfer.setBackswing(this.tm.power),this.ui.mini("SWIPE UP FURTHER");return}const c=Math.atan2(l,o)*180/Math.PI,h=performance.now()-e.t0;this.finishSwipe(c/40,h)}finishSwipe(t,e){const n=Math.max(-1.2,Math.min(1.2,t));this.tm.phase=3;const i=this.ui.hud,r=Math.abs(n)<=si.perfectWindow;i.tLabel.textContent=r?"PERFECT!":n>0?"PUSHED RIGHT":"PULLED LEFT",i.tmeter.classList.remove("flash"),i.tmeter.offsetWidth,r&&i.tmeter.classList.add("flash"),setTimeout(()=>i.swipeGuide.classList.remove("show"),250),this.fire(this.tm.power,n,.25)}barPct(t){return(t+Oe.HOOK)/(1+Oe.HOOK)*100}timingStrike(t){const e=Math.max(-1.2,Math.min(1.2,t/.3));this.tm.phase=3;const n=this.ui.hud,i=Math.abs(e)<=si.perfectWindow;n.tLabel.textContent=i?"PERFECT!":t>0?"EARLY":"LATE",n.tmeter.classList.remove("flash"),n.tmeter.offsetWidth,i&&n.tmeter.classList.add("flash"),this.fire(this.tm.power,e,.3)}updateTiming(t){const e=this.tm,n=this.ui.hud,i=this.world.golfer;if(e.phase===1){if(e.pos+=e.dir*e.speed*t,e.pos>=1&&(e.pos=1,e.dir=-1),e.pos<=0&&e.dir<0){this.state="aim",n.tLabel.textContent="TAP TO SWING",i.setBackswing(0),this.updateHud();return}i.setBackswing(e.pos),Math.floor(e.pos*10)!==this.lastTick&&(this.lastTick=Math.floor(e.pos*10),this.sfx.tick(e.pos)),this.previewPower=e.pos,this.previewDirty=!0}else if(e.phase===4){if(e.wait+=t,this.swipe||this.world.golfer.setBackswing(e.power),e.wait>8){this.ui.mini("TOO SLOW: RUSHED SWING"),this.finishSwipe(.9,0);return}}else if(e.phase===2){e.speed+=t*.6,e.pos-=e.speed*t;const r=Math.max(0,Math.min(1,(e.power-e.pos)/Math.max(.05,e.power)));i.setFollow(r*.3,e.power),e.pos<=-Oe.HOOK&&this.timingStrike(-Oe.HOOK)}n.tMarker.style.left=`${this.barPct(Math.max(-Oe.HOOK,e.pos))}%`,n.tFill.style.width=`${Math.max(0,this.barPct(Math.max(0,e.phase===1?e.pos:e.power))-this.barPct(0))}%`,n.tPct.textContent=`${Math.round((e.phase===1?e.pos:e.power)*100)}%`}toggleSwingMode(){this.swingMode=this.swingMode==="hybrid"?"timing":this.swingMode==="timing"?"swipe":"hybrid";try{localStorage.setItem("hio.swing.v2",this.swingMode)}catch{}this.sfx.ui()}fire(t,e,n=0){this.pulling=!1,this.ui.hud.pull.classList.remove("show"),this.ui.hud.pad.style.opacity="",this.previewPower=null;const i=fe[this.clubIdx],r=Math.max(-1.2,Math.min(1.2,e)),a=Math.abs(r)<=si.perfectWindow&&i.id!=="PT";this.strokes++,this.prevBall={...this.ball};const o=Ma(this.course.def.id,this.strokes,Math.round(this.ball.x*100),Math.round(this.ball.z*100),Math.round(t*1e3));this.shot=Vc(this.course,this.ball,{club:i,yaw:this.yaw,power:t,accuracy:r,lie:this.lie,wind:i.id==="PT"?{x:0,z:0}:{x:this.wind.x,z:this.wind.z},seed:o}),this.shotInfo={power:t,acc:r,perfect:a,club:i},this.state="swing",this.swingT=n,this.swingFrom=this.world.golfer?t:0,this.playT=-1,this.eventIdx=0,this.landCam=null;{const l=this.shot.frames,c=l.length/3-1,h=Math.hypot(l[c*3]-this.course.pin.x,l[c*3+2]-this.course.pin.z);this.closeFinish=i.id!=="PT"&&(this.shot.holed||h<4.5)}this.flightT=0,this.world.fx.aim.clear(),this.world.fx.ring.visible=!1,this.world.fx.tracerReset(),i.id!=="PT"&&this.sfx.swing(t),this.updateHud()}onImpact(){const{power:t,perfect:e,club:n,acc:i}=this.shotInfo;if(n.id!=="PT"){const r=new A(this.ball.x,this.ball.y,this.ball.z);this.world.fx.burst(r,this.surface==="bunker"?"sand":"grass");const a=Ue(this.yaw);if(this.surface==="bunker")this.world.fx.puff(r,"sand",1.3);else if(n.id!=="DR"&&n.id!=="3W"&&this.surface!=="tee"&&this.surface!=="green"&&this.surface!=="fringe"){const o=new A(r.x+a.x*.12,this.course.height(r.x+a.x*.12,r.z+a.z*.12),r.z+a.z*.12);this.world.fx.divot(o,a.x,a.z)}(e||t>.85&&(n.id==="DR"||n.id==="3W"))&&(this.impactCam=.95,this.slowMo=Math.max(this.slowMo,.9),this.flightT=0)}if(n.id==="PT"?this.sfx.putt():this.sfx.strike(t,e),navigator.vibrate?.(e?[12,30,12]:18),e?(this.perfectStreak++,this.ui.toast("PERFECT",this.perfectStreak>1?`STREAK x${this.perfectStreak}`:"",1100),this.slowMo=.55,this.sfx.say(this.perfectStreak%2?"perfect":"strike",.15),this.shake=.35,this.fovPunch=1,this.world.crowd.cheer(.5)):n.id!=="PT"&&(this.perfectStreak=0),!e&&n.id!=="PT"){const r=Math.abs(i),a=i<0?r>.55?"HOOK":"DRAW":r>.55?"SLICE":"FADE";this.ui.mini(`${Math.round(t*100)}% POWER  ·  ${r<.25?"SLIGHT ":""}${a}`)}this.playT=0,this.state="flight",this.camMode="flight",this.updateHud()}updateShot(t){const e=this.shot,n=this.shotInfo.club,i=e.frames.length/3,r=this.playT/e.frameDt<e.landFrame;let a=n.id==="PT"?1.15:r?1.3:1.6;if(this.closeFinish&&!r){const _=this.world.fx.ball.position,M=Math.hypot(_.x-this.course.pin.x,_.z-this.course.pin.z);M<9&&(a*=.32+.68*Px(Math.min(1,Math.max(0,(M-1.5)/7.5))))}this.playT+=t*a,this.flightT+=t;const o=this.playT/e.frameDt,l=Math.min(i-1,Math.floor(o)),c=Math.min(i-1,l+1),h=Math.min(1,o-l),u=e.frames,f=u[l*3]+(u[c*3]-u[l*3])*h,d=u[l*3+1]+(u[c*3+1]-u[l*3+1])*h,g=u[l*3+2]+(u[c*3+2]-u[l*3+2])*h,v=this.course.height(f,g);this.world.fx.setBall(f,d,g,v);const m=this.world.fx.ball.position;n.id!=="PT"&&o<=e.landFrame+2?this.world.fx.tracerPush(m):this.world.fx.tracerFade(t);const p=this.playT;for(;this.eventIdx<e.events.length&&e.events[this.eventIdx].t<=p;){const _=e.events[this.eventIdx++],M=new A(_.x,_.y,_.z);if(_.type==="land"||_.type==="bounce")this.sfx.land(_.surface??"fairway",_.speed),_.type==="land"&&_.speed>4&&this.world.fx.burst(M,_.surface==="bunker"?"sand":"grass"),_.type==="land"&&_.surface==="bunker"&&this.world.fx.puff(M,"sand",.8),_.type==="land"&&this.closeFinish&&this.world.crowd.cheer(.6);else if(_.type==="tree")this.sfx.tree(),this.sfx.say("trees",.1),this.world.fx.burst(M,"leaf"),this.ui.mini("TIMBER!");else if(_.type==="water"){this.sfx.splash(),this.sfx.say("water",.3),this.sfx.crowd("groan",.6);const x=new A(_.x,this.course.waterLevel,_.z);this.world.fx.burst(x,"water"),this.world.fx.puff(x,"spray",1),this.world.fx.ripple(x)}else _.type==="holed"?this.sfx.cup():_.type==="lipout"&&!e.holed&&(this.sfx.crowd("groan",.8),this.sfx.say("lipout",.2),this.ui.mini("LIP OUT!"))}o>=i-1&&this.onShotEnd()}onShotEnd(){const t=this.shot,e=this.course;if(this.mode==="ctp"){this.handleCtp(t);return}this.state="between",this.betweenTimer=1.4;let n={...t.end},i="",r=t.holed;if(t.water)this.strokes++,n=t.drop??this.prevBall,this.ui.toast("SPLASH","WATER HAZARD  ·  +1 STROKE",1800),this.betweenTimer=2;else if(t.ob)this.strokes++,n={...this.prevBall},this.ui.toast("OUT OF BOUNDS","+1 STROKE  ·  REPLAY",1800),this.sfx.say("ob",.2),this.betweenTimer=2;else if(!r){const a=t.endSurface,o=e.distToPin(n.x,n.z);a==="green"&&o<.45?(this.strokes++,r=!0,this.ui.mini("TAP IN"),this.sfx.cup()):this.shotInfo.club.id!=="PT"?(i=`CARRY ${Math.round(t.carry)} M  ·  TOTAL ${Math.round(t.total)} M  ·  ${Pc[a].toUpperCase()}`,this.ui.mini(i,2200),a==="green"&&this.strokes===1&&e.def.par===3&&this.ui.toast("ON THE DANCE FLOOR","",1400),a==="green"&&o<4?(this.world.crowd.cheer(.8),this.sfx.crowd("applause",.9),this.sfx.say("close",.15)):a==="green"?this.sfx.say("green",.15):a==="bunker"?this.sfx.say("bunker",.15):a==="fairway"&&this.strokes===1&&t.carry>180&&this.sfx.say("middle",.15)):this.ui.mini(o<2?`${o.toFixed(1)} M LEFT`:`${Math.round(o)} M LEFT`)}if(r){this.holeComplete();return}if(this.strokes>=Rx(e.def.par)){this.ui.toast("PICK UP",`${this.strokes} STROKES`,1600),this.scores[this.holeIndex]=this.strokes,this.state="holeDone",this.holeIndex+1<this.roundLen&&setTimeout(()=>this.ensureHole(this.holeIndex+1),300),setTimeout(()=>this.showHoleCard(),1800);return}this.pendingBall=n}async advanceToNextShot(){const t=this.pendingBall;this.pendingBall=null,t&&(this.state="loading",await this.ui.fade(()=>{const e=this.course;this.ball={x:t.x,y:e.height(t.x,t.z)+Da,z:t.z},this.surface=e.surfaceAt(t.x,t.z),this.chooseClubAndAim(),this.world.fx.tracerReset(),this.enterAim(),this.addressCam(this.camPos,this.camLook),this.view==="map"&&this.mapCam(this.camPos,this.camLook)}))}holeComplete(){const t=this.course;this.scores[this.holeIndex]=this.strokes,this.state="holeDone";const e=qc(this.strokes,t.def.par);this.ui.showHud(!1);const n=this.strokes<t.def.par||this.strokes===1;if(this.ui.toast(e.toUpperCase(),`${this.strokes} ${this.strokes===1?"STROKE":"STROKES"}`,2600),this.strokes===1)this.sfx.crowd("roar",1),this.sfx.say("ace",.4);else{this.sfx.crowd(n?"roar":"applause",n?.85:.8);const l=this.strokes-t.def.par,c=l<=-2?"eagle":l===-1?"birdie":l===0?"par":"";c&&this.sfx.say(c,.5)}this.world.crowd.cheer(n?1:.4),navigator.vibrate?.([30,50,30]),this.strokes<=t.def.par&&this.world.fx.burst(new A(t.pin.x,t.pin.y+.3,t.pin.z),"confetti",this.store.brand.colors.primary),this.camMode="cup",this.holeIndex+1<this.roundLen&&setTimeout(()=>this.ensureHole(this.holeIndex+1),300);const i=this.strokes<t.def.par||this.strokes===1?this.brandClip("holeVideo"):null,r=this.strokes<=t.def.par?"celebrate":"frustrate";let a=0;this.world.golfer.hasReaction(r)&&(a=1,setTimeout(()=>{if(this.state!=="holeDone")return;const l=this.world.golfer.playReaction(r);l>0&&this.reactCam(l)},1100),a+=r==="celebrate"?2.2:2.6);const o=Math.max(a,i?1.2:2.7)*1e3;i?setTimeout(()=>this.playCelebration(i,e.toUpperCase(),()=>this.showHoleCard()),o+(a?200:0)):setTimeout(()=>this.showHoleCard(),a?o+400:2700)}showHoleCard(){this.state="card",this.ui.showHud(!1);const t=this.roundHoles,e=t.map((a,o)=>({par:a.par,strokes:this.scores[o]})),n=this.holeIndex>=t.length-1,i=this.scores.reduce((a,o)=>a+(o??0),0),r=t.reduce((a,o)=>a+o.par,0);if(!n)this.ui.renderScorecard(`HOLE ${this.course.def.id}`,`${qc(this.scores[this.holeIndex],this.course.def.par).toUpperCase()}  ·  ${La(i,xs.slice(0,this.holeIndex+1).reduce((a,o)=>a+o.par,0))} THRU ${this.holeIndex+1}`,e,[{label:"Next Hole",on:()=>{this.ui.show(this.ui.scoreCard,!1),this.beginHole(this.holeIndex+1)}}]);else{let a=null;try{const l=localStorage.getItem(this.bestKey);a=l?Number(l):null,(a===null||i<a)&&localStorage.setItem(this.bestKey,String(i))}catch{}const o=a===null||i<a;this.ui.renderScorecard("ROUND COMPLETE",`${i} STROKES  ·  ${La(i,r)}${o?"  ·  NEW BEST":`  ·  BEST ${a}`}`,e,[{label:"Play Again",on:()=>this.startRound(this.roundLen)},...this.lb.status!=="off"?[{label:"Leaderboard",ghost:!0,on:()=>this.openBoard(this.roundLen===9?"r9":"r3")}]:[],{label:"Main Menu",ghost:!0,on:()=>this.toTitle()}]),o&&this.sfx.cheer(!0),setTimeout(()=>this.postScore(this.roundLen===9?"r9":"r3",i),0)}this.addMiniBoard(this.roundLen===9?"r9":"r3",n?void 0:`SCORE TO BEAT · ${this.roundLen===9?"FULL 9":"QUICK 3"}`),this.ui.show(this.ui.scoreCard,!0)}async toTitle(){this.mode="round",this.ui.show(this.ui.scoreCard,!1),this.ui.show(this.ui.pause,!1),this.ui.showHud(!1),await this.ui.fade(async()=>{await this.ensureHole(0),this.loadHoleVisual(0),this.placeBallAtTee(),this.world.golfer.setBackswing(0),this.world.fx.tracerReset(),this.world.fx.aim.clear(),this.world.fx.ring.visible=!1,this.camMode="title"}),this.renderTitle(),this.ui.show(this.ui.title,!0),this.state="title"}openPause(){this.state==="aim"&&(this.prevState="aim",this.state="paused",this.ui.renderPause(()=>{this.ui.show(this.ui.pause,!1),this.state="aim"},()=>{this.ui.show(this.ui.pause,!1),this.startRound()},()=>{this.ui.show(this.ui.pause,!1),this.openStudio()},()=>this.toTitle(),this.sfx.muted,()=>{this.sfx.setMuted(!this.sfx.muted),this.openPause2()},this.swingMode,()=>{this.toggleSwingMode(),this.updateHud(),this.openPause2()}),this.ui.show(this.ui.pause,!0))}openPause2(){this.state="aim",this.openPause()}openStudio(){this.prevState=this.state==="paused"?"aim":this.state==="card"?"title":this.state,this.state="studio",this.ui.show(this.ui.title,!1),this.ui.showHud(!1),this.camMode="studio",this.world.golfer.setBackswing(0),this.ui.renderStudio(this.store,this.world.props.previewCanvases(),()=>this.closeStudio()),this.ui.show(this.ui.studio,!0)}closeStudio(){this.ui.show(this.ui.studio,!1),this.prevState==="aim"?this.enterAim():(this.state="title",this.camMode="title",this.renderTitle(),this.ui.show(this.ui.title,!0))}debugAutoShot(t=0){if(this.state!=="aim")return!1;const e=this.course,n=fe[this.clubIdx],i=e.distToPin(this.ball.x,this.ball.z);let r=1;return n.id==="PT"?(this.yaw=zi(e.pin.x-this.ball.x,e.pin.z-this.ball.z),r=Ca(n,i*1.1)):n.carry>=i&&(this.yaw=zi(e.pin.x-this.ball.x,e.pin.z-this.ball.z),r=Ca(n,i*.93)),this.fire(r,t),!0}update(t){t*=this.timeScale,this.slowMo>0&&(this.slowMo-=t,t*=.3);const e=this.world,n=e.time;if(this.state==="intro"&&(this.introT+=t/this.introDur,this.introT>=1&&this.endIntro()),e.reader.visible=(this.state==="aim"||this.state==="timing")&&fe[this.clubIdx].id==="PT",this.state==="aim"){e.golfer.idle(n);const i=performance.now();this.previewDirty&&i-this.lastPreviewAt>40&&(this.previewDirty=!1,this.lastPreviewAt=i,this.updatePreview()),this.updatePinMarker()}else this.ui.hud.pinMark.classList.add("hide");if(this.state==="timing"){e.golfer.idle(n),this.updateTiming(t);const i=performance.now();this.previewDirty&&i-this.lastPreviewAt>60&&(this.previewDirty=!1,this.lastPreviewAt=i,this.updatePreview())}if(this.state==="swing"){const i=this.shotInfo.club.id==="PT"?.75:.95;this.swingT+=t/i,e.golfer.setFollow(Math.min(1,this.swingT),this.swingFrom),this.swingT>=.3&&this.playT<0&&this.onImpact()}if(this.state==="flight"){if(this.swingT<1){const i=this.shotInfo.club.id==="PT"?.75:.95;this.swingT+=t/i,e.golfer.setFollow(Math.min(1,this.swingT),this.swingFrom)}this.updateShot(t)}this.state==="between"&&(this.world.fx.tracerFade(t),this.betweenTimer-=t,this.betweenTimer<=0&&this.pendingBall&&this.advanceToNextShot()),this.updateCamera(t)}updatePreview(){const t=this.world.fx,e=fe[this.clubIdx],n=this.course;let i=this.previewPower;if(i===null&&(e.id==="PT"?i=Math.min(1,Ca(e,n.distToPin(this.ball.x,this.ball.z)*1.05)):i=1),i<.02){t.aim.clear(),t.ring.visible=!1;return}const r=Vc(n,this.ball,{club:e,yaw:this.yaw,power:i,accuracy:0,lie:this.lie,wind:{x:0,z:0},seed:1},{preview:!0}),a=[],o=r.frames,l=o.length/3;let c;e.id==="PT"?c=Math.max(2,Math.floor(l*.55)):c=Math.min(l,r.landFrame+1);const h=(e.id==="PT",2);for(let p=0;p<c;p+=h)a.push(new A(o[p*3],o[p*3+1]+(e.id==="PT"?.03:0),o[p*3+2]));t.aim.widthScale=e.id==="PT"?.55:1.1,t.aim.setPoints(a);const u=e.id==="PT"?c-1:Math.min(l-1,r.landFrame),f=o[u*3],d=o[u*3+2];t.ring.visible=e.id!=="PT";const g=n.height(f,d);t.ring.position.set(f,g+.08,d);const v=e.id==="PT"?.3:1.2+r.carry*.018;t.ring.scale.setScalar(v);const m=Math.round(r.carry);e.id!=="PT"?this.ui.hud.clubDist.textContent=`${m} M`:this.ui.hud.clubDist.textContent=`${(i*si.maxPuttDistance).toFixed(1)} M`}updatePinMarker(){const t=this.course,e=new A(t.pin.x,t.pin.y+3.9,t.pin.z).project(this.world.camera),n=this.ui.hud.pinMark,i=t.distToPin(this.ball.x,this.ball.z);if(e.z>1||Math.abs(e.x)>1.05||Math.abs(e.y)>1.05||i<12){n.classList.add("hide");return}n.classList.remove("hide"),n.style.left=`${(e.x*.5+.5)*innerWidth}px`,n.style.top=`${(-e.y*.5+.5)*innerHeight}px`,n.textContent=`PIN ${Math.round(i)} M`}updateHud(){const t=this.ui.hud,e=this.course,n=fe[this.clubIdx];t.hole.textContent=String(e.def.id),t.par.textContent=String(e.def.par),t.shot.textContent=String(this.strokes+(this.state==="aim"||this.state==="timing"?1:0));let i=0,r=0;this.scores.forEach((u,f)=>{u!==null&&(i+=u,r+=xs[f].par)}),t.toPar.textContent=i?La(i,r):"E";const a=t.shot.parentElement.querySelector("small"),o=t.toPar.parentElement.querySelector("small");if(this.mode==="ctp"){a.textContent="BALL",o.textContent="BEST",t.shot.textContent=`${Math.min(3,this.ctp.length+1)}/3`;const u=this.ctp.filter(f=>f!==null);t.toPar.textContent=u.length?`${Math.min(...u).toFixed(1)}`:"-"}else a.textContent="SHOT",o.textContent="TOTAL";t.windSpeed.textContent=this.wind.speed.toFixed(1),t.lieVal.textContent=`${this.lie}%`,t.lieName.textContent=Pc[this.surface].toUpperCase();const l=t.lieVal.parentElement.querySelector("small");if(l.textContent=n.id==="PT"?"GREEN READ":"LIE",t.lieVal.style.fontSize=n.id==="PT"?"16px":"",n.id==="PT"){const[u,f]=e.def.green.slope,d=Ue(this.yaw),g=u*d.x+f*d.z,v=u*-d.z+f*d.x,m=g>.002?`UPHILL ${(g*100).toFixed(1)}%`:g<-.002?`DOWNHILL ${(-g*100).toFixed(1)}%`:"FLAT",p=Math.abs(v)<.002?"STRAIGHT":v>0?"BREAKS LEFT":"BREAKS RIGHT";t.lieVal.textContent=p,t.lieName.textContent=m}const c=e.distToPin(this.ball.x,this.ball.z);t.pin.textContent=c<10?`${c.toFixed(1)} M`:`${Math.round(c)} M`,t.clubName.textContent=n.id,t.clubDist.textContent=n.id==="PT"?"PUTTER":`${n.carry} M`,t.padLabel.textContent=n.id==="PT"?"PULL TO PUTT":"PULL BACK";const h=this.usesMeter;if(this.state!=="timing"&&t.swipeGuide.classList.remove("show"),t.pad.classList.toggle("disabled",!(this.state==="aim"||h&&this.state==="timing")),t.tmeter.classList.toggle("hide",!h||!(this.state==="aim"||this.state==="timing"||this.state==="swing")),h&&this.state==="aim"&&(t.tLabel.textContent="TAP TO SWING",t.tNotch.style.display="none",t.tMarker.style.left=`${this.barPct(0)}%`,t.tFill.style.width="0%",t.tPct.textContent=""),h){const u=si.perfectWindow*.3*2/(1+Oe.HOOK)*100;t.tSweet.style.left=`${this.barPct(0)-u/2}%`,t.tSweet.style.width=`${u}%`}t.padLabel.textContent=h?"":n.id==="PT"?"PULL TO PUTT":"PULL BACK",t.hint.innerHTML=this.swingMode==="hybrid"?"Drag to aim &middot; Tap, tap for power, then swipe up":h?"Drag to aim &middot; Tap 3 times: start, power, line":"Drag to aim &middot; Pull ball down &amp; flick up",t.hint.style.opacity=this.strokes===0&&this.holeIndex===0&&this.state==="aim"?"0.92":"0"}addressCam(t,e){const n=Ue(this.yaw),i=new A(n.x,0,n.z),r=new A(-n.z,0,n.x),a=new A(this.ball.x,this.ball.y,this.ball.z),o=fe[this.clubIdx].id==="PT",l=a.clone().addScaledVector(r,o?.15:.1);if(o){const h=this.course.distToPin(a.x,a.z);t.copy(l).addScaledVector(i,-4.3-Math.min(2.5,h*.1)).add(new A(0,1.55+Math.min(1.5,h*.06),0)),e.copy(a).addScaledVector(i,Math.min(12,Math.max(3,h*.7)))}else t.copy(l).addScaledVector(i,-5).add(new A(0,2.2,0)),e.copy(a).addScaledVector(i,40).add(new A(0,-6.5,0));const c=this.course.height(t.x,t.z)+.8;t.y<c&&(t.y=c)}mapCam(t,e){const n=this.world.fx.ring.position,i=new A(this.ball.x,this.ball.y,this.ball.z),r=Ue(this.yaw),a=this.world.fx.ring.visible?n.clone():i.clone().add(new A(r.x,0,r.z).multiplyScalar(10)),o=i.clone().lerp(a,.5),l=i.distanceTo(a);e.copy(o),t.copy(o).add(new A(-r.x*l*.35,l*1.05+25,-r.z*l*.35))}updateCamera(t){const e=this.world,n=e.camera,i=this.tPos,r=this.tLook;let a=4;switch(this.camMode){case"title":{const d=this.course,g=d.length,v=g/9*2,p=20+(.5-.5*Math.cos(e.time/v*Math.PI*2))*Math.max(1,g-60),_=Math.sin(e.time/v*Math.PI*2)>=0?1:-1,M=d.pointAt(p),x=d.pointAt(Math.max(0,Math.min(g+40,p+_*110))),R=d.pointAt(Math.max(0,Math.min(g,p-_*40))),T=d.height(M.x,M.z);i.set(R.x,T+46,R.z),r.set(x.x,d.height(x.x,x.z),x.z),a=1.2;break}case"studio":{const d=e.golfer.root.position,g=Ue(this.yaw),v=new A(-g.z,0,g.x);i.copy(d).addScaledVector(v,5.6).addScaledVector(new A(g.x,0,g.z),.4).add(new A(0,1.2,0)),r.copy(d).add(new A(0,-.15,0)).addScaledVector(v,.6),a=3;break}case"intro":{const d=Math.min(1,this.introT),g=d<.15?d*d/.3:d>.85?1-(1-d)*(1-d)/.3:.075+(d-.15)*(.85/.7);if(this.introPath&&this.introLook){this.introPath.getPoint(Math.min(1,g),i),this.introLook.getPoint(Math.min(1,g),r);const v=this.course.height(i.x,i.z)+1.5;i.y<v&&(i.y=v)}this.camPos.copy(i),this.camLook.copy(r),a=0;break}case"address":this.addressCam(i,r),a=5;break;case"map":this.mapCam(i,r),a=4;break;case"flight":{const d=e.fx.ball.position,g=this.shot;if(this.shotInfo.club.id==="PT"){const _=Ue(this.yaw);i.set(d.x-_.x*2.6,d.y+1,d.z-_.z*2.6),r.copy(d),a=3;break}const m=this.playT/g.frameDt,p=(g.landFrame-m)*g.frameDt/1.3;if(this.impactCam>0){this.impactCam-=t;const _=Ue(this.yaw),M=-_.z,x=_.x,R=new A(this.prevBall.x,this.prevBall.y,this.prevBall.z);i.set(R.x-M*.9+_.x*.55,R.y+.18,R.z-x*.9+_.z*.55),r.copy(R).lerp(d,.5),r.y=Math.max(r.y,R.y+.05),this.flightT<.05&&(this.camPos.copy(i),this.camLook.copy(r)),a=14}else if(this.flightT<1.1&&this.shotInfo.power>.55){const _=Ue(this.yaw),M=e.golfer.root.position,x=-_.z,R=_.x;i.set(M.x+x*5.2+_.x*2.2,M.y+1.5,M.z+R*5.2+_.z*2.2),r.set(M.x+_.x*.6,M.y+1.1,M.z+_.z*.6).lerp(d,Math.min(.45,this.flightT*.4)),this.flightT<.05&&(this.camPos.copy(i),this.camLook.copy(r)),a=8}else if(this.flightT<.55)this.addressCam(i,r),r.lerp(d,Math.min(1,this.flightT*2)),a=6;else if(p>1.1){const _=Ue(this.yaw);i.set(d.x-_.x*15+-_.z*3.5,d.y+5,d.z-_.z*15+_.x*3.5),r.copy(d),a=2.2}else{if(!this.landCam){const _=g.landFrame,M=g.frames[_*3],x=g.frames[_*3+2],R=Ue(this.yaw),T=this.shotInfo.acc>0?-1:1,E=M+-R.z*T*16+R.x*12,P=x+R.x*T*16+R.z*12,y=new A(this.course.pin.x-M,0,this.course.pin.z-x);if(this.closeFinish){const S=y.lengthSq()>.01?y.clone().normalize():new A(R.x,0,R.z);this.landCam=new A(this.course.pin.x+S.x*6.5+-S.z*1.8,0,this.course.pin.z+S.z*6.5+S.x*1.8),this.landCam.y=this.course.height(this.landCam.x,this.landCam.z)+1.4}else y.length()<40?(y.normalize(),this.landCam=new A(this.course.pin.x+y.x*14+-y.z*8,0,this.course.pin.z+y.z*14+y.x*8),this.landCam.y=this.course.height(this.landCam.x,this.landCam.z)+9):(this.landCam=new A(E,0,P),this.landCam.y=this.course.height(this.landCam.x,this.landCam.z)+9)}i.copy(this.landCam),r.copy(d),a=1.8}break}case"react":{const d=e.golfer.root.position,g=Ue(this.yaw),v=-g.z,m=g.x;i.set(d.x+v*4.6+g.x*.9,d.y+1.35,d.z+m*4.6+g.z*.9),r.set(d.x+v*.4,d.y+.95,d.z+m*.4),a=4,this.reactSnap&&(this.reactSnap=!1,this.camPos.copy(i),this.camLook.copy(r)),this.state!=="holeDone"&&this.state!=="card"&&(this.world.time>this.reactUntil||!this.world.golfer.reacting)&&(this.world.golfer.stopReaction(),this.camMode=this.view==="map"?"map":"address");break}case"cup":{const d=this.course.pin,g=Ue(this.yaw);i.set(d.x-g.x*3.2+-g.z*1.2,d.y+1.1,d.z-g.z*3.2+g.x*1.2),r.set(d.x,d.y+.6,d.z),a=2;break}}if(a>0){const d=1-Math.exp(-a*t);this.camPos.lerp(i,d),this.camLook.lerp(r,Math.min(1,d*1.5))}const o=this.course?this.course.height(this.camPos.x,this.camPos.z)+.5:0;if(this.camPos.y<o&&(this.camPos.y=o),n.position.copy(this.camPos),this.shake>0){this.shake=Math.max(0,this.shake-t);const d=this.shake*.12;n.position.x+=(Math.random()-.5)*d,n.position.y+=(Math.random()-.5)*d}n.lookAt(this.camLook);const l=innerWidth<innerHeight?62:50;this.fovPunch=Math.max(0,this.fovPunch-t*2.2);const c=l-Math.sin(this.fovPunch*Math.PI)*5;Math.abs(n.fov-c)>.01&&(n.fov=c,n.updateProjectionMatrix());const h=new A;n.getWorldDirection(h);const u=Math.atan2(h.x,-h.z);this.ui.hud.windArrow.style.transform=`rotate(${(this.wind.yaw-u)*180/Math.PI}deg)`;const f=this.camMode==="flight"||this.camMode==="cup"?e.fx.ball.position:this.camMode==="map"?this.camLook:e.golfer.root.position;e.focusShadows(f)}};Oe.CTP_HOLE=4,Oe.CTP_KEY="hio.ctp.best.v1",Oe.HOOK=.12;let Ao=Oe;const Px=s=>s*s*(3-2*s);async function Lx(){const s=document.getElementById("gl"),t=document.getElementById("ui"),e=new nu;await e.init();try{await Promise.race([Promise.all([document.fonts.load(`italic 800 40px "${e.brand.font}"`),document.fonts.load(`italic 900 40px "${e.brand.font}"`),document.fonts.load(`italic 700 40px "${e.brand.font}"`)]),new Promise(i=>setTimeout(i,2500))])}catch{}const n=new Ao(s,t,e);window.__game=n,await n.boot()}Lx().catch(s=>{console.error(s);const t=document.getElementById("ui");t&&(t.innerHTML=`<div style="position:fixed;inset:0;display:grid;place-items:center;color:#fff;font:20px sans-serif;padding:24px;text-align:center">Could not start the game.<br/>${String(s?.message??s)}</div>`)});
