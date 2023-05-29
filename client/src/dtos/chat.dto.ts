export interface ChatDto {
    client_id?: string; // if client_id is not provided, then it is a server message
    message: string;
}
