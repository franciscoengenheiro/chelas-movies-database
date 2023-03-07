// Module that exports the modules managed by the elastic search data access

'use strict'

export default function() {
    return {
        cmdbData: import('#data_access/elasticsearch/cmdb-data-elasticsearch.mjs'),
        usersData: import('#data_access/elasticsearch/cmdb-users-elasticsearch.mjs')
    }
}