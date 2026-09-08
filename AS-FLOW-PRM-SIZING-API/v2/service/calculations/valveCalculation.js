const math = require('mathjs');
const { getConstants, convertUnit, convertUnitDiffDims } = require('../../utils/helper');
const { getHo } = require('../../controllers/CalcSaturatedTempController');
function CalculateGasReactionForce(Ao, Kd, N34, N5, N6, A, C, P1, Kc, Do, k, Z, Patm, KxValue) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																
    // IM				PO				psig				barg				Outlet Static Pressure																
    // UI				PATM				psia				bara				Atmospheric Pressure																
    // OUT				FR				lbf				N				Reactive Thrust Force (Reaction Force) (Note 2)																
    // IM				A				in2				cm2				Selected Valve Orifice Area																
    // IM				C				"(lbm-lbmole-
    // °R)0.5/ (lbf-hr)"				(kg-kgmole-°K)0.5/(cm²-hr-bar)				Gas Coefficient (Section 1.1.4.2)																

    // IM				Kz				-				-				Flow Coefficient (Note 3)																
    // IM				P1				psia				bara				Inlet Pressure																
    // IM				Kb				-				-				Back Pressure Correction Factor																
    // UI				Kc				-				-				Rupture Disc Combination Correction Factor																
    // UI				k				-				-				Ratio of Specific Heats																
    // UI				Z				-				-				Compressibility Factor																
    // IM				DO				in				cm				Valve Outlet Inside Diameter																
    // IM				AO				in2				cm2				Valve Outlet Area (Section 3.5)																
    // IM				N5				-				-				Constant for Gas Reactive Force - Moment (Note 1)																
    // IM				N6				-				-				Constant for Gas Reactive Force - Static (Note 1)																
    // IM				N34				-				-				Constant for Outlet Static Pressure (Note 1)		


    // NOTES:																		
    // 1.		Values for equation constants are as follows:																		
    // 				English Units					Metric Units											
    // 		N5		366					27.90697674											
    // 		N6		1					10											
    // 		N34		0.00245					0.003225											
    // 2.		For dual outlet valves, the reaction force is equal to zero.																		
    // 3.		For ASME Data Set, Kz = Kd																		
    // 		For API Data Set, Kz = K,API																		
    let Kz = Kd;
    let Po = ((N34 * A * C * Kz * P1 * Kc) / ((Do ** 2) * ((k * Z) ** 0.5))) - Patm;
    let PoEquation = `Po = (${N34} * A * C * ${KxValue} * P1 * Kc) / (Do^2 * (k * Z)^0.5) - Patm`;
    let Fr = null;
    let FrEquation = ``;
    if (Po <= 0) {
        Fr = ((A * C * Kz * P1 * Kc) / N5) * ((k / ((k + 1) * Z)) ** 0.5);
        FrEquation = `Fr = ((A * C * ${KxValue} * P1 * Kc) / ${N5}) * ((k / ((k + 1) * Z))^0.5)`;
        Po = 0;
    } else {
        Fr = (((A * C * Kz * P1 * Kc) / N5) * ((k / ((k + 1) * Z)) ** 0.5)) + (N6 * Po * Ao);
        //FrEquation = `Fr = ((A * C * ${KxValue} * P1 * Kc) / ${N5}) * ((k / ((k + 1) * Z))^0.5) + ${N6} * Po * Ao`;
        FrEquation = `Fr = ((A * C * ${KxValue} * P1 * Kc) / ${N5}) * ((k / ((k + 1) * Z))^0.5) + (${N6} * Po * Ao)`;
    }
    return { Fr, FrEquation, Po, PoEquation };
}

function CalculateGasNoiseLevel(N7, W, k, T, M, PR, r, N8) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				L100				db				db				Noise Level @ 100 ft. From the Point of Discharge																	
    // IM				PR				-				-				Absolute Pressure Ratio																	
    // IM				W				lb/hr				kg/hr				Calculated Max. Mass Flow (Notes 1 & 3)																	
    // UI				k				-				-				Ratio of Specific Heats																	
    // UI				T				°R				°K				Relieving Temperature																	
    // UI				M				-				-				Molecular Weight																	
    // IM				N7				-				-				Constant for Noise Level (Note 2)																	

    //                         NOTES:																											
    //                 1.		If a volumetric flow equation has been used, the maximum relieving capacity must																											
    //                         be converted into a mass flow rate before being used in this equation.  See																											
    //                         Appendix C for a conversion factor.																											
    //                 2.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N7		0.29354					1.1552																				
    //                 3.		As determined using Part II for specific product types:																											
    //                             For ASME Data Set, W = WACT																										
    //                             For API Data Set, W = WMAX					

    
    let L100 = (10 * Math.log10((N7 * W * k * T) / M));
    let L100Equation = `L100 = `;
    let PRPrime = 1 / PR;
    if (PRPrime > 2.859) {
        L100 = L100 + ((6.5 * Math.log10(PRPrime)) + 51.28);
        L100Equation = `L100 = [6.5 * log( 1/PR ) + 51.28] +  [10 * log(${N7} * W * k * T / M)]`;
    }
    else {
        L100 = L100 + ((87.75 * Math.log10(PRPrime)) + 14.09);
        L100Equation = `L100 = [87.75 * log( 1/PR ) + 14.09] +  [10 * log(${N7} * W * k * T / M)]`;
    }

    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				LP				db				db				Noise Level @ a Distance Other Than 100-ft (30-m)																	
    // IM				L100				db				db				Noise Level @ a Distance of 100-ft (30-m)																	
    // UI				r				ft				m				Distance From the Point of Discharge																	
    // IM				N8				-				-				Constant for Noise Level Alt. Distances (Note 1)																	

    // 						NOTES:																											
    // 				1.		Values for equation constants are as follows:																											
    // 								English Units					Metric Units																				
    // 						N8		100					30																				

    let LP = L100 - (20 * Math.log10(r / N8));
    let LPEquation = `LP = L100 - 20 * log(r / ${N8})`;
    return { LP, L100, LPEquation, L100Equation };
}

