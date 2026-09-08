// Equation_Equation	Equation	Description of Equation	Section
// Equation_1p1	1.1	Theoretical Pressure Ratio	1.1.2
// Equation_1p2	1.2	Absolute Pressure Ratio	1.1.2
// Equation_1p3a	1.3a	Calculated Volumetric Flow for Sub-critical Gas/Vapor	1.1.3.1
// Equation_1p3b	1.3b	Calculated Mass Flow for Sub-critical Gas/Vapor	1.1.3.1
// Equation_1p4	1.4	Subsonic Flow Factor	1.1.3.2
// Equation_1p5a	1.5a	Calculated Volumetric Flow for Critical Gas/Vapor	1.1.4.1
// Equation_1p5b	1.5b	Calculated Mass Flow for Critical Gas/Vapor	1.1.4.1
// Equation_1p6	1.6	Gas Constant	1.1.4.2
// Equation_1p7	1.7	Calculate the Outlet Static Pressure for Gas/Vapor	1.1.5
// Equation_1p8a	1.8a	Gas/Vapor Reaction Force when Static Pressure ≤ 0.0	1.1.5
// Equation_1p8b	1.8b	Gas/Vapor Reaction Force When Static Pressure > 0.0	1.1.5
// Equation_1p9a	1.9a	Noise Level @ 100-ft for 1/PR > 2.859	1.1.6
// Equation_1p9b	1.9b	Noise Level @ 100-ft for 1/PR <= 2.859	1.1.6
// Equation_1p10	1.10	Noise Level @ Distances Other Than 100-ft	1.1.6
const Equation_1p1 = (k) => {
    //Theoretical Pressure Ratio 
    // Section 1.1.2
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				TPR				-				-				Theoretical Pressure Ratio for Critical Flow																	
    // UI				k				-				-				Ratio of Specific Heats (cp/cv)																	
    let TPR = (2 / (k + 1)) ** (k / (k - 1));
    return TPR;
}
const Equation_1p2 = (P1, P2) => {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				PR				-				-				Pressure Ratio (Absolute)																	
    // IM				P1				Note 1				Note 1				Inlet Pressure																	
    // IM				P2				Note 1				Note 1				Outlet Pressure																	
    let PR = P2 / P1;
    return PR;
}
const Equation_1p3a = (N1, Kx, A, P1, Fs, M, T, Z) => {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				V				SCFH				Nm3/hr				Calculated Max. Volumetric Flow (Note 2)																	
    // OUT				W				lb/hr				kg/hr				Calculated Max. Mass Flow (Note 2)																	
    // UI				A				in2				cm2				Selected Orifice Area (Note 1)																	
    // IM				Kx				-				-				Flow Coefficient (Note 2)																	
    // IM				Fs				-				-				Subsonic Flow Factor (Section 1.1.3.2)																	
    // UI				M				-				-				Molecular Weight																	
    // UI				SG				-				-				Specific Gravity																	
    // UI				T				°R				°K				Relieving Temperature																	
    // UI				Z				-				-				Compressibility Factor																	
    // IM				P1				psia				bara				Inlet Pressure																	
    // IM				P2				psia				bara				Outlet Pressure																	
    // IM				N1				-				-				Constant for Sub-critical Gas Vol. Flow (Note 3)																	
    // IM				N2				-				-				Constant for Sub-critical Gas Mass Flow (Note 3)																	

    // 						NOTES:																											
    // 				1.		This value will come from a list of available valves and corresponding orifice areas,																											
    // 						which the user will need to select.																											
    // 				2.		The determination of this variable is defined in more detail for specific product types																											
    // 						in Part II.																											
    // 				3.		Values for equation constants are as follows:																											
    // 								English Units					Metric Units																				
    // 						N1		278700					12515																				
    // 						N2		735					560																				
    // 				4.		The user should be given the option of entering M or SG for the gas/vapor.  The 																											
    // 						capacity equation is written in terms of M; therefore, it will be necessary to perform																											
    // 						a conversion if the user selects SG.  The following conversion should be used:																											
    // 						M = 28.97 * SG  (28.97 is the M of Air).			

    let V = ((N1 * Kx * A * P1 * Fs) / ((M * T * Z) ** 0.5));
    return V;
}
const Equation_1p3b = (N2, Kx, A, P1, Fs, M, T, Z) => {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				V				SCFH				Nm3/hr				Calculated Max. Volumetric Flow (Note 2)																	
    // OUT				W				lb/hr				kg/hr				Calculated Max. Mass Flow (Note 2)																	
    // UI				A				in2				cm2				Selected Orifice Area (Note 1)																	
    // IM				Kx				-				-				Flow Coefficient (Note 2)																	
    // IM				Fs				-				-				Subsonic Flow Factor (Section 1.1.3.2)																	
    // UI				M				-				-				Molecular Weight																	
    // UI				SG				-				-				Specific Gravity																	
    // UI				T				°R				°K				Relieving Temperature																	
    // UI				Z				-				-				Compressibility Factor																	
    // IM				P1				psia				bara				Inlet Pressure																	
    // IM				P2				psia				bara				Outlet Pressure																	
    // IM				N1				-				-				Constant for Sub-critical Gas Vol. Flow (Note 3)																	
    // IM				N2				-				-				Constant for Sub-critical Gas Mass Flow (Note 3)																	

    // 						NOTES:																											
    // 				1.		This value will come from a list of available valves and corresponding orifice areas,																											
    // 						which the user will need to select.																											
    // 				2.		The determination of this variable is defined in more detail for specific product types																											
    // 						in Part II.																											
    // 				3.		Values for equation constants are as follows:																											
    // 								English Units					Metric Units																				
    // 						N1		278700					12515																				
    // 						N2		735					560																				
    // 				4.		The user should be given the option of entering M or SG for the gas/vapor.  The 																											
    // 						capacity equation is written in terms of M; therefore, it will be necessary to perform																											
    // 						a conversion if the user selects SG.  The following conversion should be used:																											
    // 						M = 28.97 * SG  (28.97 is the M of Air).																											
    let W = N2 * Kx * A * P1 * Fs * ((M / (T * Z)) ** 0.5);
    return W;
}
const Equation_1p4 = (PR, k) => {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				Fs				-				-				Subsonic Flow Factor																	
    // UI				k				-				-				Ratio of Specific Heats																	
    // IM				P1				psia				bara				Inlet Pressure																	
    // IM				P2				psia				bara				Outlet Pressure		
    let Fs = ((k / (k - 1)) * ((PR ** (2 / k)) - (PR ** ((k + 1) / k)))) ** 0.5;
    return Fs;
}
const Equation_1p5a = (N3, A, C, Kx, P1, Kb, Kc, M, T, Z) => {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				V				SCFM				Nm3/hr				Calculated Max. Volumetric Flow (Note 2)																	
    // OUT				W				lb/hr				kg/hr				Calculated Max. Mass Flow (Note 2)																	
    // UI				A				in2				cm2				Selected Orifice Area (Note 1)																	
    // UI				M				-				-				Molecular Weight																	
    // UI				SG				-				-				Specific Gravity																	
    // UI				T				°R				°K				Relieving Temperature																	
    // UI				Z				-				-				Compressibility Factor																	
    // IM				C				(lbm-lbmole-°R)0.5/ (lbf-hr)				(kg-kgmole-°K)0.5/(cm²-hr-bar)				Gas Coefficient (Section 1.1.4.2)																	
    // IM				Kx				-				-				Flow Coefficient (Note 2)																	
    // IM				P1				psia				bara				Inlet Pressure																	
    // IM				Kb				-				-				Back Pressure Correction Factor (Note 2)																	
    // UI				Kc				-				-				Rupture Disc Combination Correction Factor (Note 5)																	
    // IM				N3				-				-				Constant for Critical Gas Vol. Flow (Note 3)																	
    // IM				N4				-				-				Constant for Critical Gas Mass Flow (Note 3)																	

    //                         NOTES:																											
    //                 1.		This value will come from a list of available valves and corresponding orifice areas,																											
    //                         which the user will need to select.																											
    //                 2.		The determination of this variable is defined in more detail for specific product types																											
    //                         in Part II.  																											
    //                 3.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N3		6.32					22.421524664																				
    //                         N4		1					1																				
    //                 4.		The user should be given the option of entering M or SG for the gas/vapor.  The 																											
    //                         capacity equation is written in terms of M; therefore, it will be necessary to perform																											
    //                         a conversion if the user selects SG.  The following conversion should be used:																											
    //                         M = 28.97 * SG  (28.97 is the M of Air).																											
    //                 5.		When the user chooses to include a rupture disc, the program should default 																											
    //                         Kc = 0.9, but the user should be able to change that value.  If the user chooses																											
    //                         not to include the rupture disc, the program should set Kc = 1.0, and prevent the																											
    //                         user from making changes to the value.																											
    let V = (N3 * A * C * Kx * P1 * Kb * Kc) / ((M * T * Z) ** 0.5);
    //6.32 * A * C * K * P1 * Kb * Kc / math.sqrt(M * (T + 459.67) * Z);
    return V;
}
const Equation_1p5b = (N4, A, C, Kx, P1, Kb, Kc, M, T, Z) => {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				V				SCFM				Nm3/hr				Calculated Max. Volumetric Flow (Note 2)																	
    // OUT				W				lb/hr				kg/hr				Calculated Max. Mass Flow (Note 2)																	
    // UI				A				in2				cm2				Selected Orifice Area (Note 1)																	
    // UI				M				-				-				Molecular Weight																	
    // UI				SG				-				-				Specific Gravity																	
    // UI				T				°R				°K				Relieving Temperature																	
    // UI				Z				-				-				Compressibility Factor																	
    // IM				C				(lbm-lbmole-°R)0.5/ (lbf-hr)				(kg-kgmole-°K)0.5/(cm²-hr-bar)				Gas Coefficient (Section 1.1.4.2)																	
    // IM				Kx				-				-				Flow Coefficient (Note 2)																	
    // IM				P1				psia				bara				Inlet Pressure																	
    // IM				Kb				-				-				Back Pressure Correction Factor (Note 2)																	
    // UI				Kc				-				-				Rupture Disc Combination Correction Factor (Note 5)																	
    // IM				N3				-				-				Constant for Critical Gas Vol. Flow (Note 3)																	
    // IM				N4				-				-				Constant for Critical Gas Mass Flow (Note 3)																	

    //                         NOTES:																											
    //                 1.		This value will come from a list of available valves and corresponding orifice areas,																											
    //                         which the user will need to select.																											
    //                 2.		The determination of this variable is defined in more detail for specific product types																											
    //                         in Part II.  																											
    //                 3.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N3		6.32					22.421524664																				
    //                         N4		1					1																				
    //                 4.		The user should be given the option of entering M or SG for the gas/vapor.  The 																											
    //                         capacity equation is written in terms of M; therefore, it will be necessary to perform																											
    //                         a conversion if the user selects SG.  The following conversion should be used:																											
    //                         M = 28.97 * SG  (28.97 is the M of Air).																											
    //                 5.		When the user chooses to include a rupture disc, the program should default 																											
    //                         Kc = 0.9, but the user should be able to change that value.  If the user chooses																											
    //                         not to include the rupture disc, the program should set Kc = 1.0, and prevent the																											
    //                         user from making changes to the value.																											
    let W = ((A * C * Kx * P1 * Kb * Kc) / N4) * ((M / (T * Z)) ** 0.5);
    return W;
}
const Equation_1p6 = (N33, k) => {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				C				"(lbm-lbmole-
    // °R)0.5/ (lbf-hr)"				(kg-kgmole-°K)0.5/(cm²-hr-bar)				Gas Coefficient (Section 1.1.4.2)																	

    // UI				k				-				-				Ratio of Specific Heats (Note 2)																	
    // IM				N33				-				-				Constant for Gas Constant (Note 1)																	

    //                         NOTES:																											
    //                 1.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N33		520					394.8																				
    //                 2.		The value of k must be greater than zero.  When a value of '1.0' is entered, the																											
    //                         value should be changed to '1.00001' so as not to cause a division by zero error.																											
    let C = N33 * ((k * ((2 / (k + 1)) ** ((k + 1) / (k - 1)))) ** 0.5);
    return C;
}
const Equation_1p7 = (N34, A, C, Kz, P1, Patm, Do, k, Z) => {
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

    //                         NOTES:																											
    //                 1.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N5		366					27.90697674																				
    //                         N6		1					10																				
    //                         N34		0.00245					0.003225																				
    //                 2.		For dual outlet valves, the reaction force is equal to zero.																											
    //                 3.		For ASME Data Set, Kz = Kd																											
    //                         For API Data Set, Kz = K,API																											
    let Po = ((N34 * A * C * Kz * P1 * Kc) / ((Do ** 2) * ((k * Z) ** 0.5))) - Patm;
    return Po;
}
const Equation_1p8a = (N5, A, C, Kz, P1, Kb, Kc, k, Z) => {
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

    //                         NOTES:																											
    //                 1.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N5		366					27.90697674																				
    //                         N6		1					10																				
    //                         N34		0.00245					0.003225																				
    //                 2.		For dual outlet valves, the reaction force is equal to zero.																											
    //                 3.		For ASME Data Set, Kz = Kd																											
    //                         For API Data Set, Kz = K,API																											
    let Fr = ((A * C * Kz * P1 * Kb * Kc) / N5) * (((k / ((k + 1) * Z)) ** 0.5));
    return Fr;
}
const Equation_1p8b = (N5, N6, A, C, Kz, P1, Kb, Kc, k, Z, Ao, Po) => {
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

    //                         NOTES:																											
    //                 1.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N5		366					27.90697674																				
    //                         N6		1					10																				
    //                         N34		0.00245					0.003225																				
    //                 2.		For dual outlet valves, the reaction force is equal to zero.																											
    //                 3.		For ASME Data Set, Kz = Kd																											
    //                         For API Data Set, Kz = K,API																
    let Fr = (((A * C * Kz * P1 * Kb * Kc) / N5) * (((k / ((k + 1) * Z)) ** 0.5))) + (N6 * Ao * Po);
    return Fr;
}
const Equation_1p9a = (N7, PR, W, k, T, M) => {
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
    let PRPrime = 1 / PR;
    let L100 = ((6.5 * Math.log10(PRPrime)) + 51.28) + (10 * Math.log10((N7 * W * k * T) / M));
    return L100;
}
const Equation_1p9b = (N7, PR, W, k, T, M) => {
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
    let PRPrime = 1 / PR;
    let L100 = ((87.75 * Math.log10(PRPrime)) + 14.09) + (10 * Math.log10((N7 * W * k * T) / M));
    return L100;
}
const Equation_1p10 = (N8, L100, r) => {
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
    return LP;
}

