const axiosOKta = require('axios');
require('dotenv').config();



const get= async(url,data) => {   
  const accesstoken=process.env.ROLE_SERVICE_ACCESS_TOKEN;
  const xapp=process.env.ROLE_SERVICE_X_APP;
   // return doRequest(url,'GET',data);
   axiosOKta.defaults.headers.common['X-App'] = xapp;
   axiosOKta.defaults.headers.common['access_token'] = accesstoken; 
   delete  axiosOKta.defaults.headers.common["Authorization"];
    try {  
           let header={
            'Accept':'application/json',
            'Content-Type':'application/json',
            'X-App':xapp,
            'access_token':accesstoken,    
            'secret_token': process.env.secret_token,
            'Ocp-Apim-Subscription-Key': process.env.Ocp_Apim_Subscription_Key        
           }        
          return await axiosOKta.get(url,{
           "rejectUnauthorized": false,
            headers:header
          })
      } catch (error) {
        console.error(error)
        return error;
      }
}

const post= async(url,data) => {   
    //return doRequest(url,'POST',data);
    try {
        return await axiosOKta({
            url: url,
            method: 'POST',
            data: data
          });
      } catch (error) {
        console.error(error)
        return error;
      }
}

module.exports = {
    post,
    get
};