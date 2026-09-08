const https = require("https");
const { locations } = require("../utils/drawing/locations");
const { languages } = require("../utils/drawing/languages");
const { generateXMLFile } = require("../utils/drawing/helper");
const { getSapData } = require("../service/report.service");
const xmlFieldMapping = require("../utils/drawing/xmlFieldMapping");
const {
  getCADFileurl,
  getViewsList,
  getFormatLists,
  getCADUserInterfaceUrl,
} = require("./soapdrawings/soapdrawings");
const { 
  // checkFileExistsOnFTP, 
  getFileDownload, 
  getADSDrawingFile} = require("../service/FileSearch");
const { checkIsDrawingAvailable, generateDrawingRequest, checkDrawingRequestStatus } = require("../service/drawings/DrawingService");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { Desktop_Valid_Models } = require("../utils/helper");

const getLocations = (req, res) => {
  return res.status(200).json({
    isSuccess: true,
    error: "",
    data: locations,
  });
};

const getLanguages = (req, res) => {
  return res.status(200).json({
    success: true,
    error: "",
    data: languages,
  });
};

const getAvailableViews = async (req, res) => {
  try {
    const payload = req.body;
    const xmlFileString = generateXMLFile(payload);

    const viewsList = await getViewsList(xmlFileString);

    if (!!!viewsList?.length) {
      return res.status(404).json({
        isSuccess: false,
        error: "No Views Available!",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      error: "",
      data: viewsList,
    });
  } catch (err) {
    console.error("error", err);
    return res.status(500).json({
      isSuccess: false,
      error: "Internal Server Error",
      data: "",
    });
  }
};

const getFormatList = async (req, res) => {
  try {
    const viewDescription = req.body.viewDescription;

    if (!viewDescription) {
      return res.status(400).json({
        isSuccess: false,
        error: "Description is required",
        data: "",
      });
    }

    const formatList = await getFormatLists(viewDescription);

    if (!!!formatList?.length) {
      return res.status(404).json({
        isSuccess: false,
        error: "No Data Available!",
        data: [],
      });
    }

    return res.status(200).json({
      isSuccess: true,
      error: "",
      data: formatList,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      error: "Internal Server Error",
      data: "",
    });
  }
};

const getCADFileURL = async (req, res) => {
  try {
    const payload = req.body || {};

    const { description, formatID } = payload;

    if (!description) {
      return res.status(400).json({
        isSuccess: false,
        error: "Description is required",
        data: "",
      });
    }

    if (!formatID) {
      return res.status(400).json({
        isSuccess: false,
        error: "Format ID is required",
        data: "",
      });
    }

    const xmlFileString = generateXMLFile(payload);

    const cadFileUrl = await getCADFileurl(
      xmlFileString,
      description,
      formatID
    );

    if (!cadFileUrl.status) {
      return res.status(400).json({
        isSuccess: false,
        error: cadFileUrl?.error,
        data: "",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      error: "",
      data: cadFileUrl.url,
    });
  } catch (error) {
    console.error("Error in getCADFileURL:", error);
    return res.status(500).json({
      isSuccess: false,
      error: "Internal Server Error",
      data: "",
    });
  }
};

// CWE-918: SSRF guard — allowlist-only approach.
// Blocklists can be bypassed (IPv4-mapped IPv6, decimal encoding, DNS rebinding).
// Only hostnames explicitly listed in ALLOWED_DOWNLOAD_DOMAINS are permitted.
// Set in .env: ALLOWED_DOWNLOAD_DOMAINS=cad.example.com,drawings.example.com
const getAllowedDownloadHosts = () => {
  const raw = process.env.ALLOWED_DOWNLOAD_DOMAINS || '';
  return raw.split(',').map(h => h.trim().toLowerCase()).filter(Boolean);
};

const isSsrfSafeUrl = (url) => {
  // Enforce HTTPS only — no http://, ftp://, file://, etc.
  if (url.protocol !== 'https:') return false;
  const allowedHosts = getAllowedDownloadHosts();
  // If no allowlist is configured, deny all requests to prevent accidental open-proxy.
  if (!allowedHosts.length) return false;
  const hostname = url.hostname.toLowerCase();
  // Exact match or subdomain match (e.g., "example.com" also permits "sub.example.com")
  return allowedHosts.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );
};

// const downloadFromUrl = (req, res) => {
//   const isDev = process.env.NODE_ENV === "development";
//   const options = isDev ? { rejectUnauthorized: false } : {};

//   try {
//     if (!req.query.link) {
//       return res.status(400).json({
//         isSuccess: false,
//         error: "Missing 'link' query parameter",
//       });
//     }

//     let url;
//     try {
//       url = new URL(req.query.link);
//     } catch {
//       return res.status(400).json({ isSuccess: false, error: "Invalid URL format" });
//     }

//     // CWE-918: allowlist check — rejects any host not in ALLOWED_DOWNLOAD_DOMAINS
//     if (!isSsrfSafeUrl(url)) {
//       return res.status(400).json({
//         isSuccess: false,
//         error: "URL is not permitted",
//       });
//     }

//     https
//       .get(url, options, (stream) => {
//         if (stream.statusCode !== 200) {
//           return res.status(stream.statusCode).json({
//             isSuccess: false,
//             error: `Failed to download file, status: ${stream.statusCode}`,
//           });
//         }

//         stream.on("error", (err) => {
//           console.error("Stream error:", err);
//           if (!res.headersSent) {
//             res.status(500).json({
//               isSuccess: false,

//               error: "Error streaming file",
//             });
//           }
//         });

//         stream.pipe(res);
//       })
//       .on("error", (err) => {
//         console.error("Error occurred in downloadFromUrl", err);

//         if (!res.headersSent) {
//           res.status(500).json({ error: "Failed to fetch file" });
//         }
//       });
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     res.status(500).json({
//       isSuccess: false,
//       error: "Invalid URL format",
//     });
//   }
// };

const getDrawingURL = async (req, res) => {
  try {
    const xmlFileString = generateXMLFile(req.body);
    const urlResponse = await getCADUserInterfaceUrl(xmlFileString);

    if (!urlResponse.status) {
      return res.status(400).json({
        isSuccess: false,
        error: urlResponse.error,
        data: "",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      error: "",
      data: urlResponse.url,
    });
  } catch (error) {
    console.error("Error in getDrawingURL:", error);
    return res.status(500).json({
      isSuccess: false,
      error: "Internal Server Error",
      data: "",
    });
  }
};

const getConfigData = async (req, res, next) => {
  try {
    //const authorization = req.headers["authorization"];
    // const token = Buffer.from(authorization, "base64").toString("utf-8");
    //const authToken = token ? token.split("<->") : "";
    //console.log("authorization Token", authToken);

    // console.log("Get config data==>" + JSON.stringify(await getConfigData(req.params)));
    const {
      outputParameters: { char_summary_items = [], ...rest },
    } = await getSapData(req.params.configHeaderId);

    const finalResponse = { outputParameters: { ...rest, char_summary_items } };

    xmlFieldMapping.default.forEach((v) => {
      const { key, lookupKey, defaultValue, location } = v;

      if (location !== "parent") {
        const propValue =
          char_summary_items.find((v) => v.SapChar === lookupKey) || {};
        finalResponse.outputParameters[key] =
          propValue.CharValue || defaultValue;
      } else {
        finalResponse.outputParameters[key] = rest[lookupKey] || defaultValue;
      }
    });

    return res.status(200).json(finalResponse);
  } catch (err) {
    console.error("Unexpected Error Occured: ", err);
    return res.status(500).json({
      isSuccess: false,
      error: "Internal Server Error",
      data: "",
    });
  }
};

const getDrawingfile = async (req, res) => {
  try {
    
    
    
    await getFileDownload(req,res);

    // return fileExists;
    // const fileExists = await checkFileExistsOnFTP(req,res);

    // if (fileExists?.error) {
    //   return res.status(404).json({
    //     status: "Error",
    //     ...fileExists
    //   });
    // }

    // return res.status(200).json({
    //   status: "Success",
    //   ...fileExists
    // });
  } catch (error) {
    console.error("Error in accessing file from given path:", error);
    return res.status(500).json({
      isSuccess: false,
      error: "Internal Server Error",
      data: "",
    });
  }
};

// const downloadADSDrawingFile = async (req, res) => {
//   try {
    
//     await getADSDrawingFile(req,res);

//   } catch (error) {
//     console.error("Error in accessing file from given path:", error);
//     return res.status(500).json({
//       isSuccess: false,
//       error: "Internal Server Error",
//       data: "",
//     });
//   }
// };

const IsDrawingAvailable = async (req, res) => {
  // Placeholder implementation
  try {
    const ADS_Request_Id = req?.query?.ADS_Request_Id ?? req?.query?.ADSRequestId;
    // console.log(ADS_Request_Id)
    const result = await checkIsDrawingAvailable(ADS_Request_Id);
    if(result.status==="Error"){
      return res.status(400).json({...result});
    }
    return res.status(200).json({...result});
  } catch (err) {
    console.error("Error in IsDrawingAvailable:", err);
    return res.status(500).json({
      status: "Error",
      error: "Internal Server Error"
    });
  }
  
};

const GetDrawingStatus = async (req, res) => {
  // Placeholder implementation
  try {
    const payload= req.body;
    let ADS_Request_Id = payload?.ADS_Request_Id ?? payload?.ADSRequestId;
    // console.log(payload,ADS_Request_Id)
    const result = await checkDrawingRequestStatus(ADS_Request_Id);
    // console.log(result)
    // if(result.status==="Error"){
    //   return res.status(200).json({...result});
    // }
    return res.status(200).json({...result});
  } catch (err) {
    console.error("Error in GetDrawingStatus:", err);
    return res.status(500).json({
      status: "Error",
      error: "Internal Server Error"
    });
  }
  
};


const generateDrawing = async (req, res) => {
  const payload = req.body;

  if (!payload) {
    return res.status(400).json({
      status: "Error",
      message: 'Missing request body',
      data: null
    });
  }

  try {
    const result = await generateDrawingRequest(payload);
    if(result.status==="Error"){
      return res.status(400).json({
        status: result.status,
        message: result?.message || "Error generating drawing",
        data: result?.data ?? result?.missingKeys ?? undefined
      });
    }
    if(result?.status==="Partial Success"){
      return res.status(207).json({
        status: "Partial Success",
        message: result?.message || "Drawing request partially processed",
        data: result.data,
        meta : result?.meta ?? undefined
      });
    }
    return res.status(200).json({
      status: "Success",
      message: result?.message || "Drawing request submitted successfully",
      data: result.data,
        meta : result?.meta ?? undefined
    });
  } catch (err) {
    console.error('Controller error:', err);
    return res.status(500).json({
      status: "Error",
      message: err.message || 'Server error',
      data: null
    });
  }
};

const getADSValidModels = async (req, res) => {
    try {
        const validModels = Desktop_Valid_Models;
        // console.log("ADS Valid Models: ", validModels);
      res.status(200).json({
        success: true,
        message: 'ADS valid models fetched successfully',
        data: validModels
    });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ADS valid models',
            error: error.message
        });
    }
}

module.exports = {
  getLocations,
  getLanguages,
  getAvailableViews,
  getFormatList,
  getCADFileURL,
  // downloadFromUrl,
  getDrawingURL,
  getConfigData,
  getDrawingfile,
  IsDrawingAvailable,
  generateDrawing,
  // downloadADSDrawingFile,
  GetDrawingStatus,
  getADSValidModels

};
