"use client";

import { useMemo } from "react";
import { FiboGrid, type ColumnDef } from "fibogrid";
import { useT } from "@/lib/i18n/locale-context";

type DemoRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
};

const DEMO_ROWS: DemoRow[] = [
  {
    id: "1",
    name: "Ana Costa",
    email: "ana@recam.dev",
    role: "Quant",
    status: "active",
  },
  {
    id: "2",
    name: "Jon Park",
    email: "jon@recam.dev",
    role: "Platform",
    status: "active",
  },
  {
    id: "3",
    name: "Marta Silva",
    email: "marta@recam.dev",
    role: "Design Systems",
    status: "inactive",
  },
  {
    id: "4",
    name: "Leo Ng",
    email: "leo@recam.dev",
    role: "Infra",
    status: "active",
  },
];

export function DocsLiveGrid() {
  const t = useT();

  const columns = useMemo<ColumnDef<DemoRow>[]>(
    () => [
      { field: "name", headerName: t.docs.demoName, width: 150, sortable: true },
      { field: "email", headerName: t.docs.demoEmail, width: 190, sortable: true },
      { field: "role", headerName: t.docs.demoRole, width: 140, filterable: true },
      {
        field: "status",
        headerName: t.docs.demoStatus,
        width: 110,
        cellRenderer: ({ value }) => {
          const label =
            value === "active" ? t.docs.demoActive : t.docs.demoInactive;
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 500,
                color: value === "active" ? "#86efac" : "#fca5a5",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: "currentColor",
                }}
              />
              {label}
            </span>
          );
        },
      },
    ],
    [t],
  );

  return (
    <div className="dc-live-grid fibogrid-theme-noir">
      <FiboGrid
        rowData={DEMO_ROWS}
        columnDefs={columns}
        height={248}
        rowSelection="multiple"
        pagination={false}
        showToolbar={false}
        showStatusBar={false}
      />
    </div>
  );
}
