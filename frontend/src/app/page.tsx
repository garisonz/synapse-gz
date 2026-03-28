import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, BarChart2, Wrench, FlaskConical, ArrowRight } from "lucide-react";
import HeroAnimation from "@/components/landing/HeroAnimation";

const features = [
  {
    icon: Upload,
    label: "Import Data",
    description: "Load CSV, JSON, or Parquet files with instant preview and schema inference.",
  },
  {
    icon: BarChart2,
    label: "Explore",
    description: "Visualize distributions, correlations, and outliers with interactive charts.",
  },
  {
    icon: Wrench,
    label: "Feature Engineering",
    description: "Transform, encode, and scale features with a visual pipeline builder.",
  },
  {
    icon: FlaskConical,
    label: "Train & Compare",
    description: "Run multiple models side-by-side and benchmark performance metrics.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Subtle top gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center min-h-screen px-8 py-16">
        <div className="max-w-5xl w-full space-y-14">

          {/* Hero: text left, animation right */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left: headline + CTAs */}
            <div className="flex-1 space-y-7 text-left">
              <Badge variant="outline" className="text-xs font-medium tracking-widest uppercase px-3 py-1">
                Open Source ML Platform
              </Badge>
              <h1 className="text-6xl font-bold tracking-tight leading-tight">
                Synapse-Gz
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                The end-to-end machine learning workspace. Import data, explore
                patterns, engineer features, and compare models — all in one place.
              </p>
              <div className="flex items-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <a href="/main">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#features">See Features</a>
                </Button>
              </div>
            </div>

            {/* Right: animation with glow halo */}
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <HeroAnimation />
            </div>
          </div>

          {/* Feature cards */}
          <div id="features" className="space-y-6">
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map(({ icon: Icon, label, description }) => (
                <div
                  key={label}
                  className="flex flex-col items-start gap-3 p-4 rounded-xl bg-card border border-border/60 text-left hover:border-border hover:bg-muted/40 transition-colors duration-200"
                >
                  <div className="p-2.5 rounded-lg bg-muted">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
