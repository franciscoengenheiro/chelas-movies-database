'use strict'

import translateToHTTPResponse from '#web/http-error-responses.mjs'

export default function(handler, handlerTry, handlerCatch) {
    return async function(req, rsp) {

        try{
            let returnedByHandler = await handler(req, rsp)

            handlerTry(returnedByHandler, rsp)

        } catch(e) {
            const httpResponse = translateToHTTPResponse(e)

            handlerCatch(httpResponse, rsp)
        }

    }
}