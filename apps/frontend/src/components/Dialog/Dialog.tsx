import RcDialog from 'rc-dialog';
import type React from 'react';
import 'rc-dialog/assets/index.css';
import './styles.css';
import { ReactComponent as CloseIcon } from '@src/assets/icons/close.svg';
import type { IDialogPropTypes } from 'rc-dialog/lib/IDialogPropTypes';

interface IProps extends IDialogPropTypes {}

const Dialog: React.FC<IProps> = ({ children, ...rest }) => {
  return (
    <RcDialog
      closeIcon={<CloseIcon style={{ marginTop: 8 }} />}
      animation="zoom"
      maskAnimation="fade"
      {...rest}
    >
      {children}
    </RcDialog>
  );
};
export default Dialog;
