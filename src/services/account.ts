import { api } from './api';
import type { AccountDetail, AccountUpdate } from "../types/account";
import type { CommonResponse } from '../types/common';

const PREFIX = "/account"

export const AccountService = {
    getMe: () => api.get<CommonResponse<AccountDetail>>(`${PREFIX}/me`),
    updateMe: (body: AccountUpdate) => {
        const data = new FormData();
        data.append('name', body.name);
        if (body.avatar) data.append('avatar', body.avatar);
        return api.patch<CommonResponse<AccountDetail>>(`${PREFIX}/me`, data);
    },
}