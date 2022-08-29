import React, { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { useNavigate } from 'react-router';

const MobileRoutingComponent = () => {
  let navigate = useNavigate();
  useEffect(() => {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      // Example url: https://beerswift.app/tabs/tab2
      // slug = /tabs/tab2
      // const slug = event.url.split('.gg').pop();
      const url = new URL(event.url);
      if (url.pathname) {
        navigate(url.pathname);
      }
      // If no match, do nothing - let regular routing
      // logic take over
    });
  }, [navigate]);

  return null;
};

export default MobileRoutingComponent;
