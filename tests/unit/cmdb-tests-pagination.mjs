// Pagination unit tests module

'use strict'

// External Imports
import * as assert from "assert"
import createPaginatedResults from "#data_manipulation/pagination.mjs"
import { PaginatedResults } from "#data_manipulation/classes.mjs"
import errors from '#errors/errors.mjs'

describe("Pagination test modules:", function() {
    function numberedArray(length) {
        return new Array(length).fill(0, 0, length).map((_, idx) => idx + 1)
    }
    const defaultArray = numberedArray(30)
    const defaultLimit = 7

    describe("Assert pagination with an even number of elements and a fixed limit", function() {
        const array = numberedArray(40)
        const firstPage = new PaginatedResults([1, 2, 3, 4, 5, 6, 7], 6)
        it("Should return an object that represents the first page", function() {
            const sut = createPaginatedResults(array, defaultLimit, 1)
            assert.deepEqual(sut, firstPage)           
        })
        it("Should return an object that represents the last page", function() {
            const lastPage = new PaginatedResults([36, 37, 38, 39, 40], firstPage.totalPages)
            const sut = createPaginatedResults(array, defaultLimit, firstPage.totalPages)
            assert.deepEqual(sut, lastPage)
        })
    })

    describe("Assert pagination with an odd number of elements and a fixed limit", function() {
        const array = numberedArray(29)
        const firstPage = new PaginatedResults([1, 2, 3, 4, 5, 6, 7], 5)
        it("Should return an object that represents the first page", function() {
            assert.deepEqual(firstPage, createPaginatedResults(array, defaultLimit, 1))
        })
        it("Should return an object that represents the last page", function() {
            const lastPage = new PaginatedResults([29], firstPage.totalPages)
            const sut = createPaginatedResults(array, defaultLimit, firstPage.totalPages)
            assert.deepEqual(sut, lastPage)
        })
    })

    describe("Assert pagination without a valid limit", function() {
        it("Without a valid limit, should return an error", function() {
            try {
                createPaginatedResults(defaultArray, 0, 1)
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }
            assert.fail("Should throw an error")
        })
        it("Without a valid limit, should return an error", function() {
            try {
                createPaginatedResults(defaultArray, "a", 1)
            } catch(e) {
                assert.deepEqual(e, errors.INVALID_ARGUMENT("limit"))
                return
            }
            assert.fail("Should throw an error")
        })
    })
    describe("Assert pagination without a valid page", function() {
        it("Should return a valid paginated result", function() {
            try {
                createPaginatedResults(defaultArray, 10, "a")
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("page"))
                return
            }
            assert.fail("Should throw an error")
        })
        it("Without a valid page, should return an error", function() {
            try {
                createPaginatedResults(defaultArray, 10, "b")
            } catch(e) {
                assert.deepEqual(e, errors.ARGUMENT_NOT_FOUND("page"))
                return
            }
            assert.fail("Should throw an error")
        })
    })
    describe("Assert pagination with strings that can be converted to numbers", function() {
        it("Without a valid page, should return an error", function() {
            const expected = new PaginatedResults([4, 5, 6], 10)
            const sut = createPaginatedResults(defaultArray, '3', '2')
            assert.deepEqual(sut, expected)
        })
    })
})
