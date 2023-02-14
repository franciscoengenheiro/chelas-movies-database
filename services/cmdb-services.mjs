// Module that contains all the logic of each of the application's functionalities

'use strict'

import errors from '#errors/errors.mjs'

/**
 * @param {*} imdbData module that manages application movies data.
 * @param {*} cmdbData module that manages application groups data.
 * @param {*} usersData module that manages application users data.
 * @returns an object with all the avalaible application's services as properties.
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
     * Retrieves the top 250 most popular movies.
     * @param {Number} limit option parameter to limit the search result.
     */
    async function getPopularMovies(limit, page) {
        return imdbData.getPopularMoviesData(limit, page)
    }

    /**
     * Retrieves the search results by a movie name.
     * @param {String} moviesName prefix or name of the movie to search.
     * @param {Number} limit option parameter to limit the search result.
     */
    async function searchMoviesByName(moviesName, limit, page) {
        return imdbData.searchMoviesByNameData(moviesName, limit, page)
    }

    /**
     * Retrieves the details of a movie.
     * @param {Number} movieId id of the movie to search.
     */
    async function getMovieDetails(movieId) {
        return imdbData.getMovieDetails(movieId)
    }

    /**
     * Creates a group for an user.
     * @param {String} userId internal user identifier.
     * @param {Object} obj object that has the group details to create.
     * @throws InvalidArgumentException if the group is missing a valid name and description.
     */
    async function createGroup(userId, obj) {
        if (!isAString(obj.name) || !isAString(obj.description)) {
            throw errors.INVALID_ARGUMENT("group missing a valid name and description")
        }
        return cmdbData.createGroupData(obj, userId)
    }
    
    /**
     * Retrieves all groups that belong to a specified user
     * @param {String} userId internal user identifier.
     * @param {String} limit limits results by n. 
     * @param {String} page the nth page to retrieve. 
     */
    async function getGroups(userId, limit, page) {
        return cmdbData.getGroupsData(userId, limit, page)
    }
    
    /**
     * Retrieves details for the user specified group.
     * @param {String} userId internal user identifier.
     * @param {Number} groupId group identifier.
     * @param {String} limit limits results by n. 
     * @param {String} page the nth page to retrieve.
     */
    async function getGroupDetails(userId, groupId, limit, page) {
        return cmdbData.getGroupDetailsData(groupId, userId, limit, page)
    }

    /**
     * Edits the specified user group.
     * @param {String} userId internal user identifier.
     * @param {Number} groupId group identifier.
     * @param {Object} obj object that has the group details to edit.
     * @throws InvalidArgumentException if the group is missing a valid name and description
     */
    async function editGroup(userId, groupId, obj) {
        if (!isAString(obj.name) || !isAString(obj.description)) {
            throw errors.INVALID_ARGUMENT("group missing a valid name and description")
        }
        return cmdbData.editGroupData(groupId, obj, userId)
    }

    /**
     * Deletes the specified user group.
     * @param {String} userId internal user identifier.
     * @param {Number} groupId group identifier.
     */
    async function deleteGroup(userId, groupId) {
        return cmdbData.deleteGroupData(groupId, userId)
    }

    /**
     * Adds a movie in a specified user group.
     * @param {String} userId internal user identifier.
     * @param {Number} groupId group identifier.
     * @param {Number} movieId movie identifier.
     */
    async function addMovieInGroup(userId, groupId, movieId) {
        const moviesObj = await imdbData.getMovieDetails(movieId)
        return cmdbData.addMovieInGroupData(groupId, movieId, moviesObj, userId)
    }

    /**
     * Removes a movie in a user specified group
     * @param {String} userId internal user identifier.
     * @param {Number} groupId group identifier.
     * @param {Number} movieId movie identifier.
     */
    async function removeMovieInGroup(userId, groupId, movieId) {
        return cmdbData.removeMovieInGroupData(groupId, movieId, userId)
    }   

    // Auxiliary functions:
    /**
     * Middleware that verifies if the userToken is valid before calling a service.
     * @param {Function} service a function that represents a service.
     * @returns the same function but the first argument which was the usertoken will be replaced
     * by the userId.
     * @throws UserNotFoundException if the user is not found.
     */
    function verifyUser(service) {
        return async function(...args) {
            // Retrieve received arguments from the service function
            let serviceArgs = args
            // Retrieve userToken from the service arguments
            let userToken = serviceArgs[0]
            // Verify if the user exists, if there's an error the promise will be rejected and 
            // returned to the top
            let user = await usersData.getUserByUserToken(userToken)
            if (!user) {
                throw errors.USER_NOT_FOUND(userToken)
            }
            // Override first service argument, which is the userToken, with the actual user 
            // id, since the user was verified
            serviceArgs[0] = user.id
            // Call the received service function with the same arguments but with the 
            // modification described above
            return service.apply(this, serviceArgs) 
        }
    }

    /**
     * Verifies that the received value is not an empty string and is of the type String. 
     * @param {*} value value to assert.
     * @returns returns false unless the prerequisites listed above are met.
     */ 
    function isAString(value) {
        return typeof value == 'string' && value != ""
    }
}