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
    async function createUser(query_value, password) {
        if (!isAstringAndOnlyContainsDigitsAndLetters(query_value))
            throw errors.INVALID_ARGUMENT("username")
        if (!isAstringAndOnlyContainsDigitsAndLetters(password))
            throw errors.INVALID_ARGUMENT("password")
        // Retrieves user if it exists in users data
        let user = await userData.getUserData(query_value)
        // If the user already exists:
        if(user != undefined) {
            throw errors.INVALID_USER("already exists")
        }
        return userData.createUserData(query_value, password)
    }

    async function getUser(query_value) {
        return userData.getUserData(query_value)
    }

    // Auxiliary functions:
    function isAstringAndOnlyContainsDigitsAndLetters(str) {
        if (!(typeof str === 'string')) return false
        return /^[A-Za-z0-9]*$/.test(str)
    }
}