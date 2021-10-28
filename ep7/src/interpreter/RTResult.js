const { UniformError } = require("src/errors");
const Value = require("src/interpreter/Value");

module.exports = class RTResult {
    constructor() {
        /**
         * @type {Value}
         */
        this.value = null;
        /**
         * @type {UniformError}
         */
        this.error = null;
    }

    /**
     * @param {RTResult} res 
     * @returns {any}
     */
    register(res) {
        if(res.error) this.error = res.error;
        return res.value;
    }

    /**
     * @param {Value} value 
     * @returns {RTResult}
     */
    success(value) {
        this.value = value;
        return this;
    }

    /**
     * @param {UniformError} error 
     * @returns {RTResult}
     */
    failure(error) {
        this.error = error;
        return this; 
    }

}