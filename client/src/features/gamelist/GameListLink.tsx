import classNames from "classnames";
import React, { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface GameListLinkProps {
  to: string;
  children: ReactNode;
}

const GameListLink: React.FC<GameListLinkProps> = ({ to, children }) => (
  <li className="my-1 whitespace-nowrap text-sm">
    <NavLink
      className={({ isActive }) =>
        classNames(
          isActive ? "bg-primary hover:bg-opacity-100 underline" : "",
          "p-2 rounded-xl block hover:bg-primary hover:bg-opacity-50 truncate flex items-center text-darkbrown"
        )
      }
      to={to}
    >
      {children}
    </NavLink>
  </li>
);

export default GameListLink;
