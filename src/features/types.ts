import type { World } from "../lib/model";
import type { Command } from "../lib/api";
export type Props = { world: World; act: (c: Command) => Promise<boolean> };
