import { useState, useMemo } from "react";
import { Upload, Button, Progress, message } from "antd";
import { type AxiosProgressEvent } from "axios";
import prettsize from "prettysize";
import { uploadChunks, mergeChunks, verifyUpload } from "@/api/upload";
import { CHUNK_SIZE } from "@/const";
import { splitFile } from "@/utils/file";
import { calculateHash } from "@/utils/hash";
import styles from "./index.module.scss";

let controller: AbortController | null = null;

export interface IChunk {
  chunk: Blob;
  hash: string;
  fileHash: string;
  progress: number;
  index: number;
}

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [chunkList, setChunkList] = useState<IChunk[]>([]);
  const [fileHash, setFileHash] = useState("");
  const [pause, setPause] = useState(false);
  const [isExist, setIsExist] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const beforeUpload = (file: File) => {
    setFile(file);
    // 阻止默认上传
    return false;
  };

  const fileSize = useMemo(() => prettsize(file?.size), [file]);

  const success = () => {
    messageApi.open({
      type: "success",
      content: "上传成功",
    });
  };

  // 创建chunk上传的progress监听函数
  const createProgressHandler = (index: number) => {
    return (e: AxiosProgressEvent) => {
      setChunkList((prev) => {
        // react无法监听到数组的变化，需要改变引用地址
        const newList = prev.concat([]);
        const chunk = newList.find((item) => item.index === index);
        if (chunk) {
          chunk.progress = e.progress! * 100;
        }
        return newList;
      });
    };
  };

  const onUpload = async () => {
    if (!file) return;
    // 生成切片
    const fileChunkList = splitFile(file);
    // 生成文件hash值
    const fHash = await calculateHash(fileChunkList);
    setFileHash(fHash);
    // 查找文件是否存在
    const { exist } = await verifyUpload(file.name, fHash);
    if (exist) {
      setIsExist(exist);
      success();
      return;
    }
    // 这里保存一下数据，后续上传进度可能需要用到
    const cList = fileChunkList.map((item, i) => ({
      chunk: item.chunk,
      hash: fHash + "-" + i,
      fileHash: fHash,
      progress: 0,
      index: i,
    }));
    setChunkList(cList);
    controller = new AbortController();
    const signal = controller.signal;
    // 上传切片
    await uploadChunks(cList, signal, createProgressHandler);
    // 合并切片
    await mergeChunks(file.name, fHash, CHUNK_SIZE);
    success();
  };

  const onDelete = () => setFile(null);

  const onPause = async () => {
    setPause(!pause);
    if (pause) {
      // 这块没必要再判断 exist
      const { serverChunks } = await verifyUpload(file!.name, fileHash);
      controller = new AbortController();
      const signal = controller.signal;
      const filterList = chunkList.filter(
        (item) => !serverChunks?.includes(item.hash),
      );
      // 上传切片（这里的signal不能传同一个实例）
      await uploadChunks(
        filterList,
        signal,
        createProgressHandler,
        serverChunks?.length,
      );
      // 合并切片
      await mergeChunks(file!.name, fileHash, CHUNK_SIZE);
      success();
    } else {
      controller?.abort();
    }
  };

  const percent = useMemo(() => {
    if (!file || !chunkList.length) return 0;
    const loaded = chunkList
      .map((item) => item.progress * item.chunk.size)
      .reduce((sum, next) => sum + next);
    return Number((loaded / file.size).toFixed(2));
  }, [file, chunkList]);

  return (
    <div className={styles.container}>
      {contextHolder}
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
        <Progress percent={isExist ? 100 : percent} type="line" />
      </div>
    </div>
  );
};

export default UploadFile;
