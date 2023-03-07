// Module that exports the modules managed by the internal memory access

'use strict'

export default function() {
    return {
        cmdbData: import('#data_access/internal/cmdb-data-mem.mjs'),
        usersData: import('#data_access/internal/cmdb-users-mem.mjs')
    }
}