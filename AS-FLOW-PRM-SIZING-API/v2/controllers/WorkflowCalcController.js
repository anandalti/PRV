
const getSaturatedSteamValue = async (req, res) => {

    const SetPressure=req.query.SetPressure===''?0:Number(req.query.SetPressure);
    const OverPressure=req.query.OverPressure===''?0:Number(req.query.OverPressure);
    const InletLoss=req.query.InletLoss===''?0:Number(req.query.InletLoss);
    const AtmPressure=req.query.AtmPressure===''?0:Number(req.query.AtmPressure);
    const data={name:"SaturatedSteam",value:SetPressure+OverPressure-InletLoss+AtmPressure}
    res.json(data);
};

module.exports = {
    getSaturatedSteamValue,
};
