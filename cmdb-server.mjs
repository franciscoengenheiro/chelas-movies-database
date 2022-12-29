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
import session from 'express-session'

// Internal imports
import * as userServices from './services/cmdb-users-services.mjs'
import * as usersData from './data/cmdb-users-data.mjs'
//import * as cmdbData from './data/cmdb-data-mem.mjs'
import cmdbDataElasticsearchInit from './data/cmdb-data-elasticsearch.mjs'
import imdbDataInit from './data/cmdb-movies-data.mjs'
import cmdbServicesInit from './services/cmdb-services.mjs' 
import cmdbWebApiInit from './web/api/cmdb-web-api.mjs'
import cmdbWebSiteInit from './web/site/cmdb-web-site.mjs'

import fetch from './data/node-fetch.mjs'
// import fetch from './data/local-fetch.mjs'

const cmdbData = cmdbDataElasticsearchInit()
const imdbData = imdbDataInit(fetch)
const cmdbServices = cmdbServicesInit(imdbData, cmdbData, usersData)
const cmdbWebApi = cmdbWebApiInit(cmdbServices, userServices)
const cmdbWebSite = cmdbWebSiteInit(cmdbServices)

// Constants
const PORT = 1904

console.log("-------------- Start setting up server --------------")

let app = express() // Instance of the HTTP application
 
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(express.json()) // Parses incoming requests with JSON payloads if the
                        // Content-Type of the request header matches this option 
app.use(express.urlencoded( { extended: false})) // Parses incoming requests with urlencoded payloads if the
                              // Content-Type of the request header matches this option 
app.use(cookieParser()) // Parses Cookie Header and populates req.cookies with an object 
                        // keyed by the cookie names
// ------------------------------------ Middlewares --------------------------------------------

// -------------------------------------- WebSite ----------------------------------------------
//app.get('/home', cmdbWebSite.getHome)
//app.get('/site.css', cmdbWebSite.getCss)
//app.post('/users', cmdbWebSite.createUser)
app.get('/movies', cmdbWebSite.getPopularMovies)
app.get('/movies/search/:moviesName', cmdbWebSite.searchMoviesByName)
app.get('/movies/find/:movieId', cmdbWebSite.getMovieDetails)
app.post('/groups', cmdbWebSite.createGroup)
app.get('/groups/newGroup', cmdbWebSite.getNewGroup)
app.get('/groups', cmdbWebSite.getGroups)
app.get('/groups/:groupId', cmdbWebSite.getGroupDetails)
app.post('/groups/:groupId/edit', cmdbWebSite.editGroup)
app.get('/groups/:groupId/editGroup', cmdbWebSite.getEditGroup)
app.post('/groups/:groupId/delete', cmdbWebSite.deleteGroup)
app.get('/groups/:groupId/movies/addMovie', cmdbWebSite.addMovie)
app.get('/groups/:groupId/movies/searchTheMovie', cmdbWebSite.searchMovieToAdd)
app.post('/groups/:groupId/movies', cmdbWebSite.addMovieInGroup)
app.post('/groups/:groupId/movies/:movieId', cmdbWebSite.removeMovieInGroup)
// -------------------------------------- WebSite ----------------------------------------------

// -------------------------------------- WebApi -----------------------------------------------
app.post('/api/users', cmdbWebApi.createUser)
app.get('/api/movies', cmdbWebApi.getPopularMovies)
app.get('/api/movies/search/:moviesName', cmdbWebApi.searchMoviesByName)
app.get('/api/movies/find/:movieId', cmdbWebApi.getMovieDetails)
app.post('/api/groups', cmdbWebApi.createGroup)
app.get('/api/groups', cmdbWebApi.getGroups)
app.get('/api/groups/:groupId', cmdbWebApi.getGroupDetails)
app.put('/api/groups/:groupId', cmdbWebApi.editGroup)
app.delete('/api/groups/:groupId', cmdbWebApi.deleteGroup)
app.put('/api/groups/:groupId/movies/:movieId', cmdbWebApi.addMovieInGroup)
app.delete('/api/groups/:groupId/movies/:movieId', cmdbWebApi.removeMovieInGroup)
// -------------------------------------- WebApi -----------------------------------------------

// Sets the server to listen in a specified port.
app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("--------------- End setting up server ---------------")