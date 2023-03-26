import { IRoomUser } from "@/lib/models/RoomUser.model";
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
} from "agora-rtc-sdk-ng";
import React, { useEffect } from "react";
import RoomUserCard from "./RoomUserCard";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
AgoraRTC.setLogLevel(3);
const appId = "b7f1ebe9c05645e89d11aae3eee7167a";
const token =
  "007eJxTYDi+KfRi0SnzQ8k/jHYuvlk28UXWGRf33p9lLlwiuz933Z+owJBknmaYmpRqmWxgamZimmphmWJomJiYapyammpuaGaemFCmkNIQyMjg+5eJkZEBAkF8FobcxMw8BgYAODQh3A==";

const MeetingRoom = () => {
  const [roomUsers, setRoomUsers] = React.useState<IRoomUser[]>([]);

  const selfJoin = async () => {
    const uid = await client.join(appId, "main", token, null);
    localStorage.setItem("local-uid", uid.toString());

    const [audioTrack, videoTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks();

    const localUser: IRoomUser = {
      uid: uid.toString(),
      audioTrack: audioTrack,
      videoTrack: videoTrack,
      isLocal: true,
    };

    if (client.connectionState === "CONNECTED") {
      setRoomUsers((prev) => [...prev, localUser]);
      await client.publish([audioTrack, videoTrack]);
    }
  };

  useEffect(() => {
    try {
      selfJoin();
    } catch (error) {
      console.log(error);
    }

    client.on("user-published", handleUserPublishEvent);
    client.on("user-unpublished", handleUserUnpublishEvent);

    client.on("user-left", (user) => {
      console.log("user-left", user.uid);
      setRoomUsers((prev) => prev.filter((u) => u.uid !== user.uid.toString()));
    });
    client.on("user-joined", (user) => {
      const remoteUser: IRoomUser = {
        uid: user.uid.toString(),
        isLocal: false,
        videoTrack: user.hasVideo ? user.videoTrack! : null,
        audioTrack: user.hasAudio ? user.audioTrack! : null,
      };

      console.log("user-joined", user.uid, remoteUser);
      setRoomUsers((prev) => [...prev, remoteUser]);
    });

    // client.on("network-quality", (stats) => {
    //   console.log("network-quality", stats);
    // });

    return () => {
      client.leave();
      client.removeAllListeners();
    };
  }, []);

  const handleUserPublishEvent = async (
    user: IAgoraRTCRemoteUser,
    mediaType: "video" | "audio"
  ) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      const remoteUser: IRoomUser = {
        uid: user.uid.toString(),
        isLocal: false,
        videoTrack: user.videoTrack!,
        audioTrack: user.hasAudio ? user.audioTrack! : null,
      };

      setRoomUsers((prev) =>
        prev.map((u) => {
          if (u.uid === remoteUser.uid) return remoteUser;
          return u;
        })
      );
    }

    if (mediaType === "audio") {
      const remoteUser: IRoomUser = {
        uid: user.uid.toString(),
        isLocal: false,
        videoTrack: user.hasVideo ? user.videoTrack! : null,
        audioTrack: user.audioTrack!,
      };
      setRoomUsers((prev) =>
        prev.map((u) => {
          if (u.uid === remoteUser.uid) return remoteUser;
          return u;
        })
      );
    }
  };
  const handleUserUnpublishEvent = (
    user: IAgoraRTCRemoteUser,
    mediaType: "video" | "audio"
  ) => {
    if (mediaType === "video") {
      const remoteUser: IRoomUser = {
        uid: user.uid.toString(),
        isLocal: false,
        videoTrack: null,
        audioTrack: user.hasAudio ? user.audioTrack! : null,
      };

      setRoomUsers((prev) =>
        prev.map((u) => {
          if (u.uid === remoteUser.uid) return remoteUser;
          return u;
        })
      );
    }

    if (mediaType === "audio") {
      const remoteUser: IRoomUser = {
        uid: user.uid.toString(),
        isLocal: false,
        videoTrack: user.hasVideo ? user.videoTrack! : null,
        audioTrack: null,
      };
      setRoomUsers((prev) =>
        prev.map((u) => {
          if (u.uid === remoteUser.uid) return remoteUser;
          return u;
        })
      );
    }
  };
  const toggleMic = () => {
    const localUser = roomUsers.find((u) => u.isLocal);

    if (localUser) {
      // @ts-ignore
      localUser.audioTrack?.setEnabled(false);
    }
    // setRoomUsers((prev) => {
    //   return prev.map((u) => {
    //     if (u.isLocal) return { ...u, audioTrack: localUser?.audioTrack };
    //     return u;
    //   });
    // });
    // get local tracks, using microphone and camera
  };
  const toggleVideo = () => {
    const localUser = roomUsers.find((u) => u.isLocal);
    if (localUser) {
      // @ts-ignore
      localUser.videoTrack?.setEnabled(!!!localUser.videoTrack);
    }
    setRoomUsers((prev) => {
      return prev.map((u) => {
        if (u.isLocal) return { ...u, videoTrack: null };
        return u;
      });
    });
  };

  return (
    <div className="">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">Meeting Room</h3>

        <div className="flex items-center gap-4">
          <button onClick={toggleMic}>Toggle Mic</button>
          <button onClick={toggleVideo}>Toggle Video</button>
        </div>
      </div>
      <div className="grid grid-cols-3">
        {roomUsers.map((u) => (
          <RoomUserCard key={u.uid} roomUser={u} />
        ))}
      </div>
      <pre>
        {JSON.stringify(
          roomUsers.map((u) => ({
            uid: u.uid,
            isLocal: u.isLocal,
            audioEnabled: !!u.audioTrack,
            videoEnabled: !!u.videoTrack,
          })),
          null,
          2
        )}
      </pre>
    </div>
  );
};

export default MeetingRoom;
