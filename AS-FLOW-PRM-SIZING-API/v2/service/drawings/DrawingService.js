
// drawingService.js
const js2xmlparser = require("js2xmlparser");
const model_abbr_map = require("../../data/drawing/model_abbr_map3.json");
const { normalizeValues } = require("../../utils/helper");
const { executeProcedureXML, executeGetProcedureXML } = require("../../db/mssqldb");


const getUpdatedPayloadData=(payload)=>{
  if (!payload) return null;

  const adsReq = {...payload};
  const modelNumber = adsReq?.TagData?.Model_Number;

  if (!modelNumber) {
    console.warn("Model_Number missing in payload");
    // return { ADSRequest: adsReq };
     return {
      status:"Error",
      message:`ADS System cannot support Model (${modelNumber}). No drawing available for this model.` 
    }
  }

  // const ModelAccessories = [];//Model_Acc_Map[modelNumber] || [];
  /* -----------------------------
     Find model definition
  ------------------------------*/
  let modelDef = null;

  if (Array.isArray(model_abbr_map)) {
    modelDef = model_abbr_map.find(
      r =>
        normalizeValues(
          r?.ADSRequest?.TagData?.Model_Number ||
          r?.TagData?.Model_Number ||
          r?.Model_Number
        ) === normalizeValues(modelNumber)
    );
  }

  if (!modelDef) {
    console.warn(`No model_abbr_map match for Model_Number: ${modelNumber}`);
    // return { ADSRequest: adsReq };
    return {
      status:"Error",
      message:`No model_abbr_map match for Model_Number: ${modelNumber}` 
    }
  }

    /* -----------------------------
     Base Config Schema
  ------------------------------*/
  const baseConfig =
    modelDef?.ADSRequest?.ConfigData ||
    modelDef?.ConfigData ||
    {};

  const payloadConfig = adsReq.ConfigData || {};

  // console.log(' >>>>>>>>>>>> ',baseConfig,payloadConfig)
  let missingKeys=[];
  let finalConfig = {...baseConfig};
  // let finalConfig = {};
  Object.keys(baseConfig).forEach(key => {
    if(baseConfig[key] !== null && baseConfig[key] !== ""){
      const finalKey=baseConfig[key]?.abbr;
      if(finalKey!==null && finalKey!=='' && finalKey!==undefined){
        let keyUpdated=key.replace(/_/g, ' ');
        keyUpdated=`${keyUpdated} (${finalKey})`;
        finalConfig[key] = payloadConfig[finalKey] !== undefined && payloadConfig[finalKey] !== "" && payloadConfig[finalKey] !== null ? payloadConfig[finalKey] 
                          : baseConfig[key]?.IsAccessory? payloadConfig[finalKey] == undefined || payloadConfig[finalKey] == "" ? null 
                          : payloadConfig[finalKey]
                           : missingKeys.push(keyUpdated);
      }
    }
  });

  // console.log(finalConfig,missingKeys)
  if(missingKeys.length>0){
    // console.warn(`Missing ConfigData keys for Model_Number: ${modelNumber} => `,missingKeys);
    return {
      status:"Error",
      message:`Incomplete Configuration: Please complete the configuration for the Model (${modelNumber}) on the following Characteristics => ${missingKeys.join(", ")}`,
      Company_GUID: adsReq?.TagData?.Company_GUID || null,
      Project_GUID: adsReq?.TagData?.Project_GUID || null,
      Tag_GUID: adsReq?.TagData?.Tag_GUID || null,
      ValveId: adsReq?.TagData?.ValveId || null,  
      missingKeys
    }
  }
 
 return {
      ...adsReq,
      VC_Material: modelDef?.ADSRequest?.VC_Material ?? modelDef?.VC_Material,
      ConfigData: finalConfig
   };
}

/* ===============================
   MAIN SERVICE
================================ */
/**
 * 1. Helper to read ID from multiple possible field formats
 */
