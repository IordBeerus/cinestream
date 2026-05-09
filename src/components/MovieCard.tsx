/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Play, Plus, ThumbsUp, ChevronDown, Check } from "lucide-react";
import { Movie } from "../types";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { movieService } from "../movieService";
import PlayerModal from "./PlayerModal";
import MovieModal from "./MovieModal";

interface MovieCardProps {
  movie: Movie;
  onRefresh?: () => void;
  onPlay: (movie: Movie) => void;
  onDetails: (movie: Movie) => void;
}

export default function MovieCard({ movie, onRefresh, onPlay, onDetails }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    movieService.toggleWatchlist(movie.id);
    if (onRefresh) onRefresh();
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(movie);
  };

  return (
    <>
      <div
        className="relative flex-none w-[180px] md:w-[280px] aspect-[16/10] group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-[#181818] relative transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.7)] group-hover:border-white/20" onClick={handlePlay}>
          <img
            src={movie.thumbnailUrl}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            alt={movie.title}
          />
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-white/10">
              {movie.type}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 z-10 transition-transform group-hover:-translate-y-1 text-left">
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">{movie.genre}</span>
            <p className="font-bold text-sm md:text-base leading-tight mt-0.5">{movie.title}</p>
          </div>
        </div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-0 left-0 w-full z-50 shadow-[0_15px_50px_rgba(0,0,0,0.9)] rounded overflow-hidden bg-netflix-black"
              style={{ transformOrigin: "center center" }}
            >
              <div className="aspect-video relative">
                <img
                  src={movie.thumbnailUrl}
                  className="w-full h-full object-cover"
                  alt={movie.title}
                />
                <div className="absolute top-2 left-2 px-1 py-0.5 bg-black/60 rounded text-[8px] font-bold">
                  {movie.rating}/10
                </div>
                <div className="absolute top-2 right-2 px-1 py-0.5 bg-netflix-red rounded text-[8px] font-bold uppercase tracking-widest">
                  {movie.type}
                </div>
              </div>
              
              <div className="p-3 text-[10px] md:text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={handlePlay}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200"
                  >
                    <Play size={14} fill="black" className="ml-0.5" />
                  </button>
                  <button 
                    onClick={handleToggleWatchlist}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition ${
                      movie.isWatchlist ? "bg-white border-white text-black" : "border-gray-600 hover:border-white text-white"
                    }`}
                  >
                    {movie.isWatchlist ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition ${
                      isLiked ? "bg-green-500 border-green-500 text-white" : "border-gray-600 hover:border-white text-white"
                    }`}
                  >
                    <ThumbsUp size={14} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDetails(movie); }}
                    className="ml-auto w-6 h-6 md:w-8 md:h-8 rounded-full border border-gray-600 flex items-center justify-center hover:border-white"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                
                <div className="font-bold mb-1 text-left">{movie.title}</div>
                <div className="flex gap-2 text-gray-400">
                  <span className="text-green-500 font-semibold">{movie.rating} Rating</span>
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-gray-300">
                  <span>{movie.genre}</span>
                  {movie.duration && (
                    <>
                      <span className="w-0.5 h-0.5 bg-gray-500 rounded-full" />
                      <span>{movie.duration}</span>
                    </>
                  )}
                  {movie.type === 'tv' && movie.seasons && (
                    <>
                      <span className="w-0.5 h-0.5 bg-gray-500 rounded-full" />
                      <span>{movie.seasons.length} Seasons</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
