// Module that provides access to data stored in a user by any of it's unique attributes
// as primary key.

'use strict'

export default function(getUserData) {
    if (!getUserData) { 
        throw errors.INVALID_ARGUMENT("getUserData")
    }
    return {
        getUserByUsername: getUserByUsername,
        getUserByUserToken: getUserByUserToken,
        getUserByEmail: getUserByEmail
    }
    /**
     * Retrieves an user by it's username.
     * @param {String} username registration identifier.
     */
    async function getUserByUsername(username) {
        return getUserData("username", username)
    }
    
    /**
     * Retrieves an user by it's token.
     * @param {String} userToken token used to allow an user to access a service.
     */
    async function getUserByUserToken(userToken) {
        return getUserData("token", userToken)
    }
    
    /**
     * Retrieves an user by it's email.
     * @param {String} email user email address.
     */
    async function getUserByEmail(email) {
        return getUserData("email", email)
    }
}