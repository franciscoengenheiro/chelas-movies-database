import { errorCodes } from "../errors/errors.mjs"

let errors = {
    [errorCodes.INVALID_ARGUMENT_CODE]: (description) => new HTTPResponse(400, description),
    [errorCodes.ARGUMENT_NOT_FOUND_CODE]: (description) => new HTTPResponse(404, description),
    [errorCodes.INVALID_USER_CODE]: (description) => new HTTPResponse(401, description),
    [errorCodes.USER_NOT_FOUND_CODE]: (description) => new HTTPResponse(404, description)
}

export default function(exception) {
    let errorFunction = errors[exception.code]
    if(!errorFunction){
        return new HTTPResponse(500, "Internal Server error")
    } 
    return errorFunction(exception.description)
}

// Override existing properties with new values received 
function HTTPResponse(status, body) {
    this.status = status
    this.body = body
}