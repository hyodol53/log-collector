export default class RevisionInfo {

    constructor(public name: string,
                public author: string,
                public message: string,
                public date: string,
                public diff: string) { }
}
