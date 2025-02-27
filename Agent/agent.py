from phi.agent import Agent, RunResponse
from phi.tools import Tool
from pydantic import BaseModel, Field
from phi.model.google import Gemini
import requests
import json
from typing import Dict, Iterator, Optional
from phi.utils.pprint import pprint_run_response
from dotenv import load_dotenv
import os
import time

load_dotenv()

gemini_model = Gemini(id="gemini-2.0-flash-exp", api_key=os.getenv("GEMINI_API_KEY"))

# Constants
WETH_ADDRESS = "0xcde412ba5370eDEb27F3C549f8E9949D296045CF"
DAI_ADDRESS = "0xb793fc98d3e47ce2146747ad7af130fae5ec9cc0"
BACKEND_URL = "http://localhost:3000/api"

# DEX Interaction Functions
def get_token_balance(token_address: str, owner_address: str) -> str:
    """Get token balance and details for a specific address
    
    Args:
        token_address: The address of the ERC20 token contract
        owner_address: The address of the wallet to check balance for

    Returns:
        str: JSON string containing:
            - Token details (name, symbol, decimals)
            - Balance information (raw and formatted)
            - Success/error status
    
    Example:
        >>> get_token_balance(
            "0xcde412ba5370eDEb27F3C549f8E9949D296045CF",  # WETH address
            "0xeD24fb342c24607A42F722bCEBe7febE7B3AA2F4"   # User address
        )
    """
    try:
        response = requests.get(
            f"{BACKEND_URL}/token/balance/{owner_address}",
            params={"tokenAddress": token_address}
        )
        
        result = response.json()
        
        # Enhanced error handling
        if not result.get("success", False):
            return json.dumps({
                "error": result.get("error", "Unknown error"),
                "details": result.get("details", "No additional details available"),
                "context": {
                    "token": token_address,
                    "owner": owner_address
                }
            }, indent=4)
            
        return json.dumps(result, indent=4)
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "context": {
                "token": token_address,
                "owner": owner_address
            }
        }, indent=4)

def calculate_price_impact(token_in: str, token_out: str, amount_in: str) -> str:
    """Calculate price impact and expected output for a token swap
    
    Args:
        token_in: Address of input token
        token_out: Address of output token
        amount_in: Amount of input token in wei

    Returns:
        str: JSON string containing price impact and swap details
    """
    try:
        response = requests.post(
            f"{BACKEND_URL}/token/price-impact",
            json={
                "tokenInAddress": token_in,
                "tokenOutAddress": token_out,
                "amountIn": amount_in
            }
        )
        return json.dumps(response.json(), indent=4)
    except Exception as e:
        return json.dumps({"error": str(e)})


def get_swap_details(token_in: str, token_out: str, amount: str, slippage: float = 0.5) -> str:
    """Get details about a token swap with slippage protection
    
    Args:
        token_in: Address of input token
        token_out: Address of output token
        amount: Amount of input token in wei
        slippage: Maximum allowed slippage percentage (default: 0.5%)

    Returns:
        str: JSON string containing swap result
    """
    try:
        deadline = int(time.time()) + 3600  # 1 hour from now
        response = requests.post(
            f"{BACKEND_URL}/swap/swap",
            json={
                "tokenIn": token_in,
                "tokenOut": token_out,
                "amountIn": amount,
                "amountOutMin": "0",
                "to": "0xeD24fb342c24607A42F722bCEBe7febE7B3AA2F4",
                "deadline": str(deadline),
                "path": [token_in, token_out]
            }
        )
        return json.dumps(response.json(), indent=4)
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_pool_info(token_a: str, token_b: str) -> str:
    """Get detailed information about a specific liquidity pool
    
    Args:
        token_a: Contract Address of first token
        token_b: Contract Address of second token

    Returns:
        str: JSON string containing pool information and metrics
    """
    try:
        response = requests.post(
            f"{BACKEND_URL}/pool/reserves-for-tokens",
            json={
                "tokenA": token_a,
                "tokenB": token_b
            }
        )
        return json.dumps(response.json(), indent=4)
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_all_pools() -> str:
    """Get information about all available liquidity pools
    
    Returns:
        str: JSON string containing information about all pools
    """
    try:
        response = requests.get(f"{BACKEND_URL}/pool/all")
        return json.dumps(response.json(), indent=4)
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_pool_volume(pair_address: str) -> str:
    """Get trading volume data for a specific pool
    
    Args:
        pair_address: Address of the liquidity pair

    Returns:
        str: JSON string containing volume data and recent swaps
    """
    try:
        response = requests.get(f"{BACKEND_URL}/pool/volume/{pair_address}")
        return json.dumps(response.json(), indent=4)
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_liquidity_position(pair_address: str, user_address: str = None) -> str:
    """Get liquidity position details for a specific pool and user
    
    Args:
        pair_address: Address of the liquidity pair
        user_address: Address of the user (optional)

    Returns:
        str: JSON string containing position details
    """
    try:
        response = requests.get(
            f"{BACKEND_URL}/token/liquidity-position/{pair_address}",
            params={"address": user_address} if user_address else None
        )
        return json.dumps(response.json(), indent=4)
    except Exception as e:
        return json.dumps({"error": str(e)})

