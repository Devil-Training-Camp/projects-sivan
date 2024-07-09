import { useState } from "react";
import { RcFile } from "antd/es/upload";
import { Upload } from "antd";
import FileItem from "@/components/FileItem";
import styles from "./index.module.scss";

const UploadFile = () => {
  const [filesList, setFilesList] = useState<File[]>([]); // 文件列表

  const beforeUpload = (_: RcFile, fileList: RcFile[]) => {
    const newList = [...filesList];
    fileList.forEach((file) => {
      const isRepeat = (filesList as RcFile[]).some((item) => item.uid === file.uid);
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
