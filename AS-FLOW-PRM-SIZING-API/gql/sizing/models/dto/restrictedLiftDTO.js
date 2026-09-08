'use strict';

const toRestrictedLiftDTO = (row) => ({
    id: row?.Id ?? row?.id ?? null,
    sizingId: row?.SizingId ?? row?.sizingid ?? null,
    modelNumber: row?.ModelNumber ?? row?.modelnumber ?? null,
    orifice: row?.Orifice ?? row?.orifice ?? null,
    restrictedLift: row?.RestrictedLift ?? row?.restrictedlift ?? null,
    requiredFlow: row?.RequiredFlow ?? row?.requiredflow ?? null,
    ratedFlowCapacity: row?.RatedFlowCapacity ?? row?.ratedflowcapacity ?? null,
    flowCapacityUOM: row?.FlowCapacityUOM ?? row?.flowcapacityuom ?? null,
    ifr: row?.IFR ?? row?.ifr ?? null,
    doNotExceedCapacity: row?.DoNotExceedCapacity ?? row?.donotexceedcapacity ?? null,
    liftRestriction: row?.LiftRestriction ?? row?.liftrestriction ?? null,
    restrictedLiftCapacity: row?.RestrictedLiftCapacity ?? row?.restrictedliftcapacity ?? null,
});

module.exports = {
    toRestrictedLiftDTO,
};
