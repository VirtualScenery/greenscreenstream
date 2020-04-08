# GreenScreenStream

 ## about

Generate a new MediaStream for `<canvas>` ,`<video>`  elements based on the MediaStreamTracks  and a background image just using JavaScript.  After processed and "green screend" you can capture the stream and use it in your RTCPeerConnections for instance.
All rendering is made realtime using a WebGL2 pixel shader (glsl) .

*Regards Magnus Thor*

## comming features 

1. Add custom post-processor shaders.
2. Customize "mask" color , right now is plain green-screen's so bit narrow.
3. Background is now a image texture , but will also be possible to use a provided `<video>` resource.
4.   
## install

    npm install greenscreenstream  

## demo
 [https://coloquium.github.io/greenscreenstream/example/](https://coloquium.github.io/greenscreenstream/example/)
> See example folder in repo for implementation 

# GreenScreenStream API

## constructor

     constructor(backgroudImage:  string,
      canvas?:  HTMLCanvasElement, width?:
        number, height?:  number);

or use the static method `GreenScreenStream.getIstance(..args`)

## methods

### addTrack

Adds a `MediaStreamTrack` track (i.e webcam)

    addVideoTrack(track:  MediaStreamTrack):  void;

### render

Start render the new `MediaStream` 

    render(fps?:  number):  void;

### captureStream

Capture the rendered result to a MediaStream that you apply to your `<video>` element.

    captureStream(fps?:  number):  MediaStream;
    

### getColorsFromStream

Get the most dominant color and a list (palette) of the colors most common in the provided MediaStreamTrack.

     getColorsFromStream(): { palette: any, dominant: any } {

### setDominanColor

Pass a mask (rgb), color to the shader , to use as a mask.   Should be the `dominant color`, or on of the `palette` colors detected. See `getColorsFromStream` 


        setDominanColor(r: number, g: number, b: number, threshold?: number): void;
 

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
