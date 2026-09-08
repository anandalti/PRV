import axios from "../../utils/interceptor";


export const makeApiCall=async(url, method, data = null, options = {})=> {
    try {
      // Construct the request configuration
      let apiUrl=url;
      // console.log('configurationData >>>>>>>>>>>>>>> In makeApiCall 11111>>>>>> ',url, method, data)
      if(method.toLowerCase() === 'get'){
        if(Object.keys(data).length>0){
          let params = new URLSearchParams(data).toString();
          
          apiUrl = `${url}?${params}`;
          // console.log('configurationData >>>>>>>>>>>>>>> In makeApiCall 222222>>>>>> ',apiUrl,params)
        }
      }
      const config = {
        method: method,
        url: apiUrl,
        ...options, // Spread any additional options (headers, params, etc.)
      };
  
      // If there's data to be sent (for POST, PUT, PATCH), add it to the config
      if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        config.data = data;
      }
  
      // Make the API call using Axios
      const response = await axios(config);
      // console.log('In makeApiCall:: response >>>>>> ',response)
      // Return the response data
      return response;
    } catch (error) {
      console.error("Error making API call:", error);
      // Handle or throw the error as needed
      throw error;
    }
  }