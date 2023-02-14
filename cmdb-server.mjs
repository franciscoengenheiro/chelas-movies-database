// This module creates an Express node js application, initializes all of its modules,
// including data access and manipulation, services and web, and registers middlewares 
// used within the application's sub-modules routes. 
// It is also possible to specify which fetch module to use.

// This directive is necessary to ensure that common programmer type errors cause exceptions,
// making the code easier to debug.
'use strict'

// External imports
import express from 'express'
import cors from 'cors'
import path from 'path'
import url from 'url'
import hbs from 'hbs'

// Internal imports
import cmdbUserServicesInit from '#services/cmdb-users-services.mjs'
import imdbDataInit from '#data_access/imdb-movies-data.mjs'
import cmdbServicesInit from '#services/cmdb-services.mjs' 
import cmdbWebApiInit from '#web/api/cmdb-web-api.mjs'
import cmdbWebSiteInit from '#web/site/cmdb-web-site.mjs'
import cmdbUsersWebSiteInit from '#web/site/cmdb-users-web-site.mjs'

export default function(config) {
    // ------------------------------------ Initializations -----------------------------------------
    const imdbData = imdbDataInit(config.fetch)
    const cmdbServices = cmdbServicesInit(imdbData, config.cmdbData, config.usersData)
    const cmdbUserServices = cmdbUserServicesInit(config.usersData)
    const cmdbWebApi = cmdbWebApiInit(cmdbServices, cmdbUserServices)
    const cmdbWebSite = cmdbWebSiteInit(cmdbServices)
    const cmdbUserWebSite = cmdbUsersWebSiteInit(cmdbUserServices)
    // ------------------------------------ Initializations -----------------------------------------

    let app = express() // Instance of the application

    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

    // View engine setup
    const viewsPath = `${__dirname}/web/site/views`
    app.set('view engine', 'hbs')
    app.set('views', viewsPath)
    hbs.registerPartials(`${viewsPath}/partials`)

    // ------------------------------------ Middlewares --------------------------------------------
    // CORS (Cross Origin Resource Sharing) is an HTTP-header based mechanism that allows a server 
    // to indicate any origins other than its own from which a browser should permit loading 
    // resources from. 
    // New HTTP-header: Access-Control-Allow-Origin: *
    app.use(cors()) 
    // Parses incoming requests with JSON payloads if the Content-Type of the request header
    // matches this option 
    app.use(express.json())
    // Parses incoming requests with urlencoded payloads if the Content-Type of the request header 
    // matches this option. The extended option allows to choose between parsing the URL-encoded 
    // data with the querystring library (when false) or the qs library (when true). 
    // The “extended” syntax allows for rich objects and arrays to be encoded into the URL-encoded 
    // format, allowing for a JSON-like experience with URL-encoded.
    app.use(express.urlencoded({ extended: false })) 
    // By using the middle static on Express, we're providing files such as images, CSS files, 
    // and JavaScript files
    app.use(express.static(path.join(__dirname, "web/site")));
    app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
    // Register application routers
    app.use(cmdbUserWebSite)
    app.use('/auth', cmdbWebSite.withAuth)
    app.use(cmdbWebSite.withoutAuth)
    app.use('/api', cmdbWebApi)
    // ------------------------------------ Middlewares ----------------------------------------------

    return app
}