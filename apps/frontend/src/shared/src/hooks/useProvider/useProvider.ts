import {Provider} from "fuels";
import {NetworkUrl} from "@shared/src/utils/constants";
import {useQuery} from "@tanstack/react-query";

const useProvider = () => {
  const {data} = useQuery({
    queryKey: ["provider"],
    queryFn: () => new Provider(NetworkUrl),
    staleTime: Infinity,
  });

  return data;
};

export default useProvider;
