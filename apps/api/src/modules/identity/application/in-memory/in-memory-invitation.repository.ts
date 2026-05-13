import { InvitationRecord, IInvitationRepository } from '../../domain/repositories/iinvitation.repository';

export class InMemoryInvitationRepository implements IInvitationRepository {
  private store = new Map<string, InvitationRecord>();

  async findByToken(token: string): Promise<InvitationRecord | null> {
    for (const inv of this.store.values()) {
      if (inv.token === token) return inv;
    }
    return null;
  }

  async save(invitation: InvitationRecord): Promise<void> {
    this.store.set(invitation.id, invitation);
  }

  async markAccepted(id: string): Promise<void> {
    const inv = this.store.get(id);
    if (inv) inv.acceptedAt = new Date();
  }

  seed(inv: InvitationRecord): InvitationRecord { this.store.set(inv.id, inv); return inv; }
  clear(): void { this.store.clear(); }
}
