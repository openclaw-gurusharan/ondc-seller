import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as bs58 from 'bs58';
import type {
  EscrowAccount,
  EscrowTransaction,
  CreateEscrowParams,
  FundEscrowParams,
  ReleaseRequestParams,
  ApprovalParams,
  ReleaseFundsParams,
  CancelEscrowParams,
  DisputeEscrowParams,
  EscrowEvents,
  AadhaarChainRecord,
  AuditTrailEntry,
  EscrowStatus,
} from '../types/escrow';

const ESCROW_PROGRAM_ID = new PublicKey('Escrow1111111111111111111111111111111');

const MOCK_ESCROWS: Map<string, EscrowAccount> = new Map();
const MOCK_TRANSACTIONS: Map<string, EscrowTransaction[]> = new Map();
const MOCK_AUDIT_TRAIL: Map<string, AuditTrailEntry[]> = new Map();
const MOCK_AADHAAR_RECORDS: Map<string, AadhaarChainRecord> = new Map();

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function createAuditEntry(
  escrowId: string,
  action: string,
  actor: string,
  actorRole: 'buyer' | 'seller' | 'escrow' | 'system',
  previousState: EscrowStatus,
  newState: EscrowStatus,
  details: Record<string, string> = {}
): AuditTrailEntry {
  const entry: AuditTrailEntry = {
    id: generateId(),
    escrowId,
    action,
    actor,
    actorRole,
    timestamp: Date.now(),
    previousState,
    newState,
    details,
  };

  const trail = MOCK_AUDIT_TRAIL.get(escrowId) || [];
  trail.push(entry);
  MOCK_AUDIT_TRAIL.set(escrowId, trail);

  return entry;
}

function createTransaction(
  escrowId: string,
  action: EscrowTransaction['action'],
  from: string,
  to: string,
  amount: number,
  currency: string,
  metadata?: Record<string, string>
): EscrowTransaction {
  const tx: EscrowTransaction = {
    id: generateTransactionId(),
    escrowId,
    action,
    from,
    to,
    amount,
    currency,
    timestamp: Date.now(),
    signature: `sig_${Math.random().toString(36).substring(2, 15)}`,
    blockHash: `block_${Date.now()}`,
    metadata,
  };

  const txs = MOCK_TRANSACTIONS.get(escrowId) || [];
  txs.push(tx);
  MOCK_TRANSACTIONS.set(escrowId, txs);

  return tx;
}

