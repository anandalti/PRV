import { useDispatch, useSelector } from "react-redux";
import { getModelConfigurations, setConfigurationData, updateConfigTabSelected } from "../store/slices/configurationSlice";
import { MODEL_CONFIGURATION_API } from "../utils/constants";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { evaluateLimitExpressions } from "../utils/EvaluateLimitExpression";

const useConfigurationPanel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {status,configDataFlag,configurationData,configTabSelected,configurationErrors} = useSelector((state) => state.configuration)
    const { payloadData } = useSelector(state => state.workflowPayload);
    const { units } = useSelector(state => state.uom);

    const fetchModelConfiguration= async (ModelId) => {
      try {
        const config = { url: MODEL_CONFIGURATION_API, method: "GET", data: {ModelId} };
        dispatch(getModelConfigurations(config));
        
      } catch (error) {
        console.error('Error fetching model configuration', error)
      }
    }

    useEffect(() => {
      if(status=="success" && configDataFlag==false){
        navigate('/Configuration');
      
      }
    },[status,configDataFlag]);

    const updateConfigCustomFlag=(item)=>{
      const value=item.value;
      let ConfigurationSections=configurationData?.ConfigurationSections?.map(section=>{
        let localSection={...section};
        if(localSection.Name==item.name){
          localSection={...localSection,isCustomConfig:value};
        }
        return localSection;

      });
      
      dispatch(setConfigurationData({...configurationData,ConfigurationSections}));
    }

    const checkRestrictions=(localSection,restrictions)=>{
      let localSectionStatus=localSection?.SectionStaus;
      let localChoices=localSection?.SectionChoices?.map(choice=>{
        if(restrictions?.includes(choice?.SectionChoiceId)){
          if(choice?.isSelected==true){
            localSectionStatus="error";
            return {...choice,status:"error"}
          }
          return {...choice,status:"disabled"};
        
        }else if(choice?.isSelected==true && choice?.status=="disabled"){
          localSectionStatus="error";
          return {...choice,status:"error"}

        }else if(choice?.isSelected==false && choice?.status=="error"){
          localSectionStatus="disabled";
          return {...choice,status:"disabled"}
        }
        return {...choice}
        
      });
      return {...localSection,SectionChoices:localChoices,SectionStaus:localSectionStatus}
    }

    const checkInclusions=(localSection,inclusions)=>{
      let localSectionStatus=localSection?.SectionStaus;
      let localChoices=localSection?.SectionChoices?.map(choice=>{
        if(inclusions?.includes(choice?.SectionChoiceId)){
          localSectionStatus="enabled";
          return {...choice,status:"enabled"};
        }
        return {...choice}
        
      });
      return {...localSection,SectionChoices:localChoices,SectionStaus:localSectionStatus}
    }

    const checkComboLimits=(localSection,combolimits)=>{
      // console.log(`Combo Limits >>>>>>>>>>>>> `,localSection?.Name,combolimits)
      let localSectionStatus=localSection?.SectionStaus;
      let localChoices=localSection?.SectionChoices?.map(choice=>{
        let choiceComboLimits=combolimits?.filter(limit=>limit?.SectionChoiceId.includes(choice?.SectionChoiceId));
        let limitFlag=true;
        if(choiceComboLimits?.length>0){
          const { result, failedExpressions }=evaluateLimitExpressions(choiceComboLimits,payloadData,units);
        }
        // if(combolimits?.includes(choice?.SectionChoiceId)){
        //   localSectionStatus="enabled";
        //   return {...choice,status:"enabled"};
        // }
        return {...choice}
        
      });
      return {...localSection,SectionChoices:localChoices,SectionStaus:localSectionStatus}
    }

    const updateConfigSelectedData=(item)=>{
  
      let restrictions=[];
      let inclusions=[];
      let exclusions=[];
      let limits=[];
      
      let ConfigurationSections=configurationData?.ConfigurationSections?.map(section=>{
        // console.log('In updateConfigSelectedData ::: section >>>>>>> ',section)
        let localSection={...section};
        if(localSection.Name==item.name){
          let localSectionChoice=[...localSection?.SectionChoices];
          let localSelectedChoice={}
          localSectionChoice=localSectionChoice?.map(choice=>{
            if(localSection?.IsAccessory){
              if(choice.label==item.label){
                localSelectedChoice={...choice,isSelected:item?.value}
                return localSelectedChoice;
              }else if(localSection?.AllowMultiple){
                return {...choice};
              }else{
                return {...choice,isSelected:false};
              }
            }else if(choice.value==item.value){
              // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',choice?.ComboInclusions,choice?.ComboLimits)
              restrictions=[...choice?.ComboRestrictions];
              inclusions=[...choice?.ComboInclusions];
              limits=[...choice?.ComboLimits];
              exclusions=[...choice?.ComboExclusions];
              localSelectedChoice={...choice,isSelected:true};
              return localSelectedChoice;
            }else{
              return {...choice,isSelected:false};
            }
          });

          localSection={...localSection,SectionChoices:localSectionChoice,SelectedChoice:localSelectedChoice};
        }
        restrictions=restrictions?.length>0?restrictions?.sort((a,b)=>a-b):[];
        // console.log('In updateConfigSelectedData ::: localSection >>>>>>> ',localSection?.name,restrictions)
        
        if(localSection?.SectionOrder>0){
          
          localSection=checkRestrictions(localSection,restrictions);
          localSection=checkInclusions(localSection,inclusions);
          localSection=checkComboLimits(localSection,limits);

          return localSection;
        }else{
          return localSection;
        }

      });
      // console.log('In updateConfigSelectedData:: ConfigurationSections >>>>>>> ',configurationData?.ConfigurationSections,ConfigurationSections)

      dispatch(setConfigurationData({...configurationData,ConfigurationSections}));
    }

    const updateConfigCustomInputData=(item)=>{
      let value=item.value;

      let ConfigurationSections=configurationData?.ConfigurationSections?.map(section=>{
        let localSection={...section};
        if(localSection.Name==item.name){
          localSection={...localSection,CustomInputData:value};
        }
        return localSection;

      });
      
      dispatch(setConfigurationData({...configurationData,ConfigurationSections}));
    }

    const updateConfigNavOption=(menu)=>{
      dispatch(updateConfigTabSelected(menu?.id));
    }

    const updateConfigurationErrors=(error)=>{

    }

   
  return {
    status,
    configDataFlag,
    configTabSelected,
    configurationData,
    configurationErrors,
    fetchModelConfiguration,
    updateConfigCustomFlag,
    updateConfigSelectedData,
    updateConfigCustomInputData,
    updateConfigNavOption,
    updateConfigurationErrors
  }
}

export default useConfigurationPanel