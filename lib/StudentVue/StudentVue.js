(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./Client/Client", "../utils/soap/soap", "./RequestException/RequestException"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./Client/Client"), require("../utils/soap/soap"), require("./RequestException/RequestException"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.Client, global.soap, global.RequestException);
    global.StudentVue = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _Client, _soap, _RequestException) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findDistricts = findDistricts;
  _exports.login = login;
  _Client = _interopRequireDefault(_Client);
  _soap = _interopRequireDefault(_soap);
  _RequestException = _interopRequireDefault(_RequestException);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /** @module StudentVue */

  /**
   * Login to the StudentVUE API
   * @param {string} districtUrl The URL of the district which can be found using `findDistricts()` method
   * @param {UserCredentials} credentials User credentials of the student
   * @returns {Promise<Client>} Returns the client and the information of the student upon successful login
   */
  function login(districtUrl, credentials) {
    return new Promise((res, rej) => {
      if (districtUrl.length === 0) {
        return rej(new _RequestException.default({
          message: 'District URL cannot be an empty string'
        }));
      }
      const host = new URL(districtUrl).host;
      const endpoint = `https://${host}/service/PXP2Communication.asmx`;
      const client = new _Client.default({
        username: credentials.username,
        password: credentials.password,
        districtUrl: endpoint,
        isParent: credentials.isParent
      }, `https://${host}/`);
      client.validateCredentials().then(() => {
        res(client);
      }).catch(rej);
    });
  }

  /**
   * Find school districts using a zipcode
   * @param {string} zipCode The zipcode to get a list of schools from
   * @returns {Promise<SchoolDistrict[]>} Returns a list of school districts which can be used to login to the API
   */
  function findDistricts(zipCode) {
    return new Promise((res, reject) => {
      _soap.default.Client.processAnonymousRequest('https://support.edupoint.com/Service/HDInfoCommunication.asmx', {
        paramStr: {
          Key: '5E4B7859-B805-474B-A833-FDB15D205D40',
          MatchToDistrictZipCode: zipCode
        }
      }).then(xmlObject => {
        if (!xmlObject || !xmlObject.DistrictLists.DistrictInfos.DistrictInfo) {
          return res([]);
        }
        var _a = xmlObject.DistrictLists.DistrictInfos.DistrictInfo;
        var _f = district => {
          return {
            parentVueUrl: district['@_PvueURL'],
            address: district['@_Address'],
            id: district['@_DistrictID'],
            name: district['@_Name']
          };
        };
        var _r = [];
        for (var _i = 0; _i < _a.length; _i++) {
          _r.push(_f(_a[_i], _i, _a));
        }
        res(_r);
      }).catch(reject);
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dpbiIsImRpc3RyaWN0VXJsIiwiY3JlZGVudGlhbHMiLCJQcm9taXNlIiwicmVzIiwicmVqIiwibGVuZ3RoIiwiUmVxdWVzdEV4Y2VwdGlvbiIsIm1lc3NhZ2UiLCJob3N0IiwiVVJMIiwiZW5kcG9pbnQiLCJjbGllbnQiLCJDbGllbnQiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiaXNQYXJlbnQiLCJ2YWxpZGF0ZUNyZWRlbnRpYWxzIiwidGhlbiIsImNhdGNoIiwiZmluZERpc3RyaWN0cyIsInppcENvZGUiLCJyZWplY3QiLCJzb2FwIiwicHJvY2Vzc0Fub255bW91c1JlcXVlc3QiLCJwYXJhbVN0ciIsIktleSIsIk1hdGNoVG9EaXN0cmljdFppcENvZGUiLCJ4bWxPYmplY3QiLCJEaXN0cmljdExpc3RzIiwiRGlzdHJpY3RJbmZvcyIsIkRpc3RyaWN0SW5mbyIsImRpc3RyaWN0IiwicGFyZW50VnVlVXJsIiwiYWRkcmVzcyIsImlkIiwibmFtZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9TdHVkZW50VnVlL1N0dWRlbnRWdWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2Nob29sRGlzdHJpY3QsIFVzZXJDcmVkZW50aWFscyB9IGZyb20gJy4vU3R1ZGVudFZ1ZS5pbnRlcmZhY2VzJztcbmltcG9ydCBDbGllbnQgZnJvbSAnLi9DbGllbnQvQ2xpZW50JztcbmltcG9ydCBzb2FwIGZyb20gJy4uL3V0aWxzL3NvYXAvc29hcCc7XG5pbXBvcnQgeyBEaXN0cmljdExpc3RYTUxPYmplY3QgfSBmcm9tICcuL1N0dWRlbnRWdWUueG1sJztcbmltcG9ydCBSZXF1ZXN0RXhjZXB0aW9uIGZyb20gJy4vUmVxdWVzdEV4Y2VwdGlvbi9SZXF1ZXN0RXhjZXB0aW9uJztcblxuLyoqIEBtb2R1bGUgU3R1ZGVudFZ1ZSAqL1xuXG4vKipcbiAqIExvZ2luIHRvIHRoZSBTdHVkZW50VlVFIEFQSVxuICogQHBhcmFtIHtzdHJpbmd9IGRpc3RyaWN0VXJsIFRoZSBVUkwgb2YgdGhlIGRpc3RyaWN0IHdoaWNoIGNhbiBiZSBmb3VuZCB1c2luZyBgZmluZERpc3RyaWN0cygpYCBtZXRob2RcbiAqIEBwYXJhbSB7VXNlckNyZWRlbnRpYWxzfSBjcmVkZW50aWFscyBVc2VyIGNyZWRlbnRpYWxzIG9mIHRoZSBzdHVkZW50XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDbGllbnQ+fSBSZXR1cm5zIHRoZSBjbGllbnQgYW5kIHRoZSBpbmZvcm1hdGlvbiBvZiB0aGUgc3R1ZGVudCB1cG9uIHN1Y2Nlc3NmdWwgbG9naW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ2luKGRpc3RyaWN0VXJsOiBzdHJpbmcsIGNyZWRlbnRpYWxzOiBVc2VyQ3JlZGVudGlhbHMpOiBQcm9taXNlPENsaWVudD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgaWYgKGRpc3RyaWN0VXJsLmxlbmd0aCA9PT0gMClcbiAgICAgIHJldHVybiByZWoobmV3IFJlcXVlc3RFeGNlcHRpb24oeyBtZXNzYWdlOiAnRGlzdHJpY3QgVVJMIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnIH0pKTtcbiAgICBjb25zdCBob3N0ID0gbmV3IFVSTChkaXN0cmljdFVybCkuaG9zdDtcbiAgICBjb25zdCBlbmRwb2ludCA9IGBodHRwczovLyR7aG9zdH0vc2VydmljZS9QWFAyQ29tbXVuaWNhdGlvbi5hc214YDtcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KFxuICAgICAge1xuICAgICAgICB1c2VybmFtZTogY3JlZGVudGlhbHMudXNlcm5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgZGlzdHJpY3RVcmw6IGVuZHBvaW50LFxuICAgICAgICBpc1BhcmVudDogY3JlZGVudGlhbHMuaXNQYXJlbnQsXG4gICAgICB9LFxuICAgICAgYGh0dHBzOi8vJHtob3N0fS9gXG4gICAgKTtcbiAgICBjbGllbnRcbiAgICAgIC52YWxpZGF0ZUNyZWRlbnRpYWxzKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgcmVzKGNsaWVudCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKHJlaik7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZpbmQgc2Nob29sIGRpc3RyaWN0cyB1c2luZyBhIHppcGNvZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB6aXBDb2RlIFRoZSB6aXBjb2RlIHRvIGdldCBhIGxpc3Qgb2Ygc2Nob29scyBmcm9tXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxTY2hvb2xEaXN0cmljdFtdPn0gUmV0dXJucyBhIGxpc3Qgb2Ygc2Nob29sIGRpc3RyaWN0cyB3aGljaCBjYW4gYmUgdXNlZCB0byBsb2dpbiB0byB0aGUgQVBJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRGlzdHJpY3RzKHppcENvZGU6IHN0cmluZyk6IFByb21pc2U8U2Nob29sRGlzdHJpY3RbXT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqZWN0KSA9PiB7XG4gICAgc29hcC5DbGllbnQucHJvY2Vzc0Fub255bW91c1JlcXVlc3Q8RGlzdHJpY3RMaXN0WE1MT2JqZWN0IHwgdW5kZWZpbmVkPihcbiAgICAgICdodHRwczovL3N1cHBvcnQuZWR1cG9pbnQuY29tL1NlcnZpY2UvSERJbmZvQ29tbXVuaWNhdGlvbi5hc214JyxcbiAgICAgIHtcbiAgICAgICAgcGFyYW1TdHI6IHtcbiAgICAgICAgICBLZXk6ICc1RTRCNzg1OS1CODA1LTQ3NEItQTgzMy1GREIxNUQyMDVENDAnLFxuICAgICAgICAgIE1hdGNoVG9EaXN0cmljdFppcENvZGU6IHppcENvZGUsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgKVxuICAgICAgLnRoZW4oKHhtbE9iamVjdCkgPT4ge1xuICAgICAgICBpZiAoIXhtbE9iamVjdCB8fCAheG1sT2JqZWN0LkRpc3RyaWN0TGlzdHMuRGlzdHJpY3RJbmZvcy5EaXN0cmljdEluZm8pIHJldHVybiByZXMoW10pO1xuICAgICAgICByZXMoXG4gICAgICAgICAgeG1sT2JqZWN0LkRpc3RyaWN0TGlzdHMuRGlzdHJpY3RJbmZvcy5EaXN0cmljdEluZm8ubWFwKChkaXN0cmljdCkgPT4gKHtcbiAgICAgICAgICAgIHBhcmVudFZ1ZVVybDogZGlzdHJpY3RbJ0BfUHZ1ZVVSTCddLFxuICAgICAgICAgICAgYWRkcmVzczogZGlzdHJpY3RbJ0BfQWRkcmVzcyddLFxuICAgICAgICAgICAgaWQ6IGRpc3RyaWN0WydAX0Rpc3RyaWN0SUQnXSxcbiAgICAgICAgICAgIG5hbWU6IGRpc3RyaWN0WydAX05hbWUnXSxcbiAgICAgICAgICB9KSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgfSk7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQU1BOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNBLEtBQUssQ0FBQ0MsV0FBbUIsRUFBRUMsV0FBNEIsRUFBbUI7SUFDeEYsT0FBTyxJQUFJQyxPQUFPLENBQUMsQ0FBQ0MsR0FBRyxFQUFFQyxHQUFHLEtBQUs7TUFDL0IsSUFBSUosV0FBVyxDQUFDSyxNQUFNLEtBQUssQ0FBQztRQUMxQixPQUFPRCxHQUFHLENBQUMsSUFBSUUseUJBQWdCLENBQUM7VUFBRUMsT0FBTyxFQUFFO1FBQXlDLENBQUMsQ0FBQyxDQUFDO01BQUM7TUFDMUYsTUFBTUMsSUFBSSxHQUFHLElBQUlDLEdBQUcsQ0FBQ1QsV0FBVyxDQUFDLENBQUNRLElBQUk7TUFDdEMsTUFBTUUsUUFBUSxHQUFJLFdBQVVGLElBQUssaUNBQWdDO01BQ2pFLE1BQU1HLE1BQU0sR0FBRyxJQUFJQyxlQUFNLENBQ3ZCO1FBQ0VDLFFBQVEsRUFBRVosV0FBVyxDQUFDWSxRQUFRO1FBQzlCQyxRQUFRLEVBQUViLFdBQVcsQ0FBQ2EsUUFBUTtRQUM5QmQsV0FBVyxFQUFFVSxRQUFRO1FBQ3JCSyxRQUFRLEVBQUVkLFdBQVcsQ0FBQ2M7TUFDeEIsQ0FBQyxFQUNBLFdBQVVQLElBQUssR0FBRSxDQUNuQjtNQUNERyxNQUFNLENBQ0hLLG1CQUFtQixFQUFFLENBQ3JCQyxJQUFJLENBQUMsTUFBTTtRQUNWZCxHQUFHLENBQUNRLE1BQU0sQ0FBQztNQUNiLENBQUMsQ0FBQyxDQUNETyxLQUFLLENBQUNkLEdBQUcsQ0FBQztJQUNmLENBQUMsQ0FBQztFQUNKOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTZSxhQUFhLENBQUNDLE9BQWUsRUFBNkI7SUFDeEUsT0FBTyxJQUFJbEIsT0FBTyxDQUFDLENBQUNDLEdBQUcsRUFBRWtCLE1BQU0sS0FBSztNQUNsQ0MsYUFBSSxDQUFDVixNQUFNLENBQUNXLHVCQUF1QixDQUNqQywrREFBK0QsRUFDL0Q7UUFDRUMsUUFBUSxFQUFFO1VBQ1JDLEdBQUcsRUFBRSxzQ0FBc0M7VUFDM0NDLHNCQUFzQixFQUFFTjtRQUMxQjtNQUNGLENBQUMsQ0FDRixDQUNFSCxJQUFJLENBQUVVLFNBQVMsSUFBSztRQUNuQixJQUFJLENBQUNBLFNBQVMsSUFBSSxDQUFDQSxTQUFTLENBQUNDLGFBQWEsQ0FBQ0MsYUFBYSxDQUFDQyxZQUFZO1VBQUUsT0FBTzNCLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFBQztRQUFBLFNBRXBGd0IsU0FBUyxDQUFDQyxhQUFhLENBQUNDLGFBQWEsQ0FBQ0MsWUFBWTtRQUFBLFNBQU1DLFFBQVE7VUFBQSxPQUFNO1lBQ3BFQyxZQUFZLEVBQUVELFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDbkNFLE9BQU8sRUFBRUYsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUM5QkcsRUFBRSxFQUFFSCxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQzVCSSxJQUFJLEVBQUVKLFFBQVEsQ0FBQyxRQUFRO1VBQ3pCLENBQUM7UUFBQSxDQUFDO1FBQUE7UUFBQTtVQUFBO1FBQUE7UUFOSjVCLEdBQUcsSUFPRjtNQUNILENBQUMsQ0FBQyxDQUNEZSxLQUFLLENBQUNHLE1BQU0sQ0FBQztJQUNsQixDQUFDLENBQUM7RUFDSjtBQUFDIn0=