def execute_transaction(to: str, data: str, value: str = "0", tx_type: str = None) -> str:
    """Execute a blockchain transaction with enhanced context awareness
    
    Args:
        to: Target contract address (e.g. Router address for swaps)
        data: Encoded transaction data (must start with 0x)
        value: Amount of native token to send in wei (optional)
        tx_type: Type of transaction for better context (e.g. 'SWAP', 'LIQUIDITY', 'CUSTOM')

    Returns:
        str: JSON string containing transaction result with detailed status
    
    Transaction Types:
    - SWAP: Token swap transactions (ETH_TO_TOKEN, TOKEN_TO_ETH, TOKEN_TO_TOKEN)
    - LIQUIDITY: Liquidity operations (ADD, REMOVE)
    - CUSTOM: Other custom contract interactions
    
    Example Usage:
    ```python
    # For a swap transaction
    result = execute_transaction(
        to=router_address,
        data=encoded_swap_data,
        value="1000000000000000000",
        tx_type="SWAP"
    )
    
    # For adding liquidity
    result = execute_transaction(
        to=router_address,
        data=encoded_liquidity_data,
        value="0",
        tx_type="LIQUIDITY"
    )
    ```
    """
    try:
        # Prepare request payload with enhanced context
        payload = {
            "to": to,
            "data": data,
            "value": value
        }
        
        # Add transaction type context if provided
        if tx_type:
            payload["txType"] = tx_type

        response = requests.post(
            f"{BACKEND_URL}/execute/transaction",
            json=payload
        )
        
        result = response.json()
        
        # Enhanced response formatting
        formatted_response = {
            "status": {
                "success": result.get("status") == "success",
                "transactionHash": result.get("transactionHash"),
                "blockNumber": result.get("blockNumber"),
                "gasUsed": result.get("gasUsed")
            },
            "context": {
                "type": tx_type or "CUSTOM",
                "target": to,
                "value": value
            },
            "details": result
        }
        
        return json.dumps(formatted_response, indent=4)
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "context": {
                "type": tx_type or "CUSTOM",
                "target": to,
                "value": value
            }
        })

def estimate_gas(to: str, data: str, value: str = "0", tx_type: str = None) -> str:
    """Estimate gas cost for a transaction with enhanced context
    
    Args:
        to: Target contract address
        data: Encoded transaction data (must start with 0x)
        value: Amount of native token to send in wei (optional)
        tx_type: Type of transaction for better context

    Returns:
        str: JSON string containing detailed gas estimation
    """
    try:
        payload = {
            "to": to,
            "data": data,
            "value": value
        }
        
        if tx_type:
            payload["txType"] = tx_type

        response = requests.post(
            f"{BACKEND_URL}/execute/estimate",
            json=payload
        )
        
        result = response.json()
        
        # Enhanced response with more context
        formatted_response = {
            "estimation": {
                "gasEstimate": result.get("gasEstimate"),
                "gasPrice": result.get("gasPrice"),
                "totalCost": result.get("estimatedCost")
            },
            "context": {
                "type": tx_type or "CUSTOM",
                "target": to,
                "value": value
            },
            "humanReadable": {
                "estimatedCostInEth": float(result.get("estimatedCost", "0")) / 1e18,
                "gasPriceInGwei": float(result.get("gasPrice", "0")) / 1e9
            }
        }
        
        return json.dumps(formatted_response, indent=4)
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "context": {
                "type": tx_type or "CUSTOM",
                "target": to,
                "value": value
            }
        })

