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

describe("Services modules tests", function(){
    describe("Getting the most popular movies:", async function(){

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
            try{
                await cmdbServices.getPopularMovies("Hello")
            }catch(e){
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the limit is a number above 250", async function(){
            try{
                await cmdbServices.getPopularMovies(300)
            }catch(e){
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }
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
            try{
                await cmdbServices.searchMoviesByName("inception 2010", "Benfica")
            }catch(e){
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }
            assert.fail("Should throw an error")
        })

        it("Should throw an error if the limit is a number above 250", async function(){
            try{
                await cmdbServices.searchMoviesByName("inception 2010", 300)
            }catch(e){
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }
            assert.fail("Should throw an error")
        })
    })

    //Neste teste lemos o que está no ficheiro e no fim voltamos a colocar o ficheiro como estava no inicio para não haver
    //alterações já que vamos estar a acrescentar utilizadores e grupos inexistentes
    describe("Create a new user:", function(){
        it("Should create a new user:", async function(){
            //Arrange
            let originalUsers = await File.read(USERS_FILE)
            let users = await File.read(USERS_FILE) //Aqui é necessário let de novo pois se fizermos users = originalUsers <= estes também serão afetados quando se fizer push
            users.users.push({
                id: originalUsers.IDs + 1,
                name: `User ${originalUsers.IDs + 1}`,
                token: "IamVeryBestGuy"
            })
            users.IDs++
            //Act
            await cmdbUserServices.createUser("IamVeryBestGuy")
            let newUser = await File.read(USERS_FILE)
            await File.write(originalUsers, USERS_FILE) 
            //Assert
            assert.deepEqual(newUser, users)
        })
    })
})
