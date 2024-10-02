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

pub fn convert_i256_to_i128(value: &I256) -> i128 {
    if is_i256_negative(value) {
        i128::try_from(i256_indent() - value.underlying).unwrap() * -1
    } else {
        i128::try_from(value.underlying - i256_indent()).unwrap()
    }
}

pub fn convert_i256_to_i64(value: &I256) -> i64 {
    if is_i256_negative(value) {
        i64::try_from(i256_indent() - value.underlying).unwrap() * -1
    } else {
        i64::try_from(value.underlying - i256_indent()).unwrap()
    }
}

pub fn convert_u256_to_u128(value: U256) -> u128 {
    value.low_u128()
}

pub fn i256_indent() -> U256 {
    U256::from_big_endian(
        &hex::decode("8000000000000000000000000000000000000000000000000000000000000000").unwrap(),
    )
}

pub fn is_i256_negative(value: &I256) -> bool {
    value.underlying < i256_indent()
}

pub fn convert_i256_to_u64(value: &I256) -> u64 {
    let value = value.underlying - i256_indent();

    u64::try_from(value).unwrap()
}
