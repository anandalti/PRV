require('dotenv').config({ path: '.env.dev' });
const { pool } =  require("../../db/pgsqldb") //require('../../db/pgsqldb');
const { createDataFiles, updateWorkFlowFile, createWorkflowDetails } = require('../jsondata_crud/workflows/WorkflowJsonActions');

const LoadDataInDB = async (list) => {
    try {
        let completedWf=[]
        for (const workflow of list) {
            console.log('Workflows >>>>>> ',workflow);
            try {
                const resultData = await createWorkflowDetails(workflow);
                if (resultData) {
                    console.log(`Data Files created successfully for Workflow ID ${workflow}`);
                    completedWf.push(workflow);
                } else {
                    console.error(`Error in creating Data Files for Workflow ID ${workflow}:`, resultData.error);
                }
            } catch (error) {
                console.error(`Error processing Workflow ID ${workflow}:`, error);
            }
        };
        return completedWf;
    } catch (error) {
        console.error('Error fetching all section fields:', error);
        throw error;
    }
};  

const createFilesForWorkflows = async (list) => {
    try {
        let result={};
        console.log('Workflows >>>>>> ',list);
        const data = await createDataFiles();
        if(data){
            console.log('Data files Created successfully');
            for (const workflow of list) {
                try {
                    const resultData = await updateWorkFlowFile(workflow);
                    if (resultData?.status === 'error') {
                        console.error(`Error in creating Data Files for Workflow ID ${workflow}:`, resultData.error);
                        result[workflow] = `Error: ${resultData.error}`;
                    } else {
                        console.log(`Data Files created successfully for Workflow ID ${workflow}`);
                        result[workflow] = 'Success';
                    }
                } catch (error) {
                    console.error(`Error processing Workflow ID ${workflow}:`, error);
                    result[workflow] = `Error: ${error.message}`;
                }
            };
            return result;
        }else{
            return "Error in creating Data Files";
        }
    } catch (error) {
        console.error('Error fetching all section fields:', error);
        throw error;
    }
};

// const FileDataMigrationScript= async () => {
//     try {
//             const StartTime= new Date();
//             console.log(' >>>>>>>. Starting Process >>>>>>>>>>> ',StartTime)
//             const list = [10,11,12,13,14,15,16];
//             let results = {};
//             // const res = await pool.query('SELECT DISTINCT "Id" FROM "GetWorkflowData" ORDER BY "Id";');
//             // // console.log('Res >>>>> ',res.rows)
//             // res.rows.forEach((data) => {
//             //     list.push(data.Id);
//             // });
//             console.log('Workflows >>>>>> ',list)
//             const loadedWorkflows = await LoadDataInDB(list);
//             console.log('Workflows Processed >>>>>> ',loadedWorkflows)
//             if(loadedWorkflows.length > 0){
//                 results = await createFilesForWorkflows(loadedWorkflows);
//                 const timetaken = `${(new Date() - StartTime)/1000}s`;
//                  console.log('Process Completion Time >>>>>>>> ',timetaken);
//                 return results;
//             }
//             // .then(async (res) => {
//             //     console.log('Workflows Processed >>>>>> ',res)
//             //     //  results = await createFilesForWorkflows(list);
//             //     //  const timetaken = `${(new Date() - StartTime)/1000}s`;
//             //     //  console.log('Process Completion Time >>>>>>>> ',timetaken);
//             //      return results;
//             // }).catch((err) => {                
//             //     console.error('Error in processing workflows >>>>>> ',err)
//             // });
            
//             // return list;
//         } catch (error) {
//             console.error('Error fetching all section fields:', error);
//             throw error;
//         }
// };

// console.log(FileDataMigrationScript());

const workflowList = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,26,27];
const StartTime = new Date();
console.log('Starting Migration Process:', StartTime);
//1,5,9,12,14,15,16,17,18,19,20,21,26
LoadDataInDB([14,15,16,17,18,19,20,21])
  .then(async (wfCompleted) => {
    console.log('LoadDataInDB completed. Workflows loaded into DB:', wfCompleted);
    if (wfCompleted.length === 0) {
      console.error('No workflows were loaded into DB. Skipping file generation.');
      return {};
    }
    return createFilesForWorkflows(wfCompleted);
  })
  .then(result => {
    const timetaken = `${(new Date() - StartTime) / 1000}s`;
    console.log('Migration completed in', timetaken, ':', result);
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    pool.end();
    process.exit(1);
  });
// FileDataMigrationScript()

// module.exports = {
//     FileDataMigrationScript,
// };