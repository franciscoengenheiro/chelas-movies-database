// Module that exports elastic search users data access

'use strict'
import crypto from 'crypto'
import fetch from '#data_access/fetch/node-fetch.mjs'
import elasticSearchInit from '#data_access/elasticSearch/elastic-search-util.mjs'

// Constants
let elasticSearch = elasticSearchInit('users') 

export default function() {
    return {
        createUserData: createUserData,
        getUserData: getUserData
    }

    /**
     * Creates a new user and updates elastic search database.
     * @param {String} username registration identifier.
     * @param {String} password login authenticator.
     */
    async function createUserData(username, password) {
        // Create properties for the new user
        let user = {
            // _id is given by elastic search on creation
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
        await fetch(elasticSearch.createDoc(), options)
        return getUserData(user.token)
    }

    /**
     * Retrieves user data from elastic search database.
     * @param {String} query_value value to query elastic and retrieve user data. 
     * This value can either be a username or a user token.
     * @returns the user found or undefined.
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
        // Query elastic search
        let userObj = await fetch(elasticSearch.searchDocs(), options)
        let user = undefined
        // Check if there was a match (should only be one match, since the query is for exact match)
        if(userObj.hits.hits.length == 1) {
            user = userObj.hits.hits[0]._source // Retrieve user mapped data
            user.id = userObj.hits.hits[0]._id // Retrieve user id
        }
        return user
    }
}