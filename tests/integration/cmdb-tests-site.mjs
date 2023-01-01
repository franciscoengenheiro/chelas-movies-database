/* import * as assert from "assert"
import supertest from "supertest"


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
import cmdbUserServicesInit from '../../services/cmdb-users-services.mjs'
//import * as usersData from './data/cmdb-users-data.mjs'
//import * as cmdbData from './data/cmdb-data-mem.mjs'
import cmdbUsersElastiSearchInit from '../../data/cmdb-users-elasticsearch.mjs'
import cmdbDataElasticSearchInit from '../../data/cmdb-data-elasticsearch.mjs'
import imdbDataInit from '../../data/imdb-movies-data.mjs'
import cmdbServicesInit from '../../services/cmdb-services.mjs' 
import cmdbUsersWebSiteInit from '../../web/site/cmdb-users-web-site.mjs'
import cmdbWebApiInit from '../../web/api/cmdb-web-api.mjs'
import cmdbWebSiteInit from '../../web/site/cmdb-web-site.mjs'

// Fetch
import fetch from '../../data/node-fetch.mjs'
// import fetch from './data/local-fetch.mjs'

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
app.set('views', path.join(__dirname,'..','..', 'web', 'site', 'views'));
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

passport.serializeUser((userInfo, done) => { done(null, userInfo); });
passport.deserializeUser((userInfo, done) => { done(null, userInfo); });

app.use(session({
    secret: 'leic-ipw-g06',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.session()) // Passport initialization
app.use(passport.initialize())
// ------------------------------------ Middlewares --------------------------------------------

app.use(express.static(path.join(__dirname, 'web', 'site')));

// -------------------------------------- WebSite ----------------------------------------------
// --------------------------------------Public Website-----------------------------------------
app.get('/home', cmdbUserWebSite.homeNotAuthenticated)
app.use('/auth', cmdbUserWebSite.verifyAuthenticated)
// --------------------------------------Public Website-----------------------------------------
// --------------------------------------Private Website----------------------------------------
app.get('/auth/home', cmdbUserWebSite.homeAuthenticated)
app.get('/login', cmdbUserWebSite.loginForm)
app.post('/login', cmdbUserWebSite.validateLogin)
app.post('/logout', cmdbUserWebSite.logout)
app.get('/users/newUser',cmdbUserWebSite.newUser)
app.post('/users', cmdbUserWebSite.createUser)
app.get('/movies/limit', cmdbWebSite.limitForMovies)
app.get('/movies', cmdbWebSite.getPopularMovies)
app.get('/movies/search/limit', cmdbWebSite.limitForSearch)
app.get('/movies/search/:movieName', cmdbWebSite.searchMoviesByName)
app.get('/movies/find/:movieId', cmdbWebSite.getMovieDetails)
app.post('/auth/groups', cmdbWebSite.createGroup)
app.get('/auth/groups/newGroup', cmdbWebSite.getNewGroup)
app.get('/auth/groups', cmdbWebSite.getGroups)
app.get('/auth/groups/:groupId', cmdbWebSite.getGroupDetails)
app.post('/auth/groups/:groupId/edit', cmdbWebSite.editGroup)
app.get('/auth/groups/:groupId/editGroup', cmdbWebSite.getEditGroup)
app.post('/auth/groups/:groupId/delete', cmdbWebSite.deleteGroup)
app.get('/auth/groups/:groupId/movies/addMovie', cmdbWebSite.addMovie)
app.get('/auth/groups/:groupId/movies/searchTheMovie', cmdbWebSite.searchMovieToAdd)
app.post('/auth/groups/:groupId/movies', cmdbWebSite.addMovieInGroup)
app.post('/auth/groups/:groupId/movies/:movieId', cmdbWebSite.removeMovieInGroup)
// --------------------------------------Private Website----------------------------------------
// -------------------------------------- WebSite ----------------------------------------------



describe("adfsf", function(){
    it("oiksanf", function(done){
        supertest(app)
            .get("/movies")
            
    })
}) */