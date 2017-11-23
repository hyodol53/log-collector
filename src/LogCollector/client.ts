export enum RepositoryKind {
    git,
    svn,
}

export default class ClientInfo {
    public kind: string;
    public username?: string;
    public password?: string;
}
