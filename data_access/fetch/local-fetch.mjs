// Module that simulates a fetch operation in order to work and test without its limitations

'use strict'

import errors from '#errors/errors.mjs'
import * as File from '#data_access/util/file-operations.mjs'
import { MOST_POPULAR_MOVIES, MOVIES_SEARCHED_BY_NAME, MOVIE_INFO } 
    from '#data_access/imdb-movies-data.mjs'

// Object that maps actual URLs paths to local files
const data = {
    [MOST_POPULAR_MOVIES]: './local_data/most-popular-movies.json',
    [MOVIES_SEARCHED_BY_NAME + "inception 2010"]: './local_data/movies-searched-by-name.json',
    [MOVIE_INFO + "tt0468569"]: './local_data/movie-info.json'
}

/**
 * Fetches specified resource in local storage.
 * @param {String} URL local fetched data property.
 * @returns a promise that resolves to a JavaScript object of the result.
 */
export default async function(URL) {
    checkURL(URL)
    return File.read(data[URL])
}

/**
 * Evaluates if the specified resource exists in local storage.
 * @param {String} URL path to a resource stored in local storage.
 * @throws ArgumentNotFoundException if the movie couldn't be found.
 */
function checkURL(URL) {
    let findURL = Object.keys(data).find(prop => URL == prop)
    if (!findURL) {
        throw errors.ARGUMENT_NOT_FOUND('Movie')
    }
    return
}