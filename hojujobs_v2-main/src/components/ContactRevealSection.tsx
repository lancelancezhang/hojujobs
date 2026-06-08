import { useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, Mail, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trackContactRevealClick, type ListingType } from "@/lib/analytics";
import { getSiteOrigin } from "@/lib/siteUrl";
import { cn } from "@/lib/utils";

type ContactRevealSectionProps = {
  listingType: ListingType;
  listingId: string | number;
  phone?: string | null;
  email?: string | null;
  kakaoid?: string | null;
};

function contactRevealSessionKey(listingType: ListingType, listingId: string | number) {
  return `hoju_contact_revealed_${listingType}_${listingId}`;
}

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

export function ContactRevealSection({
  listingType,
  listingId,
  phone,
  email,
  kakaoid,
}: ContactRevealSectionProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionKey = contactRevealSessionKey(listingType, listingId);

  const [revealed, setRevealed] = useState(() => sessionStorage.getItem(sessionKey) === "1");

  const hasContact = !!(phone || email || kakaoid);
  if (!hasContact) return null;

  const handleReveal = () => {
    if (revealed || loading) return;

    if (!user) {
      trackContactRevealClick({
        logged_in: false,
        listing_type: listingType,
        listing_id: listingId,
      });
      const returnPath = location.pathname + location.search;
      const authPath = `/auth?next=${encodeURIComponent(returnPath)}`;
      if (window.location.origin === getSiteOrigin()) {
        navigate(authPath);
      } else {
        window.location.href = `${getSiteOrigin()}${authPath}`;
      }
      return;
    }

    trackContactRevealClick({
      logged_in: true,
      listing_type: listingType,
      listing_id: listingId,
      revealed: true,
    });
    sessionStorage.setItem(sessionKey, "1");
    setRevealed(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (revealed) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleReveal();
    }
  };

  return (
    <div
      role={revealed ? undefined : "button"}
      tabIndex={revealed ? undefined : 0}
      onClick={revealed ? undefined : handleReveal}
      onKeyDown={handleKeyDown}
      aria-label={revealed ? undefined : "클릭하여 연락처 확인하기"}
      className={cn(
        "bg-card border border-border rounded-xl p-6 mb-6",
        !revealed && [
          "cursor-pointer",
          "transition-all duration-300 ease-out",
          "hover:border-primary/50 hover:shadow-md hover:bg-muted/20",
          "active:scale-[0.995]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        ],
      )}
    >
      <h2 className="text-lg font-bold text-foreground mb-4">연락처</h2>
      <div className="relative rounded-lg min-h-[7.5rem] py-2">
        <ContactDetails phone={phone} email={email} kakaoid={kakaoid} revealed={revealed} />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-lg",
            "bg-card/60 backdrop-blur-[2px]",
            "transition-opacity duration-300 ease-out",
            revealed ? "pointer-events-none opacity-0" : "opacity-100",
          )}
          aria-hidden={revealed}
        >
          <div className="flex flex-col items-center gap-2.5 px-6 py-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Eye className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-foreground">클릭하여 연락처 확인하기</span>
            <span className="text-xs text-muted-foreground">로그인 후 연락처를 확인할 수 있습니다</span>
          </div>
        </div>
      </div>
    </div>
  );
}
