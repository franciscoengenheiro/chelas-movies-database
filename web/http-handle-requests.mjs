// Module that handles requests in JSON and HTML formats
// Handling means, in this context, verifying if a client has an access token and 
// wrapping the response in the specified format

'use strict'

import translateToHTTPResponse from "./http-error-responses.mjs" 
import errors from "../errors/errors.mjs"

export default function (handler) {
    return async function (req, rsp) {
        // Get the value of the Content-Type request header
        const reqContentType = req.get("Content-Type")
        switch(reqContentType) {
            case 'application/json':
                handlerInJSON(req, rsp, handler)
                break
            case 'application/x-www-form-urlencoded':
                handlerInHTML(req, rsp, handler)
                break
            default:
                throw errors.UNSUPPORTED_FORMAT(reqContentType)
        }
    }
}

async function handlerInJSON(req, rsp, handler) {
    try {
        // With a token the actual function can be called
        let body = await handler(req, rsp)
        // Wrap the result in JSON format 
        rsp.json(body) //status code is 200 by default
    } catch(e) {
        const httpResponse = translateToHTTPResponse(e)
        rsp
            .status(httpResponse.status)
            .json(httpResponse.body)
    }
}

async function handlerInHTML(req, rsp, handler) {
    try {
        let view = await handler(req, rsp)
        if (view) {
            // Wrap the result in JSON format 
            rsp.render(view.name , view.data)
        }
    } catch(e) {
        const httpResponse = translateToHTTPResponse(e)
        rsp.render(httpResponse.status, httpResponse.body);
    }   
}