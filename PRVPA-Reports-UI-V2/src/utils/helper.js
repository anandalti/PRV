export const saveAuthToken = () => {
    // check if auth token exists
    const params = window.parametersUrl ? new URLSearchParams(window.parametersUrl) : new URLSearchParams(window.location.search);
    const sid = params.get('sid');
    const guestUser = params.get('istoreGuestUser');
    const email = params.get('email');
    const activeOrgId = params.get('activeOrgId');
    const obo = params.get('obo');
    const insType = params.get('insType');
    const requisitionListId = params.get('requisitionListId');
    const lang = params.get('lng');
    const uniqueId = params.get('UniqueId');
    const tools = params.get('fromPage');
    const source = params.get('source');
    
    const absoulteURL = window.absoulteURL

    // logs for okta issue debugging
    // console.log("okta logs starts here----------")
    // console.log({activeOrgId})
    // console.log({obo})
    // console.log({sid})
    // console.log({email})
    // console.log({params})
    // console.log("okta logs console ends here-------")

    if(!activeOrgId && !obo && source){

        return {platform: 'sizingcore',source};
    }else{
        const authPartialOne = `${sid}<->${activeOrgId}<->${obo}<->${guestUser}<->${email}`;
        const authPartialTwo = `<->${insType}<->${requisitionListId}<->${uniqueId}<->${lang}<->${tools}<->${absoulteURL}`;
        const Authorization = btoa(`${authPartialOne}${authPartialTwo}`);
        sessionStorage.setItem('authToken', Authorization); 
        return {platform:'gos'}
    }
};
