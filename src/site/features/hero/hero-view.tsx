"use client";

import { useRouter } from "next/navigation";

import { Hero } from "./hero";

/** Routes the hero's calls to action into the demo and story sections. */
export function HeroView() {
  const router = useRouter();
  return (
    <Hero
      onOpenDemo={() => router.push("/demo")}
      onStory={() => router.push("/story")}
    />
  );
}
