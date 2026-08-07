# ⚡ InMem Scratchpad

> **起動している間のみメモをメモリ空間に保持する、超高速インメモリ・スクラッチパッドメモアプリ**  
> **Windows (winget) / macOS (Homebrew / brew) 両対応 & タスクトレイ常駐・グローバルショートカット対応**

![Stack](https://img.shields.io/badge/Framework-Tauri%20v2%20%2B%20React-6366f1)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-06b6d4)
![Persistence](https://img.shields.io/badge/Storage-In--Memory%20Only-f59e0b)
![Resident](https://img.shields.io/badge/Tray-System%20Resident-10b981)

---

## 🌟 主な特長

1. **📌 タスクトレイ常駐 & バックグラウンド待機**
   - ウィンドウの「×」ボタンを押してもアプリプロセスは終了せず、タスクトレイ (Windows) / メニューバー (macOS) に常駐。
   - トレイアイコンのクリックや右クリックメニュー（「表示/非表示」「終了」）で快適に制御可能。

2. **⌨️ グローバルショートカットで一瞬で呼び出し (`Ctrl + Shift + M`)**
   - 別のアプリ（ブラウザやIDEなど）を操作している時でも、`Ctrl + Shift + M`（Macでは `Cmd + Shift + M`）を押すだけで画面最前面に即座に表示・非表示を切り替え。

3. **🛡 完全インメモリ記憶 (No Disk Persistence)**
   - ローカルファイル、localStorage、SQLite等のディスク保存処理を一切行いません。
   - アプリを完全に終了（トレイメニューから「Exit」）すると、メモリ解放によりメモは完全に消去されます。

4. **✨ プレミアムUI & マークダウンサポート**
   - ダークモード Glassmorphism UI。
   - ワンクリックでの **Markdown プレビュー** 切り替え。
   - リアルタイム文字数・単語数・行数カウンター。

---

## ⌨️ ショートカットキー一覧

| キー操作 | 動作 |
|---|---|
| `Ctrl + Shift + M` (または `Cmd + Shift + M`) | アプリウィンドウの表示 / 非表示トグル（グローバルキー） |
| `Tab` | エディタ内でのインデント挿入 |
| `Esc` / 「×」ボタン | ウィンドウをトレイに隠す（データは保持） |

---

## ☁️ GitHub Codespaces / GitHub Actions

リポジトリにプッシュすると、GitHub Actions ([`.github/workflows/build.yml`](file:///e:/work/simple-tools/.github/workflows/build.yml)) が automatical に並列実行され、Windows (`.exe`/`.msi`)、macOS (`.dmg`)、Linux の各常駐アプリが並列ビルドされます。

---

## 📦 インストール方法 (Package Managers)

### 🪟 Windows (`winget`)
```powershell
winget install InMemMemo.InMemScratchpad
```

### 🍎 macOS (`brew`)
```bash
brew install --cask your-org/tap/inmem-memo
```

---

## 📄 ライ秘権 / ライセンス
MIT License
