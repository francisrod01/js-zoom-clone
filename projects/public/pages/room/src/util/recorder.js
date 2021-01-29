class Recorder {
  constructor(userName, stream) {
    this.userName = userName;
    this.stream = stream;

    this.filename = `id:${userName}-when:${Date.now()}`;
    this.videoType = 'video/webm';

    this.mediaRecorder = {};
    this.recordedBlobs = [];
    this.recordingActive = false;
  }

  _setup() {
    const commonCodecs = [
      'codecs=vp9,opus',
      'codecs=vp8,opus',
      ''
    ];

    const options = commonCodecs
      .map(codec => ({ mimeType: `${this.videoType};${codec}}` }))
      .find(options => MediaRecorder.isTypeSupported(options.mimeType));

    if (!options) {
      throw new Error(`None of the codecs: ${commonCodecs.join(',')} are supported!`);
    }

    return options;
  }

  startRecording() {
    const options = this._setup();

    // If it's not receiving the video stream, just ignore it.
    if (!this.stream.active)
      return;

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    console.log(`Created media recorder ${this.mediaRecorder} with options ${options}`);

    this.mediaRecorder.onstop = (event) => {
      console.log('Recorded Blobs: ', this.recordedBlobs);
    };

    this.mediaRecorder.ondataavailable = (event) => {
      // Check if it has data to save.
      if (!event.data || !event.size)
        return;

      this.recordedBlobs.push(event.data);
    };

    this.mediaRecorder.start();
    console.log('Media Recorded started.', this.mediaRecorder);
    this.recordingActive = true;
  }
}
