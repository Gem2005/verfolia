"use client";

import * as React from "react";
import { CalendarDemo } from "@/components/calendar-demo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Calendar Components Demo</h1>
        <p className="text-lg text-muted-foreground">
          Demonstration of the Calendar and DatePicker components
        </p>
      </div>

      <CalendarDemo />

      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Calendar Component</h3>
            <p className="text-sm text-muted-foreground mb-2">
              A full calendar component for date selection with dropdown navigation:
            </p>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border shadow-sm"
  captionLayout="dropdown"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">DatePicker Component</h3>
            <p className="text-sm text-muted-foreground mb-2">
              A compact date picker with popover calendar for forms:
            </p>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`<DatePicker
  value={dateValue}
  onChange={setDateValue}
  placeholder="Select a date"
  error={hasError}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Dropdown month/year navigation</li>
              <li>Date range support (1950 - current year + 10)</li>
              <li>Error state styling</li>
              <li>Keyboard navigation</li>
              <li>Responsive design</li>
              <li>Consistent date formatting (YYYY-MM-DD)</li>
              <li>Proper accessibility support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
