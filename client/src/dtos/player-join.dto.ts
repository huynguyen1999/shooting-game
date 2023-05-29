export interface PlayerDto {
    name: string;
    x: number;
    y: number;
    radius: number;
    color: string;
}
export interface PlayerJoinDto {
    [key: string]: PlayerDto;
}
