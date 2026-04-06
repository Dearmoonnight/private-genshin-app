// sw.js
const SHEET_ID = '1KXIFT2144f_9lihSxHEO_hzNiMEmgKyrNaM24WwBMyQ';
const SHEET_NAME = 'イベント一覧';

// インストール時にすぐに有効化
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  // 起動時に最初のチェックを実行
  checkSchedule();
});

// 定期的にチェックするタイマー（5分おきなど）
setInterval(checkSchedule, 300000); 

async function checkSchedule() {
  const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;
  try {
    const response = await fetch(API_URL);
    const rawData = await response.json();
    const now = new Date();
    
    const checkPoints = [
      { time: 24 * 60 * 60 * 1000, label: "1日前" },
      { time: 5 * 60 * 60 * 1000, label: "5時間前" },
      { time: 15 * 60 * 1000, label: "15分前" }
    ];

    rawData.forEach(item => {
      const start = new Date(item.start);
      const end = new Date(item.end);
      if (isNaN(start) || isNaN(end)) return;

      checkPoints.forEach(p => {
        // 開始通知の判定
        const startDiff = start - now;
        if (startDiff > 0 && startDiff <= p.time && startDiff > p.time - 300000) {
          showPaimonNotify(`旅人、オイラだぞ！あと${p.label}後に${item.name}が始まるぞ！`, `start-${item.name}-${p.label}`);
        }
        // 終了通知の判定
        const endDiff = end - now;
        if (endDiff > 0 && endDiff <= p.time && endDiff > p.time - 300000) {
          showPaimonNotify(`旅人、オイラだぞ！あと${p.label}後に${item.name}が終わるぞ！`, `end-${item.name}-${p.label}`);
        }
      });
    });
  } catch (e) {
    console.error("バックグラウンドチェック失敗", e);
  }
}

function showPaimonNotify(msg, tag) {
  self.registration.showNotification("原神スケジュール表", {
    body: msg,
    icon: "icon.png",
    tag: tag, // 同じ通知が何度も出ないようにタグ付け
    renotify: false
  });
}
