export abstract class Command {
  abstract execute(...args: any): void;

  public undo() {}
}
