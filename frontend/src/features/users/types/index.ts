export interface UserResponse {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    imgUrl?: string;
    roles?: string[];
    createAt?: string;
    updateAt?: string;
}

export interface UserUpdateRequest {
    firstName?: string;
    lastName?: string;
    imgUrl?: string;
}

export interface UserWallProfileResponse {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    imgUrl?: string;
    followed?: boolean;
}

export interface ApiResponseUserResponse {
    code?: number;
    message?: string;
    data?: UserResponse;
}

export interface ApiResponseVoid {
    code?: number;
    message?: string;
    data?: object;
}

export interface ApiResponseUserWallProfileResponse {
    code?: number;
    message?: string;
    data?: UserWallProfileResponse;
}

export interface ApiResponseListUserWallProfileResponse {
    code?: number;
    message?: string;
    data?: UserWallProfileResponse[];
}

export interface ApiResponseListUserResponse {
    code?: number;
    message?: string;
    data?: UserResponse[];
}
