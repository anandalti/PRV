
var request = require('./requestOkta.service');

const saveGOSParameters = (db, gosData) => {
    console.log({ gosData })
    db("gos_users").insert(gosData).then(gos_data => {
        console.log({ gos_data })
    })
}

let isAuthorized = false;

// let isAuthorized = async function (req, res) {

//     let authorization = req.headers['authorization'];

//     try {
//         if (authorization) {
//             const token = Buffer.from(authorization, 'base64').toString('utf-8');
//             let splitToken = token ? token.split("<->") : "";
//             let sid = splitToken[0]
//             let activeOrgId = splitToken[1]
//             let obo = splitToken[2]
//             let guestUser = splitToken[3]
//             let email = splitToken[4]
//             let insTyp = splitToken[5]
//             let requisitionListId = splitToken[6]
//             let uniqueId = splitToken[7]
//             let lang = splitToken[8] != null && splitToken[8] != "null" ? splitToken[8] : "en"
//             let tools = splitToken[9]
//             let absoluteURL = splitToken[10]

//             if (activeOrgId != "null" && insTyp == "null") {
//                 if (splitToken.length >= 4 && guestUser == "Yes") {
//                     let mail = obo != 'null' && obo != null ? obo : email
//                     console.log("mail", mail)
//                     return res.send({
//                         "userDetails": { "userMailId": mail }, "roles": ["Guest"],
//                         "disableMultiValve": process.env.isProdEnv === "yes" ? true : false,
//                         "forTest": `val is ${process.env.isProdEnv}`,
//                         "requisitionListId": requisitionListId,
//                         "uniqueId": uniqueId,
//                         "tools": tools,
//                         "lang": lang,
//                         "absoluteURL": absoluteURL
//                     })
//                 }
//                 else if (splitToken.length >= 3 && activeOrgId != "null" && obo != "null") {
//                     let roleURL = process.env.ROLE_SERVICE_URL;
//                     roleURL = roleURL + `?activeOrgId=${activeOrgId}&obo=${obo}`;
//                     const response = await request.get(roleURL);
//                     if ('data' in response) {
//                         response.data['disableMultiValve'] = process.env.isProdEnv === "yes" ? true : false
//                         response.data['forTest'] = `val is ${process.env.isProdEnv}`
//                         response.data["requisitionListId"] = requisitionListId
//                         response.data["uniqueId"] = uniqueId
//                         response.data["lang"] = lang
//                         response.data["tools"] = tools
//                         // response.data["absoluteURL"]=
//                     }
//                     return res.send(response.data);
//                 }
//                 else {
//                     res.status(401);
//                     return res.json({
//                         ErrorCode: "E0000005",
//                         ErrorSummary: 'Auth token is expired/not valid'
//                     });
//                 }
//             }
//             if (insTyp == 'local') {
//                 let mail = email == "null" && obo == "null" ? 'prvalerts@emerson.com' :
//                     obo != 'null' ? obo : email
//                 return res.send({
//                     "userDetails": { "userMailId": mail }, "roles": ["EmersonLocal"],
//                     "disableMultiValve": process.env.isProdEnv === "yes" ? true : false, "forTest": `val is ${process.env.isProdEnv}`, "requisitionListId": requisitionListId,
//                     "uniqueId": uniqueId, "lang": lang, "tools": tools
//                 })
//             }
//             else if (activeOrgId == "null" && obo == "null"
//                 && guestUser == "null" && email == "null" && insTyp == "null") {
//                 return res.send({
//                     "userDetails": { "userMailId": 'localUser' }, "roles": ["Local"],
//                     "disableMultiValve": process.env.isProdEnv === "yes" ? true : false, "forTest": `val is ${process.env.isProdEnv}`, "requisitionListId": requisitionListId,
//                     "uniqueId": uniqueId, "lang": lang, "tools": tools
//                 })
//             }
//         }
//         else {
//             console.log("PRV Sizing - Auth token is expired/not valid");
//             res.status(401);
//             res.json({
//                 ErrorCode: "E0000005",
//                 ErrorSummary: "Auth token is expired/not valid"
//             });
//             // res.send("Auth token is expired/not valid");
//         }
//     } catch (error) {
//         console.log("PRV Sizing - Role Service Error Stack: " + error.stack);
//         console.log("PRV Sizing - Role Service Error Message: " + error.message);
//         res.send(error.message);
        
//     }
// }

// let isAuthorized  = async function(req,res) {

//     let authorization =  req.headers['authorization'];

