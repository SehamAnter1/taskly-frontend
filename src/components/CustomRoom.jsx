'use client';
import React, { useEffect, useState } from 'react';
import {
  useTracks,
  ParticipantTile,
  RoomAudioRenderer,
  useRoomContext,
  useLocalParticipant,
  useParticipants,
} from '@livekit/components-react';
import { Track, createLocalTracks } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, Settings, Share2 } from 'lucide-react';

export default function CustomRoom() {
  const room = useRoomContext();               // access room instance
  const local = useLocalParticipant();         // local participant helper
  const participants = useParticipants();      // array of remote participants
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]); // all available trackRefs

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Ensure local tracks are created & published when connected
  useEffect(() => {
    if (!room) return;
    if (room.state !== 'connected') return;

    let cancelled = false;
    async function ensurePublished() {
      try {
        // if local participant already published tracks, nothing to do
        const lp = room.localParticipant;
        if (!lp) return;

        // If there are already published tracks, skip creating again
        const hasPublished = lp.getTracks().some(p => p.source === Track.Source.Camera || p.source === Track.Source.Microphone);
        if (hasPublished) return;

        setPublishing(true);
        // create local audio + video tracks (prompts permission)
        const created = await createLocalTracks({ audio: true, video: { resolution: '720p' } });
        if (cancelled) return;

        // publish each created track
        for (const t of created) {
          await lp.publishTrack(t.track);
        }
        setPublishing(false);
        console.log('Local tracks created and published', created);
      } catch (err) {
        setPublishing(false);
        console.error('Failed to create/publish local tracks', err);
      }
    }

    ensurePublished();
    return () => { cancelled = true; };
  }, [room]);

  // toggle mic by enabling/disabling published audio track(s)
  const toggleMic = async () => {
    try {
      const lp = room.localParticipant;
      if (!lp) return;
      const pubs = lp.getTracks().filter(p => p.source === Track.Source.Microphone);
      if (pubs.length === 0) {
        // create and publish audio if none
        const created = await createLocalTracks({ audio: true, video: false });
        for (const t of created) await lp.publishTrack(t.track);
        setMicOn(true);
        return;
      }
      // toggle enabled state on each publication
      for (const pub of pubs) {
        pub.track.muted ? pub.track.unmute?.() : pub.track.mute?.();
      }
      setMicOn(!micOn);
    } catch (err) {
      console.error('toggleMic error', err);
    }
  };

  const toggleCam = async () => {
    try {
      const lp = room.localParticipant;
      if (!lp) return;
      const pubs = lp.getTracks().filter(p => p.source === Track.Source.Camera);
      if (pubs.length === 0) {
        const created = await createLocalTracks({ video: true, audio: false });
        for (const t of created) await lp.publishTrack(t.track);
        setCamOn(true);
        return;
      }
      for (const pub of pubs) {
        // new client exposes track.stop/pause/mute depending on type; try enable/disable via track.publish/unpublish or mute
        if (pub.track.enabled === undefined) {
          // fallback: toggle by unpublishing/publishing - avoid this unless needed
        } else {
          pub.track.enabled = !pub.track.enabled;
        }
      }
      setCamOn(!camOn);
    } catch (err) {
      console.error('toggleCam error', err);
    }
  };

  const leaveRoom = () => {
    if (room && room.state === 'connected') {
      room.disconnect();
    }
  };

  // select a mainTrackRef for the big view (prefer local video if exists)
  const mainTrack = (() => {
    // try local first
    const localPublished = tracks.find(t => t.participant?.identity && t.participant.identity === room.localParticipant?.identity && t.publication?.source === Track.Source.Camera);
    if (localPublished) return localPublished;
    // else return first remote camera
    return tracks.find(t => t.publication?.source === Track.Source.Camera && t.participant?.identity !== room.localParticipant?.identity);
  })();

  return (
    <div className="flex flex-col h-full bg-[#F7F9FA] text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Monthly Investment Opportunity</h2>
          <p className="text-sm text-gray-500">Handled by Alallah</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
            Fahd Abdullah wants to join
          </div>
          <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">40:33 MIN</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex flex-col flex-[3] p-4 gap-3">
          {/* Main big video */}
          <div className="bg-white rounded-2xl shadow overflow-hidden flex-1 flex justify-center items-center">
            {mainTrack ? (
              <ParticipantTile trackRef={mainTrack} />
            ) : publishing ? (
              <div className="text-gray-500">Publishing your camera...</div>
            ) : (
              <div className="text-gray-400">No video yet — allow camera & mic permissions</div>
            )}
          </div>

          {/* thumbnails */}
          <div className="grid grid-cols-3 gap-3">
            {tracks.filter(t => t.publication?.source === Track.Source.Camera).slice(0, 3).map((t) => (
              <div key={t.participant?.sid || t.publication?.trackSid} className="bg-white rounded-2xl overflow-hidden shadow h-28">
                <ParticipantTile trackRef={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Chat side (placeholder, you can wire LiveKit data channels later) */}
        <div className="w-[300px] bg-white border-l flex flex-col rounded-l-2xl shadow-sm">
          <div className="p-3 border-b text-lg font-semibold">Messages</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="flex flex-col">
              <p className="text-sm font-semibold">Sara</p>
              <p className="bg-gray-100 rounded-lg p-2 text-sm">Hey, how’s everyone doing?</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm font-semibold text-right">You</p>
              <p className="bg-blue-100 text-blue-800 rounded-lg p-2 text-sm">All good here!</p>
            </div>
          </div>
          <div className="p-3 border-t flex gap-2">
            <input type="text" placeholder="Write a message..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Send</button>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex justify-center gap-6 py-4 bg-white border-t shadow-inner">
        <button onClick={toggleMic} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
          {micOn ? <Mic size={22} /> : <MicOff size={22} className="text-red-500" />}
        </button>
        <button onClick={toggleCam} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
          {camOn ? <Video size={22} /> : <VideoOff size={22} className="text-red-500" />}
        </button>
        <button onClick={leaveRoom} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600">
          <PhoneOff size={22} />
        </button>
        <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
          <ScreenShare size={22} />
        </button>
        <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
          <Settings size={22} />
        </button>
        <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
          <Share2 size={22} />
        </button>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}