////////////////////////////////////////////////////////////////////////
// Equation_1p11a	1.11a	Calculated Volumetric Flow for Liquid	1.2.2
// Equation_1p11b	1.11b	Calculated Mass Flow for Liquid	1.2.2
// Equation_1p12	1.12	Viscosity Correction Factor	1.2.3
// Equation_1p13	1.13	Reynolds Number	1.2.3
// Equation_1p14	1.14	Liquid Reaction Force	1.2.4
////////////////////////////////////////////////////////////////////////
function Equation_1p11a(N13, A, Kx, Kw, Kc, Kv, Pa, Pb, SG) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																		
    // OUT				VL				gpm				m3/hr				Calculated Max. Liquid Volumetric Flow (Note 2)																		
    // OUT				WL				lb/hr				kg/hr				Calculated Max. Liquid Mass Flow (Note 2)																		
    // UI				A				in2				cm2				Selected Orifice Area (Note 1)																		
    // IM				Kx				-				-				Derated Flow Coefficient (Note 2)																		
    // IM				N13				-				-				Constant for Liquid Volumetric Flow (Note 3)																		
    // IM				N43				-				-				Constant for Liquid Mass Flow (Note 3)																		
    // IM				Kw				-				-				Liquid Back Pressure Correction Factor (Note 2)																		
    // UI				Kc				-				-				Rupture Disc Combination Correction Factor (Note 4)																		
    // IM				Kv				-				-				Viscosity Correction Factor (Section 1.2.3)																		
    // IM				PA				psig				barg				Inlet Pressure																		
    // IM				PB				psig				barg				Outlet Pressure																		
    // UI				SG				-				-				Liquid Specific Gravity																		

    //                         NOTES:																												
    //                 1.		This value will come from a list of available valves and corresponding orifice areas,																												
    //                         which the user will need to select.																												
    //                 2.		The determination of this variable is defined in more detail for specific product types																												
    //                         in Part II.  																												
    //                 3.		Values for equation constants are as follows:																												
    //                                 English Units					Metric Units																					
    //                         N13		38					5.09338																					
    //                         N43		19027.5					5093.38																					
    //                 4.		When the user chooses to include a rupture disc, the program should default 																												
    //                         Kc = 0.9, but the user should be able to change that value.  If the user chooses																												
    //                         not to include the rupture disc, the program should set Kc = 1.0, and prevent the																												
    //                         user from making changes to the value.																												
    let Vl = (N13 * A * Kx * Kw * Kc * Kv) * (((Pa - Pb) / SG) ** 0.5);
    return Vl;
}
function Equation_1p11b(N43, A, Kx, Kw, Kc, Kv, Pa, Pb, SG) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																		
    // OUT				VL				gpm				m3/hr				Calculated Max. Liquid Volumetric Flow (Note 2)																		
    // OUT				WL				lb/hr				kg/hr				Calculated Max. Liquid Mass Flow (Note 2)																		
    // UI				A				in2				cm2				Selected Orifice Area (Note 1)																		
    // IM				Kx				-				-				Derated Flow Coefficient (Note 2)																		
    // IM				N13				-				-				Constant for Liquid Volumetric Flow (Note 3)																		
    // IM				N43				-				-				Constant for Liquid Mass Flow (Note 3)																		
    // IM				Kw				-				-				Liquid Back Pressure Correction Factor (Note 2)																		
    // UI				Kc				-				-				Rupture Disc Combination Correction Factor (Note 4)																		
    // IM				Kv				-				-				Viscosity Correction Factor (Section 1.2.3)																		
    // IM				PA				psig				barg				Inlet Pressure																		
    // IM				PB				psig				barg				Outlet Pressure																		
    // UI				SG				-				-				Liquid Specific Gravity																		

    //                         NOTES:																												
    //                 1.		This value will come from a list of available valves and corresponding orifice areas,																												
    //                         which the user will need to select.																												
    //                 2.		The determination of this variable is defined in more detail for specific product types																												
    //                         in Part II.  																												
    //                 3.		Values for equation constants are as follows:																												
    //                                 English Units					Metric Units																					
    //                         N13		38					5.09338																					
    //                         N43		19027.5					5093.38																					
    //                 4.		When the user chooses to include a rupture disc, the program should default 																												
    //                         Kc = 0.9, but the user should be able to change that value.  If the user chooses																												
    //                         not to include the rupture disc, the program should set Kc = 1.0, and prevent the																												
    //                         user from making changes to the value.																												
    let Wl = (N43 * A * Kx * Kw * Kc * Kv) * (((Pa - Pb) * SG) ** 0.5);
    return Wl;
}
function Equation_1p12(R) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				Kv				-				-				Viscosity Correction Factor																	
    // IM				R				-				-				Reynolds Number (Equation 1.13)																	
    let Kv = (0.9935 + (2.878 / (R ** 0.5)) + (342.75 / (R ** 1.5))) ** (-1.0)
    return Kv;
}
function Equation_1p13(N14, Vl, SG, µ, A) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																
    // OUT				R				-				-				Reynolds Number																
    // IM				N14				-				-				Constant for Reynolds Number Calculation (Note 1)																
    // UI				VL				gpm				m3/hr				Calculated Max. Liquid Volumetric Flow (Note 4)																
    // UI				SG				-				-				Liquid Specific Gravity																
    // UI				µ				cp				cp				Liquid Viscosity																
    // UI				A				in2				cm2				Selected Orifice Area																

    //                         NOTES:																										
    //                 1.		Values for equation constants are as follows:																										
    //                                 English Units					Metric Units																			
    //                         N14		2800					31333.33333																			
    //                 2.		The minimum value that can accurately be determined from Equation 1.12 is 																										
    //                         Kv = 0.3.  If the calculated value of Kv drops below 0.3, then the calculation can 																										
    //                         not continue.  The maximum value of Kv = 1.0.  If the calculated value of Kv 																										
    //                         exceeds 1.0, then the program should use Kv = 1.0.  An informational message																										
    //                         indicate that the Kv falls below the minimum value, and can not be determined																										
    //                         with the existing data.																										
    //                 3.		The user should have the ability to turn off the viscosity correction check if they 																										
    //                         choose to do so.  This would be done in cases where Kv would be out of range of																										
    //                         the calculation method, or the viscosity of the fluid is now known.  This would need																										
    //                         to appear on the data input screen as a check box only when the sizing basis is																										
    //                         thermal relief'.  Some kind of indication would need to be made that the sizing was 																										
    //                         performed without the viscosity correction factor.  For this case, Kv = 1.0.																										
    //                 4.		If the flow calculation is run using Equation 1.11b, the value of VL will need to be 																										
    //                         calculated.  In this case, VL will be equal to the converted value of WL into the 																										
    //                         appropriate volumetric flow units.																										

    //                     When a relief valve is sized for viscous liquid service, it should first be sized as if it																											
    //                     were for a non-viscous type application.  The following are the steps to follow to 																											
    //                     calculate the maximum flow rate for a given valve:																											
    //                                 Step 1:	Assume Kv = 1.0																							
    //                                 Step 2:	Calculate VL using Equation 1.11																							
    //                                 Step 3:	Calculate R using Equation 1.13																							
    //                                 Step 4:	Calculate Kv using Equation 1.12																							
    //                                 Step 5:	Compare Kv from Step 4 to Kv from Step 1.  If the absolute value of the 																							
    //                                     difference between the two Kv values is > 0.000001, then return to Step 2,																							
    //                                     otherwise the value of VL from Step 2 may be used as the maximum flow 																							
    //                                     rate for the selected valve.																							
    let R = (N14 * Vl * SG) / (µ * (A ** 0.5));
    return R;
}
function Equation_1p14(N15, A, Kz, Kv, Pa, Ao) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				FR				lbf				N				Reactive Thrust Force (Reaction Force)																	
    // IM				N15				-				-				Constant for Liquid Reaction Force (Note 1)																	
    // IM				A				in2				cm2				Selected Valve Orifice Area																	
    // IM				Kz				-				-				Actual Flow Coefficient (Note 2)																	
    // IM				Kv				-				-				Viscosity Correction Factor																	
    // IM				PA				psig				barg				Inlet Pressure (Gauge)																	
    // IM				AO				in2				cm2				Valve Outlet Area (Section 3.5)																	

    //                         NOTES:																											
    //                 1.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N15		2.002					20.02																				
    //                 2.		For ASME Data Set, Kz = Kd																											
    //                         For API Data Set, Kz = K,API																											
    let Fr = (N15 * (A ** 2) * (Kz ** 2) * (Kv ** 2) * Pa) / Ao;
    return Fr;
}

