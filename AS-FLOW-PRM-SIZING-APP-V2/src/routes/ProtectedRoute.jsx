import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useSelector(state => state.auth);
    return isLoggedIn ? children : <Navigate to='/' />;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired
};
export default ProtectedRoute;
