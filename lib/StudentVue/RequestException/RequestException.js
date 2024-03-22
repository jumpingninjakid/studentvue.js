(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.RequestException = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * RequestException is a class used to parse errors from Synergy servers
   * @constructor
   */
  class RequestException {
    constructor(obj) {
      if ('message' in obj) {
        /**
         * The message of the exception
         * @public
         * @readonly
         */
        this.message = obj.message;
        /**
         * The stack trace of the exception. (java)
         * @public
         * @readonly
         */
        this.stack = obj.stack;
      } else if (Array.isArray(obj.RT_ERROR)) {
        const rtError = obj.RT_ERROR[0];
        /**
         * The message of the exception
         * @public
         * @readonly
         */
        this.message = rtError['@_ERROR_MESSAGE'][0];
        /**
         * The stack trace of the exception. (java)
         * @public
         * @readonly
         */
        this.stack = rtError.STACK_TRACE ? rtError.STACK_TRACE[0] : undefined;
      } else {
        /**
         * The message of the exception
         * @public
         * @readonly
         */
        this.message = obj.RT_ERROR['@_ERROR_MESSAGE'];
        /**
         * The stack trace of the exception. (java)
         * @public
         * @readonly
         */
        this.stack = obj.RT_ERROR.STACK_TRACE;
      }
    }
  }
  _exports.default = RequestException;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXF1ZXN0RXhjZXB0aW9uIiwiY29uc3RydWN0b3IiLCJvYmoiLCJtZXNzYWdlIiwic3RhY2siLCJBcnJheSIsImlzQXJyYXkiLCJSVF9FUlJPUiIsInJ0RXJyb3IiLCJTVEFDS19UUkFDRSIsInVuZGVmaW5lZCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TdHVkZW50VnVlL1JlcXVlc3RFeGNlcHRpb24vUmVxdWVzdEV4Y2VwdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYXJzZWRBbm9ueW1vdXNSZXF1ZXN0RXJyb3IsIFBhcnNlZFJlcXVlc3RFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL3NvYXAvQ2xpZW50L0NsaWVudC5pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBSZXF1ZXN0RXhjZXB0aW9uIGlzIGEgY2xhc3MgdXNlZCB0byBwYXJzZSBlcnJvcnMgZnJvbSBTeW5lcmd5IHNlcnZlcnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXF1ZXN0RXhjZXB0aW9uIHtcbiAgcHVibGljIHJlYWRvbmx5IG1lc3NhZ2U6IHN0cmluZztcblxuICBwdWJsaWMgcmVhZG9ubHkgc3RhY2s6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3Iob2JqOiBQYXJzZWRSZXF1ZXN0RXJyb3IgfCB7IG1lc3NhZ2U6IHN0cmluZzsgc3RhY2s/OiBzdHJpbmcgfSB8IFBhcnNlZEFub255bW91c1JlcXVlc3RFcnJvcikge1xuICAgIGlmICgnbWVzc2FnZScgaW4gb2JqKSB7XG4gICAgICAvKipcbiAgICAgICAqIFRoZSBtZXNzYWdlIG9mIHRoZSBleGNlcHRpb25cbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqIEByZWFkb25seVxuICAgICAgICovXG4gICAgICB0aGlzLm1lc3NhZ2UgPSBvYmoubWVzc2FnZTtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIHN0YWNrIHRyYWNlIG9mIHRoZSBleGNlcHRpb24uIChqYXZhKVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgKi9cbiAgICAgIHRoaXMuc3RhY2sgPSBvYmouc3RhY2s7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iai5SVF9FUlJPUikpIHtcbiAgICAgIGNvbnN0IHJ0RXJyb3IgPSBvYmouUlRfRVJST1JbMF07XG4gICAgICAvKipcbiAgICAgICAqIFRoZSBtZXNzYWdlIG9mIHRoZSBleGNlcHRpb25cbiAgICAgICAqIEBwdWJsaWNcbiAgICAgICAqIEByZWFkb25seVxuICAgICAgICovXG4gICAgICB0aGlzLm1lc3NhZ2UgPSBydEVycm9yWydAX0VSUk9SX01FU1NBR0UnXVswXTtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIHN0YWNrIHRyYWNlIG9mIHRoZSBleGNlcHRpb24uIChqYXZhKVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgKi9cbiAgICAgIHRoaXMuc3RhY2sgPSBydEVycm9yLlNUQUNLX1RSQUNFID8gcnRFcnJvci5TVEFDS19UUkFDRVswXSA6IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbWVzc2FnZSBvZiB0aGUgZXhjZXB0aW9uXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAqL1xuICAgICAgdGhpcy5tZXNzYWdlID0gb2JqLlJUX0VSUk9SWydAX0VSUk9SX01FU1NBR0UnXTtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIHN0YWNrIHRyYWNlIG9mIHRoZSBleGNlcHRpb24uIChqYXZhKVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgKi9cbiAgICAgIHRoaXMuc3RhY2sgPSBvYmouUlRfRVJST1IuU1RBQ0tfVFJBQ0U7XG4gICAgfVxuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtFQUNlLE1BQU1BLGdCQUFnQixDQUFDO0lBSzdCQyxXQUFXLENBQUNDLEdBQTJGLEVBQUU7TUFDOUcsSUFBSSxTQUFTLElBQUlBLEdBQUcsRUFBRTtRQUNwQjtBQUNOO0FBQ0E7QUFDQTtBQUNBO1FBQ00sSUFBSSxDQUFDQyxPQUFPLEdBQUdELEdBQUcsQ0FBQ0MsT0FBTztRQUMxQjtBQUNOO0FBQ0E7QUFDQTtBQUNBO1FBQ00sSUFBSSxDQUFDQyxLQUFLLEdBQUdGLEdBQUcsQ0FBQ0UsS0FBSztNQUN4QixDQUFDLE1BQU0sSUFBSUMsS0FBSyxDQUFDQyxPQUFPLENBQUNKLEdBQUcsQ0FBQ0ssUUFBUSxDQUFDLEVBQUU7UUFDdEMsTUFBTUMsT0FBTyxHQUFHTixHQUFHLENBQUNLLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDL0I7QUFDTjtBQUNBO0FBQ0E7QUFDQTtRQUNNLElBQUksQ0FBQ0osT0FBTyxHQUFHSyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUM7QUFDTjtBQUNBO0FBQ0E7QUFDQTtRQUNNLElBQUksQ0FBQ0osS0FBSyxHQUFHSSxPQUFPLENBQUNDLFdBQVcsR0FBR0QsT0FBTyxDQUFDQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUdDLFNBQVM7TUFDdkUsQ0FBQyxNQUFNO1FBQ0w7QUFDTjtBQUNBO0FBQ0E7QUFDQTtRQUNNLElBQUksQ0FBQ1AsT0FBTyxHQUFHRCxHQUFHLENBQUNLLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztRQUM5QztBQUNOO0FBQ0E7QUFDQTtBQUNBO1FBQ00sSUFBSSxDQUFDSCxLQUFLLEdBQUdGLEdBQUcsQ0FBQ0ssUUFBUSxDQUFDRSxXQUFXO01BQ3ZDO0lBQ0Y7RUFDRjtFQUFDO0FBQUEifQ==