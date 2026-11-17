export type ReportStatus = "PENDING" | "INVESTIGATING" | "RESOLVED" | "REJECTED";
export type ReportTargetType = "DESTINATION" | "UMKM" | "ACCOMMODATION";

export interface ReportTarget {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  /** Destination name for UMKM/accommodation targets. */
  parentName: string | null;
}

export interface Report {
  id: string;
  reporterId: string | null;
  targetId: string;
  targetType: ReportTargetType;
  reason: string;
  description: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  /** Resolved target; null when the reported data no longer exists. */
  target?: ReportTarget | null;
  reporter?: {
    name: string;
    email: string;
  } | null;
}
