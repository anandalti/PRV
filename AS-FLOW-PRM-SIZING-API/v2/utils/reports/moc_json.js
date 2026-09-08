const { flameArrester_FA } = require("./mocJsonChunks/flameArrester_FA");
const { freeVent_FV } = require("./mocJsonChunks/freevent_FV");
const { highPres_ACS_ABP } = require("./mocJsonChunks/highPres_ACS_ABP");
const { highPres_APO } = require("./mocJsonChunks/highPres_APO");
const { highPres_CBP_CCS } = require("./mocJsonChunks/highPres_CBP_CCS");
const { highPres_CCS_CBB_CBD } = require("./mocJsonChunks/highPres_CCS_CBB_CBD");
const { lowPres_APOAPO } = require("./mocJsonChunks/lowPres_APO+APO");
const { lowPres_not_APOAPO } = require("./mocJsonChunks/lowPres_not_APO+APO");
const { tankVent } = require("./mocJsonChunks/tankVent");
const { tankVent_96A } = require("./mocJsonChunks/tankVent_96A");
const { tankVent_HCFL } = require("./mocJsonChunks/tankVent_HCFL");

const MocJSONDATA = [
    ...flameArrester_FA,
    ...freeVent_FV,
    ...highPres_ACS_ABP,
    ...highPres_APO,
    ...highPres_CBP_CCS,
    ...highPres_CCS_CBB_CBD,
    ...lowPres_APOAPO,
    ...lowPres_not_APOAPO,
    ...tankVent,
    ...tankVent_96A,
    ...tankVent_HCFL
]

module.exports = {
    MocJSONDATA
}