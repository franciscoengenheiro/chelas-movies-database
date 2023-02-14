// Module that applies pagination to a set of results

'use strict'

import { PaginatedResults } from "#data_manipulation/classes.mjs"
import errors from '#errors/errors.mjs'

/**
 * Creates a paginated result of the given array.
 * @param {Array} array an array that contains data.
 * @param {Number} limit limits results.
 * @param {Number} page the nth page to retrieve.
 * @returns a PaginatedResults object.
 */
export default function createPaginatedResults(array, limit, page) {
    if (!isANaturalNumber(limit)) throw errors.INVALID_ARGUMENT("limit")
    // Calculate the total amount of pages that can be navigated within the given limit
    let totalPages = array.length % limit == 0 ? array.length / limit : Math.floor(array.length / limit ) + 1
    if (!page) page = 1 // If a page is not specified, it will resort to the default page
    if (!isANaturalNumber(page)) throw errors.ARGUMENT_NOT_FOUND("page")
    // Calculate start and end index based on the requested limit and page
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    return new PaginatedResults(array.slice(startIndex, endIndex), totalPages)
}

// Auxiliary Functions
function isANaturalNumber(arg) {
    return !isNaN(arg) && arg > 0 && arg != Infinity
}