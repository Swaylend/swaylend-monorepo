import {CoinName, coinsConfig} from "@shared/src/utils/coinsConfig";
import {B256Address} from "fuels";
import {buildPoolId, PoolId} from "mira-dex-ts";
import {DefaultLocale} from "./constants";

export const openNewTab = (url: string) => {
  window.open(url, "_blank");
};

export const assetsList = Array.from(coinsConfig.values());

export const isPoolIdValid = (poolId: PoolId) => {
  return poolId[0].bits.length === 66 && poolId[1].bits.length === 66;
};

export const StablePoolKey = "true" as const;
export const VolatilePoolKey = "false" as const;

// Entity used as query param for position/pool pages in format 'ETH-USDT-stable', mutually convertible with pool id
export const createPoolKey = (poolId: PoolId) => {
  const poolStability = poolId[2] ? StablePoolKey : VolatilePoolKey;
  return `${poolId[0].bits}-${poolId[1].bits}-${poolStability}`;
};

// TODO: Reconsider this function, maybe have an API call for /pools?
export const isPoolKeyValid = (key: string) => {
  const [coinA, coinB] = key.split("-") as [string, string];
  // TODO: check isStable?
  return coinA.length === 66 && coinB.length === 66;
};

export const createPoolIdFromPoolKey = (key: string) => {
  const [firstCoinAssetId, secondCoinAssetId, poolStability] = key.split(
    "-",
  ) as [
    B256Address,
    B256Address,
    typeof StablePoolKey | typeof VolatilePoolKey,
  ];
  const poolStabilityValid =
    poolStability === StablePoolKey || poolStability === VolatilePoolKey;

  if (!firstCoinAssetId || !secondCoinAssetId || !poolStabilityValid) {
    return null;
  }

  return buildPoolId(
    firstCoinAssetId,
    secondCoinAssetId,
    poolStability === StablePoolKey,
  );
};

export const createPoolIdFromAssetNames = (
  firstAssetName: CoinName,
  secondAssetName: CoinName,
  isStablePool: boolean,
) => {
  const firstCoinAsset = coinsConfig.get(firstAssetName)?.assetId;
  const secondCoinAsset = coinsConfig.get(secondAssetName)?.assetId;

  if (!firstCoinAsset || !secondCoinAsset) {
    throw new Error(
      `Invalid asset configuration for ${firstAssetName} or ${secondAssetName}`,
    );
  }

  return buildPoolId(firstCoinAsset, secondCoinAsset, isStablePool);
};

// Mira API returns pool id as string '0x3f007b72f7bcb9b1e9abe2c76e63790cd574b7c34f1c91d6c2f407a5b55676b9_0xce90621a26908325c42e95acbbb358ca671a9a7b36dfb6a5405b407ad1efcd30_false'
export const createPoolIdFromIdString = (id: string) => {
  const [firstAssetId, secondAssetId, isStable] = id.split("-");
  return buildPoolId(firstAssetId, secondAssetId, isStable === "true");
};

export const createPoolIdString = (poolId: PoolId) => {
  return `${poolId[0].bits}-${poolId[1].bits}-${poolId[2]}`;
};

export const arePoolIdsEqual = (firstPoolId: PoolId, secondPoolId: PoolId) => {
  return (
    firstPoolId[0].bits === secondPoolId[0].bits &&
    firstPoolId[1].bits === secondPoolId[1].bits &&
    firstPoolId[2] === secondPoolId[2]
  );
};

export const floorToTwoSignificantDigits = (
  value: number | null | undefined,
) => {
  if (!value) {
    return 0;
  }

  const digitsBeforeDecimal = Math.floor(Math.log10(Math.abs(value))) + 1;
  const factor = Math.pow(10, 2 - digitsBeforeDecimal);

  return Math.floor(value * factor) / factor;
};

export const calculateSHA256Hash = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const byteArray = new Uint8Array(hashBuffer);
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const getBoostReward = (
  poolKey: string,
  data: {
    pool: {
      id: string;
    };
    rewards: {
      dailyAmount: number;
      assetId: string;
    }[];
  }[],
): {
  dailyAmount: number;
  assetId: string | undefined;
} => {
  const item = data.find((item) => item.pool.id === poolKey.replace(/0x/g, ""));

  return item?.rewards[0] || {dailyAmount: 0, assetId: undefined};
};

export const getRewardsPoolsId = (
  pools: {
    pool: {id: string};
  }[],
): string => {
  return pools.map((pool) => pool.pool.id.replace(/0x/g, "")).join(",");
};

export const calculateUsdValue = (
  fuelAmount: number,
  fuelToUsdRate: number,
): string => {
  const usdValue = fuelAmount * fuelToUsdRate;
  return `~${usdValue.toLocaleString(DefaultLocale, {style: "currency", currency: "USD"})}`;
};

export const calculateEpochDuration = (
  startDate: string,
  endDate: string,
): string => {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (now < start) {
    // Before the start date
    const startDateFormatted = new Date(startDate).toLocaleString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Starts at ${startDateFormatted} UTC`;
  } else if (now >= start && now <= end) {
    // Between start date and end date
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days} days, ${hours} hours, ${minutes} min`;
  } else {
    // After the end date
    return "Season has ended";
  }
};

export const convertDailyRewardsToTotalRewards = (
  dailyRewards: number,
  epochStart: string,
  epochEnd: string,
) => {
  const epochDurationDays =
    (new Date(epochEnd).getTime() - new Date(epochStart).getTime()) /
    (1000 * 60 * 60 * 24);
  return dailyRewards * epochDurationDays;
};

export const formatDisplayAmount = (amount: string | number) => {
  const asDecimal = typeof amount === "string" ? parseFloat(amount) : amount;
  if (asDecimal < 0.00001) {
    return "<0.00001";
  }

  return asDecimal.toLocaleString(DefaultLocale, {minimumFractionDigits: 5});
};

// Formats the APR value into a string with two decimal places and a percentage sign.
// The `apr` value represents percentage points (e.g., 1 represents 1%, not 100%).
export const formatAprValue = (apr?: {apr: number}): string | null => {
  if (!apr) return null;
  return `${apr.apr.toLocaleString(DefaultLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};
