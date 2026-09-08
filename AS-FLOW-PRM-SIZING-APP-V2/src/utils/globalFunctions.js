import { SteamISOCalculations } from "./ISO4126_Calculations";
import { CalculateAreaMethods,CalculateTup } from "./SurfaceAreaCalculator";
import {CalculateTankVolume } from "./tankVolumeCalculator";
import {RinCalculator} from "./RinCalculator";
import {CalculateApi2000SurfaceAreaAndTankVolume} from "./Api2000SurfaceAreaCalculator";
import {CalculateProductMovement} from "./ProductMovementCalculator";
import { CalculateThermalPressure } from "./ThermalPressureCalculator";
import { CalculateRequiredFlow } from "./RequiredFlowCalculator";
import {CalculateAdditionalCapacity} from "./AdditionalCapacityCalculator";
import { CalculatePressureAPI2000 } from "./CalculatePressureAPI2000";
import { Calculate_21_ReqFlowCapacity } from "./SeparatedFlowCalculation";
import { Calculate_14_ReqFlowCapacity, Calculate_17_Inlet_SpVolMix,Calculate_17_ReqFlowCapacity,Calculate_17_Non_Flashing_Wreq,checkP1_CP_T_CT } from "./CalculateWorkflowFunctions";

const globalFunction = {
    SteamISOCalculations,
    CalculateAreaMethods,
    CalculateTup,
    CalculateTankVolume,
    RinCalculator,
    CalculateApi2000SurfaceAreaAndTankVolume,
    CalculateProductMovement,
    CalculateThermalPressure,
    CalculateRequiredFlow,
    CalculateAdditionalCapacity,
    CalculatePressureAPI2000,
    Calculate_21_ReqFlowCapacity,
    Calculate_14_ReqFlowCapacity,
    Calculate_17_Inlet_SpVolMix,
    Calculate_17_ReqFlowCapacity,
    Calculate_17_Non_Flashing_Wreq,
    checkP1_CP_T_CT
    // Add more functions as needed
};

// Make sure to attach this to the global object if needed
export {globalFunction};