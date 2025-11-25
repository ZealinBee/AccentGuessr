import type { Accent } from "./Accent";
import type { Clip } from "./Clip";

interface Speaker {
    id: number;
    clips: Clip[];
    accent: Accent;
    medianScore?: number;
}

export type { Speaker };