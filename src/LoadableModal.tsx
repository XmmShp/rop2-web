import { ConfigProvider, GetProps, Modal } from "antd";
import { useState } from "react";

export default function LoadableModal({ onOk, cancelButtonProps, children, ...otherProps }: Omit<GetProps<typeof Modal>, 'onOk' | 'closable' | 'keyboard' | 'maskClosable'> & { onOk: () => Promise<unknown> }) {
  const [loading, setLoading] = useState(false);
  return (<Modal {...otherProps} onOk={async () => {
    setLoading(true);
    await onOk();
    setLoading(false);
  }}
    closable={!loading}
    keyboard={!loading}
    maskClosable={!loading}
    cancelButtonProps={{ ...cancelButtonProps, disabled: loading }}
    confirmLoading={loading}
  >
    <ConfigProvider componentDisabled={loading}>
      {children}
    </ConfigProvider>
  </Modal>);
}