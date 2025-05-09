import {memo, ReactNode} from "react";
import styles from "./IconButton.module.css";
import {clsx} from "clsx";

type Props = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
};

const IconButton = ({children, onClick, className, type}: Props) => {
  return (
    <button
      className={clsx(styles.iconButton, className)}
      onClick={onClick}
      type={type ?? "button"}
    >
      {children}
    </button>
  );
};

export default memo(IconButton);
