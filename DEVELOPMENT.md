# Development Guide

This guide explains the architecture, development practices, and how to extend the Stellar bulk payment system.

## Project Architecture

### Layered Design

The project follows a clean layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│           UI Layer (Web & CLI)                          │
│  (pages, components, cli/index.ts)                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│        Application Layer (API Routes)                   │
│  (app/api/batch-submit/route.ts)                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      Core Business Logic (lib/stellar/)                 │
│  - Types, Validation, Parsing, Batching, Services      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│     External Services (Stellar SDK)                     │
│  (stellar-sdk)                                          │
└─────────────────────────────────────────────────────────┘
```

### Core Library Modules

**types.ts**
- Defines all TypeScript interfaces
- Single source of truth for data structures
- No dependencies, pure types

**validator.ts**
- Input validation logic
- Validates payments, configuration, and batches
- Clear error messages for debugging
- Used by both CLI and Web UI

**parser.ts**
- Parses JSON and CSV files
- Flexible input handling
- Validates structure and format

**batcher.ts**
- Splits payments into transaction batches
- Respects Stellar's 100-operation limit
- Utility functions for asset parsing and summaries

**stellar-service.ts**
- Main service for Stellar operations
- Handles transaction building, signing, and submission
- Manages sequence numbers and error handling
- Returns structured results

## Key Design Decisions

### 1. No ORM or Additional Abstraction

The service directly uses `stellar-sdk` without intermediate layers. This keeps the code simple and maintainable.

### 2. Separation of Concerns

- **Input Parsing**: Handled separately from validation
- **Validation**: Independent of business logic
- **Batching**: Pure function with no side effects
- **Stellar Operations**: Isolated in StellarService

### 3. Structured Results

All operations return structured result objects rather than throwing exceptions. This allows:
- Partial success reporting (some payments succeed, others fail)
- Detailed error information per recipient
- Easy JSON serialization

### 4. Environment-Based Configuration

Secret keys come from environment variables, never from configuration files. This enforces security best practices.

## Adding New Features

### Adding a New Asset Type Handler

If you need special handling for a specific asset:

1. Update `batcher.ts` parseAsset() function
2. Add validation in `validator.ts`
3. Update type definitions in `types.ts`
4. Add tests in `tests/`

### Adding Rate Limiting

To add rate limiting per account:

1. Create `lib/stellar/rate-limiter.ts`
2. Track submission times per public key
3. Return error if limit exceeded
4. Update StellarService to use it

### Adding Database Support

For production deployments wanting to track batch history:

1. Create `lib/stellar/persistence.ts`
2. Use database adapter pattern
3. Store results before returning to user
4. Add endpoint to retrieve historical results

### Adding Multi-Signature Support

For advanced security:

1. Create `lib/stellar/multisig.ts`
2. Handle multiple signers
3. Update transaction signing in StellarService
4. Add configuration for signers

## Testing Strategy

### Unit Tests

Test individual functions in isolation:

```typescript
// Test validator
validatePaymentInstruction(...)
validatePaymentInstructions(...)

// Test parser
parseJSON(...)
parseCSV(...)

// Test batcher
createBatches(...)
getBatchSummary(...)
```

### Integration Tests

Test the full flow with mock Stellar server:

```typescript
// Would require mocking stellar-sdk
const service = new StellarService(config);
const result = await service.submitBatch(payments);
// Assert result structure
```

### Manual Testing

1. **CLI Testing**:
   ```bash
   STELLAR_SECRET_KEY="..." node cli/index.ts \
     --input examples/payments.json \
     --network testnet
   ```

2. **Web UI Testing**:
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Upload test file
   ```

3. **Testnet Validation**:
   - Create testnet account at friendbot.stellar.org
   - Fund it with test lumens
   - Run against testnet
   - Verify transactions on https://stellar.expert/explorer/testnet

## Code Quality Guidelines

### Naming Conventions

