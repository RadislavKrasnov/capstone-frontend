import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
    AuthAgency,
    AuthUser,
    LoginResponse,
    SignupAgencyOwnerResponse,
} from './types/auth.types';

type AuthState = {
    accessToken: string | null;
    user: AuthUser | null;
    agency: AuthAgency | null;
    isInitialized: boolean;
};

const initialState: AuthState = {
    accessToken: null,
    user: null,
    agency: null,
    isInitialized: false,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginCredentials: (state, action: PayloadAction<LoginResponse>) => {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.agency = null;
            state.isInitialized = true;
        },

        setSignupAgencyOwnerCredentials: (
            state,
            action: PayloadAction<SignupAgencyOwnerResponse>,
        ) => {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.agency = action.payload.agency;
            state.isInitialized = true;
        },

        clearCredentials: (state) => {
            state.accessToken = null;
            state.user = null;
            state.agency = null;
            state.isInitialized = true;
        },

        markAuthInitialized: (state) => {
            state.isInitialized = true;
        },
    },
});

export const {
    setLoginCredentials,
    setSignupAgencyOwnerCredentials,
    clearCredentials,
    markAuthInitialized,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
