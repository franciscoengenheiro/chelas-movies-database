// Module that manages application movies data and provides access to the 
// Internet Movies Database (IMDb) API

'use strict'

import errors from '#errors/errors.mjs'
import * as dataManipulation from '#data_manipulation/cmdb-movies-man.mjs'

// Constants
const IMDB_KEY = "k_jtqnxg0w" // "k_o6wzk1u2"
export const MOST_POPULAR_MOVIES = `https://imdb-api.com/en/API/Top250Movies/${IMDB_KEY}`
export const MOVIES_SEARCHED_BY_NAME = `https://imdb-api.com/en/API/SearchMovie/${IMDB_KEY}/`
export const MOVIE_INFO = `https://imdb-api.com/en/API/Title/${IMDB_KEY}/`

export default function(fetch) {
    // Validate if the received fetch function exists
    if (!fetch) {
        throw errors.INVALID_ARGUMENT("fetch")
    }

    return {
        getPopularMoviesData: getPopularMoviesData,
        searchMoviesByNameData: searchMoviesByNameData,
        getMovieDetails: getMovieDetails
    }

    /**
     * Retrieves the most popular movies.
     * @param {Number} limit limits results.
     * @param {Number} page the nth page to retrieve.
     * @returns an object with the search result.
     */
    async function getPopularMoviesData(limit, page) {
        const moviesObj = await fetch(MOST_POPULAR_MOVIES)
        return dataManipulation.getPopularMovies(moviesObj, limit, page)
    }

    /**
     * Retrieves the results of a search by a movie name.
     * @param {String} moviesName prefix or name of the movie to search.
     * @param {Number} limit limits results.
     * @param {Number} page the nth page to retrieve.
     * @returns an object with the search result.
     */
    async function searchMoviesByNameData(moviesName, limit, page) {
        const moviesObj = await fetch(MOVIES_SEARCHED_BY_NAME + moviesName)
        return dataManipulation.searchMoviesByName(moviesObj, limit, page)
    }

    /**
     * Retrieves the details of a movie.
     * @param {Number} movieId movie identifier.     
     * @returns the requested movie.
     */
    async function getMovieDetails(movieId) {
        const movieObj = await fetch(MOVIE_INFO + movieId)
        if (!movieObj.title) {
            throw errors.ARGUMENT_NOT_FOUND("movie")
        } 
        return dataManipulation.getMovieDetails(movieObj)
    }
}