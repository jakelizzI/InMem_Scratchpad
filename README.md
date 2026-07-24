# ⚡ InMem Scratchpad

> **起動している間のみメモをメモリ空間に保持する、超高速インメモリ・スクラッチパッドメモアプリ**  
> **Windows (winget) / macOS (Homebrew / brew) 両対応**

![Stack](https://img.shields.io/badge/Framework-Tauri%20%2B%20React-6366f1)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-06b6d4)
![Persistence](https://img.shields.io/badge/Storage-In--Memory%20Only-f59e0b)
![Codespaces](https://img.shields.io/badge/GitHub-Codespaces%20Ready-22c55e)

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

## ☁️ GitHub Codespaces での利用・確認

プロジェクトに [`.devcontainer/devcontainer.json`](file:///e:/work/simple-tools/.devcontainer/devcontainer.json) を準備済みのため、GitHub上で **「Open with Codespaces」** をクリックするだけで環境が自動構築されます。

### 1. 画面の確認 (Web UI)
Codespaces 起動後、ターミナルで以下を実行します：
```bash
npm run dev
```
ポート `1420` が自動転送され、ブラウザの別タブで実際の画面と動作をテスト確認できます。

### 2. コンパイル・ビルドテスト
Codespaces (Linuxコンテナ) 上で Linux 用バイナリをビルド：
```bash
npm run tauri build
```

### 3. Windows (`.exe` / `.msi`) や Mac (`.dmg`) の全自動ビルド
GitHub にプッシュすると、同梱の [`.github/workflows/build.yml`](file:///e:/work/simple-tools/.github/workflows/build.yml) により、GitHub Actions 上で Windows / Mac / Linux のインストーラーが自動並列ビルドされます。

---

## 📦 インストール方法 (Package Managers)

### 🪟 Windows (`winget`)
```powershell
winget install InMemMemo.InMemScratchpad
```
ローカルマニフェスト直接テスト:
```powershell
winget install --manifest packaging/winget/inmem-memo.yaml
```

### 🍎 macOS (`brew`)
```bash
brew install --cask your-org/tap/inmem-memo
```
ローカル Cask 定義直接テスト:
```bash
brew install --cask packaging/brew/inmem-memo.rb
```

---

## 📄 ライセンス
MIT License
