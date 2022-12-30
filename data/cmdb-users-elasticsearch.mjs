'use strict'

import errors from '../errors/errors.mjs'
import fetch from './node-fetch.mjs'
import { baseURL, REFRESH } from './cmdb-data-elasticsearch.mjs'

// Constants
const USERS_BASE_URL = `${baseURL}/users`

export default function() {
    return {
        createUserData: createUserData,
        getUserData: getUserData
    }
}

/**
 * Creates a new user and updates user local storage
 * @param {String} username token used to identify a user
 */
async function createUserData(username, password) {
    // Create properties for the new user
    let user = {
        username: username,
        password: password
    }

    let options = {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }
    await fetch(USERS_BASE_URL + '/_doc' + REFRESH, options)
    return obj
}

/**
 * Retrieves user data from local storage
 * @param {String} userToken token used to identify a user
 * @returns the user found or undefined
 */
async function getUserData(userToken) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": {
                "match": {
                    "token": {
                        "query": userToken,
                        "operator": "AND"
                    }
                }
            }
        })
    }
    let userObj = await fetch(USERS_BASE_URL + '/_search', options)
    let user = {}
    if(userObj.hits.hits.length == 1){
        user = userObj.hits.hits[0]._source
    }
    else return undefined

    user.id = userObj.hits.hits[0]._id
    return user
}