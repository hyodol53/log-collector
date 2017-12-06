declare namespace Log {
    class LogCollector {
        constructor(_client: ClientInfo);
        public getLogWithRange(localPath: string, range: SimpleRange, length: number , callback: (err: string|null, revisions: RevisionInfo[]) => void ): void;
        public getNextLogWithRange(length: number, callback: (err: string|null, revisions: RevisionInfo[]) => void ): void;
        public getLog(localPath: string, length: number, callback: (err: string|null, revisions: string[]) => void): void;
        public getDiff(localPath: string, revision: string, callback: (err: string|null, diffStr: string) => void): void;
        public getRevisionInfo(localPath: string, revision: string, callback: (err: string|null, revInfo: RevisionInfo) => void): void;
    }
    
    class SimpleRange {
        public startLine: number;
        public endLine: number;
    }
    
    class ClientInfo {
        public kind: string;
        public username?: string;
        public password?: string;
    }

    class RevisionInfo {
        public name: string;
        public author: string;
        public message: string;
        public date: string;
        public diff: string;
    }
}

declare module 'log-collector' {
    const logCollector: typeof Log.LogCollector;
    export = logCollector;   
}
