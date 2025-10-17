import type { Clip } from "./Clip";

interface Speaker {
    lat: number;
    lng: number;
    id: number;
    clips: Clip[];
}

export type { Speaker };