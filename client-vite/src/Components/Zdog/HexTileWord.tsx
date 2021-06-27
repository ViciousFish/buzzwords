import React from "react";
import Zdog from "zdog";
import Zfont from "zfont";
import HexShape from "./shapes/Hex";
import { theme } from "../../theme";

Zfont.init(Zdog);

interface HexTileWordProps {
  value: string;
  id: string;
}

const LetterTile = (
  anchorOptions: Zdog.AnchorOptions,
  font: Zdog.Font,
  letter: string
) => {
  const addTo = new Zdog.Anchor(anchorOptions);
  HexShape(
    {
      addTo,
      translate: {
        z: -15,
      },
    },
    40
  );
  new Zdog.Text({
    addTo,
    font,
    backface: false,
    value: letter,
    fontSize: 60,
    color: theme.colors.darkbrown,
    stroke: 0,
    fill: true,
    translate: {
      y: 25,
      x: -23,
    },
  });
  return addTo;
};

const HexTileWord: React.FC<HexTileWordProps> = ({ value, id }) => {
  const width = value.length * 90 + 10;
  React.useEffect(() => {
    const illo = new Zdog.Illustration({
      element: `#HexTileWord-${id}`,
    });
    const font = new Zdog.Font({
      src: "https://cdn.jsdelivr.net/gh/jaames/zfont/demo/fredokaone.ttf",
    });

    const letters: Zdog.Anchor[] = [];
    for (let i = 0; i < value.length; i++) {
      letters.push(
        LetterTile(
          {
            addTo: illo,
            translate: {
              x: i * 90 - value.length * 36,
            },
          },
          font,
          value[i]
        )
      );
    }

    let dragStartRX: number;
    let dragStartRY: number;
    const viewRotation = new Zdog.Vector();

    new Zdog.Dragger({
      startElement: illo.element,
      onDragStart() {
        dragStartRX = viewRotation.x;
        dragStartRY = viewRotation.y;
      },
      onDragMove(pointer, moveX, moveY) {
        // Move rotation
        const moveRX = (moveY / width) * Zdog.TAU * -1;
        const moveRY = (moveX / 180) * Zdog.TAU * -1;
        viewRotation.x = dragStartRX + moveRX;
        viewRotation.y = dragStartRY + moveRY;
      },
    });

    let af: number;
    function animate() {
      // Rotate shapes
      letters.forEach((letter) => letter.rotate.set(viewRotation));
      illo.updateRenderGraph();
      af = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      illo.remove();
      cancelAnimationFrame(af);
    };
  }, [value, id, width]);
  return (
    <>
      <svg id={`HexTileWord-${id}`} width={width} height={140} />
      <span
        id={`HexTileWord-${id}-alt`}
        style={{
          position: "absolute",
          maxHeight: "1px",
          maxWidth: "1px",
          overflow: "hidden",
          opacity: 0,
        }}
      >
        animated 3d text that reads {value}
      </span>
    </>
  );
};

export default HexTileWord;
