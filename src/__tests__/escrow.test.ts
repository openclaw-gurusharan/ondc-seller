import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEscrowService, EscrowService } from '../services/escrowService';

describe('EscrowService', () => {
  let service: EscrowService;

  const TEST_BUYER_WALLET = 'Buyer1111111111111111111111111111111';
  const TEST_SELLER_WALLET = 'Seller1111111111111111111111111111111';
  const TEST_ESCROW_WALLET = 'Escrow1111111111111111111111111111111';
  const TEST_ORDER_ID = 'order_123456';
  const TEST_AMOUNT = 10000;
  const TEST_CURRENCY = 'INR';

  beforeEach(() => {
    service = createEscrowService();
  });

  describe('createEscrow', () => {
    it('should create a new escrow with pending status', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      expect(escrow).toBeDefined();
      expect(escrow.id).toBeDefined();
      expect(escrow.orderId).toBe(TEST_ORDER_ID);
      expect(escrow.status).toBe('pending');
      expect(escrow.amount).toBe(TEST_AMOUNT);
      expect(escrow.currency).toBe(TEST_CURRENCY);
      expect(escrow.buyer.walletAddress).toBe(TEST_BUYER_WALLET);
      expect(escrow.seller.walletAddress).toBe(TEST_SELLER_WALLET);
      expect(escrow.escrow.walletAddress).toBe(TEST_ESCROW_WALLET);
      expect(escrow.buyer.approvalStatus).toBe('pending');
      expect(escrow.seller.approvalStatus).toBe('pending');
      expect(escrow.escrow.approvalStatus).toBe('pending');
      expect(escrow.transactions.length).toBeGreaterThan(0);
    });

    it('should create an Aadhaar chain record for the escrow', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      expect(escrow.aadhaarChainTxHash).toBeDefined();
      expect(escrow.onChainRecordId).toBeDefined();
    });
  });

  describe('fundEscrow', () => {
    it('should fund an escrow and change status to funded', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      const fundedEscrow = await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      expect(fundedEscrow.status).toBe('funded');
      expect(fundedEscrow.aadhaarChainTxHash).toBeDefined();
    });

    it('should throw error when funding non-pending escrow', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      await expect(
        service.fundEscrow({
          escrowId: escrow.id,
          payerWallet: TEST_BUYER_WALLET,
          amount: TEST_AMOUNT,
        })
      ).rejects.toThrow('Escrow is not in pending state');
    });
  });

  describe('requestRelease', () => {
    it('should request release for funded escrow', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      const releaseRequested = await service.requestRelease({
        escrowId: escrow.id,
        requesterWallet: TEST_SELLER_WALLET,
        reason: 'Order completed',
      });

      expect(releaseRequested.status).toBe('release_requested');
      expect(releaseRequested.aadhaarChainTxHash).toBeDefined();
    });

    it('should throw error when requesting release on non-funded escrow', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await expect(
        service.requestRelease({
          escrowId: escrow.id,
          requesterWallet: TEST_SELLER_WALLET,
        })
      ).rejects.toThrow('Escrow is not in funded state');
    });
  });

  describe('multi-party approval workflow', () => {
    it('should require approval from all three parties to release funds', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      await service.requestRelease({
        escrowId: escrow.id,
        requesterWallet: TEST_SELLER_WALLET,
      });

      const buyerApproved = await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_BUYER_WALLET,
        approved: true,
      });
      expect(buyerApproved.buyer.approvalStatus).toBe('approved');
      expect(buyerApproved.status).toBe('release_requested');

      const sellerApproved = await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_SELLER_WALLET,
        approved: true,
      });
      expect(sellerApproved.seller.approvalStatus).toBe('approved');
      expect(sellerApproved.status).toBe('release_requested');

      const escrowApproved = await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_ESCROW_WALLET,
        approved: true,
      });
      expect(escrowApproved.escrow.approvalStatus).toBe('approved');
      expect(escrowApproved.status).toBe('approved');
    });

    it('should mark escrow as disputed if any party rejects', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      await service.requestRelease({
        escrowId: escrow.id,
        requesterWallet: TEST_SELLER_WALLET,
      });

      const rejected = await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_BUYER_WALLET,
        approved: false,
        reason: 'Items not as described',
      });

      expect(rejected.status).toBe('disputed');
      expect(rejected.buyer.approvalStatus).toBe('rejected');
    });
  });

  describe('releaseFunds', () => {
    it('should release funds when all parties approve', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      await service.requestRelease({
        escrowId: escrow.id,
        requesterWallet: TEST_SELLER_WALLET,
      });

      await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_BUYER_WALLET,
        approved: true,
      });

      await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_SELLER_WALLET,
        approved: true,
      });

      await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_ESCROW_WALLET,
        approved: true,
      });

      const released = await service.releaseFunds({
        escrowId: escrow.id,
        releaserWallet: TEST_ESCROW_WALLET,
      });

      expect(released.status).toBe('released');
      expect(released.releasedAt).toBeDefined();
      expect(released.aadhaarChainTxHash).toBeDefined();
    });

    it('should throw error when releasing without full approval', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      await service.requestRelease({
        escrowId: escrow.id,
        requesterWallet: TEST_SELLER_WALLET,
      });

      await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_BUYER_WALLET,
        approved: true,
      });

      await expect(
        service.releaseFunds({
          escrowId: escrow.id,
          releaserWallet: TEST_ESCROW_WALLET,
        })
      ).rejects.toThrow('Release has not been approved by all parties');
    });
  });

  describe('cancelEscrow', () => {
    it('should cancel a funded escrow', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      const cancelled = await service.cancelEscrow({
        escrowId: escrow.id,
        cancellerWallet: TEST_BUYER_WALLET,
        reason: 'Order cancelled by buyer',
      });

      expect(cancelled.status).toBe('cancelled');
    });

    it('should throw error when cancelling released escrow', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      await service.requestRelease({
        escrowId: escrow.id,
        requesterWallet: TEST_SELLER_WALLET,
      });

      await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_BUYER_WALLET,
        approved: true,
      });

      await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_SELLER_WALLET,
        approved: true,
      });

      await service.approveRelease({
        escrowId: escrow.id,
        approverWallet: TEST_ESCROW_WALLET,
        approved: true,
      });

      await service.releaseFunds({
        escrowId: escrow.id,
        releaserWallet: TEST_ESCROW_WALLET,
      });

      await expect(
        service.cancelEscrow({
          escrowId: escrow.id,
          cancellerWallet: TEST_BUYER_WALLET,
        })
      ).rejects.toThrow('Cannot cancel released escrow');
    });
  });

  describe('disputeEscrow', () => {
    it('should allow disputing a release-requested escrow', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      await service.requestRelease({
        escrowId: escrow.id,
        requesterWallet: TEST_SELLER_WALLET,
      });

      const disputed = await service.disputeEscrow({
        escrowId: escrow.id,
        disputerWallet: TEST_BUYER_WALLET,
        reason: 'Quality issues with products',
      });

      expect(disputed.status).toBe('disputed');
      expect(disputed.aadhaarChainTxHash).toBeDefined();
    });
  });

  describe('transaction history and audit trail', () => {
    it('should track all transactions in escrow', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      await service.requestRelease({
        escrowId: escrow.id,
        requesterWallet: TEST_SELLER_WALLET,
      });

      const transactions = await service.getTransactions(escrow.id);
      expect(transactions.length).toBeGreaterThanOrEqual(3);
      expect(transactions[0].action).toBe('created');
      expect(transactions[1].action).toBe('funded');
      expect(transactions[2].action).toBe('release_requested');
    });

    it('should maintain audit trail with full history', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      await service.fundEscrow({
        escrowId: escrow.id,
        payerWallet: TEST_BUYER_WALLET,
        amount: TEST_AMOUNT,
      });

      const auditTrail = await service.getAuditTrail(escrow.id);
      expect(auditTrail.length).toBeGreaterThan(0);
      expect(auditTrail[0].action).toBe('ESCROW_CREATED');
      expect(auditTrail[1].action).toBe('ESCROW_FUNDED');
    });
  });

  describe('on-chain verification', () => {
    it('should verify on-chain record exists', async () => {
      const escrow = await service.createEscrow({
        orderId: TEST_ORDER_ID,
        amount: TEST_AMOUNT,
        currency: TEST_CURRENCY,
        buyerWallet: TEST_BUYER_WALLET,
        buyerName: 'Test Buyer',
        sellerWallet: TEST_SELLER_WALLET,
        sellerName: 'Test Seller',
        escrowWallet: TEST_ESCROW_WALLET,
        escrowName: 'Test Escrow',
      });

      const verified = await service.verifyOnChainRecord(escrow.id);
      expect(verified).toBe(true);
    });

    it('should return false for non-existent on-chain record', async () => {
      const verified = await service.verifyOnChainRecord('non_existent_escrow');
      expect(verified).toBe(false);
    });
  });
});
