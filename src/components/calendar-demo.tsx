"use client";

import * as React from "react";

import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [datePickerValue, setDatePickerValue] = React.useState<string>("");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Component</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow-sm"
            captionLayout="dropdown"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DatePicker Component</CardTitle>
        </CardHeader>
        <CardContent>
          <DatePicker
            value={datePickerValue}
            onChange={setDatePickerValue}
            placeholder="Select a date"
          />
          {datePickerValue && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected date: {datePickerValue}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
