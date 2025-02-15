import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FEE_TO_SETTER = "0x4347c8f4913D87a9E8AFA827B4871940c9bAce79"; // Fee address

export default buildModule("UniswapV2Deployment", (m) => {
    // Deploy UniswapV2Factory
    const factory = m.contract("UniswapV2Factory", [FEE_TO_SETTER]);

    // Deploy WETH
    const weth = m.contract("WETH9");

    // Deploy Router with factory and WETH addresses
    const router = m.contract(
        "UniswapV2Router02",
        [factory, weth],
        { after: [factory, weth] }
    );

    return { factory, weth, router };
});