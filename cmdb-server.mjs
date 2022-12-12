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
import * as cmdbData from './data/cmdb-data-mem.mjs'
import imdbDataInit from './data/cmdb-movies-data.mjs'
import cmdbServicesInit from './services/cmdb-services.mjs' 
import cmdbWebApiInit from './web/api/cmdb-web-api.mjs'
import cmdbWebSiteInit from './web/site/cmdb-web-site.mjs'
import { retrieveTokenFromBearer, retrieveToken } from './cmdb-midlewares.mjs'

import fetch from './data/node-fetch.mjs'
//import fetch from './data/local-fetch.mjs'

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
app.use(express.urlencoded()) // Parses incoming requests with urlencoded payloads if the
                              // Content-Type of the request header matches this option 
app.use(cookieParser()) // Parses Cookie Header and populates req.cookies with an object 
                        // keyed by the cookie names
app.use(retrieveTokenFromBearer) // Populates req.token with the userToken only if the 
                                 // Content-Type of the request header is in application/json
app.use(retrieveToken) // Populates req.token with the userToken only if the 
                                 // Content-Type of the request header is in application/json
// ------------------------------------ Middlewares --------------------------------------------

// -------------------------------------- WebSite ----------------------------------------------
// app.get('/home', cmdbWebSite.getHome)
// app.get('/groups', cmdbWebSite.getGroups)
// -------------------------------------- WebSite ----------------------------------------------

// -------------------------------------- WebApi -----------------------------------------------
app.post('/users', cmdbWebApi.createUser)
app.get('/movies', cmdbWebApi.getPopularMovies)
app.get('/movies/:moviesName', cmdbWebApi.searchMoviesByName)
app.post('/groups', cmdbWebApi.createGroup)
app.get('/groups', cmdbWebApi.getGroups)
app.get('/groups/:groupId', cmdbWebApi.getGroupDetails)
app.put('/groups/:groupId', cmdbWebApi.editGroup)
app.delete('/groups/:groupId', cmdbWebApi.deleteGroup)
app.put('/groups/:groupId/movies/:movieId', cmdbWebApi.addMovieInGroup)
app.delete('/groups/:groupId/movies/:movieId', cmdbWebApi.removeMovieInGroup)
// -------------------------------------- WebApi -----------------------------------------------

// Sets the server to listen in a specified port.
app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("--------------- End setting up server ---------------")