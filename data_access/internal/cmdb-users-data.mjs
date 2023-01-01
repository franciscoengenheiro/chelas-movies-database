// Module that manages application user data 

'use strict'

import crypto from 'crypto'
import * as File from '#data_access/util/file-operations.mjs'

// Constants
const USERS_FILE = './local_data/users.json'

/**
 * Creates a new user and updates user local storage
 * @param {String} userToken token used to identify a user
 */
export async function createUserData(username, password) {
    let usersObj = await File.read(USERS_FILE)
    // Retrieve the new user Id 
    let newUserID = ++usersObj.IDs
    // Create a new user
    let newUser = {
        id: newUserID,
        username: username,
        password: password,
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
export async function getUserData(query_value) {
    let usersObj = await File.read(USERS_FILE)
    return usersObj.users.find(user => user.token == query_value || user.username == query_value)
}