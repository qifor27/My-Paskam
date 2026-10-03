import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function PinFields({
  pinLength,
  errors,
  label = "PIN",
}: {
  pinLength: number;
  errors: Record<string, string>;
  label?: string;
}) {
  const pinProps = {
    type: "password",
    inputMode: "numeric",
    pattern: "[0-9]*",
    maxLength: pinLength,
    autoComplete: "new-password",
    className: "tracking-[0.4em]",
  } as const;

  return (
    <>
      <Field id="pin" label={label} error={errors.pin} hint={`${pinLength} digit angka`}>
        {(p) => <Input {...p} {...pinProps} name="pin" />}
      </Field>
      <Field id="pinConfirm" label={`Ulangi ${label}`} error={errors.pinConfirm}>
        {(p) => <Input {...p} {...pinProps} name="pinConfirm" />}
      </Field>
    </>
  );
}
