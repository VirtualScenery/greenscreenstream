 <p>
  <a href="https://github.com/VirtualScenery" target="blank"><img src="https://i.ibb.co/hmnR2jz/gss-v1.png" width="200" alt="GreenScreenStream Logo" /></a>
</p>
<h1>
  GreenScreenStream
</h1>

## About
GreenScreenStream provides a wide range of options for manipulating Mediastreams.

Generate a new MediaStream for `<canvas>` & `<video>`  elements based on provided MediaStreamTrack and a background image/video just using JavaScript.  

After processed and "green screened" you can capture the stream and use it in your WebRTC calls for instance.

All rendering is done in realtime using a WebGL2 pixel shader (glsl) and optionally machine-learning.
 
## Install

    npm i @virtualscenery/greenscreenstream  

## Examples

Below you find a few different examples of greenscreenstream.


 [ML based Virtual Background - Image Background](https://virtualscenery.github.io/greenscreenstream-examples/example/mlWebGL/)

 [ML based Virtual Background - Video Background](https://virtualscenery.github.io/greenscreenstream-examples/example/mlWebGL#snow.mp4)
 
 [ML based Virtual Background - WebGL Background](https://virtualscenery.github.io/greenscreenstream-examples/example/procedual)

 [ML based Virtual Background - Hologram Effect](https://virtualscenery.github.io/greenscreenstream-examples/example/hologram)

 [https://virtualscenery.github.io/greenscreenstream-examples/example/WebGL ](https://virtualscenery.github.io/greenscreenstream-examples/example/WebGL)


> Look [here](https://github.com/VirtualScenery/greenscreenstream-examples) for implementation. 

<br/>
<br/>

# GreenScreenStream API

## Contents
### [GreenScreenStream (Class)](#greenscreenstream-class-1)
### [GreenScreenMethod (Enum)](#greenscreenmethod-enum-1)
### [Vector2 (Class)](#vector2-class-1)
### [VideoResolution (Enum)](#videoresolution-enum-1)
### [IGreenScreenConfig (Interface)](#igreenscreenconfig-interface-1)
### [BodyPixMode (Enum)](#bodypixmode-enum-1)
### [IMaskSettings (Interface)](#imasksettings-interface-1)
<br/>
<br/>

# GreenScreenStream (Class)
## Constructor

Creates an instance of GreenScreenStream

```ts
constructor(greenScreenMethod: GreenScreenMethod, resolution: VideoResolution | Vector2, canvas?: HTMLCanvasElement)
```

## Methods

###  initialize

Initlializes the GreenScreenStream with the provided background (image or video) and settings.

```ts
initialize(backgroundUrl?: string, config?: GreenScreenConfig): Promise<boolean> 
```

### addVideoTrack

Adds a `MediaStreamTrack`  (i.e webcam)
```ts
addVideoTrack(track:  MediaStreamTrack):  Promise<void | any>;
```
### start

Starts rendering the greenscreen.
You can optionally set a fps maximum here
```ts
start(maxFps?: number): void
```
### stop

Stops the rendering process.
Optionally stop the media streams.\
Stopping the streams works only if there are no references to them
outside of greenscreenstream.
```ts
stop(stopMediaStreams?:boolean): void
```

### captureStream

Capture the rendered result to a MediaStream that you apply to your `<video>` element.
```ts
captureStream(fps?:  number):  MediaStream;    
```

### setBackground
Sets the virtual background to a new image or video. Can be done while GreenScreenStream is running.
```ts
 setBackground(src: string): Promise<HTMLImageElement | HTMLVideoElement | Error>
```

### setBodyPixModel
Swaps out the currently used BodyPixModel used in ml mode (```GreenScreenMethod.VirtualBackground```) (See [GreenScreenMethod (Enum)](#greenscreenmethod-enum-1))
```ts
setBodyPixModel(config: IGreenScreenConfig): Promise<void>
```

### scaleImageToCanvas
Scales the passed in image to canvas size and returns a scaled copy of it.
Gets called automatically everytime a new image background is set.
The imageOptions defaults to the current size of the greenscreen canvas and high quality .
```ts
public async scaleImageToCanvas(image: HTMLImageElement, imageOptions?: ImageBitmapOptions): Promise<HTMLImageElement>
```

### getColorsFromStream

Gets the most dominant color and a list (palette) of the colors most common in the provided MediaStreamTrack.
```ts
getColorsFromStream(): { palette: [number, number,number][], dominant: [number, number,number] } {
```
### setChromaKey

Pass a mask (rgb), color to the shader , to use as a mask.   Should be the `dominant color`, or on of the `palette` colors detected. See `getColorsFromStream` 

```ts
setChromaKey(r: number, g: number, b: number, threshold?: number): void;
```

### setRange
   Range is used to decide the amount of color to be used from either foreground or background.Playing with this variable will decide how much the foreground and background blend together.  
```ts
setMaskRange(x:number,y:number): void
```
###  dominant

Get the most dominant color based on imageData and number of pixels
```ts
dominant(imageData: ImageData, pixelCount: number): [number, number,number] {
```

### palette
Get an Array of the most significant colors in the MediaTrack
```ts
pallette(imageData: ImageData, pixelCount: number): [number, number,number][] | null {
```

<br/>
<br/>

# GreenScreenMethod (Enum)
Describes the method GreenScreenStream should use for applying a virtual background.\
```GreenScreenMethod.VirtualBackground``` uses a machine learning model (Tensorflow BodyPix)\
```GreenScreenMethod.VirtualBackgroundUsingGreenScreen``` works without a machine learning model and thus consumes much less performance,\
but requires the user to have a green screen.
```ts
enum GreenScreenMethod {
    VirtualBackground, 
    VirtualBackgroundUsingGreenScreen
}
```
<br/>
<br/>

# VideoResolution (enum)
Describes resolution presets GreenScreenStream should use.
```ts
enum VideoResolution {
    SD,
    HD,
    FullHD,
    WQHD,
    UHD
}
```
<br/>
<br/>

# Vector2 (Class)
Describes a custom resolution that GreenScreenStream can use.

## Constructor
Both values default to zero.
```ts
constructor(x?: number, y?: number)
```
## Methods
### toString
Returns the current values as a string (`" x : y"`)
```ts
toString(): string 
```

### toMediaConstraint
Returns the current value in a format that can be used as `MediaTrackConstraints`
```ts
toMediaConstraint(): MediaTrackConstraints
```

### isValidVector2
Checks if the provided input is a valid vector2. Returns `true` if so.
```ts
static isValidVector2(input: any): boolean
```
<br/>
<br/>

# IGreenScreenConfig (Interface)
Provides detailed configuration options for GreenScreenStream. \
```maskSettings``` can be uses to fine tune the virtual background appearance. (\
```bodyPixMode``` can be used to apply premade BodyPix configurations (see [GreenScreenStreamBodyPixMode](#greenscreenstreambodypixmode-enum-1) for more details),\
while ```bodyPixConfig``` allows you to configure BodyPix as you see fit. If both are provided, ```bodyPixMode``` will be ignored.
```ts
IGreenScreenConfig {
    maskSettings?: IMaskSettings,
    bodyPixMode?: GreenScreenStreamBodyPixMode,
    bodyPixConfig?: IBodyPixConfig
}
```
<br/>
<br/>

# BodyPixMode (Enum)
Determines which BodyPix Preset GreenStream should use.

Presets `Standard` or `Precise` are recommended for most use cases.\
`Fast` is meant for really weak clients, is unprecise and causes flickering.\
`Maximum` uses a more complex ML Model and thus causes much more network traffic & gpu + cpu load.\
```ts
enum BodyPixMode {
    Fast = 0,
    Standard = 1,
    Precise = 2,
    Maximum = 3
}
```
<br/>

## Preset Details:
### Fast
```ts
architecture: 'MobileNetV1',
outputStride: 16,
multiplier: 0.5,
quantBytes: 1
```
### Standard
```ts
architecture: 'MobileNetV1',
outputStride: 16,
multiplier: 0.75,
quantBytes: 2
```
### Precise
```ts
architecture: 'MobileNetV1',
outputStride: 16,
multiplier: 1,
quantBytes: 2
```
### Maximum
```ts
architecture: 'ResNet50',
outputStride: 32,
quantBytes: 2
```

<br/>
<br/>

# IMaskSettings (Interface)
Description TBA
```ts
interface IMaskSettings {
    opacity?: number
    flipHorizontal?: boolean
    maskBlurAmount?: number
    foregroundColor?: RGBA
    backgroundColor?: RGBA
    segmentPerson?: {
        flipHorizontal?: boolean
        internalResolution?: string
        segmentationThreshold?: number
        maxDetections?: number
        quantBytes?: number
    }
};
```
```ts
export interface RGBA {
    r: number, g: number, b: number, a: number
}
```

