
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ConfigurationSections {
    constructor(data){
        this.ConfigurationSectionId = data.ConfigurationSectionId;
this.ConfigurationModelId = data.ConfigurationModelId;
this.CatalogPosition = data.CatalogPosition;
this.ERPPosition = data.ERPPosition;
this.Name = data.Name;
this.Abbr = data.Abbr;
this.AllowMultiple = data.AllowMultiple;
this.Order = data.Order;
this.Visible = data.Visible;
this.Mode = data.Mode;
this.IsAccessory = data.IsAccessory;
this.DisplayName = data.DisplayName;
    }
    static async getAllConfigurationSections() {
        const listConfigurationSections = [];
        const res = await pool.query('SELECT * FROM "ConfigurationSections";');
        res.rows.forEach((data) => {
            listConfigurationSections.push(new ConfigurationSections(data));
        });
        return listConfigurationSections;
    }
    static async getConfigurationSectionsById(id) {
        const res = await pool.query('SELECT * FROM "ConfigurationSections" WHERE "ConfigurationSectionId" = $1', [id]);
        return new ConfigurationSections(res.rows[0]);
    }    
    static async createConfigurationSections(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ConfigurationSections"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateConfigurationSections(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ConfigurationSections" SET ${setStatements.join(', ')} WHERE "ConfigurationSectionId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteConfigurationSections(id) {
        const res = await pool.query('DELETE FROM "ConfigurationSections" WHERE "ConfigurationSectionId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ConfigurationSections;
