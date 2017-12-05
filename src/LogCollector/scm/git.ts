import SCM from "./SCM";
import ClientInfo from "../client";
import SimpleGit = require("simple-git");
import path = require("path");

export default class GIT extends SCM {
    constructor(_client: ClientInfo ) {
        super(_client);
    }

    public getLog(localPath: string, length: number,
                  callback: (errMsg: string|null, revisions: string[]) => void) {
        const mainPath: string = this.getMainPath(localPath);
        if ( mainPath === "" ) {
            callback("Could not get git base dif", []);
        }
        const git = new SimpleGit(path.resolve(mainPath, ".."));
        git.log(["-" + length.toString(), localPath], (err: any, result: any) => {
            if ( err === null && result.all.length > 0 ) {
                const revs: string[] = [];
                for ( const re of result.all ) {
                    revs.push(re.hash);
                }
                callback(null, revs);
            } else {
                if ( err !== null ) {
                    callback(err, []);
                } else {
                    callback("empty log", []);
                }
            }
        });
    }
    public getDiff(localPath: string, revision: string,
                   callback: (errMsg: string|null, diffStr: string) => void) {
        const mainPath: string = this.getMainPath(localPath);
        if ( mainPath === "" ) {
            callback("Could not get git base dif", "");
        }
        const git = new SimpleGit(path.resolve(mainPath, ".."));
        const options: string[] = [];
        options.push(revision);
        options.push(revision + "^");
        options.push(localPath);
        git.diff(options, (err: any, diff: any) => {
            if ( err === null ) {
                callback(err, diff);
            } else {
                callback(err, "");
            }
        });

    }
    public getLocalFileDiff(localPath: string,
                            callback: (err: string|null, diffStr: string) => void) {
        const mainPath: string = this.getMainPath(localPath);
        if ( mainPath === "" ) {
            callback("Could not get git base dif", "");
        }
        const localOptions: string[] = [];
        localOptions.push("-R");
        localOptions.push("HEAD");
        localOptions.push(localPath);
        const git = new SimpleGit(path.resolve(mainPath, ".."));
        git.diff(localOptions, (err: any, diff: string) => {
            if ( err === null ) {
                callback(err, diff);
            } else {
                callback(err, "");
            }
        });
    }
}
