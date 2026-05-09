/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, ChevronRight, LayoutGrid, SortAsc, Star } from "lucide-react";
import { Movie, SortOption } from "../types";
import MovieCard from "./MovieCard";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  key?: string | number;
  onRefresh?: () => void;
  onPlay: (movie: Movie) => void;
  onDetails: (movie: Movie) => void;
  onSort?: (option: SortOption) => void;
  currentSort?: SortOption;
}

export default function MovieRow({ title, movies, onRefresh, onPlay, onDetails, onSort, currentSort }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div 
      className="px-4 md:px-10 mt-12 overflow-visible relative group"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-6">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{title}</h2>
          
          {onSort && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-2">Sort by:</span>
              <button 
                onClick={() => onSort("title")}
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition ${currentSort === 'title' ? 'bg-netflix-red text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Title
              </button>
              <button 
                onClick={() => onSort("year")}
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition ${currentSort === 'year' ? 'bg-netflix-red text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Year
              </button>
              <button 
                onClick={() => onSort("rating")}
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition ${currentSort === 'rating' ? 'bg-netflix-red text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Rating
              </button>
            </div>
          )}
        </div>
        
        <button className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition text-left">
          View All
        </button>
      </div>
      
      <div className="relative group/row">
        {showArrows && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/40 hover:bg-black/60 flex items-center justify-center transition opacity-0 group-hover/row:opacity-100"
          >
            <ChevronLeft size={40} />
          </button>
        )}

        <div
          ref={rowRef}
          className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide pb-12 pt-4 px-2"
          style={{ scrollbarWidth: "none" }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MovieCard movie={movie} onRefresh={onRefresh} onPlay={onPlay} onDetails={onDetails} />
            </motion.div>
          ))}
        </div>

        {showArrows && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/40 hover:bg-black/60 flex items-center justify-center transition opacity-0 group-hover/row:opacity-100"
          >
            <ChevronRight size={40} />
          </button>
        )}
      </div>
    </div>
  );
}
