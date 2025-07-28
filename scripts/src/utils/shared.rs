use dotenv::dotenv;
use fuels::{
    accounts::{provider::Provider, wallet::Wallet},
    macros::abigen,
    types::{ContractId, U256},
};
use market::I256;
use std::io::Write;
use std::str::FromStr;

pub fn get_yes_no_input(prompt: &str) -> bool {
    loop {
        print!("{}", prompt);
        std::io::stdout().flush().unwrap(); // Ensure prompt is shown before reading input

        let mut input = String::new();
        std::io::stdin()
            .read_line(&mut input)
            .expect("Failed to read input");

        let input = input.trim().to_lowercase(); // Trim spaces and normalize to lowercase

        match input.as_str() {
            "yes" | "y" => return true,
            "no" | "n" => return false,
            _ => println!("Please enter 'yes' or 'no'."),
        }
    }
}

#[derive(clap::ValueEnum, Clone, Debug, Eq, PartialEq)]
pub enum Network {
    Mainnet,
    Testnet,
    Devnet,
}

pub fn read_env() {
    dotenv().ok();
}

pub async fn verify_connected_network(
    provider: &Provider,
    network: Network,
) -> anyhow::Result<bool> {
    let chain_name = provider.chain_info().await?.name;
    println!("Connected to chain: {}", chain_name);
    match chain_name.as_str() {
        "Ignition" => Ok(network == Network::Mainnet),
        "Fuel Sepolia Testnet" => Ok(network == Network::Testnet),
        "Local testnet" => Ok(network == Network::Devnet),
        _ => Ok(false),
    }
}

