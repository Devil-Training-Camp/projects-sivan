import { useState, useMemo } from "react";
import { Upload, Button } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import prettsize from "prettysize";
import { splitFile } from "../../utils/file";
import styles from "./index.module.scss";

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);

  const beforeUpload = (file: File) => {
    setFile(file);
    // 阻止默认上传
    return false;
  };

  const fileSize = useMemo(() => prettsize(file?.size), [file]);

  const onChange = (info: UploadChangeParam) => {};

  const onUpload = () => {
    if (!file) return;
    const fileChunkList = splitFile(file);
    console.log(fileChunkList);
  };

  const onDelete = () => setFile(null);

  return (
    <div className={styles.container}>
      <Upload
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={onChange}
        className={styles.upload}
      >
        选择文件
      </Upload>
      <div className={styles.operation}>
        <Button type="primary" className={styles.optItem} onClick={onUpload}>
          上传
        </Button>
        <Button className={styles.optItem}>暂停</Button>
        <Button
          type="primary"
          danger
          className={styles.optItem}
          onClick={onDelete}
        >
          删除
        </Button>
      </div>
      {!file ? null : <div>文件大小为{fileSize}</div>}
    </div>
  );
};

export default UploadFile;
