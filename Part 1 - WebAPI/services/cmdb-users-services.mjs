// Module manages application users services.

import { writeFile } from 'node:fs/promises'
import { readFromFile } from "./cmdb-services.mjs"
import errors from '../errors/errors.mjs'

const USERS_FILE = '../local_data/users.json'

export async function createUser(userToken) {
    let usersObj = await readFromFile(USERS_FILE)
    let idx = 1

    let checkUser = await getUser(userToken)
    if(checkUser != undefined) {
        throw errors.INVALID_USER("already exists")
    }

    if(usersObj.users.length > 0) {
        idx = usersObj.users[usersObj.users.length - 1].id + 1
    }
    
    let newUser = {
            id: idx,
            name: `User ${idx}`,
            token: userToken
    }

    usersObj.users.push(newUser)

    return writeFile(USERS_FILE, JSON.stringify(usersObj, null , 4))
}

export async function getUser(userToken) {
    let usersObj = await readFromFile(USERS_FILE)

    return usersObj.users.find(user => user.token == userToken)
}

//crypto.randomUUID() --> to generate user token