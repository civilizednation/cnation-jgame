const cnationColorConfig = {
green: { hHex: 0x145a32, bHex: 0x58d68d, hCss: '#145a32', bCss: '#58d68d' },
blue: { hHex: 0x154360, bHex: 0x5dade2, hCss: '#154360', bCss: '#5dade2' },
red: { hHex: 0x641e16, bHex: 0xec7063, hCss: '#641e16', bCss: '#ec7063' },
pink: { hHex: 0x78281f, bHex: 0xff99cc, hCss: '#78281f', bCss: '#ff99cc' },
yellow: { hHex: 0x7d6608, bHex: 0xf7dc6f, hCss: '#7d6608', bCss: '#f7dc6f' },
purple: { hHex: 0x4a235a, bHex: 0xbb8fce, hCss: '#4a235a', bCss: '#bb8fce' }
};

const cnationMatPlayerHead = new THREE.MeshStandardMaterial({ color: 0x145a32, roughness: 0.4, metalness: 0.1 });
const cnationMatPlayerBody = new THREE.MeshStandardMaterial({ color: 0x58d68d, roughness: 0.4, metalness: 0.1 });
const cnationMatPlayerRing = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.6, metalness: 0.1 });
const cnationMatEnemyHead = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.1 });
const cnationMatEnemyBody = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.1 });
const cnationMatEnemyRing = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.6, metalness: 0.1 });
const cnationMatFood = new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.3 });

function cnationCreateEmojiSprite(emoji) {
const canvas = document.createElement('canvas');
canvas.width = 128; canvas.height = 128;
const ctx = canvas.getContext('2d');
ctx.font = '90px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
ctx.fillText(emoji, 64, 64);
const texture = new THREE.CanvasTexture(canvas);
const spriteMat = new THREE.SpriteMaterial({ map: texture });
const sprite = new THREE.Sprite(spriteMat);
sprite.scale.set(1.5, 1.5, 1.5);
return sprite;
}

function cnationUpdateWormColors(conf) {
cnationMatPlayerHead.color.setHex(conf.hHex);
cnationMatPlayerBody.color.setHex(conf.bHex);
let hsl = {};
cnationMatPlayerBody.color.getHSL(hsl);
cnationMatPlayerRing.color.setHSL(hsl.h, hsl.s, Math.max(0, hsl.l - 0.2));
document.getElementById('cnation-preview-head').style.backgroundColor = conf.hCss;
document.getElementById('cnation-preview-body1').style.backgroundColor = conf.bCss;
document.getElementById('cnation-preview-body2').style.backgroundColor = conf.bCss;
document.getElementById('cnation-preview-body3').style.backgroundColor = conf.bCss;
}

window.cnationUpdatePreview = function() {
let colorKey = document.getElementById('cnation-color-select').value;
let conf = cnationColorConfig[colorKey];
cnationUpdateWormColors(conf);
};
window.cnationUpdatePreview();

let cnationAudioCtx;

