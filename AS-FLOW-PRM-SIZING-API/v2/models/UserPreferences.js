
const { pool } = require('../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class UserPreferences {
    constructor(data) {
        this.Id = data.Id;
        this.UserId = data.UserId;
        this.DisplayUnitSystem = data.DisplayUnitSystem;
        this.CalculationMethod = data.CalculationMethod;
        this.SystemAtmPressure = data.SystemAtmPressure;
        this.SystemAtmPressureUOM = data.SystemAtmPressureUOM;
        this.SystemPressure = data.SystemPressure;
        this.SystemTemperature = data.SystemTemperature;
        this.FluidLiquidViscosity = data.FluidLiquidViscosity;
        this.FluidSpecificHeat = data.FluidSpecificHeat;
        this.FluidMassFlux = data.FluidMassFlux;
        this.FluidSpecificVolume = data.FluidSpecificVolume;
        this.FluidLatentHeat = data.FluidLatentHeat;
        this.FluidDensity = data.FluidDensity;
        this.FluidHeatInput = data.FluidHeatInput;
        this.FlowrateGas = data.FlowrateGas;
        this.FlowrateLiquid = data.FlowrateLiquid;
        this.FlowrateSteam = data.FlowrateSteam;
        this.Flowrate2Phase = data.Flowrate2Phase;
        this.FlowrateAPI521Fire = data.FlowrateAPI521Fire;
        this.FlowrateSubcooled = data.FlowrateSubcooled;
        this.ValveDataSetSinglePhase = data.ValveDataSetSinglePhase;
        this.ValveDataSetMultiPhase = data.ValveDataSetMultiPhase;
        this.ValveOrificeArea = data.ValveOrificeArea;
        this.ValveReactionForce = data.ValveReactionForce;
        this.ValveDimension = data.ValveDimension;
        this.ValveWeight = data.ValveWeight;
        this.ValveDistanceFromValve = data.ValveDistanceFromValve;
        this.ValveDistanceFromValveUOM = data.ValveDistanceFromValveUOM;
        this.VesselDimensions = data.VesselDimensions;
        this.VesselSurfaceArea = data.VesselSurfaceArea;
        this.VesselVolume = data.VesselVolume;
        this.GeneralEnable7thEditionfor2Phase = data.GeneralEnable7thEditionfor2Phase;
        this.GeneralEnable6thEditionfor2Phase = data.GeneralEnable6thEditionfor2Phase;
    }
    static async getAllUserPreferences() {
        const listUserPreferences = [];
        const res = await pool.query('SELECT * FROM "UserPreferences";');
        res.rows.forEach((data) => {
            listUserPreferences.push(new UserPreferences(data));
        });
        return listUserPreferences;
    }
    static async getUserPreferencesById(id) {
        const res = await pool.query('SELECT * FROM "UserPreferences" WHERE "Id" = $1', [id]);
        return new UserPreferences(res.rows[0]);
    }
    static async getUserPreferencesByUserId(userId) {
        const res = await pool.query('SELECT * FROM "UserPreferences" WHERE "UserId" = $1 ORDER BY "Id" DESC LIMIT 1', [userId]);
        if (res.rows.length === 0) return null;
        return new UserPreferences( res.rows[0]);
    }
    static async getUserPreferencesByUserEmail(email) {
        const res = await pool.query(
            'SELECT "UserPreferences".* FROM "UserPreferences" INNER JOIN "UserDetails" ON "UserPreferences"."UserId" = "UserDetails"."Id" WHERE "UserDetails"."Email" = $1 ORDER BY "UserPreferences"."Id" DESC LIMIT 1',
            [email]
        );
        if (res.rows.length === 0) return null;
        return new UserPreferences(res.rows[0]);
    }
    static async createUserPreferences(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "UserPreferences"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateUserPreferences(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "UserPreferences" SET ${setStatements.join(', ')} WHERE "UserId" = $1 RETURNING *; `;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteUserPreferences(id) {
        const res = await pool.query('DELETE FROM "UserPreferences" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }

}
module.exports = UserPreferences;
