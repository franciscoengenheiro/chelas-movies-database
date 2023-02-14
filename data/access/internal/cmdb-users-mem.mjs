// Module that provides access to the application's users internal data stored in 
// memory (local storage)

'use strict'

import * as File from '#data_access/util/file-operations.mjs'
import * as dataManipulation from '#data_manipulation/cmdb-users-man.mjs'
import userRetrieval from '#data_access/util/user-retrieval.mjs'

// Initializations
const userData = userRetrieval(getUserData)

// Constants
const USERS_FILE = './data/local/users.json'

export default function() {
    return {
        createUserData: createUserData,
        getUserByUserToken: userData.getUserByUserToken,
        getUserByUsername: userData.getUserByUsername,
        getUserByEmail: userData.getUserByEmail
    }
}

/**
 * Creates a new user.
 * @param {String} username registration identifier.
 * @param {String} password login authenticator.
 * @param {String} email user email address.
 * @returns the user created.
 */
async function createUserData(username, password, email) {
    let usersObj = await File.read(USERS_FILE)
    // Retrieve the new user Id and increment id count
    const newUserID = ++usersObj.IDs
    // Create a new user
    const newUser = dataManipulation.createUser({
        id: newUserID,
        username: username,
        password: password,
        email: email
    })
    // Store the newly created user
    usersObj.users.push(newUser)
    await File.write(usersObj, USERS_FILE)
    return newUser
}

/**
 * Retrieves user data.
 * @param {String} propName property of a user object.
 * @param {String} value value to search for.
 * @returns the user found or undefined.
 */
async function getUserData(propName, value) {
    let usersObj = await File.read(USERS_FILE)
    return usersObj.users.find(user => user[propName] == value)
}