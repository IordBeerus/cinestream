/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Play, RotateCcw, SkipBack, SkipForward, Volume2, Maximize, Settings, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Movie } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { movieService } from "../movieService";

interface PlayerModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerModal({ movie, isOpen, onClose }: PlayerModalProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7200); // 2 hours in seconds
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showResumeMsg, setShowResumeMsg] = useState(false);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    if (isOpen) {
      window.addEventListener("mousemove", handleMouseMove);
      handleMouseMove(); // Show initially
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const progress = movieService.getProgress(movie.id);
      if (progress) {
        setCurrentTime(progress.progress);
        setDuration(progress.duration);
        setShowResumeMsg(true);
        setTimeout(() => setShowResumeMsg(false), 5000);
      }
    }
  }, [isOpen, movie.id]);

  useEffect(() => {
    if (isPlaying && isOpen) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          if (next >= duration) return duration;
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isOpen, duration]);

  useEffect(() => {
    if (isOpen && currentTime > 0) {
      movieService.saveProgress(movie.id, currentTime, duration);
    }
  }, [currentTime, isOpen, movie.id, duration]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const getEmbedLink = (link: string | undefined) => {
    if (!link) return "";
    // Handle standard drive links
    const fileIdMatch = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || link.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    return link;
  };

  const handleClose = () => {
    movieService.saveProgress(movie.id, currentTime, duration);
    onClose();
  };

  if (!isOpen) return null;

  const embedUrl = getEmbedLink(movie.driveLink);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[500] flex flex-col"
      >
        {/* Top Controls - Title Only */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 p-8 z-[510] pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] w-full"
            >
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">{movie.title}</h2>
              <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded w-fit">Now Streaming from Drive</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player Area */}
        <div className="flex-1 relative bg-black">
          {embedUrl ? (
            <>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-none z-[490]"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
              <AnimatePresence>
                {showResumeMsg && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[520] bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center gap-4"
                  >
                    <div className="w-2 h-2 bg-netflix-red rounded-full animate-ping" />
                    <p className="text-sm font-bold uppercase tracking-widest text-white">
                      Resuming from <span className="text-netflix-red">{formatTime(currentTime)}</span>
                    </p>
                    <button 
                      onClick={() => {
                        setCurrentTime(0);
                        setShowResumeMsg(false);
                      }}
                      className="ml-4 text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition uppercase font-black tracking-widest"
                    >
                      Restart
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xl">No Streamable Link Provided</p>
            </div>
          )}
        </div>

        {/* Bottom Bar - Consolidated with Close Button */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 bg-black border-t border-white/10 flex items-center justify-between z-[510] relative"
            >
               <div className="flex items-center gap-6">
                 <div className="bg-netflix-red px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-netflix-red/20">
                   Direct Feed
                 </div>
                 <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.2em] animate-pulse">
                   Syncing Playback...
                 </p>
               </div>
               
               <div className="flex items-center gap-4">
                 <button 
                    onClick={handleClose}
                    className="bg-white text-black px-8 py-3 rounded font-black uppercase text-xs tracking-[0.3em] hover:bg-gray-200 active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 group"
                 >
                   <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                   Close Player
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
