import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWorkflowsAPI, getSizingDetailsAPI, getMySizingAPI, searchSizingBySizingIdAPI,  getRestrictedLiftPopupDetailsAPI } from "../api/workflows";
// import worflowSectionData from "../../data/workflowSections.json";
import { WF_BACKEND_CONFIGURATION_FLAG, workFlowData, workFlowPopupData, workFlowPopupDisplayFlag } from "../../utils/constants";
import { makeApiCall } from "../api/commonApiCall";
import { updateSelectedFields, updateErrors } from "../../utils/utility"
import { checkCriticalCondition, checkSaturatedSteamTemp,ExecuteFunction } from "../../utils/validation";
import uomData from "../../data/uomData.json";
import { USE_GRAPHQL } from "../api/apiConfig";
import { graphqlClient } from "../../utils/graphqlClient";
import { gql } from "@apollo/client";
import {
  GET_WORKFLOW_DATA_QUERY,
  GET_WORKFLOW_LAYOUT_QUERY,
  GET_POPUP_LAYOUT_QUERY,
  VALIDATE_SIZING_MUTATION,
  CONVERT_UOM_MUTATION,
  REFRESH_TOKEN_MUTATION,
  SAVE_WORKFLOW_CALLPROCS_MUTATION,
  RESTRICTED_LIFT_POPUP_QUERY,
  LIFT_RESTRICTIONS_QUERY,
  RL_CAPACITY_QUERY,
  SAVE_RESTRICTED_LIFT_MUTATION,
} from "../api/graphql/queries";

// Detects GraphQL UNAUTHENTICATED errors (expired/invalid access token).
// The backend formatError sets extensions.http.status:401, which makes Apollo Server
// return HTTP 401. Apollo Client wraps that as a networkError (NOT graphQLErrors),
// so error.message becomes "Response not successful: Received status code 401".
// We must check networkError.statusCode in addition to graphQLErrors / message.
export const isGraphQLAuthError = (error) =>
    // Case 1: GraphQL error in response body with UNAUTHENTICATED code
    error?.graphQLErrors?.some(e =>
        e.extensions?.code === 'UNAUTHENTICATED' ||
        e.message?.toLowerCase().includes('unauthorized')
    ) ||
    // Case 2: HTTP 401 network error (Apollo Server returned non-2xx)
    error?.networkError?.statusCode === 401 ||
    // Case 3: Network error body still has GraphQL errors with UNAUTHENTICATED
    error?.networkError?.result?.errors?.some(e =>
        e.extensions?.code === 'UNAUTHENTICATED' ||
        e.message?.toLowerCase().includes('unauthorized')
    ) ||
    // Case 4: Plain Error thrown from manual gqlResponse.errors check
    error?.message?.includes('UNAUTHENTICATED') ||
    error?.message?.toLowerCase().includes('unauthorized');

// Singleton guard — prevents multiple concurrent GraphQL refresh calls.
// When several thunks fail with 401 at the same time, only the first one
// starts the refresh; all others wait on the same in-flight promise.
// _lastRefreshCompletedAt handles the race where a second catch fires
// AFTER the first refresh already completed (guard already reset).
let _gqlIsRefreshing = false;
let _gqlRefreshPromise = null;
let _lastRefreshCompletedAt = 0;
const GQL_REFRESH_REUSE_WINDOW_MS = 5_000; // 5 seconds

// Calls GraphQL refreshToken mutation and dispatches new accessToken to Redux.
// Concurrent callers reuse the same in-flight promise (one refresh call total).
// Late callers whose 401 arrived after a recent refresh skip the duplicate
// refresh and return null — the caller's executeGQL() retry picks up the
// already-refreshed token from Redux via authLink.
export const refreshTokenViaGraphQL = async (dispatch) => {
    if (_gqlIsRefreshing) {
        // A refresh is already in flight — wait on the same promise
        return _gqlRefreshPromise;
    }

    // If a refresh completed very recently, the new token is already in Redux.
    // Skip a duplicate refresh and let the caller retry with the current token.
    if (Date.now() - _lastRefreshCompletedAt < GQL_REFRESH_REUSE_WINDOW_MS) {
        return null;
    }

    _gqlIsRefreshing = true;
    _gqlRefreshPromise = (async () => {
        try {
            const refreshResult = await graphqlClient.mutate({ mutation: REFRESH_TOKEN_MUTATION });
            const newToken = refreshResult?.data?.refreshToken?.accessToken;
            if (newToken && dispatch) {
                dispatch({ type: 'auth/setAccessToken', payload: newToken });
                _lastRefreshCompletedAt = Date.now();
            }
            return newToken;
        } finally {
            _gqlIsRefreshing = false;
            _gqlRefreshPromise = null;
        }
    })();
    return _gqlRefreshPromise;
};

// Converts GraphQL camelCase DTO → REST PascalCase legacy shape
// so Redux reducers and all downstream consumers (hooks, components) are unaffected
const toWorkflowLegacy = (dto) => ({
    Id: dto.id,
    ValveCategoryId: dto.valveCategoryId,
    ValveCategoryName: dto.valveCategoryName,
    ValveCategoryDescription: dto.valveCategoryDescription,
    ValveCategoryIsActive: dto.valveCategoryIsActive,
    ValveCategoryIcon: dto.valveCategoryIcon,
    ValveCategoryDisplayOrder: dto.valveCategoryDisplayOrder,
    FluidTypeId: dto.fluidTypeId,
    FluidTypeName: dto.fluidTypeName,
    FluidTypeDescription: dto.fluidTypeDescription,
    FluidTypeIsActive: dto.fluidTypeIsActive,
    FluidTypeIcon: dto.fluidTypeIcon,
    FluidTypeDisplayOrder: dto.fluidTypeDisplayOrder,
    SizingMethodologyId: dto.sizingMethodologyId,
    SizingMethodologyName: dto.sizingMethodologyName,
    Code: dto.code,
    SizingMethodologyDescription: dto.sizingMethodologyDescription,
    SizingMethodologyIsActive: dto.sizingMethodologyIsActive,
    SizingMethodologyDisplayOrder: dto.sizingMethodologyDisplayOrder,
    IsGenericReq: dto.isGenericReq,
});

