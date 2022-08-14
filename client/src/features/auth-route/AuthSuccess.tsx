import React, { useEffect } from "react";

const AuthSuccess: React.FC = () => {
  useEffect(() => {
    // @ts-ignore
    location = "buzzwords://loginsuccess"
  }, [])
  return (
    <div className="bg-lightbg1 h-screen flex flex-col gap-2 items-center justify-center">
      <h1 className="text-2xl">Login successful</h1>
      <p>You may now close this window</p>
    </div>
  );
};

export default AuthSuccess;
