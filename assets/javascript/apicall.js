"use strict";

// The streaming API uses these codes for genres
const GENRE_CODES = {
    Adventure: "12",
    Fantasy: "14",
    Animation: "16",
    Drama: "18",
    Horror: "27",
    Action: "28",
    Comedy: "35",
    History: "36",
    Western: "37",
    Thriller: "53",
    Crime: "80",
    Documentary: "99",
    "Science Fiction": "878",
    Mystery: "9648",
    Music: "10402",
    Romance: "10749",
    Family: "10751",
    War: "10752",
    News: "10763",
    Reality: "10764",
    "Talk Show": "10767",
};
const API_URL = {
    Title_Search: "https://streaming-availability.p.rapidapi.com/search/title",
    Filter_Search:
        "https://streaming-availability.p.rapidapi.com/search/filters",
    IMDb_Rating: "https://www.omdbapi.com",
};

// Purpose: Create a Movie object from the movie data and streaming data
function Movie(streamingData, movieData) {
    this.posterUrl = movieData.Poster;
    this.title = movieData.Title;
    this.year = movieData.Year;
    this.genres = movieData.Genre.split(",");
    this.plot = movieData.Plot;
    this.director = movieData.Director;
    this.actors = movieData.Actors;
    this.runtime = movieData.Runtime;
    this.rating = movieData.Rated;
    this.imdbRating = movieData.imdbRating;
    this.imdbID = movieData.imdbID;

    this.streaming = [];
    for (let streamingService of streamingData.streamingInfo.ca) {
        let price = "";
        if (
            streamingService.streamingType === "buy" ||
            streamingService.streamingType === "rent"
        ) {
            price = streamingService.price.formatted;
        } else {
            price = "";
        }
        this.streaming.push({
            service: streamingService.service,
            type: streamingService.streamingType,
            price: price,
        });
    }
}

async function getRatingData(imdbId, url) {
    let params = {
        apikey: "5769dc6",
        i: imdbId,
    };

    let searchParams = new URLSearchParams(params);
    url += "?" + searchParams.toString();

    try {
        const responce = await fetch(url);
        const data = await responce.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

// The streaming API uses these params to filter the search
// These are out default values, Country is always Canada, show_type is always movie, output_language is always English, genres_relation is always "and"
//not all parameters are used with all request types
function initSearchParamObject() {
    let params = {
        country: "ca",
        show_type: "movie",
        output_language: "en",
        genres_relation: "and",
    };
    return params;
}

function createTitleSearchParams(title) {
    let params = initSearchParamObject();
    params.title = title;
    return params;
}

// A comma separated list of genres' codes
function createGenreString(genre) {
    let genreParam = "";
    for (let i of genre) {
        genreParam += GENRE_CODES[i] + ",";
    }
    //remove the last ","
    genreParam = genreParam.slice(0, -1);

    return genreParam;
}

// A comma separated list of services and their cost (subscription, buy, rent)
function createServicesString(services, justFree) {
    let servicesParam = "";
    //always add subscription
    for (let service of services) {
        servicesParam += service + ".subscription,";
    }
    //if not free,also add rent and buy
    if (!justFree) {
        for (let service of services) {
            servicesParam += service + ".buy," + service + ".rent,";
        }
    }
    //remove the last ","
    servicesParam = servicesParam.slice(0, -1);
    return servicesParam;
}

//for each unused parameter, set it to null to ignore it
function createFilterSearchParams(
    year_min,
    year_max,
    genre, //array of genres
    services, //array of streaming services
    justFree = true
) {
    let params = initSearchParamObject();

    if (parseInt(year_min) && parseInt(year_max)) {
        params.year_min = parseInt(year_min);
        params.year_max = parseInt(year_max);
    }
    if (genre) {
        params.genres = createGenreString(genre);
    }
    if (services) {
        params.services = createServicesString(services, justFree);
    }

    return params;
}

async function getStreamingDataByTitle(title) {
    let params = createTitleSearchParams(title);
    let streamingData = await getStreamingData(params, API_URL.Title_Search);
    //filter movies with title containing the search string
    streamingData.result = streamingData.result.filter((movie) => {
        return movie.title.toLowerCase().includes(title.toLowerCase());
    });
    return streamingData;
}

function filterMoviesByStream(streamingData, services) {
    let filteredMovies = [];
    for (let movie of streamingData.result) {
        let streams = [];
        for (let service of services) {
            for (let stream of movie.streamingInfo.ca) {
                if (stream.service === service) {
                    streams.push(stream);
                }
            }
        }
        if (streams.length > 0) {
            movie.streamingInfo.ca = streams;
            filteredMovies.push(movie);
        }
    }
    streamingData.result = filteredMovies;
}
async function getStreamingData(params, url) {
    const headers = {
        "X-RapidAPI-Key": "cf33ab62edmshde9293530f976e1p11beacjsn53110b32fe2d",
        "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com",
    };

    //create the complete URL with the query string
    let searchParams = new URLSearchParams(params);
    url += "?" + searchParams.toString();
    try {
        const responce = await fetch(url, {
            headers: headers,
        });
        const data = await responce.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}