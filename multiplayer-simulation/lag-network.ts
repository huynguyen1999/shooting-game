export class LagNetwork {
    public messages: { recv_ts: number; payload: any }[];

    constructor() {
        this.messages = [];
    }

    // "Send" a message. Store each message with the timestamp when it should be received, to simulate lag.
    public send(lag_ms: number, message: any): void {
        this.messages.push({
            recv_ts: Date.now() + lag_ms,
            payload: message,
        });
    }

    // Returns a "received" message, or undefined if there are no messages available yet.
    public receive(): any | undefined {
        const now = Date.now();
        for (let i = 0; i < this.messages.length; i++) {
            const message = this.messages[i];
            if (message.recv_ts <= now) {
                this.messages.splice(i, 1);
                return message.payload;
            }
        }
        return undefined;
    }
}