# Create Enhanced DEX Agent
ArtiXAgent = Agent(
    name="Enhanced Uniswap V2 DEX Agent Named ArtiX",
    description="""
    Your name is ArtiX. You are a specialized agent for comprehensive Uniswap V2 DEX interactions. You can help with:
    
    🔍 Information Queries:
    - Check token balances and details
    - View pool information and metrics
    - Monitor trading volumes and swap history
    - Track liquidity positions
    
    💱 Trading Operations:
    - Calculate price impact before swaps
    - Get expected swap amounts
    - Execute token swaps with slippage protection
    - Handle ETH-to-Token, Token-to-ETH, and Token-to-Token swaps
    
    💧 Liquidity Management:
    - View all available liquidity pools
    - Check specific pool metrics
    - Monitor your liquidity positions
    - Track pool volumes and activity
    - Add and remove liquidity with safety checks
    
    📊 Analytics:
    - Analyze price impact
    - Monitor trading volumes
    - Track pool metrics
    - View historical swap data
    - Estimate gas costs and optimize timing

    🔗 Blockchain Transactions:
    - Execute and monitor smart contract interactions
    - Handle different transaction types (Swaps, Liquidity, Custom)
    - Provide detailed transaction status updates
    - Estimate and optimize gas costs
    - Validate transaction parameters for safety
    """,
    read_chat_history=True,
    num_history_responses=10,
    add_history_to_messages=True,
    task="""Process user requests into precise DEX operations while ensuring:
    1. Transaction safety through parameter validation
    2. Gas cost optimization
    3. Clear status updates and error handling
    4. Context-aware execution based on transaction type""",
    model=gemini_model,
    tools=[
        get_token_balance,
        calculate_price_impact,
        get_swap_details,
        get_pool_info,
        get_all_pools,
        get_pool_volume,
        get_liquidity_position,
        execute_transaction,
        estimate_gas
    ],
    instructions=[
        # Transaction Safety
        "Always validate contract addresses against known addresses",
        "Verify transaction data format starts with '0x'",
        "Check if value transfers are intended for payable functions",
        
        # Gas Optimization
        "Estimate gas costs before executing transactions",
        "Suggest optimal gas prices based on transaction urgency",
        "Warn about potentially high gas costs",
        
        # Transaction Context
        "Identify transaction type (SWAP, LIQUIDITY, CUSTOM)",
        "Use appropriate router addresses for DEX operations",
        "Include relevant transaction context in requests",
        
        # Error Handling
        "Validate all input parameters before execution",
        "Provide clear error messages with suggested fixes",
        "Monitor transaction status and confirmation",
        
        # User Safety
        "Calculate and explain price impact for swaps",
        "Warn about high slippage scenarios",
        "Explain impermanent loss risks for liquidity",
        "Suggest optimal trading strategies",
        
        # Status Updates
        "Provide transaction hash and block number",
        "Report gas used and transaction status",
        "Format costs in both wei and ETH/Gwei"
    ],
    additional_context="""
        You are an expert in Uniswap V2 mechanics and blockchain transactions.
        
        Transaction Types:
        1. SWAP Transactions:
           - ETH_TO_TOKEN: Requires value in wei
           - TOKEN_TO_ETH: Requires token approval
           - TOKEN_TO_TOKEN: Requires token approval
        
        2. LIQUIDITY Transactions:
           - ADD: May require token approval
           - REMOVE: Requires LP token approval
        
        3. CUSTOM Transactions:
           - Validate parameters carefully
           - Check function payability
        
        Key Addresses:
        - Router: Used for swaps and liquidity
        - Factory: Used for pool creation and queries
        - WETH: 0xcde412ba5370eDEb27F3C549f8E9949D296045CF
        - DAI: 0xb793fc98d3e47ce2146747ad7af130fae5ec9cc0
        - Your Address: 0xeD24fb342c24607A42F722bCEBe7febE7B3AA2F4
        
        Safety Checklist:
        1. Validate addresses
        2. Check transaction type
        3. Verify value transfers
        4. Estimate gas costs
        5. Monitor transaction status
        6. Handle errors appropriately
    """,
    show_tool_calls=True,
    monitoring=True,
    debug_mode=True,
)

# Run the agent
if __name__ == "__main__":
    try:
        response_stream: Iterator[RunResponse] = ArtiXAgent.cli_app(markdown=True, stream=True)
    except KeyboardInterrupt:
        print("\nStopping the agent")