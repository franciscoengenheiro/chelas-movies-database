// Module that handles elastic search data access regarding groups

'use strict'

import errors from '#errors/errors.mjs'
import elasticSearchInit from '#data_access/elasticSearch/elasticsearch-util.mjs'
import {get, post, put, del} from '#data_access/elasticSearch/fetch-wrapper.mjs'
import * as dataManipulation from '#data_manipulation/cmdb-data-man.mjs'

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
     * Creates a new group for an user.
     * @param {Object} obj object that has the group details to create.
     * @param {String} userId user internal identifier.
     * @returns the created group.
     */
    async function createGroupData(obj, userId) {
        const newGroup = dataManipulation.createGroup(Object.assign( { userId: userId }, obj))
        await post(elasticSearch.createDoc(), newGroup)
        return newGroup
    }

    /**
     * Searchs for all groups that belong to a specified user.
     * @param {String} userId user internal identifier.
     * @param {Number} limit limits results.
     * @param {Number} page the nth page to retrieve.
     * @returns all groups found.
     */
    async function getGroupsData(userId, limit, page) {
        const query = {
            "query": {
                "match": {
                    "userId.keyword": userId
                }
            }
        }
        // Query elastic search for all groups of the given userId
        let groupsObj = await post(elasticSearch.searchDocs(), query)
        let container = {
            id: '_id',
            source: '_source'
        }
        return dataManipulation.getGroups(groupsObj.hits.hits, container, limit, page)
    }

    /**
     * Searchs the details of user group.
     * @param {String} groupId group identifier.
     * @param {String} userId user internal identifier.
     * @param {Number} limit limits results.
     * @param {Number} page the nth page to retrieve.
     * @returns The details of the group.
     */
    async function getGroupDetailsData(groupId, userId, limit, page) {
        // Retrieve user group
        let groupObj = await get(elasticSearch.getDoc(groupId))
        // Checks if a valid group was retrieved
        checkIfGroupIsFromUser(groupObj, userId, groupObj.found)
        return dataManipulation.getGroupDetails(groupObj._source, limit, page)
    }

    /**
     * Searchs for the received user group and replaces that group
     * for the new one.
     * @param {String} groupId group identifier.
     * @param {Object} obj object that has the group details to edit.
     * @param {String} userId user internal identifier.
     * @returns the edited group.
     */
    async function editGroupData(groupId, obj, userId) {
        let groupObj = await get(elasticSearch.getDoc(groupId))
        checkIfGroupIsFromUser(groupObj, userId, groupObj.found)
        const newGroup = dataManipulation.editGroup(groupObj._source, obj)
        groupObj = await put(elasticSearch.editDoc(groupId), newGroup)
        return groupObj._source
    }

    /**
     * Deletes a user specified group.
     * @param {String} groupId group identifier.
     * @param {String} userId user internal identifier.
     */
    async function deleteGroupData(groupId, userId) {
        let groupObj = await get(elasticSearch.getDoc(groupId))
        checkIfGroupIsFromUser(groupObj, userId, groupObj.result != "not found")
        // Delete group 
        return del(elasticSearch.deleteDoc(groupId))
    }

    /**
     * Adds a movie in a user specified group.
     * @param {String} groupId group identifier.
     * @param {String} movieId movie identifier.
     * @param {Object} moviesObj object that represents the movie details to add.
     * @param {String} userId user internal identifier.
     * @returns the newly added movie.
     * @throws InvalidArgumentException if the movie already exists in the group.
     */
    async function addMovieInGroupData(groupId, movieId, moviesObj, userId) {
        let groupObj = await get(elasticSearch.getDoc(groupId))
        checkIfGroupIsFromUser(groupObj, userId, groupObj.found)
        if (groupObj._source.movies.find(movie => movie.id == movieId) != undefined) {
            throw errors.INVALID_ARGUMENT("movie already exists in this group")
        }
        const newMovie = dataManipulation.addMovieInGroup(groupObj._source, moviesObj)
        await put(elasticSearch.editDoc(groupId), groupObj._source)
        return newMovie
    }

    /**
     * Removes a movie in a user specified group. 
     * @param {String} groupId group identifier.
     * @param {String} movieId movie identifier.
     * @param {String} userId user internal identifier.
     * @throws ArgumentNotFoundException if the movie was not found.
     */
    async function removeMovieInGroupData(groupId, movieId, userId) {
        let groupObj = await get(elasticSearch.getDoc(groupId))
        checkIfGroupIsFromUser(groupObj, userId, groupObj.result != "not found")
        // Find the index of the movie to delete
        let movieIndex = groupObj._source.movies.findIndex(movie => movie.id == movieId)
        if (movieIndex < 0) {
            throw errors.ARGUMENT_NOT_FOUND("movie")
        }
        // Remove movie from the movies array 
        dataManipulation.removeMovieInGroup(groupObj._source, movieIndex)
        return put(elasticSearch.editDoc(groupId), groupObj._source)
    }
}

// Auxiliary Functions:
/**
 * @param {Object} groupObj an object that represents the result of group document query.
 * @param {String} userId user internal identifier.
 * @param {Boolean} expression an expression that evaluates if the group was found.
 * @throws ArgumentNotFoundException if the group does not exist.
 * @throws InvalidUserException if the group does not belong to this user.
 */
function checkIfGroupIsFromUser(groupObj, userId, expression) {
    // Checks if a valid group was retrieved
    if (!expression) {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    // Checks if the retrieved group is from the given user
    if (groupObj._source.userId != userId) {
        throw errors.INVALID_USER("userId")
    }
}