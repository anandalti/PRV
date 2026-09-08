const soap = require("soap");
const https = require("https");

const CLIENT_ID = "11677";

const soapClient = async () => {
  const isDev = process.env.NODE_ENV === "development";
  const httpsAgent = new https.Agent({ rejectUnauthorized: !isDev });

  try {
    const client = await soap.createClientAsync(process.env.WSDL_URL, {
      wsdl_options: { httpsAgent },
    });

    return client;
  } catch (error) {
    console.error("SOAP Client Error: ", error.message);
    throw new Error(error);
  }
};

const isCADAvailable = async (xml) => {
  const client = await soapClient();

  const args = {
    clientID: CLIENT_ID,
    xml,
  };

  try {
    const [result] = await client.IsCADAvailableAsync(args);

    return result?.IsCADAvailableResult || false;
  } catch (error) {
    console.error("Error in isCADAvailable:", error);
    return false;
  }
};

const getViewsList = async (xml) => {
  const client = await soapClient();

  const args = {
    clientID: CLIENT_ID,
    xml,
  };

  const [result] = await client.GetViewsListAsync(args);

  return result?.GetViewsListResult?.string || [];
};

const getFormatLists = async (viewDescription) => {
  const client = await soapClient();

  const args = {
    clientID: CLIENT_ID,
    viewDescription,
  };

  const [result] = await client.GetFormatListAsync(args);

  return result?.GetFormatListResult?.Format || [];
};

const getCADFileurl = async (xml, description, formatID) => {
  const isCad = await isCADAvailable(xml);

  if (!isCad) {
    return {
      status: false,
      error: "No CAD Available!",
    };
  }

  const client = await soapClient();

  const args = {
    clientID: CLIENT_ID,
    xml,
    viewDescription: description,
    formatID,
  };

  const [result] = await client.GetCADFileUrlAsync(args);

  if (!result?.GetCADFileUrlResult) {
    return {
      status: false,
      error: "Error retrieving CAD file URL",
    };
  }

  return {
    status: true,
    url: result?.GetCADFileUrlResult,
  };
};

const getCADUserInterfaceUrl = async (xml) => {
  const isCad = await isCADAvailable(xml);
  if (!isCad) {
    return {
      status: false,
      error: "No CAD Available!",
    };
  }

  const client = await soapClient();

  const args = {
    clientID: CLIENT_ID,
    xml,
  };

  try {
    const [result] = await client.GetCADUserInterfaceUrlAsync(args);

    if (!result?.GetCADUserInterfaceUrlResult) {
      return {
        status: false,
        error: "Error retrieving CAD interface URL",
      };
    }

    return {
      status: true,
      url: result?.GetCADUserInterfaceUrlResult || "",
    };
  } catch (error) {
    console.error("Error in getCADUserInterfaceUrl:", error);
    return {
      status: false,
      error: "Error retrieving CAD interface URL",
    };
  }
};

const getCADUserInterfaceUrlForView = async (xml, description) => {
  const isCad = await isCADAvailable(xml);

  if (!isCad) {
    return {
      status: false,
      error: "No CAD Available!",
    };
  }

  const client = await soapClient();

  const args = {
    clientID: CLIENT_ID,
    xml,
    viewDescription: description,
  };

  try {
    const [result] = await client.GetCADUserInterfaceUrlForViewAsync(args);

    return {
      status: true,
      url: result?.GetCADUserInterfaceUrlForViewResult,
    };
  } catch (error) {
    console.error("Error in getCADUserInterfaceUrlForView:", error);
    return {
      status: false,
      error: "Error retrieving CAD interface URL for view",
    };
  }
};

module.exports = {
  soapClient,
  isCADAvailable,
  getViewsList,
  getFormatLists,
  getCADFileurl,
  getCADUserInterfaceUrl,
  getCADUserInterfaceUrlForView,
};
