import Zdog from 'zdog';
import {theme} from '../../../theme';

const HexShape = (anchorOptions: Zdog.AnchorOptions, radius: number) => {
	const final = new Zdog.Anchor(anchorOptions);

	// eslint-disable-next-line
	new Zdog.Polygon({
		addTo: final,
		sides: 6,
		fill: true,
		radius,
		color: theme.colors.primary,
		stroke: 20,
	});

	return final;
};

export default HexShape;
