import { Announcement } from "../types";

const STORAGE_KEY = "netflix_announcements";

export const notificationService = {
  getAnnouncements: (): Announcement[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  addAnnouncement: (announcement: Omit<Announcement, "id" | "timestamp">): void => {
    const announcements = notificationService.getAnnouncements();
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newAnnouncement, ...announcements]));
  },

  deleteAnnouncement: (id: string): void => {
    const announcements = notificationService.getAnnouncements();
    const updated = announcements.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  updateAnnouncement: (id: string, updates: Partial<Announcement>): void => {
    const announcements = notificationService.getAnnouncements();
    const updated = announcements.map(a => a.id === id ? { ...a, ...updates, timestamp: Date.now() } : a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  clearAll: (): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};
