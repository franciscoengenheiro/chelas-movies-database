// Module that provides a Web API that follows the REST principles

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response in JSON format

'use strict'

import errors from '../../errors/errors.mjs'
import handleRequest from '../http-handle-requests.mjs'

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
}