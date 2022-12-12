// Module that translates the application internal errors in HTTP error responses

'use strict'

import { errorCodes } from "../errors/errors.mjs"

/**
 * Translates application errors to HTTP error responses
 * @param {*} exception internal application error
 */
export default function(exception) {
    // Search in errors object for a property that matches the given exception code 
    let errorFunction = errors[exception.code]
    // If none was found:
    if (!errorFunction) {
        // If the exception is of unknown type:
        return new HTTPResponse(500, "Internal Server error")
    } 
    return errorFunction(exception.description)
}

// Object to map application errors with correspondent HTTP error responses
let errors = {
    [errorCodes.INVALID_ARGUMENT_CODE]: (description) => new HTTPResponse(400, description),
    [errorCodes.ARGUMENT_NOT_FOUND_CODE]: (description) => new HTTPResponse(404, description),
    [errorCodes.INVALID_USER_CODE]: (description) => new HTTPResponse(401, description),
    [errorCodes.USER_NOT_FOUND_CODE]: (description) => new HTTPResponse(404, description)
}

/** 
 * Override status and body properties from a HTTP response with received values 
 * @param {*} status - new HTTP status code
 * @param {*} body - new HTTP body
 */
function HTTPResponse(status, body) {
    this.status = status
    this.body = body
}