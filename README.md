# 🎬 CineVerse AI

> **Netflix-grade AI-powered movie discovery platform** — built as a production-quality portfolio project.

A full-stack OTT-style application featuring intelligent recommendations, multilingual cinema support, sentiment analysis, and a cinematic dark-mode UI — powered by React, Node.js/Express, Python FastAPI, and the TMDB API.

---

## ✨ Feature Highlights

| Category | Features |
|---|---|
| 🎬 **Discovery** | Hero carousel, trending, top-rated, now-playing, upcoming |
| 🌍 **Languages** | Telugu, Hindi, Tamil, Malayalam, Kannada, Hollywood |
| 🎭 **Genres** | Action, Drama, Thriller, Romance, Horror, Sci-Fi + more |
| 🔍 **Smart Search** | Debounced search with quality filters (no albums/junk), suggestions dropdown |
| 🎞️ **Movie Detail** | Cinematic backdrop hero, trailers, full cast, reviews, director panel |
| 🤖 **AI Engine** | TF-IDF recommendations → "More Like This" powered by ML |
| 📊 **Sentiment** | AI-powered review sentiment analysis via FastAPI |
| 🔖 **Watchlist** | localStorage-backed save/remove with animated count badge |
| 🎭 **Actor Profiles** | Actor modal with filmography on any cast member click |
| ⚡ **Performance** | Code-split lazy routes, React Query cache, image shimmer loading |
| 🛡️ **Resilience** | React Error Boundaries, TMDB retry logic, graceful degradation |

---

## 🏗️ Architecture

```
CineVerse-AI/
├── frontend/          # React + Vite + TailwindCSS + Framer Motion
│   ├── src/
│   │   ├── pages/     # Home, Browse, Search, MovieDetail, Watchlist, NotFound
│   │   ├── components/# Navbar, MovieCard, HeroCarousel, MovieRow, TrailerModal, ActorModal…
│   │   ├── hooks/     # useWatchlist, useDebounce
│   │   └── services/  # api.js (Axios + interceptors)
│   └── tailwind.config.js
│
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── routes/    # movies, search, discover, trending, actors, recommendations
│   │   ├── services/  # tmdb.js (cached fetch + retry)
│   │   └── app.js     # CORS, Helmet, Morgan, rate-limit
│   └── server.js
│
└── ai-engine/         # Python FastAPI
    ├── main.py        # FastAPI app + endpoints
    ├── recommender.py # TF-IDF recommendation engine
    └── models/        # Cached TF-IDF matrix (auto-generated)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- TMDB API key → [Get one free](https://www.themoviedb.org/settings/api)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/CineVerse-AI.git
cd CineVerse-AI

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..

# Install AI engine deps
cd ai-engine && pip install -r requirements.txt && cd ..
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# → Add your TMDB_API_KEY

# Frontend
cp frontend/.env.example frontend/.env
# → VITE_API_URL is already set to http://localhost:5000/api

# AI Engine
cp ai-engine/.env.example ai-engine/.env
# → Add your TMDB_API_KEY
```

### 3. Start All Services

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

**Terminal 3 — AI Engine (optional):**
```bash
cd ai-engine
uvicorn main:app --reload --port 8000
# First run: ~2 min to build TF-IDF matrix
# → http://localhost:8000
```

---

## 📡 API Reference

### Backend (`http://localhost:5000/api`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/trending/hero` | Hero carousel movies |
| GET | `/discover/home-sections` | All homepage sections (1 call) |
| GET | `/discover/language/:lang` | Movies by language |
| GET | `/discover/genre/:genre` | Movies by genre |
| GET | `/discover/top-rated` | Top rated movies |
| GET | `/discover/now-playing` | Now playing |
| GET | `/discover/upcoming` | Upcoming releases |
| GET | `/search?q=&page=` | Multi-search (quality filtered) |
| GET | `/search/suggestions?q=` | Autocomplete suggestions |
| GET | `/movies/:id` | Full movie details + cast + trailers |
| GET | `/movies/:id/recommendations` | TMDB recommendations |
| GET | `/actors/search?q=` | Actor search |
| GET | `/actors/:id` | Actor profile + credits |
| GET | `/recommendations/:id` | AI recommendations |

### AI Engine (`http://localhost:8000`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/recommendations/{movie_id}` | TF-IDF recommendations |
| POST | `/recommendations/by-title` | Recommend by title string |
| GET | `/sentiment/movie/{movie_id}` | Review sentiment analysis |

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
# Set VITE_API_URL to your Railway/Render backend URL
```

### Backend → Railway / Render

```bash
# Set environment variables in dashboard:
TMDB_API_KEY=your_key
NODE_ENV=production
PORT=5000
```

### AI Engine → Railway / Render

```bash
# Start command:
uvicorn main:app --host 0.0.0.0 --port $PORT
# Set TMDB_API_KEY in dashboard
```

---

## 🔧 Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| React 18 + Vite | Core framework + fast HMR build |
| TailwindCSS | Utility-first styling |
| Framer Motion | Smooth animations |
| React Query | Server-state caching + auto-refetch |
| React Router v6 | Client-side routing |
| Axios | HTTP with interceptors |
| React Hot Toast | Toast notifications |
| React Helmet Async | SEO meta tags |
| React Icons | Icon library |

### Backend
| Library | Purpose |
|---|---|
| Express.js | HTTP server + routing |
| Axios | TMDB API client |
| node-cache | In-memory API response cache |
| helmet | Security headers |
| cors | Cross-origin resource sharing |
| express-rate-limit | Request rate limiting |
| morgan | HTTP request logging |

### AI Engine
| Library | Purpose |
|---|---|
| FastAPI | Python async HTTP framework |
| scikit-learn | TF-IDF vectorizer |
| pandas | Data manipulation |
| requests | TMDB API client |
| joblib | Model persistence |

---

## 📁 Key Files

| File | Purpose |
|---|---|
| `backend/src/services/tmdb.js` | Cached TMDB fetch with retry + graceful degradation |
| `backend/src/routes/discover.js` | All content discovery endpoints |
| `backend/src/app.js` | Express app: CORS, security, rate limiting |
| `frontend/src/services/api.js` | Axios instance with interceptors + helper functions |
| `frontend/src/hooks/useWatchlist.js` | localStorage watchlist with toast notifications |
| `frontend/src/pages/MovieDetail.jsx` | Cinematic movie page with tabs, cast, trailers |
| `ai-engine/recommender.py` | TF-IDF recommendation engine |

---

## 🎯 Roadmap

- [ ] Google OAuth + JWT authentication
- [ ] PostgreSQL database for persistent watchlists
- [ ] Redis caching layer (replace node-cache)
- [ ] TMDB request queue with p-limit (rate limit management)
- [ ] TV show detail page (`/tv/:id`)
- [ ] User reviews and ratings
- [ ] PWA support (offline mode)
- [ ] Admin dashboard

---

## 📜 License

MIT — free to use for personal projects and portfolios.

---

<p align="center">Built with ❤️ using React · Node.js · FastAPI · TMDB</p>
