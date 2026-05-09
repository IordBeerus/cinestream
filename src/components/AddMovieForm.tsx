/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Plus, Trash2, ChevronRight, ChevronDown, Play, Bell, Film, Upload, Image as ImageIcon } from "lucide-react";
import { useState, FormEvent, useEffect, useRef, ChangeEvent } from "react";
import { Movie, GENRES, CATEGORIES, Season, Episode, Announcement, LANGUAGES } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { notificationService } from "../services/notificationService";
import { movieService } from "../movieService";

interface AddMovieFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (movie: Omit<Movie, "id">) => Promise<void>;
  movieToEdit?: Movie | null;
  announcementToEdit?: Announcement | null;
  onUpdateMovie?: (id: string, updates: Partial<Movie>) => Promise<void>;
  onUpdateAnnouncement?: (id: string, updates: Partial<Announcement>) => Promise<void>;
  onDelete?: () => void;
}

export default function AddMovieForm({ 
  isOpen, 
  onClose, 
  onAdd, 
  movieToEdit, 
  announcementToEdit,
  onUpdateMovie,
  onUpdateAnnouncement,
  onDelete
}: AddMovieFormProps) {
  const [formType, setFormType] = useState<"movie" | "announcement">("movie");
  const [formData, setFormData] = useState({
    type: "movie" as "movie" | "tv",
    title: "",
    description: "",
    genre: GENRES[0],
    language: LANGUAGES[0],
    driveLink: "",
    thumbnailUrl: "",
    year: new Date().getFullYear().toString(),
    rating: "8.0",
    duration: "2h 00m",
    category: CATEGORIES[0],
    isFeatured: false,
  });

  const [announcementData, setAnnouncementData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "update" | "alert"
  });

  const [seasons, setSeasons] = useState<Season[]>([]);

  const handleDelete = async () => {
    try {
      if (movieToEdit) {
        if (window.confirm(`Are you sure you want to delete "${movieToEdit.title}"?`)) {
          await movieService.deleteMovie(movieToEdit.id);
          if (onDelete) onDelete();
          onClose();
        }
      } else if (announcementToEdit) {
        if (window.confirm(`Are you sure you want to delete this announcement?`)) {
          notificationService.deleteAnnouncement(announcementToEdit.id);
          if (onDelete) onDelete();
          onClose();
        }
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  useEffect(() => {
    if (movieToEdit) {
      setFormType("movie");
      setFormData({
        type: movieToEdit.type,
        title: movieToEdit.title,
        description: movieToEdit.description,
        genre: movieToEdit.genre,
        language: movieToEdit.language || LANGUAGES[0],
        driveLink: movieToEdit.driveLink || "",
        thumbnailUrl: movieToEdit.thumbnailUrl,
        year: movieToEdit.year,
        rating: movieToEdit.rating,
        duration: movieToEdit.duration || "1h 30m",
        category: movieToEdit.category,
        isFeatured: movieToEdit.isFeatured || false,
        trailerUrl: movieToEdit.trailerUrl || "",
      });
      setSeasons(movieToEdit.seasons || []);
    } else if (announcementToEdit) {
      setFormType("announcement");
      setAnnouncementData({
        title: announcementToEdit.title,
        message: announcementToEdit.message,
        type: announcementToEdit.type
      });
    } else {
      resetForm();
    }
  }, [movieToEdit, announcementToEdit, isOpen]);

  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  // Auto-detect TV Show
  useEffect(() => {
    const isTV = /season|episode|s\d\de\d\d/i.test(formData.title) || /season|episode|s\d\de\d\d/i.test(formData.driveLink);
    if (isTV && formData.type === 'movie') {
      setFormData(prev => ({ ...prev, type: 'tv' }));
      if (seasons.length === 0) {
        addSeason();
      }
    }
  }, [formData.title, formData.driveLink]);

  const generateId = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  };

  const addSeason = () => {
    const nextNumber = seasons.length + 1;
    setSeasons([...seasons, { id: generateId(), number: nextNumber, episodes: [] }]);
    setExpandedSeason(nextNumber);
  };

  const addEpisode = (seasonId: string) => {
    setSeasons(seasons.map(s => {
      if (s.id === seasonId) {
        return {
          ...s,
          episodes: [
            ...s.episodes,
            { id: generateId(), number: s.episodes.length + 1, title: `Episode ${s.episodes.length + 1}`, driveLink: "" }
          ]
        };
      }
      return s;
    }));
  };

  const updateEpisode = (seasonId: string, episodeId: string, updates: Partial<Episode>) => {
    setSeasons(seasons.map(s => {
      if (s.id === seasonId) {
        return {
          ...s,
          episodes: s.episodes.map(e => e.id === episodeId ? { ...e, ...updates } : e)
        };
      }
      return s;
    }));
  };

  const removeEpisode = (seasonId: string, episodeId: string) => {
    setSeasons(seasons.map(s => {
      if (s.id === seasonId) {
        return {
          ...s,
          episodes: s.episodes.filter(e => e.id !== episodeId).map((e, index) => ({ ...e, number: index + 1 }))
        };
      }
      return s;
    }));
  };

  const removeSeason = (seasonId: string) => {
    setSeasons(seasons.filter(s => s.id !== seasonId).map((s, index) => ({ ...s, number: index + 1 })));
  };

  const handleAddAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    if (!announcementData.title.trim() || !announcementData.message.trim()) return;
    
    try {
      if (announcementToEdit && onUpdateAnnouncement) {
        await onUpdateAnnouncement(announcementToEdit.id, announcementData);
      } else {
        await notificationService.addAnnouncement(announcementData);
      }
      
      setAnnouncementData({ title: "", message: "", type: "info" });
      onClose();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Failed to save announcement.");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please select an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, thumbnailUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    if (formType === 'announcement') {
      return handleAddAnnouncement(e);
    }
    e.preventDefault();
    const movieData: any = { ...formData };
    if (formData.type === 'tv') {
      movieData.seasons = seasons;
      if (!movieData.duration && seasons.length > 0) {
        movieData.duration = `${seasons.length} Season${seasons.length > 1 ? 's' : ''}`;
      }
      if (!movieData.driveLink && seasons[0]?.episodes[0]?.driveLink) {
        movieData.driveLink = seasons[0].episodes[0].driveLink;
      }
    }

    try {
      if (movieToEdit && onUpdateMovie) {
        await onUpdateMovie(movieToEdit.id, movieData);
      } else {
        await onAdd(movieData as Omit<Movie, "id">);
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while saving. Please check the console for details.");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "movie",
      title: "",
      description: "",
      genre: GENRES[0],
      language: LANGUAGES[0],
      driveLink: "",
      thumbnailUrl: "",
      year: new Date().getFullYear().toString(),
      rating: "8.0",
      duration: "2h 00m",
      category: CATEGORIES[0],
      isFeatured: false
    });
    setSeasons([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#181818] rounded-xl z-[101] p-8 max-h-[90vh] overflow-y-auto border border-white/10 shadow-[0_25px_100px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                  {formType === 'announcement' 
                    ? (announcementToEdit ? 'Edit Announcement' : 'Add Announcement') 
                    : (movieToEdit ? `Edit ${formData.type === 'tv' ? 'Series' : 'Movie'}` : `Add ${formData.type === 'tv' ? 'Series' : 'Movie'}`)}
                </h2>
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-1">
                  {formType === 'announcement' ? 'Broadcast to all users' : (movieToEdit ? 'Update details' : 'Direct Drive Import')}
                </p>
              </div>
              <div className="flex gap-2">
                {!movieToEdit && !announcementToEdit && (
                  <div className="flex p-1 bg-black/40 rounded-lg w-fit border border-white/5">
                    <button
                      type="button"
                      onClick={() => setFormType('movie')}
                      className={`p-2 rounded-md transition ${formType === 'movie' ? 'bg-netflix-red text-white' : 'text-gray-500 hover:text-gray-300'}`}
                      title="Add Media"
                    >
                      <Film size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('announcement')}
                      className={`p-2 rounded-md transition ${formType === 'announcement' ? 'bg-netflix-red text-white' : 'text-gray-500 hover:text-gray-300'}`}
                      title="Add Announcement"
                    >
                      <Bell size={18} />
                    </button>
                  </div>
                )}
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition border border-white/5">
                  <X size={20} />
                </button>
              </div>
            </div>

            {(movieToEdit || announcementToEdit) && (
              <div className="mb-6 flex justify-end">
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition"
                >
                  <Trash2 size={14} />
                  Delete {movieToEdit ? (movieToEdit.type === 'tv' ? 'Series' : 'Movie') : 'Announcement'}
                </button>
              </div>
            )}

            {formType === 'announcement' ? (
              <form onSubmit={handleAddAnnouncement} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["info", "update", "alert"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAnnouncementData({ ...announcementData, type: type as any })}
                        className={`py-2 rounded border text-[10px] font-black uppercase tracking-widest transition ${announcementData.type === type ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                  <input
                    type="text"
                    required
                    value={announcementData.title}
                    onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded px-4 py-3 text-sm focus:outline-none focus:border-netflix-red transition"
                    placeholder="e.g. New Anime Season Added!"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Message</label>
                  <textarea
                    required
                    value={announcementData.message}
                    onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                    rows={4}
                    className="w-full bg-black/20 border border-white/10 rounded px-4 py-3 text-sm focus:outline-none focus:border-netflix-red transition resize-none"
                    placeholder="Describe the update..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-netflix-red text-white py-4 rounded font-black uppercase tracking-widest hover:bg-[#ff0000] transition active:scale-[0.98]"
                >
                  {announcementToEdit ? 'Update Announcement' : 'Post Announcement'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              {!movieToEdit && (
                <div className="flex p-1 bg-black/40 rounded-lg w-fit border border-white/5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'movie' })}
                    className={`px-6 py-2 rounded-md text-xs font-black uppercase tracking-widest transition ${formData.type === 'movie' ? 'bg-netflix-red text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Movie
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type: 'tv' });
                      if (seasons.length === 0) addSeason();
                    }}
                    className={`px-6 py-2 rounded-md text-xs font-black uppercase tracking-widest transition ${formData.type === 'tv' ? 'bg-netflix-red text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    TV Series
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition"
                      placeholder={formData.type === 'tv' ? "Series Title" : "Movie Title"}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition resize-none"
                      placeholder="Brief summary..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Genre</label>
                      <select
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition appearance-none"
                      >
                        {GENRES.map(g => <option key={g} value={g} className="bg-netflix-black">{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Language</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition appearance-none"
                      >
                        {LANGUAGES.map(l => <option key={l} value={l} className="bg-netflix-black">{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Year</label>
                      <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition"
                        placeholder="e.g. 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Rating (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition appearance-none"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-netflix-black">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Duration / Seasons</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition"
                        placeholder={formData.type === 'tv' ? "e.g. 3 Seasons" : "e.g. 1h 45m"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Trailer URL (YouTube/Vimeo Embed)</label>
                    <input
                      type="url"
                      value={formData.trailerUrl || ""}
                      onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition font-mono"
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Thumbnail</label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-[10px] font-black text-netflix-red hover:text-white transition uppercase tracking-widest"
                      >
                        <Upload size={12} />
                        Upload File
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <input
                      required
                      type="text"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition font-mono"
                      placeholder="Paste URL or upload a file..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer group w-fit">
                      <div className={`w-10 h-5 rounded-full transition-colors relative border border-white/10 ${formData.isFeatured ? 'bg-netflix-red' : 'bg-black/40'}`}>
                        <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${formData.isFeatured ? 'left-5.5' : 'left-1'}`} />
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition">Feature on Hero Section</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                      {formData.type === 'tv' ? 'Main Series Link / Trailer' : 'Google Drive Link'}
                    </label>
                    <input
                      required={formData.type === 'movie'}
                      type="url"
                      value={formData.driveLink}
                      onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-netflix-red outline-none transition font-mono"
                      placeholder="https://drive.google.com/..."
                    />
                    {formData.type === 'tv' && (
                      <p className="text-[9px] text-gray-600 mt-1 uppercase font-bold tracking-widest italic leading-tight">
                        Episodes should have their own links below. This link is for the overview or trailer.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.type === 'tv' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-black/20 p-4 rounded-lg border border-white/5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Season Management</label>
                        <button
                          type="button"
                          onClick={addSeason}
                          className="flex items-center gap-1.5 text-[10px] font-black text-netflix-red hover:text-white transition uppercase tracking-widest"
                        >
                          <Plus size={14} />
                          Add Season
                        </button>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {seasons.map((season) => (
                          <div key={season.id} className="border border-white/5 rounded-lg overflow-hidden bg-black/20">
                            <div 
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                              onClick={() => setExpandedSeason(expandedSeason === season.number ? null : season.number)}
                            >
                              <div className="flex items-center gap-2">
                                {expandedSeason === season.number ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <span className="text-xs font-black uppercase tracking-widest">Season {season.number}</span>
                                <span className="text-[10px] text-gray-500">({season.episodes.length} Episodes)</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeSeason(season.id); }}
                                className="text-gray-600 hover:text-netflix-red transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {expandedSeason === season.number && (
                              <div className="p-3 pt-0 space-y-3 border-t border-white/5 bg-black/10">
                                {season.episodes.map((episode) => (
                                  <div key={episode.id} className="space-y-2 p-3 bg-white/5 rounded border border-white/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ep {episode.number}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeEpisode(season.id, episode.id)}
                                        className="text-gray-600 hover:text-netflix-red transition"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={episode.title}
                                      onChange={(e) => updateEpisode(season.id, episode.id, { title: e.target.value })}
                                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs focus:border-netflix-red outline-none"
                                      placeholder="Episode Title"
                                    />
                                    <input
                                      required
                                      type="url"
                                      value={episode.driveLink}
                                      onChange={(e) => updateEpisode(season.id, episode.id, { driveLink: e.target.value })}
                                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs focus:border-netflix-red outline-none font-mono"
                                      placeholder="Drive Link"
                                    />
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addEpisode(season.id)}
                                  className="w-full py-2 border border-dashed border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/20 transition"
                                >
                                  + Add Episode
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 h-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-netflix-red/10 rounded-full flex items-center justify-center border border-netflix-red/10">
                         <Play size={24} className="text-netflix-red ml-1" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-widest">Single Video Mode</h4>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Perfect for movies, documentaries, or stand-up specials.</p>
                      </div>
                      {formData.thumbnailUrl && (
                        <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/10 mt-4">
                          <img src={formData.thumbnailUrl} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-netflix-red text-white py-4 rounded-lg font-black uppercase tracking-widest text-sm hover:brightness-110 transition shadow-xl shadow-netflix-red/20 active:scale-[0.98]"
              >
                {movieToEdit ? 'Update Details' : (formData.type === 'tv' ? 'Import Series with Collection' : 'Import Movie to Library')}
              </button>
            </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