const getADSRequestId = (item) => {
  if (!item) return null;
  // Check flat properties or nested ADSRequest properties
  return (
    item.ADSRequestId ?? 
    item.ADS_Request_Id ?? 
    item.ADSRequest?.ADSRequestId ?? 
    item.ADSRequest?.ADS_Request_Id ?? 
    null
  );
};

/**
 * 2. Specialized function for Batch Updates
 */
const performBatchUpdate = async (toUpdate) => {
  if (!toUpdate || toUpdate.length === 0) return [];
  
  console.log(`➡️ Performing batch update of ${toUpdate.length} item(s)`);
  
  const xmlForUpdate = js2xmlparser.parse(
    "ADSRequests", 
    { ADSRequest: toUpdate }, 
    { format: { pretty: true } }
  );
  // console.log(xmlForUpdate)
  const result = await executeProcedureXML("SP_UpdatePRV2SIZE_ADS_Backlog", "XMLInput", xmlForUpdate);
  // console.log("results update.....",result);
  console.log("✅ Update stored procedure executed");
  return result || [];
  
};

/**
 * 3. Specialized function for Batch Inserts
 */
const performBatchInsert = async (toInsert) => {
  if (!toInsert || toInsert.length === 0) return [];

  console.log(`➡️ Performing batch insert of ${toInsert.length} item(s)`);

  const xmlForInsert = js2xmlparser.parse(
    "ADSRequests",
    { ADSRequest: toInsert },
    { format: { pretty: true } }
  );
  // console.log('xmlForInsert >>>>>>>>>>>> ',xmlForInsert)
  const result = await executeProcedureXML("SP_InsertPRV2SIZE_ADS_Backlog", "XMLInput", xmlForInsert);
    // console.log("results insert.....",result);
  console.log("✅ Insert stored procedure executed");
  return result || [];
};



/**
 * MAIN FUNCTION: Orchestrates the drawing request process
 */
