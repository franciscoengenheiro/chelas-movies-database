'use strict'

import * as fileOperation from './read&write.mjs'
import errors from '../errors/errors.mjs'

const USERS_FILE = './local_data/users.json'

export async function createUserData(userToken) {
    let usersObj = await fileOperation.readFromFile(USERS_FILE)
    
    let newUserID = ++usersObj.IDs

    let newUser = {
            id: newUserID,
            name: `User ${newUserID}`,
            token: userToken
    }

    usersObj.users.push(newUser)
    return fileOperation.writeToFile(usersObj, USERS_FILE)
}

export async function getUserData(userToken){
    let usersObj = await fileOperation.readFromFile(USERS_FILE)

    return usersObj.users.find(user => user.token == userToken)
}

export async function checkUserData(userToken) {
    const user = await getUserData(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND(userToken)
    }

    return user
}