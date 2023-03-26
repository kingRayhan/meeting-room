import { IRoomUser } from "@/lib/models/RoomUser.model";
import classNames from "classnames";
import React, { createRef, useRef } from "react";
import { BsFillMicFill, BsFillMicMuteFill } from "react-icons/bs";

interface Props {
  roomUser: IRoomUser;
}
const RoomUserCard: React.FC<Props> = ({ roomUser }) => {
  const ref = createRef<HTMLDivElement>();

  React.useEffect(() => {
    if (roomUser) {
      roomUser.videoTrack?.play(ref.current!);
      //   roomUser.audioTrack?.play();
    }
  }, [roomUser]);

  return (
    <div
      className={classNames("border border-dashed p-4", {
        "border-yellow-500 bg-yellow-50": roomUser.isLocal,
        "border-green-500 bg-green-50": !roomUser.isLocal,
      })}
    >
      <div>uid: {roomUser.uid}</div>
      <div>isLocal: {roomUser.isLocal ? "Local" : "Remote"}</div>
      <div className="my-2">
        {roomUser.audioTrack ? <BsFillMicFill /> : <BsFillMicMuteFill />}
      </div>
      {!roomUser.videoTrack && (
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100">
          <img
            className="w-20"
            src={`https://api.dicebear.com/6.x/bottts/svg?seed=${roomUser.uid}`}
          />
        </div>
      )}
      <div ref={ref} className="h-80 w-80"></div>
    </div>
  );
};

export default RoomUserCard;
