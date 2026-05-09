/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Play, Info, Plus, Check } from "lucide-react";
import { Movie } from "../types";
import { motion } from "motion/react";
import { movieService } from "../movieService";
import { useState } from "react";
import MovieModal from "./MovieModal";

interface HeroProps {
  movie: Movie;
  onRefresh?: () => void;
  onPlay: (movie: Movie) => void;
  onDetails: (movie: Movie) => void;
}

export default function Hero({ movie, onRefresh, onPlay, onDetails }: HeroProps) {
  const handleToggleWatchlist = () => {
    movieService.toggleWatchlist(movie.id);
    if (onRefresh) onRefresh();
  };

  return (
    <section className="relative w-full pb-8 overflow-hidden bg-black">
      <div className="relative h-[80vh] md:h-[85vh] w-full overflow-hidden group">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={movie.thumbnailUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            alt={movie.title}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 max-w-[900px] gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
                {movie.category}
              </span>
              <span className="text-yellow-400 text-sm">★★★★★</span>
              <span className="text-gray-500 font-bold text-[10px] uppercase ml-2 border border-white/10 px-1.5 py-0.5 rounded tracking-widest">
                {movie.type}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none mt-4 text-left">
              {movie.title}
            </h1>
            <p className="mt-4 text-xs md:text-sm text-gray-400 max-w-sm leading-relaxed line-clamp-3 text-left">
              {movie.description}
            </p>

            <div className="flex items-center gap-4 mt-10">
              <button 
                onClick={() => onPlay(movie)}
                className="bg-white text-black px-10 py-4 rounded-md font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-xl"
              >
                <Play fill="black" size={20} />
                Play Now
              </button>
              <button 
                onClick={handleToggleWatchlist}
                className={`px-10 py-4 rounded-md font-bold transition-colors flex items-center gap-2 backdrop-blur-md border ${
                  movie.isWatchlist 
                  ? "bg-white border-white text-black" 
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-lg"
                }`}
              >
                {movie.isWatchlist ? <Check size={20} /> : <Plus size={20} />}
                My List
              </button>
              <button 
                onClick={() => onDetails(movie)}
                className="bg-white/20 px-10 py-4 rounded-md font-bold hover:bg-white/30 transition-colors flex items-center gap-2 backdrop-blur-md border border-white/10 text-white"
              >
                <Info size={20} />
                More Info
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
