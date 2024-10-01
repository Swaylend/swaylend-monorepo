<div align="center" id="logo">

![SwayLend](assets/svg/logo.svg)

<h3>SwayLend ⛽️⚡️</h3>

<h4>The First Lending Protocol on Fuel Network</h4>

</div>

<h6 align="center">
  <a target="_blank" href="https://swaylend.com">Website</a>
  ·
  <a target="_blank" href="https://docs.swaylend.com/">Docs</a>
  ·
  <a target="_blank" href="https://x.com/swaylend">Twitter</a>
</h6>

# Introduction

SwayLend is a decentralized lending platform operating on the [Fuel Network](https://fuel.network), which utilizes an Ethereum consensus layer. Our platform offers a secure and trustworthy environment for crypto users to earn passive income by supplying liquidity to the market.

With SwayLend, users can supply up to six different crypto assets as collateral and borrow USDC, the base asset. Suppliers earn passive income by providing liquidity, while borrowers can borrow in either an overcollateralized (perpetually) or undercollateralized manner.

The SwayLend protocol is built on a re-engineered solution from the Ethereum blockchain, rewritten in the Sway programming language. Our platform reimagines the [Compound](https://compound.finance/) architecture, offering all its features and benefits with the added security and stability of the [Fuel Network](https://fuel.network). Our dedicated team continuously monitors and improves the platform, always available to answer questions or provide support.

SwayLend is live at [https://swaylend.com](https://swaylend.com).

> ⚠️ Warning: Please note that SwayLend is in the alpha testing phase, and contracts may change in the future, leading to potential loss of supply/borrow amounts.

# Project Structure

At the first level, the monorepo is divided into `contracts` , `apps` , `scripts` , and `libs` .

* [`abis`](/abis/): Contains ABI (Application Binary Interface) files, specifically for the market contract.
* [`apps`](/apps/): Houses different applications related to the project:
  + `frontend`: Frontend interface for SwayLend.
  + `indexer`: Envio indexer for the Market contract.
  + `indexer-sentio`: Sentio indexer for the Market contract.
* [`contracts`](/contracts/): Contains smart contracts for various functionalities:
  + `market`: The main market contract.
  + `pyth-mock`: Mock contract for Pyth oracle, used in tests.
  + `src-20`: SRC-20 contract, SLEND governance token.
  + `token`: Token contract, used in tests.
* [`libs`](/libs/): Includes shared libraries used across the project:
  + `market_sdk`: Custom SDK for interacting with the market contract, used in tests.
  + `pyth_mock_sdk`: Custom SDK for the Pyth mock contract, used in tests.
  + `token_sdk`: Custom SDK for the token contract, used in tests.
* [`scripts`](/scripts/): Contains scripts for various network operations:
  + `devnet`: Scripts related to the local development network.
  + `testnet`: Scripts related to the public test network.
 

> ℹ️ Note: The instructions for each component can be found in their corresponding `README.md` files.

# Deployments

There is a dedicated [DEPLOYMENTS.md](DEPLOYMENTS.md) for contracts. For the releases of the dapp, see [Releases](https://github.com/Swaylend/swaylend-monorepo/releases).

# Socials / Contact
* Twitter/X: [@swaylend](https://x.com/swaylend)
* Email: TBA
* Discord: [SwayLend](https://discord.gg/m9VcnNG2)
# Licensing

The primary license for all SwayLend components is the MIT License. See [`LICENSE`](/LICENSE).
