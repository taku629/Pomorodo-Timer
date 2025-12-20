// 3. タイマー管理用の変数（endTimeを追加）
let timeLeft: number;
let timerId: number | null = null;
let isBreak: boolean = false;
let endTime: number; // 終了予定時刻を記録する変数

// ... (他の関数はそのまま)

// 8. スタート・一時停止ボタンの処理（修正版）
startBtn.onclick = () => {
  if (timerId) {
    // 停止時：残っている時間を保存
    clearInterval(timerId);
    timerId = null;
    startBtn.innerText = "Resume";
  } else {
    // 開始時
    const workVal = Number(workInput.value);
    const breakVal = Number(breakInput.value);
    
    if (!timeLeft) {
      timeLeft = (isBreak ? breakVal : workVal) * 60;
    }
    
    // 「今から何秒後に終わるか」を計算して終了時刻を確定させる
    endTime = Date.now() + timeLeft * 1000;
    
    startBtn.innerText = "Pause";
    timerId = window.setInterval(() => {
      // 現在時刻と終了予定時刻の差から、正確な残り時間を再計算する
      const now = Date.now();
      timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      if (timeLeft <= 0) {
        finishPeriod();
      } else {
        updateDisplay();
      }
    }, 1000);
  }
};