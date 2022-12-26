// Module that contains the functions that handle all HTTP Requests
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format

import url from 'url'
import errors from '../../errors/errors.mjs'

// Retrieves the relative path to the file
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)) 

export default function (cmdbServices) {
    // Validate if all the received services exist
    if (!cmdbServices) {
        throw errors.INVALID_ARGUMENT("cmdbServices")
    }
    return {
       
    }
    // Example - to delete
    async function createTask(req, rsp) {
        // Post/Redirect/Get (PRG) is a web development design pattern that lets the page shown 
        // after a form submission be reloaded, shared, or bookmarked without ill effects, such
        // as submitting the form another time.
        rsp.redirect('/groups')
    }

    /**
     * Sends a file from the location given by filename current directory
     * @param {String} fileName end segment of the file path
     * @param {*} rsp response object
     */  
    function sendFile(fileName, rsp) {
        const fileLocation = __dirname + 'public/' + fileName
        rsp.sendFile(fileLocation)
    }
  
    /** 
     * Constructs a new View with the given name and data to send to response render function
     * @param {*} name - identifies the uri end segment
     * @param {*} data - object with data to send 
     */
    function View(name, data) {
        this.name = name,
        this.data = data
    }

    function handleRequest(handler) {
        return async function(req, rsp) {
            // Hammered token
            req.token = "c64ae5a8-6f3e-11ed-a1eb-0242ac120002"

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
    }
}