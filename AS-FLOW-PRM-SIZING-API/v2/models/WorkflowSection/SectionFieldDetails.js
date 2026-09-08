const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValue } = require('../../utils/helper');

class SectionFieldDetails {
    constructor(data) {
        this.SectionId = data.SectionId;
        this.FieldId = data.FieldId;
        this.FieldName = data.FieldName;
        this.FieldLabel = data.FieldLabel;
        this.FieldType = data.FieldType;
        this.FieldDisplayOrder = data.FieldDisplayOrder;
        this.IsValidationRequired = data.IsValidationRequired;
        this.DimensionName = data.DimensionName;
        this.InfoText = data.InfoText;
        this.Grid = data.Grid;
        this.Style = data.Style;
        this.Regex = data.Regex;
        this.UomFieldName = data.UomFieldName;
        this.GridSection = data.GridSection;
        this.FieldAction = data.FieldAction;
    }

    static async getAllSectionAllFields() {
        try {
            const list = [];
            const res = await pool.query('SELECT * FROM "SectionFieldDetails";');
            res.rows.forEach((data) => {
                list.push(new SectionFieldDetails(data));
            });
            return list;
        } catch (error) {
            console.error('Error fetching all section fields:', error);
            throw error;
        }
    }
    static async getAllSectionFieldsBYSectionId(sectionId) {
        const list = [];
        const res = await pool.query('SELECT * FROM "SectionFieldDetails" WHERE "SectionId" = $1;', [sectionId]);
        res.rows.forEach((data) => {
            list.push(new SectionFieldDetails(data));
        });
        return list;
    }

    static async getSectionFieldById(sectionId, fieldId) {
        const res = await pool.query('SELECT * FROM "SectionFieldDetails" WHERE "SectionId" = $1 AND "FieldId" = $2', [sectionId, fieldId]);
        if (res.rows.length === 0) return null;
        return new SectionFieldDetails(res.rows[0]);
    }

    static async createSectionField(data) {
        const values = [];
        const params = [];
        const fieldCount=15;
        data.forEach((rec, i) => {
            values.push(
                `($${i*fieldCount+1}, $${i*fieldCount+2}, $${i*fieldCount+3}, $${i*fieldCount+4}, $${i*fieldCount+5}, $${i*fieldCount+6}, $${i*fieldCount+7}, $${i*fieldCount+8}, $${i*fieldCount+9}, $${i*fieldCount+10}, $${i*fieldCount+11}, $${i*fieldCount+12}, $${i*fieldCount+13}, $${i*fieldCount+14}, $${i*fieldCount+15})`
            );
            params.push(
                rec.SectionId,
                rec.FieldName,
                rec.FieldLabel,
                rec.FieldType,
                rec.FieldDisplayOrder,
                rec.IsValidationRequired,
                rec.DimensionName || null,
                rec.InfoText || null,
                rec.Grid || null,
                rec.Regex || null,
                rec.Style || null,
                rec.UomFieldName || null,
                rec.IsFieldBlankMessage || null,
                rec.GridSection || null,
                rec.FieldAction || null
            );
        });

        const query = `
                INSERT INTO "SectionFieldDetails"
                    ("SectionId", "FieldName", "FieldLabel", "FieldType", "FieldDisplayOrder", "IsValidationRequired", "DimensionName", "InfoText", "Grid", "Regex", "Style", "UomFieldName", "IsFieldBlankMessage","GridSection","FieldAction")
                VALUES
                    ${values.join(', ')}
                RETURNING *;
                `;
        // if(values?.length>1){
        //     console.log('In Field creation >>>>>> ',query, params)
        // }
        const res = await pool.query(query, params);
        return res.rows.map(row => new SectionFieldDetails(row));
    }

    static async updateSectionField(sectionId, fieldId, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SectionFieldDetails" SET ${setStatements.join(', ')} WHERE "SectionId" = $1 AND "FieldId" = $2 RETURNING *;`;
        const res = await pool.query(updateQuery, [sectionId, fieldId]);
        if (res.rows.length === 0) return null;
        return new SectionFieldDetails(res.rows[0]);
    }

    static async deleteSectionField(sectionId) {
        await pool.query('DELETE FROM "SectionFieldDetails" WHERE "SectionId" = $1;', [sectionId]);
    }
}

module.exports = SectionFieldDetails;
