import { Route, Routes } from "react-router-dom";
import Login from "../containers/login/Login";
import AuthLogin from "../containers/auth/AuthLogin";
import AuthRegister from "../containers/auth/AuthRegister";
import MySizing from "../containers/sizing/MySizing";
import Preference from "../containers/preference/Preference";
import Home from "../containers/home/Home";
import InvalidPage from "../containers/invalidPage/InvalidPage";
import ProtectedRoute from "./ProtectedRoute";
import { useSelector } from "react-redux";
import ConfigurationLayout from "../containers/home/layouts/ConfigurationLayout";

const AppRoutes = () => {
  const {isConfigurationLayout}=useSelector((state)=>state.configuration);
  return (
    <Routes>
      {/* All the actual Routes */}
      {/* <Route exact path="/" element={<Login />} /> */}
      <Route exact path="/" element={<AuthLogin callingProject="PRVPA-ONLINE" />} />
      <Route exact path="/register" element={<AuthRegister callingProject="PRVPA-ONLINE" />} />
      {/* <Route exact path="/" element={<SizingApp />} /> */}
      <Route path="*" element={<InvalidPage />} />
      {/* Authenticated Routes */}
      <Route
        path="/Sizing"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Sizing/preference"
        element={
          <ProtectedRoute>
            <Preference />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Sizing/mySizing"
        element={
          <ProtectedRoute>
            <MySizing />
          </ProtectedRoute>
        }
      />

      {
        isConfigurationLayout &&
        <Route
        path="/Configuration"
        element={
            <ProtectedRoute>
              <ConfigurationLayout />
            </ProtectedRoute>
          }
        />
      }
    </Routes>
  );
};

export default AppRoutes;
