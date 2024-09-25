library;

use std::u128::U128;
use std::convert::TryFrom;

pub struct I256 {
    pub value: u256,
    pub negative: bool,
}

impl From<u256> for I256 {
    fn from(value: u256) -> Self {
        Self {
            value,
            negative: false,
        }
    }
}

impl TryFrom<I256> for u256 {
    fn try_from(value: I256) -> Option<Self> {
        if !value.negative {
            Some(value.value)
        } else {
            None
        }
    }
}

impl From<u64> for I256 {
    fn from(value: u64) -> Self {
        Self {
            value: u256::from(value),
            negative: false,
        }
    }
}

impl TryFrom<I256> for u64 {
    fn try_from(value: I256) -> Option<Self> {
        if value.negative || value.value > u256::from(u64::max()) {
            None
        } else {
            Some(value.value.try_into().unwrap())
        }
    }
}

impl core::ops::Eq for I256 {
    fn eq(self, other: Self) -> bool {
        self.value == other.value && self.negative == other.negative
    }
}

impl core::ops::Ord for I256 {
    fn gt(self, other: Self) -> bool {
        if (!self.negative && !other.negative) {
            self.value > other.value
        } else if (!self.negative && other.negative) {
            true
        } else if (self.negative && !other.negative) {
            false
        } else if (self.negative && other.negative) {
            self.value < other.value
        } else {
            revert(0)
        }
    }

    fn lt(self, other: Self) -> bool {
        if (!self.negative && !other.negative) {
            self.value < other.value
        } else if (!self.negative && other.negative) {
            false
        } else if (self.negative && !other.negative) {
            true
        } else if (self.negative && other.negative) {
            self.value > other.value
        } else {
            revert(0)
        }
    }
}

impl core::ops::OrdEq for I256 {}

impl I256 {
    /// The size of this type in bits.
    pub fn bits() -> u32 {
        257
    }

    /// Helper function to get a signed number from with an underlying
    pub fn from_uint(value: u256) -> Self {
        Self {
            value,
            negative: false,
        }
    }

    /// The largest value that can be represented by this integer type,
    pub fn max() -> Self {
        Self {
            value: u256::max(),
            negative: false,
        }
    }

    /// The smallest value that can be represented by this integer type.
    pub fn min() -> Self {
        Self {
            value: u256::min(),
            negative: true,
        }
    }

    /// Helper function to get a negative value of an unsigned number
    pub fn neg_from(value: u256) -> Self {
        Self {
            value,
            negative: if value == 0 { false } else { true },
        }
    }

    /// Initializes a new, zeroed I256.
    pub fn new() -> Self {
        Self {
            value: 0,
            negative: false,
        }
    }

    /// Initializes a new, zeroed I256.
    pub fn zero() -> Self {
        Self::new()
    }
}

impl core::ops::Add for I256 {
    /// Add a I256 to a I256. Panics on overflow.
    fn add(self, other: Self) -> Self {
        if !self.negative && !other.negative {
            Self::from(self.value + other.value)
        } else if self.negative && other.negative {
            Self::neg_from(self.value + other.value)
        } else if (self.value > other.value) {
            Self {
                negative: self.negative,
                value: self.value - other.value,
            }
        } else if (self.value < other.value) {
            Self {
                negative: other.negative,
                value: other.value - self.value,
            }
        } else if (self.value == other.value) {
            Self::new()
        } else {
            revert(0)
        }
    }
}

impl core::ops::Subtract for I256 {
    /// Subtract a I256 from a I256. Panics of overflow.
    fn subtract(self, other: Self) -> Self {
        if self == other {
            Self::new()
        } else if !self.negative
            && !other.negative
            && self.value > other.value
        {
            Self::from(self.value - other.value)
        } else if !self.negative
            && !other.negative
            && self.value < other.value
        {
            Self::neg_from(other.value - self.value)
        } else if self.negative
            && other.negative
            && self.value > other.value
        {
            Self::neg_from(self.value - other.value)
        } else if self.negative
            && other.negative
            && self.value < other.value
        {
            Self::from(other.value - self.value)
        } else if !self.negative && other.negative {
            Self::from(self.value + other.value)
        } else if self.negative && !other.negative {
            Self::neg_from(self.value + other.value)
        } else {
            revert(0)
        }
    }
}

