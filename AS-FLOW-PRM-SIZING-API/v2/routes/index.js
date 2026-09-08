
const express = require('express');
const router = express.Router();
// const authMiddleware = require('../middlewares/auth/authMiddleware');
const jwtAuthMiddleware = require('../middlewares/auth/jwtAuthMiddleware');

router.use((req, res, next) => {
    const correlationIdHeader = req.headers['x-correlation-id'] || req.headers['x-request-id'];
    const correlationId = typeof correlationIdHeader === 'string' && correlationIdHeader.trim()
        ? correlationIdHeader.trim()
        : null;

    req.requestMeta = {
        source: 'REST',
        correlationId,
    };

    if (correlationId) {
        res.setHeader('x-correlation-id', correlationId);
    }

    next();
});


const authRoutes = require('./AuthRoutes');
router.use('/auth', authRoutes);

const projectPropertiesRoute = require('./projectPropertyRoute');
router.use('/project', jwtAuthMiddleware, projectPropertiesRoute);

const tagPropertiesRoutes = require('./tagPropertiesRoutes');
router.use('/tagproperty', jwtAuthMiddleware, tagPropertiesRoutes);

const pg_stat_statementsRoutes = require('./pg_stat_statementsRoutes');
router.use('/pg_stat_statements', pg_stat_statementsRoutes);

const pg_buffercacheRoutes = require('./pg_buffercacheRoutes');
router.use('/pg_buffercache', pg_buffercacheRoutes);

const ReportTypeRoutes = require('./ReportTypeRoutes');
router.use('/ReportType', ReportTypeRoutes);

const ReportValidationCheckRoutes = require('./ReportValidationCheckRoutes');
router.use('/ReportValidationCheck', ReportValidationCheckRoutes);

const ReportSubTemplateRoutes = require('./ReportSubTemplateRoutes');
router.use('/ReportSubTemplate', ReportSubTemplateRoutes);

const UserRoutes = require('./UserRoutes');
router.use('/User',jwtAuthMiddleware, UserRoutes);

const ReportTemplateRoutes = require('./ReportTemplateRoutes');
router.use('/ReportTemplate', ReportTemplateRoutes);

const ReportTemplateMappingRoutes = require('./ReportTemplateMappingRoutes');
router.use('/ReportTemplateMapping', ReportTemplateMappingRoutes);

const ReportSubTemplateHTMLRoutes = require('./ReportSubTemplateHTMLRoutes');
router.use('/ReportSubTemplateHTML', ReportSubTemplateHTMLRoutes);

const ReportTemplateConditionsRoutes = require('./ReportTemplateConditionsRoutes');
router.use('/ReportTemplateConditions', ReportTemplateConditionsRoutes);

const ValveCategoryRoutes = require('./ValveCategoryRoutes');
router.use('/ValveCategory',jwtAuthMiddleware, ValveCategoryRoutes);

const FluidDetailsRoutes = require('./FluidDetailsRoutes');
router.use('/FluidDetails',jwtAuthMiddleware, FluidDetailsRoutes);

const FlowCapacityRoutes = require('./FlowCapacityRoutes');
router.use('/FlowCapacity',jwtAuthMiddleware, FlowCapacityRoutes);

const WorkFlowRoutes = require('./WorkFlowRoutes');
router.use('/WorkFlow',jwtAuthMiddleware, WorkFlowRoutes);

const WorkflowSelectionRoutes = require('./WorkflowSelectionRoutes');
router.use('/WorkflowSelection',jwtAuthMiddleware, WorkflowSelectionRoutes);

const PressureDetailsRoutes = require('./PressureDetailsRoutes');
router.use('/PressureDetails',jwtAuthMiddleware, PressureDetailsRoutes);

const UserPreferencesRoutes = require('./UserPreferencesRoutes');
router.use('/UserPreferences',jwtAuthMiddleware, UserPreferencesRoutes);

const TemperatureDetailsRoutes = require('./TemperatureDetailsRoutes');
router.use('/TemperatureDetails', TemperatureDetailsRoutes);

const SystemDetailsRoutes = require('./SystemDetailsRoutes');
router.use('/SystemDetails',jwtAuthMiddleware, SystemDetailsRoutes);

const FluidTypeRoutes = require('./FluidTypeRoutes');
router.use('/FluidType',jwtAuthMiddleware, FluidTypeRoutes);

