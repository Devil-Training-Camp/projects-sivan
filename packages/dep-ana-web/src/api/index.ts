import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

export const getDepData = async () => {
  const res = await instance.get("/deps");
  return res.data.data;
};