const generateDrawingRequest = async (payload) => {
  console.log("--- Received Payload ---");

  // Normalize payload into an array
  let transformedArray = Array.isArray(payload)
    ? payload.map(p => getUpdatedPayloadData(p?.ADSRequest ?? p)).filter(Boolean)
    : [getUpdatedPayloadData(payload?.ADSRequest ?? payload)].filter(Boolean);

    // console.log(transformedArray,transformedArray?.length === 0,payload?.length==1 , transformedArray[0]?.status === "Error",payload?.length==1 && transformedArray[0]?.status === "Error")
  // Quick exit if data is empty or contains errors
  const errorFields=transformedArray.filter(r=>r?.status==="Error").map(r=>({...r}));
  if (transformedArray?.length === errorFields?.length) {
    return { status: "Error", 
          message: "No records were processed successfully.",
          data: transformedArray,
          meta: {
            insertedCount: 0
          }
        };
  }
  const uniqueObjects= [...new Map(transformedArray.map(item => [JSON.stringify(item), item])).values()]
  // console.log(uniqueObjects?.length)
  // console.log(uniqueObjects)
  // Partition into updates vs inserts using the external helper
  // const toUpdate = uniqueObjects.filter(item => {
  //   const id = getADSRequestId(item);
  //   return id !== null && id !== undefined && id !== 0 && id !== 'null';
  // });

  // transformedArray= [...new Set([...transformedArray])]
  //check unique objects in transformedArray
  
  const toInsert = uniqueObjects.filter(item => {
    const id = getADSRequestId(item);
    // return id === null || id === undefined || id === 0 || id === 'null';
    return id >=0;
  });

  try {


    // Execute DB Operations via the new helper functions
    // console.log({TagData:toInsert[0]?.TagData,ProcessData:toInsert[0]?.ProcessData,ConfigData:toInsert[0]?.ConfigData})
    // const updateDbRows = await performBatchUpdate(toUpdate);
    // console.log(toInsert,toInsert?.length)
    const insertDbRows = await performBatchInsert(toInsert);
    // console.log({insertDbRows,payload_Array:Array.isArray(payload)})
    // Map DB results back to the original payload shape
    let finalMapped = [];
    // let duplicateCount=transformedArray?.length - uniqueObjects?.length;
    // (Array.isArray(payload) ? payload : [payload])
    uniqueObjects?.forEach((r) => {
      // console.log(r)
      const originalADS = r?.ADSRequest ?? r;
      // const providedId = getADSRequestId(originalADS);
      const TagData=r?.TagData ?? r ??{};
      // Match by ID for updates or internal logic for inserts
      // console.log(TagData?.Company_GUID,insertDbRows[0]?.Company_GUID,TagData?.Company_GUID===insertDbRows[0]?.Company_GUID,
      //     TagData?.Project_GUID,insertDbRows[0]?.Project_GUID,TagData?.Project_GUID===insertDbRows[0]?.Project_GUID,
      //     TagData?.Tag_GUID,insertDbRows[0]?.Tag_GUID,TagData?.Tag_GUID===insertDbRows[0]?.Tag_GUID,
      //     TagData?.ValveId,insertDbRows[0]?.ValveId,TagData?.ValveId===insertDbRows[0]?.ValveId,
      //     insertDbRows,providedId)

      // const updatedRow = updateDbRows.find(dbr => dbr.Company_GUID.toUpperCase()===TagData?.Company_GUID.toUpperCase() && dbr.Project_GUID.toUpperCase()===TagData?.Project_GUID.toUpperCase() && dbr.Tag_GUID.toUpperCase()===TagData?.Tag_GUID.toUpperCase() && dbr.ValveId===TagData?.ValveId);

      const insertedRow = insertDbRows.find(dbr => dbr.Company_GUID.toUpperCase()===TagData?.Company_GUID.toUpperCase() && dbr.Project_GUID.toUpperCase()===TagData?.Project_GUID.toUpperCase() && dbr.Tag_GUID.toUpperCase()===TagData?.Tag_GUID.toUpperCase() && dbr.ValveId===TagData?.ValveId);
      const payloadRow= payload.find(p=> p.TagData?.Company_GUID.toUpperCase()===TagData?.Company_GUID.toUpperCase() && p.TagData?.Project_GUID.toUpperCase()===TagData?.Project_GUID.toUpperCase() && p.TagData?.Tag_GUID.toUpperCase()===TagData?.Tag_GUID.toUpperCase() && p.TagData?.ValveId===TagData?.ValveId)
      const resolvedId = insertedRow?.ADS_Request_Id; //providedId==0 ?insertedRow?.ADS_Request_Id : providedId ;
      // console.log({ resolvedId,insertedRow,payloadRow})
      if(resolvedId && insertedRow){
        
          finalMapped.push({ 
                ...originalADS, 
                ADS_Request_Id: parseInt(resolvedId),
                ConfigData: payloadRow?.ConfigData || originalADS?.ConfigData || {},
          });
        }
    });
    // console.log({ finalMappedLength: finalMapped.length, uniqueObjectsLength: uniqueObjects?.length });
    if(finalMapped.length===uniqueObjects?.length){

      return {
        status: "Success",
        data: finalMapped,
        message: uniqueObjects?.length !== transformedArray?.length ? "All records processed successfully with some duplicates in payloadremoved." : "All records processed successfully.",
        meta: {
          // updatedCount: toUpdate.length==0?undefined:toUpdate.length,
          insertedCount: toInsert.length==0?undefined:toInsert.length //-duplicateCount,
          // duplicateCount: duplicateCount>0?duplicateCount:undefined
        }
      };
    }else if(finalMapped.length>0){
      let newData=[]; //[...finalMapped];
      uniqueObjects.forEach(item=>{
        const exists=finalMapped.find(r=>{
          const itemTagData=item?.TagData || item?.ADSRequest?.TagData || {};
          const rTagData=r?.TagData || r?.ADSRequest?.TagData || {};
          return rTagData?.Company_GUID===itemTagData?.Company_GUID && rTagData?.Project_GUID===itemTagData?.Project_GUID && rTagData?.Tag_GUID===itemTagData?.Tag_GUID && rTagData?.ValveId===itemTagData?.ValveId
        })
        if(!exists){
          newData.push({...item})
        }else{
          newData.push({...exists})
        }
      })
      return {
        status: "Partial Success",
        data: newData,
        meta: {
          // updatedCount: toUpdate.length,
          insertedCount: toInsert.length,//-duplicateCount,
          failedCount: uniqueObjects?.length - finalMapped.length,
          // duplicateCount: duplicateCount>0?duplicateCount:undefined
        }
      };
    }else{
      // console.log(uniqueObjects),
      return { status: "Error", 
          message: "No records were processed successfully.",
          data: uniqueObjects,
          meta: {
            insertedCount: 0
          }
        };
    }

  } catch (err) {
    const error = err.message || err;
    console.error("❌ Stored procedure error:", error);
    return { status: "Error", message: error };
  }
};

