import React from "react";
import { OverlayTriggerStateContext } from "react-aria-components";

import { NicknameForm } from "../settings/NicknameForm";
import classNames from "classnames";
import { INPUT_TEXT } from "../../presentational/InputColors";

const NicknameModal: React.FC = () => {
  const { close } = React.useContext(OverlayTriggerStateContext)!;
  return (
    <div className={classNames(INPUT_TEXT, "p-8 bg-bYellow-400 dark:bg-bBrown-900 shadow-lg rounded-xl bg-lighterbg")}>
      <h1 className="text-2xl font-bold">Pick a nickname</h1>
      <p>It doesn&apos;t have to be unique. Your opponents will see it.</p>
      <div className="mt-2">
        <NicknameForm afterSubmit={close} onCancel={() => close()} />
      </div>
    </div>
  );
};

export default NicknameModal;
