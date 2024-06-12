import classNames from "classnames";
import React from "react";
import type { ListBoxItemProps, SelectProps } from "react-aria-components";
import {
  Button,
  Label,
  ListBox,
  Popover,
  Select as RACSelect,
  SelectValue,
  Text,
  ListBoxItem,
} from "react-aria-components";
import { INPUT_BG, INPUT_BORDER, INPUT_TEXT } from "./InputColors";

interface MySelectProps<T extends object>
  extends Omit<SelectProps<T>, "children"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  ...props
}: MySelectProps<T>) {
  return (
    <RACSelect className="flex flex-col items-stretch flex-auto" {...props}>
      <Label className="pl-2 text-sm m-0">{label}</Label>
      <Button
        className={classNames(
          INPUT_BG, INPUT_BORDER, INPUT_TEXT,
          "text-left p-2 rounded-md w-full flex"
        )}
      >
        <SelectValue className="flex-auto" />
        <span aria-hidden="true">▼</span>
      </Button>
      {description && <Text slot="description">{description}</Text>}
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      <Popover
        className={classNames(INPUT_BG, INPUT_TEXT, `p-2 rounded-md shadow w-[var(--trigger-width)]`)}
      >
        <ListBox className="flex flex-col items-stretch gap-1 w-full">
          {children}
        </ListBox>
      </Popover>
    </RACSelect>
  );
}

export function Item({ className, ...props }: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
      className={classNames(
        className,
        INPUT_TEXT, INPUT_BG,
        "hover:bg-beeYellow-300 dark:hover:bg-beeYellow-700",
        "p-2 rounded"
      )}
    />
  );
}
