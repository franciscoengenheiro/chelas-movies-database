'use strict'

import errors from '../errors/errors.mjs'
import fetch from './node-fetch.mjs'

export const baseURL = 'http://localhost:9200'
export const REFRESH = '?refresh=wait_for'
const GROUPS_BASE_URL = `${baseURL}/groups`

export default function() {
    return {
        createGroupData: createGroupData,
        getGroupsData: getGroupsData,
        getGroupDetailsData: getGroupDetailsData,
        editGroupData: editGroupData,
        deleteGroupData: deleteGroupData,
        addMovieInGroupData: addMovieInGroupData,
        removeMovieInGroupData: removeMovieInGroupData
    }
}

/**
 * Creates a new group for an user and updates groups local storage
 * @param {*} obj object that has the group details to create
 * @param {Number} userId user internal identifier
 */
async function createGroupData(obj, userId) {
    // Create properties for the new group
    obj.movies = []
    obj.userId = userId

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    }
    await fetch(GROUPS_BASE_URL + '/_doc' + REFRESH, options)
    return obj
}

/**
 * Searchs in the group local storage for the specified user groups
 * @param {Number} userId user internal identifier
 * @returns an array with the search result
 */
async function getGroupsData(userId) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": {
                "match": {
                    "userId": {
                        "query": userId,
                        "operator": "AND"
                    }
                }
            }
        })
    }
    let groupsObj = await fetch(GROUPS_BASE_URL + '/_search', options)
    // Retrieve only the groups that belong to the user and modify each group object
    // to only show selected properties
    groupsObj.hits.hits = groupsObj.hits.hits
        .map(group => {
            return {
                id: group._id,
                name: group._source.name,
                description: group._source.description
            }
        })
    return groupsObj.hits.hits
}

/**
 * Searchs in the group local storage for a specified user group
 * @param {Number} groupId group identifier
 * @param {Number} userId user internal identifier
 * @returns The group found
 * @throws ArgumentNotFoundException if the group wasn't found
 */
async function getGroupDetailsData(groupId, userId) {
    // Retrieve user group
    let groupsObj = await fetch(GROUPS_BASE_URL + '/_doc/' + groupId)
    // Start a counter
    let totalDuration = 0
    // Checks if group exists
    if (!groupsObj.found) {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    // Checks if the group is from the corresponding user
    if(groupsObj._source.userId != userId) {
        throw errors.INVALID_USER("userId")
    }
    // Create the new group object
    let newGroup = {
        name: groupsObj._source.name,
        description: groupsObj._source.description,
        movies: groupsObj._source.movies.map(movie => {
            totalDuration += Number(movie.duration)
            return {
                id: movie.id,
                title: movie.title
            }
        }),
        moviesTotalDuration: totalDuration
    }
    return newGroup
}

/**
 * Searchs in the group local storage for the received user group and replaces that group for the new one
 * @param {Number} groupId group identifier
 * @param {*} obj object that has the group details to edit 
 * @param {Number} userId user internal identifier
 * @throws ArgumentNotFoundException if the group wasn't found
 */
async function editGroupData(groupId, obj, userId) {
    let groupObj = await fetch(GROUPS_BASE_URL + '/_doc/' + groupId)
    // Checks if group exists
    if (!groupObj.found) {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    // Checks if the group is from the corresponding user
    if(groupObj._source.userId != userId) {
        throw errors.INVALID_USER("userId")
    }
    groupObj._source.name = obj.name
    groupObj._source.description = obj.description
    let options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupObj._source)
    }
    groupObj = await fetch(GROUPS_BASE_URL + '/_doc/' + groupId + REFRESH, options)
    return groupObj._source
}

/**
 * Deletes a user specified group in the groups local storage 
 * @param {Number} groupId group identifier
 * @param {Number} userId user internal identifier
 * @throws ArgumentNotFoundException if the group wasn't found
 */
async function deleteGroupData(groupId, userId) {
    let groupsObj = await fetch(GROUPS_BASE_URL + '/_doc/' + groupId)
    // Checks if group exists
    if (groupsObj.result == "not found") {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    // Checks if the group is from the corresponding user
    if(groupsObj._source.userId != userId) {
        throw errors.INVALID_USER("userId")
    }
    // Delete group from storage
    return fetch(GROUPS_BASE_URL + '/_doc/' + groupId + REFRESH, {method: 'DELETE'})
}

/**
 * Adds a movie in a user specified group 
 * @param {Number} groupId group identifier
 * @param {Number} movieId movie identifier
 * @param {*} moviesObj object that represents the movie details to add
 * @param {Number} userId user internal identifier
 * @throws InvalidArgumentException if the movie already exists in the group or ArgumentNotFoundException if the either the group or movie weren't found
 */
async function addMovieInGroupData(groupId, movieId, moviesObj, userId) {
    let groupObj = await fetch(GROUPS_BASE_URL + '/_doc/' + groupId) 
    let newMovie = {}
    if (!groupObj.found) {
        throw errors.ARGUMENT_NOT_FOUND("group") 
    }
    // Checks if the group is from the corresponding user
    if(groupObj._source.userId != userId) {
        throw errors.INVALID_USER("userId")
    }
    if (groupObj._source.movies.find(movie => movie.id == movieId) != undefined) {
        throw errors.INVALID_ARGUMENT("movie already exists in this group")
    }
    if (moviesObj != undefined) {
        newMovie = {
            id: moviesObj.id,
            title: moviesObj.title,
            duration: moviesObj.runtimeMins
        }
        groupObj._source.movies.push(newMovie)
    }        
    let options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupObj._source)
    }
    await fetch(GROUPS_BASE_URL + '/_doc/' + groupId + REFRESH, options) 
}

/**
 * Removes a movie in a user specified group 
 * @param {Number} groupId group identifier
 * @param {Number} movieId movie identifier
 * @param {Number} userId user internal identifier
 * @throws ArgumentNotFoundException if the either the group or movie weren't found
 */
async function removeMovieInGroupData(groupId, movieId, userId) {
    let groupsObj = await fetch(GROUPS_BASE_URL + '/_doc/' + groupId)
    // Checks if group exists
    if (groupsObj.result == "not found") {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    // Checks if the group is from the corresponding user
    if(groupsObj._source.userId != userId) {
        throw errors.INVALID_USER("userId")
    }
    // Find the movie to delete index 
    let movieIndex = groupsObj._source.movies.findIndex(movie => movie.id == movieId)
    if (movieIndex < 0) {
        throw errors.ARGUMENT_NOT_FOUND("movie")
    } else {
        // Remove movie from the movies array 
        groupsObj._source.movies.splice(movieIndex, 1)
        let options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupsObj._source)
        }
        return fetch(GROUPS_BASE_URL + '/_doc/' + groupId + REFRESH, options)
    }
}