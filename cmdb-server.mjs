// Application Entry Point. 
// Register all HTTP API routes and starts the server.

// This directive is necessary to ensure that common programmer type errors cause exceptions,
// making the code easier to debug
'use strict'

import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs' // Yaml is similar to JSON but uses indentation to infer object and properties.

import cmdbServicesInit from './services/cmdb-services.mjs' 
import *  as userServices from './services/cmdb-users-services.mjs'
import cmdbWebApiInit from './api/cmdb-web-api.mjs'

import * as usersData from './data/cmdb-users-data.mjs'
import * as cmdbData from './data/cmdb-data-mem.mjs'
import imdbDataInit from './data/cmdb-movies-data.mjs'

//import fetch from './data/node-fetch.mjs'
import fetch from './data/local-fetch.mjs'

const imdbData = imdbDataInit(fetch)
const cmdbServices = cmdbServicesInit(imdbData, cmdbData, usersData)
const cmdbWebApi = cmdbWebApiInit(cmdbServices, userServices) 

// Constants
const PORT = 1904

console.log("-------------- Start setting up server --------------")

let app = express() // Instance of the HTTP application
 
app.use(express.json()) // Middleware that parses incoming requests with JSON payloads 
                        // and is based on body-parser.
app.use(cors()) // CORS (Cross Origin Resource Sharing) is an HTTP-header based mechanism that
                // allows a server to indicate any origins other than its own from which a browser
                // should permit loading resources. 
                // New HTTP-header: Access-Control-Allow-Origin: *

// Converts OpenAPI specification in yaml to javascript object
const swaggerDocument = yaml.load('./docs/cmdb-api-spec.yaml')
// Establish a way in the application which users can access the OpenAPI HTML specification page.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Reminder: the API functions are only called, by the Express module, when the client makes 
// the respective request.
// URI paths and respective HTTP methods supported:
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

// Sets the server to listen in a specified port.
app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("--------------- End setting up server ---------------")