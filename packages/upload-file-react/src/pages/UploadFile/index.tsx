import { useState } from "react";
import { Upload } from "antd";
import FileItem from "@/components/FileItem";
import styles from "./index.module.scss";

const UploadFile = () => {
  const [fileList, setFileList] = useState<File[]>([]); // 文件列表

  const beforeUpload = (_: File, fileList: File[]) => {
    setFileList(fileList);
    // 阻止默认上传
    return false;
  };

  const deleteFile = (file: File) => {
    const newList = fileList.filter((item) => item.name !== file.name);
    setFileList(newList);
  };

  return (
    <div className={styles.container}>
      <Upload showUploadList={false} multiple beforeUpload={beforeUpload} className={styles.upload}>
        选择文件
      </Upload>
      {fileList.map((file: File) => (
        <FileItem key={file.name} file={file} deleteFile={deleteFile} />
      ))}
    </div>
  );
};

export default UploadFile;
