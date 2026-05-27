import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';

import type { RootState } from '../../app/store';
import { clearCredentials, setLoginCredentials } from '../../features/auth/authSlice';
import type { RefreshResponse } from '../../features/auth/types/auth.types';

type AxiosBaseQueryArgs = {
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
};

type AxiosBaseQueryError = {
    status?: number;
    data: unknown;
};

const AUTH_URLS_WITHOUT_REFRESH = new Set([
    '/auth/login',
    '/auth/signup-agency-owner',
    '/auth/refresh',
    '/auth/logout',
]);

let refreshPromise: Promise<RefreshResponse> | null = null;

function buildError(error: AxiosError): AxiosBaseQueryError {
    return {
        status: error.response?.status,
        data: error.response?.data ?? error.message,
    };
}

function shouldAttemptRefresh(url: string, status?: number) {
    return status === 401 && !AUTH_URLS_WITHOUT_REFRESH.has(url);
}

async function refreshAccessToken(baseUrl: string): Promise<RefreshResponse> {
    if (!refreshPromise) {
        refreshPromise = axios
            .post<RefreshResponse>(`${baseUrl}/auth/refresh`, undefined, {
                withCredentials: true,
            })
            .then((response) => response.data)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

export const axiosBaseQuery =
    (
        { baseUrl }: { baseUrl: string } = { baseUrl: '' },
    ): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
        async ({ url, method = 'GET', data, params }, api) => {
            const makeRequest = async (accessToken: string | null) => {
                return axios({
                    url: baseUrl + url,
                    method,
                    data,
                    params,
                    withCredentials: true,
                    headers: {
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                });
            };

            const state = api.getState() as RootState;
            const token = state.auth.accessToken;

            try {
                const result = await makeRequest(token);

                return { data: result.data };
            } catch (axiosError) {
                const error = axiosError as AxiosError;
                const originalError = buildError(error);

                if (!shouldAttemptRefresh(url, error.response?.status)) {
                    return { error: originalError };
                }

                try {
                    const refreshResponse = await refreshAccessToken(baseUrl);

                    api.dispatch(setLoginCredentials(refreshResponse));

                    const retriedResult = await makeRequest(refreshResponse.accessToken);

                    return { data: retriedResult.data };
                } catch (refreshError) {
                    api.dispatch(clearCredentials());

                    const finalError = refreshError as AxiosError;

                    return {
                        error: buildError(finalError),
                    };
                }
            }
        };
