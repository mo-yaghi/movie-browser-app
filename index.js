const bg = document.getElementById("bg");
const stateEl = document.getElementById("state");
const titleEl = document.getElementById("title");
const metaEl = document.getElementById("meta");
const descEl = document.getElementById("description");
const moviesEl = document.getElementById("movies");
const searchInput = document.getElementById("searchInput");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let movies = [];
let selectedIndex = 0;

function getMovieTitle(movie) {
    return (
        movie?.titleText?.text ||
        movie?.primaryTitle ||
        movie?.title ||
        movie?.name ||
        "Untitled"
    );
}

function getYear(movie) {
    return (
        movie?.releaseYear?.year || movie?.startYear || movie?.year || "N/A"
    );
}

function getRating(movie) {
    const rating = movie?.ratingsSummary?.aggregateRating ?? movie?.rating;
    return rating ? Number(rating).toFixed(1) : "N/A";
}

function getRuntime(movie) {
    const seconds = movie?.runtime?.seconds ?? movie?.runtimeSeconds;
    if (!seconds) return "N/A";
    const mins = Math.round(Number(seconds) / 60);
    return `${mins} min`;
}

function getGenres(movie) {
    const genres =
        movie?.titleGenres?.genres
            ?.map((g) => g?.genre?.text)
            .filter(Boolean) ||
        movie?.genres ||
        movie?.genre ||
        [];
    if (Array.isArray(genres)) {
        return genres.length ? genres.join(", ") : "N/A";
    }
    return String(genres) || "N/A";
}

function getPoster(movie) {
    return (
        movie?.primaryImage?.url ||
        movie?.poster?.url ||
        movie?.image?.url ||
        ""
    );
}

function getDescription(movie) {
    return (
        movie?.plot?.plotText?.plainText ||
        movie?.description ||
        "Movie description here."
    );
}

function normalizeMovie(item) {
    return item || {};
}

function setStatus(type, message = "") {
    stateEl.className = type;
    stateEl.textContent = message;
}

function renderDetails(movie) {
    if (!movie) return;
    titleEl.textContent = getMovieTitle(movie);
    metaEl.innerHTML = `
        <span class="imdb-pill">IMDb <small>${getRating(movie)}</small></span>
        <span class="dot">•</span>
        <span>${getYear(movie)}</span>
        <span class="dot">•</span>
        <span>${getRuntime(movie)}</span>
        <span class="dot">•</span>
        <span>${getGenres(movie)}</span>
      `;
    descEl.textContent = getDescription(movie);
    const poster = getPoster(movie);
    if (poster) {
        bg.style.backgroundImage = `url("${poster}")`;
    } else {
        bg.style.backgroundImage = "linear-gradient(135deg, #111, #222)";
    }
}


function updateActiveCard() {
    document.querySelectorAll(".movie-card").forEach((card, i) => {
        card.classList.toggle("is-active", i === selectedIndex);
    });
}

function renderMovies(list) {
    movies = list.map(normalizeMovie).slice(0, 20);
    moviesEl.innerHTML = "";

    if (!movies.length) {
        setStatus("empty", "No results found");
        titleEl.textContent = "-";
        metaEl.innerHTML = "";
        descEl.textContent = "Movie description here.";
        bg.style.backgroundImage = "linear-gradient(135deg, #111, #222)";
        return;
    }

    setStatus("", "");
    movies.forEach((movie, index) => {
        const button = document.createElement("button");
        button.className = "movie-card";
        button.type = "button";
        button.dataset.index = index;

        const poster =
            getPoster(movie) ||
            "https://via.placeholder.com/300x450?text=No+Image";

        button.innerHTML = `
          <img src="${poster}" alt="${getMovieTitle(
            movie
        )} poster" loading="lazy">
          <div class="overlay">${getMovieTitle(movie)}<span>${getYear(
            movie
        )}</span></div>
        `;

        button.addEventListener("mouseenter", () => {
            renderDetails(movie);
        });

        button.addEventListener("click", () => {
            selectedIndex = index;
            renderDetails(movie);
            updateActiveCard();
        });

        button.addEventListener("mouseleave", () => {
            renderDetails(movies[selectedIndex]);
        });

        moviesEl.appendChild(button);
    });

    selectedIndex = 0;
    renderDetails(movies[0]);
    updateActiveCard();
}

async function fetchMovies(url) {
    setStatus("loading", "Loading...");
    try {
        const response = await fetch(url, {
            headers: { accept: "application/json" },
        });

        if (!response.ok) throw new Error("Request failed");

        const data = await response.json();

        const list = data?.titles || data?.results || data?.items || [];

        renderMovies(list);
    } catch (error) {
        setStatus("error", "Something went wrong");
        moviesEl.innerHTML = "";
        titleEl.textContent = "-";
        metaEl.innerHTML = "";
        descEl.textContent = "Movie description here.";
        bg.style.backgroundImage = "linear-gradient(135deg, #111, #222)";
    }
}

function loadDefaultMovies() {
    const url =
        "https://api.imdbapi.dev/titles?types=MOVIE&sortBy=SORT_BY_POPULARITY";
    fetchMovies(url);
}

function searchMovies(term) {
    const url = `https://api.imdbapi.dev/search/titles?query=${encodeURIComponent(
        term
    )}&limit=20`;
    fetchMovies(url);
}

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const term = searchInput.value.trim();
        if (!term) return;
        searchMovies(term);
    }
});

prevBtn.addEventListener("click", () => {
    moviesEl.scrollBy({ left: -360, behavior: "smooth" });
});

nextBtn.addEventListener("click", () => {
    moviesEl.scrollBy({ left: 360, behavior: "smooth" });
});

loadDefaultMovies();
