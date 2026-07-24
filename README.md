# ⚡ InMem Scratchpad

> **起動している間のみメモをメモリ空間に保持する、超高速インメモリ・スクラッチパッドメモアプリ**  
> **Windows (winget) / macOS (Homebrew / brew) 両対応**

![Stack](https://img.shields.io/badge/Framework-Tauri%20%2B%20React-6366f1)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-06b6d4)
![Persistence](https://img.shields.io/badge/Storage-In--Memory%20Only-f59e0b)

---

## 🌟 主な特長

1. **🚀 超高速起動 & 省メモリ (Tauri + Rust)**
   - アプリを起動した瞬間にミリ秒単位で立ち上がり、すぐにメモを入力可能。
2. **🛡 完全インメモリ記憶 (No Disk Persistence)**
   - ローカルファイル、localStorage、SQLite等のディスク保存処理を一切行いません。
   - **「立ち上げてすぐメモを取り、閉じたら即消える」** 使い捨ての用途に最適化。
3. **✨ プレミアムUI & マークダウンサポート**
   - ダークモード Glassmorphism デザイン。
   - ワンクリックでの **Markdown プレビュー** 切り替え。
   - リアルタイム文字数・単語数・行数カウンター。
   - クリップボード全コピー & 必要時のみの手動 `.md` エクスポート。

---

## 📦 インストール方法 (Package Managers)

### 🪟 Windows (`winget`)
マニフェスト登録後、以下のコマンドでインストールできます：

```powershell
winget install InMemMemo.InMemScratchpad
```

ローカルマニフェストから直接テストする場合:
```powershell
winget install --manifest packaging/winget/inmem-memo.yaml
```

### 🍎 macOS (`brew`)
Homebrew Tap 経由でインストール：

```bash
brew install --cask your-org/tap/inmem-memo
```

ローカル Cask 定義からテストする場合:
```bash
brew install --cask packaging/brew/inmem-memo.rb
```

---

## 🛠 ローカル開発 & ビルド手順

### 前提条件
- **Node.js**: v18+
- **Rust**: v1.70+ (Tauriのビルドに必要なツールチェーン)

### 開発サーバー起動
```bash
npm install
npm run dev
```

Tauriネイティブアプリとして開発起動：
```bash
npm run tauri dev
```

### アプリのパッケージング (Windows .exe / macOS .dmg)
```bash
npm run tauri build
```
ビルド成果物は `src-tauri/target/release/bundle/` に出力されます。

---

## 📄 ライセンス
MIT License
