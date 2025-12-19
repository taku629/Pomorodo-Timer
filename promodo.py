import tkinter as tk
from tkinter import messagebox, simpledialog
from PIL import Image, ImageTk
import time
import os # システムコマンドを実行するために追加

class CatPomodoroApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI猫のポモドーロ・タイマー")
        self.root.geometry("450x650")

        # 画像の読み込み
        self.work_cat_img = self.load_image("work_cat.png")
        self.break_cat_img = self.load_image("break_cat.png")

        self.is_running = False
        self.time_left = 0
        self.is_break = False

        # UI
        self.label_status = tk.Label(root, text="準備はいいニャ？", font=("MS Gothic", 16))
        self.label_status.pack(pady=10)

        self.cat_display = tk.Label(root, image=self.work_cat_img)
        self.cat_display.pack(pady=10)

        self.label_timer = tk.Label(root, text="00:00", font=("Helvetica", 48))
        self.label_timer.pack(pady=10)

        # 設定エリア
        setting_frame = tk.Frame(root)
        setting_frame.pack(pady=10)
        tk.Label(setting_frame, text="作業(分):").grid(row=0, column=0)
        self.entry_work = tk.Entry(setting_frame, width=5)
        self.entry_work.insert(0, "25")
        self.entry_work.grid(row=0, column=1, padx=5)

        tk.Label(setting_frame, text="休憩(分):").grid(row=0, column=2)
        self.entry_break = tk.Entry(setting_frame, width=5)
        self.entry_break.insert(0, "5")
        self.entry_break.grid(row=0, column=3, padx=5)

        self.btn_start = tk.Button(root, text="スタート！", command=self.start_timer, bg="lightgreen", width=15, height=2)
        self.btn_start.pack(pady=20)

    def load_image(self, filename):
        if not os.path.exists(filename):
            print(f"警告: {filename} が見つかりません。")
            return ImageTk.PhotoImage(Image.new('RGB', (300, 300), color='white'))
        img = Image.open(filename)
        img = img.resize((300, 300), Image.Resampling.LANCZOS)
        return ImageTk.PhotoImage(img)

    def play_sound(self):
        # Linuxで一番シンプルな音出し方法（ビープ音）
        # もし特定の音を鳴らしたい場合は、aplay コマンドなどを使います
        print('\a') # ターミナルのベル音を鳴らす
        # もし wav ファイルがあるなら、下のコメントを外して使えます
        # os.system("aplay -q sound.wav &") 

    def start_timer(self):
        if not self.is_running:
            try:
                if not self.is_break:
                    self.time_left = int(self.entry_work.get()) * 60
                    self.label_status.config(text="全集中！作業中ニャ！")
                    self.cat_display.config(image=self.work_cat_img)
                else:
                    self.time_left = int(self.entry_break.get()) * 60
                    self.label_status.config(text="休憩タイムニャ。")
                    self.cat_display.config(image=self.break_cat_img)
                
                self.is_running = True
                self.update_timer()
            except ValueError:
                messagebox.showerror("エラー", "数字を入力してニャ！")

    def update_timer(self):
        if self.is_running and self.time_left >= 0:
            mins, secs = divmod(self.time_left, 60)
            self.label_timer.config(text=f"{mins:02d}:{secs:02d}")
            if self.time_left > 0:
                self.time_left -= 1
                self.root.after(1000, self.update_timer)
            else:
                self.finish_period()

    def finish_period(self):
        self.is_running = False
        self.play_sound()

        if not self.is_break:
            task_name = simpledialog.askstring("タスク完了", "何の作業が終わったニャ？")
            if task_name:
                self.save_task(task_name)
            self.is_break = True
            messagebox.showinfo("お疲れ様！", "休憩に入るニャ！")
        else:
            self.is_break = False
            messagebox.showinfo("休憩終了", "さあ、次の作業を始めるニャ！")
        
        self.start_timer()

    def save_task(self, task_name):
        with open("tasks.txt", "a", encoding="utf-8") as f:
            now = time.strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{now}] {task_name} ({self.entry_work.get()}分)\n")

if __name__ == "__main__":
    root = tk.Tk()
    app = CatPomodoroApp(root)
    root.mainloop()