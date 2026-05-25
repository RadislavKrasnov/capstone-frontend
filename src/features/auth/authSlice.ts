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
};

const initialState: AuthState = {
    accessToken: null,
    user: null,
    agency: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginCredentials: (state, action: PayloadAction<LoginResponse>) => {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.agency = null;
        },

        setSignupAgencyOwnerCredentials: (
            state,
            action: PayloadAction<SignupAgencyOwnerResponse>,
        ) => {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.agency = action.payload.agency;
        },

        clearCredentials: (state) => {
            state.accessToken = null;
            state.user = null;
            state.agency = null;
        },
    },
});

export const {
    setLoginCredentials,
    setSignupAgencyOwnerCredentials,
    clearCredentials,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
