// Module that contains all of the logic of each of the application's functionalities

'use strict'

import errors from '../errors/errors.mjs'

/**
 * @param {*} imdbData module that manages application movies data
 * @param {*} cmdbData module that manages application group data
 * @param {*} usersData module that manages application user data 
 * @returns an object with all the avalaible application's services as properties
 */
export default function(imdbData, cmdbData, usersData){
    // Validate if all the received data modules exist
    if (!imdbData) { 
        throw errors.INVALID_ARGUMENT("imdbData")
    }
    if (!cmdbData) {
        throw errors.INVALID_ARGUMENT("cmdbData")
    }
    if (!usersData) {
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

    /**
     * Retrieves the top 250 most popular movies
     * @param {Number} limit option parameter to limit the search result
     */
    async function getPopularMovies(limit) {
        return imdbData.getPopularMoviesData(limit)
    }

    /**
     * Retrieves the search results by a movie name
     * @param {String} moviesName prefix or name of the movie to search
     * @param {Number} limit option parameter to limit the search result
     */
    async function searchMoviesByName(moviesName, limit) {
        return imdbData.searchMoviesByNameData(moviesName, limit)
    }

    /**
     * Creates a group for an user
     * @param {*} obj object that has the group details to create
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group is missing a valid name and description
     */
    async function createGroup(obj, userToken) {
        let user = await usersData.checkUserData(userToken)
        if (!isAString(obj.name) || !isAString(obj.description)) {
            throw errors.INVALID_ARGUMENT("group missing a valid name and description")
        }
        return cmdbData.createGroupData(obj, user.id)
    }
    
    /**
     * Retrieves all groups that belong to a specified user
     * @param {String} userToken token used to identify a user 
     */
    async function getGroups(userToken) {
        let user = await usersData.checkUserData(userToken)
        return cmdbData.getGroupsData(user.id)
    }
    
    /**
     * Retrieves details for the user specified group
     * @param {Number} groupId group identifier
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number
     */
    async function getGroupDetails(groupId, userToken) {
        let user = await usersData.checkUserData(userToken)
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return cmdbData.getGroupDetailsData(groupId, user.id)
    }

    /**
     * Deletes the user specified group
     * @param {Number} groupId group identifier
     * @param {*} obj object that has the group details to edit
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number for this user
     * or if the group is missing a valid name and description
     */
    async function editGroup(groupId, obj, userToken) {
        let user = await usersData.checkUserData(userToken)
        if (!isAString(obj.name) || !isAString(obj.description)) {
            throw errors.INVALID_ARGUMENT("group missing a valid name and description")
        }
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return cmdbData.editGroupData(groupId, obj, user.id)
    }

    /**
     * Deletes the user specified group
     * @param {Number} groupId group identifier
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number
     */
    async function deleteGroup(groupId, userToken) {
        let user = await usersData.checkUserData(userToken)
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return cmdbData.deleteGroupData(groupId, user.id)
    }

    /**
     * Adds a movie in a user specified group
     * @param {Number} groupId group identifier
     * @param {Number} movieId movie identifier
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number
     */
    async function addMovieInGroup(groupId, movieId, userToken) {
        let user = await usersData.checkUserData(userToken)
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return imdbData.addMovieInGroupData(groupId, movieId, user.id)
    }

    /**
     * Removes a movie in a user specified group
     * @param {Number} groupId group identifier
     * @param {Number} movieId movie identifier
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number
     */
    async function removeMovieInGroup(groupId, movieId, userToken) {
        let user = await usersData.checkUserData(userToken)
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return cmdbData.removeMovieInGroupData(groupId, movieId, user.id)
    }   
    // Auxiliary functions:
    /**
     * Verifies that the received value is not an empty string and is of the type String   
     * @param {*} value value to assert
     * @returns returns false unless the prerequisites listed above are met
     */ 
    function isAString(value) {
        return typeof value == 'string' && value != ""
    }
}