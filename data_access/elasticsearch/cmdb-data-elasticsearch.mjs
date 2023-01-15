// Module that handles elastic search data access and manipulation regarding the groups
'use strict'

import errors from '#errors/errors.mjs'
import elasticSearchInit from '#data_access/elasticSearch/elastic-search-util.mjs'
import {get, post, put, del} from '#data_access/elasticSearch/fetch-wrapper.mjs'

// Initialize elastic search index
const elasticSearch = elasticSearchInit('groups')

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
    
    /**
     * Creates a new group for an user in the elastic search database.
     * @param {Object} obj object that has the group details to create.
     * @param {Number} userId user internal identifier.
     * @returns the group created.
     */
    async function createGroupData(obj, userId) {
        // Create properties for the new group
        obj.movies = []
        obj.userId = userId
        await post(elasticSearch.createDoc(), obj)
        return obj
    }

    /**
     * Searchs all groups of an user using a query body.
     * @param {Number} userId user internal identifier.
     * @returns an array with the search result.
     */
    async function getGroupsData(userId) {
        const query = {
            "query": {
                "match": {
                    "userId.keyword": userId
                }
            }
        }
        // Query elastic search
        let groupsObj = await post(elasticSearch.searchDocs(), query)

        // Retrieve only the groups that belong to the user and modify each group object
        // to only show selected properties
        let retrievedGroups = groupsObj.hits.hits
            .map(group => {
                return {
                    id: group._id, 
                    name: group._source.name,
                    description: group._source.description
                }
            })
        return retrievedGroups
    }

    /**
     * Searchs in elastic search database a group details of an user.
     * @param {Number} groupId group identifier.
     * @param {Number} userId user internal identifier.
     * @returns the group found.
     * @throws ArgumentNotFoundException if the group wasn't found.
     * @throws InvalidUserException if the user is not found.
     */
    async function getGroupDetailsData(groupId, userId) {
        // Retrieve user group
        let groupsObj = await get(elasticSearch.getDoc(groupId))
        // Checks if group exists
        if (!groupsObj.found) {
            throw errors.ARGUMENT_NOT_FOUND("group")
        }
        // Checks if the group is from the given user
        if(groupsObj._source.userId != userId) {
            throw errors.INVALID_USER("userId")
        }
        // Start a counter
        let totalDuration = 0
        // Create the new group
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
     * Searchs in the elastic search database for the received user group and replaces 
     * that group for the new one.
     * @param {Number} groupId group identifier.
     * @param {Object} obj object that has the group details to edit.
     * @param {Number} userId user internal identifier.
     * @returns the edited group.
     * @throws ArgumentNotFoundException if the group wasn't found.
     * @throws InvalidUserException if the user is not found.
     */
    async function editGroupData(groupId, obj, userId) {
        let groupObj = await get(elasticSearch.getDoc(groupId))
        // Checks if group exists
        if (!groupObj.found) {
            throw errors.ARGUMENT_NOT_FOUND("group")
        }
        // Checks if the group is from the corresponding user
        if(groupObj._source.userId != userId) {
            throw errors.INVALID_USER("userId")
        }
        // Override group properties
        groupObj._source.name = obj.name
        groupObj._source.description = obj.description
        groupObj = await put(elasticSearch.editDoc(groupId), groupObj._source)
        return groupObj._source
    }

    /**
     * Deletes a user specified group in the elastic search database.
     * @param {Number} groupId group identifier.
     * @param {Number} userId user internal identifier.
     * @returns the deleted group.
     * @throws ArgumentNotFoundException if the group wasn't found.
     * @throws InvalidUserException if the user is not found.
     */
    async function deleteGroupData(groupId, userId) {
        let groupsObj = await get(elasticSearch.getDoc(groupId))
        // Checks if group exists
        if (groupsObj.result == "not found") {
            throw errors.ARGUMENT_NOT_FOUND("group")
        }
        // Checks if the group is from the given user
        if(groupsObj._source.userId != userId) {
            throw errors.INVALID_USER("userId")
        }
        // Delete group 
        return del(elasticSearch.deleteDoc(groupId))
    }

    /**
     * Adds a movie in a user specified group in the elastic search database.
     * @param {Number} groupId group identifier.
     * @param {Number} movieId movie identifier.
     * @param {Object} moviesObj object that represents the movie details to add.
     * @param {Number} userId user internal identifier.
     * @throws InvalidArgumentException if the movie already exists in the group.
     * @throws InvalidUserException if the user is not found.
     * @throws ArgumentNotFoundException if the either the group or movie weren't found.
     */
    async function addMovieInGroupData(groupId, movieId, moviesObj, userId) {
        let groupObj = await get(elasticSearch.getDoc(groupId)) 
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
        await put(elasticSearch.editDoc(groupId), groupObj._source) 
    }

    /**
     * Removes a movie in a user specified group in the elastic search database.
     * @param {Number} groupId group identifier.
     * @param {Number} movieId movie identifier.
     * @param {Number} userId user internal identifier.
     * @throws ArgumentNotFoundException if the either the group or movie weren't found.
     * @throws InvalidUserException if the user is not found.
     */
    async function removeMovieInGroupData(groupId, movieId, userId) {
        let groupsObj = await get(elasticSearch.getDoc(groupId))
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
            return put(elasticSearch.editDoc(groupId), groupsObj._source)
        }
    }
}