export interface NotificationResponse {
    id: string;
    recipientId: string;
    actorId: string;
    actorName: string;
    actorImgUrl: string;
    type: string; // 'COMMENT_POST', 'LIKE_POST', etc.
    message: string;
    resourceId: string; // postId usually
    createdAt: string;
    read: boolean;
}

export interface ApiResponseListNotificationResponse {
    code: number;
    message: string;
    data: NotificationResponse[];
}

export interface ApiResponseString {
    code: number;
    message: string;
    data: string;
}
