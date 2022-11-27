// Test module for the Application services modules

'use strict'


import * as assert from "assert"
import * as File from "../data/file-operations.mjs"

import * as cmdbUserServices from '../services/cmdb-users-services.mjs'
import cmdbServicesInit from '../services/cmdb-services.mjs' 
import * as usersData from '../data/cmdb-users-data.mjs'
import * as cmdbData from '../data/cmdb-data-mem.mjs'
import imdbDataInit from '../data/cmdb-movies-data.mjs'
import fetch from '../data/local-fetch.mjs'
import errors from '../errors/errors.mjs'

const imdbData = imdbDataInit(fetch)
const cmdbServices = cmdbServicesInit(imdbData, cmdbData, usersData)

const POPULAR_MOVIES_FILE = "./local_data/most-popular-movies.json"
const SEARCH_MOVIE_BY_NAME_FILE = "./local_data/movies-searched-by-name.json"
const USERS_FILE = './local_data/users.json'
const GROUPS_FILE = './local_data/groups.json'

describe("Services modules tests", function(){
    describe("Getting the most popular movies:", function(){

        it("Should return an object with an array of the 250 most popular movies:", async function(){
            // Arrange
            let most_popular_movies = await File.read(POPULAR_MOVIES_FILE)
            most_popular_movies = most_popular_movies.items

            // Act
            let cmdb_most_popular_movies = await cmdbServices.getPopularMovies()

            // Assert
            assert.deepEqual(cmdb_most_popular_movies, most_popular_movies)
        })

        it("Should return an object with an array of the most popular movies within a limit:", async function(){
            //Arrange
            let most_popular_movies = await File.read(POPULAR_MOVIES_FILE)
            most_popular_movies = most_popular_movies.items.filter(movie => movie.rank <= 5)

            //Act
            let cmdb_most_popular_movies = await cmdbServices.getPopularMovies(5)

            //Assert
            assert.deepEqual(cmdb_most_popular_movies, most_popular_movies)
        })

        it("Should throw an error if the limit is not a number", async function(){
            //Act
            try{
                await cmdbServices.getPopularMovies("Hello")
            }catch(e){
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the limit is a number above 250", async function(){
            //Act
            try{
                await cmdbServices.getPopularMovies(300)
            }catch(e){
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Search a movie by its name:", function(){

        it("Should return an object with the results from a movie's name search:", async function(){
            //Arrange
            let search_by_name = await File.read(SEARCH_MOVIE_BY_NAME_FILE)
            search_by_name = search_by_name.results

            //Act
            let cmdb_search_by_name = await cmdbServices.searchMoviesByName("inception 2010")
            
            //Assert
            assert.deepEqual(cmdb_search_by_name, search_by_name)
        })

        it("Should return an object with the results from a movie's name search within a limit:", async function(){
            //Arrange
            let search_by_name = await File.read(SEARCH_MOVIE_BY_NAME_FILE)
            search_by_name = search_by_name.results.splice(0,5)

            //Act
            let cmdb_search_by_name = await cmdbServices.searchMoviesByName("inception 2010", 5)

            //Assert
            assert.deepEqual(cmdb_search_by_name, search_by_name)
        })

        it("Should throw an error if the limit is not a number", async function(){
            //Act
            try{
                await cmdbServices.searchMoviesByName("inception 2010", "Benfica")
            }catch(e){
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the limit is a number above 250", async function(){
            //Act
            try{
                await cmdbServices.searchMoviesByName("inception 2010", 300)
            }catch(e){
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Create a new user:", function(){
        it("Should create a new user:", async function(){
            //Arrange
            let originalUsers = await File.read(USERS_FILE)
            let userTest = "userTest"
            let users = await File.read(USERS_FILE)

            users.users.push({
                id: originalUsers.IDs + 1,
                name: `User ${originalUsers.IDs + 1}`,
                token: userTest
            })
            users.IDs++

            //Act
            await cmdbUserServices.createUser(userTest)
            let newUser = await File.read(USERS_FILE)
            await File.write(originalUsers, USERS_FILE)

            //Assert
            assert.deepEqual(newUser, users)
        })

        it("Should create a new user", async function() {
            // Arrange
            let originalUsers = await File.read(USERS_FILE) 
            let userTest = "userTest"

            // Create the same user as before but using the function
            await cmdbUserServices.createUser(userTest)
            // Try to create the same user again
            try {
                await cmdbUserServices.createUser(userTest)
            } catch (e) {
                assert.deepEqual(e, errors.INVALID_USER("already exists"))
                // Restore previous data
                await File.write(originalUsers, USERS_FILE) 
                return
            }
            assert.fail("Should throw an error")
        })
    })

    describe("Create a group for an user", function() {
        it("Should create a new group for the specified user", async function() {
            // Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            let currentGroups = await File.read(GROUPS_FILE)
            const userTest = "userTest"
            let groupToCreate = {
                name: "Group Test",
                description: "Just for test"
            }
            currentGroups.groups.push(groupToCreate)
            currentGroups.IDs++

            // Act
            
            await cmdbUserServices.createUser(userTest)     
            await cmdbServices.createGroup(groupToCreate, userTest)

            let alteredGroups = await File.read(GROUPS_FILE)

            // Retrieve previous data
            await File.write(originalUsers, USERS_FILE)
            await File.write(originalGroups, GROUPS_FILE)

            // Assert 
            assert.deepEqual(currentGroups, alteredGroups)
        })

        it("Should not create a new group for the specified user", async function() {
            // Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            let userTest = "userTest"
            let invalidGroup = {
                notAName: "Group 56",
                description: 1234,
            }

            // Act
            await cmdbUserServices.createUser(userTest)

            // Assert
            try {
                await cmdbServices.createGroup(invalidGroup, userTest)
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("group missing a valid name and description"))
                // Retrieve previous data
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)               
                return
            }
            assert.fail("Should throw an error")
        })
    })

    describe("Get a group for an user", function() {
        it("Should get all groups for the specified user", async function() {
            // Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            let groupsTest = []
            let group1 = {
                "name": "Test group 1",
                "description": "random"
            }
            let group2 = {
                "name": "Test group 2",
                "description": "still random"
            }

            // Act
            await cmdbUserServices.createUser(userTest)
            // Create groups for this user
            await cmdbServices.createGroup(group1, userTest)
            await cmdbServices.createGroup(group2, userTest)

            groupsTest.push(group1, group2)
            groupsTest = groupsTest.map(group => {
                return {
                    name: group.name,
                    description: group.description
                }
            })

            // Retrieve the group created
            let sut = await cmdbServices.getGroups(userTest) 
            // Restore previous data
            await File.write(originalUsers, USERS_FILE)
            await File.write(originalGroups, GROUPS_FILE)
            // Assert 
            assert.deepEqual(groupsTest, sut)   
        })
    })

    describe("Get group details for an user", function() {
        it("Should get all the group details for the specified user", async function() {
            // Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"  
            let group = {
                name: "Test group 1",
                description: "random"
            }
            let groupId = originalGroups.IDs + 1

            // Act
            await cmdbUserServices.createUser(userTest)
            // Create groups for this user
            await cmdbServices.createGroup(group, userTest)
            let newGroup = {
                name: group.name,
                description: group.description,
                movies: [],
                moviesTotalDuration: 0
            }
            // Retrieve the group created
            let sut = await cmdbServices.getGroupDetails(groupId, userTest) 
            // Restore previous data
            await File.write(originalUsers, USERS_FILE)
            await File.write(originalGroups, GROUPS_FILE)

            // Assert 
            assert.deepEqual(newGroup, sut)   
        })

        it("Should throw an error if the group Id does not exist", async function() {
            // Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"  
            let group = {
                name: "Test group 1",
                description: "random"
            }
            let groupId = -1

            // Act
            await cmdbUserServices.createUser(userTest)
            // Create groups for this user
            await cmdbServices.createGroup(group, userTest)
            try {
                await cmdbServices.getGroupDetails(groupId, userTest) 
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                // Restore previous data
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if group Id is invalid", async function() {
            // Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTestToken"  
            let group = {
                "name": "Test group 1",
                "description": "random"
            }
            let groupId = "abc"

            // Act
            await cmdbUserServices.createUser(userTest)
            // Create groups for this user
            await cmdbServices.createGroup(group, userTest)
            try {
                await cmdbServices.getGroupDetails(groupId, userTest) 
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("groupId"))
                // Restore previous data
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)
                return
            }
            
            //Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Edit a Group:", function(){
        it("Should edit a group by ID:", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const groupBodyUpdatedTest = {
                name: "New Group Test",
                description: "Updated group"
            }

            //Arrange
            const newGroupId = originalGroups.IDs + 1
            const groupTest = {
                name: "New Group Test",
                description: "Updated group",
                userId: originalUsers.IDs + 1,
                id: newGroupId,
                movies: []
            }

            // Act
            await cmdbUserServices.createUser(userTest)
            await cmdbServices.createGroup(groupBodyTest, userTest)
            await cmdbServices.editGroup(newGroupId, groupBodyUpdatedTest, userTest)

            let cmdb_edit_movie_to_group = await File.read(GROUPS_FILE)
            cmdb_edit_movie_to_group = cmdb_edit_movie_to_group.groups.find(group => group.id == newGroupId)

            await File.write(originalUsers, USERS_FILE)
            await File.write(originalGroups, GROUPS_FILE)

            // Assert
            assert.deepEqual(cmdb_edit_movie_to_group, groupTest)
        })

        it("Should throw an error if the groupId is invalid", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const groupBodyUpdatedTest = {
                name: "New Group Test",
                description: "Updated group"
            }
            
            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.editGroup("AHHHHHHHHHHHH", groupBodyUpdatedTest, userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.INVALID_ARGUMENT("groupId"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the groupId doesnt exist", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const groupBodyUpdatedTest = {
                name: "New Group Test",
                description: "Updated group"
            }
            const newGroupId = originalGroups.IDs + 4

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.editGroup(newGroupId, groupBodyUpdatedTest, userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Delete a Group:", function(){
        it("Should delete a group by ID:", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            //Arrange
            const newGroupId = originalGroups.IDs + 1

            // Act
            await cmdbUserServices.createUser(userTest)
            await cmdbServices.createGroup(groupBodyTest, userTest)
            await cmdbServices.deleteGroup(newGroupId, userTest)

            let cmdb_remove_movie_to_group = await File.read(GROUPS_FILE)
            cmdb_remove_movie_to_group = cmdb_remove_movie_to_group.groups

            await File.write(originalUsers, USERS_FILE)
            await File.write(originalGroups, GROUPS_FILE)

            // Assert
            assert.deepEqual(cmdb_remove_movie_to_group, originalGroups.groups)
        })

        it("Should throw an error if the groupId is invalid", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.deleteGroup("AHHHHHHHHHHHHH", userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.INVALID_ARGUMENT("groupId"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the groupId doesnt exist", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.deleteGroup(-1, userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Adding a Movie in a Group:", function(){
        it("Should add a new movie to the group ID given:", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            //Arrange
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
            await cmdbUserServices.createUser(userTest)
            await cmdbServices.createGroup(groupBodyTest, userTest)
            await cmdbServices.addMovieInGroup(newGroupId, "tt0468569", userTest)

            let cmdb_add_movie_to_group = await File.read(GROUPS_FILE)
            cmdb_add_movie_to_group = cmdb_add_movie_to_group.groups.find(group => group.id == newGroupId)

            await File.write(originalUsers, USERS_FILE)
            await File.write(originalGroups, GROUPS_FILE)

            // Assert
            assert.deepEqual(cmdb_add_movie_to_group, groupTest)
        })

        it("Should throw an error if the groupId is invalid", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.addMovieInGroup("AHHHHHHHHHHHHHHH", "tt0468569", userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.INVALID_ARGUMENT("groupId"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the groupId doesnt exist", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.addMovieInGroup(-1, "tt0468569", userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the movieId doesnt exist", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const newGroupId = originalGroups.IDs + 1

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.addMovieInGroup(newGroupId, "468569", userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("Movie"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })
    })

    describe("Removing a Movie in a Group:", function(){
        it("Should remove a movie from the group ID given:", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }

            //Arrange
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
            await cmdbUserServices.createUser(userTest)
            await cmdbServices.createGroup(groupBodyTest, userTest)
            await cmdbServices.addMovieInGroup(newGroupId, "tt0468569", userTest)
            await cmdbServices.removeMovieInGroup(newGroupId, "tt0468569", userTest)

            let cmdb_remove_movie_to_group = await File.read(GROUPS_FILE)
            cmdb_remove_movie_to_group = cmdb_remove_movie_to_group.groups.find(group => group.id == newGroupId)

            await File.write(originalUsers, USERS_FILE)
            await File.write(originalGroups, GROUPS_FILE)

            // Assert
            assert.deepEqual(cmdb_remove_movie_to_group, groupTest)
        })

        it("Should throw an error if the groupId is invalid", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const newGroupId = originalGroups.IDs + 1

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.addMovieInGroup(newGroupId, "tt0468569", userTest)
                await cmdbServices.removeMovieInGroup("AHHHHHHHHHHHHHHH", "tt0468569", userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.INVALID_ARGUMENT("groupId"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the groupId doesnt exist", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const newGroupId = originalGroups.IDs + 1

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.addMovieInGroup(newGroupId, "tt0468569", userTest)
                await cmdbServices.removeMovieInGroup(-1, "tt0468569", userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("group"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the movieId doesnt exist", async function(){
            //Pre Arrange
            let originalGroups = await File.read(GROUPS_FILE)
            let originalUsers = await File.read(USERS_FILE)
            const userTest = "userTest"
            const groupBodyTest = {
                name: "Group Test",
                description: "Just for test",
            }
            const newGroupId = originalGroups.IDs + 1

            //Act
            try{
                await cmdbUserServices.createUser(userTest)
                await cmdbServices.createGroup(groupBodyTest, userTest)
                await cmdbServices.addMovieInGroup(newGroupId, "tt0468569", userTest)
                await cmdbServices.removeMovieInGroup(newGroupId, "468569", userTest)
            }catch(e){
                await File.write(originalUsers, USERS_FILE)
                await File.write(originalGroups, GROUPS_FILE)

                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("movie"))
                return
            }

            //Assert
            assert.fail("Should throw an error")
        })
        
    })
})
