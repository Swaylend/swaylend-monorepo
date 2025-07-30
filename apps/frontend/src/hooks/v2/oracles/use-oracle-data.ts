import { useQuery } from '@tanstack/react-query';

export const useOracleData = () => {
  return useQuery({
    queryKey: ['oracleData', 'v2'],
    queryFn: () => {
      return null;
    },
  });
};
