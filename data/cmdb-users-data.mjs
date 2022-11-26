// Module that manages application user data 

'use strict'

import * as File from './file-operations.mjs'
import errors from '../errors/errors.mjs'

// Constants
const USERS_FILE = './local_data/users.json'

/**
 * Creates a new user and updates user storage
 * @param {String} userToken user identifier
 */
export async function createUserData(userToken) {
    let usersObj = await File.read(USERS_FILE)
    // Retrieve the new user Id 
    let newUserID = ++usersObj.IDs
    // Object that represents the new user
    let newUser = {
        id: newUserID,
        name: `User ${newUserID}`,
        token: userToken
    }
    // Store the newly created user
    usersObj.users.push(newUser)
    return File.write(usersObj, USERS_FILE)
}

/**
 * Retrieves user data from storage
 * @param {String} userToken user identifier
 * @returns the user found or undefined
 */
export async function getUserData(userToken){
    let usersObj = await File.read(USERS_FILE)
    return usersObj.users.find(user => user.token == userToken)
}

/**
 * Checks if the user exists in the storage
 * @param {String} userToken user identifier
 * @throws UserNotFoundException if the received token is invalid
 * @returns The user found.
 */
export async function checkUserData(userToken) {
    const user = await getUserData(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND(userToken)
    }
    return user
}