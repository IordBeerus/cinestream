/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Episode {
  id: string;
  number: number;
  title: string;
  description?: string;
  duration?: string;
  thumbnailUrl?: string;
  driveLink: string;
}

export interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

export interface Movie {
  id: string;
  type: "movie" | "tv";
  title: string;
  description: string;
  genre: string;
  driveLink?: string;
  thumbnailUrl: string;
  year: string;
  rating: string;
  duration?: string;
  language?: string;
  category: "Trending Now" | "New Releases" | "Anime" | "Action" | "Drama" | "Comedy" | "Sci-Fi" | "Others";
  seasons?: Season[];
  trailerUrl?: string;
  isWatchlist?: boolean;
  isFeatured?: boolean;
}

export type SortOption = "title" | "year" | "rating";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: "info" | "update" | "alert";
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  accentColor?: string;
  pin?: string;
  isKids?: boolean;
}

export interface WatchHistoryEntry {
  movieId: string;
  timestamp: number;
  lastWatched: number; // Date.now()
}

export interface WatchProgress {
  movieId: string;
  progress: number; // percentage or seconds
  duration: number; // total seconds
  lastUpdated: number;
}

export const GENRES = [
  "Action", 
  "Adventure",
  "Animation",
  "Anime", 
  "Biography",
  "Comedy", 
  "Crime",
  "Documentary", 
  "Drama", 
  "Family",
  "Fantasy",
  "Film-Noir",
  "History",
  "Horror", 
  "Kids",
  "Legal",
  "Music",
  "Musical",
  "Mystery",
  "News",
  "Political",
  "Psychological",
  "Reality-TV",
  "Romance", 
  "Sci-Fi", 
  "Short",
  "Slasher",
  "Sport",
  "Superhero",
  "Supernatural",
  "Talk-Show",
  "Thriller", 
  "War", 
  "Western"
];

export const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Malayalam",
  "Kannada",
  "Korean",
  "Japanese",
  "Spanish",
  "French",
  "Mandarin"
];

export const YEARS = Array.from({ length: 77 }, (_, i) => (2026 - i).toString());

export const CATEGORIES = ["Trending Now", "New Releases", "Anime", "Action", "Drama", "Comedy", "Sci-Fi", "Others"] as const;
