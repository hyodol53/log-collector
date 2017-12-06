import ClientInfo from "../client";
import path = require("path");
import * as Util from "../util/util";
import RevisionInfo from "../RevisionInfo";

export default abstract class SCM {
    public static getSCMKind(localPath: string) {
        const git: string = ".git";
        const svn: string = ".svn";
        let dirPath: string = path.dirname(localPath);
        if ( Util.existDirectory(dirPath) === true ) {
            let gitPath = path.join(dirPath, git);
            let svnPath = path.join(dirPath, svn);

            let existGit: boolean = Util.existDirectory(gitPath);
            let existSvn: boolean = Util.existDirectory(svnPath);
            while ( !existGit && !existSvn ) {
                dirPath = path.resolve(dirPath, ".." + path.sep);
                if ( Util.existDirectory(dirPath) === false ) {
                    return "";
                }
                gitPath = path.join(dirPath, git);
                svnPath = path.join(dirPath, svn);
                existGit = Util.existDirectory(gitPath);
                existSvn = Util.existDirectory(svnPath);
            }
            if ( existGit ) {
                return "git";
            } else {
                return "svn";
            }
        } else {
            return "";
        }
    }

    constructor(protected _client: ClientInfo ) {

    }

    public abstract getLog(localPath: string, length: number,
                           callback: (err: string|null, revisions: string[]) => void): void;

    public abstract getFirstLog(localPath: string,
                                callback: (err: string|null, rev: string) => void): void;

    public abstract getDiff(localPath: string, revision: string,
                            callback: (err: string|null, diffStr: string) => void): void;

    public abstract getLocalFileDiff(localPath: string,
                                     callback: (err: string|null, diffStr: string) => void): void;

    public abstract getRevisionInfo(localPath: string, revName: string,
                                    callback: (err: string|null, revisionInfo: RevisionInfo|null) => void ): void;

    protected getMainPath(localPath: string) {
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
            let scmPath = path.join(dirPath, dirName);
            while ( Util.existDirectory(scmPath) === false ) {
                dirPath = path.resolve(dirPath, ".." + path.sep);
                if ( Util.existDirectory(dirPath) === false ) {
                    return "";
                }
                scmPath = path.join(dirPath, dirName);
            }
            return scmPath;
        } else {
            return "";
        }
    }
}
