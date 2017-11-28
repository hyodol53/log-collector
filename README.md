# log-collector

This library can get revisions that specific range of local source file.

# installation
```
npm install log-collector
```

# usage

javascript
```javascript
var logCollector = require("log-collector");
var git = new logCollector({ username:"name", password:"pw", kind: "git"});
var sourcePath = "localpath";

git.getLogWithRange(sourcePath, { startLine: 51, endLine: 57 }, 100, function (err, revs) {
    if (err !== null) {
        console.log(err);
    }
    else {
        console.log(revs);
    }
});
```

typescript
```typescript
import LogCollector = require("log-collector");

const collector = new LogCollector({username: "id", password: "pw", kind: "git or svn"});

collector.getLogWithRange("local path", {startLine: 51, endLine: 57}, 100, (err: string|null, revs: string[]) => {
    if ( err !== null ) {
        // error
    } else {
        // get list of revesion number(svn) or SHA-1(git)
    }
});
```

