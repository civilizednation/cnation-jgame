import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyCTwOAC_LrrKH8CKepUOTf0pyd9qRv4y_8",
authDomain: "cnation-project.firebaseapp.com",
projectId: "cnation-project",
storageBucket: "cnation-project.firebasestorage.app",
messagingSenderId: "1004154104261",
appId: "1:1004154104261:web:0eac4c7ded38262ae5c3ac",
measurementId: "G-7PW1NSP5EQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const SCORE_COL = "cnation-snake-scores";

window.cnationCachedScores = { kindergarten: [], elementary: [], middle: [], high: [] };

window.cnationPreloadRankings = async function() {
  const levels = ['kindergarten', 'elementary', 'middle', 'high'];
  try {
    const promises = levels.map(lvl => getDoc(doc(db, SCORE_COL, lvl)));
    const snaps = await Promise.all(promises);
    snaps.forEach((snap, idx) => {
      let lvl = levels[idx];
      if (snap.exists() && snap.data().scores) {
        window.cnationCachedScores[lvl] = snap.data().scores;
      }
    });
  } catch (e) {
    console.error("Preload error:", e);
  }
};
window.cnationPreloadRankings();

window.cnationShowRanking = function() {
const startScreen = document.getElementById('cnation-start-screen');
if (startScreen) startScreen.style.display = 'none';

const rankingScreen = document.getElementById('cnation-ranking-screen');
if (rankingScreen) rankingScreen.style.display = 'flex';

const container = document.getElementById('cnation-ranking-content');
const levels = [
{ key: 'high', name: '고등학생', color: '#c0392b' },
{ key: 'middle', name: '중학생', color: '#8e44ad' },
{ key: 'elementary', name: '초등학생', color: '#2980b9' },
{ key: 'kindergarten', name: '유치원생', color: '#16a085' }
];

let html = '';
for (let lvl of levels) {
let tableHtml = `<div style="background:#ffffff; border-radius:12px; padding:15px; margin-bottom:20px; border:2px solid ${lvl.color}; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
<h2 style="margin-top:0; margin-bottom:10px; color:${lvl.color}; text-align:center; font-size:22px;">${lvl.name}</h2>
<table class="ranking-table"><tr><th>순위</th><th>이름</th><th>점수</th></tr>`;

let scores = window.cnationCachedScores[lvl.key] || [];
if (scores.length > 0) {
scores.forEach((s, i) => {
let icon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}위`;
tableHtml += `<tr><td>${icon}</td><td style="color:#000;">${s.name}</td><td style="color:#e74c3c;">${s.score}</td></tr>`;
});
} else {
tableHtml += `<tr><td colspan="3" style="padding:15px; color:#999;">아직 등록된 랭킹이 없습니다.</td></tr>`;
}
tableHtml += '</table></div>';
html += tableHtml;
}
if (container) container.innerHTML = html;
};

window.cnationResetRanking = async function() {
let pw = prompt("관리자 비밀번호를 입력하세요:");
if (pw === "1257") {
const levels = ['kindergarten', 'elementary', 'middle', 'high'];
for (let lvl of levels) {
  await setDoc(doc(db, SCORE_COL, lvl), { scores: [] });
  window.cnationCachedScores[lvl] = [];
}
alert("전체 랭킹이 성공적으로 초기화되었습니다.");
window.cnationShowRanking();
} else if (pw !== null) { alert("비밀번호가 틀렸습니다."); }
};

window.cnationHandleScore = function(score, levelKey) {
if (score <= 0) return;
// 어린이 모드일 경우 cnationIsKidsMode 변수가 존재하고 참이면 제외
if (typeof cnationIsKidsMode !== 'undefined' && cnationIsKidsMode) return;

let topScores = window.cnationCachedScores[levelKey] || [];
let isHighScore = false;

if (topScores.length < 10) {
isHighScore = true;
} else {
const minScore = topScores[topScores.length - 1].score;
if (score > minScore) isHighScore = true;
}

if (isHighScore) {
window.cnationPendingScore = score;
window.cnationPendingLevel = levelKey;
document.getElementById('cnation-prompt-input').value = '';
document.getElementById('cnation-prompt-screen').style.display = 'flex';
}
};

window.cnationSubmitName = async function() {
let name = document.getElementById('cnation-prompt-input').value.trim();
if(!name) { alert("이름을 입력해주세요!"); return; }
document.getElementById('cnation-prompt-screen').style.display = 'none';

name = name.substring(0, 20);

try {
// 🚨 [핵심 수정 포인트] 저장 직전에 서버에서 가장 최신 랭킹 데이터를 다시 불러옵니다. 🚨
const docRef = doc(db, SCORE_COL, window.cnationPendingLevel);
const snap = await getDoc(docRef);
let latestScores = [];

// 서버에 기존 데이터가 정상적으로 있다면 가져옵니다. (네트워크 끊김으로 인한 초기화 방지)
if (snap.exists() && snap.data().scores) {
  latestScores = snap.data().scores;
}

// 최신 랭킹 목록에 내 점수를 추가하고 재정렬합니다.
latestScores.push({ name: name, score: window.cnationPendingScore });
latestScores.sort((a, b) => b.score - a.score);
latestScores = latestScores.slice(0, 10); // 상위 10명만 유지

// 병합된 안전한 데이터를 서버와 로컬에 저장합니다.
await setDoc(docRef, { scores: latestScores });
window.cnationCachedScores[window.cnationPendingLevel] = latestScores;

// 랭킹 화면이 열려있다면 즉시 갱신해 줍니다.
if (document.getElementById('cnation-ranking-screen').style.display === 'flex') {
  window.cnationShowRanking();
}

} catch(e) { 
console.error("Save error", e); 
alert("랭킹 등록 중 통신 오류가 발생했습니다. 네트워크 상태를 확인해주세요.");
}
};
