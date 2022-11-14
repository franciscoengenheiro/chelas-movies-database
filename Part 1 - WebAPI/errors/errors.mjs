// Define all possible application errors

export let errorCodes =  {
    INVALID_ARGUMENT_CODE: 1,
    ARGUMENT_NOT_FOUND_CODE: 2,
    INVALID_USER_CODE: 3,
    USER_NOT_FOUND_CODE: 4
}

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