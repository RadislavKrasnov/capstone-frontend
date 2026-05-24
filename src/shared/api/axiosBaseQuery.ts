import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';

type AxiosBaseQueryArgs = {
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
};

export const axiosBaseQuery =
    (
        { baseUrl }: { baseUrl: string } = { baseUrl: '' },
    ): BaseQueryFn<AxiosBaseQueryArgs, unknown, unknown> =>
        async ({ url, method = 'GET', data, params }) => {
            try {
                const token = localStorage.getItem('accessToken');

                const result = await axios({
                    url: baseUrl + url,
                    method,
                    data,
                    params,
                    withCredentials: true,
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                return { data: result.data };
            } catch (axiosError) {
                const error = axiosError as AxiosError;

                return {
                    error: {
                        status: error.response?.status,
                        data: error.response?.data ?? error.message,
                    },
                };
            }
        };
