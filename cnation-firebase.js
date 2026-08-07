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
document.getElementById('cnation-start-screen').style.display = 'none';
document.getElementById('cnation-ranking-screen').style.display = 'flex';
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
container.innerHTML = html;
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

// 게임 오버 시 점수를 판정하고 신기록일 경우 팝업을 띄우는 함수 추가
window.cnationHandleScore = function(score, levelKey) {
if (score <= 0) return;
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
window.cnationPendingScoresList = topScores;
document.getElementById('cnation-prompt-input').value = '';
document.getElementById('cnation-prompt-screen').style.display = 'flex';
}
};

window.cnationSubmitName = async function() {
let name = document.getElementById('cnation-prompt-input').value.trim();
if(!name) { alert("이름을 입력해주세요!"); return; }
document.getElementById('cnation-prompt-screen').style.display = 'none';

name = name.substring(0, 20);
window.cnationPendingScoresList.push({ name: name, score: window.cnationPendingScore });
window.cnationPendingScoresList.sort((a, b) => b.score - a.score);
window.cnationPendingScoresList = window.cnationPendingScoresList.slice(0, 10);

window.cnationCachedScores[window.cnationPendingLevel] = window.cnationPendingScoresList;

try {
await setDoc(doc(db, SCORE_COL, window.cnationPendingLevel), { scores: window.cnationPendingScoresList });
} catch(e) { console.error("Save error", e); }
};