const checkIsDrawingAvailable=async (ADS_Request_Id)=>{
    // console.log('check drawing for ADS_Request_Id >>>>> ',ADS_Request_Id);
    try {
        
        const result = await executeGetProcedureXML("SP_GetPRV2SIZE_ADS_Backlog", 'ADS_Request_Ids', ADS_Request_Id); 
        // console.log("results get.....",result);
        if(result.length===0){
            return {
                status: "Error",
                message: `No drawing request found for ADS_Request_Id: ${ADS_Request_Id}`,
                data: null
            }
        }
        const AdsIds=ADS_Request_Id.split(',').map(id=>id.trim());
        let finalResult=[];
        for(let index=0; index<result.length; index++){
          const modelNumber = result[index]?.Model_Number;
          let resultData = null;

          if (Array.isArray(model_abbr_map)) {
            resultData = model_abbr_map.find(
              r =>
                normalizeValues(
                  r?.ADSRequest?.TagData?.Model_Number ||
                  r?.TagData?.Model_Number ||
                  r?.Model_Number
                ) === normalizeValues(modelNumber)
            );
          }
          // console.log(resultData)
          if(!resultData){
              finalResult.push({
                  status: "Error",
                  message: `No model_abbr_map match for Model_Number: ${modelNumber}`,
                  data: null
              })
          }else{
            let TagData=resultData?.ADSRequest?.TagData || resultData?.TagData || {
                "Company_GUID": "",
                "Brand": "",
                "Model_Number": "",
                "Project_GUID": "",
                "Tag_GUID": "",
                "ValveId": 0,
                "Customer_Name": "",
                "Project_Name": "",
                "Quote_Number": "",
                "Tag_No": "",
                "Comments": "",
                "Location": "",
                "PurchaseOrder_Number": "",
                "Serial_No": "",
                "Customer_Ref_No": "",
                "Project_Ref_No": "",
                "Line_No": ""
            };
            let ConfigData=resultData?.ADSRequest?.ConfigData || resultData?.ConfigData || {};
            let ProcessData=resultData?.ADSRequest?.ProcessData || resultData?.ProcessData || {
              "Set_Pressure": 0,
              "Set_Pressure_Unit": "psig"
            };
            let finalConfigData={};
            let finalProcessData={};
            let finalTagData={};
            Object.keys(TagData).forEach(key => {
              if(TagData[key] !== null ){
                const finalKey=key;
                if(finalKey!==null && finalKey!=='' && finalKey!==undefined){
                  finalTagData[key] = result[index][key] !== undefined && result[index][key] !== "" && result[index][key] !== null ? result[index][key] : "";
                }
              }
            });
            Object.keys(ProcessData).forEach(key => {
              if(ProcessData[key] !== null){
                const finalKey=key;
                if(finalKey!==null && finalKey!=='' && finalKey!==undefined){
                  finalProcessData[key] = result[index][finalKey] !== undefined && result[index][finalKey] !== "" && result[index][finalKey] !== null ? result[index][finalKey] : null;
                }
              }
            });
            Object.keys(ConfigData).forEach(key => {
              if(ConfigData[key] !== null ){
                const finalKey=ConfigData[key]?.abbr;
                if(finalKey!==null && finalKey!=='' && finalKey!==undefined){
                  finalConfigData[finalKey] = result[index][key] !== undefined && result[index][key] !== "" && result[index][key] !== null ? result[index][key] : null;
                }
              }
            });

            finalResult.push({
              ADS_Request_Id: parseInt(result[index]?.ADS_Request_Id) || null,
              BOMFileName: result[index]?.BOMFileName || '',
              Customer_Manager: result[index]?.Customer_Manager || '',
              Completion_DateTime: result[index]?.Completion_DateTime || null,
              Created: result[index]?.Created || null,
              Is_Dwg_Available: result[index]?.Is_Dwg_Available || false,
              Is_Pdf_Available: result[index]?.Is_Pdf_Available || false,
              Is_Step_Available: result[index]?.Is_Step_Available || false,
              Revision: result[index]?.Revision || null,
              Start_DateTime: result[index]?.Start_DateTime || null,
              Status: result[index]?.Status || null,
              Template_Requested: result[index]?.Template_Requested || "Outline",
              VC_Material: result[index]?.VC_Material,
              Catalog_Number: result[index]?.Catalog_Number,
              ERP_Number: result[index]?.ERP_Number, 
              Order_Or_Quote: result[index]?.Order_Or_Quote || "Quote", 
              Title: result[index]?.Title || '',  
              TagData: finalTagData,
              ConfigData: finalConfigData,
              ProcessData: finalProcessData
            });
          }
        }
        
        return {
            status: "Success",
            message: "Drawing Data retrieved successfully for ADS_Request_Id: "+ADS_Request_Id,
            data: AdsIds?.length==1 ? finalResult[0] : finalResult
        }
    } catch (err) {
        const error = err.message || err;
        return {
            status: "Error",
            message: error,
            data: null
        }
    }
    
//   return false;
}

