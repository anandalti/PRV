import { BorderRight } from "@mui/icons-material"

const RestrictedLiftErrors = (props) => {
    console.log(props)
  return (
    <div style={{display:'flex',alignItems:'center',gap:'1rem',marginTop:'0.5rem', width:'100%'}}>
        <div style={{width:'25%', borderRight:'1px solid black',fontSize:'1rem',textAlign:'center'}}>{props?.label}</div>
        <div style={{width:'75%',fontSize:'0.75rem', height:'auto'}}>
            {props?.defaultValue?.map((error,index)=>{
                return <div key={`${error}-${index}`} style={{color:'red'}}>{index+1}. {error}</div>
            })}
        </div>
    </div>
  )
}

export default RestrictedLiftErrors