import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  disabled,
  ...props
}) => (
  <button
    className={classNames(
      `rounded-full p-2 m-1  inset-shadow cursor-default
      transition-all
      active:transform active:scale-90 active:bg-opacity-100`,
      disabled ? "bg-gray-300" : "bg-primary hover:bg-opacity-50",
      className
    )}
    disabled={disabled}
    {...props}
  />
);

export default Button;