function CalculateLiquidReactionForce(Ao, Kd, N15, A, Kv, Pa, KxValue) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description													
    // OUT				FR				lbf				N				Reactive Thrust Force (Reaction Force)													
    // IM				N15				-				-				Constant for Liquid Reaction Force (Note 1)													
    // IM				A				in2				cm2				Selected Valve Orifice Area													
    // IM				Kz				-				-				Actual Flow Coefficient (Note 2)													
    // IM				Kv				-				-				Viscosity Correction Factor													
    // IM				PA				psig				barg				Inlet Pressure (Gauge)													
    // IM				AO				in2				cm2				Valve Outlet Area (Section 3.5)													

    // 						NOTES:																							
    // 				1.		Values for equation constants are as follows:																							
    // 								English Units					Metric Units																
    // 						N15		2.002					20.02																
    // 				2.		For ASME Data Set, Kz = Kd																							
    // 						For API Data Set, Kz = K,API		

    let Kz = Kd;
    let Fr = (N15 * (A ** 2) * (Kz ** 2) * (Kv ** 2) * Pa) / Ao;
    let FrEquation = `Fr = (${N15} * A² * ${KxValue}² * Kv² * Pa) / Ao`;
    return { Fr, FrEquation };
}

function CalculateSteamReactionForce(Ao, Kd, N20, N21, N22, N23, A, P1, Kn, Ksh, Kc, ho, Patm, KxValue) {
    //     Usage				Variable				EnglishUnits				MetricUnits				Description																			
    // OUT				FR				lbf				N				Reactive Thrust Force (Reaction Force)																			
    // IM				A				in2				cm2				Selected Valve Orifice Area																			
    // IM				P1				psia				bara				Inlet Pressure																			
    // IM				Kz				-				-				Flow Coefficient (Note 3)																			
    // IM				KN				-				-				Napier Correction Factor																			
    // IM				KSH				-				-				Superheat Correction Factor																			
    // IM				KSC				-				-				Supercritical Correction Factor																			
    // IM				Kb				-				-				Back Pressure Correction Factor																			
    // UI				Kc				-				-				Rupture Disc Combination Correction Factor																			
    // IM				ho				BTU/lbm				KJ/kg				Stagnation Enthalpy at Valve Inlet (Note 1)																			
    // IM				AO				in2				cm2				Valve Outlet Area (Section 3.5)																			
    // IM				PO				psig				barg				Outlet Static Pressure																			
    // IM				N20				-				-				Constant for Steam Stagnation Pressure (Note 2)																			
    // IM				N21				BTU/lbm				KJ/kg				Constant for Enthalpy Delta (Note 2)																			
    // IM				N22				-				-				Constant for Gas Reactive Force - Moment (Note 2)																			
    // IM				N23				-				-				Constant for Gas Reactive Force - Static (Note 2)																			
    // UI				PATM				psia				bara				Atmospheric Pressure																			

    // 						NOTES:																													
    // 				1.		Evaluated at P1 & T.  See Appendix F for value.																													
    // 				2.		Values for equation constants are as follows:																													
    // 								English Units					Metric Units																						
    // 						N20		0.027635555					0.018120214																						
    // 						N21		823					1914.3																						
    // 						N22		0.035934521					0.235617201																						
    // 						N23		1					10																						
    // 				3.		For ASME Data Set, Kz = Kd																													
    // 						For API Data Set, Kz = K,API						
    let Kz = Kd;
    let Po = ((N20 * A * P1 * Kz * Kn * Ksh * Kc * ((ho - N21) ** 0.5)) / Ao) - Patm;
    let PoEquation = `Po = (${N20} * A * P1 * ${KxValue} * Kn * Ksh * Kc * ((ho - N21)^0.5)) / Ao - Patm`;
    let Fr = null;
    let FrEquation = ``;
    if (Po <= 0.0) {
        Fr = N22 * A * P1 * Kz * Kn * Ksh * Kc * ((ho - N21) ** 0.5);
        FrEquation = `Fr = ${N22} * A * P1 * ${KxValue} * Kn * Ksh * Kc * ((ho - ${N21})^0.5)`;
        Po = 0;
    }
    else {
        Fr = (N22 * A * P1 * Kz * Kn * Ksh * Kc * ((ho - N21) ** 0.5)) + N23 * Po * Ao;
        FrEquation = `Fr = ${N22} * A * P1 * ${KxValue} * Kn * Ksh * Kc * ((ho - ${N21})^0.5) + ${N23} * Po * Ao`;
    }
    return { Fr, FrEquation, Po, PoEquation };
}

