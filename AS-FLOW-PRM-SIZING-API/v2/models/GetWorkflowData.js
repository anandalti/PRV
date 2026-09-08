
    const { pool } = require('../db/pgsqldb');
class GetWorkflowData {
    constructor(data){
        this.Id = data.Id;
        this.ValveCategoryId = data.ValveCategoryId;
        this.ValveCategoryName = data.ValveCategoryName;
        this.ValveCategoryDescription = data.ValveCategoryDescription;
        this.ValveCategoryIsActive = data.ValveCategoryIsActive;
        this.ValveCategoryIcon = data.ValveCategoryIcon;
        this.ValveCategoryDisplayOrder = data.ValveCategoryDisplayOrder;
        this.FluidTypeId = data.FluidTypeId;
        this.FluidTypeName = data.FluidTypeName;
        this.FluidTypeDescription = data.FluidTypeDescription;
        this.FluidTypeIsActive = data.FluidTypeIsActive;
        this.FluidTypeIcon = data.FluidTypeIcon;
        this.FluidTypeDisplayOrder = data.FluidTypeDisplayOrder;
        this.SizingMethodologyId = data.SizingMethodologyId;
        this.SizingMethodologyName = data.SizingMethodologyName;
        this.Code = data.Code;
        this.SizingMethodologyDescription = data.SizingMethodologyDescription;
        this.SizingMethodologyIsActive = data.SizingMethodologyIsActive;
        this.SizingMethodologyDisplayOrder = data.SizingMethodologyDisplayOrder;
        this.IsGenericReq = data.IsGenericReq;
    }
    static async getAllGetWorkflowData() {
        const listGetWorkflowData = [];
        const res = await pool.query('SELECT * FROM "GetWorkflowData";');
        res.rows.forEach((data) => {
            listGetWorkflowData.push(new GetWorkflowData(data));
        });
        return listGetWorkflowData;
    }
    static async getGetWorkflowDataById(id) {
        const res = await pool.query(
            'SELECT * FROM "GetWorkflowData" WHERE "Id" = $1',
            [id]
        );
        return res.rows?.length > 0
            ? new GetWorkflowData(res.rows[0])
            : { status: 'Error', error: `Data not found for WorkflowId ${id}` };
    }
}
module.exports = GetWorkflowData;
