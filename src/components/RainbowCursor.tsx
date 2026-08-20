import { useEffect } from "react";
import { rainbowCursor } from "cursor-effects";

const TRAIL_LENGTH = 20;
const TRAIL_SIZE = 1;

export function RainbowCursor() {
	useEffect(() => {
		const effect = rainbowCursor({ length: TRAIL_LENGTH, size: TRAIL_SIZE, colors: ["#143F6B", "#143F6B", "#205C96", "#205C96", "#2A74B5", "#2A74B5"] });
		return () => effect.destroy();
	}, []);

	return null;
}
