export const ValidationForTemperature = (payloadData, currFieldValue, fieldName, units, validateFor) =>{
    let bReturn = false;
    const getField = (name) => fieldName === name ? parseFloat(currFieldValue) : parseFloat(payloadData[name]);

    let Tns = getField("NormalSystem");
    let T = getField("Relieving");
    let TdesignMax = getField("DesignMax");
    let Tn = getField("Operating");
    let SaturatedSteamT = getField("SaturatedSteam");
    let SizingBasis = getField("SizingBasis");
    let IsSaturatedSteam = getField("IsSaturatedSteam");
    if(validateFor==='RelievingTempltSaturatedSteamTemp'){
        if(T!=="" && SaturatedSteamT!==""){
            if(!["Preheater","Economizer"].includes(SizingBasis) && !IsSaturatedSteam && SaturatedSteamT>T){
                        //console.log("Error_RelievingTempltSaturatedSteamTemp");
                        bReturn = true;
                        return bReturn;
            }else{
                return false
            }
        }else{
            return false
        }
    }
    const compareTo = (a, b) => parseFloat(a) - parseFloat(b);
    let expressionReqFields=[
        {name:"NormalSystem", error:false, message:{"type":"error","message":"NTgtMDT"}},
        {name:"DesignMax", error:false, message:{"type":"error","message":"NTgtMDT"}},
        {name:"DesignMax", error:false, message:{"type":"error","message":"NTgtRT"}},
        {name:"DesignMax", error:false, message:{"type":"error","message":"NTgtOT"}},
        {name:"NormalSystem", error:false, message:{"type":"error","message":"NTgtOT"}},
        {name:"Operating", error:false, message:{"type":"error","message":"NTgtOT"}},
        {name:"NormalSystem", error:false, message:{"type":"error","message":"NTgtRT"}},
        {name:"Relieving", error:false, message:{"type":"error","message":"NTgtRT"}},
        {name:"NormalSystem", error:false, message:{"type":"error","message":"NTgtOTT"}}
    ]
    const removeError = () => {
        // expressionReqFields.push(
        //     {name:"NormalSystem", error:false, message:{"type":"error","message":"NTgtOTT"}}
        // )
        return {
            expressionReqFields:[{name:"NormalSystem", error:false, message:{"type":"error","message":"NTgtOTT"}}]
        }
    }

    const addError=(name, message)=>{
        expressionReqFields.forEach(item=>{
            if(item.name===name && item.message.message===message){
                item.error = true;
            }
        })
    }
    if(validateFor==='NormalSystemgtOtherTemp'){
        if(!isNaN(Tns)){
            //console.log("inside temperature validation ", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
            //console.log("inside temperature validation 0>>", !isNaN(Tn), !isNaN(TdesignMax), !isNaN(T), (Tns > Tn), (Tns > TdesignMax), (Tns > T))
            if((!isNaN(Tn) && !isNaN(TdesignMax) && !isNaN(T)) && (Tns > Tn) && (Tns > TdesignMax) && (Tns > T) ){
                if(T > Tn && T > TdesignMax){
                    //console.log("inside temperature validation 1>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                    addError("Relieving", "NTgtRT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}}
                    // )
                }else if(Tn > T && Tn > TdesignMax){
                    //console.log("inside temperature validation 2>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                    addError("Operating", "NTgtOT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}}
                    // )
                    
                }else if(TdesignMax > T && TdesignMax > Tn){
                    //console.log("inside temperature validation 3>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                    addError("DesignMax", "NTgtMDT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}}
                    // )
                }else if(T == Tn && T > TdesignMax){
                    //console.log("inside temperature validation 4>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                    addError("Relieving", "NTgtRT")
                    addError("Operating", "NTgtOT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}},
                    //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}},
                    //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                    // )
                }else if(T == TdesignMax && T > Tn){
                    //console.log("inside temperature validation 5>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                    addError("Relieving", "NTgtRT")
                    addError("DesignMax", "NTgtMDT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}},
                    //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}},
                    //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                    // )
                }else if(Tn == TdesignMax && Tn > T){
                    //console.log("inside temperature validation 6>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                    addError("Operating", "NTgtOT")
                    addError("DesignMax", "NTgtMDT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}},
                    //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}},
                    //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                    // )
                }else if(T === TdesignMax && T === Tn){
                    //console.log("inside temperature validation 7>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                    addError("Relieving", "NTgtRT")
                    addError("Operating", "NTgtOT")
                    addError("DesignMax", "NTgtMDT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}},
                    //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}},
                    //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}},
                    //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                    // )
                }
                return {
                    expressionReqFields
                }
            }else if((!isNaN(Tn) && !isNaN(TdesignMax)) && compareTo(Tns, Tn) > 0 && compareTo(Tns, TdesignMax) > 0){
                if(Tn > TdesignMax){
                    addError("Operating", "NTgtOT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}},
                    //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                    // )
                }else if(Tn < TdesignMax){
                    addError("DesignMax", "NTgtMDT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}},
                    //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                    // )
                }else if(Tn === TdesignMax){
                    addError("Operating", "NTgtOT")
                    addError("DesignMax", "NTgtMDT")
                    addError("NormalSystem", "NTgtOTT")
                    // expressionReqFields.push(
                    //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}},
                    //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}},
                    //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                    // )
                }
                return {
                    expressionReqFields
                }
            }else if((!isNaN(Tn) && !isNaN(T)) && compareTo(Tns, Tn) > 0 && compareTo(Tns, T) > 0){
                if(!isNaN(TdesignMax) && TdesignMax < Tns){
                    if(T > Tn){
                        //console.log("inside temperature validation 9>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                        addError("Relieving", "NTgtRT")
                        addError("NormalSystem", "NTgtOTT")
                        // expressionReqFields.push(
                        //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}},
                        //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                        // )
                    }else if(T < Tn){
                        addError("Operating", "NTgtOT")
                        addError("NormalSystem", "NTgtOTT")
                        // expressionReqFields.push(
                        //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}},
                        //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                        // )
                    }else if(T === Tn){
                        //console.log("inside temperature validation 10>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                        addError("Relieving", "NTgtRT")
                        addError("Operating", "NTgtOT")
                        addError("NormalSystem", "NTgtOTT")
                        // expressionReqFields.push(
                        //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}},
                        //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}},
                        //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                        // )
                    }
                }else{
                    //return removeError()
                }
                return {
                    expressionReqFields
                }
            }else if((!isNaN(TdesignMax) && !isNaN(T)) && compareTo(Tns, T) > 0 && compareTo(Tns, TdesignMax) > 0){
                    if(T > TdesignMax){
                        //console.log("inside temperature validation 11>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                        addError("Relieving", "NTgtRT")
                        addError("NormalSystem", "NTgtOTT")
                        // expressionReqFields.push(
                        //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}},
                        //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                        // )
                    }else if(T < TdesignMax){
                        addError("DesignMax", "NTgtMDT")
                        addError("NormalSystem", "NTgtOTT")
                        // expressionReqFields.push(
                        //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}},
                        //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                        // )
                    }else if(T === TdesignMax){
                        //console.log("inside temperature validation 12>", T, TdesignMax, Tn, Tns, compareTo(Tns, T))
                        addError("Relieving", "NTgtRT")
                        addError("DesignMax", "NTgtMDT")
                        addError("NormalSystem", "NTgtOTT")
                        // expressionReqFields.push(
                        //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}},
                        //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}},
                        //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOTT"}}
                        // )
                    }
                    return {
                        expressionReqFields
                    }
            }else if((!isNaN(T) && isNaN(TdesignMax) && isNaN(Tn) && compareTo(Tns, T) > 0)){
                //console.log("inside temperature validation T!=='' ", T, Tns)
                addError("Relieving", "NTgtRT")
                addError("NormalSystem", "NTgtRT")
                // expressionReqFields.push(
                //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtRT"}},
                //     {name:"Relieving", error:true, message:{"type":"error","message":"NTgtRT"}},
                //    )
                return {
                    expressionReqFields
                }
            }else if((!isNaN(Tn) && isNaN(TdesignMax) && isNaN(T)) && compareTo(Tns, Tn) > 0){
                
                addError("Operating", "NTgtOT")
                addError("NormalSystem", "NTgtOT")
                // expressionReqFields.push(
                //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtOT"}},
                //     {name:"Operating", error:true, message:{"type":"error","message":"NTgtOT"}}
                // )
                return {
                    expressionReqFields
                }
            }else if((!isNaN(TdesignMax) && isNaN(Tn) && isNaN(T)) && compareTo(Tns, TdesignMax) > 0){
                addError("DesignMax", "NTgtMDT")
                addError("NormalSystem", "NTgtMDT")
                // expressionReqFields.push(
                //     {name:"NormalSystem", error:true, message:{"type":"error","message":"NTgtMDT"}},
                //     {name:"DesignMax", error:true, message:{"type":"error","message":"NTgtMDT"}},
                //     )
                return {
                    expressionReqFields
                }
            }
            else{
                //console.log("inside temperature validation else '' ", T, Tns)
                return removeError()
            }
        }else{
            return removeError()
        }
    }
}