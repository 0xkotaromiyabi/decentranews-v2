export interface News {
    id: string;
    title: string;
    content: string;
    author: string;
    timestamp: Date;
}

export interface Proposal {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'closed';
}
