import './style.css';

// 1. 型定義に「日付」と「取り組んだ時間」を追加
interface TaskLog {
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm
  task: string;
  duration: number;  // 何分間やったか
}

const statusLabel = document.getElementById('status') as HTMLElement;
const timerDisplay = document.getElementById('timer') as HTMLElement;
const catImage = document.getElementById('cat-image') as HTMLImageElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const logList = document.getElementById('log-list') as HTMLElement;
const workInput = document.getElementById('work-time') as HTMLInputElement;
const breakInput = document.getElementById('break-time') as HTMLElement;

let timeLeft: number;
let timerId: number | null = null;
let isBreak: boolean = false;

// 2. ログ表示と集計のロジックを強化
const displayLogs = () => {
  const logs: TaskLog[] = JSON.parse(localStorage.getItem('cat_tasks') || '[]');
  
  // 直近一週間の判定用（7日前）
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // 合計時間を計算
  const weeklyTotalMinutes = logs
    .filter(log => new Date(log.date) >= oneWeekAgo)
    .reduce((sum, log) => sum + (log.duration || 0), 0);

  const hours = Math.floor(weeklyTotalMinutes / 60);
  const mins = weeklyTotalMinutes % 60;

  // 合計表示用のHTML
  const totalDisplayHtml = `
    <div class="total-summary" style="background: #fff3e0; padding: 20px; border-radius: 15px; margin-bottom: 20px; border: 2px solid #ffb347;">
      <div style="font-size: 1rem; color: #e67e22; font-weight: bold; margin-bottom: 5px;">🐾 今週の合計勉強時間 🐾</div>
      <div style="font-size: 2.5rem; font-weight: bold; color: #333;">${hours}<span style="font-size: 1rem;">時間</span> ${mins}<span style="font-size: 1rem;">分</span></div>
    </div>
  `;

  // ログリストの生成
  const logsHtml = logs.map(l => `
    <div class="log-item">
      <span class="log-time">${l.date.split('-').slice(1).join('/')} ${l.time}</span>: 
      <strong>${l.task}</strong> (${l.duration}分)
    </div>
  `).join('');

  logList.innerHTML = totalDisplayHtml + '<h3 style="text-align:left;">最近の記録</h3>' + logsHtml;
};

const playSound = () => {
  const context = new AudioContext();
  const osc = context.createOscillator();
  osc.type = 'sine';
  osc.connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + 0.5);
};

const finishPeriod = () => {
  if (timerId) clearInterval(timerId);
  timerId = null;
  playSound();

  if (!isBreak) {
    const task = prompt("何の作業が終わったニャ？");
    if (task) {
      const logs: TaskLog[] = JSON.parse(localStorage.getItem('cat_tasks') || '[]');
      const now = new Date();
      
      // 3. データの保存形式をアップデート
      logs.unshift({
        date: now.toISOString().split('T')[0], // "2025-12-20" 形式
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        task: task,
        duration: Number((document.getElementById('work-time') as HTMLInputElement).value)
      });
      
      localStorage.setItem('cat_tasks', JSON.stringify(logs));
      displayLogs();
    }
    isBreak = true;
    statusLabel.innerText = "休憩タイムニャ！ゆっくり休んでニャ。";
    catImage.src = "/sleep_cat.jpg";
  } else {
    isBreak = false;
    statusLabel.innerText = "全集中！作業再開ニャ！";
    catImage.src = "/work_cat.jpg";
  }
  
  const workVal = Number((document.getElementById('work-time') as HTMLInputElement).value);
  const breakVal = Number((document.getElementById('break-time') as HTMLInputElement).value);
  timeLeft = (isBreak ? breakVal : workVal) * 60;
  updateDisplay();
  startBtn.innerText = "スタート！";
};

const updateDisplay = () => {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

startBtn.onclick = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    startBtn.innerText = "再開";
  } else {
    const workVal = Number((document.getElementById('work-time') as HTMLInputElement).value);
    const breakVal = Number((document.getElementById('break-time') as HTMLInputElement).value);
    if (!timeLeft) {
      timeLeft = (isBreak ? breakVal : workVal) * 60;
    }
    startBtn.innerText = "一時停止";
    timerId = window.setInterval(() => {
      if (timeLeft <= 0) {
        finishPeriod();
      } else {
        timeLeft--;
        updateDisplay();
      }
    }, 1000);
  }
};

window.onload = displayLogs;