/////////////////////////////////////////////////////////////////////////////////
// Equation_1p15	1.15	Calculated Mass Flow For Steam	1.3.2
// Equation_1p16	1.16	Napier Correction Factor	1.3.2.1
// Equation_1p17	1.17	Calculate the Outlet Static Pressure for Steam	1.3.3
// Equation_1p18a	1.18a	Steam Reaction Force when Static Pressure ≤ 0.0	1.3.3
// Equation_1p18b	1.18b	Steam Reaction Force When Static Pressure > 0.0	1.3.3
/////////////////////////////////////////////////////////////////////////////////
function Equation_1p15(N16, A, P1, Kx, Kb, Kc, Kn, Ksh, Ksc) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				W				lb/hr				kg/hr				Calculated Max. Mass Flow (Notes 3, 4, & 6)																	
    // IM				N16				-				-				Constant for Steam Sizing (Note 1)																	
    // UI				A				in2				cm2				Selected Valve Orifice Area (Note 2)																	
    // IM				P1				psia				bara				Inlet Pressure																	
    // IM				Kx				-				-				Flow Coefficient (Note 3)																	
    // IM				Kb				-				-				Back Pressure Correction Factor (Note 3)																	
    // UI				Kc				-				-				Rupture Disc Combination Correction Factor (Note 5)																	
    // IM				KN				-				-				Napier Correction Factor (Section 1.3.2.1)																	
    // IM				KSH				-				-				Superheat Correction Factor (Section 1.3.2.2)																	
    // IM				KSC				-				-				Supercritical Correction Factor (Section 1.3.2.3)																	

    //                         NOTES:																											
    //                 1.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N16		51.5					52.5																				
    //                 2.		This value will come from a list of available valves and corresponding orifice areas,																											
    //                         which the user will need to select.																											
    //                 3.		The determination of this variable is defined in more detail for specific product types																											
    //                         in Part II.  																											
    //                 4.		When KSH = 1.0, W is considered Saturated Steam Flow, otherwise is considered																											
    //                         Superheated Steam Flow.																											
    //                 5.		When the user chooses to include a rupture disc, the program should default 																											
    //                         Kc = 0.9, but the user should be able to change that value.  If the user chooses																											
    //                         not to include the rupture disc, the program should set Kc = 1.0, and prevent the																											
    //                         user from making changes to the value.																											
    //                 6.		Use Section 1.3.2.4 for the calculation of restricted capacity.																											
    //                 7.		Per API 520, Part I, when T > 1200°F.  User should be shown the following error 																											
    //                         message, "For relieving temperature above 1200°F, use a gas \ vapor calculation."																											
    let W = N16 * A * P1 * Kx * Kb * Kc * Kn * Ksh * Ksc;
    return W;
}
function Equation_1p16(N17, N18, P1) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																	
    // OUT				KN				-				-				Napier Correction Factor (Note 2)																	
    // IM				P1				psia				bara				Inlet Pressure																	
    // IM				N17				-				-				Constant for Napier - Numerator (Note 1)																	
    // IM				N18				-				-				Constant for Napier - Denominator (Note 1)																	

    //                         NOTES:																											
    //                 1.		Values for equation constants are as follows:																											
    //                                 English Units					Metric Units																				
    //                         N17		0.1906					2.764419281																				
    //                         N18		0.2292					3.324264949																				
    //                 2.		If KN < 1.0, then KN = 1.0																											
    //                 3.		English: P1 is only calculated using Equation 1.16 when 1500 < P1 ≤ 3208.2 (psia)																											
    //                         is true.  If P1 > 3208.2 psia or P1 ≤ 1500 psia, then KN = 1.0																											
    //                         Metric: P1 is only calculated using Equation 1.16 when 103.4 < P1 ≤ 220.6 (bara)																											
    //                         is true.  If P1 > 220.6 psia or P1 ≤ 103.4 psia, then KN = 1.0																											
    let Kn = ((N17 * P1) - 1000) / ((N18 * P1) - 1061);
    return Kn;
}
function Equation_1p17(N20, N21, A, P1, Kz, Kn, Ksh, Ksc, Kc, ho, Ao, Patm) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																		
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

    //                         NOTES:																												
    //                 1.		Evaluated at P1 & T.  See Appendix F for value.																												
    //                 2.		Values for equation constants are as follows:																												
    //                                 English Units					Metric Units																					
    //                         N20		0.027635555					0.018120214																					
    //                         N21		823					1914.3																					
    //                         N22		0.035934521					0.235617201																					
    //                         N23		1					10																					
    //                 3.		For ASME Data Set, Kz = Kd																												
    //                         For API Data Set, Kz = K,API																												
    let Po = ((N20 * A * P1 * Kz * Kn * Ksh * Ksc * Kc * ((ho - N21) ** 0.5)) / Ao) - Patm;
    return Po;
}
function Equation_1p18a(N21, N22, A, P1, Kz, Kn, Ksh, Ksc, Kc, ho) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																		
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

    //                         NOTES:																												
    //                 1.		Evaluated at P1 & T.  See Appendix F for value.																												
    //                 2.		Values for equation constants are as follows:																												
    //                                 English Units					Metric Units																					
    //                         N20		0.027635555					0.018120214																					
    //                         N21		823					1914.3																					
    //                         N22		0.035934521					0.235617201																					
    //                         N23		1					10																					
    //                 3.		For ASME Data Set, Kz = Kd																												
    //                         For API Data Set, Kz = K,API		
    let Fr = N22 * A * P1 * Kz * Kn * Ksh * Ksc * Kc * ((ho - N21) ** 0.5);
    return Fr;
}
function Equation_1p18b(N21, N22, N23, A, P1, Kz, Kn, Ksh, Ksc, Kc, ho, Ao, Po) {
    // Usage				Variable				EnglishUnits				MetricUnits				Description																		
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

    //                         NOTES:																												
    //                 1.		Evaluated at P1 & T.  See Appendix F for value.																												
    //                 2.		Values for equation constants are as follows:																												
    //                                 English Units					Metric Units																					
    //                         N20		0.027635555					0.018120214																					
    //                         N21		823					1914.3																					
    //                         N22		0.035934521					0.235617201																					
    //                         N23		1					10																					
    //                 3.		For ASME Data Set, Kz = Kd																												
    //                         For API Data Set, Kz = K,API		
    let Fr = (N22 * A * P1 * Kz * Kn * Ksh * Ksc * Kc * ((ho - N21) ** 0.5)) + (N23 * Ao * Po);
    return Fr;
}

module.exports = {
    Equation_1p1,
    Equation_1p2,
    Equation_1p3a,
    Equation_1p3b,
    Equation_1p4,
    Equation_1p5a,
    Equation_1p5b,
    Equation_1p6,
    Equation_1p7,
    Equation_1p8a,
    Equation_1p8b,
    Equation_1p9a,
    Equation_1p9b,
    Equation_1p10,    
    Equation_1p11a,
    Equation_1p11b,
    Equation_1p12,
    Equation_1p13,
    Equation_1p14,
    Equation_1p15,
    Equation_1p16,
    Equation_1p17,
    Equation_1p18a,
    Equation_1p18b
}