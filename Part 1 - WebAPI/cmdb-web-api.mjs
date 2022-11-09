'use strict'

// Module that contains the functions that handle all HTTP API requests and make up the REST 
// API of the Web Application

// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoque the corresponding operation on services
//  - Generate the response

import * as tasksServices from './cmdb-services.mjs'

// Functions to export:
export const getTasks = verifyAuthentication(getTasksInternal)
export const getTask = verifyAuthentication(getTaskInternal)
export const deleteTask = verifyAuthentication(deleteTaskInternal)
export const updateTask = verifyAuthentication(updateTaskInternal )
export const createTask = verifyAuthentication(createTaskInternal )

async function getTasksInternal(req, rsp) {
    const tasks = await tasksServices.getTasks(req.token)
    rsp.json(tasks)
}

async function getTaskInternal(req, rsp) {
    getTaskAndAct(req.params.id, rsp, task => rsp.json(task))
}

async function deleteTaskInternal(req, rsp) {
    const taskId = req.params.id
    const deleted = await tasksServices.deleteTask(taskId)
    if (deleted) {
        rsp.json({status: `Task with id ${taskId} deleted with success`})
    } else {
        rsp.status(404).json({error: `Task with id ${taskId} not found`})
    }
}

async function createTaskInternal(req, rsp) {
    try {
        let newTask = await tasksServices.createTask(req.body)
        rsp
            .status(201)
            .json({
                status: `Task with id ${newTask.id} created with success`,
                newTask: newTask
                })
    } catch(e) {
        rsp
            .status(400)
            .json({error: `Error creating task: ${e}`})
    }
}

async function updateTaskInternal(req, rsp) {
    getTaskAndAct(req.params.id, rsp, update)
    function update(task) {
        rsp.json({
            status: `Task with id ${task.id} updated with success`,
            newTask: task
            })
    }
}

async function getTaskAndAct(taskId, rsp, action) {
    const task = await tasksServices.getTask(taskId)
    if(task != undefined) {
        action(task)
    } else {
        rsp.status(404).json({error: `Task with id ${taskId} not found`})
    }
}

// Middleware that verifies if the client trying to access the Web API is an authorized 
// user.
function verifyAuthentication(handlerFunction) {
    // Function express calls
    return function(req, rsp) {
        // Get the value of the Authorization header
        let reqAuthString = req.get("Authorization") 
        // Retrieve token with the expected format: Bearer <token> 
        let userToken = reqAuthString ? reqAuthString.split(" ")[1] : null
        if(!userToken) { // If the token isn't valid:
            return rsp
                    .status(401) // Unauthorized 
                    .json({error: `User token must be provided`})
        }
        // Create a property in the request to retrieve the user token
        req.token = userToken 
        // Return the expected function         
        handlerFunction(req, rsp)
    }   
}