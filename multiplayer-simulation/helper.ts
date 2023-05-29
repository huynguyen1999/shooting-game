export const renderWorld = (canvas: HTMLCanvasElement, entities: any) => {
    // Clear the canvas.
    canvas.width = canvas.width;

    const colours = ["blue", "red"];

    for (const i in entities) {
        const entity = entities[i];

        // Compute size and position.
        const radius = (canvas.height * 0.9) / 2;
        const x = (entity.x / 10.0) * canvas.width;

        // Draw the entity.
        const ctx = canvas.getContext("2d")!;
        ctx.beginPath();
        ctx.arc(x, canvas.height / 2, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = colours[entity.entity_id];
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "dark" + colours[entity.entity_id];
        ctx.stroke();
    }
};
