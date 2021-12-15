import React from 'react';
import { Outlet } from 'react-router';

const Play: React.FC = () => (
  <group>
    <Outlet />
  </group>
)

export default Play;