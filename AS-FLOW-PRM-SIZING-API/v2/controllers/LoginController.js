const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const UserReportHeader = require('../models/UserReportHeader');
const UOM = require('../models/UOM');
const ErrorLogs = require('../models/ErrorLogs');

const login = async (req, res) => {
    try {
        let userData = req.body;
        if (!userData) {
            res.statusCode = 400;
            return res.send({ ErrorCode: 'ES000025', "ErrorSummary": "Data not found" })
        }
        let userDetails = {
            "EmailId": typeof userData['EmailId'] === 'string' ? userData['EmailId'].toLowerCase() : ''
        };
        let response = {
            user: null,
            preference: null
        };
        const user = await User.getUserByEmailId(userDetails.EmailId);
        // console.log(`In login ::: 11111 >>>>>>>> ${user?.Id}`);
        if (!user) {
            const createdUser = await User.createUser(userDetails);
            // console.log(`In login ::: 222222 >>>>>>>> ${createdUser?.Id}`);
            const UserId = createdUser.Id;
            const uomDefaultData = await UOM.getAllDefaultUOM();
            // console.log(`In login ::: 333333 >>>>>>>> ${uomDefaultData?.length}`);
            const defaultPreferences = {
                UserId,
                Company: "",
                Address: "",
                CityStateZip: "",
                Country: "",
                Phone: "",
                EmailUrlFax: "",
                DisplayUnitSystem: 'All',
                CalculationMethod: 'English',
                SystemAtmPressure: 14.696,
                SystemAtmPressureUOM: uomDefaultData.find(uom => uom.DimensionName === 'abspressure' && uom.SystemUnit === 'English').UnitKey,
                SystemPressure: uomDefaultData.find(uom => uom.DimensionName === 'pressure' && uom.SystemUnit === 'English').UnitKey,
                SystemTemperature: uomDefaultData.find(uom => uom.DimensionName === 'temperature' && uom.SystemUnit === 'English').UnitKey,
                FluidLiquidViscosity: uomDefaultData.find(uom => uom.DimensionName === 'viscosity' && uom.SystemUnit === 'Metric').UnitKey,
                FluidSpecificHeat: uomDefaultData.find(uom => uom.DimensionName === 'specificheat' && uom.SystemUnit === 'English').UnitKey,
                FluidMassFlux: uomDefaultData.find(uom => uom.DimensionName === 'massflux' && uom.SystemUnit === 'English').UnitKey,
                FluidSpecificVolume: uomDefaultData.find(uom => uom.DimensionName === 'specificvolume' && uom.SystemUnit === 'English').UnitKey,
                FluidLatentHeat: uomDefaultData.find(uom => uom.DimensionName === 'latentheat' && uom.SystemUnit === 'English').UnitKey,
                FluidDensity: uomDefaultData.find(uom => uom.DimensionName === 'density' && uom.SystemUnit === 'English').UnitKey,
                FluidHeatInput: uomDefaultData.find(uom => uom.DimensionName === 'power' && uom.SystemUnit === 'English').UnitKey,
                FlowrateGas: uomDefaultData.find(uom => uom.DimensionName === 'gasvolflow' && uom.SystemUnit === 'English').UnitKey,
                FlowrateLiquid: uomDefaultData.find(uom => uom.DimensionName === 'liquidvolflow' && uom.SystemUnit === 'English' && uom.UnitKey === 'liquidvolflow.GPMUS').UnitKey,
                FlowrateSteam: uomDefaultData.find(uom => uom.DimensionName === 'massflow' && uom.SystemUnit === 'English').UnitKey,
                Flowrate2Phase: uomDefaultData.find(uom => uom.DimensionName === 'massflow' && uom.SystemUnit === 'English').UnitKey,
                FlowrateAPI521Fire: uomDefaultData.find(uom => uom.DimensionName === 'massflow' && uom.SystemUnit === 'English').UnitKey,
                FlowrateSubcooled: uomDefaultData.find(uom => uom.DimensionName === 'liquidvolflow' && uom.SystemUnit === 'English' && uom.UnitKey === 'liquidvolflow.BBLh').UnitKey,
                ValveDataSetSinglePhase: 'ASME',
                ValveDataSetMultiPhase: 'ASME',
                ValveOrificeArea: uomDefaultData.find(uom => uom.DimensionName === 'area' && uom.SystemUnit === 'English').UnitKey,
                ValveReactionForce: uomDefaultData.find(uom => uom.DimensionName === 'force' && uom.SystemUnit === 'English').UnitKey,
                ValveDimension: uomDefaultData.find(uom => uom.DimensionName === 'lengthforvalve' && uom.SystemUnit === 'English').UnitKey,
                ValveWeight: uomDefaultData.find(uom => uom.DimensionName === 'mass' && uom.SystemUnit === 'English').UnitKey,
                ValveDistanceFromValve: 100.000,
                ValveDistanceFromValveUOM: uomDefaultData.find(uom => uom.DimensionName === 'length' && uom.SystemUnit === 'English' && uom.UnitKey === 'length.ft').UnitKey,
                VesselDimensions: uomDefaultData.find(uom => uom.DimensionName === 'length' && uom.SystemUnit === 'English' && uom.UnitKey === 'length.in').UnitKey,
                VesselSurfaceArea: uomDefaultData.find(uom => uom.DimensionName === 'area' && uom.SystemUnit === 'English').UnitKey,
                VesselVolume: uomDefaultData.find(uom => uom.DimensionName === 'volume' && uom.SystemUnit === 'English').UnitKey,
                GeneralEnable7thEditionfor2Phase: false,
                GeneralEnable6thEditionfor2Phase: false
            }
            const defaultPreferenceData = new UserPreferences(defaultPreferences);
            // console.log(`In login ::: 444444 >>>>>>>> `);
            const defaultUserReportHeader = new UserReportHeader(defaultPreferences);
            // console.log(`In login ::: 555555 >>>>>>>> `);
            const { Id, UserId: userId, ...preferencesData } = await UserPreferences.createUserPreferences(defaultPreferenceData);
            // console.log(`In login ::: 666666 >>>>>>>> `);
            const {Id: reportHeaderId, UserId: reportUserId, ...userReportHeaderData} = await UserReportHeader.createUserReportHeader(defaultUserReportHeader);
            // console.log(`In login ::: 777777 >>>>>>>> `);
            response['user'] = createdUser;
            response['preference'] = {...preferencesData, ...userReportHeaderData};
        } else {
            const userPreferences = await UserPreferences.getUserPreferencesByUserId(user.Id);
            // console.log(`In login ::: 11 11 11 11 11 >>>>>>>> `);
            const userReportHeader = await UserReportHeader.getUserReportHeaderById(user.Id);

            const { Id, UserId, ...preferencesData } = userPreferences;
            // console.log(`In login ::: 12 12 12 12 12 >>>>>>>> ${Id} ${UserId}`);
            let reportHeaderData;
            if(userReportHeader) {
                const { Id: reportId, UserId: reportUserId, ...reportHeaders } = userReportHeader;
                reportHeaderData = reportHeaders;
            } else {
                reportHeaderData = {};
            }
            response['user'] = user;
            response['preference'] = {...preferencesData, ...reportHeaderData};
        }
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    login
};