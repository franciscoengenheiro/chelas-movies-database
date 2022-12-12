// Module that defines all possible application errors

'use strict'

/**
 * Object to map application errors with correspondent internal identifier
 */
export let errorCodes =  {
    INVALID_ARGUMENT_CODE: 1,
    ARGUMENT_NOT_FOUND_CODE: 2,
    INVALID_USER_CODE: 3,
    USER_NOT_FOUND_CODE: 4,
    INVALID_FORMAT_CODE: 5
}

/**
 * Object that returns each possible application error in a object with
 * two properties: code (internal erorr code) and description 
 */
export default {
    INVALID_ARGUMENT: (argName) => 
        new InternalError(errorCodes.INVALID_ARGUMENT_CODE, `Invalid argument: ${argName}`), 
    ARGUMENT_NOT_FOUND: (argName) => 
        new InternalError(errorCodes.ARGUMENT_NOT_FOUND_CODE, `Argument not found: ${argName}`), 
    INVALID_USER: (argName) => 
        new InternalError(errorCodes.INVALID_USER_CODE, `Invalid user: ${argName}`), 
    USER_NOT_FOUND: (argName) => 
        new InternalError(errorCodes.USER_NOT_FOUND_CODE, `User not found: ${argName}`),
    INVALID_FORMAT: (argName) => 
        new InternalError(errorCodes.INVALID_FORMAT_CODE, `Invalid format: ${argName}`)
}

/** 
 * Constructs a new Internal Error with a given code and description
 * @param {Int} code - error identifier
 * @param {String} description - message that describes the error
 */
function InternalError(code, description) {
    this.code = code
    this.description = description
}