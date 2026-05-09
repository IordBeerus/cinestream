import { Announcement } from "../types";

const STORAGE_KEY = "netflix_announcements";

export const notificationService = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const response = await fetch("/api/announcements");
      if (!response.ok) throw new Error("Failed to fetch announcements");
      return await response.json();
    } catch (e) {
      console.error("Error fetching announcements:", e);
      return [];
    }
  },

  addAnnouncement: async (announcement: Omit<Announcement, "id" | "timestamp">): Promise<void> => {
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(announcement)
    });
    if (!response.ok) throw new Error("Failed to add announcement");
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    const response = await fetch(`/api/announcements/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Failed to delete announcement");
  },

  updateAnnouncement: async (id: string, updates: Partial<Announcement>): Promise<void> => {
    const response = await fetch(`/api/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error("Failed to update announcement");
  },

  clearAll: (): void => {
    // This is less common for shared announcements, maybe just ignore or implement if needed
    console.warn("clearAll not implemented for shared announcements");
  }
};
