import { SVG, on, Circle, Svg, G, create, Element } from '@svgdotjs/svg.js';

const defaultCircle = () => SVG().circle()

interface Planet {
      period: number,
      distance: number,
      symbol: string,
      svg: Element,
      orbit: Circle,
}

const createOrbit = (planet: Planet, center: Planet, draw: Svg): Circle => {
      const orbit = draw.circle(2 * planet.distance).attr({ fill: "none" }).attr({ "stroke-dasharray": 4 }).stroke({ color: 'white', opacity: 1, width: 1 }).center(center.svg.cx(), center.svg.cy());
      planet.orbit = orbit;
      return orbit;
}

interface Planets {
      sun: Planet,
      earth: Planet
};

const lerp = (v0: number, v1: number, t: number): number => {
      return v0 + t * (v1 - v0);
};

const interpolate = (x0: number, y0: number, x1: number, y1: number, t: number): [number, number] => {
      return [lerp(x0, x1, t), lerp(y0, y1, t)];
}

const constellationBorder = (cx: number, cy: number, radius: number, draw: Svg): G => {
      const N = 12;
      var group = draw.group();
      group.circle(2*radius).center(cx, cy).attr({ fill: "none" }).stroke({ color: 'white', opacity: 1, width: 3 });
      for (let i = 0; i < N ; i++) {
            const theta = 2*Math.PI*i / N ;
            console.log(theta);
            let edgeX = radius * Math.cos(theta) + cx;
            let edgeY = radius * Math.sin(theta) + cy;
            let [endX, endY] = interpolate(edgeX, edgeY, cx, cy, 0.1);
            group.line(edgeX, edgeY, endX, endY).stroke({ color: 'white', opacity: 1, width: 3 });
      }
      return group;
}

// When timeRate is 1, the simulation is 1 minute every frame.
// When timeRate is 15, the simulation is 15 minutes every frame
const timeRate = 240;

var planets = {
      sun: {
            period: 0,
            distance: 120,
            symbol: "☉",
            svg: defaultCircle(),
            orbit: defaultCircle(),
      },
      mercury: {
            period: 88*24*60/timeRate,
            distance: 30,
            symbol: "☿",
            svg: defaultCircle(),
            orbit: defaultCircle(),
      },
      venus: {
            period: 224.7*24*60/timeRate,
            distance: 60,
            symbol: "♀︎",
            svg: defaultCircle(),
            orbit: defaultCircle(),
      },
      earth: {
            period: 365*24*60/timeRate,
            distance: 120,
            symbol: "♁",
            svg: defaultCircle(),
            orbit: defaultCircle(),
      },
      moon: {
            period: 27.3*24*60/timeRate,
            distance: 35,
            symbol: "☾",
            svg: defaultCircle(),
            orbit: defaultCircle()
      },
      mars: {
            period: 687*24*60/timeRate,
            distance: 190,
            symbol: "♂︎",
            svg: defaultCircle(),
            orbit: defaultCircle()
      },
      jupiter: {
            period: 4331*24*60/timeRate,
            distance: 235,
            symbol: "♃",
            svg: defaultCircle(),
            orbit: defaultCircle()
      },
      saturn: {
            period: 10747*24*60/timeRate,
            distance: 275,
            symbol: "♄",
            svg: defaultCircle(),
            orbit: defaultCircle()
      }
};

var constellations = SVG().group();

function createPlanetSvg(planet: Planet, color: string, draw: Svg, labelColor?: string) {
      const label = labelColor ? labelColor : "white";
      var bodyGroup = draw.group();
      const circ = bodyGroup.circle(20).attr({ fill: color });
      bodyGroup.text(planet.symbol).attr({ "text-anchor": "middle", "alignment-baseline": "middle" }).stroke(label).center(circ.cx(), circ.cy());
      planet.svg = bodyGroup;
}

