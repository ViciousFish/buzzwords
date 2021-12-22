import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => (
  <button
    className={classNames(
      "rounded-md p-2 m-1 bg-primary inset-shadow cursor-default hover:bg-primary hover:bg-opacity-50",
      className
    )}
    {...props}
  />
);

export default Button;
