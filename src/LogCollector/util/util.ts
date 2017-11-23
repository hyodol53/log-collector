import fs = require("fs");
import path = require("path");
import diff = require("unidiff");

namespace Util {
    export function existDirectory(dirPath: string) {
        try {
            return fs.statSync(path.resolve(dirPath)).isDirectory();
        } catch (e) {
            return false;
        }
    }

    export function getDiff(path1: string, path2: string, callback: (err: string|null, result: string) => void )  {
        let result: string = "";
        fs.readFile(path1, "utf-8", (err: any, data: string ) => {
            if ( err === null ) {
                fs.readFile(path2, "utf-8", (err2: any, data2: string ) => {
                    if ( err2 === null ) {
                        const diffs = diff.diffLines(data, data2, []);
                        result = diff.formatLines(diffs, null);
                    }
                    callback(err2, result);
                });
            } else {
                callback(err, result);
            }
        });
    }
}

export = Util;
