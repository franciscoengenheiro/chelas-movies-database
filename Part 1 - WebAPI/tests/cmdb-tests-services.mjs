
import * as services from "../services/cmdb-services.mjs"
import * as assert from "assert"

describe("safasf", function(){
    describe("fafwf", function(){
        it("afawfa", async function(){

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
})