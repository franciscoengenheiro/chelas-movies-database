// Module that exports elastic search users data access

'use strict'
import crypto from 'crypto'
import elasticSearchInit from '#data_access/elasticSearch/elastic-search-util.mjs'
import {post} from '#data_access/elasticSearch/fetch-wrapper.mjs'

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
    async function createUserData(username, password, email) {
        // Create properties for the new user
        let user = {
            // _id is given by elastic search on creation
            username: username,
            password: password,
            email: email,
            token: crypto.randomUUID()
        }
        await post(elasticSearch.createDoc(), user)
        return getUserData(user.token)
    }

    /**
     * Retrieves user data from elastic search database.
     * @param {String} query_value value to query elastic and retrieve user data. 
     * This value can either be a username or a user token.
     * @returns the user found or undefined.
     */
    async function getUserData(propName, value) {
        const options = {
            "query": {
                "match": {
                    "username.keyword": value
                }
            }
        }
        // Query elastic search
        let userObj = await post(elasticSearch.searchDocs(), options)
        let user = undefined
        // Check if there was a match (should only be one match, since the query is for exact match)
        if(userObj.hits.hits.length == 1) {
            user = Object.assign({id: userObj.hits.hits[0]._id}, userObj.hits.hits[0]._source) // Build user object
        }
        return user
    }
}