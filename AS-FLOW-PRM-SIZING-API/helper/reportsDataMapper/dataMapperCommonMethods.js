const getReportsVal = (val, sizingData) => {
    let valArr = val.split(".");

    if (val === "") return "TBD"

    if (valArr.length === 1) {
        return sizingData[val] !== null && sizingData[val] !== undefined ? sizingData[val] : null;
    }
    if (valArr.length === 2) {
        return sizingData[valArr[0]] && sizingData[valArr[0]][valArr[1]] ? sizingData[valArr[0]][valArr[1]] : null;
    }
    if (valArr.length === 3) {
        return sizingData[valArr[0]] && sizingData[valArr[0]][valArr[1]] && sizingData[valArr[0]][valArr[1]][valArr[2]] ? sizingData[valArr[0]][valArr[1]][valArr[2]] : null;
    }
}

const getRoundedReportsVal = (val, sizingData) => {
    let reportsVal = getReportsVal(val, sizingData);
    return reportsVal !== "" && reportsVal !== null && reportsVal !== undefined && isNaN(Number(reportsVal)) === false ? Number(reportsVal).toFixed(7) : reportsVal;
}

const convertUOM = (val, fromUnit, toUnit, uomResults) => {
    let fromUnitData = null;
    let toUnitData = null;
    let convertedData = {
        value: null,
        unitName: null
    };
    for (let i = 0; i < uomResults.length; i++) {
        if (fromUnitData !== null && toUnitData !== null) {
            break;
        }
        const el = uomResults[i];
        if (el.unit_key === fromUnit) {
            fromUnitData = el;
        }
        if (el.unit_key === toUnit) {
            toUnitData = el;
        }
    }

    if (fromUnitData !== null && toUnitData !== null) {
        convertedData.value = ((Number(val) + Number(fromUnitData.unit_offset)) / Number(fromUnitData.unit_factor) * Number(toUnitData.unit_factor)) - Number(toUnitData.unit_offset);
        convertedData.unitName = toUnitData.unit_name;
    }

    return convertedData;
}

const getUnitNameOfUOM = (uom, uomResults) => {
    for (let i = 0; i < uomResults.length; i++) {
        const el = uomResults[i];
        if (el.unit_key === uom) return el.unit_name;
    }

    return uom;
}

const getTOUnit = (fromUnit, sizingData, uomResults) => {
    const conversionData = {
        "abspressure": {
            "Metric": "abspressure.bara",
            "English": "abspressure.psia"
        },
        "area": {
            "Metric": "area.cm2",
            "English": "area.in2"
        },
        "density": {
            "Metric": "density.kgm3",
            "English": "density.lbft3"
        },
        "force": {
            "Metric": "force.N",
            "English": "force.lbf"
        },
        "gasvolflow": {
            "Metric": "gasvolflow.Nm3hr",
            "English": "gasvolflow.SCFM"
        },
        "massflow": {
            "Metric": "massflow.kghr",
            "English": "massflow.lbhr"
        },
        "latentheat": {
            "Metric": "latentheat.KJkg",
            "English": "latentheat.BTUlb"
        },
        "length": {
            "Metric": "length.m",
            "English": "length.ft"
        },
        "liquidvolflow": {
            "Metric": "liquidvolflow.m3hr",
            "English": "liquidvolflow.GPMUS"
        },
        "mass": {
            "Metric": "mass.kg",
            "English": "mass.lbm"
        },
        "massflow": {
            "Metric": "massflow.kghr",
            "English": "massflow.lbhr"
        },
        "massflux": {
            "Metric": "massflux.kghrcm2",
            "English": "massflux.lbsft2"
        },
        "power": {
            "Metric": "power.Watt",
            "English": "power.BTUhr"
        },
        "pressure": {
            "Metric": "pressure.barg",
            "English": "pressure.psig"
        },
        "specificheat": {
            "Metric": "specificheat.KJkgK",
            "English": "specificheat.BTUlbR"
        },
        "specificvolume": {
            "Metric": "specificvolume.m3kg",
            "English": "specificvolume.ft3lb"
        },
        "temp": {
            "Metric": "temp.degK",
            "English": "temp.degR"
        },
        "viscosity": {
            "Metric": "viscosity.cp",
            "English": "viscosity.cp"
        },
        "volume": {
            "Metric": "volume.m3",
            "English": "volume.ft3"
        },
        "outletDiameter": {
            "Metric": "length.cm",
            "English": "length.in"
        },
        "noise": {
            "Metric": "noise.db",
            "English": "noise.db"
        }

    }

    if (!fromUnit || !conversionData[fromUnit.split(".")[0]]) return null;

    const dimensionname = fromUnit.split(".")[0];
    const calcMethod = sizingData.calc_method;

    if(sizingData.code === "ISO 4126-7 (2nd Edition)" && dimensionname === "area"){
        return "area.mm2"
    }

    if (sizingData.code === "Non-Code (API 2000, 7th Edition)" && (dimensionname === "massflow" || dimensionname === "gasvolflow" || dimensionname === "liquidvolflow")) {
        const massOrVolumetric = !sizingData.req_pressure_flow_uom ? null : sizingData.req_pressure_flow_uom.includes("massflow") ? "Mass" : "Volumetric";
        const setPressureInPsig = convertUOM(sizingData.set_pressure, sizingData.pressure_uom, "pressure.psig", uomResults);

        if (sizingData.calc_method === "English") {
            if (massOrVolumetric === "Mass") {
                return "massflow.lbhr"
            } else {
                if (setPressureInPsig.value < 15) {
                    return "gasvolflow.SCFH"
                } else {
                    return "gasvolflow.SCFM"
                }
            }
        } else {
            if(sizingData.key === "wForNoise") return "massflow.kghr";
            if (massOrVolumetric === "Mass") {
                return "massflow.kghr"
            } else {
                return "gasvolflow.Nm3hr"
            }
        }
    }

    if (sizingData.code === "ASME Section VIII/XIII - UV (API 520, Part I, 10th Edition)" && !sizingData.is_section_VIII && calcMethod === "English" && dimensionname === "gasvolflow" || dimensionname === "liquidvolflow") {
        return "gasvolflow.SCFH"
    }

    return conversionData[dimensionname][calcMethod];
}

