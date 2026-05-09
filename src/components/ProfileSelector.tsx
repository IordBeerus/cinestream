/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, X, Check, Trash2, User, Upload, Palette, Lock, Shield } from "lucide-react";
import React, { useState, useRef } from "react";
import { movieService } from "../movieService";

interface ProfileSelectorProps {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
  onRefresh: () => void;
}

const ACCENT_COLORS = [
  "#e50914", // Netflix Red
  "#2ecc71", // Green
  "#3498db", // Blue
  "#f1c40f", // Yellow
  "#9b59b6", // Purple
  "#e67e22", // Orange
  "#1abc9c", // Teal
];

export default function ProfileSelector({ profiles, onSelect, onRefresh }: ProfileSelectorProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [newColor, setNewColor] = useState(ACCENT_COLORS[0]);
  const [newPin, setNewPin] = useState("");
  const [isKids, setIsKids] = useState(false);
  
  const [showPinEntry, setShowPinEntry] = useState<Profile | null>(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit && editingProfile) {
          setEditingProfile({ ...editingProfile, avatar: base64String });
        } else {
          setNewAvatar(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const avatar = newAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newName)}`;
    movieService.addProfile(newName, avatar, newColor, isKids, newPin || undefined);
    setNewName("");
    setNewAvatar("");
    setNewPin("");
    setIsKids(false);
    setIsAdding(false);
    onRefresh();
  };

  const handleUpdate = () => {
    if (!editingProfile || !editingProfile.name.trim()) return;
    movieService.updateProfile(editingProfile);
    setEditingProfile(null);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    movieService.deleteProfile(id);
    setShowDeleteConfirm(null);
    setEditingProfile(null);
    onRefresh();
  };

  const handleProfileSelect = (profile: Profile) => {
    if (profile.pin) {
      setShowPinEntry(profile);
      setEnteredPin("");
      setPinError(false);
    } else {
      onSelect(profile);
    }
  };

  const handlePinSubmit = () => {
    if (showPinEntry && enteredPin === showPinEntry.pin) {
      onSelect(showPinEntry);
      setShowPinEntry(null);
    } else {
      setPinError(true);
      setEnteredPin("");
      setTimeout(() => setPinError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center overflow-y-auto py-20">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white text-3xl md:text-5xl font-medium mb-8"
      >
        {isManaging ? "Manage Profiles:" : "Who's watching?"}
      </motion.h1>
      
      <div className="flex flex-wrap items-center justify-center gap-8 px-4 max-w-6xl">
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group flex flex-col items-center gap-4 relative"
          >
            <div 
              onClick={() => isManaging ? setEditingProfile(profile) : handleProfileSelect(profile)}
              className="w-32 h-32 md:w-44 md:h-44 rounded-md overflow-hidden border-4 border-transparent transition-all relative cursor-pointer"
              style={{ borderColor: !isManaging && profile.id ? 'transparent' : 'transparent' }}
            >
              <div 
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                style={{ background: `linear-gradient(to top, ${profile.accentColor || '#e50914'}, transparent)` }}
              />
              <img src={profile.avatar} className="w-full h-full object-cover relative z-10" alt={profile.name} />
              {isManaging && (
                <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                  <Edit2 size={40} className="text-white" />
                </div>
              )}
              {profile.pin && !isManaging && (
                <div className="absolute top-2 right-2 z-20">
                  <Lock size={16} className="text-white/50" />
                </div>
              )}
              {profile.isKids && (
                <div className="absolute bottom-2 left-2 z-20 bg-netflix-red text-[8px] font-black px-1 rounded">
                  KIDS
                </div>
              )}
            </div>
            <span 
              className="text-gray-400 text-xl group-hover:text-white transition-colors"
              style={{ color: !isManaging ? undefined : undefined }}
            >
              {profile.name}
            </span>
          </motion.div>
        ))}
        
        {!isManaging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: profiles.length * 0.1 }}
            onClick={() => setIsAdding(true)}
            className="group flex flex-col items-center gap-4 cursor-pointer"
          >
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-md flex items-center justify-center bg-transparent group-hover:bg-gray-400 transition-colors">
              <Plus size={80} className="text-gray-500 group-hover:text-black transition-colors" />
            </div>
            <span className="text-gray-400 text-xl group-hover:text-white transition-colors">Add Profile</span>
          </motion.div>
        )}
      </div>

      <button 
        onClick={() => setIsManaging(!isManaging)}
        className={`mt-16 border px-8 py-2 text-xl transition-all uppercase tracking-widest ${
          isManaging 
          ? "bg-white border-white text-black font-bold hover:bg-gray-200" 
          : "border-gray-500 text-gray-500 hover:border-white hover:text-white"
        }`}
      >
        {isManaging ? "Done" : "Manage Profiles"}
      </button>

      {/* PIN Entry Modal */}
      <AnimatePresence>
        {showPinEntry && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[250] flex items-center justify-center p-4"
          >
            <div className="text-center space-y-8 max-w-sm w-full">
              <h2 className="text-3xl font-bold">Profile Lock is on.</h2>
              <p className="text-gray-400">Enter your PIN to access this profile.</p>
              
              <div className={`flex justify-center gap-4 ${pinError ? 'animate-shake' : ''}`}>
                <input 
                  type="password"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setEnteredPin(val);
                    if (val.length === 4 && val === showPinEntry.pin) {
                      onSelect(showPinEntry);
                      setShowPinEntry(null);
                    } else if (val.length === 4) {
                      setPinError(true);
                      setEnteredPin("");
                      setTimeout(() => setPinError(false), 500);
                    }
                  }}
                  autoFocus
                  className="bg-transparent border-b-2 border-gray-600 text-4xl w-32 text-center py-2 focus:border-white outline-none tracking-widest"
                />
              </div>

              <button 
                onClick={() => setShowPinEntry(null)}
                className="text-gray-500 hover:text-white transition uppercase tracking-widest text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editingProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[210] flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-2xl bg-[#181818] p-8 rounded-xl border border-white/10 shadow-[0_25px_100px_rgba(0,0,0,0.9)] my-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <button onClick={() => setEditingProfile(null)} className="p-2 hover:bg-white/5 rounded-full transition">
                  <X />
                </button>
              </div>

              <div className="grid md:grid-cols-[200px_1fr] gap-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-md overflow-hidden relative group">
                    <img src={editingProfile.avatar} className="w-full h-full object-cover" alt="" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
                    >
                      <Upload size={24} />
                      <span className="text-[10px] font-bold uppercase">Change</span>
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Custom image supported</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Profile Name</label>
                    <input
                      type="text"
                      value={editingProfile.name}
                      onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-gray-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                      <Palette size={12} className="text-gray-500" /> Accent Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ACCENT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditingProfile({...editingProfile, accentColor: color})}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${editingProfile.accentColor === color ? 'border-white scale-125' : 'border-transparent opacity-50 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                        <Lock size={12} /> PIN Lock
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="4 digits"
                        value={editingProfile.pin || ""}
                        onChange={(e) => setEditingProfile({...editingProfile, pin: e.target.value.replace(/\D/g, '')})}
                        className="w-full bg-black/40 border border-white/10 rounded-sm px-4 py-2 text-sm focus:border-gray-500 outline-none transition"
                      />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                          <Shield size={12} /> Account Type
                        </label>
                        <button 
                          onClick={() => setEditingProfile({...editingProfile, isKids: !editingProfile.isKids})}
                          className={`w-full py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${editingProfile.isKids ? 'bg-netflix-red border-netflix-red text-white' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                        >
                          {editingProfile.isKids ? 'Kids Profile' : 'Standard Profile'}
                        </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={handleUpdate}
                      className="flex-1 bg-white text-black py-4 rounded-sm font-bold uppercase text-xs tracking-[0.2em] hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Save Changes
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(editingProfile.id)}
                      className="px-6 border border-white/10 text-gray-500 py-4 rounded-sm font-bold uppercase text-xs tracking-widest hover:border-red-500 hover:text-red-500 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4"
          >
            <div className="text-center space-y-8 max-w-md w-full">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-3xl font-bold">Delete Profile?</h2>
              <p className="text-gray-400">This will permanently remove this profile's watch history and my list. This action cannot be undone.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="w-full bg-red-600 text-white py-4 rounded-sm font-black uppercase text-xs tracking-[0.3em] hover:bg-red-700 transition shadow-xl"
                >
                  Delete Profile
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="w-full bg-transparent text-gray-500 py-4 rounded-sm font-bold uppercase text-[10px] tracking-widest hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[210] flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-2xl bg-[#181818] p-8 rounded-xl border border-white/10 shadow-[0_25px_100px_rgba(0,0,0,0.9)] my-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Add Profile</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full transition">
                  <X />
                </button>
              </div>

              <div className="grid md:grid-cols-[200px_1fr] gap-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-md overflow-hidden bg-white/5 border border-dashed border-white/20 flex items-center justify-center relative group">
                    {newAvatar || newName ? (
                      <img 
                        src={newAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newName)}`} 
                        className="w-full h-full object-cover" 
                        alt="" 
                      />
                    ) : (
                      <User size={60} className="text-gray-800" />
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
                    >
                      <Upload size={24} />
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, false)}
                  />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Auto-suggested or upload</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Profile Name</label>
                    <input
                      autoFocus
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. My Profile"
                      className="w-full bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-gray-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                      <Palette size={12} className="text-gray-500" /> Accent Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ACCENT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newColor === color ? 'border-white scale-125' : 'border-transparent opacity-50 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                        <Lock size={12} /> PIN Lock (Optional)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="4 digits"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-black/40 border border-white/10 rounded-sm px-4 py-2 text-sm focus:border-gray-500 outline-none transition"
                      />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                          <Shield size={12} /> Account Type
                        </label>
                        <button 
                          onClick={() => setIsKids(!isKids)}
                          className={`w-full py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${isKids ? 'bg-netflix-red border-netflix-red text-white' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                        >
                          {isKids ? 'Kids Profile' : 'Standard Profile'}
                        </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="w-full bg-white text-black py-4 rounded-sm font-bold uppercase text-xs tracking-[0.3em] hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus size={16} /> Create Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

