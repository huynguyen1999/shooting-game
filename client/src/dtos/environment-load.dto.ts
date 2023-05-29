export interface EnvironmentLoadDto {
    client_id: string;
    canvas_width: number;
    canvas_height: number;

    canvas_styles: {
        [key: string]: string;
    };
}
