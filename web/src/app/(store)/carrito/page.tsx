import type { Metadata } from "next";
import { CheckoutView } from "@/components/store/CheckoutView";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return <CheckoutView />;
}
