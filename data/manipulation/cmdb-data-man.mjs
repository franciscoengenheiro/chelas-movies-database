// Module that manipulates data related to groups. It also applies pagination
// to large results sets.

'use strict'

import createPaginatedResults from '#data_manipulation/pagination.mjs'
import { Group, GroupDetails, Movie } from "#data_manipulation/classes.mjs"

// Constants
const DEFAULT_PAGE = 1
const GROUPS_LIMIT = 6
const MOVIES_LIMIT = 9

/**
 * @param {Object} obj an object that contains data for a new group.
 * @param {Object} requestedProps an object that represents the adicional properties to add 
 * to the group object.
 * @returns a Group object.
 */
export function createGroup(obj) {
    // Create a new Group object with the received properties
    return new Group(obj)
}

/** 
 * @param {array} groups an array of groups.
 * @param {String} container an object that has the properties to search for. If set to
 * null, all data will be retrieved in the outer object.
 * @param {Number} limit limits results. Has a default value.
 * @param {Number} page the nth page to retrieve. Has a default value.
 * @returns a PaginatedResults object.
 */
export function getGroups(
    groups,
    container,
    limit = GROUPS_LIMIT,
    page = DEFAULT_PAGE
) {
    // Modify each group object to only show selected properties
    groups = groups.map(group => {
            // Assert if the group data (groupId not included) is in a separate container
            const source = container ? group[`${container.source}`] : group
            const id = container ? group[`${container.id}`] : group.id
            return {
                id: id,
                name: source.name,
                description: source.description
            }
        })
    return createPaginatedResults(groups, limit, page)
}

/**
 * @param {Object} group an object that represents a group. 
 * @param {Number} limit limits results. Has a default value.
 * @param {Number} page the nth page to retrieve. Has a default value.
 * @returns a GroupDetails object.
 */
export function getGroupDetails(group, limit = MOVIES_LIMIT, page = DEFAULT_PAGE) {
    const movies = filterMovies(group, limit, page)
    // Create the new group object
    return new GroupDetails(group, movies)
}

/**
 * @param {Object} groupObj an object that represents the group with outdated values.
 * @param {Object} obj an object that represents the new group. This object should only
 * contain the properties that will override the old values.
 * @returns the updated group object.
 */
export function editGroup(groupObj, obj) {
    // Override group properties
    return Object.assign(groupObj, obj)
}

/**
 * @param {*} group an object that represents a group.
 * @param {*} movieObj an object that represents the movies in a group.
 * @returns the new added movie.
 */
export function addMovieInGroup(group, movieObj) {
    // Create a new movie object
    const newMovie = new Movie(movieObj)
    // Insert new movie into group
    group.movies.push(newMovie)
    return newMovie
}

/**
 * Removes a movie in a group, given its index.
 * @param {Object} group an object that represents a group.
 * @param {Number} movieIndex index of a movie item.
 */
export function removeMovieInGroup(group, movieIndex) {
    // Remove movie from the movies array
    group.movies.splice(movieIndex, 1)
}

// Auxiliary Functions
/**
 * @param {Object} group an object that represents a group.
 * @param {Number} limit limits results.
 * @param {Number} page the nth page to retrieve.
 * @returns a PaginatedResults object.
 */
function filterMovies(group, limit, page) {
    let movies = group.movies.map(movie => new Movie(movie))
    return createPaginatedResults(movies, limit, page)
}