// This module registers all HTTP routes

// This directive is necessary to ensure that common programmer type errors cause exceptions,
// making the code easier to debug
'use strict'

// External imports
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import url from 'url'

// Internal imports
import cmdbUserServicesInit from '#services/cmdb-users-services.mjs'
// import * as usersData from '#data_access/internal/cmdb-users-data.mjs'
// import * as cmdbData from '#data_access/internal/cmdb-data-mem.mjs'
import cmdbUsersElastiSearchInit from '#data_access/elasticsearch/cmdb-users-elasticsearch.mjs'
import cmdbDataElasticSearchInit from '#data_access/elasticsearch/cmdb-data-elasticsearch.mjs'
import imdbDataInit from '#data_access/imdb-movies-data.mjs'
import cmdbServicesInit from '#services/cmdb-services.mjs' 
import cmdbWebApiInit from '#web/api/cmdb-web-api.mjs'
import cmdbWebSiteInit from '#web/site/cmdb-web-site.mjs'
import cmdbUsersWebSiteInit from '#web/site/cmdb-users-web-site.mjs'

// Fetch Modules
import fetch from '#data_access/fetch/node-fetch.mjs'
// import fetch from '#data_access/fetch/local-fetch.mjs'

export default function() {
    // Initializations 
    const usersData = cmdbUsersElastiSearchInit()
    const cmdbData = cmdbDataElasticSearchInit()
    const imdbData = imdbDataInit(fetch)
    const cmdbServices = cmdbServicesInit(imdbData, cmdbData, usersData)
    const cmdbUserServices = cmdbUserServicesInit(usersData)
    const cmdbWebApi = cmdbWebApiInit(cmdbServices, cmdbUserServices)
    const cmdbWebSite = cmdbWebSiteInit(cmdbServices)
    const cmdbUserWebSite = cmdbUsersWebSiteInit(cmdbUserServices)

    let app = express() // Instance of the application
    
    // View engine setup
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'web', 'site', 'views'));

    // ------------------------------------ Middlewares --------------------------------------------
    app.use(cors()) // CORS (Cross Origin Resource Sharing) is an HTTP-header based mechanism that
                    // allows a server to indicate any origins other than its own from which a 
                    // browser should permit loading resources from
                    // New HTTP-header: Access-Control-Allow-Origin: *

    // Parses incoming requests with JSON payloads if the Content-Type of the request header
    // matches this option 
    app.use(express.json())
    // Parses incoming requests with urlencoded payloads if the Content-Type of the request header 
    // matches this option. The extended option allows to choose between parsing the URL-encoded 
    // data with the querystring library (when false) or the qs library (when true). 
    // The “extended” syntax allows for rich objects and arrays to be encoded into the URL-encoded 
    // format, allowing for a JSON-like experience with URL-encoded.
    app.use(express.urlencoded({ extended: false })) 
    // Parses Cookie Header and populates req.cookies with an object 
                            // keyed by the cookie names
    app.use(express.static(path.join(__dirname, 'web', 'site')));
    app.use(cmdbUserWebSite)
    app.use('/auth', cmdbWebSite.withAuth)
    app.use(cmdbWebSite.withoutAuth)
    app.use('/api', cmdbWebApi)
    // ------------------------------------ Middlewares ----------------------------------------------

    return app
}