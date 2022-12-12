// Module that handles requests in JSON and HTML formats
// Handling means, in this context, verifying if a client has an access token and 
// wrapping the response in the specified format

'use strict'

import translateToHTTPResponse from "./http-error-responses.mjs" 

/**
 * Middleware that verifies if the client trying to access has a token
 * @param {*} handler function this middleware will be applied to
 * @return A response in JSON format
 */ 
export function handleRequestInJSON(handler) {
    // Function Express module calls
    return async function(req, rsp) {
        const BEARER_STR = "Bearer "
        // Get the value of the Authorization header
        const tokenHeader = req.get("Authorization")
        // If the token isn't valid:
        if (!(tokenHeader && 
            tokenHeader.startsWith(BEARER_STR) && tokenHeader.length > BEARER_STR.length)) {
            rsp
                .status(401)
                .json({error: `Invalid authentication token`})
                return
        }
        // Retrieve token with the expected format: Bearer <token> and create a property in the 
        // request object to easily retrieve it
        req.token = tokenHeader.split(" ")[1]
        try {
            // With a token the actual function can be called
            let body = await handler(req, rsp)
            // Wrap the result in JSON format 
            rsp
                .json(body) //status code is 200 by default
        } catch(e) {
            // If an exception is found translate it to a HTTP response and wrap it in 
            // JSON format 
            const response = translateToHTTPResponse(e)
            rsp
                .status(response.status)
                .json(response.body)
        }
    }
}

/**
 * Middleware that verifies if the client trying to access has a token
 * @param {*} handler function this middleware will be applied to
 * @return A response in HTML document (View)
 */ 
export function handlerRequestInHTML(handler) {
    return async function (req, rsp) {
        // While we do not have authentication in site interface,
        // let's hardcode a token for an user
        req.token = "c64ae5a8-6f3e-11ed-a1eb-0242ac120002"
        try {
            let view = await handler(req, rsp)
            if(view) {
                rsp.render(view.name , view.data)
              }
        } catch(e) {
            // *TODO*("Change this JSON format to view format")
            const response = translateToHTTPResponse(e)
            rsp
                .status(response.status)
                .json(response.body)
        }
    }
}