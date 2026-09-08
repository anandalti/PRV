import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAccessToken, logoutUser } from '../store/slices/authSlice';

/**
 * useAutoTokenRefresh
 *
 * Monitors the access token's expiration time and automatically refreshes it
 * before it expires. This prevents "TokenExpiredError" when the frontend tries
 * to use an expired token.
 *
 * Token Refresh Strategy:
 * - Refresh when: expiresIn < 30 seconds remaining
 * - Check interval: Every 5 seconds
 * - On successful refresh: Redux state updates with new token metadata
 * - On failed refresh: Logs error (middleware handles redirect to login)
 *
 * Usage in App.jsx or main layout component:
 *   export function App() {
 *     useAutoTokenRefresh();  // Call once at top level
 *     return <Routes>{...}</Routes>;
 *   }
 */
export const useAutoTokenRefresh = () => {
    const dispatch = useDispatch();
    const { isLoggedIn, expiresAt, accessToken, status } = useSelector((state) => state.auth);
    const intervalRef = useRef(null);
    const refreshScheduledRef = useRef(false);

    useEffect(() => {
        // Only set up refresh monitoring if user is logged in
        if (!isLoggedIn || !expiresAt || !accessToken) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const checkTokenExpiry = () => {
            // Already refreshing — skip this check
            if (refreshScheduledRef.current || status === 'refreshing') {
                return;
            }

            const now = new Date();
            const expireTime = new Date(expiresAt);
            const msRemaining = expireTime.getTime() - now.getTime();
            const secondsRemaining = Math.round(msRemaining / 1000);

            console.log(
                `⏱️  [TokenMonitor] Time remaining: ${secondsRemaining}s | Status: ${status}`
            );

            // Refresh when less than 30 seconds remaining
            if (msRemaining > 0 && msRemaining < 30000) {
                console.log(
                    `⚠️  [TokenMonitor] Token expiring soon (${secondsRemaining}s remaining) — triggering refresh`
                );
                refreshScheduledRef.current = true;
                dispatch(refreshAccessToken())
                    .then((action) => {
                        if (action.type.endsWith('/fulfilled')) {
                            console.log('✅ [TokenMonitor] Auto-refresh succeeded');
                        } else {
                            console.warn('⚠️  [TokenMonitor] Auto-refresh was rejected');
                        }
                    })
                    .finally(() => {
                        refreshScheduledRef.current = false;
                    });
            } else if (msRemaining <= 0) {
                console.error('❌ [TokenMonitor] Token has expired — logging out');
                dispatch(logoutUser());
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };

        // Check token expiry every 5 seconds
        intervalRef.current = setInterval(checkTokenExpiry, 5000);

        // Run immediately on mount/update to catch imminent expiry
        checkTokenExpiry();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLoggedIn, expiresAt, accessToken, status, dispatch]);
};

export default useAutoTokenRefresh;
