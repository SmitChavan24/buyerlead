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
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ✅ Zod Schema
const buyerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .regex(/^[A-Za-z\s]+$/, "Full name must only contain letters and spaces"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
    propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
    bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
    purpose: z.enum(["Buy", "Rent"]),
    budgetMin: z
      .union([
        z.literal(""), // allow empty string
        z.coerce.number().int().positive("Budget Min must be greater than 0"),
      ])
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    budgetMax: z
      .union([
        z.literal(""),
        z.coerce.number().int().positive("Budget Max must be greater than 0"),
      ])
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),

    source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
    notes: z.string().max(1000).optional(),
    tags: z
      .union([
        z.string().transform((val) =>
          val
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        ),
        z.array(z.string()),
      ])
      .optional(),
  })
  // Rule 1 & 2 together, attach error to "budget"
  .refine(
    (data) => {
      // Case 1: both empty → valid
      if (!data.budgetMin && !data.budgetMax) return true;

      // Case 2: one empty → invalid
      if (
        (data.budgetMin && !data.budgetMax) ||
        (!data.budgetMin && data.budgetMax)
      ) {
        return false;
      }

      // Case 3: both filled but invalid range → invalid
      if (
        data.budgetMin &&
        data.budgetMax &&
        data.budgetMax <= data.budgetMin
      ) {
        return false;
      }

      // Case 4: all good
      return true;
    },
    {
      message:
        "Please enter both Budget Min and Budget Max, and ensure Max > Min.",
      path: ["budget"], // ✅ virtual field, error shows under both
    }
  )
  .refine(
    (data) => {
      if (["Apartment", "Villa"].includes(data.propertyType)) {
        return !!data.bhk;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment or Villa.",
      path: ["bhk"],
    }
  );
// 🔄 Infer Type
type BuyerForm = z.infer<typeof buyerSchema>;

// ✅ Label Component with required asterisk
const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="block font-medium mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

export default function NewBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BuyerForm>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {},
  });

  const onSubmit = async (values: BuyerForm) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/buyers", values);
      if (res.status !== 200) throw new Error("Failed to create lead");
      router.push("/buyers");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Error creating lead");
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
              defaultValue={""}
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
              defaultValue={""}
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

            {/* BHK (conditional) */}
            {(form.watch("propertyType") === "Apartment" ||
              form.watch("propertyType") === "Villa") && (
              <>
                <Label>BHK</Label>
                <Select
                  onValueChange={(val) => {
                    form.setValue("bhk", val);
                    form.trigger("bhk");
                  }}
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
              defaultValue={""}
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

            {/* Budget Min & Max */}
            <Label>Budget</Label>
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

            {/* ✅ Show single combined error under budget */}
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
              defaultValue={""}
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
              defaultValue={""}
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

            {/* Notes */}
            <Label>Notes</Label>
            <Textarea placeholder="Notes" {...form.register("notes")} />
            {form.formState.errors.notes && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.notes.message}
              </p>
            )}

            {/* Tags */}
            <Label>Tags</Label>
            <Input
              placeholder="Tags (comma separated)"
              {...form.register("tags")}
            />
            {form.formState.errors.tags && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.tags.message}
              </p>
            )}

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
