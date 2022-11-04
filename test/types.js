/*globals describe, it*/
'use strict'

var types = require('../lib/types'),
	Data = require('../lib/Data'),
	should = require('should'),
	ReadState = require('../lib/ReadState'),
	uintValues = require('./uint.json'),
	intValues = require('./int.json')

describe('types', function () {
	it('should correctly convert uints', function () {
		Object.keys(uintValues).forEach(function (value) {
			value = Number(value)
			var encoded = write(types.uint, value)
			encoded.should.be.equal(uintValues[value])
			read(encoded, types.uint).should.be.equal(value)
		})
	})

	it('should correctly convert ints', function () {
		Object.keys(intValues).forEach(function (value) {
			value = Number(value)
			var encoded = write(types.int, value)
			encoded.should.be.equal(intValues[value])
			read(encoded, types.int).should.be.equal(value)
		})
	})

	it('should be sound for float', function () {
		check(types.float, 0)
		check(types.float, 3.14)
		check(types.float, -Math.E)
		check(types.float, Infinity)
		check(types.float, -Infinity)
		check(types.float, 1 / Infinity)
		check(types.float, -1 / Infinity)
		check(types.float, NaN)
	})

	it('should be sound for string', function () {
		check(types.string, '')
		check(types.string, 'Hello World')
		check(types.string, '\u0000 Ūnĭcōde \uD83D\uDC04')
	})

	it('should be sound for Buffer', function () {
		check(types.Buffer, Buffer.from([]))
		check(types.Buffer, Buffer.from([3, 14, 15, 92, 65, 35]))
	})

	it('should be sound for boolean', function () {
		check(types.boolean, true)
		check(types.boolean, false)
	})

	it('should be sound for json', function () {
		check(types.json, true)
		check(types.json, 17)
		check(types.json, null)
		check(types.json, 'Hello')
		check(types.json, [true, 17, null, 'Hi'])
		check(types.json, {
			a: 2,
			b: {
				c: ['hi']
			}
		})
	})

	it('should be sound for rgb', function () {
		check(types.rgb, '#11aa22')
		check(types.rgb, '#111', '#111111')
		check(types.rgb, 'rgb(111, 111, 111)', '#6f6f6f')
	})

	it('should be sound for rgba', function () {
		check(types.rgba, 'rgba(255, 255, 255, 0.3)')
		check(types.rgba, 'rgba(0, 0, 0, 1.0)', 'rgba(0, 0, 0, 1)')
		check(types.rgba, 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1.0)')
	})

	it('should be sound for object id', function () {
		check(types.oid, '123456789012345678901234')
	})

	it('should be sound for regex', function () {
		check(types.regex, /my-regex/)
		check(types.regex, /^\.{3,}[\]\[2-5-]|(?:2)$/ig)
	})

	it('should be sound for date', function () {
		check(types.date, new Date)
	})
})

/**
 * @param {Object} type
 * @param {*} value
 * @return {string} - hex string
 */
function write(type, value) {
	var data = new Data
	type.write(value, data, '')
	return data.toBuffer().toString('hex')
}

/**
 * @param {string} hexStr
 * @param {Object} type
 * @return {*}
 */
function read(hexStr, type) {
	var state = new ReadState(Buffer.from(hexStr, 'hex')),
		r = type.read(state)
	state.hasEnded().should.be.true()
	return r
}

/**
 * @param {Object} type
 * @param {*} value
 */
function check(type, ...args) {
	var value = args[0]

	if (args.length === 1) {
		should(read(write(type, value), type)).be.eql(value)
	} else {
		should(read(write(type, value), type)).be.oneOf(args)
	}
}