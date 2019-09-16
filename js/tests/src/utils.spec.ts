// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  parseCssColor
} from '../../src/utils';


describe('parseCssColor', () => {

    it('should parse 6-digit hexes', async () => {
        expect(parseCssColor('#ffffff')).to.eql([255, 255, 255, 255]);
        expect(parseCssColor('#000000')).to.eql([0, 0, 0, 255]);
        expect(parseCssColor('#011000')).to.eql([1, 16, 0, 255]);
    });

    it('should parse rgb strings', async () => {
        expect(parseCssColor('rgb(  255,255,   255  )')).to.eql([255, 255, 255, 255]);
        expect(parseCssColor('rgb(0,255,0)')).to.eql([0, 255, 0, 255]);
        expect(parseCssColor('rgb(010,  255,0)')).to.eql([10, 255, 0, 255]);
    });

    it('should parse rgba strings', async () => {
        expect(parseCssColor('rgba(  255,255,   255  ,  1.0  )')).to.eql([255, 255, 255, 255]);
        expect(parseCssColor('rgba(0,255,0, .1)')).to.eql([0, 255, 0, 26]);
        expect(parseCssColor('rgba(0,0,0,1. )')).to.eql([0, 0, 0, 255]);
        expect(parseCssColor('rgba(0,0,0, 1)')).to.eql([0, 0, 0, 255]);
        expect(parseCssColor('rgba(0,0,0, 0.1 )')).to.eql([0, 0, 0, 26]);
    });

    it('should throw for invalid string', async () => {
        const args = [
            'rgba(0,255,0, .1',
            'rgba(0,25.5,0, .1)',
            'rgba(0,255,0)',
            'rgb(0,255,0, 0.2)',
            'ffffff',
            '#ffff0',
        ];
        for (let s of args) {
            expect(parseCssColor).withArgs(s).to.throwError(/Invalid CSS color:/);
        }
    });

});
