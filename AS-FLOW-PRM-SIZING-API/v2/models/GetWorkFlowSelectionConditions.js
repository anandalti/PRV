
    const { pool } = require('../db/pgsqldb');
class GetWorkFlowSelectionConditions {
    constructor(data){
        this.Id = data.Id;
this.ValveCategory = data.ValveCategory;
this.FluidType = data.FluidType;
this.SizingMethodology = data.SizingMethodology;
this.IsASMEChecked = data.IsASMEChecked;
this.Service = data.Service;
this.IsASMEDataSet = data.IsASMEDataSet;
this.IsMassFlow = data.IsMassFlow;
this.FlowKey = data.FlowKey;
this.Kx = data.Kx;
    }
    static async getAllGetWorkFlowSelectionConditions() {
        const listGetWorkFlowSelectionConditions = [];
        const res = await pool.query('SELECT * FROM "GetWorkFlowSelectionConditions";');
        res.rows.forEach((data) => {
            listGetWorkFlowSelectionConditions.push(new GetWorkFlowSelectionConditions(data));
        });
        return listGetWorkFlowSelectionConditions;
    }
    static async getGetWorkFlowSelectionConditionsById(id) {
        const res = await pool.query('SELECT * FROM "GetWorkFlowSelectionConditions" WHERE "Id" = $1', [id]);
        return new GetWorkFlowSelectionConditions(res.rows[0]);
    }
}
module.exports = GetWorkFlowSelectionConditions;
