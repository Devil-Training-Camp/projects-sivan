import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 5 * 1000,
});

export const testApi = async () => {
  const res = await instance.get("/file/find");
  return res.data;
};
