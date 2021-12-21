import React from 'react';
import { Link, useMatch } from 'react-router-dom';

interface GameListItemProps {
  gameId: string;
}

const GameListItem: React.FC<GameListItemProps> = ({
  gameId
}) => {
  const active = useMatch(`/play/${gameId}`)
  const classes = active ? '' : 'underline text-blue-800'
  return (
    <li className='mx-2 my-1 whitespace-nowrap'>
      <Link className={classes} to={`/play/${gameId}`}>{gameId}</Link>
    </li>
  )
}

export default GameListItem