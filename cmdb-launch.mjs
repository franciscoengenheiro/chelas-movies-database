// Application Entry Point. This modules launchs the server with a set of configurations.

'use strict'

console.log("-------------- Start setting up server --------------")

import server from '#root/cmdb-server.mjs'
import configInit from '#root/cmdb-config.mjs'
import internal from '#data_access/internal/internal.mjs'
import elastic from '#data_access/elasticsearch/elasticsearch.mjs'

// Server configuration
const config = await configInit({
    server: {
          host: 'localhost',
          port: 1904,
    },
    fetch: 'node', // local, node
    database: internal // internal, elastic
})

// Launch server application
let app = server(config)

// Constants
const port = config.server.port
const host = config.server.host

// Sets the server to listen in the specified port and host
app.listen(port, host, (err) => {
    if (err) {
        console.log(err)
        process.exit(1)
    }
    console.log(`Server is running on ${host}:${port}`)
})

console.log("--------------- End setting up server ---------------")