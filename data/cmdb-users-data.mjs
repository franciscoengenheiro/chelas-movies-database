// Module that manages application user data 

'use strict'

import * as File from './file-operations.mjs'
import errors from '../errors/errors.mjs'

// Constants
const USERS_FILE = './local_data/users.json'

/**
 * Creates a new user and updates user local storage
 * @param {String} userToken token used to identify a user
 */
export async function createUserData() {
    let usersObj = await File.read(USERS_FILE)
    // Retrieve the new user Id 
    let newUserID = ++usersObj.IDs
    // Create a new user
    let newUser = {
        id: newUserID,
        name: `User ${newUserID}`,
        token: crypto.randomUUID()
    }
    // Store the newly created user
    usersObj.users.push(newUser)
    await File.write(usersObj, USERS_FILE)
    return newUser
}

/**
 * Retrieves user data from local storage
 * @param {String} userToken token used to identify a user
 * @returns the user found or undefined
 */
export async function getUserData(userToken) {
    let usersObj = await File.read(USERS_FILE)
    return usersObj.users.find(user => user.token == userToken)
}