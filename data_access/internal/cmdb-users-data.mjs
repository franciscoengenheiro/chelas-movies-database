// Module that manages and provides access to the application's users internal data

'use strict'

import crypto from 'crypto'
import * as File from '#data_access/util/file-operations.mjs'

// Constants
const USERS_FILE = './local_data/users.json'

/**
 * Creates a new user and updates user local storage.
 * @param {String} username registration identifier.
 * @param {String} password login authenticator.
 * @param {String} email user email address.
 * @returns the user created. 
 */
export async function createUserData(username, password, email) {
    let usersObj = await File.read(USERS_FILE)
    // Retrieve the new user Id 
    let newUserID = ++usersObj.IDs
    // Create a new user
    let newUser = {
        id: newUserID,
        username: username,
        password: password,
        email: email,
        token: crypto.randomUUID()
    }
    // Store the newly created user
    usersObj.users.push(newUser)
    await File.write(usersObj, USERS_FILE)
    return newUser
}

/**
 * Retrieves an user by it's username.
 * @param {String} username registration identifier.
 */
export async function getUserByUsername(username) {
    return getUserData("username", username)
}

/**
 * Retrieves an user by it's token.
 * @param {String} userToken token used to allow an user to access a service.
 */
export async function getUserByUserToken(userToken) {
    return getUserData("token", userToken)
}

export async function getUserByEmail(email){
    return getUserData("email", email)
}

/**
 * Retrieves user data from the local user storage.
 * @param {String} propName object key to search the value for.
 * @param {String} value value to search. This value can either be a username or a user token.
 * @returns the user found or undefined.
 */
async function getUserData(propName, value) {
    let usersObj = await File.read(USERS_FILE)
    return usersObj.users.find(user => user[propName] == value)
}