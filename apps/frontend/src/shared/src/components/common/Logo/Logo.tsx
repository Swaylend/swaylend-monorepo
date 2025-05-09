import {memo} from "react";
import Link from "next/link";

import styles from "./Logo.module.css";
import LogoIcon from "@shared/src/components/icons/Logo/LogoIcon";

const Logo = () => {
  return (
    <Link href="/" className={styles.logo}>
      <LogoIcon />
    </Link>
  );
};

export default memo(Logo);
