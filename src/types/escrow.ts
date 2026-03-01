export type EscrowStatus =
  | 'pending'
  | 'funded'
  | 'release_requested'
  | 'approved'
  | 'released'
  | 'cancelled'
  | 'disputed';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface EscrowParty {
  walletAddress: string;
  aadhaarHash?: string;
  role: 'buyer' | 'seller' | 'escrow';
  name: string;
  approvalStatus: ApprovalStatus;
  approvedAt?: number;
}

export interface EscrowTransaction {
  id: string;
  escrowId: string;
  action: 'created' | 'funded' | 'release_requested' | 'buyer_approved' | 'seller_approved' | 'escrow_approved' | 'released' | 'cancelled' | 'disputed' | 'refunded';
  from: string;
  to: string;
  amount: number;
  currency: string;
  timestamp: number;
  signature?: string;
  blockHash?: string;
  metadata?: Record<string, string>;
}

export interface EscrowAccount {
  id: string;
  orderId: string;
  status: EscrowStatus;
  amount: number;
  currency: string;
  buyer: EscrowParty;
  seller: EscrowParty;
  escrow: EscrowParty;
  createdAt: number;
  updatedAt: number;
  releasedAt?: number;
  aadhaarChainTxHash?: string;
  onChainRecordId?: string;
  transactions: EscrowTransaction[];
  metadata?: Record<string, string>;
}

export interface CreateEscrowParams {
  orderId: string;
  amount: number;
  currency: string;
  buyerWallet: string;
  buyerAadhaarHash?: string;
  buyerName: string;
  sellerWallet: string;
  sellerAadhaarHash?: string;
  sellerName: string;
  escrowWallet: string;
  escrowName: string;
}

export interface FundEscrowParams {
  escrowId: string;
  payerWallet: string;
  amount: number;
}

export interface ReleaseRequestParams {
  escrowId: string;
  requesterWallet: string;
  reason?: string;
}

export interface ApprovalParams {
  escrowId: string;
  approverWallet: string;
  approved: boolean;
  reason?: string;
}

export interface ReleaseFundsParams {
  escrowId: string;
  releaserWallet: string;
}

export interface CancelEscrowParams {
  escrowId: string;
  cancellerWallet: string;
  reason?: string;
}

export interface DisputeEscrowParams {
  escrowId: string;
  disputerWallet: string;
  reason: string;
}

export interface EscrowEvents {
  onFunded?: (escrow: EscrowAccount) => void;
  onReleaseRequested?: (escrow: EscrowAccount) => void;
  onApproved?: (escrow: EscrowAccount, approverRole: 'buyer' | 'seller' | 'escrow') => void;
  onReleased?: (escrow: EscrowAccount) => void;
  onCancelled?: (escrow: EscrowAccount) => void;
  onDisputed?: (escrow: EscrowAccount) => void;
}

export interface AadhaarChainRecord {
  id: string;
  txHash: string;
  escrowId: string;
  parties: string[];
  amount: number;
  status: string;
  timestamp: number;
  blockNumber: number;
}

export interface AuditTrailEntry {
  id: string;
  escrowId: string;
  action: string;
  actor: string;
  actorRole: 'buyer' | 'seller' | 'escrow' | 'system';
  timestamp: number;
  previousState: EscrowStatus;
  newState: EscrowStatus;
  details: Record<string, string>;
  signature?: string;
  aadhaarChainTxHash?: string;
}
