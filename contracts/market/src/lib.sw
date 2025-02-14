library;

pub trait ArrWrap {
    fn _len(self) -> u64;
    fn _get(self, i: u64) -> b256;
}

impl ArrWrap for [b256; 5] {
    fn _len(self) -> u64 {
        5
    }

    fn _get(self, i: u64) -> b256 {
        self[i]
    }
}

pub trait ToVec: ArrWrap {
    fn to_vec(self) -> Vec<b256>;
}

impl<T> ToVec for T
where
    T: ArrWrap,
{
    fn to_vec(self) -> Vec<b256> {
        let mut result = Vec::new();
        let mut i = 0;
        while (i < self._len()) {
            result.push(self._get(i));
            i += 1;
        }

        result
    }
}

impl<T> Vec<T>
where
    T: Eq,
{
    pub fn contains(self, value: T) -> bool {
        let mut i = 0;
        while (i < self.len()) {
            if value == self.get(i).unwrap() {
                return true;
            }
            i += 1;
        }

        false
    }
}
