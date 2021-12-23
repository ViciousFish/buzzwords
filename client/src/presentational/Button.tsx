import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => (
  <button
    className={classNames(
      `rounded-full p-2 m-1 bg-primary inset-shadow active:inset-shadow-reverse cursor-default 
      hover:bg-primary hover:bg-opacity-50 active:bg-opacity-100`,
      className
    )}
    {...props}
  />
);

export default Button;
