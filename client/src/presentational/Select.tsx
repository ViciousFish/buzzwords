import React from "react";
import type { AriaSelectProps } from "@react-types/select";
import { useSelectState } from "react-stately";
import {
  useSelect,
  HiddenSelect,
  useButton,
  mergeProps,
  useFocusRing
} from "react-aria";

import { ListBox, ListBoxInternal } from "./ListBox";
import { Popover } from "./Popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronCircleDown } from "@fortawesome/free-solid-svg-icons";

export { Item } from "react-stately";

export function Select<T extends object>(props: AriaSelectProps<T>) {
  // Create state based on the incoming props
  let state = useSelectState(props);

  // Get props for child elements from useSelect
  let ref = React.useRef(null);
  let { labelProps, triggerProps, valueProps, menuProps } = useSelect(
    props,
    state,
    ref
  );

  // Get props for the button based on the trigger props from useSelect
  let { buttonProps } = useButton(triggerProps, ref);

  let { focusProps, isFocusVisible } = useFocusRing();

  return (
    <div className="inline-flex flex-col relative w-full">
      <div
        {...labelProps}
        className="block text-sm font-medium text-text text-left cursor-default pl-2"
      >
        {props.label as React.ReactNode}
      </div>
      <HiddenSelect
        state={state}
        triggerRef={ref}
        label={props.label}
        name={props.name}
      />
      <button
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        className={`p-1 pl-3 py-1 relative inline-flex flex-row items-center justify-between rounded-md overflow-hidden cursor-default border-2 outline-none ${
          isFocusVisible ? "border-darkbrown" : "border-primary"
        } ${state.isOpen ? "bg-input" : "bg-input"}`}
      >
        <span
          {...valueProps}
          className={`text-md ${
            state.selectedItem ? "text-text" : "text-textSubtle"
          }`}
        >
          {state.selectedItem
            ? state.selectedItem.rendered as React.ReactNode
            : "Select an option"}
        </span>
        <FontAwesomeIcon icon={faChevronCircleDown}
          className={`w-5 h-5 ${
            isFocusVisible ? "text-darkbrown" : "text-primary"
          }`}
        />
      </button>
      {state.isOpen && (
        <Popover isOpen={state.isOpen} onClose={state.close}>
          <ListBoxInternal {...menuProps} state={state} />
        </Popover>
      )}
    </div>
  );
}
