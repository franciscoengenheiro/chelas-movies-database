// Application services unit tests module

'use strict'

// External Imports
import * as assert from "assert"

// Internal Imports
import * as File from "#data_access/util/file-operations.mjs"
import cmdbUserServicesInit from '#services/cmdb-users-services.mjs'
import cmdbServicesInit from '#services/cmdb-services.mjs' 
import * as usersData from '#data_access/internal/cmdb-users-data.mjs'
import * as cmdbData from '#data_access/internal/cmdb-data-mem.mjs'
import imdbDataInit from '#data_access/imdb-movies-data.mjs'
import fetch from '#data_access/fetch/local-fetch.mjs'
import errors from '#errors/errors.mjs'

// Initializations
const imdbData = imdbDataInit(fetch)
const cmdbUserServices = cmdbUserServicesInit(usersData)
const cmdbServices = cmdbServicesInit(imdbData, cmdbData, usersData)

// Paths to local files
const POPULAR_MOVIES_FILE = "./local_data/most-popular-movies.json"
const SEARCH_MOVIE_BY_NAME_FILE = "./local_data/movies-searched-by-name.json"
const GET_MOVIE_BY_ID = "./local_data/movie-info.json"
const USERS_FILE = './local_data/users.json'
const GROUPS_FILE = './local_data/groups.json'


