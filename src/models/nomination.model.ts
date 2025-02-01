export interface Nomination {
    category: string;
    year: string;
    nominees: string[];
    movies: {
        title: string;
        tmdb_id: number;
        imdb_id: string;
    }[];
    won: boolean;
}