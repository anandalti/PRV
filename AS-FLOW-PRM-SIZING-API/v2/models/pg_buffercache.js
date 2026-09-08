
    const { pool } = require('../db/pgsqldb');
class pg_buffercache {
    constructor(data){
        this.bufferid = data.bufferid;
this.relfilenode = data.relfilenode;
this.reltablespace = data.reltablespace;
this.reldatabase = data.reldatabase;
this.relforknumber = data.relforknumber;
this.relblocknumber = data.relblocknumber;
this.isdirty = data.isdirty;
this.usagecount = data.usagecount;
this.pinning_backends = data.pinning_backends;
    }
    static async getAllpg_buffercache() {
        const listpg_buffercache = [];
        const res = await pool.query('SELECT * FROM "pg_buffercache";');
        res.rows.forEach((data) => {
            listpg_buffercache.push(new pg_buffercache(data));
        });
        return listpg_buffercache;
    }
    static async getpg_buffercacheById(id) {
        const res = await pool.query('SELECT * FROM "pg_buffercache" WHERE "Id" = $1', [id]);
        return new pg_buffercache(res.rows[0]);
    }
}
module.exports = pg_buffercache;
