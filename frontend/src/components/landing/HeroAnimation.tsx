"use client";
import Lottie from "lottie-react";
import heroAnimation from "../../../public/hero_animation.json";

export default function HeroAnimation() {
  return (
    <Lottie
      animationData={heroAnimation}
      loop
      className="w-56 h-56 mx-auto"
    />
  );
}
