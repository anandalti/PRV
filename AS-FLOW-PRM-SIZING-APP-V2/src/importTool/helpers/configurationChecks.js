import { evaluateLimitExpressions } from "../../utils/EvaluateLimitExpression";

export const checkRestrictions = (localSection, restrictions) => {
    let localSectionStatus = localSection?.SectionStaus;
    let localChoices = localSection?.SectionChoices?.map(choice => {
        if (restrictions?.includes(choice?.SectionChoiceId)) {
            if (choice?.isSelected == true) {
                localSectionStatus = "error";
                return { ...choice, status: "error" }
            }
            return { ...choice, status: "disabled" };

        } else if (choice?.isSelected == true && choice?.status == "disabled") {
            localSectionStatus = "error";
            return { ...choice, status: "error" }

        } else if (choice?.isSelected == false && choice?.status == "error") {
            localSectionStatus = "disabled";
            return { ...choice, status: "disabled" }
        }
        return { ...choice }

    });
    return { ...localSection, SectionChoices: localChoices, SectionStaus: localSectionStatus }
}

export const checkInclusions = (localSection, inclusions) => {
    let localSectionStatus = localSection?.SectionStaus;
    let localChoices = localSection?.SectionChoices?.map(choice => {
        if (inclusions?.includes(choice?.SectionChoiceId)) {
            localSectionStatus = "enabled";
            return { ...choice, status: "enabled" };
        }
        return { ...choice }

    });
    return { ...localSection, SectionChoices: localChoices, SectionStaus: localSectionStatus }
}

export const checkComboLimits = (localSection, combolimits, payloadData, units) => {
    // console.log(`Combo Limits >>>>>>>>>>>>> `,localSection?.Name,combolimits)
    let localSectionStatus = localSection?.SectionStaus;
    let localChoices = localSection?.SectionChoices?.map(choice => {
        let choiceComboLimits = combolimits?.filter(limit => limit?.SectionChoiceId.includes(choice?.SectionChoiceId));
        let limitFlag = true;
        if (choiceComboLimits?.length > 0) {
            const { result, failedExpressions } = evaluateLimitExpressions(choiceComboLimits, payloadData, units);
        }
        // if(combolimits?.includes(choice?.SectionChoiceId)){
        //   localSectionStatus="enabled";
        //   return {...choice,status:"enabled"};
        // }
        return { ...choice }

    });
    return { ...localSection, SectionChoices: localChoices, SectionStaus: localSectionStatus }
}