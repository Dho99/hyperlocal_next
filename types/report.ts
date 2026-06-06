export type ReportStatus = "PENDING" | "INVESTIGATING" | "RESOLVED" | "REJECTED";
export type ReportTargetType = "DESTINATION" | "UMKM" | "ACCOMMODATION";

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
  reporter?: {
    name: string;
    email: string;
  } | null;
}
