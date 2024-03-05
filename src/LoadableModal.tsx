import { GetProps, Modal } from "antd";
import { useState } from "react";

export default function LoadableModal({ onOk, cancelButtonProps, ...otherProps }: Omit<GetProps<typeof Modal>, 'onOk'> & { onOk: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  return (<Modal {...otherProps} onOk={async () => {
    setLoading(true);
    await onOk?.();
    setLoading(false);
  }}
    closable={!loading}
    keyboard={!loading}
    maskClosable={!loading}
    cancelButtonProps={{ ...cancelButtonProps, disabled: loading }}
    confirmLoading={loading}
  />);
}