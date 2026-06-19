import { afterEach, describe, expect, it, vi } from 'vitest';
import { isValidBarcode, lookupProduct, productDetails } from './openFoodFacts';

function mockFetch(json: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(json) });
}

afterEach(() => vi.unstubAllGlobals());

describe('isValidBarcode', () => {
  it('accepte EAN-8 / UPC / EAN-13 / GTIN-14', () => {
    expect(isValidBarcode('30176204')).toBe(true); // 8
    expect(isValidBarcode('301762042200')).toBe(true); // 12
    expect(isValidBarcode('3017620422003')).toBe(true); // 13
    expect(isValidBarcode('03017620422003')).toBe(true); // 14
  });
  it('rejette les longueurs/caractères invalides', () => {
    expect(isValidBarcode('123')).toBe(false);
    expect(isValidBarcode('abcdefgh')).toBe(false);
    expect(isValidBarcode('123456789012345')).toBe(false); // 15
  });
});

describe('lookupProduct', () => {
  it('mappe un produit en préférant le français', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        status: 1,
        product: {
          product_name_fr: 'Pâte à tartiner',
          product_name: 'Hazelnut spread',
          brands: 'Nutella, Ferrero',
          ingredients_text_fr: 'Sucre, huile de palme, noisettes',
          quantity: '400 g',
        },
      }),
    );
    const p = await lookupProduct('3017620422003');
    expect(p).toMatchObject({
      barcode: '3017620422003',
      name: 'Pâte à tartiner',
      brand: 'Nutella', // 1re marque
      ingredients: 'Sucre, huile de palme, noisettes',
      quantity: '400 g',
    });
  });

  it('renvoie null si le code est inconnu (status 0)', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 0 }));
    expect(await lookupProduct('3017620422003')).toBeNull();
  });

  it('renvoie null si le produit existe mais sans nom', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 1, product: { quantity: '1 L' } }));
    expect(await lookupProduct('3017620422003')).toBeNull();
  });

  it('rejette un code invalide sans appel réseau', async () => {
    const f = mockFetch({});
    vi.stubGlobal('fetch', f);
    await expect(lookupProduct('abc')).rejects.toThrow(/invalide/i);
    expect(f).not.toHaveBeenCalled();
  });
});

describe('productDetails', () => {
  it('compose marque + contenance + ingrédients', () => {
    expect(
      productDetails({ barcode: '1', name: 'X', brand: 'Nutella', quantity: '400 g', ingredients: 'Sucre' }),
    ).toBe('marque : Nutella ; contenance : 400 g ; ingrédients : Sucre');
  });
  it('ignore les champs absents', () => {
    expect(productDetails({ barcode: '1', name: 'X', ingredients: 'Sucre' })).toBe('ingrédients : Sucre');
    expect(productDetails({ barcode: '1', name: 'X' })).toBe('');
  });
});
