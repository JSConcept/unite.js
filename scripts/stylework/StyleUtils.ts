// Currently, I'm using SASS version of such p.sheet
export const WavyShapedCircle = (steps = 100, amplitude = 0.06, freq = 8) => {
    const points: number[] = [];
    for (let i = 0; i < steps; i++) { points.push(i / steps); }

    //
    const angle = (step) => { return `calc(${step}rad * pi * 2)`; };
    const variant = (step) => {
        return `calc(calc(cos(calc(var(--clip-freq) * ${angle(step)})) * 0.5 + 0.5) * var(--clip-amplitude))`;
    };

    //
    const func = (step) => {
        return [
            `calc(calc(0.5 + calc(cos(${angle(step)}) * calc(0.5 - ${variant(step)}))) * 100%)`,
            `calc(calc(0.5 + calc(sin(${angle(step)}) * calc(0.5 - ${variant(step)}))) * 100%)`
        ];
    };

    //
    const d = points.map((step) => {const stp = func(step).join(" "); return stp;}).join(", ");

    //
    return {
        "--clip-amplitude": amplitude,
        "--clip-freq": freq,
        "--clip-path": `polygon(${d})`
    };
};
