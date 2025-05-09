import boostRewards from "@shared/src/models/campaigns.json";
import {EPOCH_NUMBER} from "../utils/constants";
throw error()
const usePoolNameAndMatch = (poolKey: string): {isMatching: boolean} => {
  const epoch = boostRewards.find((epoch) => epoch.number === EPOCH_NUMBER);
  const rewardsData = epoch?.campaigns;

  if (!rewardsData) {
    return {isMatching: false};
  }

  const isMatching = rewardsData.some(
    (pool) => pool.pool.id === poolKey.replace(/0x/g, ""),
  );

  return {isMatching};
};

export default usePoolNameAndMatch;
