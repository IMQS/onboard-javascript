import * as http from 'http';
var httpReq = /** @class */ (function () {
    function httpReq(url, path, method) {
        this.url = url;
        this.path = path;
        this.method = method;
    }
    httpReq.prototype.get = function (cb) {
        var opts = {
            'host': 'google.com',
            'path': "/"
        };
        http.request(opts, function (r) {
            var data = '';
            r.on('data', function (chunk) {
                console.log('Got chunk: ' + chunk);
                data += chunk;
            });
            r.on('end', function () {
                console.log('Response has ended');
                console.log(data);
                cb(data);
            });
            r.on('error', function (err) {
                console.log('Following error occured during request:\n');
                console.log(err);
            });
        }).end();
    };
    return httpReq;
}());
export { httpReq };
//# sourceMappingURL=http.js.map