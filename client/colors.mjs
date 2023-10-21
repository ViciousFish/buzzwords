import chroma from "chroma-js";
import { pipe, map, join } from "ramda";

const toHSLObject = (hslStr) => {
  const [h, s, l, position] = hslStr
    .match(/\d+/g)
    .map(Number)
    .map((val, i) => {
      if (i> 0 && i < 3) {
        return val / 100;
      }
      return val;
    });
  return {
    hsl: { h, s, l },
    position
  };
};

const list_string = (list) => `\n"${list.join('",\n"')}"`;

const list_obj = (list) => JSON.stringify(list.map(color => ({ DEFAULT: color})))

const sunset = [
  "hsl(203deg 100% 47%)",
  "hsl(230deg 84% 71%)",
  "hsl(269deg 73% 71%)",
  "hsl(308deg 69% 67%)",
  "hsl(329deg 100% 70%)",
  "hsl(343deg 100% 70%)",
  "hsl(4deg 100% 70%)",
  "hsl(23deg 100% 62%)",
  "hsl(38deg 100% 50%)",
  "hsl(38deg 100% 54%)",
  "hsl(39deg 100% 57%)",
  "hsl(39deg 99% 59%)",
  "hsl(40deg 99% 61%)",
  "hsl(41deg 99% 63%)",
  "hsl(43deg 99% 65%)",
  "hsl(44deg 100% 67%)",
  "hsl(45deg 100% 69%)",
];

let springtime = `hsl(299deg 100% 79%) 0%,
hsl(270deg 100% 82%) 5%,
hsl(229deg 100% 82%) 10%,
hsl(207deg 100% 72%) 14%,
hsl(197deg 100% 60%) 18%,
hsl(192deg 100% 50%) 22%,
hsl(187deg 100% 46%) 26%,
hsl(178deg 100% 42%) 30%,
hsl(165deg 100% 43%) 34%,
hsl(123deg 59% 64%) 39%,
hsl(75deg 63% 54%) 43%,
hsl(50deg 94% 47%) 48%,
hsl(44deg 100% 55%) 54%,
hsl(44deg 100% 59%) 60%,
hsl(44deg 100% 62%) 67%,
hsl(44deg 100% 65%) 75%,
hsl(45deg 100% 67%) 85%,
hsl(45deg 100% 69%) 100%`;

springtime = springtime.split(",\n").filter((row, i) => i % 2 == 0);

const to_chroma = (s) => {
  const hslObj = toHSLObject(s);
  const color = chroma(hslObj.hsl);
  return [color, hslObj.position];
};
const chroma_to_lch = ([color, position]) => {
  return [color.oklch(), position];
};

const fix_lch = ([[l, c, h], pos]) => ([[l * 100, c, h], pos])
const mod_lch = ([[l, c, h], pos]) => ([[l - 10, c, h + 4], pos])

const format_lch = ([lch]) => {
  const [l, c, h] = lch.map((n) => n.toFixed(2));
  return `oklch(${l}% ${c} ${h} / var(--tw-bg-opacity))`;
};
const format_hex = ([[_l, ...ch]]) => {
  return chroma.oklch(_l / 100, ...ch).hex();
};
const format_grad = ([lch, pos]) => `${format_lch([lch])} ${pos}%`

const get_palette = (formatter) => ([[l, c, h]]) => {
  return {
    darker: formatter([[Math.max(l - 10, 0), c, h]]),
    DEFAULT: formatter([[l, c, h]]),
    lighter: formatter([[Math.min(l + 7, 100), c - 0.07, h]]),
  }
}


const to_threed = map(pipe(to_chroma, chroma_to_lch, fix_lch, mod_lch, get_palette(format_hex)));

const to_tailwind = map(pipe(to_chroma, chroma_to_lch, fix_lch, get_palette(format_lch)))

const to_css = map(pipe(to_chroma, chroma_to_lch, fix_lch, format_grad))


pipe(to_threed, JSON.stringify, console.log)(springtime)
// pipe(to_tailwind, JSON.stringify, console.log)(springtime)
// pipe(to_css, join(',\n'), console.log)(springtime)
