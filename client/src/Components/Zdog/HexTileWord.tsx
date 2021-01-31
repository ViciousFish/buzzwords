import React from 'react';
import Zdog from 'zdog';
import Zfont from 'zfont';
import HexShape from './shapes/Hex';
import { theme } from '../../theme';

Zfont.init(Zdog);

interface HexTileWordProps {
  value: string;
  id: string;
}

const LetterTile = (anchorOptions: Zdog.AnchorOptions, font: Zdog.Font, letter: string) => {
  const addTo = new Zdog.Group(anchorOptions)
  HexShape({
    addTo,
    translate: {
      z: -15,
      y: -25,
      x: 25
    }
  }, 40)
  new Zdog.Text({
    addTo,
    font,
    backface: false,
    value: letter,
    fontSize: 60,
    color: theme.colors.darkbrown,
    stroke: 0,
    fill: true
  })
}

const HexTileWord: React.FC<HexTileWordProps> = ({
  value,
  id
}) => {
  React.useEffect(() => {
    let af: number;
    const illo = new Zdog.Illustration({
      element: `#HexTileWord-${id}`,
      dragRotate: true,
      // onDragStart: () => { isSpinning = false; }
    });
    const font = new Zdog.Font({
      src: 'https://cdn.jsdelivr.net/gh/jaames/zfont/demo/fredokaone.ttf'
    })

    const word = new Zdog.Group({
      addTo: illo
    })

    for (let i = 0; i < value.length; i++) {
      LetterTile({
        addTo: illo,
        translate: {
          x: i * 90 - (value.length * 45)
        },
      }, font, value[i])
    }


    // HexShape({
    //   addTo: illo
    // }, 40)

    function animate() {
      // rotate illo each frame
      illo.updateRenderGraph();
      // animate next frame
      af = requestAnimationFrame( animate );
    }

    // start animation
    animate();
    return () => {
      illo.remove();
      cancelAnimationFrame(af);
    }
  }, [value, id])
  return (<canvas id={`HexTileWord-${id}`} width={value.length * 200} height={180} />)
}

export default HexTileWord;