const SelectionConditionsRoutes = require('./SelectionConditionsRoutes');
router.use('/SelectionConditions', SelectionConditionsRoutes);

const SizingMethodologyRoutes = require('./SizingMethodologyRoutes');
router.use('/SizingMethodology', SizingMethodologyRoutes);

const GetWorkFlowSelectionConditionsRoutes = require('./GetWorkFlowSelectionConditionsRoutes');
router.use('/GetWorkFlowSelectionConditions', GetWorkFlowSelectionConditionsRoutes);

const API521FlowRateReqRoutes = require('./API521FlowRateReqRoutes');
router.use('/API521FlowRateReq', API521FlowRateReqRoutes);

const API2000TankDataAPI521FireRoutes = require('./API2000TankDataAPI521FireRoutes');
router.use('/API2000TankDataAPI521Fire', API2000TankDataAPI521FireRoutes);

const API2000ResultsRoutes = require('./API2000ResultsRoutes');
router.use('/API2000Results', API2000ResultsRoutes);

const GenericValveSizingRoutes = require('./GenericValveSizingRoutes');
router.use('/GenericValveSizing', GenericValveSizingRoutes);

const GetReportHTMLDataRoutes = require('./GetReportHTMLDataRoutes');
router.use('/GetReportHTMLData', GetReportHTMLDataRoutes);

const API2000FlowRateReqRoutes = require('./API2000FlowRateReqRoutes');
router.use('/API2000FlowRateReq', API2000FlowRateReqRoutes);

const SelectedValveRoutes = require('./SelectedValveRoutes');
router.use('/SelectedValve', SelectedValveRoutes);

const SizingDetailsRoutes = require('./SizingDetailsRoutes');
router.use('/SizingDetails',jwtAuthMiddleware, SizingDetailsRoutes);

const GetWorkflowDataRoutes = require('./GetWorkflowDataRoutes');
router.use('/GetWorkflowData',jwtAuthMiddleware, GetWorkflowDataRoutes);

const ModelsRoutes = require('./ModelsRoutes');
router.use('/Models',jwtAuthMiddleware, ModelsRoutes);

const MultiphaseFluidsRoutes = require('./MultiphaseFluidsRoutes');
router.use('/MultiphaseFluids', MultiphaseFluidsRoutes);

const PhysicalPropertySubreportFieldsRoutes = require('./PhysicalPropertySubreportFieldsRoutes');
router.use('/PhysicalPropertySubreportFields', PhysicalPropertySubreportFieldsRoutes);

const PhysicalPropertySubreportModelsRoutes = require('./PhysicalPropertySubreportModelsRoutes');
router.use('/PhysicalPropertySubreportModels', PhysicalPropertySubreportModelsRoutes);

const PhysicalPropertySubreportsRoutes = require('./PhysicalPropertySubreportsRoutes');
router.use('/PhysicalPropertySubreports', PhysicalPropertySubreportsRoutes);

const SAPModelsRoutes = require('./SAPModelsRoutes');
router.use('/SAPModels', SAPModelsRoutes);

const SaturatedSteamTemperaturesRoutes = require('./SaturatedSteamTemperaturesRoutes');
router.use('/SaturatedSteamTemperatures',jwtAuthMiddleware, SaturatedSteamTemperaturesRoutes);

const SectionChoiceComboInclusionsRoutes = require('./SectionChoiceComboInclusionsRoutes');
router.use('/SectionChoiceComboInclusions', SectionChoiceComboInclusionsRoutes);

const SectionChoiceComboLimitRelationsRoutes = require('./SectionChoiceComboLimitRelationsRoutes');
router.use('/SectionChoiceComboLimitRelations', SectionChoiceComboLimitRelationsRoutes);

const SectionChoiceComboLimitsRoutes = require('./SectionChoiceComboLimitsRoutes');
router.use('/SectionChoiceComboLimits', SectionChoiceComboLimitsRoutes);

const SectionChoiceComboRestrictionsRoutes = require('./SectionChoiceComboRestrictionsRoutes');
router.use('/SectionChoiceComboRestrictions', SectionChoiceComboRestrictionsRoutes);

const SectionChoiceExclusionRelationsRoutes = require('./SectionChoiceExclusionRelationsRoutes');
router.use('/SectionChoiceExclusionRelations', SectionChoiceExclusionRelationsRoutes);

const RestrictedLiftLookupRoutes = require('./RestrictedLiftLookupRoutes');
router.use('/RestrictedLiftLookup', RestrictedLiftLookupRoutes);

