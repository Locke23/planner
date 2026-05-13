export class RegisterUserCommand {
  constructor(
    readonly email: string,
    readonly name: string,
    readonly password: string,
  ) {}
}
