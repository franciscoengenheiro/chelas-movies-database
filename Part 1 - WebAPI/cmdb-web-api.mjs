'use strict'

// Module that contains the functions that handle all HTTP API requests and make up the REST 
// API of the Web Application

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response

import * as cmdbServices from './cmdb-services.mjs'
import {readFile, writeFile} from 'node:fs/promises'

// Functions to export:

export const getPopularMovies = verifyAuthentication(getPopularMoviesInternal)
export const createGroup = verifyAuthentication(createGroupInternal)
/*
export const getGroups = verifyAuthentication(getGroupsInternal)
export const getGroupDetails = verifyAuthentication(getGroupDetailsInternal)
export const editGroup = verifyAuthentication(editGroupInternal)
export const deleteGroup = verifyAuthentication(deleteGroupInternal)
export const addMovieInGroup = verifyAuthentication(addMovieInGroupInternal)
export const removeMovieInGroup = verifyAuthentication(removeMovieInGroupInternal)
*/

const MOVIES_FILE = './local_data/movies.json'
const GROUP_FILE = './local_data/groups.json'
let maxId = 1

async function getPopularMoviesInternal(req, rsp) {
    let fileContents = await readFile(MOVIES_FILE)
    let moviesObj = JSON.parse(fileContents)

    if(req.query.moviesName != undefined) {
        if(!isAString(req.query.moviesName)) {
            return rsp
                    .status(400)
                    .json({error: `Invalid movie name`})
        }
        moviesObj.items = moviesObj.items.filter(movie => movie.title.includes(req.query.moviesName))
    }

    if(req.query.limit != undefined) {
        if(Number(req.query.limit) == NaN) {
            return rsp
                    .status(400)
                    .json({error: `Invalid limit value`})
        }
        moviesObj.items = moviesObj.items.filter(movie => Number(movie.rank) <= req.query.limit)
    }
    
    return rsp
            .status(200)
            .json({movies: moviesObj.items})
}

async function createGroupInternal(req, rsp) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)

    if(!isAString(req.body.name) || !isAString(req.body.description) || Number(req.body.userId) == NaN) {
        return rsp
                .status(400)
                .json({error: `Invalid group parameters`})
    }

    
    groupsObj.groups.forEach(group => {
         if(group.name == req.body.name && group.userId == req.body.userId) {
             return rsp
                    .status(400)
                     .json({error: `Group already exists`})
        }
    })

    

    req.body.id = getNewId()
    req.body.movies = []
    groupsObj.groups.push(req.body)

    await writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))
    return rsp
        .status(201)
        .json({message: `Group created`})
}

// Middleware that verifies if the client trying to access the Web API is an authorized 
// user.
function verifyAuthentication(handlerFunction) {
    // Function express calls
    return function(req, rsp) {
        // Get the value of the Authorization header
        let reqAuthString = req.get("Authorization") 
        // Retrieve token with the expected format: Bearer <token> 
        let userToken = reqAuthString ? reqAuthString.split(" ")[1] : null
        if(!userToken) { // If the token isn't valid:
            return rsp
                    .status(401) // Unauthorized 
                    .json({error: `User token must be provided`})
        }
        // Create a property in the request to retrieve the user token
        req.token = userToken 
        // Return the expected function         
        handlerFunction(req, rsp)
    }   
}

function isAString(value) {
    return typeof value == 'string' && value != ""
}

function getNewId() {
    return maxId++
}