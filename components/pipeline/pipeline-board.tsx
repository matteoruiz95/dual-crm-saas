"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/app/actions/leads";
import { LEAD_STATUS } from "@/lib/constants";
import { currency } from "@/lib/utils";
import type { LeadListItem, LeadStatus } from "@/types/crm";

type Props = {
  leads: LeadListItem[];
};

export function PipelineBoard({ leads }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid min-h-[70vh] gap-4 overflow-x-auto xl:grid-cols-7">
      {LEAD_STATUS.map((status) => {
        const items = leads.filter((lead) => lead.status === status.value);
        const totalCop = items.reduce((sum, lead) => sum + Number(lead.estimated_value_cop ?? 0), 0);
        return (
          <section key={status.value} className="min-w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-950">{status.label}</h3>
              <p className="text-xs text-slate-500">{items.length} leads · {currency(totalCop, "COP")}</p>
            </div>
            <div className="space-y-3">
              {items.map((lead) => (
                <article key={lead.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-950">{lead.name}</div>
                  <div className="text-sm text-slate-500">{lead.company || "Sin empresa"}</div>
                  <div className="mt-3 text-sm font-medium text-slate-700">{currency(Number(lead.estimated_value_cop ?? 0), "COP")}</div>
                  <select
                    className="mt-3 h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs"
                    value={lead.status}
                    disabled={isPending}
                    onChange={(event) => {
                      const next = event.target.value as LeadStatus;
                      startTransition(async () => updateLeadStatus(lead.id, next));
                    }}
                  >
                    {LEAD_STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
