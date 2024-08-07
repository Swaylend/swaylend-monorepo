script;

use sway_libs::signed_integers::i128::I128;
use std::u128::U128;

fn flip_i128(x: I128) -> I128 {
    x * I128::neg_from(U128::from((0, 1)))
}

fn main() -> bool {
    let u128_one = U128::from((0, 1));
    let u128_two = U128::from((0, 2));
    let one = I128::from(u128_one);
    let mut res = one + I128::from(u128_one);
    assert(res == I128::from(u128_two));

    let u128_10 = U128::from((0, 10));
    let u128_11 = U128::from((0, 11));
    res = I128::from(u128_10) - I128::from(u128_11);
    assert(res.underlying() == U128::from((1, 0)) - U128::from((0, 1)));

    res = I128::from(u128_10) * I128::neg_from(u128_one);
    assert(res == I128::neg_from(u128_10));

    res = I128::from(u128_10) * I128::from(u128_10);
    let u128_100 = U128::from((0, 100));
    assert(res == I128::from(u128_100));

    let u128_5 = U128::from((0, 5));

    let u128_2 = U128::from((0, 2));

    res = I128::from(u128_10) / I128::from(u128_5);
    assert(res == I128::from(u128_2));

    assert(flip_i128(I128::neg_from(u128_10)) == I128::from(u128_10));

    let i128_5 = I128::neg_from(u128_5);
    assert((I128::zero() - i128_5) == I128::from(u128_5)); // bug, this should pass

    true
}