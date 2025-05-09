import styles from "./Loader.module.css";
import {clsx} from "clsx";

type Props = {
  variant?: "primary" | "secondary" | "outlined";
  color?: "gray"; //Add more color options if required
};

const Loader = ({variant, color}: Props) => {
  return (
    <div
      className={clsx(
        styles.loader,
        variant === "outlined" && styles.outlined,
        color && styles[`${color}`],
      )}
    />
  );
};

export default Loader;
