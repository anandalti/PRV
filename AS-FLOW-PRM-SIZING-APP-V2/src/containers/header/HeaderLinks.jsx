import React from 'react'
import Link from '../../components/basicComponents/Link';
import styles from './../../styles/Home.module.css';
import { linkStyle } from './../../styles/StyleObjectProperties';
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

const HeaderLinks = () => {
    const navigate  = useNavigate();
    const dispatch  = useDispatch();

    const handleLogout = async () => {
        // Calls POST /v2/api/auth/logout to expire httpOnly cookies on the server,
        // then clears Redux auth state regardless of the result.
        await dispatch(logoutUser());
        navigate('/');
    };

    return (
        <div className={`${styles.displayFlex} ${styles.justiFyContentSpaceAround} ${styles.justiFyContentRight}`}>
            <Link sx={linkStyle} onClick={() => navigate('/Sizing/preference')}>Preferences</Link>
            <b>|</b>
            <Link sx={linkStyle} onClick={() => navigate('/Sizing/mySizing')}>My Sizings</Link>
            <b> | </b>
            <Link sx={linkStyle} onClick={() => navigate('/#')}>Help</Link>
            <b> | </b>
            <Link sx={{ ...linkStyle, color: '#d31245' }} onClick={handleLogout}>Sign Out</Link>
        </div>
    );
}

export default HeaderLinks