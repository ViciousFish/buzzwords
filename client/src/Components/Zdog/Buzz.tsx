import React from 'react';
import Zdog from 'zdog';

const Buzz: React.FC = () => {
  React.useEffect(() => {
    let isSpinning = true;
    // create illo
    let illo = new Zdog.Illustration({
      // set canvas with selector
      element: '.zdog-canvas',
      dragRotate: true,
      onDragStart: () => { isSpinning = false; },
      rotate: {
        y: -0.2
      }
    });

    const beeAnchor = new Zdog.Anchor({
      addTo: illo,
      rotate: {
        x: Zdog.TAU / 8,
        y: Zdog.TAU / 8
      }
    });

    const wing = (xMultiplier: number) => ({
      addTo: beeAnchor,
      width: 80,
      height: 60,
      color: 'white',
      stroke: 7,
      fill: true,
      rotate: {
        x: Zdog.TAU / 4
      },
      translate: {
        x: xMultiplier * 50,
        y: -30
      }
    });

    new Zdog.Ellipse(wing(1));
    new Zdog.Ellipse(wing(-1));
    // add circle
    new Zdog.Hemisphere({
      addTo: beeAnchor,
      stroke: false,
      diameter: 70,
      translate: {
        z: 45
      },
      // rotate: {
      //   x: Zdog.TAU/4 
      // },
      color: '#E0A40B'
    });
    new Zdog.Cylinder({
      addTo: beeAnchor,
      diameter: 70,
      length: 90,
      stroke: false,
      color: '#E0A40B',
    });
    new Zdog.Cone({
      addTo: beeAnchor,
      diameter: 70,
      length: 50,
      stroke: false,
      color: '#59430D',
      rotate: {
        y: Zdog.TAU / 2
      },
      translate: {
        z: -45
      }
    });

    function animate() {
      // rotate illo each frame
      if (isSpinning) {
        illo.rotate.y += 0.01;
      }
      illo.updateRenderGraph();
      // animate next frame
      requestAnimationFrame( animate );
    }

    // start animation
    animate();
  }, []);

  return (<canvas className="zdog-canvas" width="240" height="240"></canvas>);
};

export default Buzz;
