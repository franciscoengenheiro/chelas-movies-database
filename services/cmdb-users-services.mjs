// Module that manages application users services

'use strict'

import errors from '#errors/errors.mjs'

/**
 * @param {*} usersData module that manages application users data.
 * @returns an object with all the avalaible application user services as properties.
 */
export default function(usersData) {
    // Validate if users data module received exists
    if (!usersData) {
        throw errors.INVALID_ARGUMENT("usersData")
    }

    return {
        createUser: createUser,
        getUserByUsername: getUserByUsername
    }

    /**
     * Creates a new user with a given token.
     * @param {String} username registration identifier.
     * @param {String} password login authenticator.
     * @param {String} email user email address.
     * @param {String} passConfirm used to provide extra user confirmation when defining a password.
     * @throws InvalidArgumentException if the username or password is incorrect.
     * @throws InvalidUserException if the user already exists.
     * @throws PasswordsDoNotMatchException if the password and it's confirmation do not match.
     */
    async function createUser(username, password, email, passConfirm) {
        // Validate receive fields
        if (!validateString(username) || !validateString(password) || !validateString(email)) {
            throw errors.INVALID_ARGUMENT("username, password or email")
        }
        // Password confirmation
        if (password != passConfirm) {
            throw errors.PASSWORDS_DO_NOT_MATCH()
        }
        // Retrieves user if it exists in users data
        let user = await usersData.getUserByUsername(username)
        // If the user already exists:
        if (user != undefined) {
            throw errors.INVALID_USER("already exists")
        }
        return usersData.createUserData(username, password, email)
    }

    /**
     * Retrieves an user by it's username.
     * @param {String} username registration identifier.
     */
    async function getUserByUsername(username) {
        return usersData.getUserByUsername(username)
    }
}



// Auxiliary functions:
/**
 * Validates if the received field is a non-empty string.
 * @param {*} field field to validate.
 */
function validateString(field) {
    return typeof field === 'string' && field.length != 0
}