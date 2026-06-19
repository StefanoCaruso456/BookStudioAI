"use client";
import { BookCover } from "./BookCover";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { SAMPLE_BOOKS } from "@/lib/sampleBooks";

export function BookGallery() {
  return (
    <section className="border-y border-line bg-white/60">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Made with Book Studio AI
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Books worth holding
          </h2>
          <p className="mt-4 text-lg text-subtle">
            A glimpse of what creators across every genre can publish.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.06}
          className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6"
        >
          {SAMPLE_BOOKS.map((book) => (
            <RevealItem key={book.bookType}>
              <figure className="group">
                <div className="transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:shadow-book">
                  <BookCover
                    title={book.title}
                    eyebrow={book.eyebrow}
                    author={book.author}
                    color={book.color}
                  />
                </div>
                <figcaption className="mt-3">
                  <p className="truncate text-sm font-semibold tracking-tight">
                    {book.title}
                  </p>
                  <p className="text-xs text-subtle">
                    {book.pages} pages · {book.genreLabel}
                  </p>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
