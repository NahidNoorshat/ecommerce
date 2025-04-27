// lib/api/banner.js
import axios from "axios";
import { BANNER_API } from "@/utils/config";

export const fetchBanners = async () => {
  const response = await axios.get(
    `${BANNER_API}/banners/?is_active=true&ordering=order`
  );
  return response.data;
};
