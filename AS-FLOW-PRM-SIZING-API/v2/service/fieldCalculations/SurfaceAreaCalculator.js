// const math = require('mathjs');

const math= require('mathjs');
const { convertUnit,convertUnitDiffDims, getConstants } = require("../../utils/helper");
const { getUOMs } = require('../getUom');


function calculateRadius(a, c, z) {
    return a * math.sqrt(1 - math.pow(z, 2) / math.pow(c, 2));
}

function calculateAngle(x, r) {
    const tolerance = 0.00000001;

    let theta = 2 * math.pi;
    let distanceFromOrigin = math.abs(x);

    if (r === 0) {
        theta = 0;
    } else if (math.abs(distanceFromOrigin - r) < tolerance) {
        theta = 2 * math.pi;
    } else if (distanceFromOrigin < r) {
        theta = 2 * math.acos(x / r);
    }

    return theta;
}

function calculateFrustumSurfaceArea(r1, r2, h) {
    if (r1 < r2) {
        let temp = r1;
        r1 = r2;
        r2 = temp;
    }
    return math.pi * (r1 + r2) * math.sqrt(math.pow(r1 - r2, 2) + math.pow(h, 2));
}

function calculateCylinderSurfaceArea(r, h, theta) {
    // Standard formula: SA = theta * r * h, where theta = 2 * pi
    return theta * r * h;
}


function calculateVerticalCylinderAwet(majorRadius, fluidLevel, cylinderLength) {
    let cylinderSurfaceArea = 0;
    let length = 0;
    let minorRadius = majorRadius / 2;

    if (fluidLevel > cylinderLength + minorRadius) {
        length = cylinderLength;
    } else if (fluidLevel > minorRadius) {
        length = fluidLevel - minorRadius;
    }

    if (length > 0) {
        cylinderSurfaceArea = calculateCylinderSurfaceArea(majorRadius, length, 2 * math.pi);
    }

    return cylinderSurfaceArea;
}

function calculateHorizontalCylinderAwet(majorRadius, fluidLevel, cylinderLength) {
    let theta = 0;
    let distanceFromOrigin = 0;

    if (fluidLevel < majorRadius) {
        distanceFromOrigin = majorRadius - fluidLevel;
        theta = 2 * math.acos(distanceFromOrigin / majorRadius);
    } else if (fluidLevel > majorRadius) {
        distanceFromOrigin = fluidLevel - majorRadius;
        theta = 2 * math.pi - 2 * math.acos(distanceFromOrigin / majorRadius);
    } else {
        // Fluid level is exactly half
        theta = math.pi;
    }

    return calculateCylinderSurfaceArea(majorRadius, cylinderLength, theta);
}
//cylinderLength --> Ls, fluidLevel --> Ef, majorRadius --> d/2
function calculateVerticalEllipsoidalAwet(majorRadius, fluidLevel, cylinderLength, totalFrustums=10000) {
    let tankLengthEndToEnd = majorRadius + cylinderLength;

    // Validate inputs
    if (tankLengthEndToEnd < fluidLevel) {
        throw new Error("The fluid level cannot exceed the top of the tank");
    }

    let totalSurfaceArea = 0;

    // Initialize the axes of the ellipsoid where a, c are the radii along the x, z axes, respectively
    let a = majorRadius;
    let c = majorRadius / 2;

    // Initialize the incremental elevation; start at the bottom of the tank
    let z = -c;

    // Initialize the maximum elevation in the xz-coordinate plane
    let maxZ = 0;
    let relativeAbsoluteFluidLevel = 0;

    if (fluidLevel === tankLengthEndToEnd) {
        // The tank is full (i.e. both ends are full)
        maxZ = c;
        relativeAbsoluteFluidLevel = 2 * c;
    } else if (fluidLevel > tankLengthEndToEnd - c) {
        // The bottom end is full, and the fluid level has reached (but not filled) the top end
        maxZ = fluidLevel - cylinderLength - c;
        relativeAbsoluteFluidLevel = maxZ + c;
    } else if (fluidLevel <= tankLengthEndToEnd - c && fluidLevel >= c) {
        // The bottom end is full, but the fluid level has not reached the top end
        maxZ = 0;
        relativeAbsoluteFluidLevel = c;
    } else if (fluidLevel < c) {
        // The bottom end is only partially full
        maxZ = fluidLevel - c;
        relativeAbsoluteFluidLevel = fluidLevel;
    }

    // Calculate the elevation of each frustum
    let h = relativeAbsoluteFluidLevel / totalFrustums;
    let i = 1;

    // Calculate the surface area
    while (z < maxZ && i <= totalFrustums) {
        let z1 = z;
        let z2 = z + h;

        if (z2 > maxZ || i === totalFrustums) {
            z2 = maxZ;
        }

        let r1 = calculateRadius(a, c, z1);
        let r2 = calculateRadius(a, c, z2);

        let frustumSurfaceArea = calculateFrustumSurfaceArea(r1, r2, h);

        totalSurfaceArea += frustumSurfaceArea;

        // Increment to the next elevation
        z = z2;
        i++;
    }

    return totalSurfaceArea;
}

