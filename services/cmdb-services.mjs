// Module that contains all of the logic of each of the application's functionalities 

'use strict'

import errors from '../errors/errors.mjs'

// Constants




export default function(imdbData, cmdbData, usersData){
    if(!imdbData){
        throw errors.INVALID_ARGUMENT("imdbData")
    }
    if(!cmdbData){
        throw errors.INVALID_ARGUMENT("cmdbData")
    }
    if(!usersData){
        throw errors.INVALID_ARGUMENT("usersData")
    }

    return {
        getPopularMovies: getPopularMovies,
        searchMoviesByName: searchMoviesByName,
        createGroup: createGroup,
        getGroups: getGroups,
        getGroupDetails: getGroupDetails,
        editGroup: editGroup,
        deleteGroup: deleteGroup,
        addMovieInGroup: addMovieInGroup,
        removeMovieInGroup: removeMovieInGroup
    }

    
    async function getPopularMovies(limit) {
        return imdbData.getPopularMoviesData(limit)
    }

    async function searchMoviesByName(moviesName, limit) {
        return imdbData.searchMoviesByNameData(moviesName, limit)
    }

    async function createGroup(obj, userToken) {

        let user = await usersData.checkUserData(userToken)

        // TODO(missing userID validation, make a middleware function)
        if (!isAString(obj.name) || !isAString(obj.description)) {
            throw errors.INVALID_ARGUMENT("group missing a valid name and description")
        }

        return cmdbData.createGroupData(obj, user.id)
    }

    async function getGroups(userToken) {

        let user = await usersData.checkUserData(userToken)

        return cmdbData.getGroupsData(user.id)
    }

    async function getGroupDetails(groupId, userToken) {

        let user = await usersData.checkUserData(userToken)

        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }

        return cmdbData.getGroupDetailsData(groupId, user.id)
    }

    async function editGroup(groupId, obj, userToken) {
        let user = await usersData.checkUserData(userToken)

        if (!isAString(obj.name) || !isAString(obj.description)){
            throw errors.INVALID_ARGUMENT("group missing a valid name and description")
        }
        if (isNaN(groupId)){
            throw errors.INVALID_ARGUMENT("group Id")
        }

        return cmdbData.editGroupData(groupId, obj, user.id)
    }

    async function deleteGroup(groupId, userToken) {

        let user = await usersData.checkUserData(userToken)
        
        if (isNaN(groupId)){
            throw errors.INVALID_ARGUMENT("group Id")
        }

        return cmdbData.deleteGroupData(groupId, user.id)
    }

    async function addMovieInGroup(groupId, movieId, userToken) {

        let user = await usersData.checkUserData(userToken)

        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("group Id")
        }

        return imdbData.addMovieInGroupData(groupId, movieId, user.id)
    }

    async function removeMovieInGroup(groupId, movieId, userToken) {

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
}

