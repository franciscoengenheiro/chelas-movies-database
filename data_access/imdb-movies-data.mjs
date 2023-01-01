// Module that manages application movies data.
// Provides access to the Internet Movies Database (IMDb) API

'use strict'

import errors from '#errors/errors.mjs'

// Constants
const IMDB_KEY = "k_lcs891ko" // "k_jtqnxg0w"
export const MOST_POPULAR_MOVIES = `https://imdb-api.com/en/API/Top250Movies/${IMDB_KEY}`
export const MOVIES_SEARCHED_BY_NAME = `https://imdb-api.com/en/API/SearchMovie/${IMDB_KEY}/`
export const MOVIE_INFO = `https://imdb-api.com/en/API/Title/${IMDB_KEY}/`

/**
 * @param {Function} fetch function that retrieves a resource from a container 
 * @returns an object with all the avalaible movies data operations as properties
 */
export default function(fetch) {
    // Validate if the received fetch function exists
    if (!fetch) {
        throw errors.INVALID_ARGUMENT("fetch")
    }

    return {
        getPopularMoviesData: getPopularMoviesData,
        searchMoviesByNameData: searchMoviesByNameData,
        getMovieDetails: getMovieDetails,
        addMovieInGroupData: addMovieInGroupData
    }

    /**
     * Retrieves the 250 most popular movies
     * @param {Number} limit option parameter to limit the search result 
     * @returns an array with the search result
     */
    async function getPopularMoviesData(limit) {
        let moviesObj = await fetch(MOST_POPULAR_MOVIES)
        checkLimitAndFilter(limit, function() {
            moviesObj.items = moviesObj.items.filter(movie => Number(movie.rank) <= limit)
        })
        return moviesObj.items
    } 

    /**
     * Retrieves the results of a search by a movie name
     * @param {String} moviesName prefix or name of the movie to search
     * @param {Number} limit option parameter to limit the search result
     * @returns an array with the search result
     */
    async function searchMoviesByNameData(moviesName, limit) {
        let moviesObj = await fetch(MOVIES_SEARCHED_BY_NAME + moviesName)
        // Start a counter
        let limitCounter = 1   
        checkLimitAndFilter(limit, function() {
            // Limit the search result
            moviesObj.results = moviesObj.results.filter(_ => limitCounter++ <= limit)
        })
        return moviesObj.results
    }

    async function getMovieDetails(movieId) {
        let movieObj = await fetch(MOVIE_INFO + movieId)

        let movieDetails = {
            id: movieObj.id,
            title: movieObj.title,
            description: movieObj.plot,
            image_url: movieObj.image,
            runtimeMins: movieObj.runtimeMins,
            director: movieObj.directors,
            actors_names: movieObj.stars
        }

        return movieDetails
    }

    /**
     * Adds a movie in a user specified group
     * @param {Number} groupId group identifier
     * @param {Number} movieId movie identifier
     * @param {Number} userId user internal identifier
     * @throws ArgumentNotFoundException if the movie does not exist 
     */
    async function addMovieInGroupData(movieId) {
        let moviesObj = await fetch(MOVIE_INFO + movieId)
        if (moviesObj.title == null) {
            throw errors.ARGUMENT_NOT_FOUND("Movie")
        } else {
            return moviesObj
        }
    }

    // Auxiliary Functions
    /**
     * Validates the limit and returns a function to apply after
     * @param {Number} limit parameter to limit the search result
     * @param {Function} action function to execute
     * @throws InvalidArgumentException if the received limit is invalid
     */
    function checkLimitAndFilter(limit, action) {
        if (limit != undefined) {
            if (!isNaN(limit) && limit <= 250) action()
            else throw errors.INVALID_ARGUMENT("limit")
        }
    }
}