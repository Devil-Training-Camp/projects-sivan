import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import { version } from "../package.json";
import { analysis } from "./services/analysis";

export const main = async () => {
  const program = new Command();
  program.version(version, "-v, --version", "显示命令版本(display version for command)");
  program
    .command("analyze <lockPath>")
    .alias("ana")
    .description("模块依赖分析(Module dependency analysis)")
    .option("-d, --depth <n>", "限制递归分析深度(Limit the depth of recursive analysis)")
    .option("-j, --json <path>", "生成JSON文件到指定目录(Generate a JSON file to specified directory)")
    .action(async (lockPath, { depth, json }) => {
      await analysis({ lockPath, depth, json });
      /* const answers = await inquirer.prompt({
        type: "confirm",
        name: "result",
        message: "是否确定分析模块依赖？(Are you sure to analyze module dependencies?)",
        default: true,
      });
      if (answers.result) {
        await analysis({ lockPath, depth, json });
        const spinner = ora("正在解析模块依赖...").start();
        setTimeout(() => {
          spinner.succeed("模块依赖解析成功!");
        }, 3000);
      } else {
        console.log(chalk.green("已取消"));
      } */
    });
  program.parse(process.argv);

  // 如果命令行没有参数，展示帮助文档
  if (!program.args[0]) {
    program.help();
  }
};
