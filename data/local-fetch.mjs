'use strict'

import * as fileOperation from './read&write.mjs'

const data = {
    'https://imdb-api.com/en/API/Top250Movies/k_jtqnxg0w': './local_data/most-popular-movies.json',
    'https://imdb-api.com/en/API/SearchMovie/k_jtqnxg0w/inception 2010': './local_data/movies-searched-by-name.json',
    'https://imdb-api.com/en/API/Title/k_jtqnxg0w/tt0468569': './local_data/movies-info.json'
}

export default async function(URL){

    return fileOperation.readFromFile(data[URL])
}