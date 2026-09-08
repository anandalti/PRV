
const { pool } = require('../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class RestrictedLiftData {
    constructor(data){
        this.Id = data.Id;
        this.SizingId = data.SizingId;
        this.ModelNumber = data.ModelNumber;
        this.Orifice = data.Orifice;
        this.RestrictedLift = data.RestrictedLift;
        this.RequiredFlow = data.RequiredFlow;
        this.RatedFlowCapacity = data.RatedFlowCapacity;
        this.FlowCapacityUOM = data.FlowCapacityUOM;
        this.IFR = data.IFR;
        const dnec = parseFloat(data.DoNotExceedCapacity);
        this.DoNotExceedCapacity = isNaN(dnec) ? null : dnec;
        this.LiftRestriction = data.LiftRestriction;
        this.RestrictedLiftCapacity = data.RestrictedLiftCapacity;
    }
    static async getAllRestrictedLiftData() {
        const listRestrictedLiftData = [];
        const res = await pool.query('SELECT * FROM "RestrictedLiftData";');
        res.rows.forEach((data) => {
            listRestrictedLiftData.push(new RestrictedLiftData(data));
        });
        return listRestrictedLiftData;
    }
    static async getRestrictedLiftDataById(id) {
        const res = await pool.query('SELECT * FROM "RestrictedLiftData" WHERE "SizingId" = $1', [id]);
        const data= res.rows?.length>0? new RestrictedLiftData(res.rows[0]) : null;
        // const data=new RestrictedLiftData(res.rows[0])
        // console.log({id,res:res.rows[0],data})
        return data;
    }   
    
    static async getRLDataWithSizingDetailsBySizingId(sizingId) {
        const query = `SELECT rld.*
                       FROM  "SizingDetails" sd
                       JOIN "RestrictedLiftData" rld ON rld."SizingId" = sd."Id"
                       WHERE sd."SizingId" = '${sizingId}';`;
        // console.log(query)
        const res = await pool.query(query);
        // console.log({res})
        return res.rows?.length>0? new RestrictedLiftData(res.rows[0]) : null;
    }
    static async createRestrictedLiftData(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "RestrictedLiftData"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }

    static async createUpdateRestrictedLiftData(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        // console.log('createUpdateRestrictedLiftData >>>>>>>>>>>>>>> ',keys,values)
        const insertQuery = `INSERT INTO "RestrictedLiftData"("${keys.join('","')}") VALUES (${values.join(',')}) 
                            ON CONFLICT ("SizingId", "ModelNumber", "Orifice", "RequiredFlow", "RatedFlowCapacity")
                            DO UPDATE SET
                                "FlowCapacityUOM" = '${data["FlowCapacityUOM"]}',
                                "RestrictedLift" ='${data["RestrictedLift"]}',
                                "IFR" = ${data["IFR"]},
                                "DoNotExceedCapacity" = ${data["DoNotExceedCapacity"]},
                                "LiftRestriction" = ${data["LiftRestriction"]},
                                "RestrictedLiftCapacity" = ${data["RestrictedLiftCapacity"]};`;
                                // const res = await pool.query(insertQuery + ' RETURNING *;');
                                const res = await pool.query(insertQuery);
                                // console.log('Query >>>>>>>>>>>>>>> ',insertQuery,res)
        return res.rows[0];
    }
    static async updateRestrictedLiftData(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "RestrictedLiftData" SET ${setStatements.join(', ')} WHERE "SizingId" = $1`;
        // console.log(updateQuery)
        const res = await pool.query(updateQuery, [id]);
        // console.log(res)
        return res.rows[0];
    }
    static async deleteRestrictedLiftData(id) {
        const res = await pool.query('DELETE FROM "RestrictedLiftData" WHERE "SizingId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = RestrictedLiftData;
