// Module that uses fetch() to retrieve resources from the web

'use strict'

import fetch from "node-fetch"

/**
 * Fetches specified resource from a container in the web
 * @param {String} URL resource path to retrieve information from in the web
 * @returns a promise that resolves to a JavaScript object of the result
 */
export default async function(URL) {
    let fetched_obj = await fetch(URL)
    return fetched_obj.json()
}