import './style.css';

// 型定義
interface TaskLog {
  date: string;
  time: string;
  task: string;
  duration: number;
}

// HTML要素の取得
const statusLabel = document.getElementById('status') as HTMLElement;
const timerDisplay = document.getElementById('timer') as HTMLElement;
const catImage = document.getElementById('cat-image') as HTMLImageElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const logList = document.getElementById('log-list') as HTMLElement;
const workInput = document.getElementById('work-time') as HTMLInputElement;
const breakInput = document.getElementById('break-time') as HTMLInputElement;

// タイマー管理用の変数
let timeLeft: number;
let timerId: number | null = null;
let isBreak: boolean = false;
let endTime: number; // 終了時刻をミリ秒で保持

// 表示の更新関数
const updateDisplay = () => {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ログの表示関数
const displayLogs = () => {
  const logs: TaskLog[] = JSON.parse(localStorage.getItem('cat_tasks') || '[]');
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weeklyTotalMinutes = logs
    .filter(log => new Date(log.date) >= oneWeekAgo)
    .reduce((sum, log) => sum + (log.duration || 0), 0);
    
  const hours = Math.floor(weeklyTotalMinutes / 60);
  const mins = weeklyTotalMinutes % 60;

  const totalDisplayHtml = `
    <div class="total-summary" style="background: #fff3e0; padding: 20px; border-radius: 15px; margin-bottom: 20px; border: 2px solid #ffb347;">
      <div style="font-size: 1rem; color: #e67e22; font-weight: bold; margin-bottom: 5px;">🐾 Weekly Study Time 🐾</div>
      <div style="font-size: 2.5rem; font-weight: bold; color: #333;">${hours}h ${mins}m</div>
    </div>
  `;
  
  const logsHtml = logs.map(l => `
    <div class="log-item"><span>${l.date.split('-').slice(1).join('/')} ${l.time}</span>: <strong>${l.task}</strong> (${l.duration} min)</div>
  `).join('');
  
  logList.innerHTML = totalDisplayHtml + '<h3 style="text-align:left;">Recent Logs</h3>' + logsHtml;
};

// タイマー終了時の処理
const finishPeriod = () => {
  if (timerId) clearInterval(timerId);
  timerId = null;
  
  if (!isBreak) {
    const task = prompt("何をしていましたか？");
    if (task) {
      const logs: TaskLog[] = JSON.parse(localStorage.getItem('cat_tasks') || '[]');
      logs.unshift({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        task: task,
        duration: Number(workInput.value)
      });
      localStorage.setItem('cat_tasks', JSON.stringify(logs));
      displayLogs();
    }
    isBreak = true;
    statusLabel.innerText = "Break Time!";
    catImage.src = "sleep_cat.jpg"; 
  } else {
    isBreak = false;
    statusLabel.innerText = "Back to work!";
    catImage.src = "work_cat.jpg";
  }
  
  timeLeft = (isBreak ? Number(breakInput.value) : Number(workInput.value)) * 60;
  updateDisplay();
  startBtn.innerText = "Start!";
};

// スタートボタンのクリックイベント
startBtn.onclick = () => {
  if (timerId) {
    // 一時停止
    clearInterval(timerId);
    timerId = null;
    startBtn.innerText = "Resume";
  } else {
    // 開始
    if (!timeLeft) {
      timeLeft = (isBreak ? Number(breakInput.value) : Number(workInput.value)) * 60;
    }
    
    // 終了時刻を確定（現在時刻 + 残り秒数）
    endTime = Date.now() + timeLeft * 1000;
    
    startBtn.innerText = "Pause";
    timerId = window.setInterval(() => {
      const now = Date.now();
      // 残り時間を再計算（ミリ秒から秒へ）
      timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      if (timeLeft <= 0) {
        finishPeriod();
      } else {
        updateDisplay();
      }
    }, 1000);
  }
};

window.onload = displayLogs;