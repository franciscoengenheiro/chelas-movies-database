// Module that provides access to file operations such as read and write
// Format supported: JSON

'use strict'

import { readFile, writeFile } from 'node:fs/promises'

/**
 * Reads specified file content
 * @param {String} file_name name of the file to read from 
 * @returns a javascript object with the contents of the file
 */
export async function read(file_name) {
    let fileContents = await readFile(file_name)
    return JSON.parse(fileContents)
}

/**
 * Writes to file the received content
 * @param {*} obj represents the content to be written to the file
 * @param {String} file_name name of the file to write to
 */
export async function write(obj, file_name) {
    return writeFile(file_name, JSON.stringify(obj, null , 4))
}