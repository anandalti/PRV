const { count } = require("mathjs");
const { Models_MOD_IFR, JseriesRestrictedErrors, EM_Connection_Size, EM_SERVICE_Kdr } = require("../../utils/helper");
const MORF_DataTable= require('./MORF_Data.json');

const calculateRestrictedLiftCapacity = (params) => {
    const { LiftRestriction, RatedFlowCapacity } = params;
    return LiftRestriction * RatedFlowCapacity;
}

const calculateLiftRestrictions =(params)=>{
    let restrictions=[];
    let errors=[];
    const {ModelNumber,Orifice,RequiredCapacity,RatedFlowCapacity,DoNotExceedCapacity,IFR} = params;
    const localIFR=IFR==3?1:IFR;
    const MOD=Models_MOD_IFR[ModelNumber]?.MOD
    const ConfigurationID = [MOD, Orifice, localIFR].join('');
    const MORFData=MORF_DataTable[ConfigurationID];
    const RESTMax= DoNotExceedCapacity!=='' ? parseFloat(DoNotExceedCapacity)/parseFloat(RatedFlowCapacity) : 1;
    // console.log('1111111111111111 >>>>>>>>>>>>>>> ',{ModelNumber,Orifice,RequiredCapacity,RatedFlowCapacity,DoNotExceedCapacity,IFR,MORFData,ConfigurationID})
    let maxLimit=1;
    let minLimit=MORFData?.minLR;
    const step=MORFData?.RestrictionSteps;
    if(RESTMax< maxLimit){
        maxLimit=Math.floor(RESTMax * 10) / 10;
    }
    if((maxLimit+step)<RESTMax && (maxLimit+step)<=1){
        maxLimit=Math.floor((maxLimit+step) * 100) / 100;
    }
    if(maxLimit>0.9){
        maxLimit=0.9;
    }
    let RESTMin=RequiredCapacity/RatedFlowCapacity;
    // console.log('minLimit 0000000 >>>>>>>>> ',RESTMin,minLimit,maxLimit,step)
    if(RESTMin>minLimit ){
        minLimit=RESTMin>1?1:Math.ceil(RESTMin * 10) / 10;
       
        if(minLimit> maxLimit && minLimit===1 && parseFloat(DoNotExceedCapacity)>parseFloat(RequiredCapacity)){
            maxLimit=minLimit;
        }
        // console.log('minLimit 1111111 >>>>>>>>> ',RESTMin,minLimit,maxLimit)
    }

    if((minLimit-step)>RESTMin && (minLimit-step)>=MORFData?.minLR && (minLimit-step)<=0.9){
        minLimit=Math.floor((minLimit-step) * 100) / 100;
        // console.log('minLimit 222222 >>>>>>>>> ',minLimit)
    }
    let LiftRestriction=minLimit?.toString();
    // console.log(DoNotExceedCapacity,RatedFlowCapacity,DoNotExceedCapacity/RatedFlowCapacity,maxLimit,minLimit,step,RESTMin)
    if(parseFloat(DoNotExceedCapacity)/parseFloat(RatedFlowCapacity)>=1 && parseFloat(RatedFlowCapacity)>parseFloat(RequiredCapacity)){
        for (let value = maxLimit; value >= minLimit; value -= step) {
            // Fix floating point issues
            value = Math.round(value * 100) / 100;
            // if(value==0.95){
                
            // }else{
                restrictions.push({ label: value.toString(), value: value.toString() });
                LiftRestriction=value?.toString();
            // }
            // console.log({value,minLimit,LiftRestriction})
        
        }
    }
    // console.log('222222222222 >>>>>>>>>>>>>>> ',{LiftRestriction,DoNotExceedCapacity,RequiredCapacity,isDNCEgtRC:parseFloat(DoNotExceedCapacity)<parseFloat(RequiredCapacity)})
    if(RequiredCapacity==0 || RequiredCapacity=='' || RequiredCapacity==undefined){
        errors.push(JseriesRestrictedErrors['err1']);
    }
    if(parseFloat(DoNotExceedCapacity)<parseFloat(RequiredCapacity)){
        errors.push(JseriesRestrictedErrors['err2']);
    }
    if(MORFData?.minLR===1 && MORFData?.maxLR===1){
        errors.push(JseriesRestrictedErrors['err3']);
    }

    if(minLimit===1 && maxLimit===1 && (parseFloat(DoNotExceedCapacity)>=parseFloat(RatedFlowCapacity) || DoNotExceedCapacity==='') 
        && (parseFloat(RequiredCapacity)<=parseFloat(RatedFlowCapacity))
    ){
        errors.push(JseriesRestrictedErrors['err4']);
    }

    if(minLimit>maxLimit || RESTMin>1){
        errors.push(JseriesRestrictedErrors['err5']);
    }
    
    // console.log('33333333333 >>>>>>>>>>>>>>> ',{LiftRestriction,minLimit,maxLimit,restrictions})
    const RestrictedLiftCapacity = restrictions?.length>0?calculateRestrictedLiftCapacity({LiftRestriction, RatedFlowCapacity}):'';
    // console.log('44444444444 >>>>>>>>>>>>>>> ',{LiftRestriction,RestrictedLiftCapacity,LROptions:restrictions,RestrictedLiftErrors:errors});
    return {LiftRestriction,RestrictedLiftCapacity,LROptions:restrictions,RestrictedLiftErrors:errors};
}

