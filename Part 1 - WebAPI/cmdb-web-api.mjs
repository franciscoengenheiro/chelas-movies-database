'use strict'

// Module that contains the functions that handle all HTTP API requests and make up the REST 
// API of the Web Application

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response

import * as cmdbServices from './cmdb-services.mjs'
import {readFile, writeFile} from 'node:fs/promises'
import { group } from 'node:console'

// Functions to export:

export const getPopularMovies = verifyAuthentication(getPopularMoviesInternal)
export const createGroup = verifyAuthentication(createGroupInternal)
export const getGroups = verifyAuthentication(getGroupsInternal)
export const getGroupDetails = verifyAuthentication(getGroupDetailsInternal)
export const editGroup = verifyAuthentication(editGroupInternal)
export const deleteGroup = verifyAuthentication(deleteGroupInternal)
/*
export const addMovieInGroup = verifyAuthentication(addMovieInGroupInternal)
export const removeMovieInGroup = verifyAuthentication(removeMovieInGroupInternal)
*/

const MOVIES_FILE = '../local_data/movies.json'
const GROUP_FILE = '../local_data/groups.json'
let maxId = 1

async function getPopularMoviesInternal(req, rsp) {
    let fileContents = await readFile(MOVIES_FILE)
    let moviesObj = JSON.parse(fileContents)  

    if(req.query.moviesName != undefined) {
        moviesObj.items = moviesObj.items.filter(movie => movie.title.includes(req.query.moviesName))
    }
    
    try{
        if(req.query.limit != undefined){
            if(!isNaN(req.query.limit) && Number(req.query.limit) <= 250){
                moviesObj.items = moviesObj.items.filter(movie => Number(movie.rank) <= req.query.limit)
            }else{
                throw "Invalid limit"
            }
        }
    
        return rsp
                .status(200)
                .json({movies: moviesObj.items})
    }catch(e){
        return rsp
                .status(400)
                .json({error: `Error getting movies: ${e}`})
    }
}

async function createGroupInternal(req, rsp) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)

    try{
        if(!isAString(req.body.name) || !isAString(req.body.description) || isNaN(req.body.userId)) {
            throw `Invalid group parameters`
        }
    
        groupsObj.groups.forEach(group => {
             if(group.name == req.body.name && group.userId == req.body.userId) {
                 throw `Group already exists`
            }
        })
        req.body.id = getNewId()
        
        req.body.movies = []
        groupsObj.groups.push(req.body)
    
        await writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))
        return rsp
            .status(201)
            .json({message: `Group created`})
    }catch(e){
        return rsp
                .status(400)
                .json({error: `Error creating group: ${e}`})
    }
}

async function getGroupsInternal(req, rsp) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)

    groupsObj.groups = groupsObj.groups.map(group => {
        return {
            name: group.name,
            description: group.description
        }
    })

    return rsp
            .status(200)
            .json({groups: groupsObj.groups})
}

async function getGroupDetailsInternal(req, rsp) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)
    let totalDuration = 0

    try{
        if(isNaN(req.params.groupId)) {
            throw 'Invalid Id value'
        }

        let group = groupsObj.groups.find(group => req.params.groupId == group.id)

        if(group == undefined) {
            return rsp
                    .status(404)
                    .json({error: `Group Not Found`})
        }
        else {
            let newGroup = {
                name: group.name,
                description: group.description,
                movies: group.movies.map(movie => {
                    totalDuration += movie.duration
                    return {title: movie.title}
                }),
                moviesTotalDuration: totalDuration
            }

            return rsp
                    .status(200)
                    .json({group: newGroup})
        }
    }
    catch(e){
        return rsp
                .status(400)
                .json({error: `${e}`})
    }
}

async function editGroupInternal(req, rsp){
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)
    let found = false

    try{

        if(!isAString(req.body.name) || !isAString(req.body.description)){
            throw "Request body invalid"
        }

        if(isNaN(req.params.groupId)){
            throw "Parameter invalid"
        }

        groupsObj.groups = groupsObj.groups.map(group => {
            if(group.id == Number(req.params.groupId)){
                group.name = req.body.name
                group.description = req.body.description
                found = true
            }
            return group
        })

        if(found){
            await writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))
            return rsp
                    .status(200)
                    .json({Message: "Updated group with sucess"})
        }else{
            return rsp  
                .status(404)
                .json({Error: `Group not found`})
        }

    }catch(e){
        return rsp  
                .status(400)
                .json({Error: `${e}`})
    }

}

async function deleteGroupInternal(req, rsp) {
    let fileContents = await readFile(GROUP_FILE)
    let groupsObj = JSON.parse(fileContents)

    try {
        let receivedID = req.params.groupId
        // Find returns undefined if the given predicate does not match any element in the array
        if (isNaN(receivedID)){
            throw "Invalid group Id"
        }
        let groupIndex = groupsObj.groups.findIndex(group => group.id == receivedID)
        if (groupIndex < 0){
            return rsp
                    .status(404)
                    .json({Error: "Group not found"})
        } else {
            // At the found group index, remove
            groupsObj.groups.splice(groupIndex, 1) 
            await writeFile(GROUP_FILE, JSON.stringify(groupsObj, null , 4))
            return rsp
                .status(200)
                .json({message: `Group deleted with sucess`})    
        }           
    } catch(e) {
        return rsp
            .status(400)
            .json({error: `${e}`})
    }   
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