import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Synapse
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore data. Upload data, explore, engineer features, train models, compare results.
          </p>
        </div>


        <Button asChild size="lg">
          <a href="/main">Enter</a>
        </Button>

      </div>
    </main>
  );
}