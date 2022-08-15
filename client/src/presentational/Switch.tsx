import React from "react";
import { ToggleProps, useToggleState } from "react-stately";
import { useFocusRing, useSwitch, VisuallyHidden } from "react-aria";

export function Switch(props: ToggleProps) {
  let state = useToggleState(props);
  let ref = React.useRef<HTMLInputElement>(null);
  let { inputProps } = useSwitch(props, state, ref);
  let { isFocusVisible, focusProps } = useFocusRing();

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        opacity: props.isDisabled ? 0.4 : 1,
      }}
    >
      <>
        <VisuallyHidden>
          {/* @ts-ignore */}
          <input {...inputProps} {...focusProps} ref={ref} />
        </VisuallyHidden>
        <svg
          width={80}
          height={48}
          aria-hidden="true"
          style={{ marginRight: 4 }}
        >
          <rect
            x={8}
            y={8}
            width={64}
            height={32}
            rx={16}
            className={state.isSelected ? "fill-darkbrown" : "fill-gray-400"}
          />
          <circle cx={state.isSelected ? 56 : 24} cy={24} r={10} fill="white" />
          {isFocusVisible && (
            <rect
              x={2}
              y={2}
              width={76}
              height={44}
              rx={22}
              fill="none"
              stroke="cyan"
              strokeWidth={2}
            />
          )}
        </svg>
        {props.children}
      </>
    </label>
  );
}
