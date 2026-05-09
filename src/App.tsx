/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieRow from "./components/MovieRow";
import AddMovieForm from "./components/AddMovieForm";
import ProfileSelector from "./components/ProfileSelector";
import MovieModal from "./components/MovieModal";
import { Movie, CATEGORIES, Profile, WatchHistoryEntry, WatchProgress, Announcement, LANGUAGES, SortOption, GENRES, YEARS } from "./types";
import { movieService } from "./movieService";
import { notificationService } from "./services/notificationService";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronRight, X } from "lucide-react";
import PlayerModal from "./components/PlayerModal";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);
  const [progress, setProgress] = useState<WatchProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("home");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [collectionSort, setCollectionSort] = useState<SortOption>("title");
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);

  const refreshMovies = async () => {
    const rawMovies = await movieService.getMovies();
    const watchlistIds = movieService.getWatchlistIds();
    
    // Map shared movies with local watchlist preference
    const moviesWithWatchlist: Movie[] = rawMovies.map(m => ({
      ...m,
      isWatchlist: watchlistIds.includes(m.id)
    }));
    
    setMovies(moviesWithWatchlist);
    
    if (activeProfile) {
      setHistory(movieService.getHistory());
      setProgress(movieService.getAllProgress());
      
      const recs = await movieService.getRecommendedMovies();
      // Ensure we use the latest movie objects from our stateful list
      const mappedRecs = recs
        .map(r => moviesWithWatchlist.find(m => m.id === r.id))
        .filter((m): m is Movie => !!m);
      setRecommendedMovies(mappedRecs);
    }
  };

  const handleUpdateMovie = async (id: string, updates: Partial<Movie>) => {
    await movieService.updateMovie(id, updates);
    refreshMovies();
    setMovieToEdit(null);
  };

  const handleUpdateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    await notificationService.updateAnnouncement(id, updates);
    setAnnouncementToEdit(null);
    // Announcements are fetched by Navbar's interval or could be manually refreshed if needed
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setAnnouncementToEdit(announcement);
    setMovieToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditMovie = (movie: Movie) => {
    setMovieToEdit(movie);
    setAnnouncementToEdit(null);
    setIsFormOpen(true);
  };

  const refreshData = async () => {
    setProfiles(movieService.getProfiles());
    await refreshMovies();
  };

  useEffect(() => {
    const init = async () => {
      await refreshData();
      const savedProfile = movieService.getActiveProfile();
      if (savedProfile && !savedProfile.pin) {
        setActiveProfile(savedProfile);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (activeProfile) {
      refreshMovies();
    }
  }, [activeProfile]);

  const searchResults = useMemo(() => {
    let filtered = movies;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.genre.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }
    
    if (selectedGenre) {
      filtered = filtered.filter(m => m.genre === selectedGenre);
    }
    
    if (selectedYear) {
      filtered = filtered.filter(m => m.year === selectedYear);
    }
    
    if (!searchQuery.trim() && !selectedGenre && !selectedYear) return [];
    
    return filtered;
  }, [searchQuery, selectedGenre, selectedYear, movies]);

  const featuredMovie = useMemo(() => {
    if (movies.length === 0) return null;
    return movies.find(m => m.isFeatured) || movies.find(m => m.category === "Trending Now") || movies[0];
  }, [movies]);

  const watchlistMovies = useMemo(() => {
    const list = movies.filter(m => m.isWatchlist);
    return [...list].sort((a, b) => {
      if (collectionSort === "title") return a.title.localeCompare(b.title);
      if (collectionSort === "year") return parseInt(b.year) - parseInt(a.year);
      if (collectionSort === "rating") return parseFloat(b.rating) - parseFloat(a.rating);
      return 0;
    });
  }, [movies, collectionSort]);

  const tvShows = useMemo(() => {
    return movies.filter(m => m.type === 'tv');
  }, [movies]);

  const animeMovies = useMemo(() => {
    return movies.filter(m => m.genre.toLowerCase().includes('anime'));
  }, [movies]);

  const allFeaturedMovies = useMemo(() => {
    return movies.filter(m => m.isFeatured);
  }, [movies]);

  const continueWatchingMovies = useMemo(() => {
    return progress
      .filter(p => (p.progress / p.duration) < 0.95)
      .sort((a, b) => b.lastUpdated - a.lastUpdated)
      .map(p => movies.find(m => m.id === p.movieId))
      .filter((m): m is Movie => !!m);
  }, [progress, movies]);

  const historyMovies = useMemo(() => {
    return history
      .map(h => movies.find(m => m.id === h.movieId))
      .filter((m): m is Movie => !!m);
  }, [history, movies]);

  const isAnyFilterActive = useMemo(() => !!(searchQuery.trim() || selectedGenre || selectedYear), [searchQuery, selectedGenre, selectedYear]);

  const moviesByCategory = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    CATEGORIES.forEach(cat => {
      map[cat] = movies.filter(m => m.category === cat);
    });
    return map;
  }, [movies]);

  const moviesByLanguage = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    LANGUAGES.forEach(lang => {
      map[lang] = movies.filter(m => (m.language || LANGUAGES[0]) === lang);
    });
    return map;
  }, [movies]);

  const handleAddMovie = async (newMovie: Omit<Movie, "id">) => {
    await movieService.addMovie(newMovie);
    refreshMovies();
  };

  const handleSelectProfile = (profile: Profile) => {
    movieService.setActiveProfile(profile);
    setActiveProfile(profile);
  };

  return (
    <div className="relative min-h-screen bg-netflix-black text-white font-sans selection:bg-netflix-red/30">
      <AnimatePresence>
        {!activeProfile && (
          <ProfileSelector 
            profiles={profiles} 
            onSelect={handleSelectProfile} 
            onRefresh={refreshData}
          />
        )}
      </AnimatePresence>

      <Navbar 
        onAddClick={() => {
          setMovieToEdit(null);
          setAnnouncementToEdit(null);
          setIsFormOpen(true);
        }} 
        onSwitchProfile={() => {
          setActiveProfile(null);
          setSearchQuery("");
          setSelectedGenre("");
          setSelectedYear("");
          setActiveView("home");
          setSelectedLanguage(null);
        }}
        onSearch={setSearchQuery}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        onHomeClick={() => {
          setSearchQuery("");
          setSelectedGenre("");
          setSelectedYear("");
          setActiveView("home");
          setSelectedLanguage(null);
        }}
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setSearchQuery("");
          setSelectedGenre("");
          setSelectedYear("");
          setSelectedLanguage(null);
        }}
        onEditAnnouncement={handleEditAnnouncement}
      />
      
      {featuredMovie && !searchQuery.trim() && activeView === "home" && (
        <Hero 
          movie={featuredMovie} 
          onRefresh={refreshMovies} 
          onPlay={setPlayingMovie} 
          onDetails={setSelectedMovie}
        />
      )}

      <main className={`pb-24 relative z-10 space-y-2 ${isAnyFilterActive || activeView !== "home" ? "pt-32" : "-mt-32"}`}>
        {isAnyFilterActive && (
          <div className="px-6 md:px-10 mb-12">
            <h2 className="text-2xl font-bold mb-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <Search size={22} className="text-netflix-red" />
                Search Results for: <span className="text-white">"{searchQuery || 'Filter'}"</span>
              </div>
              
              {(selectedGenre || selectedYear) && (
                <div className="flex items-center gap-2 ml-4">
                  {selectedGenre && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-netflix-red">
                      Genre: {selectedGenre}
                      <X size={12} className="cursor-pointer text-gray-500 hover:text-white" onClick={() => setSelectedGenre("")} />
                    </span>
                  )}
                  {selectedYear && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-netflix-red">
                      Year: {selectedYear}
                      <X size={12} className="cursor-pointer text-gray-500 hover:text-white" onClick={() => setSelectedYear("")} />
                    </span>
                  )}
                  <button 
                    onClick={() => { setSelectedGenre(""); setSelectedYear(""); }}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition underline"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </h2>
            {searchResults.length > 0 ? (
              <MovieRow 
                title="" 
                movies={searchResults} 
                onRefresh={refreshMovies}
                onPlay={setPlayingMovie}
                onDetails={setSelectedMovie}
              />
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-500 text-xl font-bold uppercase tracking-[0.2em]">No matches found</p>
                <p className="text-gray-700 mt-2">Try different keywords or genres.</p>
              </div>
            )}
          </div>
        )}

        {/* View Specific Content */}
        {activeView === "languages" && !isAnyFilterActive && (
          <div className="px-6 md:px-10 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4">
              Browse by Languages
              {selectedLanguage && (
                <span className="text-netflix-red text-sm font-black flex items-center gap-2">
                  <ChevronRight size={16} className="text-gray-600" />
                  {selectedLanguage}
                  <button 
                    onClick={() => setSelectedLanguage(null)}
                    className="ml-2 text-gray-500 hover:text-white transition"
                    title="Clear filter"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </h2>
            
            {!selectedLanguage ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {LANGUAGES.map(lang => {
                  const count = moviesByLanguage[lang]?.length || 0;
                  return (
                    <motion.div
                      key={lang}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedLanguage(lang)}
                      className="bg-[#181818] border border-white/5 p-6 rounded-xl cursor-pointer hover:bg-white/5 transition group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-netflix-red/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-netflix-red/20 transition-colors" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition">{lang}</h3>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">{count} {count === 1 ? 'Title' : 'Titles'}</p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-12">
                 <MovieRow 
                   title="" 
                   movies={moviesByLanguage[selectedLanguage] || []} 
                   onRefresh={refreshMovies}
                   onPlay={setPlayingMovie}
                   onDetails={setSelectedMovie}
                 />
                 {(!moviesByLanguage[selectedLanguage] || moviesByLanguage[selectedLanguage].length === 0) && (
                   <div className="py-20 text-center">
                     <p className="text-gray-500 text-xl font-bold uppercase tracking-widest">No movies in {selectedLanguage}</p>
                   </div>
                 )}
              </div>
            )}
          </div>
        )}

        {activeView === "movies" && !isAnyFilterActive && (
          <div className="px-6 md:px-10 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Feature Movies</h2>
            <div className="space-y-12">
              {CATEGORIES.map(category => {
                const catMovies = (moviesByCategory[category] || []).filter(m => m.type === 'movie');
                if (catMovies.length === 0) return null;
                return (
                  <MovieRow 
                    key={category} 
                    title={category} 
                    movies={catMovies} 
                    onRefresh={refreshMovies}
                    onPlay={setPlayingMovie}
                    onDetails={setSelectedMovie}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeView === "tv" && !isAnyFilterActive && (
          <div className="px-6 md:px-10 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">TV Series</h2>
            {tvShows.length > 0 ? (
              <MovieRow 
                title="" 
                movies={tvShows} 
                onRefresh={refreshMovies}
                onPlay={setPlayingMovie}
                onDetails={setSelectedMovie}
              />
            ) : (
              <div className="py-20 text-center bg-white/5 rounded-xl border border-white/5">
                <p className="text-gray-500 text-xl font-bold uppercase tracking-[0.2em]">No TV Shows found</p>
              </div>
            )}
          </div>
        )}

        {activeView === "anime" && !isAnyFilterActive && (
          <div className="px-6 md:px-10 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Anime</h2>
            {animeMovies.length > 0 ? (
              <MovieRow 
                title="" 
                movies={animeMovies} 
                onRefresh={refreshMovies}
                onPlay={setPlayingMovie}
                onDetails={setSelectedMovie}
              />
            ) : (
              <div className="py-20 text-center bg-white/5 rounded-xl border border-white/5">
                <p className="text-gray-500 text-xl font-bold uppercase tracking-[0.2em]">No Anime found</p>
              </div>
            )}
          </div>
        )}

        {activeView === "featured" && !isAnyFilterActive && (
          <div className="px-6 md:px-10 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Featured Selection</h2>
            {allFeaturedMovies.length > 0 ? (
              <MovieRow 
                title="" 
                movies={allFeaturedMovies} 
                onRefresh={refreshMovies}
                onPlay={setPlayingMovie}
                onDetails={setSelectedMovie}
              />
            ) : (
              <div className="py-20 text-center bg-white/5 rounded-xl border border-white/5">
                <p className="text-gray-500 text-xl font-bold uppercase tracking-[0.2em]">No Featured Content</p>
                <p className="text-gray-700 mt-2 italic">Click the star in the movie details to feature it here.</p>
              </div>
            )}
          </div>
        )}

        {activeView === "collection" && !isAnyFilterActive && (
          <div className="px-6 md:px-10 mb-12">
            {watchlistMovies.length > 0 ? (
              <MovieRow 
                title="My Collection" 
                movies={watchlistMovies} 
                onRefresh={refreshMovies}
                onPlay={setPlayingMovie}
                onDetails={setSelectedMovie}
                onSort={setCollectionSort}
                currentSort={collectionSort}
              />
            ) : (
              <div className="py-20 text-center bg-white/5 rounded-xl border border-white/5">
                <p className="text-gray-500 text-xl font-bold uppercase tracking-[0.2em]">Your list is empty</p>
                <p className="text-gray-700 mt-2">Add movies and shows to your list to see them here.</p>
              </div>
            )}
          </div>
        )}

        {activeView === "latest" && !isAnyFilterActive && (
          <div className="px-6 md:px-10 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">New & Popular</h2>
            <div className="space-y-12">
              <MovieRow 
                title="Trending Now" 
                movies={moviesByCategory["Trending Now"] || []} 
                onRefresh={refreshMovies}
                onPlay={setPlayingMovie}
                onDetails={setSelectedMovie}
              />
              <MovieRow 
                title="New Releases" 
                movies={moviesByCategory["New Releases"] || []} 
                onRefresh={refreshMovies}
                onPlay={setPlayingMovie}
                onDetails={setSelectedMovie}
              />
            </div>
          </div>
        )}

        {activeView === "home" && continueWatchingMovies.length > 0 && !isAnyFilterActive && (
          <MovieRow 
            title="Continue Watching" 
            movies={continueWatchingMovies} 
            onRefresh={refreshMovies}
            onPlay={setPlayingMovie}
            onDetails={setSelectedMovie}
          />
        )}

        {activeView === "home" && recommendedMovies.length > 0 && !isAnyFilterActive && (
          <MovieRow 
            title="Recommended for You" 
            movies={recommendedMovies} 
            onRefresh={refreshMovies}
            onPlay={setPlayingMovie}
            onDetails={setSelectedMovie}
          />
        )}

        {activeView === "home" && watchlistMovies.length > 0 && !isAnyFilterActive && (
          <MovieRow 
            title="My List" 
            movies={watchlistMovies} 
            onRefresh={refreshMovies}
            onPlay={setPlayingMovie}
            onDetails={setSelectedMovie}
          />
        )}

        {activeView === "home" && historyMovies.length > 0 && !isAnyFilterActive && (
          <MovieRow 
            title="Watch It Again" 
            movies={historyMovies} 
            onRefresh={refreshMovies}
            onPlay={setPlayingMovie}
            onDetails={setSelectedMovie}
          />
        )}

        {activeView === "home" && tvShows.length > 0 && !isAnyFilterActive && (
          <MovieRow 
            title="TV Series" 
            movies={tvShows} 
            onRefresh={refreshMovies}
            onPlay={setPlayingMovie}
            onDetails={setSelectedMovie}
          />
        )}

        {activeView === "home" && !isAnyFilterActive && CATEGORIES.map(category => {
          const catMovies = moviesByCategory[category] || [];
          if (catMovies.length === 0) return null;
          return (
            <MovieRow 
              key={category} 
              title={category} 
              movies={catMovies} 
              onRefresh={refreshMovies}
              onPlay={setPlayingMovie}
              onDetails={setSelectedMovie}
            />
          );
        })}
      </main>

      <footer className="px-6 md:px-10 py-16 border-t border-white/5 text-gray-600 text-[11px] uppercase tracking-widest font-bold flex flex-col md:flex-row justify-between items-center gap-8 bg-black">
        <div className="flex gap-10 text-left">
          <a href="#" className="hover:text-white transition">Audio</a>
          <a href="#" className="hover:text-white transition">Help Centre</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
        </div>
        <div className="text-netflix-red font-black tracking-tighter text-3xl">
          CINESTREAM
        </div>
        <div className="text-gray-700">
          © 2026 CineStream · Bento Edition
        </div>
      </footer>

      <AddMovieForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setMovieToEdit(null);
          setAnnouncementToEdit(null);
        }} 
        onAdd={handleAddMovie}
        movieToEdit={movieToEdit}
        announcementToEdit={announcementToEdit}
        onUpdateMovie={handleUpdateMovie}
        onUpdateAnnouncement={handleUpdateAnnouncement}
        onDelete={() => {
          refreshMovies();
          setSelectedMovie(null);
        }}
      />

      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          isOpen={!!selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onRefresh={refreshMovies}
          onPlay={(movie) => {
            setSelectedMovie(null);
            setPlayingMovie(movie);
          }}
          onDetails={setSelectedMovie}
          onEdit={handleEditMovie}
          recommendations={recommendedMovies}
        />
      )}

      {playingMovie && (
        <PlayerModal 
          movie={playingMovie} 
          isOpen={!!playingMovie} 
          onClose={() => {
            setPlayingMovie(null);
            refreshMovies();
          }} 
        />
      )}
    </div>
  );
}
