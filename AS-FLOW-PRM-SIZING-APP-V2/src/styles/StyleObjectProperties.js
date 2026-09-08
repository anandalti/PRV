import { ITEM_HEIGHT, ITEM_PADDING_TOP } from '../utils/constants';
import styles from './Home.module.css';

export const headerButton= `${styles["bgColor_Transparent"]} ${styles["border"]} ${styles["border"]} ${styles["borderRadius"]} ${styles["headerButton"]} ${styles["textColorBlack"]}`
//export const footerButton= `${styles["bgColor_Green"]} ${styles["border"]} ${styles["border"]} ${styles["borderRadius"]} ${styles["borderGreen"]} ${styles["button"]} ${styles["textColorWhite"]}`
export const footerButton= `${styles["footerButton"]}`
export const footerNext= `${styles["footerNext"]}`
export const fontSize14={ fontSize: 14 }
export const headerText={
    fontSize: "2.2rem",
    fontWeight: "400"
}

export const subtitle1={
    fontSize: "0.875rem !important",
    fontWeight: "400",
    lineHeight: 1.43
}

export const stackStyle={
    display:"flex",
    justifyContent:"flex-end",
}

export const paddingZero={
    padding:'0px !important'
}

export const marginBottom0={
    marginBottom:'0px !important'
}
export const tabStyle=(isCompleted)=>{
    
    return {
        '&.MuiTab-root': {
            color: 'black',
            width: "100%",
            borderBottom:"1px solid #c0c0c0",
            transition: 'color 0.2s ease-in-out',
            minHeight:"3rem",
            height:"auto",
            margin:"0",
            marginBottom:"0",
            padding:"0",
            paddingLeft:"0",
            textAlign:"left",
        }
    }
}

export const dropdownStyles = {
    PaperProps: {
      style: {
        maxHeight: 40,
        minWidth: 250,
        borderRadius:0
      },
    },
    MuiMenuItem: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "blue", // Change to your desired color
          },
          "&.Mui-selected:hover": {
            backgroundColor: "blue", // Change to your desired color
          },
        },
      },
      MuiInputLabel: {
        root: {
          display: "none",
        },
      },
  };

//   export const ddUseStyles = makeStyles({
//     select: {
//       '& .MuiPaper-root': {
//         maxHeight: 40,
//         minWidth: 250,
//         borderRadius: 0,
//       },
//     },
//     menuItem: {
//       '&.Mui-selected': {
//         backgroundColor: 'blue', // Change to your desired color
//       },
//       '&.Mui-selected:hover': {
//         backgroundColor: 'blue', // Change to your desired color
//       },
//     },
//   });

export const gridCenter = {
    root: {
        justifyContent: "center"
    },
    '.MuiGrid-spacing-xs-1': {  
        width: "calc(100% + 8)",
        margin: "-4px" 
    },
    '.MuiGrid-container': {
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        boxSizing: "border-box",
    },
    '.padding-20': {
        padding: "20px"
    },
    ".fluidBox": {
        borderRadius: "0px !important",
        background: "#fff",
        minHeight: "130px"
    },
    ".overrideProductGroupAlignBox": {
        borderRadius: "0px !important",
        textAlign: "left"
        /* width: 100%; */
    },
    '.box': {
        marginBottom: "24px !important",
        minHeight: "27px !important",
        padding: "none",
        /* background-color: #f5f5f5 !important; */
        border: "none",
        height: "auto !important"
    }

}

export const gridCenterSx={
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    boxSizing: "border-box",
    padding: "20px",
    paddingTop: "0px",
    margin: "0 auto !important",
    // backgroundColor: "#ffffff",
}
export const linkStyle={
    fontSize: '0.875rem',
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    textDecoration:"none",
    color:"#000",
    padding:"3px",
    '&:hover':{
        cursor:"pointer"
    }
}

export const navigationStyle={
    padding: "0 1rem"
}
