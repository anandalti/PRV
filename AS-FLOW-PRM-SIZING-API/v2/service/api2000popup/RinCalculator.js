const { convertUnit} = require("../../utils/helper");
const { getUOMs } = require("../getUom");

const RinCalculator=async (payload)=>{
    let tcResponse={}
    let equationValues={};
    let inputValues={};
    let equations={};
    let requiredUnits={};
    let receivedUnits={};
    let result = payload["Rin"];
    let TankHasInsulation = payload["TankHasInsulation"];
    // console.log('In usePopupPanel:::In CalculatePressureAPI2000 >>> RinCalculatorfunc >>>> ',TankHasInsulation,config)
    // console.log(payload?.selectedUnits,payload?.requiredUnits)
    if(TankHasInsulation !=="None"){
        const uoms=payload?.units===undefined?await getUOMs():payload?.units;
        let LengthUOM=TankHasInsulation==='Double Walled Tank' ? payload.requiredUnits["LengthUOM"] :"length.m" //payload.requiredUnits["LengthUOM"];
        LengthUOM=uoms.find(u => u.UnitKey===LengthUOM);
        let AreaUOM= TankHasInsulation==='Double Walled Tank' ? payload.requiredUnits["AreaUOM"] : "area.m2" //payload.requiredUnits["AreaUOM"];
        AreaUOM=uoms.find(u => u.UnitKey===AreaUOM);
        const CalcMethod=payload['CalculationMethod'];
        // if(TankHasInsulation==='Double Walled Tank'){
        //     AreaUOM=uoms.find(u => u.UnitKey===AreaUOM);
        // }
        let HeatTransferCoefficientUOM=payload?.selectedUnits['HeatTransferCoefficientUOM'];
        HeatTransferCoefficientUOM=HeatTransferCoefficientUOM!=="" && HeatTransferCoefficientUOM !==undefined?uoms.find(u => u.UnitKey===HeatTransferCoefficientUOM):'';
        let HeattransferUOM=CalcMethod=== "English"? payload?.selectedUnits['HeatTransferCoefficientUOM']:payload.requiredUnits['HeattransferUOM'];
        HeattransferUOM=HeattransferUOM!=="" && HeattransferUOM !==undefined?uoms.find(u => u.UnitKey===HeattransferUOM):'';
        const HeatTransferCoefficient=HeatTransferCoefficientUOM!=="" && HeatTransferCoefficientUOM !==undefined?convertUnit(payload['HeatTransferCoefficient'],HeatTransferCoefficientUOM,HeattransferUOM):"";
        equationValues['HeatTransferCoefficient']=HeatTransferCoefficient;
        inputValues['HeatTransferCoefficient']=payload['HeatTransferCoefficient'];
        receivedUnits['HeatTransferCoefficient']=HeatTransferCoefficientUOM;
        requiredUnits['HeatTransferCoefficient']=HeattransferUOM;
        let insulationThicknessUOM=payload?.selectedUnits['insulationThicknessUOM'];
        insulationThicknessUOM=insulationThicknessUOM!=="" && insulationThicknessUOM !==undefined?uoms.find(u => u.UnitKey===insulationThicknessUOM):'';
        // console.log(`In usePopupPanel:::In CalculatePressureAPI2000 >>> insulationThickness >>>> InsulationThickness ::: ${payload['InsulationThickness']} >>> insulationThicknessUOM : ${insulationThicknessUOM.UnitKey} >>> required UOM : ${LengthUOM.UnitKey}`)
        const InsulationThickness=insulationThicknessUOM!=="" && insulationThicknessUOM !==undefined?convertUnit(payload['InsulationThickness'],insulationThicknessUOM,LengthUOM):"";

        equationValues['InsulationThickness']=InsulationThickness;
        inputValues['InsulationThickness']=payload['InsulationThickness'];
        receivedUnits['InsulationThickness']=insulationThicknessUOM;
        requiredUnits['InsulationThickness']=LengthUOM;
        let InsulationThermalConductivityUOM=payload?.selectedUnits['InsulationThermalConductivityUOM'];
        InsulationThermalConductivityUOM=InsulationThermalConductivityUOM!=="" && InsulationThermalConductivityUOM !==undefined?uoms.find(u => u.UnitKey===InsulationThermalConductivityUOM):'';
        let ThermalconductivityUOM=CalcMethod=== "English"?payload?.selectedUnits['InsulationThermalConductivityUOM']:payload.requiredUnits["ThermalconductivityUOM"];
        ThermalconductivityUOM=ThermalconductivityUOM!=="" && ThermalconductivityUOM !==undefined?uoms.find(u => u.UnitKey===ThermalconductivityUOM):'';
        const InsulationThermalConductivity=InsulationThermalConductivityUOM!=="" && InsulationThermalConductivityUOM !==undefined?convertUnit(payload['InsulationThermalConductivity'],InsulationThermalConductivityUOM,ThermalconductivityUOM):"";
        equationValues['InsulationThermalConductivity']=InsulationThermalConductivity;
        inputValues['InsulationThermalConductivity']=payload['InsulationThermalConductivity'];
        receivedUnits['InsulationThermalConductivity']=InsulationThermalConductivityUOM;
        requiredUnits['InsulationThermalConductivity']=ThermalconductivityUOM;
        let SurfaceAreaUOM=payload?.selectedUnits['AreaUOM'];
        SurfaceAreaUOM=SurfaceAreaUOM!=="" && SurfaceAreaUOM !==undefined?uoms.find(u => u.UnitKey===SurfaceAreaUOM):'';
        const InsulatedSurfaceAreaUOM=SurfaceAreaUOM; //payload['InsulatedSurfaceAreaUOM'];
        // const AreaUOM=payload.requiredUnits["AreaUOM"];
        let InsulatedSurfaceArea=payload['InsulatedSurfaceArea']===undefined?(Number(payload['SurfaceArea'])*Number(InsulatedPercentOfATilt))/100: payload['InsulatedSurfaceArea'];
        InsulatedSurfaceArea=InsulatedSurfaceAreaUOM!=="" && InsulatedSurfaceAreaUOM !==undefined?convertUnit(payload['InsulatedSurfaceArea'],SurfaceAreaUOM,AreaUOM):"";
        equationValues['InsulatedSurfaceArea']=InsulatedSurfaceArea;
        inputValues['InsulatedSurfaceArea']=payload['InsulatedSurfaceArea'];
        receivedUnits['AreaUOM']=SurfaceAreaUOM;
        requiredUnits['AreaUOM']=AreaUOM;
        
        const SurfaceArea=SurfaceAreaUOM!=="" && SurfaceAreaUOM !==undefined?convertUnit(payload['SurfaceArea'],SurfaceAreaUOM,AreaUOM):"";
        equationValues['SurfaceArea']=SurfaceArea;
        inputValues['SurfaceArea']=payload['SurfaceArea'];
        const OuterContSurAreaUOM=SurfaceAreaUOM; //payload['OuterContSurAreaUOM'];
        // const OuterContSurArea=OuterContSurAreaUOM!=="" && OuterContSurAreaUOM !==undefined?convertUnit(payload['OuterContSurArea'],SurfaceAreaUOM,AreaUOM):"";
        // equationValues['OuterContSurArea']=OuterContSurArea;
        // inputValues['OuterContSurArea']=payload['OuterContSurArea'];

        equationValues['TankHasInsulation']=TankHasInsulation;
        if(TankHasInsulation==='Full'){
            result = 1/(1+((HeatTransferCoefficient*InsulationThickness)/InsulationThermalConductivity));
            equations['Rin']=`Equation2pt29`;
            equationValues['SurfaceArea']='';
            inputValues['SurfaceArea']='';
        }else if(TankHasInsulation==='Partial'){
            
            result = (InsulatedSurfaceArea/SurfaceArea)*(1/(1+((HeatTransferCoefficient*InsulationThickness)/InsulationThermalConductivity)))+(1-InsulatedSurfaceArea/SurfaceArea);
            // console.log({result, InsulatedSurfaceArea, SurfaceArea,SA_input:payload['SurfaceArea'], HeatTransferCoefficient, InsulationThickness, InsulationThermalConductivity})
            equations['Rin']=`Equation2pt30`;
        }else if(TankHasInsulation==='Double Walled Tank'){
            const OuterContSurAreaPer=payload['OuterContSurAreaPer']
            const OuterContSurArea=OuterContSurAreaPer*SurfaceArea/100;
            equationValues['OuterContSurArea']=OuterContSurArea;
            inputValues['OuterContSurArea']=OuterContSurArea;
            // console.log(`In usePopupPanel:::In CalculatePressureAPI2000 >>> Rin Calculation >>>> Double Walled Tank >>>> OuterContSurArea: ${payload['OuterContSurArea']} >> ${OuterContSurArea}, >>> OuterContSurAreaUOM: ${OuterContSurAreaUOM?.UnitKey} ||||||SurfaceArea: ${payload['SurfaceArea']} >>> ${SurfaceArea}, SurfaceAreaUOM: ${SurfaceAreaUOM?.UnitKey} >>> ${AreaUOM?.UnitKey} ||||||result: ${0.25+0.75*(OuterContSurArea/SurfaceArea)}`)
            result = 0.25+0.75*(OuterContSurArea/SurfaceArea);
            equations['Rin']=`Equation3pt33`;
        }
        equationValues['Rin']=result;
        inputValues['Rin']='1.0';
    }else{
        equationValues['SurfaceArea']='';
        inputValues['SurfaceArea']='';
    }
    if(result==="" || isNaN(result)){
        result=payload["Rin"];
        // console.log(result, 'In usePopupPanel::: RinCalculatorfunc >>>> inside if >>>>>>>>>>>>>>',result==="" || isNaN(result))
    }
    tcResponse['equationValues']=equationValues;
    tcResponse['inputValues']=inputValues;
    tcResponse['equations']=equations;
    tcResponse['requiredUnits']=requiredUnits;
    tcResponse['receivedUnits']=receivedUnits;
    // console.log(result, 'RinCalculatorfunc >>>> ',result)
    return {Rin:result,tcResponse};
}

module.exports = {
    RinCalculator
};