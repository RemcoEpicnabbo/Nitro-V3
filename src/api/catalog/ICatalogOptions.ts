import { ClubGiftInfoParser, ClubOfferData, HabboGroupEntryData, MarketplaceConfigurationMessageParser } from '@nitrots/nitro-renderer';
import { CatalogPetPalette } from './CatalogPetPalette';

export interface ICatalogOptions
{
    groups?: HabboGroupEntryData[];
    petPalettes?: CatalogPetPalette[];
    clubOffers?: ClubOfferData[];
    clubOffersByWindowId?: Record<number, ClubOfferData[]>;
    clubGifts?: ClubGiftInfoParser;
    marketplaceConfiguration?: MarketplaceConfigurationMessageParser;
}