const SectionsRoutes = require('./SectionsRoutes');
router.use('/Sections', SectionsRoutes);

const ValvePropertiesRoutes = require('./ValvePropertiesRoutes');
router.use('/ValveProperties', ValvePropertiesRoutes);

const SectionChoiceInclusionRelationsRoutes = require('./SectionChoiceInclusionRelationsRoutes');
router.use('/SectionChoiceInclusionRelations', SectionChoiceInclusionRelationsRoutes);

const SectionChoicesRoutes = require('./SectionChoicesRoutes');
router.use('/SectionChoices', SectionChoicesRoutes);

const SimpleValvesRoutes = require('./SimpleValvesRoutes');
router.use('/SimpleValves', SimpleValvesRoutes);

const SpecialRequirementsRoutes = require('./SpecialRequirementsRoutes');
router.use('/SpecialRequirements', SpecialRequirementsRoutes);

const SteamEnthalpiesRoutes = require('./SteamEnthalpiesRoutes');
router.use('/SteamEnthalpies', SteamEnthalpiesRoutes);

const SuperheatCorrectionFactorsRoutes = require('./SuperheatCorrectionFactorsRoutes');
router.use('/SuperheatCorrectionFactors', SuperheatCorrectionFactorsRoutes);

const ValveLimitsRoutes = require('./ValveLimitsRoutes');
router.use('/ValveLimits', ValveLimitsRoutes);

const ValvesRoutes = require('./ValvesRoutes');
router.use('/Valves', ValvesRoutes);

const AsmePressureRatingsRoutes = require('./AsmePressureRatingsRoutes');
router.use('/AsmePressureRatings', AsmePressureRatingsRoutes);

const BrandsRoutes = require('./BrandsRoutes');
router.use('/Brands', BrandsRoutes);

const CatalogReferenceRoutes = require('./CatalogReferenceRoutes');
router.use('/CatalogReference', CatalogReferenceRoutes);

const CatalogsRoutes = require('./CatalogsRoutes');
router.use('/Catalogs', CatalogsRoutes);

const ComboCatalogStringLookupRoutes = require('./ComboCatalogStringLookupRoutes');
router.use('/ComboCatalogStringLookup', ComboCatalogStringLookupRoutes);

const ComplexValvesRoutes = require('./ComplexValvesRoutes');
router.use('/ComplexValves', ComplexValvesRoutes);

const ConfigurationModelsRoutes = require('./ConfigurationModelsRoutes');
router.use('/ConfigurationModels', ConfigurationModelsRoutes);

const DatabasePropertiesRoutes = require('./DatabasePropertiesRoutes');
router.use('/DatabaseProperties',jwtAuthMiddleware, DatabasePropertiesRoutes);

const ConfigurationSectionsRoutes = require('./ConfigurationSectionsRoutes');
router.use('/ConfigurationSections', ConfigurationSectionsRoutes);

const ConfigValveLimitsRoutes = require('./ConfigValveLimitsRoutes');
router.use('/ConfigValveLimits', ConfigValveLimitsRoutes);

const EstablishedSectionChoiceExpressionRelationsRoutes = require('./EstablishedSectionChoiceExpressionRelationsRoutes');
router.use('/EstablishedSectionChoiceExpressionRelations', EstablishedSectionChoiceExpressionRelationsRoutes);

const EstablishedSectionChoiceExpressionsRoutes = require('./EstablishedSectionChoiceExpressionsRoutes');
router.use('/EstablishedSectionChoiceExpressions', EstablishedSectionChoiceExpressionsRoutes);

const ExceptionsandInclusionsRoutes = require('./ExceptionsandInclusionsRoutes');
router.use('/ExceptionsandInclusions', ExceptionsandInclusionsRoutes);

const GasFluidsRoutes = require('./GasFluidsRoutes');
router.use('/GasFluids',jwtAuthMiddleware, GasFluidsRoutes);

const ISO4126AppAARoutes = require('./ISO4126AppAARoutes');
router.use('/ISO4126AppAA',jwtAuthMiddleware, ISO4126AppAARoutes);

const LiquidFluidsRoutes = require('./LiquidFluidsRoutes');
router.use('/LiquidFluids',jwtAuthMiddleware, LiquidFluidsRoutes);

