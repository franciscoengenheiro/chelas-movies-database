// Module manages application users services.

'use strict'

import errors from '../errors/errors.mjs'
import * as userData from '../data/cmdb-users-data.mjs'

export async function createUser(userToken) {
    let checkUser = await userData.getUserData(userToken)
    if(checkUser != undefined) {
        throw errors.INVALID_USER("already exists")
    }

    return userData.createUserData(userToken)
}

//crypto.randomUUID() --> to generate user token