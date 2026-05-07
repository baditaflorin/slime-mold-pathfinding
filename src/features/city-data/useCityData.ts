import { useQuery } from "@tanstack/react-query";

import { fetchCity, fetchCityIndex, fetchCityMeta } from "./api";
import type { CityIndexEntry } from "./schema";

export function useCityIndex() {
  return useQuery({
    queryKey: ["city-index", "v1"],
    queryFn: fetchCityIndex,
    staleTime: 1000 * 60 * 60,
  });
}

export function useCity(entry: CityIndexEntry | undefined) {
  return useQuery({
    queryKey: ["city", "v1", entry?.slug],
    queryFn: () => {
      if (!entry) {
        throw new Error("City entry is required");
      }
      return fetchCity(entry);
    },
    enabled: Boolean(entry),
    staleTime: 1000 * 60 * 60,
  });
}

export function useCityMeta(entry: CityIndexEntry | undefined) {
  return useQuery({
    queryKey: ["city-meta", "v1", entry?.slug],
    queryFn: () => {
      if (!entry) {
        throw new Error("City entry is required");
      }
      return fetchCityMeta(entry);
    },
    enabled: Boolean(entry),
    staleTime: 1000 * 60 * 60,
  });
}
