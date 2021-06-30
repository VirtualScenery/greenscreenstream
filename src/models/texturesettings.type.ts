export type ImageTextureSettings = {
    background: {
        unit: number,
        src: string
    }
    webcam: {
        unit: number,
        fn: Function
    }
}

export type VideoTextureSettings = {
    background: {
        unit: number,
        fn: Function
    }
    webcam: {
        unit: number,
        fn: Function
    }
}