const checkDrawingRequestStatus=async (ADSRequestId)=>{
    // console.log('check drawing for ADS_Request_Id >>>>> ',ADSRequestId);
    try {
        const ADS_Request_Id = ADSRequestId.join(','); // Convert array to comma-separated string if it's an array  
        const result = await executeGetProcedureXML("SP_GetPRV2SIZE_ADS_Backlog", 'ADS_Request_Ids', ADS_Request_Id); 
        let AdsIds=ADS_Request_Id.split(',').map(id=>id.trim());
        // console.log("resu lts get.....",result);
        let finalResult=[];
        if(result.length===0){
          AdsIds?.forEach((id)=>{
            finalResult.push({
              ADS_Request_Id: id,//BigInt(id),
              Is_Dwg_Available: false,
              Is_Pdf_Available: false,
              Is_Step_Available: false,
              Status: "No_Drawing_Request_Found",
            });
          });
          // console.log(finalResult)
            return {
                status: "Success",
                message: `No drawing request found for given ADS_Request_Id(s)`,
                data: finalResult
            }
        }
        
        
        
        
        
        ADSRequestId.forEach((id)=>{
          reqIdData=result.find(r=>r?.ADS_Request_Id==id);
          if(reqIdData){
            finalResult.push({
              ADS_Request_Id: reqIdData?.ADS_Request_Id || null,
              Is_Dwg_Available: reqIdData?.Is_Dwg_Available || false,
              Is_Pdf_Available: reqIdData?.Is_Pdf_Available || false,
              Is_Step_Available: reqIdData?.Is_Step_Available || false,
              Status: reqIdData?.Status || null,
            });
          }else{
            finalResult.push({
              ADS_Request_Id: id,//BigInt(id),
              Is_Dwg_Available: false,
              Is_Pdf_Available: false,
              Is_Step_Available: false,
              Status: "No_Drawing_Request_Found",
            });
          }
        })
        // console.log(foundAdsIds,noDataIds)
        return {
            status: "Success",
            message: "Drawing Data retrieved successfully for given ADS_Request_Id(s)",
            data: finalResult
        }
    } catch (err) {
        const error = err.message || err;
        return {
            status: "Error",
            message: error,
            data: null
        }
    }
    
//   return false;
}


module.exports = {
  generateDrawingRequest,
  checkIsDrawingAvailable,
  checkDrawingRequestStatus
}; 