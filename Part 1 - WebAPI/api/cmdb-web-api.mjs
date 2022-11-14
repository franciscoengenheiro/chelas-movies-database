// Module that contains the functions that handle all HTTP API requests and make up the REST 
// API of the Web Application

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response

'use strict'

import * as cmdbServices from '../services/cmdb-services.mjs'
import translateToHTTPResponse from './http-error-responses.mjs'

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
    } catch(e) {
        let ret = translateToHTTPResponse(e)
        rsp.status(ret.status).json(ret.body)
    }
}

async function createGroupInternal(req, rsp) {
    try{
        await cmdbServices.createGroup(req.body)
        return rsp
            .status(201)
            .json({message: `Group created`})
    } catch(e) {
        let ret = translateToHTTPResponse(e)
        rsp.status(ret.status).json(ret.body)
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
    } catch(e) {
        let ret = translateToHTTPResponse(e)
        rsp.status(ret.status).json(ret.body)
    }
}

async function editGroupInternal(req, rsp){
    try{
        await cmdbServices.editGroup(req.params.groupId, req.body)
        rsp
            .status(200)
            .json({Message: "Updated group with success"})
    } catch(e) {
        let ret = translateToHTTPResponse(e)
        rsp.status(ret.status).json(ret.body)
    }
}

async function deleteGroupInternal(req, rsp) {
    try {
        await cmdbServices.deleteGroup(req.params.groupId)
        rsp
            .status(200)
            .json({message: `Group deleted with success`})           
    } catch(e) {
        let ret = translateToHTTPResponse(e)
        rsp.status(ret.status).json(ret.body)
    }   
} 

async function addMovieInGroupInternal(req, rsp) {
    try {
        await cmdbServices.addMovieInGroup(req.params.groupId, req.params.movieId)
        rsp
            .status(201)
            .json({message: `Movie added with success`})
    } catch(e) {
        let ret = translateToHTTPResponse(e)
        rsp.status(ret.status).json(ret.body)
    }
}

async function removeMovieInGroupInternal(req, rsp) {
    try {
        await cmdbServices.removeMovieInGroup(req.params.groupId, req.params.movieId)
        rsp
            .status(200)
            .json({message: `Movie deleted with success`})
            
    } catch(e) {
        let ret = translateToHTTPResponse(e)
        rsp.status(ret.status).json(ret.body)
    }
}

// TODO(mudar esta função")
// Middleware that verifies if the client trying to access the Web API is a valid token.
function verifyAuthentication(handlerFunction) {
    // Function called by express
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