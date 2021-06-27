import React from 'react';
import './App.css';
import Buzz from './Components/Zdog/Buzz';
import {Canvas} from '@react-three/fiber';
import {Html, Stats, useProgress} from '@react-three/drei';
import CameraControls from './Components/three/CameraControls';
import HexWord from './Components/three/HexWord';

/* Three TODO
- hexagon
  - rounded corners
- drag rotate
- animate with spring
- text
- word component (?textBufferGeometry?)
*/

function App() {
	console.log(window.devicePixelRatio);
	const {progress} = useProgress();
	return (
		<div className="App">
			<header className="App-header">
				{window.devicePixelRatio} - {Math.max(window.devicePixelRatio, 2)}
				<Buzz />
				<Canvas
					// Gl={{ antialias: false }}
					camera={{
						position: [0, 0, 100],
						zoom: 20,
					}}
					dpr={Math.max(window.devicePixelRatio, 2)}
					// Orthographic
					flat
				>
					<Stats />
					<CameraControls />
					<ambientLight />
					{/* <pointLight position={[10, 10, 10]} /> */}
					<directionalLight position={[5, 5, 10]} />
					<React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
						{/* <HexLetter letter='H' position={[0, 0, 0]} /> */}
						<HexWord children="SOON" />
					</React.Suspense>
				</Canvas>
			</header>
		</div>
	);
}

export default App;