function calculateHorizontalEllipsoidalAwet(majorRadius, fluidLevel, totalFrustums=10000) {
    let totalSurfaceArea = 0;
    
    // Initialize the axes of the ellipsoid where a, c are the radii along the x, z axes, respectively
    let a = majorRadius;
    let c = majorRadius / 2;

    // Initialize the incremental elevation
    let z = 0;

    // Convert the absolute water level to an x-coordinate plane in 3D-space
    let x = majorRadius - fluidLevel;

    // Initialize the maximum elevation
    let maxZ = c;

    if (x > 0) {
        // If the plane of the water elevation is positive, then limit how far up the tank we will calculate
        maxZ = c * math.sqrt(1 - math.pow(x, 2) / math.pow(a, 2));
    }

    // Calculate the elevation of each frustum
    let h = maxZ / totalFrustums;
    let i = 1;

    // Calculate the surface area
    while (z < maxZ && i <= totalFrustums) {
        let z1 = z;
        let z2 = z + h;

        if (z2 > maxZ || i === totalFrustums) {
            z2 = maxZ;
        }

        let r1 = calculateRadius(a, c, z1);
        let r2 = calculateRadius(a, c, z2);

        let theta1 = calculateAngle(x, r1);
        let theta2 = calculateAngle(x, r2);

        let percentageCovered = 0;

        if (r2 !== 0) {
            percentageCovered = (theta1 + theta2) / (4 * math.pi);
        } else {
            percentageCovered = theta1 / (2 * math.pi);
        }

        let frustumSurfaceArea = calculateFrustumSurfaceArea(r1, r2, h) * percentageCovered;

        totalSurfaceArea += frustumSurfaceArea;

        // Increment to the next elevation
        z = z2;
        i++;
    }

    return totalSurfaceArea;
}

const calculate_Ef=(H,f,CalcMethod)=>{
    // console.log(`in Calculate AreaMethods: > In calculate Ef >>>> H:${H},f:${f},CalcMethod:${CalcMethod}`);
    const N19=CalcMethod==='English'?25:7.62;
    const K2=f+H;
    
    const Kf=K2<N19?K2:N19;
    const E1=Kf-H;
    const Ef=E1>0?E1:0;
    // console.log(`in Calculate AreaMethods: > In calculate Ef:: End >>>> N19:${N19}, K2:${K2},Kf:${Kf},E1:${E1},Ef:${Ef}`);
    return Ef;
}

