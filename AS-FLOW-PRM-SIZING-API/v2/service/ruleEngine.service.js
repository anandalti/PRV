

var request = require('./request.service');
const  getSeedData = async (urlpath)=>{
    try {
        const  response= await request.get(urlpath)       
        return response.data;
    }
    catch(error){
        return error;
    }     
}
const  getSizing = async (urlpath,siznginputs)=>{
    try {
        const  response= await request.post(urlpath,siznginputs)       
        return response.data;
    }
    catch(error){
        return error;
    }     
}

const  convertUOM = async (urlpath,uomconvertdata)=>{
    try {
        const  response= await request.post(urlpath,uomconvertdata)       
        return response.data;
    }
    catch(error){
        return error;
    }     
}

const  getDefaultSizing = async (urlpath, model)=>{
    try {
        const  response= await request.post(urlpath, {model: model});   
        console.log({response})   
        return response.data;
    }
    catch(error){
        return error;
    }     
}

module.exports = {
    getSeedData,
    getSizing,
    convertUOM,
    getDefaultSizing
};