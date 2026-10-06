import { BaseResponse } from './BaseResponse,dto';

export interface TokenRefresh {
  token: string;
}

export interface RefreshTokenResponse extends BaseResponse {
  data: TokenRefresh;
}
