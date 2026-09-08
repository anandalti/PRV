const cdtp = require('./cdtp.json');
const { convertUnit } = require('./helper');

const calculateCDTP = (valve, inputs, uoms) => {
    const { ShortName, VPValveType, ModelNumber } = valve;
    const TwoPhaseFlag=inputs?.service?.length>1;
    const isSetOnAir = inputs?.service.includes('S') && inputs?.IsSetOnAir;  
    const cdtpService= isSetOnAir ? 'SSOA' : TwoPhaseFlag ? '2-PHASE' : inputs?.service[0]; 
    const cdtpItem = cdtp.find(item => {
        const itemServices = item.Service.split(',');
        // console.log(item.ModelNumber === 'ANY', item.ModelNumber.split(',').includes(ModelNumber),itemServices.includes(cdtpService))
        if(ShortName===item.ShortName && VPValveType===item.VPValveType &&
            (item.ModelNumber === 'ANY' || item.ModelNumber.split(',').includes(ModelNumber)) &&
            itemServices.includes(cdtpService))
        {
            return item;
        }
        
    });
    let CDTP;
    //  console.log(cdtpItem)
     if(cdtpItem!==undefined){
        const isEnglishCalc = inputs.CalculationMethod === 'English';
        const requiredUnits = {
            "pressureUOM": ['F','G'].includes(cdtpItem?.Method)? "pressure.psig":isEnglishCalc ? "pressure.psig" : "pressure.barg",
            "temperatureUOM": ['H','I'].includes(cdtpItem?.Method)?"temp.degC" : "temp.degF",
        }

        const receivedUOM = {
            "pressureUOM": inputs?.PressureUOM,
            "temperatureUOM": inputs?.TemperatureUOM,
        }
        let Tcdtp=0;
        let Ktcf=1;
        const Pset=isNaN(Number(inputs.SetPressure)) ? 0 : convertUnit(Number(inputs.SetPressure), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));
        const Psic=isNaN(Number(inputs.ConstantSuperimposed)) ? 0 : convertUnit(Number(inputs.ConstantSuperimposed), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM));
        // let T=isNaN(Number(inputs.Relieving)) ? '' : convertUnit(Number(inputs.Relieving), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
        const Tn=isNaN(Number(inputs.Operating)) ? '' : convertUnit(Number(inputs.Operating), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
        const Tns=isNaN(Number(inputs.NormalSystem)) ? '' : convertUnit(Number(inputs.NormalSystem), uoms.find(u => u.UnitKey === receivedUOM.temperatureUOM), uoms.find(u => u.UnitKey === requiredUnits.temperatureUOM));
        if(Tns !=''){
            Tcdtp=Tns;
        }else if(Tns=== '' && Tn !=''){
            Tcdtp=Tn;
        }
        let CDTP_Exp;
        if(cdtpItem.Method=='A'){
            CDTP= Pset-Psic;
            CDTP_Exp= `CDTP = Pset - Psic`;
        }else if(cdtpItem.Method=='C'){
            if( Tns ==='' && Tn ===''){
                Ktcf=1;
            }else if(Tcdtp < 295){
                Ktcf=1;
            }else if(Tcdtp >=295 && Tcdtp <= 400){
                Ktcf=1.01;
            }else if(Tcdtp >400){
                Ktcf=1.03;
            }
            
            CDTP= Pset * Ktcf;
            CDTP_Exp= `CDTP = Pset * Ktcf where Ktcf=${Ktcf}`;
        }else if(cdtpItem.Method=='D' || cdtpItem.Method=='E'){
            if( Tns ==='' && Tn ===''){
                Ktcf=1;
            }else if(Tcdtp <=150){
                Ktcf=1;
            }else if(Tcdtp >150 && Tcdtp <= 600){
                Ktcf=1.01;
            }else if(Tcdtp >600 && Tcdtp <= 800){
                Ktcf=1.02;
            }else if(Tcdtp >800){
                Ktcf=1.03;
            }
            CDTP= cdtpItem.Method=='D' ? (Pset-Psic) * Ktcf : Pset * Ktcf;
            CDTP_Exp= cdtpItem.Method=='D' ? `CDTP = (Pset - Psic) * Ktcf where Ktcf=${Ktcf}` : `CDTP = Pset * Ktcf where Ktcf=${Ktcf}`;
        }else if(cdtpItem.Method=='F' || cdtpItem.Method=='G'){
            
            if((Pset-Psic) <=400){
                Ktcf=1.03;
            }else if((Pset-Psic) >400 && (Pset-Psic) <= 1000){
                Ktcf=1.04;
            }else if((Pset-Psic) >1000 && (Pset-Psic) <= 1500){
                Ktcf=1.05;
            }
            
            CDTP= cdtpItem.Method=='F' ? (Pset-Psic) * Ktcf : Pset * Ktcf;
            CDTP_Exp= cdtpItem.Method=='F' ? `CDTP = (Pset - Psic) * Ktcf where Ktcf=${Ktcf}` : `CDTP = Pset * Ktcf where Ktcf=${Ktcf}`;
        }else if(cdtpItem.Method=='H' || cdtpItem.Method=='I'){
            if( Tns ==='' && Tn ===''){
                Ktcf=1;
            }else if(Tcdtp <=121){
                Ktcf=1;
            }else if(Tcdtp >121 && Tcdtp <= 316){
                Ktcf=1.01;
            }else if(Tcdtp >316 && Tcdtp <= 427){
                Ktcf=1.02;
            }else if(Tcdtp >427){
                Ktcf=1.03;
            }
            
            CDTP= cdtpItem.Method=='H' ? (Pset-Psic) * Ktcf : Pset * Ktcf;
            CDTP_Exp= cdtpItem.Method=='H' ? `CDTP = (Pset - Psic) * Ktcf where Ktcf=${Ktcf}` : `CDTP = Pset * Ktcf where Ktcf=${Ktcf}`;
        }

        CDTP= convertUnit(Number(CDTP), uoms.find(u => u.UnitKey === requiredUnits.pressureUOM), uoms.find(u => u.UnitKey === receivedUOM.pressureUOM))
        // console.log({service:inputs?.service,inp_IsSetOnAir:inputs?.IsSetOnAir,isSetOnAir,cdtpService,CDTP,cdtpItem})
        return {CDTP, CDTP_Method:cdtpItem.Method,CDTP_Exp,Ktcf };
    }
    return CDTP;
}


module.exports = calculateCDTP;