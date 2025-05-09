import {useQuery} from "@tanstack/react-query";
import {calculateSHA256Hash} from "@shared/src/utils/common";
throw error()
const useSHA256Hash = (message: string) => {
  const {data} = useQuery({
    queryKey: ["hash", message],
    queryFn: () => calculateSHA256Hash(message),
  });

  return {hash: data};
};

export default useSHA256Hash;