impl core::ops::Multiply for I256 {
    /// Multiply a I256 with a I256. Panics of overflow.
    fn multiply(self, other: Self) -> Self {
        if self.value == 0 || other.value == 0 {
            Self::new()
        } else if !self.negative == !other.negative {
            Self::from(self.value * other.value)
        } else if !self.negative != !other.negative {
            Self::neg_from(self.value * other.value)
        } else {
            revert(0)
        }
    }
}

impl core::ops::Divide for I256 {
    /// Divide a I256 by a I256. Panics if divisor is zero.
    fn divide(self, divisor: Self) -> Self {
        require(divisor != Self::new(), "ZeroDivisor");
        if self.value == 0 {
            Self::new()
        } else if !self.negative == !divisor.negative {
            Self::from(self.value / divisor.value)
        } else if !self.negative != !divisor.negative {
            Self::neg_from(self.value / divisor.value)
        } else {
            revert(0)
        }
    }
}

impl I256 {
    /// Flips the sign of the number.
    pub fn flip(self) -> Self {
        self * Self::neg_from(1)
    }
}

#[test]
fn i256_add() {
    // 1 + 2
    let a = I256::from(1_u64);
    let b = I256::from(2_u64);
    let c = a + b;
    assert_eq(c, I256::from(3_u64));

    // -10 + 15
    let a = I256::neg_from(u256::from(10_u64));
    let b = I256::from(15_u64);
    let c = a + b;
    assert_eq(c, I256::from(5_u64));

    // 15 + -25
    let a = I256::from(15_u64);
    let b = I256::neg_from(u256::from(25_u64));
    let c = a + b;
    assert_eq(c, I256::neg_from(u256::from(10_u64)));

    // -10 + -20
    let a = I256::neg_from(u256::from(10_u64));
    let b = I256::neg_from(u256::from(20_u64));
    let c = a + b;
    assert_eq(c, I256::neg_from(u256::from(30_u64)));
}

#[test]
fn i256_sub() {
    // 1 - 2
    let a = I256::from(1_u64);
    let b = I256::from(2_u64);
    let c = a - b;
    assert_eq(c, I256::neg_from(u256::from(1_u64)));

    // -10 - 15
    let a = I256::neg_from(u256::from(10_u64));
    let b = I256::from(15_u64);
    let c = a - b;
    assert_eq(c, I256::neg_from(u256::from(25_u64)));

    // 15 - -25
    let a = I256::from(15_u64);
    let b = I256::neg_from(u256::from(25_u64));
    let c = a - b;
    assert_eq(c, I256::from(40_u64));

    // -10 - -20
    let a = I256::neg_from(u256::from(10_u64));
    let b = I256::neg_from(u256::from(20_u64));
    let c = a - b;
    assert_eq(c, I256::from(10_u64));
}

#[test]
fn i256_mul() {
    // 1 * 2
    let a = I256::from(1_u64);
    let b = I256::from(2_u64);
    let c = a * b;
    assert_eq(c, I256::from(2_u64));

    // -10 * 15
    let a = I256::neg_from(u256::from(10_u64));
    let b = I256::from(15_u64);
    let c = a * b;
    assert_eq(c, I256::neg_from(u256::from(150_u64)));

    // 15 * -25
    let a = I256::from(15_u64);
    let b = I256::neg_from(u256::from(25_u64));
    let c = a * b;
    assert_eq(c, I256::neg_from(u256::from(375_u64)));

    // -10 * -20
    let a = I256::neg_from(u256::from(10_u64));
    let b = I256::neg_from(u256::from(20_u64));
    let c = a * b;
    assert_eq(c, I256::from(200_u64));
}



