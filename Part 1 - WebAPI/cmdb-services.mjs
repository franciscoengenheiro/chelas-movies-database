'use strict'

// Module that contains all of the logic of each of the application's functionalities 

import * as cmdbData from './cmdb-movies-data.mjs'
import * as usersData from './cmdb-data-mem.mjs'
import {readFile, writeFile} from 'node:fs/promises'

const MOVIES_INFO = '../local_data/moviesInfo.json'
const MOVIES_FILE = '../local_data/movies.json'
const GROUP_FILE = '../local_data/groups.json'
let maxId = 1

export async function getPopularMovies(moviesName, limit) {
    let fileContents = await readFile(MOVIES_FILE)
    let moviesObj = JSON.parse(fileContents)

    if(moviesName != undefined) {
        moviesObj.items = moviesObj.items.filter(movie => movie.title.includes(moviesName))
    }

    if(limit != undefined) {
        if(!isNaN(limit) && Number(limit) <= 250){
            moviesObj.items = moviesObj.items.filter(movie => Number(movie.rank) <= limit)
        }else{
            throw "Invalid limit"
        }
    }

    return moviesObj.items
}

export async function createGroup(obj) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)

    
    if(!isAString(obj.name) || !isAString(obj.description) || isNaN(obj.userId)) {
        throw `Invalid group parameters`
    }

    groupsObj.groups.forEach(group => {
            if(group.name == obj.name && group.userId == obj.userId) {
                throw `Group already exists`
        }
    })
    obj.id = getNewId()
    
    obj.movies = []
    groupsObj.groups.push(obj)

    return writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))
}

export async function getGroups() {
    let fileContents = await readFile(GROUP_FILE)
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
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)
    let totalDuration = 0

    if(isNaN(groupId)) {
        throw 'Invalid Id value/400'
    }

    let group = groupsObj.groups.find(group => groupId == group.id)

    if(group == undefined) {
        throw 'Group Not Found/404'
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
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)
    let found = false

    if(!isAString(obj.name) || !isAString(obj.description)){
        throw "Request body invalid/400"
    }

    if(isNaN(groupId)){
        throw "Parameter invalid/400"
    }

    groupsObj.groups = groupsObj.groups.map(group => {
        if(group.id == Number(groupId)){
            group.name = obj.name
            group.description = obj.description
            found = true
        }
        return group
    })

    if(!found){
        throw 'Group Not Found/404'
    }

    return writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))
}

export async function deleteGroup(groupId) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)

    let receivedID = groupId
    // Find returns undefined if the given predicate does not match any element in the array
    if (isNaN(receivedID)){
        throw "Invalid group Id/400"
    }

    let groupIndex = groupsObj.groups.findIndex(group => group.id == receivedID)
    if (groupIndex < 0){
        throw 'Group Not Found/404'
    } else {
        // At the found group index, remove
        groupsObj.groups.splice(groupIndex, 1) 
        return writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))   
    }           
}

export async function addMovieInGroup(groupId, movieId) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)
    fileContents = await readFile(MOVIES_INFO)
    let moviesObj = JSON.parse(fileContents)

    let foundMovie = false
    let foundGroup = false

    let receivedGroupID = groupId
    let receivedMovieID = movieId

    if (isNaN(receivedGroupID)) {
        throw "Invalid group Id/400"
    }

    groupsObj.groups = groupsObj.groups.map(group =>{ 
        if(group.id == receivedGroupID) {
            foundGroup = true

            if (group.movies.find(movie => movie.id == receivedMovieID) != undefined) {
                throw "Movie already exists in this group/400"
            }

            let getMovie = moviesObj.movies.find(movie => movie.id == receivedMovieID)
            if(getMovie != undefined) {
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
        return writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))
    }
    else if(!foundGroup){
        throw 'Group Not Found/404'
    }
    else {
        throw 'Movie Not Found/404'
    }
}

export async function removeMovieInGroup(groupId, movieId) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)

    let receivedGroupID = groupId
    let receivedMovieID = movieId
    
    if (isNaN(receivedGroupID)){
        throw "Invalid group Id/400"
    }

    let group = groupsObj.groups.find(group => receivedGroupID == group.id)

    if(group != undefined) {
        let movieIndex = group.movies.findIndex(movie => movie.id == receivedMovieID)
        if (movieIndex < 0){
            throw 'Movie Not Found/404'
        } 
        else {
            group.movies.splice(movieIndex, 1)
            return writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))
        }
    }
    else {
        throw 'Group Not Found/404'
    }
}

// Auxiliary functions
function isAString(value) {
    return typeof value == 'string' && value != ""
}

function getNewId() {
    return maxId++
}