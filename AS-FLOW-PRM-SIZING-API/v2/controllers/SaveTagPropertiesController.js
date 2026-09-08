const { pool } = require("../db/pgsqldb"); 

const getTagPropertiesBySizingId = async (req, res) => {
  const { sizingId } = req.params; 

  if (!sizingId) {
    return res.status(400).json({ error: 'SizingId is required' });
  }

  try {
    const query = `
      SELECT "TagNumber", "PID", "Service", "LineNumber", "Quantity","DataSheetNotes","IsAutoNumberDSN","CalculationSheetNotes","IsAutoNumberCSN"
      FROM public."TagProperties"
      WHERE "SizingId" = $1;
    `;

    const result = await pool.query(query, [sizingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `No tag properties found for SizingId: ${sizingId}` });
    }

    console.log('Fetched Tag Properties:', result.rows);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching tag properties:', err);
    return res.status(500).json({ error: 'Failed to fetch tag properties' });
  }
};

const saveTagProperties = async (req, res) => {
  const tagPropertiesData = req.body; 
  
  if (!tagPropertiesData || Object.keys(tagPropertiesData).length === 0) {
    return res.status(400).json({ error: 'Invalid or missing data' });
  }

  try {
    const jsonData = JSON.stringify(tagPropertiesData);  
    
    const query = `CALL "PROC_SaveTagProperties"($1)`;
    await pool.query(query, [jsonData]);

    console.log('Tag Properties saved successfully');
    return res.status(200).json({ message: 'Tag properties saved successfully' });
  } catch (err) {
    console.error('Error saving tag properties:', err);
    return res.status(500).json({ error: 'Failed to save tag properties' });
  }
};

module.exports = { saveTagProperties, getTagPropertiesBySizingId };
