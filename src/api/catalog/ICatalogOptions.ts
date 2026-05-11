import { ClubGiftInfoParser, ClubOfferData, MarketplaceConfigurationMessageParser } from '@nitrots/nitro-renderer';
import { CatalogPetPalette } from './CatalogPetPalette';

export interface ICatalogOptions
{
    petPalettes?: CatalogPetPalette[];
    clubOffers?: ClubOfferData[];
    clubOffersByWindowId?: Record<number, ClubOfferData[]>;
    clubGifts?: ClubGiftInfoParser;
    marketplaceConfiguration?: MarketplaceConfigurationMessageParser;
}
