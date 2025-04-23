"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PriceFormatter from "@/components/PriceFormatter";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ORDERS_API, SHIPPIN_API } from "@/utils/config";
import { checkout, fetchCart } from "@/lib/feature/card/cartSlice";
import { secureFetch } from "@/lib/api/secureFetch";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, status } = useSelector((state) => state.cart);
  const stripe = useStripe();
  const elements = useElements();

  const subtotal = items.reduce((total, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return total + price * item.quantity;
  }, 0);

  const [preview, setPreview] = useState({
    subtotal: subtotal,
    shipping_cost: 0,
    discount_amount: 0,
    total_price: subtotal,
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [shipping, setShipping] = useState({
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
    shipping_method_id: null,
  });
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await secureFetch(`${SHIPPIN_API}/methods/`);
        const data = await res.json();
        setShippingMethods(data);
        if (data.length > 0 && !shipping.shipping_method_id) {
          setShipping((prev) => ({
            ...prev,
            shipping_method_id: data[0].id,
          }));
        }
      } catch (err) {
        console.error("Error fetching shipping methods:", err);
        toast.error("Failed to load shipping methods.");
      }
    };
    fetchShippingMethods();
  }, []);

  useEffect(() => {
    setPreview((prev) => ({
      ...prev,
      subtotal: subtotal,
    }));
  }, [subtotal]);

  useEffect(() => {
    if (shipping.shipping_method_id) {
      handleApplyCoupon();
    }
  }, [shipping.shipping_method_id]);

  const handleApplyCoupon = async () => {
    setLoading(true);

    const queryParams = new URLSearchParams({
      paymentMethod,
      coupon: couponCode.trim(),
      shipping_method_id: shipping.shipping_method_id,
    });

    const url = `${ORDERS_API}/preview/?${queryParams.toString()}`;

    try {
      const res = await secureFetch(url); // ✅ secured API request
      const data = await res.json();

      const selectedMethod = shippingMethods.find(
        (method) => method.id === shipping.shipping_method_id
      );
      const fallbackShippingCost = selectedMethod
        ? parseFloat(selectedMethod.price)
        : 0;

      setPreview({
        ...data,
        shipping_cost:
          data.shipping_cost !== undefined
            ? data.shipping_cost
            : fallbackShippingCost,
      });

      toast.success(
        couponCode ? `Coupon "${couponCode}" applied!` : "Preview updated."
      );
    } catch (err) {
      const selectedMethod = shippingMethods.find(
        (method) => method.id === shipping.shipping_method_id
      );
      const shippingCost = selectedMethod
        ? parseFloat(selectedMethod.price)
        : 0;

      setPreview({
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: 0,
        total_price: subtotal + shippingCost,
      });

      toast.error("Failed to apply coupon or fetch preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        paymentMethod,
        coupon: couponCode.trim(),
        shipping: {
          address_line_1: shipping.address_line_1,
          address_line_2: shipping.address_line_2,
          city: shipping.city,
          state: shipping.state,
          postal_code: shipping.postal_code,
          country: shipping.country,
          phone: shipping.phone,
          shipping_method_id: shipping.shipping_method_id,
        },
      };

      console.log("Final checkout payload =>", payload);

      const resultAction = await dispatch(checkout(payload)).unwrap();
      const { order_id, client_secret } = resultAction;

      if (paymentMethod === "card") {
        if (!stripe || !elements) throw new Error("Stripe not loaded.");
        const result = await stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (result.error) {
          setError(result.error.message);
          toast.error(result.error.message);
        } else if (result.paymentIntent.status === "succeeded") {
          toast.success(`Order #${order_id} placed successfully!`);
          router.push(`/orders/${order_id}`);
        }
      } else {
        toast.success(`Order #${order_id} placed successfully!`);
        router.push(`/orders/${order_id}`);
      }

      await dispatch(fetchCart()).unwrap();
    } catch (err) {
      setError(err.message || "Checkout failed.");
      toast.error(err.message || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border p-4 rounded-md"
          >
            <div>
              <h3 className="font-semibold">{item.product.name}</h3>
              <p>Quantity: {item.quantity}</p>
            </div>
            <PriceFormatter
              amount={
                (item.variant ? item.variant.price : item.product.price) *
                item.quantity
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <div className="grid gap-4">
          <input
            type="text"
            value={shipping.address_line_1}
            onChange={(e) =>
              setShipping({ ...shipping, address_line_1: e.target.value })
            }
            placeholder="Address Line 1"
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            value={shipping.address_line_2}
            onChange={(e) =>
              setShipping({ ...shipping, address_line_2: e.target.value })
            }
            placeholder="Address Line 2 (optional)"
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            value={shipping.city}
            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
            placeholder="City"
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            value={shipping.state}
            onChange={(e) =>
              setShipping({ ...shipping, state: e.target.value })
            }
            placeholder="State"
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            value={shipping.postal_code}
            onChange={(e) =>
              setShipping({ ...shipping, postal_code: e.target.value })
            }
            placeholder="Postal Code"
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            value={shipping.country}
            onChange={(e) =>
              setShipping({ ...shipping, country: e.target.value })
            }
            placeholder="Country"
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            value={shipping.phone}
            onChange={(e) =>
              setShipping({ ...shipping, phone: e.target.value })
            }
            placeholder="Phone Number"
            className="p-2 border rounded-md"
            required
          />
          <select
            value={shipping.shipping_method_id || ""}
            onChange={(e) => {
              const newId = parseInt(e.target.value) || null;
              console.log("Shipping method changed to:", newId);
              setShipping({
                ...shipping,
                shipping_method_id: newId,
              });
            }}
            className="p-2 border rounded-md"
            required
          >
            <option value="">Select Shipping Method</option>
            {shippingMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {`${method.name} - $${parseFloat(method.price).toFixed(2)}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Coupon Code</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code (e.g., abcd123)"
            className="w-full p-2 border rounded-md"
          />
          <Button onClick={handleApplyCoupon} disabled={loading}>
            {loading ? "Applying..." : "Apply"}
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="cod">Cash on Delivery</option>
          <option value="card">Credit/Debit Card (Stripe)</option>
          <option value="paypal">PayPal</option>
          <option value="crypto">Cryptocurrency</option>
        </select>
      </div>

      {paymentMethod === "card" && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Card Details</h2>
          <CardElement className="p-2 border rounded-md" />
        </div>
      )}

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <PriceFormatter amount={preview.subtotal} />
        </div>
        <div className="flex justify-between mt-2">
          <span>Shipping:</span>
          <PriceFormatter amount={preview.shipping_cost} />
        </div>
        <div className="flex justify-between mt-2">
          <span>Discount:</span>
          <PriceFormatter amount={preview.discount_amount} />
        </div>
        <div className="flex justify-between mt-2 font-bold">
          <span>Total:</span>
          <PriceFormatter amount={preview.total_price} className="text-xl" />
        </div>
      </div>

      {error && <div className="mt-4 text-red-500">{error}</div>}

      <div className="mt-6 flex justify-end space-x-4">
        <Button
          type="button"
          onClick={() => router.push("/cart")}
          variant="outline"
        >
          Back to Cart
        </Button>
        <Button
          type="submit"
          disabled={loading || (!stripe && paymentMethod === "card")}
        >
          {loading ? "Processing..." : "Place Order"}
        </Button>
      </div>
    </form>
  );
};

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutPage;
