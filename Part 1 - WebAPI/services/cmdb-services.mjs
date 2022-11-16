// Module that contains all of the logic of each of the application's functionalities 

'use strict'

import * as imdbData from '../data/cmdb-movies-data.mjs'
import * as cmdbData from '../data/cmdb-data-mem.mjs'
import * as usersData from '../data/cmdb-users-data.mjs'
import errors from '../errors/errors.mjs'

// Constants


export async function getPopularMovies(limit) {
    return imdbData.getPopularMoviesData(limit)
}

export async function searchMoviesByName(moviesName, limit) {
    return imdbData.searchMoviesByNameData(moviesName, limit)
}

export async function createGroup(obj, userToken) {

    let user = await usersData.checkUserData(userToken)

    // TODO(missing userID validation, make a middleware function)
    if (!isAString(obj.name) || !isAString(obj.description) || isNaN(obj.userId)) {
        throw errors.INVALID_ARGUMENT("group missing a valid name and description")
    }

    return cmdbData.createGroupData(obj, user.id)
}

export async function getGroups(userToken) {

    let user = await usersData.checkUserData(userToken)

    return cmdbData.getGroupsData(user.id)
}

export async function getGroupDetails(groupId, userToken) {

    let user = await usersData.checkUserData(userToken)

    if (isNaN(groupId)) {
        throw errors.INVALID_ARGUMENT("groupId")
    }

    return cmdbData.getGroupDetailsData(groupId, user.id)
}

export async function editGroup(groupId, obj, userToken) {
    let user = await usersData.checkUserData(userToken)

    if (!isAString(obj.name) || !isAString(obj.description)){
        throw errors.INVALID_ARGUMENT("group missing a valid name and description")
    }
    if (isNaN(groupId)){
        throw errors.INVALID_ARGUMENT("group Id")
    }

    return cmdbData.editGroupData(groupId, obj, user.id)
}

export async function deleteGroup(groupId, userToken) {

    let user = await usersData.checkUserData(userToken)
    
    if (isNaN(groupId)){
        throw errors.INVALID_ARGUMENT("group Id")
    }

    return cmdbData.deleteGroupData(groupId, user.id)
}

export async function addMovieInGroup(groupId, movieId, userToken) {

    let user = await usersData.checkUserData(userToken)

    if (isNaN(groupId)) {
        throw errors.INVALID_ARGUMENT("group Id")
    }

    return cmdbData.addMovieInGroupData(groupId, movieId, user.id)
}

export async function removeMovieInGroup(groupId, movieId, userToken) {

    let user = await usersData.checkUserData(userToken)

    if (isNaN(groupId)){
        throw errors.INVALID_ARGUMENT("group")
    }

    return cmdbData.removeMovieInGroupData(groupId, movieId, user.id)

}

// Auxiliary functions
function isAString(value) {
    return typeof value == 'string' && value != ""
}