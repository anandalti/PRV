import { EMAIL_ADDRESS, LOGIN_PAGE_HEADER } from "../../utils/constants";
import Button from "../../components/basicComponents/Button";
import useLogin from "../../hooks/useLogin";
import { Tooltip } from "@mui/material";
// import ToolTip from "../../components/basicComponents/ToolTip";


const Login = () => {
  const {showLogin,error, changeEmail, handleLogin} = useLogin();
  return showLogin && (
    <div className="login-container">
      <h3>{LOGIN_PAGE_HEADER}</h3>
      <div className="login-form">
        <label className="login-label">{EMAIL_ADDRESS}</label>
        <div className="input-container">
          <Tooltip title={error?.type==='error' && error?.message}
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: "white",
                  color: `${error?.type==='error' ? "#d31245" : "black"}`,
                  border: `1px solid ${error?.type==='error' ? "#d31245" : "#00aa7e"}`,
                  padding: "10px",
                },
              },
              arrow: {
                sx: {
                  color: `${error?.type==='error' ? "#d31245" : "#00aa7e"}`,
                },
              },
            }}
          >
            <input type="email" className={error?.type==='error'?"login-input-error":"login-input"} onChange={changeEmail} />
          </Tooltip>
          <Button variant='contained' color='success' className="login-button" onClick={handleLogin}>Login</Button>
        </div>
      </div>
    </div>
  )
}

export default Login