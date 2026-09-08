const { bomSolveResult, getConfigitCodeByTagIds } = require("../../service/import-tool/configit-bom-solve");


exports.bomSolve = async (req, res) => {
    try {
        const { tagIds } = req.body;
        if (!Array.isArray(tagIds) || tagIds.length === 0 || !tagIds.every(id => Number.isInteger(id) && id > 0)) {
            return res.status(400).json({ error: 'tagIds must be a non-empty array of positive integers' });
        }
        const bomDataByTagIds = await getConfigitCodeByTagIds(tagIds);
        const solvePromises = [];
        for (const tagId of bomDataByTagIds.keys()) {
            const selectedValveData = bomDataByTagIds.get(tagId);
            for (const valveId of selectedValveData.keys()) {
                const { packagePath, ...bomData } = selectedValveData.get(valveId);
                solvePromises.push(bomSolveResult(bomData, packagePath, valveId));
            }
        }
        await Promise.all(solvePromises);
        res.status(200).json({ message: 'BOM solve process completed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error solving BOM' });
    }
}
