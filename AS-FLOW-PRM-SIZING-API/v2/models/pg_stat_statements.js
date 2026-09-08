
    const { pool } = require('../db/pgsqldb');
class pg_stat_statements {
    constructor(data){
        this.userid = data.userid;
this.dbid = data.dbid;
this.queryid = data.queryid;
this.query = data.query;
this.calls = data.calls;
this.total_time = data.total_time;
this.min_time = data.min_time;
this.max_time = data.max_time;
this.mean_time = data.mean_time;
this.stddev_time = data.stddev_time;
this.rows = data.rows;
this.shared_blks_hit = data.shared_blks_hit;
this.shared_blks_read = data.shared_blks_read;
this.shared_blks_dirtied = data.shared_blks_dirtied;
this.shared_blks_written = data.shared_blks_written;
this.local_blks_hit = data.local_blks_hit;
this.local_blks_read = data.local_blks_read;
this.local_blks_dirtied = data.local_blks_dirtied;
this.local_blks_written = data.local_blks_written;
this.temp_blks_read = data.temp_blks_read;
this.temp_blks_written = data.temp_blks_written;
this.blk_read_time = data.blk_read_time;
this.blk_write_time = data.blk_write_time;
    }
    static async getAllpg_stat_statements() {
        const listpg_stat_statements = [];
        const res = await pool.query('SELECT * FROM "pg_stat_statements";');
        res.rows.forEach((data) => {
            listpg_stat_statements.push(new pg_stat_statements(data));
        });
        return listpg_stat_statements;
    }
    static async getpg_stat_statementsById(id) {
        const res = await pool.query('SELECT * FROM "pg_stat_statements" WHERE "Id" = $1', [id]);
        return new pg_stat_statements(res.rows[0]);
    }
}
module.exports = pg_stat_statements;
