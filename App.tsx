
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Play, RotateCcw, Home as HomeIcon, Info, ChevronRight, Languages } from 'lucide-react';
import { CardType, Suit, GameState, Rank, Language } from './types';
import { createDeck, isValidMove, getAIBestMove, shuffleDeck } from './services/gameLogic';
import Card from './components/Card';
import SuitSelector from './components/SuitSelector';
import { SUIT_ICONS, TRANSLATIONS } from './constants';

const WINNING_QUOTES = [
  "你简直是打牌界的爱因斯坦！AI 刚才 CPU 都快冒烟了。",
  "AI 表示它要去升级一下补丁再回来找你挑战。",
  "这波操作 666，隔壁老王看了都直呼内行！",
  "赢了 AI 有什么好得意的？好吧，确实挺牛逼的！",
  "看来你的运气比去菜市场买菜中奖还要好那么一点点。",
  "你可以去拉斯维加斯出道了，这里的 AI 已经拦不住你了。",
  "AI 刚才悄悄给我发消息说：‘这人是不是开挂了？’",
  "优雅，实在是太优雅了！你完美诠释了什么是‘Crazy8’。",
  "恭喜！你已击败全国 99% 的碳基生物打牌选手。"
];

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.ZH);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [aiHand, setAiHand] = useState<CardType[]>([]);
  const [currentSuit, setCurrentSuit] = useState<Suit | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningQuote, setWinningQuote] = useState<string>("");
  const [isSuitSelectorOpen, setIsSuitSelectorOpen] = useState(false);
  const [pendingEightCard, setPendingEightCard] = useState<CardType | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const t = TRANSLATIONS[language];

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
    setLogs([t.welcome]);
  };

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
      addLog(t.invalidMove);
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
          setWinner('player');
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
          setWinner('ai');
          setGameState(GameState.GAME_OVER);
        } else {
          setGameState(GameState.PLAYER_TURN);
        }
        return newHand;
      });
    }
    setDiscardPile(prev => [card, ...prev]);
    setCurrentSuit(chosenSuit);
    addLog(`${actor === 'player' ? t.playerPlayed : t.aiPlayed} ${card.rank} ${SUIT_ICONS[card.suit]}`);
  };

  const handleDrawCard = (actor: 'player' | 'ai') => {
    let currentDeck = [...deck];
    let currentDiscard = [...discardPile];

    if (currentDeck.length === 0) {
      if (currentDiscard.length > 1) {
        const top = currentDiscard[0];
        const rest = currentDiscard.slice(1);
        const reshuffled = shuffleDeck(rest);
        currentDeck = reshuffled;
        currentDiscard = [top];
        setDeck(reshuffled);
        setDiscardPile([top]);
        addLog(t.shuffling);
      } else {
        addLog(t.emptyDeck);
        if (actor === 'player') setGameState(GameState.AI_TURN);
        else setGameState(GameState.PLAYER_TURN);
        return;
      }
    }

    const drawn = currentDeck.shift();
    if (drawn) {
      if (actor === 'player') {
        setPlayerHand(prev => [...prev, drawn]);
        setDeck(currentDeck);
        addLog(t.playerDrew);
        if (!isValidMove(drawn, currentDiscard[0], currentSuit)) {
            setGameState(GameState.AI_TURN);
        }
      } else {
        setAiHand(prev => [...prev, drawn]);
        setDeck(currentDeck);
        addLog(t.aiDrew);
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

  const cycleLanguage = () => {
    const langs = [Language.ZH, Language.EN, Language.ES];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  if (gameState === GameState.HOME) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a2e1f] text-white overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-8 gap-12 p-12">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="text-4xl">♠♣♥♦</div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 flex flex-col items-center text-center px-4"
        >
          <div className="mb-8 relative">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-32 h-48 bg-white rounded-xl shadow-2xl flex items-center justify-center border-4 border-yellow-400"
            >
              <span className="text-6xl font-black text-emerald-900">8</span>
            </motion.div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-2xl">♥</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter bg-gradient-to-b from-yellow-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
            {t.title}
          </h1>
          <p className="text-emerald-200/60 mb-12 max-w-md text-lg font-medium">
            {t.welcome}
          </p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={startNewGame}
              className="group relative bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black py-4 px-8 rounded-2xl text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.3)] flex items-center justify-center gap-3"
            >
              <Play className="fill-current" size={24} />
              {t.start}
            </button>

            <button 
              onClick={cycleLanguage}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 border border-white/10"
            >
              <Languages size={20} />
              {language === Language.ZH ? 'English / Español' : language === Language.EN ? 'Español / 中文' : '中文 / English'}
            </button>
          </div>
        </motion.div>

        <div className="absolute bottom-8 text-emerald-200/30 text-xs font-mono tracking-widest uppercase">
          © 2026 YUAN'S PLAYGROUND • CRAZY EIGHTS
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#064e3b] text-white overflow-hidden select-none relative">
      {/* Table Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
      
      <header className="p-4 flex justify-between items-center bg-black/30 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState(GameState.HOME)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
          >
            <HomeIcon size={20} />
          </button>
          <h1 className="text-lg md:text-2xl font-black tracking-tight bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {t.subtitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={cycleLanguage}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 transition-all"
          >
            <Globe size={14} />
            <span className="hidden sm:inline">{language}</span>
          </button>
          <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {t.deck}: {deck.length}
          </div>
          <button 
            onClick={startNewGame} 
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all active:scale-90 border border-white/10"
            title={t.restart}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Scrollable Game Area (AI + Board) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex flex-col justify-between gap-8">
          
          {/* AI Area */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center -space-x-10 md:-space-x-16">
              <AnimatePresence>
                {aiHand.map((c, i) => (
                  <motion.div 
                    key={c.id}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card card={c} hidden />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-1.5 rounded-full flex gap-4 items-center shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">AI OPPONENT</span>
              <span className="text-xl font-black text-yellow-400">{aiHand.length}</span>
            </div>
          </div>

          {/* Board Center */}
          <div className="flex flex-col items-center justify-center gap-8 md:gap-12 relative py-4">
            <div className="flex items-center gap-8 md:gap-32 relative">
              {/* Draw Pile */}
              <button 
                onClick={() => gameState === GameState.PLAYER_TURN && handleDrawCard('player')}
                disabled={gameState !== GameState.PLAYER_TURN}
                className={`relative group ${gameState === GameState.PLAYER_TURN ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <div className="w-14 h-20 md:w-24 md:h-36 bg-gradient-to-br from-blue-900 to-indigo-950 rounded-lg border-2 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                  <div className="absolute inset-0 opacity-10 flex flex-wrap gap-1 p-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="text-[8px] text-white">♠♣♥♦</div>
                    ))}
                  </div>
                  <span className="text-white/20 text-4xl font-black">?</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">
                  {t.draw}
                </div>
              </button>

              {/* Discard Pile */}
              <div className="relative">
                <AnimatePresence mode="popLayout">
                  {topCard && (
                    <motion.div 
                      key={topCard.id}
                      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      className="relative z-10"
                    >
                      <Card card={topCard} disabled />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Current Suit Indicator */}
                {currentSuit && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-16 -right-16 bg-white/5 backdrop-blur-2xl rounded-full w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center border border-white/10 shadow-2xl z-20"
                  >
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">SUIT</span>
                    <span className="text-2xl md:text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{SUIT_ICONS[currentSuit]}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Game Status & Logs */}
            <div className="w-full max-w-lg bg-black/40 backdrop-blur-xl rounded-3xl p-4 md:p-6 border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${gameState === GameState.PLAYER_TURN ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-white/10'}`}></div>
                  <span className="text-xs font-black uppercase tracking-widest text-white/80">
                    {gameState === GameState.PLAYER_TURN ? t.playerTurn : gameState === GameState.AI_TURN ? t.aiTurn : '...'}
                  </span>
                </div>
                <div className="flex gap-6 font-mono text-[10px] font-bold tracking-widest">
                  <span className="text-white/30">YOU: <b className="text-yellow-400 text-sm ml-1">{playerHand.length}</b></span>
                  <span className="text-white/30">CPU: <b className="text-white text-sm ml-1">{aiHand.length}</b></span>
                </div>
              </div>
              <div className="h-20 md:h-24 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`text-xs flex items-start gap-2 ${i === 0 ? 'text-white font-bold' : 'text-white/30'}`}
                  >
                    <ChevronRight size={12} className="mt-0.5 shrink-0 opacity-50" />
                    {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Player Hand Area at Bottom */}
        <div className="bg-black/40 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-30">
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px w-12 bg-white/10"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">YOUR HAND</span>
              <div className="h-px w-12 bg-white/10"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 min-h-[100px] md:min-h-[160px]">
              <AnimatePresence>
                {playerHand.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    whileHover={{ scale: 1.05, zIndex: 50 }}
                  >
                    <Card 
                      card={c} 
                      onClick={() => handlePlayerPlay(c)}
                      disabled={gameState !== GameState.PLAYER_TURN || !isValidMove(c, topCard, currentSuit)}
                      highlighted={gameState === GameState.PLAYER_TURN && isValidMove(c, topCard, currentSuit)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {isSuitSelectorOpen && <SuitSelector onSelect={handleSuitSelect} language={language} />}

      {winner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0a2e1f] border-2 border-yellow-400/30 p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(250,204,21,0.1)] max-w-md mx-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="grid grid-cols-4 gap-8 p-8">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="text-2xl">♠♣♥♦</div>
                ))}
              </div>
            </div>

            <div className="text-8xl mb-8 drop-shadow-2xl">
                {winner === 'player' ? '🏆' : '💀'}
            </div>
            <h2 className="text-5xl font-black mb-6 tracking-tighter text-white">
                {winner === 'player' ? t.win : t.lose}
            </h2>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl mb-10 border border-white/10 min-h-[100px] flex items-center justify-center">
              <p className="text-yellow-100/80 italic leading-relaxed font-medium text-lg">
                  {winner === 'player' ? `“${winningQuote}”` : (language === Language.ZH ? "胜败乃兵家常事，少侠请重新来过。" : (language === Language.EN ? "Defeat is part of the journey. Try again!" : "¡La derrota es parte del viaje!"))}
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={startNewGame}
                className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black px-12 py-5 rounded-2xl text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl w-full flex items-center justify-center gap-3"
              >
                <RotateCcw size={24} />
                {t.restart}
              </button>
              <button 
                onClick={() => setGameState(GameState.HOME)}
                className="bg-white/5 hover:bg-white/10 text-white font-bold px-12 py-4 rounded-2xl text-lg transition-all border border-white/10 w-full flex items-center justify-center gap-3"
              >
                <HomeIcon size={20} />
                {t.home}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
      `}</style>
    </div>
  );
};

export default App;
