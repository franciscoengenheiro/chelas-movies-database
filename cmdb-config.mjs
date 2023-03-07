// Module that defines what modules to import based on the received object properties.
// In this way, only importing what's necessary for the current usage - dynamic imports.

'use strict'

/**
 * @param {Object} config an object that contains configuration data related to 
 * modules that are use conditionally, depending on the context.
 * @returns a new configuration object.
 */
export default async function(config) {
    // Run received database configuration modules
    let data = config.database()
    // Assert fetch module to use
    let fetch = config.fetch == 'local' ? 
        await import('#data_access/fetch/local-fetch.mjs') 
        : await import('#data_access/fetch/node-fetch.mjs')
    // Create new properties
    return Object.assign(config, {
        fetch: fetch.default,
        cmdbData: (await (data.cmdbData)).default(),
        usersData: (await (data.usersData)).default()
    })     
}