- **Functions**: `camelCase`, verbs for actions (`validatePayment`, `createBatch`)
- **Variables**: `camelCase`, nouns for data
- **Types**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Comments

Write comments for:
- Complex algorithms (e.g., sequence number management)
- Why, not what (code shows what it does)
- Edge cases and limitations
- Transaction building logic

### Error Handling

- Throw errors for programmer mistakes (invalid config)
- Return errors in results for user input issues
- Provide context in error messages
- Include what was expected and what was received

### Validation

- Validate at entry points (parseInput, API routes)
- Validate early, fail fast
- Provide specific error messages for each field
- Test validation with both valid and invalid inputs

## Performance Considerations

### Sequence Number Management

The current implementation increments sequence numbers in memory. For production:

```typescript
// Current approach (in-memory)
let sequenceNumber = BigInt(sourceAccount.sequenceNumber);

// Production approach
// - Use database to track sequence numbers
// - Or implement read-modify-write with retry logic
```

### Batch Size Optimization

Current implementation uses hardcoded max of 100 operations. Consider:

```typescript
// Could be configurable based on fee market
const maxOps = network === 'testnet' ? 100 : 50;
```

### Error Retry Logic

Consider implementing retry for transient failures:

```typescript
async submitWithRetry(transaction, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await this.submitTransaction(transaction);
    } catch (error) {
      if (isTransientError(error) && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000); // exponential backoff
      } else {
        throw;
      }
    }
  }
}
```

## Debugging

### Enable Debug Logging

Add to `stellar-service.ts`:

```typescript
private log(message: string, data?: any) {
  if (process.env.DEBUG) {
    console.error(`[StellarService] ${message}`, data);
  }
}
```

### Inspect Transactions

Before submitting:

```typescript
const transactionEnvelope = transaction.toXDR();
console.log('Transaction XDR:', transactionEnvelope);
```

### Monitor Stellar Network

- **Testnet Explorer**: https://stellar.expert/explorer/testnet
- **Mainnet Explorer**: https://stellar.expert/explorer/public
- **Horizon API**: https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structure

## Deployment Checklist

- [ ] All tests pass
- [ ] No console.log statements (use proper logging)
- [ ] Environment variables documented
- [ ] Rate limiting configured
- [ ] Error messages don't expose internal details
- [ ] Testnet validation completed
- [ ] Monitoring/alerting configured
- [ ] Backup and recovery plan in place
- [ ] Security review completed

## Security Best Practices

1. **Secret Key Management**
   - Never log secret keys
   - Always use environment variables
   - Consider using secret management service

2. **Input Validation**
   - Validate all external input
   - Check transaction limits
   - Verify addresses are valid Stellar keys

3. **Error Messages**
   - Don't reveal internal details
   - Don't expose secrets in errors
   - Log detailed info server-side only

4. **Transaction Safety**
   - Always use sequence numbers
   - Implement idempotency if needed
   - Consider transaction timeouts

5. **Network Security**
   - Use HTTPS for web UI
   - Validate Stellar server certificates
   - Use testnet for development

## Troubleshooting

### "Account does not exist" Error

The account hasn't been funded yet.
- Testnet: Use friendbot.stellar.org
- Mainnet: Fund with at least 1 XLM

### "tx_bad_seq" Error

Sequence number mismatch. Likely causes:
- Multiple submissions in parallel
- Account state changed between reads
- Need to implement sequence number tracking

### "op_no_destination" Error

Recipient address is invalid:
- Check Stellar address format
- Verify address exists and is funded

### Large Batch Timeouts

Batch is too large for single transaction:
- Reduce `maxOperationsPerTransaction`
- Split into multiple batches
- Consider network congestion

## Future Improvements

1. **Event Sourcing**: Store all actions for audit trail
2. **WebSocket Support**: Real-time progress updates
3. **GraphQL API**: More flexible querying
4. **Multi-language SDKs**: Python, Go, Rust versions
5. **Scheduler**: Automated batch submissions at intervals
6. **Analytics Dashboard**: Track batch history and metrics
