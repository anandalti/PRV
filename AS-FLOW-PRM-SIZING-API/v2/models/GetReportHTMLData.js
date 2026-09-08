
    const { pool } = require('../db/pgsqldb');
class GetReportHTMLData {
    constructor(data){
        this.Id = data.Id;
this.ReportTypeId = data.ReportTypeId;
this.TemplateId = data.TemplateId;
this.SubTemplateId = data.SubTemplateId;
this.DisplayOrder = data.DisplayOrder;
this.IsParent = data.IsParent;
this.ReportType = data.ReportType;
this.Template = data.Template;
this.SubTemplate = data.SubTemplate;
this.ValidationCheckId = data.ValidationCheckId;
this.FlowType = data.FlowType;
this.UnitType = data.UnitType;
this.Expressions = data.Expressions;
this.RowId = data.RowId;
this.ColumnId = data.ColumnId;
this.Rowspan = data.Rowspan;
this.Colspan = data.Colspan;
this.ValueType = data.ValueType;
this.CellValue = data.CellValue;
this.Param = data.Param;
this.Style = data.Style;
    }
    static async getAllGetReportHTMLData() {
        const listGetReportHTMLData = [];
        const res = await pool.query('SELECT * FROM "GetReportHTMLData";');
        res.rows.forEach((data) => {
            listGetReportHTMLData.push(new GetReportHTMLData(data));
        });
        return listGetReportHTMLData;
    }
    static async getGetReportHTMLDataById(id) {
        const res = await pool.query('SELECT * FROM "GetReportHTMLData" WHERE "Id" = $1', [id]);
        return new GetReportHTMLData(res.rows[0]);
    }
}
module.exports = GetReportHTMLData;
