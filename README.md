# ArtiX

## Overview

ArtiX is a blockchain-based project that leverages Uniswap V2 technology to provide decentralized exchange and liquidity provision capabilities with AI agents. The project combines smart contract infrastructure with backend services to create a comprehensive DeFi solution with AI.

## Project Structure

The project is organized into several key components:

- **UniswapV2-Fork**: A customized implementation of the Uniswap V2 protocol, providing the core exchange functionality.
- **Backend**: Server-side infrastructure that interfaces with the blockchain and provides API endpoints for the frontend and AI agent.
- **Agent**: Automated systems that interact with the protocol for various purposes such as liquidity management or arbitrage.
- **Scripts**: Utility scripts for deployment, testing, and maintenance.

## Environment Setup

The project requires several environment variables to be configured:

```
RPC_URL=            # RPC URL for the blockchain network
FACTORY_ADDRESS=    # UniswapV2 Factory contract address
ROUTER_ADDRESS=     # UniswapV2 Router contract address
WETH_ADDRESS=       # Wrapped ETH contract address
PRIVATE_KEY=        # Private key for transaction signing
PORT=               # Port for the backend server
```

An example configuration file (`example.env`) is provided as a template.

## Getting Started

1. Clone the repository
2. Copy `example.env` to `.env` and configure the environment variables
3. Install dependencies for each component
4. Deploy the smart contracts if needed
5. Start the backend server
6. Configure and run agents as required

## Components

### UniswapV2-Fork

This component contains the smart contracts that power the decentralized exchange functionality, including:

- Factory contract for creating token pair exchanges
- Router contract for executing trades
- Liquidity pool contracts

### Backend

The backend provides:

- API endpoints for interacting with the protocol
- Data indexing and querying capabilities
- User authentication and management
- Transaction monitoring and notifications

### Agent

The agent system includes:

- Automated market making strategies
- Liquidity provision management
- Market monitoring and analytics
- Arbitrage opportunity detection
- Swap strategies
- Chatting for about the DEX

## Development

For development purposes, the project uses a test network configuration by default. Production deployment requires additional security considerations and configuration changes.
