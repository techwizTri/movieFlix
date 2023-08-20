"use strict";
const apiKey = `88bf0972078ab0f65303476b5cda84a3`;
const baseUrl = `https://api.themoviedb.org/3`;
const endpoint = `/movie/popular`;
const genreEndpoint = `/genre/movie/list`;
const searchEndpoint = `/search/movie`;

const fetchMovies = function () {
  fetch(`${baseUrl}${genreEndpoint}?api_key=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      fetch(`${baseUrl}${endpoint}?api_key=${apiKey}`)
        .then((response) => response.json())
        .then((moviesData) => {
          displayMovies(moviesData.results, data.genres);
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

const fetchSearchMovies = function (query) {
  fetch(`${baseUrl}${searchEndpoint}?api_key=${apiKey}&query=${query}`)
    .then((response) => response.json())
    .then((moviesData) => {
      displayMovies(moviesData.results, []);
    })
    .catch((err) => console.error(err));
};

// Movie title h2 length
const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    const truncatedText = text.slice(0, maxLength);
    return truncatedText.slice(0, truncatedText.lastIndexOf(" ")) + "...";
  }
  return text;
};

const createMovieCard = (movie, genres, clickCallback) => {
  const movieCard = document.createElement("div");
  movieCard.classList.add("movie-card");

  const moviePoster = document.createElement("img");
  moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  moviePoster.alt = movie.title;

  const movieTitle = document.createElement("h2");
  movieTitle.textContent = truncateText(movie.title, 40);

  movieCard.appendChild(moviePoster);
  movieCard.appendChild(movieTitle);

  movieCard.addEventListener("click", () => {
    const allMovieCards = document.querySelectorAll(".movie-card");

    allMovieCards.forEach((card) => {
      if (card !== movieCard) {
        card.style.display = "none";
      }
      card.removeChild(card.querySelector("h2"));
    });

    clickCallback(movie, genres);
  });

  return movieCard;
};

const displayMovies = function (movies, genres) {
  const movieContainer = document.querySelector(".movies");
  movieContainer.innerHTML = "";

  if (movies.length === 0) {
    const noMoviesMsg = document.createElement("p");
    noMoviesMsg.textContent = "No Movies Found";
    noMoviesMsg.classList.add("no-movies");
    movieContainer.appendChild(noMoviesMsg);
  }

  movies.forEach((movie) => {
    if (!movie.poster_path) return;

    const movieCard = createMovieCard(movie, genres, displayMovieInfo);
    movieContainer.appendChild(movieCard);
  });
};

const appendMovies = function (movies, genres) {
  const movieContainer = document.querySelector(".movies");

  movies.forEach((movie) => {
    if (!movie.poster_path) return;

    const movieCard = createMovieCard(movie, genres, displayMovieInfo);
    movieContainer.appendChild(movieCard);
  });
};

// Load more movies
const loadMoviesBtn = document.getElementById("loadBtn");
let currentPage = 1;

loadMoviesBtn.addEventListener("click", () => {
  currentPage++;
  fetch(`${baseUrl}${endpoint}?api_key=${apiKey}&page=${currentPage}`)
    .then((response) => response.json())
    .then((moviesData) => {
      appendMovies(moviesData.results, []);
    })
    .catch((err) => console.error(err));
});

// Movie information when movie card is clicked
const displayMovieInfo = function (movie, genres) {
  document.getElementById("myBtn").style.display = "none";

  const infoContent = document.querySelector(".movies");
  infoContent.classList.add("info-content");

  const InfoContainer = document.createElement("div");
  InfoContainer.classList.add("info-container");

  const movieContent = document.createElement("div");
  movieContent.classList.add("movie-content");

  const cardInfo = document.querySelectorAll(".movie-card");
  cardInfo.forEach((card) => {
    card.classList.add("active");

    const cardImg = card.querySelector("img");
    cardImg.style.cursor = "alias";
    cardImg.style.boxShadow = "none";
    movieContent.appendChild(card);
  });

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("info-data");

  const titleInfo = document.createElement("h2");
  titleInfo.textContent = movie.title;

  const releaseInfo = document.createElement("h3");
  releaseInfo.textContent = `${movie.release_date.slice(0, 4)}`;

  const genreInfo = document.createElement("p");
  const genreNames = movie.genre_ids
    .map((genreId) => {
      const genre = genres.find((genre) => genre.id === genreId);
      return genre ? genre.name : null;
    })
    .filter((genreName) => genreName !== null)
    .join(", ");

  if (genreNames) {
    genreInfo.textContent = `Genre: ${genreNames}`;
  } else {
    genreInfo.textContent = "Genre: Unknown Genre";
  }

  const voteInfo = document.createElement("div");
  voteInfo.textContent = `★ ${movie.vote_average}`;

  const overviewInfo = document.createElement("p");
  overviewInfo.textContent = movie.overview;

  const pageBack = document.createElement("button");
  pageBack.classList.add("refresh");

  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("stroke", "currentColor");
  svgElement.setAttribute("fill", "currentColor");
  svgElement.setAttribute("stroke-width", "0");
  svgElement.setAttribute("viewBox", "0 0 16 16");
  svgElement.setAttribute("height", "2em");
  svgElement.setAttribute("width", "2em");
  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute("fill-rule", "evenodd");
  pathElement.setAttribute(
    "d",
    "M4.354 11.354a.5.5 0 000-.708L1.707 8l2.647-2.646a.5.5 0 10-.708-.708l-3 3a.5.5 0 000 .708l3 3a.5.5 0 00.708 0z"
  );
  pathElement.setAttribute("clip-rule", "evenodd");

  pageBack.addEventListener("click", () => {
    window.location.reload();
  });

  svgElement.appendChild(pathElement);
  pageBack.appendChild(svgElement);

  infoDiv.appendChild(titleInfo);
  infoDiv.appendChild(releaseInfo);
  infoDiv.appendChild(genreInfo);
  infoDiv.appendChild(voteInfo);
  infoDiv.appendChild(overviewInfo);
  infoDiv.appendChild(pageBack);

  movieContent.appendChild(infoDiv);

  InfoContainer.appendChild(movieContent);
  infoContent.appendChild(InfoContainer);
};

// Search Movies
const searchForm = document.querySelector("form");
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const searchInput = event.target.querySelector("input");
  const query = searchInput.value.trim();
  if (query) {
    fetchSearchMovies(query);
    searchInput.value = "";
    console.log(query);
    document.getElementById("loadBtn").style.display = "none";
  }
});

// Scroll to the top of page
const scrollUp = document.getElementById("myBtn");
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollUp.style.display = "block";
  } else {
    scrollUp.style.display = "none";
  }
}

scrollUp.addEventListener("click", () => {
  document.documentElement.scrollTop = 0;
});

fetchMovies();
