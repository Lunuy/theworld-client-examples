(function () {
	'use strict';

	class Coroutine{constructor(t,i){this._elapsedTime=0,this._coroutineIterator=t,this._currentYieldInstruction=null,this._isCurrenYieldInstructionExist=!1,this._onFinish=null!=i?i:null;}get elapsedTime(){return this._elapsedTime}set elapsedTime(t){this._elapsedTime=t;}get currentYieldInstruction(){return this._currentYieldInstruction}get currentYieldInstructionExist(){return this._isCurrenYieldInstructionExist}fatchNextInstruction(){var t;const i=this._coroutineIterator.next();return i.done?(this._currentYieldInstruction=null,this._isCurrenYieldInstructionExist=!1,null===(t=this._onFinish)||void 0===t||t.call(this),this._onFinish=null,null):(this._currentYieldInstruction=i.value,this._isCurrenYieldInstructionExist=!0,this._currentYieldInstruction)}}

	class YieldInstruction{}class WaitForSeconds extends YieldInstruction{constructor(t){super(),this._seconds=t;}get seconds(){return this._seconds}}class WaitUntil extends YieldInstruction{constructor(t){super(),this._predicate=t;}get predicate(){return this._predicate}}class WaitWhile extends YieldInstruction{constructor(t){super(),this._predicate=t;}get predicate(){return this._predicate}}

	class CoroutineProcessor{constructor(t){this._time=t,this._coroutines=[],this._coroutineCount=0;}addCoroutine(t){this._coroutines.push(t),this._coroutineCount+=1;}removeCoroutine(t){const o=this._coroutines.indexOf(t);o>=0&&(this._coroutines[o]=null,this._coroutineCount-=1);}tryCompact(){const t=this._coroutines;if(CoroutineProcessor._needToCompactCount<=t.length-this._coroutineCount){let o=0;for(let e=0;e<t.length;++e){const n=t[e];null!==n&&(t[o]=n,o+=1);}t.length=this._coroutineCount;}}process(){const t=this._coroutines;for(let o=0;o<t.length;++o){const e=t[o];null!==e&&(e.currentYieldInstructionExist?this.updateAfterProcessSingleInstruction(e):(t[o]=null,this._coroutineCount-=1));}}updateAfterProcessSingleInstruction(t){const o=t.currentYieldInstruction;o instanceof WaitForSeconds?(t.elapsedTime+=this._time.deltaTime,t.elapsedTime>=o.seconds&&(t.elapsedTime=0,t.fatchNextInstruction())):o instanceof WaitUntil?o.predicate()&&t.fatchNextInstruction():o instanceof WaitWhile?o.predicate()||t.fatchNextInstruction():null===o&&t.fatchNextInstruction();}}CoroutineProcessor._needToCompactCount=16;

	class Time{constructor(){this._oldTime=0,this._time=0,this._unscaledTime=0,this._deltaTime=0,this._unscaledDeltaTime=0,this._timeScale=1;}start(){this._oldTime=Date.now();}update(){const e=Date.now(),t=(e-this._oldTime)/1e3;this._unscaledDeltaTime=t,this._unscaledTime+=t,this._deltaTime=t*this._timeScale,this._time+=this._deltaTime,this._oldTime=e;}get time(){return this._time}get unscaledTime(){return this._unscaledTime}get deltaTime(){return this._deltaTime}get unscaledDeltaTime(){return this._unscaledDeltaTime}get timeScale(){return this._timeScale}set timeScale(e){this._timeScale=e;}}

	class CoroutineDispatcher{constructor(t=10){this.update=()=>{this._time.update(),this._coroutineProcessor.process(),this._coroutineProcessor.tryCompact();};const o=this._time=new Time;this._coroutineProcessor=new CoroutineProcessor(o),o.start(),this._setIntervalId=window.setInterval((()=>{this.update();}),t);}startCoroutine(t){const o=new Coroutine(t);return o.fatchNextInstruction(),this._coroutineProcessor.addCoroutine(o),o}dispose(){-1!==this._setIntervalId&&(window.clearInterval(this._setIntervalId),this._setIntervalId=-1);}}

	class Vector2{constructor(t=0,s=0){this.x=t,this.y=s;}freeze(){return Object.freeze(this)}copy(t){return this.x=t.x,this.y=t.y,this}clone(){return new Vector2(this.x,this.y)}set(t,s){return this.x=t,this.y=s,this}equals(t){return this.x===t.x&&this.y===t.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}lengthSquared(){return this.x*this.x+this.y*this.y}}

	class BiomePreset{getTileSprite(t){const e=this.tiles;return e[Math.floor(t.next()*e.length)]}matchCondition(t,e,s){return t>=this.minHeight&&e>=this.minMoisture&&s>=this.minHeat}}const Desert=new class extends BiomePreset{constructor(){super(...arguments),this.tiles=[{i:70,a:15}],this.minHeight=0,this.minMoisture=0,this.minHeat=.9;}};const Grassland=new class extends BiomePreset{constructor(){super(...arguments),this.tiles=[{i:70,a:22}],this.minHeight=.1,this.minMoisture=.2,this.minHeat=.1;}};const Mountains=new class extends BiomePreset{constructor(){super(...arguments),this.tiles=[{i:70,a:54}],this.minHeight=.7,this.minMoisture=0,this.minHeat=0;}};

	class Mulberry32{constructor(t){this._a=t;}next(){let t=this._a+=1831565813;return t=Math.imul(t^t>>>15,1|t),t^=t+Math.imul(t^t>>>7,61|t),((t^t>>>14)>>>0)/4294967296}}

	class Wave{constructor(e,r,t){this.seed=e,this.frequency=r,this.amplitude=t;}}class NoiseGenerator{static generate(e,r,t,o,s){const a=new Array(e);for(let t=0;t<e;t++){a[t]=new Array(r);for(let e=0;e<r;e++)a[t][e]=0;}for(let i=0;i<e;++i)for(let e=0;e<r;++e){const r=i*t+s.x,n=e*t+s.y;let l=0;for(let t=0;t<o.length;++t){const s=o[t];a[i][e]+=s.amplitude*(this.perlinNoise(r*s.frequency+s.seed,n*s.frequency+s.seed)+.5),l+=s.amplitude;}a[i][e]/=l;}return a}static floorToInt(e){return e>0?Math.floor(e):Math.ceil(e)}static fade(e){return e*e*e*(e*(6*e-15)+10)}static grad(e,r,t){return (0==(1&e)?r:-r)+(0==(2&e)?t:-t)}static lerp(e,r,t){return r+e*(t-r)}static perlinNoise(e,r){const t=255&NoiseGenerator.floorToInt(e),o=255&NoiseGenerator.floorToInt(r);e-=Math.floor(e),r-=Math.floor(r);const s=this.fade(e),a=this.fade(r),i=NoiseGenerator._perm[t]+o&255,n=NoiseGenerator._perm[o+1]+o&255;return this.lerp(a,this.lerp(s,this.grad(NoiseGenerator._perm[i],e,r),this.grad(NoiseGenerator._perm[n],e-1,r)),this.lerp(s,this.grad(NoiseGenerator._perm[i+1],e,r-1),this.grad(NoiseGenerator._perm[n+1],e-1,r-1)))}}NoiseGenerator._perm=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,151];

	class BiomeTempData{constructor(e){this.biome=e;}getDiffValue(e,t,s){const i=this.biome;return e-i.minHeight+(t-i.minMoisture)+(s-i.minHeat)}}class ProceduralMapGenerator{constructor(e){this.biomes=[Desert,Grassland,Mountains],this.scale=1,this.heightWaves=[new Wave(56,.05,1),new Wave(199.36,.1,.5)],this.moistureWaves=[new Wave(621,.03,1)],this.heatWaves=[new Wave(318.6,.04,1),new Wave(329.7,.02,.5)],this._mulberry=new Mulberry32(0),this.tilemap=e;}generateMap(e,t,s){const i=NoiseGenerator.generate(e,t,this.scale,this.heightWaves,s),r=NoiseGenerator.generate(e,t,this.scale,this.moistureWaves,s),a=NoiseGenerator.generate(e,t,this.scale,this.heatWaves,s);for(let o=0;o<e;o++)for(let e=0;e<t;e++){const t=i[o][e],n=r[o][e],l=a[o][e],h=this.getBiome(t,n,l).getTileSprite(this._mulberry);this.tilemap.setTile(o+s.x,e+s.y,h.i,h.a,!1);}}getBiome(e,t,s){const i=[],r=this.biomes;for(let a=0;a<r.length;++a){const o=r[a];o.matchCondition(e,t,s)&&i.push(new BiomeTempData(o));}let a=0,o=null;for(let r=0;r<i.length;++r){const n=i[r];(null==o||n.getDiffValue(e,t,s)<a)&&(o=n.biome,a=n.getDiffValue(e,t,s));}return null==o&&(o=r[0]),o}}

	class ChunkLoader{constructor(t,e=15){this._loadedChunks=new Set,this._tempVector2=new Vector2,this.generator=new ProceduralMapGenerator(t),this._chunkSize=e,this._renderer=t;}vector2ToString(t){return t.x+"_"+t.y}generateChunk(t){const e=this._chunkSize,o=this._tempVector2.set(t.x*e-Math.floor(e/2),t.y*e-Math.floor(e/2));this.generator.generateMap(e,e,o);}destroyChunk(t){const e=this._chunkSize,o=this._tempVector2.set(t.x*e-Math.floor(e/2),t.y*e-Math.floor(e/2)),r=this._renderer;for(let t=0;t<e;t++)for(let h=0;h<e;h++)r.deleteTile(o.x+h,o.y+t,!1);}loadChunk(t){const e=this.vector2ToString(t);this._loadedChunks.has(e)||(this.generateChunk(t),this._loadedChunks.add(e));}unloadChunk(t){const e=this.vector2ToString(t);this._loadedChunks.has(e)&&(this.destroyChunk(t),this._loadedChunks.delete(e));}unloadAllChunks(){for(const t of this._loadedChunks){const e=t.split("_");this.destroyChunk(new Vector2(parseInt(e[0]),parseInt(e[1])));}this._loadedChunks.clear();}getChunkIndexFromPosition(t,e){return null!=e||(e=new Vector2),e.set(Math.floor((t.x+this._chunkSize/2)/this._chunkSize),Math.floor((t.y+this._chunkSize/2)/this._chunkSize))}}

	class UserChunkData{constructor(){this.loadedChunks=new Set,this.loadChunkQueue=new Set,this.unloadChunkQueue=new Set;}}class WorldGenerator{constructor(e,t,s=15,n=3){this._playerChunkPositions=new Map,this._userChunks=new Map,this._loadedChunks=new Map,this._disposed=!1,this._tempVector2=new Vector2,this._taskQueue=new Set,this._runningTasks=new Set,this._tempVector1=new Vector2,this._coroutineDispatcher=e,this._chunkSize=s,this._playerViewDistance=n,this._chunkLoader=new ChunkLoader(t,this._chunkSize),this._loadCirclePoints=this.computeCirclePoints(this._playerViewDistance),this._unloadChunkQueueMaxValue=3*this._loadCirclePoints.length;}computeCirclePoints(e){const t=[];if(e<1)return t;if(1==e)return t.push(new Vector2(0,0)),t;let s=0,n=e-=1,o=3-(e+e);do{const e=s;for(let o=-s;o<=e;o++)t.push(new Vector2(o,-n)),t.push(new Vector2(o,n));const i=s;for(let e=-s;e<=i;e++)t.push(new Vector2(-n,e)),t.push(new Vector2(n,e));s+=1,o<0?o+=6+(s<<2):(n-=1,o+=10+(s-n<<2));}while(s<=n);const i=s-1;for(let e=-n;e<=n;e++)for(let n=1-s;n<=i;n++)t.push(new Vector2(n,e));const h=new Set;for(let e=0;e<t.length;e++){const s=t[e],n=`${s.x},${s.y}`;h.has(n)?(t.splice(e,1),e--):h.add(n);}return t.sort(((e,t)=>{const s=e.length(),n=t.length();return s<n?-1:s>n?1:0})),t}updateChunkEnqueue(e,t){const s=this._loadCirclePoints;let n=this._userChunks.get(e);void 0===n&&(n=new UserChunkData,this._userChunks.set(e,n));const o=n.loadChunkQueue,i=n.unloadChunkQueue;o.clear(),i.clear();const h=[];for(const e of n.loadedChunks)h.push(e);for(let e=h.length-1;0<=e;--e)i.add(h[e]);if(t)for(let e=0;e<s.length;e++){const n=s[e],h=n.x+t.x+"_"+(n.y+t.y);i.has(h)?i.delete(h):o.add(h);}}*processUpdateChunk(e){const t=this._userChunks.get(e);if(void 0===t)return;const s=t.loadChunkQueue,n=t.unloadChunkQueue,o=t.loadedChunks;let i=Date.now();for(;(0<s.size||0<n.size)&&!this._disposed;){if(this._unloadChunkQueueMaxValue<n.size||s.size<=0){const e=n.keys().next().value;n.delete(e),o.delete(e);const t=this._loadedChunks.get(e);if(void 0!==t)if(t-1<=0){this._loadedChunks.delete(e);const t=e.split("_").map(Number);this._chunkLoader.unloadChunk(this._tempVector2.set(t[0],t[1]));}else this._loadedChunks.set(e,t-1);}else{const e=s.keys().next().value;s.delete(e),o.add(e);const t=this._loadedChunks.get(e);if(void 0===t){this._loadedChunks.set(e,1);const t=e.split("_").map(Number);this._chunkLoader.loadChunk(this._tempVector2.set(t[0],t[1]));}else this._loadedChunks.set(e,t+1);}const e=Date.now();10<e-i&&(i=e,yield null);}}lazyUpdateChunk(e,t){if(this.updateChunkEnqueue(e,t),this._runningTasks.has(e))return;this._taskQueue.add(e);const s=this;this._runningTasks.size<4&&this._coroutineDispatcher.startCoroutine(function*(){s._runningTasks.add(e),yield*s.processUpdateChunk(e),s._runningTasks.delete(e);}());}updatePlayerPosition(e,t){const s=this._chunkLoader.getChunkIndexFromPosition(t,this._tempVector1),n=this._playerChunkPositions.get(e);(null==n?void 0:n.equals(s))||(this.lazyUpdateChunk(e,s),n?n.copy(s):this._playerChunkPositions.set(e,s.clone()));}removePlayer(e){this._playerChunkPositions.get(e)&&(this.lazyUpdateChunk(e,void 0),this._playerChunkPositions.delete(e));}dispose(){const e=this._loadedChunks;for(const t of e.keys()){const e=t.split("_").map(Number);this._chunkLoader.unloadChunk(this._tempVector1.set(e[0],e[1]));}this._disposed=!0;}get generator(){return this._chunkLoader.generator}}

	class Plugin extends BasePlugin{constructor(){super(...arguments),this._chunkSize=15,this._playerViewDistance=3,this._coroutineDispatcher=null,this._worldGenerator=null,this._players=new Set,this._tempVector=new Vector2;}onLoad(){try{const e=this._coroutineDispatcher=new CoroutineDispatcher;this._worldGenerator=new WorldGenerator(e,this,this._chunkSize,this._playerViewDistance);}catch(e){this.broadcastMessage("error",e);}}onUnload(){try{this._coroutineDispatcher.dispose(),this._coroutineDispatcher=null,this._worldGenerator.dispose(),this._worldGenerator=null;}catch(e){this.broadcastMessage("error",e);}}onPlayerJoin(e){var r;try{this._players.add(e),null===(r=this._worldGenerator)||void 0===r||r.updatePlayerPosition(e,this._tempVector.set(0,0));}catch(e){this.broadcastMessage("error",e);}}onPlayerLeave(e){try{this._players.delete(e);}catch(e){this.broadcastMessage("error",e);}}onPlayerMove(e,r,t){var o;try{null===(o=this._worldGenerator)||void 0===o||o.updatePlayerPosition(e,this._tempVector.set(r,t));}catch(e){this.broadcastMessage("error",e);}}}globalThis.PluginImpl=Plugin;

}());
