import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared state in memory (resets on restart)
  let sharedMovies = [
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
            { id: "e1", number: 1, title: "Cruelty", description: "Tanjirou Kamado is a kindhearted and intelligent boy who lives with his family.", duration: "24m", driveLink: "https://drive.google.com/open?id=demon1" },
            { id: "e2", number: 2, title: "Trainer Sakonji Urokodaki", description: "Tanjirou and Nezuko head for Mt. Sagiri.", duration: "24m", driveLink: "https://drive.google.com/open?id=demon2" }
          ]
        }
      ]
    }
  ];

  // API Routes
  app.get("/api/movies", (req, res) => {
    res.json(sharedMovies);
  });

  app.post("/api/movies", (req, res) => {
    const newMovie = {
      ...req.body,
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
    };
    sharedMovies.push(newMovie);
    res.status(201).json(newMovie);
  });

  app.put("/api/movies/:id", (req, res) => {
    const { id } = req.params;
    sharedMovies = sharedMovies.map(m => m.id === id ? { ...m, ...req.body } : m);
    res.json({ success: true });
  });

  app.delete("/api/movies/:id", (req, res) => {
    const { id } = req.params;
    sharedMovies = sharedMovies.filter(m => m.id !== id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
