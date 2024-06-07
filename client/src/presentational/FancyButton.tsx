import React from "react";
import classNames from "classnames";
import { Button, Link } from "react-aria-components";
import { NavLink } from "react-router-dom";

import styles from "./FancyButton.module.css";

export enum FancyButtonVariant {
  Springtime = "Springtime",
  Sunset = "Sunset",
}

type FancyButtonProps<T extends typeof Button | typeof NavLink> = Omit<
  React.ComponentProps<T>,
  "children"
> & {
  colorClasses?: string;
  children: React.ReactNode;
  variant?: FancyButtonVariant;
};

const getBackgroundFromVariant = (variant?: FancyButtonVariant) => {
  switch (variant) {
    case FancyButtonVariant.Springtime:
      return styles.Springtime;
    case FancyButtonVariant.Sunset:
    default:
      return styles.Sunset;
  }
};

export function FancyButton({
  className,
  colorClasses,
  children,
  variant,
  ...props
}: FancyButtonProps<typeof Button>) {
  return (
    <Button
      className={classNames(
        styles.Parent,
        "rounded-full focus:outline cursor-auto",
        props.isDisabled ? "bg-slate-300" : getBackgroundFromVariant(variant),
        className
      )}
      {...props}
    >
      <div
        className={classNames(
          styles.Child,
          "rounded-full",
          props.isDisabled ? "bg-slate-100" : "bg-white"
        )}
      >
        {children}
      </div>
    </Button>
  );
}

export function FancyButtonLink({
  className,
  colorClasses,
  children,
  variant,
  ...props
}: FancyButtonProps<typeof NavLink>) {
  return (
    <NavLink
      className={classNames(
        styles.Parent,
        "rounded-full focus:outline",
        getBackgroundFromVariant(variant),
        className
      )}
      {...props}
    >
      <div className={classNames(styles.Child, "bg-white rounded-full")}>
        {children}
      </div>
    </NavLink>
  );
}
