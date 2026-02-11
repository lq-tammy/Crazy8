
import React, { useState, useEffect, useCallback } from 'react';
import { CardType, Suit, GameState, Rank } from './types';
import { createDeck, isValidMove, getAIBestMove, shuffleDeck } from './services/gameLogic';
import Card from './components/Card';
import SuitSelector from './components/SuitSelector';
import { SUIT_ICONS } from './constants';

const WINNING_QUOTES = [
  "你简直是打牌界的爱因斯坦！AI 刚才 CPU 都快冒烟了。",
  "AI 表示它要去升级一下补丁再回来找你挑战。",
  "这波操作 666，隔壁老王看了都直呼内行！",
  "赢了 AI 有什么好得意的？好吧，确实挺牛逼的！",
  "看来你的运气比去菜市场买菜中奖还要好那么一点点。",
  "你可以去拉斯维加斯出道了，这里的 AI 已经拦不住你了。",
  "AI 刚才悄悄给我发消息说：‘这人是不是开挂了？’",
  "优雅，实在是太优雅了！你完美诠释了什么是‘疯狂 8 点’。",
  "恭喜！你已击败全国 99% 的碳基生物打牌选手。"
];

const App: React.FC = () => {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [aiHand, setAiHand] = useState<CardType[]>([]);
  const [currentSuit, setCurrentSuit] = useState<Suit | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningQuote, setWinningQuote] = useState<string>("");
  const [isSuitSelectorOpen, setIsSuitSelectorOpen] = useState(false);
  const [pendingEightCard, setPendingEightCard] = useState<CardType | null>(null);
  const [logs, setLogs] = useState<string[]>(['欢迎来到疯狂 8 点！']);

  const playWinSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + i * 0.12 + 0.05);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + i * 0.12 + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.12);
        osc.stop(audioCtx.currentTime + i * 0.12 + 0.2);
      });
    } catch (e) {
      console.warn("音频播放失败", e);
    }
  };

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  }, []);

  const startNewGame = () => {
    const fullDeck = createDeck();
    const pHand = fullDeck.splice(0, 8);
    const aHand = fullDeck.splice(0, 8);
    let firstCardIndex = 0;
    while (fullDeck[firstCardIndex].rank === Rank.EIGHT) {
      firstCardIndex++;
    }
    const firstCard = fullDeck.splice(firstCardIndex, 1)[0];
    setPlayerHand(pHand);
    setAiHand(aHand);
    setDiscardPile([firstCard]);
    setDeck(fullDeck);
    setCurrentSuit(null);
    setGameState(GameState.PLAYER_TURN);
    setWinner(null);
    setWinningQuote("");
    setLogs(['游戏开始！你的回合。']);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handlePlayerPlay = (card: CardType) => {
    if (gameState !== GameState.PLAYER_TURN) return;
    if (isValidMove(card, discardPile[0], currentSuit)) {
      if (card.rank === Rank.EIGHT) {
        setPendingEightCard(card);
        setIsSuitSelectorOpen(true);
      } else {
        executeMove(card, 'player', null);
      }
    } else {
      addLog('无效的出牌！请选择相同花色或点数的牌。');
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    if (pendingEightCard) {
      executeMove(pendingEightCard, 'player', suit);
      setPendingEightCard(null);
      setIsSuitSelectorOpen(false);
    }
  };

  const executeMove = (card: CardType, actor: 'player' | 'ai', chosenSuit: Suit | null) => {
    if (actor === 'player') {
      setPlayerHand(prev => {
        const newHand = prev.filter(c => c.id !== card.id);
        if (newHand.length === 0) {
          setWinner('玩家');
          setWinningQuote(WINNING_QUOTES[Math.floor(Math.random() * WINNING_QUOTES.length)]);
          playWinSound();
          setGameState(GameState.GAME_OVER);
        } else {
          setGameState(GameState.AI_TURN);
        }
        return newHand;
      });
    } else {
      setAiHand(prev => {
        const newHand = prev.filter(c => c.id !== card.id);
        if (newHand.length === 0) {
          setWinner('电脑 AI');
          setGameState(GameState.GAME_OVER);
        } else {
          setGameState(GameState.PLAYER_TURN);
        }
        return newHand;
      });
    }
    setDiscardPile(prev => [card, ...prev]);
    setCurrentSuit(chosenSuit);
    addLog(`${actor === 'player' ? '你' : 'AI'} 打出了 ${card.rank} ${SUIT_ICONS[card.suit]}`);
  };

  const handleDrawCard = (actor: 'player' | 'ai') => {
    if (deck.length === 0) {
      if (discardPile.length > 1) {
        const top = discardPile[0];
        const rest = discardPile.slice(1);
        setDeck(shuffleDeck(rest));
        setDiscardPile([top]);
        addLog('洗牌中...');
      } else {
        addLog('摸牌堆已空，跳过回合！');
        if (actor === 'player') setGameState(GameState.AI_TURN);
        else setGameState(GameState.PLAYER_TURN);
        return;
      }
    }
    const newDeck = [...deck];
    const drawn = newDeck.shift();
    if (drawn) {
      if (actor === 'player') {
        setPlayerHand(prev => [...prev, drawn]);
        setDeck(newDeck);
        addLog('你摸了一张牌。');
        if (!isValidMove(drawn, discardPile[0], currentSuit)) {
            setGameState(GameState.AI_TURN);
        }
      } else {
        setAiHand(prev => [...prev, drawn]);
        setDeck(newDeck);
        addLog('AI 摸了一张牌。');
      }
    }
  };

  useEffect(() => {
    if (gameState === GameState.AI_TURN && !winner) {
      const timer = setTimeout(() => {
        const { card, chosenSuit } = getAIBestMove(aiHand, discardPile[0], currentSuit);
        if (card) {
          executeMove(card, 'ai', chosenSuit);
        } else {
          handleDrawCard('ai');
          setTimeout(() => {
            setGameState(GameState.PLAYER_TURN);
          }, 800);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, aiHand, discardPile, currentSuit, winner]);

  const topCard = discardPile[0];

  return (
    <div className="h-screen w-full flex flex-col bg-emerald-900 text-white overflow-hidden select-none">
      <header className="p-4 flex justify-between items-center bg-emerald-950/50 backdrop-blur-md border-b border-white/10 shrink-0">
        <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
          CRAZY EIGHTS <span className="text-sm font-normal text-white/60 ml-2 italic">疯狂 8 点</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-4 py-1 rounded-full text-xs font-mono">
            DECK: {deck.length}
          </div>
          <button onClick={startNewGame} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition-all active:scale-95 font-semibold shadow-lg">
            重开一局
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col justify-between p-4 overflow-hidden">
        
        {/* AI Area */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center -space-x-8 md:-space-x-12">
            {aiHand.map((c) => (
              <div key={c.id} className="transition-transform duration-300">
                <Card card={c} hidden />
              </div>
            ))}
          </div>
          <div className="bg-black/30 border border-white/10 px-4 py-1 rounded-full flex gap-3 items-center">
            <span className="text-xs text-white/50">电脑手牌</span>
            <span className="text-lg font-bold text-yellow-400">{aiHand.length}</span>
          </div>
        </div>

        {/* Board Center */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 py-4">
          <div className="flex items-center gap-8 md:gap-24">
            <button 
              onClick={() => gameState === GameState.PLAYER_TURN && handleDrawCard('player')}
              disabled={gameState !== GameState.PLAYER_TURN}
              className={`relative group ${gameState === GameState.PLAYER_TURN ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div className="w-16 h-24 md:w-24 md:h-36 bg-blue-800 rounded-lg border-2 border-white shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white text-3xl font-bold">?</span>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/40 font-bold">DRAW</div>
            </button>

            <div className="relative">
              {topCard && (
                <div className="relative">
                  <Card card={topCard} disabled />
                  {currentSuit && (
                    <div className="absolute -top-12 -right-12 bg-white/10 backdrop-blur-md rounded-full w-20 h-20 flex flex-col items-center justify-center border border-white/20 animate-pulse shadow-2xl">
                      <span className="text-[10px] text-white/60 font-bold">CURRENT</span>
                      <span className="text-3xl">{SUIT_ICONS[currentSuit]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-md bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${gameState === GameState.PLAYER_TURN ? 'bg-yellow-400 text-emerald-900' : 'bg-white/10 text-white/40'}`}>
                {gameState === GameState.PLAYER_TURN ? 'Your Turn' : gameState === GameState.AI_TURN ? 'AI Thinking' : 'Game Over'}
              </span>
              <div className="flex gap-4 font-mono text-xs">
                <span className="text-white/40">YOU: <b className="text-white">{playerHand.length}</b></span>
                <span className="text-white/40">CPU: <b className="text-white">{aiHand.length}</b></span>
              </div>
            </div>
            <div className="h-20 overflow-y-auto space-y-1 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`text-xs ${i === 0 ? 'text-white' : 'text-white/30'}`}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-black/30 border border-white/10 px-4 py-1 rounded-full flex gap-3 items-center">
            <span className="text-xs text-white/50">你的手牌</span>
            <span className="text-lg font-bold text-yellow-400">{playerHand.length}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-6xl mx-auto pb-4">
            {playerHand.map((c) => (
              <Card 
                key={c.id}
                card={c} 
                onClick={() => handlePlayerPlay(c)}
                disabled={gameState !== GameState.PLAYER_TURN}
                highlighted={gameState === GameState.PLAYER_TURN && isValidMove(c, topCard, currentSuit)}
              />
            ))}
          </div>
        </div>
      </main>

      {isSuitSelectorOpen && <SuitSelector onSelect={handleSuitSelect} />}

      {winner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="bg-emerald-950 border-2 border-yellow-400/50 p-12 rounded-[2rem] text-center shadow-[0_0_50px_rgba(250,204,21,0.2)] max-w-sm mx-4">
            <div className="text-7xl mb-6 transform hover:scale-110 transition-transform">
                {winner === '玩家' ? '👑' : '🤖'}
            </div>
            <h2 className="text-4xl font-black mb-4 text-white">
                {winner === '玩家' ? '大获全胜！' : '惜败 AI'}
            </h2>
            <div className="bg-white/5 p-4 rounded-xl mb-8 border border-white/10 min-h-[80px] flex items-center justify-center">
              <p className="text-yellow-100 italic leading-relaxed font-medium">
                  {winner === '玩家' ? `“${winningQuote}”` : "胜败乃兵家常事，少侠请重新来过。"}
              </p>
            </div>
            <button 
              onClick={startNewGame}
              className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black px-12 py-4 rounded-xl text-xl transition-all hover:scale-105 active:scale-95 shadow-xl w-full"
            >
              再战一局
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
