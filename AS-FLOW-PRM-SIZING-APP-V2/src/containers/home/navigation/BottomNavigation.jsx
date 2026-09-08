import Stack from "../../../components/hoc/Stack";
import Button from "../../../components/basicComponents/Button";
import styles from "./../../../styles/Home.module.css";
import { addNavigationValue, onSelectMenu } from "../../../store/slices/navigationSlice";
import { useDispatch, useSelector } from "react-redux";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { resetResults, setSelectedOrificeArea, setSelectedResultRows } from "../../../store/slices/workflowPayloadSlice";
import {
  CALC_Ksh_ON_RESULT_FOR_WF,
  Orific_Filter_Column,
  OrificeDropdownOptions,
  RESULT_PAGE_TITLE,
} from "../../../utils/constants";
import useSaveSizing from "../../../hooks/useSaveSizing";
import {
  onUpdateInfoError,
  onUpdateCallResultAPI,
  fieldCalculation_ExecFunction,
  onUpdateSearchFlag,
} from "../../../store/slices/workflowSlice";
import { useEffect, useState } from "react";
import { apiFunctionCall, checkVisibility, funcExecRequiredFields } from "../../../utils/validation";
import ProceedButton from "../../../components/basicComponents/ProceedButton";

const BottomNavigation = ({ resultPage }) => {
  const { handleSaveSizingData } = useSaveSizing();
  const { activeMenu, menus, activateResults } = useSelector((state) => state.navigation);
  const { selectedWorkflow, workflowSections, sizingDetails, callResultAPI, searchFlag, selectedFields } = useSelector(
    (state) => state.workflow
  );
  const { payloadData, flowCalcPopupSaved, selectedOrificeArea } = useSelector(
    (state) => state.workflowPayload
  );
  const { isAdvanced } = useSelector((state) => state.layout);
  const { preferences } = useSelector((state) => state.auth);
  const { units,defaultUnits } = useSelector((state) => state.uom);

  const [resultFlag, setResultFlag] = useState(false);
  const [svSizingFlag, setSvSizingFlag] = useState(true);
  const [infoError, setInfoError] = useState([]);
  const [pageTabIndex, setPageTabIndex] = useState(0);

  const dispatch = useDispatch();

  // const handleProceed = () => {
  //   // console.log('handleProceed >>>>>>>>>>>>>>>>> ',selectedResultRows,sizingData?.SizingId);
  //   if (!!selectedResultRows?.length) {
  //     handleSaveWorkflowData(3);
  //   }
  // };

  useEffect(() => {
    if (resultFlag) {
      setResultFlag(false);
      dispatch(onUpdateInfoError(infoError));
      dispatch(setSelectedResultRows([]));
      handleSaveSizingData(2, svSizingFlag);

      dispatch(onSelectMenu(pageTabIndex));
    }
  }, [resultFlag]);

  const getKsh_ho_ks_Values = (localInfoError, tabId, saveSizingFlag) => {
    if (CALC_Ksh_ON_RESULT_FOR_WF.indexOf(selectedWorkflow) !== -1) {
      if (selectedWorkflow === 11) {
        const fieldValues = {
          symbol: "Exec_Function",
          actionType: "OnBlur",
          functionName: "SteamISOCalculations",
          functionFields: [
            "IsSaturatedSteam",
            "IsWetSteam",
            "DrynessFactor",
            "SetPressure",
            "OverPressure",
            "InletLoss",
            "AtmPressure",
            "Relieving",
            "PressureUOM",
            "AtmPressureUOM",
            "TemperatureUOM",
          ],
          requiredUnits: {
            absPressureUOM: "abspressure.bara",
            pressureUOM: "pressure.barg",
            temperatureUOM: "temp.degC",
          },
        };
        let config = funcExecRequiredFields(fieldValues, payloadData, preferences, units,defaultUnits);
        dispatch(fieldCalculation_ExecFunction(config)).then((response) => {
          setSvSizingFlag(saveSizingFlag);
          setPageTabIndex(tabId);
          setInfoError(localInfoError);
          setResultFlag(true);
        });
      } else {
        const fieldValues = {
          id: "SaturatedSteam",
          symbol: "API_FUNCTION_CALL",
          api: "/calculateSaturatedSteam",
          actionType: "OnBlur",
          method: "GET",
          apiParameters: [
            "SetPressure",
            "OverPressure",
            "InletLoss",
            "AtmPressure",
            "AtmPressureUOM",
            "PressureUOM",
          ],
          apiResponseParams: ["SaturatedSteam"],
          nextRound: false,
        };
        let config = apiFunctionCall(fieldValues, "", "", payloadData);

        // const value={value:config,nextRound:fieldValues?.nextRound,ruleType:fieldValues?.symbol,checkSuperCritical:true}
        config = { ...config, TemperatureUOM: preferences?.SystemTemperature, checkSuperCritical: true };
        dispatch(fieldCalculationAPI(config)).then((response) => {
          // console.log('API_FUNCTION_CALL: Response >>>>>>>>>>>>>>>> ',response,selectedFields,payloadData)
          // let newPayloadData={...payloadData}
          // const newSelectFields=selectedFields.map((field)=>{
          //     if(["Relieving","SaturatedSteam","TemperatureUOM"].includes(field.name)){
          //         // console.log('API_FUNCTION_CALL: Response 111>>>>>>>>>>>>>>>> ',field.name,field.value)
          //         let newValue;
          //         if(field.name==='TemperatureUOM'){
          //             newValue=response.payload?.config?.data?.TemperatureUOM;
          //             let tempUOMFlag=newValue==="" || newValue===null || newValue===undefined?false:true;
          //             if(!tempUOMFlag){
          //                 newValue=response.payload?.config?.TemperatureUOM;
          //             }
          //         }else{
          //             newValue=response.payload.response.data.SaturatedSteam;
          //             newValue=newValue===null?field?.name!=='Relieving'?'':field?.value===null|| field.value===undefined?'':field.value:newValue
          //         }// console.log('API_FUNCTION_CALL: Response 222>>>>>>>>>>>>>>>> ',field.name,field.value,newValue)
          //         newPayloadData[field.name]=newValue; //{...newPayloadData[field.name],value:newValue}
          //         return {...field,value:newValue}
          //     }
          //     return field;
          // })
          setSvSizingFlag(saveSizingFlag);
          setPageTabIndex(tabId);
          setInfoError(localInfoError);
          setResultFlag(true);
        });
      }
    } else {
      setSvSizingFlag(saveSizingFlag);
      setPageTabIndex(tabId);
      setInfoError(localInfoError);
      setResultFlag(true);
    }
  };

  const handleChange = (newValue, action, skipFlag, saveSizingFlag = true) => {
    if (action === "RESULTS") {
      dispatch(resetResults());
      const tabId = activeMenu + 1;
      if (menus[menus?.length - 1]?.name !== RESULT_PAGE_TITLE) {
        dispatch(addNavigationValue([{ id: activeMenu, name: RESULT_PAGE_TITLE, isCompleted: true }]));
      }
      const localDisplayUnit = payloadData[Orific_Filter_Column]; //=== 'Metric' ? 'Metric' : 'English';
      const localOrificeArea =
        localDisplayUnit === "All"
          ? OrificeDropdownOptions.find((item) => item.value === selectedOrificeArea?.value)
          : OrificeDropdownOptions.find(
              (item) => item.display === localDisplayUnit && item.value === selectedOrificeArea?.value
            );

      // console.log('localOrificeArea >>>>>>>>>>>>>>>>> ',localOrificeArea,selectedOrificeArea,payloadData[Orific_Filter_Column],localDisplayUnit)
      // if(saveSizingFlag){
      if (localOrificeArea) {
        dispatch(setSelectedOrificeArea(localOrificeArea));
      } else if (localDisplayUnit === "Metric") {
        dispatch(setSelectedOrificeArea({ label: "cm²", value: "area.cm2", display: "Metric" }));
      } else {
        dispatch(setSelectedOrificeArea({ label: "in²", value: "area.in2", display: "English" }));
      }
      // }
      let localInfoError = []; //infoError===null?[]:[...infoError];
      // console.log('error >>>>>>>>>>>>>>>>> ',infoError)
      for (const section of workflowSections) {
        for (const field of section?.fields) {
          if (field?.fieldBlankMessage !== undefined && field?.fieldBlankMessage !== null) {
            let localvisible = checkVisibility(field.visible, selectedFields,payloadData,field);
            // console.log('In Bottom Navigation >>>>>>>>>>>>>>>>> ',field?.fieldName,localvisible,field?.fieldBlankMessage)
            if(localvisible){
              if (
                (payloadData[field?.fieldName] === null 
                  || payloadData[field?.fieldName] === undefined 
                  ||  isNaN(payloadData[field?.fieldName]) 
                  || payloadData[field?.fieldName] === "" 
                  // || parseFloat(payloadData[field?.fieldName]) == 0
              ) && field?.type !=='textinfo'
              ) {
                const info = { name: field?.fieldName, value: { error: field?.fieldBlankMessage } };
                localInfoError.push(info);
              }
            }
          }
        }
      }
      if (searchFlag) {
        getKsh_ho_ks_Values(localInfoError, tabId, saveSizingFlag);
        dispatch(onUpdateSearchFlag(false));
      } else {
        setSvSizingFlag(saveSizingFlag);
        setPageTabIndex(tabId);
        setInfoError(localInfoError);
        setResultFlag(true);
      }
    } else if (skipFlag) {
      const ind = action === "PREV" ? newValue - 1 : newValue;
      dispatch(onSelectMenu(ind));
    } else {
      // const localIndex = action === "NEXT" ? newValue+1 : action === "PREV" ? activeMenu : newValue;
      let localIndex = action === "NEXT" ? activeMenu + 1 : action === "PREV" ? activeMenu : newValue;
      const nextSectionIndex =
        action === "NEXT" ? localIndex + 1 : action === "PREV" ? localIndex : localIndex;
      const section = workflowSections.find((section) => section.displayOrder === nextSectionIndex);
      // console.log('section >>>>>>>>>>>>>>>>> ',section?.sectionName,activeMenu,localIndex,nextSectionIndex)
      if (section?.sectionName === "vacuumProperties") {
        const localField = payloadData["IsVacuumOnly"];
        if (localField !== undefined && localField !== null && localField === false) {
          const ind = action === "PREV" ? localIndex - 1 : localIndex + 1;
          handleChange(ind, action, true);
        } else {
          localIndex = action === "NEXT" ? localIndex : localIndex - 1;
          dispatch(onSelectMenu(localIndex));
        }

      } else if (section?.sectionName === "pressurePropertiesAPI2000") {
        const localField = payloadData["IsPressureOnly"];
        if (localField !== undefined && localField !== null && localField === false) {
          const ind = action === "PREV" ? localIndex - 1 : localIndex + 1;
          handleChange(ind, action, true);
        } else {
          localIndex = action === "NEXT" ? localIndex : localIndex - 1;
          dispatch(onSelectMenu(localIndex));
        }
      } else {
        localIndex = action === "NEXT" ? localIndex : localIndex - 1;
        dispatch(onSelectMenu(localIndex));
      }
    }
  };
  useEffect(() => {
    if (callResultAPI && sizingDetails) {
      //sizingDetails.SizingTabIndex
      // console.log('In calling Result API >>>>>>>>>>>>>>>>>> ',sizingDetails,callResultAPI);
      setTimeout(() => {
        handleChange(activeMenu, "RESULTS", false, true);
        dispatch(onUpdateCallResultAPI(false));
      }, 500);
    }
  }, [callResultAPI]);
  // console.log('In Bottom >>>>>>>>>> ',activeMenu,menus[activeMenu])
  // if (!isAdvanced) {
    return (
      <Stack justifyContent="space-between" direction="row" sx={{ margin: "1rem" }}>
        {activeMenu !== 0 && ( //&& !resultPage
          <Button
            className={styles.footerButton}
            startIcon={<NavigateBeforeIcon />}
            onClick={() => {
              handleChange(activeMenu, "PREV", false);
            }}
          >
            Previous
          </Button>
        )}
        {menus?.length > 3 &&
        (menus[menus?.length - 1]?.name === RESULT_PAGE_TITLE
          ? menus?.length - 1 === activeMenu + 1
          : menus?.length === activeMenu + 1) ? (
          <Button
            className={`${styles.footerButton} ${styles.footerNext}`}
            disabled={!activateResults || flowCalcPopupSaved}
            endIcon={<NavigateNextIcon />}
            onClick={() => {
              handleChange(activeMenu, "RESULTS", false);
            }}
          >
            Results
          </Button>
        ) : resultPage ? ( <ProceedButton endIconFlag={true} />
          // <Button
          //   className={`${styles.footerButton} ${styles.footerNext}`}
          //   disabled={selectedResultRows?.length === 0}
          //   endIcon={<NavigateNextIcon />}
          //   onClick={handleProceed}
          // >
          //   Proceed
          // </Button>
        ) : (
          <Button
            className={`${styles.footerButton} ${styles.footerNext}`}
            disabled={!menus[activeMenu]?.isCompleted && menus[activeMenu]?.errorType != "warning"}
            endIcon={<NavigateNextIcon />}
            onClick={() => {
              handleChange(activeMenu, "NEXT", false);
            }}
          >
            Next
          </Button>
        )}
      </Stack>
    );
  // } else {
  //   return (
  //     <Button
  //       className={`${styles.footerButton} ${styles.footerNext}`}
  //       disabled={selectedResultRows?.length === 0}
  //       endIcon={<NavigateNextIcon />}
  //       onClick={handleProceed}
  //     >
  //       Proceed
  //     </Button>
  //   );
  // }
};

export default BottomNavigation;
