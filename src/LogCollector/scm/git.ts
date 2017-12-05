import SCM from "./SCM";
import ClientInfo from "../client";
import SimpleGit = require("simple-git");
import path = require("path");
import RevisionInfo from "../RevisionInfo";

export default class GIT extends SCM {
    constructor(_client: ClientInfo ) {
        super(_client);
    }

    public getLog(localPath: string, length: number,
                  callback: (errMsg: string|null, revisions: string[]) => void) {
        const baseDir: string = this.getMainPath(localPath);
        if ( baseDir === "" ) {
            callback("Could not get git base dir", []);
        }
        const git = new SimpleGit(path.resolve(baseDir, ".."));
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

    public getRevisionInfo(localPath: string, revName: string,
                           callback: (err: string|null, revisionInfo: RevisionInfo|null) => void ) {
        const baseDir: string = this.getMainPath(localPath);
        if ( baseDir === "" ) {
            callback("Could not get git base dir", null);
        }

        const git = new SimpleGit(path.resolve(baseDir, ".."));
        git.show([revName], (err: any, info: any ) => {
            const revInfo = this.parseRevInfo(info, revName);
            this.getDiff(localPath, revName, (errMsg: any, diffStr: string) => {
                if ( errMsg !== null ) {
                    callback(errMsg, null);
                } else {
                    revInfo.diff = diffStr;
                    callback(null, revInfo);
                }
            });
        });
    }

    public getDiff(localPath: string, revision: string,
                   callback: (errMsg: string|null, diffStr: string) => void) {
        const baseDir: string = this.getMainPath(localPath);
        if ( baseDir === "" ) {
            callback("Could not get git base dir", "");
        }
        const git = new SimpleGit(path.resolve(baseDir, ".."));
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
        const baseDir: string = this.getMainPath(localPath);
        if ( baseDir === "" ) {
            callback("Could not get git base dir", "");
        }
        const localOptions: string[] = [];
        localOptions.push("-R");
        localOptions.push("HEAD");
        localOptions.push(localPath);
        const git = new SimpleGit(path.resolve(baseDir, ".."));
        git.diff(localOptions, (err: any, diff: string) => {
            if ( err === null ) {
                callback(err, diff);
            } else {
                callback(err, "");
            }
        });
    }

    private parseRevInfo(revInfo: string, revName: string): RevisionInfo {
        let str: string = revInfo.substr(revInfo.indexOf("Author: ") + "Author: ".length);
        const author: string = str.substr(0, str.indexOf("\n"));
        str = str.substr(str.indexOf("Date:   ") + "Date:   ".length);
        const date: string = str.substr(0, str.indexOf("\n"));
        str = str.substr(date.length);
        let message: string = str.substr(0, str.indexOf("diff --git"));
        message = message.trim();
        return new RevisionInfo(revName, author, message, date, "");
    }
}
