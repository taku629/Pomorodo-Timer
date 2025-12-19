import './style.css';

// 1. ログのデータ構造（型）を定義
interface TaskLog {
  date: string;      // 日付 (YYYY-MM-DD)
  time: string;      // 時刻 (HH:mm)
  task: string;      // 作業内容
  duration: number;  // 取り組んだ時間（分）
}

// 2. HTML要素をTypeScriptの型を指定して取得
const statusLabel = document.getElementById('status') as HTMLElement;
const timerDisplay = document.getElementById('timer') as HTMLElement;
const catImage = document.getElementById('cat-image') as HTMLImageElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const logList = document.getElementById('log-list') as HTMLElement;
const workInput = document.getElementById('work-time') as HTMLInputElement;
const breakInput = document.getElementById('break-time') as HTMLInputElement; // 型エラーを修正

// 3. タイマー管理用の変数
let timeLeft: number;
let timerId: number | null = null;
let isBreak: boolean = false;

// 4. ログの表示と一週間の合計時間を計算する関数
const displayLogs = () => {
  const logs: TaskLog[] = JSON.parse(localStorage.getItem('cat_tasks') || '[]');
  
  // 今日から7日前の日付を計算
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // 直近7日間の合計勉強時間を算出（単位：分）
  const weeklyTotalMinutes = logs
    .filter(log => new Date(log.date) >= oneWeekAgo)
    .reduce((sum, log) => sum + (log.duration || 0), 0);

  const hours = Math.floor(weeklyTotalMinutes / 60);
  const mins = weeklyTotalMinutes % 60;

  // 合計時間の表示エリア（英語UI）
  const totalDisplayHtml = `
    <div class="total-summary" style="background: #fff3e0; padding: 20px; border-radius: 15px; margin-bottom: 20px; border: 2px solid #ffb347;">
      <div style="font-size: 1rem; color: #e67e22; font-weight: bold; margin-bottom: 5px;">🐾 Weekly Study Time 🐾</div>
      <div style="font-size: 2.5rem; font-weight: bold; color: #333;">${hours}<span style="font-size: 1rem;">h</span> ${mins}<span style="font-size: 1rem;">m</span></div>
    </div>
  `;

  // 過去のログリストを生成
  const logsHtml = logs.map(l => `
    <div class="log-item">
      <span class="log-time">${l.date.split('-').slice(1).join('/')} ${l.time}</span>: 
      <strong>${l.task}</strong> (${l.duration} min)
    </div>
  `).join('');

  logList.innerHTML = totalDisplayHtml + '<h3 style="text-align:left;">Recent Logs</h3>' + logsHtml;
};

// 5. 終了時のアラート音を再生する関数
const playSound = () => {
  const context = new AudioContext();
  const osc = context.createOscillator();
  osc.type = 'sine';
  osc.connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + 0.5);
};

// 6. 作業または休憩時間が終了した時の処理
const finishPeriod = () => {
  if (timerId) clearInterval(timerId);
  timerId = null;
  playSound();

  if (!isBreak) {
    // --- 作業終了時 ---
    const task = prompt("What did you work on?");
    if (task) {
      const logs: TaskLog[] = JSON.parse(localStorage.getItem('cat_tasks') || '[]');
      const now = new Date();
      
      // 新しいログを追加（定義済みのworkInput変数を使用）
      logs.unshift({
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        task: task,
        duration: Number(workInput.value) 
      });
      
      localStorage.setItem('cat_tasks', JSON.stringify(logs));
      displayLogs();
    }
    isBreak = true;
    statusLabel.innerText = "Break Time! Take a rest.";
    catImage.src = "/sleep_cat.jpg"; // 休憩中の猫
  } else {
    // --- 休憩終了時 ---
    isBreak = false;
    statusLabel.innerText = "Focus! Back to work.";
    catImage.src = "/work_cat.jpg"; // 作業中の猫
  }
  
  // 次のタイマー時間をセット
  const nextTime = isBreak ? Number(breakInput.value) : Number(workInput.value);
  timeLeft = nextTime * 60;
  updateDisplay();
  startBtn.innerText = "Start!";
};

// 7. 画面上の残り時間表示を更新する関数
const updateDisplay = () => {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 8. スタート・一時停止ボタンがクリックされた時の処理
startBtn.onclick = () => {
  if (timerId) {
    // タイマー動作中の場合は停止
    clearInterval(timerId);
    timerId = null;
    startBtn.innerText = "Resume";
  } else {
    // タイマー開始
    const workVal = Number(workInput.value);
    const breakVal = Number(breakInput.value);
    
    if (!timeLeft) {
      timeLeft = (isBreak ? breakVal : workVal) * 60;
    }
    
    startBtn.innerText = "Pause";
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

// 9. ページ読み込み時にログを表示
window.onload = displayLogs;