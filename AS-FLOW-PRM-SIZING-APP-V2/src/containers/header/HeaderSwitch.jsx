import styles from './../../styles/HeaderSwitch.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {changeLayout} from '../../store/slices/layoutSlice';
import { onUpdateError, onUpdateFields } from '../../store/slices/workflowSlice';

const HeaderSwitch = () => {
  const dispatch = useDispatch();
  const layout = useSelector((state)=> state.layout.isAdvanced);
  const { payloadData } = useSelector((state) => state.workflowPayload);
  const error = useSelector((state) => state.workflow.error);

  const handleCheck=()=>{
    // console.log('In switching the layout >>>>>>>>>>>>> ',layout)
    if(payloadData['UomFieldName']!==''){
      dispatch(onUpdateFields({name:'UomFieldName',value:''}));
    }
   dispatch(changeLayout(!layout));
   setTimeout(() => dispatch(onUpdateError(error)), 100);
  }
  return (
    <>
      <div className={`${styles.toggleSwitch}`}>
        <input type="checkbox" onChange={handleCheck} className={`${styles.toggleSwitchCheckbox}`} id="switchview" checked={layout}/>
        <label className={`${styles.toggleSwitchLabel}`} htmlFor="switchview">
          <span className={`${styles.toggleSwitchInner}`} data-yes="Advanced" data-no="Basic">
          </span>
          <span className={`${styles.toggleSwitchSwitch}`}>
          </span>
        </label>
      </div>
    </>
  )
}

export default HeaderSwitch