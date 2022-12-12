// Module that contains the functions that handle all HTTP Requests
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format

import url from 'url'
import errors from '../../errors/errors.mjs'
import { handlerRequestInHTML } from '../http-handle-requests.mjs'

// Retrieves the relative path to the file
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)) 

export default function (cmdbServices) {
    // Validate if all the received services exist
    if (!cmdbServices) {
        throw errors.INVALID_ARGUMENT("cmdbServices")
    }
    return {
        getHome: getHome,
        getCss: getCss,
        getTask: handlerRequestInHTML(getTask),
        getTasks: handlerRequestInHTML(getTasks),
        createTask: handlerRequestInHTML(createTask),
        deleteTask: handlerRequestInHTML(deleteTask),
        updateTask: handlerRequestInHTML(updateTask),
        getNewTask: getNewTask
    }
    async function getHome(req, rsp) {
        sendFile('index.html', rsp)
    }

    async function getCss(req, rsp) {
        sendFile('site.css', rsp)
    }

    async function getTasks(req, rsp) {
        const tasks = await tasksServices.getTasks(req.token, req.query.q, req.query.skip, req.query.limit)
        return { name: 'tasks', data: { title: 'All tasks', tasks: tasks} }  
    }

    async function getTask(req, rsp) {
        const taskId = req.params.id
        const task = await tasksServices.getTask(req.token, taskId)
        return new View('task', task)
    }

    async function getNewTask(req, rsp) {
        rsp.render('newTask') 
    }

    async function createTask(req, rsp) {
        let newTask = await tasksServices.createTask(req.token, req.body)
        // Post/Redirect/Get (PRG) is a web development design pattern that lets the page shown after a 
        // form submission be reloaded, shared, or bookmarked without ill effects, such as submitting the 
        // form another time.
        rsp.redirect('/groups')
    }

    async function deleteTask(req, rsp) {
        const taskId = req.params.id
        const task = await tasksServices.deleteTask(req.token, taskId)
        rsp.redirect('/tasks')
    }

    async function updateTask(req, rsp) {
        // TODO()
    }

    /**
     * Sends a file from the location given by filename current directory
     * @param {String} fileName end segment of the file path
     * @param {*} rsp response object
     */  
    function sendFile(fileName, rsp) {
        const fileLocation = __dirname + 'public/' + fileName
        rsp.sendFile(fileLocation)
    }
  
    /** 
     * Constructs a new View with the given name and data to send to response render function
     * @param {*} name - identifies the uri end segment
     * @param {*} data - object with data to send 
     */
    function View(name, data) {
        this.name = name,
        this.data = data
    }
}