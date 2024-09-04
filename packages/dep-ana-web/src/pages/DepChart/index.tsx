import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { type SimulationNodeDatum } from "d3";
// import { getDepData } from "@/api";
import { data } from "@/data";
import styles from "./index.module.scss";

const DepChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  /* useEffect(() => {
    getDepData().then((res) => {
      console.log(res);
    });
  }, []); */

  useEffect(() => {
    // 指定图表的尺寸
    const width = 928;
    const height = 600;
    // 指定颜色比例
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    // 力模拟会改变链接和节点，因此需要创建一个副本，以便重新评估该单元格时产生相同的结果。
    const links = data.links.map((d) => ({ ...d }));
    const nodes = data.nodes.map((d) => ({ ...d })) as SimulationNodeDatum[];
    // 创建一个包含多个力的模拟
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.id),
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);
    // 创建 SVG 容器
    const svg = d3
      .select(svgRef.current)
      // .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");
    // 为每个链接添加一条线，为每个节点添加一个圆
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll()
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll()
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", (d) => color(d.group));

    node.append("title").text((d) => d.id);
    // 添加拖动行为
    node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));
    // 在每次模拟触发时设置链接和节点的位置属性
    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }
    // 开始拖动时重新加热模拟，并固定主体位置
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    // 在拖动过程中更新主体（被拖动节点）的位置
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    // 恢复目标阿尔法值，以便在拖动结束后冷却模拟。由于主体不再被拖动，因此取消修正主体位置
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    // 当重新运行该单元时，停止之前的模拟。(这其实并不重要，因为目标阿尔法值为零，模拟会自然停止，但这是一个好的做法）
    // invalidation.then(() => simulation.stop());
  }, []);

  return (
    <div className={styles.container}>
      <div>依赖分析</div>
      <svg ref={svgRef} />
    </div>
  );
};

export default DepChart;