//     try{
//     if(authorization){
//         const token= Buffer.from(authorization, 'base64').toString('utf-8'); 
//         let splitToken=token?token.split("<->"):"";
//         let sid = splitToken[0]
//         let activeOrgId = splitToken[1]
//         let obo = splitToken[2]
//         let guestUser = splitToken[3]
//         let email = splitToken[4]
//         let insTyp = splitToken[5]
//         let requisitionListId = splitToken[6]
//         let uniqueId = splitToken[7]
//         let lang = splitToken[8]!=null&&splitToken[8]!="null"?splitToken[8]:"en"
//         let tools = splitToken[9]
//         let absoluteURL = splitToken[10]

//         // temporary code for storing url parameters for invalid session id issue
//         // const knex = req.knex;
//         // const date = new Date();
//         // const gosData = {
//         //     obo: obo,
//         //     activeOrgId: activeOrgId,
//         //     sId: sid,
//         //     source: null,
//         //     userType: activeOrgId != "null" ? "gos" : "local",
//         //     createdOn: date
//         // }
//         // saveGOSParameters(knex, gosData);
//         // temporary change ends here

//         if(activeOrgId!="null" && insTyp=="null"){
//             if(splitToken.length>=4 && guestUser=="Yes"){
//                 let mail = obo !='null' && obo!=null?obo:email
//                 console.log("mail", mail)
//                 return res.send({"userDetails":{"userMailId": mail}, "roles": ["Guest"], 
//                                 "disableMultiValve": process.env.isProdEnv === "yes" ? true : false,
//                                 "forTest": `val is ${process.env.isProdEnv}`,
//                                 "requisitionListId": requisitionListId,
//                                 "uniqueId": uniqueId,
//                                 "tools": tools,
//                                 "lang": lang,
//                                 "absoluteURL": absoluteURL})
//             }
//             else if(splitToken.length>=3 && sid!="null" && activeOrgId!="null" && obo!="null")
//             {
//                 let roleURL=process.env.ROLE_SERVICE_URL;
//                 roleURL=roleURL+sid+"?activeOrgId="+activeOrgId+"&obo="+obo;
//                 const  response= await request.get(roleURL);
//                 if('data' in response){
//                     response.data['disableMultiValve'] = process.env.isProdEnv === "yes" ? true : false
//                     response.data['forTest'] = `val is ${process.env.isProdEnv}`
//                     response.data["requisitionListId"] = requisitionListId
//                     response.data["uniqueId"] = uniqueId
//                     response.data["lang"]=lang
//                     response.data["tools"]=tools
//                     // response.data["absoluteURL"]=
//                 }
//                 return res.send(response.data);
//             }
//             else{
//                 res.status(401);  
//                 return res.json({
//                         ErrorCode: "E0000005",
//                         ErrorSummary: 'Auth token is expired/not valid'
//                     });
//             }
//         }
//         if(insTyp=='local'){
//             let mail = email=="null"&&obo=="null"?'prvalerts@emerson.com':
//                        obo!='null'?obo:email
//             return res.send({"userDetails":{"userMailId": mail}, "roles": ["EmersonLocal"], 
//                             "disableMultiValve": process.env.isProdEnv === "yes" ? true : false,"forTest": `val is ${process.env.isProdEnv}`, "requisitionListId": requisitionListId,
//                             "uniqueId": uniqueId, "lang":lang, "tools": tools})
//         }
//         else if(sid=="null" && activeOrgId=="null" && obo=="null" 
//                 && guestUser=="null" && email=="null" && insTyp =="null"){
//             return res.send({"userDetails":{"userMailId": 'localUser'}, "roles": ["Local"], 
//                             "disableMultiValve": process.env.isProdEnv === "yes" ? true : false,"forTest": `val is ${process.env.isProdEnv}`, "requisitionListId": requisitionListId,
//                             "uniqueId": uniqueId, "lang":lang, "tools": tools})
//         }       
//     }
//     else{
//         console.log("PRV Sizing - Auth token is expired/not valid");
//         res.status(401);  
//         res.json({
//             ErrorCode: "E0000005",
//             ErrorSummary: "Auth token is expired/not valid"
//         });
//         res.send("Auth token is expired/not valid");
//     }
// }catch(error){
//     console.log("PRV Sizing - Role Service Error Stack: "+error.stack);
//     console.log("PRV Sizing - Role Service Error Message: "+error.message);
//     res.send(error.message);

// }
// }
module.exports = {
    isAuthorized: isAuthorized
}