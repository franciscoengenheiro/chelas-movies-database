// Module manages application users services.

'use strict'

import errors from '../errors/errors.mjs'
import * as userData from '../data/cmdb-users-data.mjs'

/**
 * Creates a new user with a given token
 * @param {String} userToken token used to identify a user  
 * @throws Invalid User Exception if the user already exists
 */
export async function createUser(userToken) {
    // Retrieves user if it exists in users data
    let checkUser = await userData.getUserData(userToken)
    // If the user already exists:
    if(checkUser != undefined) {
        throw errors.INVALID_USER("already exists")
    }
    return userData.createUserData(userToken)
}