'use strict';

/**
 * ValveAnimation — inline SVG illustration of a pressure-relief valve.
 *
 * Anatomy (top → bottom):
 *   Adjustment screw / lock-nut
 *   Bonnet cap
 *   Bonnet body  (spring inside — animates up/down)
 *   Body-bonnet flange
 *   Valve body   (disc + seat inside)
 *   Inlet flange
 *   Inlet pipe   (inlet flow arrows animate upward)
 *
 * Side outlets (left & right) with outward-flowing arrows.
 * Pressure gauge (top-right corner) with an animated needle.
 *
 * All animations use CSS keyframes + SVG-native animateTransform
 * for the gauge needle — no external dependencies required.
 */

import React from 'react';
import { Box } from '@mui/material';

const CSS = `
    @keyframes va-spring {
        0%, 100% { transform: translateY(0);    }
        50%       { transform: translateY(-7px); }
    }
    @keyframes va-up {
        0%   { transform: translateY(9px);  opacity: 0;    }
        35%  { opacity: 0.85; }
        100% { transform: translateY(-7px); opacity: 0;    }
    }
    @keyframes va-left {
        0%   { transform: translateX(9px);  opacity: 0;    }
        35%  { opacity: 0.85; }
        100% { transform: translateX(-9px); opacity: 0;    }
    }
    @keyframes va-right {
        0%   { transform: translateX(-9px); opacity: 0;    }
        35%  { opacity: 0.85; }
        100% { transform: translateX(9px);  opacity: 0;    }
    }
    @keyframes va-pulse {
        0%, 100% { opacity: 0.20; }
        50%      { opacity: 0.55; }
    }
`;

/* Number of spring coils to render */
const COILS = [0, 1, 2, 3];

