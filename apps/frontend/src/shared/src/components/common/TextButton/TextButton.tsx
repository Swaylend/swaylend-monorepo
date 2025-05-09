import {memo, ReactNode} from "react";

import styles from "./TextButton.module.css";

type Props = {
  children: ReactNode;
  onClick: VoidFunction;
};

const TextButton = ({children, onClick}: Props) => {
  return (
    <button className={styles.textButton} onClick={onClick}>
      {children}
    </button>
  );
};

export default memo(TextButton);
