import { useState, useRef, useMemo } from "react";
import { NoticeType } from "antd/es/message/interface";
import { Button, Progress, message } from "antd";
import type { ProgressProps } from "antd";
import { type AxiosProgressEvent } from "axios";
import prettsize from "prettysize";
import { uploadChunks, mergeChunks, verifyUpload } from "@/api/upload";
import { CHUNK_SIZE } from "@/const";
import { IChunk } from "@/types";
import TaskQueue from "@/utils/concurrent";
import { splitFile } from "@/utils/file";
import { calculateHash } from "@/utils/hash";
import styles from "./index.module.scss";

let controller: AbortController | null = null;

interface IProps {
  file: File;
  deleteFile: (file: File) => void;
}

const FileItem = (props: IProps) => {
  const { file, deleteFile } = props;
  const [hashProgress, setHashProgress] = useState(0); // hash计算进度
  const [chunks, setChunks] = useState<IChunk[]>([]); // 切片列表
  const hashRef = useRef(""); // 文件hash值
  const [fileProgressStatus, setFileProgressStatus] = useState<ProgressProps["status"]>("normal"); // 文件上传进度条 status
  const [pause, setPause] = useState(false); // 暂停
  const [isExist, setIsExist] = useState(false); // 文件是否已存在，判断秒传
  const [messageApi, contextHolder] = message.useMessage();

  const fileSize = useMemo(() => prettsize(file?.size), [file]);

  const messageOpen = (content: string, type?: NoticeType) => {
    messageApi.destroy();
    messageApi.open({
      type,
      content,
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

  const doUpload = async (chunkList: IChunk[], fileHash: string, cacheCount: number) => {
    controller = new AbortController();
    const signal = controller.signal;
    // 创建taskQueue实例，并发控制
    const taskQueue = new TaskQueue(3);
    // 上传切片（这里的signal不能传同一个实例）
    await uploadChunks(chunkList, fileHash, signal, createProgressHandler, taskQueue, cacheCount);
    // 成功上传切片数，判断切片是否全部上传
    const uploadedCount = await taskQueue.waitForAllTasks();
    if (uploadedCount === chunkList.length) {
      // 合并切片
      const mergeRes = await mergeChunks(file!.name, fileHash, CHUNK_SIZE);
      if (mergeRes.code === 0) {
        messageOpen("上传成功", "success");
        setFileProgressStatus("success");
      } else {
        messageOpen(mergeRes.data?.msg, "error");
        setFileProgressStatus("exception");
      }
    }
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
    const { exist, cacheChunks } = await verifyUpload(file.name, fileHash);
    if (exist) {
      setIsExist(exist);
      messageOpen("上传成功", "success");
      setFileProgressStatus("success");
      return;
    }
    // 这里保存一下数据，后续上传进度可能需要用到
    const formatList = fileChunkList.map((item, i) => ({
      chunk: item.chunk,
      chunkName: fileHash + "-" + i,
      progress: cacheChunks?.includes(fileHash + "-" + i) ? 100 : 0,
      index: i,
    }));
    setChunks(formatList);
    // 过滤已上传切片
    const filterList = formatList.filter((item) => !cacheChunks?.includes(item.chunkName));
    // 上传
    doUpload(filterList, fileHash, cacheChunks?.length);
  };

  const onDelete = () => deleteFile(file);

  const onPause = async () => {
    if (!file) {
      messageOpen("请选择文件", "warning");
      return;
    }
    if (!hashRef.current) {
      messageOpen("请上传文件", "warning");
      return;
    }
    if (isExist) {
      messageOpen("文件已存在", "info");
      return;
    }
    setPause(!pause);
    if (pause) {
      const { exist, cacheChunks } = await verifyUpload(file!.name, hashRef.current);
      if (exist) {
        setIsExist(true);
        messageOpen("文件已存在", "info");
        return;
      }
      // 过滤已上传切片
      const filterList = chunks.filter((item) => !cacheChunks?.includes(item.chunkName));
      // 上传
      doUpload(filterList, hashRef.current, cacheChunks?.length);
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
    <>
      {contextHolder}
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
          <Progress percent={isExist ? 100 : percent} type="line" status={fileProgressStatus} />
        </div>
      </div>
    </>
  );
};

export default FileItem;
