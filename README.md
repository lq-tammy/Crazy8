# 小鸢乐园之疯狂8点 (Yuan's Playground Crazy Eight)

小鸢乐园之疯狂8点是一款基于 React 开发的高性能、响应式扑克牌游戏。玩家将与智能 AI 对手展开对决，体验经典的“疯狂8点”玩法。

## 🎮 玩法介绍 (How to Play)

### 核心目标
率先出完手中所有牌的玩家获胜。

### 游戏规则 (Game Rules)
1. **匹配出牌**：玩家必须打出与弃牌堆顶牌**花色相同**或**点数相同**的牌。
2. **万能 8 点 (Wild 8s)**：数字 **8** 是万能牌。你可以在任何时候打出 8，并指定接下来的目标花色。
3. **摸牌机制**：如果你手中没有可出的牌，必须从牌堆摸一张牌。如果摸到的牌可以立即打出，则自动打出；否则轮到对手。
4. **洗牌规则**：当摸牌堆空了，弃牌堆（除最顶端的一张外）将自动重新洗牌并补充到摸牌堆中。

---

## 🌟 游戏特色 (Features)

- **三语支持**：支持中文 (ZH)、英语 (EN) 和西班牙语 (ES) 实时切换。
- **智能 AI**：内置基于策略的 AI 算法，提供具有挑战性的对手。
- **精美 UI**：模拟真实牌桌的沉浸式界面，适配各种屏幕尺寸。
- **丝滑动画**：使用 `Framer Motion` 实现流畅的卡牌移动和交互效果。
- **响应式设计**：完美适配手机、平板和桌面端。

---

## 🛠️ 技术栈 (Tech Stack)

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite

---

## 🚀 快速开始 (Quick Start)

1. **安装依赖**:
   ```bash
   npm install
   ```
2. **启动开发服务器**:
   ```bash
   npm run dev
   ```
3. **构建项目**:
   ```bash
   npm run build
   ```

---

## 🌍 Internationalization (i18n)

The game features a custom lightweight i18n system defined in `constants.tsx`, allowing seamless switching between:
- 🇨🇳 **Chinese**
- 🇺🇸 **English**
- 🇪🇸 **Spanish**

---

## 📜 License

MIT License. Enjoy the game!