function CalculateSteamNoiseLevel(N7, W, M, k, T, M, PR, r, N8) {
    // Refer CalculateGasNoiseLevel() 
    // See Section 1.1.6 for details of how this calculation is made.  The following values																											
    // are to be used with Equation 1.9a or Equation 1.9b:																											
    // 	M	=	18.015																								
    // 	k	=	1.31																								
    // 	Z = 1.0																										
    // There is no reason for these values to ever be displayed.																											
    // let M = 18.015;
    // let k = 1.31;
    // let Z = 1.0;
    let L100 = (10 * Math.log10((N7 * W * k * T) / M));
    let L100Equation = `L100 = `;
    let PRPrime = 1 / PR;
    if (PRPrime > 2.859) {
        L100 = L100 + ((6.5 * Math.log10(PRPrime)) + 51.28);
        L100Equation = `L100 = [6.5 * log( 1/PR ) + 51.28] +  [10 * log(${N7} * W * k * T / M)]`;
    }
    else {
        L100 = L100 + ((87.75 * Math.log10(PRPrime)) + 14.09);
        L100Equation = `L100 = [87.75 * log( 1/PR ) + 14.09] +  [10 * log(${N7} * W * k * T / M)]`;
    }
    let LP = L100 - (20 * Math.log10(r / N8));
    let LPEquation = `LP = L100 - 20 * log(r / ${N8})`;
    return {
        L100,
        L100Equation,
        LP,
        LPEquation
    }
}

function Calculate2PhaseReactionForce(W, N30, Ao, x2, pg2, pl2, Po, Patm, N31, CalculationMethod,KADataSet) {
    //     Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				FR				lbf				N				Reactive Thrust Force (Reaction Force)																	
    // IM				W				lb/hr				kg/hr				Calculated Max. Mass Flow (Notes 4 & 5)																	
    // UI				WG				lb/hr				kg/hr				Required Gas Mass Flow																	
    // UI				WL				lb/hr				kg/hr				Required Liquid Mass Flow																	
    // IM				AO				in2				mm2				Valve Outlet Area (Section 3.5)																	
    // UI				x2				-				-				Gas/Vapor Mass Fraction at Exit Conditions (Note 1)																	
    // IM				x				-				-				Gas/Vapor Mass Fraction at Inlet Conditions (Note 2)																	
    // UI				pg2				lb/ft3				kg/m3				Gas/Vapor Density at Exit Conditions																	
    // UI				pl2				lb/ft3              kg/m3				Liquid Density at Exit Conditions
    // UI				PO				psia				bara				Outlet Static Pressure																	
    // UI				PATM				psia				bara				Atmospheric Pressure, absolute																	
    // IM				N30				-				-				Constant for 2-Phase Reactive Force - Moment (Note 3)																	
    // IM				N31				-				-				Constant for 2-Phase Reactive Force - Static (Note 3)																	

    // 						NOTES:																											
    // 				1.		For valves sized using Section 1.4.1, x2 = x.																											
    // 				2.		x = WG / (WG + WL)																											
    // 				3.		Values for equation constants are as follows:																											
    // 								English Units					Metric Units																				
    // 						N30		2.898E+06					1296																				
    // 						N31		1					0.1																				
    // 				4.		As determined using Part II for specific product types:																											
    // 							For ASME Data Set, W = WACT																										
    // 							For API Data Set, W = WMAX																										
    // 				5.		When flow is calculated using Section 1.4.3.3.5, the value of VL will need to be																											
    // 						converted from volumetric to mass flow in order to use this equation.	
    //Fr = ((W ** 2) / (N30 * Ao)) * (x2 / pg2 + (1 - x2) / pl2) + (Ao / N31) * Po;
    let Wact = W / 0.9;
    let Fr = '';
    let FrEquation = '';
    if(CalculationMethod == 'English') {
        if(KADataSet === 'ASME') {
            Fr = ((Wact ** 2) / (N30 * Ao)) * ((x2 / pg2) + ((1 - x2) / pl2)) + Ao * Po;
            FrEquation =  `Fr = Wact^2 / (2.898E+06 * Ao) * { (x2 / ρg2) + [ (1 - x2) / ρl2] } + Ao * Po`;
        }else{
            Fr = ((W ** 2) / (N30 * Ao)) * ((x2 / pg2) + ((1 - x2) / pl2)) + Ao * Po;
            FrEquation =  `Fr = W^2 / (2.898E+06 * Ao) * { (x2 / ρg2) + [ (1 - x2) / ρl2] } + Ao * Po`;
        }
    }else{
        if(KADataSet === 'ASME') {
            Fr = ((Wact ** 2) / (N30 * Ao)) * ((x2 / pg2) + ((1 - x2) / pl2)) + (Ao / N31)* Po;
            FrEquation =  `Fr = Wact^2 / (1296 * Ao) * { (x2 / ρg2) + [ (1 - x2) / ρl2] } + Ao * Po / 0.1`;
        }else{
            Fr = ((W ** 2) / (N30 * Ao)) * ((x2 / pg2) + ((1 - x2) / pl2)) + (Ao / N31)* Po ;
           FrEquation =  `Fr = W^2 / (1296 * Ao) * { (x2 / ρg2) + [ (1 - x2) / ρl2] } + Ao * Po / 0.1`; 
        }
    }
    return {
        Fr,
        FrEquation
    };

}