#[test]
fn i256_div() {
    // 1 / 2
    let a = I256::from(1_u64);
    let b = I256::from(2_u64);
    let c = a / b;
    assert_eq(c, I256::zero());

    // 40 / 9
    let a = I256::from(40_u64);
    let b = I256::from(9_u64);
    let c = a / b;
    assert_eq(c, I256::from(4_u64));

    // 40 / 10
    let a = I256::from(40_u64);
    let b = I256::from(10_u64);
    let c = a / b;
    assert_eq(c, I256::from(4_u64));

    // -100 / 33
    let a = I256::neg_from(u256::from(100_u64));
    let b = I256::from(33_u64);
    let c = a / b;
    assert_eq(c, I256::neg_from(u256::from(3_u64)));

    // 120 / -40
    let a = I256::from(120_u64);
    let b = I256::neg_from(u256::from(40_u64));
    let c = a / b;
    assert_eq(c, I256::neg_from(u256::from(3_u64)));

    // -400 / -120
    let a = I256::neg_from(u256::from(400_u64));
    let b = I256::neg_from(u256::from(120_u64));
    let c = a / b;
    assert_eq(c, I256::from(3_u64));
}

#[test]
fn i256_eq() {
    // 1 < 2 is true
    let a = I256::from(1_u64);
    let b = I256::from(2_u64);
    assert_eq(a < b, true);

    // 2 < 1 is false
    assert_eq(b < a, false);

    // 1 == 1 is true
    let a = I256::from(1_u64);
    let b = I256::from(1_u64);
    assert_eq(a == b, true);

    // 1 == 2 is false
    let a = I256::from(1_u64);
    let b = I256::from(2_u64);
    assert_eq(a == b, false);

    // -100000000000000 is less than 0
    let a = I256::neg_from(u256::from(100000000000000_u64));
    assert_eq(a < I256::zero(), true);

    // 0 is not less than -1
    let a = I256::zero();
    assert_eq(a < I256::neg_from(u256::from(1_u64)), false);
}

#[test]
fn i256_flip() {
    // Flip positive to negative
    let a = I256::from(10_u64);
    let b = a.flip();
    assert_eq(b, I256::neg_from(u256::from(10_u64)));

    // Flip negative to positive
    let a = I256::neg_from(u256::from(10_u64));
    let b = a.flip();
    assert_eq(b, I256::from(10_u64));
}

#[test]
fn i256_edge_cases() {
    // Adding zero
    let a = I256::from(10_u64);
    let b = I256::zero();
    let c = a + b;
    assert_eq(c, a);

    // Subtracting zero
    let a = I256::from(10_u64);
    let b = I256::zero();
    let c = a - b;
    assert_eq(c, a);

    // Multiplying by zero
    let a = I256::from(10_u64);
    let b = I256::zero();
    let c = a * b;
    assert_eq(c, I256::zero());

    // Dividing by one
    let a = I256::from(10_u64);
    let b = I256::from(1_u64);
    let c = a / b;
    assert_eq(c, a);
    
}

#[test]
fn i256_order_of_operations() {
    // 2 + 3 * 4 should be 14
    let a = I256::from(2_u64);
    let b = I256::from(3_u64);
    let c = I256::from(4_u64);
    let result = a + (b * c);
    assert_eq(result, I256::from(14_u64));

    // (2 + 3) * 4 should be 20
    let result = (a + b) * c;
    assert_eq(result, I256::from(20_u64));

    // 10 - 2 / 2 should be 9
    let a = I256::from(10_u64);
    let b = I256::from(2_u64);
    let result = a - (b / b);
    assert_eq(result, I256::from(9_u64));

    // (10 - 2) / 2 should be 4
    let result = (a - b) / b;
    assert_eq(result, I256::from(4_u64));
}
