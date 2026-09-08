import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { updateNavigationMenu } from "./navigationSlice";
import { makeApiCall } from "../api/commonApiCall";

export const getModelConfigurations = createAsyncThunk(
    'configuration/getModelConfigurations',
    async (config) => {
        // console.log('configurationData >>>>>>>>>>>>>>> config >>>> ',config)
        const response = makeApiCall(config.url, config.method, config.data);
        return response;
    }
);

const configurationSlice=createSlice({
    name:"configuration",
    initialState:{
        status: 'idle',
        isConfigurationLayout:false,
        rawConfigurationData:null,
        configurationData:null,
        tempConfigData:null,
        configDataFlag:false,
        configTabSelected:1,
        configurationErrors:[],
        navMenus:[
            {
                id: 1,
                name: "Configuration"
            },
            // {
            //     id: 2,
            //     name: "Custom Config."
            // },
            {
                id: 3,
                name: "Assocessoiries"
            },
            {
                id: 4,
                name: "Special Req."
            },
            {
                id: 5,
                name: "Notes"
            },
            {
                id: 6,
                name: "Valve Calculations"
            },
            {
                id: 7,
                name: "Valve Dimensions"
            },
            {
                id: 8,
                name: "Valve Features"
            }
        ]
    },
    reducers:{
        setIsConfigurationLayout:(state,action)=>{
            state.isConfigurationLayout=action.payload
        },
        setConfigurationData:(state,action)=>{
            state.configurationData=action.payload
        },
        setTempConfigData:(state,action)=>{
            state.tempConfigData=action.payload
        },
        updateNavigationMenus:(state,action)=>{
            state.navMenus=action.payload
        },
        
        updateConfigTabSelected:(state,action)=>{
            state.configTabSelected=action.payload;
        },
        
        updateConfigurationErrors:(state,action)=>{
            state.configurationErrors=action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getModelConfigurations.pending, (state) => {
                state.status = 'loading';
                state.configDataFlag=true;
            })
            .addCase(getModelConfigurations.fulfilled, (state, action) => {
                state.rawConfigurationData = action.payload.data;
                const rawData=action.payload.data;

                let configData=rawData.reduce((acc, item) => {
                    // Initialize the base structure if not already done
                    if (!acc.ModelId) {
                        acc.ModelId = item.ModelId;
                        acc.ModelNumber = item.ModelNumber;
                        acc.BrandId = item.BrandId;
                        acc.ConfigurationModelId = item.ConfigurationModelId;
                        acc.ConfigurationSections = [];
                        acc.ConfigSectionErrors = []

                    }
            
                    // Find or create the ConfigurationSection
                    let section = acc.ConfigurationSections.find(
                        (section) => section.ConfigurationSectionId === item.ConfigurationSectionId
                    );
            
                    if (!section) {
                        section = {
                            Abbr: item.Abbr,
                            Name: item.Name,
                            ConfigurationSectionId: item.ConfigurationSectionId,
                            SectionOrder: item.SectionOrder,
                            AllowMultiple: item.AllowMultiple,
                            Visible: item.Visible,
                            Mode: item.Mode,
                            IsAccessory: item.IsAccessory,
                            DisplayName: item.DisplayName,
                            SectionChoices: [],
                            DefaultValue:item.SectionOrder>0?'Not Set':null,
                            SelectedChoice: {label:'Not Set',value:'NOT_SET'},
                            isCustomConfig:false,
                            CustomInputData:'',
                            SectionStaus:'enabled',
                            
                        };

                        acc.ConfigurationSections.push(section);
                    }
            
                    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',item?.ComboInclusions,item?.ComboLimits)
                    let comboLimits=item?.ComboLimits==null?[]:item.ComboLimits;
                    if(comboLimits?.length>0){
                        comboLimits=comboLimits?.map((item)=>{
                            return {...item,SectionChoiceId:JSON.parse(item?.SectionChoiceId)};
                        });
                    }

                    // Add the SectionChoice to the SectionChoices array
                    section.SectionChoices.push({
                        label: item.Description,
                        value: item.SectionChoiceId,
                        SectionChoiceId: item.SectionChoiceId,
                        ChoiceOrder: item.ChoiceOrder,
                        CatelogCode: item.CatalogCode,
                        ERPCode: item.ERPCode,
                        Description: item.Description,
                        Expression: item.Expression,
                        ComboRestrictions: item.ComboRestrictions==null?[]:item.ComboRestrictions,
                        ComboInclusions: item?.ComboInclusions==null?[]:item.ComboInclusions,
                        ComboExclusions: item.ComboExclusions==null?[]:item.ComboExclusions,
                        ComboLimits: comboLimits,
                        status:"enabled",
                        isSelected:false,
                        isRestricted:false,
                        isAvailable:true,
                        isHidden:false,
                    });

                    section.SectionChoices.sort((a, b) => a.ChoiceOrder - b.ChoiceOrder);
                    // acc.ConfigurationSections.sort((a, b) => a.SectionOrder>0?a.SectionOrder - b.SectionOrder:b.SectionOrder-b.SectionOrder);
                    acc.ConfigurationSections.sort((a, b) => b.SectionOrder>0?a.SectionOrder - b.SectionOrder:b.SectionOrder-a.SectionOrder);
            
                    return acc;
                }, {});
                state.configurationData=configData;
                state.tempConfigData=configData;
                state.status = 'success';
                state.isConfigurationLayout=true;
                state.configDataFlag=false;
                
                console.log('configurationData >>>>>>>>>>>>>>>',configData)
            })
            .addCase(getModelConfigurations.rejected, (state) => {
                state.status = 'failed';
                state.configurationData=null;
                state.tempConfigData=null;
                state.configDataFlag=false;
            })

    }
});

export const {
        setIsConfigurationLayout, setConfigurationData,
        setTempConfigData,updateNavigationMenus,
        updateConfigTabSelected,
        updateConfigurationErrors
    }=configurationSlice.actions

export default configurationSlice.reducer