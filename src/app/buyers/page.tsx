"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Separator } from "@/components/ui/separator";
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
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string;
  purpose: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  source: string;
  notes: string;
  tags: any;
  ownerId: any;
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
      try {
        const res = await axios.get(`/api/buyers?${searchParams.toString()}`);
        setBuyers(res.data.items);
        setTotal(res.data.total);
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.error || "Failed to fetch buyers");
      }
    };

    fetchData();
  }, [searchParams]);

  const totalPages = Math.ceil(total / 10);

  const handleExportCSV = () => {
    const headers = [
      "id",
      "Full Name",
      "Email",
      "Phone",
      "City",
      "Property Type",
      "BHK",
      "Purpose",
      "Budget Min",
      "Budget Max",
      "Timeline",
      "Source",
      "Status",
      "Notes",
      "Tags",
      "Updated At",
    ];

    const rows = buyers.map((b) => [
      b.id,
      b.fullName,
      b.email,
      b.phone,
      b.city,
      b.propertyType,
      b.bhk,
      b.purpose,
      b.budgetMin ?? "",
      b.budgetMax ?? "",
      b.timeline,
      b.source,
      b.status,
      b.notes,
      b.tags,
      b.ownerId,
      new Date(b.updatedAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "buyers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const handleExportCSV = () => {
  //   console.log(new Date());
  // };

  // ✅ Import CSV
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").slice(1); // skip header

      const importedBuyers = rows
        .map((row) => {
          const cols = row.split(",");
          if (cols.length < 9) return null;
          return {
            fullName: cols[1],
            email: cols[2],
            phone: cols[3],
            city: cols[4],
            propertyType: cols[5],
            bhk: cols[6],
            purpose: cols[7],
            budgetMin: cols[8] ? Number(cols[8]) : null,
            budgetMax: cols[9] ? Number(cols[9]) : null,
            timeline: cols[10],
            source: cols[11],
            status: cols[12],
            updatedAt: new Date(),
          };
        })
        .filter(Boolean);

      try {
        await axios.post("/api/buyers/import", { buyers: importedBuyers });
        alert("CSV Imported Successfully");
        router.refresh();
      } catch (err: any) {
        console.error(err);
        // alert(err.response?.data?.error || "CSV import failed");
      }
    };

    reader.readAsText(file);
  };

  return (
    <Card className="m-3">
      <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <CardTitle>Buyer Leads</CardTitle>

        {/* ✅ Responsive button container */}
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <label className="cursor-pointer">
              Import CSV
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleImportCSV}
              />
            </label>
          </Button>

          <Button onClick={handleExportCSV}>Export CSV</Button>

          <Link href="/buyers/new">
            <Button>Create</Button> {/* ✅ shorter text helps on mobile */}
          </Link>

          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logout
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full sm:w-40">
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
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setCity("");
              setPropertyType("");
              setStatus("");
              setTimeline("");
            }}
          >
            Clear
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Table container with horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
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
                  <TableCell>{b.city}</TableCell>
                  <TableCell>{b.propertyType}</TableCell>
                  <TableCell>
                    {b.budgetMin
                      ? `${b.budgetMin} - ${b.budgetMax || "?"}`
                      : "-"}
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
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
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
