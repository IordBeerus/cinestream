/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Plus, ThumbsUp, Check, Volume2, Share2, Info, ChevronDown, Star, Settings, Trash2 } from "lucide-react";
import { Movie } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { movieService } from "../movieService";
import PlayerModal from "./PlayerModal";

interface MovieModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onPlay: (movie: Movie) => void;
  onDetails?: (movie: Movie) => void;
  onEdit?: (movie: Movie) => void;
  recommendations?: Movie[];
}

export default function MovieModal({ movie, isOpen, onClose, onRefresh, onPlay, onDetails, onEdit, recommendations = [] }: MovieModalProps) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEpisodesFocused, setIsEpisodesFocused] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (modalRef.current) {
        const scrollTop = modalRef.current.scrollTop;
        // Fade out over first 300px
        const opacity = Math.max(0, 1 - scrollTop / 300);
        setScrollOpacity(opacity);
      }
    };

    const currentModal = modalRef.current;
    if (currentModal) {
      currentModal.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (currentModal) {
        currentModal.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isOpen]);

  const handleToggleWatchlist = () => {
    movieService.toggleWatchlist(movie.id);
    if (onRefresh) onRefresh();
  };

  const handleToggleFeatured = async () => {
    await movieService.toggleFeatured(movie.id);
    if (onRefresh) onRefresh();
  };

  const handleUpdateType = async (type: "movie" | "tv") => {
    await movieService.updateMovie(movie.id, { type });
    if (onRefresh) onRefresh();
    setIsModifyOpen(false);
  };

  const handleUpdateCategory = async (category: Movie["category"]) => {
    await movieService.updateMovie(movie.id, { category });
    if (onRefresh) onRefresh();
    setIsModifyOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${movie.title}"? This action cannot be undone.`)) {
      await movieService.deleteMovie(movie.id);
      if (onRefresh) onRefresh();
      onClose();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(movie.driveLink || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 md:backdrop-blur-md pointer-events-auto"
          />
          
          <motion.div
            layoutId={`movie-${movie.id}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            ref={modalRef}
            className={`relative w-full max-w-5xl md:w-[90%] bg-[#181818] rounded-none md:rounded-xl overflow-y-auto max-h-screen md:max-h-[95vh] shadow-[0_20px_100px_rgba(0,0,0,0.9)] pointer-events-auto transition-all duration-500`}
          >
            <button 
              onClick={onClose}
              className="fixed top-4 right-4 md:top-8 md:right-8 z-[1100] w-10 h-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10"
            >
              <X size={24} />
            </button>

            {/* Banner Section - Completely removed when episodes focused for total focus */}
            <AnimatePresence mode="wait">
              {!isEpisodesFocused ? (
                <motion.div 
                  key="banner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="overflow-hidden"
                >
                  <div className="relative aspect-video">
                    {movie.trailerUrl ? (
                      <div 
                        className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
                        style={{ opacity: scrollOpacity }}
                      >
                         <iframe
                            src={`${movie.trailerUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${movie.trailerUrl.split('/').pop()}`}
                            className="w-full h-full pointer-events-none"
                            allow="autoplay; encrypted-media"
                            title="Trailer"
                          />
                      </div>
                    ) : (
                      <img 
                        src={movie.thumbnailUrl} 
                        className="w-full h-full object-cover transition-opacity duration-300" 
                        style={{ opacity: scrollOpacity }}
                        alt="" 
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent pointer-events-none" />
                    
                    <div className="absolute bottom-10 left-10 right-10" style={{ opacity: scrollOpacity }}>
                      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6">{movie.title}</h1>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => onPlay(movie)}
                          className="bg-white text-black px-8 py-3 rounded font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition active:scale-95"
                        >
                          <Play size={20} fill="black" /> Play
                        </button>
                        
                        <button 
                          onClick={handleToggleWatchlist}
                          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                              movie.isWatchlist ? 'bg-white border-white text-black' : 'border-gray-500 hover:border-white text-white'
                          }`}
                          title="Add to My List"
                        >
                          {movie.isWatchlist ? <Check size={24} /> : <Plus size={24} />}
                        </button>

                        <button 
                          onClick={handleToggleFeatured}
                          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                              movie.isFeatured ? 'bg-yellow-500 border-yellow-500 text-white' : 'border-gray-500 hover:border-white text-white'
                          }`}
                          title="Feature on Hero Section"
                        >
                          <Star size={24} fill={movie.isFeatured ? 'currentColor' : 'none'} />
                        </button>

                        <button 
                          onClick={() => setLiked(!liked)}
                          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                              liked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-500 hover:border-white text-white'
                          }`}
                        >
                          <ThumbsUp size={24} fill={liked ? 'currentColor' : 'none'} />
                        </button>

                        <button 
                          onClick={handleShare}
                          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all border-gray-500 hover:border-white text-white relative`}
                        >
                          {copied ? <Check size={24} className="text-green-500" /> : <Share2 size={24} />}
                          {copied && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-[8px] px-2 py-1 rounded whitespace-nowrap">Link Copied</span>}
                        </button>

                        <div className="relative">
                          <button 
                            onClick={() => setIsModifyOpen(!isModifyOpen)}
                            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all border-gray-500 hover:border-white text-white ${isModifyOpen ? 'bg-white text-black border-white' : ''}`}
                            title="Modify Type/Genre"
                          >
                            <Settings size={24} />
                          </button>
                          
                          <AnimatePresence>
                            {isModifyOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full mb-4 left-0 w-48 bg-[#2f2f2f] border border-white/10 rounded-lg shadow-2xl p-4 z-[700] space-y-4"
                              >
                                <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Change Type</p>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleUpdateType('movie')}
                                      className={`flex-1 text-[10px] font-bold py-1 px-2 rounded border ${movie.type === 'movie' ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}
                                    >
                                      Movie
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateType('tv')}
                                      className={`flex-1 text-[10px] font-bold py-1 px-2 rounded border ${movie.type === 'tv' ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}
                                    >
                                      TV
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Toggle Anime</p>
                                  <button 
                                    onClick={() => handleUpdateCategory(movie.category === 'Anime' ? 'Trending Now' : 'Anime')}
                                    className={`w-full text-[10px] font-bold py-1 px-2 rounded border ${movie.category === 'Anime' ? 'bg-netflix-red text-white border-netflix-red' : 'border-white/20 hover:bg-white/10'}`}
                                  >
                                    {movie.category === 'Anime' ? 'Remove from Anime' : 'Mark as Anime'}
                                  </button>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Featured Status</p>
                                  <button 
                                    onClick={handleToggleFeatured}
                                    className={`w-full text-[10px] font-bold py-1 px-2 rounded border ${movie.isFeatured ? 'bg-yellow-500 text-white border-yellow-500' : 'border-white/20 hover:bg-white/10'}`}
                                  >
                                    {movie.isFeatured ? 'Unfeature' : 'Set as Featured'}
                                  </button>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Advanced Edit</p>
                                  <button 
                                    onClick={() => {
                                      if (onEdit) onEdit(movie);
                                      onClose();
                                    }}
                                    className="w-full text-[10px] font-bold py-1.5 px-2 rounded border border-white/20 hover:bg-white text-white hover:text-black transition-all flex items-center justify-center gap-2"
                                  >
                                    <Settings size={12} />
                                    Full Editor
                                  </button>
                                </div>
                                <div className="pt-2 border-t border-white/10">
                                  <button 
                                    onClick={handleDelete}
                                    className="w-full text-[10px] font-bold py-1.5 px-2 rounded bg-netflix-red/10 border border-netflix-red/30 text-netflix-red hover:bg-netflix-red hover:text-white transition-all flex items-center justify-center gap-2"
                                  >
                                    <Trash2 size={12} />
                                    Delete Content
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div key="spacer" className="h-10" /> 
              )}
            </AnimatePresence>

            {/* Content Section */}
            <div className={`p-6 md:p-10 transition-all duration-500`}>
              <div className={isEpisodesFocused ? 'w-full' : 'grid md:grid-cols-[1fr_250px] gap-10'}>
                <div className="space-y-6">
                  {!isEpisodesFocused ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-500 font-bold">{Number(movie.rating) * 10}% Match</span>
                        <span className="text-gray-400">{movie.year}</span>
                        <span className="border border-gray-600 px-1 text-[10px] text-gray-500 rounded uppercase">HD</span>
                        {movie.duration && <span className="text-gray-400">{movie.duration}</span>}
                      </div>
                      
                      <p className="text-sm md:text-base leading-relaxed text-gray-300">
                        {movie.description}
                      </p>
                    </>
                  ) : null}

                  {movie.type === "tv" && movie.seasons && movie.seasons.length > 0 && (
                    <div className={`${!isEpisodesFocused ? 'pt-10 border-t border-white/5' : ''} space-y-8`}>
                      <div className={`flex items-center justify-between sticky top-0 bg-[#181818] z-30 py-4 -mx-6 px-6 md:-mx-10 md:px-10 shadow-lg border-b border-white/5`}>
                        <div className="flex items-center gap-4">
                          {isEpisodesFocused && (
                            <button 
                              onClick={() => setIsEpisodesFocused(false)}
                              className="p-2 hover:bg-white/10 rounded-full transition group"
                              title="Back to Details"
                            >
                              <X size={24} className="text-gray-400 group-hover:text-white" />
                            </button>
                          )}
                          <h3 className={`font-bold transition-all ${isEpisodesFocused ? 'text-xl md:text-2xl uppercase tracking-tighter' : 'text-2xl'}`}>
                            {isEpisodesFocused ? `Episodes: ${movie.title}` : 'Episodes'}
                          </h3>
                        </div>
                        <div className="relative group">
                          <button 
                            onClick={() => setIsEpisodesFocused(!isEpisodesFocused)}
                            className={`flex items-center gap-2 bg-[#2f2f2f] border px-4 py-2 rounded text-sm font-bold transition shadow-xl ${isEpisodesFocused ? 'border-netflix-red text-netflix-red' : 'border-white/20 hover:bg-[#3f3f3f]'}`}
                          >
                            Season {movie.seasons[0].number}
                            <ChevronDown className={`transition-transform duration-300 ${isEpisodesFocused ? 'rotate-180' : ''}`} size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className={`divide-y divide-white/5 relative z-10`}>
                        {movie.seasons[0].episodes.map((episode) => (
                          <div 
                            key={episode.id}
                            onClick={() => onPlay({ ...movie, title: `${movie.title}: ${episode.title}`, driveLink: episode.driveLink })}
                            className="group flex flex-col md:flex-row items-center gap-6 p-6 -mx-6 rounded-md hover:bg-white/5 cursor-pointer transition-all"
                          >
                            <div className="text-gray-500 font-bold text-lg md:w-8 text-center group-hover:text-white transition">
                              {episode.number}
                            </div>
                            
                            <div className="relative w-full md:w-32 aspect-video rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                              <img 
                                src={episode.thumbnailUrl || movie.thumbnailUrl} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100" 
                                alt="" 
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-black/60 border border-white flex items-center justify-center backdrop-blur-sm">
                                  <Play size={16} fill="white" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 right-2 px-1 bg-black/80 text-[10px] font-bold text-white rounded">
                                {episode.duration || "24m"}
                              </div>
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold group-hover:text-netflix-red transition">{episode.title}</h4>
                              </div>
                              <p className="text-[11px] text-gray-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                                {episode.description || "No description available for this episode."}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isEpisodesFocused && (
                    <div className="pt-10 border-t border-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">You might also like</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {recommendations.filter(m => m.id !== movie.id).slice(0, 6).map(rec => (
                            <div 
                              key={rec.id} 
                              onClick={() => onDetails?.(rec)}
                              className="bg-[#2f2f2f] rounded-md overflow-hidden cursor-pointer group hover:ring-2 hover:ring-white transition-all shadow-xl"
                            >
                                <div className="aspect-video relative">
                                  <img src={rec.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" alt="" />
                                  <div className="absolute top-2 right-2 px-1 bg-black/60 text-[8px] font-bold text-white rounded">
                                    {rec.rating} ★
                                  </div>
                                </div>
                                <div className="p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-[10px] font-bold text-white line-clamp-1">{rec.title}</h4>
                                    <span className="text-[8px] text-gray-500">{rec.year}</span>
                                  </div>
                                  <p className="text-[9px] text-gray-400 line-clamp-2 leading-tight">
                                    {rec.description}
                                  </p>
                                </div>
                            </div>
                          ))}
                        </div>
                    </div>
                  )}
                </div>

                {!isEpisodesFocused && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-black block tracking-widest mb-1">Genre</span>
                      <span className="text-xs text-gray-300">{movie.genre}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-black block tracking-widest mb-1">This Movie is</span>
                      <span className="text-xs text-gray-300">Exciting, Mind-Bending, Visual Masterpiece</span>
                    </div>
                    <div>
                        <span className="text-gray-500 text-[10px] uppercase font-black block tracking-widest mb-1">Maturity Rating</span>
                        <span className="text-xs px-1.5 py-0.5 border border-gray-600 rounded text-gray-400">TV-MA</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
