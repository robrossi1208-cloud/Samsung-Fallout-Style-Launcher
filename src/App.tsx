import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Mic, 
  LayoutGrid, 
  ChevronLeft, 
  Battery, 
  Wifi, 
  Signal,
  Sparkles,
  X,
  Lock,
  Tv,
  Youtube,
  Music,
  Play,
  SkipForward
} from 'lucide-react';
import { APPS } from './constants';
import { AppIcon, ChatMessage } from './types';
import { getAIResponse } from './services/ai';
import * as Icons from 'lucide-react';

const IconRenderer = ({ name, color, size = 24 }: { name: string, color: string, size?: number }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <div className={`w-${size/4} h-${size/4} bg-lime-900/40 rounded-2xl`} />;
  return (
    <div className={`p-3 rounded-[22px] border-2 border-lime-500/50 bg-lime-900/20 shadow-[0_0_15px_rgba(132,204,22,0.2)] flex items-center justify-center text-lime-500 group-hover:scale-110 group-hover:bg-lime-400 group-hover:text-black group-hover:shadow-[0_0_25px_rgba(132,204,22,0.6)] transition-all duration-300`}>
      <IconComponent size={size} />
    </div>
  );
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLocked, setIsLocked] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [isAIExpanded, setIsAIExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);

  const hapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: [30, 50, 30]
      };
      window.navigator.vibrate(patterns[intensity]);
    }
  };

  const triggerGlitch = () => {
    setIsGlitching(true);
    hapticFeedback('light');
    setTimeout(() => setIsGlitching(false), 300);
  };

  useEffect(() => {
    triggerGlitch();
  }, [isLocked, isAppDrawerOpen, isAIExpanded]);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: [
        "The morning breeze has secrets to tell you. Don't go back to sleep, Rob.",
        "Every morning we are born again. What we do today is what matters most, Rob.",
        "The sun is a daily reminder that we too can rise again from the darkness, Rob.",
        "Write it on your heart that every day is the best day in the year, Rob."
      ],
      afternoon: [
        "The soul is here for its own joy, Rob. Let your light shine in the midday sun.",
        "The power of imagination makes us infinite, Rob. What will you create this afternoon?",
        "Don't judge each day by the harvest you reap but by the seeds that you plant, Rob.",
        "The only way to do great work is to love what you do, Rob."
      ],
      evening: [
        "The stars are the land's way of dreaming, Rob. May your evening be filled with quiet wonder.",
        "The more you know yourself, the more clarity there is. Enjoy the evening stillness, Rob.",
        "Nature never hurries, yet everything is accomplished. Rest well this evening, Rob.",
        "The evening star is the most beautiful of all stars, Rob."
      ]
    };

    let selectedList;
    if (hour < 12) selectedList = greetings.morning;
    else if (hour < 18) selectedList = greetings.afternoon;
    else selectedList = greetings.evening;

    const randomIndex = Math.floor(Math.random() * selectedList.length);
    setGreeting(selectedList[randomIndex]);
  };

  const handleAppClick = () => {
    triggerGlitch();
    setTimeout(() => {
      setIsAppDrawerOpen(false);
      setIsAIExpanded(false);
    }, 200);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    updateGreeting();
    
    // Initial Boot Sequence
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(bootTimer);
    };
  }, []);

  // Update greeting whenever we lock the phone to keep it fresh
  useEffect(() => {
    if (isLocked) {
      updateGreeting();
    }
  }, [isLocked]);

  const handleWakeUp = () => {
    setIsLocked(false);
    // Automatically expand AI assistant after a short delay
    setTimeout(() => {
      setIsAIExpanded(true);
      if (chatHistory.length === 0) {
        setChatHistory([{ role: 'model', text: `${greeting} How can I help you today?` }]);
      }
    }, 800);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input };
    hapticFeedback('light');
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyForAI = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const screenContext = `
        - Current Time: ${currentTime.toLocaleTimeString()}
        - Date: ${currentTime.toLocaleDateString()}
        - Active Greeting: "${greeting}"
        - Phone Status: ${isLocked ? 'Locked' : 'Unlocked'}
        - View: ${isAppDrawerOpen ? 'App Drawer' : 'Home Screen'}
        - Installed Apps: ${APPS.map(app => app.name).join(', ')}
      `.trim();

      const response = await getAIResponse(input, historyForAI, screenContext);
      setChatHistory(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Error connecting to Galaxy AI." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-mono">
      {/* Pip-Boy 3000 Device Frame */}
      <div className="relative w-[380px] h-[800px] bg-[#1a1a1a] rounded-[40px] shadow-2xl border-[12px] border-[#2a2a2a] overflow-hidden ring-4 ring-lime-900/20">
        
        {/* Status Bar - Pip-Boy Style */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-8 z-50 text-lime-500 text-[10px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
            <span>ROB-OS v3.0</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Battery size={12} className="rotate-90" />
              <span>100%</span>
            </div>
            <Signal size={12} />
          </div>
        </div>

        {/* Camera Punch Hole */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-50 border border-lime-500/20" />

        {/* Wallpaper Background - Wasteland with CRT Filter */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {/* Realistic Wasteland Environment */}
          <img 
            src="https://images.unsplash.com/photo-1506143925201-0252c51780b0?auto=format&fit=crop&q=80&w=1000" 
            className="w-full h-full object-cover opacity-40 grayscale brightness-75 contrast-125 scale-110"
            alt="Wasteland Environment"
            referrerPolicy="no-referrer"
          />
          
          {/* Green Pip-Boy Filter */}
          <div className="absolute inset-0 bg-lime-900/30 mix-blend-color" />
          <div className="absolute inset-0 bg-gradient-to-b from-lime-500/10 via-transparent to-lime-500/20" />
          
          {/* CRT Effects */}
          <div className="absolute inset-0 pointer-events-none z-20 crt-flicker opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[size:100%_2px,3px_100%]" />
          </div>
          
          {/* Fallout Pip-Boy HUD Elements */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Pulsing Brackets */}
            <motion.div 
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0"
            >
              <div className="absolute top-12 left-6 w-16 h-16 border-t-4 border-l-4 border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)] rounded-tl-2xl" />
              <div className="absolute top-12 right-6 w-16 h-16 border-t-4 border-r-4 border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)] rounded-tr-2xl" />
              <div className="absolute bottom-24 left-6 w-16 h-16 border-b-4 border-l-4 border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)] rounded-bl-2xl" />
              <div className="absolute bottom-24 right-6 w-16 h-16 border-b-4 border-r-4 border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)] rounded-br-2xl" />
            </motion.div>
            
            {/* Animated Status Bars - HP/AP Style */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-lime-500 font-bold">HP</span>
                <div className="w-32 h-2 bg-lime-900/40 rounded-sm overflow-hidden border border-lime-500/50">
                  <motion.div 
                    animate={{ width: ["85%", "90%", "88%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.8)]" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-lime-500 font-bold">AP</span>
                <div className="w-32 h-2 bg-lime-900/40 rounded-sm overflow-hidden border border-lime-500/50">
                  <motion.div 
                    animate={{ width: ["60%", "75%", "65%"] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="h-full bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.8)]" 
                  />
                </div>
              </div>
            </div>

            {/* Moving Scanline */}
            <motion.div 
              animate={{ 
                y: [-100, 900],
                opacity: isGlitching ? [0.2, 1, 0.2] : 0.2,
                height: isGlitching ? ["3px", "20px", "3px"] : "3px"
              }}
              transition={{ 
                y: { duration: 10, repeat: Infinity, ease: "linear" },
                opacity: { duration: 0.1, repeat: isGlitching ? 3 : 0 },
                height: { duration: 0.1 }
              }}
              className="absolute inset-x-0 bg-lime-500/40 shadow-[0_0_20px_rgba(132,204,22,0.4)] z-[150]"
            />

            {/* Glitch Overlay */}
            <AnimatePresence>
              {isGlitching && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0.1, 0.4, 0] }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[160] bg-lime-500/10 pointer-events-none mix-blend-overlay"
                >
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(132,204,22,0.1)_3px)]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terminal Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(132,204,22,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(132,204,22,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative h-full z-30 pt-16 pb-12 flex flex-col">
          
          <AnimatePresence mode="wait">
            {isBooting ? (
              <motion.div
                key="boot"
                initial={{ opacity: 1 }}
                exit={{ 
                  scaleY: 0.01, 
                  opacity: 0,
                  transition: { duration: 0.3, ease: "circIn" }
                }}
                className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden"
              >
                <img 
                  src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1000" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
                  alt="Static"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-48 h-48 border-4 border-lime-500 rounded-full flex items-center justify-center bg-black/80 shadow-[0_0_30px_rgba(132,204,22,0.5)]">
                    <div className="text-center">
                      <h2 className="text-lime-500 font-black text-xl tracking-tighter leading-none">PLEASE</h2>
                      <h2 className="text-lime-500 font-black text-3xl tracking-widest leading-none">STANDBY</h2>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          className="w-2 h-2 bg-lime-500"
                        />
                      ))}
                    </div>
                    <span className="text-lime-500 text-[8px] font-black tracking-[0.3em] uppercase animate-pulse">Loading Rob-OS...</span>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none crt-flicker opacity-40">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[size:100%_2px,3px_100%]" />
                </div>
              </motion.div>
            ) : isLocked ? (
              <motion.div
                key="lockscreen"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ 
                  scaleY: 0.005, 
                  opacity: 0,
                  transition: { duration: 0.4, ease: "easeInOut" }
                }}
                onClick={handleWakeUp}
                className="absolute inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer bg-black/20 backdrop-blur-[2px]"
              >
                <div className="text-center mb-48">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-4 inline-block px-4 py-1 border-2 border-lime-500 text-lime-500 font-bold text-xs tracking-widest uppercase"
                  >
                    System Locked
                  </motion.div>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-6xl font-bold text-lime-500 tracking-tighter drop-shadow-[0_0_10px_rgba(132,204,22,0.5)]"
                  >
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-lime-500/80 mt-2 font-bold uppercase tracking-widest text-xs"
                  >
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                  </motion.p>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 flex items-center justify-center px-10 text-center"
                >
                  <p className="text-lime-500 text-sm font-bold uppercase leading-relaxed tracking-wider drop-shadow-lg">
                    {greeting}
                  </p>
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mt-auto mb-20 flex flex-col items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-lime-900/20 backdrop-blur-md flex items-center justify-center border-2 border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.4)]">
                    <Icons.Fingerprint className="text-lime-500" size={28} />
                  </div>
                  <p className="text-lime-500/60 text-[10px] uppercase tracking-[0.3em] font-black animate-pulse">Initialize Rob-OS</p>
                </motion.div>
              </motion.div>
            ) : (
              !isAppDrawerOpen && (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, filter: "brightness(2) blur(10px)" }}
                  animate={{ opacity: 1, filter: "brightness(1) blur(0px)" }}
                  exit={{ 
                    opacity: 0, 
                    scale: 1.1,
                    filter: "brightness(0.5) blur(5px)",
                    transition: { duration: 0.2 }
                  }}
                  className="flex-1 flex flex-col px-6 relative overflow-hidden"
                >
                  {/* Background Vault Boy Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none z-0">
                    <img 
                      src="https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsX29mZmljZV8yNl92YXVsdF9ib3lfZnJvbV9mYWxsb3V0X2NoYXJhY3Rlcl9pc29sYXRlZF9vbl93aGl0ZV80YmI0YmZlOC04NjI3LTQ0MDYtYmFmMi0zZDUzOTY0YzY0YmFfMS5wbmc.png" 
                      alt=""
                      className="w-[350px] h-[350px] grayscale sepia-[1] hue-rotate-[60deg] brightness-[1.2]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                {/* Clock Widget - Terminal Style */}
                <div className="mt-4 mb-8 text-center relative z-10">
                  <div className="inline-block px-3 py-1 bg-lime-500 text-black font-black text-[10px] uppercase tracking-widest mb-2">
                    Local Time
                  </div>
                  <h1 className="text-5xl font-black text-lime-500 tracking-tighter drop-shadow-[0_0_10px_rgba(132,204,22,0.3)]">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </h1>
                </div>

                {/* Integrated AI Assistant - Pip-Boy Interface */}
                <motion.div 
                  layout
                  className={`bg-black/90 backdrop-blur-3xl border-2 border-lime-500 rounded-xl overflow-hidden flex flex-col transition-all duration-500 shadow-[0_0_30px_rgba(132,204,22,0.2)] relative z-10 ${isAIExpanded ? 'flex-1 mb-6' : 'h-14 mb-4'}`}
                >
                  <div 
                    onClick={() => setIsAIExpanded(!isAIExpanded)}
                    className="h-14 px-5 flex items-center gap-3 cursor-pointer hover:bg-lime-500/10 transition-colors shrink-0 border-b border-lime-500/30"
                  >
                    <div className="w-8 h-8 rounded-sm bg-lime-500 flex items-center justify-center shadow-lg">
                      <Sparkles size={16} className="text-black" />
                    </div>
                    <span className="text-lime-500 flex-1 text-xs font-black tracking-[0.2em] uppercase">Pip-Boy AI</span>
                    {isAIExpanded ? <X size={16} className="text-lime-500" /> : <Mic size={18} className="text-lime-500" />}
                  </div>

                  <AnimatePresence>
                    {isAIExpanded && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col min-h-0"
                      >
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                          {chatHistory.map((msg, idx) => (
                            <motion.div 
                              initial={{ x: msg.role === 'user' ? 20 : -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[85%] p-3 rounded-lg text-xs font-bold border ${
                                msg.role === 'user' 
                                  ? 'bg-lime-500 text-black border-lime-600' 
                                  : 'bg-lime-900/40 text-lime-500 border-lime-500/50'
                              }`}>
                                {msg.role === 'model' && <span className="block text-[8px] uppercase mb-1 opacity-60">Incoming Transmission:</span>}
                                {msg.text}
                              </div>
                            </motion.div>
                          ))}
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-lime-900/40 text-lime-500 p-3 rounded-lg border border-lime-500/50">
                                <motion.span 
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="text-xs font-black"
                                >
                                  DECIPHERING...
                                </motion.span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 border-t border-lime-500/30 bg-black/40">
                          <div className="flex gap-2">
                            <input 
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Enter Command..."
                              className="flex-1 bg-lime-900/20 border border-lime-500/50 rounded-md px-4 py-2 text-xs text-lime-500 placeholder:text-lime-500/30 focus:outline-none focus:border-lime-500 font-bold uppercase"
                            />
                            <button 
                              onClick={handleSendMessage}
                              className="w-10 h-10 bg-lime-500 text-black rounded-md flex items-center justify-center hover:bg-lime-400 transition-colors shadow-[0_0_10px_rgba(132,204,22,0.4)]"
                            >
                              <Search size={18} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Pip-Boy Media Widgets */}
                {!isAIExpanded && (
                  <div className="space-y-3 mb-6 relative z-10">
                    {/* YouTube Music Widget */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-lime-900/20 border border-lime-500/30 rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-lime-500/20 border border-lime-500 rounded flex items-center justify-center text-lime-500">
                        <Music size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] text-lime-500/60 uppercase font-black tracking-widest">Radio Signal: YTM</div>
                        <div className="text-[10px] text-lime-500 font-bold truncate uppercase tracking-tighter">Big Iron - Marty Robbins</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-lime-900/40 rounded-full overflow-hidden">
                            <motion.div 
                              animate={{ width: ["30%", "35%", "32%"] }}
                              transition={{ duration: 5, repeat: Infinity }}
                              className="h-full bg-lime-500"
                            />
                          </div>
                          <Play size={10} className="text-lime-500" />
                          <SkipForward size={10} className="text-lime-500/40" />
                        </div>
                      </div>
                    </motion.div>

                    {/* YouTube Widget */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-lime-900/20 border border-lime-500/30 rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-lime-500/20 border border-lime-500 rounded flex items-center justify-center text-lime-500">
                        <Youtube size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] text-lime-500/60 uppercase font-black tracking-widest">Holotape Feed: YT</div>
                        <div className="text-[10px] text-lime-500 font-bold truncate uppercase tracking-tighter">Wasteland Survival Guide #4</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] text-lime-500/40 uppercase font-black">Trending Now</span>
                          <div className="flex gap-0.5">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-1 h-1 bg-lime-500 rounded-full" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Home Screen Icons - Monochrome Pip-Boy Style */}
                {!isAIExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-4 gap-y-8 gap-x-4 mt-4 relative z-10"
                  >
                    {APPS.slice(0, 8).map((app) => (
                      <motion.div 
                        key={app.id}
                        whileTap={{ scale: 0.85, rotate: -2 }}
                        onClick={handleAppClick}
                        className="flex flex-col items-center gap-2 group cursor-pointer"
                      >
                        <div className="relative">
                          <IconRenderer name={app.icon} color={app.color} />
                        </div>
                        <span className="text-[8px] text-lime-500 font-black uppercase tracking-widest text-center drop-shadow-md">{app.name}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Bottom Dock - Industrial Terminal Style */}
                <div className="mt-auto mb-4 bg-black/95 rounded-xl p-2 grid grid-cols-4 gap-2 border-2 border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.3)] relative z-10">
                  {APPS.slice(0, 4).map((app) => (
                    <motion.div 
                      key={`dock-${app.id}`}
                      whileTap={{ scale: 0.85, y: -5 }}
                      onClick={handleAppClick}
                      className="flex justify-center group cursor-pointer"
                    >
                      <IconRenderer name={app.icon} color={app.color} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
)}

            {isAppDrawerOpen && (
              <motion.div 
                key="drawer"
                initial={{ x: "100%", filter: "brightness(2)" }}
                animate={{ x: 0, filter: "brightness(1)" }}
                exit={{ x: "100%", filter: "brightness(0.5)" }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-40 p-8 pt-16 border-t-2 border-lime-500"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 bg-lime-900/20 border border-lime-500/50 rounded-md px-4 py-2 flex items-center gap-2">
                    <Search size={18} className="text-lime-500/40" />
                    <input 
                      type="text" 
                      placeholder="Search Database..." 
                      className="bg-transparent border-none outline-none text-lime-500 text-xs font-bold uppercase w-full placeholder:text-lime-500/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-y-8 gap-x-4 overflow-y-auto max-h-[600px] no-scrollbar">
                  {APPS.map((app) => (
                    <motion.div 
                      key={`drawer-${app.id}`}
                      whileTap={{ scale: 0.85, rotate: 2 }}
                      onClick={handleAppClick}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <IconRenderer name={app.icon} color={app.color} />
                      <span className="text-[8px] text-lime-500 font-black uppercase tracking-widest text-center">{app.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Bar - Pip-Boy Style */}
          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-around px-12 z-[60] bg-black/80 border-t border-lime-500/30">
            <button 
              onClick={() => {
                setIsAppDrawerOpen(false);
                setIsAIExpanded(false);
                setIsLocked(true);
              }}
              className="p-2 text-lime-500/40 hover:text-lime-500 transition-colors"
            >
              <Icons.Power size={16} />
            </button>
            <button 
              onClick={() => {
                hapticFeedback('medium');
                setIsAppDrawerOpen(false);
                setIsAIExpanded(false);
                setIsBooting(true);
                setTimeout(() => setIsBooting(false), 2000);
              }}
              className="p-2 text-lime-500/40 hover:text-lime-500 transition-colors"
            >
              <Icons.Tv size={16} />
            </button>
            <button 
              onClick={() => {
                setIsAppDrawerOpen(false);
                setIsAIExpanded(false);
              }}
              className="p-2 text-lime-500/40 hover:text-lime-500 transition-colors"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setIsAppDrawerOpen(!isAppDrawerOpen)}
              className="p-2 text-lime-500/40 hover:text-lime-500 transition-colors"
            >
              <ChevronLeft size={20} className={isAppDrawerOpen ? 'rotate-[-90deg]' : 'rotate-90'} />
            </button>
          </div>
        </div>

        {/* Home Indicator - Pip-Boy Style */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-lime-500/30 rounded-full z-[70] shadow-[0_0_5px_rgba(132,204,22,0.2)]" />
      </div>

      {/* Side Buttons (Pip-Boy Style) */}
      <div className="absolute right-[calc(50%-205px)] top-40 w-1.5 h-24 bg-[#2a2a2a] rounded-l-md border-r border-black/20 shadow-lg" />
      <div className="absolute right-[calc(50%-205px)] top-24 w-1.5 h-12 bg-[#2a2a2a] rounded-l-md border-r border-black/20 shadow-lg" />
    </div>
  );
}
