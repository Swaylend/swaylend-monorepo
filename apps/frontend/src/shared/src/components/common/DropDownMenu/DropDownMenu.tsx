import React, {forwardRef, MutableRefObject} from "react";
import styles from "./DropDownMenu.module.css";
import clsx from "clsx";

type DropDownMenuProps = {
  buttons: {
    icon: React.FC;
    text: string;
    onClick: () => void;
    disabled?: boolean;
    tooltip?: string;
  }[];
  children?: React.ReactNode;
};

const DropDownMenu = forwardRef<HTMLUListElement, DropDownMenuProps>(
  function DropDownMenu({buttons, children}, ref) {
    return (
      <>
        <ul className={styles.menuList} ref={ref}>
          {buttons.map((button) => (
            <li key={button.text}>
              <button
                className={clsx(
                  button.disabled
                    ? styles.menuButtonDisabled
                    : styles.menuButton,
                )}
                onClick={button.onClick}
              >
                <button.icon />
                <span>{button.text}</span>
                {button.disabled && button.tooltip && (
                  <div className={styles.tooltip}>{button.tooltip}</div>
                )}
              </button>
            </li>
          ))}
          {children && <div>{children}</div>}
        </ul>
      </>
    );
  },
);

export default DropDownMenu;
