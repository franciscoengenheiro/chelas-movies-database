'use strict'

// Module that contains the functions that handle all HTTP API requests and make up the REST 
// API of the Web Application

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response

import * as cmdbServices from './cmdb-services.mjs'

// Functions to export:

export const getPopularMovies = verifyAuthentication(getPopularMoviesInternal)
export const createGroup = verifyAuthentication(createGroupInternal)
export const getGroups = verifyAuthentication(getGroupsInternal)
export const getGroupDetails = verifyAuthentication(getGroupDetailsInternal)
export const editGroup = verifyAuthentication(editGroupInternal)
export const deleteGroup = verifyAuthentication(deleteGroupInternal)
export const addMovieInGroup = verifyAuthentication(addMovieInGroupInternal)
export const removeMovieInGroup = verifyAuthentication(removeMovieInGroupInternal)


async function getPopularMoviesInternal(req, rsp) {
    try{
        let movies = await cmdbServices.getPopularMovies(req.query.moviesName, req.query.limit)
    
        rsp
            .status(200)
            .json({movies: movies})
    }catch(e){
        rsp
            .status(400)
            .json({error: `Error getting movies: ${e}`})
    }
}

async function createGroupInternal(req, rsp) {
    try{
        await cmdbServices.createGroup(req.body)

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
    let groups = await cmdbServices.getGroups()

    rsp
        .status(200)
        .json({groups: groups})
}

async function getGroupDetailsInternal(req, rsp) {
    try{
        let groupDetails = await cmdbServices.getGroupDetails(req.params.groupId)

        rsp
            .status(200)
            .json({group: groupDetails})
    }
    catch(e){
        let error = e.split('/')
        rsp
            .status(Number(error[1]))
            .json({error: `${error[0]}`})
    }
}

async function editGroupInternal(req, rsp){
    try{
        await cmdbServices.editGroup(req.params.groupId, req.body)

        rsp
            .status(200)
            .json({Message: "Updated group with success"})

    }catch(e){
        let error = e.split('/')
        rsp
            .status(Number(error[1]))
            .json({error: `${error[0]}`})
    }

}

async function deleteGroupInternal(req, rsp) {
    try {
        await cmdbServices.deleteGroup(req.params.groupId)

        rsp
            .status(200)
            .json({message: `Group deleted with success`})           
    } catch(e) {
        let error = e.split('/')
        rsp
            .status(Number(error[1]))
            .json({error: `${error[0]}`})
    }   
} 

async function addMovieInGroupInternal(req, rsp) {
    try {
        await cmdbServices.addMovieInGroup(req.params.groupId, req.params.movieId)

        rsp
            .status(200)
            .json({message: `Movie added with success`})

    } catch(e){
        let error = e.split('/')
        rsp
            .status(Number(error[1]))
            .json({error: `${error[0]}`})
    }
}

async function removeMovieInGroupInternal(req, rsp) {
    try {
        await cmdbServices.removeMovieInGroup(req.params.groupId, req.params.movieId)

        rsp
            .status(200)
            .json({message: `Movie deleted with sucess`})
            
    } catch(e) {
        let error = e.split('/')
        rsp
            .status(Number(error[1]))
            .json({error: `${error[0]}`})
    }
}

// Middleware that verifies if the client trying to access the Web API is an valid token.
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