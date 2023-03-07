// Module that handles elastic search data access regarding users

'use strict'

import elasticSearchInit from '#data_access/elasticSearch/elasticsearch-util.mjs'
import * as dataManipulation from '#data_manipulation/cmdb-users-man.mjs'
import userRetrieval from '#data_access/util/user-retrieval.mjs'
import { post } from '#data_access/elasticSearch/fetch-wrapper.mjs'

// Initialize elastic search index
const elasticSearch = elasticSearchInit('users')
const userData = userRetrieval(getUserData)

export default function() {
    return {
        createUserData: createUserData,
        getUserByUserToken: userData.getUserByUserToken,
        getUserByUsername: userData.getUserByUsername,
        getUserByEmail: userData.getUserByEmail
    }
}

/**
 * Creates a new user.
 * @param {String} username registration identifier.
 * @param {String} password login authenticator.
 * @param {String} email user email address.
 * @returns the user created.
 */
async function createUserData(username, password, email) {
    // Retrieve new user object
    const user = dataManipulation.createUser({
            username: username,
            password: password,
            email: email,
    })
    // Reminder: The id of this user (_id) is given by elastic search and can only 
    // be retrieved after its creation.
    await post(elasticSearch.createDoc(), user) // Create user document
    return getUserData("token", user.token) // Grab new user object with id
}

/**
 * Retrieves user data.
 * @param {String} propName property of a user object.
 * @param {String} value value to search for.
 * @returns the user found or undefined.
 */
async function getUserData(propName, value) {
    let queryValue = propName.concat(".keyword")
    const query = {
        "query": {
            "match": {
                [queryValue]: value
            }
        }
    }
    // Query elastic search
    let userObj = await post(elasticSearch.searchDocs(), query)
    let user = undefined
    // Check if there was a match (should only be one match, since the query is for exact match)
    let result = userObj.hits.hits
    if (result.length == 1) {
        // Build a new user object
        user = dataManipulation.createUser(
            Object.assign({id: result[0]._id}, result[0]._source)
        )
    }
    return user
}