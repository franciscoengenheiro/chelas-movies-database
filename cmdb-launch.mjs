// Application Entry Point. This modules launchs the server in a given port

'use strict'

// Constants
const PORT = 1904

console.log("-------------- Start setting up server --------------")

import server from '#root/cmdb-server.mjs'

let app = server() // Launch server

// Sets the server to listen in a specified port.
app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("--------------- End setting up server ---------------")