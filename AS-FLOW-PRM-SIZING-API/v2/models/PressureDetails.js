
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class PressureDetails {
    constructor(data){
        this.Id = data.Id;
this.SizingId = data.SizingId;
this.AtmPressure = data.AtmPressure;
this.SystemMAWP = data.SystemMAWP;
this.OperatingPressure = data.OperatingPressure;
this.SetPressure = data.SetPressure;
this.OverPressurePer = data.OverPressurePer;
this.OverPressure = data.OverPressure;
this.BuiltUp = data.BuiltUp;
this.ConstantSuperimposed = data.ConstantSuperimposed;
this.VariableSuperimposed = data.VariableSuperimposed;
this.TotalBackPressure = data.TotalBackPressure;
this.InletLossPer = data.InletLossPer;
this.InletLoss = data.InletLoss;
this.AtmPressureUOM = data.AtmPressureUOM;
this.PressureUOM = data.PressureUOM;
this.PressureUOMVacuum = data.PressureUOMVacuum;
this.IsOverPressurePer = data.IsOverPressurePer;
this.IsInletLossPer = data.IsInletLossPer;
this.SystemMAWV = data.SystemMAWV;
this.SetVacuum = data.SetVacuum;
this.UnderPressurePer = data.UnderPressurePer;
this.UnderPressure = data.UnderPressure;
this.IsUnderPressurePer = data.IsUnderPressurePer;
this.VesselPressure = data.VesselPressure;
this.VesselVacuum = data.VesselVacuum;
this.DeltaPressure = data.DeltaPressure;
this.DeltaPressureVacuum = data.DeltaPressureVacuum;
    }
    static async getAllPressureDetails() {
        const listPressureDetails = [];
        const res = await pool.query('SELECT * FROM "PressureDetails";');
        res.rows.forEach((data) => {
            listPressureDetails.push(new PressureDetails(data));
        });
        return listPressureDetails;
    }
    static async getPressureDetailsById(id) {
        const res = await pool.query('SELECT * FROM "PressureDetails" WHERE "Id" = $1', [id]);
        return new PressureDetails(res.rows[0]);
    }    
    static async createPressureDetails(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "PressureDetails"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updatePressureDetails(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "PressureDetails" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deletePressureDetails(id) {
        const res = await pool.query('DELETE FROM "PressureDetails" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = PressureDetails;