abigen!(Contract(name = "ProxyContract", abi = "{\"programType\":\"contract\",\"specVersion\":\"1\",\"encodingVersion\":\"1\",\"concreteTypes\":[{\"type\":\"()\",\"concreteTypeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"},{\"type\":\"enum standards::src5::AccessError\",\"concreteTypeId\":\"3f702ea3351c9c1ece2b84048006c8034a24cbc2bad2e740d0412b4172951d3d\",\"metadataTypeId\":1},{\"type\":\"enum standards::src5::State\",\"concreteTypeId\":\"192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c\",\"metadataTypeId\":2},{\"type\":\"enum std::option::Option<struct std::contract_id::ContractId>\",\"concreteTypeId\":\"0d79387ad3bacdc3b7aad9da3a96f4ce60d9a1b6002df254069ad95a3931d5c8\",\"metadataTypeId\":4,\"typeArguments\":[\"29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54\"]},{\"type\":\"enum sway_libs::ownership::errors::InitializationError\",\"concreteTypeId\":\"1dfe7feadc1d9667a4351761230f948744068a090fe91b1bc6763a90ed5d3893\",\"metadataTypeId\":5},{\"type\":\"enum sway_libs::upgradability::errors::SetProxyOwnerError\",\"concreteTypeId\":\"3c6e90ae504df6aad8b34a93ba77dc62623e00b777eecacfa034a8ac6e890c74\",\"metadataTypeId\":6},{\"type\":\"str\",\"concreteTypeId\":\"8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a\"},{\"type\":\"struct std::contract_id::ContractId\",\"concreteTypeId\":\"29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54\",\"metadataTypeId\":9},{\"type\":\"struct sway_libs::upgradability::events::ProxyOwnerSet\",\"concreteTypeId\":\"96dd838b44f99d8ccae2a7948137ab6256c48ca4abc6168abc880de07fba7247\",\"metadataTypeId\":10},{\"type\":\"struct sway_libs::upgradability::events::ProxyTargetSet\",\"concreteTypeId\":\"1ddc0adda1270a016c08ffd614f29f599b4725407c8954c8b960bdf651a9a6c8\",\"metadataTypeId\":11}],\"metadataTypes\":[{\"type\":\"b256\",\"metadataTypeId\":0},{\"type\":\"enum standards::src5::AccessError\",\"metadataTypeId\":1,\"components\":[{\"name\":\"NotOwner\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"}]},{\"type\":\"enum standards::src5::State\",\"metadataTypeId\":2,\"components\":[{\"name\":\"Uninitialized\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"},{\"name\":\"Initialized\",\"typeId\":3},{\"name\":\"Revoked\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"}]},{\"type\":\"enum std::identity::Identity\",\"metadataTypeId\":3,\"components\":[{\"name\":\"Address\",\"typeId\":8},{\"name\":\"ContractId\",\"typeId\":9}]},{\"type\":\"enum std::option::Option\",\"metadataTypeId\":4,\"components\":[{\"name\":\"None\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"},{\"name\":\"Some\",\"typeId\":7}],\"typeParameters\":[7]},{\"type\":\"enum sway_libs::ownership::errors::InitializationError\",\"metadataTypeId\":5,\"components\":[{\"name\":\"CannotReinitialized\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"}]},{\"type\":\"enum sway_libs::upgradability::errors::SetProxyOwnerError\",\"metadataTypeId\":6,\"components\":[{\"name\":\"CannotUninitialize\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"}]},{\"type\":\"generic T\",\"metadataTypeId\":7},{\"type\":\"struct std::address::Address\",\"metadataTypeId\":8,\"components\":[{\"name\":\"bits\",\"typeId\":0}]},{\"type\":\"struct std::contract_id::ContractId\",\"metadataTypeId\":9,\"components\":[{\"name\":\"bits\",\"typeId\":0}]},{\"type\":\"struct sway_libs::upgradability::events::ProxyOwnerSet\",\"metadataTypeId\":10,\"components\":[{\"name\":\"new_proxy_owner\",\"typeId\":2}]},{\"type\":\"struct sway_libs::upgradability::events::ProxyTargetSet\",\"metadataTypeId\":11,\"components\":[{\"name\":\"new_target\",\"typeId\":9}]}],\"functions\":[{\"inputs\":[],\"name\":\"proxy_target\",\"output\":\"0d79387ad3bacdc3b7aad9da3a96f4ce60d9a1b6002df254069ad95a3931d5c8\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Returns the target contract of the proxy contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Returns\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * [Option<ContractId>] - The new proxy contract to which all fallback calls will be passed or `None`.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Reads: `1`\"]},{\"name\":\"storage\",\"arguments\":[\"read\"]}]},{\"inputs\":[{\"name\":\"new_target\",\"concreteTypeId\":\"29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54\"}],\"name\":\"set_proxy_target\",\"output\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Change the target contract of the proxy contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Additional Information\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This method can only be called by the `proxy_owner`.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Arguments\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * `new_target`: [ContractId] - The new proxy contract to which all fallback calls will be passed.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Reverts\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * When not called by `proxy_owner`.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Reads: `1`\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Write: `1`\"]},{\"name\":\"storage\",\"arguments\":[\"read\",\"write\"]}]},{\"inputs\":[],\"name\":\"proxy_owner\",\"output\":\"192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Returns the owner of the proxy contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Returns\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * [State] - Represents the state of ownership for this contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Reads: `1`\"]},{\"name\":\"storage\",\"arguments\":[\"read\"]}]},{\"inputs\":[],\"name\":\"initialize_proxy\",\"output\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Initializes the proxy contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Additional Information\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This method sets the storage values using the values of the configurable constants `INITIAL_TARGET` and `INITIAL_OWNER`.\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This then allows methods that write to storage to be called.\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This method can only be called once.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Reverts\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * When `storage::SRC14.proxy_owner` is not [State::Uninitialized].\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Writes: `2`\"]},{\"name\":\"storage\",\"arguments\":[\"write\"]}]},{\"inputs\":[{\"name\":\"new_proxy_owner\",\"concreteTypeId\":\"192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c\"}],\"name\":\"set_proxy_owner\",\"output\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Changes proxy ownership to the passed State.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Additional Information\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This method can be used to transfer ownership between Identities or to revoke ownership.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Arguments\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * `new_proxy_owner`: [State] - The new state of the proxy ownership.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Reverts\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * When the sender is not the current proxy owner.\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * When the new state of the proxy ownership is [State::Uninitialized].\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Reads: `1`\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Writes: `1`\"]},{\"name\":\"storage\",\"arguments\":[\"write\"]}]}],\"loggedTypes\":[{\"logId\":\"4571204900286667806\",\"concreteTypeId\":\"3f702ea3351c9c1ece2b84048006c8034a24cbc2bad2e740d0412b4172951d3d\"},{\"logId\":\"2151606668983994881\",\"concreteTypeId\":\"1ddc0adda1270a016c08ffd614f29f599b4725407c8954c8b960bdf651a9a6c8\"},{\"logId\":\"2161305517876418151\",\"concreteTypeId\":\"1dfe7feadc1d9667a4351761230f948744068a090fe91b1bc6763a90ed5d3893\"},{\"logId\":\"4354576968059844266\",\"concreteTypeId\":\"3c6e90ae504df6aad8b34a93ba77dc62623e00b777eecacfa034a8ac6e890c74\"},{\"logId\":\"10870989709723147660\",\"concreteTypeId\":\"96dd838b44f99d8ccae2a7948137ab6256c48ca4abc6168abc880de07fba7247\"},{\"logId\":\"10098701174489624218\",\"concreteTypeId\":\"8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a\"}],\"messagesTypes\":[],\"configurables\":[{\"name\":\"INITIAL_TARGET\",\"concreteTypeId\":\"0d79387ad3bacdc3b7aad9da3a96f4ce60d9a1b6002df254069ad95a3931d5c8\",\"offset\":13368},{\"name\":\"INITIAL_OWNER\",\"concreteTypeId\":\"192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c\",\"offset\":13320}]}",));

pub async fn get_proxy_instance(
    wallet: &Wallet,
    proxy_contract_id: String,
) -> anyhow::Result<(ProxyContract<Wallet>, ContractId)> {
    let proxy_contract_id: ContractId = ContractId::from_str(&proxy_contract_id).unwrap();
    let proxy_instance = ProxyContract::new(proxy_contract_id.clone(), wallet.clone());

    Ok((proxy_instance, proxy_contract_id))
}

pub fn i256_indent() -> U256 {
    U256::from_big_endian(
        &hex::decode("8000000000000000000000000000000000000000000000000000000000000000").unwrap(),
    )
}

pub fn convert_i256_to_u64(value: &I256) -> u64 {
    let value = value.underlying - i256_indent();

    u64::try_from(value).unwrap()
}

pub fn convert_i256_to_i64(value: &I256) -> i64 {
    let value = value.underlying - i256_indent();

    i64::try_from(value).unwrap()
}
