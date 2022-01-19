import React from "react";
import { useAppDispatch } from "../../app/hooks";
import Button from "../../presentational/Button";
import Modal from "../../presentational/Modal";
import TutorialCard from "../gamelist/TutorialCard";
import { toggleTutorialModal } from "./gameSlice";

const TutorialModal: React.FC = () => {
  const dispatch = useAppDispatch();
  return (
    <Modal>
      <div className="rounded-xl bg-lightbg flex-shrink-0">
        <p className="px-8 py-4 text-center max-w-[560px]">
          It looks like this is your first time playing.
          <br /> Watch a quick minute-ish tutorial?
        </p>
        <iframe
          style={{
            maxWidth: "100%",
            width: "560px",
          }}
          height="315"
          src="https://www.youtube.com/embed/MwULUSGQ9oo"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="border-darkbrown border-2 rounded-lg"
        ></iframe>
        <div className="mt-2 lg:hidden" style={{ maxWidth: "560px" }}>
          <TutorialCard hideDismiss />
        </div>
        <div className="flex justify-center items-center">
          <Button
            onClick={() => {
              dispatch(toggleTutorialModal());
            }}
          >
            Dismiss tutorial
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TutorialModal;
