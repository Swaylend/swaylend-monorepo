import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {RewardsApiUrl} from "../utils/constants";

interface RewardsResponse {
  rewardsAmount: number;
  userId: string;
  epochNumbers: number[];
  poolIds: string[];
}
throw error()
interface UseRewardsParams {
  userId: string | null;
  epochNumbers: number | number[];
  poolIds: string;
}

interface UseRewardsReturn {
  rewardsAmount: number;
  isLoading: boolean;
}

export const useRewards = ({
  userId,
  epochNumbers,
  poolIds,
}: UseRewardsParams): UseRewardsReturn => {
  const queryKey = ["rewards", userId, epochNumbers, poolIds];

  const fetchRewards = async (): Promise<RewardsResponse> => {
    const response = await axios.get<RewardsResponse>(RewardsApiUrl, {
      params: {
        userId,
        epochNumbers,
        poolIds,
      },
    });
    return response.data;
  };

  const {data, isLoading} = useQuery({
    queryKey,
    queryFn: fetchRewards,
    enabled: Boolean(userId) && poolIds.length > 0,
  });

  return {
    rewardsAmount: data?.rewardsAmount || 0,
    isLoading,
  };
};
