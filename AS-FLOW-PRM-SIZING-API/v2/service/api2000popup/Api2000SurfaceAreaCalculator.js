const Math = require('mathjs');
const { convertUnit,CONST_FOR_WATTED_SURFACE_AREA} = require("../../utils/helper");
const { getUOMs } = require('../getUom');

const CalculateApi2000SurfaceAreaAndTankVolume = async (payload) => {
    // console.log('In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume >>>> ',payload)
    // console.log(' >>>>>>>>>>>>> 11111111111111 >>>>>>>>>>>>>>>>>')
    let surfaceAreaResult;
    let tankVolumeResult;
    let wettedAreaResult;
    let result;
    // const payload=config.payloadData;
    let CalculateTankData = true;//payload["CalculateTankData"];
    const CalcMethod = payload["CalculationMethod"];
    let TankShape = payload["TankShape"];
    let Ends = payload["EndsGroup"];
    let IsHorizontalOrientation = payload["IsHorizontalOrientation"];
    let LengthSeamToSeam_Ls = payload["LengthEndToEnd_lt"] - payload["Diameter_d"];
    let RequiredCapacityMethod = payload["RequiredCapacityMethod"];
    const N11 = CalcMethod==='Metric'?CONST_FOR_WATTED_SURFACE_AREA:30;
    const TankHasInsulation = payload["TankHasInsulation"];
    let tcResponse={}
    tcResponse['CalculationMethod']=CalcMethod
    let equationValues={'Diameter_d':'','Height_h':'','VesselWidth_w':'','LengthEndToEnd_lt':'','Elevation_H':'','BottomPlate_Y':'','LengthSeamToSeam_Ls':''};
    let inputValues={'Diameter_d':'','Height_h':'','VesselWidth_w':'','LengthEndToEnd_lt':'','Elevation_H':'','BottomPlate_Y':'','LengthSeamToSeam_Ls':''};
    let equations={};
    let requiredUnits={...payload?.requiredUnits};
    let receivedUnits={};
    const SizingBassis = payload["SizingBassis"];
    const SurfaceAreaFlag= SizingBassis === "sev_Ed_Main" && (TankHasInsulation==='Partial' || TankHasInsulation==='Double Walled Tank')?true:false;
    // console.log(' >>>>>>>>>>>>> 2222222222222 >>>>>>>>>>>>>>>>>',payload?.selectedUnits,requiredUnits)
    if (CalculateTankData) {
        const UOMs=payload?.units===undefined? await getUOMs():payload?.units;
        // console.log(' >>>>>>>>>>>>> 2222222222222 >>>>>>>>>>>>>>>>>', UOMs)
        let LengthUOM=payload?.selectedUnits['LengthUOM'];
        LengthUOM=LengthUOM!==undefined?UOMs.find(u => u.UnitKey===LengthUOM):'';
        receivedUnits['LengthUOM']=LengthUOM;
        
        let dia_uom = payload?.selectedUnits['Diameter_d_UOM'];
        dia_uom = LengthUOM!=='' ?LengthUOM:UOMs.find(u => u.UnitKey===dia_uom);
        let hei_uom = payload?.selectedUnits['Height_h_UOM'];
        hei_uom = LengthUOM!=='' ?LengthUOM:UOMs.find(u => u.UnitKey===hei_uom);
        let vess_w_uom = payload?.selectedUnits["VesselWidth_w_UOM"];
        vess_w_uom = LengthUOM!=='' ?LengthUOM:UOMs.find(u => u.UnitKey===vess_w_uom);
        let EtoE_lt_uom = payload?.selectedUnits["LengthEndToEnd_lt_UOM"];
        EtoE_lt_uom = LengthUOM!=='' ?LengthUOM:UOMs.find(u => u.UnitKey===EtoE_lt_uom);
        let StoS_ls_uom = payload?.selectedUnits["LengthEndToEnd_lt_UOM"];
        StoS_ls_uom = LengthUOM!=='' ?LengthUOM:UOMs.find(u => u.UnitKey===StoS_ls_uom);

        // let length_uom = CalcMethod==='English'?"length.ft":"length.m";//config.requiredUnits["LengthUOM"];
        let length_uom=UOMs.find(u => u.UnitKey===requiredUnits['LengthUOM']);
        requiredUnits['LengthUOM']=length_uom;

        // let area_uom = CalcMethod==='English'?"area.ft2":"area.m2";//config.requiredUnits["AreaUOM"];
        let area_uom=UOMs.find(u => u.UnitKey===requiredUnits['AreaUOM']);
        requiredUnits['AreaUOM']=area_uom;

        // let volume_uom = CalcMethod==='English'?"volume.ft3":"volume.m3";//config.requiredUnits["VolumeUOM"];
        let volume_uom=UOMs.find(u => u.UnitKey===requiredUnits['VolumeUOM']);
        requiredUnits['VolumeUOM']=volume_uom;

        const converted_d = dia_uom !== "" && dia_uom !== undefined ? Number(convertUnit(payload['Diameter_d'], dia_uom, length_uom)) : "";
        inputValues['Diameter_d']=payload['Diameter_d'];
        equationValues['Diameter_d']=converted_d;
        // console.log(' >>>>>>>>>>>>> 3333333 >>>>>>>>>>>>>>>>>')
        if (TankShape === 'Spherical') {
            surfaceAreaResult = (Math.pi * Math.pow(converted_d, 2));
            equations['SurfaceArea'] = `A' = π * d^2`;
            
            tankVolumeResult = (Math.pi * Math.pow(converted_d, 3)) / 6;
            equations['TankVolume'] = `VOL = π * (d^3) / 6`;
            equationValues['SurfaceArea'] = surfaceAreaResult;
            equationValues['TankVolume'] = tankVolumeResult;
            // console.log(' >>>>>>>>>>>>> 444444444 >>>>>>>>>>>>>>>>',{TankShape, Diameter_d:payload['Diameter_d'], dia_uom, length_uom, converted_d, surfaceAreaResult, tankVolumeResult,SurfaceAreaFlag,TankHasInsulation,SizingBassis});
            // console.log(`In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume 111111 >>> d::: ${payload['Diameter_d']} >>> dia_uom:: ${dia_uom?.UnitKey} >>> length_uom::: ${length_uom}>>> converted_d:: ${converted_d} >>>> SurfaceArea ::: ${surfaceAreaResult} >>>> TankVolume ::: ${tankVolumeResult}`)
        } else if (TankShape === 'Rectangular') {
            const converted_h = hei_uom !== "" && hei_uom !== undefined ? convertUnit(payload['Height_h'], hei_uom, length_uom) : "";
            const converted_V_w = vess_w_uom !== "" && vess_w_uom !== undefined ? convertUnit(payload['VesselWidth_w'], vess_w_uom, length_uom) : "";
            const converted_EtoE_lt = EtoE_lt_uom !== "" && EtoE_lt_uom !== undefined ? convertUnit(payload['LengthEndToEnd_lt'], EtoE_lt_uom, length_uom) : "";

            inputValues['Height_h']=payload['Height_h'];
            inputValues['VesselWidth_w']=payload['VesselWidth_w'];
            inputValues['LengthEndToEnd_lt']=payload['LengthEndToEnd_lt'];

            equationValues['Height_h']=converted_h;
            equationValues['VesselWidth_w']=converted_V_w;
            equationValues['LengthEndToEnd_lt']=converted_EtoE_lt;

            surfaceAreaResult = 2 * ((converted_EtoE_lt * converted_h) + (converted_h * converted_V_w) + (converted_V_w * converted_EtoE_lt));
            tankVolumeResult = converted_h * converted_V_w * converted_EtoE_lt;
            equations['SurfaceArea'] = `A' = 2 * ((Lt * h) + (h * w) + (w * Lt))`;
            equations['TankVolume'] = `VOL = h * w * Lt`;
            equationValues['SurfaceArea'] = surfaceAreaResult;
            equationValues['TankVolume'] = tankVolumeResult;
        } else if (TankShape === 'Cylindrical' && Ends === 'FlatEnds') {
            const converted_h = hei_uom !== "" && hei_uom !== undefined ? convertUnit(payload['Height_h'], hei_uom, length_uom) : "";
            const converted_EtoE_lt = EtoE_lt_uom !== "" && EtoE_lt_uom !== undefined ? convertUnit(payload['LengthEndToEnd_lt'], EtoE_lt_uom, length_uom) : "";
            inputValues['Height_h']=payload['Height_h'];
            inputValues['LengthEndToEnd_lt']=payload['LengthEndToEnd_lt'];

            equationValues['Height_h']=converted_h;
            equationValues['LengthEndToEnd_lt']=converted_EtoE_lt;
            // console.log({})
            if (IsHorizontalOrientation === 'Horizontal') {
                surfaceAreaResult = Math.pi * converted_d * (converted_EtoE_lt + (converted_d / 2));
                tankVolumeResult = (Math.pi * Math.pow(converted_d, 2) * converted_EtoE_lt) / 4;
                equations['SurfaceArea'] = `A' = π * d * (Lt + (d / 2))`;
                equations['TankVolume'] = `VOL = (π * (d^2) * Lt) / 4`;
                // console.log({TankShape, Ends, IsHorizontalOrientation, Diameter_d:payload['Diameter_d'], dia_uom, length_uom, converted_d, LengthEndToEnd_lt:payload['LengthEndToEnd_lt'], EtoE_lt_uom, converted_EtoE_lt, Height_h:payload['Height_h'], hei_uom, converted_h, surfaceAreaResult, tankVolumeResult,SurfaceAreaFlag,TankHasInsulation,SizingBassis});
            } else {
                surfaceAreaResult = Math.pi * converted_d * (converted_h + (converted_d / 2));
                tankVolumeResult = (Math.pi * Math.pow(converted_d, 2) * converted_h) / 4;
                equations['SurfaceArea'] = `A' = π * d * (h + (d / 2))`;
                equations['TankVolume'] = `VOL = (π * d^2 * h) / 4`;
            }
            equationValues['SurfaceArea'] = surfaceAreaResult;
            equationValues['TankVolume'] = tankVolumeResult;
        } else {
            const converted_EtoE_lt = EtoE_lt_uom !== "" && EtoE_lt_uom !== undefined ? convertUnit(payload['LengthEndToEnd_lt'], EtoE_lt_uom, length_uom) : "";
            const converted_StoS_ls = StoS_ls_uom !== "" && StoS_ls_uom !== undefined ? convertUnit(LengthSeamToSeam_Ls, StoS_ls_uom, length_uom) : "";
            inputValues['LengthEndToEnd_lt']=payload['LengthEndToEnd_lt'];
            equationValues['LengthEndToEnd_lt']=converted_EtoE_lt;
            inputValues['LengthSeamToSeam_Ls']=LengthSeamToSeam_Ls;
            equationValues['LengthSeamToSeam_Ls']=converted_StoS_ls;
            surfaceAreaResult = Math.pi * converted_d * converted_EtoE_lt;
            tankVolumeResult = (Math.pi * Math.pow(converted_d, 2) * ((2 * converted_d) + (3 * converted_StoS_ls))) / 12;
            equations['SurfaceArea'] = `A' = π * d * Lt`;
            equations['TankVolume'] = `VOL = [ π * d^2 * ( (2 * d) + (3 * Ls) ) ] / 12`;
            equationValues['SurfaceArea'] = surfaceAreaResult;
            equationValues['TankVolume'] = tankVolumeResult;
        }
        // console.log(' >>>>>>>>>>>>> 55555555555555 >>>>>>>>>>>>>>>>>')
        // console.log(`In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume 111111 >>> TankShape:: ${TankShape}>>> d::: ${payload['Diameter_d']} >>> dia_uom:: ${dia_uom?.UnitKey} >>> length_uom::: ${length_uom}>>> converted_d:: ${converted_d} >>>> SurfaceArea ::: ${surfaceAreaResult} >>>> TankVolume ::: ${tankVolumeResult}`)
        if (surfaceAreaResult === "" || isNaN(surfaceAreaResult) || !SurfaceAreaFlag) {
            surfaceAreaResult = "";
            equationValues['SurfaceArea'] = surfaceAreaResult;
            inputValues['SurfaceArea']=surfaceAreaResult;
        } else {
            let surface_area_uom = payload?.selectedUnits['AreaUOM'];
            surface_area_uom = surface_area_uom !== "" ? UOMs.find(u => u.UnitKey === surface_area_uom) : area_uom;
            receivedUnits['AreaUOM']=surface_area_uom;
            // console.log(`In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume 111111 22222 >>> TankShape:: ${TankShape} >> from UOM :${area_uom?.UnitKey} >>> to UOM::: ${surface_area_uom?.UnitKey}>>> surfaceAreaResult ::: ${surfaceAreaResult} >> OuterContSurAreaPer >> ${payload['OuterContSurAreaPer']} >> OuterContSurArea :: ${payload['OuterContSurArea']}`)
            surfaceAreaResult = convertUnit(surfaceAreaResult, area_uom, surface_area_uom);
            receivedUnits['AreaUOM']=surface_area_uom;  
            requiredUnits['AreaUOM']=area_uom;
            inputValues['SurfaceArea']=surfaceAreaResult;
            // console.log('>>>>>>>>>>>> Surface Area >>>>>>>> ',{surfaceAreaResult, surface_area_uom, area_uom});
        }
        let OuterContSurAreaPer=payload['OuterContSurAreaPer'];
        OuterContSurAreaPer=isNaN(OuterContSurAreaPer)?isNaN(payload['OuterContSurAreaPer'])?'':Number(payload['OuterContSurAreaPer']):Number(OuterContSurAreaPer)
        const OuterContSurArea = OuterContSurAreaPer===''?'':Number(surfaceAreaResult)*(OuterContSurAreaPer/100);

        let InsulatedPercentOfATilt=payload['InsulatedPercentOfATilt'];
        InsulatedPercentOfATilt=isNaN(InsulatedPercentOfATilt)?isNaN(payload['InsulatedPercentOfATilt'])?'':Number(payload['InsulatedPercentOfATilt']):Number(InsulatedPercentOfATilt)
        const InsulatedSurfaceArea = InsulatedPercentOfATilt===''?'':Number(surfaceAreaResult)*(InsulatedPercentOfATilt/100);
        
        if(SurfaceAreaFlag){
            equationValues['OuterContSurArea']=OuterContSurArea;
            equationValues['InsulatedSurfaceArea']=InsulatedSurfaceArea;
        }else{
            equationValues['OuterContSurArea']='';
            equationValues['InsulatedSurfaceArea']='';
        }
        // console.log(`In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume 22222 >>> TankShape:: ${TankShape}>>> surfaceAreaResult ::: ${surfaceAreaResult} :: OuterContSurArea >> ${OuterContSurArea}`)
        if (tankVolumeResult === "" || isNaN(tankVolumeResult)) {
            tankVolumeResult = "0.000";
            equationValues['TankVolume'] = tankVolumeResult;
        } else {
            let tank_vol_uom = payload?.selectedUnits['TankVolumeUOM'];
            tank_vol_uom = tank_vol_uom !== "" ? UOMs.find(u => u.UnitKey === tank_vol_uom) : volume_uom;
            receivedUnits['VolumeUOM']=tank_vol_uom;
            // console.log(`In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume 22222 333333 >>> TankShape:: ${TankShape} >> from UOM :${volume_uom?.UnitKey} >>> to UOM::: ${tank_vol_uom?.UnitKey}>>> tankVolumeResult ::: ${tankVolumeResult}`)
            tankVolumeResult = convertUnit(tankVolumeResult, volume_uom, tank_vol_uom);
            receivedUnits['VolumeUOM']=tank_vol_uom;
            requiredUnits['VolumeUOM']=volume_uom;
            inputValues['TankVolume']=tankVolumeResult;
            // console.log(`In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume 333333 >>> TankShape:: ${TankShape}>>> tankVolumeResult ::: ${tankVolumeResult} >>>>> `,volume_uom.UnitKey, tank_vol_uom.UnitKey)
        }
        // console.log(' >>>>>>>>>>>>> 6666666666666666 >>>>>>>>>>>>>>>>>')
        result = { SurfaceArea: surfaceAreaResult,OuterContSurArea:OuterContSurArea,InsulatedSurfaceArea:InsulatedSurfaceArea, TankVolume: tankVolumeResult };
        if(RequiredCapacityMethod === "Emergency"){
            let reqWettedArea=CalcMethod==='Metric'?"area.m2":"area.ft2";

            reqWettedArea=UOMs.find(u => u.UnitKey===reqWettedArea);

            const elev_uom = LengthUOM!=='' ?LengthUOM:payload['Elevation_H_UOM'];
            const Elevation_H = elev_uom !== "" && elev_uom !== undefined ? Number(convertUnit(payload['Elevation_H'], elev_uom, length_uom)) : "";
            inputValues['Elevation_H']=payload['Elevation_H'];
            equationValues['Elevation_H']=Elevation_H;
            const converted_h = hei_uom !== "" && hei_uom !== undefined ? Number(convertUnit(payload['Height_h'], hei_uom, length_uom)) : "";
            inputValues['Height_h']=payload['Height_h'];
            equationValues['Height_h']=converted_h;
            let BottomPlate_Y = payload['BottomPlate_Y'];
            inputValues['BottomPlate_Y']=BottomPlate_Y;
            if (TankShape === 'Spherical') {
                let K1 = Elevation_H + converted_d;
                let Kf = (K1 < N11) ? K1 : N11;
                let E1 = Kf - Elevation_H;
                let Ef = E1 > 0 ? E1 : 0;
                let Es = Ef > 0.55*converted_d ? Ef : 0.55*converted_d;
                wettedAreaResult = Math.pi * converted_d * Es;
                equations['WettedArea'] = `Equation3pt6`;
                equationValues['WettedArea']=wettedAreaResult;
                equationValues['Es']=Es;
                equationValues['Ef']=Ef
            }else if(TankShape === 'Rectangular'){
                const converted_V_w = vess_w_uom !== "" && vess_w_uom !== undefined ? Number(convertUnit(payload['VesselWidth_w'], vess_w_uom, length_uom)) : "";
                inputValues['VesselWidth_w']=payload['VesselWidth_w'];
                equationValues['VesselWidth_w']=converted_V_w;
                const converted_EtoE_lt = EtoE_lt_uom !== "" && EtoE_lt_uom !== undefined ? Number(convertUnit(payload['LengthEndToEnd_lt'], EtoE_lt_uom, length_uom)) : "";
                inputValues['LengthEndToEnd_lt']=payload['LengthEndToEnd_lt'];
                equationValues['LengthEndToEnd_lt']=converted_EtoE_lt;
                let orientation = converted_h < converted_EtoE_lt || converted_h < converted_V_w ? 'Horizontal' : 'Vertical'; 
                inputValues['Orientation']=orientation;
                let K1 = Elevation_H + converted_h
                let Kf = K1< N11 ? K1: N11;
                let E1 = Kf - Elevation_H;
                let Ef = E1 >0 ?E1:0;
                BottomPlate_Y =Elevation_H==0 ? 0 : BottomPlate_Y/100;
                let Awet_a = 1.5*((converted_EtoE_lt*converted_h)+(converted_h*converted_V_w)+(converted_V_w*converted_EtoE_lt));
                let Awet_b = 2*Ef(converted_EtoE_lt+converted_V_w)+BottomPlate_Y*converted_EtoE_lt*converted_V_w;
                if(orientation==='Horizontal'){
                    wettedAreaResult = Awet_a>Awet_b?Awet_a:Awet_b;
                    equations['WettedArea'] = Awet_a>Awet_b?`Equation3pt12`:`Equation3pt13`;
                }else{
                    wettedAreaResult = Awet_b;
                    equations['WettedArea'] = `Equation_3pt13`;
                }
                equationValues['WettedArea']=wettedAreaResult;
                equationValues['Y']=BottomPlate_Y;
                equationValues['Ef']=Ef
            }else if(TankShape === 'Cylindrical'){
                if(Ends === 'FlatEnds' && IsHorizontalOrientation !== 'Horizontal'){
                    // use 3.3.2
                    
                    let K1 = Elevation_H + converted_h
                    let Kf = K1< N11 ? K1: N11;
                    let E1 = Kf - Elevation_H;
                    let Ef = E1 >0 ?E1:0;
                    BottomPlate_Y =Elevation_H==0 ? 0 : (BottomPlate_Y/100);
                    wettedAreaResult = Math.pi * converted_d *(Ef+((BottomPlate_Y*converted_d)/4));
                    equationValues['WettedArea']=wettedAreaResult;
                    equationValues['Y']=BottomPlate_Y;
                    equationValues['Ef']=Ef;
                    equations['WettedArea'] = `Equation3pt7`;

                }else if(Ends === 'FlatEnds' && IsHorizontalOrientation === 'Horizontal'){
                    // use 3.3.3
                    const converted_EtoE_lt = EtoE_lt_uom !== "" && EtoE_lt_uom !== undefined ? Number(convertUnit(payload['LengthEndToEnd_lt'], LengthUOM, length_uom)) : "";
                    inputValues['LengthEndToEnd_lt']=payload['LengthEndToEnd_lt'];
                    equationValues['LengthEndToEnd_lt']=converted_EtoE_lt;

                    let K1 = Elevation_H + converted_d
                    let Kf = K1< N11 ? K1: N11;
                    let E1 = Kf - Elevation_H;
                    let Ef = E1 >0 ?E1:0;
                    const B=Math.acos(1-(2*Ef/converted_d)) * (180/Math.pi);
                    equations['B'] = `B = acos[ 1 - (2 * Ef / d) ]`;
                    let Awet_a =  (Math.pi * converted_d * (B/180))* (converted_EtoE_lt+(converted_d/2)) - (converted_d*(converted_d/2 -Ef)*Math.sin(B));
                    let Awet_b = 0.75*(Math.pi * converted_d*(converted_EtoE_lt+(converted_d/2)));
                    wettedAreaResult = Awet_a >Awet_b?Awet_a:Awet_b;
                    equationValues['WettedArea']=wettedAreaResult;
                    equationValues['B']=B;
                    equationValues['Ef']=Ef;
                    equations['WettedArea'] = Awet_a >Awet_b?`Equation3pt8`:`Equation3pt9`;

                }else if(Ends !== 'FlatEnds' && IsHorizontalOrientation !== 'Horizontal'){
                    // use 3.3.6
                    const converted_EtoE_lt = EtoE_lt_uom !== "" && EtoE_lt_uom !== undefined ? Number(convertUnit(payload['LengthEndToEnd_lt'], EtoE_lt_uom, length_uom)) : "";
                    inputValues['LengthEndToEnd_lt']=payload['LengthEndToEnd_lt'];
                    equationValues['LengthEndToEnd_lt']=converted_EtoE_lt;
                    let K1 = Elevation_H + converted_EtoE_lt
                    let Kf = K1< N11 ? K1: N11;
                    let E1 = Kf - Elevation_H;
                    let Ef = E1 >0 ?E1:0; 
                    wettedAreaResult = Math.pi *converted_d *Ef;
                    equationValues['WettedArea']=wettedAreaResult;
                    equationValues['Ef']=Ef;
                    equations['WettedArea'] = `Awet = π * d * Ef`;
                }else if(Ends !== 'FlatEnds' && IsHorizontalOrientation === 'Horizontal'){
                    // use 3.3.4
                    const converted_EtoE_lt = EtoE_lt_uom !== "" && EtoE_lt_uom !== undefined ? Number(convertUnit(payload['LengthEndToEnd_lt'], EtoE_lt_uom, length_uom)) : "";
                    const converted_StoS_ls = StoS_ls_uom !== "" && StoS_ls_uom !== undefined ? Number(convertUnit(LengthSeamToSeam_Ls, StoS_ls_uom, length_uom)) : "";
                    inputValues['LengthEndToEnd_lt']=payload['LengthEndToEnd_lt'];
                    equationValues['LengthEndToEnd_lt']=converted_EtoE_lt;
                    inputValues['LengthSeamToSeam_Ls']=LengthSeamToSeam_Ls;
                    equationValues['LengthSeamToSeam_Ls']=converted_StoS_ls;
                    let K1 = Elevation_H + converted_d
                    let Kf = K1< N11 ? K1: N11;
                    let E1 = Kf - Elevation_H;
                    let Ef = E1 >0 ?E1:0; 
                    const B=Math.acos(1-(2*Ef/converted_d)) * (180/Math.pi);
                    equations['B'] = `B = acos[ 1 - (2 * Ef / d) ]`;

                    let Awet_a = Math.pi*converted_d*(Ef+((converted_StoS_ls*B)/180));
                    let Awet_b = 0.75*Math.pi*converted_d*converted_EtoE_lt;
                    wettedAreaResult = Awet_a >Awet_b?Awet_a:Awet_b;
                    equationValues['WettedArea']=wettedAreaResult;
                    equationValues['B']=B;
                    equationValues['Ef']=Ef;
                    equations['WettedArea'] = Awet_a >Awet_b?`Equation3pt10`:`Equation3pt11`;
                }
            }

            if (wettedAreaResult === "" || isNaN(wettedAreaResult)) {
                wettedAreaResult = "0.000";
            } else {
                let WettedAreaUOM = payload?.selectedUnits['AreaUOM'];
                WettedAreaUOM=UOMs.find(u => u.UnitKey===WettedAreaUOM);
                receivedUnits['WettedAreaUOM']=WettedAreaUOM;
                requiredUnits['WettedAreaUOM']=reqWettedArea;
                wettedAreaResult = Number(convertUnit(wettedAreaResult,reqWettedArea,  WettedAreaUOM));
                // console.log(`In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume >>>  wettedAreaResult: ${wettedAreaResult} >>> WettedAreaUOM: ${WettedAreaUOM?.UnitKey} >>> reqWettedArea: ${reqWettedArea?.UnitKey}`)
            }
            // const EmerSurfaceArea=payload['SurfaceArea'];
            result = {...result,WettedArea:wettedAreaResult,SurfaceArea:surfaceAreaResult};
        }
    }

    // console.log(' >>>>>>>>>>>>> 777777777777777777 >>>>>>>>>>>>>>>>>')
    // console.log(`In usePopupPanel:::In CalculateApi2000SurfaceAreaAndTankVolume >>> final >>>> SurfaceArea ::: ${result?.SurfaceArea} >>>> TankVolume ::: ${result?.TankVolume} >>>>>>>>>> result >>>>>>> `,result)
    tcResponse['equations']=equations;
    tcResponse['inputValues']=inputValues;
    tcResponse['equationValues']=equationValues;
    tcResponse['requiredUnits']=requiredUnits;
    tcResponse['receivedUnits']=receivedUnits;
    result={...result,tcResponse:tcResponse};
    return result;
    // return {SurfaceArea:result};
}

module.exports = {
    CalculateApi2000SurfaceAreaAndTankVolume
};