// Module that manages application data.
// Access to the Internet Movies Database API



'use strict'

import {readFile, writeFile} from 'node:fs/promises'
import * as cmdbData from '../data/cmdb-data-mem.mjs'

const MOVIES_INFO_FILE = '../local_data/movies-info.json'
const MOST_POPULAR_MOVIES_FILE = '../local_data/most-popular-movies.json'
const MOVIES_SEARCHED_BY_NAME = '../local_data/movies-searched-by-name.json'


export async function getPopularMoviesData(limit){
    let moviesObj = await readFromFile(MOST_POPULAR_MOVIES_FILE)

    checkLimitAndFilter(limit, function() {
        moviesObj.items = moviesObj.items.filter(movie => movie.rank <= limit)
    })

    return moviesObj.items
}

export async function searchMoviesByNameData(moviesName, limit) {
    let moviesObj = await readFromFile(MOVIES_SEARCHED_BY_NAME)
    let limitCounter = 1
    
    moviesObj.results = moviesObj.results.filter(movie => movie.title.includes(moviesName))
    
    checkLimitAndFilter(limit, function() {
        moviesObj.results = moviesObj.results.filter(_ => limitCounter++ <= limit)
    })

    return moviesObj.results
}

export async function addMovieInGroupData(groupId, movieId, userId){
    let moviesObj = await readFromFile(MOVIES_INFO_FILE)

    return cmdbData.addMovieInGroupData(groupId, movieId, moviesObj, userId)
}

async function readFromFile(file_name) {
    let fileContents = await readFile(file_name)
    return JSON.parse(fileContents)
}

function checkLimitAndFilter(limit, action) {
    if (limit != undefined) {
        if (!isNaN(limit) && Number(limit) <= 250)
            action()
        else 
            throw errors.INVALID_ARGUMENT("limit")
    }
}