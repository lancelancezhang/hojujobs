import { useEffect, useRef } from "react";
import { Eye, Mail, MessageCircle, Phone } from "lucide-react";
import { useListingReveal } from "@/hooks/useListingReveal";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/trackEvent";
import type { ListingType } from "@/lib/analytics";

type ContactRevealSectionProps = {
  phone?: string | null;
  email?: string | null;
  kakaoid?: string | null;
};

function trackContactType(
  listingType: ListingType,
  listingId: string | number,
  eventName: "contact_number_clicked" | "email_clicked" | "kakao_clicked",
  contactType: string,
) {
  trackEvent(eventName, {
    listing_type: listingType === "flatmate" ? "rental" : "job",
    listing_id: listingId,
    metadata: { contact_type: contactType },
  });
}

function ContactDetails({
  phone,
  email,
  kakaoid,
  revealed,
  listingType,
  listingId,
}: {
  phone?: string | null;
  email?: string | null;
  kakaoid?: string | null;
  revealed: boolean;
  listingType: ListingType;
  listingId: string | number;
}) {
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!revealed) return;

    let selectionTimer: ReturnType<typeof setTimeout> | null = null;

    function handleSelectionEnd() {
      if (selectionTimer) clearTimeout(selectionTimer);
      selectionTimer = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.toString().trim().length < 3) return;

        const range = selection.getRangeAt(0);
        const container = contactRef.current;
        if (!container || !container.contains(range.commonAncestorContainer)) return;

        const anchor = selection.anchorNode?.parentElement;
        const field = anchor?.closest("[data-contact-field]")?.getAttribute("data-contact-field");

        let selectedContactType: string;
        if (field === "phone") selectedContactType = "phone";
        else if (field === "email") selectedContactType = "email";
        else if (field === "kakao") selectedContactType = "kakao_id";
        else selectedContactType = "unknown_contact";

        trackEvent("text_selected_contact", {
          listing_type: listingType === "flatmate" ? "rental" : "job",
          listing_id: listingId,
          metadata: {
            selected_contact_type: selectedContactType,
            page_section: "contact_details",
            selection_length: selection.toString().length,
          },
        });
      }, 400);
    }

    document.addEventListener("mouseup", handleSelectionEnd);
    document.addEventListener("touchend", handleSelectionEnd);

    return () => {
      document.removeEventListener("mouseup", handleSelectionEnd);
      document.removeEventListener("touchend", handleSelectionEnd);
      if (selectionTimer) clearTimeout(selectionTimer);
    };
  }, [revealed, listingType, listingId]);

  return (
    <div
      ref={contactRef}
      className={cn(
        "space-y-3 transition-[filter] duration-300 ease-out",
        !revealed && "blur-md select-none pointer-events-none",
      )}
      aria-hidden={!revealed}
    >
      {phone && (
        <div
          className="flex items-center gap-2.5 text-sm cursor-pointer select-text"
          data-contact-field="phone"
          onClick={revealed ? () => trackContactType(listingType, listingId, "contact_number_clicked", "phone") : undefined}
        >
          <Phone className="h-4 w-4 text-primary shrink-0" />
          <span className="text-foreground break-words [overflow-wrap:anywhere]">{phone}</span>
        </div>
      )}
      {email && (
        <div className="flex items-center gap-2.5 text-sm" data-contact-field="email">
          <Mail className="h-4 w-4 text-primary shrink-0" />
          {revealed ? (
            <a
              href={`mailto:${email}`}
              className="text-primary hover:underline break-words [overflow-wrap:anywhere]"
              onClick={() => trackContactType(listingType, listingId, "email_clicked", "email")}
            >
              {email}
            </a>
          ) : (
            <span className="text-primary break-words [overflow-wrap:anywhere]">{email}</span>
          )}
        </div>
      )}
      {kakaoid && (
        <div
          className="flex items-center gap-2.5 text-sm cursor-pointer select-text"
          data-contact-field="kakao"
          onClick={revealed ? () => trackContactType(listingType, listingId, "kakao_clicked", "kakao_id") : undefined}
        >
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
  const { revealed, interactiveProps, listingType, listingId } = useListingReveal();

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
        <ContactDetails
          phone={phone}
          email={email}
          kakaoid={kakaoid}
          revealed={revealed}
          listingType={listingType}
          listingId={listingId}
        />
        {!revealed && <RevealOverlay />}
      </div>
    </div>
  );
}
