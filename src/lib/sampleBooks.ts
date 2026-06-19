// Mock published-book examples used across the marketing homepage.
// Not real titles — crafted to feel premium and believable.
import type { BookType } from "@/types/book";

export interface SampleBook {
  bookType: BookType;
  genreLabel: string;
  title: string;
  author: string;
  pages: number;
  /** cover background color (muted, editorial) */
  color: string;
  /** eyebrow line on the cover */
  eyebrow: string;
}

export const SAMPLE_BOOKS: SampleBook[] = [
  {
    bookType: "cookbook",
    genreLabel: "Cookbook",
    title: "Nonna's Italian Kitchen",
    author: "Maria Conti",
    pages: 127,
    color: "#B97845",
    eyebrow: "Recipes & Family Stories",
  },
  {
    bookType: "travel_guide",
    genreLabel: "Travel Guide",
    title: "Japan Beyond Tokyo",
    author: "Daniel Reeves",
    pages: 182,
    color: "#223A4A",
    eyebrow: "The Insider's Route",
  },
  {
    bookType: "coaching_self_help",
    genreLabel: "Coaching",
    title: "The Transformation Framework",
    author: "Alicia Monroe",
    pages: 148,
    color: "#3E5C50",
    eyebrow: "A Proven Method",
  },
  {
    bookType: "fitness_diet",
    genreLabel: "Fitness",
    title: "Strong At Any Age",
    author: "Marcus Hale",
    pages: 165,
    color: "#2B2B2B",
    eyebrow: "An 8-Week Program",
  },
  {
    bookType: "memoir_biography",
    genreLabel: "Memoir",
    title: "The Long Road Home",
    author: "Eleanor Hayes",
    pages: 203,
    color: "#6E4B57",
    eyebrow: "A Memoir",
  },
  {
    bookType: "business_expert",
    genreLabel: "Business",
    title: "Scaling With Clarity",
    author: "Jonathan Pike",
    pages: 174,
    color: "#2F4A5A",
    eyebrow: "Build What Lasts",
  },
];

export function sampleByType(type: BookType): SampleBook {
  return SAMPLE_BOOKS.find((b) => b.bookType === type) ?? SAMPLE_BOOKS[0];
}
