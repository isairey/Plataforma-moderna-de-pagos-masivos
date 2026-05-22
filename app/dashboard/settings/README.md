# Settings Page

This page implements the Wallet Connection and Payment Preferences sections based on the Figma design.

## Features

### Wallet Connection

- Real-time wallet connection status (Connected/Disconnected)
- Network display (Testnet/Mainnet)
- Wallet address display with copy functionality
- Connect wallet button (when disconnected)
- Switch wallet functionality
- Disconnect wallet functionality
- Integration with Freighter wallet via `useFreighter` hook

### Payment Preferences

- Default Network selector (Testnet/Mainnet)
- Default Asset selector (XLM, USDC, USDT)
- Batch Validation toggle - validates recipients before processing
- Completion Notifications toggle - notifies when batches complete

## Components Used

- `Card` - Container for sections
- `Button` - Action buttons
- `Switch` - Toggle switches for preferences
- `Select` - Dropdown selectors
- `useFreighter` - Wallet connection hook
- `useToast` - Toast notifications

## Styling

- Dark theme with slate color palette
- Emerald accent color for active states
- Responsive layout with max-width container
- Consistent spacing and typography
