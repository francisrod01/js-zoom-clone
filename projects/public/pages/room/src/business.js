class Business {
  constructor({ room, media, view, socketBuilder, peerBuilder }) {
    this.room = room;
    this.media = media;
    this.view = view;

    this.socketBuilder = socketBuilder;
    this.peerBuilder = peerBuilder;

    this.socket = {};
    this.currentStream = {};
    this.currentPeer = {};

    this.peers = new Map();
    this.usersRecordings = new Map();
  }

  static initialize(deps) {
    const instance = new Business(deps);
    return instance._init();
  }

  async _init() {
    this.view.configureRecordButton(this.onRecordPressed.bind(this));
    this.view.configureLeaveButton(this.onLeavePressed.bind(this));

    this.currentStream = await this.media.getCamera();

    this.socket = this.socketBuilder
    .setOnUserConnected(this.onUserConnected())
    .setOnUserDisconnected(this.onUserDisconnected())
    .build();

    this.currentPeer = await this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallReceived(this.onPeerCallReceived())
      .setOnPeerStreamReceived(this.onPeerStreamReceived())
      .setOnCallError(this.onPeerCallError())
      .setOnCallClose(this.onPeerCallClose())
      .build();

    this.addVideoStream(this.currentPeer.id);
  }

  addVideoStream(userId, stream = this.currentStream) {
    // Get the recorder instance.
    const recorderInstance = new Recorder(userId, stream);
    this.usersRecordings.set(recorderInstance.filename, recorderInstance);

    // Start recording if the recorder button is enabled
    if (this.recordingEnabled) {
      recorderInstance.startRecording();
    }

    const isCurrentId = userId === this.currentPeer.id;
    this.view.renderVideo({
      userId,
      stream,
      muted: false,
      isCurrentId
    });
  }

  onUserConnected = function() {
    return userId => {
      console.log('user connected!', userId);
      this.currentPeer.call(userId, this.currentStream);
    };
  }

  onUserDisconnected = function() {
    return userId => {
      console.log('user disconnected!', userId);

      // Check if peers has the user id and close its call.
      if (this.peers.has(userId)) {
        this.peers.get(userId).call.close();

        // Remove it from the connected peers.
        this.peers.delete(userId);
      }

      // Set the participans on the screen.
      this.view.setParticipants(this.peers.size);

      // Stop recording the user itself.
      this.stopRecording(userId);

      // Remove the user HTML from DOM.
      this.view.removeVideoElement(userId);
    };
  }

  onPeerError = function() {
    return error => {
      console.error('Error on peer!', error);
    };
  }

  onPeerConnectionOpened = function() {
    return (peer) => {
      const id = peer.id;
      console.log('Peer!!', peer);
      this.socket.emit('join-room', this.room, id);
    };
  }

  onPeerCallReceived = function() {
    return call => {
      console.log('Answering call', call);
      call.answer(this.currentStream);
    };
  }

  onPeerStreamReceived = function() {
    return (call, stream) => {
      const callerId = call.peer;
      if (this.peers.has(callerId)) {
        console.log('Calling twice, ignoring second call...', callerId);
        return;
      }

      this.addVideoStream(callerId, stream);

      this.peers.set(callerId, { call });
      this.view.setParticipants(this.peers.size);
    };
  }

  onPeerCallError = function() {
    return (call, error) => {
      console.error('An call error occured!', error);

      this.view.removeVideoElement(call.peer);
    };
  }

  onPeerCallClose = function() {
    return (call) => {
      console.log('Call closed!', call.peer);
    };
  }

  onRecordPressed(recordingEnabled) {
    this.recordingEnabled = recordingEnabled;
    console.log('Record button was pressed!!', recordingEnabled);

    // Recording all peers connected.
    for (const [key, value] of this.usersRecordings) {
      if (this.recordingEnabled) {
        value.startRecording();
        continue;
      }

      this.stopRecording(key);
    }
  }

  // In case a peer enters and exits a call, we need to stop all recordings assotiated to it.
  async stopRecording(userId) {
    const usersRecordings = this.usersRecordings;
    for (const [key, value] of usersRecordings) {
      const isContextUser = key.includes(userId);
      if (!isContextUser)
        continue;

      const rec = value;
      const isRecordingActive = rec.recordingActive;
      if (!isRecordingActive)
        continue;

      await rec.stopRecording();
      this.playRecordings(key);
    }
  }

  playRecordings(userId) {
    const user = this.usersRecordings.get(userId);
    const videosURLs = user.getAllVideoURLs();

    // Tells view to render its videos.
    videosURLs.map(url => {
      this.view.renderVideo({ url, userId });
    });
  }

  onLeavePressed() {
    this.usersRecordings.forEach((value, key) => value.download());
  }
}
