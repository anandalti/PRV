
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SizingDetails {
    constructor(data){
        this.Id = data.Id;
        this.SizingId = data.SizingId;
        this.IsASMESection8 = data.IsASMESection8;
        this.IsRuptureDisc = data.IsRuptureDisc;
        this.RuptureDiscKcFd = data.RuptureDiscKcFd;
        this.IsDisplayAllOrifices = data.IsDisplayAllOrifices;
        this.KADataSet = data.KADataSet;
        this.OrificeAreaUOM = data.OrificeAreaUOM;
        this.IsGeneric = data.IsGeneric;
        this.IsMultivalve = data.IsMultivalve;
        this.IsCondensationPresent = data.IsCondensationPresent;
        this.IsRelTempGT90PerPressGT50 = data.IsRelTempGT90PerPressGT50;
        this.IsFAIncludedOnRV = data.IsFAIncludedOnRV;
        this.SteamCondition = data.SteamCondition;
        this.ViscosityCorrectionFactorKv = data.ViscosityCorrectionFactorKv;
        this.ViscosityCorrectionFactor = data.ViscosityCorrectionFactor;
        this.SizingBasis = data.SizingBasis;
        this.ValveType = data.ValveType;
        this.WorkFlowId = data.WorkFlowId;
        this.CalculationMethod = data.CalculationMethod;
        this.DisplayUnitSystem = data.DisplayUnitSystem;
        this.IsSuperUser = data.IsSuperUser;
        this.UserId = data.UserId;
        this.DistanceFromValve = data.DistanceFromValve;
        this.DistanceFromValveUOM = data.DistanceFromValveUOM;
        this.DraftStage = data.DraftStage;
        this.SizingTabIndex = data.SizingTabIndex;
        this.ErrorWarnings = data.ErrorWarnings;
        this.CreatedDate = data.CreatedDate;
        this.UpdatedDate = data.UpdatedDate;
    }
    static async getAllSizingDetails() {
        const listSizingDetails = [];
        const res = await pool.query('SELECT * FROM "SizingDetails";');
        res.rows.forEach((data) => {
            listSizingDetails.push(new SizingDetails(data));
        });
        return listSizingDetails;
    }
    static async getSizingDetailsById(id) {
        const res = await pool.query('SELECT * FROM "SizingDetails" WHERE "Id" = $1', [id]);
        return new SizingDetails(res.rows[0]);
    }    
    static async createSizingDetails(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SizingDetails"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSizingDetails(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SizingDetails" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSizingDetails(id) {
        const res = await pool.query('DELETE FROM "SizingDetails" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SizingDetails;