const CalculateRatedFlow= (payload,Output,Y=null)=>{
    let Wreqp="";
    let tcResponse={};
    let equationValues={};
    let inputValues={};
    let requiredUnits={};
    let receivedUnits={};
    let equations={};

    const uoms=payload?.units;

    let WettedAreaUOM=payload?.selectedUnits["AreaUOM"];
    if(WettedAreaUOM===undefined || WettedAreaUOM==="" || WettedAreaUOM===null){
        WettedAreaUOM=payload.selectedUnits['AreaUOM'];
    }
    WettedAreaUOM=uoms.find(u => u.UnitKey === WettedAreaUOM);
    let Hvap=payload['LatentHeatOfVapor'];
    let F=payload['EnvironmentalFactor'];
    inputValues['LatentHeatOfVapor']=Hvap;
    inputValues['EnvironmentalFactor']=F;
    let WettedArea=Output
    inputValues['Awet']=WettedArea;
    let newOutput={WettedArea,"WettedAreaUOM":WettedAreaUOM.UnitKey};
    // console.log('In Calculate RatedFlow >>>>>>>>>',WettedArea,newOutput,Hvap,F);
    if(WettedArea!==undefined && WettedArea!=="" && WettedArea!==null 
        && Hvap!=='' && Hvap!==undefined && Hvap!==null && Hvap!=0
        && F!=='' && F!==undefined && F!==null
    ){
        

        const pressureUOM=uoms.find(u => u.UnitKey===payload?.selectedUnits['PressureUOM']);
        const TemperatureUOM=uoms.find(u => u.UnitKey===payload?.selectedUnits['TemperatureUOM']);
        const absPressureUOM=uoms.find(u => u.UnitKey===payload?.selectedUnits['AtmPressureUOM']);
        const payloadData={
            'PressureUOM':pressureUOM, 
            'TemperatureUOM':TemperatureUOM, 
            'AtmPressureUOM':absPressureUOM,
            'MolWeight':payload['MolWeight'],
            'SpGravity':payload['SpGravity'],
            'SetPressure':payload['SetPressure'],
            'OverPressure':payload['OverPressure'],
            'InletLoss':payload['InletLoss'],
            'AtmPressure':payload['AtmPressure'],
            'Relieving':payload['Relieving']
        };
        // console.log(`In   >>>>>>>>>>`,uoms['latentheat'],payload)
        // const displayUnitSystem=payload['DisplayUnitSystem']
        const CalcMethod='English' //displayUnitSystem==='Metric'?'Metric':'English' //payload['CalculationMethod'];
        const constants = getConstants(CalcMethod);
        let N38 = constants.N38;
        // let N37 = payload['DrianExist'] ? constants.N37_1 : constants.N37_2;
        const N37_2= constants.N37_2;
        const N37_1=constants.N37_1;
        const IsPromptFFEADExists=payload['IsPromptFFEADExists']
        let N37 = IsPromptFFEADExists ? N37_1 : N37_2;
        // console.log(`In Calculate RatedFlow >>>>>>>>> CalcMethod: ${CalcMethod} >>> IsPromptFFEADExists: ${IsPromptFFEADExists} >>> N37_1: ${N37_1} >>> N37_2: ${N37_2} >>> N38: ${N38}`)
        let Hvap_uom=CalcMethod==='English'?"latentheat.BTUlb" : "latentheat.Jkg";
        Hvap_uom=uoms.find(u => u.UnitKey===Hvap_uom);
        requiredUnits['HvapUOM']=Hvap_uom;
        let Wreqp_uom=CalcMethod==='English'?"massflow.lbhr" : "massflow.kghr";
        requiredUnits['WreqpUOM']=Wreqp_uom;
        Wreqp_uom=uoms.find(u => u.UnitKey === Wreqp_uom);
        let req_WettedArea_UOM=CalcMethod==='English'?"area.ft2" : "area.m2";
        requiredUnits['WettedAreaUOM']=req_WettedArea_UOM;
        req_WettedArea_UOM=uoms.find(u => u.UnitKey === req_WettedArea_UOM);
        F=Number(F);
               
        Hvap=Number(Hvap);
        let req_hvap_uom=payload?.selectedUnits['LatentHeatOfVaporUOM'];
        req_hvap_uom=uoms.find(u => u.UnitKey===req_hvap_uom);
        receivedUnits['HvapUOM']=req_hvap_uom;
        // console.log(`In Calculate RatedFlow >>>>>>>>>> Hvap: ${Hvap}, req_hvap_uom:${req_hvap_uom?.UnitKey}`);      
        const converted_Hvap=Number(convertUnit(Hvap, req_hvap_uom, Hvap_uom));
        equationValues['Hvap']=converted_Hvap;
        
        let WreqAddp=payload['AddCapacityForPressure']
        WreqAddp=WreqAddp===''|| WreqAddp===undefined || WreqAddp===null?0:Number(WreqAddp);
        inputValues['AddCapacityForPressure']=WreqAddp;
        let WreqAddp_UOM=payload?.selectedUnits['FlowCapacityUOM'];
        receivedUnits['WreqAddpUOM']=WreqAddp_UOM;
        WreqAddp_UOM=uoms.find(u => u.UnitKey === WreqAddp_UOM);
        // WreqAddp=convertUnit(WreqAddp, WreqAddp_UOM, Wreqp_uom);
        WreqAddp = Number(convertUnitDiffDims(WreqAddp, WreqAddp_UOM, Wreqp_uom, uoms, payloadData));
        equationValues['WreqAddp']=WreqAddp;
        // console.log(`In Calculate RatedFlow >>>>>>>>>> Wreqp_uom >> ${Wreqp_uom?.UnitKey}, WreqAddp_UOM >> ${WreqAddp_UOM?.UnitKey}, WreqAddp >> ${WreqAddp} , WreqAddp>> ${WreqAddp}`);
        
        const converted_WettedArea=Number(convertUnit(WettedArea, WettedAreaUOM, req_WettedArea_UOM));
        equationValues['Awet']=converted_WettedArea;
        // console.log(`In Calculate RatedFlow >>>>>>>>> req_WettedArea_UOM >> ${req_WettedArea_UOM?.UnitKey}, WettedAreaUOM >> ${WettedAreaUOM?.UnitKey}, WettedArea >> ${WettedArea}, converted_WettedArea: ${converted_WettedArea}`);
        
        let Q = Number(N37) * Number(F) * math.pow(converted_WettedArea ,0.82);
        equationValues['Q']=Q;
        equations['Q']=N37==1?`Q = F * Awet^0.82`:`Q = ${N37} * F * Awet^0.82`;
        console.log(`In Calculate RatedFlow >>>>>>>>>:: Q: ${Q} = N37: ${N37} * F:${F} * WettedArea:${converted_WettedArea}^0.82 >>>> Wreqp_uom:${Wreqp_uom?.UnitKey} >>> WreqAddp_UOM:${WreqAddp_UOM.UnitKey} >>> WettedAreaUOM:${WettedAreaUOM.UnitKey}`);
        
        Wreqp = (Number(N38) * Q / converted_Hvap) + Number(WreqAddp);
        equations['Wreqp']=N38==1?`Wreqp = Q / Hvap + Wadd`:`Wreqp = (${N38} * Q / Hvap) + Wadd`;
        // console.log(`in Calculate AreaMethods: >>>>In Calculate RatedFlow >>>>>>>>>:: Before >> Wreqp>> (Number(N38): ${Number(N38)} * Q:${Q} / Hvap: ${converted_Hvap}) + WreqAddp: ${WreqAddp} = Wreqp: ${Wreqp} , Wreqp_uom >> ${Wreqp_uom?.UnitKey}, WreqAddp_UOM >> ${WreqAddp_UOM.UnitKey}`);
        // Wreqp = convertUnit(Wreqp, Wreqp_uom, WreqAddp_UOM);
        equationValues['Wreqp']=Wreqp;
        Wreqp=Number(convertUnitDiffDims(Wreqp, Wreqp_uom, WreqAddp_UOM, uoms, payloadData));
        inputValues['Wreqp']=Wreqp;
        receivedUnits['WreqpUOM']=WreqAddp_UOM;
        requiredUnits['WreqpUOM']=Wreqp_uom;
        // console.log(`in Calculate AreaMethods: >>>> In Calculate RatedFlow >>>>>>>>>:: After >>> Wreqp>> ${Wreqp} , Wreqp_uom >> ${Wreqp_uom?.UnitKey}, WreqAddp_UOM >> ${WreqAddp_UOM.UnitKey}`);
    }
    tcResponse={equationValues,inputValues,requiredUnits,receivedUnits,equations};
    newOutput={...newOutput,BottomPlatPer:Y===2?200:null,'RequiredPressureFlow':Wreqp,'Wreq':Wreqp,tcResponse};

    return newOutput;
}

