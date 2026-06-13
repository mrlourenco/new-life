// Sync/audit metadata shared by all persisted entities. Optional because
// data created before these fields existed has neither; the store hooks
// stamp them on every save (see utils/storage.ts `stamp`).
export interface Timestamped {
  created_at?: string
  updated_at?: string
}