const ValveAnimation = () => (
    <Box sx={{ width: '100%', maxWidth: 270, mx: 'auto', mt: 1 }}>
        <svg viewBox="0 0 270 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><style>{CSS}</style></defs>

            {/* ═══════════════════════════════════════════════
                TOP: Adjustment screw + lock-nut
            ═══════════════════════════════════════════════ */}
            <rect x="120" y="52" width="30" height="22" rx="4"
                fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
            <line x1="124" y1="60" x2="146" y2="60" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
            <line x1="124" y1="67" x2="146" y2="67" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>

            {/* Bonnet cap */}
            <rect x="105" y="72" width="60" height="14" rx="4"
                fill="rgba(255,255,255,0.28)" stroke="rgba(255,255,255,0.52)" strokeWidth="1.5"/>
            <circle cx="115" cy="79" r="2.5" fill="rgba(255,255,255,0.40)"/>
            <circle cx="155" cy="79" r="2.5" fill="rgba(255,255,255,0.40)"/>

            {/* ═══════════════════════════════════════════════
                BONNET body + animated spring
            ═══════════════════════════════════════════════ */}
            <rect x="115" y="84" width="40" height="80" rx="5"
                fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.48)" strokeWidth="2"/>

            {/* Spring coils — bounce with translateY */}
            <g style={{ animation: 'va-spring 2s ease-in-out infinite' }}>
                {COILS.map(i => (
                    <React.Fragment key={i}>
                        <line
                            x1="118" y1={92  + i * 18}
                            x2="152" y2={101 + i * 18}
                            stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round"
                        />
                        <line
                            x1="152" y1={101 + i * 18}
                            x2="118" y2={110 + i * 18}
                            stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round"
                        />
                    </React.Fragment>
                ))}
            </g>

            {/* Body-bonnet flange */}
            <rect x="107" y="162" width="56" height="8" rx="3"
                fill="rgba(255,255,255,0.26)" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5"/>
            <circle cx="116" cy="166" r="2.5" fill="rgba(255,255,255,0.40)"/>
            <circle cx="154" cy="166" r="2.5" fill="rgba(255,255,255,0.40)"/>

            {/* ═══════════════════════════════════════════════
                VALVE BODY (disc + seat)
            ═══════════════════════════════════════════════ */}
            <rect x="84" y="168" width="102" height="56" rx="6"
                fill="rgba(255,255,255,0.20)" stroke="rgba(255,255,255,0.50)" strokeWidth="2"/>

            {/* Seat ring */}
            <ellipse cx="135" cy="195" rx="22" ry="7"
                fill="rgba(255,255,255,0.30)" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5"/>
            {/* Disc */}
            <rect x="125" y="188" width="20" height="8" rx="2"
                fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/>

            {/* ═══════════════════════════════════════════════
                INLET PIPE (bottom center)
            ═══════════════════════════════════════════════ */}
            <rect x="114" y="224" width="42" height="76" rx="2"
                fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
            {/* Inlet flange */}
            <rect x="100" y="220" width="70" height="10" rx="3"
                fill="rgba(255,255,255,0.28)" stroke="rgba(255,255,255,0.52)" strokeWidth="1.5"/>
            <circle cx="109" cy="225" r="2.5" fill="rgba(255,255,255,0.40)"/>
            <circle cx="161" cy="225" r="2.5" fill="rgba(255,255,255,0.40)"/>

            {/* Inlet flow arrows — upward (vertex=top, base=bottom) */}
            <g style={{ animation: 'va-up 2s ease-in-out infinite' }}>
                <polygon points="135,257 128,268 142,268" fill="rgba(255,255,255,0.65)"/>
            </g>
            <g style={{ animation: 'va-up 2s ease-in-out infinite 0.65s' }}>
                <polygon points="135,243 128,254 142,254" fill="rgba(255,255,255,0.42)"/>
            </g>

            {/* ═══════════════════════════════════════════════
                LEFT OUTLET PIPE
            ═══════════════════════════════════════════════ */}
            <rect x="4"  y="180" width="82" height="26" rx="3"
                fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
            <rect x="82" y="176" width="8"  height="34" rx="3"
                fill="rgba(255,255,255,0.28)" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5"/>
            <circle cx="86" cy="182" r="2" fill="rgba(255,255,255,0.40)"/>
            <circle cx="86" cy="208" r="2" fill="rgba(255,255,255,0.40)"/>

            {/* Left outlet arrows — pointing LEFT (vertex=left, base=right) */}
            <g style={{ animation: 'va-left 2.2s ease-in-out infinite 0.3s' }}>
                <polygon points="24,193 38,186 38,200" fill="rgba(255,255,255,0.60)"/>
            </g>
            <g style={{ animation: 'va-left 2.2s ease-in-out infinite 1s' }}>
                <polygon points="44,193 58,186 58,200" fill="rgba(255,255,255,0.38)"/>
            </g>

            {/* ═══════════════════════════════════════════════
                RIGHT OUTLET PIPE
            ═══════════════════════════════════════════════ */}
            <rect x="184" y="180" width="82" height="26" rx="3"
                fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
            <rect x="180" y="176" width="8"  height="34" rx="3"
                fill="rgba(255,255,255,0.28)" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5"/>
            <circle cx="184" cy="182" r="2" fill="rgba(255,255,255,0.40)"/>
            <circle cx="184" cy="208" r="2" fill="rgba(255,255,255,0.40)"/>

            {/* Right outlet arrows — pointing RIGHT (vertex=right, base=left) */}
            <g style={{ animation: 'va-right 2.2s ease-in-out infinite 0.3s' }}>
                <polygon points="246,193 232,186 232,200" fill="rgba(255,255,255,0.60)"/>
            </g>
            <g style={{ animation: 'va-right 2.2s ease-in-out infinite 1s' }}>
                <polygon points="226,193 212,186 212,200" fill="rgba(255,255,255,0.38)"/>
            </g>

            {/* ═══════════════════════════════════════════════
                PRESSURE GAUGE (top-right)
            ═══════════════════════════════════════════════ */}
            <g transform="translate(220,128)">
                {/* Gauge pipe */}
                <line x1="-38" y1="10" x2="-14" y2="10"
                    stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round"/>
                {/* Outer ring */}
                <circle cx="0" cy="0" r="28"
                    fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.50)" strokeWidth="2"/>
                {/* Inner ring (pulsing) */}
                <circle cx="0" cy="0" r="21"
                    fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"
                    style={{ animation: 'va-pulse 2.4s ease-in-out infinite' }}/>
                {/* Scale ticks at -60°, -30°, 0°, +30°, +60° */}
                {[-60, -30, 0, 30, 60].map((deg, i) => {
                    const rad = (deg - 90) * Math.PI / 180;
                    return (
                        <line key={i}
                            x1={Math.cos(rad) * 17} y1={Math.sin(rad) * 17}
                            x2={Math.cos(rad) * 23} y2={Math.sin(rad) * 23}
                            stroke="rgba(255,255,255,0.58)" strokeWidth="1.5" strokeLinecap="round"
                        />
                    );
                })}
                {/* Needle — animateTransform rotates around pivot (0, 4) */}
                <line x1="0" y1="4" x2="0" y2="-17"
                    stroke="rgba(255,255,255,0.90)" strokeWidth="2.5" strokeLinecap="round">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="-50,0,4; 30,0,4; 42,0,4; -50,0,4"
                        keyTimes="0;0.4;0.62;1"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                </line>
                {/* Pivot centre */}
                <circle cx="0" cy="4" r="3.5" fill="rgba(255,255,255,0.82)"/>
                <text x="0" y="15" textAnchor="middle"
                    fill="rgba(255,255,255,0.60)" fontSize="7"
                    fontFamily="Roboto,Helvetica,Arial,sans-serif" fontWeight="600">
                    PSI
                </text>
            </g>
        </svg>
    </Box>
);

export default ValveAnimation;
