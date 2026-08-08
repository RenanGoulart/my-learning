import * as React from "react";

type FormFieldProps = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactElement<{
    id?: string;
    "aria-describedby"?: string | undefined;
    "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  }>;
};

export function FormField({
  id,
  label,
  description,
  error,
  children,
}: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const control = React.cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": Boolean(error),
  });

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {control}
      {description ? (
        <p className="text-xs text-muted-foreground" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-destructive" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
