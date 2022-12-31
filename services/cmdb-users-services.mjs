// Module manages application users services.

'use strict'

import errors from '../errors/errors.mjs'

export default function(userData) {
    return {
        createUser: createUser,
        getUser: getUser
    }

    /**
     * Creates a new user with a given token
     * @param {String} userToken token used to identify a user  
     * @throws Invalid User Exception if the user already exists
     */
    async function createUser(query_value, password) {
        // Retrieves user if it exists in users data
        let checkUser = await userData.getUserData(query_value)
        // If the user already exists:
        if(checkUser != undefined) {
            throw errors.INVALID_USER("already exists")
        }
        return userData.createUserData(query_value, password)
    }

    async function getUser(query_value){
        return userData.getUserData(query_value)
    }
}