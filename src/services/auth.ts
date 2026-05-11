import { api } from './api';
import type { LoginRequest } from '../types/auth';
import type { CommonResponse } from '../types/common';

const PREFIX = "/auth"

export const AuthService = {
  login: (body: LoginRequest) =>
    api.post<CommonResponse<null>>(`${PREFIX}/login`, body),
  logout: () =>
    api.post<CommonResponse<null>>(`${PREFIX}/logout`, {}),
};