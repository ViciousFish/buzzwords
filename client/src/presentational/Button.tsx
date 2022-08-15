import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps {
  variant?: "light" | "dark" | "quiet";
  texture?: "plain" | "wood";
}

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(({ variant, texture, className, disabled, ...props }, ref) => {
  let bg = "bg-primary text-text hover:bg-opacity-50";
  let shadow = "inset-shadow cursor-default";
  if (variant === "dark") {
    bg = "bg-darkbrown text-textInverse hover:bg-opacity-50";
  }
  if (variant === "quiet") {
    bg = "bg-lightbg bg-opacity-0 hover:bg-opacity-50";
    shadow = "";
  }
  if (disabled) {
    bg = "bg-gray-300";
  }
  return (
    <button
      ref={ref}
      className={classNames(
        "rounded-full p-2 m-1 transition-all",
        "active:transform active:scale-90 active:bg-opacity-100",
        bg,
        shadow,
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
});

Button.displayName = "Button";

export default Button;
