import React from "react";
import BGIOClient from "../bgio-board/BGIOClient";

const Home: React.FC = () => {
  return (
    <>
      <BGIOClient playerID="0" matchID="tutorial" />
    </>
  );
};

export default Home;
