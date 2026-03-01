import { useState, useCallback, useEffect } from 'react';
import { createEscrowService, EscrowService } from '../services/escrowService';
import type {
  EscrowAccount,
  EscrowTransaction,
  AuditTrailEntry,
  CreateEscrowParams,
  FundEscrowParams,
  ReleaseRequestParams,
  ApprovalParams,
  ReleaseFundsParams,
  CancelEscrowParams,
  DisputeEscrowParams,
  EscrowEvents,
} from '../types/escrow';

let escrowServiceInstance: EscrowService | null = null;

function getEscrowService(): EscrowService {
  if (!escrowServiceInstance) {
    escrowServiceInstance = createEscrowService();
  }
  return escrowServiceInstance;
}

export interface UseEscrowReturn {
  escrow: EscrowAccount | null;
  loading: boolean;
  error: string | null;
  createEscrow: (params: CreateEscrowParams) => Promise<EscrowAccount>;
  fundEscrow: (params: FundEscrowParams) => Promise<EscrowAccount>;
  requestRelease: (params: ReleaseRequestParams) => Promise<EscrowAccount>;
  approveRelease: (params: ApprovalParams) => Promise<EscrowAccount>;
  releaseFunds: (params: ReleaseFundsParams) => Promise<EscrowAccount>;
  cancelEscrow: (params: CancelEscrowParams) => Promise<EscrowAccount>;
  disputeEscrow: (params: DisputeEscrowParams) => Promise<EscrowAccount>;
  refresh: () => Promise<void>;
}

export function useEscrow(escrowId?: string): UseEscrowReturn {
  const [escrow, setEscrow] = useState<EscrowAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getEscrowService();

  const refresh = useCallback(async () => {
    if (!escrowId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await service.getEscrow(escrowId);
      setEscrow(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch escrow');
    } finally {
      setLoading(false);
    }
  }, [escrowId, service]);

  useEffect(() => {
    if (escrowId) {
      refresh();
    }
  }, [escrowId, refresh]);

  const createEscrow = useCallback(
    async (params: CreateEscrowParams): Promise<EscrowAccount> => {
      setLoading(true);
      setError(null);
      try {
        const result = await service.createEscrow(params);
        setEscrow(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create escrow';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const fundEscrow = useCallback(
    async (params: FundEscrowParams): Promise<EscrowAccount> => {
      setLoading(true);
      setError(null);
      try {
        const result = await service.fundEscrow(params);
        setEscrow(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fund escrow';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const requestRelease = useCallback(
    async (params: ReleaseRequestParams): Promise<EscrowAccount> => {
      setLoading(true);
      setError(null);
      try {
        const result = await service.requestRelease(params);
        setEscrow(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to request release';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const approveRelease = useCallback(
    async (params: ApprovalParams): Promise<EscrowAccount> => {
      setLoading(true);
      setError(null);
      try {
        const result = await service.approveRelease(params);
        setEscrow(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve release';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const releaseFunds = useCallback(
    async (params: ReleaseFundsParams): Promise<EscrowAccount> => {
      setLoading(true);
      setError(null);
      try {
        const result = await service.releaseFunds(params);
        setEscrow(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to release funds';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const cancelEscrow = useCallback(
    async (params: CancelEscrowParams): Promise<EscrowAccount> => {
      setLoading(true);
      setError(null);
      try {
        const result = await service.cancelEscrow(params);
        setEscrow(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel escrow';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const disputeEscrow = useCallback(
    async (params: DisputeEscrowParams): Promise<EscrowAccount> => {
      setLoading(true);
      setError(null);
      try {
        const result = await service.disputeEscrow(params);
        setEscrow(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to dispute escrow';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  return {
    escrow,
    loading,
    error,
    createEscrow,
    fundEscrow,
    requestRelease,
    approveRelease,
    releaseFunds,
    cancelEscrow,
    disputeEscrow,
    refresh,
  };
}

export interface UseEscrowListReturn {
  escrows: EscrowAccount[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEscrowList(walletAddress?: string): UseEscrowListReturn {
  const [escrows, setEscrows] = useState<EscrowAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getEscrowService();

  const refresh = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      const result = await service.getEscrowsByWallet(walletAddress);
      setEscrows(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch escrows');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, service]);

  useEffect(() => {
    if (walletAddress) {
      refresh();
    }
  }, [walletAddress, refresh]);

  return { escrows, loading, error, refresh };
}

export interface UseEscrowTransactionsReturn {
  transactions: EscrowTransaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEscrowTransactions(escrowId?: string): UseEscrowTransactionsReturn {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getEscrowService();

  const refresh = useCallback(async () => {
    if (!escrowId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await service.getTransactions(escrowId);
      setTransactions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [escrowId, service]);

  useEffect(() => {
    if (escrowId) {
      refresh();
    }
  }, [escrowId, refresh]);

  return { transactions, loading, error, refresh };
}

export interface UseAuditTrailReturn {
  auditTrail: AuditTrailEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAuditTrail(escrowId?: string): UseAuditTrailReturn {
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getEscrowService();

  const refresh = useCallback(async () => {
    if (!escrowId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await service.getAuditTrail(escrowId);
      setAuditTrail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  }, [escrowId, service]);

  useEffect(() => {
    if (escrowId) {
      refresh();
    }
  }, [escrowId, refresh]);

  return { auditTrail, loading, error, refresh };
}
