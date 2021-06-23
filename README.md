# GreenScreenStream

 ## about

Generate a new MediaStream for `<canvas>` ,`<video>`  elements based on provided MediaStreamTrack and a background image/video just using JavaScript.  

After processed and "green screened" you can capture the stream and use it in your RTCPeerConnections for instance.

all rendering is made realtime using a WebGL2 pixel shader (glsl) and  machine-learing.

*Regards Magnus Thor*
 
## install

    npm install greenscreenstream  

## examples

Below you find a few different examples of greenscreenstream.


 [https://coloquium.github.io/greenscreenstream/example/mlWebGL ](https://coloquium.github.io/greenscreenstream/example/mlWebGL)

 [https://coloquium.github.io/greenscreenstream/example/WebGL#snow.mp4 ](https://coloquium.github.io/greenscreenstream/example/WebGL#snow.mp4)
 
 [https://coloquium.github.io/greenscreenstream/example/hologram ](https://coloquium.github.io/greenscreenstream/example/hologram)

 [https://coloquium.github.io/greenscreenstream/example/procedual ](https://coloquium.github.io/greenscreenstream/example/procedual)

 [https://coloquium.github.io/greenscreenstream/example/WebGL ](https://coloquium.github.io/greenscreenstream/example/WebGL)


> See `/example/` folder in repo for implementation. 

# GreenScreenStream API
## constructor

Create an instance of GreenScreenStream


    constructor(greenScreenMethod: GreenScreenMethod,canvas?: HTMLCanvasElement, width?: number, height?: number)

## methods

###  initialize

Initlialize the GreenScreenStream with the provided background (image or video) and settings.

    initialize(backgroundUrl?: string, config?: MaskSettings): Promise<boolean> 
### addVideoTrack

Adds a `MediaStreamTrack` track (i.e webcam)

    addVideoTrack(track:  MediaStreamTrack):  void;

### start

Start render the greenscreen

    start():void

### stop():void

Stop render the greenscreen

    stop(stopMediaStreams?:boolean):void

### captureStream

Capture the rendered result to a MediaStream that you apply to your `<video>` element.

    captureStream(fps?:  number):  MediaStream;    

### getColorsFromStream

Get the most dominant color and a list (palette) of the colors most common in the provided MediaStreamTrack.

     getColorsFromStream(): { palette: any, dominant: any } {

### setChromaKey

Pass a mask (rgb), color to the shader , to use as a mask.   Should be the `dominant color`, or on of the `palette` colors detected. See `getColorsFromStream` 


        setChromaKey(r: number, g: number, b: number, threshold?: number): void;

### setRange
   Range is used to decide the amount of color to be used from either foreground or background.Playing with this variable will decide how much the foreground and background blend together.  

       setMaskRange(x:number,y:number):void

###  dominant

Get the most dominant color based on imageData and number of pixels

    dominant(imageData: ImageData, pixelCount: number) {

### palette

   Get an Array of the most siginficant colors in the MediaTrack


    pallette(imageData: ImageData, pixelCount: number) {

## MaskSettings

    MaskSettings = {

            opacity: number;                // 0.- 1.
            flipHorizontal: boolean;
            maskBlurAmount: number;         // 0-20 // Pixels to blur the mask by.
            foregroundColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            backgroundColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            segmentPerson: {
                flipHorizontal: boolean;
                internalResolution: string;      // low, medium, high, full 
                segmentationThreshold: number;   / 0. -1. 
                maxDetections: number;
            };
            
    };

## GreenScreenMethod ( enum )

    enum GreenScreenMethod {
     Mask = 0, // get the mask
     VirtualBackground = 1, // get mask and apply the provided background
     VirtualBackgroundUsingGreenScreen = 2 // user has a green screen , use shader only.
    }
