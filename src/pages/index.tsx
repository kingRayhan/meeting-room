import { useSetState } from "@mantine/hooks";
import dynamic from "next/dynamic";

const MeetingRoom = dynamic(() => import("@/components/MeetingRoom"), {
  ssr: false,
});

const HomePage = () => {
  const [state, setState] = useSetState({
    joined: false,
  });

  return (
    <>
      {!state.joined && (
        <div className="grid h-screen place-content-center">
          <button
            className=" rounded-md bg-indigo-500 px-4 py-2 text-white"
            onClick={() => setState({ joined: !state.joined })}
          >
            Join Meeting
          </button>
        </div>
      )}
      {state.joined && <MeetingRoom />}
    </>
  );
};

export default HomePage;
