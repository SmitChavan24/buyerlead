"use client";

import React, { use, useEffect, useState } from "react";
import axios from "axios";
import BuyerForm from "../../../../components/BuyerForm";

export default function BuyerPage({ params }: { params: { id: string } }) {
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = React.use(params);

  useEffect(() => {
    const getBuyer = async () => {
      try {
        const res = await axios.get(`/api/buyers/${id}`);
        setBuyer(res.data);
      } catch (error) {
        console.error("Failed to fetch buyer:", error);
      } finally {
        setLoading(false);
      }
    };

    getBuyer();
  }, [params]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!buyer) return <div className="p-4">Buyer not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Buyer</h1>
      <BuyerForm initialData={buyer[0]} />
    </div>
  );
}
