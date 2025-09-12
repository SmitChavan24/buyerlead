"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BackButton } from "../../../../components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ✅ Zod Schema (client-side validation)
const buyerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10–15 digits"),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  notes: z.string().max(1000).optional(),
  tags: z.string().optional(),
});

// 🔄 Infer Type
type BuyerForm = z.infer<typeof buyerSchema>;

export default function NewBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BuyerForm>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      city: "Chandigarh",
      propertyType: "Apartment",
      purpose: "Buy",
      timeline: "Exploring",
      source: "Website",
    },
  });

  const onSubmit = async (values: BuyerForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/buyers", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create lead");

      router.push("/buyers");
    } catch (err) {
      console.error(err);
      alert("Error creating lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Create New Lead</CardTitle>
          <BackButton />
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <Input placeholder="Full Name" {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.fullName.message}
              </p>
            )}

            {/* Email */}
            <Input placeholder="Email" {...form.register("email")} />

            {/* Phone */}
            <Input placeholder="Phone" {...form.register("phone")} />

            {/* City */}
            <Select
              onValueChange={(val) => form.setValue("city", val)}
              defaultValue={form.getValues("city")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                <SelectItem value="Mohali">Mohali</SelectItem>
                <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                <SelectItem value="Panchkula">Panchkula</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Type */}
            <Select
              onValueChange={(val) => form.setValue("propertyType", val)}
              defaultValue={form.getValues("propertyType")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Plot">Plot</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
              </SelectContent>
            </Select>

            {/* BHK (conditional) */}
            {(form.watch("propertyType") === "Apartment" ||
              form.watch("propertyType") === "Villa") && (
              <Select onValueChange={(val) => form.setValue("bhk", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 BHK</SelectItem>
                  <SelectItem value="2">2 BHK</SelectItem>
                  <SelectItem value="3">3 BHK</SelectItem>
                  <SelectItem value="4">4 BHK</SelectItem>
                  <SelectItem value="Studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Purpose */}
            <Select
              onValueChange={(val) => form.setValue("purpose", val)}
              defaultValue={form.getValues("purpose")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
              </SelectContent>
            </Select>

            {/* Budgets */}
            <div className="flex gap-2">
              <Input
                placeholder="Budget Min"
                type="number"
                {...form.register("budgetMin")}
              />
              <Input
                placeholder="Budget Max"
                type="number"
                {...form.register("budgetMax")}
              />
            </div>

            {/* Timeline */}
            <Select
              onValueChange={(val) => form.setValue("timeline", val)}
              defaultValue={form.getValues("timeline")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-3m">0-3 months</SelectItem>
                <SelectItem value="3-6m">3-6 months</SelectItem>
                <SelectItem value=">6m">&gt; 6 months</SelectItem>
                <SelectItem value="Exploring">Exploring</SelectItem>
              </SelectContent>
            </Select>

            {/* Source */}
            <Select
              onValueChange={(val) => form.setValue("source", val)}
              defaultValue={form.getValues("source")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Notes */}
            <Textarea placeholder="Notes" {...form.register("notes")} />

            {/* Tags */}
            <Input
              placeholder="Tags (comma separated)"
              {...form.register("tags")}
            />

            {/* Submit */}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Lead"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
