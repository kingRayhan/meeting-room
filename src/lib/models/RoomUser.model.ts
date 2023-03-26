import {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";

export interface IRoomUser {
  uid: string;
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack | null;
  audioTrack: IMicrophoneAudioTrack | IRemoteAudioTrack | null;
  isLocal?: boolean;
}
