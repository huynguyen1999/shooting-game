export class PlayerInputDto {
  dt_sec: number;
  input_sequence_number: number;
  movement_key_map: Record<string, boolean>;
}
