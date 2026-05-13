export class MemberNotFoundException extends Error {
  constructor() { super('Member not found in this workspace'); }
}
