// Module that manages and provides access to the application's group internal data
// stored in memory (local_storage)

'use strict'

import errors from '#errors/errors.mjs'
import * as File from '#data_access/util/file-operations.mjs'
import * as dataManipulation from '#data_manipulation/cmdb-data-man.mjs'

// Constants
const GROUPS_FILE = './data/local/groups.json'

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
 * Creates a new group for an user.
 * @param {Object} obj object that has the group details to create.
 * @param {Number} userId user internal identifier.
 * @returns the created group.
 */
async function createGroupData(obj, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Retrieve the new group Id 
    const newGroupID = ++groupsObj.IDs
    // Create properties for the new group
    const newGroup = dataManipulation.createGroup(Object.assign({
        id: newGroupID,
        userId: userId
    }, obj))
    // Store newly created group  
    groupsObj.groups.push(newGroup)
    // Write to file
    await File.write(groupsObj, GROUPS_FILE)
    return newGroup
}

/**
 * Searchs for all groups that belong to a specified user.
 * @param {Number} userId user internal identifier.
 * @param {Number} limit limits results.
 * @param {Number} page the nth page to retrieve.
 * @returns all groups found.
 */
async function getGroupsData(userId, limit, page) {
    const groupsObj = await File.read(GROUPS_FILE)
    // Retrieve only the groups that belong to the user
    const groups = groupsObj.groups.filter(group => group.userId == userId)
    return dataManipulation.getGroups(groups, null, limit, page)
}

/**
 * Searchs the details of user group.
 * @param {Number} groupId group identifier.
 * @param {Number} userId user internal identifier.
 * @param {Number} limit limits results.
 * @param {Number} page the nth page to retrieve.
 * @returns The details of the group.
 */
async function getGroupDetailsData(groupId, userId, limit, page) {
    const groupsObj = await File.read(GROUPS_FILE)
    // Find the group index within the groups array
    const groupIndex = findGroupIndex(groupsObj.groups, groupId, userId)
    // Grab group
    const group = groupsObj.groups[groupIndex]
    return dataManipulation.getGroupDetails(group, limit, page)
}

/**
 * Searchs for the received user group and replaces that group
 * for the new one.
 * @param {Number} groupId group identifier.
 * @param {Object} obj object that has the group details to edit.
 * @param {Number} userId user internal identifier.
 * @returns the edited group.
 */
async function editGroupData(groupId, obj, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Find the group index within the groups array
    const groupIndex = findGroupIndex(groupsObj.groups, groupId, userId)
    // Grab group
    const group = groupsObj.groups[groupIndex]
    const newGroup = dataManipulation.editGroup(group, obj)
    // Replaces the old group with the updated one
    replaceInPlace(groupsObj.groups, groupIndex, newGroup)
    await File.write(groupsObj, GROUPS_FILE)
    return newGroup
}

/**
 * Deletes a user specified group.
 * @param {Number} groupId group identifier.
 * @param {Number} userId user internal identifier.
 */
async function deleteGroupData(groupId, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Find the group within the groups array
    const groupIndex = findGroupIndex(groupsObj.groups, groupId, userId)
    // Remove the group from the array
    groupsObj.groups.splice(groupIndex, 1)
    return File.write(groupsObj, GROUPS_FILE)
}

/**
 * Adds a movie in a user specified group.
 * @param {Number} groupId group identifier.
 * @param {Number} movieId movie identifier.
 * @param {Object} moviesObj object that represents the movie details to add.
 * @param {Number} userId user internal identifier.
 * @returns the newly added movie.
 * @throws InvalidArgumentException if the movie already exists in the group.
 */
async function addMovieInGroupData(groupId, movieId, movieObj, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Find the group index within the groups array    
    const groupIndex = findGroupIndex(groupsObj.groups, groupId, userId)
    // Grab group
    let group = groupsObj.groups[groupIndex]
    // Assert if the movie to add already exists in this group
    const movieIndex = group.movies.findIndex(movie => movie.id == movieId)
    if (movieIndex >= 0) {
        throw errors.INVALID_ARGUMENT("movie already exists in this group")
    }
    const newMovie = dataManipulation.addMovieInGroup(group, movieObj)
    // Remove the group from the array
    replaceInPlace(groupsObj.groups, groupIndex, group)
    await File.write(groupsObj, GROUPS_FILE)
    return newMovie
}

/**
 * Removes a movie in a user specified group. 
 * @param {Number} groupId group identifier.
 * @param {Number} movieId movie identifier.
 * @param {Number} userId user internal identifier.
 * @throws ArgumentNotFoundException if the movie was not found.
 */
async function removeMovieInGroupData(groupId, movieId, userId) {
    let groupsObj = await File.read(GROUPS_FILE)
    // Find the group within the groups array
    const groupIndex = findGroupIndex(groupsObj.groups, groupId, userId)
    const group = groupsObj.groups[groupIndex]
    // Find the index of the movie to delete
    let movieIndex = group.movies.findIndex(movie => movie.id == movieId)
    if (movieIndex < 0) {
        throw errors.ARGUMENT_NOT_FOUND("movie")
    }
    dataManipulation.removeMovieInGroup(group, movieIndex)
    return File.write(groupsObj, GROUPS_FILE)
}

// Auxiliary Functions
/**
 * @param {Array} groups the array that contains all groups.
 * @param {Number} groupId group identifier.
 * @param {Number} userId user internal identifier.
 * @returns the index where the group can be found.
 * @throws ArgumentNotFoundException if the group wasn't found.
 */
function findGroupIndex(groups, groupId, userId) {
    const groupIndex = groups.findIndex(
        group => group.id == groupId && group.userId == userId
    )
    if (groupIndex < 0) {
        throw errors.ARGUMENT_NOT_FOUND("group")
    } 
    return groupIndex
}
/**
 * Replaces an item in an array, given by its index, with another item.
 * The replacement happens in place, which means this operation will modify the given array.
 * @param {Array} array an array.
 * @param {Number} index index of the array where replacement will happen.
 * @param {Number} item item to replace the old value with.
 */
function replaceInPlace(array, index, item) {
    return array.splice(index, 1, item)
}