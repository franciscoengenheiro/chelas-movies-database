// Module manages application users services.

'use strict'

import errors from '#errors/errors.mjs'

export default function(userData) {
    return {
        createUser: createUser,
        getUser: getUser
    }

    /**
     * Creates a new user with a given token
     * @param {String} userToken token used to identify a user  
     * @throws InvalidUserException if the user already exists
     */
    async function createUser(username, password) {
        if(typeof username !== 'string' || typeof password !== 'string' || username.length == 0 || password.length == 0){
            throw errors.INVALID_ARGUMENT("username or password")
        }
        // Retrieves user if it exists in users data
        let user = await userData.getUserData(username)
        // If the user already exists:
        if(user != undefined) {
            throw errors.INVALID_USER("already exists")
        }
        return userData.createUserData(username, password)
    }

    async function getUser(query_value) {
        return userData.getUserData(query_value)
    }
}