import {
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
} from './Equations1';

// Gas / Vapor Service																													
// To calculate the flow for VWL, go to Section 1.1.3 (Note 10)																													
// To calculate the noise level for VWL, go to Section 1.1.6																													

//     NOTES:																												
// 1.		All pressure values (for both pressure and vacuum cases) should be used in the 																												
//     equations as positive values.  Text on the screen should instruct the user																												
//     to enter the values for vacuum as positive values, but the absolute value should																												
//     be taken in the program in the event the message is ignored or forgotten.																												
// 2.		Calculation of P1																												
//         For Pressure Relief Case, P1 = PSET + POVER + PATM																											
//         For Vacuum Relief Case, P1 = PATM																											
// 3.		Calculation of P2																												
//         For Pressure Relief Case, P2 = PATM																											
//         For Vacuum Relief Case, P2 = PATM - VSET - VOVER																											
// 4.		DP = P1 - P2 ,for both pressure & vacuum cases.  (Note: P1 > P2) 																												
// 5.		Calculation of Kx is described in Section 2.1.2																												
// 6.		The user may enter the flow rate (V or W) directly, or it can be calculated using the																												
//     method presented in Section 3.1 if the appropriate data is provided.  Otherwise, the																												
//     user will select a valve to find it's maximum flow rate.																												
// 7.		There is no nameplate capacity.																												
// 8.		Flow curves are generated on dataset [PSET, 2.5 x PSET].																												
// 9.		CDTP is not applicable.																												
// 10.		Equation 1.3a defines V = VMAX																												
//     Equation 1.3b defines W = WMAX																												
// 11.		VWL Model 711 can be sized for PSET ≥ 15-psig using Section 1.1.3 																												
// 12.		VWL Models 3500B, 3600B, and 3650B require MAWP value to be entered for 																												
//     vacuum only case before appearing in the selection list.																												
// 13.		When PLOSS > 0, no VWL model can be selected.																												
// 14.		If PBACK = 0.0, Kb = 1.0, for both pressure & vacuum cases.  If PBACK > 0.0,																												
//     then Kb = 0.0 (i.e. Varec valves can not be selected if back pressure is present.)

function VWL(inputs, valve) {
    let im = null;  

    let Patm = inputs.Patm;
    let Pset = inputs.Pset;
    let Pover = inputs.Pover;
    let Ploss = inputs.Ploss;
    let Vset = inputs.Vset;
    let Vover = inputs.Vover;
    let Pback = inputs.Pback;
    let T = inputs.T;
    let k = inputs.k;
    let M = inputs.M;
    let Z = inputs.Z;
    let Kc = inputs.Kc;
    let CM = inputs.CalculationMethod;

    let ValveFunction = valve.ValveFunction;
    let Tp = valve.Tp;
    let E = valve.E;
    let A = valve.A;

    try {
        let P1 = null;
        let P2 = null;
        let DeltaP = null;
        let DeltaV = null;
        let X = null;
        if (ValveFunction === 'P') {
            P1 = Pset + Pover + Patm;
            P2 = Patm;
            DeltaP = P1 - P2;
            X = Pover / Pset;
        }
        else {
            P1 = Patm;
            P2 = Patm - Vset - Vover;
            DeltaV = P1 - P2;
            X = Vover / Vset;
        }
        let PR = Equation_1p2(P1, P2);
        let TPR = Equation_1p1(k);        
        let IsCritical = PR > TPR;
        
        let IsMassFlow = true;

        let { Kmax, K, KApi, Kd, Kx, KxValue } = Calculate_Kx_Section_2_1_2(valve, X, Tp, E);
        
        let V = null;
        let W = null;
        let Fs = null;
        let C = null;
        let Kb = Pback > 0.0 ? 0.0 : 1.0;
        let N1 = null;
        let N2 = null;
        let N3 = null;
        let N4 = null;
        let N33 = null;        
        if (IsMassFlow) {
            if (IsCritical) {
                C = Equation_1p6(k, CM);
                W = Equation_1p5b(N4, A, C, Kx, P1, Kb, Kc, M, T, Z);
            }
            else {
                Fs = Equation_1p4(PR, k);
                W = Equation_1p3b(N2, Kx, A, P1, Fs, M, T, Z);
            }
        }
        else {
            if (IsCritical) {
                C = Equation_1p6(N33, k);
                V = Equation_1p5a(N3, A, C, Kx, P1, Kb, Kc, M, T, Z);
            }
            else {
                Fs = Equation_1p4(PR, k);
                V = Equation_1p3a(N1, Kx, A, P1, Fs, M, T, Z);
            }
        }




    } catch (e) {
        console.log(e);
    }
    return im;
}

function ValidateVWL(inputs, valve) {

}

function Calculate_Kx_Section_2_1_2(valve, X, Tp, E) {
    let Kmax = valve.KADataSet === 'ASME' ? valve.Kmax : valve.KADataSet === 'API' ? valve.KAPI : null;
    let K = valve.Kmax;
    let KApi = valve.KAPI;
    let Kd = null;
    let Kx = null;
    let KxValue = null;
    try {
        Kd = Calculate_Kd_Eq_2_1(X, Tp, E, Kmax);
        Kx = Kd;
        KxValue = 'Kd';
    } catch (e) {
        console.log(e);
    }
    return { Kmax, K, KApi, Kd, Kx, KxValue };
}

function Calculate_Kd_Eq_2_1(X, Tp, E, Kmax) {
    return (X >= Tp) ? Kmax : Kmax * Math.pow((Math.sin((X / Tp) * (Math.PI / 2))), E);
}