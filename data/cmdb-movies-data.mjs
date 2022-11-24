// Module that manages application data.
// Access to the Internet Movies Database API

'use strict'

import errors from '../errors/errors.mjs'
import * as cmdbData from './cmdb-data-mem.mjs'

const MOST_POPULAR_MOVIES = 'https://imdb-api.com/en/API/Top250Movies/k_jtqnxg0w'
const MOVIES_SEARCHED_BY_NAME = 'https://imdb-api.com/en/API/SearchMovie/k_jtqnxg0w/'
const MOVIES_INFO = 'https://imdb-api.com/en/API/Title/k_jtqnxg0w/'

export default function(fetch){
    if(!fetch){
        throw errors.INVALID_ARGUMENT("fetch")
    }

    return {
        getPopularMoviesData: getPopularMoviesData,
        searchMoviesByNameData: searchMoviesByNameData,
        addMovieInGroupData: addMovieInGroupData
    }

    async function getPopularMoviesData(limit){
        let moviesObj = await fetch(MOST_POPULAR_MOVIES)

        checkLimitAndFilter(limit, function() {
            moviesObj.items = moviesObj.items.filter(movie => Number(movie.rank) <= limit)
        })
    
        return moviesObj.items
    }
    
    async function searchMoviesByNameData(moviesName, limit) {
        let moviesObj = await fetch(MOVIES_SEARCHED_BY_NAME + moviesName)
        let limitCounter = 1
        
        checkLimitAndFilter(limit, function() {
            moviesObj.results = moviesObj.results.filter(_ => limitCounter++ <= limit)
        })
    
        return moviesObj.results
    }
    
    async function addMovieInGroupData(groupId, movieId, userId){
        let moviesObj = await fetch(MOVIES_INFO + movieId)

        if(moviesObj.title == null){
            throw errors.ARGUMENT_NOT_FOUND("Movie")
        }else{
            return cmdbData.addMovieInGroupData(groupId, movieId, moviesObj, userId)
        }
    }
    
    function checkLimitAndFilter(limit, action) {
        if (limit != undefined) {
            if (!isNaN(limit) && limit <= 250)
                action()
            else 
                throw errors.INVALID_ARGUMENT("limit")
        }
    }
}