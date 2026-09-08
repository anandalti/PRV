// Tank calc report Data===============================================

// const calculatedTankVolume = (sizingData) => {
//     let result = 0;
//     let SphericalVol = (3.15 * Number(sizingData[0].diameter)) / 6;
//     let cylindricalFlatVol = (3.15 * Math.sqrt(Number(sizingData[0].diameter)) * Number(sizingData[0].length_end_end_lt)) / 4;
//     let cylindricalHemisphericalVol = (3.15 * Math.sqrt(Number(sizingData[0].diameter)) * (2 * Number(sizingData[0].diameter) + 3 * Number(sizingData[0].length_seem_seem_ls))) / 12;
//     let RectangularVol = Number(sizingData[0].height) * Number(sizingData[0].vessel_width) * Number(sizingData[0].length_end_end_lt);

//     if (sizingData[0].tank_shape === "Spherical") {
//         return result = SphericalVol;
//     }
//     if (sizingData[0].tank_shape === "Rectangular") {
//         return result = RectangularVol;
//     }
//     if (sizingData[0].tank_shape === "Cylindrical" && sizingData[0].ends === "Flat Ends") {
//         return result = cylindricalFlatVol;
//     }
//     if (sizingData[0].tank_shape === "Cylindrical" && sizingData[0].ends === "Hemispherical Ends") {
//         return result = cylindricalHemisphericalVol;
//     }

// }

// let tank_volume = Number(sizingData[0].tank_volume);
// let product_type = sizingData[0].product_type;
// let FP = sizingData[0].flash_point;
// let VMOVEMENT = 0;
// let K1 = sizingData[0].elevation + sizingData[0].diameter;
// let N11 = prefCalculationMethod === "English" ? 30 : 9.14;
// let Kf = K1 < N11 ? K1 : N11;
// let E1 = Kf - sizingData[0].elevation;
// let Ef = E1 > 0 ? E1 : 0;
// let Es = Ef > (0.55 * sizingData[0].diameter) ? Ef : (0.55 * sizingData[0].diameter);
// let N45 = prefCalculationMethod === "English" ? 1.51 : 1;
// let N46 = prefCalculationMethod === "English" ? 3.08 : 1;
// let Vtherm = 0;
// let calculated_tankvolume = calculatedTankVolume(sizingData); //move while data is saving, and not in intermediate calc func
// if ((sizingData[0].flow_rate_radio.value === "5th Ed., Main" || sizingData[0].flow_rate_radio.value === "6th Ed., Main") && sizingData[0].flow_rate_radio.annex === true) {
//     //const Vtherm5and6 =(prefCalculationMethod,FP,vaccum_checkbox,pressure_checkbox)=>{                
//     let output = Vtherm5and6(prefCalculationMethod, FP, vaccum_checkbox, pressure_checkbox)
//     Vtherm = output.filter((el) => el.key === tank_volume ? el.key === tank_volume : "");
// }
// if (sizingData[0].flow_rate_radio.value === "7th Ed., Main") {
//     if (product_type === "Pressure Relief") {
//         let Yl = calculateYl(sizingData[0].tank_latitude)
//         Vtherm = N45 * Yl * Math.pow(tank_volume, 0.9) * Number(sizingData[0].rin);
//     }
//     if (product_type === "Vaccum Relief") {
//         let Cl = calculateCl(sizingData[0].tank_latitude, sizingData[0].vap_Sat_Pressure, sizingData[0].avg_Storage_Temp)
//         Vtherm = N46 * Cl * Math.pow(tank_volume, 0.7) * Number(sizingData[0].rin);
//     }
// }
// if (product_type === "Pressure Relief" && FP != null) {
//     if (FP >= "100F" || FP >= "37.8C") {
//         VMOVEMENT = prefCalculationMethod === "English" ? 6.0 * sizingData[0].pump_in_rate : 1.01 * sizingData[0].pump_in_rate
//     }
//     if (FP < "100F" || FP < "37.8C") {
//         VMOVEMENT = prefCalculationMethod === "English" ? 12.0 * sizingData[0].pump_in_rate : 2.02 * sizingData[0].pump_in_rate
//     }
// }
// else if (product_type === "Vacuum Relief") {
//     VMOVEMENT = prefCalculationMethod === "English" ? 5.6 * sizingData[0].pump_in_rate : 0.94 * sizingData[0].pump_in_rate
// }

