const ErrorsAndWarnings = [
    {
        "Key": "ARCWarning_Sbp",
        "Value": "Bypass Velocity exceeds 18 ft/s at Maximum Process Pump Flow for model {0} with Main Cv {1} and Bypass Cv {2}."
    },
    {
        "Key": "ARCConfigPanel_SwitchpointText",
        "Value": "Bypass begins to open when main flow is reduced to {0}."
    },
    {
        "Key": "ARCWorksheetStageController_TriangleHelp1",
        "Value": "No valves meet your requirements.  If all of the required inputs have been entered (blue text), the orange triangle can be clicked to see why no valves appear.  If no valves show up and there are no error messages, please check your filters directly above this message."
    },
    {
        "Key": "WorksheetStage_MultivalvePsetOutOfRange",
        "Value": "The Pset has forced this valve below the overpressure threshold."
    },
    {
        "Key": "ARCConfigPanel_SizingPressureText",
        "Value": "{0} is the sizing pressure drop (for sizing Bypass Cv)."
    },
    {
        "Key": "WorksheetStage_FlowRateHasNotBeenMet",
        "Value": "Flowrate has not been met"
    },
    {
        "Key": "ValveFilter_GenericValveSizing_Tooltip",
        "Value": "Generic Valve Sizing"
    },
    {
        "Key": "ValveFilter_RestoreValveList_Tooltip",
        "Value": "Show the worksheet."
    },
    {
        "Key": "WorksheetStage_CantDoMultivalve",
        "Value": "You must enter the Required Flow Rate before you can do Multivalve Sizing."
    },
    {
        "Key": "ConfigurationStage_RestrictedLiftError_DNEError",
        "Value": "Do Not Exceed Capacity must be entered."
    },
    {
        "Key": "ARCConfigPanel_BypassFlowText",
        "Value": "Bypass flow is {0} when main flow is zero."
    },
    {
        "Key": "WorksheetStage_TwoPhaseUnpredictableBackPressure",
        "Value": "Emerson Automation Solutions recommends using a balanced bellows (JLT-JBS-E or JLT-JBS-BP-E) or pilot operated valve, because the built-up back pressure in the body bowl of the valve can be difficult to predict. The balanced valve will allow the valve to perform properly should any unforeseen built-up back pressure be present."
    },
    {
        "Key": "WorksheetStage_HSJEconomizerWarning",
        "Value": " NOTE:  Although ASME Code Section I (V), PG-69.1.6 allows the use of direct spring loaded relief valves for economizer service, Crosby Style HSJ safety valves are not capacity certified on water.  \r\nEmerson Automation Solutions suggests the use of the Anderson Greenwood Series 5200 modulating pilot operated safety relief valves for economizer service applications covered by ASME Code Section I (V).  Further information can be found in catalog VCTDS-00803.\r\n"
    },
    {
        "Key": "ARCConfigPanel_NormalMainFlowText",
        "Value": "{0} at Normal Main Flow of {1} at {2}."
    },
    {
        "Key": "ConfigurationStage_RestrictedLiftError_RestCap",
        "Value": "Restricted Capacity is greater than Do Not Exceed Capacity."
    },
    {
        "Key": "ARCWarning_DeltaMPressure",
        "Value": "ΔP at Normal Flow & Normal Op. Temp. is greater than 15 psid.  Carbon Steel will not be available for model {0} with Main Cv {1} and Bypass Cv {2}."
    },
    {
        "Key": "Configuration_InvalidValveInternals",
        "Value": "The internal valve material does not support Vset + Vover below {0} in wc"
    },
    {
        "Key": "ConfigurationStage_RestrictedLiftError_FullLift",
        "Value": "Lift restriction is not available, because full lift is required."
    },
    {
        "Key": "WorksheetStage_FlowRateHasBeenMet",
        "Value": "Flowrate has been met"
    },
    {
        "Key": "ProcessController_NoFlowCurve",
        "Value": "A flow curve is not available for this valve."
    },
    {
        "Key": "ConfigurationStage_RestrictedLiftError_Minimum",
        "Value": "Lift restriction is below the minimum allowed for this configuration."
    },
    {
        "Key": "ARCConfigPanel_MaxMainFlowText",
        "Value": "{0} at Maximum Main Flow of {1} at {2}."
    },
    {
        "Key": "FlowCurveDialog_PressureAxis",
        "Value": "Pressure ({0})"
    },
    {
        "Key": "PickerStageController_SelectProcessWorkflow_TagClearWarning",
        "Value": "Data will not be preserved while navigating to and from ARC® selections."
    },
    {
        "Key": "FlowCurveDialog_Title",
        "Value": "{0} {1} Flow Curve"
    },
    {
        "Key": "WorksheetStage_NormalSystemMessage",
        "Value": "\"The temperature used for the correction factor should be based on the temperature at the inlet to the relief valve at its normal service (nonrelieving) conditions. The temperature at the valve may not be equal to the operating temperature of the process due to valve's physical location, collection of noncondensable vapors below the valve inlet, isolation from the process by a rupture disk, or heat tracing of the valve.\" - API 520, Part I, 4.2.3.3"
    },
    {
        "Key": "ViewsController_NoARCPermissions",
        "Value": "ARC® tag cannot be opened with current privileges."
    },
    {
        "Key": "FlowCurveDialog_FlowAxis",
        "Value": "Flow Rate ( x1000 {0})"
    },
    {
        "Key": "ARCWarning_Smv",
        "Value": "Main Valve Velocity exceeds 18 ft/s at Maximum Process Pump Flow for model {0} with Main Cv {1} and Bypass Cv {2}."
    },
    {
        "Key": "WorksheetStage_m_lblFlowRateStatus",
        "Value": "Selected valve cannot be used in the multiple valve set with the given set pressure"
    },
    {
        "Key": "CodeDefinition_PlossErrorString",
        "Value": "Inlet Loss is above the recomended maximum of 3% of set pressure."
    },
    {
        "Key": "ProcessWorkflow_MultivalvePsetOutOfRange",
        "Value": "The Pset has forced this valve below the overpressure threshold."
    },
    {
        "Key": "SteamSelectionCalcWorkflow_SectionIEconomizerTSatCheck",
        "Value": "Relieving Temperature cannot be greater than Saturated Steam Temperature in Economizer/Preheater sizing basis"
    },
    {
        "Key": "SteamSelectionCalcWorkflow_TSatCheck",
        "Value": "Relieving Temperature cannot be less than Saturated Steam Temperature (except in Economizer/Preheater sizing basis)"
    },
    {
        "Key": "SupercriticalSizingError",
        "Value": "This method does not support sizing for fluids in the supercritical state."
    },
    {
        "Key": "ValveConfiguration_ASMELimit",
        "Value": "The tag's maximum {0} pressure exceeds the pressure limit of {1} {2} for the selected group {3} material and {4}# flange rating (as per ASME B16.34)."
    },
    {
        "Key": "ValveConfiguration_ASMEOutOfRange",
        "Value": "The temperature {0} is out of range of the ASME B16.34 table. Unable to validate."
    },
    {
        "Key": "ValveConfiguration_ModelConfliction",
        "Value": "{0} is invalid based on this model"
    },
    {
        "Key": "ValveListResultCaption_ValveDiffPressureMaxFlow",
        "Value": "ΔP at Max. Valve Flow & Norm. Op. Temp. psid"
    },
    {
        "Key": "ValveListResultCaption_ValveDiffPressureNormalFlow",
        "Value": "ΔP at Norm. Flow & Norm. Op. Temp. psid"
    },
    {
        "Key": "ValveListResultCaption_ValveRecircZeroFlow",
        "Value": "Recirculation Flow when Main Flow is Zero GPM (US)"
    },
    {
        "Key": "CodeDefinition_PoverError",
        "Value": "Pover must equal 3% Pset or 2 psi, whichever is greater."
    },
    {
        "Key": "CodeDefinition_SuperImposedError",
        "Value": "Psic + Psiv must be less then Pset"
    },
    {
        "Key": "ValveFilter_BackPressureError",
        "Value": "{0} is not allowed for this back pressure type."
    },
    {
        "Key": "ValveFilter_DifferentialPressureError",
        "Value": "{0} {1} is not allowed for differential pressure under 15 psi."
    },
    {
        "Key": "ValveFilter_PandTLimts",
        "Value": "{0} is not available because it has failed the expression(s) '{1}'."
    },
    {
        "Key": "Error_EllipticalVesselProportions",
        "Value": "The value for End-to-End Length (Lt) must be greater than or equal to the value for half of the Tank Diameter (d)."
    },
    {
        "Key": "Error_FireSizingTemperatures",
        "Value": "The value for Vessel Wall Temperature (Tw) must be greater than or equal to the calculated Upsteam (Relieving) Temperature to proceed using the API 521 method. Enter a value for Fire Sizing Factor (F') or accept the default value to proceed using this method."
    },
    {
        "Key": "Error_Generic_nonZeroP1",
        "Value": "P1 cannot be zero."
    },
    {
        "Key": "Error_ISO4126_Condensation",
        "Value": "This sizing method can not be used when condensation is present."
    },
    {
        "Key": "Error_ISO4126_CriticalityThermo",
        "Value": "This sizing method is not recommended near thermodynamic critical point."
    },
    {
        "Key": "Error_ISO4126_kLessThanEqual0",
        "Value": "Isentropic exponent must be greater than zero."
    },
    {
        "Key": "Error_ISO4126_P1LessThanEqualP2",
        "Value": "Inlet Pressure must be greater than Outlet Pressure."
    },
    {
        "Key": "Error_ISO4126_PsetLessThanPoint1",
        "Value": "ISO 4126 is not applicable for the entered set pressure."
    },
    {
        "Key": "Error_ISO4126_SetPressureLessThanEqualPsicPsiv",
        "Value": "Set Pressure must be greater than Total Superimposed Back Pressure."
    },
    {
        "Key": "Error_Multivalve_PsetTooHigh",
        "Value": "Pset is too high, forcing Pover to be negative. Please make Pset lower."
    },
    {
        "Key": "Error_PsetForcingPoverOutofBounds",
        "Value": "Over pressure would be less than 10% of set pressure for the given set pressures: {0}"
    },
    {
        "Key": "Error_UnwettedVesselFireSizingFactor_TwltT",
        "Value": "Upstream temperature must be greater than vessel wall temperature."
    },
    {
        "Key": "Error_VesselProportions",
        "Value": "The value for End-to-End Length (Lt) must be greater than or equal to the value for Tank Diameter (d)."
    },
    {
        "Key": "Error_ViscosityCorrectionFactor",
        "Value": "The viscosity correction factor has dropped below 0.3, and the calculation cannot continue."
    },
    {
        "Key": "Range_between",
        "Value": "{0} must be between {1} and {2}."
    },
    {
        "Key": "Range_greaterthan",
        "Value": "{0} must be greater than {1}."
    },
    {
        "Key": "Range_greaterthanorequal",
        "Value": "{0} must be greater than or equal to {1}."
    },
    {
        "Key": "Range_lessthan",
        "Value": "{0} must be less than {1}."
    },
    {
        "Key": "Range_lessthanorequal",
        "Value": "{0} must be less than or equal to {1}."
    },
    {
        "Key": "Steam_Range_greaterthanorequal",
        "Value": "{0} must be greater than or equal to {1} for a steam calculation. Please use a gas\\vapor calculation"
    },
    {
        "Key": "Error_ISO4126_MustBeGreaterThan0",
        "Value": "{0} must be greater than zero."
    },
    {
        "Key": "Error_ISO4126_RuptureDiscCombination",
        "Value": "Rupture disc combination factor cannot be less than zero."
    },
    {
        "Key": "Error_ISO4126_SaturatedSteamNotExists",
        "Value": "Saturated steam does not exist at this pressure."
    },
    {
        "Key": "Error_ISO4126_SteamDrynessExceeds1",
        "Value": "The steam dryness factor exceeds the maximum value of 1.0."
    },
    {
        "Key": "Error_ISO4126_SteamDrynessLessThanPoint9",
        "Value": "The sizing method is not valid for steam dryness factor less than 0.9."
    },
    {
        "Key": "Error_ISO4126_TvsTsat",
        "Value": "Steam relieving temperature is less than saturated steam temperature."
    },
    {
        "Key": "Error_ISO4126_WaterExists",
        "Value": "Water exists under these relieving conditions."
    },
    {
        "Key": "Error_ISO4126_WetSteamNotExists",
        "Value": "Wet steam does not exist at this pressure."
    },
    {
        "Key": "Error_ISO4126_PnGreaterThanMAWP",
        "Value": "Operating pressure is greater than MAWP."
    },
    {
        "Key": "Error_ISO4126_PoverLessThanMinPover",
        "Value": "The Over Pressure is less than the minimum allowed."
    },
    {
        "Key": "Error_ISO4126_PsetGreaterThanMAWP",
        "Value": "Set pressure is greater than MAWP."
    },
    {
        "Key": "Error_ISO4126_PoverGreaterThanMaxPover",
        "Value": "The Over Pressure has exceeded the maximum allowed."
    },
    {
        "Key": "Error_PRVPress_PatmLessThanZero",
        "Value": "Atm. Pressure cannot be less than zero."
    },
    {
        "Key": "Error_PRVPress_PbuLessThanZero",
        "Value": "Built-up Back Pressure must be greater than or equal to zero."
    },
    {
        "Key": "Error_PRVPress_PnGreaterThanPset",
        "Value": "Operating pressure must be less than or equal to set pressure."
    },
    {
        "Key": "Error_PRVPress_PsicandPatmLessThanEqZero",
        "Value": "Absolute Constant Back Pressure is less than Atm. Pressure."
    },
    {
        "Key": "Error_PRVPress_PsicPsivPatmLessThanEqZero",
        "Value": "Total Absolute Superimposed Back Pressure is less than Atm. Pressure."
    },
    {
        "Key": "Error_PRVPress_PsivandPatmLessThanEqZero",
        "Value": "Absolute Variable Back Pressure is less than Atm. Pressure."
    },
    {
        "Key": "Warn_PRVPress_OpPressWithin10PrecentPset",
        "Value": "Operating Pressure is within 10% of set pressure."
    },
    {
        "Key": "Warn_PRVPress_PlossAboveRecommended",
        "Value": "Inlet Loss is above the recommended maximum 3% of set pressure."
    },
    {
        "Key": "Error_ISO4126_TLessThan0DegK",
        "Value": "Relieving temperature must be greater than or equal to 0°K."
    },
    {
        "Key": "Error_ISO4126_KvmLessThanEqualToPoint3",
        "Value": "Some sizes of {0} are not available - Max flow cannot be calculated, because viscosity correction factor at max flow < 0.3."
    },
    {
        "Key": "Error_ISO4126_KvreqLessThanEqualToPoint3",
        "Value": "Some sizes of {0} are not available - Required area cannot be calculated, because viscosity correction factor < 0.3."
    },
    {
        "Key": "Range_Lessthengreaterthen",
        "Value": "Over pressure should be 3.00 psig."
    }
];