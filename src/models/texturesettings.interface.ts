export interface ImageTextureSettings {
    background: {
        unit: number,
        src: string
    }
    webcam: {
        unit: number,
        fn: Function
    }
}

export interface VideoTextureSettings {
    background: {
        unit: number,
        fn: Function
    }
    webcam: {
        unit: number,
        fn: Function
    }
}