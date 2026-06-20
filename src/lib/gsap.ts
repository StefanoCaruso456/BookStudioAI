"use client";
// Central GSAP entry point. Registers ScrollTrigger once on the client so
// marketing scenes can import a ready-to-use gsap + useGSAP from one place.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
