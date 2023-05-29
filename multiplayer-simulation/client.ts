import { Entity } from "./entity";
import { renderWorld } from "./helper";
import { LagNetwork } from "./lag-network";
import { Server } from "./server";

export class Client {
    // Local representation of the entities.
    public entities: { [entityId: string]: Entity };

    // Input state.
    public key_left: boolean;
    public key_right: boolean;

    // Simulated network connection.
    public network: LagNetwork;
    public server: Server | null;
    public lag: number;

    // Unique ID of our entity. Assigned by Server on connection.
    public entity_id: number | null;

    // Data needed for reconciliation.
    public client_side_prediction: boolean;
    public server_reconciliation: boolean;
    public input_sequence_number: number;
    public pending_inputs: any[];

    // Entity interpolation toggle.
    public entity_interpolation: boolean;

    // UI.
    public canvas: any;
    public status: any;

    // Update rate.
    public update_interval: any;
    public update_rate!: number;

    public last_ts!: number;

    constructor(canvas: any, status: any) {
        // Local representation of the entities.
        this.entities = {};

        // Input state.
        this.key_left = false;
        this.key_right = false;

        // Simulated network connection.
        this.network = new LagNetwork();
        this.server = null;
        this.lag = 0;

        // Unique ID of our entity. Assigned by Server on connection.
        this.entity_id = null;

        // Data needed for reconciliation.
        this.client_side_prediction = false;
        this.server_reconciliation = false;
        this.input_sequence_number = 0;
        this.pending_inputs = [];

        // Entity interpolation toggle.
        this.entity_interpolation = true;

        // UI.
        this.canvas = canvas;
        this.status = status;

        // Update rate.
        this.setUpdateRate(10);
    }

    public setUpdateRate(hz: number): void {
        this.update_rate = hz; // fps

        clearInterval(this.update_interval);
        this.update_interval = setInterval(
            this.update.bind(this),
            1000 / this.update_rate, // delta time
        );
    }

    // Update Client state.
    public update(): void {
        // Listen to the server.
        this.processServerMessages();

        if (this.entity_id === null) {
            return; // Not connected yet.
        }

        // Process inputs.
        this.processInputs();

        // Interpolate other entities.
        if (this.entity_interpolation) {
            this.interpolateEntities();
        }

        // Render the World.
        renderWorld(this.canvas, this.entities);

        // Show some info.
        const info = "Non-acknowledged inputs: " + this.pending_inputs.length;
        this.status.textContent = info;
    }

    // Get inputs and send them to the server.
    // If enabled, do client-side prediction.
    public processInputs(): void {
        // Compute delta time since last update.
        const now_ts = Date.now();
        const last_ts = this.last_ts || now_ts;
        const dt_sec = (now_ts - last_ts) / 1000.0;
        this.last_ts = now_ts;

        // Package player's input.
        let input: any;
        if (this.key_right) {
            input = { press_time: dt_sec };
        } else if (this.key_left) {
            input = { press_time: -dt_sec };
        } else {
            // Nothing interesting happened.
            return;
        }

        // Send the input to the server.
        input.input_sequence_number = this.input_sequence_number++;
        input.entity_id = this.entity_id;
        this.server?.network.send(this.lag, input);

        // Do client-side prediction.
        if (this.client_side_prediction && this.entity_id) {
            this.entities[this.entity_id].applyInput(input);
        }

        // Save this input for later reconciliation.
        this.pending_inputs.push(input);
    }

    // Process all messages from the server, i.e. world updates.
    // If enabled, do server reconciliation.
    public processServerMessages(): void {
        while (true) {
            const message = this.network.receive();
            if (!message) {
                break;
            }

            // World state is a list of entity states.
            for (let i = 0; i < message.length; i++) {
                const state = message[i];

                // If this is the first time we see this entity, create a local representation.
                if (!this.entities[state.entity_id]) {
                    const entity = new Entity();
                    entity.entity_id = state.entity_id;
                    this.entities[state.entity_id] = entity;
                }

                const entity = this.entities[state.entity_id];

                if (state.entity_id === this.entity_id) {
                    // Received the authoritative position of this client's entity.
                    entity.x = state.position;

                    if (this.server_reconciliation) {
                        // Server Reconciliation. Re-apply all the inputs not yet processed by
                        // the server.
                        let j = 0;
                        while (j < this.pending_inputs.length) {
                            const input = this.pending_inputs[j];
                            if (
                                input.input_sequence_number <=
                                state.last_processed_input
                            ) {
                                // Already processed. Its effect is already taken into account into the world update
                                // we just got, so we can drop it.
                                this.pending_inputs.splice(j, 1);
                            } else {
                                // Not processed by the server yet. Re-apply it.
                                // if the client and server state deviate too much, we have to reapply input from the
                                // most recent input processed by server
                                entity.applyInput(input);
                                j++;
                            }
                        }
                    } else {
                        // Reconciliation is disabled, so drop all the saved inputs.
                        this.pending_inputs = [];
                    }
                } else {
                    // Received the position of an entity other than this client's.

                    if (!this.entity_interpolation) {
                        // Entity interpolation is disabled - just accept the server's position.
                        entity.x = state.position;
                    } else {
                        // Add it to the position buffer for later entity interpolation
                        const timestamp = Date.now();
                        entity.position_buffer.push({
                            timestamp,
                            x: state.position,
                        });
                    }
                }
            }
        }
    }

    public interpolateEntities(): void {
        // Compute render timestamp.
        const now = Date.now();
        const render_timestamp =
            now - 1000.0 / (this.server?.update_rate ?? 10);

        for (const entityId in this.entities) {
            const entity = this.entities[entityId];

            // No point in interpolating this client's entity.
            if (
                entity.entity_id &&
                this.entity_id &&
                entity.entity_id === this.entity_id
            ) {
                continue;
            }

            // Find the two authoritative positions surrounding the rendering timestamp.
            const buffer = entity.position_buffer;

            // Drop older positions.
            while (
                buffer.length >= 2 &&
                buffer[1].timestamp <= render_timestamp
            ) {
                buffer.shift();
            }

            // Interpolate between the two surrounding authoritative positions.
            if (
                buffer.length >= 2 &&
                buffer[0].timestamp <= render_timestamp &&
                render_timestamp <= buffer[1].timestamp
            ) {
                const x0 = buffer[0].x;
                const x1 = buffer[1].x;
                const t0 = buffer[0].timestamp;
                const t1 = buffer[1].timestamp;

                entity.x =
                    x0 + ((x1 - x0) * (render_timestamp - t0)) / (t1 - t0);
            }
        }
    }
}
