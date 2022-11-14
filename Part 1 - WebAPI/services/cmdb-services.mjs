// Module that contains all of the logic of each of the application's functionalities 

'use strict'

import * as cmdbData from '../data/cmdb-movies-data.mjs'
import * as usersData from '../data/cmdb-data-mem.mjs'
import {readFile, writeFile} from 'node:fs/promises'
import errors from '../errors/errors.mjs'

// Constants
const MOVIES_INFO_FILE = '../local_data/movies-info.json'
const MOST_POPULAR_MOVIES_FILE = '../local_data/most-popular-movies.json'
const GROUPS_FILE = '../local_data/groups.json'

let maxId = 1

export async function getPopularMovies(moviesName, limit) {
    let fileContents = await readFile(MOST_POPULAR_MOVIES_FILE)
    let moviesObj = JSON.parse(fileContents)
    if (moviesName != undefined) {
        moviesObj.items = moviesObj.items.filter(movie => movie.title.includes(moviesName))
    }
    if (limit != undefined) {
        if (!isNaN(limit) && Number(limit) <= 250)
            moviesObj.items = moviesObj.items.filter(movie => Number(movie.rank) <= limit)
        else 
            throw errors.INVALID_ARGUMENT("limit")
    }
    return moviesObj.items
}

export async function createGroup(obj) {
    let fileContents = await readFile(GROUPS_FILE)
    let groupsObj = JSON.parse(fileContents)
    // TODO(missing userID validation, make a middleware function)
    if (!isAString(obj.name) || !isAString(obj.description) || isNaN(obj.userId)) {
        throw errors.INVALID_ARGUMENT("group missing a valid name and description")
    }
    groupsObj.groups.forEach(group => {
        if (group.name == obj.name && group.userId == obj.userId) 
            throw errors.INVALID_ARGUMENT("group already exists")
    })
    obj.id = getNewId()
    obj.movies = []
    groupsObj.groups.push(obj)
    return writeFile(GROUPS_FILE, JSON.stringify(groupsObj, null , 4))
}

export async function getGroups() {
    let fileContents = await readFile(GROUPS_FILE)
    let groupsObj = JSON.parse(fileContents)
    groupsObj.groups = groupsObj.groups.map(group => {
        return {
            name: group.name,
            description: group.description
        }
    })
    return groupsObj.groups
}

export async function getGroupDetails(groupId) {
    let fileContents = await readFile(GROUPS_FILE)
    let groupsObj = JSON.parse(fileContents)
    let totalDuration = 0
    if (isNaN(groupId)) {
        throw errors.INVALID_ARGUMENT("groupId")
    }
    let group = groupsObj.groups.find(group => groupId == group.id)
    if (group == undefined) {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    let newGroup = {
        name: group.name,
        description: group.description,
        movies: group.movies.map(movie => {
            totalDuration += movie.duration
            return {title: movie.title}
        }),
        moviesTotalDuration: totalDuration
    }
    return newGroup
}

export async function editGroup(groupId, obj) {
    let fileContents = await readFile(GROUPS_FILE)
    let groupsObj = JSON.parse(fileContents)
    let found = false
    if (!isAString(obj.name) || !isAString(obj.description)){
        throw errors.INVALID_ARGUMENT("group missing a valid name and description")
    }
    if (isNaN(groupId)){
        throw errors.INVALID_ARGUMENT("group Id")
    }
    groupsObj.groups = groupsObj.groups.map(group => {
        if(group.id == Number(groupId)){
            group.name = obj.name
            group.description = obj.description
            found = true
        }
        return group
    })
    if (!found){
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    return writeFile(GROUPS_FILE, JSON.stringify(groupsObj, null , 4))
}

export async function deleteGroup(groupId) {
    let fileContents = await readFile(GROUPS_FILE)
    let groupsObj = JSON.parse(fileContents)
    if (isNaN(groupId)){
        throw errors.INVALID_ARGUMENT("group Id")
    }
    let groupIndex = groupsObj.groups.findIndex(group => group.id == groupId)
    if (groupIndex < 0){
        throw errors.ARGUMENT_NOT_FOUND("group")
    } else {
        groupsObj.groups.splice(groupIndex, 1) 
        return writeFile(GROUPS_FILE, JSON.stringify(groupsObj, null , 4))   
    }           
}

export async function addMovieInGroup(groupId, movieId) {
    // Read from files:
    let fileContents = await readFile(GROUPS_FILE)
    let groupsObj = JSON.parse(fileContents)
    fileContents = await readFile(MOVIES_INFO_FILE)
    let moviesObj = JSON.parse(fileContents)
    // Booleans:
    let foundMovie = false
    let foundGroup = false
    if (isNaN(groupId)) {
        throw errors.INVALID_ARGUMENT("group Id")
    }
    groupsObj.groups = groupsObj.groups.map(group =>{ 
        if (group.id == groupId) {
            foundGroup = true
            if (group.movies.find(movie => movie.id == movieId) != undefined) {
                throw errors.INVALID_ARGUMENT("movie already exists in this group")
            }
            let getMovie = moviesObj.movies.find(movie => movie.id == movieId)
            if (getMovie != undefined) {
                foundMovie = true
                let newMovie = {
                    id: getMovie.id,
                    title: getMovie.title,
                    duration: getMovie.runtimeMins
                }
                group.movies.push(newMovie)
            }
        }
        return group
    }) 
    if(foundMovie && foundGroup) {
        return writeFile(GROUPS_FILE, JSON.stringify(groupsObj, null , 4))
    }
    else if(!foundGroup){
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
    else {
        throw errors.ARGUMENT_NOT_FOUND("movie")
    }
}

export async function removeMovieInGroup(groupId, movieId) {
    let fileContents = await readFile(GROUPS_FILE)
    let groupsObj = JSON.parse(fileContents)    
    if (isNaN(groupId)){
        throw errors.INVALID_ARGUMENT("group")
    }
    let group = groupsObj.groups.find(group => groupId == group.id)
    if (group != undefined) {
        let movieIndex = group.movies.findIndex(movie => movie.id == movieId)
        if (movieIndex < 0){
            throw errors.ARGUMENT_NOT_FOUND("movie")
        } 
        else {
            group.movies.splice(movieIndex, 1)
            return writeFile(GROUPS_FILE, JSON.stringify(groupsObj, null , 4))
        }
    } else {
        throw errors.ARGUMENT_NOT_FOUND("group")
    }
}

// Auxiliary functions
function isAString(value) {
    return typeof value == 'string' && value != ""
}

function getNewId() {
    return maxId++
}