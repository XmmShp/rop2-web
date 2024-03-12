import { ReactNode, useState } from 'react';
import { modal, setAppTempNode } from '../App';
import { Drawer, DrawerProps, GetProps, Input, ModalFuncProps } from 'antd';
import { DisabledContextProvider } from 'antd/es/config-provider/DisabledContext';

/**非受控的Input，无需useState */
export function TempInput({ vref, ...otherProps }: Omit<GetProps<typeof Input>, 'value' | 'onChange' | 'onInput' | 'defaultValue'> & {
  vref: { value: string }
}) {
  return (<Input {...otherProps} defaultValue={vref.value} onChange={({ target: { value } }) => vref.value = value} />);
}

function StateDisabledContextProvider({ receiver, children }: { receiver: (setter: (disabled: boolean) => void) => void, children: ReactNode }) {
  const [disabled, setDisabled] = useState(false);
  receiver(setDisabled);
  return (<DisabledContextProvider disabled={disabled}>
    {children}
  </DisabledContextProvider>);
}

/**显示对话框，无需useState，当onConfirm未resolve时，将显示加载UI */
export function showModal({ content, onConfirm, okButtonProps, ...otherProps }: ModalFuncProps & { onConfirm: () => Promise<void> }): Promise<boolean> {
  return new Promise((rs) => {
    let setter: (disabled: boolean) => void;
    const newContent = (<StateDisabledContextProvider receiver={(setState) => setter = setState}>
      {content}
    </StateDisabledContextProvider>);
    const instance = modal.confirm({
      ...otherProps,
      content: newContent,
      closable: true,
      keyboard: true,
      maskClosable: true,
      okButtonProps,
      cancelButtonProps: {},
      onCancel() { rs(false) },
      async onOk() {
        instance.update({
          ...otherProps,
          closable: false,
          keyboard: false,
          maskClosable: false,
          okButtonProps: { ...okButtonProps, loading: true },
          cancelButtonProps: { disabled: true },
          content: newContent
        });
        setter(true);
        await onConfirm();
        instance.destroy();
        rs(true);
      }
    });
  });
}

function TempDrawer({ ...otherProps }: DrawerProps) {
  const [open, setOpen] = useState(true);
  return <Drawer {...otherProps}
    closable open={open} onClose={() => setOpen(false)} />
}

let drawerId = 0;//提供不同的key，强制React视每个Drawer为不同实例
/**立即显示一个新的Drawer */
export function showDrawer({ ...otherProps }: DrawerProps) {
  setAppTempNode(<TempDrawer key={drawerId++} {...otherProps} />);
}