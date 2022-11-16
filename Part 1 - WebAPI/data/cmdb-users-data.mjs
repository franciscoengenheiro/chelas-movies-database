'use strict'

import {readFile, writeFile} from 'node:fs/promises'
import errors from '../errors/errors.mjs'

const USERS_FILE = '../local_data/users.json'

export async function createUserData() {
    let usersObj = await readFromFile()
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

    return writeToFile(usersObj)
}

export async function getUserData(userToken){
    let usersObj = await readFromFile()

    return usersObj.users.find(user => user.token == userToken)
}

export async function checkUserData(userToken) {
    const user = await getUserData(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND(userToken)
    }

    return user
}


async function readFromFile() {
    let fileContents = await readFile(USERS_FILE)
    return JSON.parse(fileContents)
}

async function writeToFile(obj){
    return writeFile(USERS_FILE, JSON.stringify(obj, null , 4))
}