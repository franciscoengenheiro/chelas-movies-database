// Module that manipulates data related movies. It also applies pagination 
// to large results sets.

'use strict'

import createPaginatedResults from '#data_manipulation/pagination.mjs'
import { MovieDetails } from "#data_manipulation/classes.mjs"

// Constants
const DEFAULT_PAGE = 1
const MOVIES_LIMIT = 10

/**
 * Retrieves the most popular movies.
 * @param {Number} limit limits results. Has a default value.
 * @param {Number} page the nth page to retrieve. Has a default value.
 * @returns a PaginatedResults object.
 */
export function getPopularMovies(moviesObj, limit = MOVIES_LIMIT, page = DEFAULT_PAGE) {
    return createPaginatedResults(moviesObj.items, limit, page)
} 

/**
 * Retrieves the results of a search by a movie name.
 * @param {String} moviesName prefix or name of the movie to search.
 * @param {Number} limit limits results. Has a default value.
 * @param {Number} page the nth page to retrieve. Has a default value.
 * @returns a PaginatedResults object.
 */
export function searchMoviesByName(moviesObj, limit = MOVIES_LIMIT, page = DEFAULT_PAGE) {
    return createPaginatedResults(moviesObj.results, limit, page)
}

/**
 * Retrieves the details of a movie.
 * @param {Number} movieObj object that contains movie data.
 * @returns a MovieDetails object.
 */
export function getMovieDetails(movieObj) {
    return new MovieDetails(movieObj)
}