// Module that contains the functions that handle all HTTP API requests and make up the REST 
// API of the Web Application

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response in JSON format

'use strict'

import errors from '../errors/errors.mjs'
import translateToHTTPResponse from './http-error-responses.mjs'

/**
 * @param {*} cmdbServices module that contains all application services
 * @param {*} cmdbUserServices module that contains all application user services
 * @returns an object with all the functions Express module can call, has properties, when a user makes a request
 */
export default function(cmdbServices, cmdbUserServices){
    // Validate if all the received services exist
    if (!cmdbServices) {
        throw errors.INVALID_ARGUMENT("cmdbServices")
    }
    if (!cmdbUserServices) {
        throw errors.INVALID_ARGUMENT("cmdbUserServices")
    }

    return {
        createUser: handleRequest(createUserInternal),
        getPopularMovies: handleRequest(getPopularMoviesInternal),
        searchMoviesByName: handleRequest(searchMoviesByNameInternal),
        createGroup: handleRequest(createGroupInternal),
        getGroups: handleRequest(getGroupsInternal),
        getGroupDetails: handleRequest(getGroupDetailsInternal),
        editGroup: handleRequest(editGroupInternal),
        deleteGroup: handleRequest(deleteGroupInternal),
        addMovieInGroup: handleRequest(addMovieInGroupInternal),
        removeMovieInGroup: handleRequest(removeMovieInGroupInternal)
    }

    // Functions:
    async function createUserInternal(req, rsp) {
        let newUser = await cmdbUserServices.createUser(req.token)  
        rsp.status(201)
        return {
            message: `User created`,
            newUser: newUser
        }
    }

    async function getPopularMoviesInternal(req, rsp) {
        return cmdbServices.getPopularMovies(req.query.limit)
    }

    async function searchMoviesByNameInternal(req, rsp) {
        return cmdbServices.searchMoviesByName(req.params.moviesName, req.query.limit)
    }

    async function createGroupInternal(req, rsp) {
        let newGroup = await cmdbServices.createGroup(req.body, req.token)
        rsp.status(201)
        return {
            message: `Group created`,
            group: newGroup
        }
    }

    async function getGroupsInternal(req, rsp) {
        return cmdbServices.getGroups(req.token)
    }

    async function getGroupDetailsInternal(req, rsp) {
        return cmdbServices.getGroupDetails(req.params.groupId, req.token)
    }

    async function editGroupInternal(req, rsp){
        await cmdbServices.editGroup(req.params.groupId, req.body, req.token)   
        return {
            message: "Updated group with success"
        }
    }

    async function deleteGroupInternal(req, rsp) {
        await cmdbServices.deleteGroup(req.params.groupId, req.token)
        return {
            message: `Group deleted with success`
        }    
    }

    async function addMovieInGroupInternal(req, rsp) {
        let newMovie = await cmdbServices.addMovieInGroup(req.params.groupId, req.params.movieId, req.token)
        rsp.status(201)
        return {
            message: `Movie added with success`,
            movie: newMovie
        }
    }

    async function removeMovieInGroupInternal(req, rsp) {
        await cmdbServices.removeMovieInGroup(req.params.groupId, req.params.movieId, req.token)   
        return {
            message: `Movie deleted with success`
        } 
    }

    /**
     * Middleware that verifies if the client trying to access the Web API has token
     * @param {*} handler function this middleware will be applied to
     */ 
    function handleRequest(handler) {
        // Function Express module calls
        return async function(req, rsp) {
            const BEARER_STR = "Bearer "
            // Get the value of the Authorization header
            const tokenHeader = req.get("Authorization")
            // If the token isn't valid:
            if (!(tokenHeader && 
                tokenHeader.startsWith(BEARER_STR) && tokenHeader.length > BEARER_STR.length)) {
                rsp
                    .status(401)
                    .json({error: `Invalid authentication token`})
                    return
            }
            // Retrieve token with the expected format: Bearer <token> and create a property in the 
            // request object to easily retrieve it
            req.token = tokenHeader.split(" ")[1]
            try {
                // With a token the actual function can be called
                let body = await handler(req, rsp)
                // Wrap the result in JSON format 
                rsp
                    .json(body) //status code is 200 by default
            } catch(e) {
                // If an exception is found translate it to a HTTP response and wrap it in 
                // JSON format 
                const response = translateToHTTPResponse(e)
                rsp
                    .status(response.status)
                    .json(response.body)
            }
        }
    }
}