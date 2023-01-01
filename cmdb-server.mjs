// Application Entry Point. 
// This module registers all HTTP API routes and starts the server.

// This directive is necessary to ensure that common programmer type errors cause exceptions,
// making the code easier to debug

'use strict'

// External imports
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs' // Yaml is similar to JSON but uses indentation to infer object and properties
import hbs from 'hbs'
import path from 'path'
import url from 'url'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import session from 'express-session'

// Internal imports
import cmdbUserServicesInit from '#services/cmdb-users-services.mjs'
//import * as usersData from '#data_access/internal/cmdb-users-data.mjs'
//import * as cmdbData from '#data_access/internal/cmdb-data-mem.mjs'
import cmdbUsersElastiSearchInit from '#data_access/elasticsearch/cmdb-users-elasticsearch.mjs'
import cmdbDataElasticSearchInit from '#data_access/elasticsearch/cmdb-data-elasticsearch.mjs'
import imdbDataInit from '#data_access/imdb-movies-data.mjs'
import cmdbServicesInit from '#services/cmdb-services.mjs' 
import cmdbWebApiInit from '#web/api/cmdb-web-api.mjs'
import cmdbWebSiteInit from '#web/site/cmdb-web-site.mjs'
import cmdbUsersWebSiteInit from '#web/site/cmdb-users-web-site.mjs'

// Fetch Modules
import fetch from '#data_access/fetch/node-fetch.mjs'
//import fetch from '#data_access/fetch/local-fetch.mjs'

// Initializations 
const usersData = cmdbUsersElastiSearchInit()
const cmdbData = cmdbDataElasticSearchInit()
const imdbData = imdbDataInit(fetch)
const cmdbServices = cmdbServicesInit(imdbData, cmdbData, usersData)
const cmdbUserServices = cmdbUserServicesInit(usersData)
const cmdbWebApi = cmdbWebApiInit(cmdbServices, cmdbUserServices)
const cmdbWebSite = cmdbWebSiteInit(cmdbServices)
const cmdbUserWebSite = cmdbUsersWebSiteInit(cmdbUserServices)

// Constants
const PORT = 1904

console.log("-------------- Start setting up server --------------")

let app = express() // Instance of the application
 
// View engine setup
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'web', 'site', 'views'));
// hbs.registerPartials(__dirname + '/views/partials')

// ------------------------------------ Middlewares --------------------------------------------
app.use(cors()) // CORS (Cross Origin Resource Sharing) is an HTTP-header based mechanism that
                // allows a server to indicate any origins other than its own from which a 
                // browser should permit loading resources from
                // New HTTP-header: Access-Control-Allow-Origin: *

// Converts OpenAPI specification in yaml to javascript object
const swaggerDocument = yaml.load('./docs/cmdb-api-spec.yaml')
// Establish a way in the application which users can access the OpenAPI HTML specification page.
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(express.json()) // Parses incoming requests with JSON payloads if the
                        // Content-Type of the request header matches this option 
app.use(express.urlencoded( { extended: false})) // Parses incoming requests with urlencoded payloads if the
                              // Content-Type of the request header matches this option 
app.use(cookieParser()) // Parses Cookie Header and populates req.cookies with an object 
                        // keyed by the cookie names

passport.serializeUser((userInfo, done) => { done(null, userInfo); });
passport.deserializeUser((userInfo, done) => { done(null, userInfo); });
app.use(session({
    secret: 'leic-ipw-g06',
    cookie:{_expires : 10800000}, // time im ms (corresponds to 3 hours)
    resave: false,
    saveUninitialized: false
}));
app.use(passport.session()) // Passport initialization
app.use(passport.initialize())
app.use(express.static(path.join(__dirname, 'web', 'site')));
app.use('/auth', cmdbUserWebSite.verifyAuthenticated)
// ------------------------------------ Middlewares --------------------------------------------

// ----------------------------------- Public Website -----------------------------------------
app.get('/home', cmdbUserWebSite.homeNotAuthenticated)
app.get('/login', cmdbUserWebSite.loginForm)
app.post('/login', cmdbUserWebSite.validateLogin)
app.get('/register',cmdbUserWebSite.newUser)
app.post('/register', cmdbUserWebSite.createUser)
app.get('/movies', cmdbWebSite.getPopularMovies)
app.get('/movies/limit', cmdbWebSite.limitForMovies)
app.get('/movies/search/limit', cmdbWebSite.limitForSearch)
app.get('/movies/search/:movieName', cmdbWebSite.searchMoviesByName)
app.get('/movies/find/:movieId', cmdbWebSite.getMovieDetails)
// ----------------------------------- Public Website -----------------------------------------

// ----------------------------------- Private Website -----------------------------------------
app.post('/logout', cmdbUserWebSite.logout)
app.get('/auth/home', cmdbUserWebSite.homeAuthenticated)
app.get('/auth/groups', cmdbWebSite.getGroups)
app.post('/auth/groups', cmdbWebSite.createGroup)
app.get('/auth/groups/newGroup', cmdbWebSite.getNewGroup)
app.get('/auth/groups/:groupId', cmdbWebSite.getGroupDetails)
app.get('/auth/groups/:groupId/editGroup', cmdbWebSite.getEditGroup)
app.post('/auth/groups/:groupId/edit', cmdbWebSite.editGroup)
app.post('/auth/groups/:groupId/delete', cmdbWebSite.deleteGroup)
app.get('/auth/groups/:groupId/movies/addMovie', cmdbWebSite.addMovie)
app.get('/auth/groups/:groupId/movies/searchTheMovie', cmdbWebSite.searchMovieToAdd)
app.post('/auth/groups/:groupId/movies', cmdbWebSite.addMovieInGroup)
app.post('/auth/groups/:groupId/movies/:movieId', cmdbWebSite.removeMovieInGroup)
// ----------------------------------- Private Website -----------------------------------------

// -------------------------------------- WebApi -----------------------------------------------
app.post('/api/users', cmdbWebApi.createUser)
app.get('/api/movies', cmdbWebApi.getPopularMovies)
app.get('/api/movies/search/:moviesName', cmdbWebApi.searchMoviesByName)
app.get('/api/movies/find/:movieId', cmdbWebApi.getMovieDetails)
app.get('/api/groups', cmdbWebApi.getGroups)
app.post('/api/groups', cmdbWebApi.createGroup)
app.get('/api/groups/:groupId', cmdbWebApi.getGroupDetails)
app.put('/api/groups/:groupId', cmdbWebApi.editGroup)
app.delete('/api/groups/:groupId', cmdbWebApi.deleteGroup)
app.put('/api/groups/:groupId/movies/:movieId', cmdbWebApi.addMovieInGroup)
app.delete('/api/groups/:groupId/movies/:movieId', cmdbWebApi.removeMovieInGroup)
// -------------------------------------- WebApi -----------------------------------------------

// Sets the server to listen in a specified port.
app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("--------------- End setting up server ---------------")