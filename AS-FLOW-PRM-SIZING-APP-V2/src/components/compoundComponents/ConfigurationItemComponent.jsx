import useConfigurationPanel from "../../hooks/useConfigurationPanel";
import Checkbox from "../basicComponents/Checkbox"
import DropDown from "../basicComponents/DropDown"
import Input from "../basicComponents/Input";

const ConfigurationItemComponent = ({SectionData}) => {
    const { updateConfigCustomFlag,updateConfigSelectedData,updateConfigCustomInputData } = useConfigurationPanel();

    
  return (<>
        {
            SectionData?.Visible && !SectionData?.AllowMultiple && SectionData?.SectionOrder>0 &&
            <div style={{display:"grid",width:"42rem",height:"2rem",gridTemplateColumns:!SectionData?.isCustomConfig?"1.2fr 2.2fr 0.4fr":"1.2fr 2.3fr 0.4fr",gap:10,alignItems:"center"}}>
                <div><p style={{fontSize:"0.75rem",fontWeight:600,textAlign:"end"}}>{SectionData?.Name}</p></div>
                <div >
                    {
                       !SectionData?.isCustomConfig? 
                        <DropDown
                            options={SectionData?.SectionChoices}
                            fieldName={SectionData?.Name}
                            configflag={true}
                            title={SectionData?.SelectedChoice?.label}
                            value={SectionData?.SelectedChoice?.value}
                            advancedProps={{defaultLabel:SectionData?.DefaultValue==SectionData?.SelectedChoice?.label?SectionData?.DefaultValue:SectionData?.SelectedChoice?.label}}
                            disabled={SectionData.Mode==='E' }
                            SectionStatus={SectionData?.SectionStaus}
                            onChange={updateConfigSelectedData}
                            width="24rem"
                        />:
                        <Input
                            fieldName={SectionData?.Name}
                            value={SectionData?.CustomInputData}
                            className="input-field-config"
                            type="text"
                            mandatory={false}
                            disabled={false}
                            onChange={updateConfigCustomInputData}
                            // displayValue={props?.type === "number" ? validateNaN(value, fieldName) : value}
                            style={{width:"22rem"}}
                        />
                    }
                </div>
                <div style={{textAlign:"end"}}>
                    {/* <Checkbox
                        fieldName={SectionData?.Name}
                        label=""
                        value={SectionData?.isCustomConfig}
                        disabled={false}
                        onChange={updateConfigCustomFlag}
                    /> */}
                </div>
            </div>
        }
    </>
  )
}

export default ConfigurationItemComponent