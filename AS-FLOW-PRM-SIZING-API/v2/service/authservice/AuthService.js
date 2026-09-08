'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserAuthentication = require('../../models/UserAuthentication');
const UserPreferences = require('../../models/UserPreferences');
const UserReportHeader = require('../../models/UserReportHeader');
const UOM = require('../../models/UOM');
const { oktaServiceToken } = require('../../middlewares/auth/oktaServiceTokenMiddleware');

const BCRYPT_ROUNDS = parseInt(process.env.PASSWORD_HASH_SALT_ROUNDS);  // fallback: 12 rounds
const ACCESS_TOKEN_EXPIRY  = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;
const PASSWORD_HASH_SALT_STRING = process.env.PASSWORD_HASH_SALT_STRING;
const TIMING_SENTINEL = process.env.TIMING_ATTACK_SENTINEL;
const ClientId = process.env.ADS_CLIENT_ID;
const ClientSecret = process.env.ADS_CLIENT_SECRET;
// Computed once at startup with the same cost factor as real passwords.
// Used only to make the "user not found" code path take the same wall-clock
// time as "user found, wrong password" — preventing email-enumeration attacks.
// bcrypt.hash returns a Promise; we store the Promise so it resolves once and
// the settled value is reused on every subsequent await.
// Falls back to TIMING_SENTINEL if the env var is absent.
const PASSWORD_HASH_SALT = bcrypt.hash(PASSWORD_HASH_SALT_STRING, BCRYPT_ROUNDS);
// ─── Token helpers ────────────────────────────────────────────────────────────

const generateAccessToken = (payload) =>
    jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const generateRefreshToken = (payload) =>
    jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

