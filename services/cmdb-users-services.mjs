// Module manages application users services.

'use strict'

import errors from '#errors/errors.mjs'

export default function(userData) {
    return {
        createUser: createUser,
        getUserByUsername: getUserByUsername
    }

    /**
     * Creates a new user with a given token
     * @param {String} userToken token used to identify a user  
     * @throws InvalidUserException if the user already exists
     */
    async function createUser(username, password, email, passConfirm) {
        if(typeof username !== 'string' || typeof password !== 'string' || typeof email !== 'string' 
            || username.length == 0 || password.length == 0 || email.length == 0){
            throw errors.INVALID_ARGUMENT("username or password")
        }
        if(password != passConfirm) {
            throw errors.PASSWORDS_DO_NOT_MATCH()
        }
        // Retrieves user if it exists in users data
        let user = await getUserByUsername(username)
        // If the user already exists:
        if(user != undefined) {
            throw errors.INVALID_USER("already exists")
        }
        return userData.createUserData(username, password, email)
    }

    async function getUserByUsername(username) {
        return userData.getUserData("username", username)
    }
}