import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { PRODUCTS_API, ORDERS_API } from "@/utils/config";

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, variantId, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" };
      const payload = {
        product_id: productId,
        variant_id: variantId,
        quantity,
      };
      const response = await axios.post(`${PRODUCTS_API}/cart/`, payload, {
        headers,
      });
      console.log(
        "addToCart full response:",
        JSON.stringify(response.data, null, 2)
      );
      return response.data;
    } catch (error) {
      console.log(
        "addToCart error:",
        error.response?.status,
        error.response?.data
      );
      const status = error.response?.status || "N/A";
      const errorData = error.response?.data || {
        detail: "Unknown error occurred",
      };
      return rejectWithValue({
        status,
        message: errorData.detail || "Failed to add item to cart",
      });
    }
  }
);

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      const headers = { Authorization: `Bearer ${token}` };
      const url = `${PRODUCTS_API}/cart/`;
      const response = await axios.get(url, { headers });
      console.log("Raw response:", response.status, response.data);
      return response.data;
    } catch (error) {
      console.log(
        "Fetch error:",
        error.response?.status,
        error.response?.data,
        error.message
      );
      return rejectWithValue({
        status: error.response?.status || 500,
        message:
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch cart",
      });
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" };
      const payload = { quantity };
      console.log("PATCH request to update cart item:", {
        url: `${PRODUCTS_API}/cart/${cartItemId}/`,
        payload,
        headers: { Authorization: token ? "Bearer [redacted]" : "No token" },
      });
      const response = await axios.patch(
        `${PRODUCTS_API}/cart/${cartItemId}/`,
        payload,
        { headers }
      );
      console.log("PATCH response:", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const errorDetails = {
        status: error.response?.status || "N/A",
        data: error.response?.data || "No response data",
        message: error.message || "Unknown error",
        headers: error.response?.headers || "No headers",
      };
      console.error("PATCH error details:", errorDetails);
      return rejectWithValue(
        errorDetails.data || { message: "Failed to update cart item" }
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (cartItemId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${PRODUCTS_API}/cart/${cartItemId}/`, { headers });
      return cartItemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to remove from cart"
      );
    }
  }
);

export const checkout = createAsyncThunk(
  "cart/checkout",
  async (
    { paymentMethod = "cod", coupon = "", shipping },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("No access token found");

      const payload = {
        payment_method: paymentMethod,
        coupon,
        shipping, // ✅ include the shipping object here
      };

      console.log("Checkout payload:", payload);

      const response = await axios.post(`${ORDERS_API}/checkout/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        ...response.data,
        paymentMethod,
      };
    } catch (error) {
      const errorDetails = {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      };
      console.error("Checkout error:", errorDetails);
      return rejectWithValue({
        status: error.response?.status || "N/A",
        message:
          error.response?.data?.detail || error.message || "Checkout failed",
        paymentMethod,
      });
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    lastAction: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.lastAction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.lastAction = action.meta.arg;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const newItem = action.payload;
        console.log("Adding to state.items:", JSON.stringify(newItem));
        console.log(
          "Current state.items before update:",
          JSON.stringify(state.items)
        );
        const existingIndex = state.items.findIndex(
          (item) =>
            item.product.id === newItem.product.id &&
            (item.variant?.id === newItem.variant?.id ||
              (!item.variant && !newItem.variant))
        );
        if (existingIndex !== -1) {
          state.items = [
            ...state.items.slice(0, existingIndex),
            { ...state.items[existingIndex], quantity: newItem.quantity },
            ...state.items.slice(existingIndex + 1),
          ];
          console.log("Updated existing item at index:", existingIndex);
        } else {
          state.items = [...state.items, newItem];
          console.log("Pushed new item to state.items");
        }
        console.log("Updated state.items:", JSON.stringify(state.items));
        state.status = "succeeded";
        state.error = null;
        state.lastAction = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.lastAction = null;
      })
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        const serverItems = action.payload;
        const mergedItems = [...state.items];
        serverItems.forEach((serverItem) => {
          const existingIndex = mergedItems.findIndex(
            (item) => item.id === serverItem.id
          );
          if (existingIndex !== -1) {
            mergedItems[existingIndex] = serverItem;
          } else {
            mergedItems.push(serverItem);
          }
        });
        state.items = mergedItems;
        state.error = null;
        console.log(
          "Merged state.items after fetch:",
          JSON.stringify(state.items)
        );
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateCartItem.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        const { cartItemId, quantity } = action.meta.arg;
        const currentItem = state.items.find((i) => i.id === cartItemId);
        state.lastAction = {
          type:
            quantity > (currentItem?.quantity || 0) ? "increase" : "decrease",
          cartItemId,
        };
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) state.items[index] = action.payload;
        state.status = "succeeded";
        state.error = null;
        state.lastAction = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.lastAction = null;
      })
      .addCase(removeFromCart.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.lastAction = { type: "remove", cartItemId: action.meta.arg };
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.status = "succeeded";
        state.error = null;
        state.lastAction = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.lastAction = null;
      })
      .addCase(checkout.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = []; // Clear cart
        state.error = null;
        state.lastAction = {
          type: "checkout",
          orderId: action.payload.order_id,
        };
      })
      .addCase(checkout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.lastAction = {
          type: "checkout_failed",
          paymentMethod: action.payload.paymentMethod,
        };
      });
  },
});

export const { resetCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;
