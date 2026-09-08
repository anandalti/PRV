const { refreshUomFile } = require("../utils/refreshUomFile");
const { clearUomCaches } = require("../service/getUom");
const { clearFieldsGroupByUOMCache } = require("../service/evaluateExpressions/getDefaultUnits");
const { clearGenericErrorsCache } = require("../service/CommonService");
const { clearFieldApiActionsCache } = require("../service/ApiActionService");
const { clearFieldPropertiesCache } = require("../service/evaluateExpressions/validations");


const RefreshCache = async (req, res) => {
    // console.log(' >>>>>>>>>>>>>> 1111111111111111 >>>>>>>>>>>>>>>>>')
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const data= await refreshUomFile();
        clearUomCaches();
        clearFieldsGroupByUOMCache();
        clearGenericErrorsCache();
        clearFieldApiActionsCache();
        clearFieldPropertiesCache();
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',data)
        if (!data) {
            return res.status(404).json({ status:"Error",error: 'Tup details not found' });
        }
        return res.status(200).json({status:"Success", data});
    } catch (error) {
        console.error('Error fetching Tup calculations:', error);
        return res.status(500).json({ status:"Error",error: 'Internal Server Error' });
        
    }
};

module.exports = {
    RefreshCache
};