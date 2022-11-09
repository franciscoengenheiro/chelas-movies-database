'use strict'

// Module that contains all of the logic of each of the application's functionalities 

import * as tasksData from './cmdb-movies-data.mjs'
import * as usersData from './cmdb-data-mem.mjs'

// TODO("Every method in this module must have a userToken as a parameter")
export async function getTasks(userToken) {
    let user = await usersData.getUser(userToken)
    return tasksData.getTasks()
}

export async function getTask(taskId) {
    // Validate taskId
    return tasksData.getTask(taskId)
}

export async function deleteTask(taskId) {
    // Validate taskId
    return tasksData.deleteTask(taskId)
}

export async function createTask(taskToCreate) {
    // Validate new task properties
    if(!isAString(taskToCreate.title))
        throw "Invalid Argument"
    return tasksData.createTask(taskToCreate)
}

export async function updateTask(taskId, newTask) {
    // Validate new task properties
    if(!isAString(taskToCreate.title))
        throw "Invalid Argument"
    return tasksData.updateTask(taskId, newTask)
}

// Auxiliary functions
function isAString(value) {
    return typeof value == 'string' && value != ""
}