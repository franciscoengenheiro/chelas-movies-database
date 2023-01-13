// Module that provides a Web API that follows the REST principles

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response in JSON format

'use strict'

import errors from '#errors/errors.mjs'
import express from 'express'
import yaml from 'yamljs' // Yaml is similar to JSON but uses indentation to infer object and properties
import swaggerUi from 'swagger-ui-express'
import handlerRequest from '#web/cmdb-handle-request.mjs'

/**
 * @param {*} cmdbServices module that contains all application services.
 * @param {*} cmdbUserServices module that contains all user application services
 * @returns an object with all the functions Express module calls, as properties, 
 * when a user makes a request
 */
export default function(cmdbServices, cmdbUserServices) {
    // Validate if all the received services exist
    if (!cmdbServices) {
        throw errors.INVALID_ARGUMENT("cmdbServices")
    }
    if (!cmdbUserServices) {
        throw errors.INVALID_ARGUMENT("cmdbUserServices")
    }

    // Initialize a router
    const router = express.Router() 

    // Converts OpenAPI specification in yaml to javascript object
    const swaggerDocument = yaml.load('./docs/cmdb-api-spec.yaml')
    // Establish a way in the application which users can access the OpenAPI HTML specification page.
    router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    // Routes defined for the API
    router.post('/users', handlerRequest(createUser, JSONtry, JSONcatch))
    router.get('/movies', handlerRequest(getPopularMovies, JSONtry, JSONcatch))
    router.get('/movies/search/:moviesName', handlerRequest(searchMoviesByName, JSONtry, JSONcatch))
    router.get('/movies/find/:movieId', handlerRequest(getMovieDetails, JSONtry, JSONcatch))
    router.post('/groups', verifyAuthentication(createGroup, JSONtry, JSONcatch))
    router.get('/groups', verifyAuthentication(getGroups, JSONtry, JSONcatch))
    router.get('/groups/:groupId', verifyAuthentication(getGroupDetails, JSONtry, JSONcatch))
    router.put('/groups/:groupId', verifyAuthentication(editGroup, JSONtry, JSONcatch))
    router.delete('/groups/:groupId', verifyAuthentication(deleteGroup, JSONtry, JSONcatch))
    router.put('/groups/:groupId/movies/:movieId', verifyAuthentication(addMovieInGroup, JSONtry, JSONcatch))
    router.delete('/groups/:groupId/movies/:movieId', verifyAuthentication(removeMovieInGroup, JSONtry, JSONcatch))

    return router

    // Functions:
    async function createUser(req, rsp) {
        let newUser = await cmdbUserServices.createUser(
            req.body.username, req.body.password, req.body.email, req.body.passConfirm
        )
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

    function verifyAuthentication(handler, JSONtry, JSONcatch) {
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
            // Retrieve token with the expected format: Bearer <token> 
            // Create a property in the request object to easily retrieve it
            req.token = tokenHeader.split(" ")[1]
    
            const requestHandler = handlerRequest(handler, JSONtry, JSONcatch)

            return requestHandler(req, rsp)
        }
    }

    function JSONtry(body, rsp){
        rsp.json(body)
    }

    function JSONcatch(httpResponse, rsp){
        rsp
            .status(httpResponse.status)
            .json(httpResponse.body)
    }
}