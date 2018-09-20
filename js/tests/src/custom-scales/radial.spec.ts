// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  range
} from 'd3-array';

import {
  scaleLinear, InterpolatorFactory
} from 'd3-scale';

import {
  interpolate, interpolateRound
} from 'd3-interpolate';

import {
  radialScale, RadialScale
} from '../../../src/custom-scales'


describe('radialScale', () => {

    it('should be createable', () => {
        let scale = radialScale();
        expect(typeof scale).to.be('function');
    });

    it('should have expected default values', () => {
        let scale = radialScale();
        expect(scale.domain()).to.eql([0, 360]);
        expect(scale.range()).to.eql([0, 2 * Math.PI]);
        expect(scale.clamp()).to.be(false);
        expect(scale.unit()).to.be('deg');
    });

    it('should use eights as default ticks', () => {
        let scale = radialScale();
        expect(scale.ticks()).to.eql(range(0, 361, 45));
    });

    it('should use tenths ticks if count 10', () => {
        let scale = radialScale();
        expect(scale.ticks(10).map(x => Math.round(x))).to.eql(
            range(0, 361, 36));
    });

    it('should use sixths ticks if count 6', () => {
        let scale = radialScale();
        expect(scale.ticks(6)).to.eql(range(0, 361, 60));
    });

    it('should use eights ticks if count 7', () => {
        let scale = radialScale();
        expect(scale.ticks(7)).to.eql(range(0, 361, 45));
    });

    it('should use normal ticks if less than 30 deg', () => {
        let scale = radialScale()
            .domain([0, 20])
            .range([0, 20 * Math.PI / 180]);
        expect(scale.ticks()).to.eql(range(0, 21, 2));
    });

    it('should nice to eights by default', () => {
        let scale = radialScale()
            .domain([-55, 112])
            .range([-55 * Math.PI / 180, 112 * Math.PI / 180])
            .nice();
        expect(scale.domain().map(x => Math.round(x))).to.eql([-90, 135]);
        expect(scale.range()).to.eql([-90 * Math.PI / 180, 135 * Math.PI / 180]);
    });

});

