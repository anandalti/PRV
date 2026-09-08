import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  changeEmailInput,
  checkLogin,
  login,
  setIsLoggedin,
  setLoginError,
  setUserData,
} from "../store/slices/authSlice";
import { useAuth0 } from "@auth0/auth0-react";

const useLogin = () => {
  const {
    
    oktaLogin,
    userDetails,
    userData,
    emailInput,
    isLoggedIn,
    showLogin,
    error,
    platform,
  } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  const changeEmail = (e) => {
    dispatch(changeEmailInput(e.target.value));
  };

  const handleLogin = () => {
    if(platform !=='gos'){
      loginWithRedirect();
    }else{
      const emailRegex =
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (emailRegex.test(emailInput)) {
        dispatch(login({ EmailId: emailInput }));
        dispatch(setLoginError(null));
      } else if (emailInput === "") {
        dispatch(setLoginError({type:"error",message:"Please enter valid email address"}));
      } else {
        console.error("Invalid email address");
        dispatch(
          setLoginError({ type: "error", message: "Invalid email address" })
        );
        // Optionally, you can show an error message to the user here
      }
    }
  };

  useEffect(()=>{
    if (isAuthenticated) {
      getAccessTokenSilently()
        .then((token) => {
          console.log('Token: >>> ', token,user);
          sessionStorage.setItem('authToken', token); 
          dispatch(setIsLoggedin(isAuthenticated));
          dispatch(setUserData(user));
          // Use the token as needed
        })
        .catch((error) => {
          console.error('Error getting token:', error);
        });
    }
  },[isAuthenticated])

  // useEffect(() => {
  //   if(!userDetails) {
  //     dispatch(checkLogin());
  //   }
  // }, [userDetails, dispatch]);

  useEffect(() => {
    if (oktaLogin && !userData) {
      // console.log('oktaLogin', oktaLogin);
      dispatch(login({ EmailId: userDetails.userMailId }));
    }
  }, [oktaLogin, userData, dispatch]);

  useEffect(() => {
    
    if (isLoggedIn) {
      navigate("/Sizing");
    }
  }, [isLoggedIn]);

  return { userData, showLogin, error,platform, changeEmail, handleLogin };
};

export default useLogin;
