import { Eye, Mail, MessageCircle, Phone } from "lucide-react";
import { useListingReveal } from "@/hooks/useListingReveal";
import { cn } from "@/lib/utils";

type ContactRevealSectionProps = {
  phone?: string | null;
  email?: string | null;
  kakaoid?: string | null;
};

function ContactDetails({
  phone,
  email,
  kakaoid,
  revealed,
}: {
  phone?: string | null;
  email?: string | null;
  kakaoid?: string | null;
  revealed: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-3 transition-[filter] duration-300 ease-out",
        !revealed && "blur-md select-none pointer-events-none",
      )}
      aria-hidden={!revealed}
    >
      {phone && (
        <div className="flex items-center gap-2.5 text-sm">
          <Phone className="h-4 w-4 text-primary shrink-0" />
          <span className="text-foreground break-words [overflow-wrap:anywhere]">{phone}</span>
        </div>
      )}
      {email && (
        <div className="flex items-center gap-2.5 text-sm">
          <Mail className="h-4 w-4 text-primary shrink-0" />
          {revealed ? (
            <a href={`mailto:${email}`} className="text-primary hover:underline break-words [overflow-wrap:anywhere]">
              {email}
            </a>
          ) : (
            <span className="text-primary break-words [overflow-wrap:anywhere]">{email}</span>
          )}
        </div>
      )}
      {kakaoid && (
        <div className="flex items-center gap-2.5 text-sm">
          <MessageCircle className="h-4 w-4 text-yellow-500 shrink-0" />
          <span className="text-foreground break-words [overflow-wrap:anywhere]">카카오톡: {kakaoid}</span>
        </div>
      )}
    </div>
  );
}

function RevealOverlay() {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-lg",
        "bg-card/60 backdrop-blur-[2px]",
        "transition-opacity duration-300 ease-out opacity-100",
      )}
    >
      <div className="flex flex-col items-center gap-2.5 px-6 py-4 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Eye className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-foreground">연락처 확인하기</span>
      </div>
    </div>
  );
}

export function ContactRevealSection({ phone, email, kakaoid }: ContactRevealSectionProps) {
  const { revealed, interactiveProps } = useListingReveal();

  const hasContact = !!(phone || email || kakaoid);
  if (!hasContact) return null;

  return (
    <div
      {...interactiveProps}
      className={cn(
        "bg-card border border-border rounded-xl p-6 mb-6",
        interactiveProps.className,
      )}
    >
      <h2 className="text-lg font-bold text-foreground mb-4">연락처</h2>
      <div className={cn("relative rounded-lg", !revealed && "min-h-[7.5rem] py-2")}>
        <ContactDetails phone={phone} email={email} kakaoid={kakaoid} revealed={revealed} />
        {!revealed && <RevealOverlay />}
      </div>
    </div>
  );
}
