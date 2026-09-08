const { pool } = require("../db/pgsqldb"); 

const saveProjectProperties = async (req, res) => {
    const projectPropertiesData = req.body; 
    console.log(">>>>>>>projectPropertiesData",projectPropertiesData)
    if (!projectPropertiesData || Object.keys(projectPropertiesData).length === 0) {
      return res.status(400).json({ error: 'Invalid or missing data' });
    }
  
    try {
      const jsonData = JSON.stringify(projectPropertiesData); 
      console.log(">>>jsonData",jsonData);
      const query = `CALL "PROC_SaveProjectProperties"($1)`;
      await pool.query(query, [jsonData]);
  
      console.log('Project Properties saved successfully');
      return res.status(200).json({ message: 'Project properties saved successfully' });
    } catch (err) {
      console.error('Error saving project properties:', err); 
      return res.status(500).json({ error: 'Failed to save project properties' });
    }
};

module.exports = { saveProjectProperties };
