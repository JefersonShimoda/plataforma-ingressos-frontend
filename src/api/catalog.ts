import { api } from './client';
import { CatalogItem } from '../types';

export const catalogApi = {
  getCatalog: async (query?: string, type?: string): Promise<CatalogItem[]> => {
    const response = await api.get<CatalogItem[]>('/catalog', {
      params: { query, type },
    });
    return response.data;
  },
};
