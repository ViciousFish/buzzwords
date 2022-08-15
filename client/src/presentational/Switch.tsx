import React from "react";
import { ToggleProps, useToggleState } from "react-stately";
import { useFocusRing, useSwitch, VisuallyHidden } from "react-aria";

export function Switch(props: ToggleProps) {
  let state = useToggleState(props);
  let ref = React.useRef<HTMLInputElement>();
  let { inputProps } = useSwitch(props, state, ref);
  let { isFocusVisible, focusProps } = useFocusRing();

  return (
    <label
      className="w-full"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "stretch",
        opacity: props.isDisabled ? 0.4 : 1,
      }}
    >
      <>
        <VisuallyHidden>
          {/* @ts-ignore */}
          <input {...inputProps} {...focusProps} ref={ref} />
        </VisuallyHidden>
        <svg
          width={40}
          height={24}
          aria-hidden="true"
          style={{ marginRight: 4 }}
        >
          <rect
            x={4}
            y={4}
            width={32}
            height={16}
            rx={8}
            className={state.isSelected ? "fill-p2" : "fill-p1"}
          />
          <circle cx={state.isSelected ? 28 : 12} cy={12} r={5} fill="white" />
          {isFocusVisible && (
            <rect
              x={1}
              y={1}
              width={38}
              height={22}
              rx={11}
              fill="none"
              className="stroke-darkbrown"
              strokeWidth={2}
            />
          )}
        </svg>
        {props.children}
      </>
    </label>
  );
}
