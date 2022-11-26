// Test module for the Application services modules

'use strict'

import * as services from "../services/cmdb-services.mjs"
import * as assert from "assert"

describe("Services modules tests", function(){
    describe("Services module tests", function(){
        it("should return (...)", async function(){
            // Arrange
            // Act
            // Assert
            let obj = await services.getGroupDetails(3, "asdasdadadadawqw")
            let expected = {
                "name": "Group 67",
                "description": "1234",
                "movies": [],
                "moviesTotalDuration" : 0
            }
            assert.deepEqual(obj, expected)
        })
    })
    describe("User services module tests", function(){
    })
})