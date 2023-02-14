// Module that manipulates data related to users.

'use strict'

import { User } from "#data_manipulation/classes.mjs"

/**
 * @param {Object} userObj an object that contains data for a new user.
 * @returns a User object.
 */
export function createUser(userObj) {
    // Create a new User object with the received properties
    return new User(userObj)
}