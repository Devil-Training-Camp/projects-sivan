import { type IDepGraph } from "../types";

export abstract class BaseDepGraph {
  abstract parse(): Promise<any>;
}
