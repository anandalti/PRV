'use strict';

const toWorkflowDTO = (row) => ({
    id: row?.Id ?? row?.id,
    valveCategoryId: row?.ValveCategoryId ?? row?.valvecategoryid,
    valveCategoryName: row?.ValveCategoryName ?? row?.valvecategoryname,
    valveCategoryDescription: row?.ValveCategoryDescription ?? row?.valvecategorydescription,
    valveCategoryIsActive: row?.ValveCategoryIsActive ?? row?.valvecategoryisactive,
    valveCategoryIcon: row?.ValveCategoryIcon ?? row?.valvecategoryicon,
    valveCategoryDisplayOrder: row?.ValveCategoryDisplayOrder ?? row?.valvecategorydisplayorder,
    fluidTypeId: row?.FluidTypeId ?? row?.fluidtypeid,
    fluidTypeName: row?.FluidTypeName ?? row?.fluidtypename,
    fluidTypeDescription: row?.FluidTypeDescription ?? row?.fluidtypedescription,
    fluidTypeIsActive: row?.FluidTypeIsActive ?? row?.fluidtypeisactive,
    fluidTypeIcon: row?.FluidTypeIcon ?? row?.fluidtypeicon,
    fluidTypeDisplayOrder: row?.FluidTypeDisplayOrder ?? row?.fluidtypedisplayorder,
    sizingMethodologyId: row?.SizingMethodologyId ?? row?.sizingmethodologyid,
    sizingMethodologyName: row?.SizingMethodologyName ?? row?.sizingmethodologyname,
    code: row?.Code ?? row?.code,
    sizingMethodologyDescription: row?.SizingMethodologyDescription ?? row?.sizingmethodologydescription,
    sizingMethodologyIsActive: row?.SizingMethodologyIsActive ?? row?.sizingmethodologyisactive,
    sizingMethodologyDisplayOrder: row?.SizingMethodologyDisplayOrder ?? row?.sizingmethodologydisplayorder,
    isGenericReq: row?.IsGenericReq ?? row?.isgenericreq,
});

module.exports = {
    toWorkflowDTO,
};
