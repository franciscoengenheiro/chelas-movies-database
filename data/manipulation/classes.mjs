// Module that defines the data structures used to store groups, movies and paginated 
// results respective information. 

'use strict'

import crypto from 'crypto'

/** 
 * Constructs an object that represents a group.
 * @param {*} id - unique identifier.
 * @param {Object} source - object that contains group data.
 */
export class Group {
    constructor(source) {
        this.id = source.id
        this.name = source.name
        this.description = source.description
        this.movies = []
        this.userId = source.userId
    }
}

/** 
 * Constructs an object that represents the details of a group of movies.
 * @param {Object} group - object that contains group data.
 * @param {Object} movies - object that contains paginated results of movies.
 */
export class GroupDetails {
    constructor(group, movies) {
        this.name = group.name
        this.description = group.description
        this.movies = movies
        // Calculates the total duration of all movies in this group
        this.moviesTotalDuration = movies.results 
            .reduce( (acc, movie) => { return acc + Number(movie.runtimeMins) }, 0)
    }
}

/** 
 * Constructs an object that represents a user.
 * @param {Object} source - object that contains user data.
 */
export class User {
    constructor(source) {
        this.id = source.id
        this.username = source.username
        this.password = source.password
        this.email = source.email
        this.token = source.token ? source.token : crypto.randomUUID()
    }
}

/** 
 * Constructs an object that represents a movie.
 * @param {Object} movie - object that contains movie data.
 */
export class Movie {
    constructor(movie) {
        this.id = movie.id,
        this.title = movie.title,
        this.runtimeMins = movie.runtimeMins
    }
}


/** 
 * Constructs an object that represents the details of movie.
 * @param {Object} movie - object that contains movie data.
 */
export class MovieDetails {
    constructor(movie) {
        this.id = movie.id
        this.title = movie.title
        this.description = movie.plot
        this.image_url = movie.image
        this.runtimeMins = movie.runtimeMins
        this.director = movie.directors
        this.actors_names = movie.stars
    }
}

/** 
 * Constructs an object that represents a paginated result set.
 * @param {Object} results - object that contains a limited set of results.
 * @param {Object} totalPages - the total amount of pages where the entire 
 * content was distributed by.
 */
export class PaginatedResults {
    constructor(results, totalPages) {
        this.results = results
        this.totalPages = totalPages       
    }
}