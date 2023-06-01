export abstract class Command {
    abstract execute(): void;

    deserialize(): any {}
}
