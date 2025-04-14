document.addEventListener("DOMContentLoaded", function () {
    document
        .querySelector("#search-btn")
        .addEventListener("click", handleTitleSearch);
    document
        .getElementById("streaming-service")
        .addEventListener("change", (e) => {
            addStreamingChip(e.target.value);
        });
    document
        .getElementById("sort-btn")
        .addEventListener("click", handleSorting);
    document
        .getElementById("filter-btn")
        .addEventListener("click", handleFilterSearch);
    //initPage();
    loadWatchList();
});

function loadWatchList() {
    // load the watchlist from the local storage
    moviesList = JSON.parse(localStorage.getItem("watchList")) || [];
    showResultsInIndex(moviesList);
    // create the movie cards and display them
}

function getFilterParams() {
    let yearFrom = document.querySelector("#from-year").value;
    let yearTo = document.querySelector("#to-year").value;
    if (
        yearFrom === "" ||
        yearTo === "" ||
        parseInt(yearFrom) > parseInt(yearTo)
    ) {
        yearFrom = null;
        yearTo = null;
    }

    let genres = document.querySelector("#genre").value;
    genres = genres ? [genres] : null;
    let streamingServices = getStreamingServicesList();
    let isPriceFree = document.querySelector("#price").value === "subscription";

    let params = createFilterSearchParams(
        yearFrom,
        yearTo,
        genres,
        streamingServices,
        isPriceFree
    );
    return params;
}
async function handleFilterSearch() {
    let progressBar = document.querySelector("#progress-bar");
    progressBar.removeAttribute("value");

    let params = getFilterParams();

    let streamingData = await getStreamingData(params, API_URL.Filter_Search);

    let streamingServices = getStreamingServicesList();
    filterMoviesByStream(streamingData, streamingServices);

    moviesList = await createMovieList(streamingData);
    showResultsInIndex(moviesList);

    progressBar.setAttribute("value", "100");
}

function getStreamingServicesList() {
    let streamingServices = Array.from(document.querySelectorAll(".chip")).map(
        (chip) => chip.getAttribute("data-stream-name")
    );
    streamingServices =
        streamingServices.length > 0
            ? streamingServices
            : ["prime", "netflix", "disney", "apple", "paramont"];
    return streamingServices;
}

function addStreamingChip(streamingName) {
    let streamingChip = document.createElement("div");
    streamingChip.setAttribute("class", "chip column is-6 my-2");
    streamingChip.setAttribute("data-stream-name", streamingName);
    streamingChip.innerHTML = `${streamingName}<span class="closebtn" onclick="this.parentElement.parentElement.removeChild(this.parentElement);">&times;</span>`;

    let streamingChips = document
        .querySelector("#streaming-chips")
        .querySelectorAll(".chip");
    if (
        Array.from(streamingChips).some(
            (chip) => chip.getAttribute("data-stream-name") === streamingName
        )
    ) {
        return;
    }
    document.querySelector("#streaming-chips").appendChild(streamingChip);
}

// adds the movie to the local storage
function handleAddToWatchList(event) {
    // get the imdbId from the event
    let imdbId = event.target.getAttribute("data-imdbid");
    // find the movie in the moviesList array by imdbId
    let movie = moviesList.find((movie) => movie.imdbID === imdbId);
    if (movie) {
        let watchList = JSON.parse(localStorage.getItem("watchList")) || [];
        // check if the movie is already in the watch list
        if (watchList.find((m) => m.imdbID === imdbId)) {
            return;
        }
        watchList.push(movie);
        localStorage.setItem("watchList", JSON.stringify(watchList));

        event.target.textContent = "Added to Watch List " + "✓";
    }
}

async function handleTitleSearch(e) {
    let progressBar = document.querySelector("#progress-bar");
    progressBar.removeAttribute("value");

    let movies = await search();
    showResultsInIndex(movies);

    progressBar.setAttribute("value", "100");
}

async function search() {
    let streamingData = null;
    if (titleInput.value.trim() !== "") {
        streamingData = await getStreamingDataByTitle(titleInput.value.trim());
    } else {
        let params = createFilterSearchParams(
            2024,
            2024,
            null,
            ["prime", "netflix"],
            false
        );
        streamingData = await getStreamingData(params, API_URL.Filter_Search);
    }

    return createMovieList(streamingData);
}