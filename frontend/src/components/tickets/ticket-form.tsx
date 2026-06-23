"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicket } from "@/lib/tickets";
import { useToast } from "@/context/toast-context";
import { ticketFormSchema, type TicketFormValues } from "@/lib/validation";
import {
  TICKET_PRIORITIES,
  PRIORITY_LABELS,
  type Ticket,
} from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900";

/** Inline field-error text. */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

/**
 * Create-ticket form, now powered by React Hook Form + Zod.
 * RHF tracks values/errors/submission for us; zodResolver runs our schema and
 * maps any failures to per-field error messages automatically.
 */
export function TicketForm({ onCreated }: { onCreated: (ticket: Ticket) => void }) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { priority: "MEDIUM" },
  });

  async function onSubmit(values: TicketFormValues) {
    try {
      const { ticket } = await createTicket({
        title: values.title,
        description: values.description,
        priority: values.priority,
        category: values.category?.trim() || undefined,
      });
      toast("Ticket created");
      onCreated(ticket);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not create ticket",
        "error"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <input
          {...register("title")}
          className={inputClass}
          placeholder="Short summary of the issue"
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className={inputClass}
          placeholder="Describe what's happening…"
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select {...register("priority")} className={inputClass}>
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Category <span className="text-slate-400">(optional)</span>
          </label>
          <input {...register("category")} className={inputClass} placeholder="e.g. Billing" />
          <FieldError message={errors.category?.message} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {isSubmitting ? "Creating…" : "Create ticket"}
      </button>
    </form>
  );
}
