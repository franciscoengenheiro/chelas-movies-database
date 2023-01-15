// Module that handles elastic search data access regarding users

'use strict'
import crypto from 'crypto'
import elasticSearchInit from '#data_access/elasticSearch/elastic-search-util.mjs'
import { post } from '#data_access/elasticSearch/fetch-wrapper.mjs'

// Initialize elastic search index
const elasticSearch = elasticSearchInit('users') 

/** 
 * @returns an object with functions that handle user creation and retrieval using the
 * elastic search database access.
 */
export default function() {
    return {
        createUserData: createUserData,
        getUserByUserToken: getUserByUserToken,
        getUserByUsername: getUserByUsername,
        getUserByEmail: getUserByEmail
    }

    /**
     * Creates a new user and updates elastic search database.
     * @param {String} username registration identifier.
     * @param {String} password login authenticator.
     * @param {String} email user email address.
     * @returns the user created.
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
        return getUserData("token", user.token)
    }

    /**
     * Retrieves user data from elastic search database.
     * @param {String} propName object key to search the value for.
     * @param {String} value value to search. This value can either be a username or a user token.
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
        if (userObj.hits.hits.length == 1) {
            // Build user object
            user = Object.assign({id: userObj.hits.hits[0]._id}, userObj.hits.hits[0]._source) 
        }
        return user
    }

    /**
     * Retrieves an user by it's username.
     * @param {String} username registration identifier.
     */
    async function getUserByUsername(username) {
        return getUserData("username", username)
    }

    /**
     * Retrieves an user by it's token.
     * @param {String} userToken token used to allow an user to access a service.
     */
    async function getUserByUserToken(userToken) {
        return getUserData("token", userToken)
    }

    async function getUserByEmail(email){
        return getUserData("email", email)
    }
}