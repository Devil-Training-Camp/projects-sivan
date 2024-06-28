import { useState } from "react";
import { Upload } from "antd";
import FileItem from "@/components/FileItem";
import styles from "./index.module.scss";

const UploadFile = () => {
  const [filesList, setFilesList] = useState<File[]>([]); // 文件列表

  const beforeUpload = (_: File, fileList: File[]) => {
    const newList = [...filesList];
    fileList.forEach((file) => {
      const isRepeat = filesList.some((item) => item.name === file.name && item.size === file.size);
      if (!isRepeat) {
        newList.push(file);
      }
    });
    setFilesList(newList);
    // 阻止默认上传
    return false;
  };

  const deleteFile = (file: File) => {
    const newList = filesList.filter((item) => item.name !== file.name);
    setFilesList(newList);
  };

  return (
    <div className={styles.container}>
      <Upload showUploadList={false} multiple beforeUpload={beforeUpload} className={styles.upload}>
        选择文件
      </Upload>
      {filesList.map((file: File) => (
        <FileItem key={file.name} file={file} deleteFile={deleteFile} />
      ))}
    </div>
  );
};

export default UploadFile;