function CalculateGasSteamReactionForceISO(Ao, Psic, Psiv, Patm, u, Qm_actual, P2) {
    // 1.5.1.1		ISO 4126 Reaction Force - Gas / Vapor / Steam																																		Calculate_PRV_G_ISO_4126_FORCE	
    // Data																																					
    // Usage				CAPSHER Name							English									Metric																	
    // OUT				AO							N/A									area.mm2																	
    // IN				DO							N/A									length.mm																	
    // OUT				FR							N/A									force.N																	
    // IN				P2							N/A									pressure.bara																	
    // IN-UI				PATM							N/A									pressure.bara																	
    // IN-UI				PBACK							N/A									pressure.barg																	
    // IN				Pi							N/A									-																	
    // IN-UI				PSIC							N/A									pressure.barg																	
    // IN-UI				PSIV							N/A									pressure.barg																	
    // OUT				PU							N/A									pressure.bara																	
    // IN				Qm							N/A									massflow.kghr																	
    // IN-UI				u							N/A									m/s																	
    // Procedure																																					
    // Step			Conditions										Formula																								
    // 1													Validate_PRV_G_ISO_4126_FORCE																								
    // 2													Pu = PSIC + PSIV + PATM																								
    // 3													AO = (Pi * DO^2) / 4																								
    // 4			u > 0										FR = (Qm_actual * u / 3600) + ((P2-PU) * AO / 100)																								

    let Pu = Psic + Psiv + Patm;
    let PuEquation = `Pu = PSIC + PSIV + PATM`;
    let Fr = null;
    let FrEquation = ``;
    if (u > 0) {
        Fr = (Qm_actual * u / 3600) + ((P2 - Pu) * Ao / 100);
        FrEquation = `Fr = (Qm_actual * u / 3600) + ((P2 - PU) * Ao / 100)`;
    }
    return { Pu, PuEquation, Fr, FrEquation }
}

function CalculateGasSteamNoiseLevelISO(Do, r, u, v1) {
    // 1.6		Pressure Relief Valves (PRV) : Noise																																			
    // 1.6.1		Calculations																																			
    // 1.6.1.1		ISO 4126-9 Noise - Gas / Vapor / Steam																																		Calculate_PRV_G_ISO_4126_NOISE	
    // Data																																					
    // Usage				CAPSHER Name							English									Metric																	
    // IN				DO							N/A									length.mm																	
    // IN				Pi							N/A									-																	
    // OUT				PSLr							N/A									db																	
    // OUT				PWL							N/A									db																	
    // IN-UI				r							N/A									length.m																	
    // IN-UI				u							N/A									m/s																	
    // IN				v1							N/A									specificvolume.m3kg																	
    // Procedure																																					
    // Step			Conditions										Formula																								
    // 1													Validate_PRV_G_ISO_4126_NOISE																								
    // 2			u > 0										PWL = 20 * log(0.001*DO) - 10 * log(v1) + 80 * log(u) - 53																								
    // 3			r > 0										PSLr = PWL - 10*  log(2 * Pi * (r^2)) 																								
    // 1.6.2		Validations																																			
    // 1.6.2.1		ISO 4126-9 Noise - Gas / Vapor / Steam																																		Validate_PRV_G_ISO_4126_NOISE	
    // Validation																																					
    // Note			Conditions										Notes																								
    // 1			r <= 0										ERROR = "Distance from valve must be greater than zero."																								
    // 2			u <= 0										ERROR = "Velocity must be greater than zero."																								

    let PWL = null
    let PWLEquation = ``;
    if (u > 0) {
        PWL = 20 * Math.log10(0.001 * Do) - 10 * Math.log10(v1) + 80 * Math.log10(u) - 53;
        PWLEquation = `PWL = 20 * log10(0.001 * Do) - 10 * log10(v1) + 80 * log10(u) - 53`;
    }
    let PSLr = null;
    let PSLrEquation = ``;
    if (r > 0) {
        PSLr = PWL - 10 * Math.log10(2 * Math.PI * (r ** 2));
        PSLrEquation = `PSLr = PWL - 10 * log10(2 * π * (r^2))`;
    }
    return {
        PWL,
        PWLEquation,
        PSLr,
        PSLrEquation
    }
}

function CalculateLiquidReactionForceISO(Ao, N15, A, Kd, Kv, PA) {
    // 1.5.1.2		Reaction Force - Liquids																																		Calculate_PRV_L_FORCE	
    // Method is based on fluid momentum force (05.9045.453).  Liquid is assumed to be non-flashing.  
    // This method accounts for static thrust force only and does not consider a force multiplier for rapid application of the reactive thrust force.  
    // Liquid valves should always modulate open to avoid undesirable shock forces on the piping system due to 'water hammer' effects.  
    // As a result the dynamic load factor (DLF) is not required.  
    // Since the calculation is run for open discharge, the outlet pressure (Pb) and back pressure correction factor (Kw) is not included.  
    // Viscosity correction is included.																																					
    // Data																																					
    // Usage				CAPSHER Name							English									Metric																	
    // IN				A							area.in2									area.cm2																	
    // OUT				AO							area.in2									area.cm2																	
    // IN				Calculation_Method							-									-																	
    // IN				Code							-									-																	
    // IN				DO							length.in									length.cm																	
    // OUT				FR							force.lbf									force.N																	
    // IN				Kd							-									-																	
    // IN				Kv							-									-																	
    // OUT-DNU				N15							-									-																	
    // IN				PA							pressure.psig									pressure.barg																	
    // IN				Pi							-									-																	
    // Procedure																																					
    // Step			Conditions										Formula																								
    // 1			OR(Calculation_Method = Metric,										N15 = 20.02																								
    //             Code = ISO4126)										Units = Metric																								
    // 2			Calculation_Method = English										N15 = 2.002																								
    //                                                     Units = English																								
    // 3													AO = (Pi * DO^2) / 4																								
    // 4													FR = N15 * A^2 * Kd^2 * Kv^2 * PA / AO		
    
    let Fr = ((N15 * (A ** 2) * (Kd ** 2) * (Kv ** 2) * PA) / Ao) / 10000;
    let FrEquation = `Fr = ${N15} * A² * Kd² * Kv² * Pa / Ao`;
    return {
        Fr,
        FrEquation
    }
}

