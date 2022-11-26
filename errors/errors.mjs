// Module that defines all possible application errors

'use strict'

// Object to map application errors with correspondent internal identifier
export let errorCodes =  {
    INVALID_ARGUMENT_CODE: 1,
    ARGUMENT_NOT_FOUND_CODE: 2,
    INVALID_USER_CODE: 3,
    USER_NOT_FOUND_CODE: 4
}

/**
 * Object that returns each possible application error in a object format with
 * two properties: code and description
 */
export default {
    INVALID_ARGUMENT: (argName) => {
        return {
            code: errorCodes.INVALID_ARGUMENT_CODE,
            description: `Invalid Argument: ${argName}`
        }
    },
    ARGUMENT_NOT_FOUND: (argName) => {
        return {
            code: errorCodes.ARGUMENT_NOT_FOUND_CODE,
            description: `Argument not found: ${argName}`
        }
    },
    INVALID_USER: (argName) => {
        return {
            code: errorCodes.INVALID_USER_CODE,
            description: `Invalid user: ${argName}`
        }
    },
    USER_NOT_FOUND: (argName) => {
        return {
            code: errorCodes.USER_NOT_FOUND_CODE,
            description: `User not found: ${argName}`
        }
    }
}