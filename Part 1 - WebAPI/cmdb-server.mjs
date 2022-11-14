// Application Entry Point. 
// Register all HTTP API routes and starts the server

// This directive is necessary to ensure that common programmer type errors cause exceptions,
// making the code easier to debug
'use strict'

import express from 'express'
import * as api from './api/cmdb-web-api.mjs'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs' // Yaml is similar to JSON but uses indentation to infer object and properties.

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
app.get('/movies', api.getPopularMovies)
app.get('/movies/:moviesName', api.searchMoviesByName)
app.post('/groups', api.createGroup)
app.get('/groups', api.getGroups)
app.get('/groups/:groupId', api.getGroupDetails)
app.put('/groups/:groupId', api.editGroup)
app.delete('/groups/:groupId', api.deleteGroup)
app.put('/groups/:groupId/movies/:movieId', api.addMovieInGroup)
app.delete('/groups/:groupId/movies/:movieId', api.removeMovieInGroup)

// Sets the server to listen in a specified port.
app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("--------------- End setting up server ---------------")