const kb = require('./kb.json');
const kw = require('./kw.json');

const calculateKbKw = (valve, inputs, constants) => {
    if (inputs?.genericSizingDetails?.Kb) {
      return { Kb_Expression: inputs?.genericSizingDetails?.Kb };
    }
    const IsBu = inputs?.BuiltUp && Number(inputs.BuiltUp) > 0?'TRUE':'FALSE';
    const IsPsic = inputs?.ConstantSuperimposed && Number(inputs.ConstantSuperimposed) > 0?'TRUE':'FALSE';
    const IsPsiv = inputs?.VariableSuperimposed && Number(inputs.VariableSuperimposed) > 0?'TRUE':'FALSE';
    const { ShortName, ModelNumber, VPValveType, Orifice, SizeCode } = valve;
    const Code = inputs?.Code;
    let modelCompareExpr = false;
    const localOrifice=Orifice!==null && Orifice!==undefined ? Orifice?.replace(/"/g, '')?.trim() : Orifice;
    const kbExpression = kb.find(item => {
        if (item.ModelNumber.includes('NOT')) {
            modelCompareExpr = !item.ModelNumber.replace('NOT ', '').split(',').includes(ModelNumber)
        } else {
            modelCompareExpr = item.ModelNumber.split(',').includes(ModelNumber)
        }
        
        const exp = (
            item.IsBu === IsBu &&
            item.IsPsic === IsPsic &&
            item.IsPsiv === IsPsiv &&
            ['ANY', ShortName].includes(item.ShortName) &&
            ['ANY', VPValveType].includes(item.VPValveType) &&
            (item.ModelNumber === 'ANY' || modelCompareExpr) &&
            ['ANY', Code].includes(item.Code) &&
            (['ANY', 'Any'].includes(item.Orifices) || item.Orifices.split(',').includes(localOrifice))
        );
        return exp;
    });
    const kwExpression = kw.find(item => {
        const exp = (
            item.IsBu === IsBu &&
            item.IsPsic === IsPsic &&
            item.IsPsiv === IsPsiv &&
            ['ANY', ShortName].includes(item.ShortName) &&
            ['ANY', VPValveType].includes(item.VPValveType) &&
            (item.ModelNumber === 'ANY' || item.ModelNumber.replace('IN(', '').replace(')').split(',').includes(ModelNumber)) &&
            (['ANY', 'Any'].includes(item.Orifices) || item.Orifices.split(',').includes(localOrifice))
        );
        return exp;
    });
    const result = {};

    if (!kbExpression) {
        result.Kb_Expression = 1;
    } else {
        const { Kb_Expression, AbsPR_AbsPressureRatio, Id } = kbExpression;
        const N40 = constants['N40'];
        if (inputs.Code === 'ISO4126') {
            result.Equation2p5_Expression = `(${N40} / (C * 100)) * Math.sqrt((k / (k - 1)) * (Math.pow(AbsPR, 2 / k) - Math.pow(AbsPR, (k + 1) / k)))`;
        } else {
            result.Equation2p5_Expression = `(${N40} / C) * Math.sqrt((k / (k - 1)) * (Math.pow(AbsPR, 2 / k) - Math.pow(AbsPR, (k + 1) / k)))`;
        }
        result.Kb_Expression = Kb_Expression;
        result.AbsPR_AbsPressureRatio = AbsPR_AbsPressureRatio;
        result.KbId = Id;
    }

    if (!kwExpression) {
        result.Kw_Expression = 1;
    } else {
        const { Kw_Expression } = kwExpression;
        result.Kw_Expression = Kw_Expression;
    }

    return result;
}



module.exports = calculateKbKw;