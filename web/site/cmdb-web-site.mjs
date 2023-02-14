// Module that contains the functions that handle all HTTP Requests
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format

import express from 'express'
import errors from '#errors/errors.mjs'
import handlerRequest from '#web/cmdb-handle-request.mjs'

export default function (cmdbServices) {
    // Validate if all the received services exist
    if (!cmdbServices) {
        throw errors.INVALID_ARGUMENT("cmdbServices")
    }

    // Initialize a router for the public site routes
    const router1 = express.Router()

    router1.get('/movies', handlerRequestCaller(getPopularMovies))
    router1.get('/movies/search/:movieName', handlerRequestCaller(searchMoviesByName))
    router1.get('/movies/find/:movieId', handlerRequestCaller(getMovieDetails))

    // Initialize a router for the private site routes
    const router2 = express.Router()

    router2.post('/groups', handlerRequestCaller(createGroup))
    router2.get('/groups', handlerRequestCaller(getGroups))
    router2.get('/groups/:groupId', handlerRequestCaller(getGroupDetails))
    router2.get('/groups/:groupId/movies/searchTheMovie', handlerRequestCaller(searchMoviesByName))
    
    return { withoutAuth: router1, withAuth: router2 }

    async function getPopularMovies(req, rsp) {
        const limit = req.query.limit
        const page = req.query.page
        const popularMovies = await cmdbServices.getPopularMovies(limit, page)
        const viewData = { 
            movies: popularMovies.results, 
            totalPages: popularMovies.totalPages 
        }
        return new View('popularMovies', viewData)
    }

    async function searchMoviesByName(req, rsp) {
        // Retrieve query string values
        const groupId = req.query.groupId
        const movieName = req.query.movieName
        const limit = req.query.limit
        const page = req.query.page
        // Assert if the search result is eligible to be added to a group or was 
        // only a regular movies search
        const movieCanBeAdded = req.path.includes('searchTheMovie') ? true : false 
        // Retrieve data
        const movies = await cmdbServices.searchMoviesByName(movieName, limit, page)
        const viewData = { 
            expression: movieName, 
            // This map was added to provide each movie with a mark in order to 
            // assert if the movie can be added to a group. It was the only found 
            // way to give that information to a handlebars template inside an array
            movies: movieCanBeAdded ? movies.results.map(movie => {
                return Object.assign( { movieCanBeAdded: movieCanBeAdded }, movie)
            }) : movies.results,
            // Only create this property if the value exists
            ...groupId && {groupId: groupId}, 
            totalPages: movies.totalPages
        }
        return new View('searchMovies', viewData)
    }

    async function getMovieDetails(req, rsp) {
        const movie = await cmdbServices.getMovieDetails(req.params.movieId)
        return new View('movie', movie)
    }

    async function createGroup(req, rsp) {
        await cmdbServices.createGroup(req.user.token, req.body)
        rsp.redirect('/auth/groups')
    }
    
    async function getGroups(req, rsp) {
        const retrievedGroups = await cmdbServices.getGroups(
            req.user.token, req.query.limit, req.query.page
        )
        // This map was added to provide each group with the user token in order 
        // to easily retrieve it in a partial view, since in this context 
        // {{../user.token}} - handlebars template - could not be rendered
        const groups = retrievedGroups.results.map(group => {
            // Replicate user object with only token and construct a new object
            // with the received group properties
            return Object.assign({
                user: {
                    token: req.user.token
                }
            }, group)
        })
        const viewData = {
            groups: groups, 
            totalPages: retrievedGroups.totalPages 
        }
        return new View('groups', viewData)
    }

    async function getGroupDetails(req, rsp) {
        const groupId = req.params.groupId
        const group = await cmdbServices.getGroupDetails(
            req.user.token, groupId, req.query.limit, req.query.page
        )
        const viewData = { 
            id: groupId, 
            group: group,
            totalPages: group.movies.totalPages 
        }
        return new View('group', viewData)
    }
    
    /** 
     * Constructs a new View with the given name and data to send to response render function.
     * @param {String} viewName - the name of the html/hbs view file.
     * @param {Object} viewData - object with data to render.
     */
    function View(viewName, viewData) {
        return {
            name: viewName,
            data: viewData
        }
    }

    /**
     * Assemblies handler request function by passing the handler, along with 
     * the functions to wrap it's response.
     */
    function handlerRequestCaller(handler) {
        return handlerRequest(handler, HTMLtry, HTMLcatch)
    }

    /**
     * Wraps response in HTML format, on a valid request.
     */
    function HTMLtry(view, req, rsp) {
        if(view) rsp.render(view.name, Object.assign({user: req.user}, view.data))
    }

    /**
     * Wraps response in HTML format, on an error.
     */
    function HTMLcatch(httpResponse, req, rsp) {
        let view = View('onError', httpResponse)
        if(view) rsp.render(view.name, Object.assign({user: req.user}, view.data))
    }   
}