const createPreferences = async (userId) => {
    const UserId = userId;
    const uomDefaultData = await UOM.getAllDefaultUOM();
    // console.log(`In login ::: 333333 >>>>>>>> ${uomDefaultData?.length}`);
    const defaultPreferences = {
        UserId,
        Company: "",
        Address: "",
        CityStateZip: "",
        Country: "",
        Phone: "",
        EmailUrlFax: "",
        DisplayUnitSystem: 'All',
        CalculationMethod: 'English',
        SystemAtmPressure: 14.696,
        SystemAtmPressureUOM: uomDefaultData.find(uom => uom.DimensionName === 'abspressure' && uom.SystemUnit === 'English').UnitKey,
        SystemPressure: uomDefaultData.find(uom => uom.DimensionName === 'pressure' && uom.SystemUnit === 'English').UnitKey,
        SystemTemperature: uomDefaultData.find(uom => uom.DimensionName === 'temperature' && uom.SystemUnit === 'English').UnitKey,
        FluidLiquidViscosity: uomDefaultData.find(uom => uom.DimensionName === 'viscosity' && uom.SystemUnit === 'Metric').UnitKey,
        FluidSpecificHeat: uomDefaultData.find(uom => uom.DimensionName === 'specificheat' && uom.SystemUnit === 'English').UnitKey,
        FluidMassFlux: uomDefaultData.find(uom => uom.DimensionName === 'massflux' && uom.SystemUnit === 'English').UnitKey,
        FluidSpecificVolume: uomDefaultData.find(uom => uom.DimensionName === 'specificvolume' && uom.SystemUnit === 'English').UnitKey,
        FluidLatentHeat: uomDefaultData.find(uom => uom.DimensionName === 'latentheat' && uom.SystemUnit === 'English').UnitKey,
        FluidDensity: uomDefaultData.find(uom => uom.DimensionName === 'density' && uom.SystemUnit === 'English').UnitKey,
        FluidHeatInput: uomDefaultData.find(uom => uom.DimensionName === 'power' && uom.SystemUnit === 'English').UnitKey,
        FlowrateGas: uomDefaultData.find(uom => uom.DimensionName === 'gasvolflow' && uom.SystemUnit === 'English').UnitKey,
        FlowrateLiquid: uomDefaultData.find(uom => uom.DimensionName === 'liquidvolflow' && uom.SystemUnit === 'English' && uom.UnitKey === 'liquidvolflow.GPMUS').UnitKey,
        FlowrateSteam: uomDefaultData.find(uom => uom.DimensionName === 'massflow' && uom.SystemUnit === 'English').UnitKey,
        Flowrate2Phase: uomDefaultData.find(uom => uom.DimensionName === 'massflow' && uom.SystemUnit === 'English').UnitKey,
        FlowrateAPI521Fire: uomDefaultData.find(uom => uom.DimensionName === 'massflow' && uom.SystemUnit === 'English').UnitKey,
        FlowrateSubcooled: uomDefaultData.find(uom => uom.DimensionName === 'liquidvolflow' && uom.SystemUnit === 'English' && uom.UnitKey === 'liquidvolflow.BBLh').UnitKey,
        ValveDataSetSinglePhase: 'ASME',
        ValveDataSetMultiPhase: 'ASME',
        ValveOrificeArea: uomDefaultData.find(uom => uom.DimensionName === 'area' && uom.SystemUnit === 'English').UnitKey,
        ValveReactionForce: uomDefaultData.find(uom => uom.DimensionName === 'force' && uom.SystemUnit === 'English').UnitKey,
        ValveDimension: uomDefaultData.find(uom => uom.DimensionName === 'lengthforvalve' && uom.SystemUnit === 'English').UnitKey,
        ValveWeight: uomDefaultData.find(uom => uom.DimensionName === 'mass' && uom.SystemUnit === 'English').UnitKey,
        ValveDistanceFromValve: 100.000,
        ValveDistanceFromValveUOM: uomDefaultData.find(uom => uom.DimensionName === 'length' && uom.SystemUnit === 'English' && uom.UnitKey === 'length.ft').UnitKey,
        VesselDimensions: uomDefaultData.find(uom => uom.DimensionName === 'length' && uom.SystemUnit === 'English' && uom.UnitKey === 'length.in').UnitKey,
        VesselSurfaceArea: uomDefaultData.find(uom => uom.DimensionName === 'area' && uom.SystemUnit === 'English').UnitKey,
        VesselVolume: uomDefaultData.find(uom => uom.DimensionName === 'volume' && uom.SystemUnit === 'English').UnitKey,
        GeneralEnable7thEditionfor2Phase: false,
        GeneralEnable6thEditionfor2Phase: false
    }
    const defaultPreferenceData = new UserPreferences(defaultPreferences);
    // console.log(`In login ::: 444444 >>>>>>>> `);
    const defaultUserReportHeader = new UserReportHeader(defaultPreferences);
    // console.log(`In login ::: 555555 >>>>>>>> `);
    // const { Id, UserId: userId, ...preferencesData } = await UserPreferences.createUserPreferences(defaultPreferenceData);
    await UserPreferences.createUserPreferences(defaultPreferenceData);
    // console.log(`In login ::: 666666 >>>>>>>> `);
    // const {Id: reportHeaderId, UserId: reportUserId, ...userReportHeaderData} = await UserReportHeader.createUserReportHeader(defaultUserReportHeader);
    await UserReportHeader.createUserReportHeader(defaultUserReportHeader);
    // console.log(`In login ::: 777777 >>>>>>>> `);
}

const fetchUserDetails = async (user) => {
    let response = {};
 
    // const userPreferences = await UserPreferences.getUserPreferencesByUserId(user.Id);
    // console.log(`In login ::: 11 11 11 11 11 >>>>>>>> `,user);
    // const userReportHeader = await UserReportHeader.getUserReportHeaderById(user.Id);

    const [userPreferences, userReportHeader] = await Promise.all([
        UserPreferences.getUserPreferencesByUserId(user.Id),
        UserReportHeader.getUserReportHeaderById(user.Id),
    ]);

    const { Id, UserId, ...preferencesData } = userPreferences;
    // console.log(`In login ::: 12 12 12 12 12 >>>>>>>> ${Id} ${UserId}`);
    let reportHeaderData;
    if(userReportHeader) {
        const { Id: reportId, UserId: reportUserId, ...reportHeaders } = userReportHeader;
        reportHeaderData = reportHeaders;
    } else {
        reportHeaderData = {};
    }
    response['user'] = user;
    response['preference'] = {...preferencesData, ...reportHeaderData};


    return response;

}

// ─── Register ─────────────────────────────────────────────────────────────────

