// Module that contains all of the logic of each of the application's functionalities

'use strict'

import errors from '../errors/errors.mjs'

/**
 * @param {*} imdbData module that manages application movies data
 * @param {*} cmdbData module that manages application group data
 * @param {*} usersData module that manages application user data 
 * @returns an object with all the avalaible application's services as properties
 */
export default function(imdbData, cmdbData, usersData) {
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
        getMovieDetails: getMovieDetails,
        createGroup: verifyUser(createGroup),
        getGroups: verifyUser(getGroups),
        getGroupDetails: verifyUser(getGroupDetails),
        editGroup: verifyUser(editGroup),
        deleteGroup: verifyUser(deleteGroup),
        addMovieInGroup: verifyUser(addMovieInGroup),
        removeMovieInGroup: verifyUser(removeMovieInGroup)
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
     * Retrieves the details of a movie
     * @param {Number} movieId Id of the movie to search
     */
    async function getMovieDetails(movieId) {
        return imdbData.getMovieDetails(movieId)
    }

    /**
     * Creates a group for an user
     * @param {*} obj object that has the group details to create
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group is missing a valid name and description
     */
    async function createGroup(userId, obj) {
        if (!isAString(obj.name) || !isAString(obj.description)) {
            throw errors.INVALID_ARGUMENT("group missing a valid name and description")
        }
        return cmdbData.createGroupData(obj, userId)
    }
    
    /**
     * Retrieves all groups that belong to a specified user
     * @param {String} userToken token used to identify a user 
     */
    async function getGroups(userId) {
        return cmdbData.getGroupsData(userId)
    }
    
    /**
     * Retrieves details for the user specified group
     * @param {Number} groupId group identifier
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number
     */
    async function getGroupDetails(userId, groupId) {
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return cmdbData.getGroupDetailsData(groupId, userId)
    }

    /**
     * Deletes the user specified group
     * @param {Number} groupId group identifier
     * @param {*} obj object that has the group details to edit
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number for this user
     * or if the group is missing a valid name and description
     */
    async function editGroup(userId, groupId, obj) {
        if (!isAString(obj.name) || !isAString(obj.description)) {
            throw errors.INVALID_ARGUMENT("group missing a valid name and description")
        }
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return cmdbData.editGroupData(groupId, obj, userId)
    }

    /**
     * Deletes the user specified group
     * @param {Number} groupId group identifier
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number
     */
    async function deleteGroup(userId, groupId) {
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return cmdbData.deleteGroupData(groupId, userId)
    }

    /**
     * Adds a movie in a user specified group
     * @param {Number} groupId group identifier
     * @param {Number} movieId movie identifier
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number
     */
    async function addMovieInGroup(userId, groupId, movieId) {
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return imdbData.addMovieInGroupData(groupId, movieId, userId)
    }

    /**
     * Removes a movie in a user specified group
     * @param {Number} groupId group identifier
     * @param {Number} movieId movie identifier
     * @param {String} userToken token used to identify a user 
     * @throws InvalidArgumentException if the group id is not a number
     */
    async function removeMovieInGroup(userId, groupId, movieId) {
        if (isNaN(groupId)) {
            throw errors.INVALID_ARGUMENT("groupId")
        }
        return cmdbData.removeMovieInGroupData(groupId, movieId, userId)
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

    /**
     * Middleware that verifies if the userToken is valid before calling a service
     * @param {*} service a function from Services
     * @returns the same function but the first argument will be the userId instead of UserToken
     */
    function verifyUser(service) {
        return async function(...args) {
            // Retrieve received arguments from the service function
            let serviceArgs = args
            // Retrieve userToken from the service arguments
            let userToken = serviceArgs[0]
            // Verify if the user exists, if there's an error the promise will be rejected and 
            // returned to the top
            let user = await usersData.checkUserData(userToken)
            // Override first service argument which is the userToken with the actual user id
            // since the user was verified
            serviceArgs[0] = user.id
            // Call the received service function with the same arguments but with the 
            // modification described above
            return service.apply(this, serviceArgs) 
        }
    }
}