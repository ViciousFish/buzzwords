import React from 'react';
import Zdog from 'zdog';
import Zfont from 'zfont';
import HexShape from './shapes/Hex';
import * as R from 'ramda';
import { theme } from '../../theme';

Zfont.init(Zdog);

const mapIndexed = R.addIndex(R.map);

interface HexTileWordProps {
  value: string;
  id: string;
}

const LetterTile = (anchorOptions: Zdog.AnchorOptions, font: Zdog.Font, letter: string) => {
  const addTo = new Zdog.Anchor(anchorOptions);
  new Zdog.Text({
    addTo,
    font,
    value: letter,
    fontSize: 64,
    color: theme.colors.darkbrown,
    fill: true
  })
  HexShape({
    addTo,
    translate: {
      z: -5,
      y: -25,
      x: 25
    }
  }, 50)
}

const HexTileWord: React.FC<HexTileWordProps> = ({
  value,
  id
}) => {
  React.useEffect(() => {
    let af: number;
    let illo = new Zdog.Illustration({
      element: `#HexTileWord-${id}`,
      dragRotate: true,
      // onDragStart: () => { isSpinning = false; }
    });
    let font = new Zdog.Font({
      src: 'https://cdn.jsdelivr.net/gh/jaames/zfont/demo/fredokaone.ttf'
    })

    for (let i = 0; i < value.length; i++) {
      LetterTile({
        addTo: illo,
        translate: {
          x: i * 90
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