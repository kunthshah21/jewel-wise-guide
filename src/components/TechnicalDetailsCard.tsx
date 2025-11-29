import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TechnicalDetailsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Model Information</CardTitle>
        <CardDescription className="text-xs">
          Technical details about the prediction model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">R² Score</p>
            <p className="text-xl font-bold text-primary">99.62%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Training Data</p>
            <p className="text-xl font-bold">4,744</p>
            <p className="text-[10px] text-muted-foreground">sales records</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Categories</p>
            <p className="text-xl font-bold">7</p>
            <p className="text-[10px] text-muted-foreground">product types</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Base Models</p>
            <p className="text-xl font-bold">5</p>
            <p className="text-[10px] text-muted-foreground">ensemble members</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
