// Application API integration tests module

'use strict'

// External imports
import request from 'supertest'
import { expect } from 'chai'

// Internal imports
import server from '#root/cmdb-server.mjs'
import * as File from "#data_access/util/file-operations.mjs"
import errors from '#errors/errors.mjs'

// Paths to local files
const POPULAR_MOVIES_FILE = "./local_data/most-popular-movies.json"
const SEARCH_MOVIE_BY_NAME_FILE = "./local_data/movies-searched-by-name.json"
const GET_MOVIE_BY_ID = "./local_data/movie-info.json"
const USERS_FILE = './local_data/users.json'
const GROUPS_FILE = './local_data/groups.json'
    
describe("API integration tests:", function() {
    // Start server
    let app = server().listen(1904, () => {})
    // Constants:
    const movieId = 'tt0468569'
    const groupA = {
        name: "They won't know this is an Integration test group",
        description: "Am I a description for a group?"
    }
    const groupB = {
        name: "Don't tell them I'm also an Integration test group",
        description: "Hide this description somewhere"
    }
    const newUserA = {
        username: "fa55e027f56e4f4cbdb1d03400ad97faUserIntegrationTestA",
        password: "fa55e027f56e4f4cbdb1d03400ad97faUserIntegrationTestA",
        email: "f4cbdb1d03400ad97faUserIntegrationTestA@gmail.com",
        passConfirm: "fa55e027f56e4f4cbdb1d03400ad97faUserIntegrationTestA",
    }
    const newUserB = {
        username: "fa55e027f56e4f4cbdb1d03400ad97faUserIntegrationTestB",
        password: "fa55e027f56e4f4cbdb1d03400ad97faUserIntegrationTestB",
        email: "f4cbdb1d03400ad97faUserIntegrationTestA@gmail.com",
        passConfirm: "fa55e027f56e4f4cbdb1d03400ad97faUserIntegrationTestB",
    }
    // Invalid:
    const invalidGroupId = 1.3
    const invalidMovieId = 2.7
    const invalidUserToken = "    "
    const invalidGroup = {
        name: "some invalid name",
        description: 123 
    }
    const invalidUsernameUser = {
        username: 1, // Not a string
        password: "a",
        email: "b",
        passConfirm: "a"
    }
    const invalidPasswordUser = {
        username: "1",
        password: "", // Empty string
        email: "b",
        passConfirm: ""
    }
    const invalidEmailUser = {
        username: "1",
        password: "a",
        email: {},
        passConfirm: "a"
    }
    const invalidConfirmPasswordUser = {
        username: "1",
        password: "a",
        email: "b",
        passConfirm: "aa"
    }
    // Global variables
    let originalGroups
    let originalUsers
    let userTestToken

    // Utility test functions:
    beforeEach(async () => {
        // Read current data
        originalUsers = await File.read(USERS_FILE)
        originalGroups = await File.read(GROUPS_FILE)
        // Create an user
        let response = await request(app)
            .post('/api/users')
            .set('Accept', 'application/json')
            .send(newUserA)
            .expect('Content-Type', /json/)
            .expect(201)

        // Set token to use
        userTestToken = response.body['newUser'].token
    })
    afterEach(async () => {
        // Restore previous data
        await File.write(originalUsers, USERS_FILE)   
        await File.write(originalGroups, GROUPS_FILE)               
    })

    describe("POST /api/users", function() {
        const routeToTest = '/api/users'
        it('Create a new user', async function() {
            let response = await request(app)
                .post(routeToTest)
                .set('Accept', 'application/json')
                .send(newUserB)
                .expect('Content-Type', /json/)

            let user = response.body['newUser']

            expect(response.status).to.equal(201)
            expect(response.body).to.deep.equal({
                message: `User created`,
                newUser: user
            })
        })
        it('Create two users with the same username', async function() {
            // Create an user
            let response = await request(app)
                .post(routeToTest)
                .set('Accept', 'application/json')
                .send(newUserB)
                .expect('Content-Type', /json/)
                .expect(201)

            // Create the same user
            response = await request(app)
                .post(routeToTest)
                .set('Accept', 'application/json')
                .send(newUserB)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_USER("already exists").description
            )
        }) 
        it('Create an user with an invalid username', async function() {
            let response = await request(app)
                .post(routeToTest)
                .set('Accept', 'application/json')
                .send(invalidUsernameUser)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_ARGUMENT("username, password or email").description
            )
        })
        it('Create an user with an invalid password', async function() {
            let response = await request(app)
                .post(routeToTest)
                .set('Accept', 'application/json')
                .send(invalidPasswordUser)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_ARGUMENT("username, password or email").description
            )
        })
        it('Create an user with an invalid email', async function() {
            let response = await request(app)
                .post(routeToTest)
                .set('Accept', 'application/json')
                .send(invalidEmailUser)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_ARGUMENT("username, password or email").description
            )
        })
        it('Create an user with an invalid confirmation password', async function() {
            let response = await request(app)
                .post(routeToTest)
                .set('Accept', 'application/json')
                .send(invalidConfirmPasswordUser)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.PASSWORDS_DO_NOT_MATCH("passwords do not match").description
            )
        })
    })
    describe("GET /api/movies", function() {
        const routeToTest = '/api/movies'
        it('Get the top 250 most popular movies', async function() {
            let most_popular_movies = (await File.read(POPULAR_MOVIES_FILE)).items
            const response = await request(app)
                .get(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(200)
		    expect(response.body).to.be.an('Array')
		    expect(response.body.length).to.equal(most_popular_movies.length) // 250
        })
        it('Get the 5 most popular movies', async function() {
            let most_popular_movies = (await File.read(POPULAR_MOVIES_FILE)).items
            const response = await request(app)
                .get(routeToTest)
                .query({ limit: 5 })
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
            
            expect(response.status).to.equal(200)
            expect(response.body).to.be.an('Array')
            expect(response.body).to.deep.equal([ 
                most_popular_movies[0],
                most_popular_movies[1],
                most_popular_movies[2],
                most_popular_movies[3],
                most_popular_movies[4]
            ])
        })
        it('Invalid limit value', async function() {
            let limit = "abc"
            const response = await request(app)
                .get(routeToTest)
                .query({ limit: limit })
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_ARGUMENT("limit").description
            )
        })
    })
    describe("GET /api/movies/search/:moviesName", function() {
        const routeToTest = '/api/movies/search/'
        const expression = 'inception 2010'
        it('Search a movie using an expression', async function() {
            let results = (await File.read(SEARCH_MOVIE_BY_NAME_FILE)).results
            const response = await request(app)
                .get(routeToTest + expression)
                .set('Authorization', `Bearer ${userTestToken}`)
			    .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(200)
		    expect(response.body).to.be.an('Array')
		    expect(response.body).to.deep.equal(results)
        })
        it('Limit search results', async function() {
            let results = (await File.read(SEARCH_MOVIE_BY_NAME_FILE)).results
            let limit = 3 // Needs to be <= than results.length
            const response = await request(app)
                .get(routeToTest + expression)
                .query({ limit: limit })
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(200)
		    expect(response.body).to.be.an('Array')
		    expect(response.body).to.deep.equal(results.slice(0,limit))
        })
        it('Invalid limit value', async function() {
            let limit = "abc" 
            const response = await request(app)
                .get(routeToTest + expression)
                .query({ limit: limit })
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_ARGUMENT("limit").description
            )
        })
    })
    describe("GET /api/movies/find/:movieId", function() {
        const routeToTest = '/api/movies/find/'
        it('Search a movie by Id', async function() {
            let result = await File.read(GET_MOVIE_BY_ID)
            const response = await request(app)
                .get(routeToTest + movieId)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(200)
		    expect(response.body).to.be.an('Object')
		    expect(response.body.id).to.equal(movieId)
            expect(response.body.title).to.equal(result.fullTitle)
		    expect(response.body.description).to.equal(result.plot)
		    expect(response.body.image_url).to.equal(result.image)
		    expect(response.body.runtimeMins).to.equal(result.runtimeMins)
		    expect(response.body.director).to.equal(result.directors)
            expect(response.body.actors_names).to.equal(result.stars)
        })
    })
    describe("POST /api/groups", function() {
        const routeToTest = '/api/groups'
        it('Create a group for an user', async function() {
            const response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(201)
		    expect(response.body).to.be.an('Object')

            const groupId = response.body['group'].id
            const userId = response.body['group'].userId
            expect(response.body).to.deep.equal({
                "message": "Group created",
                "group": {
                    "name": groupA.name,
                    "description": groupA.description,
                    "id": groupId,
                    "movies": [],
                    "userId": userId
                }
            })
        })
        it('Missing user token', async function() {
            const response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${invalidUserToken}`)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(401)
		    expect(response.body).to.be.a('Object')
            expect(response.body).to.deep.equal({
                "error": "Invalid authentication token"
            })
        })
        it('Create a group with invalid name or description', async function() {
            const response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(invalidGroup)
			    .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(400)
		    expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_ARGUMENT("group missing a valid name and description").description
            )
        })
    })
    describe("GET /api/groups", function() {
        const routeToTest = '/api/groups'
        it('Get all groups for an user', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
            
            // Create group B
            response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupB)
                .expect('Content-Type', /json/)
                .expect(201)

            const userId = response.body['group'].userId 

            // Retrieve all groups, along with the ones that were recently added
            let allGroups = (await File.read(GROUPS_FILE)).groups
            response = await request(app)
                .get(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
                .expect(200)

		    expect(response.body).to.be.an('Array')
            // Filter user groups
            let userGroups = allGroups.filter(group => group.userId = userId)
            // Map according to data structure
            userGroups = userGroups.map(group => {
                return {
                    id: group.id,
                    name: group.name,
                    description: group.description
                }
            })
            expect(response.body).to.deep.equal(userGroups) 
        })
        it('Missing user token', async function() {
            const response = await request(app)
                .get(routeToTest)
                .set('Authorization', `Bearer ${invalidUserToken}`)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(401)
		    expect(response.body).to.be.a('Object')
            expect(response.body).to.deep.equal({
                "error": "Invalid authentication token"
            })
        })
    })
    describe("GET /api/groups/:groupId", function() {
        const routeToTest = '/api/groups/'
        it('Get a group for an user', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id
            const userId = response.body['group'].userId 

            // Retrieve all groups
            let allGroups = (await File.read(GROUPS_FILE)).groups
            response = await request(app)
                .get(routeToTest + groupA_id)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

		    expect(response.status).to.equal(200)
		    expect(response.body).to.be.an('Object')
            // Retrieve group A
            let groupAcopy = allGroups.find(group => group.id == groupA_id && group.userId == userId)
            groupAcopy.movies = []
            groupAcopy.moviesTotalDuration = 0
            delete groupAcopy.userId
            delete groupAcopy.id
            expect(response.body).to.deep.equal(groupAcopy)
        })
        it('Missing user token', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
                .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id        

            response = await request(app)
                .get(routeToTest + groupA_id)
                .set('Authorization', `Bearer ${invalidUserToken}`)
                .expect('Content-Type', /json/)
            
            expect(response.status).to.equal(401)
		    expect(response.body).to.be.a('Object')
            expect(response.body).to.deep.equal({
                "error": "Invalid authentication token"
            })
        })
        it('Get a group for an user with an invalid groupId', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            response = await request(app)
                .get(routeToTest + invalidGroupId)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
            

            expect(response.status).to.equal(404)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.ARGUMENT_NOT_FOUND("group").description
            )
        })
    })
    describe("PUT /api/groups/:groupId", function() {
        const routeToTest = '/api/groups/'
        it('Edit a group for an user', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id

            // Edit group A with groupB
            response = await request(app)
                .put(routeToTest + groupA_id)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupB)
			    .expect('Content-Type', /json/)

		    expect(response.status).to.equal(200)
		    expect(response.body).to.be.an('Object')
            expect(response.body).to.deep.equal({
                "message": "Updated group with success"
            })
        })
        it('Missing user token', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id

            // Edit group A with group B
            response = await request(app)
                .put(routeToTest + groupA_id)
                .set('Authorization', `Bearer ${invalidUserToken}`)
                .expect('Content-Type', /json/)
            
            expect(response.status).to.equal(401)
		    expect(response.body).to.be.a('Object')
            expect(response.body).to.deep.equal({
                "error": "Invalid authentication token"
            })
        })
        it('Edit a group for an user with an invalid groupId', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
            
            // Try to edit groupA
            response = await request(app)
                .put(routeToTest + invalidGroupId)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupB)
			    .expect('Content-Type', /json/)

            expect(response.status).to.equal(404)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.ARGUMENT_NOT_FOUND("group").description
            )
        })
        it('Edit a group for an user with an invalid group', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
            
            const groupA_id = response.body['group'].id

            // Try to edit groupA
            response = await request(app)
                .put(routeToTest + groupA_id)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(invalidGroup)
			    .expect('Content-Type', /json/)

            expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_ARGUMENT("group missing a valid name and description").description
            )
        })
    })
    describe("DELETE /api/groups/:groupId", function() {
        const routeToTest = '/api/groups/'
        it('Delete a group for an user', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id

            // Delete group A
            response = await request(app)
                .delete(routeToTest + groupA_id)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

		    expect(response.status).to.equal(200)
		    expect(response.body).to.be.an('Object')
            expect(response.body).to.deep.equal({
                "message": "Group deleted with success"
            })
        })
        it('Missing user token', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id

            // Delete group A
            response = await request(app)
                .put(routeToTest + groupA_id)
                .set('Authorization', `Bearer ${invalidUserToken}`)
                .expect('Content-Type', /json/)
            
            expect(response.status).to.equal(401)
		    expect(response.body).to.be.a('Object')
            expect(response.body).to.deep.equal({
                "error": "Invalid authentication token"
            })
        })
        it('Delete a group for an user with an invalid groupId', async function() {
            // Create group A
            let response = await request(app)
                .post(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
            
            // Try to delete group A
            response = await request(app)
                .delete(routeToTest + invalidGroupId)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(404)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.ARGUMENT_NOT_FOUND("group").description
            )
        })
    })
    describe("PUT /api/groups/:groupId/movies/:movieId", function() {
        it('Add a movie for an user group', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id
            const routeToTest = `/api/groups/${groupA_id}/movies/${movieId}`

            // Add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

		    expect(response.status).to.equal(201)

            let result = await File.read(GET_MOVIE_BY_ID)

		    expect(response.body).to.be.an('Object')
            expect(response.body).to.deep.equal({
                "message": "Movie added with success",
                "movie": {
                    "id": movieId,
                    "title": result.title,
                    "duration": result.runtimeMins
                }
            })
        })
        it('Missing user token', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id
            const routeToTest = `/api/groups/${groupA_id}/movies/${movieId}`

            // Add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${invalidUserToken}`)
                .expect('Content-Type', /json/)
            
            expect(response.status).to.equal(401)
		    expect(response.body).to.be.a('Object')
            expect(response.body).to.deep.equal({
                "error": "Invalid authentication token"
            })
        })
        it('Add the same movie for an user group', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id
            const routeToTest = `/api/groups/${groupA_id}/movies/${movieId}`

            // Add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
                .expect(201)
            
            // Try to add the same movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(400)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.INVALID_ARGUMENT("movie already exists in this group").description
            )
        })
        it('Add a movie for an user group with an invalid groupId', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const routeToTest = `/api/groups/${invalidGroup}/movies/${movieId}`

            // Try to add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

		    expect(response.status).to.equal(404)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.ARGUMENT_NOT_FOUND("group").description
            )
        })
        it('Add a movie for an user group with an invalid movieId', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
            
            const groupA_id = response.body['group'].id    
            const routeToTest = `/api/groups/${groupA_id}/movies/${invalidMovieId}`

            // Try to add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

		    expect(response.status).to.equal(404)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.ARGUMENT_NOT_FOUND("Movie").description
            )
        })
    })
    describe("DELETE /api/groups/:groupId/movies/:movieId", function() {
        it('Delete a movie for an user group', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id
            const routeToTest = `/api/groups/${groupA_id}/movies/${movieId}`

            // Add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
		        .expect(201)

            // Delete the movie in group A
            response = await request(app)
                .delete(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(200)
		    expect(response.body).to.be.an('Object')
            expect(response.body).to.deep.equal({
                "message": "Movie deleted with success"
            })
        })
        it('Missing user token', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id
            const routeToTest = `/api/groups/${groupA_id}/movies/${movieId}`

            // Add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
		        .expect(201)

            // Delete the movie in group A
            response = await request(app)
                .delete(routeToTest)
                .set('Authorization', `Bearer ${invalidUserToken}`)
                .expect('Content-Type', /json/)

            expect(response.status).to.equal(401)
		    expect(response.body).to.be.a('Object')
            expect(response.body).to.deep.equal({
                "error": "Invalid authentication token"
            })
        })
        it('Delete a movie for an user group with an invalid groupId', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id
            let routeToTest = `/api/groups/${groupA_id}/movies/${movieId}`

            // Add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
		        .expect(201)

            routeToTest = `/api/groups/${invalidGroup}/movies/${movieId}`

            // Try to delete the movie in group A
            response = await request(app)
                .delete(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)

		    expect(response.status).to.equal(404)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.ARGUMENT_NOT_FOUND("group").description
            )
        })
        it('Delete a movie for an user group with an invalid movieId', async function() {
            // Create group A
            let response = await request(app)
                .post('/api/groups/')
                .set('Authorization', `Bearer ${userTestToken}`)
                .set('Accept', 'application/json')
                .send(groupA)
			    .expect('Content-Type', /json/)
                .expect(201)
        
            const groupA_id = response.body['group'].id
            let routeToTest = `/api/groups/${groupA_id}/movies/${movieId}`

            // Add a movie to group A
            response = await request(app)
                .put(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
                .expect('Content-Type', /json/)
		        .expect(201)

            routeToTest = `/api/groups/${groupA_id}/movies/${invalidGroupId}`
            
            // Try to delete the movie in group A
            response = await request(app)
                .delete(routeToTest)
                .set('Authorization', `Bearer ${userTestToken}`)
			    .expect('Content-Type', /json/)
            
		    expect(response.status).to.equal(404)
            expect(response.body).to.be.a('String')
            expect(response.body).to.equal(
                errors.ARGUMENT_NOT_FOUND("movie").description
            )
        })
    })
})
