// Module that contains all the functions that allow the use of the DELETE and PUT 
// methods by accessing the API directly 

'use strict'

// Constants
const api = "/api"
const auth = "/auth"

function removeGroup(buttonId, usertoken, groupId) {
    const btn = document.querySelector(buttonId)
    btn.onclick = handleClick
    async function handleClick() {
        const url = groupsURL(groupId)
        const options = optionsDelete(usertoken)
        const response = await fetch(url, options)
        if (response.ok) {
            location = toGroups()
        }
    }  
}

function editGroup(buttonId, usertoken, groupId, name, description) {
    const btn = document.querySelector(buttonId)
    const newName = document.querySelector(name)
    const newDescription = document.querySelector(description)
    let nName = newName.value
    let nDescription = newDescription.value
    // The onblur event occurs when an HTML element loses focus
    newName.onblur = async function updateName() { nName = newName.value }
    newDescription.onblur = async function updateDescription() {
        nDescription = newDescription.value
    }
    btn.onclick = handleClick
    async function handleClick() {
        const url = groupsURL(groupId)
        const options = optionsPutGroup(usertoken, nName, nDescription)
        const response = await fetch(url, options)
        if (response.ok) {
            location = toGroup(groupId)
        }
    }
}

function addMovieToGroup(buttonId, usertoken, groupId, movieId) {
    const btn = document.querySelector(buttonId)
    btn.onclick = handleClick
    async function handleClick() {
        let path = location.pathname
        const startIdx = path.indexOf("/groups")
        const endIdx = path.indexOf("/searchTheMovie")
        path = path.substring(startIdx, endIdx)
        const url = movieURL(path, movieId)
        const options = optionsPutMovie(usertoken)
        const response = await fetch(url, options)
        switch(response.status) {
            case 200:
            case 201: location = toGroup(groupId) 
                break
            case 400: alert("Movie already added to this group")
                break
            default:
        }
    }  
}

function removeMovieInGroup(buttonId, usertoken, groupId, movieId) {
    const btn = document.querySelector(buttonId)
    btn.onclick = handleClick
    async function handleClick() {
        let path = location.pathname
        const startIdx = path.indexOf("/groups")
        path = path.substring(startIdx)
        const url = movieInGroupURL(path, movieId)
        const options = optionsDelete(usertoken)
        const response = await fetch(url, options)
        if (response.ok) {
            location = toGroup(groupId)
        }
    }
}

function groupsURL(groupId) {return `${api}/groups/${groupId}`}

function movieURL(path, movieId) {return `${api}${path}/${movieId}`}

function movieInGroupURL(path, movieId) {return `${api}${path}/movies/${movieId}`}

function optionsDelete(usertoken) {
    return {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${usertoken}`
        }
    }
}

function optionsPutGroup(usertoken, name, description) {
    return {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${usertoken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            description: description 
        })
    }
}

function optionsPutMovie(usertoken) {
    return {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${usertoken}`
        }
    }
}

function toGroup(groupId) {
    return `${auth}/groups/${groupId}` 
}

function toGroups() {
    return `${auth}/groups`
}