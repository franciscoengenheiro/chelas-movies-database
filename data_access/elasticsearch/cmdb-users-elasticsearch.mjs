'use strict'
import crypto from 'crypto'
import fetch from '#data_access/fetch/node-fetch.mjs'
import { baseURL, REFRESH } from '#data_access/elasticsearch/cmdb-data-elasticsearch.mjs'

// Constants
const USERS_BASE_URL = `${baseURL}/users`

export default function() {
    return {
        createUserData: createUserData,
        getUserData: getUserData
    }

    /**
     * Creates a new user and updates user local storage
     * @param {String} username token used to identify a user
     */
    async function createUserData(username, password) {
        // Create properties for the new user
        let user = {
            username: username,
            password: password,
            token: crypto.randomUUID()
        }

        let options = {
            method: 'POST',
            headers: {  
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        }
        let obj = await fetch(USERS_BASE_URL + '/_doc' + REFRESH, options)
        return getUserData(user.token)
    }

    /**
     * Retrieves user data from local storage
     * @param {String} userToken token used to identify a user
     * @returns the user found or undefined
     */
    async function getUserData(query_value) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "query": {
                    "multi_match": {
                        "query": query_value,
                        "fields": ["username.keyword", "token.keyword"]
                    }
                }
            })
        }
        let userObj = await fetch(USERS_BASE_URL + '/_search', options)
        let user = undefined
        if(userObj.hits.hits.length == 1){
            user = userObj.hits.hits[0]._source
            user.id = userObj.hits.hits[0]._id
        }
        return user
    }
}