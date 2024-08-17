import classNames from "classnames";
import React from "react";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

const Modal: React.FC<React.ComponentPropsWithRef<typeof ReactModal>> = ({
  children,
  isOpen,
  className,
  overlayClassName,
  ...props
}) => {
  return (
    <ReactModal
      isOpen
      className={classNames("z-30 outline outline-0", className)}
      overlayClassName={classNames(
        "z-40 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50",
        "md:flex items-center overflow-auto justify-center safe-area-pad",
        overlayClassName
      )}
      {...props}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
