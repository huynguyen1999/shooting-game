import { PlayerDto } from "./player-join.dto";

export interface PlayerUpdateDto {
    client_id: string;
    player: PlayerDto;
}
