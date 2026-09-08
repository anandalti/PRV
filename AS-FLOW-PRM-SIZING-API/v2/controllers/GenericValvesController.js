const { pool } = require("../db/pgsqldb");
const { mapServiceWithPACode } = require("../utils/helper");

const getAllGenericValves = async (req, res) => {
  const { body: params } = req;
  try {
    const { WorkFlowId, CalculationMethod, ...inputs } = params;
    const workflowId = parseInt(WorkFlowId);
    const service = mapServiceWithPACode(inputs.FluidType,workflowId);
    if (inputs.IsPressureOnly && inputs.IsVacuumOnly) {
      const data = `SELECT * FROM public."GetComplexValves"('${workflowId})`;
      res.status(200).json(data.rows);
    } else {
      const serviceType = inputs.IsVacuumOnly ? "V" : "P";
      const data = await pool.query(
        `SELECT * FROM public."GetSimpleValves"(${workflowId}, '${service}', '${serviceType}')`
      );
      res.status(200).json(data.rows);
    }
  } catch (e) {
    console.log(e);
    // return { error: e.message };
    res.status(500).json({ error: e.message });
  }
};

module.exports = { getAllGenericValves };
