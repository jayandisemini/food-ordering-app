import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import deliveryImg from "@/assets/onboard-delivery.jpg";
import bannerImg from "@/assets/banner-feast.jpg";
import bowlImg from "@/assets/food-bowl.jpg";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome to QuickBite" }] }),
  component: Onboarding,
});

const slides = [
  {
    title: "A world of flavor,\nat your door.",
    body: "From wood-fired pizza to fragrant kottu — discover dishes from your city's best kitchens.",
    img: bannerImg,
    accent: "Discover",
  },
  {
    title: "Lightning-fast\ndelivery, every time.",
    body: "Track your courier in real time. Hot food, friendly riders, on-time guarantee.",
    img: deliveryImg,
    accent: "Deliver",
  },
  {
    title: "Personalized\njust for you.",
    body: "Smart picks based on what you love. Save favorites, unlock offers, repeat the magic.",
    img: bowlImg,
    accent: "Delight",
  },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const slide = slides[i];
  const next = () => (i < slides.length - 1 ? setI(i + 1) : navigate({ to: "/auth" }));

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background">
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="font-display text-xl font-black">
          Quick<span className="text-primary">Bite</span>
        </span>
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="press text-sm font-medium text-muted-foreground"
        >
          Skip
        </button>
      </div>

      <div key={i} className="relative mt-4 flex flex-1 flex-col animate-fade-up">
        <div className="relative mx-6 aspect-square overflow-hidden rounded-[2.5rem] shadow-card">
          <img src={slide.img} alt={slide.accent} className="h-full w-full object-cover animate-scale-in" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-foreground/40 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur">
            {slide.accent}
          </span>
        </div>

        <div className="px-7 pt-8">
          <h2 className="whitespace-pre-line font-display text-3xl font-black leading-[1.1]">
            {slide.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{slide.body}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-6 pb-8 pt-4">
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === i ? "w-8 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="press group flex items-center gap-3 rounded-full bg-foreground py-4 pl-6 pr-2 text-background shadow-card"
        >
          <span className="text-sm font-semibold">{i === slides.length - 1 ? "Let's eat" : "Next"}</span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-1">
            <ArrowRight className="h-5 w-5" />
          </span>
        </button>
      </div>
    </div>
  );
}
