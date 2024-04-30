import { useState, useMemo, useRef } from "react";
import { Upload, Button, Progress } from "antd";
import prettsize from "prettysize";
import { uploadChunks, mergeChunks, verifyUpload } from "../../api/upload";
import { splitFile } from "../../utils/file";
import { calculateHash } from "../../utils/hash";
import { CHUNK_SIZE } from "../../const";
import styles from "./index.module.scss";

let controller: AbortController | null = null;

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const chunkListRef = useRef<
    { chunk: Blob; hash: string; fileHash: string }[]
  >([]);
  const fileHashRef = useRef("");
  const [pause, setPause] = useState(false);

  const beforeUpload = (file: File) => {
    setFile(file);
    // 阻止默认上传
    return false;
  };

  const fileSize = useMemo(() => prettsize(file?.size), [file]);

  const onUpload = async () => {
    if (!file) return;
    // 生成切片
    const fileChunkList = splitFile(file);
    // 生成文件hash值
    fileHashRef.current = await calculateHash(fileChunkList);
    // 查找文件是否存在
    const { exist } = await verifyUpload(file.name, fileHashRef.current);
    if (exist) {
      return;
    }
    // 这里保存一下数据，后续上传进度可能需要用到
    chunkListRef.current = fileChunkList.map((item, i) => ({
      chunk: item.chunk,
      hash: fileHashRef.current + "-" + i,
      fileHash: fileHashRef.current,
    }));
    controller = new AbortController();
    const signal = controller.signal;
    // 上传切片
    await uploadChunks(chunkListRef.current, signal);
    // 合并切片
    await mergeChunks(file.name, fileHashRef.current, CHUNK_SIZE);
  };

  const onDelete = () => setFile(null);

  const onPause = async () => {
    setPause(!pause);
    if (pause) {
      // 这块没必要再判断 exist
      const { serverChunks } = await verifyUpload(
        file!.name,
        fileHashRef.current,
      );
      controller = new AbortController();
      const signal = controller.signal;
      const filterList = chunkListRef.current.filter(
        (item) => !serverChunks.includes(item.hash),
      );
      // 上传切片（这里的signal不能传同一个实例）
      await uploadChunks(filterList, signal);
      // 合并切片
      await mergeChunks(file!.name, fileHashRef.current, CHUNK_SIZE);
    } else {
      controller?.abort();
    }
  };

  return (
    <div className={styles.container}>
      <Upload
        showUploadList={false}
        beforeUpload={beforeUpload}
        className={styles.upload}
      >
        选择文件
      </Upload>
      {!file ? null : (
        <div className={styles.fileInfo}>
          <div className={styles.fileName}>文件名：{file.name}</div>
          <div>文件大小：{fileSize}</div>
        </div>
      )}
      <div className={styles.operation}>
        <Button type="primary" className={styles.optItem} onClick={onUpload}>
          上传
        </Button>
        <Button className={styles.optItem} onClick={onPause}>
          {pause ? "继续" : "暂停"}
        </Button>
        <Button
          type="primary"
          danger
          className={styles.optItem}
          onClick={onDelete}
        >
          删除
        </Button>
      </div>
      <div className={styles.progress}>
        <Progress percent={20} type="line" />
      </div>
    </div>
  );
};

export default UploadFile;
