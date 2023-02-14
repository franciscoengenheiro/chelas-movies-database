// Module that exports elastic search database access functions through its HTTP API

'use strict'

// Constants
const PORT = 9200
const URI_PREFIX = `http://localhost:${PORT}/`
const REFRESH = '?refresh=wait_for' // Tell Elastic Search to wait for the changes made by the
                                    // request to be made visible by a refresh before replying 

export default function(index) {
    return {
        createDoc: () => `${URI_PREFIX}${index}/_doc${REFRESH}`, 
        getDoc: (_id) => `${URI_PREFIX}${index}/_doc/${_id}`,
        editDoc: (_id) => `${URI_PREFIX}${index}/_doc/${_id}${REFRESH}`,
        deleteDoc: (_id) => `${URI_PREFIX}${index}/_doc/${_id}${REFRESH}`,
        searchDocs: () => `${URI_PREFIX}${index}/_search`
    }
}