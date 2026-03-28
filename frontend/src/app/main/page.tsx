import Link from "next/link";
import {
  Upload, BarChart2, Wrench, FlaskConical,
  ArrowRight, BookOpen, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const workflowSteps = [
  {
    step: 1,
    icon: Upload,
    label: "Import Data",
    description: "Load your dataset from CSV, JSON, or Parquet. Preview schema and column types instantly.",
  },
  {
    step: 2,
    icon: BarChart2,
    label: "Explore",
    description: "Visualize distributions, correlations, and detect outliers with interactive charts.",
  },
  {
    step: 3,
    icon: Wrench,
    label: "Feature Engineering",
    description: "Transform, encode, and scale features to prepare your data for training.",
  },
  {
    step: 4,
    icon: FlaskConical,
    label: "Train & Compare",
    description: "Run multiple models and benchmark them side-by-side across key metrics.",
  },
];

const docHighlights = [
  { title: "Exploratory Data Analysis", slug: "eda" },
  { title: "Feature Engineering", slug: "feature-engineering" },
  { title: "Model Selection", slug: "model-selection" },
  { title: "Evaluation Metrics", slug: "accuracy" },
];

export default function Main() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-12">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-3">
            <Badge variant="outline" className="text-xs tracking-widest uppercase">
              Dashboard
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Synapse-Gz</h1>
            <p className="text-muted-foreground text-base max-w-xl">
              Your end-to-end ML workspace. Follow the workflow below or jump straight into the toolbox.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button asChild size="lg" className="gap-2">
              <Link href="/main/toolbox">
                Open Toolbox
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/main/docs">View Docs</Link>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Pipeline stepper */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">ML Workflow</h2>
            <p className="text-sm text-muted-foreground">
              Four steps from raw data to trained model.
            </p>
          </div>

          <div className="flex items-start">
            {workflowSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="flex items-start flex-1">
                  <div className="flex flex-col items-center w-full">
                    {/* Icon node + connecting lines */}
                    <div className="flex items-center w-full">
                      <div className={`h-px flex-1 ${i === 0 ? "bg-transparent" : "bg-border"}`} />
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted ring-1 ring-border shrink-0">
                        <Icon className="w-4 h-4 text-foreground" />
                      </div>
                      <div className={`h-px flex-1 ${i === workflowSteps.length - 1 ? "bg-transparent" : "bg-border"}`} />
                    </div>
                    {/* Label */}
                    <div className="mt-3 text-center px-3 space-y-1">
                      <p className="text-xs font-semibold">Step {s.step}</p>
                      <p className="text-xs font-medium">{s.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.step}
                className="hover:ring-foreground/20 transition-all duration-200 cursor-default"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-muted w-fit">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Step {s.step}
                    </span>
                  </div>
                  <CardTitle className="mt-3">{s.label}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {s.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" variant="outline" className="w-full gap-1">
                    <Link href="/main/toolbox">
                      Open <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator />

        {/* Docs highlights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Documentation</h2>
              <p className="text-sm text-muted-foreground">
                Learn the ML concepts behind each step.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Link href="/main/docs">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {docHighlights.map((doc) => (
              <Link
                key={doc.slug}
                href={`/main/docs/${doc.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/40 hover:border-border transition-colors duration-200"
              >
                <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium leading-snug">{doc.title}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
