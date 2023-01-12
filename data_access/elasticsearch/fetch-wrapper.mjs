// Module that defines the http methods and/or options when using the node fetch module
// to access the elastic search HTTP API

'use strict'

import fetch from '#data_access/fetch/node-fetch.mjs'

export async function get(uri) {
    return fetch(uri)
}

export async function post(uri, body) {
    const options = Object.assign({method: "POST"}, jsonBody(body))
    return fetch(uri, options)
}

export async function put(uri, body) {
    const options = Object.assign({method: "PUT"}, jsonBody(body))
    return fetch(uri, options)
}

export async function del(uri) {
    return fetch(uri, {
        method: "DELETE"
    })
}

function jsonBody(body) {
    return {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}
