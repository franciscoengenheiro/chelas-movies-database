// Module that manages and provides access to the application's group internal data

'use strict'

import errors from '#errors/errors.mjs'
import * as File from '#data_access/util/file-operations.mjs'

// Constants
const GROUPS_FILE = './local_data/groups.json'

/**
 * Creates a new group for an user and updates groups local storage.
 * @param {Object} obj object that has the group details to create.
 * @param {Number} userId user internal identifier.
 * @returns the created group.
 */
export async function createGroupData(obj, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Retrieve the new group Id 
    let newGroupID = ++groupsObj.IDs
    // Create properties for the new group
    obj.id = newGroupID
    obj.movies = []
    obj.userId = userId
    // Store newly created group  
    groupsObj.groups.push(obj)
    await File.write(groupsObj, GROUPS_FILE)
    return obj
}

/**
 * Searchs in the group local storage for the specified user groups.
 * @param {Number} userId user internal identifier.
 * @returns an array with the search result.
 */
export async function getGroupsData(userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Retrieve only the groups that belong to the user and modify each group object
    // to only show selected properties
    groupsObj.groups = groupsObj.groups
        .filter(group => group.userId == userId)
        .map(group => {
            return {
                id: group.id,
                name: group.name,
                description: group.description
            }
        })
    return groupsObj.groups
}

/**
 * Searchs in the group local storage for a specified user group.
 * @param {Number} groupId group identifier.
 * @param {Number} userId user internal identifier.
 * @returns The group found.
 * @throws ArgumentNotFoundException if the group wasn't found.
 */
export async function getGroupDetailsData(groupId, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Start a counter
    let totalDuration = 0
    // Retrieve user group
    let group = groupsObj.groups.find(group => groupId == group.id && userId == group.userId)
    if (group == undefined) {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    // Create the new group object
    let newGroup = {
        name: group.name,
        description: group.description,
        movies: group.movies.map(movie => {
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
 * Searchs in the group local storage for the received user group and replaces 
 * that group for the new one.
 * @param {Number} groupId group identifier.
 * @param {Object} obj object that has the group details to edit.
 * @param {Number} userId user internal identifier.
 * @returns The edited group.
 * @throws ArgumentNotFoundException if the group wasn't found.
 */
export async function editGroupData(groupId, obj, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    let found = false
    groupsObj.groups = groupsObj.groups.map(group => {
        if(group.id == groupId && group.userId == userId) {
            group.name = obj.name
            group.description = obj.description
            found = true
        }
        return group
    })
    if (!found) {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    return File.write(groupsObj, GROUPS_FILE)
}

/**
 * Deletes a user specified group in the groups local storage.
 * @param {Number} groupId group identifier.
 * @param {Number} userId user internal identifier.
 * @throws ArgumentNotFoundException if the group wasn't found.
 * @returns The deleted group. 
 */
export async function deleteGroupData(groupId, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Find group index
    let groupIndex = groupsObj.groups.findIndex(group => group.id == groupId && group.userId == userId)
    if (groupIndex < 0) {
        throw errors.ARGUMENT_NOT_FOUND("group")
    } else {
        // Delete group from storage
        groupsObj.groups.splice(groupIndex, 1) 
        return File.write(groupsObj, GROUPS_FILE) 
    }  
}

/**
 * Adds a movie in a user specified group.
 * @param {Number} groupId group identifier.
 * @param {Number} movieId movie identifier.
 * @param {Object} moviesObj object that represents the movie details to add.
 * @param {Number} userId user internal identifier.
 * @returns the group where the movie was added.
 * @throws InvalidArgumentException if the movie already exists in the group 
 * @throws ArgumentNotFoundException if the either the group or movie weren't found.
 */
export async function addMovieInGroupData(groupId, movieId, moviesObj, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Flag
    let foundGroup = false
    // Create a new movie object
    let newMovie = {}
    groupsObj.groups = groupsObj.groups.map(group => { 
        if (group.id == groupId && group.userId == userId) {
            foundGroup = true
            if (group.movies.find(movie => movie.id == movieId) != undefined) {
                throw errors.INVALID_ARGUMENT("movie already exists in this group")
            }
            if (moviesObj != undefined) {
                newMovie = {
                    id: moviesObj.id,
                    title: moviesObj.title,
                    duration: moviesObj.runtimeMins
                }
                group.movies.push(newMovie)
            }
        }
        return group
    }) 
    if (foundGroup) {
        await File.write(groupsObj, GROUPS_FILE)
        return newMovie
    }
    else {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
}

/**
 * Removes a movie in a user specified group. 
 * @param {Number} groupId group identifier.
 * @param {Number} movieId movie identifier.
 * @param {Number} userId user internal identifier.
 * @throws ArgumentNotFoundException if the either the group or movie weren't found.
 */
export async function removeMovieInGroupData(groupId, movieId, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Find the group within the groups array
    let group = groupsObj.groups.find(group => groupId == group.id && group.userId == userId)
    // If the group exists:
    if (group != undefined) {
        // Find the index of the movie to delete
        let movieIndex = group.movies.findIndex(movie => movie.id == movieId)
        if (movieIndex < 0) {
            throw errors.ARGUMENT_NOT_FOUND("movie")
        } else {
            // Remove movie from the movies array 
            group.movies.splice(movieIndex, 1)
            return File.write(groupsObj, GROUPS_FILE)
        }
    } else {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
}