const formatValue = (value, UOM, uomKey) => {
    let Value = '';
    try {
        if(!!value) {
            if(typeof value === 'string') {
                value = Number(value);
            }
            Value = Number(value.toFixed(3));
        } 
        if (uomKey) {
            return {
                Value,
                UOM,
                uomKey
            };
        }
        return {
            Value,
            UOM
        };
    } catch (e) {
        return {
            Value: value,
            UOM
        };
    }
}

const calculateReactionForceCalculations = async (sizingData, OutletDiameter, DistanceFromValve,  Velocity, receivedReactionForceUOM, uoms, checkUomReceived, GasOutletDensity, LiquidDensityOutlet, OutletGasMassFraction, OutletStaticPressure) => {
    const { SizingDetails, Workflow, SelectedValve, FlowCapacity, PressureDetails, TemperatureDetails, FluidDetails } = sizingData;
    const { CalculationMethod, DisplayUnitSystem, KADataSet, IsASMESection8 } = SizingDetails[0];
    const { AtmPressure, SetPressure, OverPressure, InletLoss, PressureUOM, AtmPressureUOM } = PressureDetails[0];
    const { Relieving, TemperatureUOM } = TemperatureDetails[0];
    const { SpGravity, MolWeight } = FluidDetails[0];
    const payloadData = {
        AtmPressure, SetPressure, OverPressure, InletLoss, PressureUOM, AtmPressureUOM, Relieving, TemperatureUOM, SpGravity, MolWeight
    }
    const defaultUnitsByCalcMethod = {
        'English': {
            'Ao': 'in2',
            'Fr': 'lbf',
            'Noise': 'db',
            'Pu': 'psia',
            'Po': 'psig',
            'Do': 'in',
            'r': 'ft',
            'u': 'ft/s',
            'pg2':'lb/ft³',
            'pl2':'lb/ft³',
            'PO': 'psig',
        },
        'Metric': {
            'Ao': 'cm2',
            'Fr': 'N',
            'Noise': 'db',
            'Pu': 'bara',
            'Po': 'barg',
            'Do': 'cm',
            'r': 'm',
            'u': 'm/s',
            'pg2':'kg/m³',
            'pl2':'kg/m³',
            'PO': 'barg',
        }
    };
    const uomReceived = {
        OutletDiameter: OutletDiameter.UOM,
        DistanceFromValve: DistanceFromValve?.UOM,
        Velocity: Velocity?.UOM
    }
    let r = DistanceFromValve?.Value;
    let Do = OutletDiameter.Value;
    
    let u = Velocity?.Value;
    const defaultUnits = defaultUnitsByCalcMethod[CalculationMethod];
    if(defaultUnits['Do'] !== OutletDiameter.UOM) {
        Do = convertUnit(OutletDiameter.Value, uoms.find(u => u.UnitName === OutletDiameter.UOM), uoms.find(u => u.UnitName === defaultUnits['Do']));
    }
    let Ao = math.pi * ((Do / 2) ** 2);
    let AoEquation = `Ao = (π * Do^2) / 4`;
    if(u && defaultUnits['u'] !== Velocity?.UOM) {
        u = Velocity?.uomKey && Velocity?.uomKey === 'velocity.fts' ? convertUnit(Velocity?.Value, uoms.find(u => u.UnitKey === 'length.ft'), uoms.find(u => u.UnitKey === 'length.m')) : convertUnit(Velocity?.Value, uoms.find(u => u.UnitKey === 'length.m'), uoms.find(u => u.UnitKey === 'length.ft'));
    }
    if(DistanceFromValve && defaultUnits['r'] !== DistanceFromValve?.UOM) {
        r = convertUnit(DistanceFromValve?.Value, uoms.find(u => u.UnitName === DistanceFromValve?.UOM), uoms.find(u => u.UnitName === defaultUnits['r']));
    }
    const constants = getConstants(CalculationMethod);
    const { FluidType, Code } = Workflow[0];
    let equationValues = {};
    let requiredUnits = {};
    if (
        SelectedValve[0]?.ReResponse &&
        typeof SelectedValve[0].ReResponse === 'object'
    ) {
        if (SelectedValve[0].ReResponse.ReResponseG) {
            equationValues = SelectedValve[0].ReResponse.ReResponseG.equationValues ?? {};
            requiredUnits = SelectedValve[0].ReResponse.ReResponseG.uomRequired ?? {};
        } else {
            equationValues = SelectedValve[0].ReResponse.equationValues ?? {};
            requiredUnits = SelectedValve[0].ReResponse.uomRequired ?? {};
        }
    }


    const { Kd, KApi, A, C, P1, P2, Psic, Psiv, Patm, k, Z, Kc, QmActual, W, V, T, M, PR, Kv, PA, Pa, Kn, Ksh, ho, v1, KxValue, W_eq, Vl_eq } = equationValues;
    const N5 = constants['N5'];
    const N6 = constants['N6'];
    const N7 = constants['N7'];
    const N8 = constants['N8'];
    const N15 = constants['N15'];
    const N20 = constants['N20'];
    const N21 = constants['N21'];
    const N22 = constants['N22'];
    const N23 = constants['N23'];
    const N30 = constants['N30'];
    const N31 = constants['N31'];
    const N34 = constants['N34'];
    let response = {};
    if (Code === 'ISO4126') {
        if (['Gas / Vapor', 'Steam'].includes(FluidType)) {
            Do = convertUnit(OutletDiameter.Value, uoms.find(u => u.UnitName === OutletDiameter?.UOM), uoms.find(u => u.UnitName === 'mm'));
            if (u) {
                u = Velocity?.UOM === 'ft/s' ? convertUnit(Velocity?.Value, uoms.find(u => u.UnitKey === 'length.ft'), uoms.find(u => u.UnitKey === 'length.m')) : u;
                Ao = math.pi * ((Do / 2) ** 2)
                const FrResponse = CalculateGasSteamReactionForceISO(Ao, Psic, Psiv, Patm, u, QmActual, P2);
                const NoiseResponse = CalculateGasSteamNoiseLevelISO(Do, r, u, v1);
                let Ao_UOM ='mm²';
                response = {
                    OutletDiameter,
                    DistanceFromValve,
                    Velocity,
                    Velocity_EQ: formatValue(u,defaultUnits['u']),
                    Ao: formatValue(Ao, Ao_UOM),
                    AoEquation,
                    ReactionForce_EQ: formatValue(FrResponse.Fr, defaultUnits['Fr']),
                    ReactionForceEquation: FrResponse.FrEquation,
                    SoundPowerLevel: formatValue(NoiseResponse.PWL, defaultUnits['Noise']),
                    SoundPowerLevelEquation: NoiseResponse.PWLEquation,
                    SoundPressureLevelatDistancefromValve: formatValue(NoiseResponse.PSLr, defaultUnits['Noise']),
                    SoundPressureLevelatDistancefromValveEquation: NoiseResponse.PSLrEquation,
                    Pu: formatValue(FrResponse.Pu, defaultUnits['Pu']),
                    PuEquation: FrResponse.PuEquation
                }
            } else {
                response = {
                    OutletDiameter,
                    DistanceFromValve,
                    Velocity,
                    Velocity_EQ: formatValue(u,defaultUnits['u']),
                    Ao: formatValue(Ao, defaultUnits['Ao']),
                    AoEquation,
                    ReactionForce_EQ: formatValue('', defaultUnits['Fr']),
                    ReactionForceEquation: '',
                    SoundPowerLevel: formatValue('', defaultUnits['Noise']),
                    SoundPowerLevelEquation: '',
                    SoundPressureLevelatDistancefromValve: formatValue('', defaultUnits['Noise']),
                    SoundPressureLevelatDistancefromValveEquation: '',
                    Pu: formatValue('', defaultUnits['Pu']),
                    PuEquation: ''
                }
            }
        } else {
            const FrResponse = CalculateLiquidReactionForceISO(Ao, N15, A, Kd, Kv, PA);
            console.log({Ao, N15, A, Kd, Kv, PA, FrResponse});
            Ao = convertUnit(Ao, uoms.find(u => u.UnitName === 'cm²'), uoms.find(u => u.UnitName === 'mm²'));
            let Ao_UOM ='mm²';
            response = {
                OutletDiameter,
                Ao: formatValue(Ao, Ao_UOM),
                AoEquation,
                ReactionForce_EQ: formatValue(FrResponse.Fr, defaultUnits['Fr']),
                ReactionForceEquation: FrResponse.FrEquation
            }
        }
    } else {
        const Kz = KADataSet === 'ASME' ? Kd : KApi;
        if (['Gas / Vapor', 'Fire', 'Tank Vent'].includes(FluidType)) {
            const FrResponse = CalculateGasReactionForce(Ao, Kz, N34, N5, N6, A, C, P1, Kc, Do, k, Z, Patm, SizingDetails[0]?.KADataSet === 'ASME' ? 'Kd' : 'K,API');
            let IsFlowCapacity = calculateCapacity(KADataSet, Code, IsASMESection8);
            let IsMassFlow = FlowCapacity[0].FlowCapacityUOM.indexOf('massflow') > -1;
            let WnsUnit = IsMassFlow ? uoms.find(u => u.UnitName === requiredUnits.flowCapacityUOM).UnitKey : CalculationMethod === 'English' ? 'massflow.lbhr' : 'massflow.kghr';
            let Vconverted = convertUnitDiffDims(V??W, uoms.find(u => u.UnitName === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === 'gasvolflow.Nm3hr'), uoms, payloadData);
            let Wns = IsMassFlow ? (IsFlowCapacity === "Rated" ? W / 0.9 : W) : ((Vconverted * M) / 22.413996);
            Wns = IsMassFlow ? Wns : KADataSet === 'ASME' ? (convertUnitDiffDims(V??W, uoms.find(u => u.UnitName === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === WnsUnit), uoms, payloadData)) : (convertUnitDiffDims(V??W, uoms.find(u => u.UnitName === requiredUnits.flowCapacityUOM), uoms.find(u => u.UnitKey === WnsUnit), uoms, payloadData));

            const NoiseResponse = CalculateGasNoiseLevel(N7, Wns, k, T, M, PR, r, N8);
            response = {
                OutletDiameter,
                DistanceFromValve,
                Wns: formatValue(Wns, uoms.find(u => u.UnitKey===WnsUnit).UnitName, WnsUnit),
                Ao: formatValue(Ao, defaultUnits['Ao']),
                AoEquation:FrResponse.Po == 0? '': AoEquation,
                ReactionForce_EQ: formatValue(FrResponse.Fr, defaultUnits['Fr']),
                ReactionForceEquation: FrResponse.FrEquation,
                NoiseLevel: formatValue(NoiseResponse.LP, defaultUnits['Noise']),
                NoiseLevelEquation: NoiseResponse.LPEquation,
                L100: formatValue(NoiseResponse.L100, defaultUnits['Noise']),
                L100Equation: NoiseResponse.L100Equation,
                Po: formatValue(FrResponse.Po, defaultUnits['Po']),
                PoEquation: FrResponse.PoEquation
            }
        } else if (FluidType === 'Liquid') {
            const FrResponse = CalculateLiquidReactionForce(Ao, Kz, N15, A, Kv, Pa, KxValue);
            response = {
                OutletDiameter,
                Ao: formatValue(Ao, defaultUnits['Ao']),
                AoEquation,
                ReactionForce_EQ: formatValue(FrResponse.Fr, defaultUnits['Fr']),
                ReactionForceEquation: FrResponse.FrEquation
            }
        } else if (FluidType === 'Steam') {
            let ho1 = ho;
            if(!ho1) {
                const getHoVal = await getHo(P1, T, requiredUnits);
                ho1 = getHoVal;
            }
            const FrResponse = CalculateSteamReactionForce(Ao, Kz, N20, N21, N22, N23, A, P1, Kn, Ksh, Kc, ho1, Patm, SizingDetails[0]?.KADataSet === 'ASME' ? 'Kd' : 'K,API');
            let IsFlowCapacity = calculateCapacity(KADataSet, Code, IsASMESection8);
            let Wns = (IsFlowCapacity === "Rated" ? W / 0.9 : W);
            let WnsUnit = uoms.find(unit => unit.UnitName === requiredUnits.flowCapacityUOM).UnitKey;
            const NoiseResponse = CalculateSteamNoiseLevel(N7, Wns, M, k, T, M, PR, r, N8);
            response = {
                OutletDiameter,
                DistanceFromValve,
                Wns: formatValue(Wns, uoms.find(u => u.UnitKey===WnsUnit).UnitName, WnsUnit),
                Ao: formatValue(Ao, defaultUnits['Ao']),
                AoEquation,
                ReactionForce_EQ: formatValue(FrResponse.Fr, defaultUnits['Fr']),
                ReactionForceEquation: FrResponse?.FrEquation,
                NoiseLevel: formatValue(NoiseResponse.LP, defaultUnits['Noise']),
                NoiseLevelEquation: NoiseResponse?.LPEquation,
                L100: formatValue(NoiseResponse.L100, defaultUnits['Noise']),
                L100Equation: NoiseResponse?.L100Equation,
                Po: formatValue(FrResponse.Po, defaultUnits['Po']),
                PoEquation: FrResponse?.PoEquation
            }
        } else if (FluidType === '2-Phase') {
           // if(SizingDetails[0].WorkFlowId === 21 || SizingDetails[0].WorkFlowId === 13) {
            if(SizingDetails[0].WorkFlowId === 13) {
                const FrResponse = CalculateGasReactionForce(Ao, Kd, N34, N5, N6, A, C, P1, Kc, Do, k, Z, Patm, KxValue);
                response = {
                    OutletDiameter,
                    ReactionForce_EQ: formatValue(FrResponse.Fr, defaultUnits['Fr']),
                    ReactionForceEquation: FrResponse.FrEquation,
                    Po: formatValue(FrResponse.Po, defaultUnits['Po']),
                    PoEquation: FrResponse.PoEquation,
                    AoEquation:FrResponse.Po == 0? '': AoEquation,
                }
            }
            else {
                let pg2 = GasOutletDensity?.Value;
                let pg2UOM = GasOutletDensity?.UOM ? GasOutletDensity?.UOM :  DisplayUnitSystem === 'Metric' ? 'kg/L' : 'lb/ft³';
                let pl2 = LiquidDensityOutlet?.Value;
                let pl2UOM = LiquidDensityOutlet?.UOM ? LiquidDensityOutlet?.UOM : DisplayUnitSystem === 'Metric' ? 'kg/L' : 'lb/ft³';
                let Wg = 1;
                let x2 = OutletGasMassFraction?.Value;
                let PO = OutletStaticPressure?.Value;
                let PO_UOM = OutletStaticPressure?.UOM ? OutletStaticPressure?.UOM : DisplayUnitSystem === 'Metric' ? 'barg' : 'atm g';
                let pg2_EQ = pg2 ? convertUnit(pg2, uoms.find(u => u.UnitName === pg2UOM), uoms.find(u => u.UnitName === defaultUnits['pg2'])) : '';
                let pl2_EQ = pl2  ? convertUnit(pl2, uoms.find(u => u.UnitName === pl2UOM), uoms.find(u => u.UnitName === defaultUnits['pl2'])) : '';
                let PO_EQ = PO  ? convertUnit(PO, uoms.find(u => u.UnitName === PO_UOM), uoms.find(u => u.UnitName === defaultUnits['PO'])) : '';
                let Ws;
                if (W_eq === '' || W_eq === undefined || Vl_eq === '' || Vl_eq === undefined) {
                    Ws = W??V;
                } else {
                    Ws = W_eq !== '' && W_eq != null ? W_eq : Vl_eq;
                }
                const FrResponse = Calculate2PhaseReactionForce(Ws,N30,Ao,x2,pg2_EQ,pl2_EQ,PO_EQ,Patm,N31,CalculationMethod,KADataSet);
                response = {
                    OutletDiameter,
                    Ao: formatValue(Ao, defaultUnits['Ao']),
                    AoEquation,
                    ReactionForce_EQ: formatValue(FrResponse.Fr, defaultUnits['Fr']),
                    ReactionForceEquation: FrResponse.FrEquation,  
                    OutletGasMassFraction: formatValue(x2),
                    GasOutletDensity: formatValue(pg2, pg2UOM),
                    LiquidDensityOutlet: formatValue(pl2, pl2UOM),
                    OutletStaticPressure: formatValue(PO, PO_UOM),
                    GasOutletDensity_EQ: formatValue(pg2_EQ, defaultUnits['pg2']),
                    LiquidDensityOutlet_EQ: formatValue(pl2_EQ, defaultUnits['pl2']),
                    OutletStaticPressure_EQ: formatValue(PO_EQ, defaultUnits['PO']),
                }
            }
        }
    }
    
    if(receivedReactionForceUOM && receivedReactionForceUOM !== defaultUnits['Fr']) {
        response = {
            ...response,
            ReactionForce: formatValue(convertUnit(response?.ReactionForce_EQ?.Value, uoms.find(u => u.UnitName === response.ReactionForce_EQ?.UOM), uoms.find(u => u.UnitName === receivedReactionForceUOM)), receivedReactionForceUOM)
        };
    } else {
        response = {
            ...response, 
            ReactionForce: response?.ReactionForce_EQ
        };
    }
    response = {
        ...response,
        OutletDiameter_EQ: (Code === 'ISO4126' && ['Gas / Vapor', 'Steam'].includes(FluidType)) ? formatValue(Do, 'mm') : formatValue(Do, defaultUnits['Do']),
        DistanceFromValve_EQ: formatValue(r, defaultUnits['r']),
    }
    // Change units to Display Unit System if it is not 'All' for
    if(DisplayUnitSystem !== CalculationMethod && DisplayUnitSystem !== 'All') {
        const displayUnit = defaultUnitsByCalcMethod[DisplayUnitSystem];
        if(checkUomReceived) {
            if(response.OutletDiameter?.UOM !== displayUnit['Do']) {
                response.OutletDiameter = formatValue(convertUnit(response.OutletDiameter?.Value, uoms.find(u => u.UnitName === response.OutletDiameter?.UOM), uoms.find(u => u.UnitName === uomReceived?.OutletDiameter)), uomReceived?.OutletDiameter);
            }
            if(response.DistanceFromValve?.UOM !== displayUnit['r']) {
                response.DistanceFromValve = formatValue(convertUnit(response.DistanceFromValve?.Value, uoms.find(u => u.UnitName === response.DistanceFromValve?.UOM), uoms.find(u => u.UnitName === uomReceived?.DistanceFromValve)), uomReceived?.DistanceFromValve);
            }
        } else {
            if(response.OutletDiameter?.UOM !== displayUnit['Do']) {
                response.OutletDiameter = formatValue(convertUnit(response.OutletDiameter?.Value, uoms.find(u => u.UnitName === response.OutletDiameter?.UOM), uoms.find(u => u.UnitName === displayUnit['Do'])), displayUnit['Do']);
            }
            if(response.DistanceFromValve?.UOM !== displayUnit['r']) {
                response.DistanceFromValve = formatValue(convertUnit(response.DistanceFromValve?.Value, uoms.find(u => u.UnitName === response?.DistanceFromValve?.UOM), uoms.find(u => u.UnitName === displayUnit['r'])), displayUnit['r']);
            }
        }
    } else {
        response = {
            ...response,
            OutletDiameter: formatValue(convertUnit(response.OutletDiameter?.Value ?? "", uoms.find(u => u.UnitName === response.OutletDiameter?.UOM), uoms.find(u => u.UnitName === uomReceived?.OutletDiameter)), uomReceived?.OutletDiameter),
            DistanceFromValve: !!response.DistanceFromValve ? formatValue(convertUnit(response.DistanceFromValve?.Value ?? "", uoms.find(u => u.UnitName === response?.DistanceFromValve?.UOM), uoms.find(u => u.UnitName === uomReceived?.DistanceFromValve)), uomReceived?.DistanceFromValve) : {Value: "", UOM: ""}
        }
    }

    return response;
}
const calculateCapacity = (KADataSet, Code, IsASMESection8) => {
    let capacity = null;
    switch (Code) {
        case "SectionVIII":
            if (KADataSet == "API") {
                capacity = "Max";
            }
            else {
                capacity = IsASMESection8 ? "Rated" : "Actual";
            }
            break;
        case "MultiPhaseDiers7thFlashingwGas":
        case "MultiPhaseDiers7thFlashingwVapor":
        case "MultiPhaseDiers7thNonFlashing":
        case "MultiPhaseDiers7thSubcooled":
        case "MultiPhaseDiers8thFlashingNonFlashing":
        case "MultiPhaseDiers8thSubcooled":
        case "Appendix11":
        case "SeparatedFlow":
            capacity = (KADataSet == "API") ? "Max" : "Rated";
            break;
        case "SectionI":
            capacity = "Rated";
            break;
        case "API2000":
            capacity = "Max";
            break;
        case "API521Fire":
            capacity = (KADataSet == "API") ? "Max" : "Rated";
            break;
        case "API520":
            capacity = (KADataSet == "API") ? "Max" : "Actual";
            break;
        default:
            capacity = Capacity.Max;
            break;
    }
    return capacity;
}
module.exports = {
    calculateReactionForceCalculations
}