on(document, 'DOMContentLoaded', function () {
      var draw = SVG().addTo('body').size(800, 800);

      createPlanetSvg(planets.sun, "yellow", draw, "black");
      var earth = draw.circle(20).center(400, 400).attr({ fill: 'blue' });
      planets.earth.svg = earth;
      createPlanetSvg(planets.moon, "grey", draw, "white");
      createPlanetSvg(planets.mars, "red", draw);
      createPlanetSvg(planets.mercury, "green", draw);
      createPlanetSvg(planets.venus, "pink", draw, "black");
      createPlanetSvg(planets.jupiter, "orange", draw);
      createPlanetSvg(planets.saturn, "brown", draw);

      createOrbit(planets.sun, planets.earth, draw);
      createOrbit(planets.moon, planets.earth, draw);
      createOrbit(planets.mars, planets.sun, draw);
      createOrbit(planets.mercury, planets.sun, draw);
      createOrbit(planets.venus, planets.sun, draw);
      createOrbit(planets.jupiter, planets.sun, draw);
      createOrbit(planets.saturn, planets.sun, draw);

      constellations = constellationBorder(earth.cx(), earth.cy(), 375, draw);
      constellations.attr({visibility: "hidden"})

})


var frames = 0;

function planetAngularVelocity(period: number): number {
      return 2 * Math.PI / period 
}

function update() {
      const yE = planets.earth.distance * Math.sin(frames * planetAngularVelocity(planets.earth.period));
      const xE = planets.earth.distance * Math.cos(frames * planetAngularVelocity(planets.earth.period));
      planets.sun.svg.center(planets.earth.svg.cx() + xE, planets.earth.svg.cy() + yE);

      const xSun = planets.sun.svg.cx();
      const ySun = planets.sun.svg.cy();

      const yMoon = planets.moon.distance * Math.sin(frames * planetAngularVelocity(planets.moon.period));
      const xMoon = planets.moon.distance * Math.cos(frames * planetAngularVelocity(planets.moon.period));
      planets.moon.svg.center(planets.earth.svg.cx() + xMoon, planets.earth.svg.cy() + yMoon);

      const yM = planets.mars.distance * Math.sin(frames * planetAngularVelocity(planets.mars.period));
      const xM = planets.mars.distance * Math.cos(frames * planetAngularVelocity(planets.mars.period));
      planets.mars.svg.center(planets.sun.svg.cx() + xM, planets.sun.svg.cy() + yM);
      planets.mars.orbit.center(xSun, ySun);

      const yMerc = planets.mercury.distance * Math.sin(frames * planetAngularVelocity(planets.mercury.period));
      const xMerc = planets.mercury.distance * Math.cos(frames * planetAngularVelocity(planets.mercury.period));
      planets.mercury.svg.center(planets.sun.svg.cx() + xMerc, planets.sun.svg.cy() + yMerc);
      planets.mercury.orbit.center(xSun, ySun);

      const yV = planets.venus.distance * Math.sin(frames * planetAngularVelocity(planets.venus.period));
      const xV = planets.venus.distance * Math.cos(frames * planetAngularVelocity(planets.venus.period));
      planets.venus.svg.center(planets.sun.svg.cx() + xV, planets.sun.svg.cy() + yV);
      planets.venus.orbit.center(xSun, ySun);

      const yJ = planets.jupiter.distance * Math.sin(frames * planetAngularVelocity(planets.jupiter.period));
      const xJ = planets.jupiter.distance * Math.cos(frames * planetAngularVelocity(planets.jupiter.period));
      planets.jupiter.svg.center(planets.sun.svg.cx() + xJ, planets.sun.svg.cy() + yJ);
      planets.jupiter.orbit.center(xSun, ySun);

      const yS = planets.saturn.distance * Math.sin(frames * planetAngularVelocity(planets.saturn.period));
      const xS = planets.saturn.distance * Math.cos(frames * planetAngularVelocity(planets.saturn.period));
      planets.saturn.svg.center(planets.sun.svg.cx() + xS, planets.sun.svg.cy() + yS);
      planets.saturn.orbit.center(xSun, ySun);

      // The sky rotates 15 degrees every hour
      constellations.rotate(timeRate*15/60.0);
}

function runner() {
      // console.log(`frame! ${frames}`);
      update();
      frames += 1;
      setTimeout(() => {
            runner();
      }, 20);
}

runner();
