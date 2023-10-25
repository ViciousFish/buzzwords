import classNames from "classnames";
import React from "react";
import { Button, ButtonRenderProps, Link } from "react-aria-components";

import styles from "./NewButton.module.css";

interface NewButtonOwnprops {
  variant?: "green" | "blue" | "red" | "neutral" | "springtime" | "sunset";
  thicker?: boolean;
  children: React.ReactNode;
}

type NewButtonProps = NewButtonOwnprops &
  React.ComponentPropsWithoutRef<typeof Button>;

const BG_BY_VARIANT = {
  green: "bg-vibrant-grad-green",
  neutral: "bg-vibrant-grad-neutral",
  blue: "bg-vibrant-grad-blue",
  red: "bg-vibrant-grad-red",
  springtime: 'bg-vibrant-grad-springtime',
  sunset: 'bg-vibrant-grad-sunset',
};

export function NewButton({
  children,
  className,
  variant,
  thicker,
  ...props
}: NewButtonProps) {
  const bg = variant ? `bg-vibrant-grad-${variant}` : "bg-vibrant-grad-neutral";
  return (
    <Button
      className={({ isDisabled }) =>
        classNames(
          styles.Parent,
          !isDisabled ? bg : BG_BY_VARIANT.neutral,
          isDisabled ? 'opacity-70' : '',
          thicker ? "p-2" : "p-2",
          "rounded-full inset-shadow bg-gradient-to-45"
        )
      }
      {...props}
    >
      {({ isPressed }: ButtonRenderProps) => (
        <div
          className={classNames(
            styles.Child,
            "inset-shadow rounded-full p-3 px-4",
            "bg-white dark:bg-slate-800 text-darkbrown",
            className
          )}
        >
          {children}
        </div>
      )}
    </Button>
  );
}
