'use strict'

import fetch from "node-fetch"

export default async function(URL) {
    let fetch_obj = await fetch(URL)
    return fetch_obj.json()
}