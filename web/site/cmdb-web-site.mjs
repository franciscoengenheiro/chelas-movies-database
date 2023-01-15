// Module that contains the functions that handle all HTTP Requests
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format

import errors from '#errors/errors.mjs'
import express from 'express'
import handlerRequest from '#web/cmdb-handle-request.mjs'

export default function (cmdbServices) {
    // Validate if all the received services exist
    if (!cmdbServices) {
        throw errors.INVALID_ARGUMENT("cmdbServices")
    }

    // Initialize a router
    const router1 = express.Router()
    const router2 = express.Router()

    router1.get('/movies', handlerRequest(getPopularMovies, HTMLtry, HTMLcatch))
    router1.get('/movies/limit', limitForMovies)
    router1.get('/movies/search/limit', limitForSearch)
    router1.get('/movies/search/:movieName', handlerRequest(searchMoviesByName, HTMLtry, HTMLcatch))
    router1.get('/movies/find/:movieId', handlerRequest(getMovieDetails, HTMLtry, HTMLcatch))

    router2.post('/groups', handlerRequest(createGroup, HTMLtry, HTMLcatch))
    router2.get('/groups', handlerRequest(getGroups, HTMLtry, HTMLcatch))
    router2.get('/groups/newGroup', getNewGroup)
    router2.get('/groups/:groupId', handlerRequest(getGroupDetails, HTMLtry, HTMLcatch))
    router2.get('/groups/:groupId/editGroup', handlerRequest(getEditGroup, HTMLtry, HTMLcatch))
    router2.post('/groups/:groupId/edit', handlerRequest(editGroup, HTMLtry, HTMLcatch))
    router2.post('/groups/:groupId/delete', handlerRequest(deleteGroup, HTMLtry, HTMLcatch))
    router2.get('/groups/:groupId/movies/addMovie', addMovie)
    router2.get('/groups/:groupId/movies/searchTheMovie', handlerRequest(searchMovieToAdd, HTMLtry, HTMLcatch))
    router2.post('/groups/:groupId/movies', handlerRequest(addMovieInGroup, HTMLtry, HTMLcatch))
    router2.post('/groups/:groupId/movies/:movieId', handlerRequest(removeMovieInGroup, HTMLtry, HTMLcatch))
    
    return {withoutAuth: router1, withAuth: router2}

    async function limitForMovies(req, rsp) {
        rsp.render('limitForMovies')
    }

    async function getPopularMovies(req, rsp) {
        const limit = req.query.limit
        const popularMovies = await cmdbServices.getPopularMovies(limit)
        const viewData = { title: 'Top 250 Most popular movies', movies: popularMovies }
        return new View('popularMovies', viewData)
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

    async function getNewGroup(req, rsp) {
        rsp.render('newGroup')
    }

    async function getGroups(req, rsp) {
        const groups = await cmdbServices.getGroups(req.user.token)
        const viewData = {token: req.user.token, title: 'My groups', groups: groups }
        return new View('groups', viewData)
    }

    async function getGroupDetails(req, rsp) {
        const viewData = await getGroupDetailsMw(req, rsp)
        return new View('group', viewData)
    }

    async function editGroup(req, rsp) {
        const groupId = req.params.groupId
        await cmdbServices.editGroup(req.user.token, groupId, req.body)
        rsp.redirect(`/auth/groups/${groupId}`)
    }

    async function getEditGroup(req, rsp) {
        const viewData = await getGroupDetailsMw(req, rsp)
        return new View('editGroup', viewData)
    }

    async function deleteGroup(req, rsp) {
        const groupId = req.params.groupId
        await cmdbServices.deleteGroup(req.user.token, groupId)
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
        const viewData = {token: req.user.token, title: movieName, movies: movies, groupId: groupId}
        return new View('searchMoviesToAdd', viewData)
    }

    async function addMovieInGroup(req, rsp) {
        const movieId = req.body.movieId
        const groupId = req.params.groupId
        await cmdbServices.addMovieInGroup(req.user.token, groupId, movieId)
        rsp.redirect(`/auth/groups/${groupId}`)
    }

    async function removeMovieInGroup(req, rsp) {
        const movieId = req.params.movieId
        const groupId = req.params.groupId        
        await cmdbServices.removeMovieInGroup(req.user.token, groupId, movieId)
        // Post/Redirect/Get (PRG) is a web development design pattern that lets the page shown 
        // after a form submission be reloaded, shared, or bookmarked without ill effects, such
        // as submitting the form another time.
        rsp.redirect(`/auth/groups/${groupId}`)
    }
    
    async function getGroupDetailsMw(req, rsp) {
        const groupId = req.params.groupId
        const group = await cmdbServices.getGroupDetails(req.user.token, groupId)
        return {token: req.user.token, id: groupId, group: group}
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

    function HTMLtry(view, rsp){
        if(view) rsp.render(view.name, view.data)
    }

    function HTMLcatch(httpResponse, rsp){
        let view = View('onError', httpResponse)
        if(view) rsp.render(view.name, view.data)
    }
}