function cnationInitAudio() {
let soundSetting = document.getElementById('cnation-sound-select').value;
if (soundSetting === 'off') return;
if (!cnationAudioCtx) { cnationAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
if (cnationAudioCtx.state === 'suspended') { cnationAudioCtx.resume(); }
const osc = cnationAudioCtx.createOscillator();
const gain = cnationAudioCtx.createGain();
osc.connect(gain); gain.connect(cnationAudioCtx.destination);
gain.gain.value = 0;
osc.start(cnationAudioCtx.currentTime);
osc.stop(cnationAudioCtx.currentTime + 0.01);
}

function cnationPlaySound(type) {
let soundSetting = document.getElementById('cnation-sound-select').value;
if (soundSetting === 'off') return;
if (!cnationAudioCtx) return;
if (cnationAudioCtx.state === 'suspended') { cnationAudioCtx.resume(); }
const osc = cnationAudioCtx.createOscillator();
const gain = cnationAudioCtx.createGain();
osc.connect(gain); gain.connect(cnationAudioCtx.destination);
const now = cnationAudioCtx.currentTime;

if (type === 'correct') {
let targetVolume = 0.15;
osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
gain.gain.setValueAtTime(targetVolume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
osc.start(now); osc.stop(now + 0.15);
} else if (type === 'wrong') {
let targetVolume = 0.075;
osc.type = 'square';
osc.frequency.setValueAtTime(250, now); 
osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
gain.gain.setValueAtTime(targetVolume, now); 
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
osc.start(now); osc.stop(now + 0.25);
} else if (type === 'die') {
let targetVolume = 0.075;
osc.type = 'square'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(60, now + 0.4);
gain.gain.setValueAtTime(targetVolume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
osc.start(now); osc.stop(now + 0.4);
} else if (type === 'enemy_die') {
osc.type = 'triangle'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
osc.start(now); osc.stop(now + 0.1);
} else if (type === 'heal') {
let targetVolume = 0.075;
osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
gain.gain.setValueAtTime(targetVolume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
osc.start(now); osc.stop(now + 0.2);
} else if (type === 'freeze') {
let targetVolume = 0.075;
osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
gain.gain.setValueAtTime(targetVolume, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
osc.start(now); osc.stop(now + 0.3);
} else if (type === 'bonus') {
let targetVolume = 0.075;
osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.setValueAtTime(600, now + 0.1); osc.frequency.setValueAtTime(800, now + 0.2);
gain.gain.setValueAtTime(targetVolume, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
osc.start(now); osc.stop(now + 0.3);
}
}

const cnationScene = new THREE.Scene();
cnationScene.background = new THREE.Color(0x34495e);
const cnationBounds = { x: 11, y: 11 };
const cnationCamera = new THREE.OrthographicCamera(-14, 14, 14, -14, 0.1, 1000);

const cnationRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const canvasWrapper = document.getElementById('canvas-wrapper');
canvasWrapper.appendChild(cnationRenderer.domElement);

function cnationAdjustCamera() {
let w = canvasWrapper.clientWidth;
let h = canvasWrapper.clientHeight;

let aspect = w / h;
let viewSize = 14;

if (aspect < 1) {
cnationCamera.left = -viewSize; cnationCamera.right = viewSize;
cnationCamera.top = viewSize / aspect; cnationCamera.bottom = -viewSize / aspect;
} else {
cnationCamera.left = -viewSize * aspect; cnationCamera.right = viewSize * aspect;
cnationCamera.top = viewSize; cnationCamera.bottom = -viewSize;
}
cnationCamera.updateProjectionMatrix();
cnationCamera.position.set(0, 20, 0);
cnationCamera.up.set(0, 0, -1);
cnationCamera.lookAt(0, 0, 0);

cnationRenderer.setSize(w, h);
}

const cnationAmbientLight = new THREE.AmbientLight(0xffffff, 0.8);
cnationScene.add(cnationAmbientLight);
const cnationDirLight = new THREE.DirectionalLight(0xffffff, 0.8);
cnationDirLight.position.set(10, 20, 10);
cnationScene.add(cnationDirLight);

const cnationFloorGeo = new THREE.PlaneGeometry(cnationBounds.x * 2 + 2, cnationBounds.y * 2 + 2);
const cnationFloorMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.8 });
const cnationFloor = new THREE.Mesh(cnationFloorGeo, cnationFloorMat);
cnationFloor.rotation.x = -Math.PI / 2;
cnationFloor.position.y = -0.5;
cnationScene.add(cnationFloor);

const cnationWallGeoX = new THREE.BoxGeometry(cnationBounds.x * 2 + 2, 0.8, 0.8);
const cnationWallGeoY = new THREE.BoxGeometry(0.8, 0.8, cnationBounds.y * 2 + 2);
const cnationWallMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.5 });
const cnationWallTop = new THREE.Mesh(cnationWallGeoX, cnationWallMat);
cnationWallTop.position.set(0, 0, -cnationBounds.y - 0.5);
cnationScene.add(cnationWallTop);
const cnationWallBot = new THREE.Mesh(cnationWallGeoX, cnationWallMat);
cnationWallBot.position.set(0, 0, cnationBounds.y + 0.5);
cnationScene.add(cnationWallBot);
const cnationWallLeft = new THREE.Mesh(cnationWallGeoY, cnationWallMat);
cnationWallLeft.position.set(-cnationBounds.x - 0.5, 0, 0);
cnationScene.add(cnationWallLeft);
const cnationWallRight = new THREE.Mesh(cnationWallGeoY, cnationWallMat);
cnationWallRight.position.set(cnationBounds.x + 0.5, 0, 0);
cnationScene.add(cnationWallRight);

let cnationGameState = 'TITLE';
let cnationScore = 0; let cnationCorrectAnswers = 0;
let cnationGameStage = 0; let cnationBaseInterval = 208;
let cnationMaxEnemies = 2; let cnationMaxTime = 20;
let cnationLives = 3; const cnationMaxLives = 5;
let cnationStarBonusCount = 0;
let cnationIsKidsMode = false;

let cnationSelectedVocab = []; let cnationCurrentQuestion = null;
let cnationTimeLeft = 20; let cnationLastFrameTime = 0;
let cnationMissedWords = [];

let cnationPlayerLogic = []; let cnationPlayerMeshes = [];
let cnationPlayerDir = { x: 0, y: -1 }; let cnationPlayerNextDir = { x: 0, y: -1 };
let cnationLastTickTime = 0; let cnationLastEnemyTickTime = 0;

let cnationEnemies = []; let cnationFoodData = [];
let cnationHeartItem = null; let cnationIceItem = null; let cnationStarItem = null;
let cnationEnemiesFrozen = false;

const cnationGeoBody = new THREE.SphereGeometry(0.45, 32, 32);
const cnationGeoRing = new THREE.TorusGeometry(0.45, 0.08, 12, 24);
const cnationGeoEye = new THREE.SphereGeometry(0.12, 16, 16);
const cnationGeoPupil = new THREE.SphereGeometry(0.06, 16, 16);
const cnationMatWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
const cnationMatBlack = new THREE.MeshBasicMaterial({ color: 0x000000 });
const cnationGeoBox = new THREE.BoxGeometry(0.7, 0.7, 0.7);

function cnationCreateHeadMesh(isEnemy) {
const group = new THREE.Group();
const head = new THREE.Mesh(cnationGeoBody, isEnemy ? cnationMatEnemyHead : cnationMatPlayerHead);
group.add(head);
const leftEye = new THREE.Mesh(cnationGeoEye, cnationMatWhite);
leftEye.position.set(-0.2, 0.2, 0.35);
const leftPupil = new THREE.Mesh(cnationGeoPupil, cnationMatBlack);
leftPupil.position.set(0, 0, 0.1);
leftEye.add(leftPupil);
group.add(leftEye);
const rightEye = new THREE.Mesh(cnationGeoEye, cnationMatWhite);
rightEye.position.set(0.2, 0.2, 0.35);
const rightPupil = new THREE.Mesh(cnationGeoPupil, cnationMatBlack);
rightPupil.position.set(0, 0, 0.1);
rightEye.add(rightPupil);
group.add(rightEye);
return group;
}

function cnationCreateBodyMesh(isEnemy) {
const group = new THREE.Group();
const body = new THREE.Mesh(cnationGeoBody, isEnemy ? cnationMatEnemyBody : cnationMatPlayerBody);
group.add(body);
const ring = new THREE.Mesh(cnationGeoRing, isEnemy ? cnationMatEnemyRing : cnationMatPlayerRing);
group.add(ring);
return group;
}

function cnationShowEventMsg(text, bgColor) {
let msg = document.createElement('div');
msg.style.padding = '8px 16px'; msg.style.background = bgColor;
msg.style.borderRadius = '15px'; msg.style.fontWeight = 'bold';
msg.style.fontSize = '16px'; msg.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
msg.style.border = '2px solid #fff'; msg.style.color = '#fff';
msg.innerHTML = text;
document.getElementById('cnation-event-msg-container').appendChild(msg);
setTimeout(() => { msg.remove(); }, 2000);
}

window.cnationPendingScore = 0; window.cnationPendingLevel = ''; window.cnationPendingScoresList = [];

function cnationUpdateLivesUI() {
let hearts = "";
for(let i=0; i<cnationLives; i++) hearts += "❤️";
for(let i=cnationLives; i<cnationMaxLives; i++) hearts += "🤍";
document.getElementById('cnation-lives-display').innerText = hearts;
}

function showScreen(screenId) {
const screens = ['cnation-start-screen', 'cnation-game-ui', 'cnation-game-over', 'cnation-prompt-screen', 'cnation-ranking-screen', 'cnation-info-screen'];
screens.forEach(id => {
    document.getElementById(id).style.display = (id === screenId) ? 'flex' : 'none';
});
}

window.cnationStartGame = function() {
cnationInitAudio();
let colorKey = document.getElementById('cnation-color-select').value;
let conf = cnationColorConfig[colorKey];
cnationUpdateWormColors(conf);
let levelSel = document.getElementById('cnation-level-select');
let levelKey = levelSel.value;
let levelText = levelSel.options[levelSel.selectedIndex].text;

if (typeof cnationWordDB === 'undefined' || !cnationWordDB[levelKey]) {
alert("단어 데이터를 불러올 수 없습니다. word.js 파일 상태를 확인해주세요.");
return;
}

cnationIsKidsMode = document.getElementById('cnation-kids-mode-checkbox').checked;

let vocabDisplay = document.getElementById('cnation-vocab-display');
if (cnationIsKidsMode) {
vocabDisplay.className = "cnation-kids-badge";
vocabDisplay.innerText = "어린이 모드";
} else {
vocabDisplay.className = "cnation-highlight-box";
vocabDisplay.innerText = levelText;
}

cnationSelectedVocab = cnationWordDB[levelKey];

showScreen('cnation-game-ui');
document.getElementById('cnation-feedback-text').innerHTML = '게임을 시작합니다! 화이팅!';
document.getElementById('cnation-event-msg-container').innerHTML = '';

cnationAdjustCamera(); cnationResetWorld();
cnationGameState = 'PLAYING'; cnationLastFrameTime = performance.now();
};

window.cnationGoToTitle = function() {
showScreen('cnation-start-screen');
cnationGameState = 'TITLE';
if (window.cnationPreloadRankings) window.cnationPreloadRankings();
for(let i=0; i<4; i++) { document.getElementById('cnation-label-'+i).style.display = 'none'; }
};

window.cnationCloseRanking = function() { showScreen('cnation-start-screen'); };
window.cnationShowInfo = function() { showScreen('cnation-info-screen'); };
window.cnationCloseInfo = function() { showScreen('cnation-start-screen'); };
window.cnationCancelName = function() { showScreen('cnation-start-screen'); };

function cnationUpdateStage() {
let levelSpan = document.getElementById('cnation-game-level');
let baseIntervalRaw = 208;
let maxTimeRaw = 20;
let targetMaxEnemies = 2;

if(cnationCorrectAnswers >= 20) {
cnationGameStage = 2; baseIntervalRaw = 110; targetMaxEnemies = 4; maxTimeRaw = 15;
levelSpan.innerText = "상"; levelSpan.style.color = "#e74c3c";
} else if(cnationCorrectAnswers >= 10) {
cnationGameStage = 1; baseIntervalRaw = 154; targetMaxEnemies = 3; maxTimeRaw = 18;
levelSpan.innerText = "중"; levelSpan.style.color = "#3498db";
} else {
cnationGameStage = 0; baseIntervalRaw = 208; targetMaxEnemies = 2; maxTimeRaw = 20;
levelSpan.innerText = "하"; levelSpan.style.color = "#f1c40f";
}

if (cnationIsKidsMode) {
cnationBaseInterval = baseIntervalRaw * 3;
cnationMaxTime = maxTimeRaw * 3;
if (cnationGameStage === 0) cnationMaxEnemies = 0;
else if (cnationGameStage === 1) cnationMaxEnemies = 1;
else cnationMaxEnemies = 2;
} else {
cnationBaseInterval = baseIntervalRaw;
cnationMaxTime = maxTimeRaw;
cnationMaxEnemies = targetMaxEnemies;
}

while(cnationEnemies.length > cnationMaxEnemies) {
let removed = cnationEnemies.pop();
removed.meshes.forEach(m => cnationScene.remove(m));
}
while(cnationEnemies.length < cnationMaxEnemies) {
cnationSpawnEnemy();
}
}

function cnationResetWorld() {
cnationPlayerMeshes.forEach(m => cnationScene.remove(m));
cnationEnemies.forEach(e => e.meshes.forEach(m => cnationScene.remove(m)));
cnationFoodData.forEach(f => cnationScene.remove(f.mesh));
if(cnationHeartItem) { cnationScene.remove(cnationHeartItem.mesh); cnationHeartItem = null; }
if(cnationIceItem) { cnationScene.remove(cnationIceItem.mesh); cnationIceItem = null; }
if(cnationStarItem) { cnationScene.remove(cnationStarItem.mesh); cnationStarItem = null; }
cnationMatEnemyHead.transparent = false; cnationMatEnemyHead.opacity = 1.0;
cnationMatEnemyBody.transparent = false; cnationMatEnemyBody.opacity = 1.0;
cnationMatEnemyRing.transparent = false; cnationMatEnemyRing.opacity = 1.0;
cnationEnemiesFrozen = false;
cnationPlayerLogic = []; cnationPlayerMeshes = []; cnationEnemies = []; cnationFoodData = [];
cnationScore = 0; cnationCorrectAnswers = 0; cnationMissedWords = []; cnationLives = 3; cnationStarBonusCount = 0;
cnationUpdateLivesUI();
document.getElementById('cnation-score-val').innerText = cnationScore;
cnationPlayerDir = { x: 0, y: -1 }; cnationPlayerNextDir = { x: 0, y: -1 };
cnationLastTickTime = performance.now(); cnationLastEnemyTickTime = performance.now();
for (let i = 0; i < 4; i++) {
cnationPlayerLogic.push({ x: 0, z: i });
let m = i === 0 ? cnationCreateHeadMesh(false) : cnationCreateBodyMesh(false);
m.position.set(0, 0.5, i); cnationPlayerMeshes.push(m); cnationScene.add(m);
}
cnationUpdateStage(); cnationSpawnQuestion();
}

function cnationSpawnEnemy() {
let rx = Math.floor(Math.random() * (cnationBounds.x * 2 - 4)) - (cnationBounds.x - 2);
let rz = (Math.random() < 0.5) ? cnationBounds.y - 3 : -cnationBounds.y + 3;
let logic = []; let meshes = [];
for (let i = 0; i < 3; i++) {
logic.push({ x: rx, z: rz + i });
let m = i === 0 ? cnationCreateHeadMesh(true) : cnationCreateBodyMesh(true);
m.position.set(rx, 0.5, rz + i); meshes.push(m); cnationScene.add(m);
}
cnationEnemies.push({ logic: logic, meshes: meshes, dir: { x: 0, y: -1 } });
}

function cnationSpawnQuestion() {
cnationFoodData.forEach(f => cnationScene.remove(f.mesh));
cnationFoodData = [];
if(cnationHeartItem) { cnationScene.remove(cnationHeartItem.mesh); cnationHeartItem = null; }
if(cnationIceItem) { cnationScene.remove(cnationIceItem.mesh); cnationIceItem = null; }
if(cnationStarItem) { cnationScene.remove(cnationStarItem.mesh); cnationStarItem = null; }

cnationMatEnemyHead.transparent = false; cnationMatEnemyHead.opacity = 1.0;
cnationMatEnemyBody.transparent = false; cnationMatEnemyBody.opacity = 1.0;
cnationMatEnemyRing.transparent = false; cnationMatEnemyRing.opacity = 1.0;
cnationEnemiesFrozen = false;
cnationTimeLeft = cnationMaxTime;
document.getElementById('cnation-timer-fill').style.background = '#00ff00';

let count = cnationIsKidsMode ? 3 : 4;
let shuffled = [...cnationSelectedVocab].sort(() => 0.5 - Math.random());
let choices = shuffled.slice(0, count);
cnationCurrentQuestion = choices[Math.floor(Math.random() * count)];
document.getElementById('cnation-question-text').innerText = cnationCurrentQuestion.ko;

for(let i=0; i<4; i++) {
let lbl = document.getElementById('cnation-label-' + i);
if(i >= count) {
lbl.style.display = 'none';
continue;
}
let valid = false; let rx, rz; let attempts = 0;
while(!valid && attempts < 200) {
rx = Math.floor(Math.random() * (cnationBounds.x * 2 - 4)) - (cnationBounds.x - 2);
rz = Math.floor(Math.random() * (cnationBounds.y * 2 - 4)) - (cnationBounds.y - 2);
valid = true;
for(let p of cnationPlayerLogic) if(p.x === rx && p.z === rz) valid = false;
for(let f of cnationFoodData) { if(Math.abs(f.x - rx) < 4 && Math.abs(f.z - rz) < 4) valid = false; }
attempts++;
}
let isCorrect = (choices[i].en === cnationCurrentQuestion.en);
let m = new THREE.Mesh(cnationGeoBox, cnationMatFood);
m.position.set(rx, 0.5, rz);
cnationFoodData.push({ x: rx, z: rz, mesh: m, word: choices[i].en, isCorrect: isCorrect });
cnationScene.add(m);
lbl.innerText = choices[i].en; lbl.style.display = 'block';
}

function getValidPos() {
let valid = false, rx, rz, attempts = 0;
while(!valid && attempts < 200) {
rx = Math.floor(Math.random() * (cnationBounds.x * 2 - 4)) - (cnationBounds.x - 2);
rz = Math.floor(Math.random() * (cnationBounds.y * 2 - 4)) - (cnationBounds.y - 2);
valid = true;
for(let p of cnationPlayerLogic) if(p.x === rx && p.z === rz) valid = false;
for(let f of cnationFoodData) if(f.x === rx && f.z === rz) valid = false;
attempts++;
}
return valid ? {x: rx, z: rz} : null;
}

let rand = Math.random();
if(rand < 0.20) {
let pos = getValidPos();
if(pos) {
if(rand < 0.05) {
let m = cnationCreateEmojiSprite('💖');
m.position.set(pos.x, 0.5, pos.z); cnationScene.add(m);
cnationHeartItem = { x: pos.x, z: pos.z, mesh: m };
} else if (rand < 0.12) {
if (cnationStarBonusCount <= 0) {
let m = cnationCreateEmojiSprite('⭐');
m.position.set(pos.x, 0.5, pos.z); cnationScene.add(m);
cnationStarItem = { x: pos.x, z: pos.z, mesh: m };
}
} else {
let m = cnationCreateEmojiSprite('💎');
m.position.set(pos.x, 0.5, pos.z); cnationScene.add(m);
cnationIceItem = { x: pos.x, z: pos.z, mesh: m };
}
}
}
}

function cnationPenalty() {
cnationPlaySound('wrong');
let fb = document.getElementById('cnation-feedback-text');
fb.innerHTML = `<span style="color:#e74c3c;">틀렸습니다.</span> <br> 정답: <span style="color:#3498db;">${cnationCurrentQuestion.en}</span>`;

cnationMissedWords.push(cnationCurrentQuestion);
cnationScore -= 5; if(cnationScore < 0) cnationScore = 0;
document.getElementById('cnation-score-val').innerText = cnationScore;
cnationLives--; cnationUpdateLivesUI();
if(cnationPlayerLogic.length > 0) { cnationPlayerLogic.pop(); let m = cnationPlayerMeshes.pop(); cnationScene.remove(m); }
if(cnationLives <= 0 || cnationPlayerLogic.length === 0) { cnationGameOver(); } else { cnationSpawnQuestion(); }
}

function cnationUpdateLabels() {
let w = canvasWrapper.clientWidth;
let h = canvasWrapper.clientHeight;

let baseFontSize = Math.min(32, Math.max(14, w * 0.035));
let count = cnationIsKidsMode ? 3 : 4;

for(let i=0; i<count; i++) {
let f = cnationFoodData[i]; if(!f) continue;
let pos = f.mesh.position.clone(); pos.project(cnationCamera);

let x = (pos.x * 0.5 + 0.5) * w; 
let y = (pos.y * -0.5 + 0.5) * h;

let lbl = document.getElementById('cnation-label-' + i); 
lbl.style.fontSize = baseFontSize + 'px';
let offsetY = -(baseFontSize * 1.5); 
lbl.style.left = x + 'px'; lbl.style.top = (y + offsetY) + 'px';
}
}

window.addEventListener('keydown', (e) => {
if (cnationGameState !== 'PLAYING') return;
if (e.key === 'ArrowUp' && cnationPlayerDir.y === 0) cnationPlayerNextDir = { x: 0, y: -1 };
else if (e.key === 'ArrowDown' && cnationPlayerDir.y === 0) cnationPlayerNextDir = { x: 0, y: 1 };
else if (e.key === 'ArrowLeft' && cnationPlayerDir.x === 0) cnationPlayerNextDir = { x: -1, y: 0 };
else if (e.key === 'ArrowRight' && cnationPlayerDir.x === 0) cnationPlayerNextDir = { x: 1, y: 0 };
});

let cnationMouseX = 0; let cnationMouseY = 0;
let cnationIsMouseDown = false;

canvasWrapper.addEventListener('mousedown', (e) => { 
cnationMouseX = e.clientX; cnationMouseY = e.clientY; 
cnationIsMouseDown = true;
});
window.addEventListener('mouseup', (e) => {
if (!cnationIsMouseDown || cnationGameState !== 'PLAYING') return;
cnationIsMouseDown = false;
let dx = e.clientX - cnationMouseX; let dy = e.clientY - cnationMouseY;
if (Math.abs(dx) > Math.abs(dy)) {
if (dx > 30 && cnationPlayerDir.x === 0) cnationPlayerNextDir = { x: 1, y: 0 };
else if (dx < -30 && cnationPlayerDir.x === 0) cnationPlayerNextDir = { x: -1, y: 0 };
} else {
if (dy > 30 && cnationPlayerDir.y === 0) cnationPlayerNextDir = { x: 0, y: 1 };
else if (dy < -30 && cnationPlayerDir.y === 0) cnationPlayerNextDir = { x: 0, y: -1 };
}
});

function cnationGameOver() {
cnationPlaySound('die'); cnationGameState = 'GAMEOVER';
document.getElementById('cnation-final-score').innerText = cnationScore;
document.getElementById('cnation-final-correct').innerText = cnationCorrectAnswers;

let missedHtml = "";
if(cnationMissedWords.length === 0) { 
    missedHtml = "틀린 단어가 없습니다!<br>완벽합니다!"; 
} else { 
    cnationMissedWords.forEach(w => { missedHtml += w.en + " : " + w.ko + "<br>"; }); 
}
document.getElementById('cnation-missed-list').innerHTML = missedHtml;

showScreen('cnation-game-over');
for(let i=0; i<4; i++) document.getElementById('cnation-label-'+i).style.display = 'none';

let levelKey = document.getElementById('cnation-level-select').value;
if (!cnationIsKidsMode && window.cnationHandleScore) {
window.cnationHandleScore(cnationScore, levelKey);
}
}

function cnationPlayerTick() {
cnationPlayerDir = cnationPlayerNextDir;
let px = cnationPlayerLogic[0].x + cnationPlayerDir.x; let pz = cnationPlayerLogic[0].z + cnationPlayerDir.y;
if (px < -cnationBounds.x || px > cnationBounds.x || pz < -cnationBounds.y || pz > cnationBounds.y) { cnationGameOver(); return; }
for(let i=1; i<cnationPlayerLogic.length; i++) { if(px === cnationPlayerLogic[i].x && pz === cnationPlayerLogic[i].z) { cnationGameOver(); return; } }
if (!cnationEnemiesFrozen) {
for(let i=0; i<cnationEnemies.length; i++) {
for(let j=0; j<cnationEnemies[i].logic.length; j++) { if(px === cnationEnemies[i].logic[j].x && pz === cnationEnemies[i].logic[j].z) { cnationGameOver(); return; } }
}
}
if(cnationHeartItem && px === cnationHeartItem.x && pz === cnationHeartItem.z) {
cnationPlaySound('heal'); cnationScene.remove(cnationHeartItem.mesh); cnationHeartItem = null;
if(cnationLives < cnationMaxLives) { cnationLives++; cnationUpdateLivesUI(); cnationShowEventMsg('체력 1 회복 💖', 'rgba(231, 76, 60, 0.95)'); }
}
if(cnationIceItem && px === cnationIceItem.x && pz === cnationIceItem.z) {
cnationPlaySound('freeze'); cnationScene.remove(cnationIceItem.mesh); cnationIceItem = null; cnationEnemiesFrozen = true;
cnationMatEnemyHead.transparent = true; cnationMatEnemyHead.opacity = 0.3; cnationMatEnemyBody.transparent = true; cnationMatEnemyBody.opacity = 0.3; cnationMatEnemyRing.transparent = true; cnationMatEnemyRing.opacity = 0.3;
cnationShowEventMsg('방해꾼 일시정지 💎', 'rgba(52, 152, 219, 0.9)');
}
if(cnationStarItem && px === cnationStarItem.x && pz === cnationStarItem.z) {
cnationPlaySound('bonus'); cnationScene.remove(cnationStarItem.mesh); cnationStarItem = null; cnationStarBonusCount = 5;
cnationShowEventMsg('5문제 정답 점수 두배 ⭐', 'rgba(241, 196, 15, 0.95)');
}

let pAteIndex = -1;
for(let f=0; f<cnationFoodData.length; f++) { if(px === cnationFoodData[f].x && pz === cnationFoodData[f].z) { pAteIndex = f; break; } }
let willGrow = false;
if(pAteIndex !== -1) {
if(cnationFoodData[pAteIndex].isCorrect) {
cnationPlaySound('correct');
let fb = document.getElementById('cnation-feedback-text');
fb.innerHTML = `<span style="color:#2ecc71;">정답 입니다!</span><br>${cnationCurrentQuestion.en} (${cnationCurrentQuestion.ko})`;

if (cnationStarBonusCount > 0) { cnationScore += 20; cnationStarBonusCount--; } else { cnationScore += 10; }
cnationCorrectAnswers++; document.getElementById('cnation-score-val').innerText = cnationScore;
willGrow = true; cnationUpdateStage(); cnationSpawnQuestion();
} else { cnationPenalty(); if(cnationGameState === 'GAMEOVER') return; }
}

if(cnationGameState === 'PLAYING') {
if(willGrow) {
let m = cnationCreateBodyMesh(false); cnationPlayerMeshes.push(m); cnationScene.add(m);
cnationPlayerLogic.push({x: cnationPlayerLogic[cnationPlayerLogic.length-1].x, z: cnationPlayerLogic[cnationPlayerLogic.length-1].z});
}
for (let i = cnationPlayerLogic.length - 1; i > 0; i--) { cnationPlayerLogic[i].x = cnationPlayerLogic[i - 1].x; cnationPlayerLogic[i].z = cnationPlayerLogic[i - 1].z; }
cnationPlayerLogic[0].x = px; cnationPlayerLogic[0].z = pz;
}
}

function cnationEnemyTick() {
if(cnationEnemiesFrozen) return;
let deadEnemies = []; let playedDeathSound = false;
cnationEnemies.forEach((e, idx) => {
if(Math.random() < 0.15) { let turns = e.dir.x === 0 ? [{x:1, y:0}, {x:-1, y:0}] : [{x:0, y:1}, {x:0, y:-1}]; e.dir = turns[Math.floor(Math.random() * 2)]; }
let nx = e.logic[0].x + e.dir.x; let nz = e.logic[0].z + e.dir.y; let attempts = 0;
while ((nx < -cnationBounds.x || nx > cnationBounds.x || nz < -cnationBounds.y || nz > cnationBounds.y) && attempts < 10) {
let turns = e.dir.x === 0 ? [{x:1, y:0}, {x:-1, y:0}] : [{x:0, y:1}, {x:0, y:-1}]; e.dir = turns[Math.floor(Math.random() * 2)];
nx = e.logic[0].x + e.dir.x; nz = e.logic[0].z + e.dir.y; attempts++;
}
if(nx < -cnationBounds.x) { nx = -cnationBounds.x; e.dir = {x:1, y:0}; }
if(nx > cnationBounds.x) { nx = cnationBounds.x; e.dir = {x:-1, y:0}; }
if(nz < -cnationBounds.y) { nz = -cnationBounds.y; e.dir = {x:0, y:1}; }
if(nz > cnationBounds.y) { nz = cnationBounds.y; e.dir = {x:0, y:-1}; }
e.nextX = nx; e.nextZ = nz;
});
cnationEnemies.forEach((e, idx) => {
let hit = false;
for(let j=0; j<cnationPlayerLogic.length; j++) { if(e.nextX === cnationPlayerLogic[j].x && e.nextZ === cnationPlayerLogic[j].z) hit = true; }
for(let i=0; i<cnationEnemies.length; i++) {
if(i === idx) continue;
for(let j=0; j<cnationEnemies[i].logic.length; j++) { if(e.nextX === cnationEnemies[i].logic[j].x && e.nextZ === cnationEnemies[i].logic[j].z) hit = true; }
}
if(hit) {
deadEnemies.push(idx); if(!playedDeathSound) { cnationPlaySound('enemy_die'); playedDeathSound = true; }
} else {
for (let i = e.logic.length - 1; i > 0; i--) { e.logic[i].x = e.logic[i - 1].x; e.logic[i].z = e.logic[i - 1].z; }
e.logic[0].x = e.nextX; e.logic[0].z = e.nextZ;
}
});
for(let i=deadEnemies.length-1; i>=0; i--) { let eIdx = deadEnemies[i]; cnationEnemies[eIdx].meshes.forEach(m => cnationScene.remove(m)); cnationEnemies.splice(eIdx, 1); }
while(cnationEnemies.length < cnationMaxEnemies) cnationSpawnEnemy();
}

function cnationAnimate(time) {
requestAnimationFrame(cnationAnimate);
let dt = (time - cnationLastFrameTime) / 1000; cnationLastFrameTime = time;
if (cnationGameState === 'PLAYING') {
cnationTimeLeft -= dt;
let fill = document.getElementById('cnation-timer-fill'); fill.style.width = (cnationTimeLeft / cnationMaxTime * 100) + '%';
if(cnationTimeLeft < 4) fill.style.background = '#e74c3c';
if(cnationTimeLeft <= 0) cnationPenalty();

cnationFoodData.forEach(f => { f.mesh.rotation.x += 0.03; f.mesh.rotation.y += 0.03; });
let enemyInterval = cnationIsKidsMode ? (cnationBaseInterval / 0.7) * 3 : (cnationBaseInterval / 0.7);
if (time - cnationLastTickTime > cnationBaseInterval) { cnationPlayerTick(); cnationLastTickTime = time; }
if (cnationMaxEnemies > 0 && time - cnationLastEnemyTickTime > enemyInterval) { cnationEnemyTick(); cnationLastEnemyTickTime = time; }

let lerpFactor = cnationIsKidsMode ? 0.04 : 0.12;
for (let i = 0; i < cnationPlayerMeshes.length; i++) {
let target = new THREE.Vector3(cnationPlayerLogic[i].x, 0.5, cnationPlayerLogic[i].z); cnationPlayerMeshes[i].position.lerp(target, lerpFactor);
if (i === 0) {
let angle = Math.atan2(cnationPlayerDir.x, cnationPlayerDir.y); cnationPlayerMeshes[i].rotation.y = angle; cnationPlayerMeshes[i].scale.set(1, 1, 1);
} else {
let prevPos = cnationPlayerMeshes[i-1].position; let curPos = cnationPlayerMeshes[i].position;
if (prevPos.distanceTo(curPos) > 0.001) { cnationPlayerMeshes[i].lookAt(prevPos); }
if (i === cnationPlayerMeshes.length - 1) { cnationPlayerMeshes[i].scale.lerp(new THREE.Vector3(0.5, 0.5, 0.9), 0.2); } else { cnationPlayerMeshes[i].scale.lerp(new THREE.Vector3(1, 1, 1), 0.2); }
}
}
cnationEnemies.forEach(e => {
for(let i=0; i<e.meshes.length; i++) {
let target = new THREE.Vector3(e.logic[i].x, 0.5, e.logic[i].z); e.meshes[i].position.lerp(target, lerpFactor);
if (i === 0) {
let angle = Math.atan2(e.dir.x, e.dir.y); e.meshes[i].rotation.y = angle; e.meshes[i].scale.set(1, 1, 1);
} else {
let prevPos = e.meshes[i-1].position; let curPos = e.meshes[i].position;
if (prevPos.distanceTo(curPos) > 0.001) { e.meshes[i].lookAt(prevPos); }
if (i === e.meshes.length - 1) { e.meshes[i].scale.lerp(new THREE.Vector3(0.5, 0.5, 0.9), 0.2); } else { e.meshes[i].scale.lerp(new THREE.Vector3(1, 1, 1), 0.2); }
}
}
});
cnationUpdateLabels();
}
cnationRenderer.render(cnationScene, cnationCamera);
}

window.addEventListener('resize', () => { cnationAdjustCamera(); });
cnationAdjustCamera(); requestAnimationFrame(cnationAnimate);