function recordToAadhaarChain(escrow: EscrowAccount): AadhaarChainRecord {
  const record: AadhaarChainRecord = {
    id: generateId(),
    txHash: `aadhaar_tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    escrowId: escrow.id,
    parties: [
      escrow.buyer.walletAddress,
      escrow.seller.walletAddress,
      escrow.escrow.walletAddress,
    ],
    amount: escrow.amount,
    status: escrow.status,
    timestamp: Date.now(),
    blockNumber: Math.floor(Date.now() / 1000),
  };

  MOCK_AADHAAR_RECORDS.set(record.id, record);
  return record;
}

export class EscrowService {
  private connection: Connection;
  private events: EscrowEvents;

  constructor(connection: Connection, events?: EscrowEvents) {
    this.connection = connection;
    this.events = events || {};
  }

  async createEscrow(params: CreateEscrowParams): Promise<EscrowAccount> {
    const escrow: EscrowAccount = {
      id: generateId(),
      orderId: params.orderId,
      status: 'pending',
      amount: params.amount,
      currency: params.currency,
      buyer: {
        walletAddress: params.buyerWallet,
        aadhaarHash: params.buyerAadhaarHash,
        role: 'buyer',
        name: params.buyerName,
        approvalStatus: 'pending',
      },
      seller: {
        walletAddress: params.sellerWallet,
        aadhaarHash: params.sellerAadhaarHash,
        role: 'seller',
        name: params.sellerName,
        approvalStatus: 'pending',
      },
      escrow: {
        walletAddress: params.escrowWallet,
        role: 'escrow',
        name: params.escrowName,
        approvalStatus: 'pending',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      transactions: [],
    };

    MOCK_ESCROWS.set(escrow.id, escrow);
    MOCK_TRANSACTIONS.set(escrow.id, []);
    MOCK_AUDIT_TRAIL.set(escrow.id, []);

    createTransaction(
      escrow.id,
      'created',
      SystemProgram.programId.toBase58(),
      params.escrowWallet,
      params.amount,
      params.currency,
      { orderId: params.orderId }
    );

    createAuditEntry(
      escrow.id,
      'ESCROW_CREATED',
      params.escrowWallet,
      'system',
      'pending',
      'pending',
      { orderId: params.orderId, amount: params.amount.toString() }
    );

    const aadhaarRecord = recordToAadhaarChain(escrow);
    escrow.aadhaarChainTxHash = aadhaarRecord.txHash;
    escrow.onChainRecordId = aadhaarRecord.id;

    return escrow;
  }

  async fundEscrow(params: FundEscrowParams): Promise<EscrowAccount> {
    const escrow = MOCK_ESCROWS.get(params.escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'pending') {
      throw new Error('Escrow is not in pending state');
    }

    const previousStatus = escrow.status;
    escrow.status = 'funded';
    escrow.updatedAt = Date.now();

    createTransaction(
      escrow.id,
      'funded',
      params.payerWallet,
      escrow.escrow.walletAddress,
      params.amount,
      escrow.currency
    );

    createAuditEntry(
      escrow.id,
      'ESCROW_FUNDED',
      params.payerWallet,
      'buyer',
      previousStatus,
      'funded',
      { amount: params.amount.toString() }
    );

    const aadhaarRecord = recordToAadhaarChain(escrow);
    escrow.aadhaarChainTxHash = aadhaarRecord.txHash;

    if (this.events.onFunded) {
      this.events.onFunded(escrow);
    }

    return escrow;
  }

  async requestRelease(params: ReleaseRequestParams): Promise<EscrowAccount> {
    const escrow = MOCK_ESCROWS.get(params.escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'funded') {
      throw new Error('Escrow is not in funded state');
    }

    const previousStatus = escrow.status;
    escrow.status = 'release_requested';
    escrow.updatedAt = Date.now();

    const requesterRole = this.getRole(escrow, params.requesterWallet);

    createTransaction(
      escrow.id,
      'release_requested',
      params.requesterWallet,
      escrow.escrow.walletAddress,
      escrow.amount,
      escrow.currency,
      { reason: params.reason || 'Release requested' }
    );

    createAuditEntry(
      escrow.id,
      'RELEASE_REQUESTED',
      params.requesterWallet,
      requesterRole || 'system',
      previousStatus,
      'release_requested',
      { reason: params.reason || 'No reason provided' }
    );

    const aadhaarRecord = recordToAadhaarChain(escrow);
    escrow.aadhaarChainTxHash = aadhaarRecord.txHash;

    if (this.events.onReleaseRequested) {
      this.events.onReleaseRequested(escrow);
    }

    return escrow;
  }

  async approveRelease(params: ApprovalParams): Promise<EscrowAccount> {
    const escrow = MOCK_ESCROWS.get(params.escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'release_requested') {
      throw new Error('Release has not been requested');
    }

    const role = this.getRole(escrow, params.approverWallet);
    if (!role) {
      throw new Error('Wallet is not authorized to approve');
    }

    const previousStatus = escrow.status;

    if (role === 'buyer') {
      escrow.buyer.approvalStatus = params.approved ? 'approved' : 'rejected';
      escrow.buyer.approvedAt = params.approved ? Date.now() : undefined;
    } else if (role === 'seller') {
      escrow.seller.approvalStatus = params.approved ? 'approved' : 'rejected';
      escrow.seller.approvedAt = params.approved ? Date.now() : undefined;
    } else if (role === 'escrow') {
      escrow.escrow.approvalStatus = params.approved ? 'approved' : 'rejected';
      escrow.escrow.approvedAt = params.approved ? Date.now() : undefined;
    }

    if (params.approved) {
      const allApproved =
        escrow.buyer.approvalStatus === 'approved' &&
        escrow.seller.approvalStatus === 'approved' &&
        escrow.escrow.approvalStatus === 'approved';

      if (allApproved) {
        escrow.status = 'approved';
      }
    } else {
      escrow.status = 'disputed';
    }

    escrow.updatedAt = Date.now();

    createTransaction(
      escrow.id,
      params.approved ? `${role}_approved` : `${role}_rejected`,
      params.approverWallet,
      escrow.escrow.walletAddress,
      escrow.amount,
      escrow.currency,
      { reason: params.reason || (params.approved ? 'Approved' : 'Rejected') }
    );

    createAuditEntry(
      escrow.id,
      params.approved ? 'RELEASE_APPROVED' : 'RELEASE_REJECTED',
      params.approverWallet,
      role,
      previousStatus,
      escrow.status,
      { reason: params.reason || (params.approved ? 'Approved' : 'Rejected') }
    );

    const aadhaarRecord = recordToAadhaarChain(escrow);
    escrow.aadhaarChainTxHash = aadhaarRecord.txHash;

    if (this.events.onApproved && params.approved) {
      this.events.onApproved(escrow, role);
    }

    return escrow;
  }

  async releaseFunds(params: ReleaseFundsParams): Promise<EscrowAccount> {
    const escrowAccount = Array.from(MOCK_ESCROWS.values()).find(
      (e) => e.id === params.escrowId
    );

    if (!escrowAccount) {
      throw new Error('Escrow not found');
    }

    if (escrowAccount.status !== 'approved') {
      throw new Error('Release has not been approved by all parties');
    }

    const previousStatus = escrowAccount.status;
    escrowAccount.status = 'released';
    escrowAccount.releasedAt = Date.now();
    escrowAccount.updatedAt = Date.now();

    createTransaction(
      escrowAccount.id,
      'released',
      escrowAccount.escrow.walletAddress,
      escrowAccount.seller.walletAddress,
      escrowAccount.amount,
      escrowAccount.currency
    );

    createAuditEntry(
      escrowAccount.id,
      'FUNDS_RELEASED',
      params.releaserWallet,
      'escrow',
      previousStatus,
      'released',
      { amount: escrowAccount.amount.toString() }
    );

    const aadhaarRecord = recordToAadhaarChain(escrowAccount);
    escrowAccount.aadhaarChainTxHash = aadhaarRecord.txHash;

    if (this.events.onReleased) {
      this.events.onReleased(escrowAccount);
    }

    return escrowAccount;
  }

  async cancelEscrow(params: CancelEscrowParams): Promise<EscrowAccount> {
    const escrowAccount = Array.from(MOCK_ESCROWS.values()).find(
      (e) => e.id === params.escrowId
    );

    if (!escrowAccount) {
      throw new Error('Escrow not found');
    }

    if (escrowAccount.status === 'released') {
      throw new Error('Cannot cancel released escrow');
    }

    const previousStatus = escrowAccount.status;
    escrowAccount.status = 'cancelled';
    escrowAccount.updatedAt = Date.now();

    createTransaction(
      escrowAccount.id,
      'cancelled',
      params.cancellerWallet,
      escrowAccount.buyer.walletAddress,
      escrowAccount.amount,
      escrowAccount.currency,
      { reason: params.reason || 'Cancelled' }
    );

    createAuditEntry(
      escrowAccount.id,
      'ESCROW_CANCELLED',
      params.cancellerWallet,
      this.getRole(escrowAccount, params.cancellerWallet) || 'system',
      previousStatus,
      'cancelled',
      { reason: params.reason || 'No reason provided' }
    );

    const aadhaarRecord = recordToAadhaarChain(escrowAccount);
    escrowAccount.aadhaarChainTxHash = aadhaarRecord.txHash;

    if (this.events.onCancelled) {
      this.events.onCancelled(escrowAccount);
    }

    return escrowAccount;
  }

  async disputeEscrow(params: DisputeEscrowParams): Promise<EscrowAccount> {
    const escrowAccount = Array.from(MOCK_ESCROWS.values()).find(
      (e) => e.id === params.escrowId
    );

    if (!escrowAccount) {
      throw new Error('Escrow not found');
    }

    const previousStatus = escrowAccount.status;
    escrowAccount.status = 'disputed';
    escrowAccount.updatedAt = Date.now();

    createTransaction(
      escrowAccount.id,
      'disputed',
      params.disputerWallet,
      escrowAccount.escrow.walletAddress,
      escrowAccount.amount,
      escrowAccount.currency,
      { reason: params.reason }
    );

    createAuditEntry(
      escrowAccount.id,
      'ESCROW_DISPUTED',
      params.disputerWallet,
      this.getRole(escrowAccount, params.disputerWallet) || 'system',
      previousStatus,
      'disputed',
      { reason: params.reason }
    );

    const aadhaarRecord = recordToAadhaarChain(escrowAccount);
    escrowAccount.aadhaarChainTxHash = aadhaarRecord.txHash;

    if (this.events.onDisputed) {
      this.events.onDisputed(escrowAccount);
    }

    return escrowAccount;
  }

  async getEscrow(escrowId: string): Promise<EscrowAccount | null> {
    return MOCK_ESCROWS.get(escrowId) || null;
  }

  async getEscrowsByWallet(walletAddress: string): Promise<EscrowAccount[]> {
    return Array.from(MOCK_ESCROWS.values()).filter(
      (e) =>
        e.buyer.walletAddress === walletAddress ||
        e.seller.walletAddress === walletAddress ||
        e.escrow.walletAddress === walletAddress
    );
  }

  async getTransactions(escrowId: string): Promise<EscrowTransaction[]> {
    return MOCK_TRANSACTIONS.get(escrowId) || [];
  }

  async getAuditTrail(escrowId: string): Promise<AuditTrailEntry[]> {
    return MOCK_AUDIT_TRAIL.get(escrowId) || [];
  }

  async getAadhaarChainRecord(recordId: string): Promise<AadhaarChainRecord | null> {
    return MOCK_AADHAAR_RECORDS.get(recordId) || null;
  }

  private getRole(
    escrow: EscrowAccount,
    walletAddress: string
  ): 'buyer' | 'seller' | 'escrow' | null {
    if (escrow.buyer.walletAddress === walletAddress) return 'buyer';
    if (escrow.seller.walletAddress === walletAddress) return 'seller';
    if (escrow.escrow.walletAddress === walletAddress) return 'escrow';
    return null;
  }

  async submitToBlockchain(escrow: EscrowAccount): Promise<string> {
    const mockSignature = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return mockSignature;
  }

  async verifyOnChainRecord(escrowId: string): Promise<boolean> {
    const escrow = MOCK_ESCROWS.get(escrowId);
    return !!escrow?.aadhaarChainTxHash;
  }
}

export function createEscrowService(
  endpoint: string = 'https://api.devnet.solana.com',
  events?: EscrowEvents
): EscrowService {
  const connection = new Connection(endpoint);
  return new EscrowService(connection, events);
}
