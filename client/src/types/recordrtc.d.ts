declare module 'recordrtc' {
  export default class RecordRTC {
    constructor(stream: MediaStream, options: RecordRTC.Options);
    
    startRecording(): void;
    stopRecording(callback?: () => void): void;
    getBlob(): Blob;
    getDataURL(callback: (dataURL: string) => void): void;
    
    static StereoAudioRecorder: any;
    static MediaStreamRecorder: any;
    static WhammyRecorder: any;
    static GifRecorder: any;
    static CanvasRecorder: any;
    static MultiStreamRecorder: any;
  }
  
  namespace RecordRTC {
    interface Options {
      type?: string;
      mimeType?: string;
      recorderType?: any;
      disableLogs?: boolean;
      
      // audio
      numberOfAudioChannels?: number;
      bufferSize?: number;
      sampleRate?: number;
      desiredSampRate?: number;
      
      // video
      frameInterval?: number;
      frameRate?: number;
      
      // gif
      quality?: number;
      width?: number;
      height?: number;
    }
  }
}