import { ReactNode, useState } from 'react';
import { modal, setAppTempNode } from '../App';
import { Drawer, DrawerProps, GetProps, Input, ModalFuncProps, Radio } from 'antd';
import { DisabledContextProvider } from 'antd/es/config-provider/DisabledContext';

/**非受控的Input，无需useState */
export function TempInput({
  vref,
  ...otherProps
}: Omit<GetProps<typeof Input>, 'value' | 'onChange' | 'onInput' | 'defaultValue'> & {
  vref: { value: string };
}) {
  return <Input {...otherProps} defaultValue={vref.value} onChange={({ target: { value } }) => (vref.value = value)} />;
}
/**非受控的Radio.Group，无需useState */
export function TempRadioGroup<T>({
  vref,
  ...otherProps
}: Omit<GetProps<typeof Radio.Group>, 'value' | 'onChange' | 'defaultValue'> & {
  vref: { value: T };
}) {
  return <Radio.Group {...otherProps} defaultValue={vref.value} onChange={({ target: { value } }) => (vref.value = value)} />;
}

function StateDisabledContextProvider({
  stateSetterReceiver,
  children,
}: {
  stateSetterReceiver: (setter: (disabled: boolean) => void) => void;
  children: ReactNode;
}) {
  const [disabled, setDisabled] = useState(false);
  stateSetterReceiver(setDisabled);
  return <DisabledContextProvider disabled={disabled}>{children}</DisabledContextProvider>;
}

/**显示对话框，无需useState。
 * 当onConfirm未resolve时，将显示加载UI，并禁用按钮等组件。
 *
 * 返回一个Promise，在点击确定且onConfirm兑现后，兑现为true；点击取消时兑现为false。
 */
export function showModal({
  content,
  onConfirm,
  okButtonProps,
  ...otherProps
}: ModalFuncProps & { onConfirm: () => Promise<void | boolean> }): Promise<boolean> {
  return new Promise((rs) => {
    //设置弹窗内部组件的disabled状态（不包括弹窗本身ok按钮）
    let setDisabled: (disabled: boolean) => void;
    const newContent = <StateDisabledContextProvider stateSetterReceiver={(setState) => (setDisabled = setState)}>{content}</StateDisabledContextProvider>;
    const instance = modal.confirm({
      ...otherProps,
      content: newContent,
      closable: true,
      keyboard: true,
      maskClosable: true,
      okButtonProps,
      cancelButtonProps: {},
      onCancel() {
        rs(false);
      },
      async onOk() {
        instance.update({
          ...otherProps,
          closable: false,
          keyboard: false,
          maskClosable: false,
          okButtonProps: { ...okButtonProps, loading: true },
          cancelButtonProps: { disabled: true },
          content: newContent,
        });
        setDisabled(true);
        const result = await onConfirm();
        if (result === false) {
          setDisabled(false);
          instance.update({
            ...otherProps,
            content: newContent,
            closable: true,
            keyboard: true,
            maskClosable: true,
            okButtonProps,
            cancelButtonProps: {},
          });
          return Promise.reject('onConfirm return false');
        }
        instance.destroy();
        rs(true);
      },
    });
  });
}

function TempDrawer({ ...otherProps }: DrawerProps) {
  const [open, setOpen] = useState(true);
  return <Drawer {...otherProps} closable open={open} onClose={() => setOpen(false)} />;
}

let drawerId = 0; //提供不同的key，强制React视每个Drawer为不同实例
/**立即显示一个新的Drawer */
export function showDrawer({ ...otherProps }: DrawerProps) {
  setAppTempNode(<TempDrawer key={drawerId++} {...otherProps} />);
}
