import { useEffect } from "react"
import { TANK_IMAGES } from "../../utils/constants";

const Images=(props)=>{
    // console.log(props, 'ImageNameImageNameImageName   >> ', props.value)

    useEffect(() => {
        const localValue=typeof props.defaultValue==='object'?props?.defaultValue[props?.fieldName] :props?.defaultValue
        props.onChange({name:props.fieldName, value:localValue})
    }, [props.defaultValue]);
    
    return (
        <div style={props.popupFields?{textAlign:"center"}:{textAlign:"right"}}>
        <img
            key={1}
            //src="src/assets/tankData/TankSpherical.png"
            src={TANK_IMAGES[typeof props.defaultValue==='object'?props?.defaultValue[props?.fieldName] :props?.defaultValue]}
            alt="tank Data"
        />
        </div>
    )
}

export default Images