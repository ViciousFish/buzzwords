import React from "react";
import { OverlayTriggerStateContext } from "react-aria-components";

import { NicknameForm } from "../settings/NicknameForm";

const NicknameModal: React.FC = () => {
  const { close } = React.useContext(OverlayTriggerStateContext)!;
  return (
    <div className="p-8 shadow-lg rounded-xl bg-lighterbg">
      <h1 className="text-2xl font-bold">Pick a nickname</h1>
      <p>It doesn&apos;t have to be unique. Your opponents will see it.</p>
      <div className="mt-2">
        <NicknameForm afterSubmit={close} onCancel={() => close()} />
      </div>
    </div>
  );
};

export default NicknameModal;
