import Dialog from "../hoc/Dialog";
import styles from "../../styles/Home.module.css";
import useSearchSizing from "../../hooks/useSearchSizing";
import LabeledInput from "../basicComponents/LabeledInput";
import { useState } from "react";
const SearchSizingModal = () => {
  // console.log('searchSizingModalsearchSizingModalsearchSizingModal')
  const { searchSizing, handleSearchSizing, errorMsg } = useSearchSizing();
  const [searchKey, setSearchKey] = useState("");
  //const [error, setError]=useState(errorMsg)
  const handleClose = () => {
    handleSearchSizing();
  };
  // const handleSave = () => {
  //     if(searchKey.startsWith("PRV")){
  //         //setError()
  //         searchSizing(searchKey)
  //     }else{
  //         setError('Please enter a valid sizing Id')
  //     }
  //     console.log("Clicked on Ok Button");
  // };
  const handleChange = (item) => {
    // console.log('handleChange inside searchModal',item)
    setSearchKey(item.value);
  };
  return (
    <div>
      <Dialog
        maxWidth="md"
        open={true}
        onClose={handleClose}
        title="Search Sizing"
        draggable={false}
        children={
          <>
            <LabeledInput
              style={{ minWidth: "200px" }}
              label="PRV Sizing ID"
              value={searchKey}
              fieldName={"SizingId"}
              grid={4}
              key={"searchSizing"}
              onChange={(item) => handleChange(item)}
            />
            {errorMsg && <span className={styles.errorClass}>{errorMsg}</span>}
          </>
        }
        buttons={[
          { label: `Ok`, onClick: () => searchSizing(searchKey), className: styles.footerButton },
          { label: `Cancel`, onClick: handleClose, className: styles.footerButton },
        ]}
      />
    </div>
  );
};
export default SearchSizingModal;
