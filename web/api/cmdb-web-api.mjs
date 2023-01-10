// Module that provides a Web API that follows the REST principles

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response in JSON format

'use strict'

import errors from '#errors/errors.mjs'
import translateToHTTPResponse from '#web/http-error-responses.mjs'
import express from 'express'

/**
 * @param {*} cmdbServices module that contains all application services
 * @param {*} cmdbUserServices module that contains all application user services
 * @returns an object with all the functions Express module can call, as properties, when a user makes a request
 */
export default function(cmdbServices, cmdbUserServices) {
    // Validate if all the received services exist
    if (!cmdbServices) {
        throw errors.INVALID_ARGUMENT("cmdbServices")
    }
    if (!cmdbUserServices) {
        throw errors.INVALID_ARGUMENT("cmdbUserServices")
    }

    const router = express.Router()

    router.post('/users', handleRequestInJSON(createUser))
    router.get('/movies', handleRequestInJSON(getPopularMovies))
    router.get('/movies/search/:moviesName', handleRequestInJSON(searchMoviesByName))
    router.get('/movies/find/:movieId', handleRequestInJSON(getMovieDetails))
    router.post('/groups', verifyAuthentication(createGroup))
    router.get('/groups', verifyAuthentication(getGroups))
    router.get('/groups/:groupId', verifyAuthentication(getGroupDetails))
    router.put('/groups/:groupId', verifyAuthentication(editGroup))
    router.delete('/groups/:groupId', verifyAuthentication(deleteGroup))
    router.put('/groups/:groupId/movies/:movieId', verifyAuthentication(addMovieInGroup))
    router.delete('/groups/:groupId/movies/:movieId', verifyAuthentication(removeMovieInGroup))

    return router

    // Functions:
    async function createUser(req, rsp) {
        let newUser = await cmdbUserServices.createUser(req.body.username, req.body.password)
        rsp.status(201)
        return {
            message: `User created`,
            newUser: newUser
        }
    }

    async function getPopularMovies(req, rsp) {
        return cmdbServices.getPopularMovies(req.query.limit)
    }

    async function searchMoviesByName(req, rsp) {
        return cmdbServices.searchMoviesByName(req.params.moviesName, req.query.limit)
    }

    async function getMovieDetails(req, rsp) {
        return cmdbServices.getMovieDetails(req.params.movieId)
    }

    async function createGroup(req, rsp) {
        let newGroup = await cmdbServices.createGroup(req.token, req.body)
        rsp.status(201)
        return {
            message: `Group created`,
            group: newGroup
        }
    }

    async function getGroups(req, rsp) {
        return cmdbServices.getGroups(req.token)
    }

    async function getGroupDetails(req, rsp) {
        return cmdbServices.getGroupDetails(req.token, req.params.groupId)
    }

    async function editGroup(req, rsp){
        await cmdbServices.editGroup(req.token, req.params.groupId, req.body)   
        return {
            message: "Updated group with success"
        }
    }

    async function deleteGroup(req, rsp) {
        await cmdbServices.deleteGroup(req.token, req.params.groupId)
        return {
            message: `Group deleted with success`
        }    
    }

    async function addMovieInGroup(req, rsp) {
        let newMovie = await cmdbServices.addMovieInGroup(req.token, req.params.groupId, req.params.movieId)
        rsp.status(201)
        return {
            message: `Movie added with success`,
            movie: newMovie
        }
    }

    async function removeMovieInGroup(req, rsp) {
        await cmdbServices.removeMovieInGroup(req.token, req.params.groupId, req.params.movieId)   
        return {
            message: `Movie deleted with success`
        } 
    }

    function verifyAuthentication(handler){
        return async function(req, rsp){
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
    
            const requestHandler = handleRequestInJSON(handler)

            return requestHandler(req, rsp)
        }
    }
    
    function handleRequestInJSON(handler) {
        return async function(req, rsp){
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