// --------------------------------------- Notes --------------------------------------------------------
// Before running the tests make sure:
// - Local fetch is enabled in the server module
// - Internal memory data access is enabled in the server module
// - Local_data package files - groups.json and users.json - ID's are matching the current data
// On error while running tests:
// - Delete users.json created test user and try again
// To run a single test or a set of tests: use it.only or describe.only respectively
// Run tests (in root directory) with: npm test tests
// --------------------------------------- Notes --------------------------------------------------------
describe("Services modules tests:", function() {
    // Constants
    const userTestUsername = "userTestUsername"
    const userTestPassword = "userTestPassword"
    // Global variables
    let originalUsers
    let originalGroups
    // Utility test functions
    beforeEach(async () => {
        // Read current data
        originalUsers = await File.read(USERS_FILE)
        originalGroups = await File.read(GROUPS_FILE)
    })
    afterEach(async () => {
        // Restore previous data
        await File.write(originalUsers, USERS_FILE)   
        await File.write(originalGroups, GROUPS_FILE)               
    })
    describe("Getting the most popular movies:", function() {
        it("Should return an object with an array of the 250 most popular movies", async function() {
            // Arrange
            let most_popular_movies = await File.read(POPULAR_MOVIES_FILE)
            most_popular_movies = most_popular_movies.items

            // Act
            let cmdb_most_popular_movies = await cmdbServices.getPopularMovies()

            // Assert
            assert.deepEqual(cmdb_most_popular_movies, most_popular_movies)
        })

        it("Should return an object with an array of the most popular movies within a limit", async function() {
            // Arrange
            let most_popular_movies = await File.read(POPULAR_MOVIES_FILE)
            most_popular_movies = most_popular_movies.items.filter(movie => movie.rank <= 5)

            // Act
            let cmdb_most_popular_movies = await cmdbServices.getPopularMovies(5)

            // Assert
            assert.deepEqual(cmdb_most_popular_movies, most_popular_movies)
        })

        it("Should throw an error if the limit is not a number", async function() {
            // Act
            try {
                await cmdbServices.getPopularMovies("Hello")
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the limit is a number above 250", async function() {
            // Act
            try {
                await cmdbServices.getPopularMovies(300)
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Search a movie by its name:", function() {
        it("Should return an object with the results from a movie's name search", async function() {
            // Arrange
            let search_by_name = await File.read(SEARCH_MOVIE_BY_NAME_FILE)
            search_by_name = search_by_name.results

            // Act
            let cmdb_search_by_name = await cmdbServices.searchMoviesByName("inception 2010")
            
            // Assert
            assert.deepEqual(cmdb_search_by_name, search_by_name)
        })

        it("Should return an object with the results from a movie's name search within a limit", async function() {
            // Arrange
            let search_by_name = await File.read(SEARCH_MOVIE_BY_NAME_FILE)
            search_by_name = search_by_name.results.splice(0,5)

            // Act
            let cmdb_search_by_name = await cmdbServices.searchMoviesByName("inception 2010", 5)

            // Assert
            assert.deepEqual(cmdb_search_by_name, search_by_name)
        })

        it("Should throw an error if the limit is not a number", async function() {
            // Act
            try {
                await cmdbServices.searchMoviesByName("inception 2010", "Benfica")
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the limit is a number above 250", async function() {
            // Act
            try {
                await cmdbServices.searchMoviesByName("inception 2010", 300)
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Get movie details using a movieId:", function() {
        it("Should return an object with the results from a movie fetch by Id", async function() {
            // Arrange
            let movieObj = await File.read(GET_MOVIE_BY_ID)
                    
            // Act
            let movie = {
                id: movieObj.id,
                title: movieObj.title,
                description: movieObj.plot,
                image_url: movieObj.image,
                runtimeMins: movieObj.runtimeMins,
                director: movieObj.directors,
                actors_names: movieObj.stars
            }
            let cmdb_movie = await cmdbServices.getMovieDetails(movieObj.id)
            
            // Assert
            assert.deepEqual(movie, cmdb_movie)
        })
    })

    describe("Create a new user:", function() {
        it("Should create a new user", async function() {
            // Arrange
            let users = await File.read(USERS_FILE)

            // Act
            users.users.push({
                id: originalUsers.IDs + 1,
                username: userTestUsername,
                password: userTestPassword
            })
            users.IDs++

            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let newUsers = await File.read(USERS_FILE)
            
            // Assert
            assert.deepEqual(users.id, newUsers.id)
            assert.deepEqual(users.usernames, newUsers.usernames)
            assert.deepEqual(users.passwords, newUsers.passwords)
            // Cannot check token as it is randomly given
        })

        it("Try to create the same user twice", async function() {
            // Create an user 
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            // Try to create the same user again
            try {
                await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            } catch (e) {
                assert.deepEqual(e, errors.INVALID_USER("already exists"))
                return
            }
            assert.fail("Should throw an error")
        })
        it("Create an user with an invalid username", async function() {

            try {
                // Create an user
                await cmdbUserServices.createUser(1, userTestPassword)
            } catch (e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("username or password"))
                return
            }
            assert.fail("Should throw an error")
        })
        it("Create an user with an invalid password", async function() {
            try {
                // Create an user
                await cmdbUserServices.createUser(userTestUsername, [12,32,12])
            } catch (e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("username or password"))
                return
            }
            assert.fail("Should throw an error")
        })
    })

    describe("Create a group for an user:", function() {
        it("Should create a new group for the specified user", async function() {
            // Arrange
            let currentGroups = await File.read(GROUPS_FILE)
            let groupToCreate = {
                name: "Group Test",
                description: "Just for test"
            }
            currentGroups.groups.push(groupToCreate)
            currentGroups.IDs++

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)
            await cmdbServices.createGroup(createdUser.token, groupToCreate)

            let alteredGroups = await File.read(GROUPS_FILE)

            // Assert 
            assert.deepEqual(currentGroups, alteredGroups)
        })

        it("Should not create a new group for the specified user", async function() {
            // Arrange
            let invalidGroup = {
                notAName: "Group 56",
                description: 1234,
            }

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)

            // Assert
            try {
                await cmdbServices.createGroup(createdUser.token, invalidGroup)
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("group missing a valid name and description"))
                return
            }
            assert.fail("Should throw an error")
        })
    })

    describe("Get a group for an user:", function() {
        it("Should get all groups for the specified user", async function() {
            // Arrange
            let groupsTest = []
            let group1 = {
                "id": originalGroups.IDs + 1,
                "name": "Test group 1",
                "description": "random"
            }
            let group2 = {
                "id": originalGroups.IDs + 2,
                "name": "Test group 2",
                "description": "still random"
            }

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)
            
            // Create groups for this user
            await cmdbServices.createGroup(createdUser.token, group1)
            await cmdbServices.createGroup(createdUser.token, group2)

            groupsTest.push(group1, group2)
            groupsTest = groupsTest.map(group => {
                return {
                    id: group.id,
                    name: group.name,
                    description: group.description
                }
            })

            // Retrieve the group created
            let groups = await cmdbServices.getGroups(createdUser.token) 

            // Assert 
            assert.deepEqual(groupsTest, groups)   
        })
    })

    describe("Get group details for an user:", function() {
        it("Should get all the group details for the specified user", async function() {
            // Arrange
            let group = {
                name: "Test group 1",
                description: "random"
            }
            let groupId = originalGroups.IDs + 1

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)
            // Create groups for this user
            await cmdbServices.createGroup(createdUser.token, group)
            let newGroup = {
                name: group.name,
                description: group.description,
                movies: [],
                moviesTotalDuration: 0
            }
            // Retrieve the group created
            let createdGroup = await cmdbServices.getGroupDetails(createdUser.token, groupId) 
           
            // Assert 
            assert.deepEqual(newGroup, createdGroup)   
        })

        it("Should throw an error if the group Id does not exist", async function() {
            // Arrange
            let group = {
                name: "Test group 1",
                description: "random"
            }
            let groupId = -1

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)

            // Create groups for this user
            await cmdbServices.createGroup(createdUser.token, group)
            try {
                await cmdbServices.getGroupDetails(createdUser.token, groupId) 
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Edit a Group:", function() {
        it("Should edit a group by Id", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const groupBodyUpdatedTest = {
                name: "New Group Test",
                description: "Updated group"
            }

            // Arrange
            const newGroupId = originalGroups.IDs + 1
            const groupTest = {
                name: "New Group Test",
                description: "Updated group",
                userId: originalUsers.IDs + 1,
                id: newGroupId,
                movies: []
            }

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)
            await cmdbServices.createGroup(createdUser.token, groupBodyTest)
            await cmdbServices.editGroup(createdUser.token, newGroupId, groupBodyUpdatedTest)

            let cmdb_edit_movie_to_group = await File.read(GROUPS_FILE)
            cmdb_edit_movie_to_group = cmdb_edit_movie_to_group.groups.find(group => group.id == newGroupId)

            // Assert
            assert.deepEqual(cmdb_edit_movie_to_group, groupTest)
        })

        it("Should throw an error if the groupId doesn't exist", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const groupBodyUpdatedTest = {
                name: "New Group Test",
                description: "Updated group"
            }
            const newGroupId = originalGroups.IDs + 4

            // Act
            try {
                await cmdbUserServices.createUser(userTestUsername, userTestPassword)
                let createdUser = await cmdbUserServices.getUser(userTestUsername)
                await cmdbServices.createGroup(createdUser.token, groupBodyTest)
                await cmdbServices.editGroup(createdUser.token, newGroupId, groupBodyUpdatedTest)
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Delete a Group:", function() {
        it("Should delete a group by Id", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            // Arrange
            const newGroupId = originalGroups.IDs + 1

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)
            await cmdbServices.createGroup(createdUser.token, groupBodyTest)
            await cmdbServices.deleteGroup(createdUser.token, newGroupId)

            let cmdb_remove_movie_to_group = await File.read(GROUPS_FILE)
            cmdb_remove_movie_to_group = cmdb_remove_movie_to_group.groups

            // Assert
            assert.deepEqual(cmdb_remove_movie_to_group, originalGroups.groups)
        })

        it("Should throw an error if the groupId doesn't exist", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            //Act
            try {
                await cmdbUserServices.createUser(userTestUsername, userTestPassword)
                let createdUser = await cmdbUserServices.getUser(userTestUsername)
                await cmdbServices.createGroup(createdUser.token, groupBodyTest)
                await cmdbServices.deleteGroup(createdUser.token, -1)
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Adding a Movie in a Group:", function() {
        
        it("Should add a new movie to the given group Id", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            // Arrange
            const newGroupId = originalGroups.IDs + 1
            const groupTest = {
                name: "Group Test",
                description: "Just for test",
                userId: originalUsers.IDs + 1,
                id: newGroupId,
                movies: []
            }

            groupTest.movies.push({
                id: "tt0468569",
                title: "The Dark Knight",
                duration: "152"
            })

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)
            await cmdbServices.createGroup(createdUser.token, groupBodyTest)
            await cmdbServices.addMovieInGroup(createdUser.token, newGroupId, "tt0468569")

            let cmdb_add_movie_to_group = await File.read(GROUPS_FILE)
            cmdb_add_movie_to_group = cmdb_add_movie_to_group.groups.find(group => group.id == newGroupId)

            // Assert
            assert.deepEqual(cmdb_add_movie_to_group, groupTest)
        })

        it("Should not add a movie that was already added", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            // Arrange
            const newGroupId = originalGroups.IDs + 1

            try {
                await cmdbUserServices.createUser(userTestUsername, userTestPassword)
                let createdUser = await cmdbUserServices.getUser(userTestUsername)
                await cmdbServices.createGroup(createdUser.token, groupBodyTest)
                // Add movie to the group
                await cmdbServices.addMovieInGroup(createdUser.token, newGroupId, "tt0468569")
                // Try to add the same movie to the group
                await cmdbServices.addMovieInGroup(createdUser.token, newGroupId, "tt0468569")
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("movie already exists in this group"))
                return
            }
            // Assert
            assert.fail("Should throw an error")

        })

        it("Should throw an error if the groupId doesn't exist", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            // Act
            try {
                await cmdbUserServices.createUser(userTestUsername, userTestPassword)
                let createdUser = await cmdbUserServices.getUser(userTestUsername)
                await cmdbServices.createGroup(createdUser.token, groupBodyTest)
                await cmdbServices.addMovieInGroup(createdUser.token, -1, "tt0468569")
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the movieId doesn't exist", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const newGroupId = originalGroups.IDs + 1

            // Act
            try {
                await cmdbUserServices.createUser(userTestUsername, userTestPassword)
                let createdUser = await cmdbUserServices.getUser(userTestUsername)
                await cmdbServices.createGroup(createdUser.token, groupBodyTest)
                await cmdbServices.addMovieInGroup(createdUser.token, newGroupId, "468569")
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("Movie"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Removing a Movie in a Group:", function() {
        it("Should remove a movie from the group ID given", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            // Arrange
            const newGroupId = originalGroups.IDs + 1
            const groupTest = {
                name: "Group Test",
                description: "Just for test",
                userId: originalUsers.IDs + 1,
                id: newGroupId,
                movies: [
                    {
                        id: "tt0468569",
                        title: "The Dark Knight",
                        duration: "152"
                    }
                ]
            }

            groupTest.movies.pop({
                id: "tt0468569",
                title: "The Dark Knight",
                duration: "152"
            })

            // Act
            await cmdbUserServices.createUser(userTestUsername, userTestPassword)
            let createdUser = await cmdbUserServices.getUser(userTestUsername)
            await cmdbServices.createGroup(createdUser.token, groupBodyTest)
            await cmdbServices.addMovieInGroup(createdUser.token, newGroupId, "tt0468569")
            await cmdbServices.removeMovieInGroup(createdUser.token, newGroupId, "tt0468569")

            let cmdb_remove_movie_to_group = await File.read(GROUPS_FILE)
            cmdb_remove_movie_to_group = cmdb_remove_movie_to_group.groups.find(group => group.id == newGroupId)

            // Assert
            assert.deepEqual(cmdb_remove_movie_to_group, groupTest)
        })

        it("Should throw an error if the groupId doesn't exist", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const newGroupId = originalGroups.IDs + 1

            // Act
            try {
                await cmdbUserServices.createUser(userTestUsername, userTestPassword)
                let createdUser = await cmdbUserServices.getUser(userTestUsername)
                await cmdbServices.createGroup(createdUser.token, groupBodyTest)
                await cmdbServices.addMovieInGroup(createdUser.token, newGroupId, "tt0468569")
                await cmdbServices.removeMovieInGroup(createdUser.token, -1, "tt0468569")
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the movieId doesn't exist", async function() {
            // Arrange
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const newGroupId = originalGroups.IDs + 1

            // Act
            try {
                await cmdbUserServices.createUser(userTestUsername, userTestPassword)
                let createdUser = await cmdbUserServices.getUser(userTestUsername)
                await cmdbServices.createGroup(createdUser.token, groupBodyTest)
                await cmdbServices.addMovieInGroup(createdUser.token, newGroupId, "tt0468569")
                await cmdbServices.removeMovieInGroup(createdUser.token, newGroupId, "468569")
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("movie"))
                return
            }

            // Assert
            assert.fail("Should throw an error")
        })        
    })
})