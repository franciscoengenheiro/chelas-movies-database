'use strict'

import errors from '../errors/errors.mjs'
import fetch from './node-fetch.mjs'
import { baseURL, REFRESH } from './cmdb-data-elasticsearch.mjs'

// Constants
const USERS_BASE_URL = `${baseURL}/users`

export default function() {
    return {
        createUserData: createUserData,
        getUserData: getUserData,
        checkUserData: checkUserData
    }
}

/**
 * Creates a new user and updates user local storage
 * @param {String} userToken token used to identify a user
 */
async function createUserData(username) {
    // Create properties for the new user
    let user = {
        username: username,
        token: Crypto.randomUUID() // Generate a random token for the user
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
    let userObj = await fetch(USERS_BASE_URL + '/_search')
    let user = userObj.hits.hits
        .map(user => {
            return {
                id: user._id,
                username: user._source.username,
                token: user._source.token
            }
        })
    return user
}

/**
 * Checks if the user exists in local storage
 * @param {String} userToken token used to identify a user
 * @throws UserNotFoundException if the received token is invalid
 * @returns The user found
 */
async function checkUserData(userToken) {
    let user = await getUserData(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND(userToken)
    }
    return user
}