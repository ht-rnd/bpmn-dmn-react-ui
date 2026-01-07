import { Link } from "@tanstack/react-router";
import { Zap, SwatchBook, Moon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

const features = [
  {
    icon: <Zap />,
    title: "Fast Integration",
    description: "Simple React components that work right out of the box.",
  },
  {
    icon: <SwatchBook />,
    title: "Full Customization",
    description:
      "Tailwind CSS theming, toolbar configuration, and flexible layouts.",
  },
  {
    icon: <Moon />,
    title: "Dark Mode Ready",
    description:
      "Built-in dark theme support that matches your application design.",
  },
];

export function HomePage() {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center gap-12">
      <h1 className="text-6xl font-bold text-primary text-center">
        BPMN & DMN UI
      </h1>

      <div className="flex gap-4 max-w-6xl">
        {features.map((feature) => (
          <Card key={feature.title} className="max-w-[368px] border-input">
            <CardHeader>
              <CardTitle className="flex items-center gap-4 text-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" asChild>
        <Link to="/bpmn">Get Started</Link>
      </Button>
    </div>
  );
}
