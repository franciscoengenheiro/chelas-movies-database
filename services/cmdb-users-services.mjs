// Module manages application users services.

'use strict'

import errors from '../errors/errors.mjs'

export default function(userData) {
    return {
        createUser: createUser,
        checkUser: checkUser
    }

    /**
     * Creates a new user with a given token
     * @param {String} userToken token used to identify a user  
     * @throws Invalid User Exception if the user already exists
     */
    async function createUser(username, password) {
        // Retrieves user if it exists in users data
        let checkUser = await checkUser(username, password)
        // If the user already exists:
        if(checkUser != undefined) {
            throw errors.INVALID_USER("already exists")
        }
        return userData.createUserData(username, password)
    }

    async function checkUser(username, password) {
        let checkUser = await userData.getUserData(username, password)
        return checkUser
    }
}