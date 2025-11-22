import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Austin's notes",
    openGraph: {
      images: [`/notes/api/og/?title=${encodeURIComponent("notes")}&emoji=${encodeURIComponent("✏️")}`],
    },
  };
}

export default async function Home() {}