// Module that contains the functions that handle all HTTP Requests
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format

import errors from '#errors/errors.mjs'
import translateToHTTPResponse from '#web/http-error-responses.mjs'
import express from 'express'

export default function (cmdbServices) {
    // Validate if all the received services exist
    if (!cmdbServices) {
        throw errors.INVALID_ARGUMENT("cmdbServices")
    }

    // Initialize a router
    const router = express.Router()

    router.get('/movies', handleRequestInHTML(getPopularMovies))
    router.get('/movies/limit', limitForMovies)
    router.get('/movies/search/limit', limitForSearch)
    router.get('/movies/search/:movieName', handleRequestInHTML(searchMoviesByName))
    router.get('/movies/find/:movieId', handleRequestInHTML(getMovieDetails))

    router.post('/auth/groups', verifyAuthentication(createGroup))
    router.get('/auth/groups', verifyAuthentication(getGroups))
    router.get('/auth/groups/newGroup', getNewGroup)
    router.get('/auth/groups/:groupId', verifyAuthentication(getGroupDetails))
    router.get('/auth/groups/:groupId/editGroup', verifyAuthentication(getEditGroup))
    router.post('/auth/groups/:groupId/edit', verifyAuthentication(editGroup))
    router.post('/auth/groups/:groupId/delete', verifyAuthentication(deleteGroup))
    router.get('/auth/groups/:groupId/movies/addMovie', addMovie)
    router.get('/auth/groups/:groupId/movies/searchTheMovie', verifyAuthentication(searchMovieToAdd))
    router.post('/auth/groups/:groupId/movies', verifyAuthentication(addMovieInGroup))
    router.post('/auth/groups/:groupId/movies/:movieId', verifyAuthentication(removeMovieInGroup))

    return router

    async function limitForMovies(req, rsp) {
        rsp.render('limitForMovies')
    }

    async function getPopularMovies(req, rsp) {
        const limit = req.query.limit
        const popularMovies = await cmdbServices.getPopularMovies(limit)
        const viewData = { title: 'Top 250 Most popular movies', movies: popularMovies }
        return View('popularMovies', viewData)
    }

    async function limitForSearch(req, rsp) {
        const movie = req.query.movieName
        const viewData = { movie: movie }
        rsp.render('limitForSearch', viewData)
    }

    async function searchMoviesByName(req, rsp) {
        const movieName = req.query.movieName
        const limit = req.query.limit
        const movies = await cmdbServices.searchMoviesByName(movieName, limit)
        const viewData = { title: movieName, movies: movies }
        return View('searchMovies', viewData)
    }

    async function getMovieDetails(req, rsp) {
        const movie = await cmdbServices.getMovieDetails(req.params.movieId)
        return View('movie', movie)
    }

    async function createGroup(req, rsp) {
        let newGroup = await cmdbServices.createGroup(req.token, req.body)
        rsp.redirect('/auth/groups')
    }

    async function getNewGroup(req, rsp) {
        rsp.render('newGroup')
    }

    async function getGroups(req, rsp) {
        const groups = await cmdbServices.getGroups(req.token)
        const viewData = { title: 'My groups', groups: groups }
        return View('groups', viewData)
    }

    async function getGroupDetails(req, rsp) {
        const viewData = await getGroupDetailsMw(req, rsp)
        return View('group', viewData)
    }

    async function editGroup(req, rsp) {
        const groupId = req.params.groupId
        const group = await cmdbServices.editGroup(req.token, groupId, req.body)
        rsp.redirect(`/auth/groups/${groupId}`)
    }

    async function getEditGroup(req, rsp) {
        const viewData = await getGroupDetailsMw(req, rsp)
        return View('editGroup', viewData)
    }

    async function deleteGroup(req, rsp) {
        const groupId = req.params.groupId
        const group = await cmdbServices.deleteGroup(req.token, groupId)
        rsp.redirect('/auth/groups/')
    }

    async function addMovie(req, rsp) {
        const groupId = req.params.groupId
        rsp.render('addMovie', {id: groupId})
    }

    async function searchMovieToAdd(req, rsp) {
        const groupId = req.query.groupId
        const movieName = req.query.movieName
        const movies = await cmdbServices.searchMoviesByName(movieName, req.query.limit)
        const viewData = {title: movieName, movies: movies, groupId: groupId}
        return View('searchMoviesToAdd', viewData)
    }

    async function addMovieInGroup(req, rsp) {
        const movieId = req.body.movieId
        const groupId = req.params.groupId
        const movie = await cmdbServices.addMovieInGroup(req.token, groupId, movieId)
        rsp.redirect(`/auth/groups/${groupId}`)
    }

    async function removeMovieInGroup(req, rsp) {
        const movieId = req.params.movieId
        const groupId = req.params.groupId        
        const group = await cmdbServices.removeMovieInGroup(req.token, groupId, movieId)
        // Post/Redirect/Get (PRG) is a web development design pattern that lets the page shown 
        // after a form submission be reloaded, shared, or bookmarked without ill effects, such
        // as submitting the form another time.
        rsp.redirect(`/auth/groups/${groupId}`)
    }
    
    async function getGroupDetailsMw(req, rsp) {
        const groupId = req.params.groupId
        const group = await cmdbServices.getGroupDetails(req.token, groupId)
        return {id: groupId, group: group}
    }
  
    /** 
     * Constructs a new View with the given name and data to send to response render function
     * @param {String} viewName - the name of the html/hbs view file
     * @param {Object} viewData - object with data to render
     */
    function View(viewName, viewData) {
        return {
            name: viewName,
            data: viewData
        }
    }

    function verifyAuthentication(handler) {
        return async function(req, rsp) {
            req.token = req.user.token
            let requestHandler = handleRequestInHTML(handler)
            requestHandler(req, rsp)
        }
    }

    function handleRequestInHTML(handler) {
        return async function(req, rsp) {
            let view
            try {
                view = await handler(req, rsp)
            } catch(e) {
                const httpResponse = translateToHTTPResponse(e)
                view = View('onError', httpResponse)
            }
            // Wrap the result in HTML format
            if(view) rsp.render(view.name, view.data)
        }
    }
}