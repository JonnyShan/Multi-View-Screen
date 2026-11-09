(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();const Hh={},zc="/golf/",Ur="hio.customBrand.v1";function _o(s,t){return`${zc}brand/${s}/${t}`}function Gh(s){return new Promise(t=>{const e=new Image;e.crossOrigin="anonymous",e.onload=()=>t(e),e.onerror=()=>t(null),e.src=s})}async function Vh(){try{return await(await fetch(`${zc}brand/index.json`)).json()}catch{return{default:"livewire",brands:["livewire"]}}}async function Wh(s){const t=await fetch(_o(s,"brand.json"));if(!t.ok)throw new Error(`brand ${s} not found`);return await t.json()}class Xh{constructor(){this.presets=[],this.listeners=[],this.customLogo=null}async init(){const t=await Vh(),e=await Promise.all(t.brands.map(l=>Wh(l).catch(()=>null)));this.presets=e.filter(l=>!!l);const n=new URL(location.href),i=Hh?.VITE_BRAND,r=n.searchParams.get("brand")??i??t.default;let a=this.presets.find(l=>l.id===r)??this.presets[0],o=null;if(!n.searchParams.get("brand"))try{const l=localStorage.getItem(Ur);l&&(o=JSON.parse(l))}catch{o=null}return o&&(a=o,this.customLogo=o.customLogo??null),await this.set(a,!1),this.brand}onChange(t){this.listeners.push(t)}async set(t,e=!0){const n=this.customLogo??_o(t.id,t.logo),i=await Gh(n);this.brand={...structuredClone(t),logoImg:i,logoTintable:!this.customLogo,version:(this.brand?.version??0)+1},$h(this.brand),e&&this.persist();for(const r of this.listeners)r(this.brand)}async selectPreset(t){const e=this.presets.find(n=>n.id===t);if(e){this.customLogo=null,await this.set(e);try{localStorage.removeItem(Ur)}catch{}}}async patch(t,e){const n=this.toData(),i=t.split(".");let r=n;for(let a=0;a<i.length-1;a++)r=r[i[a]];r[i[i.length-1]]=e,(t.startsWith("kit.")||t==="colors.primary")&&delete n.golferKit,await this.set(n)}async setCustomLogo(t){this.customLogo=t;const e=this.toData();t&&delete e.golferKit,await this.set(e)}toData(){const{logoImg:t,logoTintable:e,version:n,...i}=this.brand;return structuredClone(i)}exportJson(){return JSON.stringify(this.toData(),null,2)}persist(){try{localStorage.setItem(Ur,JSON.stringify({...this.toData(),customLogo:this.customLogo??void 0}))}catch{}}}function $h(s){const t=document.documentElement.style;t.setProperty("--brand",s.colors.primary),t.setProperty("--brand-dark",s.colors.dark),t.setProperty("--brand-light",s.colors.light),t.setProperty("--on-brand",s.colors.onPrimary),t.setProperty("--brand-font",`"${s.font}", "Barlow Condensed", "Arial Narrow", sans-serif`),document.title=`${s.gameTitle} | ${s.courseName}`}function ai(s,t,e,n,i,r,a){const o=t.logoImg;if(!o){s.save(),s.fillStyle=a??t.colors.light,s.font=`italic 800 ${Math.floor(r*.7)}px ${getComputedStyle(document.documentElement).getPropertyValue("--brand-font")}`,s.textAlign="center",s.textBaseline="middle",s.fillText(t.name.toUpperCase(),e+i/2,n+r/2,i),s.restore();return}const l=o.naturalWidth||o.width||300,c=o.naturalHeight||o.height||100,h=Math.min(i/l,r/c),u=l*h,p=c*h,d=e+(i-u)/2,g=n+(r-p)/2;if(a&&t.logoTintable){const v=document.createElement("canvas");v.width=Math.max(1,Math.ceil(u)),v.height=Math.max(1,Math.ceil(p));const m=v.getContext("2d");m.drawImage(o,0,0,v.width,v.height),m.globalCompositeOperation="source-in",m.fillStyle=a,m.fillRect(0,0,v.width,v.height),s.drawImage(v,d,g,u,p)}else s.drawImage(o,d,g,u,p)}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Mo="170",qh=0,nl=1,Yh=2,Bc=1,kc=2,bn=3,Dn=0,Le=1,Ce=2,Cn=0,oi=1,Ts=2,il=3,sl=4,Zh=5,si=100,Kh=101,jh=102,Jh=103,Qh=104,tu=200,eu=201,nu=202,iu=203,Ta=204,Ea=205,su=206,ru=207,au=208,ou=209,lu=210,cu=211,hu=212,uu=213,du=214,Aa=0,Ca=1,Ra=2,Hi=3,Pa=4,La=5,Da=6,Ia=7,yo=0,fu=1,pu=2,Xn=0,Hc=1,Gc=2,Vc=3,Wc=4,mu=5,Xc=6,So=7,$c=300,Gi=301,Vi=302,Ua=303,Na=304,Rr=306,on=1e3,Tn=1001,Fa=1002,We=1003,gu=1004,Os=1005,Ve=1006,Nr=1007,En=1008,In=1009,qc=1010,Yc=1011,Es=1012,wo=1013,li=1014,pn=1015,Rn=1016,bo=1017,To=1018,Wi=1020,Zc=35902,Kc=1021,jc=1022,an=1023,Jc=1024,Qc=1025,Bi=1026,Xi=1027,Eo=1028,Ao=1029,th=1030,Co=1031,Ro=1033,vr=33776,xr=33777,_r=33778,Mr=33779,Oa=35840,za=35841,Ba=35842,ka=35843,Ha=36196,Ga=37492,Va=37496,Wa=37808,Xa=37809,$a=37810,qa=37811,Ya=37812,Za=37813,Ka=37814,ja=37815,Ja=37816,Qa=37817,to=37818,eo=37819,no=37820,io=37821,yr=36492,so=36494,ro=36495,eh=36283,ao=36284,oo=36285,lo=36286,vu=3200,nh=3201,Po=0,xu=1,Vn="",re="srgb",ji="srgb-linear",Pr="linear",ee="srgb",pi=7680,rl=519,_u=512,Mu=513,yu=514,ih=515,Su=516,wu=517,bu=518,Tu=519,co=35044,al="300 es",An=2e3,br=2001;class Ji{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,t);t.target=null}}}const Ee=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let ol=1234567;const _s=Math.PI/180,As=180/Math.PI;function mn(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ee[s&255]+Ee[s>>8&255]+Ee[s>>16&255]+Ee[s>>24&255]+"-"+Ee[t&255]+Ee[t>>8&255]+"-"+Ee[t>>16&15|64]+Ee[t>>24&255]+"-"+Ee[e&63|128]+Ee[e>>8&255]+"-"+Ee[e>>16&255]+Ee[e>>24&255]+Ee[n&255]+Ee[n>>8&255]+Ee[n>>16&255]+Ee[n>>24&255]).toLowerCase()}function Se(s,t,e){return Math.max(t,Math.min(e,s))}function Lo(s,t){return(s%t+t)%t}function Eu(s,t,e,n,i){return n+(s-t)*(i-n)/(e-t)}function Au(s,t,e){return s!==t?(e-s)/(t-s):0}function Ms(s,t,e){return(1-e)*s+e*t}function Cu(s,t,e,n){return Ms(s,t,1-Math.exp(-e*n))}function Ru(s,t=1){return t-Math.abs(Lo(s,t*2)-t)}function Pu(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function Lu(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function Du(s,t){return s+Math.floor(Math.random()*(t-s+1))}function Iu(s,t){return s+Math.random()*(t-s)}function Uu(s){return s*(.5-Math.random())}function Nu(s){s!==void 0&&(ol=s);let t=ol+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Fu(s){return s*_s}function Ou(s){return s*As}function zu(s){return(s&s-1)===0&&s!==0}function Bu(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function ku(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Hu(s,t,e,n,i){const r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),h=a((t+n)/2),u=r((t-n)/2),p=a((t-n)/2),d=r((n-t)/2),g=a((n-t)/2);switch(i){case"XYX":s.set(o*h,l*u,l*p,o*c);break;case"YZY":s.set(l*p,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*p,o*h,o*c);break;case"XZX":s.set(o*h,l*g,l*d,o*c);break;case"YXY":s.set(l*d,o*h,l*g,o*c);break;case"ZYZ":s.set(l*g,l*d,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function rn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function ne(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const ll={DEG2RAD:_s,RAD2DEG:As,generateUUID:mn,clamp:Se,euclideanModulo:Lo,mapLinear:Eu,inverseLerp:Au,lerp:Ms,damp:Cu,pingpong:Ru,smoothstep:Pu,smootherstep:Lu,randInt:Du,randFloat:Iu,randFloatSpread:Uu,seededRandom:Nu,degToRad:Fu,radToDeg:Ou,isPowerOfTwo:zu,ceilPowerOfTwo:Bu,floorPowerOfTwo:ku,setQuaternionFromProperEuler:Hu,normalize:ne,denormalize:rn};class it{constructor(t=0,e=0){it.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Se(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*i+t.x,this.y=r*i+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ht{constructor(t,e,n,i,r,a,o,l,c){Ht.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c)}set(t,e,n,i,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=i,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],p=n[2],d=n[5],g=n[8],v=i[0],m=i[3],f=i[6],_=i[1],M=i[4],x=i[7],P=i[2],T=i[5],E=i[8];return r[0]=a*v+o*_+l*P,r[3]=a*m+o*M+l*T,r[6]=a*f+o*x+l*E,r[1]=c*v+h*_+u*P,r[4]=c*m+h*M+u*T,r[7]=c*f+h*x+u*E,r[2]=p*v+d*_+g*P,r[5]=p*m+d*M+g*T,r[8]=p*f+d*x+g*E,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,p=o*l-h*r,d=c*r-a*l,g=e*u+n*p+i*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return t[0]=u*v,t[1]=(i*c-h*n)*v,t[2]=(o*n-i*a)*v,t[3]=p*v,t[4]=(h*e-i*l)*v,t[5]=(i*r-o*e)*v,t[6]=d*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-i*c,i*l,-i*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Fr.makeScale(t,e)),this}rotate(t){return this.premultiply(Fr.makeRotation(-t)),this}translate(t,e){return this.premultiply(Fr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Fr=new Ht;function sh(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function Cs(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Gu(){const s=Cs("canvas");return s.style.display="block",s}const cl={};function vs(s){s in cl||(cl[s]=!0,console.warn(s))}function Vu(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Wu(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Xu(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const qt={enabled:!0,workingColorSpace:ji,spaces:{},convert:function(s,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===ee&&(s.r=Pn(s.r),s.g=Pn(s.g),s.b=Pn(s.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(s.applyMatrix3(this.spaces[t].toXYZ),s.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===ee&&(s.r=ki(s.r),s.g=ki(s.g),s.b=ki(s.b))),s},fromWorkingColorSpace:function(s,t){return this.convert(s,this.workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Vn?Pr:this.spaces[s].transfer},getLuminanceCoefficients:function(s,t=this.workingColorSpace){return s.fromArray(this.spaces[t].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,t,e){return s.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function Pn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ki(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const hl=[.64,.33,.3,.6,.15,.06],ul=[.2126,.7152,.0722],dl=[.3127,.329],fl=new Ht().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),pl=new Ht().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);qt.define({[ji]:{primaries:hl,whitePoint:dl,transfer:Pr,toXYZ:fl,fromXYZ:pl,luminanceCoefficients:ul,workingColorSpaceConfig:{unpackColorSpace:re},outputColorSpaceConfig:{drawingBufferColorSpace:re}},[re]:{primaries:hl,whitePoint:dl,transfer:ee,toXYZ:fl,fromXYZ:pl,luminanceCoefficients:ul,outputColorSpaceConfig:{drawingBufferColorSpace:re}}});let mi;class $u{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{mi===void 0&&(mi=Cs("canvas")),mi.width=t.width,mi.height=t.height;const n=mi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=mi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Cs("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=Pn(r[a]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Pn(e[n]/255)*255):e[n]=Pn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let qu=0;class rh{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:qu++}),this.uuid=mn(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(Or(i[a].image)):r.push(Or(i[a]))}else r=Or(i);n.url=r}return e||(t.images[this.uuid]=n),n}}function Or(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?$u.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Yu=0;class be extends Ji{constructor(t=be.DEFAULT_IMAGE,e=be.DEFAULT_MAPPING,n=Tn,i=Tn,r=Ve,a=En,o=an,l=In,c=be.DEFAULT_ANISOTROPY,h=Vn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Yu++}),this.uuid=mn(),this.name="",this.source=new rh(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new it(0,0),this.repeat=new it(1,1),this.center=new it(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ht,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==$c)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case on:t.x=t.x-Math.floor(t.x);break;case Tn:t.x=t.x<0?0:1;break;case Fa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case on:t.y=t.y-Math.floor(t.y);break;case Tn:t.y=t.y<0?0:1;break;case Fa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}be.DEFAULT_IMAGE=null;be.DEFAULT_MAPPING=$c;be.DEFAULT_ANISOTROPY=1;class le{constructor(t=0,e=0,n=0,i=1){le.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*i+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r;const l=t.elements,c=l[0],h=l[4],u=l[8],p=l[1],d=l[5],g=l[9],v=l[2],m=l[6],f=l[10];if(Math.abs(h-p)<.01&&Math.abs(u-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+p)<.1&&Math.abs(u+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const M=(c+1)/2,x=(d+1)/2,P=(f+1)/2,T=(h+p)/4,E=(u+v)/4,R=(g+m)/4;return M>x&&M>P?M<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(M),i=T/n,r=E/n):x>P?x<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(x),n=T/i,r=R/i):P<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(P),n=E/r,i=R/r),this.set(n,i,r,e),this}let _=Math.sqrt((m-g)*(m-g)+(u-v)*(u-v)+(p-h)*(p-h));return Math.abs(_)<.001&&(_=1),this.x=(m-g)/_,this.y=(u-v)/_,this.z=(p-h)/_,this.w=Math.acos((c+d+f-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Zu extends Ji{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new le(0,0,t,e),this.scissorTest=!1,this.viewport=new le(0,0,t,e);const i={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ve,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new be(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new rh(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ze extends Zu{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class ah extends be{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=We,this.minFilter=We,this.wrapR=Tn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ku extends be{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=We,this.minFilter=We,this.wrapR=Tn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class $n{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const p=r[a+0],d=r[a+1],g=r[a+2],v=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=p,t[e+1]=d,t[e+2]=g,t[e+3]=v;return}if(u!==v||l!==p||c!==d||h!==g){let m=1-o;const f=l*p+c*d+h*g+u*v,_=f>=0?1:-1,M=1-f*f;if(M>Number.EPSILON){const P=Math.sqrt(M),T=Math.atan2(P,f*_);m=Math.sin(m*T)/P,o=Math.sin(o*T)/P}const x=o*_;if(l=l*m+p*x,c=c*m+d*x,h=h*m+g*x,u=u*m+v*x,m===1-o){const P=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=P,c*=P,h*=P,u*=P}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],p=r[a+1],d=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*d-c*p,t[e+1]=l*g+h*p+c*u-o*d,t[e+2]=c*g+h*d+o*p-l*u,t[e+3]=h*g-o*u-l*p-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),p=l(n/2),d=l(i/2),g=l(r/2);switch(a){case"XYZ":this._x=p*h*u+c*d*g,this._y=c*d*u-p*h*g,this._z=c*h*g+p*d*u,this._w=c*h*u-p*d*g;break;case"YXZ":this._x=p*h*u+c*d*g,this._y=c*d*u-p*h*g,this._z=c*h*g-p*d*u,this._w=c*h*u+p*d*g;break;case"ZXY":this._x=p*h*u-c*d*g,this._y=c*d*u+p*h*g,this._z=c*h*g+p*d*u,this._w=c*h*u-p*d*g;break;case"ZYX":this._x=p*h*u-c*d*g,this._y=c*d*u+p*h*g,this._z=c*h*g-p*d*u,this._w=c*h*u+p*d*g;break;case"YZX":this._x=p*h*u+c*d*g,this._y=c*d*u+p*h*g,this._z=c*h*g-p*d*u,this._w=c*h*u-p*d*g;break;case"XZY":this._x=p*h*u-c*d*g,this._y=c*d*u-p*h*g,this._z=c*h*g+p*d*u,this._w=c*h*u+p*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],p=n+o+u;if(p>0){const d=.5/Math.sqrt(p+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-i)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(i+a)/d,this._z=(r+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(r-c)/d,this._x=(i+a)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(a-i)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Se(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+i*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-e;return this._w=d*a+e*this._w,this._x=d*n+e*this._x,this._y=d*i+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,p=Math.sin(e*h)/c;return this._w=a*u+this._w*p,this._x=n*u+this._x*p,this._y=i*u+this._y*p,this._z=r*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class A{constructor(t=0,e=0,n=0){A.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(ml.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(ml.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*i-o*n),h=2*(o*e-r*i),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=i+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return zr.copy(this).projectOnVector(t),this.sub(zr)}reflect(t){return this.sub(zr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Se(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const zr=new A,ml=new $n;class ui{constructor(t=new A(1/0,1/0,1/0),e=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(tn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(tn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=tn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,tn):tn.fromBufferAttribute(r,a),tn.applyMatrix4(t.matrixWorld),this.expandByPoint(tn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),zs.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),zs.copy(n.boundingBox)),zs.applyMatrix4(t.matrixWorld),this.union(zs)}const i=t.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,tn),tn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ss),Bs.subVectors(this.max,ss),gi.subVectors(t.a,ss),vi.subVectors(t.b,ss),xi.subVectors(t.c,ss),Fn.subVectors(vi,gi),On.subVectors(xi,vi),Zn.subVectors(gi,xi);let e=[0,-Fn.z,Fn.y,0,-On.z,On.y,0,-Zn.z,Zn.y,Fn.z,0,-Fn.x,On.z,0,-On.x,Zn.z,0,-Zn.x,-Fn.y,Fn.x,0,-On.y,On.x,0,-Zn.y,Zn.x,0];return!Br(e,gi,vi,xi,Bs)||(e=[1,0,0,0,1,0,0,0,1],!Br(e,gi,vi,xi,Bs))?!1:(ks.crossVectors(Fn,On),e=[ks.x,ks.y,ks.z],Br(e,gi,vi,xi,Bs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,tn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(tn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(_n[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),_n[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),_n[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),_n[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),_n[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),_n[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),_n[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),_n[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(_n),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const _n=[new A,new A,new A,new A,new A,new A,new A,new A],tn=new A,zs=new ui,gi=new A,vi=new A,xi=new A,Fn=new A,On=new A,Zn=new A,ss=new A,Bs=new A,ks=new A,Kn=new A;function Br(s,t,e,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){Kn.fromArray(s,r);const o=i.x*Math.abs(Kn.x)+i.y*Math.abs(Kn.y)+i.z*Math.abs(Kn.z),l=t.dot(Kn),c=e.dot(Kn),h=n.dot(Kn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const ju=new ui,rs=new A,kr=new A;class Qi{constructor(t=new A,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):ju.setFromPoints(t).getCenter(n);let i=0;for(let r=0,a=t.length;r<a;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;rs.subVectors(t,this.center);const e=rs.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(rs,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(kr.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(rs.copy(t.center).add(kr)),this.expandByPoint(rs.copy(t.center).sub(kr))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Mn=new A,Hr=new A,Hs=new A,zn=new A,Gr=new A,Gs=new A,Vr=new A;class Do{constructor(t=new A,e=new A(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Mn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Mn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Mn.copy(this.origin).addScaledVector(this.direction,e),Mn.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){Hr.copy(t).add(e).multiplyScalar(.5),Hs.copy(e).sub(t).normalize(),zn.copy(this.origin).sub(Hr);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Hs),o=zn.dot(this.direction),l=-zn.dot(Hs),c=zn.lengthSq(),h=Math.abs(1-a*a);let u,p,d,g;if(h>0)if(u=a*l-o,p=a*o-l,g=r*h,u>=0)if(p>=-g)if(p<=g){const v=1/h;u*=v,p*=v,d=u*(u+a*p+2*o)+p*(a*u+p+2*l)+c}else p=r,u=Math.max(0,-(a*p+o)),d=-u*u+p*(p+2*l)+c;else p=-r,u=Math.max(0,-(a*p+o)),d=-u*u+p*(p+2*l)+c;else p<=-g?(u=Math.max(0,-(-a*r+o)),p=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+p*(p+2*l)+c):p<=g?(u=0,p=Math.min(Math.max(-r,-l),r),d=p*(p+2*l)+c):(u=Math.max(0,-(a*r+o)),p=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+p*(p+2*l)+c);else p=a>0?-r:r,u=Math.max(0,-(a*p+o)),d=-u*u+p*(p+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Hr).addScaledVector(Hs,p),d}intersectSphere(t,e){Mn.subVectors(t.center,this.origin);const n=Mn.dot(this.direction),i=Mn.dot(Mn)-n*n,r=t.radius*t.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,p=this.origin;return c>=0?(n=(t.min.x-p.x)*c,i=(t.max.x-p.x)*c):(n=(t.max.x-p.x)*c,i=(t.min.x-p.x)*c),h>=0?(r=(t.min.y-p.y)*h,a=(t.max.y-p.y)*h):(r=(t.max.y-p.y)*h,a=(t.min.y-p.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(t.min.z-p.z)*u,l=(t.max.z-p.z)*u):(o=(t.max.z-p.z)*u,l=(t.min.z-p.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Mn)!==null}intersectTriangle(t,e,n,i,r){Gr.subVectors(e,t),Gs.subVectors(n,t),Vr.crossVectors(Gr,Gs);let a=this.direction.dot(Vr),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;zn.subVectors(this.origin,t);const l=o*this.direction.dot(Gs.crossVectors(zn,Gs));if(l<0)return null;const c=o*this.direction.dot(Gr.cross(zn));if(c<0||l+c>a)return null;const h=-o*zn.dot(Vr);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Wt{constructor(t,e,n,i,r,a,o,l,c,h,u,p,d,g,v,m){Wt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c,h,u,p,d,g,v,m)}set(t,e,n,i,r,a,o,l,c,h,u,p,d,g,v,m){const f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=i,f[1]=r,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=h,f[10]=u,f[14]=p,f[3]=d,f[7]=g,f[11]=v,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Wt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/_i.setFromMatrixColumn(t,0).length(),r=1/_i.setFromMatrixColumn(t,1).length(),a=1/_i.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const p=a*h,d=a*u,g=o*h,v=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+g*c,e[5]=p-v*c,e[9]=-o*l,e[2]=v-p*c,e[6]=g+d*c,e[10]=a*l}else if(t.order==="YXZ"){const p=l*h,d=l*u,g=c*h,v=c*u;e[0]=p+v*o,e[4]=g*o-d,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=d*o-g,e[6]=v+p*o,e[10]=a*l}else if(t.order==="ZXY"){const p=l*h,d=l*u,g=c*h,v=c*u;e[0]=p-v*o,e[4]=-a*u,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*h,e[9]=v-p*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const p=a*h,d=a*u,g=o*h,v=o*u;e[0]=l*h,e[4]=g*c-d,e[8]=p*c+v,e[1]=l*u,e[5]=v*c+p,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const p=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=v-p*u,e[8]=g*u+d,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*u+g,e[10]=p-v*u}else if(t.order==="XZY"){const p=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=p*u+v,e[5]=a*h,e[9]=d*u-g,e[2]=g*u-d,e[6]=o*h,e[10]=v*u+p}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Ju,t,Qu)}lookAt(t,e,n){const i=this.elements;return Oe.subVectors(t,e),Oe.lengthSq()===0&&(Oe.z=1),Oe.normalize(),Bn.crossVectors(n,Oe),Bn.lengthSq()===0&&(Math.abs(n.z)===1?Oe.x+=1e-4:Oe.z+=1e-4,Oe.normalize(),Bn.crossVectors(n,Oe)),Bn.normalize(),Vs.crossVectors(Oe,Bn),i[0]=Bn.x,i[4]=Vs.x,i[8]=Oe.x,i[1]=Bn.y,i[5]=Vs.y,i[9]=Oe.y,i[2]=Bn.z,i[6]=Vs.z,i[10]=Oe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],p=n[9],d=n[13],g=n[2],v=n[6],m=n[10],f=n[14],_=n[3],M=n[7],x=n[11],P=n[15],T=i[0],E=i[4],R=i[8],S=i[12],y=i[1],L=i[5],D=i[9],N=i[13],H=i[2],B=i[6],G=i[10],Y=i[14],z=i[3],V=i[7],Q=i[11],st=i[15];return r[0]=a*T+o*y+l*H+c*z,r[4]=a*E+o*L+l*B+c*V,r[8]=a*R+o*D+l*G+c*Q,r[12]=a*S+o*N+l*Y+c*st,r[1]=h*T+u*y+p*H+d*z,r[5]=h*E+u*L+p*B+d*V,r[9]=h*R+u*D+p*G+d*Q,r[13]=h*S+u*N+p*Y+d*st,r[2]=g*T+v*y+m*H+f*z,r[6]=g*E+v*L+m*B+f*V,r[10]=g*R+v*D+m*G+f*Q,r[14]=g*S+v*N+m*Y+f*st,r[3]=_*T+M*y+x*H+P*z,r[7]=_*E+M*L+x*B+P*V,r[11]=_*R+M*D+x*G+P*Q,r[15]=_*S+M*N+x*Y+P*st,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],p=t[10],d=t[14],g=t[3],v=t[7],m=t[11],f=t[15];return g*(+r*l*u-i*c*u-r*o*p+n*c*p+i*o*d-n*l*d)+v*(+e*l*d-e*c*p+r*a*p-i*a*d+i*c*h-r*l*h)+m*(+e*c*u-e*o*d-r*a*u+n*a*d+r*o*h-n*c*h)+f*(-i*o*h-e*l*u+e*o*p+i*a*u-n*a*p+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],p=t[10],d=t[11],g=t[12],v=t[13],m=t[14],f=t[15],_=u*m*c-v*p*c+v*l*d-o*m*d-u*l*f+o*p*f,M=g*p*c-h*m*c-g*l*d+a*m*d+h*l*f-a*p*f,x=h*v*c-g*u*c+g*o*d-a*v*d-h*o*f+a*u*f,P=g*u*l-h*v*l-g*o*p+a*v*p+h*o*m-a*u*m,T=e*_+n*M+i*x+r*P;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const E=1/T;return t[0]=_*E,t[1]=(v*p*r-u*m*r-v*i*d+n*m*d+u*i*f-n*p*f)*E,t[2]=(o*m*r-v*l*r+v*i*c-n*m*c-o*i*f+n*l*f)*E,t[3]=(u*l*r-o*p*r-u*i*c+n*p*c+o*i*d-n*l*d)*E,t[4]=M*E,t[5]=(h*m*r-g*p*r+g*i*d-e*m*d-h*i*f+e*p*f)*E,t[6]=(g*l*r-a*m*r-g*i*c+e*m*c+a*i*f-e*l*f)*E,t[7]=(a*p*r-h*l*r+h*i*c-e*p*c-a*i*d+e*l*d)*E,t[8]=x*E,t[9]=(g*u*r-h*v*r-g*n*d+e*v*d+h*n*f-e*u*f)*E,t[10]=(a*v*r-g*o*r+g*n*c-e*v*c-a*n*f+e*o*f)*E,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*d-e*o*d)*E,t[12]=P*E,t[13]=(h*v*i-g*u*i+g*n*p-e*v*p-h*n*m+e*u*m)*E,t[14]=(g*o*i-a*v*i-g*n*l+e*v*l+a*n*m-e*o*m)*E,t[15]=(a*u*i-h*o*i+h*n*l-e*u*l-a*n*p+e*o*p)*E,this}scale(t){const e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,a){return this.set(1,n,r,0,t,1,a,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,p=r*c,d=r*h,g=r*u,v=a*h,m=a*u,f=o*u,_=l*c,M=l*h,x=l*u,P=n.x,T=n.y,E=n.z;return i[0]=(1-(v+f))*P,i[1]=(d+x)*P,i[2]=(g-M)*P,i[3]=0,i[4]=(d-x)*T,i[5]=(1-(p+f))*T,i[6]=(m+_)*T,i[7]=0,i[8]=(g+M)*E,i[9]=(m-_)*E,i[10]=(1-(p+v))*E,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let r=_i.set(i[0],i[1],i[2]).length();const a=_i.set(i[4],i[5],i[6]).length(),o=_i.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),t.x=i[12],t.y=i[13],t.z=i[14],en.copy(this);const c=1/r,h=1/a,u=1/o;return en.elements[0]*=c,en.elements[1]*=c,en.elements[2]*=c,en.elements[4]*=h,en.elements[5]*=h,en.elements[6]*=h,en.elements[8]*=u,en.elements[9]*=u,en.elements[10]*=u,e.setFromRotationMatrix(en),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,i,r,a,o=An){const l=this.elements,c=2*r/(e-t),h=2*r/(n-i),u=(e+t)/(e-t),p=(n+i)/(n-i);let d,g;if(o===An)d=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===br)d=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,r,a,o=An){const l=this.elements,c=1/(e-t),h=1/(n-i),u=1/(a-r),p=(e+t)*c,d=(n+i)*h;let g,v;if(o===An)g=(a+r)*u,v=-2*u;else if(o===br)g=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const _i=new A,en=new Wt,Ju=new A(0,0,0),Qu=new A(1,1,1),Bn=new A,Vs=new A,Oe=new A,gl=new Wt,vl=new $n;class ln{constructor(t=0,e=0,n=0,i=ln.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],p=i[6],d=i[10];switch(e){case"XYZ":this._y=Math.asin(Se(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Se(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Se(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Se(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Se(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Se(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return gl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(gl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return vl.setFromEuler(this),this.setFromQuaternion(vl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ln.DEFAULT_ORDER="XYZ";class Io{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let td=0;const xl=new A,Mi=new $n,yn=new Wt,Ws=new A,as=new A,ed=new A,nd=new $n,_l=new A(1,0,0),Ml=new A(0,1,0),yl=new A(0,0,1),Sl={type:"added"},id={type:"removed"},yi={type:"childadded",child:null},Wr={type:"childremoved",child:null};class xe extends Ji{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:td++}),this.uuid=mn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=xe.DEFAULT_UP.clone();const t=new A,e=new ln,n=new $n,i=new A(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Wt},normalMatrix:{value:new Ht}}),this.matrix=new Wt,this.matrixWorld=new Wt,this.matrixAutoUpdate=xe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Io,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Mi.setFromAxisAngle(t,e),this.quaternion.multiply(Mi),this}rotateOnWorldAxis(t,e){return Mi.setFromAxisAngle(t,e),this.quaternion.premultiply(Mi),this}rotateX(t){return this.rotateOnAxis(_l,t)}rotateY(t){return this.rotateOnAxis(Ml,t)}rotateZ(t){return this.rotateOnAxis(yl,t)}translateOnAxis(t,e){return xl.copy(t).applyQuaternion(this.quaternion),this.position.add(xl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(_l,t)}translateY(t){return this.translateOnAxis(Ml,t)}translateZ(t){return this.translateOnAxis(yl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(yn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ws.copy(t):Ws.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),as.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yn.lookAt(as,Ws,this.up):yn.lookAt(Ws,as,this.up),this.quaternion.setFromRotationMatrix(yn),i&&(yn.extractRotation(i.matrixWorld),Mi.setFromRotationMatrix(yn),this.quaternion.premultiply(Mi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Sl),yi.child=t,this.dispatchEvent(yi),yi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(id),Wr.child=t,this.dispatchEvent(Wr),Wr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),yn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),yn.multiply(t.parent.matrixWorld)),t.applyMatrix4(yn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Sl),yi.child=t,this.dispatchEvent(yi),yi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(as,t,ed),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(as,nd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));i.material=o}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),p=a(t.skeletons),d=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),p.length>0&&(n.skeletons=p),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}xe.DEFAULT_UP=new A(0,1,0);xe.DEFAULT_MATRIX_AUTO_UPDATE=!0;xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const nn=new A,Sn=new A,Xr=new A,wn=new A,Si=new A,wi=new A,wl=new A,$r=new A,qr=new A,Yr=new A,Zr=new le,Kr=new le,jr=new le;class Ye{constructor(t=new A,e=new A,n=new A){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),nn.subVectors(t,e),i.cross(nn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){nn.subVectors(i,e),Sn.subVectors(n,e),Xr.subVectors(t,e);const a=nn.dot(nn),o=nn.dot(Sn),l=nn.dot(Xr),c=Sn.dot(Sn),h=Sn.dot(Xr),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const p=1/u,d=(c*l-o*h)*p,g=(a*h-o*l)*p;return r.set(1-d-g,g,d)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,wn)===null?!1:wn.x>=0&&wn.y>=0&&wn.x+wn.y<=1}static getInterpolation(t,e,n,i,r,a,o,l){return this.getBarycoord(t,e,n,i,wn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,wn.x),l.addScaledVector(a,wn.y),l.addScaledVector(o,wn.z),l)}static getInterpolatedAttribute(t,e,n,i,r,a){return Zr.setScalar(0),Kr.setScalar(0),jr.setScalar(0),Zr.fromBufferAttribute(t,e),Kr.fromBufferAttribute(t,n),jr.fromBufferAttribute(t,i),a.setScalar(0),a.addScaledVector(Zr,r.x),a.addScaledVector(Kr,r.y),a.addScaledVector(jr,r.z),a}static isFrontFacing(t,e,n,i){return nn.subVectors(n,e),Sn.subVectors(t,e),nn.cross(Sn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return nn.subVectors(this.c,this.b),Sn.subVectors(this.a,this.b),nn.cross(Sn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Ye.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Ye.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return Ye.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return Ye.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Ye.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,r=this.c;let a,o;Si.subVectors(i,n),wi.subVectors(r,n),$r.subVectors(t,n);const l=Si.dot($r),c=wi.dot($r);if(l<=0&&c<=0)return e.copy(n);qr.subVectors(t,i);const h=Si.dot(qr),u=wi.dot(qr);if(h>=0&&u<=h)return e.copy(i);const p=l*u-h*c;if(p<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(Si,a);Yr.subVectors(t,r);const d=Si.dot(Yr),g=wi.dot(Yr);if(g>=0&&d<=g)return e.copy(r);const v=d*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(wi,o);const m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return wl.subVectors(r,i),o=(u-h)/(u-h+(d-g)),e.copy(i).addScaledVector(wl,o);const f=1/(m+v+p);return a=v*f,o=p*f,e.copy(n).addScaledVector(Si,a).addScaledVector(wi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const oh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},kn={h:0,s:0,l:0},Xs={h:0,s:0,l:0};function Jr(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class mt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=re){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,qt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=qt.workingColorSpace){return this.r=t,this.g=e,this.b=n,qt.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=qt.workingColorSpace){if(t=Lo(t,1),e=Se(e,0,1),n=Se(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Jr(a,r,t+1/3),this.g=Jr(a,r,t),this.b=Jr(a,r,t-1/3)}return qt.toWorkingColorSpace(this,i),this}setStyle(t,e=re){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=re){const n=oh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Pn(t.r),this.g=Pn(t.g),this.b=Pn(t.b),this}copyLinearToSRGB(t){return this.r=ki(t.r),this.g=ki(t.g),this.b=ki(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=re){return qt.fromWorkingColorSpace(Ae.copy(this),t),Math.round(Se(Ae.r*255,0,255))*65536+Math.round(Se(Ae.g*255,0,255))*256+Math.round(Se(Ae.b*255,0,255))}getHexString(t=re){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=qt.workingColorSpace){qt.fromWorkingColorSpace(Ae.copy(this),e);const n=Ae.r,i=Ae.g,r=Ae.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=qt.workingColorSpace){return qt.fromWorkingColorSpace(Ae.copy(this),e),t.r=Ae.r,t.g=Ae.g,t.b=Ae.b,t}getStyle(t=re){qt.fromWorkingColorSpace(Ae.copy(this),t);const e=Ae.r,n=Ae.g,i=Ae.b;return t!==re?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(kn),this.setHSL(kn.h+t,kn.s+e,kn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(kn),t.getHSL(Xs);const n=Ms(kn.h,Xs.h,e),i=Ms(kn.s,Xs.s,e),r=Ms(kn.l,Xs.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ae=new mt;mt.NAMES=oh;let sd=0;class qn extends Ji{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:sd++}),this.uuid=mn(),this.name="",this.blending=oi,this.side=Dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ta,this.blendDst=Ea,this.blendEquation=si,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new mt(0,0,0),this.blendAlpha=0,this.depthFunc=Hi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=rl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=pi,this.stencilZFail=pi,this.stencilZPass=pi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==oi&&(n.blending=this.blending),this.side!==Dn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ta&&(n.blendSrc=this.blendSrc),this.blendDst!==Ea&&(n.blendDst=this.blendDst),this.blendEquation!==si&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Hi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==rl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==pi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==pi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==pi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=i(t.textures),a=i(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Ke extends qn{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.combine=yo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ve=new A,$s=new it;class me{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=co,this.updateRanges=[],this.gpuType=pn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)$s.fromBufferAttribute(this,e),$s.applyMatrix3(t),this.setXY(e,$s.x,$s.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyMatrix3(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyMatrix4(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyNormalMatrix(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.transformDirection(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=rn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ne(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=rn(e,this.array)),e}setX(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=rn(e,this.array)),e}setY(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=rn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=rn(e,this.array)),e}setW(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array),r=ne(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==co&&(t.usage=this.usage),t}}class lh extends me{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class ch extends me{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Qt extends me{constructor(t,e,n){super(new Float32Array(t),e,n)}}let rd=0;const $e=new Wt,Qr=new xe,bi=new A,ze=new ui,os=new ui,ye=new A;class ge extends Ji{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rd++}),this.uuid=mn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(sh(t)?ch:lh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ht().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return $e.makeRotationFromQuaternion(t),this.applyMatrix4($e),this}rotateX(t){return $e.makeRotationX(t),this.applyMatrix4($e),this}rotateY(t){return $e.makeRotationY(t),this.applyMatrix4($e),this}rotateZ(t){return $e.makeRotationZ(t),this.applyMatrix4($e),this}translate(t,e,n){return $e.makeTranslation(t,e,n),this.applyMatrix4($e),this}scale(t,e,n){return $e.makeScale(t,e,n),this.applyMatrix4($e),this}lookAt(t){return Qr.lookAt(t),Qr.updateMatrix(),this.applyMatrix4(Qr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bi).negate(),this.translate(bi.x,bi.y,bi.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let i=0,r=t.length;i<r;i++){const a=t[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Qt(n,3))}else{for(let n=0,i=e.count;n<i;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ui);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const r=e[n];ze.setFromBufferAttribute(r),this.morphTargetsRelative?(ye.addVectors(this.boundingBox.min,ze.min),this.boundingBox.expandByPoint(ye),ye.addVectors(this.boundingBox.max,ze.max),this.boundingBox.expandByPoint(ye)):(this.boundingBox.expandByPoint(ze.min),this.boundingBox.expandByPoint(ze.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(t){const n=this.boundingSphere.center;if(ze.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];os.setFromBufferAttribute(o),this.morphTargetsRelative?(ye.addVectors(ze.min,os.min),ze.expandByPoint(ye),ye.addVectors(ze.max,os.max),ze.expandByPoint(ye)):(ze.expandByPoint(os.min),ze.expandByPoint(os.max))}ze.getCenter(n);let i=0;for(let r=0,a=t.count;r<a;r++)ye.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(ye));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)ye.fromBufferAttribute(o,c),l&&(bi.fromBufferAttribute(t,c),ye.add(bi)),i=Math.max(i,n.distanceToSquared(ye))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new me(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let R=0;R<n.count;R++)o[R]=new A,l[R]=new A;const c=new A,h=new A,u=new A,p=new it,d=new it,g=new it,v=new A,m=new A;function f(R,S,y){c.fromBufferAttribute(n,R),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,y),p.fromBufferAttribute(r,R),d.fromBufferAttribute(r,S),g.fromBufferAttribute(r,y),h.sub(c),u.sub(c),d.sub(p),g.sub(p);const L=1/(d.x*g.y-g.x*d.y);isFinite(L)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(L),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(L),o[R].add(v),o[S].add(v),o[y].add(v),l[R].add(m),l[S].add(m),l[y].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let R=0,S=_.length;R<S;++R){const y=_[R],L=y.start,D=y.count;for(let N=L,H=L+D;N<H;N+=3)f(t.getX(N+0),t.getX(N+1),t.getX(N+2))}const M=new A,x=new A,P=new A,T=new A;function E(R){P.fromBufferAttribute(i,R),T.copy(P);const S=o[R];M.copy(S),M.sub(P.multiplyScalar(P.dot(S))).normalize(),x.crossVectors(T,S);const L=x.dot(l[R])<0?-1:1;a.setXYZW(R,M.x,M.y,M.z,L)}for(let R=0,S=_.length;R<S;++R){const y=_[R],L=y.start,D=y.count;for(let N=L,H=L+D;N<H;N+=3)E(t.getX(N+0)),E(t.getX(N+1)),E(t.getX(N+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new me(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let p=0,d=n.count;p<d;p++)n.setXYZ(p,0,0,0);const i=new A,r=new A,a=new A,o=new A,l=new A,c=new A,h=new A,u=new A;if(t)for(let p=0,d=t.count;p<d;p+=3){const g=t.getX(p+0),v=t.getX(p+1),m=t.getX(p+2);i.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let p=0,d=e.count;p<d;p+=3)i.fromBufferAttribute(e,p+0),r.fromBufferAttribute(e,p+1),a.fromBufferAttribute(e,p+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(p+0,h.x,h.y,h.z),n.setXYZ(p+1,h.x,h.y,h.z),n.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ye.fromBufferAttribute(t,e),ye.normalize(),t.setXYZ(e,ye.x,ye.y,ye.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,p=new c.constructor(l.length*h);let d=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*h;for(let f=0;f<h;f++)p[g++]=c[d++]}return new me(p,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new ge,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const p=c[h],d=t(p,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,p=c.length;u<p;u++){const d=c[u];h.push(d.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let p=0,d=u.length;p<d;p++)h.push(u[p].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const bl=new Wt,jn=new Do,qs=new Qi,Tl=new A,Ys=new A,Zs=new A,Ks=new A,ta=new A,js=new A,El=new A,Js=new A;class Ft extends xe{constructor(t=new ge,e=new Ke){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const o=this.morphTargetInfluences;if(r&&o){js.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(ta.fromBufferAttribute(u,t),a?js.addScaledVector(ta,h):js.addScaledVector(ta.sub(e),h))}e.add(js)}return e}raycast(t,e){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),qs.copy(n.boundingSphere),qs.applyMatrix4(r),jn.copy(t.ray).recast(t.near),!(qs.containsPoint(jn.origin)===!1&&(jn.intersectSphere(qs,Tl)===null||jn.origin.distanceToSquared(Tl)>(t.far-t.near)**2))&&(bl.copy(r).invert(),jn.copy(t.ray).applyMatrix4(bl),!(n.boundingBox!==null&&jn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,jn)))}_computeIntersections(t,e,n){let i;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,p=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=p.length;g<v;g++){const m=p[g],f=a[m.materialIndex],_=Math.max(m.start,d.start),M=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let x=_,P=M;x<P;x+=3){const T=o.getX(x),E=o.getX(x+1),R=o.getX(x+2);i=Qs(this,f,t,n,c,h,u,T,E,R),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const g=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let m=g,f=v;m<f;m+=3){const _=o.getX(m),M=o.getX(m+1),x=o.getX(m+2);i=Qs(this,a,t,n,c,h,u,_,M,x),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=p.length;g<v;g++){const m=p[g],f=a[m.materialIndex],_=Math.max(m.start,d.start),M=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let x=_,P=M;x<P;x+=3){const T=x,E=x+1,R=x+2;i=Qs(this,f,t,n,c,h,u,T,E,R),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const g=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let m=g,f=v;m<f;m+=3){const _=m,M=m+1,x=m+2;i=Qs(this,a,t,n,c,h,u,_,M,x),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}}}function ad(s,t,e,n,i,r,a,o){let l;if(t.side===Le?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,t.side===Dn,o),l===null)return null;Js.copy(o),Js.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Js);return c<e.near||c>e.far?null:{distance:c,point:Js.clone(),object:s}}function Qs(s,t,e,n,i,r,a,o,l,c){s.getVertexPosition(o,Ys),s.getVertexPosition(l,Zs),s.getVertexPosition(c,Ks);const h=ad(s,t,e,n,Ys,Zs,Ks,El);if(h){const u=new A;Ye.getBarycoord(El,Ys,Zs,Ks,u),i&&(h.uv=Ye.getInterpolatedAttribute(i,o,l,c,u,new it)),r&&(h.uv1=Ye.getInterpolatedAttribute(r,o,l,c,u,new it)),a&&(h.normal=Ye.getInterpolatedAttribute(a,o,l,c,u,new A),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const p={a:o,b:l,c,normal:new A,materialIndex:0};Ye.getNormal(Ys,Zs,Ks,p.normal),h.face=p,h.barycoord=u}return h}class Re extends ge{constructor(t=1,e=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let p=0,d=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,i,a,2),g("x","z","y",1,-1,t,n,-e,i,a,3),g("x","y","z",1,-1,t,e,n,i,r,4),g("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new Qt(c,3)),this.setAttribute("normal",new Qt(h,3)),this.setAttribute("uv",new Qt(u,2));function g(v,m,f,_,M,x,P,T,E,R,S){const y=x/E,L=P/R,D=x/2,N=P/2,H=T/2,B=E+1,G=R+1;let Y=0,z=0;const V=new A;for(let Q=0;Q<G;Q++){const st=Q*L-N;for(let at=0;at<B;at++){const Dt=at*y-D;V[v]=Dt*_,V[m]=st*M,V[f]=H,c.push(V.x,V.y,V.z),V[v]=0,V[m]=0,V[f]=T>0?1:-1,h.push(V.x,V.y,V.z),u.push(at/E),u.push(1-Q/R),Y+=1}}for(let Q=0;Q<R;Q++)for(let st=0;st<E;st++){const at=p+st+B*Q,Dt=p+st+B*(Q+1),X=p+(st+1)+B*(Q+1),tt=p+(st+1)+B*Q;l.push(at,Dt,tt),l.push(Dt,X,tt),z+=6}o.addGroup(d,z,S),d+=z,p+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Re(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function $i(s){const t={};for(const e in s){t[e]={};for(const n in s[e]){const i=s[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function Ie(s){const t={};for(let e=0;e<s.length;e++){const n=$i(s[e]);for(const i in n)t[i]=n[i]}return t}function od(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function hh(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:qt.workingColorSpace}const cn={clone:$i,merge:Ie};var ld=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class pe extends qn{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ld,this.fragmentShader=cd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=$i(t.uniforms),this.uniformsGroups=od(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?e.uniforms[i]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[i]={type:"m4",value:a.toArray()}:e.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class uh extends xe{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Wt,this.projectionMatrix=new Wt,this.projectionMatrixInverse=new Wt,this.coordinateSystem=An}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Hn=new A,Al=new it,Cl=new it;class Ge extends uh{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=As*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(_s*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return As*2*Math.atan(Math.tan(_s*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Hn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Hn.x,Hn.y).multiplyScalar(-t/Hn.z),Hn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Hn.x,Hn.y).multiplyScalar(-t/Hn.z)}getViewSize(t,e){return this.getViewBounds(t,Al,Cl),e.subVectors(Cl,Al)}setViewOffset(t,e,n,i,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(_s*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,e-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ti=-90,Ei=1;class hd extends xe{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Ge(Ti,Ei,t,e);i.layers=this.layers,this.add(i);const r=new Ge(Ti,Ei,t,e);r.layers=this.layers,this.add(r);const a=new Ge(Ti,Ei,t,e);a.layers=this.layers,this.add(a);const o=new Ge(Ti,Ei,t,e);o.layers=this.layers,this.add(o);const l=new Ge(Ti,Ei,t,e);l.layers=this.layers,this.add(l);const c=new Ge(Ti,Ei,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===An)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===br)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),p=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,r),t.setRenderTarget(n,1,i),t.render(e,a),t.setRenderTarget(n,2,i),t.render(e,o),t.setRenderTarget(n,3,i),t.render(e,l),t.setRenderTarget(n,4,i),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(u,p,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class dh extends be{constructor(t,e,n,i,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Gi,super(t,e,n,i,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class ud extends Ze{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new dh(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Ve}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Re(5,5,5),r=new pe({name:"CubemapFromEquirect",uniforms:$i(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Le,blending:Cn});r.uniforms.tEquirect.value=e;const a=new Ft(i,r),o=e.minFilter;return e.minFilter===En&&(e.minFilter=Ve),new hd(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,i){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,i);t.setRenderTarget(r)}}const ea=new A,dd=new A,fd=new Ht;class Gn{constructor(t=new A(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=ea.subVectors(n,e).cross(dd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(ea),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||fd.getNormalMatrix(t),i=this.coplanarPoint(ea).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Jn=new Qi,tr=new A;class Uo{constructor(t=new Gn,e=new Gn,n=new Gn,i=new Gn,r=new Gn,a=new Gn){this.planes=[t,e,n,i,r,a]}set(t,e,n,i,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=An){const n=this.planes,i=t.elements,r=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],u=i[6],p=i[7],d=i[8],g=i[9],v=i[10],m=i[11],f=i[12],_=i[13],M=i[14],x=i[15];if(n[0].setComponents(l-r,p-c,m-d,x-f).normalize(),n[1].setComponents(l+r,p+c,m+d,x+f).normalize(),n[2].setComponents(l+a,p+h,m+g,x+_).normalize(),n[3].setComponents(l-a,p-h,m-g,x-_).normalize(),n[4].setComponents(l-o,p-u,m-v,x-M).normalize(),e===An)n[5].setComponents(l+o,p+u,m+v,x+M).normalize();else if(e===br)n[5].setComponents(o,u,v,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Jn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Jn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Jn)}intersectsSprite(t){return Jn.center.set(0,0,0),Jn.radius=.7071067811865476,Jn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Jn)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if(tr.x=i.normal.x>0?t.max.x:t.min.x,tr.y=i.normal.y>0?t.max.y:t.min.y,tr.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(tr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function fh(){let s=null,t=!1,e=null,n=null;function i(r,a){e(r,a),n=s.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function pd(s){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,p=s.createBuffer();s.bindBuffer(l,p),s.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=s.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=s.SHORT;else if(c instanceof Uint32Array)d=s.UNSIGNED_INT;else if(c instanceof Int32Array)d=s.INT;else if(c instanceof Int8Array)d=s.BYTE;else if(c instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((d,g)=>d.start-g.start);let p=0;for(let d=1;d<u.length;d++){const g=u[p],v=u[d];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++p,u[p]=v)}u.length=p+1;for(let d=0,g=u.length;d<g;d++){const v=u[d];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}class hn extends ge{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=t/o,p=e/l,d=[],g=[],v=[],m=[];for(let f=0;f<h;f++){const _=f*p-a;for(let M=0;M<c;M++){const x=M*u-r;g.push(x,-_,0),v.push(0,0,1),m.push(M/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let _=0;_<o;_++){const M=_+c*f,x=_+c*(f+1),P=_+1+c*(f+1),T=_+1+c*f;d.push(M,x,T),d.push(x,P,T)}this.setIndex(d),this.setAttribute("position",new Qt(g,3)),this.setAttribute("normal",new Qt(v,3)),this.setAttribute("uv",new Qt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new hn(t.width,t.height,t.widthSegments,t.heightSegments)}}var md=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,gd=`#ifdef USE_ALPHAHASH
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
#endif`,vd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,xd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_d=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Md=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yd=`#ifdef USE_AOMAP
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
#endif`,Sd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,wd=`#ifdef USE_BATCHING
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
#endif`,bd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Td=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ed=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ad=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Cd=`#ifdef USE_IRIDESCENCE
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
#endif`,Rd=`#ifdef USE_BUMPMAP
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
#endif`,Pd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Ld=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Dd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Id=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ud=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Nd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Fd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Od=`#if defined( USE_COLOR_ALPHA )
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
#endif`,zd=`#define PI 3.141592653589793
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
} // validated`,Bd=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,kd=`vec3 transformedNormal = objectNormal;
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
#endif`,Hd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Gd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Vd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Wd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Xd="gl_FragColor = linearToOutputTexel( gl_FragColor );",$d=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,qd=`#ifdef USE_ENVMAP
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
#endif`,Yd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Zd=`#ifdef USE_ENVMAP
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
#endif`,Kd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,jd=`#ifdef USE_ENVMAP
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
#endif`,Jd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Qd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,tf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ef=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,nf=`#ifdef USE_GRADIENTMAP
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
}`,sf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,rf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,af=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,of=`uniform bool receiveShadow;
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
#endif`,lf=`#ifdef USE_ENVMAP
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
#endif`,cf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,hf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,uf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,df=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ff=`PhysicalMaterial material;
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
#endif`,pf=`struct PhysicalMaterial {
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
}`,mf=`
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
#endif`,gf=`#if defined( RE_IndirectDiffuse )
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
#endif`,vf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,xf=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,_f=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Mf=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,yf=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Sf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,wf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,bf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Tf=`#if defined( USE_POINTS_UV )
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
#endif`,Ef=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Af=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Cf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Rf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Pf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lf=`#ifdef USE_MORPHTARGETS
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
#endif`,Df=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,If=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Uf=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Nf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ff=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Of=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,zf=`#ifdef USE_NORMALMAP
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
#endif`,Bf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,kf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Hf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Gf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Vf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Wf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Xf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,$f=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,qf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Yf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Zf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Kf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,jf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Jf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Qf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,tp=`float getShadowMask() {
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
}`,ep=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,np=`#ifdef USE_SKINNING
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
#endif`,ip=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,sp=`#ifdef USE_SKINNING
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
#endif`,rp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,ap=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,op=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,lp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,cp=`#ifdef USE_TRANSMISSION
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
#endif`,hp=`#ifdef USE_TRANSMISSION
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
#endif`,up=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,dp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,fp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,pp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const mp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,gp=`uniform sampler2D t2D;
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
}`,vp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xp=`#ifdef ENVMAP_TYPE_CUBE
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
}`,_p=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yp=`#include <common>
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
}`,Sp=`#if DEPTH_PACKING == 3200
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
}`,wp=`#define DISTANCE
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
}`,bp=`#define DISTANCE
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
}`,Tp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ep=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ap=`uniform float scale;
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
}`,Cp=`uniform vec3 diffuse;
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
}`,Rp=`#include <common>
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
}`,Pp=`uniform vec3 diffuse;
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
}`,Lp=`#define LAMBERT
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
}`,Dp=`#define LAMBERT
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
}`,Ip=`#define MATCAP
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
}`,Up=`#define MATCAP
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
}`,Np=`#define NORMAL
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
}`,Fp=`#define NORMAL
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
}`,Op=`#define PHONG
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
}`,zp=`#define PHONG
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
}`,Bp=`#define STANDARD
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
}`,kp=`#define STANDARD
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
}`,Hp=`#define TOON
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
}`,Gp=`#define TOON
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
}`,Vp=`uniform float size;
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
}`,Wp=`uniform vec3 diffuse;
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
}`,Xp=`#include <common>
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
}`,$p=`uniform vec3 color;
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
}`,qp=`uniform float rotation;
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
}`,Yp=`uniform vec3 diffuse;
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
}`,Gt={alphahash_fragment:md,alphahash_pars_fragment:gd,alphamap_fragment:vd,alphamap_pars_fragment:xd,alphatest_fragment:_d,alphatest_pars_fragment:Md,aomap_fragment:yd,aomap_pars_fragment:Sd,batching_pars_vertex:wd,batching_vertex:bd,begin_vertex:Td,beginnormal_vertex:Ed,bsdfs:Ad,iridescence_fragment:Cd,bumpmap_pars_fragment:Rd,clipping_planes_fragment:Pd,clipping_planes_pars_fragment:Ld,clipping_planes_pars_vertex:Dd,clipping_planes_vertex:Id,color_fragment:Ud,color_pars_fragment:Nd,color_pars_vertex:Fd,color_vertex:Od,common:zd,cube_uv_reflection_fragment:Bd,defaultnormal_vertex:kd,displacementmap_pars_vertex:Hd,displacementmap_vertex:Gd,emissivemap_fragment:Vd,emissivemap_pars_fragment:Wd,colorspace_fragment:Xd,colorspace_pars_fragment:$d,envmap_fragment:qd,envmap_common_pars_fragment:Yd,envmap_pars_fragment:Zd,envmap_pars_vertex:Kd,envmap_physical_pars_fragment:lf,envmap_vertex:jd,fog_vertex:Jd,fog_pars_vertex:Qd,fog_fragment:tf,fog_pars_fragment:ef,gradientmap_pars_fragment:nf,lightmap_pars_fragment:sf,lights_lambert_fragment:rf,lights_lambert_pars_fragment:af,lights_pars_begin:of,lights_toon_fragment:cf,lights_toon_pars_fragment:hf,lights_phong_fragment:uf,lights_phong_pars_fragment:df,lights_physical_fragment:ff,lights_physical_pars_fragment:pf,lights_fragment_begin:mf,lights_fragment_maps:gf,lights_fragment_end:vf,logdepthbuf_fragment:xf,logdepthbuf_pars_fragment:_f,logdepthbuf_pars_vertex:Mf,logdepthbuf_vertex:yf,map_fragment:Sf,map_pars_fragment:wf,map_particle_fragment:bf,map_particle_pars_fragment:Tf,metalnessmap_fragment:Ef,metalnessmap_pars_fragment:Af,morphinstance_vertex:Cf,morphcolor_vertex:Rf,morphnormal_vertex:Pf,morphtarget_pars_vertex:Lf,morphtarget_vertex:Df,normal_fragment_begin:If,normal_fragment_maps:Uf,normal_pars_fragment:Nf,normal_pars_vertex:Ff,normal_vertex:Of,normalmap_pars_fragment:zf,clearcoat_normal_fragment_begin:Bf,clearcoat_normal_fragment_maps:kf,clearcoat_pars_fragment:Hf,iridescence_pars_fragment:Gf,opaque_fragment:Vf,packing:Wf,premultiplied_alpha_fragment:Xf,project_vertex:$f,dithering_fragment:qf,dithering_pars_fragment:Yf,roughnessmap_fragment:Zf,roughnessmap_pars_fragment:Kf,shadowmap_pars_fragment:jf,shadowmap_pars_vertex:Jf,shadowmap_vertex:Qf,shadowmask_pars_fragment:tp,skinbase_vertex:ep,skinning_pars_vertex:np,skinning_vertex:ip,skinnormal_vertex:sp,specularmap_fragment:rp,specularmap_pars_fragment:ap,tonemapping_fragment:op,tonemapping_pars_fragment:lp,transmission_fragment:cp,transmission_pars_fragment:hp,uv_pars_fragment:up,uv_pars_vertex:dp,uv_vertex:fp,worldpos_vertex:pp,background_vert:mp,background_frag:gp,backgroundCube_vert:vp,backgroundCube_frag:xp,cube_vert:_p,cube_frag:Mp,depth_vert:yp,depth_frag:Sp,distanceRGBA_vert:wp,distanceRGBA_frag:bp,equirect_vert:Tp,equirect_frag:Ep,linedashed_vert:Ap,linedashed_frag:Cp,meshbasic_vert:Rp,meshbasic_frag:Pp,meshlambert_vert:Lp,meshlambert_frag:Dp,meshmatcap_vert:Ip,meshmatcap_frag:Up,meshnormal_vert:Np,meshnormal_frag:Fp,meshphong_vert:Op,meshphong_frag:zp,meshphysical_vert:Bp,meshphysical_frag:kp,meshtoon_vert:Hp,meshtoon_frag:Gp,points_vert:Vp,points_frag:Wp,shadow_vert:Xp,shadow_frag:$p,sprite_vert:qp,sprite_frag:Yp},lt={common:{diffuse:{value:new mt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ht}},envmap:{envMap:{value:null},envMapRotation:{value:new Ht},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ht}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ht}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ht},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ht},normalScale:{value:new it(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ht},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ht}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ht}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ht}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new mt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new mt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0},uvTransform:{value:new Ht}},sprite:{diffuse:{value:new mt(16777215)},opacity:{value:1},center:{value:new it(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}}},dn={basic:{uniforms:Ie([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.fog]),vertexShader:Gt.meshbasic_vert,fragmentShader:Gt.meshbasic_frag},lambert:{uniforms:Ie([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new mt(0)}}]),vertexShader:Gt.meshlambert_vert,fragmentShader:Gt.meshlambert_frag},phong:{uniforms:Ie([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new mt(0)},specular:{value:new mt(1118481)},shininess:{value:30}}]),vertexShader:Gt.meshphong_vert,fragmentShader:Gt.meshphong_frag},standard:{uniforms:Ie([lt.common,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.roughnessmap,lt.metalnessmap,lt.fog,lt.lights,{emissive:{value:new mt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag},toon:{uniforms:Ie([lt.common,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.gradientmap,lt.fog,lt.lights,{emissive:{value:new mt(0)}}]),vertexShader:Gt.meshtoon_vert,fragmentShader:Gt.meshtoon_frag},matcap:{uniforms:Ie([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,{matcap:{value:null}}]),vertexShader:Gt.meshmatcap_vert,fragmentShader:Gt.meshmatcap_frag},points:{uniforms:Ie([lt.points,lt.fog]),vertexShader:Gt.points_vert,fragmentShader:Gt.points_frag},dashed:{uniforms:Ie([lt.common,lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Gt.linedashed_vert,fragmentShader:Gt.linedashed_frag},depth:{uniforms:Ie([lt.common,lt.displacementmap]),vertexShader:Gt.depth_vert,fragmentShader:Gt.depth_frag},normal:{uniforms:Ie([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,{opacity:{value:1}}]),vertexShader:Gt.meshnormal_vert,fragmentShader:Gt.meshnormal_frag},sprite:{uniforms:Ie([lt.sprite,lt.fog]),vertexShader:Gt.sprite_vert,fragmentShader:Gt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ht},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Gt.background_vert,fragmentShader:Gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ht}},vertexShader:Gt.backgroundCube_vert,fragmentShader:Gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Gt.cube_vert,fragmentShader:Gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Gt.equirect_vert,fragmentShader:Gt.equirect_frag},distanceRGBA:{uniforms:Ie([lt.common,lt.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Gt.distanceRGBA_vert,fragmentShader:Gt.distanceRGBA_frag},shadow:{uniforms:Ie([lt.lights,lt.fog,{color:{value:new mt(0)},opacity:{value:1}}]),vertexShader:Gt.shadow_vert,fragmentShader:Gt.shadow_frag}};dn.physical={uniforms:Ie([dn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ht},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ht},clearcoatNormalScale:{value:new it(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ht},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ht},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ht},sheen:{value:0},sheenColor:{value:new mt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ht},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ht},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ht},transmissionSamplerSize:{value:new it},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ht},attenuationDistance:{value:0},attenuationColor:{value:new mt(0)},specularColor:{value:new mt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ht},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ht},anisotropyVector:{value:new it},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ht}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag};const er={r:0,b:0,g:0},Qn=new ln,Zp=new Wt;function Kp(s,t,e,n,i,r,a){const o=new mt(0);let l=r===!0?0:1,c,h,u=null,p=0,d=null;function g(_){let M=_.isScene===!0?_.background:null;return M&&M.isTexture&&(M=(_.backgroundBlurriness>0?e:t).get(M)),M}function v(_){let M=!1;const x=g(_);x===null?f(o,l):x&&x.isColor&&(f(x,1),M=!0);const P=s.xr.getEnvironmentBlendMode();P==="additive"?n.buffers.color.setClear(0,0,0,1,a):P==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(_,M){const x=g(M);x&&(x.isCubeTexture||x.mapping===Rr)?(h===void 0&&(h=new Ft(new Re(1,1,1),new pe({name:"BackgroundCubeMaterial",uniforms:$i(dn.backgroundCube.uniforms),vertexShader:dn.backgroundCube.vertexShader,fragmentShader:dn.backgroundCube.fragmentShader,side:Le,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(P,T,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Qn.copy(M.backgroundRotation),Qn.x*=-1,Qn.y*=-1,Qn.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Qn.y*=-1,Qn.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Zp.makeRotationFromEuler(Qn)),h.material.toneMapped=qt.getTransfer(x.colorSpace)!==ee,(u!==x||p!==x.version||d!==s.toneMapping)&&(h.material.needsUpdate=!0,u=x,p=x.version,d=s.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new Ft(new hn(2,2),new pe({name:"BackgroundMaterial",uniforms:$i(dn.background.uniforms),vertexShader:dn.background.vertexShader,fragmentShader:dn.background.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=qt.getTransfer(x.colorSpace)!==ee,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||p!==x.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,u=x,p=x.version,d=s.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function f(_,M){_.getRGB(er,hh(s)),n.buffers.color.setClear(er.r,er.g,er.b,M,a)}return{getClearColor:function(){return o},setClearColor:function(_,M=1){o.set(_),l=M,f(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,f(o,l)},render:v,addToRenderList:m}}function jp(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=p(null);let r=i,a=!1;function o(y,L,D,N,H){let B=!1;const G=u(N,D,L);r!==G&&(r=G,c(r.object)),B=d(y,N,D,H),B&&g(y,N,D,H),H!==null&&t.update(H,s.ELEMENT_ARRAY_BUFFER),(B||a)&&(a=!1,x(y,L,D,N),H!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}function l(){return s.createVertexArray()}function c(y){return s.bindVertexArray(y)}function h(y){return s.deleteVertexArray(y)}function u(y,L,D){const N=D.wireframe===!0;let H=n[y.id];H===void 0&&(H={},n[y.id]=H);let B=H[L.id];B===void 0&&(B={},H[L.id]=B);let G=B[N];return G===void 0&&(G=p(l()),B[N]=G),G}function p(y){const L=[],D=[],N=[];for(let H=0;H<e;H++)L[H]=0,D[H]=0,N[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:D,attributeDivisors:N,object:y,attributes:{},index:null}}function d(y,L,D,N){const H=r.attributes,B=L.attributes;let G=0;const Y=D.getAttributes();for(const z in Y)if(Y[z].location>=0){const Q=H[z];let st=B[z];if(st===void 0&&(z==="instanceMatrix"&&y.instanceMatrix&&(st=y.instanceMatrix),z==="instanceColor"&&y.instanceColor&&(st=y.instanceColor)),Q===void 0||Q.attribute!==st||st&&Q.data!==st.data)return!0;G++}return r.attributesNum!==G||r.index!==N}function g(y,L,D,N){const H={},B=L.attributes;let G=0;const Y=D.getAttributes();for(const z in Y)if(Y[z].location>=0){let Q=B[z];Q===void 0&&(z==="instanceMatrix"&&y.instanceMatrix&&(Q=y.instanceMatrix),z==="instanceColor"&&y.instanceColor&&(Q=y.instanceColor));const st={};st.attribute=Q,Q&&Q.data&&(st.data=Q.data),H[z]=st,G++}r.attributes=H,r.attributesNum=G,r.index=N}function v(){const y=r.newAttributes;for(let L=0,D=y.length;L<D;L++)y[L]=0}function m(y){f(y,0)}function f(y,L){const D=r.newAttributes,N=r.enabledAttributes,H=r.attributeDivisors;D[y]=1,N[y]===0&&(s.enableVertexAttribArray(y),N[y]=1),H[y]!==L&&(s.vertexAttribDivisor(y,L),H[y]=L)}function _(){const y=r.newAttributes,L=r.enabledAttributes;for(let D=0,N=L.length;D<N;D++)L[D]!==y[D]&&(s.disableVertexAttribArray(D),L[D]=0)}function M(y,L,D,N,H,B,G){G===!0?s.vertexAttribIPointer(y,L,D,H,B):s.vertexAttribPointer(y,L,D,N,H,B)}function x(y,L,D,N){v();const H=N.attributes,B=D.getAttributes(),G=L.defaultAttributeValues;for(const Y in B){const z=B[Y];if(z.location>=0){let V=H[Y];if(V===void 0&&(Y==="instanceMatrix"&&y.instanceMatrix&&(V=y.instanceMatrix),Y==="instanceColor"&&y.instanceColor&&(V=y.instanceColor)),V!==void 0){const Q=V.normalized,st=V.itemSize,at=t.get(V);if(at===void 0)continue;const Dt=at.buffer,X=at.type,tt=at.bytesPerElement,ot=X===s.INT||X===s.UNSIGNED_INT||V.gpuType===wo;if(V.isInterleavedBufferAttribute){const et=V.data,yt=et.stride,Mt=V.offset;if(et.isInstancedInterleavedBuffer){for(let At=0;At<z.locationSize;At++)f(z.location+At,et.meshPerAttribute);y.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let At=0;At<z.locationSize;At++)m(z.location+At);s.bindBuffer(s.ARRAY_BUFFER,Dt);for(let At=0;At<z.locationSize;At++)M(z.location+At,st/z.locationSize,X,Q,yt*tt,(Mt+st/z.locationSize*At)*tt,ot)}else{if(V.isInstancedBufferAttribute){for(let et=0;et<z.locationSize;et++)f(z.location+et,V.meshPerAttribute);y.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=V.meshPerAttribute*V.count)}else for(let et=0;et<z.locationSize;et++)m(z.location+et);s.bindBuffer(s.ARRAY_BUFFER,Dt);for(let et=0;et<z.locationSize;et++)M(z.location+et,st/z.locationSize,X,Q,st*tt,st/z.locationSize*et*tt,ot)}}else if(G!==void 0){const Q=G[Y];if(Q!==void 0)switch(Q.length){case 2:s.vertexAttrib2fv(z.location,Q);break;case 3:s.vertexAttrib3fv(z.location,Q);break;case 4:s.vertexAttrib4fv(z.location,Q);break;default:s.vertexAttrib1fv(z.location,Q)}}}}_()}function P(){R();for(const y in n){const L=n[y];for(const D in L){const N=L[D];for(const H in N)h(N[H].object),delete N[H];delete L[D]}delete n[y]}}function T(y){if(n[y.id]===void 0)return;const L=n[y.id];for(const D in L){const N=L[D];for(const H in N)h(N[H].object),delete N[H];delete L[D]}delete n[y.id]}function E(y){for(const L in n){const D=n[L];if(D[y.id]===void 0)continue;const N=D[y.id];for(const H in N)h(N[H].object),delete N[H];delete D[y.id]}}function R(){S(),a=!0,r!==i&&(r=i,c(r.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:R,resetDefaultState:S,dispose:P,releaseStatesOfGeometry:T,releaseStatesOfProgram:E,initAttributes:v,enableAttribute:m,disableUnusedAttributes:_}}function Jp(s,t,e){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];e.update(d,n,1)}function l(c,h,u,p){if(u===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)a(c[g],h[g],p[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,p,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v]*p[v];e.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Qp(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const E=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(E){return!(E!==an&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(E){const R=E===Rn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==In&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==pn&&!R)}function l(E){if(E==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,p=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),f=s.getParameter(s.MAX_VERTEX_ATTRIBS),_=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),M=s.getParameter(s.MAX_VARYING_VECTORS),x=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),P=g>0,T=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:p,maxTextures:d,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:_,maxVaryings:M,maxFragmentUniforms:x,vertexTextures:P,maxSamples:T}}function tm(s){const t=this;let e=null,n=0,i=!1,r=!1;const a=new Gn,o=new Ht,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){const d=u.length!==0||p||n!==0||i;return i=p,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,p){e=h(u,p,0)},this.setState=function(u,p,d){const g=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,f=s.get(u);if(!i||g===null||g.length===0||r&&!m)r?h(null):c();else{const _=r?0:n,M=_*4;let x=f.clippingState||null;l.value=x,x=h(g,p,M,d);for(let P=0;P!==M;++P)x[P]=e[P];f.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,p,d,g){const v=u!==null?u.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const f=d+v*4,_=p.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<f)&&(m=new Float32Array(f));for(let M=0,x=d;M!==v;++M,x+=4)a.copy(u[M]).applyMatrix4(_,o),a.normal.toArray(m,x),m[x+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}function em(s){let t=new WeakMap;function e(a,o){return o===Ua?a.mapping=Gi:o===Na&&(a.mapping=Vi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Ua||o===Na)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new ud(l.height);return c.fromEquirectangularTexture(s,a),t.set(a,c),a.addEventListener("dispose",i),e(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class No extends uh{constructor(t=-1,e=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=i+e,l=i-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Fi=4,Rl=[.125,.215,.35,.446,.526,.582],ri=20,na=new No,Pl=new mt;let ia=null,sa=0,ra=0,aa=!1;const ni=(1+Math.sqrt(5))/2,Ai=1/ni,Ll=[new A(-ni,Ai,0),new A(ni,Ai,0),new A(-Ai,0,ni),new A(Ai,0,ni),new A(0,ni,-Ai),new A(0,ni,Ai),new A(-1,1,-1),new A(1,1,-1),new A(-1,1,1),new A(1,1,1)];class ho{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){ia=this._renderer.getRenderTarget(),sa=this._renderer.getActiveCubeFace(),ra=this._renderer.getActiveMipmapLevel(),aa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,i,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ul(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Il(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ia,sa,ra),this._renderer.xr.enabled=aa,t.scissorTest=!1,nr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Gi||t.mapping===Vi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ia=this._renderer.getRenderTarget(),sa=this._renderer.getActiveCubeFace(),ra=this._renderer.getActiveMipmapLevel(),aa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Ve,minFilter:Ve,generateMipmaps:!1,type:Rn,format:an,colorSpace:ji,depthBuffer:!1},i=Dl(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Dl(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=nm(r)),this._blurMaterial=im(r,t,e)}return i}_compileMaterial(t){const e=new Ft(this._lodPlanes[0],t);this._renderer.compile(e,na)}_sceneToCubeUV(t,e,n,i){const o=new Ge(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(Pl),h.toneMapping=Xn,h.autoClear=!1;const d=new Ke({name:"PMREM.Background",side:Le,depthWrite:!1,depthTest:!1}),g=new Ft(new Re,d);let v=!1;const m=t.background;m?m.isColor&&(d.color.copy(m),t.background=null,v=!0):(d.color.copy(Pl),v=!0);for(let f=0;f<6;f++){const _=f%3;_===0?(o.up.set(0,l[f],0),o.lookAt(c[f],0,0)):_===1?(o.up.set(0,0,l[f]),o.lookAt(0,c[f],0)):(o.up.set(0,l[f],0),o.lookAt(0,0,c[f]));const M=this._cubeSize;nr(i,_*M,f>2?M:0,M,M),h.setRenderTarget(i),v&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=p,h.autoClear=u,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===Gi||t.mapping===Vi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ul()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Il());const r=i?this._cubemapMaterial:this._equirectMaterial,a=new Ft(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;nr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,na)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Ll[(i-r-1)%Ll.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,i,"latitudinal",r),this._halfBlur(a,t,n,n,i,"longitudinal",r)}_halfBlur(t,e,n,i,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Ft(this._lodPlanes[i],c),p=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*ri-1),v=r/g,m=isFinite(r)?1+Math.floor(h*v):ri;m>ri&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ri}`);const f=[];let _=0;for(let E=0;E<ri;++E){const R=E/v,S=Math.exp(-R*R/2);f.push(S),E===0?_+=S:E<m&&(_+=2*S)}for(let E=0;E<f.length;E++)f[E]=f[E]/_;p.envMap.value=t.texture,p.samples.value=m,p.weights.value=f,p.latitudinal.value=a==="latitudinal",o&&(p.poleAxis.value=o);const{_lodMax:M}=this;p.dTheta.value=g,p.mipInt.value=M-n;const x=this._sizeLods[i],P=3*x*(i>M-Fi?i-M+Fi:0),T=4*(this._cubeSize-x);nr(e,P,T,3*x,2*x),l.setRenderTarget(e),l.render(u,na)}}function nm(s){const t=[],e=[],n=[];let i=s;const r=s-Fi+1+Rl.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);e.push(o);let l=1/o;a>s-Fi?l=Rl[a-s+Fi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,p=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,v=3,m=2,f=1,_=new Float32Array(v*g*d),M=new Float32Array(m*g*d),x=new Float32Array(f*g*d);for(let T=0;T<d;T++){const E=T%3*2/3-1,R=T>2?0:-1,S=[E,R,0,E+2/3,R,0,E+2/3,R+1,0,E,R,0,E+2/3,R+1,0,E,R+1,0];_.set(S,v*g*T),M.set(p,m*g*T);const y=[T,T,T,T,T,T];x.set(y,f*g*T)}const P=new ge;P.setAttribute("position",new me(_,v)),P.setAttribute("uv",new me(M,m)),P.setAttribute("faceIndex",new me(x,f)),t.push(P),i>Fi&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Dl(s,t,e){const n=new Ze(s,t,e);return n.texture.mapping=Rr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function nr(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function im(s,t,e){const n=new Float32Array(ri),i=new A(0,1,0);return new pe({name:"SphericalGaussianBlur",defines:{n:ri,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Fo(),fragmentShader:`

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
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function Il(){return new pe({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Fo(),fragmentShader:`

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
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function Ul(){return new pe({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Fo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function Fo(){return`

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
	`}function sm(s){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Ua||l===Na,h=l===Gi||l===Vi;if(c||h){let u=t.get(o);const p=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==p)return e===null&&(e=new ho(s)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&i(d)?(e===null&&(e=new ho(s)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function rm(s){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&vs("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function am(s,t,e,n){const i={},r=new WeakMap;function a(u){const p=u.target;p.index!==null&&t.remove(p.index);for(const g in p.attributes)t.remove(p.attributes[g]);for(const g in p.morphAttributes){const v=p.morphAttributes[g];for(let m=0,f=v.length;m<f;m++)t.remove(v[m])}p.removeEventListener("dispose",a),delete i[p.id];const d=r.get(p);d&&(t.remove(d),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function o(u,p){return i[p.id]===!0||(p.addEventListener("dispose",a),i[p.id]=!0,e.memory.geometries++),p}function l(u){const p=u.attributes;for(const g in p)t.update(p[g],s.ARRAY_BUFFER);const d=u.morphAttributes;for(const g in d){const v=d[g];for(let m=0,f=v.length;m<f;m++)t.update(v[m],s.ARRAY_BUFFER)}}function c(u){const p=[],d=u.index,g=u.attributes.position;let v=0;if(d!==null){const _=d.array;v=d.version;for(let M=0,x=_.length;M<x;M+=3){const P=_[M+0],T=_[M+1],E=_[M+2];p.push(P,T,T,E,E,P)}}else if(g!==void 0){const _=g.array;v=g.version;for(let M=0,x=_.length/3-1;M<x;M+=3){const P=M+0,T=M+1,E=M+2;p.push(P,T,T,E,E,P)}}else return;const m=new(sh(p)?ch:lh)(p,1);m.version=v;const f=r.get(u);f&&t.remove(f),r.set(u,m)}function h(u){const p=r.get(u);if(p){const d=u.index;d!==null&&p.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function om(s,t,e){let n;function i(p){n=p}let r,a;function o(p){r=p.type,a=p.bytesPerElement}function l(p,d){s.drawElements(n,d,r,p*a),e.update(d,n,1)}function c(p,d,g){g!==0&&(s.drawElementsInstanced(n,d,r,p*a,g),e.update(d,n,g))}function h(p,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,p,0,g);let m=0;for(let f=0;f<g;f++)m+=d[f];e.update(m,n,1)}function u(p,d,g,v){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<p.length;f++)c(p[f]/a,d[f],v[f]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,r,p,0,v,0,g);let f=0;for(let _=0;_<g;_++)f+=d[_]*v[_];e.update(f,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function lm(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function cm(s,t,e){const n=new WeakMap,i=new le;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let p=n.get(o);if(p===void 0||p.count!==u){let y=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",y)};var d=y;p!==void 0&&p.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,f=o.morphAttributes.position||[],_=o.morphAttributes.normal||[],M=o.morphAttributes.color||[];let x=0;g===!0&&(x=1),v===!0&&(x=2),m===!0&&(x=3);let P=o.attributes.position.count*x,T=1;P>t.maxTextureSize&&(T=Math.ceil(P/t.maxTextureSize),P=t.maxTextureSize);const E=new Float32Array(P*T*4*u),R=new ah(E,P,T,u);R.type=pn,R.needsUpdate=!0;const S=x*4;for(let L=0;L<u;L++){const D=f[L],N=_[L],H=M[L],B=P*T*4*L;for(let G=0;G<D.count;G++){const Y=G*S;g===!0&&(i.fromBufferAttribute(D,G),E[B+Y+0]=i.x,E[B+Y+1]=i.y,E[B+Y+2]=i.z,E[B+Y+3]=0),v===!0&&(i.fromBufferAttribute(N,G),E[B+Y+4]=i.x,E[B+Y+5]=i.y,E[B+Y+6]=i.z,E[B+Y+7]=0),m===!0&&(i.fromBufferAttribute(H,G),E[B+Y+8]=i.x,E[B+Y+9]=i.y,E[B+Y+10]=i.z,E[B+Y+11]=H.itemSize===4?i.w:1)}}p={count:u,texture:R,size:new it(P,T)},n.set(o,p),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",v),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",p.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",p.size)}return{update:r}}function hm(s,t,e,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(i.get(u)!==c&&(t.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;i.get(p)!==c&&(p.update(),i.set(p,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class ph extends be{constructor(t,e,n,i,r,a,o,l,c,h=Bi){if(h!==Bi&&h!==Xi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Bi&&(n=li),n===void 0&&h===Xi&&(n=Wi),super(null,i,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:We,this.minFilter=l!==void 0?l:We,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const mh=new be,Nl=new ph(1,1),gh=new ah,vh=new Ku,xh=new dh,Fl=[],Ol=[],zl=new Float32Array(16),Bl=new Float32Array(9),kl=new Float32Array(4);function ts(s,t,e){const n=s[0];if(n<=0||n>0)return s;const i=t*e;let r=Fl[i];if(r===void 0&&(r=new Float32Array(i),Fl[i]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function _e(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function Me(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function Lr(s,t){let e=Ol[t];e===void 0&&(e=new Int32Array(t),Ol[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function um(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function dm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;s.uniform2fv(this.addr,t),Me(e,t)}}function fm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(_e(e,t))return;s.uniform3fv(this.addr,t),Me(e,t)}}function pm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;s.uniform4fv(this.addr,t),Me(e,t)}}function mm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Me(e,t)}else{if(_e(e,n))return;kl.set(n),s.uniformMatrix2fv(this.addr,!1,kl),Me(e,n)}}function gm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Me(e,t)}else{if(_e(e,n))return;Bl.set(n),s.uniformMatrix3fv(this.addr,!1,Bl),Me(e,n)}}function vm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Me(e,t)}else{if(_e(e,n))return;zl.set(n),s.uniformMatrix4fv(this.addr,!1,zl),Me(e,n)}}function xm(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function _m(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;s.uniform2iv(this.addr,t),Me(e,t)}}function Mm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_e(e,t))return;s.uniform3iv(this.addr,t),Me(e,t)}}function ym(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;s.uniform4iv(this.addr,t),Me(e,t)}}function Sm(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function wm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;s.uniform2uiv(this.addr,t),Me(e,t)}}function bm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_e(e,t))return;s.uniform3uiv(this.addr,t),Me(e,t)}}function Tm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;s.uniform4uiv(this.addr,t),Me(e,t)}}function Em(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Nl.compareFunction=ih,r=Nl):r=mh,e.setTexture2D(t||r,i)}function Am(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||vh,i)}function Cm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||xh,i)}function Rm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||gh,i)}function Pm(s){switch(s){case 5126:return um;case 35664:return dm;case 35665:return fm;case 35666:return pm;case 35674:return mm;case 35675:return gm;case 35676:return vm;case 5124:case 35670:return xm;case 35667:case 35671:return _m;case 35668:case 35672:return Mm;case 35669:case 35673:return ym;case 5125:return Sm;case 36294:return wm;case 36295:return bm;case 36296:return Tm;case 35678:case 36198:case 36298:case 36306:case 35682:return Em;case 35679:case 36299:case 36307:return Am;case 35680:case 36300:case 36308:case 36293:return Cm;case 36289:case 36303:case 36311:case 36292:return Rm}}function Lm(s,t){s.uniform1fv(this.addr,t)}function Dm(s,t){const e=ts(t,this.size,2);s.uniform2fv(this.addr,e)}function Im(s,t){const e=ts(t,this.size,3);s.uniform3fv(this.addr,e)}function Um(s,t){const e=ts(t,this.size,4);s.uniform4fv(this.addr,e)}function Nm(s,t){const e=ts(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function Fm(s,t){const e=ts(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function Om(s,t){const e=ts(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function zm(s,t){s.uniform1iv(this.addr,t)}function Bm(s,t){s.uniform2iv(this.addr,t)}function km(s,t){s.uniform3iv(this.addr,t)}function Hm(s,t){s.uniform4iv(this.addr,t)}function Gm(s,t){s.uniform1uiv(this.addr,t)}function Vm(s,t){s.uniform2uiv(this.addr,t)}function Wm(s,t){s.uniform3uiv(this.addr,t)}function Xm(s,t){s.uniform4uiv(this.addr,t)}function $m(s,t,e){const n=this.cache,i=t.length,r=Lr(e,i);_e(n,r)||(s.uniform1iv(this.addr,r),Me(n,r));for(let a=0;a!==i;++a)e.setTexture2D(t[a]||mh,r[a])}function qm(s,t,e){const n=this.cache,i=t.length,r=Lr(e,i);_e(n,r)||(s.uniform1iv(this.addr,r),Me(n,r));for(let a=0;a!==i;++a)e.setTexture3D(t[a]||vh,r[a])}function Ym(s,t,e){const n=this.cache,i=t.length,r=Lr(e,i);_e(n,r)||(s.uniform1iv(this.addr,r),Me(n,r));for(let a=0;a!==i;++a)e.setTextureCube(t[a]||xh,r[a])}function Zm(s,t,e){const n=this.cache,i=t.length,r=Lr(e,i);_e(n,r)||(s.uniform1iv(this.addr,r),Me(n,r));for(let a=0;a!==i;++a)e.setTexture2DArray(t[a]||gh,r[a])}function Km(s){switch(s){case 5126:return Lm;case 35664:return Dm;case 35665:return Im;case 35666:return Um;case 35674:return Nm;case 35675:return Fm;case 35676:return Om;case 5124:case 35670:return zm;case 35667:case 35671:return Bm;case 35668:case 35672:return km;case 35669:case 35673:return Hm;case 5125:return Gm;case 36294:return Vm;case 36295:return Wm;case 36296:return Xm;case 35678:case 36198:case 36298:case 36306:case 35682:return $m;case 35679:case 36299:case 36307:return qm;case 35680:case 36300:case 36308:case 36293:return Ym;case 36289:case 36303:case 36311:case 36292:return Zm}}class jm{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Pm(e.type)}}class Jm{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Km(e.type)}}class Qm{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(t,e[o.id],n)}}}const oa=/(\w+)(\])?(\[|\.)?/g;function Hl(s,t){s.seq.push(t),s.map[t.id]=t}function t0(s,t,e){const n=s.name,i=n.length;for(oa.lastIndex=0;;){const r=oa.exec(n),a=oa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){Hl(e,c===void 0?new jm(o,s,t):new Jm(o,s,t));break}else{let u=e.map[o];u===void 0&&(u=new Qm(o),Hl(e,u)),e=u}}}class Sr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=t.getActiveUniform(e,i),a=t.getUniformLocation(e,r.name);t0(r,a,this)}}setValue(t,e,n,i){const r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,r=t.length;i!==r;++i){const a=t[i];a.id in e&&n.push(a)}return n}}function Gl(s,t,e){const n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}const e0=37297;let n0=0;function i0(s,t){const e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const Vl=new Ht;function s0(s){qt._getMatrix(Vl,qt.workingColorSpace,s);const t=`mat3( ${Vl.elements.map(e=>e.toFixed(4))} )`;switch(qt.getTransfer(s)){case Pr:return[t,"LinearTransferOETF"];case ee:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function Wl(s,t,e){const n=s.getShaderParameter(t,s.COMPILE_STATUS),i=s.getShaderInfoLog(t).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+i+`

`+i0(s.getShaderSource(t),a)}else return i}function r0(s,t){const e=s0(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function a0(s,t){let e;switch(t){case Hc:e="Linear";break;case Gc:e="Reinhard";break;case Vc:e="Cineon";break;case Wc:e="ACESFilmic";break;case Xc:e="AgX";break;case So:e="Neutral";break;case mu:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const ir=new A;function o0(){qt.getLuminanceCoefficients(ir);const s=ir.x.toFixed(4),t=ir.y.toFixed(4),e=ir.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function l0(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(xs).join(`
`)}function c0(s){const t=[];for(const e in s){const n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function h0(s,t){const e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(t,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function xs(s){return s!==""}function Xl(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function $l(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const u0=/^[ \t]*#include +<([\w\d./]+)>/gm;function uo(s){return s.replace(u0,f0)}const d0=new Map;function f0(s,t){let e=Gt[t];if(e===void 0){const n=d0.get(t);if(n!==void 0)e=Gt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return uo(e)}const p0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ql(s){return s.replace(p0,m0)}function m0(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Yl(s){let t=`precision ${s.precision} float;
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
#define LOW_PRECISION`),t}function g0(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Bc?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===kc?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===bn&&(t="SHADOWMAP_TYPE_VSM"),t}function v0(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Gi:case Vi:t="ENVMAP_TYPE_CUBE";break;case Rr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function x0(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Vi:t="ENVMAP_MODE_REFRACTION";break}return t}function _0(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case yo:t="ENVMAP_BLENDING_MULTIPLY";break;case fu:t="ENVMAP_BLENDING_MIX";break;case pu:t="ENVMAP_BLENDING_ADD";break}return t}function M0(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function y0(s,t,e,n){const i=s.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=g0(e),c=v0(e),h=x0(e),u=_0(e),p=M0(e),d=l0(e),g=c0(r),v=i.createProgram();let m,f,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(xs).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(xs).join(`
`),f.length>0&&(f+=`
`)):(m=[Yl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(xs).join(`
`),f=[Yl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Xn?"#define TONE_MAPPING":"",e.toneMapping!==Xn?Gt.tonemapping_pars_fragment:"",e.toneMapping!==Xn?a0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Gt.colorspace_pars_fragment,r0("linearToOutputTexel",e.outputColorSpace),o0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(xs).join(`
`)),a=uo(a),a=Xl(a,e),a=$l(a,e),o=uo(o),o=Xl(o,e),o=$l(o,e),a=ql(a),o=ql(o),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",e.glslVersion===al?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===al?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const M=_+m+a,x=_+f+o,P=Gl(i,i.VERTEX_SHADER,M),T=Gl(i,i.FRAGMENT_SHADER,x);i.attachShader(v,P),i.attachShader(v,T),e.index0AttributeName!==void 0?i.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function E(L){if(s.debug.checkShaderErrors){const D=i.getProgramInfoLog(v).trim(),N=i.getShaderInfoLog(P).trim(),H=i.getShaderInfoLog(T).trim();let B=!0,G=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(B=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,P,T);else{const Y=Wl(i,P,"vertex"),z=Wl(i,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+D+`
`+Y+`
`+z)}else D!==""?console.warn("THREE.WebGLProgram: Program Info Log:",D):(N===""||H==="")&&(G=!1);G&&(L.diagnostics={runnable:B,programLog:D,vertexShader:{log:N,prefix:m},fragmentShader:{log:H,prefix:f}})}i.deleteShader(P),i.deleteShader(T),R=new Sr(i,v),S=h0(i,v)}let R;this.getUniforms=function(){return R===void 0&&E(this),R};let S;this.getAttributes=function(){return S===void 0&&E(this),S};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=i.getProgramParameter(v,e0)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=n0++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=P,this.fragmentShader=T,this}let S0=0;class w0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new b0(t),e.set(t,n)),n}}class b0{constructor(t){this.id=S0++,this.code=t,this.usedTimes=0}}function T0(s,t,e,n,i,r,a){const o=new Io,l=new w0,c=new Set,h=[],u=i.logarithmicDepthBuffer,p=i.vertexTextures;let d=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,y,L,D,N){const H=D.fog,B=N.geometry,G=S.isMeshStandardMaterial?D.environment:null,Y=(S.isMeshStandardMaterial?e:t).get(S.envMap||G),z=Y&&Y.mapping===Rr?Y.image.height:null,V=g[S.type];S.precision!==null&&(d=i.getMaxPrecision(S.precision),d!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",d,"instead."));const Q=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,st=Q!==void 0?Q.length:0;let at=0;B.morphAttributes.position!==void 0&&(at=1),B.morphAttributes.normal!==void 0&&(at=2),B.morphAttributes.color!==void 0&&(at=3);let Dt,X,tt,ot;if(V){const te=dn[V];Dt=te.vertexShader,X=te.fragmentShader}else Dt=S.vertexShader,X=S.fragmentShader,l.update(S),tt=l.getVertexShaderID(S),ot=l.getFragmentShaderID(S);const et=s.getRenderTarget(),yt=s.state.buffers.depth.getReversed(),Mt=N.isInstancedMesh===!0,At=N.isBatchedMesh===!0,Bt=!!S.map,Ct=!!S.matcap,Xt=!!Y,I=!!S.aoMap,he=!!S.lightMap,Ut=!!S.bumpMap,dt=!!S.normalMap,gt=!!S.displacementMap,$t=!!S.emissiveMap,wt=!!S.metalnessMap,C=!!S.roughnessMap,w=S.anisotropy>0,k=S.clearcoat>0,Z=S.dispersion>0,j=S.iridescence>0,K=S.sheen>0,St=S.transmission>0,ct=w&&!!S.anisotropyMap,vt=k&&!!S.clearcoatMap,It=k&&!!S.clearcoatNormalMap,nt=k&&!!S.clearcoatRoughnessMap,_t=j&&!!S.iridescenceMap,Pt=j&&!!S.iridescenceThicknessMap,Lt=K&&!!S.sheenColorMap,xt=K&&!!S.sheenRoughnessMap,Vt=!!S.specularMap,Ot=!!S.specularColorMap,ie=!!S.specularIntensityMap,U=St&&!!S.transmissionMap,ht=St&&!!S.thicknessMap,q=!!S.gradientMap,J=!!S.alphaMap,ft=S.alphaTest>0,ut=!!S.alphaHash,Nt=!!S.extensions;let ue=Xn;S.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(ue=s.toneMapping);const Te={shaderID:V,shaderType:S.type,shaderName:S.name,vertexShader:Dt,fragmentShader:X,defines:S.defines,customVertexShaderID:tt,customFragmentShaderID:ot,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:d,batching:At,batchingColor:At&&N._colorsTexture!==null,instancing:Mt,instancingColor:Mt&&N.instanceColor!==null,instancingMorph:Mt&&N.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:et===null?s.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:ji,alphaToCoverage:!!S.alphaToCoverage,map:Bt,matcap:Ct,envMap:Xt,envMapMode:Xt&&Y.mapping,envMapCubeUVHeight:z,aoMap:I,lightMap:he,bumpMap:Ut,normalMap:dt,displacementMap:p&&gt,emissiveMap:$t,normalMapObjectSpace:dt&&S.normalMapType===xu,normalMapTangentSpace:dt&&S.normalMapType===Po,metalnessMap:wt,roughnessMap:C,anisotropy:w,anisotropyMap:ct,clearcoat:k,clearcoatMap:vt,clearcoatNormalMap:It,clearcoatRoughnessMap:nt,dispersion:Z,iridescence:j,iridescenceMap:_t,iridescenceThicknessMap:Pt,sheen:K,sheenColorMap:Lt,sheenRoughnessMap:xt,specularMap:Vt,specularColorMap:Ot,specularIntensityMap:ie,transmission:St,transmissionMap:U,thicknessMap:ht,gradientMap:q,opaque:S.transparent===!1&&S.blending===oi&&S.alphaToCoverage===!1,alphaMap:J,alphaTest:ft,alphaHash:ut,combine:S.combine,mapUv:Bt&&v(S.map.channel),aoMapUv:I&&v(S.aoMap.channel),lightMapUv:he&&v(S.lightMap.channel),bumpMapUv:Ut&&v(S.bumpMap.channel),normalMapUv:dt&&v(S.normalMap.channel),displacementMapUv:gt&&v(S.displacementMap.channel),emissiveMapUv:$t&&v(S.emissiveMap.channel),metalnessMapUv:wt&&v(S.metalnessMap.channel),roughnessMapUv:C&&v(S.roughnessMap.channel),anisotropyMapUv:ct&&v(S.anisotropyMap.channel),clearcoatMapUv:vt&&v(S.clearcoatMap.channel),clearcoatNormalMapUv:It&&v(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:nt&&v(S.clearcoatRoughnessMap.channel),iridescenceMapUv:_t&&v(S.iridescenceMap.channel),iridescenceThicknessMapUv:Pt&&v(S.iridescenceThicknessMap.channel),sheenColorMapUv:Lt&&v(S.sheenColorMap.channel),sheenRoughnessMapUv:xt&&v(S.sheenRoughnessMap.channel),specularMapUv:Vt&&v(S.specularMap.channel),specularColorMapUv:Ot&&v(S.specularColorMap.channel),specularIntensityMapUv:ie&&v(S.specularIntensityMap.channel),transmissionMapUv:U&&v(S.transmissionMap.channel),thicknessMapUv:ht&&v(S.thicknessMap.channel),alphaMapUv:J&&v(S.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(dt||w),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!B.attributes.uv&&(Bt||J),fog:!!H,useFog:S.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:yt,skinning:N.isSkinnedMesh===!0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:st,morphTextureStride:at,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:S.dithering,shadowMapEnabled:s.shadowMap.enabled&&L.length>0,shadowMapType:s.shadowMap.type,toneMapping:ue,decodeVideoTexture:Bt&&S.map.isVideoTexture===!0&&qt.getTransfer(S.map.colorSpace)===ee,decodeVideoTextureEmissive:$t&&S.emissiveMap.isVideoTexture===!0&&qt.getTransfer(S.emissiveMap.colorSpace)===ee,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Ce,flipSided:S.side===Le,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Nt&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Nt&&S.extensions.multiDraw===!0||At)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Te.vertexUv1s=c.has(1),Te.vertexUv2s=c.has(2),Te.vertexUv3s=c.has(3),c.clear(),Te}function f(S){const y=[];if(S.shaderID?y.push(S.shaderID):(y.push(S.customVertexShaderID),y.push(S.customFragmentShaderID)),S.defines!==void 0)for(const L in S.defines)y.push(L),y.push(S.defines[L]);return S.isRawShaderMaterial===!1&&(_(y,S),M(y,S),y.push(s.outputColorSpace)),y.push(S.customProgramCacheKey),y.join()}function _(S,y){S.push(y.precision),S.push(y.outputColorSpace),S.push(y.envMapMode),S.push(y.envMapCubeUVHeight),S.push(y.mapUv),S.push(y.alphaMapUv),S.push(y.lightMapUv),S.push(y.aoMapUv),S.push(y.bumpMapUv),S.push(y.normalMapUv),S.push(y.displacementMapUv),S.push(y.emissiveMapUv),S.push(y.metalnessMapUv),S.push(y.roughnessMapUv),S.push(y.anisotropyMapUv),S.push(y.clearcoatMapUv),S.push(y.clearcoatNormalMapUv),S.push(y.clearcoatRoughnessMapUv),S.push(y.iridescenceMapUv),S.push(y.iridescenceThicknessMapUv),S.push(y.sheenColorMapUv),S.push(y.sheenRoughnessMapUv),S.push(y.specularMapUv),S.push(y.specularColorMapUv),S.push(y.specularIntensityMapUv),S.push(y.transmissionMapUv),S.push(y.thicknessMapUv),S.push(y.combine),S.push(y.fogExp2),S.push(y.sizeAttenuation),S.push(y.morphTargetsCount),S.push(y.morphAttributeCount),S.push(y.numDirLights),S.push(y.numPointLights),S.push(y.numSpotLights),S.push(y.numSpotLightMaps),S.push(y.numHemiLights),S.push(y.numRectAreaLights),S.push(y.numDirLightShadows),S.push(y.numPointLightShadows),S.push(y.numSpotLightShadows),S.push(y.numSpotLightShadowsWithMaps),S.push(y.numLightProbes),S.push(y.shadowMapType),S.push(y.toneMapping),S.push(y.numClippingPlanes),S.push(y.numClipIntersection),S.push(y.depthPacking)}function M(S,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),S.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reverseDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),S.push(o.mask)}function x(S){const y=g[S.type];let L;if(y){const D=dn[y];L=cn.clone(D.uniforms)}else L=S.uniforms;return L}function P(S,y){let L;for(let D=0,N=h.length;D<N;D++){const H=h[D];if(H.cacheKey===y){L=H,++L.usedTimes;break}}return L===void 0&&(L=new y0(s,y,S,r),h.push(L)),L}function T(S){if(--S.usedTimes===0){const y=h.indexOf(S);h[y]=h[h.length-1],h.pop(),S.destroy()}}function E(S){l.remove(S)}function R(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:x,acquireProgram:P,releaseProgram:T,releaseShaderCache:E,programs:h,dispose:R}}function E0(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function A0(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function Zl(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function Kl(){const s=[];let t=0;const e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function a(u,p,d,g,v,m){let f=s[t];return f===void 0?(f={id:u.id,object:u,geometry:p,material:d,groupOrder:g,renderOrder:u.renderOrder,z:v,group:m},s[t]=f):(f.id=u.id,f.object=u,f.geometry=p,f.material=d,f.groupOrder=g,f.renderOrder=u.renderOrder,f.z=v,f.group=m),t++,f}function o(u,p,d,g,v,m){const f=a(u,p,d,g,v,m);d.transmission>0?n.push(f):d.transparent===!0?i.push(f):e.push(f)}function l(u,p,d,g,v,m){const f=a(u,p,d,g,v,m);d.transmission>0?n.unshift(f):d.transparent===!0?i.unshift(f):e.unshift(f)}function c(u,p){e.length>1&&e.sort(u||A0),n.length>1&&n.sort(p||Zl),i.length>1&&i.sort(p||Zl)}function h(){for(let u=t,p=s.length;u<p;u++){const d=s[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:o,unshift:l,finish:h,sort:c}}function C0(){let s=new WeakMap;function t(n,i){const r=s.get(n);let a;return r===void 0?(a=new Kl,s.set(n,[a])):i>=r.length?(a=new Kl,r.push(a)):a=r[i],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function R0(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new A,color:new mt};break;case"SpotLight":e={position:new A,direction:new A,color:new mt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new A,color:new mt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new A,skyColor:new mt,groundColor:new mt};break;case"RectAreaLight":e={color:new mt,position:new A,halfWidth:new A,halfHeight:new A};break}return s[t.id]=e,e}}}function P0(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let L0=0;function D0(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function I0(s){const t=new R0,e=P0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new A);const i=new A,r=new Wt,a=new Wt;function o(c){let h=0,u=0,p=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let d=0,g=0,v=0,m=0,f=0,_=0,M=0,x=0,P=0,T=0,E=0;c.sort(D0);for(let S=0,y=c.length;S<y;S++){const L=c[S],D=L.color,N=L.intensity,H=L.distance,B=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)h+=D.r*N,u+=D.g*N,p+=D.b*N;else if(L.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(L.sh.coefficients[G],N);E++}else if(L.isDirectionalLight){const G=t.get(L);if(G.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const Y=L.shadow,z=e.get(L);z.shadowIntensity=Y.intensity,z.shadowBias=Y.bias,z.shadowNormalBias=Y.normalBias,z.shadowRadius=Y.radius,z.shadowMapSize=Y.mapSize,n.directionalShadow[d]=z,n.directionalShadowMap[d]=B,n.directionalShadowMatrix[d]=L.shadow.matrix,_++}n.directional[d]=G,d++}else if(L.isSpotLight){const G=t.get(L);G.position.setFromMatrixPosition(L.matrixWorld),G.color.copy(D).multiplyScalar(N),G.distance=H,G.coneCos=Math.cos(L.angle),G.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),G.decay=L.decay,n.spot[v]=G;const Y=L.shadow;if(L.map&&(n.spotLightMap[P]=L.map,P++,Y.updateMatrices(L),L.castShadow&&T++),n.spotLightMatrix[v]=Y.matrix,L.castShadow){const z=e.get(L);z.shadowIntensity=Y.intensity,z.shadowBias=Y.bias,z.shadowNormalBias=Y.normalBias,z.shadowRadius=Y.radius,z.shadowMapSize=Y.mapSize,n.spotShadow[v]=z,n.spotShadowMap[v]=B,x++}v++}else if(L.isRectAreaLight){const G=t.get(L);G.color.copy(D).multiplyScalar(N),G.halfWidth.set(L.width*.5,0,0),G.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=G,m++}else if(L.isPointLight){const G=t.get(L);if(G.color.copy(L.color).multiplyScalar(L.intensity),G.distance=L.distance,G.decay=L.decay,L.castShadow){const Y=L.shadow,z=e.get(L);z.shadowIntensity=Y.intensity,z.shadowBias=Y.bias,z.shadowNormalBias=Y.normalBias,z.shadowRadius=Y.radius,z.shadowMapSize=Y.mapSize,z.shadowCameraNear=Y.camera.near,z.shadowCameraFar=Y.camera.far,n.pointShadow[g]=z,n.pointShadowMap[g]=B,n.pointShadowMatrix[g]=L.shadow.matrix,M++}n.point[g]=G,g++}else if(L.isHemisphereLight){const G=t.get(L);G.skyColor.copy(L.color).multiplyScalar(N),G.groundColor.copy(L.groundColor).multiplyScalar(N),n.hemi[f]=G,f++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=lt.LTC_FLOAT_1,n.rectAreaLTC2=lt.LTC_FLOAT_2):(n.rectAreaLTC1=lt.LTC_HALF_1,n.rectAreaLTC2=lt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=p;const R=n.hash;(R.directionalLength!==d||R.pointLength!==g||R.spotLength!==v||R.rectAreaLength!==m||R.hemiLength!==f||R.numDirectionalShadows!==_||R.numPointShadows!==M||R.numSpotShadows!==x||R.numSpotMaps!==P||R.numLightProbes!==E)&&(n.directional.length=d,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=f,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=x+P-T,n.spotLightMap.length=P,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=E,R.directionalLength=d,R.pointLength=g,R.spotLength=v,R.rectAreaLength=m,R.hemiLength=f,R.numDirectionalShadows=_,R.numPointShadows=M,R.numSpotShadows=x,R.numSpotMaps=P,R.numLightProbes=E,n.version=L0++)}function l(c,h){let u=0,p=0,d=0,g=0,v=0;const m=h.matrixWorldInverse;for(let f=0,_=c.length;f<_;f++){const M=c[f];if(M.isDirectionalLight){const x=n.directional[u];x.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(m),u++}else if(M.isSpotLight){const x=n.spot[d];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(m),d++}else if(M.isRectAreaLight){const x=n.rectArea[g];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),a.identity(),r.copy(M.matrixWorld),r.premultiply(m),a.extractRotation(r),x.halfWidth.set(M.width*.5,0,0),x.halfHeight.set(0,M.height*.5,0),x.halfWidth.applyMatrix4(a),x.halfHeight.applyMatrix4(a),g++}else if(M.isPointLight){const x=n.point[p];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),p++}else if(M.isHemisphereLight){const x=n.hemi[v];x.direction.setFromMatrixPosition(M.matrixWorld),x.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function jl(s){const t=new I0(s),e=[],n=[];function i(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function U0(s){let t=new WeakMap;function e(i,r=0){const a=t.get(i);let o;return a===void 0?(o=new jl(s),t.set(i,[o])):r>=a.length?(o=new jl(s),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class _h extends qn{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=vu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class N0 extends qn{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const F0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,O0=`uniform sampler2D shadow_pass;
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
}`;function z0(s,t,e){let n=new Uo;const i=new it,r=new it,a=new le,o=new _h({depthPacking:nh}),l=new N0,c={},h=e.maxTextureSize,u={[Dn]:Le,[Le]:Dn,[Ce]:Ce},p=new pe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new it},radius:{value:4}},vertexShader:F0,fragmentShader:O0}),d=p.clone();d.defines.HORIZONTAL_PASS=1;const g=new ge;g.setAttribute("position",new me(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Ft(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Bc;let f=this.type;this.render=function(T,E,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const S=s.getRenderTarget(),y=s.getActiveCubeFace(),L=s.getActiveMipmapLevel(),D=s.state;D.setBlending(Cn),D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);const N=f!==bn&&this.type===bn,H=f===bn&&this.type!==bn;for(let B=0,G=T.length;B<G;B++){const Y=T[B],z=Y.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);const V=z.getFrameExtents();if(i.multiply(V),r.copy(z.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/V.x),i.x=r.x*V.x,z.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/V.y),i.y=r.y*V.y,z.mapSize.y=r.y)),z.map===null||N===!0||H===!0){const st=this.type!==bn?{minFilter:We,magFilter:We}:{};z.map!==null&&z.map.dispose(),z.map=new Ze(i.x,i.y,st),z.map.texture.name=Y.name+".shadowMap",z.camera.updateProjectionMatrix()}s.setRenderTarget(z.map),s.clear();const Q=z.getViewportCount();for(let st=0;st<Q;st++){const at=z.getViewport(st);a.set(r.x*at.x,r.y*at.y,r.x*at.z,r.y*at.w),D.viewport(a),z.updateMatrices(Y,st),n=z.getFrustum(),x(E,R,z.camera,Y,this.type)}z.isPointLightShadow!==!0&&this.type===bn&&_(z,R),z.needsUpdate=!1}f=this.type,m.needsUpdate=!1,s.setRenderTarget(S,y,L)};function _(T,E){const R=t.update(v);p.defines.VSM_SAMPLES!==T.blurSamples&&(p.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,p.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Ze(i.x,i.y)),p.uniforms.shadow_pass.value=T.map.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,s.setRenderTarget(T.mapPass),s.clear(),s.renderBufferDirect(E,null,R,p,v,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,s.setRenderTarget(T.map),s.clear(),s.renderBufferDirect(E,null,R,d,v,null)}function M(T,E,R,S){let y=null;const L=R.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)y=L;else if(y=R.isPointLight===!0?l:o,s.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0){const D=y.uuid,N=E.uuid;let H=c[D];H===void 0&&(H={},c[D]=H);let B=H[N];B===void 0&&(B=y.clone(),H[N]=B,E.addEventListener("dispose",P)),y=B}if(y.visible=E.visible,y.wireframe=E.wireframe,S===bn?y.side=E.shadowSide!==null?E.shadowSide:E.side:y.side=E.shadowSide!==null?E.shadowSide:u[E.side],y.alphaMap=E.alphaMap,y.alphaTest=E.alphaTest,y.map=E.map,y.clipShadows=E.clipShadows,y.clippingPlanes=E.clippingPlanes,y.clipIntersection=E.clipIntersection,y.displacementMap=E.displacementMap,y.displacementScale=E.displacementScale,y.displacementBias=E.displacementBias,y.wireframeLinewidth=E.wireframeLinewidth,y.linewidth=E.linewidth,R.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const D=s.properties.get(y);D.light=R}return y}function x(T,E,R,S,y){if(T.visible===!1)return;if(T.layers.test(E.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&y===bn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,T.matrixWorld);const N=t.update(T),H=T.material;if(Array.isArray(H)){const B=N.groups;for(let G=0,Y=B.length;G<Y;G++){const z=B[G],V=H[z.materialIndex];if(V&&V.visible){const Q=M(T,V,S,y);T.onBeforeShadow(s,T,E,R,N,Q,z),s.renderBufferDirect(R,null,N,Q,T,z),T.onAfterShadow(s,T,E,R,N,Q,z)}}}else if(H.visible){const B=M(T,H,S,y);T.onBeforeShadow(s,T,E,R,N,B,null),s.renderBufferDirect(R,null,N,B,T,null),T.onAfterShadow(s,T,E,R,N,B,null)}}const D=T.children;for(let N=0,H=D.length;N<H;N++)x(D[N],E,R,S,y)}function P(T){T.target.removeEventListener("dispose",P);for(const R in c){const S=c[R],y=T.target.uuid;y in S&&(S[y].dispose(),delete S[y])}}}const B0={[Aa]:Ca,[Ra]:Da,[Pa]:Ia,[Hi]:La,[Ca]:Aa,[Da]:Ra,[Ia]:Pa,[La]:Hi};function k0(s,t){function e(){let U=!1;const ht=new le;let q=null;const J=new le(0,0,0,0);return{setMask:function(ft){q!==ft&&!U&&(s.colorMask(ft,ft,ft,ft),q=ft)},setLocked:function(ft){U=ft},setClear:function(ft,ut,Nt,ue,Te){Te===!0&&(ft*=ue,ut*=ue,Nt*=ue),ht.set(ft,ut,Nt,ue),J.equals(ht)===!1&&(s.clearColor(ft,ut,Nt,ue),J.copy(ht))},reset:function(){U=!1,q=null,J.set(-1,0,0,0)}}}function n(){let U=!1,ht=!1,q=null,J=null,ft=null;return{setReversed:function(ut){if(ht!==ut){const Nt=t.get("EXT_clip_control");ht?Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.ZERO_TO_ONE_EXT):Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.NEGATIVE_ONE_TO_ONE_EXT);const ue=ft;ft=null,this.setClear(ue)}ht=ut},getReversed:function(){return ht},setTest:function(ut){ut?et(s.DEPTH_TEST):yt(s.DEPTH_TEST)},setMask:function(ut){q!==ut&&!U&&(s.depthMask(ut),q=ut)},setFunc:function(ut){if(ht&&(ut=B0[ut]),J!==ut){switch(ut){case Aa:s.depthFunc(s.NEVER);break;case Ca:s.depthFunc(s.ALWAYS);break;case Ra:s.depthFunc(s.LESS);break;case Hi:s.depthFunc(s.LEQUAL);break;case Pa:s.depthFunc(s.EQUAL);break;case La:s.depthFunc(s.GEQUAL);break;case Da:s.depthFunc(s.GREATER);break;case Ia:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}J=ut}},setLocked:function(ut){U=ut},setClear:function(ut){ft!==ut&&(ht&&(ut=1-ut),s.clearDepth(ut),ft=ut)},reset:function(){U=!1,q=null,J=null,ft=null,ht=!1}}}function i(){let U=!1,ht=null,q=null,J=null,ft=null,ut=null,Nt=null,ue=null,Te=null;return{setTest:function(te){U||(te?et(s.STENCIL_TEST):yt(s.STENCIL_TEST))},setMask:function(te){ht!==te&&!U&&(s.stencilMask(te),ht=te)},setFunc:function(te,Je,vn){(q!==te||J!==Je||ft!==vn)&&(s.stencilFunc(te,Je,vn),q=te,J=Je,ft=vn)},setOp:function(te,Je,vn){(ut!==te||Nt!==Je||ue!==vn)&&(s.stencilOp(te,Je,vn),ut=te,Nt=Je,ue=vn)},setLocked:function(te){U=te},setClear:function(te){Te!==te&&(s.clearStencil(te),Te=te)},reset:function(){U=!1,ht=null,q=null,J=null,ft=null,ut=null,Nt=null,ue=null,Te=null}}}const r=new e,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},p=new WeakMap,d=[],g=null,v=!1,m=null,f=null,_=null,M=null,x=null,P=null,T=null,E=new mt(0,0,0),R=0,S=!1,y=null,L=null,D=null,N=null,H=null;const B=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,Y=0;const z=s.getParameter(s.VERSION);z.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(z)[1]),G=Y>=1):z.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),G=Y>=2);let V=null,Q={};const st=s.getParameter(s.SCISSOR_BOX),at=s.getParameter(s.VIEWPORT),Dt=new le().fromArray(st),X=new le().fromArray(at);function tt(U,ht,q,J){const ft=new Uint8Array(4),ut=s.createTexture();s.bindTexture(U,ut),s.texParameteri(U,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(U,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Nt=0;Nt<q;Nt++)U===s.TEXTURE_3D||U===s.TEXTURE_2D_ARRAY?s.texImage3D(ht,0,s.RGBA,1,1,J,0,s.RGBA,s.UNSIGNED_BYTE,ft):s.texImage2D(ht+Nt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ft);return ut}const ot={};ot[s.TEXTURE_2D]=tt(s.TEXTURE_2D,s.TEXTURE_2D,1),ot[s.TEXTURE_CUBE_MAP]=tt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),ot[s.TEXTURE_2D_ARRAY]=tt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),ot[s.TEXTURE_3D]=tt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),et(s.DEPTH_TEST),a.setFunc(Hi),Ut(!1),dt(nl),et(s.CULL_FACE),I(Cn);function et(U){h[U]!==!0&&(s.enable(U),h[U]=!0)}function yt(U){h[U]!==!1&&(s.disable(U),h[U]=!1)}function Mt(U,ht){return u[U]!==ht?(s.bindFramebuffer(U,ht),u[U]=ht,U===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=ht),U===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=ht),!0):!1}function At(U,ht){let q=d,J=!1;if(U){q=p.get(ht),q===void 0&&(q=[],p.set(ht,q));const ft=U.textures;if(q.length!==ft.length||q[0]!==s.COLOR_ATTACHMENT0){for(let ut=0,Nt=ft.length;ut<Nt;ut++)q[ut]=s.COLOR_ATTACHMENT0+ut;q.length=ft.length,J=!0}}else q[0]!==s.BACK&&(q[0]=s.BACK,J=!0);J&&s.drawBuffers(q)}function Bt(U){return g!==U?(s.useProgram(U),g=U,!0):!1}const Ct={[si]:s.FUNC_ADD,[Kh]:s.FUNC_SUBTRACT,[jh]:s.FUNC_REVERSE_SUBTRACT};Ct[Jh]=s.MIN,Ct[Qh]=s.MAX;const Xt={[tu]:s.ZERO,[eu]:s.ONE,[nu]:s.SRC_COLOR,[Ta]:s.SRC_ALPHA,[lu]:s.SRC_ALPHA_SATURATE,[au]:s.DST_COLOR,[su]:s.DST_ALPHA,[iu]:s.ONE_MINUS_SRC_COLOR,[Ea]:s.ONE_MINUS_SRC_ALPHA,[ou]:s.ONE_MINUS_DST_COLOR,[ru]:s.ONE_MINUS_DST_ALPHA,[cu]:s.CONSTANT_COLOR,[hu]:s.ONE_MINUS_CONSTANT_COLOR,[uu]:s.CONSTANT_ALPHA,[du]:s.ONE_MINUS_CONSTANT_ALPHA};function I(U,ht,q,J,ft,ut,Nt,ue,Te,te){if(U===Cn){v===!0&&(yt(s.BLEND),v=!1);return}if(v===!1&&(et(s.BLEND),v=!0),U!==Zh){if(U!==m||te!==S){if((f!==si||x!==si)&&(s.blendEquation(s.FUNC_ADD),f=si,x=si),te)switch(U){case oi:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Ts:s.blendFunc(s.ONE,s.ONE);break;case il:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case sl:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case oi:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Ts:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case il:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case sl:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}_=null,M=null,P=null,T=null,E.set(0,0,0),R=0,m=U,S=te}return}ft=ft||ht,ut=ut||q,Nt=Nt||J,(ht!==f||ft!==x)&&(s.blendEquationSeparate(Ct[ht],Ct[ft]),f=ht,x=ft),(q!==_||J!==M||ut!==P||Nt!==T)&&(s.blendFuncSeparate(Xt[q],Xt[J],Xt[ut],Xt[Nt]),_=q,M=J,P=ut,T=Nt),(ue.equals(E)===!1||Te!==R)&&(s.blendColor(ue.r,ue.g,ue.b,Te),E.copy(ue),R=Te),m=U,S=!1}function he(U,ht){U.side===Ce?yt(s.CULL_FACE):et(s.CULL_FACE);let q=U.side===Le;ht&&(q=!q),Ut(q),U.blending===oi&&U.transparent===!1?I(Cn):I(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);const J=U.stencilWrite;o.setTest(J),J&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),$t(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?et(s.SAMPLE_ALPHA_TO_COVERAGE):yt(s.SAMPLE_ALPHA_TO_COVERAGE)}function Ut(U){y!==U&&(U?s.frontFace(s.CW):s.frontFace(s.CCW),y=U)}function dt(U){U!==qh?(et(s.CULL_FACE),U!==L&&(U===nl?s.cullFace(s.BACK):U===Yh?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):yt(s.CULL_FACE),L=U}function gt(U){U!==D&&(G&&s.lineWidth(U),D=U)}function $t(U,ht,q){U?(et(s.POLYGON_OFFSET_FILL),(N!==ht||H!==q)&&(s.polygonOffset(ht,q),N=ht,H=q)):yt(s.POLYGON_OFFSET_FILL)}function wt(U){U?et(s.SCISSOR_TEST):yt(s.SCISSOR_TEST)}function C(U){U===void 0&&(U=s.TEXTURE0+B-1),V!==U&&(s.activeTexture(U),V=U)}function w(U,ht,q){q===void 0&&(V===null?q=s.TEXTURE0+B-1:q=V);let J=Q[q];J===void 0&&(J={type:void 0,texture:void 0},Q[q]=J),(J.type!==U||J.texture!==ht)&&(V!==q&&(s.activeTexture(q),V=q),s.bindTexture(U,ht||ot[U]),J.type=U,J.texture=ht)}function k(){const U=Q[V];U!==void 0&&U.type!==void 0&&(s.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function Z(){try{s.compressedTexImage2D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function j(){try{s.compressedTexImage3D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function K(){try{s.texSubImage2D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function St(){try{s.texSubImage3D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ct(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function vt(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function It(){try{s.texStorage2D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function nt(){try{s.texStorage3D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function _t(){try{s.texImage2D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Pt(){try{s.texImage3D.apply(s,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Lt(U){Dt.equals(U)===!1&&(s.scissor(U.x,U.y,U.z,U.w),Dt.copy(U))}function xt(U){X.equals(U)===!1&&(s.viewport(U.x,U.y,U.z,U.w),X.copy(U))}function Vt(U,ht){let q=c.get(ht);q===void 0&&(q=new WeakMap,c.set(ht,q));let J=q.get(U);J===void 0&&(J=s.getUniformBlockIndex(ht,U.name),q.set(U,J))}function Ot(U,ht){const J=c.get(ht).get(U);l.get(ht)!==J&&(s.uniformBlockBinding(ht,J,U.__bindingPointIndex),l.set(ht,J))}function ie(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},V=null,Q={},u={},p=new WeakMap,d=[],g=null,v=!1,m=null,f=null,_=null,M=null,x=null,P=null,T=null,E=new mt(0,0,0),R=0,S=!1,y=null,L=null,D=null,N=null,H=null,Dt.set(0,0,s.canvas.width,s.canvas.height),X.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:et,disable:yt,bindFramebuffer:Mt,drawBuffers:At,useProgram:Bt,setBlending:I,setMaterial:he,setFlipSided:Ut,setCullFace:dt,setLineWidth:gt,setPolygonOffset:$t,setScissorTest:wt,activeTexture:C,bindTexture:w,unbindTexture:k,compressedTexImage2D:Z,compressedTexImage3D:j,texImage2D:_t,texImage3D:Pt,updateUBOMapping:Vt,uniformBlockBinding:Ot,texStorage2D:It,texStorage3D:nt,texSubImage2D:K,texSubImage3D:St,compressedTexSubImage2D:ct,compressedTexSubImage3D:vt,scissor:Lt,viewport:xt,reset:ie}}function Jl(s,t,e,n){const i=H0(n);switch(e){case Kc:return s*t;case Jc:return s*t;case Qc:return s*t*2;case Eo:return s*t/i.components*i.byteLength;case Ao:return s*t/i.components*i.byteLength;case th:return s*t*2/i.components*i.byteLength;case Co:return s*t*2/i.components*i.byteLength;case jc:return s*t*3/i.components*i.byteLength;case an:return s*t*4/i.components*i.byteLength;case Ro:return s*t*4/i.components*i.byteLength;case vr:case xr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case _r:case Mr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case za:case ka:return Math.max(s,16)*Math.max(t,8)/4;case Oa:case Ba:return Math.max(s,8)*Math.max(t,8)/2;case Ha:case Ga:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Va:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Wa:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Xa:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case $a:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case qa:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Ya:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Za:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Ka:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case ja:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case Ja:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case Qa:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case to:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case eo:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case no:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case io:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case yr:case so:case ro:return Math.ceil(s/4)*Math.ceil(t/4)*16;case eh:case ao:return Math.ceil(s/4)*Math.ceil(t/4)*8;case oo:case lo:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function H0(s){switch(s){case In:case qc:return{byteLength:1,components:1};case Es:case Yc:case Rn:return{byteLength:2,components:1};case bo:case To:return{byteLength:2,components:4};case li:case wo:case pn:return{byteLength:4,components:1};case Zc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function G0(s,t,e,n,i,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new it,h=new WeakMap;let u;const p=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(C,w){return d?new OffscreenCanvas(C,w):Cs("canvas")}function v(C,w,k){let Z=1;const j=wt(C);if((j.width>k||j.height>k)&&(Z=k/Math.max(j.width,j.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const K=Math.floor(Z*j.width),St=Math.floor(Z*j.height);u===void 0&&(u=g(K,St));const ct=w?g(K,St):u;return ct.width=K,ct.height=St,ct.getContext("2d").drawImage(C,0,0,K,St),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+K+"x"+St+")."),ct}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),C;return C}function m(C){return C.generateMipmaps}function f(C){s.generateMipmap(C)}function _(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function M(C,w,k,Z,j=!1){if(C!==null){if(s[C]!==void 0)return s[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let K=w;if(w===s.RED&&(k===s.FLOAT&&(K=s.R32F),k===s.HALF_FLOAT&&(K=s.R16F),k===s.UNSIGNED_BYTE&&(K=s.R8)),w===s.RED_INTEGER&&(k===s.UNSIGNED_BYTE&&(K=s.R8UI),k===s.UNSIGNED_SHORT&&(K=s.R16UI),k===s.UNSIGNED_INT&&(K=s.R32UI),k===s.BYTE&&(K=s.R8I),k===s.SHORT&&(K=s.R16I),k===s.INT&&(K=s.R32I)),w===s.RG&&(k===s.FLOAT&&(K=s.RG32F),k===s.HALF_FLOAT&&(K=s.RG16F),k===s.UNSIGNED_BYTE&&(K=s.RG8)),w===s.RG_INTEGER&&(k===s.UNSIGNED_BYTE&&(K=s.RG8UI),k===s.UNSIGNED_SHORT&&(K=s.RG16UI),k===s.UNSIGNED_INT&&(K=s.RG32UI),k===s.BYTE&&(K=s.RG8I),k===s.SHORT&&(K=s.RG16I),k===s.INT&&(K=s.RG32I)),w===s.RGB_INTEGER&&(k===s.UNSIGNED_BYTE&&(K=s.RGB8UI),k===s.UNSIGNED_SHORT&&(K=s.RGB16UI),k===s.UNSIGNED_INT&&(K=s.RGB32UI),k===s.BYTE&&(K=s.RGB8I),k===s.SHORT&&(K=s.RGB16I),k===s.INT&&(K=s.RGB32I)),w===s.RGBA_INTEGER&&(k===s.UNSIGNED_BYTE&&(K=s.RGBA8UI),k===s.UNSIGNED_SHORT&&(K=s.RGBA16UI),k===s.UNSIGNED_INT&&(K=s.RGBA32UI),k===s.BYTE&&(K=s.RGBA8I),k===s.SHORT&&(K=s.RGBA16I),k===s.INT&&(K=s.RGBA32I)),w===s.RGB&&k===s.UNSIGNED_INT_5_9_9_9_REV&&(K=s.RGB9_E5),w===s.RGBA){const St=j?Pr:qt.getTransfer(Z);k===s.FLOAT&&(K=s.RGBA32F),k===s.HALF_FLOAT&&(K=s.RGBA16F),k===s.UNSIGNED_BYTE&&(K=St===ee?s.SRGB8_ALPHA8:s.RGBA8),k===s.UNSIGNED_SHORT_4_4_4_4&&(K=s.RGBA4),k===s.UNSIGNED_SHORT_5_5_5_1&&(K=s.RGB5_A1)}return(K===s.R16F||K===s.R32F||K===s.RG16F||K===s.RG32F||K===s.RGBA16F||K===s.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function x(C,w){let k;return C?w===null||w===li||w===Wi?k=s.DEPTH24_STENCIL8:w===pn?k=s.DEPTH32F_STENCIL8:w===Es&&(k=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===li||w===Wi?k=s.DEPTH_COMPONENT24:w===pn?k=s.DEPTH_COMPONENT32F:w===Es&&(k=s.DEPTH_COMPONENT16),k}function P(C,w){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==We&&C.minFilter!==Ve?Math.log2(Math.max(w.width,w.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?w.mipmaps.length:1}function T(C){const w=C.target;w.removeEventListener("dispose",T),R(w),w.isVideoTexture&&h.delete(w)}function E(C){const w=C.target;w.removeEventListener("dispose",E),y(w)}function R(C){const w=n.get(C);if(w.__webglInit===void 0)return;const k=C.source,Z=p.get(k);if(Z){const j=Z[w.__cacheKey];j.usedTimes--,j.usedTimes===0&&S(C),Object.keys(Z).length===0&&p.delete(k)}n.remove(C)}function S(C){const w=n.get(C);s.deleteTexture(w.__webglTexture);const k=C.source,Z=p.get(k);delete Z[w.__cacheKey],a.memory.textures--}function y(C){const w=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(w.__webglFramebuffer[Z]))for(let j=0;j<w.__webglFramebuffer[Z].length;j++)s.deleteFramebuffer(w.__webglFramebuffer[Z][j]);else s.deleteFramebuffer(w.__webglFramebuffer[Z]);w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer[Z])}else{if(Array.isArray(w.__webglFramebuffer))for(let Z=0;Z<w.__webglFramebuffer.length;Z++)s.deleteFramebuffer(w.__webglFramebuffer[Z]);else s.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&s.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let Z=0;Z<w.__webglColorRenderbuffer.length;Z++)w.__webglColorRenderbuffer[Z]&&s.deleteRenderbuffer(w.__webglColorRenderbuffer[Z]);w.__webglDepthRenderbuffer&&s.deleteRenderbuffer(w.__webglDepthRenderbuffer)}const k=C.textures;for(let Z=0,j=k.length;Z<j;Z++){const K=n.get(k[Z]);K.__webglTexture&&(s.deleteTexture(K.__webglTexture),a.memory.textures--),n.remove(k[Z])}n.remove(C)}let L=0;function D(){L=0}function N(){const C=L;return C>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+i.maxTextures),L+=1,C}function H(C){const w=[];return w.push(C.wrapS),w.push(C.wrapT),w.push(C.wrapR||0),w.push(C.magFilter),w.push(C.minFilter),w.push(C.anisotropy),w.push(C.internalFormat),w.push(C.format),w.push(C.type),w.push(C.generateMipmaps),w.push(C.premultiplyAlpha),w.push(C.flipY),w.push(C.unpackAlignment),w.push(C.colorSpace),w.join()}function B(C,w){const k=n.get(C);if(C.isVideoTexture&&gt(C),C.isRenderTargetTexture===!1&&C.version>0&&k.__version!==C.version){const Z=C.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{X(k,C,w);return}}e.bindTexture(s.TEXTURE_2D,k.__webglTexture,s.TEXTURE0+w)}function G(C,w){const k=n.get(C);if(C.version>0&&k.__version!==C.version){X(k,C,w);return}e.bindTexture(s.TEXTURE_2D_ARRAY,k.__webglTexture,s.TEXTURE0+w)}function Y(C,w){const k=n.get(C);if(C.version>0&&k.__version!==C.version){X(k,C,w);return}e.bindTexture(s.TEXTURE_3D,k.__webglTexture,s.TEXTURE0+w)}function z(C,w){const k=n.get(C);if(C.version>0&&k.__version!==C.version){tt(k,C,w);return}e.bindTexture(s.TEXTURE_CUBE_MAP,k.__webglTexture,s.TEXTURE0+w)}const V={[on]:s.REPEAT,[Tn]:s.CLAMP_TO_EDGE,[Fa]:s.MIRRORED_REPEAT},Q={[We]:s.NEAREST,[gu]:s.NEAREST_MIPMAP_NEAREST,[Os]:s.NEAREST_MIPMAP_LINEAR,[Ve]:s.LINEAR,[Nr]:s.LINEAR_MIPMAP_NEAREST,[En]:s.LINEAR_MIPMAP_LINEAR},st={[_u]:s.NEVER,[Tu]:s.ALWAYS,[Mu]:s.LESS,[ih]:s.LEQUAL,[yu]:s.EQUAL,[bu]:s.GEQUAL,[Su]:s.GREATER,[wu]:s.NOTEQUAL};function at(C,w){if(w.type===pn&&t.has("OES_texture_float_linear")===!1&&(w.magFilter===Ve||w.magFilter===Nr||w.magFilter===Os||w.magFilter===En||w.minFilter===Ve||w.minFilter===Nr||w.minFilter===Os||w.minFilter===En)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,V[w.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,V[w.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,V[w.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,Q[w.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,Q[w.minFilter]),w.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,st[w.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===We||w.minFilter!==Os&&w.minFilter!==En||w.type===pn&&t.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||n.get(w).__currentAnisotropy){const k=t.get("EXT_texture_filter_anisotropic");s.texParameterf(C,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,i.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy}}}function Dt(C,w){let k=!1;C.__webglInit===void 0&&(C.__webglInit=!0,w.addEventListener("dispose",T));const Z=w.source;let j=p.get(Z);j===void 0&&(j={},p.set(Z,j));const K=H(w);if(K!==C.__cacheKey){j[K]===void 0&&(j[K]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,k=!0),j[K].usedTimes++;const St=j[C.__cacheKey];St!==void 0&&(j[C.__cacheKey].usedTimes--,St.usedTimes===0&&S(w)),C.__cacheKey=K,C.__webglTexture=j[K].texture}return k}function X(C,w,k){let Z=s.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(Z=s.TEXTURE_2D_ARRAY),w.isData3DTexture&&(Z=s.TEXTURE_3D);const j=Dt(C,w),K=w.source;e.bindTexture(Z,C.__webglTexture,s.TEXTURE0+k);const St=n.get(K);if(K.version!==St.__version||j===!0){e.activeTexture(s.TEXTURE0+k);const ct=qt.getPrimaries(qt.workingColorSpace),vt=w.colorSpace===Vn?null:qt.getPrimaries(w.colorSpace),It=w.colorSpace===Vn||ct===vt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,It);let nt=v(w.image,!1,i.maxTextureSize);nt=$t(w,nt);const _t=r.convert(w.format,w.colorSpace),Pt=r.convert(w.type);let Lt=M(w.internalFormat,_t,Pt,w.colorSpace,w.isVideoTexture);at(Z,w);let xt;const Vt=w.mipmaps,Ot=w.isVideoTexture!==!0,ie=St.__version===void 0||j===!0,U=K.dataReady,ht=P(w,nt);if(w.isDepthTexture)Lt=x(w.format===Xi,w.type),ie&&(Ot?e.texStorage2D(s.TEXTURE_2D,1,Lt,nt.width,nt.height):e.texImage2D(s.TEXTURE_2D,0,Lt,nt.width,nt.height,0,_t,Pt,null));else if(w.isDataTexture)if(Vt.length>0){Ot&&ie&&e.texStorage2D(s.TEXTURE_2D,ht,Lt,Vt[0].width,Vt[0].height);for(let q=0,J=Vt.length;q<J;q++)xt=Vt[q],Ot?U&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,xt.width,xt.height,_t,Pt,xt.data):e.texImage2D(s.TEXTURE_2D,q,Lt,xt.width,xt.height,0,_t,Pt,xt.data);w.generateMipmaps=!1}else Ot?(ie&&e.texStorage2D(s.TEXTURE_2D,ht,Lt,nt.width,nt.height),U&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,nt.width,nt.height,_t,Pt,nt.data)):e.texImage2D(s.TEXTURE_2D,0,Lt,nt.width,nt.height,0,_t,Pt,nt.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){Ot&&ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ht,Lt,Vt[0].width,Vt[0].height,nt.depth);for(let q=0,J=Vt.length;q<J;q++)if(xt=Vt[q],w.format!==an)if(_t!==null)if(Ot){if(U)if(w.layerUpdates.size>0){const ft=Jl(xt.width,xt.height,w.format,w.type);for(const ut of w.layerUpdates){const Nt=xt.data.subarray(ut*ft/xt.data.BYTES_PER_ELEMENT,(ut+1)*ft/xt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,ut,xt.width,xt.height,1,_t,Nt)}w.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,0,xt.width,xt.height,nt.depth,_t,xt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,q,Lt,xt.width,xt.height,nt.depth,0,xt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ot?U&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,0,xt.width,xt.height,nt.depth,_t,Pt,xt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,q,Lt,xt.width,xt.height,nt.depth,0,_t,Pt,xt.data)}else{Ot&&ie&&e.texStorage2D(s.TEXTURE_2D,ht,Lt,Vt[0].width,Vt[0].height);for(let q=0,J=Vt.length;q<J;q++)xt=Vt[q],w.format!==an?_t!==null?Ot?U&&e.compressedTexSubImage2D(s.TEXTURE_2D,q,0,0,xt.width,xt.height,_t,xt.data):e.compressedTexImage2D(s.TEXTURE_2D,q,Lt,xt.width,xt.height,0,xt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ot?U&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,xt.width,xt.height,_t,Pt,xt.data):e.texImage2D(s.TEXTURE_2D,q,Lt,xt.width,xt.height,0,_t,Pt,xt.data)}else if(w.isDataArrayTexture)if(Ot){if(ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ht,Lt,nt.width,nt.height,nt.depth),U)if(w.layerUpdates.size>0){const q=Jl(nt.width,nt.height,w.format,w.type);for(const J of w.layerUpdates){const ft=nt.data.subarray(J*q/nt.data.BYTES_PER_ELEMENT,(J+1)*q/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,J,nt.width,nt.height,1,_t,Pt,ft)}w.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,_t,Pt,nt.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Lt,nt.width,nt.height,nt.depth,0,_t,Pt,nt.data);else if(w.isData3DTexture)Ot?(ie&&e.texStorage3D(s.TEXTURE_3D,ht,Lt,nt.width,nt.height,nt.depth),U&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,_t,Pt,nt.data)):e.texImage3D(s.TEXTURE_3D,0,Lt,nt.width,nt.height,nt.depth,0,_t,Pt,nt.data);else if(w.isFramebufferTexture){if(ie)if(Ot)e.texStorage2D(s.TEXTURE_2D,ht,Lt,nt.width,nt.height);else{let q=nt.width,J=nt.height;for(let ft=0;ft<ht;ft++)e.texImage2D(s.TEXTURE_2D,ft,Lt,q,J,0,_t,Pt,null),q>>=1,J>>=1}}else if(Vt.length>0){if(Ot&&ie){const q=wt(Vt[0]);e.texStorage2D(s.TEXTURE_2D,ht,Lt,q.width,q.height)}for(let q=0,J=Vt.length;q<J;q++)xt=Vt[q],Ot?U&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,_t,Pt,xt):e.texImage2D(s.TEXTURE_2D,q,Lt,_t,Pt,xt);w.generateMipmaps=!1}else if(Ot){if(ie){const q=wt(nt);e.texStorage2D(s.TEXTURE_2D,ht,Lt,q.width,q.height)}U&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,_t,Pt,nt)}else e.texImage2D(s.TEXTURE_2D,0,Lt,_t,Pt,nt);m(w)&&f(Z),St.__version=K.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function tt(C,w,k){if(w.image.length!==6)return;const Z=Dt(C,w),j=w.source;e.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+k);const K=n.get(j);if(j.version!==K.__version||Z===!0){e.activeTexture(s.TEXTURE0+k);const St=qt.getPrimaries(qt.workingColorSpace),ct=w.colorSpace===Vn?null:qt.getPrimaries(w.colorSpace),vt=w.colorSpace===Vn||St===ct?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,vt);const It=w.isCompressedTexture||w.image[0].isCompressedTexture,nt=w.image[0]&&w.image[0].isDataTexture,_t=[];for(let J=0;J<6;J++)!It&&!nt?_t[J]=v(w.image[J],!0,i.maxCubemapSize):_t[J]=nt?w.image[J].image:w.image[J],_t[J]=$t(w,_t[J]);const Pt=_t[0],Lt=r.convert(w.format,w.colorSpace),xt=r.convert(w.type),Vt=M(w.internalFormat,Lt,xt,w.colorSpace),Ot=w.isVideoTexture!==!0,ie=K.__version===void 0||Z===!0,U=j.dataReady;let ht=P(w,Pt);at(s.TEXTURE_CUBE_MAP,w);let q;if(It){Ot&&ie&&e.texStorage2D(s.TEXTURE_CUBE_MAP,ht,Vt,Pt.width,Pt.height);for(let J=0;J<6;J++){q=_t[J].mipmaps;for(let ft=0;ft<q.length;ft++){const ut=q[ft];w.format!==an?Lt!==null?Ot?U&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft,0,0,ut.width,ut.height,Lt,ut.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft,Vt,ut.width,ut.height,0,ut.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ot?U&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft,0,0,ut.width,ut.height,Lt,xt,ut.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft,Vt,ut.width,ut.height,0,Lt,xt,ut.data)}}}else{if(q=w.mipmaps,Ot&&ie){q.length>0&&ht++;const J=wt(_t[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,ht,Vt,J.width,J.height)}for(let J=0;J<6;J++)if(nt){Ot?U&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,_t[J].width,_t[J].height,Lt,xt,_t[J].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Vt,_t[J].width,_t[J].height,0,Lt,xt,_t[J].data);for(let ft=0;ft<q.length;ft++){const Nt=q[ft].image[J].image;Ot?U&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft+1,0,0,Nt.width,Nt.height,Lt,xt,Nt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft+1,Vt,Nt.width,Nt.height,0,Lt,xt,Nt.data)}}else{Ot?U&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Lt,xt,_t[J]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Vt,Lt,xt,_t[J]);for(let ft=0;ft<q.length;ft++){const ut=q[ft];Ot?U&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft+1,0,0,Lt,xt,ut.image[J]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft+1,Vt,Lt,xt,ut.image[J])}}}m(w)&&f(s.TEXTURE_CUBE_MAP),K.__version=j.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function ot(C,w,k,Z,j,K){const St=r.convert(k.format,k.colorSpace),ct=r.convert(k.type),vt=M(k.internalFormat,St,ct,k.colorSpace),It=n.get(w),nt=n.get(k);if(nt.__renderTarget=w,!It.__hasExternalTextures){const _t=Math.max(1,w.width>>K),Pt=Math.max(1,w.height>>K);j===s.TEXTURE_3D||j===s.TEXTURE_2D_ARRAY?e.texImage3D(j,K,vt,_t,Pt,w.depth,0,St,ct,null):e.texImage2D(j,K,vt,_t,Pt,0,St,ct,null)}e.bindFramebuffer(s.FRAMEBUFFER,C),dt(w)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Z,j,nt.__webglTexture,0,Ut(w)):(j===s.TEXTURE_2D||j>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Z,j,nt.__webglTexture,K),e.bindFramebuffer(s.FRAMEBUFFER,null)}function et(C,w,k){if(s.bindRenderbuffer(s.RENDERBUFFER,C),w.depthBuffer){const Z=w.depthTexture,j=Z&&Z.isDepthTexture?Z.type:null,K=x(w.stencilBuffer,j),St=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ct=Ut(w);dt(w)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ct,K,w.width,w.height):k?s.renderbufferStorageMultisample(s.RENDERBUFFER,ct,K,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,K,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,St,s.RENDERBUFFER,C)}else{const Z=w.textures;for(let j=0;j<Z.length;j++){const K=Z[j],St=r.convert(K.format,K.colorSpace),ct=r.convert(K.type),vt=M(K.internalFormat,St,ct,K.colorSpace),It=Ut(w);k&&dt(w)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,It,vt,w.width,w.height):dt(w)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,It,vt,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,vt,w.width,w.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function yt(C,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,C),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=n.get(w.depthTexture);Z.__renderTarget=w,(!Z.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),B(w.depthTexture,0);const j=Z.__webglTexture,K=Ut(w);if(w.depthTexture.format===Bi)dt(w)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,j,0,K):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,j,0);else if(w.depthTexture.format===Xi)dt(w)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,j,0,K):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Mt(C){const w=n.get(C),k=C.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==C.depthTexture){const Z=C.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),Z){const j=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,Z.removeEventListener("dispose",j)};Z.addEventListener("dispose",j),w.__depthDisposeCallback=j}w.__boundDepthTexture=Z}if(C.depthTexture&&!w.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");yt(w.__webglFramebuffer,C)}else if(k){w.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[Z]),w.__webglDepthbuffer[Z]===void 0)w.__webglDepthbuffer[Z]=s.createRenderbuffer(),et(w.__webglDepthbuffer[Z],C,!1);else{const j=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,K=w.__webglDepthbuffer[Z];s.bindRenderbuffer(s.RENDERBUFFER,K),s.framebufferRenderbuffer(s.FRAMEBUFFER,j,s.RENDERBUFFER,K)}}else if(e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=s.createRenderbuffer(),et(w.__webglDepthbuffer,C,!1);else{const Z=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,j=w.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,j),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,j)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function At(C,w,k){const Z=n.get(C);w!==void 0&&ot(Z.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),k!==void 0&&Mt(C)}function Bt(C){const w=C.texture,k=n.get(C),Z=n.get(w);C.addEventListener("dispose",E);const j=C.textures,K=C.isWebGLCubeRenderTarget===!0,St=j.length>1;if(St||(Z.__webglTexture===void 0&&(Z.__webglTexture=s.createTexture()),Z.__version=w.version,a.memory.textures++),K){k.__webglFramebuffer=[];for(let ct=0;ct<6;ct++)if(w.mipmaps&&w.mipmaps.length>0){k.__webglFramebuffer[ct]=[];for(let vt=0;vt<w.mipmaps.length;vt++)k.__webglFramebuffer[ct][vt]=s.createFramebuffer()}else k.__webglFramebuffer[ct]=s.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){k.__webglFramebuffer=[];for(let ct=0;ct<w.mipmaps.length;ct++)k.__webglFramebuffer[ct]=s.createFramebuffer()}else k.__webglFramebuffer=s.createFramebuffer();if(St)for(let ct=0,vt=j.length;ct<vt;ct++){const It=n.get(j[ct]);It.__webglTexture===void 0&&(It.__webglTexture=s.createTexture(),a.memory.textures++)}if(C.samples>0&&dt(C)===!1){k.__webglMultisampledFramebuffer=s.createFramebuffer(),k.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let ct=0;ct<j.length;ct++){const vt=j[ct];k.__webglColorRenderbuffer[ct]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,k.__webglColorRenderbuffer[ct]);const It=r.convert(vt.format,vt.colorSpace),nt=r.convert(vt.type),_t=M(vt.internalFormat,It,nt,vt.colorSpace,C.isXRRenderTarget===!0),Pt=Ut(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,Pt,_t,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ct,s.RENDERBUFFER,k.__webglColorRenderbuffer[ct])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(k.__webglDepthRenderbuffer=s.createRenderbuffer(),et(k.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(K){e.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture),at(s.TEXTURE_CUBE_MAP,w);for(let ct=0;ct<6;ct++)if(w.mipmaps&&w.mipmaps.length>0)for(let vt=0;vt<w.mipmaps.length;vt++)ot(k.__webglFramebuffer[ct][vt],C,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,vt);else ot(k.__webglFramebuffer[ct],C,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0);m(w)&&f(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(St){for(let ct=0,vt=j.length;ct<vt;ct++){const It=j[ct],nt=n.get(It);e.bindTexture(s.TEXTURE_2D,nt.__webglTexture),at(s.TEXTURE_2D,It),ot(k.__webglFramebuffer,C,It,s.COLOR_ATTACHMENT0+ct,s.TEXTURE_2D,0),m(It)&&f(s.TEXTURE_2D)}e.unbindTexture()}else{let ct=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ct=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(ct,Z.__webglTexture),at(ct,w),w.mipmaps&&w.mipmaps.length>0)for(let vt=0;vt<w.mipmaps.length;vt++)ot(k.__webglFramebuffer[vt],C,w,s.COLOR_ATTACHMENT0,ct,vt);else ot(k.__webglFramebuffer,C,w,s.COLOR_ATTACHMENT0,ct,0);m(w)&&f(ct),e.unbindTexture()}C.depthBuffer&&Mt(C)}function Ct(C){const w=C.textures;for(let k=0,Z=w.length;k<Z;k++){const j=w[k];if(m(j)){const K=_(C),St=n.get(j).__webglTexture;e.bindTexture(K,St),f(K),e.unbindTexture()}}}const Xt=[],I=[];function he(C){if(C.samples>0){if(dt(C)===!1){const w=C.textures,k=C.width,Z=C.height;let j=s.COLOR_BUFFER_BIT;const K=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,St=n.get(C),ct=w.length>1;if(ct)for(let vt=0;vt<w.length;vt++)e.bindFramebuffer(s.FRAMEBUFFER,St.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+vt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,St.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+vt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,St.__webglMultisampledFramebuffer),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,St.__webglFramebuffer);for(let vt=0;vt<w.length;vt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(j|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(j|=s.STENCIL_BUFFER_BIT)),ct){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,St.__webglColorRenderbuffer[vt]);const It=n.get(w[vt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,It,0)}s.blitFramebuffer(0,0,k,Z,0,0,k,Z,j,s.NEAREST),l===!0&&(Xt.length=0,I.length=0,Xt.push(s.COLOR_ATTACHMENT0+vt),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Xt.push(K),I.push(K),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,I)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Xt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ct)for(let vt=0;vt<w.length;vt++){e.bindFramebuffer(s.FRAMEBUFFER,St.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+vt,s.RENDERBUFFER,St.__webglColorRenderbuffer[vt]);const It=n.get(w[vt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,St.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+vt,s.TEXTURE_2D,It,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,St.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const w=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[w])}}}function Ut(C){return Math.min(i.maxSamples,C.samples)}function dt(C){const w=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function gt(C){const w=a.render.frame;h.get(C)!==w&&(h.set(C,w),C.update())}function $t(C,w){const k=C.colorSpace,Z=C.format,j=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||k!==ji&&k!==Vn&&(qt.getTransfer(k)===ee?(Z!==an||j!==In)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),w}function wt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=D,this.setTexture2D=B,this.setTexture2DArray=G,this.setTexture3D=Y,this.setTextureCube=z,this.rebindTextures=At,this.setupRenderTarget=Bt,this.updateRenderTargetMipmap=Ct,this.updateMultisampleRenderTarget=he,this.setupDepthRenderbuffer=Mt,this.setupFrameBufferTexture=ot,this.useMultisampledRTT=dt}function V0(s,t){function e(n,i=Vn){let r;const a=qt.getTransfer(i);if(n===In)return s.UNSIGNED_BYTE;if(n===bo)return s.UNSIGNED_SHORT_4_4_4_4;if(n===To)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Zc)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===qc)return s.BYTE;if(n===Yc)return s.SHORT;if(n===Es)return s.UNSIGNED_SHORT;if(n===wo)return s.INT;if(n===li)return s.UNSIGNED_INT;if(n===pn)return s.FLOAT;if(n===Rn)return s.HALF_FLOAT;if(n===Kc)return s.ALPHA;if(n===jc)return s.RGB;if(n===an)return s.RGBA;if(n===Jc)return s.LUMINANCE;if(n===Qc)return s.LUMINANCE_ALPHA;if(n===Bi)return s.DEPTH_COMPONENT;if(n===Xi)return s.DEPTH_STENCIL;if(n===Eo)return s.RED;if(n===Ao)return s.RED_INTEGER;if(n===th)return s.RG;if(n===Co)return s.RG_INTEGER;if(n===Ro)return s.RGBA_INTEGER;if(n===vr||n===xr||n===_r||n===Mr)if(a===ee)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===vr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===xr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===_r)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Mr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===vr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===xr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===_r)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Mr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Oa||n===za||n===Ba||n===ka)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Oa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===za)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ba)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ka)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ha||n===Ga||n===Va)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ha||n===Ga)return a===ee?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Va)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Wa||n===Xa||n===$a||n===qa||n===Ya||n===Za||n===Ka||n===ja||n===Ja||n===Qa||n===to||n===eo||n===no||n===io)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Wa)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Xa)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===$a)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===qa)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ya)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Za)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ka)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ja)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ja)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Qa)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===to)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===eo)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===no)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===io)return a===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===yr||n===so||n===ro)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===yr)return a===ee?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===so)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ro)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===eh||n===ao||n===oo||n===lo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===yr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ao)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===oo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===lo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Wi?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}class W0 extends Ge{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Pe extends xe{constructor(){super(),this.isGroup=!0,this.type="Group"}}const X0={type:"move"};class la{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Pe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Pe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Pe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const v of t.hand.values()){const m=e.getJointPose(v,n),f=this._getHandJoint(c,v);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],p=h.position.distanceTo(u.position),d=.02,g=.005;c.inputState.pinching&&p>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&p<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(X0)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Pe;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const $0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,q0=`
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

}`;class Y0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const i=new be,r=t.properties.get(i);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new pe({vertexShader:$0,fragmentShader:q0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ft(new hn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Z0 extends Ji{constructor(t,e){super();const n=this;let i=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,p=null,d=null,g=null;const v=new Y0,m=e.getContextAttributes();let f=null,_=null;const M=[],x=[],P=new it;let T=null;const E=new Ge;E.viewport=new le;const R=new Ge;R.viewport=new le;const S=[E,R],y=new W0;let L=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let tt=M[X];return tt===void 0&&(tt=new la,M[X]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function(X){let tt=M[X];return tt===void 0&&(tt=new la,M[X]=tt),tt.getGripSpace()},this.getHand=function(X){let tt=M[X];return tt===void 0&&(tt=new la,M[X]=tt),tt.getHandSpace()};function N(X){const tt=x.indexOf(X.inputSource);if(tt===-1)return;const ot=M[tt];ot!==void 0&&(ot.update(X.inputSource,X.frame,c||a),ot.dispatchEvent({type:X.type,data:X.inputSource}))}function H(){i.removeEventListener("select",N),i.removeEventListener("selectstart",N),i.removeEventListener("selectend",N),i.removeEventListener("squeeze",N),i.removeEventListener("squeezestart",N),i.removeEventListener("squeezeend",N),i.removeEventListener("end",H),i.removeEventListener("inputsourceschange",B);for(let X=0;X<M.length;X++){const tt=x[X];tt!==null&&(x[X]=null,M[X].disconnect(tt))}L=null,D=null,v.reset(),t.setRenderTarget(f),d=null,p=null,u=null,i=null,_=null,Dt.stop(),n.isPresenting=!1,t.setPixelRatio(T),t.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){o=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return p!==null?p:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(X){if(i=X,i!==null){if(f=t.getRenderTarget(),i.addEventListener("select",N),i.addEventListener("selectstart",N),i.addEventListener("selectend",N),i.addEventListener("squeeze",N),i.addEventListener("squeezestart",N),i.addEventListener("squeezeend",N),i.addEventListener("end",H),i.addEventListener("inputsourceschange",B),m.xrCompatible!==!0&&await e.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(P),i.renderState.layers===void 0){const tt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,e,tt),i.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),_=new Ze(d.framebufferWidth,d.framebufferHeight,{format:an,type:In,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let tt=null,ot=null,et=null;m.depth&&(et=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,tt=m.stencil?Xi:Bi,ot=m.stencil?Wi:li);const yt={colorFormat:e.RGBA8,depthFormat:et,scaleFactor:r};u=new XRWebGLBinding(i,e),p=u.createProjectionLayer(yt),i.updateRenderState({layers:[p]}),t.setPixelRatio(1),t.setSize(p.textureWidth,p.textureHeight,!1),_=new Ze(p.textureWidth,p.textureHeight,{format:an,type:In,depthTexture:new ph(p.textureWidth,p.textureHeight,ot,void 0,void 0,void 0,void 0,void 0,void 0,tt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),Dt.setContext(i),Dt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function B(X){for(let tt=0;tt<X.removed.length;tt++){const ot=X.removed[tt],et=x.indexOf(ot);et>=0&&(x[et]=null,M[et].disconnect(ot))}for(let tt=0;tt<X.added.length;tt++){const ot=X.added[tt];let et=x.indexOf(ot);if(et===-1){for(let Mt=0;Mt<M.length;Mt++)if(Mt>=x.length){x.push(ot),et=Mt;break}else if(x[Mt]===null){x[Mt]=ot,et=Mt;break}if(et===-1)break}const yt=M[et];yt&&yt.connect(ot)}}const G=new A,Y=new A;function z(X,tt,ot){G.setFromMatrixPosition(tt.matrixWorld),Y.setFromMatrixPosition(ot.matrixWorld);const et=G.distanceTo(Y),yt=tt.projectionMatrix.elements,Mt=ot.projectionMatrix.elements,At=yt[14]/(yt[10]-1),Bt=yt[14]/(yt[10]+1),Ct=(yt[9]+1)/yt[5],Xt=(yt[9]-1)/yt[5],I=(yt[8]-1)/yt[0],he=(Mt[8]+1)/Mt[0],Ut=At*I,dt=At*he,gt=et/(-I+he),$t=gt*-I;if(tt.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX($t),X.translateZ(gt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),yt[10]===-1)X.projectionMatrix.copy(tt.projectionMatrix),X.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{const wt=At+gt,C=Bt+gt,w=Ut-$t,k=dt+(et-$t),Z=Ct*Bt/C*wt,j=Xt*Bt/C*wt;X.projectionMatrix.makePerspective(w,k,Z,j,wt,C),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function V(X,tt){tt===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(tt.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(i===null)return;let tt=X.near,ot=X.far;v.texture!==null&&(v.depthNear>0&&(tt=v.depthNear),v.depthFar>0&&(ot=v.depthFar)),y.near=R.near=E.near=tt,y.far=R.far=E.far=ot,(L!==y.near||D!==y.far)&&(i.updateRenderState({depthNear:y.near,depthFar:y.far}),L=y.near,D=y.far),E.layers.mask=X.layers.mask|2,R.layers.mask=X.layers.mask|4,y.layers.mask=E.layers.mask|R.layers.mask;const et=X.parent,yt=y.cameras;V(y,et);for(let Mt=0;Mt<yt.length;Mt++)V(yt[Mt],et);yt.length===2?z(y,E,R):y.projectionMatrix.copy(E.projectionMatrix),Q(X,y,et)};function Q(X,tt,ot){ot===null?X.matrix.copy(tt.matrixWorld):(X.matrix.copy(ot.matrixWorld),X.matrix.invert(),X.matrix.multiply(tt.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(tt.projectionMatrix),X.projectionMatrixInverse.copy(tt.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=As*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(p===null&&d===null))return l},this.setFoveation=function(X){l=X,p!==null&&(p.fixedFoveation=X),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=X)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(y)};let st=null;function at(X,tt){if(h=tt.getViewerPose(c||a),g=tt,h!==null){const ot=h.views;d!==null&&(t.setRenderTargetFramebuffer(_,d.framebuffer),t.setRenderTarget(_));let et=!1;ot.length!==y.cameras.length&&(y.cameras.length=0,et=!0);for(let Mt=0;Mt<ot.length;Mt++){const At=ot[Mt];let Bt=null;if(d!==null)Bt=d.getViewport(At);else{const Xt=u.getViewSubImage(p,At);Bt=Xt.viewport,Mt===0&&(t.setRenderTargetTextures(_,Xt.colorTexture,p.ignoreDepthValues?void 0:Xt.depthStencilTexture),t.setRenderTarget(_))}let Ct=S[Mt];Ct===void 0&&(Ct=new Ge,Ct.layers.enable(Mt),Ct.viewport=new le,S[Mt]=Ct),Ct.matrix.fromArray(At.transform.matrix),Ct.matrix.decompose(Ct.position,Ct.quaternion,Ct.scale),Ct.projectionMatrix.fromArray(At.projectionMatrix),Ct.projectionMatrixInverse.copy(Ct.projectionMatrix).invert(),Ct.viewport.set(Bt.x,Bt.y,Bt.width,Bt.height),Mt===0&&(y.matrix.copy(Ct.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),et===!0&&y.cameras.push(Ct)}const yt=i.enabledFeatures;if(yt&&yt.includes("depth-sensing")){const Mt=u.getDepthInformation(ot[0]);Mt&&Mt.isValid&&Mt.texture&&v.init(t,Mt,i.renderState)}}for(let ot=0;ot<M.length;ot++){const et=x[ot],yt=M[ot];et!==null&&yt!==void 0&&yt.update(et,tt,c||a)}st&&st(X,tt),tt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:tt}),g=null}const Dt=new fh;Dt.setAnimationLoop(at),this.setAnimationLoop=function(X){st=X},this.dispose=function(){}}}const ti=new ln,K0=new Wt;function j0(s,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,hh(s)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function i(m,f,_,M,x){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),u(m,f)):f.isMeshPhongMaterial?(r(m,f),h(m,f)):f.isMeshStandardMaterial?(r(m,f),p(m,f),f.isMeshPhysicalMaterial&&d(m,f,x)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),v(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,_,M):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Le&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Le&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const _=t.get(f),M=_.envMap,x=_.envMapRotation;M&&(m.envMap.value=M,ti.copy(x),ti.x*=-1,ti.y*=-1,ti.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(ti.y*=-1,ti.z*=-1),m.envMapRotation.value.setFromMatrix4(K0.makeRotationFromEuler(ti)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,_,M){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*_,m.scale.value=M*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function p(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function d(m,f,_){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Le&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function v(m,f){const _=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function J0(s,t,e,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,M){const x=M.program;n.uniformBlockBinding(_,x)}function c(_,M){let x=i[_.id];x===void 0&&(g(_),x=h(_),i[_.id]=x,_.addEventListener("dispose",m));const P=M.program;n.updateUBOMapping(_,P);const T=t.render.frame;r[_.id]!==T&&(p(_),r[_.id]=T)}function h(_){const M=u();_.__bindingPointIndex=M;const x=s.createBuffer(),P=_.__size,T=_.usage;return s.bindBuffer(s.UNIFORM_BUFFER,x),s.bufferData(s.UNIFORM_BUFFER,P,T),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,M,x),x}function u(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(_){const M=i[_.id],x=_.uniforms,P=_.__cache;s.bindBuffer(s.UNIFORM_BUFFER,M);for(let T=0,E=x.length;T<E;T++){const R=Array.isArray(x[T])?x[T]:[x[T]];for(let S=0,y=R.length;S<y;S++){const L=R[S];if(d(L,T,S,P)===!0){const D=L.__offset,N=Array.isArray(L.value)?L.value:[L.value];let H=0;for(let B=0;B<N.length;B++){const G=N[B],Y=v(G);typeof G=="number"||typeof G=="boolean"?(L.__data[0]=G,s.bufferSubData(s.UNIFORM_BUFFER,D+H,L.__data)):G.isMatrix3?(L.__data[0]=G.elements[0],L.__data[1]=G.elements[1],L.__data[2]=G.elements[2],L.__data[3]=0,L.__data[4]=G.elements[3],L.__data[5]=G.elements[4],L.__data[6]=G.elements[5],L.__data[7]=0,L.__data[8]=G.elements[6],L.__data[9]=G.elements[7],L.__data[10]=G.elements[8],L.__data[11]=0):(G.toArray(L.__data,H),H+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,D,L.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(_,M,x,P){const T=_.value,E=M+"_"+x;if(P[E]===void 0)return typeof T=="number"||typeof T=="boolean"?P[E]=T:P[E]=T.clone(),!0;{const R=P[E];if(typeof T=="number"||typeof T=="boolean"){if(R!==T)return P[E]=T,!0}else if(R.equals(T)===!1)return R.copy(T),!0}return!1}function g(_){const M=_.uniforms;let x=0;const P=16;for(let E=0,R=M.length;E<R;E++){const S=Array.isArray(M[E])?M[E]:[M[E]];for(let y=0,L=S.length;y<L;y++){const D=S[y],N=Array.isArray(D.value)?D.value:[D.value];for(let H=0,B=N.length;H<B;H++){const G=N[H],Y=v(G),z=x%P,V=z%Y.boundary,Q=z+V;x+=V,Q!==0&&P-Q<Y.storage&&(x+=P-Q),D.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=x,x+=Y.storage}}}const T=x%P;return T>0&&(x+=P-T),_.__size=x,_.__cache={},this}function v(_){const M={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(M.boundary=4,M.storage=4):_.isVector2?(M.boundary=8,M.storage=8):_.isVector3||_.isColor?(M.boundary=16,M.storage=12):_.isVector4?(M.boundary=16,M.storage=16):_.isMatrix3?(M.boundary=48,M.storage=48):_.isMatrix4?(M.boundary=64,M.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),M}function m(_){const M=_.target;M.removeEventListener("dispose",m);const x=a.indexOf(M.__bindingPointIndex);a.splice(x,1),s.deleteBuffer(i[M.id]),delete i[M.id],delete r[M.id]}function f(){for(const _ in i)s.deleteBuffer(i[_]);a=[],i={},r={}}return{bind:l,update:c,dispose:f}}class Q0{constructor(t={}){const{canvas:e=Gu(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:p=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const g=new Uint32Array(4),v=new Int32Array(4);let m=null,f=null;const _=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=re,this.toneMapping=Xn,this.toneMappingExposure=1;const x=this;let P=!1,T=0,E=0,R=null,S=-1,y=null;const L=new le,D=new le;let N=null;const H=new mt(0);let B=0,G=e.width,Y=e.height,z=1,V=null,Q=null;const st=new le(0,0,G,Y),at=new le(0,0,G,Y);let Dt=!1;const X=new Uo;let tt=!1,ot=!1;const et=new Wt,yt=new Wt,Mt=new A,At=new le,Bt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ct=!1;function Xt(){return R===null?z:1}let I=n;function he(b,F){return e.getContext(b,F)}try{const b={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Mo}`),e.addEventListener("webglcontextlost",J,!1),e.addEventListener("webglcontextrestored",ft,!1),e.addEventListener("webglcontextcreationerror",ut,!1),I===null){const F="webgl2";if(I=he(F,b),I===null)throw he(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Ut,dt,gt,$t,wt,C,w,k,Z,j,K,St,ct,vt,It,nt,_t,Pt,Lt,xt,Vt,Ot,ie,U;function ht(){Ut=new rm(I),Ut.init(),Ot=new V0(I,Ut),dt=new Qp(I,Ut,t,Ot),gt=new k0(I,Ut),dt.reverseDepthBuffer&&p&&gt.buffers.depth.setReversed(!0),$t=new lm(I),wt=new E0,C=new G0(I,Ut,gt,wt,dt,Ot,$t),w=new em(x),k=new sm(x),Z=new pd(I),ie=new jp(I,Z),j=new am(I,Z,$t,ie),K=new hm(I,j,Z,$t),Lt=new cm(I,dt,C),nt=new tm(wt),St=new T0(x,w,k,Ut,dt,ie,nt),ct=new j0(x,wt),vt=new C0,It=new U0(Ut),Pt=new Kp(x,w,k,gt,K,d,l),_t=new z0(x,K,dt),U=new J0(I,$t,dt,gt),xt=new Jp(I,Ut,$t),Vt=new om(I,Ut,$t),$t.programs=St.programs,x.capabilities=dt,x.extensions=Ut,x.properties=wt,x.renderLists=vt,x.shadowMap=_t,x.state=gt,x.info=$t}ht();const q=new Z0(x,I);this.xr=q,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const b=Ut.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Ut.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(b){b!==void 0&&(z=b,this.setSize(G,Y,!1))},this.getSize=function(b){return b.set(G,Y)},this.setSize=function(b,F,W=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=b,Y=F,e.width=Math.floor(b*z),e.height=Math.floor(F*z),W===!0&&(e.style.width=b+"px",e.style.height=F+"px"),this.setViewport(0,0,b,F)},this.getDrawingBufferSize=function(b){return b.set(G*z,Y*z).floor()},this.setDrawingBufferSize=function(b,F,W){G=b,Y=F,z=W,e.width=Math.floor(b*W),e.height=Math.floor(F*W),this.setViewport(0,0,b,F)},this.getCurrentViewport=function(b){return b.copy(L)},this.getViewport=function(b){return b.copy(st)},this.setViewport=function(b,F,W,$){b.isVector4?st.set(b.x,b.y,b.z,b.w):st.set(b,F,W,$),gt.viewport(L.copy(st).multiplyScalar(z).round())},this.getScissor=function(b){return b.copy(at)},this.setScissor=function(b,F,W,$){b.isVector4?at.set(b.x,b.y,b.z,b.w):at.set(b,F,W,$),gt.scissor(D.copy(at).multiplyScalar(z).round())},this.getScissorTest=function(){return Dt},this.setScissorTest=function(b){gt.setScissorTest(Dt=b)},this.setOpaqueSort=function(b){V=b},this.setTransparentSort=function(b){Q=b},this.getClearColor=function(b){return b.copy(Pt.getClearColor())},this.setClearColor=function(){Pt.setClearColor.apply(Pt,arguments)},this.getClearAlpha=function(){return Pt.getClearAlpha()},this.setClearAlpha=function(){Pt.setClearAlpha.apply(Pt,arguments)},this.clear=function(b=!0,F=!0,W=!0){let $=0;if(b){let O=!1;if(R!==null){const rt=R.texture.format;O=rt===Ro||rt===Co||rt===Ao}if(O){const rt=R.texture.type,pt=rt===In||rt===li||rt===Es||rt===Wi||rt===bo||rt===To,bt=Pt.getClearColor(),Tt=Pt.getClearAlpha(),zt=bt.r,kt=bt.g,Et=bt.b;pt?(g[0]=zt,g[1]=kt,g[2]=Et,g[3]=Tt,I.clearBufferuiv(I.COLOR,0,g)):(v[0]=zt,v[1]=kt,v[2]=Et,v[3]=Tt,I.clearBufferiv(I.COLOR,0,v))}else $|=I.COLOR_BUFFER_BIT}F&&($|=I.DEPTH_BUFFER_BIT),W&&($|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",J,!1),e.removeEventListener("webglcontextrestored",ft,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),vt.dispose(),It.dispose(),wt.dispose(),w.dispose(),k.dispose(),K.dispose(),ie.dispose(),U.dispose(),St.dispose(),q.dispose(),q.removeEventListener("sessionstart",Yo),q.removeEventListener("sessionend",Zo),Yn.stop()};function J(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),P=!0}function ft(){console.log("THREE.WebGLRenderer: Context Restored."),P=!1;const b=$t.autoReset,F=_t.enabled,W=_t.autoUpdate,$=_t.needsUpdate,O=_t.type;ht(),$t.autoReset=b,_t.enabled=F,_t.autoUpdate=W,_t.needsUpdate=$,_t.type=O}function ut(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Nt(b){const F=b.target;F.removeEventListener("dispose",Nt),ue(F)}function ue(b){Te(b),wt.remove(b)}function Te(b){const F=wt.get(b).programs;F!==void 0&&(F.forEach(function(W){St.releaseProgram(W)}),b.isShaderMaterial&&St.releaseShaderCache(b))}this.renderBufferDirect=function(b,F,W,$,O,rt){F===null&&(F=Bt);const pt=O.isMesh&&O.matrixWorld.determinant()<0,bt=zh(b,F,W,$,O);gt.setMaterial($,pt);let Tt=W.index,zt=1;if($.wireframe===!0){if(Tt=j.getWireframeAttribute(W),Tt===void 0)return;zt=2}const kt=W.drawRange,Et=W.attributes.position;let Zt=kt.start*zt,se=(kt.start+kt.count)*zt;rt!==null&&(Zt=Math.max(Zt,rt.start*zt),se=Math.min(se,(rt.start+rt.count)*zt)),Tt!==null?(Zt=Math.max(Zt,0),se=Math.min(se,Tt.count)):Et!=null&&(Zt=Math.max(Zt,0),se=Math.min(se,Et.count));const ae=se-Zt;if(ae<0||ae===1/0)return;ie.setup(O,$,bt,W,Tt);let Ue,jt=xt;if(Tt!==null&&(Ue=Z.get(Tt),jt=Vt,jt.setIndex(Ue)),O.isMesh)$.wireframe===!0?(gt.setLineWidth($.wireframeLinewidth*Xt()),jt.setMode(I.LINES)):jt.setMode(I.TRIANGLES);else if(O.isLine){let Rt=$.linewidth;Rt===void 0&&(Rt=1),gt.setLineWidth(Rt*Xt()),O.isLineSegments?jt.setMode(I.LINES):O.isLineLoop?jt.setMode(I.LINE_LOOP):jt.setMode(I.LINE_STRIP)}else O.isPoints?jt.setMode(I.POINTS):O.isSprite&&jt.setMode(I.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)jt.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(Ut.get("WEBGL_multi_draw"))jt.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Rt=O._multiDrawStarts,xn=O._multiDrawCounts,Jt=O._multiDrawCount,Qe=Tt?Z.get(Tt).bytesPerElement:1,fi=wt.get($).currentProgram.getUniforms();for(let Fe=0;Fe<Jt;Fe++)fi.setValue(I,"_gl_DrawID",Fe),jt.render(Rt[Fe]/Qe,xn[Fe])}else if(O.isInstancedMesh)jt.renderInstances(Zt,ae,O.count);else if(W.isInstancedBufferGeometry){const Rt=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,xn=Math.min(W.instanceCount,Rt);jt.renderInstances(Zt,ae,xn)}else jt.render(Zt,ae)};function te(b,F,W){b.transparent===!0&&b.side===Ce&&b.forceSinglePass===!1?(b.side=Le,b.needsUpdate=!0,Fs(b,F,W),b.side=Dn,b.needsUpdate=!0,Fs(b,F,W),b.side=Ce):Fs(b,F,W)}this.compile=function(b,F,W=null){W===null&&(W=b),f=It.get(W),f.init(F),M.push(f),W.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(f.pushLight(O),O.castShadow&&f.pushShadow(O))}),b!==W&&b.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(f.pushLight(O),O.castShadow&&f.pushShadow(O))}),f.setupLights();const $=new Set;return b.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const rt=O.material;if(rt)if(Array.isArray(rt))for(let pt=0;pt<rt.length;pt++){const bt=rt[pt];te(bt,W,O),$.add(bt)}else te(rt,W,O),$.add(rt)}),M.pop(),f=null,$},this.compileAsync=function(b,F,W=null){const $=this.compile(b,F,W);return new Promise(O=>{function rt(){if($.forEach(function(pt){wt.get(pt).currentProgram.isReady()&&$.delete(pt)}),$.size===0){O(b);return}setTimeout(rt,10)}Ut.get("KHR_parallel_shader_compile")!==null?rt():setTimeout(rt,10)})};let Je=null;function vn(b){Je&&Je(b)}function Yo(){Yn.stop()}function Zo(){Yn.start()}const Yn=new fh;Yn.setAnimationLoop(vn),typeof self<"u"&&Yn.setContext(self),this.setAnimationLoop=function(b){Je=b,q.setAnimationLoop(b),b===null?Yn.stop():Yn.start()},q.addEventListener("sessionstart",Yo),q.addEventListener("sessionend",Zo),this.render=function(b,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(F),F=q.getCamera()),b.isScene===!0&&b.onBeforeRender(x,b,F,R),f=It.get(b,M.length),f.init(F),M.push(f),yt.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),X.setFromProjectionMatrix(yt),ot=this.localClippingEnabled,tt=nt.init(this.clippingPlanes,ot),m=vt.get(b,_.length),m.init(),_.push(m),q.enabled===!0&&q.isPresenting===!0){const rt=x.xr.getDepthSensingMesh();rt!==null&&Ir(rt,F,-1/0,x.sortObjects)}Ir(b,F,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(V,Q),Ct=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,Ct&&Pt.addToRenderList(m,b),this.info.render.frame++,tt===!0&&nt.beginShadows();const W=f.state.shadowsArray;_t.render(W,b,F),tt===!0&&nt.endShadows(),this.info.autoReset===!0&&this.info.reset();const $=m.opaque,O=m.transmissive;if(f.setupLights(),F.isArrayCamera){const rt=F.cameras;if(O.length>0)for(let pt=0,bt=rt.length;pt<bt;pt++){const Tt=rt[pt];jo($,O,b,Tt)}Ct&&Pt.render(b);for(let pt=0,bt=rt.length;pt<bt;pt++){const Tt=rt[pt];Ko(m,b,Tt,Tt.viewport)}}else O.length>0&&jo($,O,b,F),Ct&&Pt.render(b),Ko(m,b,F);R!==null&&(C.updateMultisampleRenderTarget(R),C.updateRenderTargetMipmap(R)),b.isScene===!0&&b.onAfterRender(x,b,F),ie.resetDefaultState(),S=-1,y=null,M.pop(),M.length>0?(f=M[M.length-1],tt===!0&&nt.setGlobalState(x.clippingPlanes,f.state.camera)):f=null,_.pop(),_.length>0?m=_[_.length-1]:m=null};function Ir(b,F,W,$){if(b.visible===!1)return;if(b.layers.test(F.layers)){if(b.isGroup)W=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(F);else if(b.isLight)f.pushLight(b),b.castShadow&&f.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||X.intersectsSprite(b)){$&&At.setFromMatrixPosition(b.matrixWorld).applyMatrix4(yt);const pt=K.update(b),bt=b.material;bt.visible&&m.push(b,pt,bt,W,At.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||X.intersectsObject(b))){const pt=K.update(b),bt=b.material;if($&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),At.copy(b.boundingSphere.center)):(pt.boundingSphere===null&&pt.computeBoundingSphere(),At.copy(pt.boundingSphere.center)),At.applyMatrix4(b.matrixWorld).applyMatrix4(yt)),Array.isArray(bt)){const Tt=pt.groups;for(let zt=0,kt=Tt.length;zt<kt;zt++){const Et=Tt[zt],Zt=bt[Et.materialIndex];Zt&&Zt.visible&&m.push(b,pt,Zt,W,At.z,Et)}}else bt.visible&&m.push(b,pt,bt,W,At.z,null)}}const rt=b.children;for(let pt=0,bt=rt.length;pt<bt;pt++)Ir(rt[pt],F,W,$)}function Ko(b,F,W,$){const O=b.opaque,rt=b.transmissive,pt=b.transparent;f.setupLightsView(W),tt===!0&&nt.setGlobalState(x.clippingPlanes,W),$&&gt.viewport(L.copy($)),O.length>0&&Ns(O,F,W),rt.length>0&&Ns(rt,F,W),pt.length>0&&Ns(pt,F,W),gt.buffers.depth.setTest(!0),gt.buffers.depth.setMask(!0),gt.buffers.color.setMask(!0),gt.setPolygonOffset(!1)}function jo(b,F,W,$){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[$.id]===void 0&&(f.state.transmissionRenderTarget[$.id]=new Ze(1,1,{generateMipmaps:!0,type:Ut.has("EXT_color_buffer_half_float")||Ut.has("EXT_color_buffer_float")?Rn:In,minFilter:En,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qt.workingColorSpace}));const rt=f.state.transmissionRenderTarget[$.id],pt=$.viewport||L;rt.setSize(pt.z,pt.w);const bt=x.getRenderTarget();x.setRenderTarget(rt),x.getClearColor(H),B=x.getClearAlpha(),B<1&&x.setClearColor(16777215,.5),x.clear(),Ct&&Pt.render(W);const Tt=x.toneMapping;x.toneMapping=Xn;const zt=$.viewport;if($.viewport!==void 0&&($.viewport=void 0),f.setupLightsView($),tt===!0&&nt.setGlobalState(x.clippingPlanes,$),Ns(b,W,$),C.updateMultisampleRenderTarget(rt),C.updateRenderTargetMipmap(rt),Ut.has("WEBGL_multisampled_render_to_texture")===!1){let kt=!1;for(let Et=0,Zt=F.length;Et<Zt;Et++){const se=F[Et],ae=se.object,Ue=se.geometry,jt=se.material,Rt=se.group;if(jt.side===Ce&&ae.layers.test($.layers)){const xn=jt.side;jt.side=Le,jt.needsUpdate=!0,Jo(ae,W,$,Ue,jt,Rt),jt.side=xn,jt.needsUpdate=!0,kt=!0}}kt===!0&&(C.updateMultisampleRenderTarget(rt),C.updateRenderTargetMipmap(rt))}x.setRenderTarget(bt),x.setClearColor(H,B),zt!==void 0&&($.viewport=zt),x.toneMapping=Tt}function Ns(b,F,W){const $=F.isScene===!0?F.overrideMaterial:null;for(let O=0,rt=b.length;O<rt;O++){const pt=b[O],bt=pt.object,Tt=pt.geometry,zt=$===null?pt.material:$,kt=pt.group;bt.layers.test(W.layers)&&Jo(bt,F,W,Tt,zt,kt)}}function Jo(b,F,W,$,O,rt){b.onBeforeRender(x,F,W,$,O,rt),b.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),O.onBeforeRender(x,F,W,$,b,rt),O.transparent===!0&&O.side===Ce&&O.forceSinglePass===!1?(O.side=Le,O.needsUpdate=!0,x.renderBufferDirect(W,F,$,O,b,rt),O.side=Dn,O.needsUpdate=!0,x.renderBufferDirect(W,F,$,O,b,rt),O.side=Ce):x.renderBufferDirect(W,F,$,O,b,rt),b.onAfterRender(x,F,W,$,O,rt)}function Fs(b,F,W){F.isScene!==!0&&(F=Bt);const $=wt.get(b),O=f.state.lights,rt=f.state.shadowsArray,pt=O.state.version,bt=St.getParameters(b,O.state,rt,F,W),Tt=St.getProgramCacheKey(bt);let zt=$.programs;$.environment=b.isMeshStandardMaterial?F.environment:null,$.fog=F.fog,$.envMap=(b.isMeshStandardMaterial?k:w).get(b.envMap||$.environment),$.envMapRotation=$.environment!==null&&b.envMap===null?F.environmentRotation:b.envMapRotation,zt===void 0&&(b.addEventListener("dispose",Nt),zt=new Map,$.programs=zt);let kt=zt.get(Tt);if(kt!==void 0){if($.currentProgram===kt&&$.lightsStateVersion===pt)return tl(b,bt),kt}else bt.uniforms=St.getUniforms(b),b.onBeforeCompile(bt,x),kt=St.acquireProgram(bt,Tt),zt.set(Tt,kt),$.uniforms=bt.uniforms;const Et=$.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Et.clippingPlanes=nt.uniform),tl(b,bt),$.needsLights=kh(b),$.lightsStateVersion=pt,$.needsLights&&(Et.ambientLightColor.value=O.state.ambient,Et.lightProbe.value=O.state.probe,Et.directionalLights.value=O.state.directional,Et.directionalLightShadows.value=O.state.directionalShadow,Et.spotLights.value=O.state.spot,Et.spotLightShadows.value=O.state.spotShadow,Et.rectAreaLights.value=O.state.rectArea,Et.ltc_1.value=O.state.rectAreaLTC1,Et.ltc_2.value=O.state.rectAreaLTC2,Et.pointLights.value=O.state.point,Et.pointLightShadows.value=O.state.pointShadow,Et.hemisphereLights.value=O.state.hemi,Et.directionalShadowMap.value=O.state.directionalShadowMap,Et.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Et.spotShadowMap.value=O.state.spotShadowMap,Et.spotLightMatrix.value=O.state.spotLightMatrix,Et.spotLightMap.value=O.state.spotLightMap,Et.pointShadowMap.value=O.state.pointShadowMap,Et.pointShadowMatrix.value=O.state.pointShadowMatrix),$.currentProgram=kt,$.uniformsList=null,kt}function Qo(b){if(b.uniformsList===null){const F=b.currentProgram.getUniforms();b.uniformsList=Sr.seqWithValue(F.seq,b.uniforms)}return b.uniformsList}function tl(b,F){const W=wt.get(b);W.outputColorSpace=F.outputColorSpace,W.batching=F.batching,W.batchingColor=F.batchingColor,W.instancing=F.instancing,W.instancingColor=F.instancingColor,W.instancingMorph=F.instancingMorph,W.skinning=F.skinning,W.morphTargets=F.morphTargets,W.morphNormals=F.morphNormals,W.morphColors=F.morphColors,W.morphTargetsCount=F.morphTargetsCount,W.numClippingPlanes=F.numClippingPlanes,W.numIntersection=F.numClipIntersection,W.vertexAlphas=F.vertexAlphas,W.vertexTangents=F.vertexTangents,W.toneMapping=F.toneMapping}function zh(b,F,W,$,O){F.isScene!==!0&&(F=Bt),C.resetTextureUnits();const rt=F.fog,pt=$.isMeshStandardMaterial?F.environment:null,bt=R===null?x.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:ji,Tt=($.isMeshStandardMaterial?k:w).get($.envMap||pt),zt=$.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,kt=!!W.attributes.tangent&&(!!$.normalMap||$.anisotropy>0),Et=!!W.morphAttributes.position,Zt=!!W.morphAttributes.normal,se=!!W.morphAttributes.color;let ae=Xn;$.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(ae=x.toneMapping);const Ue=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,jt=Ue!==void 0?Ue.length:0,Rt=wt.get($),xn=f.state.lights;if(tt===!0&&(ot===!0||b!==y)){const Xe=b===y&&$.id===S;nt.setState($,b,Xe)}let Jt=!1;$.version===Rt.__version?(Rt.needsLights&&Rt.lightsStateVersion!==xn.state.version||Rt.outputColorSpace!==bt||O.isBatchedMesh&&Rt.batching===!1||!O.isBatchedMesh&&Rt.batching===!0||O.isBatchedMesh&&Rt.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Rt.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Rt.instancing===!1||!O.isInstancedMesh&&Rt.instancing===!0||O.isSkinnedMesh&&Rt.skinning===!1||!O.isSkinnedMesh&&Rt.skinning===!0||O.isInstancedMesh&&Rt.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Rt.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Rt.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Rt.instancingMorph===!1&&O.morphTexture!==null||Rt.envMap!==Tt||$.fog===!0&&Rt.fog!==rt||Rt.numClippingPlanes!==void 0&&(Rt.numClippingPlanes!==nt.numPlanes||Rt.numIntersection!==nt.numIntersection)||Rt.vertexAlphas!==zt||Rt.vertexTangents!==kt||Rt.morphTargets!==Et||Rt.morphNormals!==Zt||Rt.morphColors!==se||Rt.toneMapping!==ae||Rt.morphTargetsCount!==jt)&&(Jt=!0):(Jt=!0,Rt.__version=$.version);let Qe=Rt.currentProgram;Jt===!0&&(Qe=Fs($,F,O));let fi=!1,Fe=!1,ns=!1;const oe=Qe.getUniforms(),un=Rt.uniforms;if(gt.useProgram(Qe.program)&&(fi=!0,Fe=!0,ns=!0),$.id!==S&&(S=$.id,Fe=!0),fi||y!==b){gt.buffers.depth.getReversed()?(et.copy(b.projectionMatrix),Wu(et),Xu(et),oe.setValue(I,"projectionMatrix",et)):oe.setValue(I,"projectionMatrix",b.projectionMatrix),oe.setValue(I,"viewMatrix",b.matrixWorldInverse);const Un=oe.map.cameraPosition;Un!==void 0&&Un.setValue(I,Mt.setFromMatrixPosition(b.matrixWorld)),dt.logarithmicDepthBuffer&&oe.setValue(I,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),($.isMeshPhongMaterial||$.isMeshToonMaterial||$.isMeshLambertMaterial||$.isMeshBasicMaterial||$.isMeshStandardMaterial||$.isShaderMaterial)&&oe.setValue(I,"isOrthographic",b.isOrthographicCamera===!0),y!==b&&(y=b,Fe=!0,ns=!0)}if(O.isSkinnedMesh){oe.setOptional(I,O,"bindMatrix"),oe.setOptional(I,O,"bindMatrixInverse");const Xe=O.skeleton;Xe&&(Xe.boneTexture===null&&Xe.computeBoneTexture(),oe.setValue(I,"boneTexture",Xe.boneTexture,C))}O.isBatchedMesh&&(oe.setOptional(I,O,"batchingTexture"),oe.setValue(I,"batchingTexture",O._matricesTexture,C),oe.setOptional(I,O,"batchingIdTexture"),oe.setValue(I,"batchingIdTexture",O._indirectTexture,C),oe.setOptional(I,O,"batchingColorTexture"),O._colorsTexture!==null&&oe.setValue(I,"batchingColorTexture",O._colorsTexture,C));const is=W.morphAttributes;if((is.position!==void 0||is.normal!==void 0||is.color!==void 0)&&Lt.update(O,W,Qe),(Fe||Rt.receiveShadow!==O.receiveShadow)&&(Rt.receiveShadow=O.receiveShadow,oe.setValue(I,"receiveShadow",O.receiveShadow)),$.isMeshGouraudMaterial&&$.envMap!==null&&(un.envMap.value=Tt,un.flipEnvMap.value=Tt.isCubeTexture&&Tt.isRenderTargetTexture===!1?-1:1),$.isMeshStandardMaterial&&$.envMap===null&&F.environment!==null&&(un.envMapIntensity.value=F.environmentIntensity),Fe&&(oe.setValue(I,"toneMappingExposure",x.toneMappingExposure),Rt.needsLights&&Bh(un,ns),rt&&$.fog===!0&&ct.refreshFogUniforms(un,rt),ct.refreshMaterialUniforms(un,$,z,Y,f.state.transmissionRenderTarget[b.id]),Sr.upload(I,Qo(Rt),un,C)),$.isShaderMaterial&&$.uniformsNeedUpdate===!0&&(Sr.upload(I,Qo(Rt),un,C),$.uniformsNeedUpdate=!1),$.isSpriteMaterial&&oe.setValue(I,"center",O.center),oe.setValue(I,"modelViewMatrix",O.modelViewMatrix),oe.setValue(I,"normalMatrix",O.normalMatrix),oe.setValue(I,"modelMatrix",O.matrixWorld),$.isShaderMaterial||$.isRawShaderMaterial){const Xe=$.uniformsGroups;for(let Un=0,Nn=Xe.length;Un<Nn;Un++){const el=Xe[Un];U.update(el,Qe),U.bind(el,Qe)}}return Qe}function Bh(b,F){b.ambientLightColor.needsUpdate=F,b.lightProbe.needsUpdate=F,b.directionalLights.needsUpdate=F,b.directionalLightShadows.needsUpdate=F,b.pointLights.needsUpdate=F,b.pointLightShadows.needsUpdate=F,b.spotLights.needsUpdate=F,b.spotLightShadows.needsUpdate=F,b.rectAreaLights.needsUpdate=F,b.hemisphereLights.needsUpdate=F}function kh(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(b,F,W){wt.get(b.texture).__webglTexture=F,wt.get(b.depthTexture).__webglTexture=W;const $=wt.get(b);$.__hasExternalTextures=!0,$.__autoAllocateDepthBuffer=W===void 0,$.__autoAllocateDepthBuffer||Ut.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),$.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,F){const W=wt.get(b);W.__webglFramebuffer=F,W.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(b,F=0,W=0){R=b,T=F,E=W;let $=!0,O=null,rt=!1,pt=!1;if(b){const Tt=wt.get(b);if(Tt.__useDefaultFramebuffer!==void 0)gt.bindFramebuffer(I.FRAMEBUFFER,null),$=!1;else if(Tt.__webglFramebuffer===void 0)C.setupRenderTarget(b);else if(Tt.__hasExternalTextures)C.rebindTextures(b,wt.get(b.texture).__webglTexture,wt.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const Et=b.depthTexture;if(Tt.__boundDepthTexture!==Et){if(Et!==null&&wt.has(Et)&&(b.width!==Et.image.width||b.height!==Et.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(b)}}const zt=b.texture;(zt.isData3DTexture||zt.isDataArrayTexture||zt.isCompressedArrayTexture)&&(pt=!0);const kt=wt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(kt[F])?O=kt[F][W]:O=kt[F],rt=!0):b.samples>0&&C.useMultisampledRTT(b)===!1?O=wt.get(b).__webglMultisampledFramebuffer:Array.isArray(kt)?O=kt[W]:O=kt,L.copy(b.viewport),D.copy(b.scissor),N=b.scissorTest}else L.copy(st).multiplyScalar(z).floor(),D.copy(at).multiplyScalar(z).floor(),N=Dt;if(gt.bindFramebuffer(I.FRAMEBUFFER,O)&&$&&gt.drawBuffers(b,O),gt.viewport(L),gt.scissor(D),gt.setScissorTest(N),rt){const Tt=wt.get(b.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+F,Tt.__webglTexture,W)}else if(pt){const Tt=wt.get(b.texture),zt=F||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,Tt.__webglTexture,W||0,zt)}S=-1},this.readRenderTargetPixels=function(b,F,W,$,O,rt,pt){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let bt=wt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&pt!==void 0&&(bt=bt[pt]),bt){gt.bindFramebuffer(I.FRAMEBUFFER,bt);try{const Tt=b.texture,zt=Tt.format,kt=Tt.type;if(!dt.textureFormatReadable(zt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!dt.textureTypeReadable(kt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=b.width-$&&W>=0&&W<=b.height-O&&I.readPixels(F,W,$,O,Ot.convert(zt),Ot.convert(kt),rt)}finally{const Tt=R!==null?wt.get(R).__webglFramebuffer:null;gt.bindFramebuffer(I.FRAMEBUFFER,Tt)}}},this.readRenderTargetPixelsAsync=async function(b,F,W,$,O,rt,pt){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let bt=wt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&pt!==void 0&&(bt=bt[pt]),bt){const Tt=b.texture,zt=Tt.format,kt=Tt.type;if(!dt.textureFormatReadable(zt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!dt.textureTypeReadable(kt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(F>=0&&F<=b.width-$&&W>=0&&W<=b.height-O){gt.bindFramebuffer(I.FRAMEBUFFER,bt);const Et=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Et),I.bufferData(I.PIXEL_PACK_BUFFER,rt.byteLength,I.STREAM_READ),I.readPixels(F,W,$,O,Ot.convert(zt),Ot.convert(kt),0);const Zt=R!==null?wt.get(R).__webglFramebuffer:null;gt.bindFramebuffer(I.FRAMEBUFFER,Zt);const se=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Vu(I,se,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Et),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,rt),I.deleteBuffer(Et),I.deleteSync(se),rt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,F=null,W=0){b.isTexture!==!0&&(vs("WebGLRenderer: copyFramebufferToTexture function signature has changed."),F=arguments[0]||null,b=arguments[1]);const $=Math.pow(2,-W),O=Math.floor(b.image.width*$),rt=Math.floor(b.image.height*$),pt=F!==null?F.x:0,bt=F!==null?F.y:0;C.setTexture2D(b,0),I.copyTexSubImage2D(I.TEXTURE_2D,W,0,0,pt,bt,O,rt),gt.unbindTexture()},this.copyTextureToTexture=function(b,F,W=null,$=null,O=0){b.isTexture!==!0&&(vs("WebGLRenderer: copyTextureToTexture function signature has changed."),$=arguments[0]||null,b=arguments[1],F=arguments[2],O=arguments[3]||0,W=null);let rt,pt,bt,Tt,zt,kt,Et,Zt,se;const ae=b.isCompressedTexture?b.mipmaps[O]:b.image;W!==null?(rt=W.max.x-W.min.x,pt=W.max.y-W.min.y,bt=W.isBox3?W.max.z-W.min.z:1,Tt=W.min.x,zt=W.min.y,kt=W.isBox3?W.min.z:0):(rt=ae.width,pt=ae.height,bt=ae.depth||1,Tt=0,zt=0,kt=0),$!==null?(Et=$.x,Zt=$.y,se=$.z):(Et=0,Zt=0,se=0);const Ue=Ot.convert(F.format),jt=Ot.convert(F.type);let Rt;F.isData3DTexture?(C.setTexture3D(F,0),Rt=I.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(C.setTexture2DArray(F,0),Rt=I.TEXTURE_2D_ARRAY):(C.setTexture2D(F,0),Rt=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,F.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,F.unpackAlignment);const xn=I.getParameter(I.UNPACK_ROW_LENGTH),Jt=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Qe=I.getParameter(I.UNPACK_SKIP_PIXELS),fi=I.getParameter(I.UNPACK_SKIP_ROWS),Fe=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,ae.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,ae.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Tt),I.pixelStorei(I.UNPACK_SKIP_ROWS,zt),I.pixelStorei(I.UNPACK_SKIP_IMAGES,kt);const ns=b.isDataArrayTexture||b.isData3DTexture,oe=F.isDataArrayTexture||F.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){const un=wt.get(b),is=wt.get(F),Xe=wt.get(un.__renderTarget),Un=wt.get(is.__renderTarget);gt.bindFramebuffer(I.READ_FRAMEBUFFER,Xe.__webglFramebuffer),gt.bindFramebuffer(I.DRAW_FRAMEBUFFER,Un.__webglFramebuffer);for(let Nn=0;Nn<bt;Nn++)ns&&I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,wt.get(b).__webglTexture,O,kt+Nn),b.isDepthTexture?(oe&&I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,wt.get(F).__webglTexture,O,se+Nn),I.blitFramebuffer(Tt,zt,rt,pt,Et,Zt,rt,pt,I.DEPTH_BUFFER_BIT,I.NEAREST)):oe?I.copyTexSubImage3D(Rt,O,Et,Zt,se+Nn,Tt,zt,rt,pt):I.copyTexSubImage2D(Rt,O,Et,Zt,se+Nn,Tt,zt,rt,pt);gt.bindFramebuffer(I.READ_FRAMEBUFFER,null),gt.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else oe?b.isDataTexture||b.isData3DTexture?I.texSubImage3D(Rt,O,Et,Zt,se,rt,pt,bt,Ue,jt,ae.data):F.isCompressedArrayTexture?I.compressedTexSubImage3D(Rt,O,Et,Zt,se,rt,pt,bt,Ue,ae.data):I.texSubImage3D(Rt,O,Et,Zt,se,rt,pt,bt,Ue,jt,ae):b.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,O,Et,Zt,rt,pt,Ue,jt,ae.data):b.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,O,Et,Zt,ae.width,ae.height,Ue,ae.data):I.texSubImage2D(I.TEXTURE_2D,O,Et,Zt,rt,pt,Ue,jt,ae);I.pixelStorei(I.UNPACK_ROW_LENGTH,xn),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Jt),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Qe),I.pixelStorei(I.UNPACK_SKIP_ROWS,fi),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Fe),O===0&&F.generateMipmaps&&I.generateMipmap(Rt),gt.unbindTexture()},this.copyTextureToTexture3D=function(b,F,W=null,$=null,O=0){return b.isTexture!==!0&&(vs("WebGLRenderer: copyTextureToTexture3D function signature has changed."),W=arguments[0]||null,$=arguments[1]||null,b=arguments[2],F=arguments[3],O=arguments[4]||0),vs('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,F,W,$,O)},this.initRenderTarget=function(b){wt.get(b).__webglFramebuffer===void 0&&C.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?C.setTextureCube(b,0):b.isData3DTexture?C.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?C.setTexture2DArray(b,0):C.setTexture2D(b,0),gt.unbindTexture()},this.resetState=function(){T=0,E=0,R=null,gt.reset(),ie.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return An}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=qt._getDrawingBufferColorSpace(t),e.unpackColorSpace=qt._getUnpackColorSpace()}}class Oo{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new mt(t),this.near=e,this.far=n}clone(){return new Oo(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Ql extends xe{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ln,this.environmentIntensity=1,this.environmentRotation=new ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class tg{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=co,this.updateRanges=[],this.version=0,this.uuid=mn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,r=this.stride;i<r;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=mn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=mn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const De=new A;class Tr{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)De.fromBufferAttribute(this,e),De.applyMatrix4(t),this.setXYZ(e,De.x,De.y,De.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)De.fromBufferAttribute(this,e),De.applyNormalMatrix(t),this.setXYZ(e,De.x,De.y,De.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)De.fromBufferAttribute(this,e),De.transformDirection(t),this.setXYZ(e,De.x,De.y,De.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=rn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ne(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=rn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=rn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=rn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=rn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array),r=ne(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return new me(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Tr(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Mh extends qn{static get type(){return"SpriteMaterial"}constructor(t){super(),this.isSpriteMaterial=!0,this.color=new mt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Ci;const ls=new A,Ri=new A,Pi=new A,Li=new it,cs=new it,yh=new Wt,sr=new A,hs=new A,rr=new A,tc=new it,ca=new it,ec=new it;class eg extends xe{constructor(t=new Mh){if(super(),this.isSprite=!0,this.type="Sprite",Ci===void 0){Ci=new ge;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new tg(e,5);Ci.setIndex([0,1,2,0,2,3]),Ci.setAttribute("position",new Tr(n,3,0,!1)),Ci.setAttribute("uv",new Tr(n,2,3,!1))}this.geometry=Ci,this.material=t,this.center=new it(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ri.setFromMatrixScale(this.matrixWorld),yh.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Pi.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ri.multiplyScalar(-Pi.z);const n=this.material.rotation;let i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));const a=this.center;ar(sr.set(-.5,-.5,0),Pi,a,Ri,i,r),ar(hs.set(.5,-.5,0),Pi,a,Ri,i,r),ar(rr.set(.5,.5,0),Pi,a,Ri,i,r),tc.set(0,0),ca.set(1,0),ec.set(1,1);let o=t.ray.intersectTriangle(sr,hs,rr,!1,ls);if(o===null&&(ar(hs.set(-.5,.5,0),Pi,a,Ri,i,r),ca.set(0,1),o=t.ray.intersectTriangle(sr,rr,hs,!1,ls),o===null))return;const l=t.ray.origin.distanceTo(ls);l<t.near||l>t.far||e.push({distance:l,point:ls.clone(),uv:Ye.getInterpolation(ls,sr,hs,rr,tc,ca,ec,new it),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function ar(s,t,e,n,i,r){Li.subVectors(s,e).addScalar(.5).multiply(n),i!==void 0?(cs.x=r*Li.x-i*Li.y,cs.y=i*Li.x+r*Li.y):cs.copy(Li),s.copy(t),s.x+=cs.x,s.y+=cs.y,s.applyMatrix4(yh)}class ng extends be{constructor(t=null,e=1,n=1,i,r,a,o,l,c=We,h=We,u,p){super(null,a,o,l,c,h,i,r,u,p),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class fn extends me{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Di=new Wt,nc=new Wt,or=[],ic=new ui,ig=new Wt,us=new Ft,ds=new Qi;class ci extends Ft{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new fn(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,ig)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new ui),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Di),ic.copy(t.boundingBox).applyMatrix4(Di),this.boundingBox.union(ic)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Qi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Di),ds.copy(t.boundingSphere).applyMatrix4(Di),this.boundingSphere.union(ds)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(t,e){const n=this.matrixWorld,i=this.count;if(us.geometry=this.geometry,us.material=this.material,us.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ds.copy(this.boundingSphere),ds.applyMatrix4(n),t.ray.intersectsSphere(ds)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Di),nc.multiplyMatrices(n,Di),us.matrixWorld=nc,us.raycast(t,or);for(let a=0,o=or.length;a<o;a++){const l=or[a];l.instanceId=r,l.object=this,e.push(l)}or.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new fn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ng(new Float32Array(i*this.count),i,this.count,Eo,pn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Sh extends qn{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new mt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const sc=new Wt,fo=new Do,lr=new Qi,cr=new A;class sg extends xe{constructor(t=new ge,e=new Sh){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),lr.copy(n.boundingSphere),lr.applyMatrix4(i),lr.radius+=r,t.ray.intersectsSphere(lr)===!1)return;sc.copy(i).invert(),fo.copy(t.ray).applyMatrix4(sc);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const p=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let g=p,v=d;g<v;g++){const m=c.getX(g);cr.fromBufferAttribute(u,m),rc(cr,m,l,i,t,e,this)}}else{const p=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let g=p,v=d;g<v;g++)cr.fromBufferAttribute(u,g),rc(cr,g,l,i,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function rc(s,t,e,n,i,r,a){const o=fo.distanceSqToPoint(s);if(o<e){const l=new A;fo.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class je extends be{constructor(t,e,n,i,r,a,o,l,c){super(t,e,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class gn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,i=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let i=0;const r=n.length;let a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(r-1);const h=n[i],p=n[i+1]-h,d=(a-h)/p;return(i+d)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);const a=this.getPoint(i),o=this.getPoint(r),l=e||(a.isVector2?new it:new A);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new A,i=[],r=[],a=[],o=new A,l=new Wt;for(let d=0;d<=t;d++){const g=d/t;i[d]=this.getTangentAt(g,new A)}r[0]=new A,a[0]=new A;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),p=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),p<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(i[d-1],i[d]),o.length()>Number.EPSILON){o.normalize();const g=Math.acos(Se(i[d-1].dot(i[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,g))}a[d].crossVectors(i[d],r[d])}if(e===!0){let d=Math.acos(Se(r[0].dot(r[t]),-1,1));d/=t,i[0].dot(o.crossVectors(r[0],r[t]))>0&&(d=-d);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],d*g)),a[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class zo extends gn{constructor(t=0,e=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new it){const n=e,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);const o=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),p=l-this.aX,d=c-this.aY;l=p*h-d*u+this.aX,c=p*u+d*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class rg extends zo{constructor(t,e,n,i,r,a){super(t,e,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Bo(){let s=0,t=0,e=0,n=0;function i(r,a,o,l){s=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){i(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let p=(a-r)/c-(o-r)/(c+h)+(o-a)/h,d=(o-a)/h-(l-a)/(h+u)+(l-o)/u;p*=h,d*=h,i(a,o,p,d)},calc:function(r){const a=r*r,o=a*r;return s+t*r+e*a+n*o}}}const hr=new A,ha=new Bo,ua=new Bo,da=new Bo;class wh extends gn{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new A){const n=e,i=this.points,r=i.length,a=(r-(this.closed?0:1))*t;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%r]:(hr.subVectors(i[0],i[1]).add(i[0]),c=hr);const u=i[o%r],p=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(hr.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=hr),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),d),v=Math.pow(u.distanceToSquared(p),d),m=Math.pow(p.distanceToSquared(h),d);v<1e-4&&(v=1),g<1e-4&&(g=v),m<1e-4&&(m=v),ha.initNonuniformCatmullRom(c.x,u.x,p.x,h.x,g,v,m),ua.initNonuniformCatmullRom(c.y,u.y,p.y,h.y,g,v,m),da.initNonuniformCatmullRom(c.z,u.z,p.z,h.z,g,v,m)}else this.curveType==="catmullrom"&&(ha.initCatmullRom(c.x,u.x,p.x,h.x,this.tension),ua.initCatmullRom(c.y,u.y,p.y,h.y,this.tension),da.initCatmullRom(c.z,u.z,p.z,h.z,this.tension));return n.set(ha.calc(l),ua.calc(l),da.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new A().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function ac(s,t,e,n,i){const r=(n-t)*.5,a=(i-e)*.5,o=s*s,l=s*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*s+e}function ag(s,t){const e=1-s;return e*e*t}function og(s,t){return 2*(1-s)*s*t}function lg(s,t){return s*s*t}function ys(s,t,e,n){return ag(s,t)+og(s,e)+lg(s,n)}function cg(s,t){const e=1-s;return e*e*e*t}function hg(s,t){const e=1-s;return 3*e*e*s*t}function ug(s,t){return 3*(1-s)*s*s*t}function dg(s,t){return s*s*s*t}function Ss(s,t,e,n,i){return cg(s,t)+hg(s,e)+ug(s,n)+dg(s,i)}class bh extends gn{constructor(t=new it,e=new it,n=new it,i=new it){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new it){const n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ss(t,i.x,r.x,a.x,o.x),Ss(t,i.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class fg extends gn{constructor(t=new A,e=new A,n=new A,i=new A){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new A){const n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ss(t,i.x,r.x,a.x,o.x),Ss(t,i.y,r.y,a.y,o.y),Ss(t,i.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Th extends gn{constructor(t=new it,e=new it){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new it){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new it){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class pg extends gn{constructor(t=new A,e=new A){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new A){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new A){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Eh extends gn{constructor(t=new it,e=new it,n=new it){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new it){const n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(ys(t,i.x,r.x,a.x),ys(t,i.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Ah extends gn{constructor(t=new A,e=new A,n=new A){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new A){const n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(ys(t,i.x,r.x,a.x),ys(t,i.y,r.y,a.y),ys(t,i.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Ch extends gn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new it){const n=e,i=this.points,r=(i.length-1)*t,a=Math.floor(r),o=r-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(ac(o,l.x,c.x,h.x,u.x),ac(o,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new it().fromArray(i))}return this}}var po=Object.freeze({__proto__:null,ArcCurve:rg,CatmullRomCurve3:wh,CubicBezierCurve:bh,CubicBezierCurve3:fg,EllipseCurve:zo,LineCurve:Th,LineCurve3:pg,QuadraticBezierCurve:Eh,QuadraticBezierCurve3:Ah,SplineCurve:Ch});class mg extends gn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new po[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const a=i[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const a=r[i],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(new po[i.type]().fromJSON(i))}return this}}class oc extends mg{constructor(t){super(),this.type="Path",this.currentPoint=new it,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new Th(this.currentPoint.clone(),new it(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){const r=new Eh(this.currentPoint.clone(),new it(t,e),new it(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,a){const o=new bh(this.currentPoint.clone(),new it(t,e),new it(n,i),new it(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new Ch(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,i,r,a),this}absarc(t,e,n,i,r,a){return this.absellipse(t,e,n,n,i,r,a),this}ellipse(t,e,n,i,r,a,o,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,r,a,o,l),this}absellipse(t,e,n,i,r,a,o,l){const c=new zo(t,e,n,i,r,a,o,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class qi extends ge{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);const r=[],a=[],o=[],l=[],c=new A,h=new it;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,p=3;u<=e;u++,p+=3){const d=n+u/e*i;c.x=t*Math.cos(d),c.y=t*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[p]/t+1)/2,h.y=(a[p+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Qt(a,3)),this.setAttribute("normal",new Qt(o,3)),this.setAttribute("uv",new Qt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qi(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class Ln extends ge{constructor(t=1,e=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],p=[],d=[];let g=0;const v=[],m=n/2;let f=0;_(),a===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new Qt(u,3)),this.setAttribute("normal",new Qt(p,3)),this.setAttribute("uv",new Qt(d,2));function _(){const x=new A,P=new A;let T=0;const E=(e-t)/n;for(let R=0;R<=r;R++){const S=[],y=R/r,L=y*(e-t)+t;for(let D=0;D<=i;D++){const N=D/i,H=N*l+o,B=Math.sin(H),G=Math.cos(H);P.x=L*B,P.y=-y*n+m,P.z=L*G,u.push(P.x,P.y,P.z),x.set(B,E,G).normalize(),p.push(x.x,x.y,x.z),d.push(N,1-y),S.push(g++)}v.push(S)}for(let R=0;R<i;R++)for(let S=0;S<r;S++){const y=v[S][R],L=v[S+1][R],D=v[S+1][R+1],N=v[S][R+1];(t>0||S!==0)&&(h.push(y,L,N),T+=3),(e>0||S!==r-1)&&(h.push(L,D,N),T+=3)}c.addGroup(f,T,0),f+=T}function M(x){const P=g,T=new it,E=new A;let R=0;const S=x===!0?t:e,y=x===!0?1:-1;for(let D=1;D<=i;D++)u.push(0,m*y,0),p.push(0,y,0),d.push(.5,.5),g++;const L=g;for(let D=0;D<=i;D++){const H=D/i*l+o,B=Math.cos(H),G=Math.sin(H);E.x=S*G,E.y=m*y,E.z=S*B,u.push(E.x,E.y,E.z),p.push(0,y,0),T.x=B*.5+.5,T.y=G*.5*y+.5,d.push(T.x,T.y),g++}for(let D=0;D<i;D++){const N=P+D,H=L+D;x===!0?h.push(H,H+1,N):h.push(H+1,H,N),R+=3}c.addGroup(f,R,x===!0?1:2),f+=R}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ln(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class ko extends Ln{constructor(t=1,e=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new ko(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Ho extends ge{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};const r=[],a=[];o(i),c(n),h(),this.setAttribute("position",new Qt(r,3)),this.setAttribute("normal",new Qt(r.slice(),3)),this.setAttribute("uv",new Qt(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(_){const M=new A,x=new A,P=new A;for(let T=0;T<e.length;T+=3)d(e[T+0],M),d(e[T+1],x),d(e[T+2],P),l(M,x,P,_)}function l(_,M,x,P){const T=P+1,E=[];for(let R=0;R<=T;R++){E[R]=[];const S=_.clone().lerp(x,R/T),y=M.clone().lerp(x,R/T),L=T-R;for(let D=0;D<=L;D++)D===0&&R===T?E[R][D]=S:E[R][D]=S.clone().lerp(y,D/L)}for(let R=0;R<T;R++)for(let S=0;S<2*(T-R)-1;S++){const y=Math.floor(S/2);S%2===0?(p(E[R][y+1]),p(E[R+1][y]),p(E[R][y])):(p(E[R][y+1]),p(E[R+1][y+1]),p(E[R+1][y]))}}function c(_){const M=new A;for(let x=0;x<r.length;x+=3)M.x=r[x+0],M.y=r[x+1],M.z=r[x+2],M.normalize().multiplyScalar(_),r[x+0]=M.x,r[x+1]=M.y,r[x+2]=M.z}function h(){const _=new A;for(let M=0;M<r.length;M+=3){_.x=r[M+0],_.y=r[M+1],_.z=r[M+2];const x=m(_)/2/Math.PI+.5,P=f(_)/Math.PI+.5;a.push(x,1-P)}g(),u()}function u(){for(let _=0;_<a.length;_+=6){const M=a[_+0],x=a[_+2],P=a[_+4],T=Math.max(M,x,P),E=Math.min(M,x,P);T>.9&&E<.1&&(M<.2&&(a[_+0]+=1),x<.2&&(a[_+2]+=1),P<.2&&(a[_+4]+=1))}}function p(_){r.push(_.x,_.y,_.z)}function d(_,M){const x=_*3;M.x=t[x+0],M.y=t[x+1],M.z=t[x+2]}function g(){const _=new A,M=new A,x=new A,P=new A,T=new it,E=new it,R=new it;for(let S=0,y=0;S<r.length;S+=9,y+=6){_.set(r[S+0],r[S+1],r[S+2]),M.set(r[S+3],r[S+4],r[S+5]),x.set(r[S+6],r[S+7],r[S+8]),T.set(a[y+0],a[y+1]),E.set(a[y+2],a[y+3]),R.set(a[y+4],a[y+5]),P.copy(_).add(M).add(x).divideScalar(3);const L=m(P);v(T,y+0,_,L),v(E,y+2,M,L),v(R,y+4,x,L)}}function v(_,M,x,P){P<0&&_.x===1&&(a[M]=_.x-1),x.x===0&&x.z===0&&(a[M]=P/2/Math.PI+.5)}function m(_){return Math.atan2(_.z,-_.x)}function f(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ho(t.vertices,t.indices,t.radius,t.details)}}class Rh extends oc{constructor(t){super(t),this.uuid=mn(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(new oc().fromJSON(i))}return this}}const gg={triangulate:function(s,t,e=2){const n=t&&t.length,i=n?t[0]*e:s.length;let r=Ph(s,0,i,e,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c,h,u,p,d;if(n&&(r=yg(s,t,r,e)),s.length>80*e){o=c=s[0],l=h=s[1];for(let g=e;g<i;g+=e)u=s[g],p=s[g+1],u<o&&(o=u),p<l&&(l=p),u>c&&(c=u),p>h&&(h=p);d=Math.max(c-o,h-l),d=d!==0?32767/d:0}return Rs(r,a,e,o,l,d,0),a}};function Ph(s,t,e,n,i){let r,a;if(i===Dg(s,t,e,n)>0)for(r=t;r<e;r+=n)a=lc(r,s[r],s[r+1],a);else for(r=e-n;r>=t;r-=n)a=lc(r,s[r],s[r+1],a);return a&&Dr(a,a.next)&&(Ls(a),a=a.next),a}function hi(s,t){if(!s)return s;t||(t=s);let e=s,n;do if(n=!1,!e.steiner&&(Dr(e,e.next)||ce(e.prev,e,e.next)===0)){if(Ls(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Rs(s,t,e,n,i,r,a){if(!s)return;!a&&r&&Eg(s,n,i,r);let o=s,l,c;for(;s.prev!==s.next;){if(l=s.prev,c=s.next,r?xg(s,n,i,r):vg(s)){t.push(l.i/e|0),t.push(s.i/e|0),t.push(c.i/e|0),Ls(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=_g(hi(s),t,e),Rs(s,t,e,n,i,r,2)):a===2&&Mg(s,t,e,n,i,r):Rs(hi(s),t,e,n,i,r,1);break}}}function vg(s){const t=s.prev,e=s,n=s.next;if(ce(t,e,n)>=0)return!1;const i=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=i<r?i<a?i:a:r<a?r:a,u=o<l?o<c?o:c:l<c?l:c,p=i>r?i>a?i:a:r>a?r:a,d=o>l?o>c?o:c:l>c?l:c;let g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=p&&g.y>=u&&g.y<=d&&Oi(i,o,r,l,a,c,g.x,g.y)&&ce(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function xg(s,t,e,n){const i=s.prev,r=s,a=s.next;if(ce(i,r,a)>=0)return!1;const o=i.x,l=r.x,c=a.x,h=i.y,u=r.y,p=a.y,d=o<l?o<c?o:c:l<c?l:c,g=h<u?h<p?h:p:u<p?u:p,v=o>l?o>c?o:c:l>c?l:c,m=h>u?h>p?h:p:u>p?u:p,f=mo(d,g,t,e,n),_=mo(v,m,t,e,n);let M=s.prevZ,x=s.nextZ;for(;M&&M.z>=f&&x&&x.z<=_;){if(M.x>=d&&M.x<=v&&M.y>=g&&M.y<=m&&M!==i&&M!==a&&Oi(o,h,l,u,c,p,M.x,M.y)&&ce(M.prev,M,M.next)>=0||(M=M.prevZ,x.x>=d&&x.x<=v&&x.y>=g&&x.y<=m&&x!==i&&x!==a&&Oi(o,h,l,u,c,p,x.x,x.y)&&ce(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;M&&M.z>=f;){if(M.x>=d&&M.x<=v&&M.y>=g&&M.y<=m&&M!==i&&M!==a&&Oi(o,h,l,u,c,p,M.x,M.y)&&ce(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;x&&x.z<=_;){if(x.x>=d&&x.x<=v&&x.y>=g&&x.y<=m&&x!==i&&x!==a&&Oi(o,h,l,u,c,p,x.x,x.y)&&ce(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function _g(s,t,e){let n=s;do{const i=n.prev,r=n.next.next;!Dr(i,r)&&Lh(i,n,n.next,r)&&Ps(i,r)&&Ps(r,i)&&(t.push(i.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Ls(n),Ls(n.next),n=s=r),n=n.next}while(n!==s);return hi(n)}function Mg(s,t,e,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Rg(a,o)){let l=Dh(a,o);a=hi(a,a.next),l=hi(l,l.next),Rs(a,t,e,n,i,r,0),Rs(l,t,e,n,i,r,0);return}o=o.next}a=a.next}while(a!==s)}function yg(s,t,e,n){const i=[];let r,a,o,l,c;for(r=0,a=t.length;r<a;r++)o=t[r]*n,l=r<a-1?t[r+1]*n:s.length,c=Ph(s,o,l,n,!1),c===c.next&&(c.steiner=!0),i.push(Cg(c));for(i.sort(Sg),r=0;r<i.length;r++)e=wg(i[r],e);return e}function Sg(s,t){return s.x-t.x}function wg(s,t){const e=bg(s,t);if(!e)return t;const n=Dh(e,s);return hi(n,n.next),hi(e,e.next)}function bg(s,t){let e=t,n=-1/0,i;const r=s.x,a=s.y;do{if(a<=e.y&&a>=e.next.y&&e.next.y!==e.y){const p=e.x+(a-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(p<=r&&p>n&&(n=p,i=e.x<e.next.x?e:e.next,p===r))return i}e=e.next}while(e!==t);if(!i)return null;const o=i,l=i.x,c=i.y;let h=1/0,u;e=i;do r>=e.x&&e.x>=l&&r!==e.x&&Oi(a<c?r:n,a,l,c,a<c?n:r,a,e.x,e.y)&&(u=Math.abs(a-e.y)/(r-e.x),Ps(e,s)&&(u<h||u===h&&(e.x>i.x||e.x===i.x&&Tg(i,e)))&&(i=e,h=u)),e=e.next;while(e!==o);return i}function Tg(s,t){return ce(s.prev,s,t.prev)<0&&ce(t.next,s,s.next)<0}function Eg(s,t,e,n){let i=s;do i.z===0&&(i.z=mo(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,Ag(i)}function Ag(s){let t,e,n,i,r,a,o,l,c=1;do{for(e=s,s=null,r=null,a=0;e;){for(a++,n=e,o=0,t=0;t<c&&(o++,n=n.nextZ,!!n);t++);for(l=c;o>0||l>0&&n;)o!==0&&(l===0||!n||e.z<=n.z)?(i=e,e=e.nextZ,o--):(i=n,n=n.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;e=n}r.nextZ=null,c*=2}while(a>1);return s}function mo(s,t,e,n,i){return s=(s-e)*i|0,t=(t-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function Cg(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function Oi(s,t,e,n,i,r,a,o){return(i-a)*(t-o)>=(s-a)*(r-o)&&(s-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(i-a)*(n-o)}function Rg(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!Pg(s,t)&&(Ps(s,t)&&Ps(t,s)&&Lg(s,t)&&(ce(s.prev,s,t.prev)||ce(s,t.prev,t))||Dr(s,t)&&ce(s.prev,s,s.next)>0&&ce(t.prev,t,t.next)>0)}function ce(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function Dr(s,t){return s.x===t.x&&s.y===t.y}function Lh(s,t,e,n){const i=dr(ce(s,t,e)),r=dr(ce(s,t,n)),a=dr(ce(e,n,s)),o=dr(ce(e,n,t));return!!(i!==r&&a!==o||i===0&&ur(s,e,t)||r===0&&ur(s,n,t)||a===0&&ur(e,s,n)||o===0&&ur(e,t,n))}function ur(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function dr(s){return s>0?1:s<0?-1:0}function Pg(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&Lh(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function Ps(s,t){return ce(s.prev,s,s.next)<0?ce(s,t,s.next)>=0&&ce(s,s.prev,t)>=0:ce(s,t,s.prev)<0||ce(s,s.next,t)<0}function Lg(s,t){let e=s,n=!1;const i=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&i<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==s);return n}function Dh(s,t){const e=new go(s.i,s.x,s.y),n=new go(t.i,t.x,t.y),i=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=i,i.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function lc(s,t,e,n){const i=new go(s,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Ls(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function go(s,t,e){this.i=s,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Dg(s,t,e,n){let i=0;for(let r=t,a=e-n;r<e;r+=n)i+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return i}class ws{static area(t){const e=t.length;let n=0;for(let i=e-1,r=0;r<e;i=r++)n+=t[i].x*t[r].y-t[r].x*t[i].y;return n*.5}static isClockWise(t){return ws.area(t)<0}static triangulateShape(t,e){const n=[],i=[],r=[];cc(t),hc(n,t);let a=t.length;e.forEach(cc);for(let l=0;l<e.length;l++)i.push(a),a+=e[l].length,hc(n,e[l]);const o=gg.triangulate(n,i);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function cc(s){const t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function hc(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}class Go extends Ho{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Go(t.radius,t.detail)}}class Yi extends ge{constructor(t=.5,e=1,n=32,i=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);const o=[],l=[],c=[],h=[];let u=t;const p=(e-t)/i,d=new A,g=new it;for(let v=0;v<=i;v++){for(let m=0;m<=n;m++){const f=r+m/n*a;d.x=u*Math.cos(f),d.y=u*Math.sin(f),l.push(d.x,d.y,d.z),c.push(0,0,1),g.x=(d.x/e+1)/2,g.y=(d.y/e+1)/2,h.push(g.x,g.y)}u+=p}for(let v=0;v<i;v++){const m=v*(n+1);for(let f=0;f<n;f++){const _=f+m,M=_,x=_+n+1,P=_+n+2,T=_+1;o.push(M,x,T),o.push(x,P,T)}}this.setIndex(o),this.setAttribute("position",new Qt(l,3)),this.setAttribute("normal",new Qt(c,3)),this.setAttribute("uv",new Qt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Yi(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Vo extends ge{constructor(t=new Rh([new it(0,.5),new it(-.5,-.5),new it(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};const n=[],i=[],r=[],a=[];let o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(o,l,h),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new Qt(i,3)),this.setAttribute("normal",new Qt(r,3)),this.setAttribute("uv",new Qt(a,2));function c(h){const u=i.length/3,p=h.extractPoints(e);let d=p.shape;const g=p.holes;ws.isClockWise(d)===!1&&(d=d.reverse());for(let m=0,f=g.length;m<f;m++){const _=g[m];ws.isClockWise(_)===!0&&(g[m]=_.reverse())}const v=ws.triangulateShape(d,g);for(let m=0,f=g.length;m<f;m++){const _=g[m];d=d.concat(_)}for(let m=0,f=d.length;m<f;m++){const _=d[m];i.push(_.x,_.y,0),r.push(0,0,1),a.push(_.x,_.y)}for(let m=0,f=v.length;m<f;m++){const _=v[m],M=_[0]+u,x=_[1]+u,P=_[2]+u;n.push(M,x,P),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes;return Ig(e,t)}static fromJSON(t,e){const n=[];for(let i=0,r=t.shapes.length;i<r;i++){const a=e[t.shapes[i]];n.push(a)}return new Vo(n,t.curveSegments)}}function Ig(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,n=s.length;e<n;e++){const i=s[e];t.shapes.push(i.uuid)}else t.shapes.push(s.uuid);return t}class Is extends ge{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new A,p=new A,d=[],g=[],v=[],m=[];for(let f=0;f<=n;f++){const _=[],M=f/n;let x=0;f===0&&a===0?x=.5/e:f===n&&l===Math.PI&&(x=-.5/e);for(let P=0;P<=e;P++){const T=P/e;u.x=-t*Math.cos(i+T*r)*Math.sin(a+M*o),u.y=t*Math.cos(a+M*o),u.z=t*Math.sin(i+T*r)*Math.sin(a+M*o),g.push(u.x,u.y,u.z),p.copy(u).normalize(),v.push(p.x,p.y,p.z),m.push(T+x,1-M),_.push(c++)}h.push(_)}for(let f=0;f<n;f++)for(let _=0;_<e;_++){const M=h[f][_+1],x=h[f][_],P=h[f+1][_],T=h[f+1][_+1];(f!==0||a>0)&&d.push(M,x,T),(f!==n-1||l<Math.PI)&&d.push(x,P,T)}this.setIndex(d),this.setAttribute("position",new Qt(g,3)),this.setAttribute("normal",new Qt(v,3)),this.setAttribute("uv",new Qt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Is(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Wo extends ge{constructor(t=new Ah(new A(-1,-1,0),new A(-1,1,0),new A(1,1,0)),e=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:i,closed:r};const a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new A,l=new A,c=new it;let h=new A;const u=[],p=[],d=[],g=[];v(),this.setIndex(g),this.setAttribute("position",new Qt(u,3)),this.setAttribute("normal",new Qt(p,3)),this.setAttribute("uv",new Qt(d,2));function v(){for(let M=0;M<e;M++)m(M);m(r===!1?e:0),_(),f()}function m(M){h=t.getPointAt(M/e,h);const x=a.normals[M],P=a.binormals[M];for(let T=0;T<=i;T++){const E=T/i*Math.PI*2,R=Math.sin(E),S=-Math.cos(E);l.x=S*x.x+R*P.x,l.y=S*x.y+R*P.y,l.z=S*x.z+R*P.z,l.normalize(),p.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,u.push(o.x,o.y,o.z)}}function f(){for(let M=1;M<=e;M++)for(let x=1;x<=i;x++){const P=(i+1)*(M-1)+(x-1),T=(i+1)*M+(x-1),E=(i+1)*M+x,R=(i+1)*(M-1)+x;g.push(P,T,R),g.push(T,E,R)}}function _(){for(let M=0;M<=e;M++)for(let x=0;x<=i;x++)c.x=M/e,c.y=x/i,d.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new Wo(new po[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}}class Ug extends pe{static get type(){return"RawShaderMaterial"}constructor(t){super(t),this.isRawShaderMaterial=!0}}class fe extends qn{static get type(){return"MeshStandardMaterial"}constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new mt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new mt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Po,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Ng extends fe{static get type(){return"MeshPhysicalMaterial"}constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new it(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Se(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new mt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new mt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new mt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class Fg extends qn{static get type(){return"MeshLambertMaterial"}constructor(t){super(),this.isMeshLambertMaterial=!0,this.color=new mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new mt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Po,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.combine=yo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}const uc={enabled:!1,files:{},add:function(s,t){this.enabled!==!1&&(this.files[s]=t)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class Og{constructor(t,e,n){const i=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,p=c.length;u<p;u+=2){const d=c[u],g=c[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return g}return null}}}const zg=new Og;class Xo{constructor(t){this.manager=t!==void 0?t:zg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){const n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}Xo.DEFAULT_MATERIAL_NAME="__DEFAULT";class Bg extends Xo{constructor(t){super(t)}load(t,e,n,i){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const r=this,a=uc.get(t);if(a!==void 0)return r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0),a;const o=Cs("img");function l(){h(),uc.add(t,this),e&&e(this),r.manager.itemEnd(t)}function c(u){h(),i&&i(u),r.manager.itemError(t),r.manager.itemEnd(t)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),r.manager.itemStart(t),o.src=t,o}}class Zi extends Xo{constructor(t){super(t)}load(t,e,n,i){const r=new be,a=new Bg(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){r.image=o,r.needsUpdate=!0,e!==void 0&&e(r)},n,i),r}}class Ih extends xe{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new mt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class kg extends Ih{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(xe.DEFAULT_UP),this.updateMatrix(),this.groundColor=new mt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const fa=new Wt,dc=new A,fc=new A;class Hg{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new it(512,512),this.map=null,this.mapPass=null,this.matrix=new Wt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Uo,this._frameExtents=new it(1,1),this._viewportCount=1,this._viewports=[new le(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;dc.setFromMatrixPosition(t.matrixWorld),e.position.copy(dc),fc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(fc),e.updateMatrixWorld(),fa.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(fa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(fa)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Gg extends Hg{constructor(){super(new No(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Vg extends Ih{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(xe.DEFAULT_UP),this.updateMatrix(),this.target=new xe,this.shadow=new Gg}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class Wg{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=pc(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=pc();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function pc(){return performance.now()}const mc=new Wt;class Xg{constructor(t,e,n=0,i=1/0){this.ray=new Do(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new Io,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return mc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(mc),this}intersectObject(t,e=!0,n=[]){return vo(t,this,n,e),n.sort(gc),n}intersectObjects(t,e=!0,n=[]){for(let i=0,r=t.length;i<r;i++)vo(t[i],this,n,e);return n.sort(gc),n}}function gc(s,t){return s.distance-t.distance}function vo(s,t,e,n){let i=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let a=0,o=r.length;a<o;a++)vo(r[a],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Mo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Mo);class Ds extends Ft{constructor(){const t=Ds.SkyShader,e=new pe({name:t.name,uniforms:cn.clone(t.uniforms),vertexShader:t.vertexShader,fragmentShader:t.fragmentShader,side:Le,depthWrite:!1});super(new Re(1,1,1),e),this.isSky=!0}}Ds.SkyShader={name:"SkyShader",uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new A},up:{value:new A(0,1,0)}},vertexShader:`
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

		}`};function Uh(s,t=!1){const e=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,l=new ge;let c=0;for(let h=0;h<s.length;++h){const u=s[h];let p=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in u.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(u.attributes[d]),p++}if(p!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in u.morphAttributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[d]===void 0&&(a[d]=[]),a[d].push(u.morphAttributes[d])}if(t){let d;if(e)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,h),c+=d}}if(e){let h=0;const u=[];for(let p=0;p<s.length;++p){const d=s[p].index;for(let g=0;g<d.count;++g)u.push(d.getX(g)+h);h+=s[p].attributes.position.count}l.setIndex(u)}for(const h in r){const u=vc(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in a){const u=a[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let p=0;p<u;++p){const d=[];for(let v=0;v<a[h].length;++v)d.push(a[h][v][p]);const g=vc(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function vc(s){let t,e,n,i=-1,r=0;for(let c=0;c<s.length;++c){const h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}const a=new t(r),o=new me(a,e,n);let l=0;for(let c=0;c<s.length;++c){const h=s[c];if(h.isInterleavedBufferAttribute){const u=l/e;for(let p=0,d=h.count;p<d;p++)for(let g=0;g<e;g++){const v=h.getComponent(p,g);o.setComponent(p+u,g,v)}}else a.set(h.array,l);l+=h.count*e}return i!==void 0&&(o.gpuType=i),o}function Us(s){let t=s>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function pa(...s){let t=2166136261;for(const e of s){const n=String(e);for(let i=0;i<n.length;i++)t^=n.charCodeAt(i),t=Math.imul(t,16777619)}return t>>>0}class di{constructor(t){this.perm=new Uint8Array(512),this.gx=new Float32Array(256),this.gy=new Float32Array(256);const e=Us(t),n=new Uint8Array(256);for(let i=0;i<256;i++)n[i]=i;for(let i=255;i>0;i--){const r=Math.floor(e()*(i+1)),a=n[i];n[i]=n[r],n[r]=a}for(let i=0;i<512;i++)this.perm[i]=n[i&255];for(let i=0;i<256;i++){const r=e()*Math.PI*2;this.gx[i]=Math.cos(r),this.gy[i]=Math.sin(r)}}noise(t,e){const n=Math.floor(t),i=Math.floor(e),r=t-n,a=e-i,o=n&255,l=i&255,c=this.perm,h=(M,x,P)=>this.gx[M]*x+this.gy[M]*P,u=h(c[o+c[l]],r,a),p=h(c[o+1+c[l]],r-1,a),d=h(c[o+c[l+1]],r,a-1),g=h(c[o+1+c[l+1]],r-1,a-1),v=r*r*r*(r*(r*6-15)+10),m=a*a*a*(a*(a*6-15)+10),f=u+v*(p-u),_=d+v*(g-d);return(f+m*(_-f))*1.414}fbm(t,e,n=4){let i=0,r=.5,a=1,o=0;for(let l=0;l<n;l++)i+=r*this.noise(t*a,e*a),o+=r,r*=.5,a*=2.03;return i/o}}const Ii=(s,t,e)=>{const n=Math.min(1,Math.max(0,(e-s)/(t-s)));return n*n*(3-2*n)},we=(s,t,e)=>s+(t-s)*e,Wn=(s,t,e)=>Math.min(e,Math.max(t,s)),xc={tee:"Tee",fairway:"Fairway",firstCut:"First Cut",rough:"Rough",fringe:"Fringe",green:"Green",bunker:"Bunker",water:"Water",ob:"Out of Bounds"};function qe(s,t,e){const n=Math.cos(s.rot??0),i=Math.sin(s.rot??0),r=t-s.x,a=e-s.z,o=r*n+a*i,l=-r*i+a*n;return Math.sqrt(o/s.rx*(o/s.rx)+l/s.rz*(l/s.rz))}const ma=-1.2;class $g{constructor(t){this.samples=[],this.gridRes=1.25,this.waterLevel=ma,this.trees=[],this.greenBase=0,this.treeGrid=new Map,this.def=t,this.noise=new di(t.seed),this.buildPath(),this.length=this.samples[this.samples.length-1].s;let e=1/0,n=-1/0,i=1/0,r=-1/0;for(const p of this.samples)e=Math.min(e,p.x),n=Math.max(n,p.x),i=Math.min(i,p.z),r=Math.max(r,p.z);const a=t.green;e=Math.min(e,a.x-a.rx-10),n=Math.max(n,a.x+a.rx+10),i=Math.min(i,a.z-a.rz-10);for(const p of t.water)e=Math.min(e,p.x-p.rx),n=Math.max(n,p.x+p.rx);this.play={minX:e-55,maxX:n+55,minZ:i-45,maxZ:r+35};const o=120;this.minX=Math.floor(e-o),this.maxX=Math.ceil(n+o),this.minZ=Math.floor(i-o),this.maxZ=Math.ceil(r+80),this.greenBase=this.rawBase(a.x,a.z)+.5,this.gw=Math.ceil((this.maxX-this.minX)/this.gridRes)+1,this.gh=Math.ceil((this.maxZ-this.minZ)/this.gridRes)+1;const l=this.gw*this.gh;this.heights=new Float32Array(l),this.pD=new Float32Array(l),this.pS=new Float32Array(l),this.pW=new Float32Array(l);for(let p=0;p<this.gh;p++){const d=this.minZ+p*this.gridRes;for(let g=0;g<this.gw;g++){const v=this.minX+g*this.gridRes,m=p*this.gw+g,f=this.pathInfo(v,d);this.pD[m]=f.d,this.pS[m]=f.s,this.pW[m]=f.w,this.heights[m]=this.exactHeight(v,d,f)}}const c=this.samples[0],h=this.samples[Math.min(6,this.samples.length-1)],u=Math.hypot(h.x-c.x,h.z-c.z)||1;this.tee={x:0,z:0,y:this.height(0,0),dirX:(h.x-c.x)/u,dirZ:(h.z-c.z)/u},this.pin={x:t.pin[0],z:t.pin[1],y:this.height(t.pin[0],t.pin[1])},this.placeTrees()}buildPath(){const t=this.def.path,e=this.def.widths;let n=0,i=null;for(let a=0;a<t.length-1;a++){const o=t[Math.max(0,a-1)],l=t[a],c=t[a+1],h=t[Math.min(t.length-1,a+2)],u=Math.hypot(c[0]-l[0],c[1]-l[1]),p=Math.max(2,Math.ceil(u/2));for(let d=0;d<p;d++){if(a>0&&d===0)continue;const g=d/p,v=g*g,m=v*g,f=(P,T,E,R)=>.5*(2*T+(-P+E)*g+(2*P-5*T+4*E-R)*v+(-P+3*T-3*E+R)*m),_=f(o[0],l[0],c[0],h[0]),M=f(o[1],l[1],c[1],h[1]);i&&(n+=Math.hypot(_-i[0],M-i[1])),i=[_,M];const x=we(e[a],e[a+1],g);this.samples.push({x:_,z:M,s:n,w:x})}}const r=t[t.length-1];i&&(n+=Math.hypot(r[0]-i[0],r[1]-i[1])),this.samples.push({x:r[0],z:r[1],s:n,w:e[e.length-1]})}pathInfo(t,e){let n=1/0,i=0,r=0;const a=this.samples;for(let o=0;o<a.length-1;o++){const l=a[o],c=a[o+1],h=c.x-l.x,u=c.z-l.z,p=h*h+u*u||1e-6;let d=((t-l.x)*h+(e-l.z)*u)/p;d=d<0?0:d>1?1:d;const g=l.x+h*d,v=l.z+u*d,m=(t-g)*(t-g)+(e-v)*(e-v);m<n&&(n=m,i=l.s+(c.s-l.s)*d,r=l.w+(c.w-l.w)*d)}return{d:Math.sqrt(n),s:i,w:r}}fastPath(t,e){const n=(t-this.minX)/this.gridRes,i=(e-this.minZ)/this.gridRes,r=Math.floor(n),a=Math.floor(i);if(!this.pD||r<0||a<0||r>=this.gw-1||a>=this.gh-1)return this.pathInfo(t,e);const o=n-r,l=i-a,c=this.gw,h=a*c+r,u=p=>(p[h]*(1-o)+p[h+1]*o)*(1-l)+(p[h+c]*(1-o)+p[h+c+1]*o)*l;return{d:u(this.pD),s:u(this.pS),w:u(this.pW)}}edgeWobble(t,e,n=.09){return this.noise.noise(t*.11+40,e*.11-17)*n}rawBase(t,e){const n=this.noise;return n.fbm(t*.006,e*.006,3)*7+n.fbm(t*.025+9,e*.025,3)*1.4}exactHeight(t,e,n){const i=this.def,r=n??this.pathInfo(t,e),a=Math.max(r.w,26)/2,o=this.rawBase(t,e),l=Ii(a+8,a+70,r.d);let c=o*we(.35,1,l)+l*(6+this.noise.fbm(t*.012,e*.012,3)*9);c+=Math.sin(r.s*.012+i.seed)*1.5;const h=Math.hypot(t,e);if(h<18){const d=this.rawBase(0,0)*.35+Math.sin(i.seed)*1.5+i.teeLift;c=we(d,c,Ii(6,18,h))}for(const d of i.water){const g=qe(d,t,e)+this.edgeWobble(t,e,.06);if(g<1.35){const v=ma-1.6;c=we(v,Math.min(c,ma+1.2+(g-1)*6),Ii(.75,1.35,g))}}const u=i.green,p=qe(u,t,e)+this.edgeWobble(t,e,.05);if(p<(i.greenBlend??1.9)){const d=this.greenBase+u.slope[0]*(t-u.x)+u.slope[1]*(e-u.z);c=we(d,c,Ii(1,i.greenBlend??1.9,p))}for(const d of i.bunkers){const g=qe(d,t,e)+this.edgeWobble(t,e);if(g<1.25){const v=.75*(1-Ii(.2,1,g)),m=.18*(1-Math.abs(g-1.08)/.17)*(g>.91?1:0);c+=-v+Math.max(0,m)}}return c}height(t,e){const n=(t-this.minX)/this.gridRes,i=(e-this.minZ)/this.gridRes,r=Math.floor(n),a=Math.floor(i);if(r<0||a<0||r>=this.gw-1||a>=this.gh-1)return this.exactHeight(t,e);const o=n-r,l=i-a,c=this.heights,h=this.gw,u=c[a*h+r],p=c[a*h+r+1],d=c[(a+1)*h+r],g=c[(a+1)*h+r+1];return(u*(1-o)+p*o)*(1-l)+(d*(1-o)+g*o)*l}normal(t,e,n){const r=this.height(t+.35,e)-this.height(t-.35,e),a=this.height(t,e+.35)-this.height(t,e-.35),o=-r,l=2*.35,c=-a,h=Math.hypot(o,l,c);return n.x=o/h,n.y=l/h,n.z=c/h,n}inBounds(t,e){const n=this.play;return t>n.minX&&t<n.maxX&&e>n.minZ&&e<n.maxZ}surfaceAt(t,e){const n=this.def;if(!this.inBounds(t,e))return"ob";const i=qe(n.green,t,e);if(i<1.6){const o=i+this.edgeWobble(t,e,.05);if(o<1)return"green";if(o<1+2.2/Math.min(n.green.rx,n.green.rz))return"fringe"}for(const o of n.bunkers){const l=qe(o,t,e);if(l<1.1&&l+this.edgeWobble(t,e)<.92)return"bunker"}for(const o of n.water){const l=qe(o,t,e);if(l<1.2&&l+this.edgeWobble(t,e,.06)<1&&this.height(t,e)<this.waterLevel+.05)return"water"}if(this.inTeeBox(t,e))return"tee";const r=this.fastPath(t,e);if(r.w<=0||r.d>r.w/2+8)return"rough";const a=this.noise.noise(t*.05,e*.05)*2.2;return r.s>n.fairwayStart&&r.d<r.w/2+a?"fairway":r.s>n.fairwayStart-6&&r.d<r.w/2+3.2+a?"firstCut":"rough"}inTeeBox(t,e){return Math.abs(t)<4&&e<4&&e>-8}pointAt(t){const e=this.samples;if(t<=0)return{x:e[0].x,z:e[0].z};for(let i=0;i<e.length-1;i++)if(e[i+1].s>=t){const r=(t-e[i].s)/(e[i+1].s-e[i].s||1);return{x:we(e[i].x,e[i+1].x,r),z:we(e[i].z,e[i+1].z,r)}}const n=e[e.length-1];return{x:n.x,z:n.z}}placeTrees(){const t=Us(this.def.seed*7919+3),e=2200;for(let n=0;n<e;n++){const i=we(this.minX+10,this.maxX-10,t()),r=we(this.minZ+10,this.maxZ-10,t()),a=this.fastPath(i,r),l=Math.max(a.w,24)/2+12;if(a.d<l||Math.hypot(i,r)<26)continue;const c=this.def.green;if(qe(c,i,r)<2.4)continue;let h=!1;for(const T of this.def.water)qe(T,i,r)<1.25&&(h=!0);for(const T of this.def.bunkers)qe(T,i,r)<1.6&&(h=!0);if(h)continue;const u=this.noise.noise(i*.035+100,r*.035)*.5+.5,d=.12+Ii(l,l+45,a.d)*.55+u*.35-.2;if(t()>d)continue;let g=!1;const v=this.cellKey(i,r);for(const T of this.treeGrid.get(v)??[])Math.hypot(T.x-i,T.z-r)<5.5&&(g=!0);if(g)continue;const m=t()<.55?0:1,f=m===0?we(11,22,t()):we(9,16,t()),_=m===0?f*.24:f*.36,M=this.height(i,r),x={x:i,z:r,y:M,height:f,canopyR:_,canopyY:M+(m===0?f*.5:f*.62),trunkR:m===0?.35:.45,kind:m,tint:t()};this.trees.push(x);const P=this.treeGrid.get(v);P?P.push(x):this.treeGrid.set(v,[x])}}cellKey(t,e){return`${Math.floor(t/20)},${Math.floor(e/20)}`}treesNear(t,e){const n=Math.floor(t/20),i=Math.floor(e/20),r=[];for(let a=-1;a<=1;a++)for(let o=-1;o<=1;o++){const l=this.treeGrid.get(`${n+a},${i+o}`);l&&r.push(...l)}return r}distToPin(t,e){return Math.hypot(this.pin.x-t,this.pin.z-e)}static clamp01(t){return Wn(t,0,1)}}const qg=44,Yg=28,zi=new A().setFromSphericalCoords(1,ll.degToRad(90-qg),ll.degToRad(Yg)),Be=s=>{const t=new mt(s);return[t.r*255,t.g*255,t.b*255]},ke={rough:Be("#5b8a3c"),roughDark:Be("#4a7733"),firstCut:Be("#66994a"),fairway:Be("#79ad4f"),fairwayAlt:Be("#6c9f45"),fringe:Be("#7fb556"),green:Be("#86bf58"),greenAlt:Be("#80b953"),tee:Be("#78ad50"),sand:Be("#e8d7a8"),sandDark:Be("#cdb67e"),shore:Be("#5b6a3c"),bed:Be("#2d4532")};function Zg(s,t=2048){const e=s.maxX-s.minX,n=s.maxZ-s.minZ,i=t/Math.max(e,n),r=Math.round(e*i),a=Math.round(n*i),o=document.createElement("canvas");o.width=r,o.height=a;const l=o.getContext("2d"),c=l.createImageData(r,a),h=c.data,u=document.createElement("canvas");u.width=r,u.height=a;const p=u.getContext("2d"),d=p.createImageData(r,a),g=d.data,v=new di(s.def.seed+999),m=s.def,f=Math.cos(m.green.rot??0),_=Math.sin(m.green.rot??0),M=9;for(let R=0;R<a;R++){const S=s.minZ+(R+.5)/i;for(let y=0;y<r;y++){const L=s.minX+(y+.5)/i,D=s.surfaceAt(L,S),N=v.noise(L*.02,S*.02),H=v.noise(L*.9,S*.9);let B,G=1+N*.07+H*.035;switch(D){case"fairway":case"tee":{const z=s.fastPath(L,S),V=Math.floor(z.s/M)%2===0;B=D==="tee"?ke.tee:V?ke.fairway:ke.fairwayAlt;const Q=z.w>0?Math.min(1,Math.max(0,(z.d-z.w/2+3)/3)):0;G*=1-Q*.08;break}case"firstCut":B=ke.firstCut;break;case"green":{const z=L-m.green.x,V=S-m.green.z,Q=z*f+V*_,st=-z*_+V*f;B=(Math.floor(Q/3.2)+Math.floor(st/3.2))%2===0?ke.green:ke.greenAlt,G=1+H*.015+N*.03;break}case"fringe":B=ke.fringe;break;case"bunker":{let z=9;for(const Q of m.bunkers)z=Math.min(z,qe(Q,L,S));const V=Math.min(1,Math.max(0,(z-.62)/.3));B=ga(ke.sand,ke.sandDark,V*.8),G=1+H*.06+v.noise(L*3,S*3)*.04;break}case"water":{let z=9;for(const V of m.water)z=Math.min(z,qe(V,L,S));B=ga(ke.bed,ke.shore,Math.min(1,Math.max(0,(z-.8)/.2)));break}default:{const z=s.fastPath(L,S),V=Math.min(1,Math.max(0,(z.d-z.w/2-20)/50));B=ga(ke.rough,ke.roughDark,V*.7+(N*.5+.5)*.3),G=1+N*.1+H*.06}}const Y=(R*r+y)*4;g[Y]=D==="fairway"||D==="tee"||D==="fringe"?255:D==="firstCut"?120:0,g[Y+1]=D==="green"?255:D==="fringe"?90:0,g[Y+2]=D==="bunker"?255:0,g[Y+3]=255,h[Y]=Math.min(255,B[0]*G),h[Y+1]=Math.min(255,B[1]*G),h[Y+2]=Math.min(255,B[2]*G),h[Y+3]=255}}l.putImageData(c,0,0),p.putImageData(d,0,0);{const R=s.def.seed%2?1:-1,S=s.samples,y=[];for(let L=4;L<S.length-6;L+=2){const D=S[L],N=S[Math.min(S.length-1,L+2)],H=N.x-D.x,B=N.z-D.z,G=Math.hypot(H,B)||1,Y=Math.max(D.w,24)/2+15+Math.sin(D.s*.02)*3,z=D.x+-B/G*Y*R,V=D.z+H/G*Y*R,Q=s.surfaceAt(z,V);if(Q==="water"||Q==="bunker"||Q==="green"){y.push([NaN,NaN]);continue}y.push([(z-s.minX)*i,(V-s.minZ)*i])}l.save(),l.lineCap="round",l.lineJoin="round";for(const[L,D]of[[3.2,"rgba(70,70,55,0.55)"],[2.6,"#cbc3ad"]]){l.strokeStyle=D,l.lineWidth=L*i,l.beginPath();let N=!1;for(const[H,B]of y){if(Number.isNaN(H)){N=!1;continue}N?l.lineTo(H,B):(l.moveTo(H,B),N=!0)}l.stroke()}l.restore()}const x=-zi.x/zi.y,P=-zi.z/zi.y;l.save();for(const R of s.trees){const S=R.canopyY-R.y,y=(R.x+x*S*.85-s.minX)*i,L=(R.z+P*S*.85-s.minZ)*i,D=R.canopyR*i*1.15;l.setTransform(1,0,0,1,y,L),l.rotate(Math.atan2(P,x)),l.scale(1.35,.9);const N=l.createRadialGradient(0,0,0,0,0,D);N.addColorStop(0,"rgba(10,25,5,0.42)"),N.addColorStop(.6,"rgba(10,25,5,0.28)"),N.addColorStop(1,"rgba(10,25,5,0)"),l.fillStyle=N,l.beginPath(),l.arc(0,0,D,0,Math.PI*2),l.fill(),l.setTransform(1,0,0,1,(R.x-s.minX)*i,(R.z-s.minZ)*i);const H=l.createRadialGradient(0,0,0,0,0,i*1.6);H.addColorStop(0,"rgba(5,15,0,0.5)"),H.addColorStop(1,"rgba(5,15,0,0)"),l.fillStyle=H,l.beginPath(),l.arc(0,0,i*1.6,0,Math.PI*2),l.fill()}l.restore();const T=new je(o);T.colorSpace=re,T.anisotropy=8,T.wrapS=T.wrapT=Tn,T.generateMipmaps=!0,T.minFilter=En;const E=new je(u);return E.wrapS=E.wrapT=Tn,{map:T,mask:E}}function ga(s,t,e){return[s[0]+(t[0]-s[0])*e,s[1]+(t[1]-s[1])*e,s[2]+(t[2]-s[2])*e]}function Kg(){const t=document.createElement("canvas");t.width=t.height=256;const e=t.getContext("2d"),n=e.createImageData(256,256),i=new di(7);for(let a=0;a<256;a++)for(let o=0;o<256;o++){const l=o/256*Math.PI*2,c=a/256*Math.PI*2,u=128+(i.noise(Math.cos(l)*6+20,Math.sin(l)*6+Math.cos(c)*6)*.5+i.noise(Math.cos(l)*24+5,Math.sin(c)*24+Math.sin(l)*3)*.35+(Math.random()-.5)*.25)*90,p=(a*256+o)*4;n.data[p]=n.data[p+1]=n.data[p+2]=Math.max(0,Math.min(255,u)),n.data[p+3]=255}e.putImageData(n,0,0);const r=new je(t);return r.wrapS=r.wrapT=on,r.anisotropy=8,r}function jg(){const t=document.createElement("canvas");t.width=t.height=256;const e=t.getContext("2d"),n=e.createImageData(256,256),i=new di(42),r=(o,l)=>{const c=o/256*Math.PI*2,h=l/256*Math.PI*2;return i.noise(Math.cos(c)*3+Math.cos(h)*2,Math.sin(c)*3+Math.sin(h)*2)+.5*i.noise(Math.cos(c)*7+9,Math.sin(h)*7+Math.sin(c))};for(let o=0;o<256;o++)for(let l=0;l<256;l++){const c=r(l+1,o)-r(l-1,o),h=r(l,o+1)-r(l,o-1),u=new A(-c*6,-h*6,1).normalize(),p=(o*256+l)*4;n.data[p]=(u.x*.5+.5)*255,n.data[p+1]=(u.y*.5+.5)*255,n.data[p+2]=(u.z*.5+.5)*255,n.data[p+3]=255}e.putImageData(n,0,0);const a=new je(t);return a.wrapS=a.wrapT=on,a}function Jg(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d");e.fillStyle="rgb(128,128,255)",e.fillRect(0,0,128,128);const n=12;for(let r=0;r<128+n;r+=n)for(let a=r/n%2?n/2:0;a<128+n;a+=n){const o=e.createRadialGradient(a,r,0,a,r,n*.45);o.addColorStop(0,"rgb(128,128,235)"),o.addColorStop(.7,"rgb(150,150,245)"),o.addColorStop(1,"rgb(128,128,255)"),e.fillStyle=o,e.beginPath(),e.arc(a,r,n*.45,0,Math.PI*2),e.fill()}const i=new je(t);return i.wrapS=i.wrapT=on,i.repeat.set(3,2),i}function Qg(){const t=document.createElement("canvas");t.width=t.height=64;const e=t.getContext("2d"),n=e.createRadialGradient(64/2,64/2,0,64/2,64/2,64/2);return n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.4,"rgba(255,255,255,0.6)"),n.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=n,e.fillRect(0,0,64,64),new je(t)}function tv(){const s=document.createElement("canvas");s.width=64,s.height=256;const t=s.getContext("2d");t.fillStyle="#5a4330",t.fillRect(0,0,64,256);for(let n=0;n<60;n++){t.strokeStyle=`rgba(30,20,10,${.2+Math.random()*.4})`,t.lineWidth=1+Math.random()*2;const i=Math.random()*64;t.beginPath(),t.moveTo(i,0),t.bezierCurveTo(i+4,80,i-4,160,i+2,256),t.stroke()}const e=new je(s);return e.colorSpace=re,e.wrapS=e.wrapT=on,e}const ev="/golf/";let fs=null;function $o(){if(fs)return fs;const s=new Zi,t=[],e=(n,i=!0)=>{let r=()=>{};t.push(new Promise(o=>r=o));const a=s.load(`${ev}tex/${n}.jpg`,()=>r(),void 0,()=>r());return a.colorSpace=re,i&&(a.wrapS=a.wrapT=on),a.anisotropy=8,a};return fs={fairway:e("fairway"),rough:e("rough"),green:e("green"),sand:e("sand"),leaves:e("leaves"),pine:e("pine"),sky:e("sky",!1),avg:{fairway:"0.0677, 0.1804, 0.0099",rough:"0.0809, 0.1588, 0.0165",green:"0.1078, 0.3666, 0.0081",sand:"0.7953, 0.6274, 0.4374",leaves:"0.0691, 0.1425, 0.0150",pine:"0.0284, 0.0584, 0.0295"},ready:Promise.resolve()},fs.ready=Promise.all(t).then(()=>{}),fs}const nv="/golf/",Ui={file:"tex/trees.webp",cells:5,cellAspect:2/3,conifers:[0,1,2],broadleaf:[3,4],fill:[.995,.995,.995,.648,.685]};let _c=null;function iv(s){_c??(_c=(()=>{const l=new Zi().load(`${nv}${Ui.file}`);return l.colorSpace=re,l.anisotropy=4,l.generateMipmaps=!0,l.minFilter=En,l})());const t=new hn(1,1);t.translate(0,.5,0);const e=s.trees,n=new Float32Array(e.length),i=new Float32Array(e.length),r=new pe({uniforms:cn.merge([lt.fog,{map:{value:_c},tint:{value:new mt(.86,.88,.84)}}]),vertexShader:`
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
        vUv = vec2((uv.x + aSpecies) / ${Ui.cells.toFixed(1)}, uv.y);
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
      }`,fog:!0,transparent:!1,alphaToCoverage:!0}),a=new ci(t,r,e.length),o=new Wt;return e.forEach((l,c)=>{const h=l.kind===0?Ui.conifers:Ui.broadleaf;n[c]=h[Math.floor(l.tint*997)%h.length],i[c]=.85+l.tint*.25;const u=l.height*(l.kind===0?1.1:1.25)/Ui.fill[n[c]];o.makeScale(u*Ui.cellAspect,u,1),o.setPosition(l.x,l.y-.25,l.z),a.setMatrixAt(c,o)}),t.setAttribute("aSpecies",new fn(n,1)),t.setAttribute("aShade",new fn(i,1)),a.instanceMatrix.needsUpdate=!0,a.frustumCulled=!1,a.name="treeSprites",{mesh:a,dispose(){t.dispose(),r.dispose()}}}class sv extends Ft{constructor(t,e={}){super(t),this.isWater=!0;const n=this,i=e.textureWidth!==void 0?e.textureWidth:512,r=e.textureHeight!==void 0?e.textureHeight:512,a=e.clipBias!==void 0?e.clipBias:0,o=e.alpha!==void 0?e.alpha:1,l=e.time!==void 0?e.time:0,c=e.waterNormals!==void 0?e.waterNormals:null,h=e.sunDirection!==void 0?e.sunDirection:new A(.70707,.70707,0),u=new mt(e.sunColor!==void 0?e.sunColor:16777215),p=new mt(e.waterColor!==void 0?e.waterColor:8355711),d=e.eye!==void 0?e.eye:new A(0,0,0),g=e.distortionScale!==void 0?e.distortionScale:20,v=e.side!==void 0?e.side:Dn,m=e.fog!==void 0?e.fog:!1,f=new Gn,_=new A,M=new A,x=new A,P=new Wt,T=new A(0,0,-1),E=new le,R=new A,S=new A,y=new le,L=new Wt,D=new Ge,N=new Ze(i,r),H={name:"MirrorShader",uniforms:cn.merge([lt.fog,lt.lights,{normalSampler:{value:null},mirrorSampler:{value:null},alpha:{value:1},time:{value:0},size:{value:1},distortionScale:{value:20},textureMatrix:{value:new Wt},sunColor:{value:new mt(8355711)},sunDirection:{value:new A(.70707,.70707,0)},eye:{value:new A},waterColor:{value:new mt(5592405)}}]),vertexShader:`
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
				}`},B=new pe({name:H.name,uniforms:cn.clone(H.uniforms),vertexShader:H.vertexShader,fragmentShader:H.fragmentShader,lights:!0,side:v,fog:m});B.uniforms.mirrorSampler.value=N.texture,B.uniforms.textureMatrix.value=L,B.uniforms.alpha.value=o,B.uniforms.time.value=l,B.uniforms.normalSampler.value=c,B.uniforms.sunColor.value=u,B.uniforms.waterColor.value=p,B.uniforms.sunDirection.value=h,B.uniforms.distortionScale.value=g,B.uniforms.eye.value=d,n.material=B,n.onBeforeRender=function(G,Y,z){if(M.setFromMatrixPosition(n.matrixWorld),x.setFromMatrixPosition(z.matrixWorld),P.extractRotation(n.matrixWorld),_.set(0,0,1),_.applyMatrix4(P),R.subVectors(M,x),R.dot(_)>0)return;R.reflect(_).negate(),R.add(M),P.extractRotation(z.matrixWorld),T.set(0,0,-1),T.applyMatrix4(P),T.add(x),S.subVectors(M,T),S.reflect(_).negate(),S.add(M),D.position.copy(R),D.up.set(0,1,0),D.up.applyMatrix4(P),D.up.reflect(_),D.lookAt(S),D.far=z.far,D.updateMatrixWorld(),D.projectionMatrix.copy(z.projectionMatrix),L.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),L.multiply(D.projectionMatrix),L.multiply(D.matrixWorldInverse),f.setFromNormalAndCoplanarPoint(_,M),f.applyMatrix4(D.matrixWorldInverse),E.set(f.normal.x,f.normal.y,f.normal.z,f.constant);const V=D.projectionMatrix;y.x=(Math.sign(E.x)+V.elements[8])/V.elements[0],y.y=(Math.sign(E.y)+V.elements[9])/V.elements[5],y.z=-1,y.w=(1+V.elements[10])/V.elements[14],E.multiplyScalar(2/E.dot(y)),V.elements[2]=E.x,V.elements[6]=E.y,V.elements[10]=E.z+1-a,V.elements[14]=E.w,d.setFromMatrixPosition(z.matrixWorld);const Q=G.getRenderTarget(),st=G.xr.enabled,at=G.shadowMap.autoUpdate;n.visible=!1,G.xr.enabled=!1,G.shadowMap.autoUpdate=!1,G.setRenderTarget(N),G.state.buffers.depth.setMask(!0),G.autoClear===!1&&G.clear(),G.render(Y,D),n.visible=!0,G.xr.enabled=st,G.shadowMap.autoUpdate=at,G.setRenderTarget(Q);const Dt=z.viewport;Dt!==void 0&&G.state.viewport(Dt)}}}let va=null,Mc=null,rv=null;function av(s,t){const e=new Pe;e.name="course";const n=V=>Math.round((V-s.minX)/s.gridRes),i=V=>Math.round((V-s.minZ)/s.gridRes),r=s.play,a=yc(s,Math.max(0,n(r.minX)),Math.min(s.gw-1,n(r.maxX)),Math.max(0,i(r.minZ)),Math.min(s.gh-1,i(r.maxZ)),1,0),o=yc(s,0,s.gw-1,0,s.gh-1,4,-.35),l={value:0},{map:c,mask:h}=Zg(s,t.lowSpec?1536:2048);c.flipY=!0,h.flipY=!0,va??(va=Kg());const u=$o(),p=new fe({map:c,roughness:.92,metalness:0});p.onBeforeCompile=V=>{Object.assign(V.uniforms,{detailMap:{value:va},maskMap:{value:h},tFair:{value:u.fairway},tRough:{value:u.rough},tGreen:{value:u.green},tSand:{value:u.sand},uTime:l}),V.vertexShader=V.vertexShader.replace("#include <common>",`#include <common>
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
        diffuseColor.rgb *= mix(0.74, 1.0, smoothstep(0.38, 0.62, cs));`)};const d=new Ft(a,p);d.receiveShadow=!0,d.name="terrain",e.add(d);const g=new Ft(o,p);g.receiveShadow=!0,g.name="terrainOuter",e.add(g);const v=new Yi(300,2600,64,6);v.rotateX(-Math.PI/2);const m=v.attributes.position,f=new di(s.def.seed+5),_=(s.minX+s.maxX)/2,M=(s.minZ+s.maxZ)/2;for(let V=0;V<m.count;V++){const Q=m.getX(V),st=m.getZ(V),at=Math.hypot(Q,st),Dt=Math.max(0,f.fbm(Q*.002,st*.002,4)+.3)*Math.min(1,(at-300)/700)*160;m.setY(V,4+Dt)}v.translate(_,0,M),v.computeVertexNormals();const x=new Ft(v,new fe({color:3498026,roughness:1}));x.name="far",e.add(x),rv??(rv=tv());const P=ov(),T=lv(),E=(V,Q)=>{const st=new fe({vertexColors:!0,roughness:.85,metalness:0});return st.onBeforeCompile=at=>{at.uniforms.uTime={value:0},at.uniforms.leafMap={value:V},st.userData.shader=at,at.vertexShader=at.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;
varying vec3 vTP; varying vec3 vTN;`).replace("#include <begin_vertex>",`#include <begin_vertex>
          float sway = position.y * position.y * 0.0009;
          vec4 ip = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
          transformed.x += sin(uTime * 1.3 + ip.x * 0.1 + ip.z * 0.07) * sway;
          transformed.z += cos(uTime * 1.1 + ip.z * 0.1) * sway * 0.6;
          vTP = position * 0.55 + ip.xyz * 0.13;
          vTN = normal;`),at.fragmentShader=at.fragmentShader.replace("#include <common>",`#include <common>
uniform sampler2D leafMap;
varying vec3 vTP; varying vec3 vTN;`).replace("#include <color_fragment>",`#include <color_fragment>
          vec3 bw = pow(abs(normalize(vTN)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z);
          vec3 lt = texture2D(leafMap, vTP.yz).rgb * bw.x + texture2D(leafMap, vTP.xz).rgb * bw.y + texture2D(leafMap, vTP.xy).rgb * bw.z;
          float isLeaf = step(diffuseColor.r * 1.15, diffuseColor.g);
          vec3 avgL = vec3(${Q});
          float l = dot(lt, vec3(0.2126,0.7152,0.0722)) / dot(avgL, vec3(0.2126,0.7152,0.0722));
          diffuseColor.rgb *= mix(vec3(1.0), clamp(mix(vec3(l), lt / max(avgL, vec3(0.02)), 0.2), 0.35, 1.5), isLeaf * 0.85);`)},st},R=E(u.pine,u.avg.pine),S=E(u.leaves,u.avg.leaves),y=[R,S],L=s.trees.filter(V=>V.kind===0),D=s.trees.filter(V=>V.kind===1),N=new Wt,H=new $n,B=new mt,G=(V,Q,st,at)=>{const Dt=new ci(V,at,Q.length);return Q.forEach((X,tt)=>{const ot=X.height/st;H.setFromAxisAngle(new A(0,1,0),X.tint*6.28),N.compose(new A(X.x,X.y-.3,X.z),H,new A(ot*(.9+X.tint*.2),ot,ot*(.9+X.tint*.2))),Dt.setMatrixAt(tt,N),B.setHSL(0+(X.tint-.5)*.04,0,0);const et=.82+X.tint*.3;B.setRGB(et*(.95+X.tint*.1),et,et*(.9+(1-X.tint)*.1)),Dt.setColorAt(tt,B)}),Dt.castShadow=!1,Dt.receiveShadow=!1,Dt.instanceMatrix.needsUpdate=!0,Dt.computeBoundingSphere(),Dt};let Y=null;t.lowSpec&&new URL(location.href).searchParams.get("q")==="low"?(L.length&&e.add(G(P,L,16,R)),D.length&&e.add(G(T,D,12,S))):(Y=iv(s),e.add(Y.mesh)),Mc??(Mc=jg());const z=[];for(const V of s.def.water){const Q=Math.max(V.rx,V.rz)*1.5,st=new qi(Q,48);st.rotateX(-Math.PI/2);const at=Mc.clone();if(at.needsUpdate=!0,at.wrapS=at.wrapT=on,t.reflect){const tt=new sv(st,{textureWidth:512,textureHeight:512,waterNormals:at,sunDirection:zi.clone(),sunColor:16774108,waterColor:997960,distortionScale:2.2,fog:!0});tt.position.set(V.x,s.waterLevel,V.z),tt.renderOrder=2,tt.material.uniforms.size.value=6,e.add(tt),z.push(tt);continue}at.repeat.set(Q/6,Q/6);const Dt=new fe({color:1394778,roughness:.12,metalness:0,normalMap:at,normalScale:new it(.45,.45),transparent:!0,opacity:.94,envMapIntensity:.55}),X=new Ft(st,Dt);X.position.set(V.x,s.waterLevel,V.z),X.receiveShadow=!0,X.renderOrder=2,e.add(X),z.push(X)}return{group:e,water:z,update(V){l.value=V;for(const Q of y){const st=Q.userData.shader;st&&(st.uniforms.uTime.value=V)}for(const Q of z){const st=Q.material;st.uniforms?.time&&(st.uniforms.time.value=V*.6);const at=Q.material;at.normalMap&&at.normalMap.offset.set(V*.01,V*.006)}},dispose(){e.traverse(V=>{const Q=V;Q.geometry&&Q.geometry.dispose();const st=Q.material;if(Array.isArray(st))st.forEach(at=>at.dispose());else if(st){const at=st;at.map&&at.map!==va&&at.map.dispose(),st.dispose()}})}}}function yc(s,t,e,n,i,r,a){const o=Math.floor((e-t)/r)+1,l=Math.floor((i-n)/r)+1,c=new Float32Array(o*l*3),h=new Float32Array(o*l*2);for(let g=0;g<l;g++)for(let v=0;v<o;v++){const m=Math.min(e,t+v*r),f=Math.min(i,n+g*r),_=g*o+v,M=s.minX+m*s.gridRes,x=s.minZ+f*s.gridRes;c[_*3]=M,c[_*3+1]=s.heights[f*s.gw+m]+a,c[_*3+2]=x,h[_*2]=(M-s.minX)/(s.maxX-s.minX),h[_*2+1]=1-(x-s.minZ)/(s.maxZ-s.minZ)}const u=new Uint32Array((o-1)*(l-1)*6);let p=0;for(let g=0;g<l-1;g++)for(let v=0;v<o-1;v++){const m=g*o+v,f=m+1,_=m+o,M=_+1;u[p++]=m,u[p++]=_,u[p++]=f,u[p++]=f,u[p++]=_,u[p++]=M}const d=new ge;return d.setAttribute("position",new me(c,3)),d.setAttribute("uv",new me(h,2)),d.setIndex(new me(u,1)),d.computeVertexNormals(),d}function Er(s,t,e=.06,n=1){const i=s.attributes.position.count,r=new Float32Array(i*3),a=new di(n),o=s.attributes.position;for(let l=0;l<i;l++){const c=a.noise(o.getX(l)*1.3,o.getY(l)*1.3+o.getZ(l))*e,h=.85+Math.min(.25,Math.max(0,o.getY(l)*.012));r[l*3]=t.r*(1+c)*h,r[l*3+1]=t.g*(1+c)*h,r[l*3+2]=t.b*(1+c)*h}return s.setAttribute("color",new me(r,3)),s}function Nh(s,t,e){const n=new di(e),i=s.attributes.position;for(let r=0;r<i.count;r++){const a=i.getX(r),o=i.getY(r),l=i.getZ(r),c=1+n.noise(a*.7+o*.3,l*.7-o*.2)*t;i.setXYZ(r,a*c,o+n.noise(a,l)*t*.6,l*c)}return s.computeVertexNormals(),s}function Ar(s){const t=s.index?s.toNonIndexed():s;return t.deleteAttribute("uv"),t}function ov(){const s=[],t=new Ln(.22,.38,6,7);return t.translate(0,3,0),s.push(Er(Ar(t),new mt("#4a3526"),.1,2)),[{y:3.5,r:3.6,h:5.5},{y:6.2,r:3,h:5},{y:8.8,r:2.3,h:4.4},{y:11.2,r:1.5,h:4}].forEach((n,i)=>{const r=new ko(n.r,n.h,8,1,!1);r.translate(0,n.y+n.h/2,0),Nh(r,.12,10+i),s.push(Er(Ar(r),new mt(i%2?"#24502a":"#1f4825"),.12,20+i))}),Uh(s)}function lv(){const s=[],t=new Ln(.28,.48,6,7);return t.translate(0,3,0),s.push(Er(Ar(t),new mt("#4f3a28"),.1,3)),[[0,7.6,0,3.4],[1.9,6.6,.8,2.5],[-1.8,6.8,-.6,2.6],[.4,6.4,-2,2.4],[-.5,6.5,2,2.3],[.3,9.4,.2,2.3]].forEach((n,i)=>{const r=new Go(n[3],1);r.translate(n[0],n[1],n[2]),Nh(r,.16,40+i),s.push(Er(Ar(r),new mt(i%2?"#3c6e2a":"#33642a"),.16,50+i))}),Uh(s)}class cv{constructor(){this.group=new Pe,this.flagShader=null,this.flag=new Pe,this.course=null,this.brand=null,this.flagTex=xa(512,340),this.boardTex=xa(1024,256),this.signTex=xa(512,640),this.flagMat=new fe({map:this.flagTex,side:Ce,roughness:.7}),this.flagMat.onBeforeCompile=a=>{a.uniforms.uTime={value:0},this.flagShader=a,a.vertexShader=a.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;`).replace("#include <begin_vertex>",`#include <begin_vertex>
          float k = clamp(position.x / 0.75 + 0.5, 0.0, 1.0);
          transformed.z += sin(uTime * 7.0 - k * 6.0) * 0.09 * k;
          transformed.y += sin(uTime * 5.0 - k * 4.0) * 0.025 * k;`).replace("#include <beginnormal_vertex>",`#include <beginnormal_vertex>
          float kk = clamp(position.x / 0.75 + 0.5, 0.0, 1.0);
          objectNormal = normalize(vec3(-cos(uTime * 7.0 - kk * 6.0) * 0.5 * kk, 0.0, 1.0));`)},this.poleMat=new fe({color:16777215,roughness:.35,metalness:.1}),this.markerMat=new fe({color:16777215,roughness:.3,metalness:.05}),this.boardMat=new fe({map:this.boardTex,roughness:.55}),this.signMat=new fe({map:this.signTex,roughness:.5}),this.boardFrameMat=new fe({color:2236962,roughness:.6});const t=1.6,e=new Ft(new Ln(.012*t,.012*t,2.3*t,8),this.poleMat);e.position.y=1.15*t,e.castShadow=!0;const n=new Ft(new hn(.75,.5,16,6),this.flagMat);n.scale.setScalar(t),n.position.set(.375*t,2.3*t-.25*t,0),n.castShadow=!0;const i=new Ft(new qi(.054,24),new Ke({color:724744,polygonOffset:!0,polygonOffsetFactor:-4}));i.rotation.x=-Math.PI/2,i.position.y=.012;const r=new Ft(new Yi(.046,.056,24),new Ke({color:16053492,polygonOffset:!0,polygonOffsetFactor:-4}));r.rotation.x=-Math.PI/2,r.position.y=.013,this.flag.add(e,n,i,r),this.pinGlow=new Ft(new Yi(.9,1.1,48),new Ke({color:16777215,transparent:!0,opacity:.5,depthWrite:!1})),this.pinGlow.rotation.x=-Math.PI/2,this.pinGlow.position.y=.04,this.flag.add(this.pinGlow),this.group.add(this.flag)}placeFor(t){this.course=t;for(const x of[...this.group.children])x!==this.flag&&this.group.remove(x);this.flag.position.set(t.pin.x,t.pin.y,t.pin.z),this.flag.rotation.y=.6;const{dirX:e,dirZ:n}=t.tee,i=-n,r=e,a=t.tee.y;for(const x of[-1,1]){const P=new Ft(new Is(.12,20,14),this.markerMat);P.position.set(i*x*3.4+e*2.6,a+.08,r*x*3.4+n*2.6),P.scale.y=.8,P.castShadow=!0,this.group.add(P)}const o=new Ft(new Ln(.012,.004,.06,8),new fe({color:16777215,roughness:.4}));o.position.set(0,a+.01,0),o.name="peg",this.group.add(o);const l={100:14170670,150:16777215,200:3039192};for(const x of[100,150,200]){const P=t.length-x;if(P<t.def.fairwayStart+10)continue;const T=t.pointAt(P),E=t.pointAt(P+2),R=E.x-T.x,S=E.z-T.z,y=Math.hypot(R,S)||1,L=(t.fastPath(T.x,T.z).w||20)/2+2.5;for(const D of[-1,1]){const N=T.x+-S/y*L*D,H=T.z+R/y*L*D,B=new Ft(new Ln(.05,.05,.7,8),new fe({color:l[x],roughness:.5}));B.position.set(N,t.height(N,H)+.35,H),B.castShadow=!0,this.group.add(B)}}for(const x of[-1,1]){const P=this.makeBoard(5.2,.9),T=i*x*7.5-e*1.5,E=r*x*7.5-n*1.5;P.position.set(T,t.height(T,E),E),P.rotation.y=Math.atan2(e,n)+Math.PI+x*-1.05,this.group.add(P)}const c=i*-4.2+e*4.5,h=r*-4.2+n*4.5,u=new Pe,p=new Ft(new Re(1.1,1.375,.08),[this.boardFrameMat,this.boardFrameMat,this.boardFrameMat,this.boardFrameMat,this.signMat,this.boardFrameMat]);p.position.y=1.45,p.castShadow=!0;const d=new Ft(new Re(.12,.9,.12),this.boardFrameMat);d.position.y=.45,u.add(p,d),u.position.set(c,t.height(c,h),h),u.rotation.y=Math.atan2(-e,-n)+Math.PI+.55,this.group.add(u);const g=t.def.green,v=g.x-t.samples[t.samples.length-8].x,m=g.z-t.samples[t.samples.length-8].z,f=Math.hypot(v,m)||1,_=v/f,M=m/f;for(const x of[-1,0,1]){const P=this.makeBoard(5.2,.9),T=Math.max(g.rx,g.rz)+16,E=g.x+_*T+-M*x*6.2,R=g.z+M*T+_*x*6.2;P.position.set(E,t.height(E,R),R),P.rotation.y=Math.atan2(-_,-M)+x*.25,this.group.add(P)}this.group.add(this.flag),this.brand&&this.applyBrand(this.brand)}makeBoard(t,e){const n=new Pe,i=new Ft(new Re(t,e,.12),[this.boardFrameMat,this.boardFrameMat,this.boardFrameMat,this.boardFrameMat,this.boardMat,this.boardMat]);i.position.y=e/2+.25,i.castShadow=!0,i.receiveShadow=!0;for(const r of[-1,1]){const a=new Ft(new Re(.08,.3,.3),this.boardFrameMat);a.position.set(r*(t/2-.3),.15,0),n.add(a)}return n.add(i),n}applyBrand(t){this.brand=t;const e=t.course;{const n=this.flagTex.image,i=n.getContext("2d");i.fillStyle=e.flag,i.fillRect(0,0,n.width,n.height),ai(i,t,40,60,n.width-80,n.height-120,e.flagLogoColor),i.fillStyle="rgba(0,0,0,0.18)",i.fillRect(0,0,14,n.height),this.flagTex.needsUpdate=!0}{const n=this.boardTex.image,i=n.getContext("2d");i.fillStyle=e.board,i.fillRect(0,0,n.width,n.height),i.fillStyle=t.colors.primary,i.fillRect(0,n.height-18,n.width,18),ai(i,t,40,34,n.width*.5,n.height-88,e.boardText),i.fillStyle=e.boardText,i.font=`italic 700 54px ${ps(t)}`,i.textAlign="right",i.textBaseline="middle",i.fillText(t.tagline.toUpperCase(),n.width-40,n.height/2-8,n.width*.42),this.boardTex.needsUpdate=!0}this.drawSign(),this.poleMat.color.set(e.pole),this.markerMat.color.set(e.teeMarker),this.boardFrameMat.color.set(new mt(e.board).multiplyScalar(.6)),this.pinGlow.material.color.set(t.colors.primary)}drawSign(){const t=this.brand,e=this.course;if(!t)return;const n=this.signTex.image,i=n.getContext("2d");i.fillStyle=t.colors.dark,i.fillRect(0,0,n.width,n.height),i.fillStyle=t.colors.primary,i.fillRect(0,0,n.width,140),ai(i,t,40,24,n.width-80,92,t.colors.onPrimary),e&&(i.fillStyle=t.colors.light,i.textAlign="center",i.font=`italic 800 64px ${ps(t)}`,i.fillText("HOLE",n.width/2,230),i.fillStyle=t.colors.primary,i.font=`italic 900 220px ${ps(t)}`,i.fillText(String(e.def.id),n.width/2,430),i.fillStyle=t.colors.light,i.font=`italic 700 56px ${ps(t)}`,i.fillText(`PAR ${e.def.par}  ·  ${Math.round(e.distToPin(0,0))} M`,n.width/2,530),i.font=`italic 600 40px ${ps(t)}`,i.globalAlpha=.7,i.fillText(e.def.name.toUpperCase(),n.width/2,590),i.globalAlpha=1),this.signTex.needsUpdate=!0}setPeg(t){const e=this.group.getObjectByName("peg");e&&(e.visible=t)}previewCanvases(){return[this.flagTex.image,this.boardTex.image,this.signTex.image]}update(t,e){this.flagShader&&(this.flagShader.uniforms.uTime.value=t);const n=1+Math.sin(t*3)*.15,i=Math.min(1,Math.max(0,(e-25)/40));this.pinGlow.scale.setScalar(n*(1+e/60)),this.pinGlow.material.opacity=.55*i}}function ps(s){return`"${s.font}", "Barlow Condensed", "Arial Narrow", sans-serif`}function xa(s,t){const e=document.createElement("canvas");e.width=s,e.height=t;const n=new je(e);return n.colorSpace=re,n.anisotropy=8,n}class hv{constructor(t){const e=new Ng({color:16777215,roughness:.35,clearcoat:1,clearcoatRoughness:.15,normalMap:Jg(),normalScale:new it(.6,.6)});this.ball=new Ft(new Is(.0214*2.2,24,16),e),this.ball.castShadow=!0,t.add(this.ball),this.shadow=new Ft(new qi(.06,16),new Ke({color:0,transparent:!0,opacity:.35,depthWrite:!1})),this.shadow.rotation.x=-Math.PI/2,t.add(this.shadow),this.tracer=new Sc(600,16777215,!0),t.add(this.tracer.mesh),this.aim=new Sc(240,16777215,!1,!0),this.aim.widthScale=1.7,t.add(this.aim.mesh),this.ring=new Pe;const n=new Ft(new Yi(1,1.25,48),new Ke({color:16777215,transparent:!0,opacity:.9,depthWrite:!1,side:Ce}));this.ringInner=new Ft(new qi(1,48),new Ke({color:4251856,transparent:!0,opacity:.28,depthWrite:!1,side:Ce})),n.rotation.x=this.ringInner.rotation.x=-Math.PI/2,this.ring.add(n,this.ringInner),this.ring.renderOrder=5,t.add(this.ring),this.particles=new uv(t)}setBrand(t){this.ball.material.color.set(t.course.ball),this.tracer.setColor(t.course.tracer),this.ringInner.material.color.set(t.colors.primary)}setBall(t,e,n,i){this.ball.position.set(t,e+.0214*1.2,n),this.shadow.position.set(t,i+.02,n);const r=Math.max(0,e-i),a=1+r*.05;this.shadow.scale.setScalar(a),this.shadow.material.opacity=Math.max(.05,.35-r*.01)}tracerReset(){this.tracer.clear()}tracerPush(t){this.tracer.push(t)}tracerFade(t){this.tracer.fade(t)}burst(t,e,n){this.particles.burst(t,e,n)}update(t,e,n){this.tracer.update(e),this.aim.update(e),this.particles.update(t);const i=1+Math.sin(n*4)*.06;this.ring.children[0].scale.setScalar(i)}}class Sc{constructor(t,e,n,i=!1){this.pts=[],this.alpha=1,this.widthScale=1,this.max=t,this.dashed=i,this.geo=new ge,this.geo.setAttribute("position",new me(new Float32Array(t*2*3),3)),this.geo.setAttribute("color",new me(new Float32Array(t*2*4),4));const r=[];for(let a=0;a<t-1;a++){const o=a*2;i&&a%4>=2||r.push(o,o+1,o+2,o+1,o+3,o+2)}this.geo.setIndex(r),this.mat=new Ke({color:e,vertexColors:!0,transparent:!0,depthWrite:!1,side:Ce,blending:n?Ts:oi}),this.mesh=new Ft(this.geo,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=10}setColor(t){this.mat.color.set(t)}clear(){this.pts=[],this.alpha=1,this.geo.setDrawRange(0,0)}push(t){this.pts.length>=this.max&&this.pts.shift(),this.pts.push(t.clone()),this.alpha=1}setPoints(t){this.pts=t.slice(0,this.max).map(e=>e.clone()),this.alpha=1}fade(t){this.alpha=Math.max(0,this.alpha-t*.5)}update(t){const e=this.pts.length;if(e<2){this.geo.setDrawRange(0,0);return}const n=this.geo.attributes.position,i=this.geo.attributes.color,r=t.position,a=new A,o=new A,l=new A;for(let h=0;h<e;h++){const u=this.pts[h],p=this.pts[Math.min(e-1,h+1)],d=this.pts[Math.max(0,h-1)];a.subVectors(p,d).normalize(),l.subVectors(r,u);const g=l.length();l.normalize(),o.crossVectors(a,l).normalize();const v=(.025+g*.0032)*this.widthScale;o.multiplyScalar(v),n.setXYZ(h*2,u.x+o.x,u.y+o.y,u.z+o.z),n.setXYZ(h*2+1,u.x-o.x,u.y-o.y,u.z-o.z);const m=Math.pow(h/(e-1),.6)*this.alpha;i.setXYZW(h*2,1,1,1,m),i.setXYZW(h*2+1,1,1,1,m)}n.needsUpdate=!0,i.needsUpdate=!0;let c=e-1;if(this.dashed){c=0;for(let h=0;h<e-1;h++)h%4<2&&c++}this.geo.setDrawRange(0,c*6),this.geo.computeBoundingSphere()}}class uv{constructor(t){this.N=400,this.head=0;const e=new ge;e.setAttribute("position",new me(new Float32Array(this.N*3),3)),e.setAttribute("color",new me(new Float32Array(this.N*3),3)),this.vel=new Float32Array(this.N*3),this.life=new Float32Array(this.N);const n=new Sh({size:.18,map:Qg(),vertexColors:!0,transparent:!0,depthWrite:!1,sizeAttenuation:!0});this.pts=new sg(e,n),this.pts.frustumCulled=!1,t.add(this.pts)}burst(t,e,n){const i=e==="confetti"?160:e==="water"?70:36,r=this.pts.geometry.attributes.position,a=this.pts.geometry.attributes.color,o={grass:["#3f7a2a","#5a9a35","#6b4a2a"],sand:["#e8d7a8","#d8c48e","#f2e6c4"],water:["#ffffff","#cfeefb","#9fd7ef"],leaf:["#2f5a22","#46772d","#2a4a1c"],confetti:[n??"#ffffff","#ffffff",n??"#ffd200","#ffffff"]},l=o[e]??o.grass,c=new mt;for(let h=0;h<i;h++){const u=this.head;this.head=(this.head+1)%this.N,r.setXYZ(u,t.x,t.y+.05,t.z);const p=Math.random()*Math.PI*2,d=e==="water"?3+Math.random()*4:e==="confetti"?4+Math.random()*6:1+Math.random()*2.5,g=e==="confetti"?1+Math.random()*3:.4+Math.random()*1.4;this.vel[u*3]=Math.cos(p)*g,this.vel[u*3+1]=d,this.vel[u*3+2]=Math.sin(p)*g,this.life[u]=e==="confetti"?2.5:1.1,c.set(l[h%l.length]),a.setXYZ(u,c.r,c.g,c.b)}r.needsUpdate=!0,a.needsUpdate=!0}update(t){const e=this.pts.geometry.attributes.position;for(let n=0;n<this.N;n++){if(this.life[n]<=0){e.setY(n,-9999);continue}this.life[n]-=t,this.vel[n*3+1]-=9.8*t*.6,this.vel[n*3]*=.98,this.vel[n*3+2]*=.98,e.setXYZ(n,e.getX(n)+this.vel[n*3]*t,e.getY(n)+this.vel[n*3+1]*t,e.getZ(n)+this.vel[n*3+2]*t)}e.needsUpdate=!0}}class dv{constructor(t){this.pts=[],this.dir=new it(1,0),this.course=null,this.t=0,this.N=90,this.visible=!1;const e=new Rh;e.moveTo(0,.22),e.lineTo(.2,-.05),e.lineTo(.12,-.05),e.lineTo(0,.1),e.lineTo(-.12,-.05),e.lineTo(-.2,-.05),e.closePath();const n=new Vo(e);n.rotateX(-Math.PI/2);const i=new Ke({color:16777215,transparent:!0,opacity:.55,depthWrite:!1});this.mesh=new ci(n,i,this.N),this.mesh.frustumCulled=!1,this.mesh.visible=!1,this.mesh.renderOrder=4,t.add(this.mesh)}setCourse(t){this.course=t;const e=t.def.green;this.pts=[];const n=2.2;for(let a=-e.rx;a<=e.rx;a+=n)for(let o=-e.rz;o<=e.rz;o+=n){const l=e.x+a,c=e.z+o;t.surfaceAt(l,c)==="green"&&this.pts.length<this.N&&this.pts.push({x:l,z:c})}const[i,r]=e.slope;this.dir.set(-i,-r).normalize()}setColor(t){this.mesh.material.color.set(t)}update(t){if(this.mesh.visible=this.visible&&!!this.course,!this.mesh.visible||!this.course)return;this.t+=t;const e=this.course,n=new Wt,i=new $n().setFromAxisAngle(new A(0,1,0),Math.atan2(-this.dir.x,-this.dir.y)),r=new A(1,1,1),a=e.def.green;for(let o=0;o<this.N;o++){if(o>=this.pts.length){n.makeScale(0,0,0),this.mesh.setMatrixAt(o,n);continue}const l=this.pts[o],c=(this.t*.6+o%7*.31)%2.2-1.1,h=l.x+this.dir.x*c,u=l.z+this.dir.y*c,p=Math.hypot((h-a.x)/a.rx,(u-a.z)/a.rz)<.95,d=1-Math.abs(c)/1.1;r.setScalar(p?.5+d*.6:0),n.compose(new A(h,e.height(h,u)+.03,u),i,r),this.mesh.setMatrixAt(o,n)}this.mesh.instanceMatrix.needsUpdate=!0}}const wc="/golf/",bc=8,Tc=2,fv=2/3;let fr=null,Ec=null;class pv{constructor(){this.group=new Pe,this.mesh=null,this.stands=new Pe,this.spots=[],this.excite=0,this.brand=null,this.uniforms={uTime:{value:0},uExcite:{value:0}},this.standMats={frame:new fe({color:9080982,roughness:.45,metalness:.6}),seat:new fe({color:2764081,roughness:.7}),fascia:new fe({roughness:.5}),roof:new fe({color:15921906,roughness:.6,side:Ce})};const t=document.createElement("canvas");if(t.width=1024,t.height=128,this.fasciaTex=new je(t),this.fasciaTex.colorSpace=re,this.fasciaTex.wrapS=on,this.standMats.fascia.map=this.fasciaTex,this.group.add(this.stands),!fr){const e=new Zi;fr=e.load(`${wc}tex/crowd.webp`),fr.colorSpace=re,Ec=e.load(`${wc}tex/crowd-mask.webp`)}}placeFor(t){this.spots=[],this.stands.clear();let e=t.def.seed*31+7;const n=()=>(e=e*16807%2147483647)/2147483647,i=(x,P,T)=>{const E=t.surfaceAt(x,P);T===void 0&&(E==="water"||E==="bunker"||E==="green"||E==="ob")||this.spots.push({x,z:P,y:T??t.height(x,P),person:Math.floor(n()*bc),phase:n()*6.28,eager:.5+n()*.8,scale:.92+n()*.16})},r=t.def.green,a=t.samples[Math.max(0,t.samples.length-8)],o=r.x-a.x,l=r.z-a.z,c=Math.hypot(o,l)||1,h=o/c,u=l/c,p=Math.max(r.rx,r.rz);for(let x=0;x<2;x++)for(let P=-12;P<=12;P++){if(Math.abs(P)<4)continue;const T=P/12*1.2,E=p+18+x*1.1+n()*.5,R=Math.cos(T),S=Math.sin(T);i(r.x+(h*R-u*S)*E,r.z+(u*R+h*S)*E)}const d=p+24,g=r.x+h*d,v=r.z+u*d;this.buildStand(t,g,v,Math.atan2(-h,-u),20,n,i);const{dirX:m,dirZ:f}=t.tee,_=-f,M=m;for(let x=0;x<18;x++){const P=x%2?1:-1,T=-6+Math.floor(x/2)*1.4+n()*.4,E=10.5+n()*1.4;i(_*P*E+m*T,M*P*E+f*T)}this.buildMesh(),this.brand&&this.applyBrand(this.brand)}buildStand(t,e,n,i,r,a,o){const l=new Pe,c=5,h=.95,u=.55,p=Math.min(t.height(e,n),t.height(e+Math.sin(i)*6,n+Math.cos(i)*6))-.1;for(let f=0;f<c;f++){const _=new Ft(new Re(r,u*(f+1),h),this.standMats.seat);_.position.set(0,u*(f+1)/2+.6,-f*h),_.castShadow=!0,_.receiveShadow=!0,l.add(_)}for(let f=-2;f<=2;f++){const _=new Ft(new Re(.12,.6+u*c+2.6,.12),this.standMats.frame);_.position.set(f/2*(r/2-.2),(.6+u*c+2.6)/2,-c*h+.2),l.add(_)}const d=new Ft(new Re(r,.05,.05),this.standMats.frame);d.position.set(0,.6+u*c+1.05,-c*h+.4),l.add(d);const g=new Ft(new Re(r+1,.08,c*h+1.2),this.standMats.roof);g.position.set(0,.6+u*c+2.7,-c*h/2+.2),g.rotation.x=-.08,g.castShadow=!0,l.add(g);for(const[f,_]of[[.32,.64],[.6+u*c+2.45,.5]]){const M=new Ft(new hn(r,_),this.standMats.fascia);M.position.set(0,f,.5+(f>1?.65:.01)),l.add(M)}l.position.set(e,p,n),l.rotation.y=i,this.stands.add(l);const v=Math.cos(i),m=Math.sin(i);for(let f=0;f<c;f++)for(let _=0;_<Math.floor(r/.8);_++){if(a()<.12)continue;const M=-r/2+.5+_*.8+(a()-.5)*.2,x=-f*h-.15,P=e+M*v+x*m,T=n-M*m+x*v;o(P,T,p+.6+u*(f+1))}}buildMesh(){this.mesh&&(this.group.remove(this.mesh),this.mesh.geometry.dispose(),this.mesh.material.dispose());const t=this.spots.length,e=new hn(1,1);e.translate(0,.5,0);const n=new Float32Array(t),i=new Float32Array(t),r=new Float32Array(t),a=new Float32Array(t*3),o=new Float32Array(t*3);this.spots.forEach((u,p)=>{n[p]=u.person,i[p]=u.phase,r[p]=u.eager}),e.setAttribute("aPerson",new fn(n,1)),e.setAttribute("aPhase",new fn(i,1)),e.setAttribute("aEager",new fn(r,1)),e.setAttribute("aShirt",new fn(a,3)),e.setAttribute("aCap",new fn(o,3));const l=new pe({uniforms:cn.merge([lt.fog,{map:{value:fr},maskMap:{value:Ec}}]),vertexShader:`
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
          vec3 wp = base.xyz + right * (position.x + sway * position.y) * h * ${fv.toFixed(4)} + vec3(0.0, position.y * h + jump, 0.0);
          vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float row = cheer;
          vUv = vec2((uv.x + aPerson) / ${bc.toFixed(1)}, (uv.y + (${(Tc-1).toFixed(1)} - row)) / ${Tc.toFixed(1)});
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
        }`,fog:!0,alphaToCoverage:!0});l.uniforms.uTime=this.uniforms.uTime,l.uniforms.uExcite=this.uniforms.uExcite;const c=new ci(e,l,t),h=new Wt;this.spots.forEach((u,p)=>{h.makeScale(1.78*u.scale,1.78*u.scale,1),h.setPosition(u.x,u.y,u.z),c.setMatrixAt(p,h)}),c.frustumCulled=!1,this.mesh=c,this.group.add(c)}applyBrand(t){this.brand=t;const e=this.fasciaTex.image,n=e.getContext("2d");if(n.fillStyle=t.course.board,n.fillRect(0,0,e.width,e.height),n.fillStyle=t.colors.primary,n.fillRect(0,e.height-10,e.width,10),ai(n,t,30,16,300,e.height-36,t.course.boardText),n.fillStyle=t.course.boardText,n.font=`italic 800 56px "${t.font}", "Barlow Condensed", sans-serif`,n.textBaseline="middle",n.textAlign="right",n.fillText(t.courseName.toUpperCase(),e.width-30,e.height/2-4,620),this.fasciaTex.repeat.set(2,1),this.fasciaTex.needsUpdate=!0,this.standMats.seat.color.set(new mt(t.colors.dark).lerp(new mt("#3a3f45"),.5)),!this.mesh)return;const i=[t.colors.primary,t.kit.shirt,t.colors.light,t.colors.dark,"#ffffff","#2f4f7a","#8a2f3b","#d9cdb4","#4f7a5a","#ffffff"],r=[t.kit.cap,t.colors.primary,"#ffffff",t.colors.dark,"#1c2d4a","#ffffff"],a=this.mesh.geometry,o=a.getAttribute("aShirt"),l=a.getAttribute("aCap"),c=new mt;for(let h=0;h<this.spots.length;h++)c.set(i[(h*7+3)%i.length]),o.setXYZ(h,c.r,c.g,c.b),c.set(r[(h*5+1)%r.length]),l.setXYZ(h,c.r,c.g,c.b);o.needsUpdate=!0,l.needsUpdate=!0}cheer(t){this.excite=Math.max(this.excite,t)}update(t){this.excite=Math.max(0,this.excite-t*.3),this.uniforms.uTime.value+=t,this.uniforms.uExcite.value=this.excite}}const mv={rough:[.09,.2],firstCut:[.08,.14],fairway:[.035,.06],tee:[.035,.055],fringe:[.04,.07]},gv={rough:"#5f9139",firstCut:"#6a9e3e",fairway:"#7cb04a",tee:"#7cb04a",fringe:"#86b950"};class vv{constructor(t,e=20){this.course=null,this.center=new A(1e9,0,0),this.slots=[],this.uniforms={uTime:{value:0},uBall:{value:new A(1e9,0,0)},uCenter:{value:new it},uRadius:{value:20}},this.uniforms.uRadius.value=e;const n=new hn(1,1,1,4);n.translate(0,.5,0);const i=n.attributes.position;for(let h=0;h<i.count;h++){const u=i.getY(h);i.setX(h,i.getX(h)*(1-u*.92)),i.setZ(h,u*u*.25)}const r=n.attributes.normal;for(let h=0;h<r.count;h++)r.setXYZ(h,0,1,0);const a=new Fg({side:Ce,vertexColors:!1});a.onBeforeCompile=h=>{Object.assign(h.uniforms,this.uniforms),h.vertexShader=h.vertexShader.replace("#include <common>",`#include <common>
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
diffuseColor.rgb *= mix(0.92, 1.18, vTip);`)},this.mesh=new ci(n,a,t),this.mesh.frustumCulled=!1,this.mesh.receiveShadow=!0;let o=12345;const l=()=>(o=o*16807%2147483647)/2147483647;for(let h=0;h<t;h++){const u=e*Math.pow(l(),.62),p=l()*Math.PI*2;this.slots.push({dx:Math.cos(p)*u,dz:Math.sin(p)*u,r:l(),rot:l()*Math.PI*2,t:l()})}const c=new mt;for(let h=0;h<t;h++)this.mesh.setColorAt(h,c.set("#5f9138"))}setCourse(t){this.course=t,this.center.set(1e9,0,0)}setCenter(t,e){if(!this.course||Math.hypot(t-this.center.x,e-this.center.z)<3)return;this.center.set(t,0,e),this.uniforms.uCenter.value.set(t,e);const n=this.course,i=new Wt,r=new $n,a=new A(0,1,0),o=new mt,l=new A,c=new A;this.slots.forEach((h,u)=>{const p=t+h.dx,d=e+h.dz,g=n.surfaceAt(p,d),v=mv[g];if(!v){i.makeScale(0,0,0),this.mesh.setMatrixAt(u,i);return}const m=v[0]+(v[1]-v[0])*h.r,f=g==="rough"?.016:.011;l.set(p,n.height(p,d)-.01,d),r.setFromAxisAngle(a,h.rot),c.set(f,m,f*4),i.compose(l,r,c),this.mesh.setMatrixAt(u,i),o.set(gv[g]??"#5f9138").multiplyScalar(.85+h.t*.3),this.mesh.setColorAt(u,o)}),this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}update(t,e){this.uniforms.uTime.value+=t,this.uniforms.uBall.value.copy(e)}}const xv="/golf/",_v=[{name:"caddie",w:.645,h:.99},{name:"flowers",w:.988,h:.527},{name:"box",w:.988,h:.877},{name:"wild",w:.988,h:.662}];let pr=null;class Mv{constructor(){this.group=new Pe,this.sprites=null,this.brand=null,this.rows=[],this.title="CLOSEST TO THE PIN",this.ropeMat=new fe({color:16053492,roughness:.8}),this.stakeMat=new fe({color:16777215,roughness:.5}),this.towerMat=new fe({color:2303530,roughness:.6,metalness:.3});const t=document.createElement("canvas");t.width=512,t.height=768,this.boardTex=new je(t),this.boardTex.colorSpace=re,this.boardTex.anisotropy=4,pr||(pr=new Zi().load(`${xv}tex/props.webp`),pr.colorSpace=re)}placeFor(t){this.group.clear();let e=t.def.seed*97+13;const n=()=>(e=e*16807%2147483647)/2147483647,i=[],r=(f,_)=>{const M=t.surfaceAt(f,_);return M==="rough"||M==="firstCut"},{dirX:a,dirZ:o}=t.tee,l=-o,c=a,h=(f,_)=>({x:l*f+a*_,z:c*f+o*_});{const f=h(4.6,-1.2);i.push({kind:0,x:f.x,z:f.z,h:1.85})}for(const[f,_]of[[-5.6,8],[5.6,8],[-5.6,-6],[5.6,-6]]){const M=h(f,_);i.push({kind:1,x:M.x,z:M.z,h:.65})}for(let f=0;f<5;f++)for(const _ of[-1,1]){const M=h(_*10.2,-4.5+f*2.2);i.push({kind:2,x:M.x,z:M.z,h:.95+n()*.25})}const u=t.def.green,p=t.samples[Math.max(0,t.samples.length-8)],d=Math.hypot(u.x-p.x,u.z-p.z)||1,g=(u.x-p.x)/d,v=(u.z-p.z)/d,m=Math.max(u.rx,u.rz);for(const f of[-1,-.55,.55,1]){const _=Math.cos(f),M=Math.sin(f),x=m+12.5,P=u.x+(g*_-v*M)*x,T=u.z+(v*_+g*M)*x;r(P,T)&&i.push({kind:1,x:P,z:T,h:.6})}for(let f=0,_=0;f<900&&_<140;f++){const M=t.play.minX+n()*(t.play.maxX-t.play.minX),x=t.play.minZ+n()*(t.play.maxZ-t.play.minZ),P=t.fastPath(M,x),T=Math.max(P.w,24)/2;P.d<T+9||P.d>T+28||!r(M,x)||qe(u,M,x)<2.2||(i.push({kind:3,x:M,z:x,h:.8+n()*.6}),_++)}this.buildSprites(t,i),this.buildRope(t,g,v,m),this.buildTower(t,g,v,m),this.brand&&this.applyBrand(this.brand)}buildSprites(t,e){const n=new hn(1,1);n.translate(0,.5,0);const i=new Float32Array(e.length),r=new pe({uniforms:cn.merge([lt.fog,{map:{value:pr}}]),vertexShader:`
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
        }`,fog:!0,alphaToCoverage:!0}),a=new ci(n,r,e.length),o=new Wt;e.forEach((l,c)=>{i[c]=l.kind;const h=l.h/_v[l.kind].h;o.makeScale(h,h,h),o.setPosition(l.x,t.height(l.x,l.z)-.03,l.z),a.setMatrixAt(c,o)}),n.setAttribute("aKind",new fn(i,1)),a.frustumCulled=!1,this.sprites=a,this.group.add(a)}buildRope(t,e,n,i){const r=i+15,a=[];for(let d=-14;d<=14;d++){const g=d/14*1.35,v=Math.cos(g),m=Math.sin(g),f=t.def.green,_=f.x+(e*v-n*m)*r,M=f.z+(n*v+e*m)*r;a.push(new A(_,t.height(_,M),M))}const o=new Ln(.035,.04,1,6);o.translate(0,.5,0);const l=new ci(o,this.stakeMat,a.length),c=new Wt;a.forEach((d,g)=>{c.makeTranslation(d.x,d.y,d.z),l.setMatrixAt(g,c)}),l.castShadow=!0,this.group.add(l);const h=[];for(let d=0;d<a.length-1;d++){const g=a[d],v=a[d+1];for(let m=0;m<1;m+=.25){const f=g.clone().lerp(v,m);f.y+=.92-Math.sin(m*Math.PI)*.12,h.push(f)}}const u=a[a.length-1].clone();u.y+=.92,h.push(u);const p=new Ft(new Wo(new wh(h),h.length*2,.018,4),this.ropeMat);this.group.add(p)}buildTower(t,e,n,i){const r=t.def.green,a=t.def.seed%2?1:-1;let o=r.x-n*a*(i+22)+e*4,l=r.z+e*a*(i+22)+n*4;for(let m=0;m<6&&t.surfaceAt(o,l)==="water";m++)o+=e*8,l+=n*8;const c=new Pe,h=3.2,u=4.8,p=2.4,d=new Ft(new Re(h,u,.3),[this.towerMat,this.towerMat,this.towerMat,this.towerMat,new fe({map:this.boardTex,roughness:.45,emissive:16777215,emissiveMap:this.boardTex,emissiveIntensity:.25}),this.towerMat]);d.position.y=p+u/2,d.castShadow=!0,c.add(d);for(const m of[-1,1]){const f=new Ft(new Re(.22,p+.2,.22),this.towerMat);f.position.set(m*(h/2-.4),(p+.2)/2,0),f.castShadow=!0,c.add(f)}c.position.set(o,t.height(o,l),l);const g=r.x-e*60-o,v=r.z-n*60-l;c.rotation.y=Math.atan2(g,v),this.group.add(c)}applyBrand(t){this.brand=t,this.drawBoard(),this.ropeMat.color.set("#f2f2f2"),this.stakeMat.color.set(t.colors.primary),this.towerMat.color.set(new mt(t.colors.dark).lerp(new mt("#2a2d31"),.4))}setBoard(t,e){this.title=t,this.rows=e.slice(0,6),this.drawBoard()}drawBoard(){const t=this.brand;if(!t)return;const e=this.boardTex.image,n=e.getContext("2d"),i=`"${t.font}", "Barlow Condensed", sans-serif`;n.fillStyle=t.colors.dark,n.fillRect(0,0,e.width,e.height),n.fillStyle=t.colors.primary,n.fillRect(0,0,e.width,120),ai(n,t,30,20,e.width-60,80,t.colors.onPrimary),n.fillStyle=t.colors.light,n.textAlign="center",n.font=`italic 800 46px ${i}`,n.fillText("LEADERBOARD",e.width/2,178),n.font=`italic 600 28px ${i}`,n.globalAlpha=.75,n.fillText(this.title,e.width/2,216),n.globalAlpha=1,(this.rows.length?this.rows:[{name:"Be the first",value:"-"}]).forEach((a,o)=>{const l=290+o*74;n.fillStyle=o%2?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.09)",n.fillRect(24,l-46,e.width-48,64),n.textAlign="left",n.fillStyle=t.colors.primary,n.font=`italic 900 40px ${i}`,n.fillText(String(o+1),40,l),n.fillStyle=t.colors.light,n.font=`700 36px ${i}`,n.fillText(a.name.toUpperCase().slice(0,14),92,l,260),n.textAlign="right",n.fillStyle=t.colors.primary,n.font=`italic 800 38px ${i}`,n.fillText(a.value,e.width-40,l)}),this.boardTex.needsUpdate=!0}}const mr="/golf/",sn={drive:{name:"golfer-drive",frames:47,cols:8,rows:6,w:1.215,h:1.823,ax:.953,ay:.006,address:0,top:20,impact:30,finish:46},face:{name:"golfer-face",frames:41,cols:8,rows:6,w:1.42,h:2.13,ax:.575,ay:.02,address:0,top:18,impact:24,finish:40},putt:{name:"golfer-putt",frames:47,cols:8,rows:6,w:1.246,h:1.869,ax:.768,ay:.02,address:0,top:12,impact:34,finish:46}};class yv{constructor(){this.root=new Pe,this.sheet=sn.drive,this.frame=0,this.ball=new A,this.uniforms={maskMap:{value:null},cShirt:{value:new mt("#ffffff")},cCap:{value:new mt("#ffffff")},cShoes:{value:new mt("#ffffff")},shirtLogo:{value:null},capLogo:{value:null},uShirtA:{value:new A},uCapA:{value:new A},uCell:{value:new le(0,0,1,1)},uCellAspect:{value:384/576},uLogoAspect:{value:3.6},uShirtOn:{value:1},uShirtRot:{value:0},uBaked:{value:0},uCapOn:{value:1}},this.shirtCanvas=document.createElement("canvas"),this.capCanvas=document.createElement("canvas"),this.putter=!1,this.view="dtl",this.mirrored=!1,this.pose={kind:"back",p:0},this.golferPos=new A,this.baked={},this.bakedFor="";const t=new Zi;for(const e of Object.values(sn))if(e.frames){e.tex=t.load(`${mr}tex/${e.name}.webp`),e.tex.colorSpace=re,e.mask=t.load(`${mr}tex/${e.name}-mask.webp`),fetch(`${mr}tex/${e.name}.json`).then(n=>n.json()).then(n=>{e.anchors=n.anchors,this.setFrame(this.frame)}).catch(()=>{});for(const n of[e.tex,e.mask])n.repeat.set(1/e.cols,1/e.rows),n.generateMipmaps=!1,n.minFilter=Ve}this.mat=new Ke({map:this.sheet.tex,alphaTest:.42,side:Ce,toneMapped:!1}),this.mat.onBeforeCompile=e=>{Object.assign(e.uniforms,this.uniforms),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
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
          diffuseColor.rgb *= vec3(1.0, 0.985, 0.95);`)},this.depthMat=new _h({depthPacking:nh,map:this.sheet.tex,alphaTest:.5}),this.mesh=new Ft(this.geoFor(this.sheet),this.mat),this.mesh.customDepthMaterial=this.depthMat,this.mesh.castShadow=!0,this.mesh.renderOrder=3,this.root.add(this.mesh),this.setFrame(0)}loadBaked(t){const e=t.golferKit;if((e??"")===this.bakedFor||(this.bakedFor=e??"",this.baked={},this.chooseSheet(),!e))return;const n=new Zi;for(const i of Object.keys(sn)){const r=`${mr}brand/${e}/golfer-${i}`;fetch(`${r}.json`).then(a=>a.ok?a.json():Promise.reject()).then(a=>{if(this.bakedFor!==e)return;const o={...sn[i],...a,name:`${e}-${i}`,anchors:void 0};o.tex=n.load(`${r}.webp`,()=>this.chooseSheet()),o.tex.colorSpace=re,o.mask=sn[i].mask,o.tex.repeat.set(1/o.cols,1/o.rows),o.tex.generateMipmaps=!1,o.tex.minFilter=Ve,this.baked[i]=o}).catch(()=>{})}}geoFor(t){const e=new hn(t.w,t.h);return e.translate(t.w/2-t.ax*t.w,t.h/2-t.ay*t.h,0),e}setBrand(t){this.loadBaked(t);const e=o=>new mt(o);this.uniforms.cShirt.value.copy(e(t.kit.shirt)),this.uniforms.cCap.value.copy(e(t.kit.cap)),this.uniforms.cShoes.value.copy(e(t.kit.shoes));const n=o=>{const l=new mt(o).getHSL({h:0,s:0,l:0}).l;return o.toLowerCase()===t.colors.primary.toLowerCase()?t.colors.onPrimary:l>.55?t.colors.dark:t.colors.primary},i=t.logoImg,r=i?(i.naturalWidth||300)/(i.naturalHeight||100):3;this.uniforms.uLogoAspect.value=r;const a=(o,l,c)=>{o.width=512,o.height=Math.max(32,Math.round(512/r));const h=o.getContext("2d");h.clearRect(0,0,o.width,o.height),ai(h,t,0,0,o.width,o.height,l);const u=new je(o);u.colorSpace=re,this.uniforms[c].value?.dispose(),this.uniforms[c].value=u};a(this.shirtCanvas,n(t.kit.shirt),"shirtLogo"),a(this.capCanvas,n(t.kit.cap),"capLogo"),this.uniforms.uShirtOn.value=t.kit.shirtLogo?1:0,this.uniforms.uCapOn.value=t.kit.capLogo?1:0}placeAt(t,e,n,i){const r=-n,a=e;this.root.position.set(t.x-r*.78,i,t.z-a*.78),this.ball.set(t.x,i,t.z),this.golferPos.copy(this.root.position),this.mesh.position.set(t.x-this.root.position.x,0,t.z-this.root.position.z)}setPutter(t){this.putter=t,this.chooseSheet()}chooseSheet(){const t=i=>!!(i.tex?.image&&i.mask?.image),e=i=>this.baked[i]&&t(this.baked[i])?this.baked[i]:sn[i],n=this.putter&&t(e("putt"))?e("putt"):this.view==="face"&&t(e("face"))&&!this.putter?e("face"):e("drive");this.uniforms.uBaked.value=Object.values(this.baked).includes(n)?1:0,n!==this.sheet&&(this.sheet=n,this.mat.map=n.tex,this.depthMat.map=n.tex,this.mat.needsUpdate=!0,this.depthMat.needsUpdate=!0,this.mesh.geometry.dispose(),this.mesh.geometry=this.geoFor(n)),this.uniforms.maskMap.value=this.sheet.mask,this.applyPose()}applyPose(){const t=this.pose;t.kind==="back"?this.backFrame(t.p):this.followFrame(t.t,t.from)}setFrame(t){const e=this.sheet,n=Math.max(0,Math.min(e.frames-1,Math.round(t)));this.frame=n;const i=n%e.cols,r=Math.floor(n/e.cols),a=i/e.cols,o=1-(r+1)/e.rows;e.tex.offset.set(a,o),e.mask.offset.set(a,o),this.uniforms.maskMap.value=e.mask,this.uniforms.uCell.value.set(a,o,1/e.cols,1/e.rows);const l=e.anchors?.[n];l?(this.uniforms.uShirtA.value.set(l[0],l[1],l[2]),this.uniforms.uCapA.value.set(l[3],l[4],l[5]),this.uniforms.uShirtRot.value=l[6]??0):(this.uniforms.uShirtA.value.set(0,0,0),this.uniforms.uCapA.value.set(0,0,0))}setBackswing(t){this.pose={kind:"back",p:t},this.backFrame(t)}backFrame(t){const e=this.sheet,n=this.putter&&e===sn.drive?.25:1;this.setFrame(e.address+(e.top-e.address)*Math.max(0,Math.min(1,t))*n)}setFollow(t,e){this.pose={kind:"follow",t,from:e},this.followFrame(t,e)}followFrame(t,e){const n=this.sheet,i=this.putter&&n===sn.drive?.25:1,r=n.address+(n.top-n.address)*Math.max(0,Math.min(1,e))*i;if(t<.3){const a=t/.3,o=Math.max(r,n.top);this.setFrame(a<.08?r:o+(n.impact-o)*a)}else{const a=(t-.3)/.7,o=this.putter&&n===sn.drive?n.impact+6:n.finish;this.setFrame(n.impact+(o-n.impact)*Math.min(1,a*1.15))}}idle(t){}update(t){const e=t.position,n=this.ball;this.mesh.rotation.y=Math.atan2(e.x-n.x,e.z-n.z);const i=n.x-this.golferPos.x,r=n.z-this.golferPos.z,a=Math.hypot(i,r)||1,o=e.x-this.golferPos.x,l=e.z-this.golferPos.z,c=Math.hypot(o,l)||1,h=(o*i+l*r)/(c*a),u=(o*(r/a)+l*(-i/a))/c,p=h>.5&&!this.putter?"face":"dtl";(p!==this.view||p==="face"&&this.sheet!==sn.face&&sn.face.tex?.image)&&(this.view=p,this.chooseSheet());const d=p==="dtl"&&u>.35;d!==this.mirrored&&(this.mirrored=d,this.mesh.scale.x=d?-1:1)}}const Fh={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class es{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Sv=new No(-1,1,1,-1,0,1);class wv extends ge{constructor(){super(),this.setAttribute("position",new Qt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Qt([0,2,0,0,2,0],2))}}const bv=new wv;class qo{constructor(t){this._mesh=new Ft(bv,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,Sv)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class Tv extends es{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof pe?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=cn.clone(t.uniforms),this.material=new pe({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new qo(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Ac extends es{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){const i=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),r.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(i.EQUAL,1,4294967295),r.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),r.buffers.stencil.setLocked(!0)}}class Ev extends es{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class Av{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const n=t.getSize(new it);this._width=n.width,this._height=n.height,e=new Ze(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Rn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Tv(Fh),this.copyPass.material.blending=Cn,this.clock=new Wg}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let n=!1;for(let i=0,r=this.passes.length;i<r;i++){const a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}Ac!==void 0&&(a instanceof Ac?n=!0:a instanceof Ev&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new it);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,i)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Cv extends es{constructor(t,e,n=null,i=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new mt}render(t,e,n){const i=t.autoClear;t.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),t.autoClear=i}}const Rv={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new mt(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Ki extends es{constructor(t,e,n,i){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=i,this.resolution=t!==void 0?new it(t.x,t.y):new it(256,256),this.clearColor=new mt(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Ze(r,a,{type:Rn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const p=new Ze(r,a,{type:Rn});p.texture.name="UnrealBloomPass.h"+u,p.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(p);const d=new Ze(r,a,{type:Rn});d.texture.name="UnrealBloomPass.v"+u,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}const o=Rv;this.highPassUniforms=cn.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new pe({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new it(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=Fh;this.copyUniforms=cn.clone(h.uniforms),this.blendMaterial=new pe({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:Ts,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new mt,this.oldClearAlpha=1,this.basic=new Ke,this.fsQuad=new qo(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),i=Math.round(e/2);this.renderTargetBright.setSize(n,i);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,i),this.renderTargetsVertical[r].setSize(n,i),this.separableBlurMaterials[r].uniforms.invSize.value=new it(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(t,e,n,i,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=Ki.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Ki.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=a}getSeperableBlurMaterial(t){const e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new pe({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new it(.5,.5)},direction:{value:new it(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(t){return new pe({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}Ki.BlurDirectionX=new it(1,0);Ki.BlurDirectionY=new it(0,1);const Pv={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class Lv extends es{constructor(){super();const t=Pv;this.uniforms=cn.clone(t.uniforms),this.material=new Ug({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new qo(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},qt.getTransfer(this._outputColorSpace)===ee&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Hc?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Gc?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Vc?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Wc?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Xc?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===So&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Dv{constructor(t){this.scene=new Ql,this.props=new cv,this.golfer=new yv,this.crowd=new pv,this.dressing=new Mv,this.visual=null,this.course=null,this.quality=3,this.sunDir=new A,this.shadowFocus=new A,this.clockT=0,this.composer=null;const e=matchMedia("(pointer: coarse)").matches,n=new URL(location.href).searchParams.get("q");this.fixedPixelRatio=n==="test",this.lowSpec=n==="low"||e&&(navigator.hardwareConcurrency??8)<=4,this.renderer=new Q0({canvas:t,antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(n==="test"?.5:Math.min(window.devicePixelRatio,this.lowSpec?1.5:2)),this.renderer.outputColorSpace=re,this.renderer.toneMapping=So,this.renderer.toneMappingExposure=.78,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=kc,this.camera=new Ge(55,1,.1,4e3),this.sky=new Ds,this.sky.scale.setScalar(3500);const i=this.sky.material.uniforms;i.turbidity.value=4.5,i.rayleigh.value=1.4,i.mieCoefficient.value=.004,i.mieDirectionalG.value=.82,this.sunDir.copy(zi),i.sunPosition.value.copy(this.sunDir),this.scene.add(this.sky);const r=new ho(this.renderer),a=new Ql,o=new Ds;o.scale.setScalar(1e3),Object.assign(o.material.uniforms.sunPosition.value,this.sunDir),o.material.uniforms.turbidity.value=4.5,o.material.uniforms.rayleigh.value=1.4,a.add(o);const l=r.fromScene(a,.02).texture;this.scene.environment=l,this.scene.environmentIntensity=.55;const c=$o().sky;c.generateMipmaps=!1,c.minFilter=Ve,c.wrapS=on,this.skyDome=new Ft(new Is(3e3,48,24),new pe({uniforms:{map:{value:c}},vertexShader:"varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D map; varying vec3 vDir;
          void main(){
            vec3 d = normalize(vDir);
            float e = asin(clamp(d.y, -1.0, 1.0));
            float v = clamp((e + 0.025) / (1.5708 + 0.025), 0.004, 0.996);
            float u = atan(d.z, d.x) / 6.2831853 + 0.5;
            gl_FragColor = vec4(texture2D(map, vec2(u, v)).rgb, 1.0);
            #include <colorspace_fragment>
          }`,side:Le,depthWrite:!1,fog:!1,toneMapped:!1})),this.skyDome.renderOrder=-10;const h=(()=>{const d=document.createElement("canvas");d.width=d.height=256;const g=d.getContext("2d"),v=g.createRadialGradient(128,128,0,128,128,128);v.addColorStop(0,"rgba(255,250,235,1)"),v.addColorStop(.08,"rgba(255,244,214,0.9)"),v.addColorStop(.3,"rgba(255,226,170,0.25)"),v.addColorStop(1,"rgba(255,220,160,0)"),g.fillStyle=v,g.fillRect(0,0,256,256);const m=new je(d);return m.colorSpace=re,m})();this.sunGlow=new eg(new Mh({map:h,blending:Ts,depthWrite:!1,fog:!1,transparent:!0})),this.sunGlow.scale.setScalar(900),this.sunGlow.renderOrder=-9,this.scene.add(this.sunGlow),this.skyDome.frustumCulled=!1,this.scene.add(this.skyDome),this.sky.visible=!1,this.scene.fog=new Oo(11126750,300,1900),this.hemi=new kg(14084351,6974028,.8),this.scene.add(this.hemi),this.sun=new Vg(16773590,3),this.sun.castShadow=!0;const u=this.lowSpec?1024:2048;this.sun.shadow.mapSize.set(u,u);const p=this.sun.shadow.camera;p.left=-45,p.right=45,p.top=45,p.bottom=-45,p.near=1,p.far=400,this.sun.shadow.bias=-4e-4,this.sun.shadow.normalBias=.04,this.scene.add(this.sun,this.sun.target),this.scene.add(this.props.group),this.scene.add(this.crowd.group),this.scene.add(this.dressing.group),this.scene.add(this.golfer.root),this.fx=new hv(this.scene),this.reader=new dv(this.scene),this.grass=new vv(this.lowSpec?7e3:16e3,this.lowSpec?14:20),this.scene.add(this.grass.mesh),this.lowSpec&&(this.quality=2),this.lowSpec||(this.composer=new Av(this.renderer),this.composer.addPass(new Cv(this.scene,this.camera)),this.composer.addPass(new Ki(new it(256,256),.22,.6,.86)),this.composer.addPass(new Lv)),this.resize(),addEventListener("resize",()=>this.resize())}degrade(){if(this.quality===3&&this.composer)this.composer=null,this.quality=2;else if(this.quality>=2){const t=this.renderer.getPixelRatio();if(t>1.01){this.renderer.setPixelRatio(Math.max(1,t-.5)),this.resize();return}this.quality=1}else this.quality===1&&(this.sun.castShadow=!1,this.grass.mesh.count=Math.floor(this.grass.mesh.count/2),this.quality=0)}resize(){const t=innerWidth,e=innerHeight;this.renderer.setSize(t,e,!1),this.composer?.setPixelRatio(this.renderer.getPixelRatio()),this.composer?.setSize(t,e),this.renderer.domElement.style.width="100%",this.renderer.domElement.style.height="100%",this.camera.aspect=t/e,this.camera.fov=t<e?62:50,this.camera.updateProjectionMatrix()}loadCourse(t){this.visual&&(this.scene.remove(this.visual.group),this.visual.dispose()),this.course=t,this.visual=av(t,{lowSpec:this.lowSpec,reflect:!this.lowSpec&&this.quality>=2}),this.scene.add(this.visual.group),this.props.placeFor(t),this.reader.setCourse(t),this.crowd.placeFor(t),this.grass.setCourse(t),this.dressing.placeFor(t)}applyBrand(t){this.props.applyBrand(t),this.golfer.setBrand(t),this.fx.setBrand(t),this.reader.setColor(t.colors.light),this.crowd.applyBrand(t),this.dressing.applyBrand(t)}focusShadows(t){this.shadowFocus.lerp(t,.15);const e=this.shadowFocus;this.sun.position.set(e.x+this.sunDir.x*200,e.y+this.sunDir.y*200,e.z+this.sunDir.z*200),this.sun.target.position.copy(e)}render(t){this.clockT+=t,this.visual?.update(this.clockT),this.skyDome.position.copy(this.camera.position),this.sunGlow.position.copy(this.camera.position).addScaledVector(this.sunDir,2800),this.skyDome.rotation.y=this.clockT*.002;const e=this.course?.pin,n=e?this.camera.position.distanceTo(new A(e.x,e.y,e.z)):100;this.props.update(this.clockT,n),this.fx.update(t,this.camera,this.clockT),this.reader.update(t),this.golfer.update(this.camera),this.crowd.update(t),this.grass.update(t,this.fx.ball.position),this.composer?this.composer.render(t):this.renderer.render(this.scene,this.camera)}get time(){return this.clockT}pickGround(t,e){if(!this.visual)return null;const n=new Xg,i=new it(t/innerWidth*2-1,-(e/innerHeight)*2+1);n.setFromCamera(i,this.camera);const r=this.visual.group.getObjectByName("terrain");if(!r)return null;const a=n.intersectObject(r,!1)[0];return a?a.point:null}}const Yt=(s,t,e)=>{const n=document.createElement(s);return t&&(n.className=t),e!==void 0&&(n.innerHTML=e),n},_a={map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',arrow:'<svg viewBox="0 0 24 24"><path d="M12 2 19 13h-5v9h-4v-9H5z" fill="currentColor"/></svg>'};class Iv{constructor(t){this.toastTimer=0,this.miniTimer=0,this.root=t,this.hud=this.buildHud(),this.toastEl=Yt("div","toast passthrough"),this.miniEl=Yt("div","mini passthrough"),this.title=Yt("div","overlay title-screen"),this.holeCard=Yt("div","overlay holecard passthrough"),this.scoreCard=Yt("div","overlay"),this.studio=Yt("div","overlay studio"),this.pause=Yt("div","overlay pause"),this.loading=Yt("div","overlay loading show",'<div class="spinner"></div><p>LOADING COURSE</p>'),this.fadeEl=Yt("div","fade"),this.board=Yt("div","overlay board"),this.nameBox=Yt("div","overlay namebox"),t.append(this.board,this.nameBox,this.hud.root,this.toastEl,this.miniEl,this.holeCard,this.scoreCard,this.title,this.studio,this.pause,this.fadeEl,this.loading)}buildHud(){const t=Yt("div","hud"),e=Yt("div","topbar"),n=Yt("div","scorebox"),i=(L,D="")=>{const N=Yt("div",D,`<small>${L}</small><b>-</b>`);return n.append(N),N.querySelector("b")},r=i("HOLE"),a=i("PAR"),o=i("SHOT"),l=i("TOTAL","tp"),c=Yt("div","rightcol"),h=Yt("div","wind",`<div class="dial">${_a.arrow}</div><div><small>WIND</small><b>0.0</b><small>M/S</small></div>`),u=Yt("div","lie","<small>LIE</small><b>100%</b><small>TEE</small>");c.append(h,u),e.append(n,c);const p=Yt("div","pinpill passthrough","<small>TO PIN</small><span>0 M</span>"),d=Yt("div","pinmark passthrough hide","PIN"),g=Yt("button","menubtn",_a.menu);g.setAttribute("aria-label","Menu");const v=Yt("div","bottombar"),m=Yt("div","club"),f=Yt("button","","&#9664;");f.setAttribute("aria-label","Previous club");const _=Yt("button","","&#9654;");_.setAttribute("aria-label","Next club");const M=Yt("div","name","<b>DR</b><small>228 M</small>");m.append(f,M,_);const x=Yt("div","rightbtns"),P=Yt("button","iconbtn",_a.map);P.setAttribute("aria-label","Toggle map view"),x.append(P),v.append(m,x);const T=Yt("div","pad",'<div class="label">PULL BACK</div><div class="ring"><div class="ball"></div></div>'),E=Yt("div","pull",'<div class="track"></div><div class="meter"><i></i><em></em></div><div class="pct">0%</div><div class="knob"></div>'),R=Yt("div","hint","Drag to aim &middot; Pull ball down &amp; flick up"),S=Yt("div","tmeter passthrough",'<div class="tlabel">TAP TO SWING</div><div class="tbar"><div class="thook"></div><div class="tfill"></div><div class="tsweet"></div><div class="tzero"></div><i class="ttick" style="left:33%"></i><i class="ttick" style="left:55.4%"></i><i class="ttick" style="left:77.7%"></i><div class="tnotch"></div><div class="tmarker"></div></div><div class="tpct">0%</div>'),y=Yt("div","swipeguide passthrough",'<svg class="trail" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="" /></svg><div class="sg-arrow"><svg viewBox="0 0 40 120"><path d="M20 4 36 30H26v86H14V30H4z" fill="currentColor"/></svg></div><div class="sg-label">SWIPE UP STRAIGHT</div>');return t.append(e,p,d,g,v,R,S,T,E,y),{root:t,hole:r,par:a,shot:o,toPar:l,windArrow:h.querySelector("svg"),windSpeed:h.querySelector("b"),lieVal:u.querySelector("b"),lieName:u.querySelectorAll("small")[1],pin:p.querySelector("span"),pinMark:d,clubName:M.querySelector("b"),clubDist:M.querySelector("small"),clubPrev:f,clubNext:_,viewBtn:P,menuBtn:g,pad:T,padLabel:T.querySelector(".label"),pull:E,pullTrack:E.querySelector(".track"),pullKnob:E.querySelector(".knob"),pullMeter:E.querySelector(".meter"),pullFill:E.querySelector(".meter i"),pullPct:E.querySelector(".pct"),hint:R,tmeter:S,tLabel:S.querySelector(".tlabel"),tMarker:S.querySelector(".tmarker"),tNotch:S.querySelector(".tnotch"),tFill:S.querySelector(".tfill"),tSweet:S.querySelector(".tsweet"),tPct:S.querySelector(".tpct"),swipeGuide:y,swipeTrail:y.querySelector("polyline")}}showHud(t){this.hud.root.classList.toggle("show",t)}toast(t,e="",n=1700){this.toastEl.innerHTML=`<b>${t}</b>${e?`<small>${e}</small>`:""}`,this.toastEl.classList.add("show"),clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>this.toastEl.classList.remove("show"),n)}mini(t,e=1600){this.miniEl.textContent=t,this.miniEl.classList.add("show"),clearTimeout(this.miniTimer),this.miniTimer=window.setTimeout(()=>this.miniEl.classList.remove("show"),e)}show(t,e){t.classList.toggle("show",e)}async fade(t){this.fadeEl.classList.add("on"),await bs(300),await t(),await bs(60),this.fadeEl.classList.remove("on")}renderTitle(t,e,n,i,r,a,o="timing",l=()=>{},c=()=>{},h=null,u=()=>{}){const p=t.brand,d=p.gameTitle.split(" "),g=d.pop();this.title.innerHTML=`
      <div class="title-top">
        <img alt="${p.name}" src="${Uv(t)}"/>
        <h1>${d.join(" ")}${d.length?"<br/>":""}<span>${g}</span></h1>
        <p>${p.courseName}</p>
      </div>
      <div class="title-bottom">
        <div class="row">
          <button class="btn start" data-a="play">Start Now<small>Quick 3 holes${e[0]!==null?` &middot; best ${e[0]}`:""}</small></button>
          <button class="btn start" data-a="play9">Start Now<small>Full 9 holes${e[1]!==null?` &middot; best ${e[1]}`:""}</small></button>
        </div>
        <button class="btn ghost" data-a="ctp">Closest to the Pin${h!==null?` &middot; Best ${h.toFixed(2)} M`:" &middot; 3 Balls"}</button>
        <button class="btn ghost" data-a="mute">${r?"Sound Off":"Sound On"}</button>
        <div class="foot">${p.tagline.toUpperCase()}</div>
      </div>`,this.title.querySelector('[data-a="play"]').onclick=()=>n(3),this.title.querySelector('[data-a="play9"]').onclick=()=>n(9),this.title.querySelector('[data-a="mute"]').onclick=a,this.title.querySelector('[data-a="ctp"]').onclick=c}renderHoleCard(t,e,n,i){this.holeCard.innerHTML=`<div class="inner"><div class="n">HOLE ${t}</div><h2>${e.toUpperCase()}</h2><div class="meta"><span>PAR ${n}</span><span>${i} M</span></div><div class="tap">TAP TO SKIP</div></div>`}renderScorecard(t,e,n,i){const r=n.reduce((h,u)=>h+(u.strokes??0),0),a=n.reduce((h,u)=>h+(u.strokes!==null?u.par:0),0),o=r-a,l=o===0?"E":o>0?`+${o}`:`${o}`,c=(h,u)=>h===null?"":h===1?"ace":h<u?"under":h>u?"over":"";this.scoreCard.innerHTML=`<div class="card">
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
      <button class="btn ghost" data-a="s">Brand Studio</button>
      <button class="btn ghost" data-a="m">${r?"Sound Off":"Sound On"}</button>
      <button class="btn ghost" data-a="x">Restart Round</button>
      <button class="btn ghost" data-a="q">Main Menu</button></div>`;const c=h=>this.pause.querySelector(`[data-a="${h}"]`);c("r").onclick=t,c("s").onclick=n,c("m").onclick=a,c("x").onclick=e,c("q").onclick=i,c("w").onclick=l}renderBoard(t,e,n,i,r){const a=[["ctp","Closest to Pin"],["r3","3 Holes"],["r9","9 Holes"]];this.board.innerHTML=`<div class="card lb">
      <h3>LEADERBOARD</h3>
      <div class="tabs">${a.map(([d,g])=>`<button data-m="${d}" class="${d===e?"on":""}">${g}</button>`).join("")}</div>
      <div class="lbstatus"></div>
      <ol class="lbrows"></ol>
      <div class="row"><button class="btn ghost" data-a="rename">Change Name</button><button class="btn" data-a="close">Close</button></div>
    </div>`;const o=this.board.querySelector(".lbstatus"),l={off:"The shared leaderboard works when the game is opened on claude.ai.",loading:"Loading scores...",stale:"Can't reach the leaderboard yet. Scores may be out of date.",readonly:"View only: ask the owner for Contributor access to post your scores.",ready:""};o.textContent=l[t.status]??"";const c=this.board.querySelector(".lbrows"),h=t.top(e,15);if(!h.length&&t.status!=="off"){const d=document.createElement("li");d.className="empty",d.textContent=e==="ctp"?"No scores yet. Play Closest to the Pin to set the first.":"No rounds yet. Finish a round to set the first score.",c.append(d)}h.forEach((d,g)=>{const v=document.createElement("li");d.id===t.uid&&(v.className="me");const m=document.createElement("b");m.textContent=String(g+1);const f=document.createElement("span");f.textContent=d.name||"Player";const _=document.createElement("em"),M=d[e];_.textContent=e==="ctp"?M===0?"ACE":`${M.toFixed(2)} M`:`${M}`,v.append(m,f,_),c.append(v)});const u=t.mine?.[e];if(typeof u=="number"&&!h.some(d=>d.id===t.uid)){const d=document.createElement("li");d.className="me";const{rank:g}=t.rankOf(e,u);d.append(Object.assign(document.createElement("b"),{textContent:String(g)}),Object.assign(document.createElement("span"),{textContent:t.myName||"You"}),Object.assign(document.createElement("em"),{textContent:e==="ctp"?`${u.toFixed(2)} M`:String(u)})),c.append(d)}this.board.querySelectorAll("[data-m]").forEach(d=>d.onclick=()=>n(d.dataset.m)),this.board.querySelector('[data-a="close"]').onclick=i;const p=this.board.querySelector('[data-a="rename"]');p.onclick=r,p.disabled=!t.canPost}askName(t){return new Promise(e=>{this.nameBox.innerHTML=`<form class="card"><h3>YOUR NAME</h3><div class="sub">SHOWN ON THE SHARED LEADERBOARD</div>
        <div class="texts"><label>NAME<input id="lbname" maxlength="16" autocomplete="nickname" required /></label></div>
        <div class="row" style="margin-top:12px"><button type="button" class="btn ghost" data-a="skip">Skip</button><button class="btn" type="submit">Save</button></div></form>`;const n=this.nameBox.querySelector("input");n.value=t;const i=this.nameBox.querySelector("form"),r=a=>{this.show(this.nameBox,!1),e(a)};i.onsubmit=a=>{a.preventDefault();const o=n.value.replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,16);r(o||null)},this.nameBox.querySelector('[data-a="skip"]').onclick=()=>r(null),this.show(this.nameBox,!0),setTimeout(()=>n.focus(),50)})}renderStudio(t,e,n){const i=t.brand,r=(c,h,u)=>`<label class="sw">${h}<input type="color" data-p="${c}" value="${Nv(u)}"/></label>`,a=c=>`<button data-preset="${c.id}" class="${c.id===i.id?"on":""}"><i style="background:${c.colors.primary}"></i>${c.name}</button>`;this.studio.innerHTML=`<div class="sheet">
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
        <label>GAME TITLE<input data-x="gameTitle" value="${gr(i.gameTitle)}" maxlength="24"/></label>
        <label>COURSE NAME<input data-x="courseName" value="${gr(i.courseName)}" maxlength="32"/></label>
        <label>TAGLINE (BOARDS)<input data-x="tagline" value="${gr(i.tagline)}" maxlength="40"/></label>
        <label>BRAND NAME<input data-x="name" value="${gr(i.name)}" maxlength="32"/></label>
      </div>
      <h4>LOGO &amp; EXPORT</h4>
      <div class="actions">
        <label>Upload logo<input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" data-a="logo"/></label>
        <button data-a="logo-reset">Preset logo</button>
        <button data-a="export">Download brand.json</button>
        <button data-a="copy">Copy JSON</button>
      </div>
    </div>`;const o=this.studio.querySelector("[data-previews]");e.forEach(c=>o.append(c)),this.studio.querySelector('[data-a="close"]').onclick=n,this.studio.querySelectorAll("[data-preset]").forEach(c=>{c.onclick=async()=>{await t.selectPreset(c.dataset.preset),this.renderStudio(t,e,n)}}),this.studio.querySelectorAll("input[type=color]").forEach(c=>{c.oninput=()=>t.patch(c.dataset.p,c.value)}),this.studio.querySelectorAll("input[data-t]").forEach(c=>{c.onchange=()=>t.patch(c.dataset.t,c.checked)}),this.studio.querySelectorAll("input[data-x]").forEach(c=>{c.onchange=()=>t.patch(c.dataset.x,c.value||" ")});const l=this.studio.querySelector('[data-a="logo"]');l.onchange=()=>{const c=l.files?.[0];if(!c)return;const h=new FileReader;h.onload=()=>t.setCustomLogo(String(h.result)),h.readAsDataURL(c)},this.studio.querySelector('[data-a="logo-reset"]').onclick=()=>t.setCustomLogo(null),this.studio.querySelector('[data-a="export"]').onclick=()=>{const c=new Blob([t.exportJson()],{type:"application/json"}),h=document.createElement("a");h.href=URL.createObjectURL(c),h.download="brand.json",h.click(),setTimeout(()=>URL.revokeObjectURL(h.href),2e3)},this.studio.querySelector('[data-a="copy"]').onclick=async()=>{try{await navigator.clipboard.writeText(t.exportJson()),this.mini("brand.json copied")}catch{this.mini("Copy blocked: use Download")}}}}function Uv(s){const t=s.brand.logoImg;return t?t.src:_o(s.brand.id,s.brand.logo)}function Nv(s){return/^#[0-9a-f]{6}$/i.test(s)?s:/^#[0-9a-f]{3}$/i.test(s)?"#"+s.slice(1).split("").map(t=>t+t).join(""):"#ffffff"}function gr(s){return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}const bs=s=>new Promise(t=>setTimeout(t,s));function Fv(s,t,e,n,i){const r=t.filter(o=>o!==null),a=r.length?Math.min(...r):null;s.scoreCard.innerHTML=`<div class="card">
    <h3>CLOSEST TO THE PIN</h3>
    <div class="sub">${a!==null?`BEST BALL ${a.toFixed(2)} M`:"NO BALL ON DRY LAND"}${n?"  ·  NEW RECORD":e!==null?`  ·  RECORD ${e.toFixed(2)} M`:""}</div>
    <table class="sc"><tr><th></th><th>BALL 1</th><th>BALL 2</th><th>BALL 3</th></tr>
    <tr><td class="lbl">TO PIN</td>${t.map(o=>`<td class="${o!==null&&o===a?"tot":""}">${o===null?"WET":o===0?"ACE":`${o.toFixed(2)} M`}</td>`).join("")}</tr></table>
    <div style="display:flex;flex-direction:column;gap:10px">${i.map((o,l)=>`<button class="btn ${o.ghost?"ghost":""}" data-i="${l}">${o.label}</button>`).join("")}</div>
  </div>`,s.scoreCard.querySelectorAll("button[data-i]").forEach(o=>{o.onclick=()=>i[Number(o.dataset.i)].on()})}const ms=40,Cc=392,Rc=.088;function Ov(s,t=172){const e=Math.min(2,window.devicePixelRatio||1),n=Math.round(t*e),{dimples:i,sorted:r}=zv(),a=Bv(s,i,r),o=document.createElement("canvas");o.width=n,o.height=n*ms;const l=o.getContext("2d"),c=.38,h=Math.cos(c),u=Math.sin(c),p=Ma([-.5,.62,.62]),d=Ma([.7,-.2,.5]),g=Ma([p[0],p[1],p[2]+1]),v=l.createImageData(n,n),m=v.data,f=n/2-1.5,_=Math.cos(Rc),{w:M,h:x,idx:P,col:T}=a;for(let y=0;y<ms;y++){const L=y/ms*Math.PI*2,D=Math.cos(L),N=Math.sin(L);for(let H=0;H<n;H++)for(let B=0;B<n;B++){const G=(H*n+B)*4,Y=(B+.5-n/2)/f,z=-(H+.5-n/2)/f,V=Y*Y+z*z;if(V>=1){m[G+3]=0;continue}const Q=Math.sqrt(1-V),st=z*h+Q*u,at=-z*u+Q*h,Dt=Y,X=Dt*D+at*N,tt=st,ot=-Dt*N+at*D,et=Math.atan2(X,ot),yt=Math.asin(tt>1?1:tt<-1?-1:tt);let Mt=et/(Math.PI*2)+.5;Mt-=Math.floor(Mt);const At=.5-yt/Math.PI,Bt=Math.min(x-1,At*x|0)*M+(Mt*M|0);let Ct=Y,Xt=z,I=Q,he=1;const Ut=P[Bt];if(Ut>=0){const It=i[Ut],nt=It[0]*X+It[1]*tt+It[2]*ot;if(nt>_){const Pt=Math.acos(Math.min(1,nt))/Rc;let Lt=It[0]-X*nt,xt=It[1]-tt*nt,Vt=It[2]-ot*nt;const Ot=Math.hypot(Lt,xt,Vt)||1;Lt/=Ot,xt/=Ot,Vt/=Ot;const ie=Lt*D-Vt*N,U=Lt*N+Vt*D,ht=xt,q=ie,J=ht*h-U*u,ft=ht*u+U*h,ut=.55*Math.sin(Pt*Math.PI*.5)*(Pt>.82?(1-Pt)/.18:1);Ct+=q*ut,Xt+=J*ut,I+=ft*ut;const Nt=Math.hypot(Ct,Xt,I);Ct/=Nt,Xt/=Nt,I/=Nt,he=.86+.14*Pt}}const dt=Math.max(0,Ct*p[0]+Xt*p[1]+I*p[2]),gt=Math.max(0,Ct*d[0]+Xt*d[1]+I*d[2]),$t=Math.pow(Math.max(0,Ct*g[0]+Xt*g[1]+I*g[2]),70)*.42,wt=Math.pow(Math.max(0,Ct*g[0]+Xt*g[1]+I*g[2]),8)*.08,C=Math.pow(1-Q,2.5),w=(.3+dt*.78+gt*.16)*he,k=Bt*3,Z=175,j=200,K=230,St=C*.35*(.5+.5*z),ct=Math.min(1,(1-Math.sqrt(V))*f*1.2),vt=1-Math.max(0,-z)*.18;for(let It=0;It<3;It++){const nt=T[k+It]*w*vt,_t=It===0?Z:It===1?j:K;m[G+It]=Math.min(255,nt*(1-St)+_t*St+($t+wt)*255)}m[G+3]=255*ct}l.putImageData(v,0,y*n)}const E=document.createElement("div");E.className="ballload",E.style.setProperty("--ball",`${t}px`),E.style.setProperty("--frames",String(ms));const R=document.createElement("div");R.className="ballwin",o.className="ballstrip",o.style.width=`${t}px`,o.style.height=`${t*ms}px`,R.append(o);const S=document.createElement("div");return S.className="ballshadow",E.append(R,S),E}function zv(){const s=[],t=Math.PI*(3-Math.sqrt(5));for(let n=0;n<Cc;n++){const i=1-(n+.5)/Cc*2,r=Math.sqrt(1-i*i);s.push([Math.cos(t*n)*r,i,Math.sin(t*n)*r])}const e=s.map((n,i)=>i).sort((n,i)=>s[n][1]-s[i][1]);return{dimples:s,sorted:e}}function Bv(s,t,e){const r=document.createElement("canvas");r.width=768,r.height=384;const a=r.getContext("2d");a.fillStyle="#f6f5f1",a.fillRect(0,0,768,384);const o=768*.22,l=384*.15;a.globalAlpha=.94;for(const d of[768*.5,0,768])ai(a,s,d-o/2,384/2-l/2,o,l,s.colors.dark);a.globalAlpha=1;const c=a.getImageData(0,0,768,384).data,h=new Uint8Array(768*384*3),u=new Int16Array(768*384).fill(-1),p=e.map(d=>t[d][1]);for(let d=0;d<384;d++){const g=(.5-(d+.5)/384)*Math.PI,v=Math.sin(g),m=Math.cos(g);let f=0,_=p.length;const M=v-.2,x=v+.2;for(;f<_;){const T=f+_>>1;p[T]<M?f=T+1:_=T}const P=f;for(let T=0;T<768;T++){const E=((T+.5)/768-.5)*Math.PI*2,R=Math.sin(E)*m,S=Math.cos(E)*m;let y=-2,L=-1;for(let N=P;N<p.length&&p[N]<=x;N++){const H=t[e[N]],B=H[0]*R+H[1]*v+H[2]*S;B>y&&(y=B,L=e[N])}const D=d*768+T;u[D]=L,h[D*3]=c[D*4],h[D*3+1]=c[D*4+1],h[D*3+2]=c[D*4+2]}}return{w:768,h:384,idx:u,col:h}}function Ma(s){const t=Math.hypot(s[0],s[1],s[2]);return[s[0]/t,s[1]/t,s[2]/t]}class kv{constructor(){this.ctx=null,this.master=null,this.noiseBuf=null,this.ambience=null,this.muted=!1,this.samples=new Map,this.voiceBusyUntil=0,this.lastLine="";try{this.muted=localStorage.getItem("hio.muted")==="1"}catch{}}unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=this.muted?0:.9,this.master.connect(this.ctx.destination);const e=this.ctx.sampleRate*2;this.noiseBuf=this.ctx.createBuffer(1,e,this.ctx.sampleRate);const n=this.noiseBuf.getChannelData(0);for(let i=0;i<e;i++)n[i]=Math.random()*2-1;this.startAmbience(),this.loadSamples()}loadSamples(){const t="/golf/",e=["vo-strike","vo-perfect","vo-middle","vo-green","vo-close","vo-bunker","vo-water","vo-ob","vo-birdie","vo-eagle","vo-ace","vo-par","vo-lipout","vo-trees","crowd-roar","crowd-applause","crowd-groan"];for(const n of e)fetch(`${t}audio/${n}.mp3`).then(i=>i.arrayBuffer()).then(i=>this.ctx.decodeAudioData(i)).then(i=>this.samples.set(n,i)).catch(()=>{})}playSample(t,e,n=0){const i=this.samples.get(t);if(!i||!this.ctx||!this.master)return 0;const r=this.ctx.createBufferSource();r.buffer=i;const a=this.ctx.createGain();return a.gain.value=e,r.connect(a).connect(this.master),r.start(this.ctx.currentTime+n),i.duration}say(t,e=.25){if(!this.ctx)return;const n=this.ctx.currentTime;if(n<this.voiceBusyUntil||t===this.lastLine&&n<this.voiceBusyUntil+4)return;const i=this.playSample(`vo-${t}`,1.15,e);i&&(this.voiceBusyUntil=n+e+i,this.lastLine=t)}crowd(t,e=.8){this.playSample(`crowd-${t}`,e)||(t==="groan"?this.groan():this.cheer(t==="roar"))}setMuted(t){this.muted=t;try{localStorage.setItem("hio.muted",t?"1":"0")}catch{}this.master&&this.ctx&&this.master.gain.setTargetAtTime(t?0:.9,this.ctx.currentTime,.05)}noise(t,e,n,i,r,a=1,o=0){if(!this.ctx||!this.master||!this.noiseBuf)return;const l=this.ctx.currentTime+o,c=this.ctx.createBufferSource();c.buffer=this.noiseBuf;const h=this.ctx.createBiquadFilter();h.type=e,h.Q.value=a,h.frequency.setValueAtTime(n,l),h.frequency.exponentialRampToValueAtTime(Math.max(20,i),l+t);const u=this.ctx.createGain();u.gain.setValueAtTime(1e-4,l),u.gain.exponentialRampToValueAtTime(r,l+Math.min(.03,t*.3)),u.gain.exponentialRampToValueAtTime(1e-4,l+t),c.connect(h).connect(u).connect(this.master),c.start(l,Math.random()),c.stop(l+t+.05)}tone(t,e,n,i="sine",r=0,a){if(!this.ctx||!this.master)return;const o=this.ctx.currentTime+r,l=this.ctx.createOscillator();l.type=i,l.frequency.setValueAtTime(t,o),a&&l.frequency.exponentialRampToValueAtTime(a,o+e);const c=this.ctx.createGain();c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(n,o+.005),c.gain.exponentialRampToValueAtTime(1e-4,o+e),l.connect(c).connect(this.master),l.start(o),l.stop(o+e+.05)}swing(t){this.noise(.28,"bandpass",400,2400,.25+t*.35,1.5)}strike(t,e){this.tone(e?1900:1500,.06,.5,"triangle"),this.noise(.08,"highpass",3e3,6e3,.5*(.5+t)),this.tone(180,.12,.35,"sine",0,90),e&&this.tone(2600,.25,.12,"sine",.02)}putt(){this.tone(900,.05,.35,"triangle"),this.noise(.04,"highpass",2500,4e3,.2)}land(t,e){const n=Math.min(.5,.08+e*.015);t==="bunker"?this.noise(.25,"lowpass",1800,300,n):this.noise(.12,"lowpass",900,150,n)}tree(){for(let t=0;t<4;t++)this.noise(.12,"bandpass",2500,1200,.15,2,t*.05);this.tone(320,.08,.2,"square",.02,200)}splash(){this.noise(.6,"lowpass",3e3,200,.5),this.noise(.4,"bandpass",800,400,.3,1,.08)}cup(){this.tone(1200,.05,.3,"triangle"),this.tone(900,.05,.25,"triangle",.09),this.tone(700,.08,.3,"triangle",.17),this.noise(.15,"lowpass",600,100,.3,1,.2)}cheer(t){const e=t?14:6;for(let n=0;n<e;n++)this.noise(.5+Math.random()*.6,"bandpass",1200+Math.random()*1500,700,t?.12:.07,.8,n*.06);for(let n=0;n<(t?40:18);n++)this.noise(.03,"highpass",1500,2500,.08+Math.random()*.08,1,.1+Math.random()*(t?2.2:1.3))}groan(){for(let t=0;t<6;t++)this.noise(.9,"bandpass",500+Math.random()*200,250,.06,1,t*.05)}ui(){this.tone(1400,.04,.15,"triangle")}tick(t){this.tone(500+t*900,.025,.05,"sine")}startAmbience(){if(!this.ctx||!this.master||!this.noiseBuf)return;const t=this.ctx,e=t.createBufferSource();e.buffer=this.noiseBuf,e.loop=!0;const n=t.createBiquadFilter();n.type="lowpass",n.frequency.value=380;const i=t.createGain();i.gain.value=.035,e.connect(n).connect(i).connect(this.master),e.start();let r=!0;const a=()=>{if(!r)return;const o=2600+Math.random()*1800,l=2+Math.floor(Math.random()*4);for(let c=0;c<l;c++)this.tone(o,.09,.025,"sine",c*.13,o*(1.2+Math.random()*.3));setTimeout(a,2500+Math.random()*6e3)};setTimeout(a,1500),this.ambience={stop(){r=!1,e.stop()}}}}const gs=[{id:1,name:"The Opener",par:4,seed:11,path:[[0,0],[0,-60],[3,-150],[20,-238],[42,-305],[52,-342]],widths:[0,30,36,34,30,26],fairwayStart:24,green:{x:52,z:-342,rx:15,rz:12.5,rot:.45,slope:[.011,-.014]},pin:[55,-345],bunkers:[{x:27,z:-218,rx:9,rz:6,rot:.6},{x:-14,z:-232,rx:7,rz:5,rot:-.3},{x:36,z:-334,rx:6,rz:4,rot:1.1},{x:68,z:-350,rx:5.5,rz:4.5,rot:.2}],water:[],teeLift:1.6,windSeed:101},{id:2,name:"Lakeside",par:3,seed:22,path:[[0,0],[-3,-70],[-6,-125],[-8,-156]],widths:[0,0,22,20],fairwayStart:118,green:{x:-8,z:-156,rx:14,rz:12,rot:-.25,slope:[-.012,.009]},pin:[-11,-153],bunkers:[{x:-24,z:-168,rx:6,rz:4,rot:.5},{x:9,z:-150,rx:4.5,rz:6,rot:.1}],water:[{x:-4,z:-82,rx:34,rz:28,rot:.15}],teeLift:2.2,windSeed:202},{id:3,name:"Home Stretch",par:5,seed:33,path:[[0,0],[0,-90],[-10,-190],[-40,-280],[-56,-365],[-50,-440],[-44,-480]],widths:[0,32,36,34,32,28,24],fairwayStart:26,green:{x:-44,z:-480,rx:16,rz:13,rot:.2,slope:[.008,.013]},pin:[-41,-484],bunkers:[{x:-27,z:-214,rx:8,rz:5,rot:.7},{x:-64,z:-300,rx:7,rz:5,rot:-.2},{x:-62,z:-472,rx:5,rz:6,rot:.3},{x:-27,z:-490,rx:5,rz:4,rot:-.4}],water:[{x:-52,z:-410,rx:36,rz:9,rot:.06}],teeLift:1.2,windSeed:303},{id:4,name:"Pine Valley Run",par:4,seed:44,path:[[0,0],[0,-70],[-4,-170],[-22,-260],[-40,-345],[-46,-378]],widths:[0,30,34,32,28,24],fairwayStart:24,green:{x:-46,z:-378,rx:14,rz:12,rot:-.3,slope:[-.01,.012]},pin:[-43,-382],bunkers:[{x:-28,z:-185,rx:8,rz:5,rot:.4},{x:18,z:-215,rx:7,rz:5,rot:-.5},{x:-62,z:-372,rx:5,rz:4,rot:.6}],water:[{x:-80,z:-330,rx:18,rz:26,rot:.3}],teeLift:1.4,windSeed:404},{id:5,name:"The Island",par:3,seed:55,path:[[0,0],[2,-70],[4,-136]],widths:[0,0,0],fairwayStart:999,green:{x:4,z:-136,rx:13,rz:11,rot:.2,slope:[.008,-.008]},pin:[6,-138],bunkers:[{x:3,z:-148,rx:5,rz:2.6,rot:.15}],water:[{x:4,z:-120,rx:40,rz:42,rot:.1}],teeLift:2,windSeed:505,greenBlend:1.32},{id:6,name:"Ridge Line",par:5,seed:66,path:[[0,0],[0,-90],[16,-190],[40,-280],[38,-370],[18,-450],[10,-498]],widths:[0,32,34,32,30,28,24],fairwayStart:24,green:{x:10,z:-498,rx:15,rz:13,rot:.5,slope:[.012,.006]},pin:[13,-500],bunkers:[{x:32,z:-170,rx:8,rz:5,rot:.3},{x:58,z:-300,rx:7,rz:5,rot:0},{x:26,z:-412,rx:11,rz:3.5,rot:.35},{x:-6,z:-492,rx:5,rz:4,rot:0},{x:26,z:-510,rx:5,rz:4,rot:.5}],water:[],teeLift:1.8,windSeed:606},{id:7,name:"Lakeshore",par:4,seed:77,path:[[0,0],[0,-100],[-6,-220],[-4,-330],[0,-362]],widths:[0,30,30,28,24],fairwayStart:24,green:{x:0,z:-362,rx:14,rz:12,rot:.1,slope:[.012,-.01]},pin:[3,-365],bunkers:[{x:-22,z:-240,rx:8,rz:5,rot:-.3},{x:-16,z:-357,rx:5,rz:4,rot:.4}],water:[{x:44,z:-205,rx:22,rz:120,rot:.02}],teeLift:1.2,windSeed:707},{id:8,name:"Downhill Drop",par:3,seed:88,path:[[0,0],[-6,-90],[-10,-176]],widths:[0,0,22],fairwayStart:140,green:{x:-10,z:-176,rx:15,rz:13,rot:-.4,slope:[.01,.012]},pin:[-13,-179],bunkers:[{x:-29,z:-170,rx:6,rz:5,rot:.3},{x:9,z:-183,rx:6,rz:4,rot:-.2},{x:-12,z:-157,rx:9,rz:3,rot:.1}],water:[],teeLift:5.5,windSeed:808},{id:9,name:"The Closer",par:4,seed:99,path:[[0,0],[0,-120],[12,-230],[45,-320],[70,-385],[78,-412]],widths:[0,32,32,30,28,24],fairwayStart:24,green:{x:78,z:-412,rx:15,rz:13,rot:.6,slope:[-.01,-.012]},pin:[80,-416],bunkers:[{x:61,z:-404,rx:5,rz:4,rot:.3},{x:94,z:-421,rx:6,rz:4,rot:.5},{x:-8,z:-232,rx:7,rz:5,rot:-.2}],water:[{x:58,z:-232,rx:22,rz:30,rot:.4}],teeLift:1.6,windSeed:909}],Hv=9.81,Gv=.0214,Vv=.0031,Wv=.0046,Xv=6.5,$v=.004166667,qv=28,Yv=.054,Zv=1.45,Kv=2.2,jv=32,Jv=.1,Qv=1.03,tx=4.5,ex=24,nx=[{id:"DR",name:"Driver",carry:228,launch:12.5,spin:.6,check:0},{id:"3W",name:"3 Wood",carry:205,launch:13.5,spin:.7,check:.05},{id:"5I",name:"5 Iron",carry:172,launch:17,spin:.9,check:.15},{id:"7I",name:"7 Iron",carry:148,launch:21,spin:1.05,check:.3},{id:"9I",name:"9 Iron",carry:124,launch:26,spin:1.15,check:.45},{id:"PW",name:"Pitching Wedge",carry:104,launch:30,spin:1.25,check:.6},{id:"SW",name:"Sand Wedge",carry:78,launch:37,spin:1.3,check:.75},{id:"PT",name:"Putter",carry:0,launch:0,spin:0,check:0}],ix={tee:{restitution:.3,retain:.6,roll:1.6,lie:[100,100],skid:.32},fairway:{restitution:.3,retain:.6,roll:1.6,lie:[96,100],skid:.32},firstCut:{restitution:.24,retain:.5,roll:2.8,lie:[88,96],skid:.45},rough:{restitution:.16,retain:.35,roll:5.5,lie:[72,88],skid:.7},fringe:{restitution:.18,retain:.45,roll:1.25,lie:[95,100],skid:.9},green:{restitution:.15,retain:.42,roll:.58,lie:[100,100],skid:.9},bunker:{restitution:.04,retain:.12,roll:14,lie:[55,70],skid:1.5},water:{restitution:0,retain:0,roll:99,lie:[0,0],skid:0},ob:{restitution:.18,retain:.45,roll:5.2,lie:[0,0],skid:.7}},sx={maxSpeed:6.5},rx=2.5,Kt={gravity:Hv,ballRadius:Gv,dragK:Vv,liftK:Wv,spinDecaySec:Xv,dt:$v,maxSimSec:qv,cupRadius:Yv,cupCaptureSpeed:Zv,cupLipSpeed:Kv,maxPuttDistance:jv,perfectWindow:Jv,perfectBonus:Qv,pushDeg:tx,curveDeg:ex,clubs:nx,surfaces:ix,wind:sx,skidThreshold:rx},wr=Kt.gravity,ei=Kt.ballRadius,Cr=Kt.surfaces;function He(s){return{x:Math.sin(s),z:-Math.cos(s)}}function Ni(s,t){return Math.atan2(s,-t)}function Oh(s,t,e){const n=t*Math.PI/180;let i=0,r=0,a=s*Math.cos(n),o=s*Math.sin(n),l=e,c=0;const h=Kt.dt;for(let u=0;u<2e4;u++){const p=Math.hypot(a,o),d=-.0031*p*a+Kt.liftK*l*p*-o,g=-wr-Kt.dragK*p*o+Kt.liftK*l*p*a;if(a+=d*h,o+=g*h,i+=a*h,r+=o*h,l*=Math.exp(-h/Kt.spinDecaySec),c=Math.max(c,r),r<0&&o<0)return{carry:i,apex:c}}return{carry:i,apex:c}}function ax(s,t,e){let n=5,i=120;for(let r=0;r<40;r++){const a=(n+i)/2;Oh(a,t,e).carry<s?n=a:i=a}return(n+i)/2}const de=Kt.clubs.map(s=>({...s,speed:s.id==="PT"?0:ax(s.carry,s.launch,s.spin)})),Pc=de.find(s=>s.id==="PT");function ox(s){const t=Cr.green;let e=0;const n=Kt.dt;for(;s>.03;){const i=t.roll+t.skid*Math.max(0,s-Kt.skidThreshold);e+=s*n,s-=i*n}return e}const ya=(()=>{const s=[];let t=.05;for(let e=0;e<=70;e++){const n=Kt.maxPuttDistance*e/64;for(;ox(t)<n;)t+=.005;s.push(t)}return s})();function lx(s){const t=Wn(s,0,1.09)*64,e=Math.floor(t),n=t-e;return ya[e]+(ya[e+1]-ya[e])*n}function Lc(s,t,e){const[n,i]=Cr[s].lie,r=Us(t)();let a=we(n,i,r);return s==="bunker"&&e&&e.id==="SW"&&(a=we(84,94,r)),e&&e.id==="PT"&&(a=100),Math.round(a)}function Dc(s,t,e,n={}){const i=Us(e.seed),r=Kt.dt,a=1/60,o=[],l=[],c=e.club,h=c.id==="PT",u=Wn(e.accuracy,-1.2,1.2),p=Math.abs(u)<=Kt.perfectWindow,d=u*Kt.pushDeg*Math.PI/180,g=e.yaw+(h?d*.25:d),v=He(g),m={x:t.x,y:t.y,z:t.z},f={x:0,y:0,z:0};let _=0,M=0,x=0,P=0,T=!1;if(h){const ot=lx(e.power);f.x=v.x*ot,f.z=v.z*ot,T=!0}else{let ot=c.speed*Wn(e.power,0,1.08)*(p?Kt.perfectBonus:1);ot*=we(.55,1,(e.lie-50)/50);const et=c.launch*Math.PI/180;f.x=v.x*Math.cos(et)*ot,f.z=v.z*Math.cos(et)*ot,f.y=Math.sin(et)*ot,_=c.spin*we(.6,1,e.lie/100);const yt=-v.z,Mt=v.x,At=yt,Bt=Mt,Ct=(p?0:u)*Kt.curveDeg*Math.PI/180,Xt=v.z*At-v.x*Bt;M=At*Math.cos(Ct),x=Xt*Math.sin(Ct),P=Bt*Math.cos(Ct),l.push({t:0,type:"launch",x:m.x,y:m.y,z:m.z,speed:ot})}const E={x:0,y:1,z:0};let R=0,S=0,y=0,L=t.y,D=h,N=h?0:-1,H=!1,B=!1,G=!1,Y=0;const z=new Set;let V={x:t.x,y:t.y,z:t.z},Q=0;const st=n.preview?12:Kt.maxSimSec,at=s.pin,Dt=()=>{o.push(m.x,m.y,m.z)};for(Dt();R<st;){if(R+=r,T){const et=s.surfaceAt(m.x,m.z);if(et==="water"){B=!0,l.push({t:R,type:"water",x:m.x,y:s.waterLevel,z:m.z,speed:0,surface:et});break}if(et==="ob"){G=!0,l.push({t:R,type:"ob",x:m.x,y:m.y,z:m.z,speed:0,surface:et});break}s.normal(m.x,m.z,E);const yt=Cr[et],Mt=wr*E.y*E.x,At=wr*E.y*E.z,Bt=Math.hypot(f.x,f.z),Ct=yt.roll+yt.skid*Math.max(0,Bt-Kt.skidThreshold);if(Bt>1e-4){const he=-(f.x/Bt)*Ct,Ut=-(f.z/Bt)*Ct,dt=f.x+(Mt+he)*r,gt=f.z+(At+Ut)*r;dt*f.x+gt*f.z<0&&Math.hypot(Mt,At)<Ct?(f.x=0,f.z=0):(f.x=dt,f.z=gt)}else Math.hypot(Mt,At)>Ct*1.05&&(f.x+=Mt*r,f.z+=At*r);m.x+=f.x*r,m.z+=f.z*r,m.y=s.height(m.x,m.z)+ei;const Xt=Math.hypot(m.x-at.x,m.z-at.z),I=Math.hypot(f.x,f.z);if(Xt<Kt.cupRadius){if(I<Kt.cupCaptureSpeed||Xt<Kt.cupRadius*.5&&I<Kt.cupLipSpeed){H=!0,m.x=at.x,m.z=at.z,m.y=at.y-.06,l.push({t:R,type:"holed",x:m.x,y:m.y,z:m.z,speed:I,surface:et});break}else if(I<Kt.cupLipSpeed*1.4&&!l.some(he=>he.type==="lipout")){const Ut=((m.x-at.x)*f.z-(m.z-at.z)*f.x>0?1:-1)*we(.5,1.1,i()),dt=Math.cos(Ut),gt=Math.sin(Ut),$t=f.x*dt-f.z*gt,wt=f.x*gt+f.z*dt;f.x=$t*.55,f.z=wt*.55,l.push({t:R,type:"lipout",x:m.x,y:m.y,z:m.z,speed:I,surface:et})}}if(I<.03){if(Q+=r,Q>.25){l.push({t:R,type:"stop",x:m.x,y:m.y,z:m.z,speed:0,surface:et});break}}else Q=0}else{const et=m.y-s.height(m.x,m.z),yt=Wn(.45+et/35,.45,1.25),Mt=f.x-e.wind.x*yt,At=f.y,Bt=f.z-e.wind.z*yt,Ct=Math.hypot(Mt,At,Bt),Xt=x*Bt-P*At,I=P*Mt-M*Bt,he=M*At-x*Mt;f.x+=(-.0031*Ct*Mt+Kt.liftK*_*Ct*Xt)*r,f.y+=(-wr-Kt.dragK*Ct*At+Kt.liftK*_*Ct*I)*r,f.z+=(-.0031*Ct*Bt+Kt.liftK*_*Ct*he)*r,_*=Math.exp(-r/Kt.spinDecaySec),m.x+=f.x*r,m.y+=f.y*r,m.z+=f.z*r,L=Math.max(L,m.y);for(const dt of s.treesNear(m.x,m.z)){const gt=dt.x*1e3+dt.z,$t=m.x-dt.x,wt=m.z-dt.z,C=Math.hypot($t,wt);if(C>dt.canopyR+1)continue;const w=m.y-dt.canopyY,k=dt.kind===0?C<dt.canopyR*(1-Wn((w+dt.height*.45)/(dt.height*.95),0,1))+.2&&w>-dt.height*.45&&w<dt.height*.5:Math.hypot($t,w*1.15,wt)<dt.canopyR,Z=C<dt.trunkR+ei&&m.y<dt.canopyY&&m.y>dt.y;if((k||Z)&&!z.has(gt)){z.add(gt);const j=Z?.35:we(.15,.4,i()),K=(i()-.5)*2.2,St=Math.cos(K),ct=Math.sin(K),vt=f.x*St-f.z*ct,It=f.x*ct+f.z*St;f.x=vt*j*(Z?-1:1),f.z=It*j*(Z?-1:1),f.y=f.y*j*.5-i()*1.5,_*=.2,l.push({t:R,type:"tree",x:m.x,y:m.y,z:m.z,speed:Math.hypot(f.x,f.y,f.z)})}}const Ut=s.height(m.x,m.z);if(m.y-ei<=Ut){const dt=s.surfaceAt(m.x,m.z);if(D||(D=!0,y=Math.hypot(m.x-t.x,m.z-t.z),N=o.length/3),dt==="ob"){G=!0,m.y=Ut+ei,l.push({t:R,type:"ob",x:m.x,y:m.y,z:m.z,speed:0,surface:dt});break}if(dt==="water"){B=!0,m.y=Math.max(Ut,s.waterLevel),l.push({t:R,type:"water",x:m.x,y:s.waterLevel,z:m.z,speed:0,surface:dt});break}if(Math.hypot(m.x-at.x,m.z-at.z)<Kt.cupRadius+ei*.5){H=!0,m.x=at.x,m.z=at.z,m.y=Ut-.06,l.push({t:R,type:"holed",x:m.x,y:m.y,z:m.z,speed:0,surface:dt});break}s.normal(m.x,m.z,E),m.y=Ut+ei;const gt=f.x*E.x+f.y*E.y+f.z*E.z;if(gt<0){const $t=Cr[dt],wt=f.x-gt*E.x,C=f.y-gt*E.y,w=f.z-gt*E.z,k=dt==="green"||dt==="fringe"?c.check*Wn(_,0,1.3)*(Y===0?.8:.35):c.check*.2,Z=$t.retain*(1-k),j=-gt*$t.restitution;f.x=wt*Z+E.x*j,f.y=C*Z+E.y*j,f.z=w*Z+E.z*j,_*=.45,Y++,l.push({t:R,type:Y===1?"land":"bounce",x:m.x,y:m.y,z:m.z,speed:-gt,surface:dt}),dt==="bunker"&&Y===1&&l.push({t:R,type:"bunker",x:m.x,y:m.y,z:m.z,speed:-gt,surface:dt}),(j<.9||dt==="bunker")&&(T=!0)}}}const ot=s.surfaceAt(m.x,m.z);ot!=="water"&&ot!=="ob"&&(V={x:m.x,y:m.y,z:m.z}),R>=S&&(Dt(),S+=a)}Dt();const X={x:m.x,y:m.y,z:m.z};let tt;if(B){const ot=t.x-V.x,et=t.z-V.z,yt=Math.hypot(ot,et)||1;let Mt=V.x+ot/yt*3,At=V.z+et/yt*3;for(let Bt=0;Bt<40&&s.surfaceAt(Mt,At)==="water";Bt++)Mt+=ot/yt*2,At+=et/yt*2;tt={x:Mt,y:s.height(Mt,At)+ei,z:At}}return N<0&&(N=o.length/3-1),{frames:new Float32Array(o),frameDt:a,events:l,end:X,endSurface:s.surfaceAt(X.x,X.z),holed:H,water:B,ob:G,carry:y||Math.hypot(X.x-t.x,X.z-t.z),total:Math.hypot(X.x-t.x,X.z-t.z),apex:L-t.y,drop:tt,landFrame:N}}function Ic(s,t){if(t==="green"||t==="fringe"&&s<18)return Pc;const e=de.filter(n=>n.id!=="PT"&&(t==="tee"||n.id!=="DR"));for(let n=e.length-1;n>=0;n--)if(e[n].carry>=s*.97)return e[n];return e[0]}function Sa(s,t){if(s.id==="PT")return Wn(t/Kt.maxPuttDistance,.02,1);let e=.05,n=1;for(let i=0;i<22;i++){const r=(e+n)/2;Oh(s.speed*r,s.launch,s.spin).carry<t?e=r:n=r}return(e+n)/2}const ii=Kt,Uc="hio.name";class cx{constructor(){this.status="loading",this.rows=[],this.uid=null,this.db=null,this.listeners=[],this.writing=Promise.resolve()}async init(){const t=window.claude;if(!t?.use){this.status="off",this.emit();return}try{const[e,n]=await Promise.all([t.use("db"),t.use("user")]);if(this.db=e,!e){this.status="off",this.emit();return}this.uid=n?await n.id():null;const i=n?await n.can("data.write"):null,r=setTimeout(()=>{this.status==="loading"&&(this.status="stale",this.emit())},1e4);e.collection("scores").limit(1e3).onSnapshot(a=>{this.rows=a.docs.filter(o=>o.exists).map(o=>({id:o.id,...ux(o.data())})),a.metadata?.fromCache||clearTimeout(r),this.status=!this.uid||i===!1?"readonly":"ready",this.emit()},()=>{clearTimeout(r),this.status="off",this.emit()})}catch{this.status="off",this.emit()}}onChange(t){this.listeners.push(t)}emit(){for(const t of this.listeners)t()}get myName(){const t=this.rows.find(e=>e.id===this.uid);if(t?.name)return t.name;try{return localStorage.getItem(Uc)??""}catch{return""}}get mine(){return this.rows.find(t=>t.id===this.uid)}top(t,e=10){return this.rows.filter(n=>typeof n[t]=="number").sort((n,i)=>n[t]-i[t]||(n.at??"").localeCompare(i.at??"")).slice(0,e)}rankOf(t,e){const n=this.rows.map(i=>i[t]).filter(i=>typeof i=="number");return{rank:n.filter(i=>i<e).length+1,of:Math.max(n.length,1)}}get canPost(){return this.status==="ready"||this.status==="stale"&&!!this.uid}async submit(t,e,n){if(!this.db||!this.uid||!this.canPost)return"readonly";const i=this.mine,r=i?.[t],a=typeof r!="number"||e<r,o=n&&n!==i?.name;if(!a&&!o)return"not-best";try{localStorage.setItem(Uc,n)}catch{}const l={...i?dx(i):{},name:n.slice(0,16),at:new Date().toISOString()};a&&(l[t]=hx(t,e));const c=this.db.doc(`scores/${this.uid}`),h=this.writing.then(()=>c.set(l));this.writing=h.catch(()=>{});try{return await h,a?"posted":"not-best"}catch(u){return u?.code==="invalid_argument"?(this.status="readonly",this.emit(),"readonly"):"error"}}}function hx(s,t){return s==="ctp"?Math.round(t*100)/100:Math.round(t)}function ux(s){const t=e=>typeof e=="number"&&isFinite(e)&&e>=0&&e<1e3?e:void 0;return{name:typeof s?.name=="string"?s.name.slice(0,16):"",ctp:t(s?.ctp),r3:t(s?.r3),r9:t(s?.r9),at:typeof s?.at=="string"?s.at:void 0}}function dx(s){const{id:t,...e}=s,n={};for(const[i,r]of Object.entries(e))r!==void 0&&(n[i]=r);return n}function Nc(s,t){if(s===1)return"Hole in One";const e=s-t;return e<=-3?"Albatross":e===-2?"Eagle":e===-1?"Birdie":e===0?"Par":e===1?"Bogey":e===2?"Double Bogey":e===3?"Triple Bogey":`+${e}`}function wa(s,t){const e=s-t;return e===0?"E":e>0?`+${e}`:`${e}`}const fx=s=>s+5,ba=ii.ballRadius;new A(0,1,0);const Fc="hio.best.v1",Ne=class Ne{constructor(t,e,n){this.sfx=new kv,this.state="loading",this.prevState="title",this.holeIndex=0,this.courses=gs.map(()=>null),this.roundLen=3,this.mode="round",this.ctp=[],this.scores=[null,null,null],this.strokes=0,this.ball={x:0,y:0,z:0},this.prevBall={x:0,y:0,z:0},this.surface="tee",this.lie=100,this.yaw=0,this.clubIdx=0,this.view="play",this.wind={x:0,z:0,speed:0,yaw:0},this.previewDirty=!0,this.previewPower=null,this.lastPreviewAt=0,this.pulling=!1,this.pullStart={x:0,y:0},this.pullPower=0,this.pullPeak=0,this.pullRange=200,this.lastTick=0,this.swingMode=(()=>{try{const i=localStorage.getItem("hio.swing.v2");return i==="swipe"||i==="timing"?i:"hybrid"}catch{return"timing"}})(),this.tm={phase:0,pos:0,dir:1,power:0,speed:1,wait:0},this.swipe=null,this.shot=null,this.shotInfo={power:0,acc:0,perfect:!1,club:de[0]},this.swingT=0,this.swingFrom=0,this.playT=-1,this.eventIdx=0,this.landCam=null,this.betweenTimer=0,this.camMode="title",this.camPos=new A(0,30,30),this.camLook=new A,this.tPos=new A,this.tLook=new A,this.introT=0,this.intro={a:new A,b:new A,c:new A,la:new A,lc:new A},this.flightT=0,this.drag=null,this.lb=new cx,this.boardMode="ctp",this.fpsNow=60,this.fpsEl=null,this.coachShown=(()=>{try{return localStorage.getItem("hio.coach")==="1"}catch{return!1}})(),this.impactCam=0,this.pendingBall=null,this.timeScale=new URL(location.href).searchParams.get("q")==="test"?3:1,this.slowMo=0,this.shake=0,this.fovPunch=0,this.perfectStreak=0,this.store=n,this.world=new Dv(t),this.ui=new Iv(e),this.world.applyBrand(n.brand),n.onChange(i=>{this.world.applyBrand(i),this.state==="title"&&this.renderTitle()}),this.bindInput(t)}get roundHoles(){return gs.slice(0,this.roundLen)}get bestKey(){return`${Fc}.${this.roundLen}`}get usesMeter(){return this.swingMode!=="swipe"}async boot(){this.lb.onChange(()=>{this.ui.board.classList.contains("show")&&this.renderBoard(),this.updateTower()}),this.lb.init(),new URL(location.href).searchParams.has("fps")&&(this.fpsEl=document.createElement("div"),this.fpsEl.className="fps passthrough",this.ui.root.append(this.fpsEl)),this.ui.loading.innerHTML="",this.ui.loading.append(Ov(this.store.brand));const t=document.createElement("p");t.className="loadtext",t.textContent=this.store.brand.courseName.toUpperCase();const e=document.createElement("p");e.className="loadsub",e.textContent="LOADING",this.ui.loading.append(t,e),await new Promise(o=>requestAnimationFrame(()=>setTimeout(o,60))),await this.ensureHole(0),this.loadHoleVisual(0),this.placeBallAtTee(),this.camMode="title",this.world.golfer.setBackswing(0),this.updateCamera(.016),this.camPos.copy(this.tPos),this.camLook.copy(this.tLook),this.renderTitle(),await Promise.race([$o().ready,bs(8e3)]),this.ui.show(this.ui.title,!0),this.ui.show(this.ui.loading,!1),this.state="title";let n=performance.now(),i=0,r=0;const a=o=>{const l=Math.max(0,(o-n)/1e3),c=Math.min(.05,l);if(n=o,i+=l,r++,i>2.5){const h=r/i;this.fpsNow=h,this.fpsEl&&(this.fpsEl.textContent=`${h.toFixed(0)} FPS · Q${this.world.quality} · ${this.world.renderer.getPixelRatio().toFixed(2)}x`),h<42&&!this.world.fixedPixelRatio&&document.visibilityState==="visible"&&this.world.degrade(),i=0,r=0}this.update(c),this.world.render(c),requestAnimationFrame(a)};requestAnimationFrame(a),setTimeout(()=>this.ensureHole(1).then(()=>this.ensureHole(2)),1200)}renderTitle(){const t=[3,9].map(e=>{try{const n=localStorage.getItem(`${Fc}.${e}`);return n?Number(n):null}catch{return null}});this.ui.renderTitle(this.store,t,e=>this.startRound(e),()=>this.openStudio(),this.sfx.muted,()=>{this.sfx.unlock(),this.sfx.setMuted(!this.sfx.muted),this.renderTitle()},this.swingMode,()=>{this.toggleSwingMode(),this.renderTitle()},()=>this.startCtp(),this.ctpBest(),()=>this.openBoard(this.boardMode))}async ensureHole(t){return this.courses[t]||(await bs(0),this.courses[t]=new $g(gs[t])),this.courses[t]}loadHoleVisual(t){this.holeIndex=t,this.course=this.courses[t],this.world.loadCourse(this.course);const e=Us(this.course.def.windSeed),n=.8+e()*(ii.wind.maxSpeed-.8),i=e()*Math.PI*2,r=He(i);this.wind={x:r.x*n,z:r.z*n,speed:n,yaw:i}}placeBallAtTee(){const t=this.course;this.ball={x:0,y:t.height(0,0)+ba+.03,z:0},this.prevBall={...this.ball},this.surface="tee",this.yaw=Ni(t.tee.dirX,t.tee.dirZ),this.chooseClubAndAim(),this.placeGolfer()}ctpBest(){try{const t=localStorage.getItem(Ne.CTP_KEY);return t?Number(t):null}catch{return null}}async startCtp(){this.sfx.unlock(),this.sfx.ui(),this.mode="ctp",this.ctp=[],this.perfectStreak=0,this.ui.show(this.ui.title,!1),this.ui.show(this.ui.scoreCard,!1),this.ui.show(this.ui.pause,!1),await this.beginHole(Ne.CTP_HOLE)}handleCtp(t){const e=this.course,n=t.water||t.ob?null:t.holed?0:e.distToPin(t.end.x,t.end.z);if(this.ctp.push(n),n===null?this.ui.toast("SPLASH",`BALL ${this.ctp.length} OF 3`,1600):n===0?(this.ui.toast("HOLE IN ONE","",2400),this.sfx.crowd("roar",1),this.sfx.say("ace",.4),this.world.crowd.cheer(1),this.world.fx.burst(new A(e.pin.x,e.pin.y+.3,e.pin.z),"confetti",this.store.brand.colors.primary)):(this.ui.toast(`${n.toFixed(2)} M`,`BALL ${this.ctp.length} OF 3`,1600),n<3&&(this.sfx.crowd(n<1.5?"roar":"applause",.85),this.sfx.say("close",.2),this.world.crowd.cheer(n<1.5?1:.6))),this.state="between",this.ctp.length<3){this.betweenTimer=2,this.pendingBall={x:0,y:e.height(0,0)+ba+.03,z:0},this.strokes=0;return}this.state="holeDone",setTimeout(()=>this.showCtpCard(),2e3)}showCtpCard(){this.state="card",this.ui.showHud(!1);const t=this.ctp.filter(r=>r!==null),e=t.length?Math.min(...t):null,n=this.ctpBest(),i=e!==null&&(n===null||e<n);if(i){try{localStorage.setItem(Ne.CTP_KEY,String(e))}catch{}this.sfx.cheer(!0)}Fv(this.ui,this.ctp,n,i,[{label:"Go Again",on:()=>this.startCtp()},...this.lb.status!=="off"?[{label:"Leaderboard",ghost:!0,on:()=>this.openBoard("ctp")}]:[],{label:"Main Menu",ghost:!0,on:()=>this.toTitle()}]),this.ui.show(this.ui.scoreCard,!0),e!==null&&this.postScore("ctp",e)}updateTower(){const t=this.lb.top("ctp",6);this.world.dressing.setBoard("CLOSEST TO THE PIN",t.map(e=>({name:e.name||"Player",value:e.ctp===0?"ACE":`${e.ctp.toFixed(2)}M`})))}openBoard(t){this.boardMode=t,this.sfx.ui(),this.renderBoard(),this.ui.show(this.ui.board,!0)}renderBoard(){this.ui.renderBoard(this.lb,this.boardMode,t=>{this.boardMode=t,this.renderBoard()},()=>this.ui.show(this.ui.board,!1),async()=>{const t=await this.ui.askName(this.lb.myName);if(!t)return;const e=this.lb.mine,n=typeof e?.ctp=="number"?"ctp":typeof e?.r3=="number"?"r3":"r9",i=e?.[n];if(typeof i=="number")await this.lb.submit(n,i,t);else try{localStorage.setItem("hio.name",t)}catch{}this.renderBoard()})}async postScore(t,e){const n=this.ui.scoreCard.querySelector(".card");if(!n)return;let i=n.querySelector(".lbline");i||(i=document.createElement("div"),i.className="lbline",n.querySelector(".sub")?.after(i));const r=u=>{i&&(i.textContent=u)};if(!this.lb.canPost){this.lb.status==="readonly"?r("VIEW ONLY: SCORE NOT POSTED"):i.remove();return}let a=this.lb.myName;if(!a&&(a=await this.ui.askName("")??"",!a)){r("SCORE NOT POSTED");return}r("POSTING SCORE...");const o=await this.lb.submit(t,e,a),l=this.lb.mine?.[t]??e,{rank:c,of:h}=this.lb.rankOf(t,l);r(o==="posted"?`NEW PERSONAL BEST  ·  #${c} OF ${h} ON THE LEADERBOARD`:o==="not-best"?`YOUR BEST IS #${c} OF ${h} ON THE LEADERBOARD`:o==="readonly"?"VIEW ONLY: SCORE NOT POSTED":"COULDN'T POST: CHECK YOUR CONNECTION")}async startRound(t=this.roundLen){this.mode="round",this.sfx.unlock(),this.sfx.ui(),this.roundLen=t,this.perfectStreak=0,this.scores=this.roundHoles.map(()=>null),this.ui.show(this.ui.title,!1),this.ui.show(this.ui.scoreCard,!1),this.ui.show(this.ui.pause,!1),await this.beginHole(0)}async beginHole(t){this.state="loading",this.ui.showHud(!1),this.courses[t]||(this.ui.show(this.ui.loading,!0),await bs(30)),await this.ensureHole(t),await this.ui.fade(()=>{this.loadHoleVisual(t),this.strokes=0,this.placeBallAtTee(),this.world.fx.tracerReset(),this.world.golfer.setBackswing(0),this.ui.show(this.ui.loading,!1),this.setupIntro()}),this.ui.renderHoleCard(this.course.def.id,this.mode==="ctp"?"Closest to the Pin":this.course.def.name,this.course.def.par,Math.round(this.course.distToPin(0,0))),this.ui.show(this.ui.holeCard,!0),this.state="intro"}setupIntro(){const t=this.course,e=new A(t.pin.x,t.pin.y,t.pin.z),n=t.pointAt(t.length*.5),i=new A(t.pin.x-n.x,0,t.pin.z-n.z).normalize(),r=new A(-i.z,0,i.x);this.intro.a.copy(e).addScaledVector(i,-26).addScaledVector(r,14).add(new A(0,5,0)),this.intro.b.set(n.x,t.height(n.x,n.z)+42,n.z).addScaledVector(r,30),this.addressCam(this.tPos,this.tLook),this.intro.c.copy(this.tPos),this.intro.la.copy(e),this.intro.lc.copy(this.tLook),this.introT=0,this.camMode="intro",this.camPos.copy(this.intro.a),this.camLook.copy(e)}endIntro(){this.state==="intro"&&(this.ui.show(this.ui.holeCard,!1),this.enterAim())}showCoach(){this.coachShown=!0;try{localStorage.setItem("hio.coach","1")}catch{}const t=document.createElement("div");t.className="overlay coach show",t.innerHTML=`<div class="card">
      <h3>HOW TO SWING</h3>
      <div class="sub">${this.swingMode==="hybrid"?"TWO PARTS: POWER, THEN SWIPE.":"THREE TAPS. TIMING IS EVERYTHING."}</div>
      <ol class="steps">
        <li><b>1</b><span><em>Tap the ball</em> to start your backswing.</span></li>
        <li><b>2</b><span><em>Tap again</em> to lock your power (part 1: distance). The meter fills and falls back.</span></li>
        ${this.swingMode==="hybrid"?"<li><b>3</b><span><em>Swipe up, dead straight</em> to strike (part 2: accuracy). Drift right slices, drift left hooks. Straight is PERFECT.</span></li>":"<li><b>3</b><span><em>Tap on the white line</em> as the marker races back. Early fades right, late hooks left. Dead on is PERFECT.</span></li>"}
      </ol>
      <div class="sub" style="margin:4px 0 14px">DRAG TO AIM &middot; TAP THE COURSE TO TARGET A SPOT</div>
      <button class="btn" data-a="ok">Let's Go</button></div>`,this.ui.root.append(t),t.querySelector('[data-a="ok"]').onclick=()=>{this.sfx.ui(),t.classList.remove("show"),setTimeout(()=>t.remove(),400)}}enterAim(){!this.coachShown&&this.usesMeter&&this.showCoach(),this.state="aim",this.camMode=this.view==="map"?"map":"address",this.previewPower=null,this.lie=Lc(this.surface,pa(this.course.def.id,this.strokes,this.ball.x,this.ball.z),de[this.clubIdx]),this.ui.showHud(!0),this.world.fx.tracerReset(),this.world.golfer.setBackswing(0),this.placeGolfer(),this.previewDirty=!0,this.updateHud()}chooseClubAndAim(){const t=this.course,e=t.distToPin(this.ball.x,this.ball.z),n=Ic(e,this.surface);if(this.clubIdx=de.indexOf(n),n.id==="PT"||n.carry>=e*.95)this.yaw=Ni(t.pin.x-this.ball.x,t.pin.z-this.ball.z);else{const i=t.fastPath(this.ball.x,this.ball.z).s,r=t.pointAt(Math.min(t.length,i+n.carry*.98));this.yaw=Ni(r.x-this.ball.x,r.z-this.ball.z)}}placeGolfer(){const t=de[this.clubIdx];this.world.golfer.setPutter(t.id==="PT");const e=He(this.yaw),n=this.course.height(this.ball.x,this.ball.z),i=new A(this.ball.x,this.ball.y,this.ball.z),r=-e.z,a=e.x,o=this.ball.x-r*.78,l=this.ball.z-a*.78;this.world.golfer.placeAt(i,e.x,e.z,Math.min(n,this.course.height(o,l))),this.world.fx.setBall(this.ball.x,this.ball.y,this.ball.z,n),this.world.grass.setCenter(this.ball.x,this.ball.z),this.world.props.setPeg(this.surface==="tee"&&Math.hypot(this.ball.x,this.ball.z)<.05)}bindInput(t){const e=this.ui.hud;t.addEventListener("pointerdown",n=>{if(this.sfx.unlock(),this.state==="intro"){this.endIntro();return}if(this.state==="between"){this.betweenTimer=Math.min(this.betweenTimer,.05);return}if(this.state==="timing"){this.tm.phase===4?this.swipeStart(n):this.timingTap();return}this.state==="aim"&&(this.drag={id:n.pointerId,x:n.clientX,y:n.clientY,t:performance.now(),moved:0})}),addEventListener("pointermove",n=>{if(this.swipe){this.swipeMove(n);return}if(this.pulling){this.onPullMove(n.clientX,n.clientY);return}if(!this.drag||n.pointerId!==this.drag.id||this.state!=="aim")return;const i=n.clientX-this.drag.x;this.drag.moved+=Math.abs(i)+Math.abs(n.clientY-this.drag.y),this.drag.x=n.clientX,this.drag.y=n.clientY;const r=de[this.clubIdx].id==="PT",a=this.view==="map"?.003:r?.0016:.0035;this.yaw+=i*a,this.previewDirty=!0,this.placeGolfer(),r&&this.updateHud()}),addEventListener("pointerup",n=>{if(this.swipe){this.swipeEnd(n);return}if(this.pulling){this.onPullEnd(n.clientX,n.clientY);return}if(!this.drag||n.pointerId!==this.drag.id)return;const i=this.drag.moved<8&&performance.now()-this.drag.t<350;this.drag=null,i&&this.state==="aim"&&this.tapAim(n.clientX,n.clientY)}),addEventListener("pointercancel",()=>{this.drag=null,this.pulling&&this.cancelPull()}),e.pad.addEventListener("pointerdown",n=>{if(n.preventDefault(),n.stopPropagation(),this.sfx.unlock(),this.usesMeter){if(this.state==="timing"&&this.tm.phase===4){this.swipeStart(n);return}this.timingTap();return}if(this.state!=="aim")return;this.pulling=!0,this.pullStart={x:n.clientX,y:n.clientY},this.pullPower=0,this.pullPeak=0,this.pullRange=Math.min(230,innerHeight*.3),e.pull.classList.add("show"),e.pullTrack.style.left=`${n.clientX}px`,e.pullTrack.style.top=`${n.clientY}px`,e.pullTrack.style.height=`${this.pullRange}px`,e.pullMeter.style.left=`${n.clientX}px`,e.pullMeter.style.top=`${n.clientY}px`,e.pullMeter.style.height=`${this.pullRange}px`,e.pad.style.opacity="0",this.onPullMove(n.clientX,n.clientY)}),e.clubPrev.onclick=()=>this.cycleClub(-1),e.clubNext.onclick=()=>this.cycleClub(1),e.viewBtn.onclick=()=>{this.state==="aim"&&(this.view=this.view==="map"?"play":"map",this.camMode=this.view==="map"?"map":"address",e.viewBtn.classList.toggle("on",this.view==="map"),this.sfx.ui(),this.updateHud())},e.menuBtn.onclick=()=>this.openPause(),addEventListener("keydown",n=>{if(n.key===" "&&(this.state==="aim"||this.state==="timing")&&this.usesMeter&&this.tm.phase!==4){n.preventDefault(),this.timingTap();return}this.state==="aim"&&(n.key==="ArrowLeft"&&(this.yaw-=.01,this.previewDirty=!0,this.placeGolfer()),n.key==="ArrowRight"&&(this.yaw+=.01,this.previewDirty=!0,this.placeGolfer()),n.key==="ArrowUp"&&this.cycleClub(-1),n.key==="ArrowDown"&&this.cycleClub(1),n.key==="m"&&e.viewBtn.click())})}tapAim(t,e){const n=this.world.pickGround(t,e);if(!n)return;const i=n.x-this.ball.x,r=n.z-this.ball.z,a=Math.hypot(i,r);if(!(a<1.5)){if(this.yaw=Ni(i,r),de[this.clubIdx].id!=="PT"){const o=Ic(a,this.surface==="green"?"fringe":this.surface);o.id!=="PT"&&(this.clubIdx=de.indexOf(o))}this.sfx.ui(),this.previewDirty=!0,this.placeGolfer(),this.updateHud()}}cycleClub(t){if(this.state!=="aim")return;const e=this.surface==="tee";let n=this.clubIdx;for(let i=0;i<de.length&&(n=(n+t+de.length)%de.length,de[n].id==="DR"&&!e);i++);this.clubIdx=n,this.lie=Lc(this.surface,pa(this.course.def.id,this.strokes,this.ball.x,this.ball.z),de[n]),this.sfx.ui(),this.previewDirty=!0,this.placeGolfer(),this.updateHud()}onPullMove(t,e){const n=this.ui.hud,i=Math.max(0,e-this.pullStart.y),r=Math.min(1,i/this.pullRange);this.pullPower=r,this.pullPeak=Math.max(this.pullPeak,r);const a=Math.max(r,this.pullPeak);n.pullKnob.style.left=`${t}px`,n.pullKnob.style.top=`${Math.max(this.pullStart.y,e)}px`,n.pullFill.style.height=`${a*100}%`,n.pullPct.style.left=`${this.pullStart.x}px`,n.pullPct.style.top=`${this.pullStart.y+this.pullRange*a}px`,n.pullPct.textContent=`${Math.round(a*100)}%`,this.world.golfer.setBackswing(this.pullPeak>r+.05?this.pullPeak*Math.max(.6,r/Math.max(.01,this.pullPeak)):r),Math.floor(r*10)!==this.lastTick&&(this.lastTick=Math.floor(r*10),this.sfx.tick(r)),this.previewPower=a,this.previewDirty=!0,this.pullPeak>.08&&i<this.pullRange*.05&&this.fire(this.pullPeak,(t-this.pullStart.x)/(this.pullRange*.42))}onPullEnd(t,e){this.pulling&&(this.pullPeak>.08&&this.pullPower>.05?this.fire(this.pullPower,(t-this.pullStart.x)/(this.pullRange*.42)):this.cancelPull())}cancelPull(){this.pulling=!1,this.ui.hud.pull.classList.remove("show"),this.ui.hud.pad.style.opacity="",this.world.golfer.setBackswing(0),this.previewPower=null,this.previewDirty=!0}timingTap(){this.sfx.unlock();const t=de[this.clubIdx],e=t.id==="PT";if(this.state==="aim"){this.state="timing",this.tm={phase:1,pos:0,dir:1,power:0,speed:e?.75:1,wait:0},this.ui.hud.tNotch.style.display="none",this.ui.hud.tLabel.textContent="TAP TO SET POWER",this.sfx.tick(.2),this.drag=null,this.updateHud();return}if(this.state==="timing"){if(this.tm.phase===1&&this.swingMode==="hybrid"){this.tm.power=Math.max(.03,this.tm.pos),this.tm.phase=4,this.tm.wait=0;const n=this.ui.hud;n.tNotch.style.display="block",n.tNotch.style.left=`${this.barPct(this.tm.power)}%`,n.tLabel.textContent="NOW SWIPE UP",n.swipeGuide.classList.add("show"),n.swipeTrail.setAttribute("points",""),this.sfx.tick(.6),navigator.vibrate?.(8),this.previewPower=this.tm.power,this.previewDirty=!0;return}if(this.tm.phase===1){this.tm.power=Math.max(.03,this.tm.pos),this.tm.phase=2,this.tm.dir=-1;const n={DR:1.18,"3W":1.1,"5I":1.05,"7I":1,"9I":.95,PW:.9,SW:.88,PT:.75};this.tm.speed=1.15*(n[t.id]??1)*(.75+.55*this.tm.power);const i=this.ui.hud;i.tNotch.style.display="block",i.tNotch.style.left=`${this.barPct(this.tm.power)}%`,i.tLabel.textContent="TAP ON THE LINE",this.sfx.tick(.6),navigator.vibrate?.(8),this.previewPower=this.tm.power,this.previewDirty=!0;return}this.tm.phase===2&&this.timingStrike(this.tm.pos)}}swipeStart(t){this.swipe={id:t.pointerId,x0:t.clientX,y0:t.clientY,t0:performance.now(),pts:[[t.clientX,t.clientY]]}}swipeMove(t){const e=this.swipe;if(!e||t.pointerId!==e.id)return;e.pts.push([t.clientX,t.clientY]);const n=innerWidth,i=innerHeight;this.ui.hud.swipeTrail.setAttribute("points",e.pts.map(([a,o])=>`${a/n*100},${o/i*100}`).join(" "));const r=Math.max(0,e.y0-t.clientY);this.world.golfer.setFollow(Math.min(.29,r/160*.3),this.tm.power)}swipeEnd(t){const e=this.swipe;if(!e||t.pointerId!==e.id)return;this.swipe=null;const n=e.pts,i=e.y0-t.clientY;let r=e.x0,a=e.y0;for(const[u,p]of n)if(e.y0-p>=i*.15){r=u,a=p;break}const o=a-t.clientY,l=t.clientX-r;if(i<40||o<30){this.ui.hud.swipeTrail.setAttribute("points",""),this.world.golfer.setBackswing(this.tm.power),this.ui.mini("SWIPE UP FURTHER");return}const c=Math.atan2(l,o)*180/Math.PI,h=performance.now()-e.t0;this.finishSwipe(c/40,h)}finishSwipe(t,e){const n=Math.max(-1.2,Math.min(1.2,t));this.tm.phase=3;const i=this.ui.hud,r=Math.abs(n)<=ii.perfectWindow;i.tLabel.textContent=r?"PERFECT!":n>0?"PUSHED RIGHT":"PULLED LEFT",i.tmeter.classList.remove("flash"),i.tmeter.offsetWidth,r&&i.tmeter.classList.add("flash"),setTimeout(()=>i.swipeGuide.classList.remove("show"),250),this.fire(this.tm.power,n,.25)}barPct(t){return(t+Ne.HOOK)/(1+Ne.HOOK)*100}timingStrike(t){const e=Math.max(-1.2,Math.min(1.2,t/.3));this.tm.phase=3;const n=this.ui.hud,i=Math.abs(e)<=ii.perfectWindow;n.tLabel.textContent=i?"PERFECT!":t>0?"EARLY":"LATE",n.tmeter.classList.remove("flash"),n.tmeter.offsetWidth,i&&n.tmeter.classList.add("flash"),this.fire(this.tm.power,e,.3)}updateTiming(t){const e=this.tm,n=this.ui.hud,i=this.world.golfer;if(e.phase===1){if(e.pos+=e.dir*e.speed*t,e.pos>=1&&(e.pos=1,e.dir=-1),e.pos<=0&&e.dir<0){this.state="aim",n.tLabel.textContent="TAP TO SWING",i.setBackswing(0),this.updateHud();return}i.setBackswing(e.pos),Math.floor(e.pos*10)!==this.lastTick&&(this.lastTick=Math.floor(e.pos*10),this.sfx.tick(e.pos)),this.previewPower=e.pos,this.previewDirty=!0}else if(e.phase===4){if(e.wait+=t,this.swipe||this.world.golfer.setBackswing(e.power),e.wait>8){this.ui.mini("TOO SLOW: RUSHED SWING"),this.finishSwipe(.9,0);return}}else if(e.phase===2){e.speed+=t*.6,e.pos-=e.speed*t;const r=Math.max(0,Math.min(1,(e.power-e.pos)/Math.max(.05,e.power)));i.setFollow(r*.3,e.power),e.pos<=-Ne.HOOK&&this.timingStrike(-Ne.HOOK)}n.tMarker.style.left=`${this.barPct(Math.max(-Ne.HOOK,e.pos))}%`,n.tFill.style.width=`${Math.max(0,this.barPct(Math.max(0,e.phase===1?e.pos:e.power))-this.barPct(0))}%`,n.tPct.textContent=`${Math.round((e.phase===1?e.pos:e.power)*100)}%`}toggleSwingMode(){this.swingMode=this.swingMode==="hybrid"?"timing":this.swingMode==="timing"?"swipe":"hybrid";try{localStorage.setItem("hio.swing.v2",this.swingMode)}catch{}this.sfx.ui()}fire(t,e,n=0){this.pulling=!1,this.ui.hud.pull.classList.remove("show"),this.ui.hud.pad.style.opacity="",this.previewPower=null;const i=de[this.clubIdx],r=Math.max(-1.2,Math.min(1.2,e)),a=Math.abs(r)<=ii.perfectWindow&&i.id!=="PT";this.strokes++,this.prevBall={...this.ball};const o=pa(this.course.def.id,this.strokes,Math.round(this.ball.x*100),Math.round(this.ball.z*100),Math.round(t*1e3));this.shot=Dc(this.course,this.ball,{club:i,yaw:this.yaw,power:t,accuracy:r,lie:this.lie,wind:i.id==="PT"?{x:0,z:0}:{x:this.wind.x,z:this.wind.z},seed:o}),this.shotInfo={power:t,acc:r,perfect:a,club:i},this.state="swing",this.swingT=n,this.swingFrom=this.world.golfer?t:0,this.playT=-1,this.eventIdx=0,this.landCam=null,this.flightT=0,this.world.fx.aim.clear(),this.world.fx.ring.visible=!1,this.world.fx.tracerReset(),i.id!=="PT"&&this.sfx.swing(t),this.updateHud()}onImpact(){const{power:t,perfect:e,club:n,acc:i}=this.shotInfo;if(n.id!=="PT"){const r=new A(this.ball.x,this.ball.y,this.ball.z);this.world.fx.burst(r,this.surface==="bunker"?"sand":"grass"),(e||t>.85&&(n.id==="DR"||n.id==="3W"))&&(this.impactCam=.95,this.slowMo=Math.max(this.slowMo,.9),this.flightT=0)}if(n.id==="PT"?this.sfx.putt():this.sfx.strike(t,e),navigator.vibrate?.(e?[12,30,12]:18),e?(this.perfectStreak++,this.ui.toast("PERFECT",this.perfectStreak>1?`STREAK x${this.perfectStreak}`:"",1100),this.slowMo=.55,this.sfx.say(this.perfectStreak%2?"perfect":"strike",.15),this.shake=.35,this.fovPunch=1,this.world.crowd.cheer(.5)):n.id!=="PT"&&(this.perfectStreak=0),!e&&n.id!=="PT"){const r=Math.abs(i),a=i<0?r>.55?"HOOK":"DRAW":r>.55?"SLICE":"FADE";this.ui.mini(`${Math.round(t*100)}% POWER  ·  ${r<.25?"SLIGHT ":""}${a}`)}this.playT=0,this.state="flight",this.camMode="flight",this.updateHud()}updateShot(t){const e=this.shot,n=this.shotInfo.club,i=e.frames.length/3,r=this.playT/e.frameDt<e.landFrame,a=n.id==="PT"?1.15:r?1.3:1.6;this.playT+=t*a,this.flightT+=t;const o=this.playT/e.frameDt,l=Math.min(i-1,Math.floor(o)),c=Math.min(i-1,l+1),h=Math.min(1,o-l),u=e.frames,p=u[l*3]+(u[c*3]-u[l*3])*h,d=u[l*3+1]+(u[c*3+1]-u[l*3+1])*h,g=u[l*3+2]+(u[c*3+2]-u[l*3+2])*h,v=this.course.height(p,g);this.world.fx.setBall(p,d,g,v);const m=this.world.fx.ball.position;n.id!=="PT"&&o<=e.landFrame+2?this.world.fx.tracerPush(m):this.world.fx.tracerFade(t);const f=this.playT;for(;this.eventIdx<e.events.length&&e.events[this.eventIdx].t<=f;){const _=e.events[this.eventIdx++],M=new A(_.x,_.y,_.z);_.type==="land"||_.type==="bounce"?(this.sfx.land(_.surface??"fairway",_.speed),_.type==="land"&&_.speed>4&&this.world.fx.burst(M,_.surface==="bunker"?"sand":"grass")):_.type==="tree"?(this.sfx.tree(),this.sfx.say("trees",.1),this.world.fx.burst(M,"leaf"),this.ui.mini("TIMBER!")):_.type==="water"?(this.sfx.splash(),this.sfx.say("water",.3),this.sfx.crowd("groan",.6),this.world.fx.burst(new A(_.x,this.course.waterLevel,_.z),"water")):_.type==="holed"?this.sfx.cup():_.type==="lipout"&&!e.holed&&(this.sfx.crowd("groan",.8),this.sfx.say("lipout",.2),this.ui.mini("LIP OUT!"))}o>=i-1&&this.onShotEnd()}onShotEnd(){const t=this.shot,e=this.course;if(this.mode==="ctp"){this.handleCtp(t);return}this.state="between",this.betweenTimer=1.4;let n={...t.end},i="",r=t.holed;if(t.water)this.strokes++,n=t.drop??this.prevBall,this.ui.toast("SPLASH","WATER HAZARD  ·  +1 STROKE",1800),this.betweenTimer=2;else if(t.ob)this.strokes++,n={...this.prevBall},this.ui.toast("OUT OF BOUNDS","+1 STROKE  ·  REPLAY",1800),this.sfx.say("ob",.2),this.betweenTimer=2;else if(!r){const a=t.endSurface,o=e.distToPin(n.x,n.z);a==="green"&&o<.45?(this.strokes++,r=!0,this.ui.mini("TAP IN"),this.sfx.cup()):this.shotInfo.club.id!=="PT"?(i=`CARRY ${Math.round(t.carry)} M  ·  TOTAL ${Math.round(t.total)} M  ·  ${xc[a].toUpperCase()}`,this.ui.mini(i,2200),a==="green"&&this.strokes===1&&e.def.par===3&&this.ui.toast("ON THE DANCE FLOOR","",1400),a==="green"&&o<4?(this.world.crowd.cheer(.8),this.sfx.crowd("applause",.9),this.sfx.say("close",.15)):a==="green"?this.sfx.say("green",.15):a==="bunker"?this.sfx.say("bunker",.15):a==="fairway"&&this.strokes===1&&t.carry>180&&this.sfx.say("middle",.15)):this.ui.mini(o<2?`${o.toFixed(1)} M LEFT`:`${Math.round(o)} M LEFT`)}if(r){this.holeComplete();return}if(this.strokes>=fx(e.def.par)){this.ui.toast("PICK UP",`${this.strokes} STROKES`,1600),this.scores[this.holeIndex]=this.strokes,this.state="holeDone",this.holeIndex+1<this.roundLen&&setTimeout(()=>this.ensureHole(this.holeIndex+1),300),setTimeout(()=>this.showHoleCard(),1800);return}this.pendingBall=n}async advanceToNextShot(){const t=this.pendingBall;this.pendingBall=null,t&&(this.state="loading",await this.ui.fade(()=>{const e=this.course;this.ball={x:t.x,y:e.height(t.x,t.z)+ba,z:t.z},this.surface=e.surfaceAt(t.x,t.z),this.chooseClubAndAim(),this.world.fx.tracerReset(),this.enterAim(),this.addressCam(this.camPos,this.camLook),this.view==="map"&&this.mapCam(this.camPos,this.camLook)}))}holeComplete(){const t=this.course;this.scores[this.holeIndex]=this.strokes,this.state="holeDone";const e=Nc(this.strokes,t.def.par);this.ui.showHud(!1);const n=this.strokes<t.def.par||this.strokes===1;if(this.ui.toast(e.toUpperCase(),`${this.strokes} ${this.strokes===1?"STROKE":"STROKES"}`,2600),this.strokes===1)this.sfx.crowd("roar",1),this.sfx.say("ace",.4);else{this.sfx.crowd(n?"roar":"applause",n?.85:.8);const i=this.strokes-t.def.par,r=i<=-2?"eagle":i===-1?"birdie":i===0?"par":"";r&&this.sfx.say(r,.5)}this.world.crowd.cheer(n?1:.4),navigator.vibrate?.([30,50,30]),this.strokes<=t.def.par&&this.world.fx.burst(new A(t.pin.x,t.pin.y+.3,t.pin.z),"confetti",this.store.brand.colors.primary),this.camMode="cup",this.holeIndex+1<this.roundLen&&setTimeout(()=>this.ensureHole(this.holeIndex+1),300),setTimeout(()=>this.showHoleCard(),2700)}showHoleCard(){this.state="card",this.ui.showHud(!1);const t=this.roundHoles,e=t.map((a,o)=>({par:a.par,strokes:this.scores[o]})),n=this.holeIndex>=t.length-1,i=this.scores.reduce((a,o)=>a+(o??0),0),r=t.reduce((a,o)=>a+o.par,0);if(!n)this.ui.renderScorecard(`HOLE ${this.course.def.id}`,`${Nc(this.scores[this.holeIndex],this.course.def.par).toUpperCase()}  ·  ${wa(i,gs.slice(0,this.holeIndex+1).reduce((a,o)=>a+o.par,0))} THRU ${this.holeIndex+1}`,e,[{label:"Next Hole",on:()=>{this.ui.show(this.ui.scoreCard,!1),this.beginHole(this.holeIndex+1)}}]);else{let a=null;try{const l=localStorage.getItem(this.bestKey);a=l?Number(l):null,(a===null||i<a)&&localStorage.setItem(this.bestKey,String(i))}catch{}const o=a===null||i<a;this.ui.renderScorecard("ROUND COMPLETE",`${i} STROKES  ·  ${wa(i,r)}${o?"  ·  NEW BEST":`  ·  BEST ${a}`}`,e,[{label:"Play Again",on:()=>this.startRound(this.roundLen)},...this.lb.status!=="off"?[{label:"Leaderboard",ghost:!0,on:()=>this.openBoard(this.roundLen===9?"r9":"r3")}]:[],{label:"Brand Studio",ghost:!0,on:()=>{this.ui.show(this.ui.scoreCard,!1),this.openStudio()}},{label:"Main Menu",ghost:!0,on:()=>this.toTitle()}]),o&&this.sfx.cheer(!0),setTimeout(()=>this.postScore(this.roundLen===9?"r9":"r3",i),0)}this.ui.show(this.ui.scoreCard,!0)}async toTitle(){this.mode="round",this.ui.show(this.ui.scoreCard,!1),this.ui.show(this.ui.pause,!1),this.ui.showHud(!1),await this.ui.fade(async()=>{await this.ensureHole(0),this.loadHoleVisual(0),this.placeBallAtTee(),this.world.golfer.setBackswing(0),this.world.fx.tracerReset(),this.world.fx.aim.clear(),this.world.fx.ring.visible=!1,this.camMode="title"}),this.renderTitle(),this.ui.show(this.ui.title,!0),this.state="title"}openPause(){this.state==="aim"&&(this.prevState="aim",this.state="paused",this.ui.renderPause(()=>{this.ui.show(this.ui.pause,!1),this.state="aim"},()=>{this.ui.show(this.ui.pause,!1),this.startRound()},()=>{this.ui.show(this.ui.pause,!1),this.openStudio()},()=>this.toTitle(),this.sfx.muted,()=>{this.sfx.setMuted(!this.sfx.muted),this.openPause2()},this.swingMode,()=>{this.toggleSwingMode(),this.updateHud(),this.openPause2()}),this.ui.show(this.ui.pause,!0))}openPause2(){this.state="aim",this.openPause()}openStudio(){this.prevState=this.state==="paused"?"aim":this.state==="card"?"title":this.state,this.state="studio",this.ui.show(this.ui.title,!1),this.ui.showHud(!1),this.camMode="studio",this.world.golfer.setBackswing(0),this.ui.renderStudio(this.store,this.world.props.previewCanvases(),()=>this.closeStudio()),this.ui.show(this.ui.studio,!0)}closeStudio(){this.ui.show(this.ui.studio,!1),this.prevState==="aim"?this.enterAim():(this.state="title",this.camMode="title",this.renderTitle(),this.ui.show(this.ui.title,!0))}debugAutoShot(t=0){if(this.state!=="aim")return!1;const e=this.course,n=de[this.clubIdx],i=e.distToPin(this.ball.x,this.ball.z);let r=1;return n.id==="PT"?(this.yaw=Ni(e.pin.x-this.ball.x,e.pin.z-this.ball.z),r=Sa(n,i*1.1)):n.carry>=i&&(this.yaw=Ni(e.pin.x-this.ball.x,e.pin.z-this.ball.z),r=Sa(n,i*.93)),this.fire(r,t),!0}update(t){t*=this.timeScale,this.slowMo>0&&(this.slowMo-=t,t*=.3);const e=this.world,n=e.time;if(this.state==="intro"&&(this.introT+=t/4.2,this.introT>=1&&this.endIntro()),e.reader.visible=(this.state==="aim"||this.state==="timing")&&de[this.clubIdx].id==="PT",this.state==="aim"){e.golfer.idle(n);const i=performance.now();this.previewDirty&&i-this.lastPreviewAt>40&&(this.previewDirty=!1,this.lastPreviewAt=i,this.updatePreview()),this.updatePinMarker()}else this.ui.hud.pinMark.classList.add("hide");if(this.state==="timing"){e.golfer.idle(n),this.updateTiming(t);const i=performance.now();this.previewDirty&&i-this.lastPreviewAt>60&&(this.previewDirty=!1,this.lastPreviewAt=i,this.updatePreview())}if(this.state==="swing"){const i=this.shotInfo.club.id==="PT"?.75:.95;this.swingT+=t/i,e.golfer.setFollow(Math.min(1,this.swingT),this.swingFrom),this.swingT>=.3&&this.playT<0&&this.onImpact()}if(this.state==="flight"){if(this.swingT<1){const i=this.shotInfo.club.id==="PT"?.75:.95;this.swingT+=t/i,e.golfer.setFollow(Math.min(1,this.swingT),this.swingFrom)}this.updateShot(t)}this.state==="between"&&(this.world.fx.tracerFade(t),this.betweenTimer-=t,this.betweenTimer<=0&&this.pendingBall&&this.advanceToNextShot()),this.updateCamera(t)}updatePreview(){const t=this.world.fx,e=de[this.clubIdx],n=this.course;let i=this.previewPower;if(i===null&&(e.id==="PT"?i=Math.min(1,Sa(e,n.distToPin(this.ball.x,this.ball.z)*1.05)):i=1),i<.02){t.aim.clear(),t.ring.visible=!1;return}const r=Dc(n,this.ball,{club:e,yaw:this.yaw,power:i,accuracy:0,lie:this.lie,wind:{x:0,z:0},seed:1},{preview:!0}),a=[],o=r.frames,l=o.length/3;let c;e.id==="PT"?c=Math.max(2,Math.floor(l*.55)):c=Math.min(l,r.landFrame+1);const h=(e.id==="PT",2);for(let f=0;f<c;f+=h)a.push(new A(o[f*3],o[f*3+1]+(e.id==="PT"?.03:0),o[f*3+2]));t.aim.widthScale=e.id==="PT"?.55:1.1,t.aim.setPoints(a);const u=e.id==="PT"?c-1:Math.min(l-1,r.landFrame),p=o[u*3],d=o[u*3+2];t.ring.visible=e.id!=="PT";const g=n.height(p,d);t.ring.position.set(p,g+.08,d);const v=e.id==="PT"?.3:1.2+r.carry*.018;t.ring.scale.setScalar(v);const m=Math.round(r.carry);e.id!=="PT"?this.ui.hud.clubDist.textContent=`${m} M`:this.ui.hud.clubDist.textContent=`${(i*ii.maxPuttDistance).toFixed(1)} M`}updatePinMarker(){const t=this.course,e=new A(t.pin.x,t.pin.y+3.9,t.pin.z).project(this.world.camera),n=this.ui.hud.pinMark,i=t.distToPin(this.ball.x,this.ball.z);if(e.z>1||Math.abs(e.x)>1.05||Math.abs(e.y)>1.05||i<12){n.classList.add("hide");return}n.classList.remove("hide"),n.style.left=`${(e.x*.5+.5)*innerWidth}px`,n.style.top=`${(-e.y*.5+.5)*innerHeight}px`,n.textContent=`PIN ${Math.round(i)} M`}updateHud(){const t=this.ui.hud,e=this.course,n=de[this.clubIdx];t.hole.textContent=String(e.def.id),t.par.textContent=String(e.def.par),t.shot.textContent=String(this.strokes+(this.state==="aim"||this.state==="timing"?1:0));let i=0,r=0;this.scores.forEach((u,p)=>{u!==null&&(i+=u,r+=gs[p].par)}),t.toPar.textContent=i?wa(i,r):"E";const a=t.shot.parentElement.querySelector("small"),o=t.toPar.parentElement.querySelector("small");if(this.mode==="ctp"){a.textContent="BALL",o.textContent="BEST",t.shot.textContent=`${Math.min(3,this.ctp.length+1)}/3`;const u=this.ctp.filter(p=>p!==null);t.toPar.textContent=u.length?`${Math.min(...u).toFixed(1)}`:"-"}else a.textContent="SHOT",o.textContent="TOTAL";t.windSpeed.textContent=this.wind.speed.toFixed(1),t.lieVal.textContent=`${this.lie}%`,t.lieName.textContent=xc[this.surface].toUpperCase();const l=t.lieVal.parentElement.querySelector("small");if(l.textContent=n.id==="PT"?"GREEN READ":"LIE",t.lieVal.style.fontSize=n.id==="PT"?"16px":"",n.id==="PT"){const[u,p]=e.def.green.slope,d=He(this.yaw),g=u*d.x+p*d.z,v=u*-d.z+p*d.x,m=g>.002?`UPHILL ${(g*100).toFixed(1)}%`:g<-.002?`DOWNHILL ${(-g*100).toFixed(1)}%`:"FLAT",f=Math.abs(v)<.002?"STRAIGHT":v>0?"BREAKS LEFT":"BREAKS RIGHT";t.lieVal.textContent=f,t.lieName.textContent=m}const c=e.distToPin(this.ball.x,this.ball.z);t.pin.textContent=c<10?`${c.toFixed(1)} M`:`${Math.round(c)} M`,t.clubName.textContent=n.id,t.clubDist.textContent=n.id==="PT"?"PUTTER":`${n.carry} M`,t.padLabel.textContent=n.id==="PT"?"PULL TO PUTT":"PULL BACK";const h=this.usesMeter;if(this.state!=="timing"&&t.swipeGuide.classList.remove("show"),t.pad.classList.toggle("disabled",!(this.state==="aim"||h&&this.state==="timing")),t.tmeter.classList.toggle("hide",!h||!(this.state==="aim"||this.state==="timing"||this.state==="swing")),h&&this.state==="aim"&&(t.tLabel.textContent="TAP TO SWING",t.tNotch.style.display="none",t.tMarker.style.left=`${this.barPct(0)}%`,t.tFill.style.width="0%",t.tPct.textContent=""),h){const u=ii.perfectWindow*.3*2/(1+Ne.HOOK)*100;t.tSweet.style.left=`${this.barPct(0)-u/2}%`,t.tSweet.style.width=`${u}%`}t.padLabel.textContent=h?"":n.id==="PT"?"PULL TO PUTT":"PULL BACK",t.hint.innerHTML=this.swingMode==="hybrid"?"Drag to aim &middot; Tap, tap for power, then swipe up":h?"Drag to aim &middot; Tap 3 times: start, power, line":"Drag to aim &middot; Pull ball down &amp; flick up",t.hint.style.opacity=this.strokes===0&&this.holeIndex===0&&this.state==="aim"?"0.92":"0"}addressCam(t,e){const n=He(this.yaw),i=new A(n.x,0,n.z),r=new A(-n.z,0,n.x),a=new A(this.ball.x,this.ball.y,this.ball.z),o=de[this.clubIdx].id==="PT",l=a.clone().addScaledVector(r,o?.15:.1);if(o){const h=this.course.distToPin(a.x,a.z);t.copy(l).addScaledVector(i,-4.3-Math.min(2.5,h*.1)).add(new A(0,1.55+Math.min(1.5,h*.06),0)),e.copy(a).addScaledVector(i,Math.min(12,Math.max(3,h*.7)))}else t.copy(l).addScaledVector(i,-5).add(new A(0,2.2,0)),e.copy(a).addScaledVector(i,40).add(new A(0,-6.5,0));const c=this.course.height(t.x,t.z)+.8;t.y<c&&(t.y=c)}mapCam(t,e){const n=this.world.fx.ring.position,i=new A(this.ball.x,this.ball.y,this.ball.z),r=He(this.yaw),a=this.world.fx.ring.visible?n.clone():i.clone().add(new A(r.x,0,r.z).multiplyScalar(10)),o=i.clone().lerp(a,.5),l=i.distanceTo(a);e.copy(o),t.copy(o).add(new A(-r.x*l*.35,l*1.05+25,-r.z*l*.35))}updateCamera(t){const e=this.world,n=e.camera,i=this.tPos,r=this.tLook;let a=4;switch(this.camMode){case"title":{const d=e.golfer.root.position,g=e.time*.09+2.2;i.set(d.x+Math.cos(g)*6.5,d.y+2.2,d.z+Math.sin(g)*6.5),r.set(d.x,d.y+1,d.z),a=2;break}case"studio":{const d=e.golfer.root.position,g=He(this.yaw),v=new A(-g.z,0,g.x);i.copy(d).addScaledVector(v,5.6).addScaledVector(new A(g.x,0,g.z),.4).add(new A(0,1.2,0)),r.copy(d).add(new A(0,-.15,0)).addScaledVector(v,.6),a=3;break}case"intro":{const d=Oc(Math.min(1,this.introT)),g=this.intro,v=g.a.clone().lerp(g.b,d),m=g.b.clone().lerp(g.c,d);i.copy(v.lerp(m,d)),r.copy(g.la).lerp(g.lc,Oc(Math.min(1,this.introT*1.15))),this.camPos.copy(i),this.camLook.copy(r),a=0;break}case"address":this.addressCam(i,r),a=5;break;case"map":this.mapCam(i,r),a=4;break;case"flight":{const d=e.fx.ball.position,g=this.shot;if(this.shotInfo.club.id==="PT"){const _=He(this.yaw);i.set(d.x-_.x*2.6,d.y+1,d.z-_.z*2.6),r.copy(d),a=3;break}const m=this.playT/g.frameDt,f=(g.landFrame-m)*g.frameDt/1.3;if(this.impactCam>0){this.impactCam-=t;const _=He(this.yaw),M=-_.z,x=_.x,P=new A(this.prevBall.x,this.prevBall.y,this.prevBall.z);i.set(P.x-M*.9+_.x*.55,P.y+.18,P.z-x*.9+_.z*.55),r.copy(P).lerp(d,.5),r.y=Math.max(r.y,P.y+.05),this.flightT<.05&&(this.camPos.copy(i),this.camLook.copy(r)),a=14}else if(this.flightT<1.1&&this.shotInfo.power>.55){const _=He(this.yaw),M=e.golfer.root.position,x=-_.z,P=_.x;i.set(M.x+x*5.2+_.x*2.2,M.y+1.5,M.z+P*5.2+_.z*2.2),r.set(M.x+_.x*.6,M.y+1.1,M.z+_.z*.6).lerp(d,Math.min(.45,this.flightT*.4)),this.flightT<.05&&(this.camPos.copy(i),this.camLook.copy(r)),a=8}else if(this.flightT<.55)this.addressCam(i,r),r.lerp(d,Math.min(1,this.flightT*2)),a=6;else if(f>1.1){const _=He(this.yaw);i.set(d.x-_.x*15+-_.z*3.5,d.y+5,d.z-_.z*15+_.x*3.5),r.copy(d),a=2.2}else{if(!this.landCam){const _=g.landFrame,M=g.frames[_*3],x=g.frames[_*3+2],P=He(this.yaw),T=this.shotInfo.acc>0?-1:1,E=M+-P.z*T*16+P.x*12,R=x+P.x*T*16+P.z*12,S=new A(this.course.pin.x-M,0,this.course.pin.z-x);S.length()<40?(S.normalize(),this.landCam=new A(this.course.pin.x+S.x*14+-S.z*8,0,this.course.pin.z+S.z*14+S.x*8)):this.landCam=new A(E,0,R),this.landCam.y=this.course.height(this.landCam.x,this.landCam.z)+9}i.copy(this.landCam),r.copy(d),a=1.8}break}case"cup":{const d=this.course.pin,g=He(this.yaw);i.set(d.x-g.x*3.2+-g.z*1.2,d.y+1.1,d.z-g.z*3.2+g.x*1.2),r.set(d.x,d.y+.6,d.z),a=2;break}}if(a>0){const d=1-Math.exp(-a*t);this.camPos.lerp(i,d),this.camLook.lerp(r,Math.min(1,d*1.5))}const o=this.course?this.course.height(this.camPos.x,this.camPos.z)+.5:0;if(this.camPos.y<o&&(this.camPos.y=o),n.position.copy(this.camPos),this.shake>0){this.shake=Math.max(0,this.shake-t);const d=this.shake*.12;n.position.x+=(Math.random()-.5)*d,n.position.y+=(Math.random()-.5)*d}n.lookAt(this.camLook);const l=innerWidth<innerHeight?62:50;this.fovPunch=Math.max(0,this.fovPunch-t*2.2);const c=l-Math.sin(this.fovPunch*Math.PI)*5;Math.abs(n.fov-c)>.01&&(n.fov=c,n.updateProjectionMatrix());const h=new A;n.getWorldDirection(h);const u=Math.atan2(h.x,-h.z);this.ui.hud.windArrow.style.transform=`rotate(${(this.wind.yaw-u)*180/Math.PI}deg)`;const p=this.camMode==="flight"||this.camMode==="cup"?e.fx.ball.position:this.camMode==="map"?this.camLook:e.golfer.root.position;e.focusShadows(p)}};Ne.CTP_HOLE=4,Ne.CTP_KEY="hio.ctp.best.v1",Ne.HOOK=.12;let xo=Ne;const Oc=s=>s*s*(3-2*s);async function px(){const s=document.getElementById("gl"),t=document.getElementById("ui"),e=new Xh;await e.init();try{await Promise.race([Promise.all([document.fonts.load(`italic 800 40px "${e.brand.font}"`),document.fonts.load(`italic 900 40px "${e.brand.font}"`),document.fonts.load(`italic 700 40px "${e.brand.font}"`)]),new Promise(i=>setTimeout(i,2500))])}catch{}const n=new xo(s,t,e);window.__game=n,await n.boot()}px().catch(s=>{console.error(s);const t=document.getElementById("ui");t&&(t.innerHTML=`<div style="position:fixed;inset:0;display:grid;place-items:center;color:#fff;font:20px sans-serif;padding:24px;text-align:center">Could not start the game.<br/>${String(s?.message??s)}</div>`)});