// const Vtherm5and6 = (prefCalculationMethod, FP, vaccum_checkbox, pressure_checkbox) => {
//     let Vtherm = [];
//     if (prefCalculationMethod === "English") {
//         if (vaccum_checkbox === true) {
//             Vtherm = [
//                 { key: "0", value: 0 },
//                 { key: "60", value: 60 },
//                 { key: "100", value: 100 },
//                 { key: "500", value: 500 },
//                 { key: "1000", value: 1000 },
//                 { key: "2000", value: 2000 },
//                 { key: "3000", value: 3000 },
//                 { key: "4000", value: 4000 },
//                 { key: "5000", value: 5000 },
//                 { key: "10000", value: 10000 },
//                 { key: "15000", value: 15000 },
//                 { key: "20000", value: 20000 },
//                 { key: "25000", value: 24000 },
//                 { key: "30000", value: 28000 },
//                 { key: "35000", value: 31000 },
//                 { key: "40000", value: 34000 },
//                 { key: "45000", value: 37000 },
//                 { key: "50000", value: 40000 },
//                 { key: "60000", value: 44000 },
//                 { key: "70000", value: 48000 },
//                 { key: "80000", value: 52000 },
//                 { key: "90000", value: 56000 },
//                 { key: "100000", value: 60000 },
//                 { key: "120000", value: 68000 },
//                 { key: "140000", value: 75000 },
//                 { key: "160000", value: 82000 },
//                 { key: "180000", value: 90000 }
//             ]
//         }
//         if (pressure_checkbox === true && FP >= "100F") {
//             Vtherm = [
//                 { key: "0", value: 0 },
//                 { key: "60", value: 40 },
//                 { key: "100", value: 60 },
//                 { key: "500", value: 300 },
//                 { key: "1000", value: 600 },
//                 { key: "2000", value: 12000 },
//                 { key: "3000", value: 18000 },
//                 { key: "4000", value: 24000 },
//                 { key: "5000", value: 3000 },
//                 { key: "10000", value: 6000 },
//                 { key: "15000", value: 9000 },
//                 { key: "20000", value: 12000 },
//                 { key: "25000", value: 15000 },
//                 { key: "30000", value: 17000 },
//                 { key: "35000", value: 19000 },
//                 { key: "40000", value: 21000 },
//                 { key: "45000", value: 23000 },
//                 { key: "50000", value: 24000 },
//                 { key: "60000", value: 27000 },
//                 { key: "70000", value: 29000 },
//                 { key: "80000", value: 31000 },
//                 { key: "90000", value: 34000 },
//                 { key: "100000", value: 36000 },
//                 { key: "120000", value: 41000 },
//                 { key: "140000", value: 45000 },
//                 { key: "160000", value: 50000 },
//                 { key: "180000", value: 54000 }
//             ]
//         }
//         if (pressure_checkbox === true && FP < "100F") {
//             Vtherm = [
//                 { key: "0", value: 0 },
//                 { key: "60", value: 60 },
//                 { key: "100", value: 100 },
//                 { key: "500", value: 500 },
//                 { key: "1000", value: 1000 },
//                 { key: "2000", value: 2000 },
//                 { key: "3000", value: 8000 },
//                 { key: "4000", value: 4000 },
//                 { key: "5000", value: 5000 },
//                 { key: "10000", value: 10000 },
//                 { key: "15000", value: 15000 },
//                 { key: "20000", value: 20000 },
//                 { key: "25000", value: 24000 },
//                 { key: "30000", value: 28000 },
//                 { key: "35000", value: 31000 },
//                 { key: "40000", value: 34000 },
//                 { key: "45000", value: 37000 },
//                 { key: "50000", value: 40000 },
//                 { key: "60000", value: 44000 },
//                 { key: "70000", value: 48000 },
//                 { key: "80000", value: 52000 },
//                 { key: "90000", value: 56000 },
//                 { key: "100000", value: 60000 },
//                 { key: "120000", value: 68000 },
//                 { key: "140000", value: 75000 },
//                 { key: "160000", value: 82000 },
//                 { key: "180000", value: 90000 }
//             ]
//         }
//     }
//     if (prefCalculationMethod === "Metric") {
//         if (vaccum_checkbox === true) {
//             Vtherm = [
//                 { key: "0", value: 0 },
//                 { key: "10", value: 1.69 },
//                 { key: "20", value: 3.37 },
//                 { key: "100", value: 16.90 },
//                 { key: "200", value: 33.70 },
//                 { key: "300", value: 50.60 },
//                 { key: "500", value: 84.30 },
//                 { key: "700", value: 118 },
//                 { key: "1000", value: 169 },
//                 { key: "1500", value: 253 },
//                 { key: "2000", value: 337 },
//                 { key: "3000", value: 506 },
//                 { key: "3180", value: 536 },
//                 { key: "4000", value: 647 },
//                 { key: "5000", value: 787 },
//                 { key: "6000", value: 896 },
//                 { key: "7000", value: 1003 },
//                 { key: "8000", value: 1077 },
//                 { key: "9000", value: 1136 },
//                 { key: "10000", value: 1210 },
//                 { key: "12000", value: 1345 },
//                 { key: "14000", value: 1480 },
//                 { key: "16000", value: 1615 },
//                 { key: "18000", value: 1745 },
//                 { key: "20000", value: 1877 },
//                 { key: "25000", value: 2179 },
//                 { key: "30000", value: 2495 }
//             ]
//         }
//         if (pressure_checkbox === true && FP >= "37.8C") {
//             Vtherm = [
//                 { key: "0", value: 0 },
//                 { key: "10", value: 1.01 },
//                 { key: "20", value: 2.02 },
//                 { key: "100", value: 10.10 },
//                 { key: "200", value: 20.20 },
//                 { key: "300", value: 30.30 },
//                 { key: "500", value: 50.60 },
//                 { key: "700", value: 70.80 },
//                 { key: "1000", value: 101 },
//                 { key: "1500", value: 152 },
//                 { key: "2000", value: 202 },
//                 { key: "3000", value: 303 },
//                 { key: "3180", value: 388 },
//                 { key: "4000", value: 472 },
//                 { key: "5000", value: 537 },
//                 { key: "6000", value: 602 },
//                 { key: "7000", value: 646 },
//                 { key: "8000", value: 682 },
//                 { key: "9000", value: 726 },
//                 { key: "10000", value: 807 },
//                 { key: "12000", value: 888 },
//                 { key: "14000", value: 969 },
//                 { key: "16000", value: 1047 },
//                 { key: "18000", value: 1126 },
//                 { key: "20000", value: 1307 },
//                 { key: "25000", value: 1378 },
//                 { key: "30000", value: 1487 }
//             ]
//         }
//         if (pressure_checkbox === true && FP < "37.8C") {
//             Vtherm = [
//                 { key: "0", value: 0 },
//                 { key: "10", value: 1.69 },
//                 { key: "20", value: 3.37 },
//                 { key: "100", value: 16.90 },
//                 { key: "200", value: 33.70 },
//                 { key: "300", value: 50.60 },
//                 { key: "500", value: 84.30 },
//                 { key: "700", value: 118 },
//                 { key: "1000", value: 169 },
//                 { key: "1500", value: 253 },
//                 { key: "2000", value: 337 },
//                 { key: "3000", value: 506 },
//                 { key: "3180", value: 536 },
//                 { key: "4000", value: 647 },
//                 { key: "5000", value: 787 },
//                 { key: "6000", value: 896 },
//                 { key: "7000", value: 1003 },
//                 { key: "8000", value: 1077 },
//                 { key: "9000", value: 1136 },
//                 { key: "10000", value: 1210 },
//                 { key: "12000", value: 1345 },
//                 { key: "14000", value: 1480 },
//                 { key: "16000", value: 1615 },
//                 { key: "18000", value: 1745 },
//                 { key: "20000", value: 1877 },
//                 { key: "25000", value: 2179 },
//                 { key: "30000", value: 2495 }
//             ]
//         }
//     }
// }

