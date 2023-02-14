// Module that exports the HTTP request handler. This handler simply channels to the received functions
// what to do in case of a request success and failure, respectively.

'use strict'

import translateToHTTPResponse from '#web/http-error-responses.mjs'

/**
 * Middleware that acts as a fork between a request confirmation of success or failure.
 * @param {Function} handler function that Express calls when a request is made.
 * @param {Function} handlerTry function that handles the request success.
 * @param {Function} handlerCatch function that handles the request failure.
 */
export default function(handler, handlerTry, handlerCatch) {
    return async function(req, rsp) {
        try{
            let returnedByHandler = await handler(req, rsp)
            handlerTry(returnedByHandler, req, rsp)
        } catch(e) {
            // Translates an internal error into a HTTP error response
            const httpResponse = translateToHTTPResponse(e)
            handlerCatch(httpResponse, req, rsp)
        }
    }
}