const calculateEMRestrictedLiftCapacity = (params) => {
    const Service=params?.Service==='L'?'LIQ':params?.Service==='S'?'STM':params?.Service==='G'?'GAS':params?.Service;
    const Kdr=EM_SERVICE_Kdr[Service];
    let REST;
    const selectedRestriction=params?.LiftRestriction;
    if(Service=='LIQ'){
        REST=-0.2515*Math.pow(selectedRestriction, 2) + 0.704*selectedRestriction;
    }else{
        REST=-0.2967*Math.pow(selectedRestriction, 2) + 1.0075*selectedRestriction;
    }

    const Vrest=params?.RatedFlowCapacity *REST/Kdr;
   
    // console.log(Service, params?.RatedFlowCapacity, REST,Kdr,Vrest)
    return Vrest
}

const calculateEMLiftRestrictions = (params) => {
    let restrictions=[];
    let errors=[];
    const {Orifice,RequiredCapacity,RatedFlowCapacity,Service} = params;
    if(RequiredCapacity==0 || RequiredCapacity=='' || RequiredCapacity==undefined){
        errors.push(JseriesRestrictedErrors['err1']);
    }
    const LocalService=params?.Service==='L'?'LIQ':params?.Service==='S'?'STM':params?.Service==='G'?'GAS':params?.Service;
    const Kdr=EM_SERVICE_Kdr[LocalService];
    // console.log({Orifice,RequiredCapacity,RatedFlowCapacity,Service})
    let RESTmin=RequiredCapacity/RatedFlowCapacity * Kdr;
    // RESTmin=Math.round(RESTmin * 10) / 10;
    const Connection_map=EM_Connection_Size[Orifice];
    const maxLimit=RESTmin<=0.8?0.8:1;
    let minLimit=RESTmin<=0.8?RESTmin<Connection_map?.min?Connection_map?.min:RESTmin:1;
    let Vrest;
    // let restrictionRest={};
    let newMinLimit=minLimit;
    console.log({LocalService,RESTmin,maxLimit,minLimit})
    if(minLimit!==1){
        for(let step=maxLimit;step>=minLimit;step-=0.1){
            // Fix floating point issues
            let localRest;
            if(LocalService=='LIQ'){
                localRest=-0.2515*Math.pow(step, 2) + 0.704*step;
            }else{
                localRest=-0.2967*Math.pow(step, 2) + 1.0075*step;
            }
            // console.log({LocalService,step,minLimit,newMinLimit,localRest, RESTmin,check:localRest> RESTmin,restrictions})
            if(
                // LocalService!=='LIQ' && 
                localRest>= RESTmin 
                //&& localRest>= minLimit
            ){
                step = Math.round(step * 100) / 100;
                restrictions.push({label: step.toString(), value: step.toString()});
                newMinLimit=step;
            // }else if(LocalService=='LIQ' && localRest>= RESTmin  && localRest>= minLimit){
            //     step = Math.round(step * 100) / 100;
            //     restrictions.push({label: step.toString(), value: step.toString()});
            //     newMinLimit=step;
            // }else if(LocalService!=='LIQ'){
            //     newMinLimit=step+0.1;
            // }else if(LocalService=='LIQ'){
            //     step = Math.round(step * 100) / 100;
            //     restrictions.push({label: step.toString(), value: step.toString()});
            //     minLimit=step;
            }
            
        }

        const localParams={
            RatedFlowCapacity,
            Service,
            LiftRestriction:newMinLimit
        }
        Vrest=calculateEMRestrictedLiftCapacity(localParams);
    }else{
        restrictions.push({label: '1', value: '1'});
        errors.push(JseriesRestrictedErrors['err6']);
        Vrest=RatedFlowCapacity;
    }
    restrictions=[...new Set([...restrictions])];
    
    console.log(restrictions,Vrest)
    return {LiftRestriction:newMinLimit.toString(),RestrictedLiftCapacity:Vrest,Options:restrictions,RestrictedLiftErrors:errors};
}

module.exports={
    calculateLiftRestrictions,
    calculateRestrictedLiftCapacity,
    calculateEMRestrictedLiftCapacity,
    calculateEMLiftRestrictions
}