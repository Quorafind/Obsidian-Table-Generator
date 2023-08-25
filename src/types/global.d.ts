/// <reference types="svelte" />
/// <reference types="vite/client" />


type AlignMode = "left" | "center" | "right";

type RefsObject = {
    [key in AlignMode]?: HTMLElement;
};

interface Coords {
    top: number;
    left: number;
    bottom: number;
    height: number;
}

