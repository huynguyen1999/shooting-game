export abstract class Command {
    abstract execute(): void;

    static deserialize(command: Command): any {}

    static serialize(commandData: any): any {}
}
