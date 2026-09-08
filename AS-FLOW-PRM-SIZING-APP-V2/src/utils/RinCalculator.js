// import * as Math from 'mathjs';
import { convertUnit } from './convertUnit';

export const RinCalculator=(config)=>{
    let tcResponse={}
    let equationValues={};
    let inputValues={};
    let equations={};
    let requiredUnits={};
    let receivedUnits={};
    let result = config.reqFields["Rin"];
    let TankHasInsulation = config.reqFields["TankHasInsulation"];
    // console.log('In use PopupPanel:::In CalculatePressureAPI2000 >>> RinCalculatorfunc >>>> ',TankHasInsulation,config)
    if(TankHasInsulation !=="None"){
        const LengthUOM=config.requiredUnits["LengthUOM"];
        let AreaUOM=config.requiredUnits["AreaUOM"];
        const CalcMethod=config.reqFields['CalculationMethod'];
        if(TankHasInsulation==='Double Walled Tank'){
            AreaUOM=CalcMethod==='English'?'area.ft2':AreaUOM;
            const uoms=config.units;
            AreaUOM=uoms['area'].find(u => u.UnitKey===AreaUOM);
        }
        const HeatTransferCoefficientUOM=config.reqFields['HeatTransferCoefficientUOM'];
        const HeattransferUOM=config.requiredUnits['HeattransferUOM'];
        const HeatTransferCoefficient=HeatTransferCoefficientUOM!=="" && HeatTransferCoefficientUOM !==undefined?convertUnit(config.reqFields['HeatTransferCoefficient'],HeatTransferCoefficientUOM,HeattransferUOM):"";
        equationValues['HeatTransferCoefficient']=HeatTransferCoefficient;
        inputValues['HeatTransferCoefficient']=config.reqFields['HeatTransferCoefficient'];
        receivedUnits['HeatTransferCoefficient']=HeatTransferCoefficientUOM;
        requiredUnits['HeatTransferCoefficient']=HeattransferUOM;
        const insulationThicknessUOM=config.reqFields['insulationThicknessUOM'];
        // console.log(`In use PopupPanel:::In CalculatePressureAPI2000 >>> insulationThickness >>>> InsulationThickness ::: ${config.reqFields['InsulationThickness']} >>> insulationThicknessUOM : ${insulationThicknessUOM.UnitKey} >>> required UOM : ${LengthUOM.UnitKey}`)
        const InsulationThickness=insulationThicknessUOM!=="" && insulationThicknessUOM !==undefined?convertUnit(config.reqFields['InsulationThickness'],insulationThicknessUOM,LengthUOM):"";
        equationValues['InsulationThickness']=InsulationThickness;
        inputValues['InsulationThickness']=config.reqFields['InsulationThickness'];
        receivedUnits['InsulationThickness']=insulationThicknessUOM;
        requiredUnits['InsulationThickness']=LengthUOM;
        const InsulationThermalConductivityUOM=config.reqFields['InsulationThermalConductivityUOM'];
        const ThermalconductivityUOM=config.requiredUnits["ThermalconductivityUOM"];
        const InsulationThermalConductivity=InsulationThermalConductivityUOM!=="" && InsulationThermalConductivityUOM !==undefined?convertUnit(config.reqFields['InsulationThermalConductivity'],InsulationThermalConductivityUOM,ThermalconductivityUOM):"";
        equationValues['InsulationThermalConductivity']=InsulationThermalConductivity;
        inputValues['InsulationThermalConductivity']=config.reqFields['InsulationThermalConductivity'];
        receivedUnits['InsulationThermalConductivity']=InsulationThermalConductivityUOM;
        requiredUnits['InsulationThermalConductivity']=ThermalconductivityUOM;
        const SurfaceAreaUOM=config.reqFields['AreaUOM'];
        const InsulatedSurfaceAreaUOM=SurfaceAreaUOM; //config.reqFields['InsulatedSurfaceAreaUOM'];
        // const AreaUOM=config.requiredUnits["AreaUOM"];
        const InsulatedSurfaceArea=InsulatedSurfaceAreaUOM!=="" && InsulatedSurfaceAreaUOM !==undefined?convertUnit(config.reqFields['InsulatedSurfaceArea'],InsulatedSurfaceAreaUOM,AreaUOM):"";
        equationValues['InsulatedSurfaceArea']=InsulatedSurfaceArea;
        inputValues['InsulatedSurfaceArea']=config.reqFields['InsulatedSurfaceArea'];
        receivedUnits['AreaUOM']=SurfaceAreaUOM;
        requiredUnits['AreaUOM']=AreaUOM;
        
        const SurfaceArea=SurfaceAreaUOM!=="" && SurfaceAreaUOM !==undefined?convertUnit(config.reqFields['SurfaceArea'],SurfaceAreaUOM,AreaUOM):"";
        equationValues['SurfaceArea']=SurfaceArea;
        inputValues['SurfaceArea']=config.reqFields['SurfaceArea'];
        const OuterContSurAreaUOM=SurfaceAreaUOM; //config.reqFields['OuterContSurAreaUOM'];
        // const OuterContSurArea=OuterContSurAreaUOM!=="" && OuterContSurAreaUOM !==undefined?convertUnit(config.reqFields['OuterContSurArea'],SurfaceAreaUOM,AreaUOM):"";
        // equationValues['OuterContSurArea']=OuterContSurArea;
        // inputValues['OuterContSurArea']=config.reqFields['OuterContSurArea'];

        equationValues['TankHasInsulation']=TankHasInsulation;
        if(TankHasInsulation==='Full'){
            result = 1/(1+((HeatTransferCoefficient*InsulationThickness)/InsulationThermalConductivity));
            equations['Rin']=`Equation2pt29`;
            equationValues['SurfaceArea']='';
            inputValues['SurfaceArea']='';
        }else if(TankHasInsulation==='Partial'){
            
            result = (InsulatedSurfaceArea/SurfaceArea)*(1/(1+((HeatTransferCoefficient*InsulationThickness)/InsulationThermalConductivity)))+(1-InsulatedSurfaceArea/SurfaceArea);
            equations['Rin']=`Equation2pt30`;
            // console.log(`In use PopupPanel:::In CalculatePressureAPI2000 >>> Rin Calculation >>>> Partial >>>> InsulatedSurfaceArea: ${InsulatedSurfaceArea}, ${config.reqFields['InsulatedSurfaceArea']},${config.reqFields['InsulatedSurfaceAreaUOM']}, SurfaceArea: ${SurfaceArea}, HeatTransferCoefficient: ${HeatTransferCoefficient}, InsulationThickness: ${InsulationThickness}, InsulationThermalConductivity: ${InsulationThermalConductivity}, 
            //             (InsulatedSurfaceArea/SurfaceArea): ${(InsulatedSurfaceArea/SurfaceArea)}, (HeatTransferCoefficient*InsulationThickness): ${(HeatTransferCoefficient*InsulationThickness)}, 
            //             1/(1+((HeatTransferCoefficient*InsulationThickness)/InsulationThermalConductivity)): ${1/(1+((HeatTransferCoefficient*InsulationThickness)/InsulationThermalConductivity))}
            //             numerator: ${(InsulatedSurfaceArea/SurfaceArea)*(1/(1+((HeatTransferCoefficient*InsulationThickness)/InsulationThermalConductivity)))}, (1-InsulatedSurfaceArea/SurfaceArea): ${(1-InsulatedSurfaceArea/SurfaceArea)}
            //             results: ${(InsulatedSurfaceArea/SurfaceArea)*(1/(1+((HeatTransferCoefficient*InsulationThickness)/InsulationThermalConductivity)))+(1-InsulatedSurfaceArea/SurfaceArea)}`)
        }else if(TankHasInsulation==='Double Walled Tank'){
            const OuterContSurAreaPer=config.reqFields['OuterContSurAreaPer']
            const OuterContSurArea=OuterContSurAreaPer*SurfaceArea/100;
            equationValues['OuterContSurArea']=OuterContSurArea;
            inputValues['OuterContSurArea']=OuterContSurArea;
            // console.log(`In use PopupPanel:::In CalculatePressureAPI2000 >>> Rin Calculation >>>> Double Walled Tank >>>> OuterContSurArea: ${config.reqFields['OuterContSurArea']} >> ${OuterContSurArea}, >>> OuterContSurAreaUOM: ${OuterContSurAreaUOM?.UnitKey} ||||||SurfaceArea: ${config.reqFields['SurfaceArea']} >>> ${SurfaceArea}, SurfaceAreaUOM: ${SurfaceAreaUOM?.UnitKey} >>> ${AreaUOM?.UnitKey} ||||||result: ${0.25+0.75*(OuterContSurArea/SurfaceArea)}`)
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
        result=config.reqFields["Rin"];
        // console.log(result, 'In use PopupPanel::: RinCalculatorfunc >>>> inside if >>>>>>>>>>>>>>',result==="" || isNaN(result))
    }
    tcResponse['equationValues']=equationValues;
    tcResponse['inputValues']=inputValues;
    tcResponse['equations']=equations;
    tcResponse['requiredUnits']=requiredUnits;
    tcResponse['receivedUnits']=receivedUnits;
    // console.log(result, 'RinCalculatorfunc >>>> outside if')
    return {Rin:result,tcResponse};
}