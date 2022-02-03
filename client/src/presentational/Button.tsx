import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps {
  variant?: "light" | "dark";
  texture?: "plain" | "wood";
}

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(({ variant, texture, className, disabled, ...props }, ref) => {
  let bg = "bg-primary hover:bg-opacity-50";
  if (texture === "wood") {
    if (variant === "light" || variant === undefined) {
      bg = "wood-med-x";
    }
    if (variant === "dark") {
      bg = "wood-dark-x text-white";
    }
  } else {
    if (variant === "dark") {
      bg = "bg-darkbrown text-white hover:bg-opacity-50";
    }
    if (disabled) {
      bg = "bg-gray-300";
    }
  }
  return (
    <button
      ref={ref}
      className={classNames(
        "rounded-full p-2 m-1 inset-shadow cursor-default transition-all",
        "active:transform active:scale-90 active:bg-opacity-100",
        bg,
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
});

Button.displayName = "Button";

export default Button;
