import { useState, useRef, useMemo } from "react";
import { Upload, Button, Progress, message } from "antd";
import { type AxiosProgressEvent } from "axios";
import prettsize from "prettysize";
import { uploadChunks, mergeChunks, verifyUpload } from "@/api/upload";
import { CHUNK_SIZE } from "@/const";
import TaskQueue from "@/utils/concurrent";
import { splitFile } from "@/utils/file";
import { calculateHash } from "@/utils/hash";
import styles from "./index.module.scss";

let controller: AbortController | null = null;

export interface IChunk {
  chunk: Blob;
  chunkName: string;
  progress: number;
  index: number;
}

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null); // 文件
  const [hashProgress, setHashProgress] = useState(0); // hash计算进度
  const [chunks, setChunks] = useState<IChunk[]>([]); // 切片列表
  const hashRef = useRef(""); // 文件hash值
  const [pause, setPause] = useState(false);
  const [isExist, setIsExist] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

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
      setChunks((prev) => {
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

  // 更新文件hash计算进度
  const updateHashProgress = (progress: number) => setHashProgress(progress);

  // 保存文件
  const beforeUpload = (file: File) => {
    setFile(file);
    // 阻止默认上传
    return false;
  };

  const onUpload = async () => {
    if (!file) return;
    // 生成切片
    const fileChunkList = splitFile(file);
    // 生成文件hash值
    const fileHash = await calculateHash({
      chunks: fileChunkList,
      updateHashProgress,
    });
    hashRef.current = fileHash;
    // 查找文件是否存在
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exist, cacheChunks } = await verifyUpload({ fileName: file.name, fileHash }); // TODO
    if (exist) {
      setIsExist(exist);
      success();
      return;
    }
    // 这里保存一下数据，后续上传进度可能需要用到
    const formatList = fileChunkList.map((item, i) => ({
      chunk: item.chunk,
      chunkName: fileHash + "-" + i,
      progress: 0,
      index: i,
    }));
    setChunks(formatList);
    controller = new AbortController();
    const signal = controller.signal;
    // 创建taskQueue实例，并发控制
    const taskQueue = new TaskQueue(3);
    // 上传切片
    await uploadChunks(formatList, fileHash, signal, createProgressHandler, taskQueue);
    // 成功上传切片数，判断切片是否全部上传
    const uploadedCount = await taskQueue.waitForAllTasks();
    if (uploadedCount === formatList.length) {
      // 合并切片
      await mergeChunks(file.name, fileHash, CHUNK_SIZE);
      success();
    }
  };

  const onDelete = () => setFile(null);

  const onPause = async () => {
    setPause(!pause);
    if (pause) {
      // 这块没必要再判断 exist
      const { cacheChunks } = await verifyUpload({ fileName: file!.name, fileHash: hashRef.current });
      controller = new AbortController();
      const signal = controller.signal;
      const filterList = chunks.filter((item) => !cacheChunks?.includes(item.chunkName));
      // 上传切片（这里的signal不能传同一个实例）
      await uploadChunks(filterList, hashRef.current, signal, createProgressHandler, cacheChunks?.length);
      // 合并切片
      await mergeChunks(file!.name, hashRef.current, CHUNK_SIZE);
      success();
    } else {
      controller?.abort();
    }
  };

  const percent = useMemo(() => {
    if (!file || !chunks.length) return 0;
    const loaded = chunks.map((item) => item.progress * item.chunk.size).reduce((sum, next) => sum + next);
    return Number((loaded / file.size).toFixed(2));
  }, [file, chunks]);

  return (
    <div className={styles.container}>
      {contextHolder}
      <Upload showUploadList={false} beforeUpload={beforeUpload} className={styles.upload}>
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
        <Button type="primary" danger className={styles.optItem} onClick={onDelete}>
          删除
        </Button>
      </div>
      <div className={styles.progress}>
        <div>
          hash计算进度：
          <Progress percent={hashProgress} type="line" />
        </div>
        <div>
          文件上传进度：
          <Progress percent={isExist ? 100 : percent} type="line" />
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
