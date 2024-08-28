import { useEffect } from "react";
import d3 from "d3";
import { getDepData } from "@/api";
import styles from "./index.module.scss";

const DepChart = () => {
  useEffect(() => {
    getDepData().then((res) => {
      console.log(res);
    });
  }, []);

  return <div className={styles.container}>依赖分析</div>;
};

export default DepChart;
