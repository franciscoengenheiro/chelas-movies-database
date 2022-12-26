// Module that provides a Web API that follows the REST principles

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response in JSON format

'use strict'

import errors from '../../errors/errors.mjs'
import translateToHTTPResponse from '../http-error-responses.mjs'

/**
 * @param {*} cmdbServices module that contains all application services
 * @param {*} cmdbUserServices module that contains all application user services
 * @returns an object with all the functions Express module can call, as properties, when a user makes a request
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
        createUser: handleResponseInJSON(createUserInternal),
        getPopularMovies: handleResponseInJSON(getPopularMoviesInternal),
        searchMoviesByName: handleResponseInJSON(searchMoviesByNameInternal),
        getMovieDetails: handleResponseInJSON(getMovieDetailsInternal),
        createGroup: handleResponseInJSON(createGroupInternal),
        getGroups: handleResponseInJSON(getGroupsInternal),
        getGroupDetails: handleResponseInJSON(getGroupDetailsInternal),
        editGroup: handleResponseInJSON(editGroupInternal),
        deleteGroup: handleResponseInJSON(deleteGroupInternal),
        addMovieInGroup: handleResponseInJSON(addMovieInGroupInternal),
        removeMovieInGroup: handleResponseInJSON(removeMovieInGroupInternal)
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

    async function getMovieDetailsInternal(req, rsp) {
        return cmdbServices.getMovieDetails(req.params.movieId)
    }

    async function createGroupInternal(req, rsp) {
        let newGroup = await cmdbServices.createGroup(req.token, req.body)
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
        return cmdbServices.getGroupDetails(req.token, req.params.groupId)
    }

    async function editGroupInternal(req, rsp){
        await cmdbServices.editGroup(req.token, req.params.groupId, req.body)   
        return {
            message: "Updated group with success"
        }
    }

    async function deleteGroupInternal(req, rsp) {
        await cmdbServices.deleteGroup(req.token, req.params.groupId)
        return {
            message: `Group deleted with success`
        }    
    }

    async function addMovieInGroupInternal(req, rsp) {
        let newMovie = await cmdbServices.addMovieInGroup(req.token, req.params.groupId, req.params.movieId)
        rsp.status(201)
        return {
            message: `Movie added with success`,
            movie: newMovie
        }
    }

    async function removeMovieInGroupInternal(req, rsp) {
        await cmdbServices.removeMovieInGroup(req.token, req.params.groupId, req.params.movieId)   
        return {
            message: `Movie deleted with success`
        } 
    }
    
    function handleResponseInJSON(handler) {
        return async function(req, rsp) {
            const BEARER_STR = "Bearer "
            // Get the value of the Authorization request header
            const tokenHeader = req.get("Authorization")
            // If the token isn't valid:
            if (!(tokenHeader && tokenHeader.startsWith(BEARER_STR) && tokenHeader.length > BEARER_STR.length)) {
                // Wrap the error esponse in JSON format
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
                rsp.json(body) //status code is 200 by default
            } catch(e) {
                const httpResponse = translateToHTTPResponse(e)
                rsp
                    .status(httpResponse.status)
                    .json(httpResponse.body)
            }
        }
    }
}