// const calculateYl = (tank_latitude) => {
//     let YL = 0;
//     if (tank_latitude === "Below 42°") {
//         return YL = 0.32;
//     }
//     if (tank_latitude === "Between 42° and 58°") {
//         return YL = 0.25;
//     }
//     if (tank_latitude === "Above 58°") {
//         return YL = 0.2;
//     }
// }
// const calculateCl = (tank_latitude, vap_Sat_Pressure, avg_Storage_Temp) => {
//     let CL = 0;
//     if (((tank_latitude === "Below 42°") || (tank_latitude === "Above 58°")) && ((vap_Sat_Pressure === "Hexane or Similar") || (vap_Sat_Pressure === "Higher than Hexane or Unknown")) && ((avg_Storage_Temp === "Less Than 77°F (25°C)") || (avg_Storage_Temp === "Greater Than or Equal to 77°F (25°C)"))) {
//         return CL = 4;
//     }
//     if ((tank_latitude === "Below 42°") && ((vap_Sat_Pressure === "Hexane or Similar") || (vap_Sat_Pressure === "Higher than Hexane or Unknown")) && ((avg_Storage_Temp === "Less Than 77°F (25°C)") || (avg_Storage_Temp === "Greater Than or Equal to 77°F (25°C)"))) {
//         return CL = 6.5;
//     }
//     if ((tank_latitude === "Between 42° and 58°") && ((vap_Sat_Pressure === "Hexane or Similar") || (vap_Sat_Pressure === "Higher than Hexane or Unknown")) && ((avg_Storage_Temp === "Less Than 77°F (25°C)") || (avg_Storage_Temp === "Greater Than or Equal to 77°F (25°C)"))) {
//         return CL = 5;
//     }
//     if ((tank_latitude === "Between 42° and 58°") && (vap_Sat_Pressure === "Hexane or Similar") && (avg_Storage_Temp === "Less Than 77°F (25°C)")) {
//         return CL = 3;
//     }
//     if ((tank_latitude === "Above 58°") && (vap_Sat_Pressure === "Hexane or Similar") && (avg_Storage_Temp === "Less Than 77°F (25°C)")) {
//         return CL = 2.5;
//     }
// }