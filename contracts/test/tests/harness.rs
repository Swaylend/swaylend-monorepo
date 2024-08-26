use fuels::{
    accounts::wallet::WalletUnlocked,
    macros::abigen,
    programs::{
        contract::{Contract, LoadConfiguration, StorageConfiguration},
        responses::CallResponse,
    },
    test_helpers::{launch_custom_provider_and_get_wallets, WalletsConfig},
    types::{transaction::TxPolicies, Bytes32, ContractId},
};
use rand::Rng;

const TEST_CONTRACT_BINARY_PATH: &str = "out/release/test_project.bin";
const TEST_CONTRACT_STORAGE_PATH: &str = "out/release/test_project-storage_slots.json";

abigen!(Contract(
    name = "Test",
    abi = "contracts/test/out/release/test_project-abi.json"
));

pub struct TestContract {
    instance: Test<WalletUnlocked>,
}

pub struct User {
    wallet: WalletUnlocked,
}

impl TestContract {
    pub async fn deploy(owner: WalletUnlocked) -> anyhow::Result<Self> {
        let mut rng = rand::thread_rng();
        let salt = rng.gen::<[u8; 32]>();

        let storage_configuration = StorageConfiguration::default()
            .add_slot_overrides_from_file(TEST_CONTRACT_STORAGE_PATH);

        let configurables = TestConfigurables::default();

        let contract_configuration = LoadConfiguration::default()
            .with_storage_configuration(storage_configuration?)
            .with_configurables(configurables);

        let contract_id = Contract::load_from(TEST_CONTRACT_BINARY_PATH, contract_configuration)?
            .with_salt(salt)
            .deploy(&owner, TxPolicies::default())
            .await?;

        let test_contract = Test::new(contract_id.clone(), owner.clone());

        Ok(Self {
            instance: test_contract,
        })
    }

    pub async fn new(contract_id: ContractId, owner: WalletUnlocked) -> anyhow::Result<Self> {
        let instance = Test::new(contract_id, owner.clone());
        Ok(Self { instance })
    }

    pub fn id(&self) -> Bytes32 {
        self.instance.contract_id().hash
    }

    pub async fn with_account(&self, account: &WalletUnlocked) -> anyhow::Result<Self> {
        Ok(Self {
            instance: self.instance.clone().with_account(account.clone()),
        })
    }

    pub async fn increment(&self, amount: u64) -> anyhow::Result<CallResponse<()>> {
        let tx_policies = TxPolicies::default().with_script_gas_limit(1_000_000);
        Ok(self
            .instance
            .methods()
            .increment(amount)
            .with_tx_policies(tx_policies)
            .call()
            .await?)
    }

    pub async fn get(&self) -> anyhow::Result<CallResponse<u64>> {
        Ok(self.instance.methods().get().call().await?)
    }
}

pub async fn setup() -> anyhow::Result<(TestContract, Vec<User>)> {
    let wallets_config = WalletsConfig::new(Some(5), Some(1), Some(1_000_000_000));
    let wallets = launch_custom_provider_and_get_wallets(wallets_config, None, None).await?;

    let mut users = Vec::new();
    for wallet in wallets {
        users.push(User { wallet });
    }

    let contract = TestContract::deploy(users.first().unwrap().wallet.clone()).await?;

    Ok((contract, users))
}

#[cfg(test)]
mod tests {
    use crate::setup;
    use fuels::{macros::abigen, test_helpers::launch_provider_and_get_wallet};

    #[tokio::test]
    async fn test_contract() {
        let (contract, users) = setup().await.unwrap();
        contract
            .with_account(&users.get(1).unwrap().wallet)
            .await
            .unwrap()
            .increment(1)
            .await
            .unwrap();
        assert!(1 == contract.get().await.unwrap().value);
    }

    // abigen!(Script(
    //     name = "TestScript",
    //     abi = "contracts/test/out/release/test_project-abi.json"
    // ));

    // #[tokio::test]
    // async fn test_test() {
    //     let path_to_bin = "out/release/test_project.bin";
    //     let wallet = launch_provider_and_get_wallet().await.unwrap();

    //     let instance = TestScript::new(wallet, path_to_bin);
    //     let result = instance.main().call().await;

    //     assert!(result.unwrap().value);
    // }
}
