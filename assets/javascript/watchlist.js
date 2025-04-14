document.addEventListener("DOMContentLoaded", function () {
    document
        .getElementById("sort-btn")
        .addEventListener("click", handleSorting);

    loadWatchList();
});

function showResultsInWatchlist(movies) {
    const movieContainer = document.querySelector("#movie-container");
    movieContainer.innerHTML = "";
    // create the movie cards and display them
    for (let movie of movies) {
        let movieCard = createMovieCard(
            movie,
            "Remove",
            "handleMovieRemoveBtn"
        );
        movieContainer.appendChild(movieCard);
    }
    makeCardsEqualSize();
}

function handleMovieRemoveBtn(event) {
    let imdbID = event.target.getAttribute("data-imdbid");
    let movieIndex = moviesList.findIndex((movie) => movie.imdbID === imdbID);
    console.log(movieIndex, imdbID);
    if (movieIndex === -1) {
        return;
    }
    moviesList.splice(movieIndex, 1);
    localStorage.setItem("watchList", JSON.stringify(moviesList));
    showResultsInWatchlist(moviesList);
}

function loadWatchList() {
    // load the watchlist from the local storage
    moviesList = JSON.parse(localStorage.getItem("watchList")) || [];
    showResultsInWatchlist(moviesList);
    // create the movie cards and display them
}