import type { IService } from "../base/IService";
import type { DownloadUrlConfig } from "../../types/config-types";

export interface UrlSelectionCriteria {
  preferredSize?: number;
  preferredProvider?: string;
  excludeProviders?: string[];
  maxSize?: number;
  minSize?: number;
}

export interface UrlSelection {
  selectedUrl: DownloadUrlConfig;
  fallbackUrls: DownloadUrlConfig[];
  selectionReason: string;
}

export interface UrlStats {
  totalUrls: number;
  enabledUrls: number;
  disabledUrls: number;
  providers: string[];
  regions: string[];
  averageSize: number;
  totalSize: number;
}

export interface ISpeedTestConfigService
  extends IService<
    DownloadUrlConfig,
    Omit<DownloadUrlConfig, "id">,
    Partial<Omit<DownloadUrlConfig, "id">>
  > {
  // URL management
  getAllUrls(): DownloadUrlConfig[];
  getEnabledUrls(): DownloadUrlConfig[];
  addCustomUrl(url: Omit<DownloadUrlConfig, "id">): DownloadUrlConfig;
  updateUrl(
    id: string,
    updates: Partial<Omit<DownloadUrlConfig, "id">>
  ): DownloadUrlConfig;
  removeUrl(id: string): void;
  enableUrl(id: string): void;
  disableUrl(id: string): void;

  // URL selection
  selectBestUrl(criteria?: UrlSelectionCriteria): UrlSelection;

  // Statistics
  getUrlStats(): UrlStats;
}
