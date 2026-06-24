export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "select"
  | "checkbox";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select
}

export interface FormTheme {
  accent?: string;
  background?: string;
}

export const FIELD_LABELS: Record<FieldType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  select: "Dropdown",
  checkbox: "Checkbox",
};

export function newField(type: FieldType): FormField {
  return {
    id: crypto.randomUUID(),
    type,
    label: FIELD_LABELS[type],
    required: false,
    ...(type === "select" ? { options: ["Option 1", "Option 2"] } : {}),
  };
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "form"
  );
}
