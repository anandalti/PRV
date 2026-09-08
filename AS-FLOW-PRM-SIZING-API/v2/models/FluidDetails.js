
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class FluidDetails {
    constructor(data){
        this.Id = data.Id;
this.SizingId = data.SizingId;
this.FluidName = data.FluidName;
this.MolWeight = data.MolWeight;
this.SpGravity = data.SpGravity;
this.KCpByCv = data.KCpByCv;
this.Compressibility = data.Compressibility;
this.IsentropicExponent = data.IsentropicExponent;
this.Viscosity = data.Viscosity;
this.IsSaturatedSteam = data.IsSaturatedSteam;
this.IsWetSteam = data.IsWetSteam;
this.IsSetOnAir = data.IsSetOnAir;
this.DrynessFactor = data.DrynessFactor;
this.IsLiquidOnlyAtInlet = data.IsLiquidOnlyAtInlet;
this.DensityUOM = data.DensityUOM;
this.Density = data.Density;
this.DensityLiquid = data.DensityLiquid;
this.SpecificVolumeUOM = data.SpecificVolumeUOM;
this.SpecificVolume = data.SpecificVolume;
this.SpecificVolumeLiquid = data.SpecificVolumeLiquid;
this.IsDensityOrSpVolume = data.IsDensityOrSpVolume;
this.MassFlux = data.MassFlux;
this.MassFluxUOM = data.MassFluxUOM;
this.CombinedSpVolAt90PerP1 = data.CombinedSpVolAt90PerP1;
this.CombinedSpVolAtInlet = data.CombinedSpVolAtInlet;
this.VaporSaturationPressure = data.VaporSaturationPressure;
this.PressureUOM = data.PressureUOM;
this.MixDensityAt90PerSat = data.MixDensityAt90PerSat;
this.LatentHeat = data.LatentHeat;
this.LatentHeatUOM = data.LatentHeatUOM;
this.LiquidSpecificHeatAtInlet = data.LiquidSpecificHeatAtInlet;
this.LiquidSpecificHeatAtInletUOM = data.LiquidSpecificHeatAtInletUOM;
this.InletSpVolMixture = data.InletSpVolMixture;
this.GasVaporCombinedSpVol = data.GasVaporCombinedSpVol;
this.IsDensityOrSpVolumeLiquid = data.IsDensityOrSpVolumeLiquid;
this.IsDensityOrSpVolumeAt90PerSat = data.IsDensityOrSpVolumeAt90PerSat;
this.SaturatedVaporSpVol = data.SaturatedVaporSpVol;
this.SaturatedLiquidSpVol = data.SaturatedLiquidSpVol;
this.VaporPressure = data.VaporPressure;
this.GasPartialPressure = data.GasPartialPressure;
this.ViscosityUOM = data.ViscosityUOM;
this.SpGravityLiquid = data.SpGravityLiquid;
this.SpGravityLiquid2 = data.SpGravityLiquid2;
this.IsLiquid2 = data.IsLiquid2;
this.IsPressureOnly = data.IsPressureOnly;
this.IsVacuumOnly = data.IsVacuumOnly;
this.FluidNameVacuum = data.FluidNameVacuum;
this.MolWeightVacuum = data.MolWeightVacuum;
this.KCpByCvVacuum = data.KCpByCvVacuum;
this.CompressibilityVacuum = data.CompressibilityVacuum;
this.ViscosityLiquid = data.ViscosityLiquid;
this.ViscosityLiquid2 = data.ViscosityLiquid2;
this.CriticalPressure = data.CriticalPressure;
this.FluidNameLiquid = data.FluidNameLiquid;
this.FluidNameLiquid2 = data.FluidNameLiquid2;
    }
    static async getAllFluidDetails() {
        const listFluidDetails = [];
        const res = await pool.query('SELECT * FROM "FluidDetails";');
        res.rows.forEach((data) => {
            listFluidDetails.push(new FluidDetails(data));
        });
        return listFluidDetails;
    }
    static async getFluidDetailsById(id) {
        const res = await pool.query('SELECT * FROM "FluidDetails" WHERE "Id" = $1', [id]);
        return new FluidDetails(res.rows[0]);
    }    
    static async createFluidDetails(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "FluidDetails"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateFluidDetails(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FluidDetails" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteFluidDetails(id) {
        const res = await pool.query('DELETE FROM "FluidDetails" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = FluidDetails;
