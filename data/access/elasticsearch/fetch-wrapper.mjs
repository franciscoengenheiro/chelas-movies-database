// Module that defines the http methods and/or options when using the node fetch module
// to access the elastic search HTTP API

'use strict'

import fetch from '#data_access/fetch/node-fetch.mjs'

export async function get(uri) {
    return fetch(uri)
}

export async function post(uri, body) {
    return fetchWithBody(uri, "POST", body)
}

export async function put(uri, body) {
    return fetchWithBody(uri, "PUT", body)
}

export async function del(uri) {
    return fetch(uri, {
        method: "DELETE"
    })
}

async function fetchWithBody(uri, method, body) {
    const options = Object.assign({method: method}, jsonBody(body))
    return fetch(uri, options)
}

function jsonBody(body) {
    return {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}