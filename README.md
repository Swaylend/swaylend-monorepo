<div align="center" id="logo">
  
  ![SwayLend](assets/svg/logo_text_white_shadow.svg#gh-dark-mode-only)
  ![Masca logo](assets/svg/logo_text_black_shadow.svg#gh-light-mode-only)
  
</div>

<h6 align="center">
  <a href="https://swaylend.com">Website</a>
  ·
  <a href="https://docs.swaylend.com/">Docs</a>
  ·
  <a href="https://medium.com/@blockchainlabum/open-sourcing-ssi-snap-for-metamask-aaa176775be2">Blog</a>
</h6>

# [Swaylend ⛽️⚡️](https://swaylend.com/) - First ever Lending protocol on Fuel Network

<figure><img src="https://static.tildacdn.com/tild3165-3835-4163-b062-666230613733/Tilda_badge_1200x630.jpg" alt=""><figcaption></figcaption></figure>

# Introduction

SwayLend is a decentralized lending platform that operates on the [Fuel Network](https://fuel.network), which has an Ethereum consensus layer. Our platform provides a secure and trustful place for crypto users to earn passive income by supplying liquidity to the market.

With SwayLend, users can supply up to 6 different crypto assets as collateral and borrow USDC, the base asset. Suppliers earn a passive income by providing liquidity, while borrowers have the option to borrow in either an overcollateralized (perpetually) or undercollateralized manner.

The SwayLend protocol is built on a re-engineered solution from the Ethereum blockchain, rewritten in the Sway programming language. Our platform is a re-imagining of the [Compound](https://compound.finance/) architecture offers all the features and benefits of the [Compound](https://compound.finance/) with the added security and stability of the [Fuel Network.](https://fuel.network) Our platform is constantly monitored and improved by our dedicated team, who are always available to answer any questions or provide support.

The SwayLend is alive on [https://swaylend.com](https://swaylend.com)

> Please note that Sway Lend is in the alpha testing phase and contracts may change in the future, leading to potential loss of supply/borrow amount.

* * *
# Project structure

On the first level, the monorepo is divided into `contracts` , `apps` , `scripts` , and `libs` .
* **abis**: Contains ABI (Application Binary Interface) files, specifically for the market contract.
* **apps**: Houses different applications related to the project:

  + **frontend-v2**: A newer version of the frontend application.
  + **indexer**: Application responsible for indexing blockchain data.
  + **oracle**: Application related to the oracle service.

* **contracts**: Contains smart contracts for various functionalities.

  + **market**: The main market contract.
  + **pyth-mock**: Mock contract for Pyth oracle, used in tests.
  + **src-20**: SRC-20 contract, used in tests.
  + **token**: Token contract, used in tests.

* **libs**: Includes shared libraries used across the project.

  + **i256**: Library for 256-bit integer operations.
  + **market\_sdk**: Custom SDK for interacting with the market contract, used in tests.
  + **pyth\_mock\_sdk**: Custom SDK for the Pyth mock contract, used in tests.
  + **token\_sdk**: Custom SDK for the token contract, used in tests.

* **scripts**: Contains scripts for various network operations.

  + **devnet**: Scripts related to the local development network.
  + **testnet**: Scripts related to the public test network.

* * *
# Deployments

There is a dedicated [DEPLOYMENTS.md](https:///DEPLOYMENTS.md) for contracts. For the releases of the dapp, see Releases.
* * *
# Socials / Contact
* Twitter/X: [@swaylend](https://x.com/swaylend)
* Email: TBA
* Discord: TBA

* * *
# Licensing

The primary license for all SwayLend components is the MIT License, see [ `LICENSE` ](/LICENSE).
