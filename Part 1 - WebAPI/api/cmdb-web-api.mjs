// Module that contains the functions that handle all HTTP API requests and make up the REST 
// API of the Web Application

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response

'use strict'

import * as cmdbServices from '../services/cmdb-services.mjs'
import translateToHTTPResponse from './http-error-responses.mjs'

export const getPopularMovies = handleRequest(getPopularMoviesInternal)
export const searchMoviesByName = handleRequest(searchMoviesByNameInternal)
export const createGroup = handleRequest(createGroupInternal)
export const getGroups = handleRequest(getGroupsInternal)
export const getGroupDetails = handleRequest(getGroupDetailsInternal)
export const editGroup = handleRequest(editGroupInternal)
export const deleteGroup = handleRequest(deleteGroupInternal)
export const addMovieInGroup = handleRequest(addMovieInGroupInternal)
export const removeMovieInGroup = handleRequest(removeMovieInGroupInternal)

async function getPopularMoviesInternal(req, rsp) {
    return cmdbServices.getPopularMovies(req.query.limit)
}

async function searchMoviesByNameInternal(req, rsp) {
    return cmdbServices.searchMoviesByName(req.params.moviesName, req.query.limit)
}

async function createGroupInternal(req, rsp) {
    let newGroup = await cmdbServices.createGroup(req.body)
    rsp.status(201)

    return {
        message: `Group created`,
        group: newGroup
    }
}

async function getGroupsInternal(req, rsp) {
    return cmdbServices.getGroups()
}

async function getGroupDetailsInternal(req, rsp) {
    return cmdbServices.getGroupDetails(req.params.groupId)
}

async function editGroupInternal(req, rsp){
    await cmdbServices.editGroup(req.params.groupId, req.body)
    
    return {
        message: "Updated group with success"
    }
}

async function deleteGroupInternal(req, rsp) {
    await cmdbServices.deleteGroup(req.params.groupId)

    return {
        message: `Group deleted with success`
    }    
} 

async function addMovieInGroupInternal(req, rsp) {
    let newMovie = await cmdbServices.addMovieInGroup(req.params.groupId, req.params.movieId)
    rsp.status(201)

    return {
        message: `Movie added with success`,
        movie: newMovie
    }
        
}

async function removeMovieInGroupInternal(req, rsp) {
    await cmdbServices.removeMovieInGroup(req.params.groupId, req.params.movieId)
    
    return {
        message: `Movie deleted with success`
    }
            
}

function handleRequest(handler) {
    return async function(req, rsp) {
        const BEARER_STR = "Bearer "
        const tokenHeader = req.get("Authorization")
        if(!(tokenHeader && tokenHeader.startsWith(BEARER_STR) && tokenHeader.length > BEARER_STR.length)) {
            rsp
                .status(401)
                .json({error: `Invalid authentication token`})
                return
        }
        req.token = tokenHeader.split(" ")[1]
        try {
            let body = await handler(req, rsp)
            rsp
                .json(body) //status code = 200
        } catch(e) {
            const response = translateToHTTPResponse(e)
            rsp
                .status(response.status)
                .json(response.body)
        }
    }
}