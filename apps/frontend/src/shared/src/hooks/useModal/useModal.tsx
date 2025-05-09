import {ReactNode, ReactPortal, useCallback, useEffect, useState} from "react";
import {createPortal} from "react-dom";

import styles from "./Modal.module.css";
import {clsx} from "clsx";
import IconButton from "@shared/src/components/common/IconButton/IconButton";
import CloseIcon from "@shared/src/components/icons/Close/CloseIcon";
import {useScrollLock} from "usehooks-ts";

type ModalProps = {
  title: string | ReactNode;
  titleClassName?: string;
  children: ReactNode;
  className?: string;
  onClose?: VoidFunction;
};

type ReturnType = (props: ModalProps) => ReactPortal | null;

const useModal = (): [ReturnType, () => void, () => void] => {
  const [isOpen, setIsOpen] = useState(false);

  const {lock, unlock} = useScrollLock({autoLock: false});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
    lock();
  }, [lock]);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    unlock();
  }, [unlock]);

  const Modal = ({
    title,
    titleClassName,
    children,
    className,
    onClose,
  }: ModalProps) =>
    isOpen
      ? createPortal(
          <>
            <div
              className={styles.modalBackdrop}
              onClick={() => {
                if (onClose) {
                  onClose();
                }
                closeModal();
              }}
            />
            <div className={clsx(styles.modalWindow, className)}>
              <div className={styles.modalHeading}>
                <div className={clsx(styles.modalTitle, titleClassName)}>
                  {title}
                </div>
                <IconButton
                  onClick={() => {
                    if (onClose) {
                      onClose();
                    }
                    closeModal();
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </div>
              {children}
            </div>
          </>,
          document.body,
        )
      : null;

  return [Modal, openModal, closeModal];
};

export default useModal;
