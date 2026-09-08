import useConfigurationPanel from "../../hooks/useConfigurationPanel";
import Input from "../basicComponents/Input";

const ConfigCatelogERPCompo = () => {
    const { configurationData } = useConfigurationPanel();
  return (
    <div>

        <div style={{display:"grid",width:"40rem",height:"2rem",gridTemplateColumns:"1.2fr 2.6fr 0.4fr",gap:10,alignItems:"center"}}>
            <div><p style={{fontSize:"0.75rem",fontWeight:600,textAlign:"end"}}>Catalog Number</p></div>
            <div >
                <Input
                            fieldName="CatalogNumber"
                            value={configurationData?.CatalogNumber}
                            className="input-field-config"
                            type="text"
                            mandatory={false}
                            disabled={true}
                            // onChange={updateConfigCustomInputData}
                            style={{width:"26rem"}}
                        />
            </div>   
        </div> 
        <div style={{display:"grid",width:"40rem",height:"2rem",gridTemplateColumns:"1.2fr 2.6fr 0.4fr",gap:10,alignItems:"center"}}>
            <div><p style={{fontSize:"0.75rem",fontWeight:600,textAlign:"end"}}>ERP Number</p></div>
            <div >
                <Input
                            fieldName="ERPNumber"
                            value={configurationData?.ERPNumber}
                            className="input-field-config"
                            type="text"
                            mandatory={false}
                            disabled={true}
                            // onChange={updateConfigCustomInputData}
                            style={{width:"26rem"}}
                        />
            </div>   
        </div>
        <hr/>
    </div>
  )
}

export default ConfigCatelogERPCompo