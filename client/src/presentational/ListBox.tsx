import React from "react";
import type { AriaListBoxProps } from "react-aria";
import { useListState, ListState } from "react-stately";
import {
  mergeProps,
  useFocusRing,
  useListBox,
  useOption,
  useListBoxSection,
  useSeparator,
  AriaListBoxOptions,
} from "react-aria";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Node } from "@react-types/shared";

interface ListBoxProps<T extends Object> extends AriaListBoxOptions<T> {
  listBoxRef?: React.RefObject<HTMLUListElement>;
  state: ListState<T>;
}

interface SectionProps {
  section: Node<unknown>;
  state: ListState<unknown>;
}

interface OptionProps {
  item: Node<unknown>;
  state: ListState<unknown>;
}

export function ListBox<T extends object>(props: AriaListBoxProps<T>) {
  // Create state based on the incoming props
  const state = useListState(props);
  return <ListBoxInternal {...props} state={state} />;
}

export function ListBoxInternal<T extends Object>(props: ListBoxProps<T>) {
  // Get props for the listbox element
  let ref = React.useRef<HTMLUListElement>(null);
  let { listBoxRef = ref, state } = props;
  let { listBoxProps, labelProps } = useListBox(props, state, listBoxRef);

  return (
    <>
      <div {...labelProps}>{props.label}</div>
      <ul
        {...listBoxProps}
        ref={listBoxRef}
        className="max-h-72 overflow-auto outline-none"
      >
        {[...state.collection].map((item) =>
          item.type === "section" ? (
            <ListBoxSection key={item.key} section={item} state={state} />
          ) : (
            <Option key={item.key} item={item} state={state} />
          )
        )}
      </ul>
    </>
  );
}

function ListBoxSection({ section, state }) {
  let { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.rendered,
    "aria-label": section["aria-label"],
  });

  let { separatorProps } = useSeparator({
    elementType: "li",
  });

  // If the section is not the first, add a separator element.
  // The heading is rendered inside an <li> element, which contains
  // a <ul> with the child items.
  return (
    <>
      {/* {section.key !== state.collection.getFirstKey() && (
        <li
          {...separatorProps}
          className="mx-2 border-t border-text"
        />
      )} */}
      <li {...itemProps}>
        {section.rendered && (
          <span
            {...headingProps}
            className="font-bold text-text opacity-70 mx-2"
          >
            {section.rendered}
          </span>
        )}
        <ul
          {...groupProps}
          style={{
            padding: 0,
            listStyle: "none",
          }}
        >
          {[...section.childNodes].map((node) => (
            <Option key={node.key} item={node} state={state} />
          ))}
        </ul>
      </li>
    </>
  );
}

function Option({ item, state }) {
  // Get props for the option element
  let ref = React.useRef(null);
  let {
    optionProps,
    labelProps,
    descriptionProps,
    isSelected,
    isDisabled,
    isFocused,
  } = useOption({ key: item.key }, state, ref);

  // Determine whether we should show a keyboard
  // focus ring for accessibility
  // let { isFocusVisible, focusProps } = useFocusRing();

  const [title, description] =
    typeof item.rendered[Symbol.iterator] === "function" ? item.rendered : [];
  const isComplex = Array.isArray(item.rendered);

  return (
    <li
      // {...mergeProps(optionProps, focusProps)}
      {...optionProps}
      className={`m-1 rounded-md py-2 px-2 text-sm outline-none cursor-default flex items-center justify-between 
      text-darkbrown border-2 ${
        isFocused ? "border-primary" : "border-transparent"
      } 
      ${isSelected ? "bg-primary" : ""} ${
        isSelected && !isComplex ? "font-bold" : ""
      } ${
        isDisabled ? "opacity-50" : ""
      }`}
      ref={ref}
    >
      <>
        {!isComplex && item.rendered}
        {isComplex && (
          <div className="flex flex-col">
            {title && React.cloneElement(title, labelProps)}
            {description && React.cloneElement(description, descriptionProps)}
          </div>
        )}
        {isSelected && (
          <FontAwesomeIcon
            icon={faCheck}
            aria-hidden="true"
            className="w-5 h-5 text-p2"
          />
        )}
      </>
    </li>
  );
}
