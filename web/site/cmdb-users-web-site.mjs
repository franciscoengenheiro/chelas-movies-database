// Module that contains the functions that handle all HTTP Requests that are user related 

'use strict'

import errors from "#errors/errors.mjs"
import translateToHTTPResponse from '#web/http-error-responses.mjs'
import express from 'express'
import passport from 'passport'
import session from 'express-session'

export default function(userServices) {
    // Validate if all the received services exist
    if (!userServices) {
        throw errors.INVALID_ARGUMENT("userServices")
    }

    passport.serializeUser((userInfo, done) => { done(null, userInfo); });
    passport.deserializeUser((userInfo, done) => { done(null, userInfo); });

    // Initialize a router
    const router = express.Router()

    router.use(session({
        secret: 'leic-ipw-g06',
        cookie:{_expires : 10800000}, // time im ms (corresponds to 3 hours)
        resave: false,
        saveUninitialized: false
    }));
    router.use(passport.session()) // Passport initialization
    router.use(passport.initialize())

    router.use('/auth', verifyAuthenticated)

    router.get('/home', homeNotAuthenticated)
    router.get('/auth/home', homeAuthenticated)

    router.get('/login', loginForm)
    router.post('/login', validateLogin)
    router.get('/register',newUser)
    router.post('/register', createUser)
    router.post('/logout', logout)
    
    return router

    function newUser(req, rsp) {
        rsp.render('newUser')
    }

    async function createUser(req, rsp) {
        const username = req.body.username
        const password = req.body.password
        const email = req.body.email
        const passConfirm = req.body.passConfirm
        try {
            await userServices.createUser(username, password, email, passConfirm)
            await validateLogin(req, rsp) // Enables login on registration
        } catch(e) {
            const httpResponse = translateToHTTPResponse(e)
            rsp.render('onError', httpResponse)
        } 
    }

    function homeNotAuthenticated(req, rsp) {
        rsp.render('home')
    }
        
    function homeAuthenticated(req, rsp) {
        const viewData = { user: req.user }
        rsp.render('home', viewData)
    }
    
    function loginForm(req, rsp) {
        rsp.render('login')
    }

    async function validateUser(username, password) {
        let user = await userServices.getUserByUsername(username)
        if (!user || user.password != password) return undefined
        else return user
    }

    async function validateLogin(req, rsp) {
        let user = await validateUser(req.body.username, req.body.password)
        if (user) {
            // Represents a user in the CMDB application
            // Passport saves this object in session and when the request arrives, and while the 
            // session for this user is active (determined by a cookie), the data can be accessed 
            // in req.user
            req.login({
                username: user.username,
                token: user.token
            }, () => rsp.redirect('/auth/home'))
        } else {
            rsp.redirect('/login')
        }
    }
    
    function verifyAuthenticated(req, rsp, next) {
        // The user is only authenticated if req.user != undefined
        if (req.user) {
            // Call next middleware in the stack
            return next()
        } else {
            rsp.redirect('/login')
        }
    }
    
    function logout(req, rsp) {
        // Destroys req.user object and removes it from the session 
        req.logout((err) => {
            rsp.redirect('/home')
        }) 
    }
}
