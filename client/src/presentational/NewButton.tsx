import classNames from "classnames";
import React from "react";
import { Button, ButtonRenderProps, Link } from "react-aria-components";

import styles from "./NewButton.module.css";

interface NewButtonOwnprops {
  variant?: "green" | "blue" | "red" | "neutral";
  thicker?: boolean;
  children: React.ReactNode;
}

type NewButtonProps = NewButtonOwnprops &
  React.ComponentPropsWithoutRef<typeof Button>;

const BG_BY_VARIANT = {
  green: "bg-vibrant-grad-green",
  neutral: "bg-vibrant-grad-neutral",
  blue: "bg-vibrant-grad-blue",
  red: "bg-vibrant-grad-red"
};

export function NewButton({
  children,
  className,
  variant,
  thicker,
  ...props
}: NewButtonProps) {
  const bg = variant ? BG_BY_VARIANT[variant] : "bg-vibrant-grad-neutral";
  return (
    <Button
      className={({ isDisabled }) =>
        classNames(
          styles.Parent,
          !isDisabled ? bg : BG_BY_VARIANT.neutral,
          isDisabled ? 'opacity-70' : 'shadow-md',
          thicker ? "p-2" : "p-1",
          "rounded-full"
        )
      }
      {...props}
    >
      {({ isPressed }: ButtonRenderProps) => (
        <div
          className={classNames(
            styles.Child,
            "inset-shadow rounded-full p-2 px-3",
            "bg-white dark:bg-slate-800 text-black dark:text-white",
            className
          )}
        >
          {children}
        </div>
      )}
    </Button>
  );
}
