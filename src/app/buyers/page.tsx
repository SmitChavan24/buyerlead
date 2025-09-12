"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

type Buyer = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  propertyType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  status: string;
  updatedAt: string;
};

const cities = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
const propertyTypes = ["Apartment", "Villa", "Plot", "Office", "Retail"];
const statuses = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
];
const timelines = ["0-3m", "3-6m", ">6m", "Exploring"];

export default function BuyersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || ""
  );
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [timeline, setTimeline] = useState(searchParams.get("timeline") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [total, setTotal] = useState(0);

  // Update URL when filters/search/page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (city) params.set("city", city);
    if (propertyType) params.set("propertyType", propertyType);
    if (status) params.set("status", status);
    if (timeline) params.set("timeline", timeline);
    params.set("page", String(page));

    router.replace(`/buyers?${params.toString()}`);
  }, [search, city, propertyType, status, timeline, page, router]);

  // Fetch buyers from API
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/buyers?${searchParams.toString()}`);
      const data = await res.json();
      setBuyers(data.items);
      setTotal(data.total);
    };
    fetchData();
  }, [searchParams]);

  const totalPages = Math.ceil(total / 10);

  return (
    <Card className="m-6">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Buyer Leads</CardTitle>
        <Link href="/buyers/new">
          <Button>Create New Lead</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Property" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeline} onValueChange={setTimeline}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Timeline" />
            </SelectTrigger>
            <SelectContent>
              {timelines.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyers.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.fullName}</TableCell>
                <TableCell>{b.phone}</TableCell>
                <TableCell>{b.city}</TableCell>
                <TableCell>{b.propertyType}</TableCell>
                <TableCell>
                  {b.budgetMin ? `${b.budgetMin} - ${b.budgetMax || "?"}` : "-"}
                </TableCell>
                <TableCell>{b.timeline}</TableCell>
                <TableCell>{b.status}</TableCell>
                <TableCell>
                  {new Date(b.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link href={`/buyers/${b.id}`}>
                    <Button variant="outline" size="sm">
                      View / Edit
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
