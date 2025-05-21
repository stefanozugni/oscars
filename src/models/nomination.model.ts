// export interface Nomination {
//     category: string;
//     year: string;
//     nominees: string[];
//     movies: {
//         title: string;
//         tmdb_id: number;
//         imdb_id: string;
//     }[];
//     won: boolean;
// }

// src/models/nomination.model.ts
export interface Nomination {
    Ceremony: number;
    Year: string;
    Class: string;
    CanonicalCategory: string;
    Category: string;
    Film: string;
    FilmId: string;
    Name: string;
    Nominees: string;
    NomineeIds: string;
    Winner: string;
    Detail: string;
    Note: string;
    Citation: string;
}
