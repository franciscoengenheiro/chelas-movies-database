// Module that contains all middlewares that were specifically created for the CMDB
// Application and were not imported from elsewhere

/**
 * Unwraps the user token from the authorization Bearer header if the Content-Type 
 * Header of the request is: application/json 
 * @returns A property in the req object called token with the received user token
 * @throws An error object in JSON
 */
export function retrieveTokenFromBearer(req, rsp, next) {
    // Get the value of the Content-Type request header
    const reqContentType = req.get("Content-Type")
    if (reqContentType == 'application/json') {
        const BEARER_STR = "Bearer "
        // Get the value of the Authorization request header
        const tokenHeader = req.get("Authorization")
        // If the token isn't valid:
        if (!(tokenHeader && 
            tokenHeader.startsWith(BEARER_STR) && tokenHeader.length > BEARER_STR.length)) {
            // Wrap the error esponse in JSON format
            rsp
                .status(401)
                .json({error: `Invalid authentication token`})
                return
        }
        // Retrieve token with the expected format: Bearer <token> and create a property in the 
        // request object to easily retrieve it
        req.token = tokenHeader.split(" ")[1]
    } 
    // Call next middleware function
    next()
}

export function retrieveToken(req, rsp, next) {
    // Get the value of the Content-Type request header
    const reqContentType = req.get("Content-Type")
    if (reqContentType == 'application/x-www-form-urlencoded') {
        // Hammered token
        req.token = "c64ae5a8-6f3e-11ed-a1eb-0242ac120002"
    }
    // Call next middleware function
    next()
}