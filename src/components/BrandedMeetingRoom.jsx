import { useEffect, useState, useCallback, useMemo } from "react";
import { LiveKitRoom, useTracks, ParticipantTile, RoomAudioRenderer, useRoomContext, useLocalParticipant, useParticipants } from "@livekit/components-react";
import { Track, createLocalTracks } from "livekit-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, Settings, Share2, Users, Circle, Download } from "lucide-react";

// Inner component that uses LiveKit hooks (must be inside LiveKitRoom)
function CustomRoomContent() {
  const room = useRoomContext();
  const local = useLocalParticipant();
  const participants = useParticipants();
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: true }]);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [meetingTime, setMeetingTime] = useState(0);
  const [error, setError] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' or 'chat'
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingUrl, setRecordingUrl] = useState(null);

  // Meeting timer
  useEffect(() => {
    if (!room || room.state !== 'connected') return;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      setMeetingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [room]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  


  const { localParticipant } = useLocalParticipant();
useEffect(() => {
  const startLocalTracks = async () => {
    try {
      // ✅ Create both audio and video tracks
      const tracks = await createLocalTracks({ audio: true, video: true });

      // ✅ Publish each to LiveKit
      for (const track of tracks) {
        await localParticipant.publishTrack(track);
      }

      console.log('✅ Local tracks published:', tracks);
    } catch (err) {
      console.error('❌ Failed to create/publish local tracks:', err);
    }
  };

  startLocalTracks();
}, [localParticipant]);

  // Ensure local tracks are created & published when connected
  useEffect(() => {
    if (!room) return;
    if (room.state !== 'connected') return;

    let cancelled = false;
    async function ensurePublished() {
      try {
        const lp = room.localParticipant;
        if (!lp) return;

        // Check if tracks are already published using trackPublications Map
        const trackPubs = Array.from(lp.trackPublications.values());
        const hasPublished = trackPubs.some(
          p => p.source === Track.Source.Camera || p.source === Track.Source.Microphone
        );
        if (hasPublished) return;

        setPublishing(true);
        const created = await createLocalTracks({ 
          audio: true, 
          video: { resolution: '720p' } 
        });
        if (cancelled) return;

        for (const t of created) {
          await lp.publishTrack(t.track);
          // Store references to local tracks for mute/unmute
          if (t.kind === 'audio') {
            setLocalAudioTrack(t);
          } else if (t.kind === 'video') {
            setLocalVideoTrack(t);
          }
        }
        setPublishing(false);
      } catch (err) {
        setPublishing(false);
        setError(`Failed to access camera/microphone: ${err.message}`);
        console.error('Failed to create/publish local tracks', err);
      }
    }

    ensurePublished();
    return () => { cancelled = true; };
  }, [room]);

  // Sync mic state with actual track state
  useEffect(() => {
    if (!room?.localParticipant) return;
    
    const updateMicState = () => {
      const trackPubs = Array.from(room.localParticipant.trackPublications.values());
      const pubs = trackPubs.filter(
        p => p.source === Track.Source.Microphone
      );
      if (pubs.length > 0) {
        setMicOn(!pubs[0].isMuted);
      }
    };

    updateMicState();
    room.localParticipant.on('trackPublished', updateMicState);
    room.localParticipant.on('trackUnpublished', updateMicState);
    room.localParticipant.on('trackMuted', updateMicState);
    room.localParticipant.on('trackUnmuted', updateMicState);
    
    return () => {
      room.localParticipant.off('trackPublished', updateMicState);
      room.localParticipant.off('trackUnpublished', updateMicState);
      room.localParticipant.off('trackMuted', updateMicState);
      room.localParticipant.off('trackUnmuted', updateMicState);
    };
  }, [room, local]);

  // Sync camera state with actual track state
  useEffect(() => {
    if (!room?.localParticipant) return;
    
    const updateCamState = () => {
      // First check if we have a stored LocalVideoTrack
      if (localVideoTrack) {
        setCamOn(!localVideoTrack.isMuted);
        return;
      }

      // Otherwise check published tracks
      const trackPubs = Array.from(room.localParticipant.trackPublications.values());
      const pubs = trackPubs.filter(
        p => p.source === Track.Source.Camera
      );
      if (pubs.length > 0) {
        const track = pubs[0].track;
        if (track instanceof MediaStreamTrack) {
          setCamOn(track.enabled !== false);
        } else if (track && 'isMuted' in track) {
          setCamOn(!track.isMuted);
        }
      }
    };

    updateCamState();
    room.localParticipant.on('trackPublished', updateCamState);
    room.localParticipant.on('trackUnpublished', updateCamState);
    
    return () => {
      room.localParticipant.off('trackPublished', updateCamState);
      room.localParticipant.off('trackUnpublished', updateCamState);
    };
  }, [room, local, localVideoTrack]);

  // Sync screen share state
  useEffect(() => {
    if (!room?.localParticipant) return;
    
    const updateScreenShareState = () => {
      const trackPubs = Array.from(room.localParticipant.trackPublications.values());
      const screenShare = trackPubs.find(
        p => p.source === Track.Source.ScreenShare
      );
      setScreenShareOn(!!screenShare);
    };

    updateScreenShareState();
    room.localParticipant.on('trackPublished', updateScreenShareState);
    room.localParticipant.on('trackUnpublished', updateScreenShareState);
    
    return () => {
      room.localParticipant.off('trackPublished', updateScreenShareState);
      room.localParticipant.off('trackUnpublished', updateScreenShareState);
    };
  }, [room, local]);


  
  // Toggle microphone - use LocalTrack's mute/unmute methods
  const toggleMic = useCallback(async () => {
    try {
      const lp = room?.localParticipant;
      if (!lp) return;

      // First, try to use the stored LocalTrack if available
      if (localAudioTrack && typeof localAudioTrack.mute === 'function' && typeof localAudioTrack.unmute === 'function') {
        try {
          if (localAudioTrack.isMuted) {
            await localAudioTrack.unmute();
            setMicOn(true);
          } else {
            await localAudioTrack.mute();
            setMicOn(false);
          }
          return;
        } catch (err) {
          console.warn('Failed to use stored LocalTrack, trying alternative', err);
        }
      }

      // Fallback: check published tracks
      const trackPubs = Array.from(lp.trackPublications.values());
      const pubs = trackPubs.filter(p => p.source === Track.Source.Microphone);
      
      if (pubs.length === 0) {
        // No audio track published, create and publish one
        const created = await createLocalTracks({ audio: true, video: false });
        const audioTrack = created.find(t => t.kind === 'audio');
        if (audioTrack) {
          await lp.publishTrack(audioTrack.track);
          setLocalAudioTrack(audioTrack);
          setMicOn(true);
        }
        return;
      }

      // Get the publication and check if we can find the LocalTrack
      const audioPub = pubs[0];
      const isCurrentlyMuted = audioPub.isMuted || false;
      
      // Try to find the LocalTrack from the publication's trackSid
      // If we can't use the LocalTrack directly, use unpublish/republish
      const track = audioPub.track;
      
      if (track instanceof MediaStreamTrack) {
        // We need to unpublish and republish
        await lp.unpublishTrack(track);
        
        if (!isCurrentlyMuted) {
          // Was unmuted, now muted - don't republish
          setMicOn(false);
          setLocalAudioTrack(null); // Clear the reference since we unpublished
        } else {
          // Was muted, now unmuted - create and republish new track
          try {
            const created = await createLocalTracks({ audio: true, video: false });
            const newAudioTrack = created.find(t => t.kind === 'audio');
            if (newAudioTrack) {
              await lp.publishTrack(newAudioTrack.track);
              setLocalAudioTrack(newAudioTrack);
              setMicOn(true);
            }
          } catch (err) {
            console.error('Failed to create new audio track', err);
            setError('Failed to unmute microphone. Please check permissions.');
            setMicOn(false);
          }
        }
      } else {
        // If it's a LocalTrack, use its methods directly
        if (track && typeof track.mute === 'function' && typeof track.unmute === 'function') {
          if (track.isMuted) {
            await track.unmute();
            setMicOn(true);
          } else {
            await track.mute();
            setMicOn(false);
          }
        }
      }
    } catch (err) {
      console.error('toggleMic error', err);
      setError(`Failed to toggle microphone: ${err.message}`);
    }
  }, [room, localAudioTrack]);

  // Toggle camera - use LocalVideoTrack's methods or MediaStreamTrack enabled
  const toggleCam = useCallback(async () => {
    try {
      const lp = room?.localParticipant;
      if (!lp) return;

      // First, try to use the stored LocalVideoTrack if available
      if (localVideoTrack && typeof localVideoTrack.mute === 'function' && typeof localVideoTrack.unmute === 'function') {
        try {
          if (localVideoTrack.isMuted) {
            await localVideoTrack.unmute();
            setCamOn(true);
          } else {
            await localVideoTrack.mute();
            setCamOn(false);
          }
          return;
        } catch (err) {
          console.warn('Failed to use stored LocalVideoTrack, trying alternative', err);
        }
      }

      const trackPubs = Array.from(lp.trackPublications.values());
      const pubs = trackPubs.filter(p => p.source === Track.Source.Camera);
      if (pubs.length === 0) {
        const created = await createLocalTracks({ video: { resolution: '720p' }, audio: false });
        const videoTrack = created.find(t => t.kind === 'video');
        if (videoTrack) {
          await lp.publishTrack(videoTrack.track);
          setLocalVideoTrack(videoTrack);
        }
        setCamOn(true);
        return;
      }

      // Toggle camera by setting enabled state on the MediaStreamTrack
      const videoPub = pubs[0];
      const track = videoPub.track;
      
      if (track instanceof MediaStreamTrack) {
        const currentState = track.enabled;
        track.enabled = !currentState;
        setCamOn(!currentState);
      } else if (track && typeof track.mute === 'function' && typeof track.unmute === 'function') {
        // If it's a LocalTrack, use its methods
        if (track.isMuted) {
          await track.unmute();
          setCamOn(true);
        } else {
          await track.mute();
          setCamOn(false);
        }
      } else if (track && 'setMuted' in track) {
        // Fallback: use setMuted if available
        const isMuted = track.isMuted || false;
        track.setMuted(!isMuted);
        setCamOn(isMuted);
      }
    } catch (err) {
      console.error('toggleCam error', err);
      setError(`Failed to toggle camera: ${err.message}`);
    }
  }, [room, localVideoTrack]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      const lp = room?.localParticipant;
      if (!lp) return;

      const trackPubs = Array.from(lp.trackPublications.values());
      const existingScreenShare = trackPubs.find(
        p => p.source === Track.Source.ScreenShare
      );

      if (existingScreenShare) {
        // Stop screen share
        existingScreenShare.track.stop();
        await lp.unpublishTrack(existingScreenShare.track);
        setScreenShareOn(false);
      } else {
        // Start screen share - use getDisplayMedia API
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              displaySurface: 'monitor',
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: true,
          });

          // Create tracks from the stream
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];

          if (videoTrack) {
            await lp.publishTrack(videoTrack, {
              source: Track.Source.ScreenShare,
            });
          }

          if (audioTrack) {
            await lp.publishTrack(audioTrack, {
              source: Track.Source.ScreenShareAudio,
            });
          }

          // Handle when user stops sharing via browser UI
          videoTrack.onended = () => {
            setScreenShareOn(false);
          };

          setScreenShareOn(true);
        } catch (err) {
          if (err.name === 'NotAllowedError') {
            setError('Screen sharing permission denied');
          } else if (err.name === 'NotFoundError') {
            setError('No screen/window available to share');
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      console.error('toggleScreenShare error', err);
      setError(`Failed to toggle screen share: ${err.message}`);
    }
  }, [room]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  }, [mediaRecorder]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      if (!room || room.state !== 'connected') {
        setError('Not connected to room');
        return;
      }

      // Combine all tracks into a single stream
      const combinedStream = new MediaStream();
      
      // Get all video tracks (camera and screen share from all participants)
      const allVideoTracks = tracks.concat(screenTracks)
        .filter(t => {
          const source = t.publication?.source;
          return source === Track.Source.Camera || source === Track.Source.ScreenShare;
        })
        .map(t => t.publication?.track)
        .filter(track => track instanceof MediaStreamTrack);

      // Add video tracks (prefer screen share, then camera)
      if (allVideoTracks.length > 0) {
        // Compute main track logic inline (screen share takes priority, then selected participant, then camera)
        let mainVideoTrack = null;
        
        // Check for screen share first
        const screenShare = screenTracks.find(t => t.publication?.source === Track.Source.ScreenShare);
        if (screenShare?.publication?.track instanceof MediaStreamTrack) {
          mainVideoTrack = screenShare.publication.track;
        } 
        // If a participant is selected, show their video
        else if (selectedParticipant) {
          const selectedTrack = tracks.find(
            t => t.participant?.identity === selectedParticipant && 
                 t.publication?.source === Track.Source.Camera
          );
          if (selectedTrack?.publication?.track instanceof MediaStreamTrack) {
            mainVideoTrack = selectedTrack.publication.track;
          }
        }
        // Then check for local camera
        else {
          const localPublished = tracks.find(
            t => t.participant?.identity === room?.localParticipant?.identity && 
                 t.publication?.source === Track.Source.Camera
          );
          if (localPublished?.publication?.track instanceof MediaStreamTrack) {
            mainVideoTrack = localPublished.publication.track;
          }
        }
        
        // Fallback to first available video track
        if (mainVideoTrack) {
          combinedStream.addTrack(mainVideoTrack);
        } else if (allVideoTracks.length > 0) {
          combinedStream.addTrack(allVideoTracks[0]);
        }
      }

      // Get all audio tracks from all participants
      const allAudioTracks = [];
      
      // Local participant audio
      const localAudioPubs = Array.from(room.localParticipant.trackPublications.values())
        .filter(p => p.source === Track.Source.Microphone);
      localAudioPubs.forEach(pub => {
        if (pub.track instanceof MediaStreamTrack) {
          allAudioTracks.push(pub.track);
        }
      });

      // Remote participants audio
      participants.forEach(participant => {
        const audioPubs = Array.from(participant.trackPublications.values())
          .filter(p => p.source === Track.Source.Microphone);
        audioPubs.forEach(pub => {
          if (pub.track instanceof MediaStreamTrack) {
            allAudioTracks.push(pub.track);
          }
        });
      });

      // Add all audio tracks
      allAudioTracks.forEach(track => {
        combinedStream.addTrack(track);
      });

      // If no tracks, try to get from local participant
      if (combinedStream.getTracks().length === 0) {
        const localTracks = await createLocalTracks({ audio: true, video: true });
        localTracks.forEach(t => {
          if (t.track instanceof MediaStreamTrack) {
            combinedStream.addTrack(t.track);
          }
        });
      }

      if (combinedStream.getTracks().length === 0) {
        setError('No tracks available to record');
        return;
      }

      // Create MediaRecorder with fallback mime types
      const chunks = [];
      let mimeType = 'video/webm;codecs=vp9,opus';
      
      // Check if the mime type is supported
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use default
          }
        }
      }

      const recorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(combinedStream, {
        ...recorderOptions,
        videoBitsPerSecond: 2500000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setRecordedChunks(chunks);
        setIsRecording(false);
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error', event);
        setError('Recording error occurred');
        setIsRecording(false);
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedChunks([]);
      setRecordingUrl(null);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError(`Failed to start recording: ${err.message}`);
      setIsRecording(false);
    }
  }, [room, tracks, screenTracks, participants, selectedParticipant]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (isRecording && mediaRecorder) {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
    if (room && room.state === 'connected') {
      room.disconnect();
      window.location.href = '/';
    }
  }, [room, isRecording, mediaRecorder]);

  // Download recording
  const downloadRecording = useCallback(() => {
    if (!recordingUrl) {
      setError('No recording available to download');
      return;
    }

    const a = document.createElement('a');
    a.href = recordingUrl;
    a.download = `meeting-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [recordingUrl]);

  // Chat functionality using LiveKit data channels
  useEffect(() => {
    if (!room || room.state !== 'connected') return;

    const handleDataReceived = (payload, participant) => {
      if (payload.topic === 'chat') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          participant: participant?.name || participant?.identity || 'Unknown',
          message: new TextDecoder().decode(payload.data),
          timestamp: new Date(),
        }]);
      }
    };

    room.on('dataReceived', handleDataReceived);

    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room]);

  // Send chat message
  const sendMessage = useCallback(async () => {
    if (!messageInput.trim() || !room) return;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(messageInput);
      
      await room.localParticipant.publishData(data, {
        topic: 'chat',
        reliable: true,
      });

      // Add to local messages immediately
      setMessages(prev => [...prev, {
        id: Date.now(),
        participant: room.localParticipant.name || 'You',
        message: messageInput,
        timestamp: new Date(),
        isLocal: true,
      }]);

      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Failed to send message');
    }
  }, [messageInput, room]);

  // Get main track (screen share takes priority, then selected participant, then camera)
  const mainTrack = useMemo(() => {
    // Check for screen share first
    const screenShare = screenTracks.find(t => t.publication?.source === Track.Source.ScreenShare);
    if (screenShare) return screenShare;
    
    // If a participant is selected, show their video
    if (selectedParticipant) {
      const selectedTrack = tracks.find(
        t => t.participant?.identity === selectedParticipant && 
             t.publication?.source === Track.Source.Camera
      );
      if (selectedTrack) return selectedTrack;
    }
    
    // Then check for local camera
    const localPublished = tracks.find(
      t => t.participant?.identity === room?.localParticipant?.identity && 
           t.publication?.source === Track.Source.Camera
    );
    if (localPublished) return localPublished;
    
    // Finally, get first remote camera
    return tracks.find(
      t => t.publication?.source === Track.Source.Camera && 
           t.participant?.identity !== room?.localParticipant?.identity
    );
  }, [screenTracks, tracks, selectedParticipant, room]);

  // Get camera tracks for thumbnails (exclude screen share)
  const cameraTracks = tracks.filter(
    t => t.publication?.source === Track.Source.Camera
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      {/* Header with branding */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-cyan-500">Taskly Meeting</h2>
          <p className="text-sm text-cyan-500">
            {participants.length + 1} participant{participants.length !== 0 ? 's' : ''} in meeting
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-cyan-50 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium">
            <Users size={16} />
            <span>{participants.length + 1}</span>
          </div>
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-full font-semibold text-sm">
            {formatTime(meetingTime)}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex flex-col flex-[3] p-4 gap-3">
          {/* Main video display */}
       {/* Main video display */}
<div className="bg-white rounded-2xl shadow-lg overflow-hidden flex-1 flex justify-center items-center relative">
  {mainTrack && mainTrack.publication ? (
    <ParticipantTile
      key={mainTrack.publication.trackSid || mainTrack.participant.identity}
      trackRef={mainTrack}
      className="w-full h-full"
    />
  ) : publishing ? (
    <div className="text-gray-500 text-lg">Starting your camera...</div>
  ) : (
    <div className="text-center">
      <div className="text-gray-400 text-lg mb-2">No video available</div>
      <div className="text-gray-400 text-sm">Allow camera & microphone permissions</div>
    </div>
  )}
</div>


          {/* Participant thumbnails */}
          <div className="grid grid-cols-3 gap-3">
            {cameraTracks.slice(0, 3).map((t) => (
              <div 
                key={t.participant?.sid || t.publication?.trackSid} 
                className="bg-white rounded-xl overflow-hidden shadow-md h-28"
              >
                <ParticipantTile trackRef={t} />
              </div>
            ))}
            {cameraTracks.length === 0 && (
              <div className="col-span-3 text-center text-gray-400 text-sm py-4">
                Waiting for participants to join...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Participants list and Chat */}
        <div className="w-[300px] bg-white border-l flex flex-col shadow-lg">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'participants'
                  ? 'bg-cyan-50 text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Participants ({participants.length + 1})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-cyan-50 text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Chat
            </button>
          </div>

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Local participant */}
              <div 
                onClick={() => setSelectedParticipant(room?.localParticipant?.identity || null)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedParticipant === room?.localParticipant?.identity
                    ? 'bg-cyan-100 border-2 border-cyan-500'
                    : 'bg-cyan-50 hover:bg-cyan-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold">
                  {room?.localParticipant?.name?.charAt(0)?.toUpperCase() || 'Y'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">You</p>
                  <p className="text-xs text-gray-500">{room?.localParticipant?.name || 'You'}</p>
                </div>
                {selectedParticipant === room?.localParticipant?.identity && (
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                )}
              </div>
              
              {/* Remote participants */}
              {participants.map((participant) => (
                <div 
                  key={participant.sid}
                  onClick={() => setSelectedParticipant(participant.identity)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedParticipant === participant.identity
                      ? 'bg-cyan-100 border-2 border-cyan-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                    {participant.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{participant.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">Participant</p>
                  </div>
                  {selectedParticipant === participant.identity && (
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.isLocal ? 'items-end' : 'items-start'
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${
                        msg.isLocal ? 'text-cyan-600' : 'text-gray-600'
                      }`}>
                        {msg.isLocal ? 'You' : msg.participant}
                      </p>
                      <p className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                        msg.isLocal
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex justify-center items-center gap-4 py-4 bg-white border-t shadow-inner">
        <button 
          onClick={toggleMic} 
          className={`p-3 rounded-full transition-all ${
            micOn 
              ? 'bg-gray-100 hover:bg-gray-200' 
              : 'bg-red-100 hover:bg-red-200'
          }`}
          title={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? (
            <Mic size={22} className="text-gray-700" />
          ) : (
            <MicOff size={22} className="text-red-600" />
          )}
        </button>
        
        <button 
          onClick={toggleCam} 
          className={`p-3 rounded-full transition-all ${
            camOn 
              ? 'bg-gray-100 hover:bg-gray-200' 
              : 'bg-red-100 hover:bg-red-200'
          }`}
          title={camOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {camOn ? (
            <Video size={22} className="text-gray-700" />
          ) : (
            <VideoOff size={22} className="text-red-600" />
          )}
        </button>
        
        <button 
          onClick={toggleScreenShare} 
          className={`p-3 rounded-full transition-all ${
            screenShareOn 
              ? 'bg-cyan-100 hover:bg-cyan-200' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={screenShareOn ? 'Stop sharing' : 'Share screen'}
        >
          <ScreenShare 
            size={22} 
            className={screenShareOn ? 'text-cyan-600' : 'text-gray-700'} 
          />
        </button>
        
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full transition-all ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <Circle 
            size={22} 
            className={isRecording ? 'text-white animate-pulse' : 'text-gray-700'} 
            fill={isRecording ? 'currentColor' : 'none'}
          />
        </button>

        {recordingUrl && (
          <button 
            onClick={downloadRecording}
            className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all"
            title="Download recording"
          >
            <Download size={22} />
          </button>
        )}
        
        <button 
          onClick={leaveRoom} 
          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
          title="Leave meeting"
        >
          <PhoneOff size={22} />
        </button>
        
        <button 
          className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
          title="Settings"
        >
          <Settings size={22} className="text-gray-700" />
        </button>
        
        <button 
          className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
          title="Share meeting link"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Meeting link copied to clipboard!');
          }}
        >
          <Share2 size={22} className="text-gray-700" />
        </button>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}

// Main component that wraps everything in LiveKitRoom
export default function BrandedMeetingRoom() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = new URLSearchParams(window.location.search);
  const user = searchParams.get("user") || "Seham";
  const roomName = searchParams.get("room") || "test-room";

  useEffect(() => {
    const initializeToken = () => {
      try {
        setLoading(true);
        
        // Read token from URL params
        const tokenFromUrl = searchParams.get("token");
        
        if (tokenFromUrl) {
          // Use token from URL
          setToken(tokenFromUrl);
          setError(null);
        } else {
          // No token provided
          setError("No token provided in URL. Please add ?token=your_livekit_token to the URL.");
        }
      } catch (err) {
        setError(`Failed to initialize token: ${err.message}`);
        console.error('Token initialization error', err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeToken();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-xl font-semibold text-gray-700 mb-2">Loading meeting...</div>
        <div className="text-sm text-gray-500">Please wait</div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="text-xl font-semibold text-red-600 mb-4">Error</div>
        <div className="text-sm text-gray-700 mb-6 max-w-2xl text-center whitespace-pre-line">
          {error}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 max-w-2xl text-left">
          <div className="text-sm font-semibold text-blue-900 mb-3">How to Fix:</div>
          <div className="text-xs text-blue-800 space-y-3">
            <div>
              <div className="mb-2 font-semibold">Option 1: Use Token Generator (Easiest)</div>
              <a 
                href="/token-generator.html" 
                target="_blank"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
              >
                Open Token Generator
              </a>
              <div className="mt-2 text-blue-600 text-xs">
                Enter your LiveKit credentials and generate a token directly in your browser
              </div>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <div className="mb-2 font-semibold">Option 2: Use Command Line</div>
              <div className="bg-blue-100 p-2 rounded font-mono text-xs mb-2">
                npm run generate-token
              </div>
              <div className="text-blue-600 text-xs">Or: <code className="bg-blue-100 px-1">LIVEKIT_API_KEY=xxx LIVEKIT_API_SECRET=xxx node generate-token.js</code></div>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <div className="text-blue-700 text-xs">
                <strong>Need credentials?</strong> Sign up at{" "}
                <a href="https://livekit.io" target="_blank" rel="noopener noreferrer" className="underline">
                  livekit.io
                </a>
                {" "}to get your API Key, Secret, and Server URL.
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-xl font-semibold text-gray-700 mb-2">No token available</div>
        <div className="text-sm text-gray-500">Unable to join meeting</div>
      </div>
    );
  }

  // Get LiveKit server URL from environment variable
  // For production: use wss:// (secure WebSocket)
  // For local development: use ws://localhost:7880
  const serverUrl = import.meta.env.VITE_LIVEKIT_SERVER_URL || "wss://your-project.livekit.cloud";

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      options={{
        adaptiveStream: true,
        dynacast: true,
      }}
      style={{ height: "100vh", width: "100vw" }}
    >
      <CustomRoomContent />
      
    </LiveKitRoom>
  );
}

