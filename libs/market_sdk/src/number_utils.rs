use fuels::types::U256;
use market::I256;

pub fn parse_units(num: u64, decimals: u64) -> u64 {
    num * 10u64.pow(decimals as u32)
}

pub fn format_units(num: u64, decimals: u64) -> f64 {
    num as f64 / 10u64.pow(decimals as u32) as f64
}

pub fn format_units_u128(num: u128, decimals: u64) -> f64 {
    let num: u64 = num as u64;
    format_units(num, decimals)
}

pub fn convert_i256_to_i128(value: I256) -> i128 {
    let val: i128 = value.value.try_into().unwrap();
    val * if value.negative { -1 } else { 1 }
}

pub fn convert_u256_to_u128(value: U256) -> u128 {
    value.low_u128()
}
