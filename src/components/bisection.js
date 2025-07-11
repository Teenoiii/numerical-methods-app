export const bisectionMethod = (f, xl, xr, tolerance = 0.0001, maxIterations = 100, returnIterations = false) => {
    let iteration = 0;
    let xm, prevXm;
    const iterations = [];

    while (iteration < maxIterations) {
        prevXm = xm;
        xm = (xl + xr) / 2;
        let f_xm = f(xm);
        let error = prevXm ? Math.abs((xm - prevXm) / xm) : null;

        iterations.push({
            xl: xl.toFixed(6),
            xr: xr.toFixed(6),
            xm: xm.toFixed(6),
            f_xm: f_xm.toFixed(6),
            error: error ? error.toFixed(6) : "-"
        });

        if (Math.abs(f_xm) < tolerance || (error !== null && error < tolerance)) {
            break;
        }

        if (f(xl) * f_xm < 0) {
            xr = xm;
        } else {
            xl = xm;
        }

        iteration++;
    }

    return returnIterations
        ? { root: xm.toFixed(6), iterations }
        : xm.toFixed(6);
};
