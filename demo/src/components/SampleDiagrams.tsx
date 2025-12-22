import type { ISampleDiagramsProps } from "../interfaces/props";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export function SampleDiagrams({
  samples,
  onSelect,
  title,
}: ISampleDiagramsProps) {
  return (
    <Card className="mb-4 border-input">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-4">
          {samples.map((sample) => (
            <Card
              key={sample.id}
              className="border border-input w-[49%] flex flex-col"
            >
              <CardContent className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-2">{sample.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {sample.description}
                </p>
                <Button
                  onClick={() => onSelect(sample.xml)}
                  variant="outline"
                  className="w-full mt-auto"
                >
                  Load Sample
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
