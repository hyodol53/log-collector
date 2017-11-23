import ClientInfo from "../client";
import path = require("path");
import * as Util from "../util/util";

export default abstract class SCM {
    constructor(protected _client: ClientInfo ) {

    }

    public abstract getLog(localPath: string, length: number,
                           callback: (err: string|null, revisions: string[]) => void): void;

    public abstract getDiff(localPath: string, revision: string,
                            callback: (err: string|null, diffStr: string) => void): void;

    public abstract getLocalFileDiff(localPath: string,
                                     callback: (err: string|null, diffStr: string) => void): void;

    protected getRepositoryMainPath(localPath: string) {
        let dirName: string;
        if ( this._client.kind === "git" ) {
            dirName = ".git";
        } else if ( this._client.kind === "svn") {
            dirName = ".svn";
        } else {
            return "";
        }
        let dirPath: string = path.dirname(localPath);
        if ( Util.existDirectory(dirPath) === true ) {
            let gitPath = path.join(dirPath, dirName);
            while ( Util.existDirectory(gitPath) === false ) {
                dirPath = path.resolve(dirPath, ".." + path.sep);
                if ( Util.existDirectory(dirPath) === false ) {
                    return "";
                }
                gitPath = path.join(dirPath, dirName);
            }
            return gitPath;
        } else {
            return "";
        }
    }
}