const CalculateAreaMethods=async (payload)=>{

    let Output;
    let LtFlag=false;
    let addedFields={};
    
    // console.log('in Calculate AreaMethods: >>>> Cylindrical >> Horizontal >> EllipticalEnds >>>>>>>>>>. ',payload["EnterTankData"],payload["CalculateTankData"]);
    let tcResponse={};
    let equationValues={'Diameter_d':'','Height_h':'','VesselWidth_w':'','LengthEndToEnd_lt':'','Elevation_H':'','BottomPlate_Y':'','LengthSeamToSeam_Ls':''};
    let inputValues={'Diameter_d':'','Height_h':'','VesselWidth_w':'','LengthEndToEnd_lt':'','Elevation_H':'','BottomPlate_Y':'','LengthSeamToSeam_Ls':''};
    let requiredUnits={};
    let receivedUnits={};
    let equations={};
    const uoms=payload?.units===undefined ? await getUOMs(): payload?.units;
    if(payload["EnterTankData"]===true && payload["CalculateTankData"]===true){
    // if(payload["CalculateTankData"]===true){    
        
        const CalcMethod=payload['CalculationMethod'];
        const constants = getConstants(CalcMethod);
        let N35 = constants.N35;
        let N36 = constants.N36;
        let length_uom=payload?.selectedUnits['Diameter_d_UOM'];
        length_uom=uoms.find(u => u.UnitKey === length_uom);
        receivedUnits['LengthUOM']=length_uom;
        let req_length_uom=CalcMethod==='English'?"length.ft" : "length.m";
        req_length_uom=uoms.find(u => u.UnitKey === req_length_uom);
        requiredUnits['LengthUOM']=req_length_uom;
        // WettedArea=convertUnit(WettedArea, WettedAreaUOM, uoms['area'].find(u => u.UnitKey === WettedArea_UOM));
        let Diameter_d=payload['Diameter_d'];
        inputValues['Diameter_d']=Diameter_d;
        const converted_d=Diameter_d!=="" && length_uom!=="" && length_uom !==undefined?Number(convertUnit(Diameter_d,length_uom,req_length_uom)):"";
        equationValues['Diameter_d']=converted_d;
        // console.log('in Calculate AreaMethods: >>>> Diameter_d >>>>>>>>>>. ',payload["FireSizingMethod"],payload["TankShape"],Diameter_d,converted_d,length_uom?.UnitKey,req_length_uom?.UnitKey)
        let area_uom=CalcMethod==='English'?"area.ft2" : "area.m2";
        area_uom=uoms.find(u => u.UnitKey === area_uom);
        requiredUnits['AreaUOM']=area_uom;
        inputValues['FireSizingMethod']=payload["FireSizingMethod"];
        if(payload["FireSizingMethod"]==='Unwetted'){
            equations['Tup']=`T = P1 * Tn / Pn`;
            equations['Fprime']=`F' = [${N36} * (Tw - T)^1.25] / [C * Kx * T^0.6506]`;
            equations['Areq']=N35==1?`Areq = F * F' * A' / (P1)^0.5`:`Areq = 18.235 * F * F' * A' / (P1)^0.5`;
            equations['Wreq']=`Wreq = Wadd + Areq * Wsel / Asel`;
            if(payload["TankShape"]==='Spherical'){
                if(converted_d!=="" && converted_d!==undefined){
                    Output= math.pi * converted_d * converted_d;
                    equations['SurfaceArea']=`A' = p * d^2`;
                }else{
                    Output="";
                }
                LtFlag=true;
                addedFields={horizontalvertical:"IsHorizontalOrientation",EndsGroup:"FlatEnds"}
            }else if(payload["TankShape"]==='Cylindrical'){
                // const re_lt_EtE_uom=payload['LengthEndToEnd_lt_UOM'];
                
                if(payload["EndsGroup"]==='FlatEnds'){
                    if(payload["horizontalvertical"]==='Vertical'){
                        const req_ht=payload['Height_h']
                        if(req_ht!=="" && req_ht!==undefined && converted_d!=="" && converted_d!==undefined){
                            // const req_ht_UOM=payload['Height_h_UOM'];   
                            inputValues['Height_h']=req_ht;
                            const converted_h=Number(convertUnit(req_ht,length_uom,req_length_uom));
                            equationValues['Height_h']=converted_h;
                            Output= math.pi * converted_d * (converted_h+(converted_d/2));
                            equations['SurfaceArea']=`A' = π * d * (h + d / 2)`;
                        }else{
                            Output="";
                        }
                    }else{
                        const req_lt=payload['LengthEndToEnd_ltip'];
                        inputValues['LengthEndToEnd_lt']=req_lt;
                        if(req_lt!=="" && req_lt!==undefined && converted_d!=="" && converted_d!==undefined){
                            LtFlag=true;
                            addedFields={'LengthEndToEnd_lt':req_lt}
                            const req_lt_EtE=req_lt==="" || req_lt===undefined?0:Number(convertUnit(req_lt,length_uom,req_length_uom));
                            equationValues['LengthEndToEnd_lt']=req_lt_EtE;
                            Output= math.pi * converted_d * (req_lt_EtE+(converted_d/2));
                            equations['SurfaceArea']=`A' = π * d * (Lt + d / 2)`;
                        }else{
                            Output="";
                        }
                    }
                }else if(payload["EndsGroup"]==='EllipticalEnds'){
                    const req_lt=payload['LengthEndToEnd_lt'];
                    inputValues['LengthEndToEnd_lt']=req_lt;
                    if(req_lt!=="" && req_lt!==undefined && converted_d!=="" && converted_d!==undefined){
                        LtFlag=true;
                        addedFields={'LengthEndToEnd_ltip':req_lt};
                        const req_lt_EtE=req_lt==="" || req_lt===undefined?0:Number(convertUnit(req_lt,length_uom,req_length_uom));
                        equationValues['LengthEndToEnd_lt']=req_lt_EtE;
                        Output=math.pi*converted_d*(req_lt_EtE+((converted_d/(8*math.sqrt(3)))*math.log((1+(math.sqrt(3)/2))/(1-(math.sqrt(3)/2)))));
                        equations['SurfaceArea']=`A' = π * d * [ Lt + (d / 8√3) * ln(1 + √3 / 2) / (1 - √3 / 2) ]`;
                    }else{
                        Output="";
                    }
                }else if(payload["EndsGroup"]==='HemisphericalEnds'){
                    const req_lt=payload['LengthEndToEnd_lt'];
                    inputValues['LengthEndToEnd_lt']=req_lt;
                    console.log('In Calculate AreaMethods: >>>> Cylindrical >> HemisphericalEnds >> LengthEndToEnd_lt >>>>>>>>>>. ',req_lt,converted_d);
                    if(req_lt!=="" && req_lt!==undefined && converted_d!=="" && converted_d!==undefined){
                        LtFlag=true;
                        addedFields={'LengthEndToEnd_ltip':req_lt}
                        const req_lt_EtE=req_lt==="" || req_lt===undefined?0:Number(convertUnit(req_lt,length_uom,req_length_uom));
                        equationValues['LengthEndToEnd_lt']=req_lt_EtE;
                        Output= math.pi * converted_d * req_lt_EtE;
                        equations['SurfaceArea']=`A' = π * d * Lt`;
                    }else{
                        Output="";
                    }
                    // console.log('In Calculate AreaMethods: >>>> Cylindrical >> HemisphericalEnds >> Output >>>>>>>>>>. ',Output);
                }
            }
            if(Output===""){
                Output="0.000";
            }else{
                let sa_uom=payload?.selectedUnits['AreaUOM'];
                receivedUnits['AreaUOM']=sa_uom;
                sa_uom=uoms.find(u => u.UnitKey === sa_uom);
                equationValues['SurfaceArea']=Output;
                Output=Number(convertUnit(Output,area_uom,sa_uom));
                // console.log(`In Calculate RatedFlow :: In Fire sizing :: Unwetted Area >>>>>>>>>>>>>>>>`,LtFlag,equationValues['SurfaceArea'],Output,area_uom?.UnitKey,sa_uom?.UnitKey)
                inputValues['SurfaceArea']=Output;
            }
            Output=!LtFlag?{SurfaceArea:Output,Wreq:''}:{SurfaceArea:Output,Wreq:'',...addedFields};
            tcResponse={equationValues,inputValues,requiredUnits,receivedUnits,equations};
            Output={...Output,tcResponse};
        }else{
            let Y=null;
            // const eleH_uom=payload['Elevation_H_UOM'];
            let elevated_H=payload['Elevation_H'];
            inputValues['Elevation_H']=elevated_H;
            const converted_H=elevated_H!==undefined && elevated_H!=="" && length_uom!=="" && length_uom!==undefined?Number(convertUnit(elevated_H,length_uom,req_length_uom)):"";
            equationValues['Elevation_H']=converted_H;
            // console.log('in Calculate AreaMethods: >>>> Elevation_H >>>>>>>>>>. ',elevated_H,converted_H,length_uom?.UnitKey,req_length_uom?.UnitKey)
            let LiquidDepth_f=payload['LiquidDepth_f'];
            // const liqdep_f_uom=payload['LiquidDepth_f_UOM'];
            const converted_f=LiquidDepth_f!=="" && length_uom!=="" && length_uom!==undefined?Number(convertUnit(LiquidDepth_f,length_uom,req_length_uom)):"";
            inputValues['LiquidDepth_f']=LiquidDepth_f;
            equationValues['LiquidDepth_f']=converted_f;
            const calcMethod=payload['CalculationMethod'];

            const Ef=converted_d!=="" && converted_H!=="" && converted_f!==""? calculate_Ef(Number(converted_H),Number(converted_f),calcMethod):"";
            equationValues['Ef']=Ef;
            if(payload["TankShape"]==='Spherical'){
                if(Ef!=="" && converted_d!=="" && converted_d!==undefined && converted_d>=converted_f){
                    const Es= Ef > Number(converted_d)/2 ? Ef : Number(converted_d)/2;
                    equationValues['Es']=Es;
                    equations['Es']=`Effective Spherical Level`;
                    Output= math.pi * Number(converted_d) * Es;
                    equations['Awet']=`Awet = π * d * Es`;
                }else{
                    Output="";
                }
            }else if(payload["TankShape"]==='Cylindrical'){
                equations['Ef']='Effective Level Above Grade';
                if(payload["horizontalvertical"]==='Vertical' && payload["EndsGroup"]==='FlatEnds'){
                    // const height_h_uom=payload['Height_h_UOM'];
                    const converted_h=length_uom!=="" && length_uom!==undefined? Number(convertUnit(payload['Height_h'],length_uom,req_length_uom)):"";
                    inputValues['Height_h']=payload['Height_h'];
                    equationValues['Height_h']=converted_h;
                    if(converted_h!=="" && converted_d!=="" && converted_d!==undefined){
                        Y=Ef<converted_h && converted_H==0?0
                                :Ef<converted_h && converted_H>0?1
                                :Ef==converted_h && converted_H==0?1
                                :Ef==converted_h && converted_H>0?2:1;

                        equationValues['Y']=Y;
                        equations['Y']=`Percent of Bottom Plate Used (input)`;
                        Output= math.pi * converted_d * (Ef+(Y*converted_d/4));
                        // console.log(' In Wetted Area:: Vertical >>>>>>>>>>',{pi:math.pi,Y,converted_h,converted_H,converted_d,Ef,Output,length_uom,req_length_uom})
                        equations['Awet']=`Awet = π * d * [ Ef + (Y * d / 4) ]`;
                    }else{
                        Output="";
                    }
                }else if(payload["EndsGroup"]==='FlatEnds'){ 
                    Output="";
                    if(converted_d>=converted_f && Ef!==""){
                        // console.log('in Calculate AreaMethods::: d,f,Ef >>> ',converted_d,converted_f,Ef)
                        const B=math.acos(1-(2*Ef/converted_d)) * (180/math.pi);
                        equations['B']=`B = acos[ 1 - (2 * Ef / d) ]`;
                        const req_lt=payload['LengthEndToEnd_ltip'];
                        equationValues['B']=B;
                        inputValues['LengthEndToEnd_lt']=req_lt;
                        // console.log('in Calculate AreaMethods::: B >>> ',B,req_lt)
                        if(req_lt!=="" && req_lt!==undefined && converted_d!=="" && converted_d!==undefined){
                            // const re_lt_EtE_uom=payload['LengthEndToEnd_lt_UOM'];
                            const req_lt_EtE=req_lt==="" || req_lt===undefined?0:Number(convertUnit(req_lt,length_uom,req_length_uom));
                            equationValues['LengthEndToEnd_lt']=req_lt_EtE;
                            // console.log('in  ::: req_lt_EtE >>> ',req_lt_EtE)
                            Output=(converted_d * B) * (req_lt_EtE + converted_d / 2) - converted_d * ((converted_d / 2 - Ef) * math.sin(B))
                            equations['Awet']=`Awet = (π * d * B / 180) * (Lt + d / 2) - d * [ (d / 2 - Ef) * sin(B) ]`;
                            // console.log('in Calculate AreaMethods::: Output >>> ',Output)
                        }
                    }
                }else if(payload["horizontalvertical"]==='Vertical' && payload["EndsGroup"]==='EllipticalEnds'){
                    const req_lt=payload['LengthSeamToSeam_Ls'];
                    inputValues['LengthSeamToSeam_Ls']=req_lt;
                    if(req_lt!=="" && req_lt!==undefined && converted_d!=="" && converted_d!==undefined){
                        // const req_Lt_uom=payload['LengthEndToEnd_lt_UOM'];
                        const converted_Lt=req_lt==="" || req_lt===undefined?0:Number(convertUnit(req_lt,length_uom,req_length_uom));
                        equationValues['LengthSeamToSeam_Ls']=converted_Lt;
                        // console.log('Wetted >>> Vertical >>> EllipticalEnds 11111 >>>>>>>>>>>>>>>>>>',converted_Lt,Ef,converted_d)
                        Output= calculateVerticalEllipsoidalAwet(converted_d/2,Ef, converted_Lt);
                        // console.log('Wetted >>> Vertical >>> EllipticalEnds 2222 >>>>>>>>>>>>>>>>>>',converted_Lt,Ef,converted_d,Output)
                        Output+=calculateVerticalCylinderAwet(converted_d/2,Ef,converted_Lt);
                        equations['Awet']=`Awet = Ellipsoidal Partial Surface Area`;
                    }else{
                        Output="";
                    }
                }else if(payload["EndsGroup"]==='EllipticalEnds'){
                    Output="";
                    // console.log('in Calculate AreaMethods::: EllipticalEnds >>> d,f,Ef >>> ',converted_d,converted_f,Ef)
                    if(converted_d>=converted_f && Ef!==""){
                        let req_ls=payload['LengthSeamToSeam_Ls'];
                        inputValues['LengthSeamToSeam_Ls']=req_ls;
                        let convrted_ls=0;
                        if(req_ls==="" || req_ls===undefined || req_ls===null ){
                            convrted_ls=Number(convertUnit(payload['LengthEndToEnd_lt'],length_uom,req_length_uom))-(Number(convertUnit(payload['Diameter_d'],length_uom,req_length_uom))/2)
                        }else{
                            convrted_ls=req_ls==="" || req_ls===undefined?0:Number(convertUnit(req_ls,length_uom,req_length_uom));
                        }
                        equationValues['LengthSeamToSeam_Ls']=convrted_ls;
                        if(converted_d!=="" && converted_d!==undefined){
                            
                            Output= 2 * calculateHorizontalEllipsoidalAwet(converted_d/2,Ef);
                            
                            Output+=calculateHorizontalCylinderAwet(converted_d/2,Ef,convrted_ls);
                            equations['Awet']=`Awet = Ellipsoidal Partial Surface Area`;
                        }
                    }
                }else if(payload["horizontalvertical"]==='Vertical' && payload["EndsGroup"]==='HemisphericalEnds'){
                    // console.log('in Calculate AreaMethods: >>>> HemisphericalEnds >>>>>>>>> ',math.pi,converted_d,Ef)
                    if(Ef!=="" && converted_d!=="" && converted_d!==undefined){
                        const  req_ls=Number(payload['LengthSeamToSeam_Ls']);
                        inputValues['LengthSeamToSeam_Ls']=req_ls;
                        let Es=Ef;
                        if(req_ls!=="" && req_ls!==undefined && req_ls==0 && converted_d!=="" && converted_d!==undefined){
                            Es=Ef > converted_d / 2?Ef:converted_d / 2;
                        }
                        equationValues['Es']=Es;
                        equations['Es']=`Effective Spherical Level`;
                        Output= math.pi * converted_d * Es;
                        // console.log('In Calculate AreaMethods: >>>> HemisphericalEnds >>>>>>>>> ',{pi:math.pi,converted_d,Es,Ef,req_ls,Output});
                        equations['Awet']=`Awet = π * d * Es`;
                   }else{
                        Output="";
                   }
                }else if(payload["EndsGroup"]==='HemisphericalEnds'){
                    Output="";
                    if(converted_d>=converted_f && Ef!==""){
                        const B=math.acos(1-(2*Ef/converted_d)) * (180/math.pi);
                        // console.log('B >>>>> ',{converted_d,Ef,B,B_Calc:math.acos(1-(2*Ef/converted_d))})
                        equations['B']=`B = acos[ 1 - (2 * Ef / d) ]`;
                        equationValues['B']=B;
                        let convrted_ls=0;
                        let req_ls=Number(payload['LengthSeamToSeam_Ls']);
                        inputValues['LengthSeamToSeam_Ls']=req_ls;
                        if(req_ls==="" || req_ls===undefined || req_ls===null ){
                            convrted_ls=Number(convertUnit(payload['LengthEndToEnd_lt'],length_uom,req_length_uom))-(converted_d/2)
                        }else{
                            convrted_ls=req_ls==="" || req_ls===undefined?0:Number(convertUnit(req_ls,length_uom,req_length_uom));
                        }
                        equationValues['LengthSeamToSeam_Ls']=convrted_ls;
                        // console.log('in Calculate AreaMethods: >>>> HemisphericalEnds >>>>>>>>> ',{pi:math.pi,converted_d,Ef,req_ls,convrted_ls,LengthEndToEnd_lt:payload['LengthEndToEnd_lt'],B})
                        if(convrted_ls==0 && converted_d!=="" && converted_d!==undefined){
                            const Es=Ef > converted_d / 2?Ef:converted_d / 2;
                            equationValues['Es']=Es;
                            equations['Es']=`Effective Spherical Level`;
                            Output=math.pi * converted_d * Es;
                            equations['Awet']=`Awet = π * d * Es`;
                        }else if(convrted_ls>0 && converted_d!=="" && converted_d!==undefined){
                           Output= math.pi * converted_d * (Ef + (convrted_ls * B/180));
                            equations['Awet']=`Awet =  π * d * [Ef + (Ls * B / 180)]`;
                        }
                    }
                }
            }else{
                Output=""; 
            }
            // console.log('In Calculate RatedFlow >>>>>>>>>in Calculate AreaMethods::: Output 11111 >>>>>>>>>>>>>>>>>>>',Output);
            if(Output!==""){
                let wa_uom=payload?.selectedUnits['AreaUOM'];
                receivedUnits['AreaUOM']=wa_uom;
                wa_uom=uoms.find(u => u.UnitKey === wa_uom);
                equationValues['Awet']=Output;
                Output=Number(convertUnit(Output,area_uom,wa_uom));
                inputValues['Awet']=Output;
                // console.log('In Calculate RatedFlow >>>>>>>>>in Calculate AreaMethods::: Output 22222 >>>>>>>>>>>>>>>>>>>',Output,area_uom?.UnitKey,wa_uom?.UnitKey);
            }
            Output=CalculateRatedFlow({...payload,units:uoms},Output,Y);
            equationValues={...equationValues,...Output.tcResponse.equationValues};
            inputValues={...inputValues,...Output.tcResponse.inputValues};
            requiredUnits={...requiredUnits,...Output.tcResponse.requiredUnits};
            receivedUnits={...receivedUnits,...Output.tcResponse.receivedUnits};
            equations={...equations,...Output.tcResponse.equations};
            Output={...Output,tcResponse:{equationValues,inputValues,requiredUnits,receivedUnits,equations}};
        }
        // console.log('in Calculate AreaMethods: >>>> In Calculate RatedFlow >>>>>>>>>in Calculate AreaMethods::: Output final >>>>>>>>>>>>>>>>>>>',Output);
        return Output;
    }else if(payload["EnterTankData"]===true && payload["FireSizingMethod"]==='Wetted'){
        const LocalWettedArea=payload['WettedArea'];
        Output=LocalWettedArea;
        Output=CalculateRatedFlow({...payload,units:uoms},Output);
        
        // console.log('final output:: 2222 >>>>>>>>>>>',Output)
        return Output;
    }else{
        console.log('In Calculate AreaMethods >>>> 0.000 ');
        return "0.000";
    }
}

module.exports = {
    CalculateAreaMethods,
    CalculateRatedFlow,
    calculate_Ef,
    calculateHorizontalEllipsoidalAwet,
    calculateVerticalEllipsoidalAwet,
    calculateHorizontalCylinderAwet,
    calculateVerticalCylinderAwet,
    calculateCylinderSurfaceArea,
    calculateCylinderSurfaceArea,
    calculateFrustumSurfaceArea
};