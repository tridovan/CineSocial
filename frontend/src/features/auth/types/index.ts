export interface AuthenticationRequest {
    email?: string;
    password?: string;
}

export interface AuthenticationResponse {
    token?: string;
    authenticated?: boolean;
    roles?: string[];
}

export interface UserCreationRequest {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
}

export interface ApiResponseAuthenticationResponse {
    code?: number;
    message?: string;
    data?: AuthenticationResponse;
}

export interface ApiResponseUserResponse {
    code?: number;
    message?: string;
    data?: UserResponse;
}

// Re-export UserResponse from users feature or define if circular dependency issues arise
// For now, defining basic user structure here if needed for auth response, 
// but auth response only has token/authenticated/roles. 
// UserCreationRequest returns ApiResponseUserResponse, so we need UserResponse.

import type { UserResponse } from '../../users/types';
