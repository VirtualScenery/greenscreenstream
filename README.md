# GreenScreenStream

 ## about

Generate a new MediaStream for `<canvas>` ,`<video>`  elements based on the MediaStreamTracks  and a background image just using JavaScript.  After processed and "green screend" you can capture the stream and use it in your RTCPeerConnections for instance.
All rendering is made realtime using a WebGL2 pixel shader (glsl) .

*Regards Magnus Thor*

## comming features 

1. Add custom post-processor shaders.
2. Customize "mask" color , right now is plain green-screen's so bit narrow.
3. Background is now a image texture , but will also be possible to use a provided 
`<video>` resource.
   
## install

    npm install greenscreenstream@beta  

## demos

Below you find three different demos,first link uses machine-learing and requires no green-screen, but a clean background is to prefer. Streams to a HTMLVideoElement

Example two uses pure WebGL (pixel shaders) and for the best result as green-screen is recomened, Otherwise as clean background. Streams to a HTMLVideoElement

Third example, creates a "black-screen" , masks out the person(s) and, removes background.  Streams to a HTMLCanvasElement.

The last example uses a custom shader that creates a some kind of "hologram".   

 [https://coloquium.github.io/greenscreenstream/example/mlWebGL ](https://coloquium.github.io/greenscreenstream/example/mlWebGL)

 [https://coloquium.github.io/greenscreenstream/example/WebGL ](https://coloquium.github.io/greenscreenstream/example/WebGL)

 [https://coloquium.github.io/greenscreenstream/example/Mask ](https://coloquium.github.io/greenscreenstream/example/Mask)

 [https://coloquium.github.io/greenscreenstream/example/hologram ](https://coloquium.github.io/greenscreenstream/example/hologram)


> See `/example/` folder in repo for implementation 

# GreenScreenStream API

## constructor

     constructor(useML:boolean,backgroudImage?:  string,
      canvas?:  HTMLCanvasElement, width?:
        number, height?:  number);

or use the static method `GreenScreenStream.getIstance(..args)`

## methods

### addTrack

Adds a `MediaStreamTrack` track (i.e webcam)

    addVideoTrack(track:  MediaStreamTrack):  void;

### render

Start render the new `MediaStream` 

    render(fps?:  number,config?:MaskSettings):  void;


### getMask

Get a masked canvas , renders to to the provided target `canvas`

getMask(target: HTMLCanvasElement, config?: MaskSettings): void;


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


### getInstance

    static  getInstance(backgroudImage:  string,
     canvas?:  HTMLCanvasElement, 
     width?:  number, height?:  number):  GreenScreenStream

## MaskSettings

Applies to render & getMask

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


## Properties

### canvas:  HTMLCanvasElement;

Canvas element provided / or created . Contains the rendered result .

### ctx:  WebGL2RenderingContext;

WebGL2 Rendering context

### renderer:  DR;
DR is the WebGL Rendering engine used, to perform pixel maipulations.

> DR is the demolishedRender , see https://github.com/MagnusThor/demolishedRenderer 

### mediaStream:  MediaStream;

MediaSteam containing the provided VideoTrack

### video:  HTMLVideoElement;

Internal `<video>` element that is passed to the  `renderer:DR` engine.
