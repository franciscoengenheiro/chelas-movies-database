'use strict'

import {readFile, writeFile} from 'node:fs/promises'

export async function readFromFile(file_name) {
    let fileContents = await readFile(file_name)
    return JSON.parse(fileContents)
}

export async function writeToFile(obj, file_name){
    return writeFile(file_name, JSON.stringify(obj, null , 4))
}