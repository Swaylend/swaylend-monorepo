import {clsx} from "clsx";

import {forwardRef, memo, ReactNode, useCallback} from "react";

import Loader from "@shared/src/components/common/Loader/Loader";

import styles from "./ActionButton.module.css";

type ButtonType = "button" | "submit" | "reset";
type ButtonVariant = "primary" | "secondary" | "outlined";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  completed?: boolean;
  type?: ButtonType;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const ActionButton = forwardRef<HTMLButtonElement, Props>(function ActionButton(
  {
    children,
    onClick,
    className,
    disabled,
    loading,
    completed,
    type,
    variant,
    fullWidth,
  }: Props,
  ref,
) {
  const handleClick = useCallback(() => {
    if (loading || completed) {
      return;
    }

    if (onClick) {
      onClick();
    }
  }, [loading, completed, onClick]);

  return (
    <button
      className={clsx(
        styles.btn,
        variant === "secondary" && styles.secondary,
        variant === "outlined" && styles.outlined,
        loading && styles.loading,
        completed && styles.completed,
        fullWidth && styles.fullWidth,
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      type={type || "button"}
      ref={ref}
    >
      {loading ? <Loader variant={variant} /> : children}
    </button>
  );
});

export default memo(ActionButton);
