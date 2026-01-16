export interface MediaResponse {
    url: string;
    type: string;
}

export interface ApiResponseMediaResponse {
    code: number;
    message: string;
    data: MediaResponse;
}
