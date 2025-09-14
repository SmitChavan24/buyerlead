"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { BackButton } from "./BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "./Label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buyerBase } from "@/lib/validators/buyer";

// 🔄 Infer type from zod schema
type BuyerFormValues = z.infer<typeof buyerBase>;

interface BuyerFormProps {
  initialData: BuyerFormValues;
}

export default function BuyerForm({ initialData }: BuyerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerBase),
    defaultValues: {},
  });

  const onSubmit = async (values: BuyerFormValues) => {
    setLoading(true);
    try {
      console.log("data");
      const res = await axios.put(`/api/buyers/${initialData.id}`, values);
      if (res.status !== 200) throw new Error("Failed to update lead");
      alert("Buyer updated!");
      router.push("/buyers");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Error updating lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto ">
      <Card>
        <CardHeader className="flex items-center justify-end">
          <BackButton />
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <Label required>Full Name</Label>
            <Input placeholder="Full Name" {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.fullName.message}
              </p>
            )}

            {/* Email */}
            <Label>Email</Label>
            <Input placeholder="Email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.email.message}
              </p>
            )}

            {/* Phone */}
            <Label required>Phone</Label>
            <Input placeholder="Phone" {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.phone.message}
              </p>
            )}

            {/* City */}
            <Label required>City</Label>
            <Select
              onValueChange={(val) => {
                form.setValue("city", val);
                form.trigger("city");
              }}
              defaultValue={initialData.city || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"].map(
                  (c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.city && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.city.message}
              </p>
            )}

            {/* Property Type */}
            <Label required>Property Type</Label>
            <Select
              onValueChange={(val) => {
                form.setValue("propertyType", val);
                form.trigger("propertyType");
              }}
              defaultValue={initialData.propertyType || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {["Apartment", "Villa", "Plot", "Office", "Retail"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.propertyType && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.propertyType.message}
              </p>
            )}

            {/* BHK (only for Apartment/Villa) */}
            {(form.watch("propertyType") === "Apartment" ||
              form.watch("propertyType") === "Villa") && (
              <>
                <Label>BHK</Label>
                <Select
                  onValueChange={(val) => {
                    form.setValue("bhk", val);
                    form.trigger("bhk");
                  }}
                  defaultValue={initialData.bhk || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "4", "Studio"].map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.bhk && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.bhk.message}
                  </p>
                )}
              </>
            )}

            {/* Purpose */}
            <Label required>Purpose</Label>
            <Select
              onValueChange={(val) => {
                form.setValue("purpose", val);
                form.trigger("purpose");
              }}
              defaultValue={initialData.purpose || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                {["Buy", "Rent"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.purpose && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.purpose.message}
              </p>
            )}

            {/* Budget */}
            <Label>Budget</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Budget Min"
                type="number"
                {...form.register("budgetMin", { valueAsNumber: true })}
              />
              <Input
                placeholder="Budget Max"
                type="number"
                {...form.register("budgetMax", { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.budget && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.budget.message}
              </p>
            )}

            {/* Timeline */}
            <Label required>Timeline</Label>
            <Select
              onValueChange={(val) => {
                form.setValue("timeline", val);
                form.trigger("timeline");
              }}
              defaultValue={initialData.timeline || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {["0-3m", "3-6m", ">6m", "Exploring"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.timeline && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.timeline.message}
              </p>
            )}

            {/* Source */}
            <Label required>Source</Label>
            <Select
              onValueChange={(val) => {
                form.setValue("source", val);
                form.trigger("source");
              }}
              defaultValue={initialData.source || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {["Website", "Referral", "Walk-in", "Call", "Other"].map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.source && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.source.message}
              </p>
            )}

            {/* Status */}
            <Label>Status</Label>
            <Select
              onValueChange={(val) => {
                form.setValue("status", val);
                form.trigger("status");
              }}
              defaultValue={initialData.status || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "New",
                  "Qualified",
                  "Contacted",
                  "Visited",
                  "Negotiation",
                  "Converted",
                  "Dropped",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.status.message}
              </p>
            )}

            {/* Notes */}
            <Label>Notes</Label>
            <Textarea placeholder="Notes" {...form.register("notes")} />

            {/* Tags */}
            <Label>Tags</Label>
            <Input
              placeholder="Tags (comma separated)"
              {...form.register("tags")}
            />

            {/* Submit */}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update Lead"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
