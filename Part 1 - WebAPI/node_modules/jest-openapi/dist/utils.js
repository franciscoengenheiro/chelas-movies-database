"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWithNewLines = exports.stringify = void 0;
const util_1 = require("util");
const stringify = (obj) => (0, util_1.inspect)(obj, { showHidden: false, depth: null });
exports.stringify = stringify;
const joinWithNewLines = (...lines) => lines.join('\n\n');
exports.joinWithNewLines = joinWithNewLines;
//# sourceMappingURL=utils.js.map