const MappingSAPModelSpecialRequirementsRoutes = require('./MappingSAPModelSpecialRequirementsRoutes');
router.use('/MappingSAPModelSpecialRequirements', MappingSAPModelSpecialRequirementsRoutes);

const MappingSAPPRVModelsRoutes = require('./MappingSAPPRVModelsRoutes');
router.use('/MappingSAPPRVModels', MappingSAPPRVModelsRoutes);

const MaterialGroupsRoutes = require('./MaterialGroupsRoutes');
router.use('/MaterialGroups', MaterialGroupsRoutes);

const TagDetailsRoutes = require('./TagDetailsRoutes');
router.use('/TagDetails', TagDetailsRoutes);

const UserProjectDetailsRoutes = require('./UserProjectDetailsRoutes');
router.use('/UserProjectDetails', UserProjectDetailsRoutes);

const UserReportHeaderRoutes = require('./UserReportHeaderRoutes');
router.use('/UserReportHeader', UserReportHeaderRoutes);

const Login = require('./LoginRoutes');
router.use('/Login', Login);

const UOM = require('./UOMRoutes');
router.use('/UOM',jwtAuthMiddleware, UOM);

const WorkFlowCalc= require('./WorkflowCalculations');
router.use('/WorkFlowCalc',jwtAuthMiddleware, WorkFlowCalc);

// console.log(' >>>>>>>>>>>.. 0000000000000 >>>>>>>>>>>>')
const genericdata= require('./GenericData');
router.use('/genericdata',jwtAuthMiddleware, genericdata);

const layoutJson= require('./LayoutsRoutes');
router.use('/layoutData',jwtAuthMiddleware, layoutJson);
// console.log(' >>>>>>>>>>>.. 0000000000000 >>>>>>>>>>>>')
const UICalculations= require('./UICalculations');
router.use('/calculations',jwtAuthMiddleware, UICalculations);

const SaveWorkflowRecordRoutes = require('./SaveWorkflowRecordRoutes');
router.use('/save-workflow',jwtAuthMiddleware, SaveWorkflowRecordRoutes);

const RestrictedLiftDataRoutes = require('./RestrictedLiftDataRoutes');
// console.log(' >>>>>>>>>>>>>>>>>>>>>>> 11111111111111111 >>>>>>>>>>>>>>')
router.use('/restrictedLift-data', jwtAuthMiddleware, RestrictedLiftDataRoutes);

const getSizing = require('./getSizingDetails');
router.use('/getSizing', jwtAuthMiddleware, getSizing);

const getSaturationTemperature = require('./GetSaturationTemperature');
router.use('/calculateSaturatedSteam', jwtAuthMiddleware, getSaturationTemperature);

const drawingRoutes = require('./DrawingRoutes');
router.use('/drawing', drawingRoutes);

const reportsRoutes = require('./ReportsRoutes');
router.use('/reports', jwtAuthMiddleware, reportsRoutes);

const SAPSizingRoutes = require('./SAPSizingRoutes');
router.use('/sizing', SAPSizingRoutes);

const TagRevisionsRoutes = require('./TagRevisionsRoutes');
router.use('/TagRevisions', jwtAuthMiddleware, TagRevisionsRoutes);

const modelConfiguration = require('./ModelConfiguration');
router.use('/getConfiguration', modelConfiguration);

const RefreshCache= require('./RefreshCache');
router.use('/refreshcache', RefreshCache);

const Validations = require('./ValidateRoute');
router.use('/validate',jwtAuthMiddleware, Validations);

const ApiAction = require('./ApiActionRoute')
router.use('/fieldapiAction', ApiAction);

// const { isAuthorized } = require('../service/role.service');



router.get('/', function (req, res) {
    res.send(" Welcome to PRV PA GOS API ");
});

// const { getKeyValuesForVariables, getParsedExpressions, Variables, evaluateLimits, modelNumbersMAWP, mapServiceWithPACode, convertUnit, hcflModels, ModelNumbers, UI_PAYLOAD, WorkflowCalculations } = require('../utils/helper');
// const { isNull } = require('mathjs');
// require('../service/calculations/Calculations');
const getGenericValvesRoute = require("./GenericValvesRoute");
router.use("/genericValves",jwtAuthMiddleware, getGenericValvesRoute);

const getResultsRoute = require('./ResultsRoutes');


router.use('/results',jwtAuthMiddleware, getResultsRoute);

// router.get('/role', async (req, res) => {
//     await isAuthorized(req, res);
// });


module.exports = router;
