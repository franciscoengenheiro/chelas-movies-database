// Module that provides a Web API that follows the REST principles

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response in JSON format

'use strict'

import errors from '../../errors/errors.mjs'
import { handleRequestInJSON } from '../http-handle-requests.mjs'

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
        createUser: handleRequestInJSON(createUserInternal),
        getPopularMovies: handleRequestInJSON(getPopularMoviesInternal),
        searchMoviesByName: handleRequestInJSON(searchMoviesByNameInternal),
        createGroup: handleRequestInJSON(createGroupInternal),
        getGroups: handleRequestInJSON(getGroupsInternal),
        getGroupDetails: handleRequestInJSON(getGroupDetailsInternal),
        editGroup: handleRequestInJSON(editGroupInternal),
        deleteGroup: handleRequestInJSON(deleteGroupInternal),
        addMovieInGroup: handleRequestInJSON(addMovieInGroupInternal),
        removeMovieInGroup: handleRequestInJSON(removeMovieInGroupInternal)
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
}