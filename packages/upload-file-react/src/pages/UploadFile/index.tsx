import { Upload, Button } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import styles from "./index.module.scss";

const UploadFile = () => {
  const onChange = (info: UploadChangeParam) => {
    console.log(info);
  };

  return (
    <div className={styles.container}>
      <Upload
        showUploadList={false}
        onChange={onChange}
        className={styles.upload}
      >
        选择文件
      </Upload>
      <div className={styles.operation}>
        <Button type="primary" className={styles.optItem}>
          上传
        </Button>
        <Button className={styles.optItem}>暂停</Button>
      </div>
    </div>
  );
};

export default UploadFile;
