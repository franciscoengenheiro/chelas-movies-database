// Module that simulates a fetch operation, in order to work and test, without its limitations

'use strict'

import errors from '../errors/errors.mjs'
import * as File from './file-operations.mjs'
import { MOST_POPULAR_MOVIES, MOVIES_SEARCHED_BY_NAME, MOVIES_INFO } from './cmdb-movies-data.mjs'

// Object that maps actual URLs to internal paths to files
const data = {
    [MOST_POPULAR_MOVIES]: './local_data/most-popular-movies.json',
    [MOVIES_SEARCHED_BY_NAME + "inception 2010"]: './local_data/movies-searched-by-name.json',
    [MOVIES_INFO + "tt0468569"]: './local_data/movies-info.json'
}

/**
 * Fetches specified content in local storage
 * @param {String} URL local fetched data property
 * @returns a promise that resolves to a JavaScript object of the result
 */
export default async function(URL) {
    checkURL(URL)
    return File.read(data[URL])
}

function checkURL(URL) {
    let findURL = Object.keys(data).find(prop => URL == prop)
    if(!findURL) {
        throw errors.ARGUMENT_NOT_FOUND('Movie')
    }
    return
}