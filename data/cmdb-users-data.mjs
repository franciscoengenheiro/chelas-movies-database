'use strict'

import { readFromFile, writeToFile } from './cmdb-data-mem.mjs'
import errors from '../errors/errors.mjs'

const USERS_FILE = './local_data/users.json'

export async function createUserData() {
    let usersObj = await readFromFile(USERS_FILE)
    let idx = 1

    if(usersObj.users.length > 0) {
        idx = usersObj.users[usersObj.users.length - 1].id + 1
    }
    
    let newUser = {
            id: idx,
            name: `User ${idx}`,
            token: userToken
    }

    usersObj.users.push(newUser)

    return writeToFile(usersObj, USERS_FILE)
}

export async function getUserData(userToken){
    let usersObj = await readFromFile(USERS_FILE)

    return usersObj.users.find(user => user.token == userToken)
}

export async function checkUserData(userToken) {
    const user = await getUserData(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND(userToken)
    }

    return user
}