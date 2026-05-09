/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, User, PlusCircle, LogOut, RefreshCw, AlertCircle, Info, Trash2, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Profile, Announcement, GENRES, YEARS } from "../types";
import { movieService } from "../movieService";
import { notificationService } from "../services/notificationService";

interface NavbarProps {
  onAddClick: () => void;
  onSwitchProfile?: () => void;
  onSearch?: (query: string) => void;
  selectedGenre?: string;
  onGenreChange?: (genre: string) => void;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  onHomeClick?: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  onEditAnnouncement?: (announcement: Announcement) => void;
}

export default function Navbar({ 
  onAddClick, 
  onSwitchProfile, 
  onSearch, 
  selectedGenre,
  onGenreChange,
  selectedYear,
  onYearChange,
  onHomeClick, 
  activeView, 
  onViewChange,
  onEditAnnouncement
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveProfile(movieService.getActiveProfile());
    setAnnouncements(notificationService.getAnnouncements());
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);

    // Poll for notifications
    const interval = setInterval(() => {
      setAnnouncements(notificationService.getAnnouncements());
    }, 5000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const deleteAnnouncement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.deleteAnnouncement(id);
    setAnnouncements(notificationService.getAnnouncements());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  const handleLinkClick = (view: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSearchQuery("");
    setIsSearchActive(false);
    if (onSearch) onSearch("");
    onViewChange(view);
    if (view === "home" && onHomeClick) onHomeClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 flex items-center justify-between px-6 md:px-10 py-6 ${
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-12 text-left">
        <h1 className="text-netflix-red text-3xl font-black tracking-tighter cursor-pointer" onClick={() => handleLinkClick("home")}>
          CINESTREAM
        </h1>
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-400">
          <a href="#" className={`${activeView === 'home' ? 'text-white font-bold' : 'hover:text-white'} transition`} onClick={(e) => handleLinkClick("home", e)}>Home</a>
          <a href="#" className={`${activeView === 'featured' ? 'text-white font-bold' : 'hover:text-white'} transition`} onClick={(e) => handleLinkClick("featured", e)}>Featured</a>
          <a href="#" className={`${activeView === 'tv' ? 'text-white font-bold' : 'hover:text-white'} transition`} onClick={(e) => handleLinkClick("tv", e)}>TV Shows</a>
          <a href="#" className={`${activeView === 'movies' ? 'text-white font-bold' : 'hover:text-white'} transition`} onClick={(e) => handleLinkClick("movies", e)}>Movies</a>
          <a href="#" className={`${activeView === 'anime' ? 'text-white font-bold' : 'hover:text-white'} transition`} onClick={(e) => handleLinkClick("anime", e)}>Anime</a>
          <a href="#" className={`${activeView === 'languages' ? 'text-white font-bold' : 'hover:text-white'} transition`} onClick={(e) => handleLinkClick("languages", e)}>Languages</a>
          <a href="#" className={`${activeView === 'collection' ? 'text-white font-bold' : 'hover:text-white'} transition`} onClick={(e) => handleLinkClick("collection", e)}>My List</a>
        </div>
      </div>

      <div className="flex items-center gap-4 text-white">
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 bg-netflix-red/10 hover:bg-netflix-red/20 text-netflix-red px-3 py-1.5 rounded-full text-sm font-semibold transition border border-netflix-red/20"
        >
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Add Movie</span>
        </button>
        
        {/* Search Bar */}
        <div className={`flex items-center transition-all duration-300 ${isSearchActive ? "bg-black/60 border border-white/20 px-3 py-1.5 rounded-sm" : ""}`}>
          <Search 
            className="cursor-pointer hover:text-gray-300 transition" 
            size={20} 
            onClick={() => setIsSearchActive(!isSearchActive)}
          />
          <AnimatePresence>
            {isSearchActive && (
              <div className="flex items-center gap-2 ml-2">
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  autoFocus
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-500"
                />
                <motion.select
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  value={selectedGenre}
                  onChange={(e) => onGenreChange && onGenreChange(e.target.value)}
                  className="bg-netflix-black/80 border border-white/20 rounded-sm text-[10px] uppercase font-bold px-2 py-1 outline-none cursor-pointer focus:border-white/40 transition"
                >
                  <option value="">All Genres</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </motion.select>
                <motion.select
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  value={selectedYear}
                  onChange={(e) => onYearChange && onYearChange(e.target.value)}
                  className="bg-netflix-black/80 border border-white/20 rounded-sm text-[10px] uppercase font-bold px-2 py-1 outline-none cursor-pointer focus:border-white/40 transition"
                >
                  <option value="">All Years</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </motion.select>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={notificationRef}>
          <Bell 
            className="cursor-pointer hover:text-gray-300 transition" 
            size={20} 
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {announcements.length > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-netflix-red rounded-full border border-black" />
          )}

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-4 w-80 bg-[#181818] border border-white/10 rounded-sm shadow-[0_15px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Announcements</h3>
                  <span 
                    onClick={() => {
                        notificationService.clearAll();
                        setAnnouncements([]);
                    }}
                    className="text-[10px] text-netflix-red font-bold cursor-pointer hover:underline"
                  >
                    Clear All
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {announcements.length > 0 ? announcements.map(a => (
                    <div key={a.id} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition group relative">
                      <div className="flex gap-2">
                        {a.type === 'alert' ? <AlertCircle size={14} className="text-netflix-red shrink-0" /> : <Info size={14} className="text-blue-500 shrink-0" />}
                        <div className="flex-1 text-left">
                          <p className="text-xs font-bold text-white mb-0.5">{a.title}</p>
                          <p className="text-[11px] text-gray-400 leading-tight">{a.message}</p>
                          <p className="text-[9px] text-gray-600 mt-1 uppercase font-bold">{new Date(a.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditAnnouncement) onEditAnnouncement(a);
                                setShowNotifications(false);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-white"
                              title="Edit Announcement"
                          >
                              <Settings size={12} />
                          </button>
                          <button 
                              onClick={(e) => deleteAnnouncement(a.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-netflix-red"
                              title="Delete Announcement"
                          >
                              <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center bg-white/5">
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-600">No new announcements</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <div className="w-8 h-8 rounded-md overflow-hidden bg-white/10 border border-white/10 group-hover:border-white transition-all">
              {activeProfile ? (
                <img src={activeProfile.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <User size={20} fill="white" className="m-1" />
              )}
            </div>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-[#181818] border border-white/10 rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-white/5 mb-1 pointer-events-none">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Watching as</p>
                    <p className="text-xs font-bold truncate text-white">{activeProfile?.name}</p>
                  </div>
                  <button 
                    onClick={onSwitchProfile}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] text-gray-400 font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition rounded"
                  >
                    <RefreshCw size={14} />
                    Switch Profile
                  </button>
                  <button 
                    onClick={onSwitchProfile}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] text-gray-400 font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition rounded"
                  >
                    <User size={14} />
                    Manage Profiles
                  </button>
                  <button 
                    onClick={onSwitchProfile}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] text-gray-400 font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition rounded mt-1"
                  >
                    <LogOut size={14} />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
