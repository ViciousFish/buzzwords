import React from "react";

import Step0Video from '../../assets/0-hello-square.mp4?url'

const TutorialPage = () => {
  return (
    <div className="bg-[#F6E5AE]">
      <h2 className="font-bold text-2xl">Welcome to Buzzwords!</h2>
      <p>How to play:</p>
      <div className="my-2">

      <h3 className="text-xl">1. Make words</h3>
      <video className="w-full" src={Step0Video} playsInline autoPlay muted />
      </div>
    </div>
  );
};

export default TutorialPage;
