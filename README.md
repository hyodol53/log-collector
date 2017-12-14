# log-collector

This library can get revisions that specific range of local source file from git or svn.

# installation
```
npm install log-collector
```

# usage

```javascript
var Log = require("log-collector");
var gitorsvn = new Log.LogCollector({ username:"name", password:"pw", kind: "git or svn"});

gitorsvn.getLogWithRange("localpath", { startLine: 51, endLine: 57 }, 100, function (err, revs) {
    var diffStr = revs[0].diff;
    var message = revs[0].message;
    var author = revs[0].author;
    var revisionNumber = revs[0].name;
    var date = revs[0].date;
});

gitorsvn.getNextLogWithRange(50, , function(err, rev) {
    
});


var res1 = Log.getSCMKind("git localfilePath"); // return "git"
var res2 = Log.getSCMKind("svn localfilePath"); // return "svn"

var res = Log.checkSvnAccount("url", "name", "password") // return true if svn account is valid


```

api  | description
------------- | -------------
.getLogWithRange(localPath, {startLine, endLine}, number, callback )  | From the last revision to the log of given length, get revision list collected when changed at given line of localPath
.getNextLogWithRange(localPath, {startLine, endLine}, callback )  | Get revision list collected when changed at given line of localPath. The path and range are the last parameter values the function executed. The starting point of the revision to collect is the revision plus the length of the last function executed in the current revision.
getSCMKind(localPath)  | Returns which scm the local file is linked to.
checkSvnAccount  | Return true if svn account is valid