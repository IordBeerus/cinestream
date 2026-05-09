/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie, Profile, WatchHistoryEntry, WatchProgress } from "./types";

const STORAGE_KEY = "cinestream_movies";
const PROFILES_KEY = "cinestream_profiles";
const ACTIVE_PROFILE_KEY = "cinestream_active_profile";
const HISTORY_KEY = "cinestream_history";
const PROGRESS_KEY = "cinestream_progress";
const WATCHLIST_KEY = "cinestream_watchlist"; // Though we use movie.isWatchlist, keeping for consistency if needed or used elsewhere

const INITIAL_PROFILES: Profile[] = [
  { id: "p1", name: "User One", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", accentColor: "#e50914" },
  { id: "p2", name: "User Two", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna", accentColor: "#2ecc71" },
  { id: "p3", name: "Kids", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Toby", accentColor: "#3498db", isKids: true }
];

const INITIAL_MOVIES: Movie[] = [
  {
    id: "1",
    type: "movie",
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genre: "Sci-Fi",
    driveLink: "https://drive.google.com/open?id=demo1",
    thumbnailUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000",
    year: "2014",
    rating: "8.7",
    duration: "2h 49m",
    language: "English",
    category: "Trending Now",
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    isFeatured: true
  },
  {
    id: "2",
    type: "movie",
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    genre: "Action",
    driveLink: "https://drive.google.com/open?id=demo2",
    thumbnailUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1000",
    year: "2008",
    rating: "9.0",
    duration: "2h 32m",
    language: "English",
    category: "Action",
    trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY"
  },
  {
    id: "3",
    type: "movie",
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    genre: "Sci-Fi",
    driveLink: "https://drive.google.com/file/d/15pAD1QGxR0jFZuO8CAHSUzzp_FEpqvf0/view",
    thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000",
    year: "2010",
    rating: "8.8",
    duration: "2h 28m",
    language: "English",
    category: "Trending Now",
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0"
  },
  {
    id: "4",
    type: "tv",
    title: "Demon Slayer",
    description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    genre: "Anime",
    thumbnailUrl: "https://images.unsplash.com/photo-1541562232579-512a21359920?auto=format&fit=crop&q=80&w=1000",
    year: "2019",
    rating: "8.7",
    language: "Japanese",
    category: "Anime",
    seasons: [
      {
        id: "s1",
        number: 1,
        episodes: [
          { 
            id: "e1", 
            number: 1, 
            title: "Cruelty", 
            description: "Tanjirou Kamado is a kindhearted and intelligent boy who lives with his family, until everything changes when his family is slaughtered by a demon.",
            duration: "24m",
            driveLink: "https://drive.google.com/open?id=demon1" 
          },
          { 
            id: "e2", 
            number: 2, 
            title: "Trainer Sakonji Urokodaki", 
            description: "Tanjirou and Nezuko head for Mt. Sagiri, searching for the man Sakonji Urokodaki. Along the way, they encounter another demon.",
            duration: "24m",
            driveLink: "https://drive.google.com/open?id=demon2" 
          },
          { 
            id: "e3", 
            number: 3, 
            title: "Sabito and Makomo", 
            description: "Tanjirou spends six months training under Urokodaki, but the Final Selection is nearing and he must prove he is ready.",
            duration: "24m",
            driveLink: "https://drive.google.com/open?id=demon3" 
          },
          { 
            id: "e4", 
            number: 4, 
            title: "Final Selection", 
            description: "Tanjirou participates in the Final Selection on Mt. Fujikasane, where demons captured by demon hunters are imprisoned.",
            duration: "24m",
            driveLink: "https://drive.google.com/open?id=demon4" 
          },
          { 
            id: "e5", 
            number: 5, 
            title: "My Own Steel", 
            description: "Seven days have passed since the start of the Final Selection. Tanjirou has survived and receives his own Nichirin Sword.",
            duration: "24m",
            driveLink: "https://drive.google.com/open?id=demon5" 
          }
        ]
      }
    ]
  },
  {
    id: "5",
    type: "tv",
    title: "Breaking Bad",
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    genre: "Drama",
    thumbnailUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&q=80&w=1000",
    year: "2008",
    rating: "9.5",
    language: "English",
    category: "Drama",
    seasons: [
      {
        id: "bb-s1",
        number: 1,
        episodes: [
          { 
            id: "bb-e1", 
            number: 1, 
            title: "Pilot", 
            description: "Diagnosed with terminal lung cancer, chemistry teacher Walter White teams up with former student Jesse Pinkman to cook and sell crystal meth.",
            duration: "58m",
            driveLink: "https://drive.google.com/open?id=bb1" 
          },
          { 
            id: "bb-e2", 
            number: 2, 
            title: "Cat's in the Bag...", 
            description: "Walt and Jesse try to dispose of the two bodies in the RV, which becomes increasingly complicated.",
            duration: "48m",
            driveLink: "https://drive.google.com/open?id=bb2" 
          },
          { 
            id: "bb-e3", 
            number: 3, 
            title: "...And the Bag's in the River", 
            description: "Walt is forced to decide whether to kill Krazy-8 or let him go, while Marie suspects Junior is using marijuana.",
            duration: "48m",
            driveLink: "https://drive.google.com/open?id=bb3" 
          }
        ]
      }
    ]
  }
];

const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export const movieService = {
  getMovies: (): Movie[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOVIES));
        return INITIAL_MOVIES;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading from localStorage:", e);
      return [];
    }
  },

  addMovie: (movie: Omit<Movie, "id">): Movie => {
    const movies = movieService.getMovies();
    const newMovie: Movie = {
      ...movie,
      id: generateId()
    } as Movie;
    const updated = [...movies, newMovie];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newMovie;
  },

  toggleWatchlist: (id: string): void => {
    const movies = movieService.getMovies();
    const updated = movies.map(m => 
      m.id === id ? { ...m, isWatchlist: !m.isWatchlist } : m
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  updateMovie: (id: string, updates: Partial<Movie>): void => {
    const movies = movieService.getMovies();
    const updated = movies.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleFeatured: (id: string): void => {
    const movies = movieService.getMovies();
    const updated = movies.map(m => 
      m.id === id ? { ...m, isFeatured: !m.isFeatured } : m
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteMovie: (id: string): void => {
    const movies = movieService.getMovies();
    const updatedMovies = movies.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMovies));
    
    // Also cleanup from watchlist, history, and progress
    const profiles = movieService.getProfiles();
    profiles.forEach(p => {
      const progressKey = `${PROGRESS_KEY}_${p.id}`;
      const progress = JSON.parse(localStorage.getItem(progressKey) || "[]");
      localStorage.setItem(progressKey, JSON.stringify(progress.filter((pr: any) => pr.movieId !== id)));

      const historyKey = `${HISTORY_KEY}_${p.id}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
      localStorage.setItem(historyKey, JSON.stringify(history.filter((h: any) => h.movieId !== id)));
    });
  },

  // Profile Management
  getProfiles: (): Profile[] => {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (!stored) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(INITIAL_PROFILES));
      return INITIAL_PROFILES;
    }
    return JSON.parse(stored);
  },

  getActiveProfile: (): Profile | null => {
    const stored = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  },

  setActiveProfile: (profile: Profile): void => {
    localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
  },

  addProfile: (name: string, avatar: string, accentColor: string, isKids: boolean, pin?: string): Profile => {
    const profiles = movieService.getProfiles();
    const newProfile: Profile = {
      id: generateId(),
      name,
      avatar,
      accentColor,
      isKids,
      pin
    };
    const updated = [...profiles, newProfile];
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
    return newProfile;
  },

  updateProfile: (profile: Profile): void => {
    const profiles = movieService.getProfiles();
    const updated = profiles.map(p => p.id === profile.id ? profile : p);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
    
    const active = movieService.getActiveProfile();
    if (active && active.id === profile.id) {
      movieService.setActiveProfile(profile);
    }
  },

  deleteProfile: (id: string): void => {
    const profiles = movieService.getProfiles();
    const updated = profiles.filter(p => p.id !== id);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
    
    const active = movieService.getActiveProfile();
    if (active && active.id === id) {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  },

  // Progress and History
  saveProgress: (movieId: string, progress: number, duration: number): void => {
    const profile = movieService.getActiveProfile();
    if (!profile) return;

    const progressKey = `${PROGRESS_KEY}_${profile.id}`;
    const allProgress: WatchProgress[] = JSON.parse(localStorage.getItem(progressKey) || "[]");
    
    const existingIndex = allProgress.findIndex(p => p.movieId === movieId);
    const newEntry: WatchProgress = {
      movieId,
      progress,
      duration,
      lastUpdated: Date.now()
    };

    if (existingIndex > -1) {
      allProgress[existingIndex] = newEntry;
    } else {
      allProgress.push(newEntry);
    }

    localStorage.setItem(progressKey, JSON.stringify(allProgress));

    // Update History
    const historyKey = `${HISTORY_KEY}_${profile.id}`;
    const history: WatchHistoryEntry[] = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const historyEntry: WatchHistoryEntry = {
      movieId,
      timestamp: progress,
      lastWatched: Date.now()
    };

    const newHistory = [historyEntry, ...history.filter(h => h.movieId !== movieId)].slice(0, 20);
    localStorage.setItem(historyKey, JSON.stringify(newHistory));
  },

  getProgress: (movieId: string): WatchProgress | null => {
    const profile = movieService.getActiveProfile();
    if (!profile) return null;

    const progressKey = `${PROGRESS_KEY}_${profile.id}`;
    const allProgress: WatchProgress[] = JSON.parse(localStorage.getItem(progressKey) || "[]");
    return allProgress.find(p => p.movieId === movieId) || null;
  },

  getAllProgress: (): WatchProgress[] => {
    const profile = movieService.getActiveProfile();
    if (!profile) return [];

    const progressKey = `${PROGRESS_KEY}_${profile.id}`;
    return JSON.parse(localStorage.getItem(progressKey) || "[]");
  },

  getHistory: (): WatchHistoryEntry[] => {
    const profile = movieService.getActiveProfile();
    if (!profile) return [];

    const historyKey = `${HISTORY_KEY}_${profile.id}`;
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  },

  getRecommendedMovies: (): Movie[] => {
    const movies = movieService.getMovies();
    const history = movieService.getHistory();
    const historyIds = new Set(history.map(h => h.movieId));
    
    if (history.length === 0) {
      // Return high rated movies if no history
      return movies
        .filter(m => !historyIds.has(m.id))
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 10);
    }

    // Find most watched genres
    const watchedMovies = movies.filter(m => historyIds.has(m.id));
    const genreCounts: Record<string, number> = {};
    watchedMovies.forEach(m => {
      genreCounts[m.genre] = (genreCounts[m.genre] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0]);

    // Recommend movies in those genres
    const recommendations = movies.filter(m => 
      !historyIds.has(m.id) && topGenres.includes(m.genre)
    ).sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

    if (recommendations.length < 5) {
       // Fill with trending if low on recommendations
       const additional = movies
         .filter(m => !historyIds.has(m.id) && !recommendations.find(r => r.id === m.id))
         .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
       return [...recommendations, ...additional].slice(0, 10);
    }

    return recommendations.slice(0, 10);
  }
};