const registerUser = async ({ Name, Email, Password,AppType }) => {
    const existing = await UserAuthentication.findByEmail(Email);
    if (existing) {
        const err = new Error('Email is already registered');
        err.statusCode = 409;
        throw err;
    }

    const PasswordHash = await bcrypt.hash(Password, BCRYPT_ROUNDS);
    const user = await UserAuthentication.createUser({ Name, Email, PasswordHash,AppType });
    await createPreferences(user?.Id);

    return user; // PasswordHash never included — see model RETURNING clause
};

// ─── Login ────────────────────────────────────────────────────────────────────

const loginUser = async ({ Email, Password }) => {
    const user = await UserAuthentication.findByEmail(Email);

    // Deliberate constant-time comparison path — never reveal which field failed
    const GENERIC_AUTH_ERROR = 'Invalid credentials';
   
    if (!user) {
        // Run a real bcrypt.compare against the dummy hash to consume the same
        // time as a legitimate comparison — result is intentionally discarded.
        await bcrypt.compare(Password, await PASSWORD_HASH_SALT);
        const err = new Error(GENERIC_AUTH_ERROR);
        err.statusCode = 401;
        throw err;
    }

    const storedHash = user.PasswordHash ?? user.passwordhash; // guard against pg lowercase mapping
    if (!storedHash) {
        // PasswordHash column not found in query result — most likely the DB
        // migration used unquoted identifiers, causing pg to return lowercase keys.
        const err = new Error('Internal configuration error');
        err.statusCode = 500;
        throw err;
    }

    // Normalise remaining fields against both pg casing conventions.
    const userId   = user.Id    ?? user.id;
    const userName = user.Name  ?? user.name;
    const userEmail= user.Email ?? user.email;
    const appType  = user.AppType ?? user.apptype;

    const isMatch = await bcrypt.compare(Password, storedHash);
    if (!isMatch) {
        const err = new Error(GENERIC_AUTH_ERROR);
        err.statusCode = 401;
        throw err;
    }

    const tokenPayload = { id: userId, email: userEmail };
    let accessToken; //  = generateAccessToken(tokenPayload);
    if(appType && appType.toLowerCase() === 'ca'){
        console.log('LOGIN access token using Okta service token for AppType:', appType);
        accessToken  = await oktaServiceToken(ClientId, ClientSecret);
    }else{
        accessToken  = generateAccessToken(tokenPayload);
    }
    // Keep email in refresh token as well so refreshed access tokens
    // preserve the same payload contract as login access tokens.
    const refreshToken = generateRefreshToken(tokenPayload);

    const safeUser = { Id: userId, Name: userName, Email: userEmail, AppType: appType };
    let userDetails;
    if(appType && appType.toLowerCase() == 'ca'){
        return { accessToken, refreshToken, user: safeUser};
    }else{
        userDetails = await fetchUserDetails(safeUser);
        return { accessToken, refreshToken, user: safeUser, preferences: userDetails?.preference };
    }
    
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        const err = new Error('Unauthorized');
        err.statusCode = 401;
        throw err;
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        const err = new Error('Unauthorized');
        err.statusCode = 401;
        throw err;
    }

    // Backward compatibility: older refresh tokens may only contain id.
    // If email is missing, resolve user email from DB before minting tokens.
    let email = payload.email;
    let AppType;
    if (!email) {
        const user = await UserAuthentication.findById(payload.id);
        if (!user) {
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            throw err;
        }
        email = user.Email ?? user.email;
        AppType = user.AppType ?? user.apptype;
    }

    const tokenPayload = { id: payload.id, email };
    let newAccessToken;
    if(AppType && AppType.toLowerCase() === 'ca'){
        console.log('Refreshing access token using Okta service token for AppType:', AppType);
        newAccessToken  = await oktaServiceToken(ClientId, ClientSecret);
    }else{
        newAccessToken  = generateAccessToken(tokenPayload);
    }
    const newRefreshToken = generateRefreshToken(tokenPayload);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };

    // return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
 
const updatePassword = async ({ Email, NewPassword }) => {
    const user = await UserAuthentication.findByEmail(Email);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const newPasswordHash = await bcrypt.hash(NewPassword, BCRYPT_ROUNDS);
    const updatedUser = await UserAuthentication.updatePassword(user.Id, newPasswordHash);
    return updatedUser; // PasswordHash never included — see model RETURNING clause
}

module.exports = { registerUser, loginUser, refreshAccessToken, updatePassword };