const checkPreecedingZero = (val) => {
    let preecedingZeroesCount = 0;
    const stringValArr = val.toString().split('.')[1] ? val.toString().split('.')[1].split('') : [];
    for (let i = 0; i < stringValArr.length; i++) {
        if (stringValArr[i] != 0) break;
        preecedingZeroesCount += 1
    }

    if (preecedingZeroesCount >= 3 && val > 0 && val < 1 && val.toString().split('.')[0] == 0) {

        return val.toFixed(preecedingZeroesCount + 1 > 8 ? 8 : preecedingZeroesCount + 1)
    } else {
        return val.toFixed(3)
    }
}

const genResPayload = (inputVal, inputUOM, sizingData, uomResults, name) => {
    let equationValue = null;
    let eqUOM = getTOUnit(inputUOM, sizingData, uomResults);
    inputUOM = inputUOM ? inputUOM.split(".")[0] !== "outletDiameter" ? inputUOM : inputUOM.split(".")[1] + "." + inputUOM.split(".")[2] : inputUOM
    let inputUOMDisplay = null;
    if (inputUOM) {
        // if (inputUOM && inputVal !== "" && inputVal !== null) {
        inputUOMDisplay = getUnitNameOfUOM(inputUOM, uomResults);
    } else {
        inputUOMDisplay = null;
        eqUOM = null;
    }

    if (inputVal !== "" && inputVal !== null && inputVal !== undefined && isNaN(Number(inputVal)) === false && inputUOM && eqUOM) {
        const convertedData = convertUOM(inputVal, inputUOM, eqUOM, uomResults);
        equationValue = Number(convertedData.value).toFixed(7);
        eqUOM = convertedData.unitName;
    }
    else {
        inputUOMDisplay = null;
        eqUOM = null;
        equationValue = inputVal;
    }
    if (inputUOM === "noise.db") {
        inputUOMDisplay = "db";
        eqUOM = "db";
        equationValue = inputVal;
    }
    let inputValUom = '';
    
    if (inputUOMDisplay && !isNaN(inputVal)) {
        const val = (inputVal !== "" && inputVal !== null && inputVal !== undefined && isNaN(Number(inputVal)) === false && inputVal.toString().split(".").length > 1) ? checkPreecedingZero(Number(inputVal)) : inputVal;
        inputValUom = `${val} ${inputUOMDisplay}`;
    }

    return {
        "Value_Seven_Decimal": inputVal,
        "Value": (inputVal !== "" && inputVal !== null && inputVal !== undefined && isNaN(Number(inputVal)) === false && inputVal.toString().split(".").length > 1) ? checkPreecedingZero(Number(inputVal)) : inputVal,
        "UOM": inputUOMDisplay,
        "Value_Eq_Seven_Decimal": equationValue,
        "Value_Eq": (equationValue !== "" && equationValue !== null && equationValue !== undefined && isNaN(Number(equationValue)) === false && equationValue.toString().split(".").length > 1) ? checkPreecedingZero(Number(equationValue)) : equationValue,
        "UOM_Eq": eqUOM,
        "Value_UOM": inputValUom
    }
}
const getFLowKey = (designCode, kaDataset) => {
    if (designCode === "ASME VIII/XIII- UV" && kaDataset === "ASME") {
        return "Rated"
    } else if (designCode === "ASME I - V" && kaDataset === "ASME") {
        return "Rated"
    } else if (designCode === "Non-Code" && kaDataset === "ASME") {
        return "Actual"
    } else if (designCode === "ASME VIII/XIII- UV" && kaDataset === "API") {
        return "Maximum"
    } else if (designCode === "Non-Code" && kaDataset === "API") {
        return "Maximum"
    } else {
        return "Actual"
    }
}

module.exports = { getReportsVal, getRoundedReportsVal, genResPayload, convertUOM, getFLowKey, getUnitNameOfUOM }