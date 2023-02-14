// Module that defines what modules to import based on the received object properties.
// In this way, only importing what's necessary for the current usage - dynamic imports.

'use strict'

/**
 * @param {Object} config an object that contains configuration data related to 
 * modules that are use conditionally, depending on the context.
 * @returns a new configuration object.
 */
export default async function(config) {
    let usersData
    let cmdbData
    switch(config.database) {
        case 'elastic':
            cmdbData = await import('#data_access/elasticsearch/cmdb-data-elasticsearch.mjs')
            usersData = await import('#data_access/elasticsearch/cmdb-users-elasticsearch.mjs')
            break
        default: // If a database is not specified, it defaults to local memory storage
            cmdbData = await import('#data_access/internal/cmdb-data-mem.mjs')
            usersData = await import('#data_access/internal/cmdb-users-mem.mjs')
    }
    let fetch = config.fetch == 'local' ? await import('#data_access/fetch/local-fetch.mjs') : await import('#data_access/fetch/node-fetch.mjs')
    // Create new properties
    return Object.assign(config, {
        fetch: fetch.default,
        cmdbData: cmdbData.default(),
        usersData: usersData.default()
    })     
}