export const fetchWorkflows = createAsyncThunk(
    'workflow/fetchWorkflows',
    async () => {
        if (USE_GRAPHQL) {
            try {
                const gqlResponse = await graphqlClient.query({
                    query: GET_WORKFLOW_DATA_QUERY,
                    fetchPolicy: 'network-only',
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                return (gqlResponse.data.workflowData.data || []).map(toWorkflowLegacy);
            } catch (error) {
                console.error('[GraphQL] fetchWorkflows failed, falling back to REST:', error.message);
            }
        }
        const response = await fetchWorkflowsAPI();
        return response;
    },
    {
        // Prevent duplicate in-flight calls (React 18 StrictMode double-effect, re-renders)
        condition: (_, { getState }) => {
            const { status } = getState().workflow;
            if (status === 'loading') return false;
        }
    }
);

export const saveWorkflowData = createAsyncThunk(
    'generic/saveWorkflowData',
    async (config, { dispatch }) => {
        if (USE_GRAPHQL) {
            const executeGQL = async () => {
                const gqlResponse = await graphqlClient.mutate({
                    mutation: SAVE_WORKFLOW_CALLPROCS_MUTATION,
                    variables: { input: config.data },
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                const { message, sizingData, proceedButtonEnableFlag } = gqlResponse.data.saveWorkflowCallprocs.data;
                // Normalize to REST shape — reducers expect ProceedButtonEnableFlag (PascalCase)
                return { sizingData, ProceedButtonEnableFlag: proceedButtonEnableFlag, message };
            };
            try {
                return await executeGQL();
            } catch (error) {
                if (isGraphQLAuthError(error)) {
                    // Token expired → refresh via GraphQL → retry once with new token
                    await refreshTokenViaGraphQL(dispatch);
                    return await executeGQL();
                }
                throw error;
            }
        }
        // REST mode
        const response = makeApiCall(config.url, config.method, config.data);
        return response;
    }
);

export const fetchWorkflowSections = createAsyncThunk(
    'workflow/fetchWorkflowSections',
    async (params) => {
        
        const workFlowId=params['selectedWorkflow'];
        const userId= params['userId'];
        // const workflowSections = worflowSectionData;
        let workflowSections = workFlowData[workFlowId]
        if(WF_BACKEND_CONFIGURATION_FLAG){
            try {
                if (USE_GRAPHQL) {
                    const gqlResponse = await graphqlClient.query({
                        query: GET_WORKFLOW_LAYOUT_QUERY,
                        variables: { workFlowId: Number(workFlowId) },
                        fetchPolicy: 'network-only',
                    });
                    if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                    workflowSections = gqlResponse.data.workflowLayout.data;
                } else {
                    const URL=`/layoutData/workflow`;
                    workflowSections =  await makeApiCall(URL, 'GET', {workFlowId,userId});
                    if(workflowSections?.status==='Success'){
                        workflowSections = workflowSections?.data;
                    }
                }
                // console.log('Workflow Section: >>>>>>>>> 33333333', workflowSections);
            } catch (error) {
                if(workflowSections===undefined || workflowSections===null){
                    workflowSections = [];
                } 
            }
            
        }else{
           
            if(workflowSections===undefined || workflowSections===null){
                workflowSections = [];
            }   
        }
        return workflowSections;
    }
);


export const fetchWorkFlowPopupData = createAsyncThunk(
    'workflow/fetchWorkFlowPopupData',
    async (params) => {
        
        const workflowId=params['selectedWorkflow'];
        const userId= params['userId'];
        if(workFlowPopupDisplayFlag[workflowId]===true){
            let workflowPopup = workFlowPopupData[workflowId]
            // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>  ',params,workflowPopup);
            if(WF_BACKEND_CONFIGURATION_FLAG){
                try {
                    if (USE_GRAPHQL) {
                        const gqlResponse = await graphqlClient.query({
                            query: GET_POPUP_LAYOUT_QUERY,
                            variables: { workflowId: Number(workflowId) },
                            fetchPolicy: 'network-only',
                        });
                        if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                        workflowPopup = gqlResponse.data.popupLayout.data;
                    } else {
                        const URL=`/layoutData/popup`;
                        workflowPopup =  await makeApiCall(URL, 'GET', {workflowId,userId});
                        if(workflowPopup?.status==='Success'){
                            workflowPopup = workflowPopup?.data;
                        }
                    }
                } catch (error) {
                    if(workflowPopup===undefined || workflowPopup===null){
                        workflowPopup = [];
                    } 
                }
                
            }else{
            
                if(workflowPopup===undefined || workflowPopup===null){
                    workflowPopup = [];
                }   
            }
            return {...params,workflowId,workflowPopup};
        }
    }
);

export const fieldValidationAPI = createAsyncThunk(
    'workflow/fieldValidationAPI',
    async (config, { dispatch }) => {
        if (USE_GRAPHQL && config.url === '/validate') {
            // When VITE_API_GATEWAY_ENABLED=true: always use GraphQL, never fall back to REST
            const executeGQLValidate = async () => {
                const gqlResponse = await graphqlClient.mutate({
                    mutation: VALIDATE_SIZING_MUTATION,
                    variables: { input: config.data },
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                return { results: gqlResponse.data.validateSizing.data };
            };
            try {
                const response = await executeGQLValidate();
                return { response, config };
            } catch (error) {
                if (isGraphQLAuthError(error)) {
                    // Token expired → refresh via GraphQL → retry GraphQL (not REST)
                    await refreshTokenViaGraphQL(dispatch);
                    const response = await executeGQLValidate();
                    return { response, config };
                }
                throw error; // Non-auth error → propagate to rejected case
            }
        }
        // REST mode (USE_GRAPHQL=false) — Axios interceptor handles token refresh + retry automatically
        const response = await makeApiCall(config.url, config.method, config.data);
        return {response, config};
    }
);

export const fieldConvertUomAPI = createAsyncThunk(
    'workflow/fieldConvertUomAPI',
    async (config, { dispatch }) => {
        if (USE_GRAPHQL && config.url === '/UOM/conversion') {
            // When VITE_API_GATEWAY_ENABLED=true: always use GraphQL, never fall back to REST
            const executeGQLConvert = async () => {
                const gqlResponse = await graphqlClient.mutate({
                    mutation: CONVERT_UOM_MUTATION,
                    variables: { input: config.data },
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                return gqlResponse.data.convertUom.data;
            };
            try {
                const response = await executeGQLConvert();
                return { response, config };
            } catch (error) {
                if (isGraphQLAuthError(error)) {
                    // Token expired → refresh via GraphQL → retry GraphQL (not REST)
                    await refreshTokenViaGraphQL(dispatch);
                    const response = await executeGQLConvert();
                    return { response, config };
                }
                throw error;
            }
        }
        // REST mode (USE_GRAPHQL=false) — Axios interceptor handles token refresh + retry automatically
        const response = await makeApiCall(config.url, config.method, config.data);
        return {response,config};
    }
);

export const displayUnitConvertUomAPI = createAsyncThunk(
    'workflow/displayUnitConvertUomAPI',
    async (config) => {
        // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> ',config)
        const response = await makeApiCall(config.url, config.method, config.data);
        // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> ',config.data,response)
        return {response,config};
    }
);

export const fieldCalculationAPI = createAsyncThunk(
    'workflow/fieldCalculationAPI',
    async (config) => {
        // console.log('In field CalculationAPI>>>>>>>>>> ',config)
        const response = await makeApiCall(config.url, config.method, config.data);
        // console.log('In useTabPanel:::In field CalculationAPI :: Response >>>>>>>>>> ',config.data,response)
        return {response,config};
    }
);

export const fieldCalculation_ExecFunction = createAsyncThunk(
    'workflow/fieldCalculation_ExecFunction',
    async (config) => {
        // console.log('In field field Calculation_ExecFunction>>>>>>>>>> ',config)
        // const response = await makeApiCall(config.url, config.method, config.data);
        const response= await ExecuteFunction(config?.functionName,config);
        // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000:: fieldCalculation_ExecFunction :: Response >>>>>>>>>> ',response)
        return response;
    }
);

export const fieldCalculation_ExecAPI = createAsyncThunk(
    'workflow/fieldCalculation_ExecAPI',
    async (config, { dispatch }) => {
        // GraphQL path: field JSON has 'query' instead of 'api' —
        // triggered when the backend served the GQL JSON variant.
        // Routing rule: api present → REST call; query present → GraphQL call.
        if (USE_GRAPHQL && config.query) {
            // Strip hook-injected keys not part of any GQL input type,
            // convert PascalCase → camelCase, and coerce numeric strings to Number.
            const STRIP_KEYS = new Set(['apiCallingField', 'userId', 'selectedUnits']);
            const buildGqlInput = (data) => {
                const result = {};
                Object.entries(data || {}).forEach(([k, v]) => {
                    if (STRIP_KEYS.has(k)) return;
                    // All-uppercase keys (e.g. IFR) must become fully lowercase (ifr),
                    // not just first-char lowercase (iFR), so toLegacyLiftRestrictionInput
                    // can match them via input?.ifr.
                    const camelKey = (k === k.toUpperCase() && k.length > 1)
                        ? k.toLowerCase()
                        : k.charAt(0).toLowerCase() + k.slice(1);
                    // Coerce non-empty numeric strings to Number (covers Int and Float fields)
                    result[camelKey] = (typeof v === 'string' && v !== '' && !isNaN(v))
                        ? Number(v)
                        : v;
                });
                return result;
            };
            // Normalize GQL response keys to PascalCase to match what the hooks
            // expect (apiResponseParams use PascalCase e.g. RestrictedLiftCapacity).
            const toPascal = (obj) => {
                if (!obj || typeof obj !== 'object') return obj;
                return Object.fromEntries(
                    Object.entries(obj).map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), v])
                );
            };
            const executeGQL = async () => {
                const gqlResponse = await graphqlClient.query({
                    query: gql`${config.query}`,
                    variables: { input: buildGqlInput(config.data) },
                    fetchPolicy: 'network-only',
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                // Extract the first operation data
                const operationKey = Object.keys(gqlResponse.data)[0];
                const resultData = gqlResponse.data[operationKey]?.data ?? {};
                return toPascal(resultData);
            };
            try {
                return await executeGQL();
            } catch (error) {
                if (isGraphQLAuthError(error)) {
                    // Token expired -> refresh -> retry once with new token
                    await refreshTokenViaGraphQL(dispatch);
                    return await executeGQL();
                }
                throw error;
            }
        }
        // REST mode
        const response = await makeApiCall(config.url, config.method, config.data);
        if(response?.status==='Success'){
            return response?.data;
        }
        return response;
    }
);

export const fetchSizingDetails = createAsyncThunk(
    'workflow/getSizingDetailsbyID',
    async (id) => {
        // console.log('In fetchSizingDetails>>>>>>>>>> ',id)
        const response = await getSizingDetailsAPI(id);
        // console.log('In getSizingDetailsAPI :: Response >>>>>>>>>> ',response)
        return response;
    }
);

export const searchSizingBySizingId = createAsyncThunk(
    'workflow/searchSizingBySizingId',
    async (sizingId) => {
        // console.log('In fetchSizingDetails>>>>>>>>>> ',sizingId)
        const response = await searchSizingBySizingIdAPI(sizingId);
        console.log('In search SizingBySizingId :: Response >>>>>>>>>> ',response)
        return response;
               
    }
);

export const fetchMySizingData = createAsyncThunk(
    'workflow/getMySizingData',
    async (userId) => {
        const response = await getMySizingAPI(userId);
        return response;
    }
);

export const fetchRestrictedLiftPopupDetails = createAsyncThunk(
    'workflow/getRestrictedLiftPopupDetails',
    async (popupDetails, { dispatch }) => {
        if (USE_GRAPHQL) {
            // GraphQL mode: backend sends typed queryVariables — use directly,
            // no URL parsing needed. Map PascalCase keys → camelCase GQL schema.
            // Safe parsers: || null fails for 0-valued fields (e.g. IFR=0),
            // so we use isNaN guards instead.
            const toFloat = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
            const toInt   = (v) => { const n = parseInt(v);   return isNaN(n) ? null : n; };
            const qv = popupDetails?.queryVariables ?? {};
            const input = {
                sizingId:            qv.SizingId ? String(qv.SizingId) : null,
                modelNumber:         qv.ModelNumber         || null,
                orifice:             qv.Orifice             || null,
                requiredCapacity:    toFloat(qv.RequiredCapacity),
                ratedFlowCapacity:   toFloat(qv.RatedFlowCapacity),
                service:             qv.Service             || null,
                doNotExceedCapacity: toFloat(qv.DoNotExceedCapacity),
                ifr:                 toInt(qv.IFR),   // IFR=0 is valid — must not collapse to null
            };
            const executeGQL = async () => {
                const gqlResponse = await graphqlClient.query({
                    query: RESTRICTED_LIFT_POPUP_QUERY,
                    variables: { input },
                    fetchPolicy: 'network-only',
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                // Return shape { success, code, data: { fields: [...] } } — reducer reads .data
                return gqlResponse.data.restrictedLiftPopup;
            };
            try {
                return await executeGQL();
            } catch (error) {
                if (isGraphQLAuthError(error)) {
                    // Token expired → refresh via GraphQL → retry once
                    await refreshTokenViaGraphQL(dispatch);
                    return await executeGQL();
                }
                throw error;
            }
        }
        // REST mode: backend sends PopupContentUrl — extract it and call REST helper.
        // Also handles legacy callers that pass a raw URL string directly.
        const url = popupDetails?.PopupContentUrl ?? popupDetails;
        const response = await getRestrictedLiftPopupDetailsAPI(url);
        return response;
    }
);

export const saveRestrictedLiftPopupDetails = createAsyncThunk(
    'workflow/saveRestrictedLiftPopupDetails',
    async (config, { dispatch }) => {
        if (USE_GRAPHQL) {
            const d = config.data;
            // Transform PascalCase REST body → camelCase RestrictedLiftSaveInput
            // Strip userId and SizingId — not part of the GQL input type
            const input = {
                id:                     Number(d.Id),
                modelNumber:            d.ModelNumber             || null,
                orifice:                d.Orifice                 || null,
                restrictedLift:         d.RestrictedLift          || null,
                requiredFlow:           parseFloat(d.RequiredFlow)          || null,
                ratedFlowCapacity:      parseFloat(d.RatedFlowCapacity)     || null,
                flowCapacityUOM:        d.FlowCapacityUOM         || null,
                ifr:                    parseInt(d.IFR)            || 0,
                doNotExceedCapacity:    parseFloat(d.DoNotExceedCapacity)   || null,
                liftRestriction:        parseFloat(d.LiftRestriction)       || null,
                restrictedLiftCapacity: parseFloat(d.RestrictedLiftCapacity) || null,
            };
            const executeGQL = async () => {
                const gqlResponse = await graphqlClient.mutate({
                    mutation: SAVE_RESTRICTED_LIFT_MUTATION,
                    variables: { input },
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                return gqlResponse.data.saveRestrictedLiftData;
            };
            try {
                return await executeGQL();
            } catch (error) {
                if (isGraphQLAuthError(error)) {
                    // Token expired → refresh via GraphQL → retry once
                    await refreshTokenViaGraphQL(dispatch);
                    return await executeGQL();
                }
                throw error;
            }
        }
        // REST mode
        const response = await makeApiCall(config.url, config.method, config.data);
        return response;
    }
)

export const getRestrictedLiftModelDetails = createAsyncThunk(
    'workflow/getRestrictedLiftModelDetails',
    async (config, { dispatch }) => {
        if (USE_GRAPHQL) {
            const url = config.url ?? '';
            const d = config.data ?? {};

            const executeGQL = async () => {
                if (url.includes('getLiftRestrictions')) {
                    // config.data contains query params for LiftRestrictionInput
                    // Supports both camelCase and PascalCase key variants from callers
                    const input = {
                        modelNumber:         d.modelNumber         || d.ModelNumber         || null,
                        orifice:             d.orifice             || d.Orifice             || null,
                        requiredCapacity:    parseFloat(d.requiredCapacity    ?? d.RequiredCapacity)    || null,
                        ratedFlowCapacity:   parseFloat(d.ratedFlowCapacity   ?? d.RatedFlowCapacity)   || null,
                        doNotExceedCapacity: parseFloat(d.doNotExceedCapacity ?? d.DoNotExceedCapacity) || null,
                        ifr:                 parseInt(d.ifr ?? d.IFR)                                    || null,
                    };
                    const gqlResponse = await graphqlClient.query({
                        query: LIFT_RESTRICTIONS_QUERY,
                        variables: { input },
                        fetchPolicy: 'network-only',
                    });
                    if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                    return gqlResponse.data.liftRestrictions;

                } else if (url.includes('RLCapacity')) {
                    // config.data contains query params for RlCapacityInput
                    const input = {
                        liftRestriction:   parseFloat(d.liftRestriction   ?? d.LiftRestriction)   || null,
                        ratedFlowCapacity: parseFloat(d.ratedFlowCapacity  ?? d.RatedFlowCapacity) || null,
                    };
                    const gqlResponse = await graphqlClient.query({
                        query: RL_CAPACITY_QUERY,
                        variables: { input },
                        fetchPolicy: 'network-only',
                    });
                    if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                    return gqlResponse.data.rlCapacity;
                }
                // Unrecognised URL in GQL mode — return null to fall through to REST
                return null;
            };

            try {
                const result = await executeGQL();
                if (result !== null) return result;
            } catch (error) {
                if (isGraphQLAuthError(error)) {
                    // Token expired → refresh via GraphQL → retry once
                    await refreshTokenViaGraphQL(dispatch);
                    return await executeGQL();
                }
                throw error;
            }
        }
        // REST mode
        const response = await makeApiCall(config.url, config.method, config.data);
        return response;
    }
);

const workflowSlice = createSlice({
    name: "workflow",
    initialState: {
        workflows: [],
        workflowSections: [],
        sections: [{
            id: 1,
            name: "Valve Category",
            selectedValues: []
        },
        {
            id: 2,
            name: "Fluid Types",
            selectedValues: []
        },
        {
            id: 3,
            name: "Sizing Methodology",
            selectedValues: []
        }],
        selectedWorkflow: null,
        valveCategories: {},
        selectedValveCategory: null,
        fluidTypes: [],
        selectedFluidType: null,
        sizingMethodologies: [],
        selectedFields: [],
        selectedSizingMethodology: null,
        selectedSizingCode: null,
        payloadData: null,
        mySizingData: [],
        status: 'idle',
        worldMapModal: false,
        searchSizingModal: false,
        resetSizingModal: {status:false,type:"CLEAR",message:"Are you sure you want to clear the sizing details?",title:"Clear Sizing Details"},
        sizingDetails: null,
        SizingIdError: false,
        previousWorkflow: null,
        setPayloadFlag: false,
        error: null,
        infoError: null,
        fieldChangeFlag: true,
        searchFlag:false,
        callResultAPI:false,
        isWorkflowChange:false,
        workflowPopup: [],
        EnterTankData:false,
        proceed93XXModal: false,
        proceedOmni900Modal: false,
        proceedModal: false,
        RLProceedModal: false,
        proceedModalMessage: [{
            title: "PRV²Size",
            content:[]
        }],
        wfDataLoaded: false,
        apiLoadingSpinner: false,
        fieldValidationResults:null,
        stateUpdateFlag:false,
        uomConvertedValues:{},
        RLPopupDetails:null,
        RLPopupData:{},
        popupCounter:0
    },
    reducers: {
        setRLProceedModal:(state,action)=>{
            state.RLProceedModal=action.payload;
        },
        setRLPopupData:(state,action)=>{
            state.RLPopupData=action.payload;
        },
        setUOMConvertedValues:(state,action)=>{
            state.uomConvertedValues=action.payload;
        },
        setStateUpdateFlag:(state,action)=>{
            state.stateUpdateFlag=action.payload;
        },
        setFieldValidationResults:(state,action)=>{
            state.fieldValidationResults=action.payload;
        },
        setApiLoadingSpinner: (state,action) => {
            state.apiLoadingSpinner = action.payload;
        },
        setWorkflowDataLoaded: (state,action) => {
            state.wfDataLoaded = action.payload;
        },
        onClearSizingData:(state)=>{
            state.selectedValveCategory = null;
            state.selectedFluidType = null;
            state.selectedWorkflow = null;
            state.selectedFields = [];
            state.selectedSizingMethodology = null;
            state.workflowSections=[],
            state.workflowPopup=[]
        },
        onSelectValveCategory: (state, action) => {
            if(state.selectedValveCategory===null || state.selectedValveCategory?.id !== action.payload){
                // console.log('>>>>>>>>>>>>>>>>>>>>>00000000000000000000000 >>>>>>>>>>>>>>>>>> ',state.valveCategories.items.find(vc => vc.id === action.payload))
                state.selectedValveCategory = state.valveCategories.items.find(vc => vc.id === action.payload);
                // console.log('>>>>>>>>>>>>>>>>>>>>>11111111111111111111111111111 >>>>>>>>>>>>>>>>>> ')
                state.selectedFluidType = {};
                state.selectedSizingMethodology = {};
                // console.log('>>>>>>>>>>>>>>>>>>>>>222222222222222222222222222 >>>>>>>>>>>>>>>>>> ')
                state.fluidTypes = {
                    items: state.workflows.reduce((acc, item) => {
                        // console.log('>>>>>>>>>>>>>>>>>>>>>333333333333333333 >>>>>>>>>>>>>>>>>> ')
                        if (item.ValveCategoryId === action.payload && item.FluidTypeIsActive && !acc.some(vc => vc.id === item.FluidTypeId)) {
                            return [...acc, {
                                id: item.FluidTypeId,
                                name: item.FluidTypeName,
                                imageUrl: item.FluidTypeIcon,
                                description: item.FluidTypeDescription,
                                order: item.FluidTypeDisplayOrder
                            }];
                        }
                        // console.log('>>>>>>>>>>>>>>>>>>>>>444444444444444444 >>>>>>>>>>>>>>>>>> ')
                        return acc;
                    }, []).sort((a, b) => a.order - b.order),
                    displayType: 'tile',
                    heading: "Fluid Type"
                }
            }
        },
        onSelectFluidType: (state, action) => {
            if(state.selectedFluidType===null || state.selectedFluidType?.id !== action.payload){
                state.selectedFluidType = state.fluidTypes.items.find(ft => ft.id === action.payload);
                state.selectedSizingMethodology = {};
                state.sizingMethodologies = {
                    items: state.workflows.reduce((acc, item) => {
                        if (item.FluidTypeId === action.payload && item.SizingMethodologyIsActive && !acc.some(vc => vc.id === item.SizingMethodologyId)) {
                            return [...acc, {
                                id: item.SizingMethodologyId,
                                name: item.SizingMethodologyName,
                                Code: item.Code,
                                imageUrl: item.SizingMethodologyIcon,
                                description: item.SizingMethodologyDescription,
                                order: item.SizingMethodologyDisplayOrder
                            }];
                        }
                        return acc;
                    }, []).sort((a, b) => a.order - b.order),
                    displayType: 'tile',
                    heading: "Sizing Methodology"
                }
            }
        },
        onSelectSizingMethodology: (state, action) => {
            state.selectedSizingMethodology = state.sizingMethodologies.items.find(sm => sm.id === action.payload);
            state.previousWorkflow = state.selectedWorkflow;
            state.selectedWorkflow = state.workflows.find(w => w.SizingMethodologyId === action.payload).Id;
            // console.log('action.payload onSelectSizingMethodology >>>> ', state.workflows,action.payload,state.selectedWorkflow)
            //compare selected workflow and previous workflow update selectedFields with retained valuse and reset others
            state.selectedFields = updateSelectedFields(state.selectedWorkflow, state.previousWorkflow, state.selectedFields)
            // console.log(' In onSelectSizingMethodology:::selectedFields:: In :: WorkflowSlice >>>> ',state.error)
            // state.error = updateErrors(state.selectedWorkflow, state.previousWorkflow, state.error)
            state.setPayloadFlag = true
        },
        resetSelectedFields: (state) => {
            state.selectedFields = [];
        },
        setFieldChangeFlag: (state, action) => {
            state.fieldChangeFlag = action.payload;
        },
        onUpdateFields: (state, action) => {
            let newSelectedFields =[...state.selectedFields]
            if(action.payload?.mirrorId!==undefined && action.payload?.mirrorId!==null && action.payload?.mirrorId!==''){
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>> onUpdateFields::: WorkflowSlice >>>> ', action.payload);
                newSelectedFields = newSelectedFields.filter(item => item.name !== action.payload?.mirrorId);
                newSelectedFields.push({name:action.payload?.mirrorId,value:action.payload?.value});
            }
            // const field=state.selectedFields.find(item => item.name === action.payload.name);
            // console.log('Popup Change 11111 >>>>>>>>>>> In use PopupPanel:::selectedFields:: In :: update ValueInStore 111111>>>>>>>> ',action.payload)
            newSelectedFields = newSelectedFields.filter(item => item.name !== action.payload.name);
            newSelectedFields.push(action.payload);
            
            state.fieldChangeFlag = true;
            state.selectedFields = newSelectedFields;
            // state.stateUpdateFlag=true;
        },
        onUpdateMultipleFields: (state, action) => {
            let selectedData = [...state.selectedFields]
            let resdata = action.payload;
            if (resdata && resdata !== null) {
                Object.keys(resdata).forEach(item => {
                    // console.log('In Search Sizing >>>>>>>>>>> ',resdata['WorkFlowId'],item,resdata[item])
                    if(resdata['WorkFlowId']===12 && item==='IsHorizontalOrientation'){
                        const fieldValue=resdata[item]?'IsHorizontalOrientation':'Vertical'
                        selectedData.push({ name: item, value: resdata[item] !== null ? resdata[item] : '' });
                        selectedData.push({ name: 'horizontalvertical', value: resdata[item] !== null ? fieldValue : 'IsHorizontalOrientation' });
                    }else if(resdata['WorkFlowId']===12 && item==='Ends'){
                        selectedData.push({ name: item, value: resdata[item] !== null ? resdata[item] : '' });
                        selectedData.push({ name: 'EndsGroup', value: resdata[item] !== null ? resdata[item] : 'FlatEnds' });
                        if(resdata[item]==='FlatEnds'){
                            selectedData.push({ name: resdata[item], value: resdata[item]==='FlatEnds'?true:false });
                        }else if(resdata[item]==='EllipticalEnds'){
                            selectedData.push({ name: resdata[item], value: resdata[item]==='EllipticalEnds'?true:false });
                        }else if(resdata[item]==='HemisphericalEnds'){
                            selectedData.push({ name: resdata[item], value: resdata[item]==='HemisphericalEnds'?true:false });
                        }
                    }else if( item==='Diameter_d_UOM'){
                        selectedData.push({ name: item, value: resdata[item] !== null ? resdata[item] : '' });
                        selectedData.push({ name: 'LengthUOM', value: resdata[item] !== null ? resdata[item] : '' });
                    }else{
                        selectedData.push({ name: item, value: resdata[item] !== null ? resdata[item] : '' });
                    }
                    
                });
                // console.log('In WorkflowSlice >>>>>>>>>> ',selectedData);
                state.selectedFields = [...selectedData];
            }
            state.fieldChangeFlag = true;
        },
        onUpdateListOfFields: (state, action) => {
            // let selectedData = [...state.selectedFields]
            let resdata = action.payload;

            state.selectedFields = [...resdata.selectedFields];
            state.fieldChangeFlag = true;
        },
        onUpdateError: (state, action) => {
            // console.log('In onUpdateError store >>>>>>>>>>>>>>> ', action.payload)
            state.error = action.payload;
        },
        onUpdateInfoError: (state, action) => {
            // console.log('In onUpdateInfoError store >>>>>>>>>>>>>>> ', action.payload)
            state.infoError = action.payload;
        },
        onUpdateWorldMapModal: (state, action) => {
            state.worldMapModal = action.payload;
        },
        onUpdateSearchSizingModal: (state, action) => {
            state.searchSizingModal = action.payload;
        },
        onUpdateProceed93XXModal: (state, action) => {
            state.proceed93XXModal = action.payload;
        },
        onUpdateProceedOmni900Modal: (state, action) => {
            state.proceedOmni900Modal = action.payload;
        },
        onUpdateProceedModal: (state, action) => {
            state.proceedModal = action.payload;
        },
         onUpdatePopupCounter: (state, action) => {
            state.popupCounter = action.payload;
        },
        onUpdateProceedModalMessage: (state, action) => {
            state.proceedModalMessage = action.payload;
        },
        onUpdateResetSizingModal: (state, action) => {
            state.resetSizingModal = action.payload;
        },
        
        onUpdateSetPayloadFlag: (state, action) => {
            state.setPayloadFlag = action.payload;
        },
        onUpdateSearchFlag:(state, action)=>{
            state.searchFlag = action.payload; 
        },
        onUpdateCallResultAPI:(state, action)=>{
            state.callResultAPI = action.payload; 
        },
        updateIsWorkflowChange:(state, action)=>{
            state.isWorkflowChange = action.payload;
        },
        setEnterTankData:(state, action)=>{
            state.EnterTankData = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkflows.fulfilled, (state, action) => {
                state.workflows = action.payload;
                state.valveCategories = {
                    items: action.payload.reduce((acc, item) => {
                        if (item.ValveCategoryIsActive && !acc.some(vc => vc.id === item.ValveCategoryId)) {
                            return [...acc, {
                                id: item.ValveCategoryId,
                                name: item.ValveCategoryName,
                                imageUrl: item.ValveCategoryIcon,
                                description: item.ValveCategoryDescription,
                                order: item.ValveCategoryDisplayOrder
                            }];
                        }
                        return acc;
                    }, []).sort((a, b) => a.order - b.order),
                    displayType: 'tile',
                    heading: "Valve Category"
                };
                state.status = 'success';
            })
            .addCase(fetchWorkflows.pending, (state) => {
                // Do NOT reset workflows — preserve stale data during refetch
                state.status = 'loading';
            })
            .addCase(fetchWorkflows.rejected, (state, action) => {
                state.workflows = [];
                state.error = action.error.message;
                state.status = 'failed';
            })
            .addCase(fetchWorkflowSections.fulfilled, (state, action) => {
                state.workflowSections = action.payload;
                // console.log('Popup Change 11111  >>>>>>>> ',action.payload)
                state.isWorkflowChange = true;
                // state.error = null
                state.status = 'success';
                state.wfDataLoaded = false;
            })
            .addCase(fetchWorkflowSections.pending, (state) => {
                state.workflowSections = [];
                state.status = 'loading';
                state.wfDataLoaded = true;
            })
            .addCase(fetchWorkflowSections.rejected, (state, action) => {
                state.workflowSections = [];
                state.status = 'failed';
                state.error = action.error.message;
                state.wfDataLoaded = false;
            })
            .addCase(getRestrictedLiftModelDetails.fulfilled, (state, action) => {
                // state.RLPopupDetails = action.payload?.data;
                // const RLPopupDetails = action.payload?.data;
                // let newSelectedFields=[...state.selectedFields];
                // const dataKeys=Object.keys(RLPopupDetails);
                // dataKeys?.forEach((key) => {
                //     // console.log('Workflow >>>>>>> ',item?.fieldName,item?.defaultValue);
                //     newSelectedFields.push({name:key,value:RLPopupDetails[key]});
                // });
                // const popupFields=RLPopupDetails?.fields;
                // popupFields?.forEach((item) => {
                //     // console.log('Workflow >>>>>>> ',item?.fieldName,item?.defaultValue);
                //     newSelectedFields.push({name:item?.fieldName,value:item?.defaultValue});
                // });
                state.status = 'success';
                state.apiLoadingSpinner = false;
            })
            .addCase(getRestrictedLiftModelDetails.pending, (state) => {
                state.RLPopupDetails = null;
                state.apiLoadingSpinner = true;
                state.status = 'loading';
            })
            .addCase(getRestrictedLiftModelDetails.rejected, (state, action) => {
                state.RLPopupDetails = null;
                state.status = 'failed';
                state.apiLoadingSpinner = false;
                state.error = action.error.message;
            })
            .addCase(saveRestrictedLiftPopupDetails.fulfilled, (state, action) => {
                // state.RLPopupDetails = action.payload?.data;
                // const RLPopupDetails = action.payload?.data;
                // let newSelectedFields=[...state.selectedFields];
                // const popupFields=RLPopupDetails?.fields;
                // popupFields?.forEach((item) => {
                //     // console.log('Workflow >>>>>>> ',item?.fieldName,item?.defaultValue);
                //     newSelectedFields.push({name:item?.fieldName,value:item?.defaultValue});
                // });
                state.status = 'success';
                state.apiLoadingSpinner = false;
            })
            .addCase(saveRestrictedLiftPopupDetails.pending, (state) => {
                state.RLPopupDetails = null;
                state.apiLoadingSpinner = true;
                state.status = 'loading';
            })
            .addCase(saveRestrictedLiftPopupDetails.rejected, (state, action) => {
                state.RLPopupDetails = null;
                state.status = 'failed';
                state.apiLoadingSpinner = false;
                state.error = action.error.message;
            })
            .addCase(fetchRestrictedLiftPopupDetails.fulfilled, (state, action) => {
                // console.log(action.payload)
                state.RLPopupDetails = action.payload?.data;
                const RLPopupDetails = action.payload?.data;
                let newSelectedFields=[...state.selectedFields];
                const popupFields=RLPopupDetails?.fields;
                popupFields?.forEach((item) => {
                    newSelectedFields=newSelectedFields.filter(it => it.name !== item?.fieldName);
                    newSelectedFields.push({name:item?.fieldName,value:item?.defaultValue});
                    // console.log('Workflow >>>>>>> ',item?.fieldName,item?.defaultValue,item?.LROptions);
                    if(item?.fieldName==='LiftRestriction'){
                        newSelectedFields=newSelectedFields.filter(it => it.name !== 'LROptions');
                        newSelectedFields.push({name:'LROptions',value:item?.LROptions?[...item?.LROptions]:[]});
                    }
                });
                state.selectedFields = [...newSelectedFields];
                state.status = 'success';
                state.apiLoadingSpinner = false;
            })
            .addCase(fetchRestrictedLiftPopupDetails.pending, (state) => {
                state.RLPopupDetails = null;
                state.apiLoadingSpinner = true;
                state.status = 'loading';
            })
            .addCase(fetchRestrictedLiftPopupDetails.rejected, (state, action) => {
                state.RLPopupDetails = null;
                state.status = 'failed';
                state.apiLoadingSpinner = false;
                state.error = action.error.message;
            })
            .addCase(fetchWorkFlowPopupData.fulfilled, (state, action) => {
                
                const popupDataFlag=action.payload===undefined?false:true;
                
                state.workflowPopup = popupDataFlag?action.payload?.workflowPopup:null;
                const {workflowId,searchFlag}=action.payload!==undefined?action.payload:{workflowId:null,searchFlag:false};
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 11111 >>>> ',workflowId,searchFlag,popupDataFlag);
                const localEnterTankData=workflowId===12?popupDataFlag:false
                if(popupDataFlag){
                    // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 222222 >>>> ',searchFlag,localEnterTankData);
                    let newSelectedFields=[...state.selectedFields];
                    if(!searchFlag){
                        newSelectedFields = state.selectedFields.filter(it => it.name !== 'EnterTankData');
                        newSelectedFields.push({name:'EnterTankData',value:localEnterTankData});
                        const popupFields=action.payload?.workflowPopup?.fields;
                   
                        // let VacuumChangedFlag=localPayloadData['IsVacuumOnly']===true && localPayloadData['API2000WreqVChanged']===true ?false:true;
                        // let PressureChangedFlag=localPayloadData['IsPressuremOnly']===true && localPayloadData['API2000WreqChanged']===true ?false:true;

                        popupFields?.forEach((item) => {
                            let defaultValue = '';
                            
                                if(item.fieldName==='Relieving' || item.fieldName==='Operating' || item.fieldName==='SystemMAWP' || item.fieldName==='OperatingPressure'){
                                    
                                }else{
                                    defaultValue =  item.type==='radio'?item?.fieldList!==undefined?item?.fieldList[0]?.fieldName:item?.defaultValue:item.type==='checkbox'?item.defaultValue===''?false:item.defaultValue:typeof item.defaultValue==='object'?Array.isArray(item.defaultValue)?'':item.defaultValue.value:typeof item.defaultValue==='string'?item.defaultValue:typeof item.defaultValue==='boolean'? item.defaultValue===''?false:item.defaultValue:item.defaultValue;
                                    // console.log('Popup Data >>>>>>>> ',item.fieldName,item.type,item.defaultValue,defaultValue)
                                    newSelectedFields = newSelectedFields.filter(it => it.name !== item.fieldName);
                                    newSelectedFields.push({name:item.fieldName,value:defaultValue});
                                }
                        });
                        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 33333 >>>> ',popupFields,newSelectedFields);
                        
                        state.EnterTankData=localEnterTankData;
                    }
                    
                    state.selectedFields = newSelectedFields;
                }
                // state.error = null
                state.status = 'success';
            }).
            addCase(fetchWorkFlowPopupData.pending, (state) => {
                state.workflowPopup = [];
                state.status = 'loading';
            })
            .addCase(fetchWorkFlowPopupData.rejected, (state, action) => {
                state.workflowPopup = [];
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fieldConvertUomAPI.fulfilled, (state, action) => {
                let newSelectedFields = [...state.selectedFields]
                const payload = action.payload.response;
                const updatedFields=payload?.convertedValue;
                // console.log('In Tool 1111 >>>>>>>>>>>>>>>>>>>  44444444 >>>>>>>>>> 2222 ',action.payload)
                let localSelectedFields=[];
                newSelectedFields.forEach((item) => {
                    const checkItem = localSelectedFields.find(f => f.name === item.name);
                    if(checkItem==undefined || checkItem?.value==='' || checkItem?.value===null){
                        let value=item.value;
                        const multiItem=item.name?.split('|');
                        if(multiItem?.length>1){
                            // console.log('UOM Conversion >>>>>>>>>>>>> ',item.name?.split('|'));
                            multiItem.forEach((localFieldName)=>{
                                if (updatedFields[localFieldName] !== undefined && updatedFields[localFieldName] !== null && updatedFields[localFieldName] !== "") {
                                    value = updatedFields[localFieldName];
                                }
                                localSelectedFields.push({...item,name:localFieldName,value});
                            });
                        }else if (updatedFields[item.name] !== undefined && updatedFields[item.name] !== null && updatedFields[item.name] !== "") {
                            value = updatedFields[item.name];
                            localSelectedFields.push({...item,value});
                        }else{

                            localSelectedFields.push({...item,value});
                        }
                    }
                });
                state.status = 'success';
                state.selectedFields = [...localSelectedFields];
                state.apiLoadingSpinner = false;
                state.fieldChangeFlag = true;
                state.uomConvertedValues={...updatedFields};
            })
            .addCase(fieldConvertUomAPI.pending, (state) => {
                state.status = 'loading';
                state.apiLoadingSpinner = true;
                // console.log('Convert UOm Loading Spinner >>>>>>>>>>>>>>> ',state.apiLoadingSpinner)
            })
            .addCase(fieldConvertUomAPI.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                state.error = action.error.message;
                state.apiLoadingSpinner = false;
            })
            .addCase(displayUnitConvertUomAPI.fulfilled, (state, action) => {
                let newSelectedFields = [...state.selectedFields]
                const payload = action.payload.response;
                const updatedFields=payload?.convertedValue;
                // console.log('In Tool 1111 >>>>>>>>>>>>>>>>>>>  44444444 >>>>>>>>>> 2222 ',action.payload)
                let localSelectedFields=[];
                newSelectedFields.forEach((item) => {
                    const checkItem = localSelectedFields.find(f => f.name === item.name);
                    if(checkItem==undefined || checkItem?.value==='' || checkItem?.value===null){
                        let value=item.value;
                        const multiItem=item.name?.split('|');
                        if(multiItem.length>1){
                            // console.log('UOM Conversion >>>>>>>>>>>>> ',item.name?.split('|'));
                            multiItem.forEach((localFieldName)=>{
                                if (updatedFields[localFieldName] !== undefined && updatedFields[localFieldName] !== null && updatedFields[localFieldName] !== "") {
                                    value = updatedFields[localFieldName];
                                }
                                localSelectedFields.push({...item,name:localFieldName,value});
                            });
                        }else if (updatedFields[item.name] !== undefined && updatedFields[item.name] !== null && updatedFields[item.name] !== "") {
                            value = updatedFields[item.name];
                            localSelectedFields.push({...item,value});
                        }else{
                            // value = updatedFields[item.name];
                            localSelectedFields.push({...item,value});
                        }
                        // console.log(item.name,updatedFields[item.name])
                    }
                });
                Object.keys(updatedFields).forEach((key)=>{
                    const field = newSelectedFields.find(f => f.name === key);
                    if (field === undefined) {
                        localSelectedFields.push({...field,name: key, value: updatedFields[key]});
                    }
                });
                state.status = 'success';
                state.selectedFields = [...localSelectedFields];
                state.apiLoadingSpinner = false;
                state.fieldChangeFlag = true;
                state.apiLoadingSpinner = false;
            })
            .addCase(displayUnitConvertUomAPI.pending, (state) => {
                state.status = 'loading';
                state.apiLoadingSpinner = true;
            })
            .addCase(displayUnitConvertUomAPI.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                state.error = action.error.message;
                state.apiLoadingSpinner = false;
            })
            .addCase(fieldValidationAPI.fulfilled, (state, action) => {
                let newSelectedFields = [...state.selectedFields]
                // const config = action.payload.config;
                const payload = action.payload.response;
                // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> 1111 ',payload)
                // const localFieldName = Object.keys(payload.data);
                const updatedFields=payload?.results?.inputs;
                state.fieldValidationResults=payload?.results;
                // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> 2222 ',updatedFields)
                let localSelectedFields=[];
                
                newSelectedFields.forEach((item) => {
                    let value=item.value;
                    const multiFields=item.name?.split('|');
                    // console.log('In Validate >>>>>>>>>>> ',item.name,updatedFields[item.name])
                    if(multiFields?.length>1){
                        // For pipe-separated multi-field entries, pick the last sub-field value
                        // that exists in updatedFields, then push the original item ONCE.
                        // Previously the inner forEach pushed one copy per sub-field, causing
                        // the entry count to double on every validation response (2^N growth).
                        multiFields.forEach((localFieldName)=>{
                            if (updatedFields[localFieldName] !== undefined ) {
                                value = updatedFields[localFieldName];
                            }
                        });
                        localSelectedFields.push({...item,value});
                    }else if (updatedFields[item.name] !== undefined) {
                        value = updatedFields[item.name];
                        localSelectedFields.push({...item,value});
                    } else {
                        // Preserve fields not returned by the validation API unchanged.
                        localSelectedFields.push({...item});
                    }
                    
                });

                Object.keys(updatedFields).forEach((key)=>{
                    const field = newSelectedFields.find(f => f.name === key);
                    if (field === undefined) {
                        localSelectedFields.push({...field,name: key, value: updatedFields[key]});
                    }
                });
                let localErrors=[];
                const inputErrors=payload?.results?.errors;
                // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> 3333 ',localSelectedFields,inputErrors)
                if(inputErrors?.length>0){
                    inputErrors?.forEach(err =>{
                        localErrors?.push({name:err?.FieldName,value: {"error":{type:err?.type,message:err?.MessageId,description:err?.messageString}}})
                    })
                }
                
                // Use null (not []) when there are no errors so Immer detects no change
                // when the previous error state was also null.  The old `[...localErrors]`
                // always produced a new array reference, making the `error` dep in
                // usePopupFields fire getSizingFields on EVERY validation response even
                // when there were no errors to report.
                state.error = localErrors.length > 0 ? [...localErrors] : null;
                state.status = 'success';
                state.selectedFields = [...localSelectedFields];
                state.apiLoadingSpinner = false;
                // console.log('In Tool 1111:: fieldValidationAPI >>>>>>>>>>>.  44444444 >>>>>>>>>> 4444 ',state.apiLoadingSpinner)
                state.fieldChangeFlag = true;
            })
            .addCase(fieldValidationAPI.pending, (state) => {
                state.status = 'loading';
                state.apiLoadingSpinner = true;
                // console.log('fieldValidationAPI Loading Spinner >>>>>>>>>>>>>>> ',state.apiLoadingSpinner)
            })
            .addCase(fieldValidationAPI.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                state.error = action.error.message;
                state.apiLoadingSpinner = false;
            })
            .addCase(fieldCalculationAPI.fulfilled, (state, action) => {
                let newSelectedFields = [...state.selectedFields]
                const config = action.payload.config;
                const payload = action.payload.response;
                const localFieldName = Object.keys(payload.data);
                let value='';
                let relievingValue =state.selectedFields.find(item => item.name === 'Relieving');
                let selectedWorkFlowId = config.selectedWorkFlowId;
                let tempUom = config?.TemperatureUOM; //state.selectedFields.find(item => item.name === 'TemperatureUOM');
                let SizingBasis = config.SizingBasis;;//state.selectedFields.find(item => item.name === 'SizingBasis');
                // console.log('In field CalculationAPI::fulfilled :: workflowSlice >>>>>>>>>>>>>>> ',action.payload,localFieldName,tempUom)
                localFieldName.forEach((fieldName) => {
                    value = payload.data[fieldName] === null ? '' : payload.data[fieldName];
                    // console.log('In field CalculationAPI: 2222 :: workflowSlice>>>>>>>>>>>>>>>>>>>>>>>>>>>',fieldName, value,selectedWorkFlowId, relievingValue,selectedWorkFlowId===13, fieldName==='SaturatedSteam')
                    if(selectedWorkFlowId===13 && fieldName==='SaturatedSteam'){
                        // newSelectedFields = [...newSelectedFields, { name: 'Relieving', value} ];
                        newSelectedFields = [...newSelectedFields.map(item => item.name === 'Relieving' ? { name: 'Relieving', value } : item)];
                    }else if(fieldName==='SaturatedSteam'){
                        const checkSuperCritical=config?.checkSuperCritical===undefined?false:checkCriticalCondition(config,uomData);
                        const localValue=!checkSuperCritical?value:''
                        let localSelectedFields = newSelectedFields.find(item => item.name === fieldName);
                        if (localSelectedFields === undefined) {
                            newSelectedFields = [...newSelectedFields, { name: fieldName, value:localValue }];
                        } else {
                            newSelectedFields = [...newSelectedFields.map(item => item.name === fieldName ? { name: fieldName, value:localValue } : item)];
                        }
                        if(value!==''){
                            // relievingValue= selectedWorkFlowId===13?undefined:relievingValue;
                            
                            if(SizingBasis!=='Economizer' && SizingBasis!=='Preheater'){
                                const {localSelectedFields,localerrors}=checkSaturatedSteamTemp(newSelectedFields,state.error,relievingValue,value)
                                newSelectedFields=[...localSelectedFields];
                                // console.log('In field CalculationAPI::fulfilled:: newSelectedFields 111111>>>>>>>>>>>>>>> ',localSelectedFields)
                                state.error=localerrors!==null && localerrors!==undefined?[...localerrors]:null
                            }
                        }
                        // console.log('In field CalculationAPI::fulfilled:: newSelectedFields 111111>>>>>>>>>>>>>>> ',newSelectedFields)
                    }else{
                        let localSelectedFields = newSelectedFields.find(item => item.name === fieldName);
                        if (localSelectedFields === undefined) {
                            newSelectedFields = [...newSelectedFields, { name: fieldName, value }];
                        } else {
                            newSelectedFields = [...newSelectedFields.map(item => item.name === fieldName ? { name: fieldName, value } : item)];
                        }
                     }
                });
                
                
                // console.log('In field CalculationAPI>>>>>>>>>> 33333 Workflow >>>>>>>>>>>>>',newSelectedFields)
                // if(!!config?.data?.TemperatureUOM){
                    // const tempUOM = newSelectedFields.find(item => item.name === 'TemperatureUOM');
                    if(tempUom===undefined){
                        newSelectedFields = [...newSelectedFields, { name: 'TemperatureUOM', value: config?.TemperatureUOM }];
                    }else if(tempUom?.value==='' || tempUom?.value===null || tempUom?.value===undefined){
                        newSelectedFields = [...newSelectedFields.filter(item => item.name !== 'TemperatureUOM'), { name: 'TemperatureUOM', value: config?.TemperatureUOM }];
                    }
                // }
                // newSelectedFields.push(action.payload);
                state.status = 'success';
                // console.log('In field CalculationAPI::fulfilled:: newSelectedFields >>>>>>>>>>>>>>> ',SizingBasis,newSelectedFields)
                state.selectedFields = [...newSelectedFields];
                state.fieldChangeFlag = true;
            })
            .addCase(fieldCalculationAPI.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fieldCalculationAPI.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fieldCalculation_ExecFunction.fulfilled, (state, action) => {
                let newSelectedFields = [...state.selectedFields];
                let errors=state.error===null?null:[...state.error]
                const result=action.payload;
                let data=[]
                Object.keys(result).forEach((fieldName) => {
                    if(fieldName!=='Error'){
                        newSelectedFields=newSelectedFields.filter(item=>item.name!==fieldName)
                        data.push({name:fieldName,value:result[fieldName]})
                    }
                });
                newSelectedFields=[...newSelectedFields, ...data];
                state.status = 'success';
                // console.log('In useTabPanel:In field field Calculation_ExecFunction::fulfilled:: action >>>>>>>>>>>>>>> ',action.payload,data,newSelectedFields)
  
                state.selectedFields = [...newSelectedFields];
                // state.error = errors===null?null:[...errors]//localError?.length>0?errors===null?[...localError]:[...errors,...localError]:[...errors];
                state.fieldChangeFlag = true;
            })
            .addCase(fieldCalculation_ExecFunction.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fieldCalculation_ExecFunction.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                // state.error = action.error.message;
            })
            .addCase(fieldCalculation_ExecAPI.fulfilled, (state, action) => {
                let newSelectedFields = [...state.selectedFields];
                let errors=state.error===null?null:[...state.error]
                const result=action.payload;
                let data=[]
                Object.keys(result).forEach((fieldName) => {
                    if(fieldName!=='Error'){
                        newSelectedFields=newSelectedFields.filter(item=>item.name!==fieldName)
                        data.push({name:fieldName,value:result[fieldName]})
                    }
                });
                newSelectedFields=[...newSelectedFields, ...data];
                state.status = 'success';
                // console.log('In useTabPanel:In field field Calculation_ExecFunction::fulfilled:: action >>>>>>>>>>>>>>> ',action.payload,data,newSelectedFields)
  
                state.selectedFields = [...newSelectedFields];
                // state.error = errors===null?null:[...errors]//localError?.length>0?errors===null?[...localError]:[...errors,...localError]:[...errors];
                state.fieldChangeFlag = true;
            })
            .addCase(fieldCalculation_ExecAPI.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fieldCalculation_ExecAPI.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                // state.error = action.error.message;
            })
            .addCase(fetchSizingDetails.fulfilled, (state, action) => {
                let selectedData = [];
                let resdata = action.payload?.data[0];
                if (resdata) {
                    Object.keys(resdata).forEach(item => {
                        selectedData.push({ name: item, value: resdata[item] !== null ? resdata[item] : '' });
                    });
                    state.selectedFields = selectedData;
                    state.fieldChangeFlag = true;
                }
                state.sizingDetails = resdata;
            })
            .addCase(fetchSizingDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSizingDetails.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(fetchMySizingData.fulfilled, (state, action) => {
                let resdata = action.payload?.data.rows[0].MySizingDetails
                state.mySizingData = resdata ? resdata : [];
                state.status = 'idle';
            })
            .addCase(fetchMySizingData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMySizingData.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(searchSizingBySizingId.fulfilled, (state, action) => {
                // let selectedData = [...state.selectedFields];
                // console.log('searchSizingBySizingId >>>>>>> ', action.payload)
                state.selectedFields = [];
                let resdata = action.payload?.data !== null ? action.payload?.data[0] : null;
                console.log('searchSizingBySizingId >>>>>>> ', resdata)
                state.error = resdata['ErrorWarnings'] ?? null;
                if (resdata!==undefined && resdata !== null) {
                    Object.keys(resdata).forEach(item=>{
                        if(['FarFromCriticalPoint'].includes(item) && resdata['WorkFlowId'] == 20) {
                            resdata['YesNoDetermine'] = resdata[item];
                        }
                        if(['IsBoilingRangeLT150F'].includes(item) && resdata['WorkFlowId'] == 20) {
                            resdata['IsBoilingRangeLT150FYesNo'] = resdata[item] === true ? 'bryesradio' : 'brnoradio';
                        }
                        console.log('searchSizingBySizingId >>>>>>> ', item, resdata[item],resdata[item]==null)
                        if(resdata[item]==null){
                            resdata[item]='';
                        }
                    })
                    state.SizingIdError = false;
                    state.searchSizingModal = false;
                } else {
                    state.SizingIdError = true;
                }
                // console.log('ErrorWarnings >>>>>>>>>>>> ',resdata['ErrorWarnings'])
                //resdata['ValveId'] = 277
                state.sizingDetails = resdata;
                state.fieldValidationResults=resdata['FieldProperties'] ?? null;
                
                state.searchFlag = true; 
            })
            .addCase(searchSizingBySizingId.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(searchSizingBySizingId.rejected, (state, action) => {
                // console.log('In field CalculationAPI::rejected >>>>>>>>>>>>>>> ',action)
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(saveWorkflowData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(saveWorkflowData.rejected, (state) => {
                state.status = 'failed';
            })
            .addCase(saveWorkflowData.fulfilled, (state, action) => {
                if (action.payload?.data === null) {
                    state.error = "Error in saving Sizing data";
                    state.status = 'failed';
                    //   state.sizingData = null;
                    return;
                } else {
                    state.status = 'idle';
                    const { sizingData } = action.payload;
                    //   state.sizingData = sizingData[0];
                    const newSelectedFields = state.selectedFields.filter(item => item.name !== "SizingId");
                    newSelectedFields.push({ name: "SizingId", value: sizingData[0].SizingId });
                    newSelectedFields.push({ name: "Id", value: sizingData[0]?.Id });
                    state.selectedFields = newSelectedFields;
                }
            });
    }
});

export const {
    onSelectValveCategory,
    onSelectFluidType,
    onSelectSizingMethodology,
    resetSelectedFields,
    onUpdateFields,
    onUpdateMultipleFields,
    onUpdateListOfFields,
    onUpdateError,
    setFieldChangeFlag,
    onUpdateInfoError,
    onUpdateWorldMapModal,
    onUpdateSearchSizingModal,
    onUpdateResetSizingModal,
    onUpdateSetPayloadFlag,
    onUpdateSearchFlag,
    onUpdateCallResultAPI,
    updateIsWorkflowChange,
    onClearSizingData,
    setEnterTankData,
    onUpdateProceed93XXModal,
    onUpdateProceedModal,
    onUpdateProceedModalMessage,
    onUpdateProceedOmni900Modal,
    setWorkflowDataLoaded,
    setApiLoadingSpinner,
    setFieldValidationResults,
    setUOMConvertedValues,
    setRLPopupData,
    setRLProceedModal,
    onUpdatePopupCounter
} = workflowSlice.actions;

export default workflowSlice.reducer;
