
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { pipeline } = require("stream");
const { oktaServiceToken } = require("../middlewares/auth/oktaServiceTokenMiddleware");


const getFileDownload = async (req, res) => {

    const Base_Path = process.env.ADS_FILE_BASE_URL;

    // Normalise query params to string at the HTTP boundary — prevents CWE-1287
    // (improper type validation): query values can be arrays when a key is repeated
    // (e.g. ?fileExt[]=pdf), which would make .toLowerCase()/.toString() throw.
    const rawId  = req.query.ADS_Request_Id;
    const rawExt = req.query.fileExt || req.query.fileType;
    const ADS_Request_Id = typeof rawId  === 'string' ? rawId  : '';
    const fileExt        = typeof rawExt === 'string' ? rawExt.toLowerCase() : '';

    if (!ADS_Request_Id || !fileExt) {
        return res.status(400).json({ status: 'Error', message: 'Missing required query parameters: ADS_Request_Id and fileExt/fileType' });
    }

    try {
      const clientId = process.env.ADS_CLIENT_ID;
     const clientSecret = process.env.ADS_CLIENT_SECRET;
      const serviceToken = await oktaServiceToken(clientId, clientSecret);
      const ext = `.${fileExt}`;
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.dwg': 'application/acad',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.stp': 'application/step',
      };
      const contentType = mimeTypes[ext] || response.headers['content-type'] || 'application/octet-stream';
      let response;
     
      const fileUrl = `${Base_Path}${ADS_Request_Id.toString().padStart(19, '0')}.${fileExt}`;
        
      const requestObject={
          method: 'GET',
          url: fileUrl,
          responseType: 'stream',
          timeout: 30000,
          validateStatus: () => true,
          headers: {
            "Content-Type": contentType,
            Authorization: `Bearer ${serviceToken}`
          }
        };
        console.log('Request: >>>>>> ', requestObject?.url);
      response = await axios(requestObject);
      
      if (response.status !== 200) {
        console.log('Response: >>>>>> ', response.status);
        res.status(response.status).json({
          status: 'Error',
          message: `Failed to fetch file. Status code: ${response.status}`
        });
        return;
      }

      // Extract filename (with extension) from Content-Disposition header if present
      let filename = 'drawing';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }

      // Set Content-Type based on extension
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);


      // res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      // res.setHeader("Content-Type", response.headers['content-type'] || "application/octet-stream");

      pipeline(response.data, res, (err) => {
        if (err) {
          console.error('Pipeline error:', err);
          if (!res.headersSent) {
            res.status(500).end('Error streaming file');
          } else {
            res.end();
          }
        }
      });
    } catch (err) {
      console.error('Download error:', err);
      res.status(500).json({
        status: 'Error',
        message: 'Failed to download or stream file',
        error: err.message || err
      });
    }
  // }
};

// const getADSDrawingFile= async (req, res) => {
//     const adsId = req.params.adsId;
//     const DRAWING_FOLDER = path.join(__dirname, '..', '_static', '_uploads');

//     // Sanitize adsId: allow only alphanumeric, hyphens, and underscores to prevent path traversal
//     if (!adsId || !/^[\w\-]+$/.test(adsId)) {
//         return res.status(400).json({ message: "Invalid drawing ID" });
//     }

//     const allowedExtensions = new Set([".pdf", ".dwg", ".png", ".jpg"]);
//     let filePath = null;

//     // Single FS call: list directory once instead of probing each extension separately
//     let dirEntries;
//     try {
//         dirEntries = await fs.promises.readdir(DRAWING_FOLDER);
//     } catch {
//         return res.status(500).json({ message: "Unable to access drawing storage" });
//     }

//     const match = dirEntries.find((entry) => {
//         const entryExt = path.extname(entry).toLowerCase();
//         return entry === adsId + entryExt && allowedExtensions.has(entryExt);
//     });

//     if (match) {
//         filePath = path.join(DRAWING_FOLDER, match);
//     }

//     if (!filePath) {
//         return res.status(404).json({ message: "Drawing not found" });
//     }

//     // Set headers for download
//     const filename = path.basename(filePath);
//     const encodedFilename = encodeURIComponent(filename);
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`);

//     // Set Content-Type based on extension
//     const fileExt = path.extname(filePath).toLowerCase();
//     const mimeTypes = {
//         '.pdf': 'application/pdf',
//         '.dwg': 'application/acad',
//         '.png': 'image/png',
//         '.jpg': 'image/jpeg'
//     };
//     res.setHeader('Content-Type', mimeTypes[fileExt] || 'application/octet-stream');

//     // Send file with error handling
//     res.sendFile(filePath, (err) => {
//         if (err) {
//             console.error('Error sending drawing file:', err);
//             if (!res.headersSent) {
//                 res.status(500).json({ message: 'Error sending file' });
//             } else {
//                 res.end();
//             }
//         }
//     });
// }



module.exports = {
  // checkFileExistsOnFTP,
  getFileDownload,
  // getADSDrawingFile
};