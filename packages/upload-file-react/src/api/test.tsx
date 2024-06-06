/* const paralleSize = 3;
  const total = fileChunkList.length;
  const doUpload = async (chunkList: IChunk[]) => {
    const pool: Promise<any>[] = [];
    let finish = 0;
    const failList: IChunk[] = [];
    for (let i = 0; i < chunkList.length; i++) {
      const item = chunkList[i];
      const formData = new FormData();
      formData.append("chunk", item.chunk);
      formData.append("chunkName", item.chunkName);
      formData.append("fileHash", fileHash);
      const onUploadProgress = createProgressHandler(i + finishCount);
      const task = (async () => {
        return await instance.post(UPLOAD_CHUNK, formData, {
          signal,
          onUploadProgress,
        });
      })();
      task
        .then((res) => {
          finish++;
          const j = pool.findIndex((t) => t === task);
          pool.splice(j, 1);
        })
        .catch((err) => {
          failList.push(item);
        })
        .finally(() => {
          if (finish < chunkList.length) {
            doUpload(failList);
          }
        });
      pool.push(task);
      if (pool.length === paralleSize) {
        await Promise.race(pool);
      }
    }
  };
  await doUpload(fileChunkList); */
